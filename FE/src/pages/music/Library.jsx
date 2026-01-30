import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistsApi } from '../../lib/api';
import { Library as LibraryIcon, Plus, Music, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import Switch from '../../components/ui/switch';

const Library = () => {
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [creating, setCreating] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const data = await playlistsApi.getMyPlaylists();
            setPlaylists(data || []);
        } catch (error) {
            console.error('Failed to fetch library:', error);
        } finally {
            setLoading(false);
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
                    const updated = await playlistsApi.getById(newPlaylist.id);
                    finalPlaylist = updated || newPlaylist;
                } catch (uploadError) {
                    console.error("Failed to upload image during creation", uploadError);
                }
            }

            setPlaylists([finalPlaylist, ...playlists]);

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

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-8 pb-32">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Your Library</h1>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full bg-white text-black hover:scale-105 transition-transform">
                            <Plus className="mr-2 h-4 w-4" /> Create Playlist
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
                                            className="w-full h-full min-h-[100px] resize-none rounded-md bg-[#3E3E3E] border-none px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none scrollbar-thin scrollbar-thumb-white/10 placeholder:font-normal"
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
                                                id="library-public"
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
            </div>

            {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
                    <div className="bg-white/10 p-6 rounded-full">
                        <LibraryIcon size={64} className="text-white" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Your Library is empty</h2>
                        <p className="text-gray-400">Create your first playlist now!</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sl:grid-cols-5 gap-6">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group"
                            onClick={() => navigate(`/app/playlist/${playlist.id}`)}
                        >
                            <div className="relative aspect-square mb-4 bg-[#333] rounded-md flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-2xl transition-all">
                                {playlist.coverImageUrl ? (
                                    <img
                                        src={`${playlist.coverImageUrl}?t=${new Date().getTime()}`}
                                        alt={playlist.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Music className="w-12 h-12 text-gray-500" />
                                )}
                            </div>
                            <h3 className="text-base font-bold text-white truncate">{playlist.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {playlist.username}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Library;
