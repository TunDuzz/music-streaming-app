import { useEffect, useState } from 'react';
import { songsApi } from '../../lib/api';
import SongCard from '../../components/music/SongCard';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const data = await songsApi.getAll();
                setSongs(data);
            } catch (error) {
                console.error('Failed to fetch songs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white mb-6">
                {getGreeting()}, {user?.displayName || user?.username}
            </h1>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
                        Featured Songs
                    </h2>
                    <span className="text-sm font-bold text-gray-400 hover:underline cursor-pointer tracking-wider">
                        SEE ALL
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {songs.map((song) => (
                        <SongCard key={song.id} song={song} />
                    ))}
                    {songs.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-10">
                            No songs found. Start by adding some music!
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
