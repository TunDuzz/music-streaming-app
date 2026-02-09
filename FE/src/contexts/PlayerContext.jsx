import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { songsApi } from '../lib/api';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  // we can't initialize state based on user directly in useState if user comes from async context
  // So we use standard defaults and load via Effect when user is available.

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [likedSongIds, setLikedSongIds] = useState(new Set());
  const audioRef = useRef(new Audio());

  // Track if we have loaded state for the current user to avoid overwriting with empty defaults
  const [isStateLoaded, setIsStateLoaded] = useState(false);

  // Helper to get user ID for localStorage keys
  const getUserId = () => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser).id : 'guest';
  };

  // Load state when user changes
  useEffect(() => {
    const userId = getUserId();

    const loadState = () => {
      const savedVolume = localStorage.getItem(`playerVolume_${userId}`);
      if (savedVolume !== null) setVolume(parseFloat(savedVolume));
      else setVolume(1); // Default if not found

      const savedSong = localStorage.getItem(`currentSong_${userId}`);
      if (savedSong) {
        const song = JSON.parse(savedSong);
        setCurrentSong(song);
        // Don't auto-play on restore, but set src
        if (song.audioFileUrl || song.songUrl || song.fileUrl) {
          audioRef.current.src = song.audioFileUrl || song.songUrl || song.fileUrl;
        }
      } else {
        setCurrentSong(null);
        audioRef.current.src = ""; // Clear source if no song
      }

      const savedQueue = localStorage.getItem(`playerQueue_${userId}`);
      if (savedQueue) setQueue(JSON.parse(savedQueue));
      else setQueue([]);

      setIsStateLoaded(true);
    };

    loadState();
    // To trigger re-load on login/logout, we need a trigger.
    // This dependency array is a placeholder. In a real app, you'd likely
    // use a user object from an AuthContext or listen to storage events.
    // For now, we'll use a simple indicator that might change on login/logout.
    // A more robust solution would involve a custom hook for localStorage or AuthContext.
  }, [localStorage.getItem('token')]); // This won't trigger re-render on its own if token changes without a component re-mount.

  // Save state to localStorage whenever it changes, but only after initial load
  useEffect(() => {
    if (!isStateLoaded) return;
    const userId = getUserId();
    if (currentSong) {
      localStorage.setItem(`currentSong_${userId}`, JSON.stringify(currentSong));
    } else {
      localStorage.removeItem(`currentSong_${userId}`);
    }
  }, [currentSong, isStateLoaded]);

  useEffect(() => {
    if (!isStateLoaded) return;
    const userId = getUserId();
    localStorage.setItem(`playerQueue_${userId}`, JSON.stringify(queue));
  }, [queue, isStateLoaded]);

  useEffect(() => {
    if (!isStateLoaded) return;
    const userId = getUserId();
    localStorage.setItem(`playerVolume_${userId}`, volume.toString());
  }, [volume, isStateLoaded]);

  // Initial Audio Setup on Mount (restore source)
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    // This effect now primarily handles volume changes and ensures src is set
    // if currentSong changes *after* initial load, or if src was cleared.
    if (currentSong && !audio.src) { // Only set src if it's not already set
      const src = currentSong.audioFileUrl || currentSong.songUrl || currentSong.fileUrl;
      if (src) {
        audio.src = src;
      }
    }
  }, [currentSong, volume]); // Run when currentSong is restored or volume changes initially

  // Fetch liked songs on mount/auth change
  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLikedSongIds(new Set());
          return;
        }
        const ids = await songsApi.getLikedIds();
        if (ids) {
          setLikedSongIds(new Set(ids));
        }
      } catch (e) {
        console.error("Failed to fetch liked songs", e);
      }
    };
    fetchLiked();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => playNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue]); // Re-bind if queue changes (though logic uses state)

  const playSong = (song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // New song
      setCurrentSong(song);
      const src = song.audioFileUrl || song.songUrl || song.fileUrl;
      if (src) {
        audioRef.current.src = src;
        audioRef.current.play()
          .catch(e => console.error("Playback failed:", e));
        setIsPlaying(true);
      }
    }
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const resumeSong = () => {
    if (currentSong) {
      // Ensure src is set if it was lost (e.g. technically covered by effect but explicit check is safer)
      if (!audioRef.current.src) {
        const src = currentSong.audioFileUrl || currentSong.songUrl || currentSong.fileUrl;
        if (src) audioRef.current.src = src;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextIndex = queue.findIndex(s => s.id === currentSong?.id) + 1;
      if (nextIndex < queue.length) {
        playSong(queue[nextIndex]);
      }
    }
  };

  const playPrevious = () => {
    if (queue.length > 0) {
      const prevIndex = queue.findIndex(s => s.id === currentSong?.id) - 1;
      if (prevIndex >= 0) {
        playSong(queue[prevIndex]);
      }
    }
  };

  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
  };

  const setQueueList = (songs) => {
    setQueue(songs);
  };

  const seek = (time) => {
    if (audioRef.current.readyState > 0) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const updateVolume = (val) => {
    setVolume(val);
    audioRef.current.volume = val;
  };

  const toggleLike = async (songId) => {
    try {
      const isLiked = likedSongIds.has(songId);
      // Optimistic update
      const newSet = new Set(likedSongIds);
      if (isLiked) newSet.delete(songId);
      else newSet.add(songId);
      setLikedSongIds(newSet);

      await songsApi.toggleLike(songId);
    } catch (e) {
      console.error("Failed to toggle like", e);
    }
  };

  const value = {
    currentSong,
    isPlaying,
    queue,
    currentTime,
    duration,
    volume,
    playSong,
    pauseSong,
    resumeSong,
    playNext,
    playPrevious,
    addToQueue,
    setQueueList,
    seek,
    updateVolume,
    likedSongIds,
    toggleLike
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
