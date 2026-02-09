import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Home, Search, Library, PlusSquare, Heart, Loader2, Music } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { playlistsApi } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import Switch from '../ui/switch';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
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

    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        setCreating(true);
        try {
            // 1. Create Playlist
            const newPlaylist = await playlistsApi.create({
                name: newPlaylistName,
                description: newDescription,
                isPublic: isPublic
            });

            // 2. Upload Image if selected
            let finalPlaylist = newPlaylist;
            if (imageFile) {
                try {
                    await playlistsApi.uploadImage(newPlaylist.id, imageFile);
                    // Fetch updated playlist to get the imageUrl
                    // Or just optimistically update the local object since we know the URL pattern or rely on refetch
                    // Ideally we should re-fetch or the upload response returns the URL. 
                    // Let's assume re-fetch or just delay. 
                    // Actually, let's just update the local state with a trick or fresh fetch.
                    // Simple refresh of list:
                    const updated = await playlistsApi.getById(newPlaylist.id);
                    finalPlaylist = updated || newPlaylist;
                } catch (uploadError) {
                    console.error("Failed to upload image during creation", uploadError);
                }
            }

            // Update local state
            setPlaylists(prev => [finalPlaylist, ...prev]);

            // Reset Form
            setNewPlaylistName('');
            setNewDescription('');
            setIsPublic(false);
            setImageFile(null);
            setPreviewUrl(null);
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
                    <DialogContent className="bg-[#282828] text-white border-none sm:max-w-[525px] p-0 overflow-hidden shadow-2xl">
                        <DialogHeader className="px-6 pt-6 pb-2">
                            <DialogTitle className="text-xl font-bold">Create new playlist</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-6 px-6 py-4">
                            <div className="flex gap-4">
                                {/* Image Upload Area */}
                                <div className="group relative w-[180px] h-[180px] bg-[#333] flex items-center justify-center rounded-md shadow-lg flex-shrink-0 overflow-hidden transition-all hover:bg-[#3a3a3a]">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                                            <Music size={48} strokeWidth={1} />
                                            <span className="text-xs font-medium">Choose photo</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]">
                                        <Music className="w-10 h-10 text-white mb-2" />
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
                                            value={newPlaylistName}
                                            onChange={(e) => setNewPlaylistName(e.target.value)}
                                            placeholder="Playlist name"
                                            className="bg-[#3E3E3E] border-none text-white focus-visible:ring-0 font-bold placeholder:text-gray-400 h-10"
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePlaylist(); }}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <textarea
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            placeholder="Add an optional description"
                                            className="w-full h-full min-h-[120px] resize-none rounded-md bg-[#3E3E3E] border-none px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none scrollbar-thin scrollbar-thumb-white/10 placeholder:font-normal"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium text-gray-300 select-none">Privacy</span>
                                            <span className="text-[10px] text-gray-500">
                                                {isPublic ? 'Anyone can see this playlist' : 'Only you can see this playlist'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isPublic ? 'text-green-500' : 'text-gray-500'}`}>
                                                {isPublic ? 'Public' : 'Private'}
                                            </span>
                                            <Switch
                                                id="create-public"
                                                checked={isPublic}
                                                onCheckedChange={setIsPublic}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end px-6 pb-6 pt-2">
                            <Button
                                onClick={handleCreatePlaylist}
                                disabled={!newPlaylistName.trim() || creating}
                                className="bg-white text-black hover:bg-gray-200 font-bold rounded-full px-8 min-w-[120px] hover:scale-105 transition-transform"
                            >
                                {creating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                Create
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Link to="/app/playlist/liked">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-4 text-base font-medium h-12",
                            isActive('/app/playlist/liked')
                                ? "bg-white/10 text-white hover:bg-white/10"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Heart size={24} className="text-purple-400" />
                        Liked Songs
                    </Button>
                </Link>
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
                                <div className="w-12 h-12 min-w-12 bg-[#333] rounded flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
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
