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
import { LogOut, User, Shield, Edit, Settings } from 'lucide-react';
import { useState } from 'react';
import EditProfileDialog from '../profile/EditProfileDialog';

import SearchBar from '../music/SearchBar';

// Let's implement a simple Header.
const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [initialTab, setInitialTab] = useState('general');

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
                    <span className="text-sm font-medium text-white hidden md:block">
                        {user?.displayName || user?.username}
                    </span>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="group relative cursor-pointer">
                                <Avatar className="hover:ring-2 hover:ring-primary transition-all">
                                    <AvatarImage src={user?.avatarUrl} />
                                    <AvatarFallback className="bg-primary text-white font-bold">
                                        {user?.displayName?.[0] || user?.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#282828] border-none text-gray-200">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#3E3E3E] focus:bg-[#3E3E3E]"
                                onClick={() => { setInitialTab('general'); setIsProfileOpen(true); }}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Account Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#3E3E3E] focus:bg-[#3E3E3E] text-red-400 focus:text-red-400"
                                onClick={logout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
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
