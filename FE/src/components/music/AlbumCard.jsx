import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '../ui/button';

const AlbumCard = ({ album }) => {
    const navigate = useNavigate();

    return (
        <div
            className="group bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg p-4 cursor-pointer"
            onClick={() => navigate(`/app/album/${album.id}`)}
        >
            <div className="relative aspect-square w-full mb-4 rounded-md overflow-hidden shadow-lg">
                <img
                    src={album.coverImageUrl || 'https://placehold.co/400'}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Play Button on Hover */}
                <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                    <Button
                        size="icon"
                        className="rounded-full bg-green-500 hover:bg-green-400 text-black h-12 w-12 shadow-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/album/${album.id}`); // Or play album directly if implemented
                        }}
                    >
                        <Play fill="currentColor" className="ml-1" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <h3 className="font-bold text-white truncate" title={album.title}>
                    {album.title}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                    {album.artistName || 'Unknown Artist'} • {new Date(album.releaseDate).getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default AlbumCard;
