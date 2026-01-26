import { useState, useEffect } from 'react';
import { songsApi } from '../../lib/api';
import SongListItem from '../../components/music/SongListItem';
import { Input } from '../../components/ui/input';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce'; // Need to create this or use simple timeout

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    // Debounce manual implementation for speed
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await songsApi.search(debouncedQuery);
                setResults(data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    return (
        <div className="space-y-6">
            <div className="sticky top-0 bg-black/95 backdrop-blur-md pb-4 z-10 -mx-6 px-6 pt-2">
                <div className="relative max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        placeholder="What do you want to listen to?"
                        className="pl-10 bg-white/10 border-transparent text-white placeholder:text-gray-400 rounded-full h-12 focus-visible:ring-offset-0"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white mb-4">Top Results</h2>
                        <div className="flex flex-col">
                            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 border-b border-white/10 text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                                <span className="w-8 text-center">#</span>
                                <div>Title</div>
                                <div className="hidden md:block">Album</div>
                                <div className="text-right flex items-center gap-2 justify-end w-20">
                                    <span className="mr-2">Time</span>
                                </div>
                            </div>
                            {results.map((song, index) => (
                                <SongListItem key={song.id} song={song} index={index} />
                            ))}
                        </div>
                    </div>
                ) : debouncedQuery ? (
                    <div className="text-center text-gray-400 py-20">
                        <p className="text-lg">No results found for "{debouncedQuery}"</p>
                        <p className="text-sm">Please make sure your words are spelled correctly, or use less or different keywords.</p>
                    </div>
                ) : (
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-white mb-6">Browse All</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {['Pop', 'Hip-Hop', 'Rock', 'Electronic', 'Indie', 'R&B', 'Country', 'Classical'].map((genre) => (
                                <div key={genre} className="aspect-video bg-gradient-to-br from-purple-700 to-blue-600 rounded-lg p-4 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform">
                                    <h3 className="text-2xl font-bold text-white">{genre}</h3>
                                    <div className="absolute -bottom-2 -right-2 rotate-[25deg] shadow-lg">
                                        {/* Placeholder for genre image */}
                                        <div className="w-24 h-24 bg-black/20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
