import { useState, useEffect, useRef } from 'react';
import { songsApi, artistsApi, filesApi, genresApi, albumsApi } from '../../lib/api';
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
    DialogTrigger,
} from "../../components/ui/dialog";

import { Plus, Pencil, Trash2, Search, Upload, Loader2, FileAudio, Image as ImageIcon, Check } from 'lucide-react';

const SongManagement = () => {
    const [songs, setSongs] = useState([]);
    const [artists, setArtists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [albums, setAlbums] = useState([]); // Add albums state
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingSong, setEditingSong] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false); // New global loading

    const [artistSearchTerm, setArtistSearchTerm] = useState('');

    // File selection state (for Create mode)
    const [selectedFiles, setSelectedFiles] = useState({ song: null, cover: null });

    // Upload state (for Edit mode only)
    const [uploading, setUploading] = useState({ song: false, cover: false });

    const songInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        artistIds: [], // Changed from artistId to artistIds array
        albumId: '',
        genreId: '',
        duration: '',
        songUrl: '',
        coverUrl: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [songsData, artistsData, genresData, albumsData] = await Promise.all([
                songsApi.getAll(),
                artistsApi.getAll().catch(() => []),
                genresApi.getAll().catch(() => []),
                albumsApi.getAll().catch(() => [])
            ]);
            setSongs(songsData || []);
            setArtists(artistsData || []);
            setGenres(genresData || []);
            setAlbums(albumsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (song = null) => {
        setUploading({ song: false, cover: false });
        setSelectedFiles({ song: null, cover: null });
        setSubmitting(false);

        if (song) {
            setEditingSong(song);
            setFormData({
                title: song.title || '',
                artistIds: song.artists ? song.artists.map(a => a.id) : [], // Map artists to IDs
                albumId: song.albumId || '',
                genreId: song.genreId || '',
                duration: song.duration || '',
                songUrl: song.audioFileUrl || '',
                coverUrl: song.coverImageUrl || ''
            });
        } else {
            setEditingSong(null);
            setFormData({
                title: '',
                artistIds: [],
                albumId: '',
                genreId: '',
                duration: '',
                songUrl: '',
                coverUrl: ''
            });
        }
        setIsDialogOpen(true);
    };

    // Handle File Selection (Create Mode) OR Direct Upload (Edit Mode)
    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (editingSong) {
            // EDIT MODE: Direct Upload (Old Flow)
            setUploading(prev => ({ ...prev, [type]: true }));
            try {
                const result = await filesApi.upload(file);
                if (result && result.url) {
                    if (type === 'song') setFormData(prev => ({ ...prev, songUrl: result.url, duration: result.duration || prev.duration }));
                    if (type === 'cover') setFormData(prev => ({ ...prev, coverUrl: result.url }));
                }
            } catch (error) {
                alert('Upload failed: ' + error.message);
            } finally {
                setUploading(prev => ({ ...prev, [type]: false }));
            }
        } else {
            // CREATE MODE: Select File Only (New Transactional Flow)
            setSelectedFiles(prev => ({ ...prev, [type]: file }));

            if (type === 'song') {
                setFormData(prev => ({ ...prev, songUrl: file.name })); // Show filename
            }
            if (type === 'cover') {
                const preview = URL.createObjectURL(file);
                setFormData(prev => ({ ...prev, coverUrl: preview }));
            }
        }
        e.target.value = ''; // Reset input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Common Validation
        if (!formData.artistIds || formData.artistIds.length === 0) {
            alert("⚠️ Please select at least one artist!");
            return;
        }
        const durationVal = parseInt(formData.duration) || 0;



        setSubmitting(true);
        try {
            if (editingSong) {
                // EDIT MODE (JSON)
                if (!formData.songUrl.startsWith('http')) {
                    alert('Invalid Song URL'); return;
                }
                const payload = {
                    title: formData.title,
                    duration: durationVal,
                    audioFileUrl: formData.songUrl,
                    coverImageUrl: formData.coverUrl,
                    artistIds: formData.artistIds,
                    albumId: formData.albumId ? formData.albumId : null,
                    genreId: formData.genreId ? formData.genreId : null,
                };
                await songsApi.update(editingSong.id, payload);
            } else {
                // CREATE MODE (FormData - Transactional)
                if (!selectedFiles.song) {
                    alert("⚠️ Please select a song file.");
                    setSubmitting(false);
                    return;
                }

                const data = new FormData();
                data.append('Title', formData.title);
                data.append('Duration', durationVal);
                // Append each artist ID
                formData.artistIds.forEach(id => data.append('ArtistIds', id));
                if (formData.albumId) data.append('AlbumId', formData.albumId);
                if (formData.genreId) data.append('GenreId', formData.genreId);

                data.append('AudioFile', selectedFiles.song);
                if (selectedFiles.cover) {
                    data.append('CoverFile', selectedFiles.cover);
                }

                await songsApi.createWithUpload(data);
            }
            // Success
            fetchData();
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            alert('Operation failed: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ... handleDelete / filteredSongs (same as before)
    const handleDelete = async (id) => {
        if (window.confirm('Delete this song?')) {
            try {
                await songsApi.delete(id);
                setSongs(songs.filter(s => s.id !== id));
            } catch (error) {
                alert('Deletion failed');
            }
        }
    };

    const filteredSongs = songs.filter(s =>
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.artists?.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Songs</h2>
                <div className="flex gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                            placeholder="Search songs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-black/40 border-white/10 text-white"
                        />
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-white">
                        <Plus size={18} className="mr-2" />
                        Add Song
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400">Cover</TableHead>
                            <TableHead className="text-gray-400">Title</TableHead>
                            <TableHead className="text-gray-400">Artist</TableHead>
                            <TableHead className="text-gray-400">Genre</TableHead>
                            <TableHead className="text-gray-400">Album</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-gray-400">Loading songs...</TableCell>
                            </TableRow>
                        ) : filteredSongs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-gray-400">No songs found</TableCell>
                            </TableRow>
                        ) : (
                            filteredSongs.map(song => (
                                <TableRow key={song.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell>
                                        <div className="w-10 h-10 rounded bg-white/10 overflow-hidden">
                                            {song.coverImageUrl && <img src={song.coverImageUrl} className="w-full h-full object-cover" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">{song.title}</TableCell>
                                    <TableCell className="text-gray-400">
                                        {song.artists && song.artists.map(a => a.name).join(', ')}
                                    </TableCell>
                                    <TableCell className="text-gray-400">{song.genreName || '-'}</TableCell>
                                    <TableCell className="text-gray-400">{song.albumTitle || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="hover:text-blue-400" onClick={() => handleOpenDialog(song)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:text-red-400" onClick={() => handleDelete(song.id)}>
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
                <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-2xl overflow-y-auto max-h-[90vh] p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{editingSong ? "Edit Song" : "Add New Song"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {editingSong ? "Editing existing song." : "Files will only be uploaded when you click Save."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Title</Label>
                            <Input
                                className="col-span-3 bg-white/5 border-white/10 text-white h-11 focus-visible:ring-primary/50"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right text-gray-300 mt-2">Artists (Ctrl+Click)</Label>
                            <div className="col-span-3 border border-white/10 rounded-md bg-white/5 p-3">
                                <div className="relative mb-2">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <Input
                                        placeholder="Search artists..."
                                        className="pl-8 bg-black/20 border-white/10 h-8 text-sm focus-visible:ring-primary/50"
                                        value={artistSearchTerm}
                                        onChange={e => setArtistSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    {artists
                                        .filter(a => a.name.toLowerCase().includes(artistSearchTerm.toLowerCase()))
                                        .map(artist => {
                                            const isSelected = formData.artistIds.includes(artist.id);
                                            return (
                                                <div key={artist.id}
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-primary/20' : 'hover:bg-white/5'}`}
                                                    onClick={() => {
                                                        const selected = isSelected
                                                            ? formData.artistIds.filter(id => id !== artist.id)
                                                            : [...formData.artistIds, artist.id];
                                                        setFormData({ ...formData, artistIds: selected });
                                                    }}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                                                        {isSelected && <Check size={12} className="text-primary-foreground" />}
                                                    </div>
                                                    <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>{artist.name}</span>
                                                </div>
                                            );
                                        })}
                                    {artists.filter(a => a.name.toLowerCase().includes(artistSearchTerm.toLowerCase())).length === 0 && (
                                        <div className="text-center text-gray-500 text-sm py-4">No artists found</div>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 mt-2 text-right border-t border-white/10 pt-2">
                                    {formData.artistIds.length} selected
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Genre</Label>
                            <select
                                className="col-span-3 h-10 w-full bg-white/5 border-white/10 border rounded-md px-3 py-2 text-sm text-white focus:outline-none"
                                value={formData.genreId}
                                onChange={e => setFormData({ ...formData, genreId: e.target.value })}
                            >
                                <option value="" className="text-black">No Genre</option>
                                {genres.map(genre => (
                                    <option key={genre.id} value={genre.id} className="text-black">
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Album</Label>
                            <select
                                className="col-span-3 h-10 w-full bg-white/5 border-white/10 border rounded-md px-3 py-2 text-sm text-white focus:outline-none"
                                value={formData.albumId}
                                onChange={e => setFormData({ ...formData, albumId: e.target.value })}
                            >
                                <option value="" className="text-black">No Album (Single)</option>
                                {albums
                                    .filter(a => !formData.artistIds.length || formData.artistIds.includes(a.artistId)) // Filter by selected artists
                                    .map(album => (
                                        <option key={album.id} value={album.id} className="text-black">
                                            {album.title} ({album.type})
                                        </option>
                                    ))}
                            </select>
                        </div>


                        {/* Song File */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right text-gray-300 mt-2">Song File</Label>
                            <div className="col-span-3 flex gap-2">
                                <Input
                                    className="bg-white/5 border-white/10 text-white flex-1"
                                    value={formData.songUrl}
                                    placeholder={editingSong ? "Audio URL" : "No file selected"}
                                    readOnly
                                />
                                <input
                                    type="file"
                                    accept=".mp3,.wav"
                                    ref={songInputRef}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'song')}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0 border-white/10 hover:bg-white/5"
                                    onClick={() => songInputRef.current?.click()}
                                    disabled={uploading.song || submitting}
                                >
                                    {uploading.song ? <Loader2 className="animate-spin h-4 w-4" /> : <FileAudio className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right text-gray-300 mt-2">Cover Image</Label>
                            <div className="col-span-3 flex gap-2">
                                <Input
                                    className="bg-white/5 border-white/10 text-white flex-1"
                                    value={formData.coverUrl && formData.coverUrl.startsWith('blob:') ? "Image Selected" : formData.coverUrl}
                                    placeholder={editingSong ? "Image URL" : "No file selected"}
                                    readOnly
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={coverInputRef}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'cover')}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0 border-white/10 hover:bg-white/5"
                                    onClick={() => coverInputRef.current?.click()}
                                    disabled={uploading.cover || submitting}
                                >
                                    {uploading.cover ? <Loader2 className="animate-spin h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        {formData.coverUrl && (
                            <div className="flex justify-end">
                                <img src={formData.coverUrl} alt="Preview" className="w-16 h-16 object-cover rounded border border-white/10" />
                            </div>
                        )}

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={submitting}>Cancel</Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={submitting || (editingSong && (uploading.song || uploading.cover))}>
                                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};


export default SongManagement;
