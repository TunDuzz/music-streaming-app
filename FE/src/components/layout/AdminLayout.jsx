import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Music, ListMusic, LogOut, Shield, Disc3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link to={to}>
            <Button
                variant="ghost"
                className={cn(
                    "w-full justify-start gap-4 text-base font-medium h-12 mb-1 transition-all duration-200",
                    isActive(to)
                        ? "bg-violet-600/10 text-violet-400 hover:bg-violet-600/20 hover:text-violet-300 border-l-2 border-violet-500 rounded-none rounded-r-md"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                )}
            >
                <Icon size={20} className={cn(isActive(to) ? "text-violet-400" : "text-gray-500")} />
                {label}
            </Button>
        </Link>
    );

    return (
        <div className="flex h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[128px]" />
            </div>

            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 flex flex-col bg-[#121212]/80 backdrop-blur-xl relative z-10">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-lg shadow-lg shadow-violet-500/20">
                            <Disc3 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-wide">TunDuzz</span>
                    </div>
                    <div className="mt-2 px-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Panel</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/admin/users" icon={Users} label="Users" />
                    <NavItem to="/admin/artists" icon={Music} label="Artists" />
                    <NavItem to="/admin/songs" icon={Music} label="Songs" />
                    <NavItem to="/admin/playlists" icon={ListMusic} label="Playlists" />
                    <NavItem to="/admin/albums" icon={Disc3} label="Albums" />
                    <NavItem to="/admin/genres" icon={Music} label="Genres" />
                </nav>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-violet-500/20">
                            <AvatarImage src={user?.avatarUrl} />
                            <AvatarFallback className="bg-violet-600 font-bold">{user?.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate text-white">{user?.displayName}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={logout}
                        >
                            <LogOut size={18} />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <header className="h-16 border-b border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        {location.pathname === '/admin' ? 'Dashboard' : location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
                    </h2>
                </header>
                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
