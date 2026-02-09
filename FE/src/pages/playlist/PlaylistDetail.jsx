import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistsApi } from '../../lib/api';
import { usePlayer } from '../../contexts/PlayerContext';
import { Loader2, Play, Pause, Trash2, Clock, Music, MoreHorizontal, Pencil, ListFilter, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { formatDuration } from '../../lib/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import Switch from "../../components/ui/switch";

const PlaylistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playSong, currentSong, isPlaying, pauseSong, resumeSong, toggleLike, likedSongIds } = usePlayer();

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    // Column Visibility State
    const [showAlbum, setShowAlbum] = useState(true);
    const [showDateAdded, setShowDateAdded] = useState(true);
    const [showDuration, setShowDuration] = useState(true);

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

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPublic, setEditPublic] = useState(false);
    const [editFile, setEditFile] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (playlist) {
            setEditName(playlist.name);
            setEditDesc(playlist.description || '');
            setEditPublic(playlist.isPublic);
            setPreviewUrl(playlist.coverImageUrl);
        }
    }, [playlist, isEditOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdatePlaylist = async () => {
        setUpdating(true);
        try {
            await playlistsApi.update(id, {
                name: editName,
                description: editDesc,
                isPublic: editPublic
            });

            if (editFile) {
                await playlistsApi.uploadImage(id, editFile);
            }

            await fetchPlaylist();
            setIsEditOpen(false);
        } catch (error) {
            console.error('Failed to update playlist:', error);
        } finally {
            setUpdating(false);
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
        let cols = "16px 4fr"; // Index, Title
        if (showAlbum) cols += " 3fr";
        if (showDateAdded) cols += " 2fr";
        if (showDuration) cols += " 100px";
        cols += " 40px"; // Actions
        return cols;
    };

    return (
        <div className="bg-gradient-to-b from-[#1E1E1E] to-[#121212] min-h-screen pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end gap-6 p-8 bg-gradient-to-b from-gray-700/50 to-transparent">
                <div className="w-52 h-52 bg-[#282828] shadow-2xl flex items-center justify-center rounded-md overflow-hidden group relative flex-shrink-0">
                    {id === 'liked' ? (
                        <div className="w-full h-full bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center">
                            <Heart className="w-20 h-20 text-white fill-white" />
                        </div>
                    ) : playlist.coverImageUrl ? (
                        <img
                            src={`${playlist.coverImageUrl}?t=${new Date().getTime()}`}
                            alt={playlist.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Music className="w-20 h-20 text-gray-500" />
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <span className="uppercase text-xs font-bold text-white tracking-wider">Playlist • {playlist.isPublic ? 'Public' : 'Private'}</span>
                    <h1
                        className={cn("text-5xl md:text-7xl font-bold text-white mb-4", !playlist.isFixed && "cursor-pointer hover:underline")}
                        onClick={() => !playlist.isFixed && setIsEditOpen(true)}
                    >
                        {playlist.name}
                    </h1>
                    {playlist.description && (
                        <p className="text-gray-300 text-sm max-w-2xl">{playlist.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium mt-2">
                        <span className="text-white hover:underline cursor-pointer">{playlist.username}</span>
                        <span>•</span>
                        <span>{playlist.songs?.length || 0} songs</span>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-4">
                    {playlist.songs?.length > 0 && (
                        <Button
                            size="icon"
                            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black shadow-lg"
                            onClick={() => playSong(playlist.songs[0])}
                        >
                            <Play fill="currentColor" className="w-6 h-6 ml-1" />
                        </Button>
                    )}

                    {!playlist.isFixed && (
                        <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setIsEditOpen(true)}>
                            <Pencil className="w-6 h-6" />
                        </Button>
                    )}

                    {!playlist.isFixed && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                                    <MoreHorizontal className="w-8 h-8" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#282828] border-none text-gray-200">
                                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="hover:bg-[#3E3E3E] cursor-pointer">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDeletePlaylist} className="text-red-500 focus:text-red-500 hover:bg-[#3E3E3E] cursor-pointer">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Playlist
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-[#282828] text-white border-none sm:max-w-[525px] p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle className="text-xl font-bold">Edit details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 px-6 py-4">
                        <div className="flex gap-4">
                            <div className="group relative w-[180px] h-[180px] bg-[#333] flex items-center justify-center rounded-md overflow-hidden cursor-pointer shadow-lg flex-shrink-0 transition-all hover:bg-[#3a3a3a]">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                                        <Music size={48} strokeWidth={1} />
                                        <span className="text-xs font-medium">Choose photo</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all backdrop-blur-[2px]">
                                    <Pencil className="w-10 h-10 text-white mb-2" />
                                    <span className="text-xs text-white font-medium">Change photo</span>
                                </div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer h-full z-10"
                                    onChange={handleFileChange}
                                    title=""
                                />
                            </div>

                            <div className="flex flex-col gap-3 flex-grow">
                                <div className="space-y-1.5">
                                    <Input
                                        id="name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="bg-[#3E3E3E] border-none text-white focus-visible:ring-0 font-bold placeholder:text-gray-400 h-10"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <textarea
                                        id="desc"
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                        placeholder="Add an optional description"
                                        className="w-full h-full min-h-[100px] rounded-md bg-[#3E3E3E] border-none px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none resize-none font-sans scrollbar-thin scrollbar-thumb-white/10"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-gray-300 select-none">Privacy</span>
                                        <span className="text-[10px] text-gray-500">
                                            {editPublic ? 'Anyone can see this playlist' : 'Only you can see this playlist'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${editPublic ? 'text-green-500' : 'text-gray-500'}`}>
                                            {editPublic ? 'Public' : 'Private'}
                                        </span>
                                        <Switch
                                            id="public"
                                            checked={editPublic}
                                            onCheckedChange={setEditPublic}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="px-6 pb-6 pt-2">
                        <Button
                            className="bg-white text-black hover:bg-gray-200 font-bold rounded-full px-8 min-w-[120px] hover:scale-105 transition-transform"
                            onClick={handleUpdatePlaylist}
                            disabled={updating}
                        >
                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Songs List */}
            <div className="px-8">
                {/* Header Row */}
                <div
                    className="group grid gap-4 border-b border-white/10 px-4 py-2 text-sm text-gray-400 mb-4 sticky top-16 bg-[#121212] z-10 items-center"
                    style={{ gridTemplateColumns: getGridTemplate() }}
                >
                    <div className="text-center">#</div>
                    <div>Title</div>
                    {showAlbum && <div>Album</div>}
                    {showDateAdded && <div>Date Added</div>}
                    {showDuration && <div className="flex justify-end"><Clock className="w-4 h-4" /></div>}

                    {/* View Options Dropdown */}
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-transparent opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                                >
                                    <ListFilter className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#282828] border-none text-gray-200 p-2 min-w-[150px]">
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">View As</div>
                                <DropdownMenuItem
                                    className="flex justify-between cursor-pointer hover:bg-[#3E3E3E]"
                                    onClick={() => setShowAlbum(!showAlbum)}
                                >
                                    <span>Album</span>
                                    {showAlbum && <span className="text-green-500">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex justify-between cursor-pointer hover:bg-[#3E3E3E]"
                                    onClick={() => setShowDateAdded(!showDateAdded)}
                                >
                                    <span>Date Added</span>
                                    {showDateAdded && <span className="text-green-500">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex justify-between cursor-pointer hover:bg-[#3E3E3E]"
                                    onClick={() => setShowDuration(!showDuration)}
                                >
                                    <span>Duration</span>
                                    {showDuration && <span className="text-green-500">✓</span>}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="space-y-1">
                    {playlist.songs?.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            No songs in this playlist.
                            <br />
                            <span className="text-sm">Search for music to add some!</span>
                        </div>
                    ) : (
                        playlist.songs.map((song, index) => {
                            const isCurrentSong = currentSong?.id === song.id;

                            return (
                                <div
                                    key={song.id}
                                    className="group grid gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center text-sm text-gray-400 hover:text-white"
                                    style={{ gridTemplateColumns: getGridTemplate() }}
                                    onClick={() => playSong(song)}
                                >
                                    {/* Index / Play Button */}
                                    <div className="flex items-center justify-center">
                                        {isCurrentSong && isPlaying ? (
                                            <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="w-3.5 h-3.5" alt="playing" />
                                        ) : (
                                            <span className="group-hover:hidden text-center w-4 block">{index + 1}</span>
                                        )}
                                        <Play className={`w-3 h-3 text-white hidden ${(!isCurrentSong || !isPlaying) ? 'group-hover:block' : ''}`} fill="currentColor" />
                                    </div>

                                    {/* Title & Artist */}
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <img src={song.coverImageUrl} className="w-10 h-10 object-cover rounded shadow shrunk-0" alt="" />
                                        <div className="flex flex-col truncate">
                                            <span className={`font-medium truncate text-base ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>{song.title}</span>
                                            <div className="text-xs group-hover:text-white transition-colors truncate">
                                                {(() => {
                                                    const artistList = song.artists && song.artists.length > 0
                                                        ? song.artists
                                                        : (song.artistName || '').split(',').map(name => ({ name: name.trim() }));

                                                    return artistList.map((artist, index) => (
                                                        <span key={index}>
                                                            {artist.id ? (
                                                                <span
                                                                    className="hover:underline cursor-pointer"
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
                                        <div className="truncate group-hover:text-white transition-colors">
                                            {song.albumId && song.albumTitle ? (
                                                <span
                                                    className="hover:underline cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/app/album/${song.albumId}`);
                                                    }}
                                                >
                                                    {song.albumTitle}
                                                </span>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Date Added */}
                                    {showDateAdded && (
                                        <div className="truncate group-hover:text-white transition-colors">
                                            {formatDateAdded(song.addedAt)}
                                        </div>
                                    )}

                                    {/* Duration */}
                                    {showDuration && (
                                        <div className="flex justify-end font-mono">
                                            {formatDuration(song.duration)}
                                        </div>
                                    )}

                                    {/* Actions (3-dot menu) */}
                                    <div className="flex justify-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-transparent opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#282828] border-none text-gray-200 z-50">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleLike(song.id);
                                                    }}
                                                    className="hover:bg-[#3E3E3E] cursor-pointer"
                                                >
                                                    <Heart className={`w-4 h-4 mr-2 ${likedSongIds.has(song.id) ? 'fill-green-500 text-green-500' : ''}`} />
                                                    {likedSongIds.has(song.id) ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSong(song.id);
                                                    }}
                                                    className="text-red-500 focus:text-red-500 hover:bg-[#3E3E3E] cursor-pointer"
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

