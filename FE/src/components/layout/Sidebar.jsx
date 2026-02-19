import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, Disc3, ListMusic, Music } from 'lucide-react';
import { cn } from '../../lib/utils';
import { playlistsApi } from '../../lib/api';
import CreatePlaylistDialog from '../playlist/CreatePlaylistDialog';

const Sidebar = () => {
    const location = useLocation();
    const [playlists, setPlaylists] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Fetch playlists on mount
    useEffect(() => {
        fetchPlaylists();
        const interval = setInterval(fetchPlaylists, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchPlaylists = async () => {
        try {
            const data = await playlistsApi.getMyPlaylists();
            setPlaylists(data || []);
        } catch (error) {
            console.error('Failed to fetch playlists for sidebar:', error);
        }
    };

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label, active }) => (
        <Link to={to} className="block group">
            <div
                className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                    active
                        ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/5 translate-x-1"
                        : "text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1"
                )}
            >
                <div className={cn(
                    "relative transition-colors duration-300",
                    active ? "text-indigo-400" : "text-zinc-400 group-hover:text-white"
                )}>
                    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                    {active && (
                        <span className="absolute -inset-2 bg-indigo-500/20 blur-lg rounded-full" />
                    )}
                </div>
                <span className={cn(
                    "font-medium tracking-wide",
                    active ? "font-bold" : ""
                )}>
                    {label}
                </span>

                {/* Active Indicator */}
                {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
            </div>
        </Link>
    );

    return (
        <div className="w-64 bg-black h-full flex flex-col p-4 gap-8 border-r border-white/5 shadow-2xl z-50">
            {/* Logo Section */}
            <div className="px-2 pt-2 flex items-center gap-3">
                <div className="relative w-10 h-10 group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 blur-sm opacity-60"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-inner border border-white/10 z-10">
                        <Disc3 className="text-white w-6 h-6 animate-spin-slow" />
                    </div>
                </div>
                <div>
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 tracking-tighter">
                        TunDuzz
                    </span>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="space-y-2">
                <NavItem
                    to="/app"
                    icon={Home}
                    label="Home"
                    active={isActive('/app')}
                />
                <NavItem
                    to="/app/search"
                    icon={Search}
                    label="Search"
                    active={isActive('/app/search')}
                />
                <NavItem
                    to="/app/library"
                    icon={Library}
                    label="Your Library"
                    active={isActive('/app/library')}
                />
            </div>

            {/* Library / Playlists Actions */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between px-4 mb-4">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        My Collection
                    </span>
                    <CreatePlaylistDialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <button className="text-zinc-400 hover:text-white transition-colors">
                            <PlusSquare size={20} />
                        </button>
                    </CreatePlaylistDialog>
                </div>

                <div className="space-y-1 mb-4">
                    <Link to="/app/playlist/liked" className="block group">
                        <div className={cn(
                            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                            isActive('/app/playlist/liked')
                                ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/20"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}>
                            <div className="relative">
                                <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Heart size={14} className="text-white fill-white" />
                                </div>
                            </div>
                            <span className="font-medium">Liked Songs</span>
                        </div>
                    </Link>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

                {/* Scrollable Playlist List */}
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                    <div className="space-y-0.5">
                        {playlists.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-zinc-500 cursor-default">
                                <ListMusic size={32} className="mb-2 opacity-50" />
                                <p className="text-sm">No playlists yet</p>
                            </div>
                        ) : (
                            playlists.map(playlist => (
                                <Link
                                    key={playlist.id}
                                    to={`/app/playlist/${playlist.id}`}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                        isActive(`/app/playlist/${playlist.id}`)
                                            ? "bg-white/5 text-white"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1"
                                    )}
                                >
                                    <div className="w-10 h-10 min-w-10 bg-zinc-800 rounded-md flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0 border border-white/5 group-hover:border-white/20 transition-colors">
                                        {playlist.coverImageUrl ? (
                                            <img
                                                src={`${playlist.coverImageUrl}?t=${new Date().getTime()}`}
                                                alt={playlist.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:from-zinc-700 group-hover:to-zinc-800 transition-colors">
                                                <Music size={16} className="text-zinc-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col truncate min-w-0">
                                        <span className={cn("text-sm font-medium truncate transition-colors", isActive(`/app/playlist/${playlist.id}`) ? "text-indigo-300" : "group-hover:text-white")}>
                                            {playlist.name}
                                        </span>
                                        <span className="text-[11px] text-zinc-500 truncate group-hover:text-zinc-400 transition-colors">
                                            {playlist.username}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
