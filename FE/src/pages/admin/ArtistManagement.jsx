import { useState, useEffect, useRef } from 'react';
import { artistsApi, filesApi } from '../../lib/api';
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
import { Textarea } from '../../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Upload, Loader2, User } from 'lucide-react';

const ArtistManagement = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingArtist, setEditingArtist] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const avatarInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        country: '',
        avatarUrl: ''
    });

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        try {
            const data = await artistsApi.getAll();
            setArtists(data || []);
        } catch (error) {
            console.error('Error fetching artists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (artist = null) => {
        setUploading(false);
        if (artist) {
            setEditingArtist(artist);
            setFormData({
                name: artist.name || '',
                bio: artist.bio || '',
                country: artist.country || '',
                avatarUrl: artist.avatarUrl || ''
            });
        } else {
            setEditingArtist(null);
            setFormData({
                name: '',
                bio: '',
                country: '',
                avatarUrl: ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await filesApi.upload(file);
            if (result && result.url) {
                setFormData(prev => ({ ...prev, avatarUrl: result.url }));
            }
        } catch (error) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingArtist) {
                const updated = await artistsApi.update(editingArtist.id, formData);
                if (updated) {
                    fetchArtists();
                    setIsDialogOpen(false);
                }
            } else {
                const created = await artistsApi.create(formData);
                if (created) {
                    fetchArtists();
                    setIsDialogOpen(false);
                }
            }
        } catch (error) {
            alert('Operation failed: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this artist?')) {
            try {
                await artistsApi.delete(id);
                setArtists(artists.filter(a => a.id !== id));
            } catch (error) {
                alert('Deletion failed');
            }
        }
    };

    const filteredArtists = artists.filter(a =>
        a.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Artists</h2>
                <div className="flex gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                            placeholder="Search artists..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-black/40 border-white/10 text-white"
                        />
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-white">
                        <Plus size={18} className="mr-2" />
                        Add Artist
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400">Avatar</TableHead>
                            <TableHead className="text-gray-400">Name</TableHead>
                            <TableHead className="text-gray-400">Country</TableHead>
                            <TableHead className="text-gray-400">Followers</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-gray-400">Loading artists...</TableCell>
                            </TableRow>
                        ) : filteredArtists.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-gray-400">No artists found</TableCell>
                            </TableRow>
                        ) : (
                            filteredArtists.map(artist => (
                                <TableRow key={artist.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell>
                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                            {artist.avatarUrl ? (
                                                <img src={artist.avatarUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">{artist.name}</TableCell>
                                    <TableCell className="text-gray-400">{artist.country || '-'}</TableCell>
                                    <TableCell className="text-gray-400">{artist.followerCount}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="hover:text-blue-400" onClick={() => handleOpenDialog(artist)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:text-red-400" onClick={() => handleDelete(artist.id)}>
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{editingArtist ? "Edit Artist" : "Add New Artist"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {editingArtist ? "Update artist details." : "Add a new artist to the system."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Name</Label>
                            <Input
                                className="bg-white/5 border-white/10 text-white"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Country</Label>
                            <Input
                                className="bg-white/5 border-white/10 text-white"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Bio</Label>
                            <Textarea
                                className="bg-white/5 border-white/10 text-white resize-none"
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Avatar Upload */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Avatar</Label>
                            <div className="flex gap-2">
                                <Input
                                    className="bg-white/5 border-white/10 text-white flex-1"
                                    placeholder="https://..."
                                    value={formData.avatarUrl}
                                    onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={avatarInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0 border-white/10 hover:bg-white/5"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        {formData.avatarUrl && (
                            <div className="flex justify-center">
                                <img src={formData.avatarUrl} alt="Preview" className="w-24 h-24 object-cover rounded-full border-2 border-white/10" />
                            </div>
                        )}

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/10">Cancel</Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Save Changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ArtistManagement;
