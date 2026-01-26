import { usePlayer } from '../../contexts/PlayerContext';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider'; // We don't have Slider yet, let's use standard input type="range" styled or create a Slider component
// Let's create a simple Slider using Tailwind for now to save time on creating shadcn Slider component
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const Player = () => {
    const {
        currentSong,
        isPlaying,
        playSong,
        pauseSong,
        resumeSong,
        playNext,
        playPrevious,
        seek,
        updateVolume,
        formattedTime,
        formattedDuration,
        progress,
        volume
    } = useAudioPlayer();

    if (!currentSong) return null;

    const togglePlay = () => {
        if (isPlaying) {
            pauseSong();
        } else {
            resumeSong();
        }
    };

    const handleSeek = (e) => {
        const value = e.target.value;
        const duration = currentSong.duration || 1; // Avoid divide by zero
        // We need direct access to duration in seconds for seek logic if possible, 
        // hook gives formattedDuration. Let's assume hook exposes raw values too or we add them.
        // Checking useAudioPlayer hook: it exposes ...player, which has { duration }
        // So we can use player.duration
        seek((value / 100) * (currentSong.duration || 0)); // Assuming currentSong has duration or player has it
        // Actually hook exposes 'duration' from audio metadata.
    };

    // Custom slider style
    // Progress bar gradient style
    const sliderStyle = {
        background: `linear-gradient(to right, #1db954 ${progress}%, #4b5563 ${progress}%)`
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full h-24 bg-black border-t border-white/10 px-4 flex items-center justify-between z-[100] backdrop-blur-lg bg-black/90">
            {/* Left: Song Info */}
            <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
                <Avatar className="h-14 w-14 rounded-md border border-white/10">
                    <AvatarImage src={currentSong?.coverImageUrl || currentSong?.imageUrl} className="object-cover" />
                    <AvatarFallback className="rounded-md bg-white/10 text-xs">IMG</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-white font-medium truncate hover:underline cursor-pointer">
                        {currentSong?.title}
                    </span>
                    <span className="text-xs text-gray-400 truncate hover:underline cursor-pointer hover:text-white">
                        {currentSong?.artistName || currentSong?.artist}
                    </span>
                </div>
            </div>

            {/* Center: Controls */}
            <div className="flex flex-col items-center gap-2 w-[40%] max-w-xl">
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <Shuffle size={18} />
                    </button>
                    <button
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={playPrevious}
                    >
                        <SkipBack size={24} fill="currentColor" />
                    </button>
                    <button
                        className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <Pause size={24} fill="currentColor" />
                        ) : (
                            <Play size={24} fill="currentColor" className="ml-1" />
                        )}
                    </button>
                    <button
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={playNext}
                    >
                        <SkipForward size={24} fill="currentColor" />
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <Repeat size={18} />
                    </button>
                </div>

                <div className="w-full flex items-center gap-2 text-xs text-gray-400 font-mono">
                    <span>{formattedTime}</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress || 0}
                        onChange={(e) => {
                            const time = (e.target.value / 100) * (usePlayer().duration || 1);
                            seek(time);
                        }}
                        className="flex-1 h-1 rounded-lg appearance-none cursor-pointer"
                        style={sliderStyle}
                    />
                    <span>{formattedDuration}</span>
                </div>
            </div>

            {/* Right: Volume */}
            <div className="flex items-center justify-end gap-2 w-[30%] min-w-[150px]">
                <Volume2 size={20} className="text-gray-400" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => updateVolume(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-primary"
                />
            </div>
        </div>
    );
};

export default Player;
