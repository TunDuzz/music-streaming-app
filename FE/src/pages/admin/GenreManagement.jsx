import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Music } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { genresApi } from '../../lib/api';

const GenreManagement = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        loadGenres();
    }, []);

    const loadGenres = async () => {
        try {
            const data = await genresApi.getAll();
            setGenres(data);
        } catch (error) {
            console.error('Failed to load genres:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (genre = null) => {
        if (genre) {
            setEditingGenre(genre);
            setFormData({ name: genre.name, description: genre.description || '' });
        } else {
            setEditingGenre(null);
            setFormData({ name: '', description: '' });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGenre) {
                await genresApi.update(editingGenre.id, formData);
            } else {
                await genresApi.create(formData);
            }
            loadGenres();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to save genre:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this genre?')) {
            try {
                await genresApi.delete(id);
                loadGenres();
            } catch (error) {
                console.error('Failed to delete genre:', error);
            }
        }
    };

    const filteredGenres = genres.filter(genre =>
        genre.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Genres</h1>
                    <p className="text-gray-400 mt-2">Manage music genres</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                            placeholder="Search genres..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-black/40 border-white/10 text-white"
                        />
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-green-600">
                        <Plus className="mr-2 h-4 w-4" /> Add Genre
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-white/5 border-white/10">
                            <TableHead className="text-gray-400">Name</TableHead>
                            <TableHead className="text-gray-400">Description</TableHead>
                            <TableHead className="text-gray-400">Songs</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredGenres.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No genres found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredGenres.map((genre) => (
                                <TableRow key={genre.id} className="hover:bg-white/5 border-white/10 transition-colors">
                                    <TableCell className="font-medium text-white flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center">
                                            <Music size={16} className="text-primary" />
                                        </div>
                                        {genre.name}
                                    </TableCell>
                                    <TableCell className="text-gray-400">{genre.description || '-'}</TableCell>
                                    <TableCell className="text-gray-400">{genre.songCount || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                                                onClick={() => handleOpenDialog(genre)}
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                onClick={() => handleDelete(genre.id)}
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
                <DialogContent className="bg-[#18181b] border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingGenre ? 'Edit Genre' : 'Create Genre'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/10 hover:text-white text-gray-400">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-green-600 text-white">
                                {editingGenre ? 'Save Changes' : 'Create Genre'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GenreManagement;
