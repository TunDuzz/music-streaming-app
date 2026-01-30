import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Users, Music, Mic2, ListMusic, TrendingUp, Activity, UserPlus, PlayCircle } from 'lucide-react';
import { usersApi, songsApi, artistsApi, playlistsApi } from '../../lib/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        songs: 0,
        artists: 0,
        playlists: 0
    });

    const [chartData, setChartData] = useState({
        userGrowth: [],
        genreDist: []
    });

    const [recentActivity, setRecentActivity] = useState({
        users: [],
        songs: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [users, songs, artists, playlists] = await Promise.all([
                    usersApi.getAll().catch(() => []),
                    songsApi.getAll().catch(() => []),
                    artistsApi.getAll().catch(() => []),
                    playlistsApi.getAll().catch(() => [])
                ]);

                // Basic Stats
                setStats({
                    users: users.length || 0,
                    songs: songs.length || 0,
                    artists: artists.length || 0,
                    playlists: playlists.length || 0
                });

                // Process User Growth (Group by creation month)
                const userLoginMap = {}; // Or CreatedAt if available. UserDto has CreatedAt?
                // Assuming UserDto has CreatedAt
                users.forEach(u => {
                    const date = u.createdAt ? new Date(u.createdAt) : new Date(); // Fallback if missing
                    const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    // Sorting hack: YYYY-MM for sorting, then display format
                    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    if (!userLoginMap[sortKey]) {
                        userLoginMap[sortKey] = { name: key, count: 0, sortKey };
                    }
                    userLoginMap[sortKey].count += 1;
                });

                const userGrowth = Object.values(userLoginMap)
                    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
                    .slice(-6); // Last 6 months

                // Process Genre Distribution
                const genreMap = {};
                songs.forEach(s => {
                    const genre = s.genreName || 'Unknown';
                    genreMap[genre] = (genreMap[genre] || 0) + 1;
                });

                const genreDist = Object.entries(genreMap)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5); // Top 5 genres

                setChartData({ userGrowth, genreDist });

                // Recent Activity
                const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
                const sortedSongs = [...songs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

                setRecentActivity({
                    users: sortedUsers,
                    songs: sortedSongs
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-white/5 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                <p className="text-xs text-gray-500 mt-1">
                    {subtext}
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">DashboardOverview</h1>
                    <p className="text-gray-400 mt-1">Real-time platform insights and analytics.</p>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1">
                    <Activity className="w-3 h-3 mr-2 animate-pulse" />
                    System Online
                </Badge>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value={stats.users} icon={Users} color="text-blue-500" subtext="Active accounts" />
                <StatCard title="Total Songs" value={stats.songs} icon={Music} color="text-green-500" subtext="Tracks in library" />
                <StatCard title="Artists" value={stats.artists} icon={Mic2} color="text-pink-500" subtext="Registered artists" />
                <StatCard title="Playlists" value={stats.playlists} icon={ListMusic} color="text-yellow-500" subtext="User collections" />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4 bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            User Growth
                        </CardTitle>
                        <CardDescription>New user registrations over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.userGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Music className="w-4 h-4 text-purple-400" />
                            Genre Distribution
                        </CardTitle>
                        <CardDescription>Songs by top genres</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.genreDist}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.genreDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-green-400" />
                            Recent Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-gray-400">User</TableHead>
                                    <TableHead className="text-right text-gray-400">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivity.users.map((user) => (
                                    <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="flex items-center gap-3 font-medium text-white">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatarUrl} />
                                                <AvatarFallback className="bg-blue-900/50 text-blue-400 text-xs">
                                                    {user.displayName?.[0] || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span>{user.displayName}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-400 text-xs">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-pink-400" />
                            Recent Songs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-gray-400">Song</TableHead>
                                    <TableHead className="text-right text-gray-400">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivity.songs.map((song) => (
                                    <TableRow key={song.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="flex items-center gap-3 font-medium text-white">
                                            <div className="h-8 w-8 rounded overflow-hidden bg-white/5">
                                                {song.coverImageUrl ? (
                                                    <img src={song.coverImageUrl} alt={song.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Music className="h-4 w-4 m-2 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[150px]">{song.title}</span>
                                                <span className="text-xs text-gray-500">{song.artistName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-400 text-xs">
                                            {song.createdAt ? new Date(song.createdAt).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
