import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi, filesApi } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, User, Mail, Camera, Save, ShieldCheck, KeyRound, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const ProfileSettingsDialog = ({ isOpen, onOpenChange, initialTab = 'profile' }) => {
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
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: 'bg-zinc-600' };
        let score = 0;
        if (password.length > 5) score++;
        if (password.length > 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        switch (score) {
            case 0: return { score: 0, label: 'Too short', color: 'bg-red-600' };
            case 1: return { score: 20, label: 'Weak', color: 'bg-red-500' };
            case 2: return { score: 40, label: 'Fair', color: 'bg-orange-500' };
            case 3: return { score: 60, label: 'Good', color: 'bg-yellow-500' };
            case 4: return { score: 80, label: 'Strong', color: 'bg-emerald-500' };
            case 5: return { score: 100, label: 'Excellent', color: 'bg-emerald-400' };
            default: return { score: 0, label: '', color: 'bg-zinc-600' };
        }
    };

    const passwordStrength = getPasswordStrength(newPassword);

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
                toast.success("Profile updated successfully!");
                setTimeout(() => window.location.reload(), 1000);
            }

        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile", { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAccount = async () => {
        const updates = {};

        // Email logic
        if (email !== user.email) {
            updates.email = email;
        }

        // Password logic
        if (newPassword || confirmPassword) {
            if (!currentPassword) {
                toast.error("Current password is required");
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
            if (newPassword.length < 6) {
                toast.error("Password too short", { description: "Password must be at least 6 characters" });
                return;
            }
            updates.currentPassword = currentPassword;
            updates.password = newPassword;
        }

        if (Object.keys(updates).length === 0) {
            toast.info("No changes detected");
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await usersApi.update(user.id, updates);

            if (updatedUser) {
                updateLocalUser(updatedUser);
                toast.success("Account updated successfully!", { description: "Please login again if you changed your password." });
                if (updates.password) {
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    onOpenChange(false);
                }
            }
        } catch (error) {
            console.error("Failed to update account:", error);
            toast.error("Failed to update account", { description: error.message });
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
            <DialogContent className="sm:max-w-[850px] w-[95vw] bg-black/80 backdrop-blur-2xl border border-white/10 text-white shadow-2xl p-0 overflow-hidden rounded-3xl h-[550px] flex flex-col md:flex-row gap-0 ring-1 ring-white/5">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-[240px] bg-zinc-900/40 backdrop-blur-xl md:border-r border-white/5 p-6 flex flex-col gap-2 relative overflow-hidden shrink-0">
                    {/* Decorative Background Blob */}
                    <div className="absolute -top-24 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                    <div className="absolute top-1/2 -right-20 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

                    <DialogHeader className="mb-8 px-2 relative z-10">
                        <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white via-white to-zinc-400 bg-clip-text text-transparent">
                            Settings
                        </DialogTitle>
                        <p className="text-xs text-zinc-500 font-medium">Manage your preferences</p>
                    </DialogHeader>

                    <nav className="space-y-2 relative z-10">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${activeTab === 'profile'
                                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.02]'
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white hover:pl-5'
                                }`}
                        >
                            <User size={18} className={`transition-transform duration-300 ${activeTab === 'profile' ? 'scale-110' : 'group-hover:scale-110'}`} />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${activeTab === 'account'
                                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.02]'
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white hover:pl-5'
                                }`}
                        >
                            <ShieldCheck size={18} className={`transition-transform duration-300 ${activeTab === 'account' ? 'scale-110' : 'group-hover:scale-110'}`} />
                            Security
                        </button>
                    </nav>

                    <div className="mt-auto px-2 relative z-10">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                                <span className="text-indigo-400 font-bold block mb-1 tracking-wide">PRO TIP</span>
                                Secure your account with a strong password to keep your playlists safe.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {/* Content Background Glow */}
                    <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 ease-out relative">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-2xl font-bold tracking-tight text-white">Public Profile</h3>
                                <p className="text-sm text-zinc-400">Manage how you appear to others on the platform.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 bg-zinc-900/20 rounded-2xl p-6 border border-white/5 transition-colors hover:bg-zinc-900/30">
                                <div className="group relative w-32 h-32 rounded-full overflow-hidden shadow-2xl cursor-pointer ring-4 ring-black/40 group-hover:ring-indigo-500 transition-all duration-500 shrink-0" onClick={() => fileInputRef.current?.click()}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                                            <User size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                        <Camera className="w-8 h-8 text-white mb-2 drop-shadow-lg" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 drop-shadow-md">Change</span>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                                <div className="flex-1 space-y-6 w-full pt-2">
                                    <div className="space-y-3">
                                        <Label htmlFor="name" className="text-zinc-300 font-medium text-xs uppercase tracking-wider ml-1">Display Name</Label>
                                        <div className="relative group/input">
                                            <Input
                                                id="name"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="bg-black/20 border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-11 px-4 rounded-xl transition-all duration-300 placeholder:text-zinc-600"
                                                placeholder="Enter your display name"
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium ml-1">Visible to other users. Max 32 characters.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-8 rounded-full shadow-[0_0_20px_-5px_rgba(79,70,229,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] active:scale-[0.98]"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 ease-out h-full flex flex-col relative">
                            <div className="flex flex-col gap-0.5 shrink-0">
                                <h3 className="text-2xl font-bold tracking-tight text-white">Account & Security</h3>
                                <p className="text-xs text-zinc-400">Manage your login credentials.</p>
                            </div>

                            <div className="flex-1 bg-zinc-900/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm flex flex-col gap-5 overflow-hidden transition-colors hover:bg-zinc-900/30">

                                {/* Row 1: Email and Current Password */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-zinc-300 font-medium text-xs ml-1 uppercase tracking-wider">Email Address</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors duration-300" />
                                            <Input
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-black/20 border-white/10 text-white pl-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-10 rounded-xl transition-all duration-300 placeholder:text-zinc-600 text-sm"
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="current-password" className="text-xs uppercase text-indigo-400 font-bold tracking-wider ml-1">Current Password</Label>
                                        <div className="relative group">
                                            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
                                            <Input
                                                id="current-password"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="bg-indigo-500/10 border-indigo-500/30 text-white pl-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-10 rounded-xl transition-all duration-300 placeholder:text-indigo-300/30 text-sm"
                                                placeholder="Required to save changes"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 pt-4 space-y-4">
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-semibold text-white">Change Password</h4>
                                        <p className="text-[10px] text-zinc-500">Leave blank if you don't want to change it.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password" className="text-xs uppercase text-zinc-500 font-bold tracking-wider ml-1">New Password</Label>
                                            <div className="relative group">
                                                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors duration-300" />
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="bg-black/20 border-white/10 text-white pl-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-10 rounded-xl transition-all duration-300 placeholder:text-zinc-600 text-sm"
                                                    placeholder="Min. 6 characters"
                                                />
                                            </div>
                                            {/* Password Strength Indicator */}
                                            {newPassword && (
                                                <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1">
                                                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 px-1">
                                                        <span>Strength</span>
                                                        <span className={passwordStrength.color.replace('bg-', 'text-')}>{passwordStrength.label}</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${passwordStrength.color} transition-all duration-500 shadow-[0_0_10px_currentColor]`}
                                                            style={{ width: `${passwordStrength.score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password" className="text-xs uppercase text-zinc-500 font-bold tracking-wider ml-1">Confirm Password</Label>
                                            <div className="relative group">
                                                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors duration-300" />
                                                <Input
                                                    id="confirm-password"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="bg-black/20 border-white/10 text-white pl-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-10 rounded-xl transition-all duration-300 placeholder:text-zinc-600 text-sm"
                                                    placeholder="Re-enter password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto pt-2 flex justify-end">
                                    <Button
                                        onClick={handleSaveAccount}
                                        disabled={loading}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 px-6 rounded-full shadow-[0_0_20px_-5px_rgba(79,70,229,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] active:scale-[0.98] text-xs"
                                    >
                                        {loading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2" />}
                                        Update Account
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileSettingsDialog;
