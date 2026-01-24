import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const audioPlayer = useAudioPlayer();
  const [currentSong, setCurrentSong] = useState(null);


  useEffect(() => {
    const savedSong = localStorage.getItem('currentSong');
    if (savedSong) {
      try {
        const song = JSON.parse(savedSong);
        setCurrentSong(song);
        if (song.audioFileUrl) {
          audioPlayer.loadSong(song);
        }
      } catch (error) {
        console.error('Error loading saved song:', error);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('currentSong', JSON.stringify(currentSong));
      if (currentSong.audioFileUrl) {
        audioPlayer.loadSong(currentSong);
      }
    }
  }, [currentSong, audioPlayer]);

  const playSong = useCallback((song) => {
    setCurrentSong(song);
    if (song.audioFileUrl) {
      audioPlayer.loadSong(song);
      setTimeout(() => {
        audioPlayer.play();
      }, 100);
    }
  }, [audioPlayer]);

  const value = {
    ...audioPlayer,
    currentSong,
    playSong,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
