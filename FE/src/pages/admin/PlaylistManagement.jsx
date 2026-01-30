import { useState, useEffect } from 'react';
import { playlistsApi, songsApi } from '../../lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import Switch from '../../components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Search, Trash2, ListMusic, Lock, Globe, Plus, Pencil, Loader2, Image as ImageIcon } from 'lucide-react';

const PlaylistManagement = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Song Management State
    const [isSongDialogOpen, setIsSongDialogOpen] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [availableSongs, setAvailableSongs] = useState([]);
    const [songSearchTerm, setSongSearchTerm] = useState('');
    const [loadingSongs, setLoadingSongs] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    // Image Upload State
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await playlistsApi.getAll();
            setPlaylists(data || []);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (playlist = null) => {
        setSubmitting(false);
        setImageFile(null);

        if (playlist) {
            setEditingPlaylist(playlist);
            setName(playlist.name);
            setDescription(playlist.description || '');
            setIsPublic(playlist.isPublic);
            setPreviewUrl(playlist.coverImageUrl);
        } else {
            setEditingPlaylist(null);
            setName('');
            setDescription('');
            setIsPublic(false);
            setPreviewUrl(null);
        }
        setIsDialogOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Playlist name is required");
            return;
        }

        setSubmitting(true);
        try {
            let result;
            if (editingPlaylist) {
                // UPDATE
                result = await playlistsApi.update(editingPlaylist.id, {
                    name,
                    description,
                    isPublic
                });

                // Upload image if changed
                if (imageFile && result) {
                    await playlistsApi.uploadImage(result.id, imageFile);
                    // Fetch fresh data to get new image URL
                    result = await playlistsApi.getById(result.id);
                }

                setPlaylists(playlists.map(p => p.id === editingPlaylist.id ? (result || p) : p));
            } else {
                // CREATE
                result = await playlistsApi.create({
                    name,
                    description,
                    isPublic
                });

                // Upload image if selected
                if (imageFile && result) {
                    await playlistsApi.uploadImage(result.id, imageFile);
                    // Fetch fresh data to get new image URL
                    const updated = await playlistsApi.getById(result.id);
                    if (updated) result = updated;
                }

                setPlaylists([result, ...playlists]);
            }
            setIsDialogOpen(false);
            fetchData(); // Refresh list to ensure consistency
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Failed to save playlist: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenSongManagement = async (playlist) => {
        setSelectedPlaylist(playlist);
        setIsSongDialogOpen(true);
        setLoadingSongs(true);
        setSongSearchTerm('');
        try {
            // 1. Get fresh playlist details (including songs)
            const playlistDetails = await playlistsApi.getById(playlist.id);
            if (playlistDetails) {
                setPlaylistSongs(playlistDetails.songs || []);
            }

            // 2. Get all available songs (for selection)
            // Optimization: In a real app, we might use a search API instead of fetching all
            const allSongs = await songsApi.getAll();
            setAvailableSongs(allSongs || []);

        } catch (error) {
            console.error("Failed to load song data", error);
            alert("Failed to load song data");
        } finally {
            setLoadingSongs(false);
        }
    };

    const handleAddSong = async (song) => {
        if (!selectedPlaylist) return;
        try {
            await playlistsApi.addSong(selectedPlaylist.id, song.id);
            // Update local state
            setPlaylistSongs([...playlistSongs, song]);
        } catch (error) {
            console.error(error);
            alert("Failed to add song");
        }
    };

    const handleRemoveSong = async (songId) => {
        if (!selectedPlaylist) return;
        try {
            await playlistsApi.removeSong(selectedPlaylist.id, songId);
            // Update local state
            setPlaylistSongs(playlistSongs.filter(s => s.id !== songId));
        } catch (error) {
            console.error(error);
            alert("Failed to remove song");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
            try {
                await playlistsApi.delete(id);
                setPlaylists(playlists.filter(p => p.id !== id));
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Failed to delete playlist');
            }
        }
    };

    const filteredPlaylists = playlists.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Playlists</h2>
                <div className="flex gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                            placeholder="Search playlists..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-black/40 border-white/10 text-white"
                        />
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-white">
                        <Plus size={18} className="mr-2" />
                        Create
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400 w-[80px]">Cover</TableHead>
                            <TableHead className="text-gray-400">Name</TableHead>
                            <TableHead className="text-gray-400">Owner</TableHead>
                            <TableHead className="text-gray-400">Visibility</TableHead>
                            <TableHead className="text-gray-400">Created</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-gray-400">Loading playlists...</TableCell>
                            </TableRow>
                        ) : filteredPlaylists.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-gray-400">No playlists found</TableCell>
                            </TableRow>
                        ) : (
                            filteredPlaylists.map(playlist => (
                                <TableRow key={playlist.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell>
                                        <div className="w-10 h-10 rounded bg-white/10 overflow-hidden flex items-center justify-center">
                                            {playlist.coverImageUrl ? (
                                                <img src={playlist.coverImageUrl} alt={playlist.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ListMusic className="text-gray-500 w-5 h-5" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{playlist.name}</span>
                                            {playlist.description && (
                                                <span className="text-xs text-gray-500 truncate max-w-[200px]">{playlist.description}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-400">
                                        {playlist.username || <span className="italic text-gray-600">Unknown</span>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {playlist.isPublic ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500">
                                                    <Globe size={12} className="mr-1" /> Public
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-500/10 text-gray-400">
                                                    <Lock size={12} className="mr-1" /> Private
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-sm">
                                        {playlist.createdOn ? new Date(playlist.createdOn).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-green-400 text-gray-400"
                                                title="Manage Songs"
                                                onClick={() => handleOpenSongManagement(playlist)}
                                            >
                                                <ListMusic size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-blue-400 text-gray-400"
                                                title="Edit Details"
                                                onClick={() => handleOpenDialog(playlist)}
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-red-400 text-gray-400"
                                                title="Delete Playlist"
                                                onClick={() => handleDelete(playlist.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Song Management Dialog */}
            <Dialog open={isSongDialogOpen} onOpenChange={setIsSongDialogOpen}>
                <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Manage Songs: {selectedPlaylist?.name}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Add or remove songs from this playlist.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 pt-4">
                        {/* LEFT: Current Songs */}
                        <div className="flex flex-col bg-white/5 rounded-md border border-white/10 overflow-hidden">
                            <div className="p-3 border-b border-white/10 bg-white/5 font-medium flex justify-between items-center">
                                <span>Current Songs ({playlistSongs.length})</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {loadingSongs ? (
                                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
                                ) : playlistSongs.length === 0 ? (
                                    <div className="text-center text-gray-500 p-4 text-sm">Playlist is empty</div>
                                ) : (
                                    playlistSongs.map(song => (
                                        <div key={song.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 bg-gray-800 rounded flex-shrink-0">
                                                    {song.coverImageUrl && <img src={song.coverImageUrl} className="w-full h-full object-cover rounded" />}
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span className="text-sm font-medium truncate">{song.title}</span>
                                                    <span className="text-xs text-gray-400 truncate">{song.artistName}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemoveSong(song.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Available Songs */}
                        <div className="flex flex-col bg-white/5 rounded-md border border-white/10 overflow-hidden">
                            <div className="p-2 border-b border-white/10 bg-white/5 gap-2 flex flex-col">
                                <span className="font-medium px-1">Add Songs</span>
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                    <Input
                                        className="h-8 pl-8 bg-black/20 border-white/10 text-xs"
                                        placeholder="Search available songs..."
                                        value={songSearchTerm}
                                        onChange={e => setSongSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {availableSongs
                                    .filter(s => !playlistSongs.some(ps => ps.id === s.id)) // Exclude already added
                                    .filter(s => s.title.toLowerCase().includes(songSearchTerm.toLowerCase()) || s.artistName?.toLowerCase().includes(songSearchTerm.toLowerCase()))
                                    .map(song => (
                                        <div key={song.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 bg-gray-800 rounded flex-shrink-0">
                                                    {song.coverImageUrl && <img src={song.coverImageUrl} className="w-full h-full object-cover rounded" />}
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span className="text-sm font-medium truncate">{song.title}</span>
                                                    <span className="text-xs text-gray-400 truncate">{song.artistName}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-green-500"
                                                onClick={() => handleAddSong(song)}
                                            >
                                                <Plus size={16} />
                                            </Button>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsSongDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {editingPlaylist ? 'Make changes to your playlist details here.' : 'Add details for your new playlist.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="flex justify-center mb-4">
                            <div className="relative group w-32 h-32 bg-white/5 rounded-md overflow-hidden border border-white/10 flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-500" />
                                )}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-xs font-medium text-white">Change Image</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-gray-300">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="My Awesome Playlist"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-gray-300">Description</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                placeholder="Add an optional description"
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex flex-col gap-0.5">
                                <Label htmlFor="public" className="text-base font-medium text-gray-300">Privacy</Label>
                                <span className="text-[10px] text-gray-500">
                                    {isPublic ? 'Visible to everyone' : 'Only you can see this'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold uppercase tracking-wider ${isPublic ? 'text-green-500' : 'text-gray-500'}`}>
                                    {isPublic ? 'Public' : 'Private'}
                                </span>
                                <Switch
                                    id="public"
                                    checked={isPublic}
                                    onCheckedChange={setIsPublic}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingPlaylist ? 'Save Changes' : 'Create Playlist'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlaylistManagement;
