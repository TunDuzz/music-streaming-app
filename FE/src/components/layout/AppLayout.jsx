import Sidebar from './Sidebar';
import Header from './Header';
import Player from '../music/Player';

const AppLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-black overflow-hidden font-sans text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#121212] to-black relative">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 scrollbar-hide pb-24">
                    {children}
                </main>
            </div>
            {/* Fixed Player Global */}
            <Player />
        </div>
    );
};

export default AppLayout;
