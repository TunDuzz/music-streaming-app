import { Library as LibraryIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';

const Library = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="bg-white/10 p-6 rounded-full">
                <LibraryIcon size={64} className="text-white" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Your Library is empty</h2>
                <p className="text-gray-400 max-w-md">
                    Looking for music? Start listening to the best new releases and find your next favorite song.
                </p>
            </div>
            <Button className="rounded-full px-8 py-6 text-lg font-bold">
                Create Playlist
            </Button>
        </div>
    );
};

export default Library;
