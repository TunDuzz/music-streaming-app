import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artistsApi, playlistsApi, formatDuration } from '../../lib/api';
import { usePlayer } from '../../contexts/PlayerContext';


import { Loader2, Play, Pause, Clock, Disc, Music, BadgeCheck, CheckCircle2, PlusCircle, MoreHorizontal, Heart, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
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
        return new Intl.NumberFormat('vi-VN').format(count || 0);
    };

    // Callback when a song is added via dialog (optional optimization: update local state immediately)
    const handleDialogChange = (open) => {
        setIsDialogOpen(open);
        if (!open) {
            // Refetch playlists to update checkmarks when dialog closes
            fetchUserPlaylists();
        }
    };

    const handleAddToPlaylist = (song) => {
        setSelectedSong(song);
        setIsDialogOpen(true);
    };

    return (
        <div className="bg-gradient-to-b from-[#1E1E1E] to-[#121212] min-h-screen pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end gap-6 p-8 bg-gradient-to-b from-gray-700/50 to-transparent">
                <div className="w-52 h-52 bg-[#282828] shadow-2xl flex items-center justify-center rounded-full overflow-hidden group relative flex-shrink-0">
                    {artist.avatarUrl ? (
                        <img
                            src={`${artist.avatarUrl}?t=${new Date().getTime()}`}
                            alt={artist.name}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <Music className="w-20 h-20 text-gray-500" />
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                        {/* Verified Icon */}
                        <BadgeCheck className="w-6 h-6 text-white fill-blue-500" />
                        <span className="text-white text-sm font-bold tracking-wide">Verified Artist</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tighter">
                        {artist.name}
                    </h1>

                    <div className="flex items-center gap-6 text-sm text-gray-300 font-medium mt-4">
                        <span className="text-white">{artist.followerCount?.toLocaleString() || 0} monthly listeners</span>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-4 px-8 py-6">
                {popularSongs.length > 0 && (
                    <Button
                        size="icon"
                        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black shadow-lg"
                        onClick={() => playSong(popularSongs[0])}
                    >
                        {currentSong?.artists?.some(a => a.id === artist.id) && isPlaying ? (
                            <Pause fill="currentColor" className="w-6 h-6" />
                        ) : (
                            <Play fill="currentColor" className="w-6 h-6 ml-1" />
                        )}
                    </Button>
                )}

                <Button variant="outline" className="text-white border-gray-400 hover:border-white hover:bg-transparent uppercase text-xs font-bold tracking-widest px-6 rounded-full">
                    Follow
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8">
                {/* Popular Songs Column */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-white mb-4">Popular</h2>
                    <div className="space-y-1">
                        {popularSongs.map((song, index) => {
                            const isCurrentSong = currentSong?.id === song.id;
                            const isAdded = addedSongIds.has(song.id);

                            return (
                                <div
                                    key={song.id}
                                    className="group grid grid-cols-[16px_4fr_2fr_minmax(50px,1fr)_40px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center text-sm text-gray-400 hover:text-white"
                                    onClick={() => playSong(song)}
                                >
                                    <div className="flex items-center justify-center">
                                        {isCurrentSong && isPlaying ? (
                                            <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="w-3.5 h-3.5" alt="playing" />
                                        ) : (
                                            <span className="group-hover:hidden">{index + 1}</span>
                                        )}
                                        <Play className={`w-3 h-3 text-white hidden ${(!isCurrentSong || !isPlaying) ? 'group-hover:block' : ''}`} fill="currentColor" />
                                    </div>

                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <img src={song.coverImageUrl} className="w-10 h-10 object-cover rounded shadow" alt="" />
                                        <span className={`font-medium truncate text-base ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>{song.title}</span>
                                    </div>

                                    {/* Play Count */}
                                    <div className="truncate group-hover:text-white transition-colors">
                                        {formatPlayCount(song.playCount || 0)}
                                    </div>

                                    {/* Duration */}
                                    <div className="flex items-center justify-end">
                                        <span>{formatDuration(song.duration)}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-white">
                                                        <MoreHorizontal size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#282828] border-none text-gray-200 z-50">
                                                    <DropdownMenuItem
                                                        onClick={() => toggleLike(song.id)}
                                                        className="hover:bg-[#3E3E3E] cursor-pointer"
                                                    >
                                                        <Heart className={`w-4 h-4 mr-2 ${likedSongIds.has(song.id) ? 'fill-green-500 text-green-500' : ''}`} />
                                                        {likedSongIds.has(song.id) ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleAddToPlaylist(song)}
                                                        className="hover:bg-[#3E3E3E] cursor-pointer"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Thêm vào danh sách phát
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {popularSongs.length === 0 && <div className="text-gray-500 italic">No songs found.</div>}
                    </div>
                </div>

                {/* Artist Pick / About / Stats Column - Placeholder for now */}
                <div className="hidden lg:block">
                    <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                    {artist.bio ? (
                        <div className="bg-[#282828] rounded-lg p-6 hover:bg-[#333] transition-colors cursor-pointer relative overflow-hidden h-[300px]">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                            {artist.avatarUrl && <img src={artist.avatarUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />}
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-white line-clamp-3 font-medium">{artist.bio}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500">No biography available.</div>
                    )}
                </div>
            </div>

            {/* Discography */}
            <div className="px-8 mt-12 space-y-12">
                {/* Albums */}
                {albums.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Albums</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {albums.map((album) => (
                                <div
                                    key={album.id}
                                    className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all cursor-pointer group"
                                    onClick={() => navigate(`/app/album/${album.id}`)}
                                >
                                    <div className="relative mb-4 aspect-square">
                                        <img
                                            src={album.coverImageUrl || 'https://placehold.co/200'}
                                            alt={album.title}
                                            className="w-full h-full object-cover rounded-md shadow-lg group-hover:shadow-xl transition-shadow"
                                        />
                                    </div>
                                    <h3 className="text-base font-bold text-white truncate">{album.title}</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {new Date(album.releaseDate).getFullYear()} • Album
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Singles and EPs */}
                {singles.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Singles and EPs</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {singles.map((album) => (
                                <div
                                    key={album.id}
                                    className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all cursor-pointer group"
                                    onClick={() => navigate(`/app/album/${album.id}`)}
                                >
                                    <div className="relative mb-4 aspect-square">
                                        <img
                                            src={album.coverImageUrl || 'https://placehold.co/200'}
                                            alt={album.title}
                                            className="w-full h-full object-cover rounded-md shadow-lg group-hover:shadow-xl transition-shadow"
                                        />
                                    </div>
                                    <h3 className="text-base font-bold text-white truncate">{album.title}</h3>
                                    <p className="text-sm text-gray-400 mt-1">
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
