import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, Disc } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label, active }) => (
        <Link to={to}>
            <Button
                variant="ghost"
                className={cn(
                    "w-full justify-start gap-4 text-base font-medium h-12 mb-1",
                    active
                        ? "bg-white/10 text-white hover:bg-white/10"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
            >
                <Icon size={24} />
                {label}
            </Button>
        </Link>
    );

    return (
        <div className="w-64 bg-black h-full flex flex-col p-6 gap-6">
            <div className="flex items-center gap-2 px-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M6 12c0-1.7.7-3.2 1.8-4.2"></path>
                        <circle cx="12" cy="12" r="2"></circle>
                        <path d="M18 12c0 1.7-.7 3.2-1.8 4.2"></path>
                    </svg>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">TunDuzz</span>
            </div>

            <nav className="flex-1 space-y-6">
                <div className="space-y-1">
                    <NavItem
                        to="/app"
                        icon={Home}
                        label="Home"
                        active={isActive('/app')}
                    />
                    <NavItem
                        to="/app/search"
                        icon={Search}
                        label="Search"
                        active={isActive('/app/search')}
                    />
                    <NavItem
                        to="/app/library"
                        icon={Library}
                        label="Your Library"
                        active={isActive('/app/library')}
                    />
                </div>

                <div className="pt-6 border-t border-white/10 space-y-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-4 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 h-12"
                    >
                        <PlusSquare size={24} />
                        Create Playlist
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-4 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 h-12"
                    >
                        <Heart size={24} className="text-purple-400" />
                        Liked Songs
                    </Button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
