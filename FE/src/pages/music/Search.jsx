import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchApi, genresApi } from '../../lib/api'; // Use generic searchApi
import { Loader2, Play, Pause, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { usePlayer } from '../../contexts/PlayerContext';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const navigate = useNavigate();
    const { playSong, currentSong, isPlaying, pauseSong, resumeSong } = usePlayer();

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
    // Handle Top Result Logic
    // Priority: 
    // 1. Exact/StartWith Artist Match
    // 2. Exact/StartWith Song Match
    // 3. First Artist name contains
    // 4. First Song title contains
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
            playSong(song);
            addToHistory(song);
        }
    };

    // Wrapper for direct play calls (results list)
    const onPlaySong = (song) => {
        playSong(song);
        addToHistory(song);
    };

    // Colors for genre cards
    const cardColors = [
        'bg-[#E91429]', 'bg-[#D84000]', 'bg-[#8D67AB]', 'bg-[#7358FF]', 'bg-[#1E3264]', 'bg-[#E8115B]', 'bg-[#148A08]', 'bg-[#BC5900]'
    ];

    return (
        <div className="p-6 space-y-8 pb-32">
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            ) : (!results.songs?.length && !results.artists?.length && query) ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-lg">Không tìm thấy kết quả cho "{query}"</p>
                    <p className="text-sm">Vui lòng kiểm tra lại từ khóa.</p>
                </div>
            ) : !query ? (
                // Browse Categories View (When no query)
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Duyệt tìm tất cả</h2>
                    {loadingGenres ? (
                        <div className="flex justify-center"><Loader2 className="animate-spin text-gray-500" /></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sl:grid-cols-5 gap-6">
                            {genres.map((genre, index) => (
                                <div
                                    key={genre.id}
                                    className={`${cardColors[index % cardColors.length]} p-4 rounded-lg h-48 relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
                                // onClick={() => navigate(`/genre/${genre.id}`)} // Disabled for now based on previous requests
                                >
                                    <h3 className="text-2xl font-bold text-white">{genre.name}</h3>
                                    {/* Decorative image/icon placeholder */}
                                    <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-black/20 rounded-full rotate-12 transform translate-y-4 translate-x-4"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Top Result Section */}
                        {topResult && (
                            <div className="lg:col-span-2">
                                <h2 className="text-2xl font-bold text-white mb-4">Kết quả hàng đầu</h2>
                                <div
                                    className="bg-[#181818] p-6 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group relative"
                                    onClick={() => topResult.type === 'song' && onPlaySong(topResult.data)}
                                >
                                    <div className="mb-4">
                                        <img
                                            src={topResult.data.coverImageUrl}
                                            alt={topResult.data.title || topResult.data.name}
                                            className={`object-cover shadow-lg ${topResult.type === 'artist' ? 'w-24 h-24 rounded-full' : 'w-24 h-24 rounded-md'}`}
                                        />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1 line-clamp-1">
                                        {topResult.data.title || topResult.data.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                        {topResult.type === 'artist' ? (
                                            <span className="bg-black/20 px-3 py-1 rounded-full uppercase text-xs tracking-wider">Nghệ sĩ</span>
                                        ) : (
                                            <>
                                                <span className="text-gray-300">Bài hát</span>
                                                <span>•</span>
                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const artistList = topResult.data.artists && topResult.data.artists.length > 0
                                                            ? topResult.data.artists
                                                            : (topResult.data.artistName || '').split(',').map(name => ({ name: name.trim() }));

                                                        return artistList.map((artist, index) => (
                                                            <span key={index}>
                                                                <span className="text-white hover:underline cursor-pointer">{artist.name}</span>
                                                                {index < artistList.length - 1 && <span className="text-white">, </span>}
                                                            </span>
                                                        ));
                                                    })()}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Play Button Overlay */}
                                    <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-xl ${topResult.type === 'artist' ? 'hidden' : 'block'}`}>
                                        <Button
                                            size="icon"
                                            className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-400 text-black border-none shadow-lg"
                                            onClick={(e) => topResult.type === 'song' && handlePlayClick(e, topResult.data)}
                                        >
                                            {currentSong?.id === topResult.data.id && isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Songs List Section */}
                        {topSongs?.length > 0 && (
                            <div className="lg:col-span-3">
                                <h2 className="text-2xl font-bold text-white mb-4">Bài hát</h2>
                                <div className="space-y-1">
                                    {topSongs.map((song) => (
                                        <div
                                            key={song.id}
                                            className="group flex items-center justify-between p-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors"
                                            onClick={() => onPlaySong(song)}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="relative w-10 h-10 flex-shrink-0">
                                                    <img src={song.coverImageUrl} alt={song.title} className="w-full h-full object-cover rounded" />
                                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${currentSong?.id === song.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                        {currentSong?.id === song.id && isPlaying ?
                                                            <Pause size={16} className="text-white fill-white" /> :
                                                            <Play size={16} className="text-white fill-white ml-0.5" />
                                                        }
                                                    </div>
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className={`text-base font-medium truncate ${currentSong?.id === song.id ? 'text-green-500' : 'text-white'}`}>{song.title}</span>
                                                    <div className="text-sm text-gray-400 truncate cursor-default">
                                                        {(() => {
                                                            const artistList = song.artists && song.artists.length > 0
                                                                ? song.artists
                                                                : (song.artistName || '').split(',').map(name => ({ name: name.trim() }));

                                                            return artistList.map((artist, index) => (
                                                                <span key={index}>
                                                                    <span className="hover:text-white transition-colors hover:underline cursor-pointer">{artist.name}</span>
                                                                    {index < artistList.length - 1 && ", "}
                                                                </span>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="hidden sm:block">{song.duration ? `${Math.floor(song.duration / 60)}:${Math.floor(song.duration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-white"><MoreHorizontal size={16} /></Button>
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
                            <h2 className="text-2xl font-bold text-white mb-4">Nghệ sĩ</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {results.artists.map((artist) => (
                                    <div
                                        key={artist.id}
                                        className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all cursor-default group"
                                    // onClick={() => navigate(`/artist/${artist.id}`)}
                                    >
                                        <div className="relative mb-4 aspect-square">
                                            <img
                                                src={artist.coverImageUrl || 'https://placehold.co/200'}
                                                alt={artist.title}
                                                className="w-full h-full object-cover rounded-full shadow-lg group-hover:shadow-xl transition-shadow"
                                            />
                                        </div>
                                        <h3 className="text-base font-bold text-white truncate text-center">{artist.title}</h3>
                                        <p className="text-sm text-gray-400 text-center mt-1">Nghệ sĩ</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Albums Section */}
                    {results.albums?.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-white mb-4">Album</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {results.albums.map((album) => (
                                    <div
                                        key={album.id}
                                        className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all cursor-pointer group"
                                        onClick={() => navigate(`/album/${album.id}`)}
                                    >
                                        <div className="relative mb-4 aspect-square">
                                            <img
                                                src={album.coverImageUrl || 'https://placehold.co/200'}
                                                alt={album.title}
                                                className="w-full h-full object-cover rounded-md shadow-lg group-hover:shadow-xl transition-shadow"
                                            />
                                        </div>
                                        <h3 className="text-base font-bold text-white truncate">{album.title}</h3>
                                        <p className="text-sm text-gray-400 mt-1 truncate">
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
                            <h2 className="text-2xl font-bold text-white mb-4">Playlist</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {results.playlists.map((playlist) => (
                                    <div
                                        key={playlist.id}
                                        className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all cursor-pointer group"
                                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                                    >
                                        <div className="relative mb-4 aspect-square">
                                            <img
                                                src={playlist.coverImageUrl || 'https://placehold.co/200'}
                                                alt={playlist.title}
                                                className="w-full h-full object-cover rounded-md shadow-lg group-hover:shadow-xl transition-shadow"
                                            />
                                        </div>
                                        <h3 className="text-base font-bold text-white truncate">{playlist.title}</h3>
                                        <p className="text-sm text-gray-400 mt-1 truncate">
                                            Của {playlist.owner}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Search;
