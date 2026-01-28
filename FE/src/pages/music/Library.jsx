import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistsApi } from '../../lib/api';
import { Library as LibraryIcon, Plus, Music, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';

const Library = () => {
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [creating, setCreating] = useState(false);

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
            const newPlaylist = await playlistsApi.create({
                name: newPlaylistName,
                description: newDescription,
                isPublic: false
            });
            setPlaylists([newPlaylist, ...playlists]);
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
