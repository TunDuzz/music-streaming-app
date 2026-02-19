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
  const [originalQueue, setOriginalQueue] = useState([]); // Backup for shuffle
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
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

      // Load Shuffle/Repeat State
      const savedShuffle = localStorage.getItem(`playerShuffle_${userId}`);
      if (savedShuffle) setIsShuffle(JSON.parse(savedShuffle));

      const savedRepeat = localStorage.getItem(`playerRepeat_${userId}`);
      if (savedRepeat) setRepeatMode(savedRepeat);

      const savedOriginalQueue = localStorage.getItem(`playerOriginalQueue_${userId}`);
      if (savedOriginalQueue) setOriginalQueue(JSON.parse(savedOriginalQueue));


      setIsStateLoaded(true);
    };

    loadState();
  }, [localStorage.getItem('token')]);

  // Save state to localStorage
  useEffect(() => {
    if (!isStateLoaded) return;
    const userId = getUserId();

    if (currentSong) localStorage.setItem(`currentSong_${userId}`, JSON.stringify(currentSong));
    else localStorage.removeItem(`currentSong_${userId}`);

    localStorage.setItem(`playerQueue_${userId}`, JSON.stringify(queue));
    localStorage.setItem(`playerVolume_${userId}`, volume.toString());
    localStorage.setItem(`playerShuffle_${userId}`, JSON.stringify(isShuffle));
    localStorage.setItem(`playerRepeat_${userId}`, repeatMode);
    localStorage.setItem(`playerOriginalQueue_${userId}`, JSON.stringify(originalQueue));

  }, [currentSong, queue, volume, isShuffle, repeatMode, originalQueue, isStateLoaded]);

  // Initial Audio Setup on Mount (restore source)
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    if (currentSong && !audio.src) {
      const src = currentSong.audioFileUrl || currentSong.songUrl || currentSong.fileUrl;
      if (src) {
        audio.src = src;
      }
    }
  }, [currentSong, volume]);

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

    // Handle song end based on repeat mode
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext(true); // true indicates auto-advance
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, repeatMode]); // Re-bind if queue or repeatMode changes

  // Helper to shuffle array
  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const playSong = (song, collection = null) => {
    let newQueue = queue;

    // Context-Aware Queue Logic
    if (collection && Array.isArray(collection) && collection.length > 0) {
      setOriginalQueue(collection);
      if (isShuffle) {
        // If shuffle is on, shuffle the new collection but keep target song first? 
        // Or just shuffle everything. Common UX: Play song, shuffle rest.
        // Simplified: Shuffle entire collection, find song, put to front.
        const shuffled = shuffleArray([...collection]);
        const index = shuffled.findIndex(s => s.id === song.id);
        if (index > -1) {
          shuffled.splice(index, 1);
          shuffled.unshift(song);
        }
        newQueue = shuffled;
      } else {
        newQueue = collection;
      }
      setQueue(newQueue);
    }

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
      if (!audioRef.current.src) {
        const src = currentSong.audioFileUrl || currentSong.songUrl || currentSong.fileUrl;
        if (src) audioRef.current.src = src;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = (autoAdvance = false) => {
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
      let nextIndex = currentIndex + 1;

      // Wrap around logic for Repeat All
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all' || autoAdvance) {
          // If Repeat All is ON, wrap to 0.
          // If Auto Advance (song ended) and Repeat All is ON, wrap to 0.
          // If Auto Advance and Repeat Off, stop (handled by check below).
          if (repeatMode === 'all') nextIndex = 0;
          else if (repeatMode === 'off' && autoAdvance) {
            // Stop playback
            setIsPlaying(false);
            return;
          }
        }
      }

      if (nextIndex < queue.length) {
        playSong(queue[nextIndex]);
      }
    }
  };

  const playPrevious = () => {
    // If played > 3 seconds, restart song
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (queue.length > 0) {
      const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
      let prevIndex = currentIndex - 1;

      if (prevIndex < 0) {
        // Wrap to end if Repeat All ?? Or just stay at start?
        // Usually previous at start goes to last song if generic player logic, 
        // but often it just stays at 0 if repeat off. 
        // Let's implement wrap if Repeat All.
        if (repeatMode === 'all') prevIndex = queue.length - 1;
        else prevIndex = 0; // Or stop? Usually just restart first song.
      }

      if (prevIndex >= 0) {
        playSong(queue[prevIndex]);
      }
    }
  };

  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
    // Also update original queue if not shuffling? 
    // Usually manual add to queue appends to current queue.
    // If shuffle is on, we might want to add it to originalQueue too.
    setOriginalQueue(prev => [...prev, song]);
  };

  const setQueueList = (songs) => {
    setQueue(songs);
    setOriginalQueue(songs);
    setIsShuffle(false); // Reset shuffle when explicitly setting queue list? Or maintain? 
    // Usually setting a new list implies a reset.
  };

  const toggleShuffle = () => {
    const newShuffleState = !isShuffle;
    setIsShuffle(newShuffleState);

    if (newShuffleState) {
      // Turn ON Shuffle
      if (queue.length > 0) {
        const shuffled = shuffleArray([...queue]);
        // Keep current song playing
        if (currentSong) {
          const idx = shuffled.findIndex(s => s.id === currentSong.id);
          if (idx > -1) {
            shuffled.splice(idx, 1);
            shuffled.unshift(currentSong);
          }
        }
        setQueue(shuffled);
      }
    } else {
      // Turn OFF Shuffle -> Restore Original
      // But we want to keep current song playing.
      // Restoring original queue might jump context if current song is far down.
      // But it is the expected behavior to restore the playlist order.
      if (originalQueue.length > 0) {
        setQueue(originalQueue);
      }
    }
  };

  const toggleRepeat = () => {
    // off -> all -> one -> off
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
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
    isShuffle,
    repeatMode,
    playSong,
    pauseSong,
    resumeSong,
    playNext,
    playPrevious,
    addToQueue,
    setQueueList,
    toggleShuffle,
    toggleRepeat,
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
