import { useState, useEffect } from 'react';
import { albumsApi, artistsApi } from '../../lib/api';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Search, Trash2, Plus, Pencil, Loader2, Image as ImageIcon, Disc, Music } from 'lucide-react';


const AlbumManagement = () => {
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All'); // All, Album, Single

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [artistId, setArtistId] = useState('');
    const [type, setType] = useState('Album'); // Enum: Album=0, Single=1. Using string for UI logic, convert to enum int for API
    const [releaseDate, setReleaseDate] = useState('');
    const [description, setDescription] = useState('');

    // Image Upload State
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchData();
        fetchArtists();
    }, []);

    const fetchData = async () => {
        try {
            const data = await albumsApi.getAll();
            setAlbums(data || []);
        } catch (error) {
            console.error('Error fetching albums:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchArtists = async () => {
        try {
            const data = await artistsApi.getAll();
            setArtists(data || []);
        } catch (error) {
            console.error('Error fetching artists:', error);
        }
    };

    const handleOpenDialog = (album = null) => {
        setSubmitting(false);
        setImageFile(null);

        if (album) {
            setEditingAlbum(album);
            setTitle(album.title);
            setArtistId(album.artistId);
            // Parse Type: Backend likely returns string "Album" or "Single", or Int. Dto said string.
            setType(album.type || 'Album');
            setReleaseDate(album.releaseDate ? album.releaseDate.split('T')[0] : '');
            setDescription(album.description || '');
            setPreviewUrl(album.coverImageUrl);
        } else {
            setEditingAlbum(null);
            setTitle('');
            setArtistId('');
            setType('Album');
            setReleaseDate(new Date().toISOString().split('T')[0]);
            setDescription('');
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
        if (!title.trim() || !artistId || !releaseDate) {
            alert("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            // Enum mapping: Album -> 0, Single -> 1  (Backwards: The API expects the enum VALUE? No, I configured DTO to accept string? No, CREATE DTO expects AlbumType ENUM (int/string handling depends on JSON deserializer).
            // Usually JSON accepts string "Album" or "Single" if using JsonStringEnumConverter. 
            // BUT, my CreateAlbumDto has `public AlbumType Type { get; set; }`. Default .NET JSON requires Number unless configured.
            // Let's assume standard behavior: Send INTEGER.
            // Album = 0, Single = 1.
            const typeValue = type === 'Single' ? 1 : 0;

            let result;
            if (editingAlbum) {
                // UPDATE
                result = await albumsApi.update(editingAlbum.id, {
                    title,
                    artistId: artistId, // Helper needed? No, standard update
                    type: typeValue,
                    releaseDate: new Date(releaseDate).toISOString(),
                    coverImageUrl: editingAlbum.coverImageUrl // Keep existing if not changed, processed separately
                });

                // Upload image if changed
                if (imageFile && result) {
                    await albumsApi.uploadImage(result.id, imageFile);
                    // Fetch fresh
                    result = await albumsApi.getById(result.id);
                }

                setAlbums(albums.map(a => a.id === editingAlbum.id ? (result || a) : a));

            } else {
                // CREATE
                result = await albumsApi.create({
                    title,
                    artistId,
                    type: typeValue,
                    releaseDate: new Date(releaseDate).toISOString(),
                    description
                });

                // Upload image if selected
                if (imageFile && result) {
                    await albumsApi.uploadImage(result.id, imageFile);
                    // Fetch fresh
                    const updated = await albumsApi.getById(result.id);
                    if (updated) result = updated;
                }

                setAlbums([result, ...albums]);
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Failed to save album: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this album? This will also remove tracks from library view (but keep files).')) {
            try {
                await albumsApi.delete(id);
                setAlbums(albums.filter(a => a.id !== id));
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Failed to delete album');
            }
        }
    };

    const filteredAlbums = albums.filter(a => {
        const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.artistName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || a.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Albums & Singles</h2>
                    <div className="flex gap-2 mt-2">
                        {['All', 'Album', 'Single'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filterType === t
                                    ? 'bg-white text-black'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                {t}s
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                            placeholder="Search albums..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-black/40 border-white/10 text-white"
                        />
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-white">
                        <Plus size={18} className="mr-2" />
                        Add Album
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400 w-[60px]">Cover</TableHead>
                            <TableHead className="text-gray-400">Title</TableHead>
                            <TableHead className="text-gray-400">Artist</TableHead>
                            <TableHead className="text-gray-400">Type</TableHead>
                            <TableHead className="text-gray-400">Release Date</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-gray-400">Loading...</TableCell>
                            </TableRow>
                        ) : filteredAlbums.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-gray-400">No albums found</TableCell>
                            </TableRow>
                        ) : (
                            filteredAlbums.map(album => (
                                <TableRow key={album.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell>
                                        <div className="w-10 h-10 rounded bg-white/10 overflow-hidden flex items-center justify-center">
                                            {album.coverImageUrl ? (
                                                <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Disc className="text-gray-500 w-5 h-5" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">{album.title}</TableCell>
                                    <TableCell className="text-gray-400">{album.artistName}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${album.type === 'Single'
                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            }`}>
                                            {album.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-sm">
                                        {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-blue-400 text-gray-400"
                                                onClick={() => handleOpenDialog(album)}
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-red-400 text-gray-400"
                                                onClick={() => handleDelete(album.id)}
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingAlbum ? 'Edit Album' : 'Add New Album'}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {editingAlbum ? 'Update album details.' : 'Create a new album or single.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        {/* Image Upload */}
                        <div className="flex justify-center mb-2">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-gray-300">Title</Label>
                                <Input
                                    value={title} onChange={e => setTitle(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white"
                                    placeholder="Album Title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-300">Type</Label>
                                <div className="flex bg-white/5 rounded-md p-1 border border-white/10">
                                    {['Album', 'Single'].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={`flex-1 text-sm py-1.5 rounded transition-all ${type === t
                                                ? 'bg-primary text-white font-medium shadow-sm'
                                                : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-300">Release Date</Label>
                                <Input
                                    type="date"
                                    value={releaseDate} onChange={e => setReleaseDate(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white"
                                    required
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label className="text-gray-300">Artist</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={artistId}
                                    onChange={e => setArtistId(e.target.value)}
                                    required
                                >
                                    <option value="" className="text-gray-500">Select Artist...</option>
                                    {artists.map(a => (
                                        <option key={a.id} value={a.id} className="bg-gray-900">{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white">
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingAlbum ? 'Save Changes' : 'Create Album'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AlbumManagement;
