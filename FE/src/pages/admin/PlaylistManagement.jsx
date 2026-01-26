import { ListMusic } from 'lucide-react';

const PlaylistManagement = () => {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
            <div className="bg-white/10 p-6 rounded-full">
                <ListMusic size={64} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Playlists Support Coming Soon</h2>
            <p className="text-gray-400 max-w-md">
                We are working on this feature to allow you to manage global playlists for all users.
            </p>
        </div>
    );
};

export default PlaylistManagement;
