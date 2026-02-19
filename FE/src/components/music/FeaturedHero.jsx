import { Play, Plus, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { usePlayer } from '../../contexts/PlayerContext';
import { useNavigate } from 'react-router-dom';

const FeaturedHero = ({ item, type = 'song' }) => {
    const { playSong, playAlbum } = usePlayer();
    const navigate = useNavigate();

    if (!item) return null;

    const image = item.coverImageUrl || item.coverUrl || item.imageUrl || 'https://placehold.co/800x400';
    const title = item.title || item.name;
    const subtitle = item.artistName || item.artist || (item.artists && item.artists.map(a => a.name).join(', ')) || 'Featured Track';
    const description = item.description || "Experience the sound of the moment. Listen to our top pick for you.";

    const handlePlay = () => {
        if (type === 'song') {
            playSong(item);
        } else if (type === 'album') {
            // Assuming playAlbum logic exists or we just play the first song? 
            // For now, let's just navigate or log. 
            // Ideally PlayerContext should have playAlbum or we fetch album tracks.
            // Let's assume we can navigate to album page and user plays from there for now if playAlbum isn't ready.
            navigate(`/app/album/${item.id}`);
        }
    };

    return (
        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden group mb-8 shadow-2xl ring-1 ring-white/10">
            {/* Background Image with Parallax-like feel */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear group-hover:scale-110"
                style={{ backgroundImage: `url(${image})` }}
            />

            {/* Gradient Overlays for Readability & Style */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* Content Container */}
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3 flex flex-col gap-6 items-start z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-2">
                    <span className="inline-block px-3 py-1 bg-indigo-500/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        Featured {type}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                        {title}
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-300 font-medium tracking-wide">
                        {subtitle}
                    </p>
                    <p className="text-sm text-zinc-400 max-w-lg line-clamp-2 leading-relaxed hidden sm:block">
                        {description}
                    </p>
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <Button
                        onClick={handlePlay}
                        className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] hover:shadow-[0_0_40px_-5px_rgba(79,70,229,0.7)] transition-all hover:scale-105 active:scale-95 group/btn"
                    >
                        <Play fill="currentColor" className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                        Play Now
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate(`/app/${type}/${item.id}`)}
                        className="h-12 px-8 rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 hover:border-white/40"
                    >
                        <Info className="w-5 h-5 mr-2" />
                        More Info
                    </Button>
                </div>
            </div>

            {/* Decorative decorative glow */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse" />
        </div>
    );
};

export default FeaturedHero;
