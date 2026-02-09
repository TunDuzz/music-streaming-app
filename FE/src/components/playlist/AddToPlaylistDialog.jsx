import { useState, useEffect } from 'react';
import { playlistsApi } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Plus, Check, Loader2, Music } from 'lucide-react';
import { Input } from '../../components/ui/input';

const AddToPlaylistDialog = ({ song, children, isOpen, onOpenChange }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [addedMap, setAddedMap] = useState({}); // Track which playlists contain this song locally

    useEffect(() => {
        if (isOpen) {
            fetchPlaylists();
        }
    }, [isOpen]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const data = await playlistsApi.getMyPlaylists();
            setPlaylists(data || []);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
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
                isPublic: false
            });
            // The new playlist won't have the song yet, but we'll add it immediately
            const playlistWithSongs = { ...newPlaylist, songIds: [] };

            setPlaylists([playlistWithSongs, ...playlists]);
            setNewPlaylistName('');

            // Automatically add song to new playlist
            if (song) {
                await addToPlaylist(newPlaylist.id);
            }
        } catch (error) {
            console.error('Failed to create playlist:', error);
        } finally {
            setCreating(false);
        }
    };

    const addToPlaylist = async (playlistId) => {
        try {
            await playlistsApi.addSong(playlistId, song.id);
            // Update local added map for immediate feedback
            setAddedMap(prev => ({ ...prev, [playlistId]: true }));

            // Also update the playlists state to reflect the change if we re-open without fetching
            setPlaylists(prev => prev.map(p => {
                if (p.id === playlistId) {
                    const currentSongIds = p.songIds || [];
                    if (!currentSongIds.includes(song.id)) {
                        return { ...p, songIds: [...currentSongIds, song.id] };
                    }
                }
                return p;
            }));

        } catch (error) {
            console.error('Failed to add song:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] bg-[#282828] text-white border-none">
                <DialogHeader>
                    <DialogTitle>Add to Playlist</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Create New Playlist Input */}
                    <div className="flex gap-2">
                        <Input
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Create new playlist..."
                            className="bg-[#3E3E3E] border-none text-white focus-visible:ring-1 focus-visible:ring-white"
                        />
                        <Button
                            onClick={handleCreatePlaylist}
                            disabled={!newPlaylistName.trim() || creating}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : playlists.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">
                                No playlists found.
                            </div>
                        ) : (
                            playlists.map((playlist) => {
                                // Check if song is in playlist via API data (songIds) or local action (addedMap)
                                const isAdded = addedMap[playlist.id] || (playlist.songIds && playlist.songIds.includes(song?.id));

                                return (
                                    <div
                                        key={playlist.id}
                                        className={`flex items-center justify-between p-3 rounded-md group transition-colors ${isAdded ? 'opacity-70 cursor-default' : 'hover:bg-[#3E3E3E] cursor-pointer'}`}
                                        onClick={() => !isAdded && addToPlaylist(playlist.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#181818] flex items-center justify-center rounded overflow-hidden flex-shrink-0">
                                                {playlist.coverImageUrl ? (
                                                    <img src={playlist.coverImageUrl} alt={playlist.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Music className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium truncate max-w-[200px]">{playlist.name}</p>
                                                <p className="text-xs text-gray-400">{playlist.songIds?.length || 0} songs</p>
                                            </div>
                                        </div>
                                        {isAdded && (
                                            <Check className="w-5 h-5 text-green-500" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddToPlaylistDialog;
