import { useNavigate } from 'react-router-dom';
import { Play, Music } from 'lucide-react';
import { Button } from '../ui/button';

const ArtistCard = ({ artist }) => {
    const navigate = useNavigate();

    return (
        <div
            className="group bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg p-4 cursor-pointer"
            onClick={() => navigate(`/app/artist/${artist.id}`)}
        >
            {/* Image Container Wrapper */}
            <div className="relative aspect-square w-full mb-4">
                {/* Circular Mask for Image */}
                <div className="w-full h-full rounded-full overflow-hidden shadow-lg bg-[#333] flex items-center justify-center">
                    {artist.avatarUrl ? (
                        <img
                            src={artist.avatarUrl}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <Music className="w-12 h-12 text-gray-500" />
                    )}
                </div>

                {/* Play Button - Positioned absolute relative to the square wrapper, avoiding clip */}
                <div className="absolute bottom-0 right-0 translate-y-2 opacity-0 group-hover:translate-y-[-8px] group-hover:translate-x-[-8px] group-hover:opacity-100 transition-all duration-300 z-10">
                    <Button
                        size="icon"
                        className="rounded-full bg-green-500 hover:bg-green-400 text-black h-12 w-12 shadow-xl hover:scale-105 transition-transform"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/artist/${artist.id}`); // Or play artist logic
                        }}
                    >
                        <Play fill="currentColor" className="ml-1" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                <h3 className="font-bold text-white truncate w-full" title={artist.name}>
                    {artist.name}
                </h3>
                <p className="text-sm text-gray-400 truncate w-full">
                    Artist
                </p>
            </div>
        </div>
    );
};

export default ArtistCard;
