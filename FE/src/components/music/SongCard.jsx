import { Play } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const SongCard = ({ song }) => {
    const { playSong, currentSong, isPlaying } = usePlayer();

    // Use coverUrl or imageUrl, default to placeholder if missing
    const cover = song.coverImageUrl || song.coverUrl || song.imageUrl || 'https://placehold.co/400';

    const isCurrent = currentSong?.id === song.id;

    return (
        <div
            className="group relative bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg p-4 cursor-pointer"
            onClick={() => playSong(song)}
        >
            <div className="relative aspect-square w-full mb-4 rounded-md overflow-hidden shadow-lg">
                <img
                    src={cover}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={cn(
                    "absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl",
                    isCurrent && "translate-y-0 opacity-100"
                )}>
                    <Button size="icon" className="rounded-full bg-green-500 hover:bg-green-400 text-black h-12 w-12 shadow-lg">
                        {isCurrent && isPlaying ? (
                            <div className="w-3 h-3 bg-black" /> // Pause icon shim
                        ) : (
                            <Play fill="currentColor" className="ml-1" />
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <h3 className={cn("font-bold text-white truncate", isCurrent && "text-green-500")}>
                    {song.title}
                </h3>
                <p className="text-sm text-gray-400 truncate hover:underline">
                    {song.artist}
                </p>
            </div>
        </div>
    );
};

export default SongCard;
