import { useState } from 'react';
import { Play, MoreHorizontal, Plus } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import AddToPlaylistDialog from '../playlist/AddToPlaylistDialog';

const SongCard = ({ song }) => {
    const { playSong, currentSong, isPlaying } = usePlayer();

    // Use coverUrl or imageUrl, default to placeholder if missing
    const cover = song.coverImageUrl || song.coverUrl || song.imageUrl || 'https://placehold.co/400';

    const isCurrent = currentSong?.id === song.id;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
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
                        (isCurrent || isMenuOpen) && "translate-y-0 opacity-100"
                    )}>
                        <div className="flex gap-2">
                            {/* Play Button */}
                            <Button size="icon" className="rounded-full bg-green-500 hover:bg-green-400 text-black h-12 w-12 shadow-lg">
                                {isCurrent && isPlaying ? (
                                    <div className="w-3 h-3 bg-black" />
                                ) : (
                                    <Play fill="currentColor" className="ml-1" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 overflow-hidden">
                        <h3 className={cn("font-bold text-white truncate", isCurrent && "text-green-500")}>
                            {song.title}
                        </h3>
                        <div className="text-sm text-gray-400 truncate">
                            {(() => {
                                const artistList = song.artists && song.artists.length > 0
                                    ? song.artists
                                    : (song.artistName || song.artist || '').split(',').map(name => ({ name: name.trim() }));

                                return artistList.map((artist, index) => (
                                    <span key={index}>
                                        <span className="hover:underline cursor-pointer">{artist.name}</span>
                                        {index < artistList.length - 1 && ", "}
                                    </span>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* More Options Menu */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 bg-[#282828] text-gray-200 border-none z-50">
                                <DropdownMenuItem
                                    className="cursor-pointer hover:bg-[#3E3E3E] hover:text-white focus:bg-[#3E3E3E] focus:text-white"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add to Playlist
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <AddToPlaylistDialog
                song={song}
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </>
    );
};

export default SongCard;
