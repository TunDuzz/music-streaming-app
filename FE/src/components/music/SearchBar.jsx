import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X, History } from 'lucide-react';
import { Input } from '../ui/input';
import { searchApi } from '../../lib/api';
import { usePlayer } from '../../contexts/PlayerContext';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { playSong } = usePlayer();

    // Load History logic
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('search_history');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error(e);
        }

        // Listen for storage events (if multiple tabs or dynamic updates needed)
        const handleStorageChange = () => {
            const saved = localStorage.getItem('search_history');
            if (saved) setHistory(JSON.parse(saved));
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates
        window.addEventListener('search_history_updated', handleStorageChange); // We might need to dispatch this

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('search_history_updated', handleStorageChange);
        }
    }, [showDropdown]); // Reload when opening dropdown

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            navigate(`/app/search?q=${encodeURIComponent(query)}`);
            setShowDropdown(false);
        }
        if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    const handleHistoryClick = (song) => {
        setShowDropdown(false);
        playSong(song);
    };

    const handleRemoveHistory = (e, songId) => {
        e.stopPropagation();
        const newHistory = history.filter(h => h.id !== songId);
        setHistory(newHistory);
        localStorage.setItem('search_history', JSON.stringify(newHistory));
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors" size={20} />
                <Input
                    placeholder="Bạn muốn phát nội dung gì?"
                    className="pl-10 pr-12 bg-[#2A2A2A] border-transparent text-white placeholder:text-gray-400 rounded-full h-12 hover:bg-[#2A2A2A]/80 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:bg-[#2A2A2A] transition-all w-full"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-l border-gray-600 pl-2">
                    <button
                        className="text-gray-400 hover:text-white"
                        title="Browse"
                        onClick={() => navigate('/app/search')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M10 10l2 2 2-2" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Dropdown Results - HISTORY ONLY */}
            {showDropdown && history.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 max-h-[500px] overflow-y-auto">
                    <div className="p-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase px-3 py-2">Lịch sử tìm kiếm</h3>
                        {history.map(song => (
                            <div
                                key={song.id}
                                className="flex items-center justify-between p-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors group"
                                onClick={() => handleHistoryClick(song)}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <History size={16} className="text-gray-500 flex-shrink-0" />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium text-white truncate">{song.title}</span>
                                        <span className="text-xs text-gray-400 truncate">{song.artistName}</span>
                                    </div>
                                </div>
                                <button
                                    className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => handleRemoveHistory(e, song.id)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
