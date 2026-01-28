import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Home, Search, Library, PlusSquare, Heart, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { playlistsApi } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [creating, setCreating] = useState(false);

    // Fetch playlists on mount
    useEffect(() => {
        fetchPlaylists();
        // Set up an interval or listener if we want real-time updates, 
        // but for now simple fetch on mount is fine. 
        // Since we are creating playlist here, we can update state manually.
        const interval = setInterval(fetchPlaylists, 5000); // Poll every 5s to keep sidebar in sync for now
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

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        setCreating(true);
        try {
            const newPlaylist = await playlistsApi.create({
                name: newPlaylistName,
                description: newDescription,
                isPublic: false
            });
            // Update local state immediately
            setPlaylists(prev => [newPlaylist, ...prev]);
            setNewPlaylistName('');
            setNewDescription('');
            setIsCreateOpen(false);
            navigate(`/app/playlist/${newPlaylist.id}`);
        } catch (error) {
            console.error('Failed to create playlist:', error);
        } finally {
            setCreating(false);
        }
    };

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label, active }) => (
        <Link to={to}>
            <Button
                variant="ghost"
                className={cn(
                    "w-full justify-start gap-4 text-base font-medium h-12 mb-1",
                    active
                        ? "bg-white/10 text-white hover:bg-white/10"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
            >
                <Icon size={24} />
                {label}
            </Button>
        </Link>
    );

    return (
        <div className="w-64 bg-black h-full flex flex-col p-6 gap-6">
            <div className="flex items-center gap-2 px-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M6 12c0-1.7.7-3.2 1.8-4.2"></path>
                        <circle cx="12" cy="12" r="2"></circle>
                        <path d="M18 12c0 1.7-.7 3.2-1.8 4.2"></path>
                    </svg>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">TunDuzz</span>
            </div>

            <div className="space-y-1">
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

            <div className="pt-6 border-t border-white/10 space-y-1">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-4 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 h-12"
                        >
                            <PlusSquare size={24} />
                            Create Playlist
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#282828] text-white border-none">
                        <DialogHeader>
                            <DialogTitle>Create new playlist</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Input
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="Playlist name"
                                    className="bg-[#3E3E3E] border-none text-white focus-visible:ring-1 focus-visible:ring-white"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePlaylist(); }}
                                />
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    className="w-full h-24 rounded-md border border-none bg-[#3E3E3E] px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 resize-none font-sans"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleCreatePlaylist}
                                    disabled={!newPlaylistName.trim() || creating}
                                    className="bg-white text-black hover:bg-gray-200"
                                >
                                    {creating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                    Create
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 h-12"
                >
                    <Heart size={24} className="text-purple-400" />
                    Liked Songs
                </Button>
            </div>

            {/* Scrollable Playlist List */}
            <div className="flex-1 overflow-y-auto -mx-2 px-2">
                <div className="py-2 border-t border-white/10 mt-2">
                    {playlists.length === 0 ? (
                        <p className="text-sm text-gray-500 px-4 py-2">No playlists yet</p>
                    ) : (
                        playlists.map(playlist => (
                            <Link
                                key={playlist.id}
                                to={`/app/playlist/${playlist.id}`}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors group",
                                    isActive(`/app/playlist/${playlist.id}`) && "text-white bg-white/10"
                                )}
                            >
                                <div className="w-12 h-12 min-w-12 bg-[#333] rounded flex items-center justify-center overflow-hidden shadow-sm">
                                    {playlist.coverImageUrl ? (
                                        <img
                                            src={`${playlist.coverImageUrl}?t=${new Date().getTime()}`}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                            <span className="text-xs font-bold text-gray-500">♫</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className={cn("text-sm font-medium truncate", isActive(`/app/playlist/${playlist.id}`) ? "text-white" : "text-gray-300 group-hover:text-white")}>
                                        {playlist.name}
                                    </span>
                                    <span className="text-xs text-gray-500 truncate">
                                        Playlist • {playlist.username}
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
