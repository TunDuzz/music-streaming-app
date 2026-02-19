import { useEffect, useState, useRef } from 'react';
import { songsApi, albumsApi, playlistsApi, artistsApi } from '../../lib/api';
import SongCard from '../../components/music/SongCard';
import AlbumCard from '../../components/music/AlbumCard';
import PlaylistCard from '../../components/music/PlaylistCard';
import ArtistCard from '../../components/music/ArtistCard';
import FeaturedHero from '../../components/music/FeaturedHero';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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
                    playlistsApi.getAll(),
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

    // Carousel Section Component with lateral controls
    const Section = ({ title, children, onViewAll }) => {
        const scrollContainerRef = useRef(null);

        const scroll = (direction) => {
            if (scrollContainerRef.current) {
                const { current } = scrollContainerRef;
                const scrollAmount = current.offsetWidth * 0.75; // Scroll 75% of view width
                current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
            }
        };

        return (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 group/section">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="w-1 h-6 bg-indigo-500 rounded-full block"></span>
                        {title}
                    </h2>

                    {onViewAll && (
                        <button
                            onClick={onViewAll}
                            className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest hover:underline decoration-indigo-500 decoration-2 underline-offset-4"
                        >
                            View All
                        </button>
                    )}
                </div>

                {/* Horizontal Scroll Container */}
                <div className="relative group/carousel">

                    {/* Left Button - Absolute Positioned */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-0 -ml-4 md:ml-0 shadow-xl"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-6 pb-4 px-1 snap-x scrollbar-none scroll-smooth"
                    >
                        {children}
                    </div>

                    {/* Right Button - Absolute Positioned */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 -mr-4 md:mr-0 shadow-xl"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Fade edges */}
                    <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black via-black/50 to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black via-black/50 to-transparent pointer-events-none z-10" />
                </div>
            </section>
        );
    };

    // Grid Section for "Browse All" feeling
    const GridSection = ({ title, children }) => (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-center gap-2 px-2 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {children}
            </div>
        </section>
    );

    const featuredItem = songs.length > 0 ? songs[Math.floor(Math.random() * songs.length)] : null;
    const featuredType = 'song';

    return (
        <div className="p-6 space-y-10 pb-24 overflow-x-hidden">
            <div className="flex items-end justify-between mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-500 tracking-tighter">
                    {getGreeting()}
                    <span className="block text-xl md:text-2xl text-zinc-400 font-medium mt-1 tracking-normal">
                        Ready for some music, {user?.displayName || user?.username}?
                    </span>
                </h1>
            </div>

            {/* Hero Section */}
            {featuredItem && <FeaturedHero item={featuredItem} type={featuredType} />}

            {/* Trending Songs (Horizontal) */}
            <Section title="Trending Songs">
                {songs.slice(0, 10).map((song) => (
                    <div key={song.id} className="w-[180px] md:w-[220px] shrink-0 snap-start">
                        <SongCard song={song} />
                    </div>
                ))}
            </Section>

            {/* Top Albums (Horizontal) */}
            <Section title="Top Albums">
                {albums.slice(0, 10).map((album) => (
                    <div key={album.id} className="w-[180px] md:w-[220px] shrink-0 snap-start">
                        <AlbumCard album={album} />
                    </div>
                ))}
            </Section>

            {/* Popular Playlists (Grid - different layout for variety) */}
            <GridSection title="Curated Playlists">
                {playlists.slice(0, 12).map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
            </GridSection>

            <Section title="Recommended Artists">
                {artists.slice(0, 10).map((artist) => (
                    <div key={artist.id} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                        <ArtistCard artist={artist} />
                    </div>
                ))}
            </Section>
        </div>
    );
};

export default Home;
