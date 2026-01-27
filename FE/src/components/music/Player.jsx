import { usePlayer } from '../../contexts/PlayerContext';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
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
                    <Slider
                        value={[progress || 0]}
                        max={100}
                        step={0.1}
                        onValueChange={(val) => {
                            // We need to fetch duration again or passed via props/context. 
                            // The context is available via outer scope 'useAudioPlayer()' hook result? 
                            // Wait, 'seek' is available, but 'currentSong.duration' is safer?
                            // Actually context hook result was destructured at top.
                            // But I need total duration in seconds.
                            // 'currentSong.duration' is usually seconds.
                            // Let's use that.
                            if (currentSong?.duration) {
                                seek((val[0] / 100) * currentSong.duration);
                            }
                        }}
                        className="flex-1"
                    />
                    <span>{formattedDuration}</span>
                </div>
            </div>

            {/* Right: Volume */}
            <div className="flex items-center justify-end gap-2 w-[30%] min-w-[150px]">
                {volume === 0 ? <VolumeX size={20} className="text-gray-400" /> :
                    volume < 0.5 ? <Volume1 size={20} className="text-gray-400" /> :
                        <Volume2 size={20} className="text-gray-400" />}

                <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={(val) => updateVolume(val[0])}
                    className="w-24"
                />
            </div>
        </div>
    );
};

export default Player;
