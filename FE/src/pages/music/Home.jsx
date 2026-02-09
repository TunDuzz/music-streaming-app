import { useEffect, useState } from 'react';
import { songsApi, albumsApi, playlistsApi, artistsApi } from '../../lib/api';
import SongCard from '../../components/music/SongCard';
import AlbumCard from '../../components/music/AlbumCard';
import PlaylistCard from '../../components/music/PlaylistCard';
import ArtistCard from '../../components/music/ArtistCard';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [songsData, albumsData, playlistsData, artistsData] = await Promise.all([
                    songsApi.getAll(),
                    albumsApi.getAll(),
                    playlistsApi.getAll(), // Assuming this returns public playlists or similar
                    artistsApi.getAll()
                ]);

                setSongs(songsData || []);
                setAlbums(albumsData || []);
                setPlaylists(playlistsData || []);
                setArtists(artistsData || []);
            } catch (error) {
                console.error('Failed to fetch home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    // Reuse Section Component
    const Section = ({ title, children }) => (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
                    {title}
                </h2>
                <span className="text-sm font-bold text-gray-400 hover:underline cursor-pointer tracking-wider">
                    SEE ALL
                </span>
            </div>
            {children}
        </section>
    );

    return (
        <div className="space-y-12 pb-10">
            <h1 className="text-3xl font-bold text-white mb-6">
                {getGreeting()}, {user?.displayName || user?.username}
            </h1>

            {/* Featured Songs (Grid) */}
            <Section title="Featured Songs">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {songs.slice(0, 10).map((song) => (
                        <SongCard key={song.id} song={song} />
                    ))}
                    {songs.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-4">
                            No songs found.
                        </div>
                    )}
                </div>
            </Section>

            {/* Trending Albums */}
            <Section title="Trending Albums">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {albums.slice(0, 6).map((album) => (
                        <AlbumCard key={album.id} album={album} />
                    ))}
                    {albums.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-4">
                            No albums found.
                        </div>
                    )}
                </div>
            </Section>

            {/* Popular Playlists */}
            <Section title="Popular Playlists">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {playlists.slice(0, 6).map((playlist) => (
                        <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                    {playlists.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-4">
                            No playlists found.
                        </div>
                    )}
                </div>
            </Section>

            {/* Suggested Artists */}
            <Section title="Suggested Artists">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {artists.slice(0, 6).map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                    ))}
                    {artists.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-4">
                            No artists found.
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
};

export default Home;
