// Custom hook for managing audio playback
// This hook will be used to control music playback across the app

import { useState, useRef } from 'react';

export const useAudioPlayer = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentSong, setCurrentSong] = useState(null);

    const play = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const seek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const loadSong = (song) => {
        setCurrentSong(song);
        // TODO: Load audio file
    };

    return {
        audioRef,
        isPlaying,
        currentTime,
        duration,
        currentSong,
        play,
        pause,
        togglePlayPause,
        seek,
        loadSong,
    };
};
