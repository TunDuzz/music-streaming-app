import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Headphones, Disc3, Sparkles, Zap } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
            {/* Ambient background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px]" />
            </div>

            {/* Header */}
            <header className="relative z-50 border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Disc3 className="w-8 h-8 text-violet-400" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">TunDuzz</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={() => navigate('/login')}
                        >
                            Sign in
                        </Button>
                        <Button
                            className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-5"
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="relative z-10">
                <div className="container mx-auto px-6 pt-24 pb-32">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
                            <Sparkles className="w-4 h-4" />
                            Free forever, no limits
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                            Your music,
                            <br />
                            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                                your vibe
                            </span>
                        </h1>
                        <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                            Stream millions of tracks, discover new artists, and create the perfect soundtrack for every moment.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-gray-100 rounded-lg px-8 h-12 font-semibold"
                                onClick={() => navigate('/register')}
                            >
                                Start Listening
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/5 rounded-lg px-8 h-12"
                                onClick={() => navigate('/login')}
                            >
                                I have an account
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="border-t border-white/5 bg-white/[0.02]">
                    <div className="container mx-auto px-6 py-20">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="group">
                                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                                    <Headphones className="w-6 h-6 text-violet-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">High Quality Audio</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Experience music the way artists intended with crystal-clear sound quality.
                                </p>
                            </div>
                            <div className="group">
                                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center mb-4 group-hover:bg-fuchsia-500/20 transition-colors">
                                    <Disc3 className="w-6 h-6 text-fuchsia-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Endless Library</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Access millions of songs across every genre imaginable.
                                </p>
                            </div>
                            <div className="group">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                                    <Zap className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Smart Discovery</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Let our algorithm introduce you to your next favorite song.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-6">
                <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
                    © 2026 TunDuzz. Made with passion for music lovers.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
