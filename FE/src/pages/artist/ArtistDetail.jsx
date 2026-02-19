import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artistsApi, playlistsApi, formatDuration } from '../../lib/api';
import { usePlayer } from '../../contexts/PlayerContext';
import { cn } from '../../lib/utils';
import { Loader2, Play, Pause, BadgeCheck, MoreHorizontal, Heart, Plus, Disc3 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import AddToPlaylistDialog from '../../components/playlist/AddToPlaylistDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const ArtistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playSong, currentSong, isPlaying, toggleLike, likedSongIds } = usePlayer();

    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSong, setSelectedSong] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [addedSongIds, setAddedSongIds] = useState(new Set());

    useEffect(() => {
        fetchArtist();
        fetchUserPlaylists();
    }, [id]);

    const fetchArtist = async () => {
        try {
            setLoading(true);
            const data = await artistsApi.getById(id);
            setArtist(data);
        } catch (error) {
            console.error('Failed to fetch artist:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPlaylists = async () => {
        try {
            const playlists = await playlistsApi.getMyPlaylists();
            if (playlists) {
                const sIds = new Set();
                playlists.forEach(p => {
                    if (p.songIds) {
                        p.songIds.forEach(sid => sIds.add(sid));
                    }
                });
                setAddedSongIds(sIds);
            }
        } catch (error) {
            console.error("Failed to fetch playlists for check:", error);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!artist) {
        return <div className="text-center py-20 text-white">Artist not found.</div>;
    }

    // Filter Discography
    const albums = artist.albums?.filter(a => a.type === 'Album') || [];
    const singles = artist.albums?.filter(a => a.type === 'Single') || [];
    const popularSongs = artist.songs?.slice(0, 5) || []; // Top 5

    // Helper to format large numbers
    const formatPlayCount = (count) => {
        return new Intl.NumberFormat('en-US').format(count || 0);
    };

    const handleDialogChange = (open) => {
        setIsDialogOpen(open);
        if (!open) {
            fetchUserPlaylists();
        }
    };

    const handleAddToPlaylist = (song) => {
        setSelectedSong(song);
        setIsDialogOpen(true);
    };

    return (
        <div className="bg-gradient-to-b from-zinc-900 to-black min-h-screen pb-32">
            {/* Header Hero */}
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${artist.avatarUrl || ''})`, filter: 'blur(20px) brightness(0.4)' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-4 z-10">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Verified Icon */}
                        <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-900" />
                        <span className="text-white text-sm font-bold tracking-wide uppercase">Verified Artist</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter drop-shadow-2xl">
                        {artist.name}
                    </h1>

                    <div className="text-base text-white/90 font-medium">
                        {artist.followerCount?.toLocaleString() || 0} monthly listeners
                    </div>
                </div>
            </div>

            {/* Actions & Play Button */}
            <div className="flex items-center gap-4 px-8 py-6 bg-[#121212]/95 backdrop-blur-md z-20 border-b border-white/5 shadow-lg transition-all duration-300">
                {popularSongs.length > 0 && (
                    <Button
                        size="icon"
                        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black shadow-lg hover:scale-105 transition-all"
                        onClick={() => playSong(popularSongs[0], popularSongs)}
                    >
                        {currentSong?.artists?.some(a => a.id === artist.id) && isPlaying ? (
                            <Pause fill="currentColor" className="w-7 h-7 ml-1" />
                        ) : (
                            <Play fill="currentColor" className="w-7 h-7 ml-1" />
                        )}
                    </Button>
                )}

                <Button variant="outline" className="border-white/20 hover:border-white text-white hover:bg-white/10 rounded-full px-6 font-bold tracking-wider text-xs uppercase h-10">
                    Follow
                </Button>

                <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full h-10 w-10">
                    <MoreHorizontal className="w-6 h-6" />
                </Button>
            </div>

            <div className="px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Popular Songs Column */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold text-white mb-4">Popular</h2>
                    <div className="space-y-0.5">
                        {popularSongs.map((song, index) => {
                            const isCurrentSong = currentSong?.id === song.id;

                            return (
                                <div
                                    key={song.id}
                                    className={cn(
                                        "group grid grid-cols-[16px_4fr_2fr_50px_40px] gap-4 px-4 py-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center text-sm",
                                        isCurrentSong ? "bg-white/5" : "text-zinc-400"
                                    )}
                                    onClick={() => playSong(song, popularSongs)}
                                >
                                    <div className="flex items-center justify-center">
                                        {isCurrentSong && isPlaying ? (
                                            <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="w-3.5 h-3.5" alt="playing" />
                                        ) : (
                                            <span className={cn("group-hover:hidden font-mono", isCurrentSong && "text-green-500 font-bold")}>{index + 1}</span>
                                        )}
                                        <Play className={cn("w-4 h-4 text-white hidden", (!isCurrentSong || !isPlaying) && "group-hover:block")} fill="currentColor" />
                                    </div>

                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <img src={song.coverImageUrl} className="w-10 h-10 object-cover rounded shadow" alt="" />
                                        <span className={cn("font-medium truncate text-base transition-colors", isCurrentSong ? "text-green-500" : "text-white")}>
                                            {song.title}
                                        </span>
                                    </div>

                                    <div className="truncate text-xs font-mono group-hover:text-white transition-colors">
                                        {formatPlayCount(song.playCount)} calls
                                    </div>

                                    <div className="flex justify-end text-xs font-mono group-hover:text-white transition-colors">
                                        {formatDuration(song.duration)}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-transparent">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#282828] border-white/10 text-zinc-200 z-50">
                                                    <DropdownMenuItem
                                                        onClick={() => toggleLike(song.id)}
                                                        className="hover:bg-white/10 cursor-pointer focus:bg-white/10"
                                                    >
                                                        <Heart className={cn("w-4 h-4 mr-2", likedSongIds.has(song.id) ? "fill-green-500 text-green-500" : "")} />
                                                        {likedSongIds.has(song.id) ? 'Remove from Liked' : 'Add to Liked'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleAddToPlaylist(song)}
                                                        className="hover:bg-white/10 cursor-pointer focus:bg-white/10"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add to Playlist
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {popularSongs.length >= 5 && (
                        <Button variant="ghost" className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest mt-2 hover:bg-transparent pl-4">
                            See All
                        </Button>
                    )}
                </div>

                {/* About / Bio (Right Column) */}
                <div className="hidden lg:block">
                    <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                    <div className="bg-[#181818] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 cursor-pointer group shadow-xl">
                        <div className="h-64 relative">
                            {artist.avatarUrl ? (
                                <img src={artist.avatarUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Disc3 size={48} className="text-zinc-600" /></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {artist.followerCount?.toLocaleString()} Followers
                                    </div>
                                </div>
                                <p className="text-white line-clamp-3 font-medium leading-relaxed drop-shadow-md">
                                    {artist.bio || "No biography available for this artist."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discography Section */}
            <div className="px-8 mt-16 space-y-16">
                {/* Albums */}
                {albums.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Albums</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {albums.map((album) => (
                                <div
                                    key={album.id}
                                    className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all cursor-pointer group shadow-lg hover:shadow-2xl hover:-translate-y-1 duration-300"
                                    onClick={() => navigate(`/app/album/${album.id}`)}
                                >
                                    <div className="relative mb-4 aspect-square rounded-md overflow-hidden shadow-black/50 shadow-lg">
                                        <img
                                            src={album.coverImageUrl || 'https://placehold.co/200'}
                                            alt={album.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button size="icon" className="rounded-full w-12 h-12 bg-green-500 hover:bg-green-400 text-black shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <Play fill="currentColor" className="ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-white truncate">{album.title}</h3>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        {new Date(album.releaseDate).getFullYear()} • Album
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Singles */}
                {singles.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Singles & EPs</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {singles.map((album) => (
                                <div
                                    key={album.id}
                                    className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all cursor-pointer group shadow-lg hover:shadow-2xl hover:-translate-y-1 duration-300"
                                    onClick={() => navigate(`/app/album/${album.id}`)}
                                >
                                    <div className="relative mb-4 aspect-square rounded-md overflow-hidden shadow-black/50 shadow-lg">
                                        <img
                                            src={album.coverImageUrl || 'https://placehold.co/200'}
                                            alt={album.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button size="icon" className="rounded-full w-12 h-12 bg-green-500 hover:bg-green-400 text-black shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <Play fill="currentColor" className="ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-white truncate">{album.title}</h3>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        {new Date(album.releaseDate).getFullYear()} • Single
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <AddToPlaylistDialog
                song={selectedSong}
                isOpen={isDialogOpen}
                onOpenChange={handleDialogChange}
            />
        </div>
    );
};

export default ArtistDetail;
