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
} from '@radix-ui/react-dropdown-menu'; // Simplified using Radix primitives directly or we can use our Shadcn port if available.
// Actually let's use a simple relative div for dropdown if Shadcn dropdown is too complex to port in one go, but I'll try to keep it simple.
// Wait, I installed @radix-ui/react-dropdown-menu but didn't create the component file.
// I'll create a simple custom dropdown logic or use the Radix primitive directly.
// Let's create a Header that uses a simple state for dropdown or just a logout button for simplicity first.
import { LogOut, User, Shield } from 'lucide-react';

import SearchBar from '../music/SearchBar';

// Let's implement a simple Header.
const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

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
                    <div className="group relative">
                        <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                            <AvatarImage src={user?.avatarUrl} />
                            <AvatarFallback className="bg-primary text-white font-bold">
                                {user?.displayName?.[0] || user?.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={logout}
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;
