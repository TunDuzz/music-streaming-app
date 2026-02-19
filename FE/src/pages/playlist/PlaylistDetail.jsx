import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistsApi, formatDuration } from '../../lib/api';
import { usePlayer } from '../../contexts/PlayerContext';
import { Loader2, Play, Trash2, Clock, Music, MoreHorizontal, Pencil, ListFilter, Heart, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import EditPlaylistDialog from '../../components/playlist/EditPlaylistDialog';

const PlaylistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playSong, currentSong, isPlaying, toggleLike, likedSongIds } = usePlayer();

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    // Column Visibility State
    const [showAlbum, setShowAlbum] = useState(true);
    const [showDateAdded, setShowDateAdded] = useState(true);
    const [showDuration, setShowDuration] = useState(true);

    // Edit Dialog State
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        fetchPlaylist();
    }, [id]);

    const fetchPlaylist = async () => {
        try {
            setLoading(true);
            let data;
            if (id === 'liked') {
                data = await playlistsApi.getLiked();
            } else {
                data = await playlistsApi.getById(id);
            }
            setPlaylist(data);
        } catch (error) {
            console.error('Failed to fetch playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSong = async (songId) => {
        try {
            await playlistsApi.removeSong(id, songId);
            setPlaylist(prev => ({
                ...prev,
                songs: prev.songs.filter(s => s.id !== songId)
            }));
        } catch (error) {
            console.error('Failed to remove song:', error);
        }
    };

    const handleDeletePlaylist = async () => {
        if (!confirm("Are you sure you want to delete this playlist?")) return;
        try {
            await playlistsApi.delete(id);
            navigate('/app/library');
        } catch (error) {
            console.error('Failed to delete playlist:', error);
        }
    };

    const formatDateAdded = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)} weeks ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!playlist) {
        return <div className="text-center py-20 text-white">Playlist not found.</div>;
    }

    // Dynamic grid columns based on visibility
    const getGridTemplate = () => {
        let cols = "16px 6fr"; // Index, Title+Artist
        if (showAlbum) cols += " 4fr";
        if (showDateAdded) cols += " 3fr";
        if (showDuration) cols += " 100px";
        cols += " 48px"; // Actions
        return cols;
    };

    // Determine gradient based on ID (simple heuristic)
    const isLiked = id === 'liked';
    const bgGradient = isLiked
        ? "from-indigo-900/50 to-black"
        : "from-zinc-900/80 to-black";

    return (
        <div className={`min-h-screen bg-gradient-to-b ${bgGradient} pb-32 transition-colors duration-1000`}>
            {/* Header / Hero Section */}
            <div className="relative flex flex-col md:flex-row items-end gap-8 p-8 pb-8 bg-gradient-to-b from-white/5 to-black/20 backdrop-blur-sm border-b border-white/5">
                {/* Playlist Cover */}
                <div className="w-52 h-52 md:w-60 md:h-60 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden flex-shrink-0 group relative border border-white/10 bg-[#282828]">
                    {isLiked ? (
                        <div className="w-full h-full bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
                        </div>
                    ) : playlist.coverImageUrl ? (
                        <img
                            src={`${playlist.coverImageUrl}?t=${new Date().getTime()}`}
                            alt={playlist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            <Music className="w-24 h-24 text-zinc-600" />
                        </div>
                    )}

                    {/* Hover Overlay for Edit (if owner) */}
                    {!playlist.isFixed && !isLiked && (
                        <div
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer backdrop-blur-[2px]"
                            onClick={() => setIsEditOpen(true)}
                        >
                            <span className="text-white font-medium text-sm flex items-center gap-2">
                                <Pencil size={16} /> Edit Photo
                            </span>
                        </div>
                    )}
                </div>

                {/* Playlist Info */}
                <div className="flex flex-col gap-3 w-full z-10">
                    <span className="uppercase text-xs font-bold text-white/80 tracking-widest pl-1">
                        {isLiked ? 'Collection' : `Playlist • ${playlist.isPublic ? 'Public' : 'Private'}`}
                    </span>

                    <h1
                        className={cn(
                            "text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter shadow-black drop-shadow-2xl mb-2 line-clamp-2 leading-none",
                            !playlist.isFixed && "cursor-pointer hover:opacity-90 transition-opacity"
                        )}
                        onClick={() => !playlist.isFixed && setIsEditOpen(true)}
                    >
                        {playlist.name}
                    </h1>

                    {playlist.description && (
                        <p className="text-zinc-300 text-sm md:text-base max-w-2xl font-medium pl-1 line-clamp-2">
                            {playlist.description}
                        </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-zinc-300 font-bold mt-2 pl-1">
                        {playlist.isFixed || isLiked ? (
                            <span className="text-brand-primary">TunDuzz</span>
                        ) : (
                            <span className="text-white hover:underline cursor-pointer transition-colors">{playlist.username}</span>
                        )}
                        <span className="w-1 h-1 rounded-full bg-zinc-500" />
                        <span>{playlist.songs?.length || 0} songs</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-500" />
                        {/* Calculate total duration roughly if possible, or just hide for now */}
                        <span className="text-zinc-400 font-normal">
                            {playlist.songs?.length > 0 && "approx. " + Math.ceil(playlist.songs.reduce((acc, s) => acc + s.duration, 0) / 60) + " min"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between px-8 py-6 sticky top-0 z-20 transition-all duration-300">
                <div className="flex items-center gap-6">
                    {playlist.songs?.length > 0 && (
                        <Button
                            size="icon"
                            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 text-black shadow-lg shadow-green-500/20 transition-all duration-300"
                            onClick={() => playSong(playlist.songs[0], playlist.songs)}
                        >
                            <Play fill="currentColor" className="w-7 h-7 ml-1" />
                        </Button>
                    )}

                    <div className="flex items-center gap-2">
                        {!playlist.isFixed && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10">
                                        <MoreHorizontal className="w-6 h-6" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#282828] border-white/10 text-zinc-200">
                                    <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="hover:bg-white/10 cursor-pointer focus:bg-white/10">
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDeletePlaylist} className="text-red-500 focus:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Playlist
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <EditPlaylistDialog
                playlist={playlist}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onUpdate={fetchPlaylist}
            />

            {/* Songs List */}
            <div className="px-8 pb-8">
                {/* Header Row */}
                <div
                    className="grid gap-4 border-b border-white/5 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider sticky top-[80px] z-10 bg-[#121212]/95 backdrop-blur-md mb-2 items-center"
                    style={{ gridTemplateColumns: getGridTemplate() }}
                >
                    <div className="text-center">#</div>
                    <div>Title</div>
                    {showAlbum && <div>Album</div>}
                    {showDateAdded && <div>Date Added</div>}
                    {showDuration && <div className="flex justify-end"><Clock className="w-4 h-4" /></div>}

                    {/* View Options */}
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-zinc-400 hover:text-white p-0 hover:bg-transparent"
                                >
                                    <ListFilter className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border border-white/10 text-zinc-200 p-2 min-w-[180px] rounded-xl shadow-2xl">
                                <div className="px-2 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Show Columns</div>
                                <DropdownMenuItem
                                    className="flex justify-between cursor-pointer hover:bg-white/10 focus:bg-white/10 rounded-lg py-2"
                                    onClick={() => setShowAlbum(!showAlbum)}
                                >
                                    <span className="font-medium">Album</span>
                                    {showAlbum && <Check className="w-4 h-4 text-green-500" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex justify-between cursor-pointer hover:bg-white/10 focus:bg-white/10 rounded-lg py-2"
                                    onClick={() => setShowDateAdded(!showDateAdded)}
                                >
                                    <span className="font-medium">Date Added</span>
                                    {showDateAdded && <Check className="w-4 h-4 text-green-500" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex justify-between cursor-pointer hover:bg-white/10 focus:bg-white/10 rounded-lg py-2"
                                    onClick={() => setShowDuration(!showDuration)}
                                >
                                    <span className="font-medium">Duration</span>
                                    {showDuration && <Check className="w-4 h-4 text-green-500" />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="space-y-0.5">
                    {playlist.songs?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <Music size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-white">Playlist is empty</p>
                                <p className="text-sm">Find some songs to get started!</p>
                            </div>
                            <Button variant="outline" className="mt-4 border-white/10 hover:bg-white/10 hover:text-white" onClick={() => navigate('/app/search')}>
                                Go to Search
                            </Button>
                        </div>
                    ) : (
                        playlist.songs.map((song, index) => {
                            const isCurrentSong = currentSong?.id === song.id;

                            return (
                                <div
                                    key={song.id}
                                    className={cn(
                                        "group grid gap-4 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer items-center text-sm group",
                                        isCurrentSong ? "bg-white/5" : "text-zinc-400"
                                    )}
                                    style={{ gridTemplateColumns: getGridTemplate() }}
                                    onClick={() => playSong(song, playlist.songs)}
                                >
                                    {/* Index / Play Button */}
                                    <div className="flex items-center justify-center w-5 h-5 relative">
                                        {isCurrentSong && isPlaying ? (
                                            <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="w-3.5 h-3.5" alt="playing" />
                                        ) : (
                                            <>
                                                <span className={cn("group-hover:hidden font-mono text-center w-5 block", isCurrentSong ? "text-green-500 font-bold" : "text-zinc-500")}>
                                                    {index + 1}
                                                </span>
                                                <Play className="w-4 h-4 text-white hidden group-hover:block absolute" fill="currentColor" />
                                            </>
                                        )}
                                    </div>

                                    {/* Title & Artist */}
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <img src={song.coverImageUrl} className="w-10 h-10 object-cover rounded shadow shrunk-0" alt="" />
                                        <div className="flex flex-col truncate min-w-0">
                                            <span className={cn("font-medium truncate text-base transition-colors", isCurrentSong ? "text-green-500" : "text-white group-hover:text-white")}>
                                                {song.title}
                                            </span>
                                            <div className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
                                                {(() => {
                                                    const artistList = song.artists && song.artists.length > 0
                                                        ? song.artists
                                                        : (song.artistName || '').split(',').map(name => ({ name: name.trim() }));

                                                    return artistList.map((artist, index) => (
                                                        <span key={index}>
                                                            {artist.id ? (
                                                                <span
                                                                    className="hover:underline hover:text-white cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/app/artist/${artist.id}`);
                                                                    }}
                                                                >
                                                                    {artist.name}
                                                                </span>
                                                            ) : (
                                                                <span>{artist.name}</span>
                                                            )}
                                                            {index < artistList.length - 1 && ", "}
                                                        </span>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Album */}
                                    {showAlbum && (
                                        <div className="truncate text-zinc-400 group-hover:text-zinc-300 transition-colors text-xs font-medium">
                                            {song.albumId && song.albumTitle ? (
                                                <span
                                                    className="hover:underline hover:text-white cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/app/album/${song.albumId}`);
                                                    }}
                                                >
                                                    {song.albumTitle}
                                                </span>
                                            ) : (
                                                <span className="opacity-50">-</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Date Added */}
                                    {showDateAdded && (
                                        <div className="truncate text-zinc-500 group-hover:text-zinc-400 transition-colors text-xs">
                                            {formatDateAdded(song.addedAt)}
                                        </div>
                                    )}

                                    {/* Duration */}
                                    {showDuration && (
                                        <div className="flex justify-end font-mono text-zinc-500 group-hover:text-zinc-400 text-xs">
                                            {formatDuration(song.duration)}
                                        </div>
                                    )}

                                    {/* Actions (3-dot menu) */}
                                    <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#282828] border-white/10 text-zinc-200 z-50">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleLike(song.id);
                                                    }}
                                                    className="hover:bg-white/10 cursor-pointer focus:bg-white/10"
                                                >
                                                    <Heart className={cn("w-4 h-4 mr-2", likedSongIds.has(song.id) ? "fill-green-500 text-green-500" : "")} />
                                                    {likedSongIds.has(song.id) ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSong(song.id);
                                                    }}
                                                    className="text-red-500 focus:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Remove from playlist
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetail;
