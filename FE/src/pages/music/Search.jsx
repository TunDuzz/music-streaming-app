import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchApi, genresApi } from '../../lib/api';
import { Loader2, Play, Pause, MoreHorizontal, Music, Heart } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from '../../components/ui/button';
import { usePlayer } from '../../contexts/PlayerContext';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const navigate = useNavigate();
    const { playSong, currentSong, isPlaying, pauseSong, resumeSong, toggleLike, likedSongIds } = usePlayer();

    const [results, setResults] = useState({ songs: [], artists: [], albums: [], playlists: [] });
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState([]);
    const [loadingGenres, setLoadingGenres] = useState(false);

    // Fetch Genres for Browse View
    useEffect(() => {
        const fetchGenres = async () => {
            setLoadingGenres(true);
            try {
                const data = await genresApi.getAll();
                setGenres(data || []);
            } catch (error) {
                console.error("Failed to fetch genres:", error);
            } finally {
                setLoadingGenres(false);
            }
        };

        fetchGenres();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (!query.trim()) {
                setResults({ songs: [], artists: [], albums: [], playlists: [] });
                return;
            }

            setLoading(true);
            try {
                const data = await searchApi.search(query);
                setResults(data || { songs: [], artists: [], albums: [], playlists: [] });
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    // Handle Top Result Logic
    const getTopResult = () => {
        if (!results.songs?.length && !results.artists?.length) return null;

        const firstArtist = results.artists?.[0];
        const firstSong = results.songs?.[0];

        // If only one exists
        if (!firstArtist) return { type: 'song', data: firstSong };
        if (!firstSong) return { type: 'artist', data: firstArtist };

        // Check relevance (Starts With) - Case Insensitive
        const artistMatch = firstArtist.title?.toLowerCase().startsWith(query.toLowerCase());
        const songMatch = firstSong.title?.toLowerCase().startsWith(query.toLowerCase());

        // If one matches 'starts with' and the other doesn't, prioritize the matching one
        if (songMatch && !artistMatch) {
            return { type: 'song', data: firstSong };
        }
        if (artistMatch && !songMatch) {
            return { type: 'artist', data: firstArtist };
        }

        // Default: prioritize Artist if both match or neither match (Spotify-like behavior)
        return { type: 'artist', data: firstArtist };
    };

    const topResult = getTopResult();
    const topSongs = results.songs?.slice(0, 4); // Take top 4 for the list

    const addToHistory = (song) => {
        try {
            const history = JSON.parse(localStorage.getItem('search_history') || '[]');
            // Remove duplicates (same id)
            const newHistory = [song, ...history.filter(item => item.id !== song.id)].slice(0, 10);
            localStorage.setItem('search_history', JSON.stringify(newHistory));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    };

    const handlePlayClick = (e, song) => {
        e.stopPropagation();
        if (currentSong?.id === song.id) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            // For top result, we can pass topSongs or just the song itself as minimal context
            // Or if it's a song from the results list, we could pass the full results.
            // Let's pass topSongs if available and if this song is in it? 
            // Actually, best to just pass results.songs if it's a song search context.
            const context = results.songs?.length > 0 ? results.songs : [song];
            playSong(song, context);
            addToHistory(song);
        }
    };

    // Wrapper for direct play calls (results list)
    const onPlaySong = (song) => {
        // Use songs list context if available
        const context = results.songs?.length > 0 ? results.songs : [song];
        playSong(song, context);
        addToHistory(song);
    };

    // Colors for genre cards
    const cardColors = [
        'bg-[#E91429]', 'bg-[#D84000]', 'bg-[#8D67AB]', 'bg-[#7358FF]', 'bg-[#1E3264]', 'bg-[#E8115B]', 'bg-[#148A08]', 'bg-[#BC5900]'
    ];

    return (
        <div className="p-6 space-y-10 pb-24 min-h-screen">
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            ) : (!results.songs?.length && !results.artists?.length && query) ? (
                <div className="text-center text-zinc-400 py-20 animate-in fade-in zoom-in duration-500">
                    <p className="text-xl font-semibold mb-2">Không tìm thấy kết quả cho "{query}"</p>
                    <p className="text-sm opacity-70">Vui lòng kiểm tra lại từ khóa hoặc thử từ khóa khác.</p>
                </div>
            ) : !query ? (
                // Browse Categories View (When no query)
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-indigo-500 rounded-full block"></span>
                        Duyệt tìm tất cả
                    </h2>
                    {loadingGenres ? (
                        <div className="flex justify-center"><Loader2 className="animate-spin text-gray-500" /></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {genres.map((genre, index) => (
                                <div
                                    key={genre.id}
                                    className={`${cardColors[index % cardColors.length]} p-6 rounded-2xl h-48 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-lg group`}
                                // onClick={() => navigate(`/genre/${genre.id}`)} 
                                >
                                    <h3 className="text-2xl font-black text-white tracking-wide">{genre.name}</h3>
                                    {/* Decorative elements */}
                                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-black/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute bottom-2 right-2 rotate-[25deg] translate-y-2 translate-x-2 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                                        {/* Abstract shape or icon could go here */}
                                        <Music className="w-16 h-16 text-white/30" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Top Result Section */}
                        {topResult && (
                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Kết quả hàng đầu</h2>
                                <div
                                    className="bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-2xl"
                                    onClick={() => topResult.type === 'song' && onPlaySong(topResult.data)}
                                >
                                    {/* Background glow */}
                                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-[80px] group-hover:bg-indigo-500/30 transition-colors" />

                                    <div className="relative mb-6">
                                        <img
                                            src={topResult.data.coverImageUrl}
                                            alt={topResult.data.title || topResult.data.name}
                                            className={`object-cover shadow-2xl ${topResult.type === 'artist' ? 'w-32 h-32 rounded-full ring-4 ring-black/50' : 'w-32 h-32 rounded-lg'}`}
                                        />
                                        {/* Play Button Overlay */}
                                        <div className={`absolute bottom-0 right-0 translate-y-2 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 shadow-xl ${topResult.type === 'artist' ? 'hidden' : 'block'}`}>
                                            <Button
                                                size="icon"
                                                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-400 text-black border-none shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                                                onClick={(e) => topResult.type === 'song' && handlePlayClick(e, topResult.data)}
                                            >
                                                {currentSong?.id === topResult.data.id && isPlaying ?
                                                    <Pause fill="currentColor" className="w-6 h-6" /> :
                                                    <Play fill="currentColor" className="w-6 h-6 ml-1" />
                                                }
                                            </Button>
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-black text-white mb-2 line-clamp-1 tracking-tight">
                                        {topResult.data.title || topResult.data.name}
                                    </h3>

                                    <div className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                                        {topResult.type === 'artist' ? (
                                            <span className="bg-black/40 px-3 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest text-white/90 border border-white/5">Nghệ sĩ</span>
                                        ) : (
                                            <>
                                                <span className="bg-black/40 px-3 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest text-white/90 border border-white/5">Bài hát</span>
                                                <div className="flex gap-1 items-center">
                                                    <span className="text-zinc-600">•</span>
                                                    {(() => {
                                                        const artistList = topResult.data.artists && topResult.data.artists.length > 0
                                                            ? topResult.data.artists
                                                            : (topResult.data.artistName || '').split(',').map(name => ({ name: name.trim() }));

                                                        return artistList.map((artist, index) => (
                                                            <span key={index}>
                                                                {artist.id ? (
                                                                    <span
                                                                        className="text-zinc-300 hover:text-white hover:underline cursor-pointer transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/app/artist/${artist.id}`);
                                                                        }}
                                                                    >
                                                                        {artist.name}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-zinc-300">{artist.name}</span>
                                                                )}
                                                                {index < artistList.length - 1 && <span className="text-zinc-500">, </span>}
                                                            </span>
                                                        ));
                                                    })()}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Songs List Section */}
                        {topSongs?.length > 0 && (
                            <div className="lg:col-span-3 space-y-4">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Bài hát</h2>
                                <div className="space-y-2">
                                    {topSongs.map((song) => (
                                        <div
                                            key={song.id}
                                            className="group flex items-center justify-between p-2 pl-3 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-200 border border-transparent hover:border-white/5"
                                            onClick={() => onPlaySong(song)}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                                                    <img src={song.coverImageUrl} alt={song.title} className="w-full h-full object-cover" />
                                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] ${currentSong?.id === song.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                                                        {currentSong?.id === song.id && isPlaying ?
                                                            <Pause size={20} className="text-white fill-white" /> :
                                                            <Play size={20} className="text-white fill-white ml-0.5" />
                                                        }
                                                    </div>
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className={`text-base font-semibold truncate ${currentSong?.id === song.id ? 'text-green-500' : 'text-white'}`}>{song.title}</span>
                                                    <div className="text-sm text-zinc-400 truncate cursor-default group-hover:text-zinc-300 transition-colors">
                                                        {(() => {
                                                            const artistList = song.artists && song.artists.length > 0
                                                                ? song.artists
                                                                : (song.artistName || '').split(',').map(name => ({ name: name.trim() }));

                                                            return artistList.map((artist, index) => (
                                                                <span key={index}>
                                                                    {artist.id ? (
                                                                        <span
                                                                            className="hover:text-white transition-colors hover:underline cursor-pointer"
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

                                            <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium pr-2">
                                                <span className="hidden sm:block tabular-nums">{song.duration ? `${Math.floor(song.duration / 60)}:${Math.floor(song.duration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                                                <MoreHorizontal size={18} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-white/10 text-gray-200 z-50 p-1 w-56 rounded-xl shadow-xl">
                                                            <DropdownMenuItem
                                                                onClick={() => toggleLike(song.id)}
                                                                className="hover:bg-white/10 cursor-pointer rounded-lg py-2.5 px-3 focus:bg-white/10"
                                                            >
                                                                <Heart className={`w-4 h-4 mr-3 ${likedSongIds.has(song.id) ? 'fill-green-500 text-green-500' : 'text-zinc-400'}`} />
                                                                {likedSongIds.has(song.id) ? 'Đã thích' : 'Thêm vào thư viện'}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Artists Section */}
                    {results.artists?.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-500 rounded-full block"></span>
                                Nghệ sĩ
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {results.artists.map((artist) => (
                                    <div
                                        key={artist.id}
                                        className="bg-white/5 backdrop-blur-sm border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1 shadow-lg"
                                        onClick={() => navigate(`/app/artist/${artist.id}`)}
                                    >
                                        <div className="relative mb-4 aspect-square">
                                            <img
                                                src={artist.coverImageUrl || 'https://placehold.co/200'}
                                                alt={artist.title}
                                                className="w-full h-full object-cover rounded-full shadow-lg group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300"
                                            />
                                            {/* Play Icon on Artist Hover (optional aesthetic) */}
                                            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                                                <Music className="text-white w-8 h-8 opacity-70" />
                                            </div>
                                        </div>
                                        <h3 className="text-base font-bold text-white truncate text-center group-hover:text-indigo-400 transition-colors">{artist.title}</h3>
                                        <p className="text-sm text-zinc-400 text-center mt-1 font-medium bg-white/5 inline-block px-2 py-0.5 rounded-full mx-auto block w-fit border border-white/5">Nghệ sĩ</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Albums Section */}
                    {results.albums?.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-500 rounded-full block"></span>
                                Album
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {results.albums.map((album) => (
                                    <div
                                        key={album.id}
                                        className="bg-white/5 backdrop-blur-sm border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1 shadow-lg"
                                        onClick={() => navigate(`/app/album/${album.id}`)}
                                    >
                                        <div className="relative mb-4 aspect-square rounded-xl overflow-hidden">
                                            <img
                                                src={album.coverImageUrl || 'https://placehold.co/200'}
                                                alt={album.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{album.title}</h3>
                                        <p className="text-sm text-zinc-400 mt-1 truncate">
                                            {album.artistName}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Playlists Section */}
                    {results.playlists?.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-500 rounded-full block"></span>
                                Playlist
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {results.playlists.map((playlist) => (
                                    <div
                                        key={playlist.id}
                                        className="bg-white/5 backdrop-blur-sm border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1 shadow-lg"
                                        onClick={() => navigate(`/app/playlist/${playlist.id}`)}
                                    >
                                        <div className="relative mb-4 aspect-square rounded-xl overflow-hidden">
                                            {playlist.coverImageUrl ? (
                                                <img
                                                    src={playlist.coverImageUrl}
                                                    alt={playlist.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                                    <Music className="w-1/3 h-1/3 text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{playlist.title}</h3>
                                        <p className="text-sm text-zinc-400 mt-1 truncate">
                                            Của {playlist.owner}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;