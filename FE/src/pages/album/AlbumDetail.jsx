import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { albumsApi, formatDuration } from '../../lib/api';
import { usePlayer } from '../../contexts/PlayerContext';
import { Loader2, Play, Pause, Clock, Disc, MoreHorizontal, Heart, Plus, ListFilter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const AlbumDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playSong, currentSong, isPlaying, pauseSong, resumeSong, toggleLike, likedSongIds } = usePlayer();

    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);

    // Column Visibility State
    const [showPlays, setShowPlays] = useState(true);
    const [showDuration, setShowDuration] = useState(true);

    useEffect(() => {
        fetchAlbum();
    }, [id]);

    const fetchAlbum = async () => {
        try {
            setLoading(true);
            const data = await albumsApi.getById(id);
            setAlbum(data);
        } catch (error) {
            console.error('Failed to fetch album:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format large numbers
    const formatPlayCount = (count) => {
        return new Intl.NumberFormat('vi-VN').format(count || 0);
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!album) {
        return <div className="text-center py-20 text-white">Album not found.</div>;
    }

    // Dynamic grid columns based on visibility
    const getGridTemplate = () => {
        let cols = "16px 4fr"; // Index, Title
        if (showPlays) cols += " 2fr"; // Plays
        if (showDuration) cols += " 100px"; // Duration
        cols += " 40px"; // Actions
        return cols;
    };

    return (
        <div className="bg-gradient-to-b from-[#1E1E1E] to-[#121212] min-h-screen pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end gap-6 p-8 bg-gradient-to-b from-gray-700/50 to-transparent">
                <div className="w-52 h-52 bg-[#282828] shadow-2xl flex items-center justify-center rounded-md overflow-hidden group relative flex-shrink-0">
                    {album.coverImageUrl ? (
                        <img
                            src={`${album.coverImageUrl}?t=${new Date().getTime()}`}
                            alt={album.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Disc className="w-20 h-20 text-gray-500" />
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <span className="uppercase text-xs font-bold text-white tracking-wider">{album.type || 'Album'}</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                        {album.title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium mt-2">
                        {/* Artist Avatar ? */}
                        <span className="text-white hover:underline cursor-pointer font-bold">{album.artistName}</span>
                        <span>•</span>
                        <span>{new Date(album.releaseDate).getFullYear()}</span>
                        <span>•</span>
                        <span>{album.songs?.length || 0} songs</span>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-4 px-8 py-6">
                {album.songs?.length > 0 && (
                    <Button
                        size="icon"
                        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black shadow-lg"
                        onClick={() => playSong(album.songs[0])}
                    >
                        {currentSong?.albumId === album.id && isPlaying ? (
                            <Pause fill="currentColor" className="w-6 h-6" />
                        ) : (
                            <Play fill="currentColor" className="w-6 h-6 ml-1" />
                        )}

                    </Button>
                )}

                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="w-8 h-8" />
                </Button>
            </div>

            {/* Songs List */}
            <div className="px-8">
                {/* Header Row */}
                <div
                    className="group grid gap-4 border-b border-white/10 px-4 py-2 text-sm text-gray-400 mb-4 sticky top-16 bg-[#121212] z-10 items-center"
                    style={{ gridTemplateColumns: getGridTemplate() }}
                >
                    <div className="text-center">#</div>
                    <div>Title</div>
                    {showPlays && <div>Plays</div>}
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
                                    onClick={() => setShowPlays(!showPlays)}
                                >
                                    <span>Plays</span>
                                    {showPlays && <span className="text-green-500">✓</span>}
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
                    {album.songs?.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            No songs in this album yet.
                        </div>
                    ) : (
                        album.songs.map((song, index) => {
                            const isCurrentSong = currentSong?.id === song.id;
                            return (
                                <div
                                    key={song.id}
                                    className="group grid gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center text-sm text-gray-400 hover:text-white"
                                    style={{ gridTemplateColumns: getGridTemplate() }}
                                    onClick={() => playSong(song)}
                                >
                                    <div className="flex items-center justify-center">
                                        {isCurrentSong && isPlaying ? (
                                            <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="w-3.5 h-3.5" alt="playing" />
                                        ) : (
                                            <span className="group-hover:hidden text-center w-4 block">{index + 1}</span>
                                        )}
                                        <Play className={`w-3 h-3 text-white hidden ${(!isCurrentSong || !isPlaying) ? 'group-hover:block' : ''}`} fill="currentColor" />
                                    </div>

                                    <div className="flex items-center gap-3 overflow-hidden">
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

                                    {/* Plays */}
                                    {showPlays && (
                                        <div className="truncate group-hover:text-white transition-colors">
                                            {formatPlayCount(song.playCount || 0)}
                                        </div>
                                    )}

                                    {/* Duration */}
                                    {showDuration && (
                                        <div className="flex justify-end font-mono">
                                            {formatDuration(song.duration)}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                    {/* We could add 'Add to Playlist' here if we import the dialog, but let's stick to Like for now as primary request */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
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

export default AlbumDetail;
