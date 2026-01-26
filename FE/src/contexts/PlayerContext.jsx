import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(new Audio());

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
      audioRef.current.src = song.audioFileUrl || song.songUrl || song.fileUrl; // Handle different property names
      audioRef.current.play()
        .catch(e => console.error("Playback failed:", e)); // Catch permission errors
      setIsPlaying(true);

      // Update queue if not already in recent context
      // For simplicity, we just set it as current. Queue logic can be expanded.
    }
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const resumeSong = () => {
    if (currentSong) {
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
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const updateVolume = (val) => {
    setVolume(val);
    audioRef.current.volume = val;
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
    updateVolume
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
