import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Music, Mic2, ListMusic } from 'lucide-react';
import { usersApi, songsApi, artistsApi, playlistsApi } from '../../lib/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        songs: 0,
        artists: 0,
        playlists: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch real data counts
                const [users, songs, artists, playlists] = await Promise.all([
                    usersApi.getAll().catch(() => []),
                    songsApi.getAll().catch(() => []),
                    artistsApi.getAll().catch(() => []),
                    playlistsApi.getAll().catch(() => [])
                ]);

                setStats({
                    users: users.length || 0,
                    songs: songs.length || 0,
                    artists: artists.length || 0,
                    playlists: playlists.length || 0
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                <p className="text-xs text-gray-500 mt-1">
                    Total {title.toLowerCase()} in database
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-gray-400 mt-2">Welcome back, Administrator.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Users"
                    value={stats.users}
                    icon={Users}
                    color="text-blue-500"
                />
                <StatCard
                    title="Songs"
                    value={stats.songs}
                    icon={Music}
                    color="text-green-500"
                />
                <StatCard
                    title="Artists"
                    value={stats.artists}
                    icon={Mic2}
                    color="text-pink-500"
                />
                <StatCard
                    title="Playlists"
                    value={stats.playlists}
                    icon={ListMusic}
                    color="text-yellow-500"
                />
            </div>

            {/* Recent Activity or Charts could go here */}
            <Card className="bg-black/40 border-white/10 col-span-4 mt-8">
                <CardHeader>
                    <CardTitle className="text-white">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-gray-300">All systems operational</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
