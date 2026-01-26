import { useState, useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { formatDuration } from '../lib/api';

const useAudioPlayer = () => {
    const player = usePlayer();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Update progress bar
        if (player.duration > 0) {
            setProgress((player.currentTime / player.duration) * 100);
        } else {
            setProgress(0);
        }
    }, [player.currentTime, player.duration]);

    return {
        ...player,
        progress,
        formattedTime: formatDuration(player.currentTime),
        formattedDuration: formatDuration(player.duration),
    };
};

export default useAudioPlayer;
