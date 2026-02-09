import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi, filesApi } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Upload, User, Lock, Mail, Camera, ShieldCheck } from 'lucide-react';

const ProfileSettingsDialog = ({ isOpen, onOpenChange, initialTab = 'general' }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(false);

    // Reset tab when dialog opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    // General State (Profile)
    const [displayName, setDisplayName] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    // Account State (Security & Email)
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityError, setSecurityError] = useState('');

    // Initialize state from user object when dialog opens or user changes
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setEmail(user.email || '');
            setPreviewUrl(user.avatarUrl || '');
        }
    }, [user, isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            let avatarUrl = user?.avatarUrl;

            if (avatarFile) {
                const uploadResult = await filesApi.upload(avatarFile);
                if (uploadResult?.url) {
                    avatarUrl = uploadResult.url;
                }
            }

            const updatedUser = await usersApi.update(user.id, {
                displayName,
                avatarUrl
            });

            if (updatedUser) {
                updateLocalUser(updatedUser);
                onOpenChange(false);
                window.location.reload();
            }

        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to update profile. " + (error.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAccount = async () => {
        setSecurityError('');

        const updates = {};

        // Email logic
        if (email !== user.email) {
            updates.email = email;
        }

        // Password logic
        if (newPassword || confirmPassword) {
            if (newPassword !== confirmPassword) {
                setSecurityError("Passwords do not match");
                return;
            }
            if (newPassword.length < 6) {
                setSecurityError("Password must be at least 6 characters");
                return;
            }
            updates.password = newPassword;
        }

        if (Object.keys(updates).length === 0) {
            onOpenChange(false);
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await usersApi.update(user.id, updates);

            if (updatedUser) {
                alert("Account settings updated successfully. Please login again if you changed your password.");
                updateLocalUser(updatedUser);
                onOpenChange(false);
                if (updates.password) window.location.reload(); // Force reload/re-login for password change
            }
        } catch (error) {
            console.error("Failed to update account:", error);
            setSecurityError("Failed to update account. " + (error.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const updateLocalUser = (updatedUser) => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newUser = { ...storedUser, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] flex flex-col bg-[#1E1E1E] text-white border border-white/10 shadow-2xl p-0 overflow-hidden rounded-xl">
                <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-[#1E1E1E] to-[#252525] shrink-0">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Account Settings</DialogTitle>
                </DialogHeader>

                <div className="flex px-6 border-b border-white/5 gap-6 shrink-0">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-4 text-sm font-medium transition-all relative ${activeTab === 'general' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Profile
                        {activeTab === 'general' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`py-4 text-sm font-medium transition-all relative ${activeTab === 'security' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Account
                        {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-full" />}
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-6">
                                <div className="group relative w-24 h-24 rounded-full overflow-hidden bg-[#2A2A2A] shadow-lg cursor-pointer ring-2 ring-[#2A2A2A] group-hover:ring-green-500/50 transition-all duration-300 shrink-0" onClick={() => fileInputRef.current?.click()}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 bg-[#2A2A2A]">
                                            <User size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                        <Camera className="w-6 h-6 text-white mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Change</span>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="name" className="text-gray-300 font-medium">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="bg-[#2A2A2A] border-transparent text-white focus:border-green-500 focus:ring-0 h-10 px-4 rounded-lg transition-all hover:bg-[#333]"
                                        placeholder="Enter your display name"
                                    />
                                    <p className="text-xs text-gray-500">This name will be visible to other users.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-gray-300 font-medium text-xs uppercase tracking-wider">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                        <Input
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-[#2A2A2A] border-transparent text-white pl-9 focus:border-green-500 focus:ring-0 h-9 rounded-lg transition-all hover:bg-[#333] text-sm"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/5 space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="new-password" className="text-gray-300 font-medium text-xs uppercase tracking-wider">New Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="bg-[#2A2A2A] border-transparent text-white pl-9 focus:border-green-500 focus:ring-0 h-9 rounded-lg transition-all hover:bg-[#333] text-sm"
                                                placeholder="Min. 6 characters"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="confirm-password" className="text-gray-300 font-medium text-xs uppercase tracking-wider">Confirm Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="bg-[#2A2A2A] border-transparent text-white pl-9 focus:border-green-500 focus:ring-0 h-9 rounded-lg transition-all hover:bg-[#333] text-sm"
                                                placeholder="Re-enter password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {securityError && (
                                    <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/20 animate-in fade-in slide-in-from-top-1">
                                        {securityError}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-4 bg-[#1E1E1E] border-t border-white/5 shrink-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-white hover:bg-white/5 h-11 px-6">Cancel</Button>
                    <Button
                        onClick={activeTab === 'general' ? handleSaveProfile : handleSaveAccount}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-400 text-black font-bold h-11 px-8 rounded-full shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {activeTab === 'general' ? 'Save Profile' : 'Update Account'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileSettingsDialog;
