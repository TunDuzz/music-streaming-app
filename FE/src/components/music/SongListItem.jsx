import { Play, Pause, MoreHorizontal, Heart } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { formatDuration } from '../../lib/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const SongListItem = ({ song, index }) => {
    const { playSong, currentSong, isPlaying, toggleLike, likedSongIds } = usePlayer();

    const isLiked = likedSongIds.has(song.id);

    const isCurrent = currentSong?.id === song.id;

    return (
        <div
            className={cn(
                "group flex items-center gap-4 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer",
                isCurrent && "bg-white/10"
            )}
            onDoubleClick={() => playSong(song)}
        >
            {/* Index / Play Button */}
            <div className="w-8 flex justify-center text-gray-400">
                <span className="group-hover:hidden text-sm font-mono">
                    {isCurrent && isPlaying ? (
                        <img src="/playing.gif" alt="playing" className="w-3 h-3 invert" /> // Placeholder for animated equalizer
                    ) : (
                        index + 1
                    )}
                </span>
                <button
                    className="hidden group-hover:block text-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        playSong(song);
                    }}
                >
                    {isCurrent && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
            </div>

            {/* Song Info */}
            <div className="flex-1 flex items-center gap-3">
                <img
                    src={song.coverUrl || song.imageUrl || 'https://placehold.co/40'}
                    alt={song.title}
                    className="w-10 h-10 object-cover rounded bg-white/5"
                />
                <div className="flex flex-col">
                    <span className={cn("text-base font-medium truncate text-white", isCurrent && "text-green-500")}>
                        {song.title}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                        {song.artist}
                    </span>
                </div>
            </div>

            {/* Album (Optional/Hidden on mobile) */}
            <div className="hidden md:block flex-1 text-gray-400 text-sm truncate hover:text-white">
                {song.album || "Single"}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 justify-end">
                <span className="text-sm text-gray-400 font-mono w-10 text-right">
                    {formatDuration(song.duration)}
                </span>

                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-transparent opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#282828] border-none text-gray-200 z-50">
                            <DropdownMenuItem
                                onClick={() => toggleLike(song.id)}
                                className="hover:bg-[#3E3E3E] cursor-pointer"
                            >
                                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-green-500 text-green-500' : ''}`} />
                                {isLiked ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

export default SongListItem;
