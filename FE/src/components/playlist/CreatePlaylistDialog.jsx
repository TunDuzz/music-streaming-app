import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { playlistsApi } from '../../lib/api';
import { Loader2, Music, Upload, Eye, Lock, Image as ImageIcon, X } from 'lucide-react';
import Switch from '../ui/switch';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const CreatePlaylistDialog = ({ children, onOpenChange, open }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile);
            setPreviewUrl(URL.createObjectURL(droppedFile));
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setLoading(true);
        try {
            // 1. Create Playlist
            const newPlaylist = await playlistsApi.create({
                name,
                description,
                isPublic
            });

            // 2. Upload Image if exists
            if (file) {
                try {
                    await playlistsApi.uploadImage(newPlaylist.id, file);
                } catch (error) {
                    console.error("Failed to upload image:", error);
                    toast.error("Playlist created but image upload failed");
                }
            }

            toast.success("Playlist created successfully!");

            // Reset and Close
            setName('');
            setDescription('');
            setIsPublic(false);
            setFile(null);
            setPreviewUrl(null);
            if (onOpenChange) onOpenChange(false);

            // Navigate
            navigate(`/app/playlist/${newPlaylist.id}`);

        } catch (error) {
            console.error("Failed to create playlist:", error);
            toast.error("Failed to create playlist");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border border-white/20 sm:max-w-[580px] p-0 shadow-2xl overflow-hidden rounded-2xl">
                <DialogHeader className="px-8 pt-8 pb-4 border-b border-white/5 bg-white/5">
                    <DialogTitle className="text-2xl font-bold text-white tracking-tight">Create Playlist</DialogTitle>
                </DialogHeader>

                <div className="px-8 py-8 flex flex-col gap-6 bg-zinc-900">
                    <div className="flex gap-6">
                        {/* Image Upload Area */}
                        <div
                            className="group relative w-48 h-48 bg-black/40 rounded-lg shadow-inner flex-shrink-0 cursor-pointer overflow-hidden border-2 border-dashed border-zinc-700 hover:border-zinc-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                                        <Upload className="w-8 h-8 text-white mb-2" />
                                        <span className="text-xs text-white font-medium">Change Image</span>
                                    </div>
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3 group-hover:text-white transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ImageIcon size={24} />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-sm font-semibold block">Choose Photo</span>
                                        <span className="text-[10px] text-zinc-500 mt-1 block">or drag and drop</span>
                                    </div>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Input Fields */}
                        <div className="flex flex-col gap-4 flex-grow">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Name</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="My Playlist #1"
                                    className="bg-zinc-800 border-transparent focus:border-white/20 text-white font-bold text-lg h-12 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:bg-zinc-700 transition-all"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2 flex-grow">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Give your playlist a catchy description."
                                    className="w-full h-[88px] resize-none rounded-md bg-zinc-800 border-transparent focus:border-white/20 px-3 py-3 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus:bg-zinc-700 transition-all scrollbar-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3 bg-zinc-800/50 px-3 py-2 rounded-lg border border-white/5">
                            {isPublic ? <Eye size={16} className="text-green-500" /> : <Lock size={16} className="text-zinc-400" />}
                            <div className="flex flex-col mr-2">
                                <span className={`text-xs font-bold uppercase tracking-wider ${isPublic ? 'text-green-500' : 'text-zinc-400'}`}>
                                    {isPublic ? 'Public' : 'Private'}
                                </span>
                            </div>
                            <Switch
                                id="create-public"
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={!name.trim() || loading}
                            className="bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-8 h-10 shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            Create
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePlaylistDialog;
