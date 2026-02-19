import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { albumsApi, formatDuration } from '../../lib/api';
import { usePlayer } from '../../contexts/PlayerContext';
import { Loader2, Play, Pause, Clock, Disc, MoreHorizontal, Heart, Plus, ListFilter, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
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
        return new Intl.NumberFormat('en-US').format(count || 0);
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!album) {
        return <div className="text-center py-20 text-white">Album not found.</div>;
    }

    // Dynamic grid columns based on visibility
    const getGridTemplate = () => {
        let cols = "16px 6fr"; // Index, Title
        if (showPlays) cols += " 3fr"; // Plays
        if (showDuration) cols += " 100px"; // Duration
        cols += " 48px"; // Actions
        return cols;
    };

    const totalDuration = album.songs?.reduce((acc, s) => acc + s.duration, 0) || 0;
    const releaseYear = new Date(album.releaseDate).getFullYear();

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black pb-24">
            {/* Header / Hero Section */}
            <div className="relative flex flex-col md:flex-row items-end gap-8 p-8 pb-8 bg-gradient-to-b from-white/5 to-black/20 backdrop-blur-sm border-b border-white/5">
                {/* Album Cover */}
                <div className="w-52 h-52 md:w-60 md:h-60 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden flex-shrink-0 group relative border border-white/10 bg-[#282828]">
                    {album.coverImageUrl ? (
                        <img
                            src={`${album.coverImageUrl}?t=${new Date().getTime()}`}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                            <Disc className="w-24 h-24 text-zinc-600" />
                        </div>
                    )}
                </div>

                {/* Album Info */}
                <div className="flex flex-col gap-3 w-full z-10">
                    <span className="uppercase text-xs font-bold text-white/80 tracking-widest pl-1">
                        {album.type || 'Album'}
                    </span>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter shadow-black drop-shadow-2xl mb-2 line-clamp-2 leading-none">
                        {album.title}
                    </h1>

                    <div className="flex items-center gap-2 text-sm text-zinc-300 font-bold mt-2 pl-1">
                        <div className="flex items-center gap-2">
                            {/* Artist Image can be added here if available in album data, usually it's just name */}
                            <span
                                className="text-white hover:underline cursor-pointer transition-colors"
                                onClick={() => navigate(`/app/artist/${album.artistId}`)} // Assuming album has artistId
                            >
                                {album.artistName}
                            </span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-zinc-500" />
                        <span>{releaseYear}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-500" />
                        <span>{album.songs?.length || 0} songs</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-500" />
                        <span className="text-zinc-400 font-normal">
                            approx. {Math.ceil(totalDuration / 60)} min
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between px-8 py-6 sticky top-0 z-20 transition-all duration-300">
                <div className="flex items-center gap-6">
                    {album.songs?.length > 0 && (
                        <Button
                            size="icon"
                            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 text-black shadow-lg shadow-green-500/20 transition-all duration-300"
                            onClick={() => playSong(album.songs[0], album.songs)}
                        >
                            {currentSong?.albumId === album.id && isPlaying ? (
                                <Pause fill="currentColor" className="w-7 h-7 ml-1" />
                            ) : (
                                <Play fill="currentColor" className="w-7 h-7 ml-1" />
                            )}
                        </Button>
                    )}

                    <div className="flex items-center gap-2">
                        {/* More Actions */}
                        <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10">
                            <Heart className="w-6 h-6" /> {/* Placeholder for 'Save Album' logic */}
                        </Button>
                        <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10">
                            <MoreHorizontal className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Songs List */}
            <div className="px-8 pb-8">
                {/* Header Row */}
                <div
                    className="grid gap-4 border-b border-white/5 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider sticky top-[80px] z-10 bg-[#121212]/95 backdrop-blur-md mb-2 items-center"
                    style={{ gridTemplateColumns: getGridTemplate() }}
                >
                    <div className="text-center">#</div>
                    <div>Title</div>
                    {showPlays && <div>Plays</div>}
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
                                    onClick={() => setShowPlays(!showPlays)}
                                >
                                    <span className="font-medium">Plays</span>
                                    {showPlays && <Check className="w-4 h-4 text-green-500" />}
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
                    {album.songs?.length === 0 ? (
                        <div className="text-center text-zinc-500 py-20">
                            <Disc className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No songs available in this album.</p>
                        </div>
                    ) : (
                        album.songs.map((song, index) => {
                            const isCurrentSong = currentSong?.id === song.id;

                            return (
                                <div
                                    key={song.id}
                                    className={cn(
                                        "group grid gap-4 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer items-center text-sm group",
                                        isCurrentSong ? "bg-white/5" : "text-zinc-400"
                                    )}
                                    style={{ gridTemplateColumns: getGridTemplate() }}
                                    onClick={() => playSong(song, album.songs)} // Pass album context
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

                                    {/* Plays */}
                                    {showPlays && (
                                        <div className="truncate text-zinc-500 group-hover:text-zinc-400 transition-colors text-xs font-mono">
                                            {formatPlayCount(song.playCount)}
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
                                                    // Add to Playlist click handler here if needed
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:bg-white/10 cursor-pointer focus:bg-white/10"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add to Playlist
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Copyright / Footer Info */}
                <div className="mt-8 pt-8 border-t border-white/5 text-xs text-zinc-500 pl-4">
                    <p> {releaseYear} {album.artistName}</p>
                    <p> {releaseYear} {album.title}. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default AlbumDetail;
