import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { LogOut, User, Shield } from 'lucide-react';
import { useState } from 'react';
import EditProfileDialog from '../profile/EditProfileDialog';

import SearchBar from '../music/SearchBar';

// Let's implement a simple Header.
const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [initialTab, setInitialTab] = useState('profile');

    return (
        <header className="h-16 bg-black/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
            {/* Left Spacer for centering */}
            <div className="w-1/3 min-w-[100px] flex items-center gap-2"></div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md flex justify-center">
                <SearchBar />
            </div>

            {/* Right: User & Actions */}
            <div className="w-1/3 flex items-center justify-end gap-4">
                {isAdmin && (
                    <Button
                        variant="outline"
                        className="gap-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 hidden sm:flex"
                        onClick={() => navigate('/admin')}
                    >
                        <Shield size={16} />
                        Admin Panel
                    </Button>
                )}

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="hidden md:block text-right">
                        <span className="block text-sm font-semibold text-white leading-none">
                            {user?.displayName || user?.username}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                            {isAdmin ? 'Administrator' : 'Member'}
                        </span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="group relative cursor-pointer">
                                <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-indigo-500 transition-all duration-300 shadow-lg">
                                    <AvatarImage src={user?.avatarUrl} className="object-cover" />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                                        {user?.displayName?.[0] || user?.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 rounded-full bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60 bg-black/80 backdrop-blur-xl border border-white/10 text-zinc-200 shadow-2xl rounded-xl p-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <DropdownMenuLabel className="px-3 py-2">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">My Account</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5 my-1" />
                            <DropdownMenuItem
                                className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-white/10 focus:bg-white/10 transition-colors group"
                                onClick={() => { setInitialTab('profile'); setIsProfileOpen(true); }}
                            >
                                <User className="mr-3 h-4 w-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                                <span className="font-medium group-hover:text-white transition-colors">Account Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 my-1" />
                            <DropdownMenuItem
                                className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 hover:text-red-300 focus:text-red-300 transition-colors group"
                                onClick={logout}
                            >
                                <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="font-semibold">Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <EditProfileDialog
                isOpen={isProfileOpen}
                onOpenChange={setIsProfileOpen}
                initialTab={initialTab}
            />
        </header>
    );
};

export default Header;
