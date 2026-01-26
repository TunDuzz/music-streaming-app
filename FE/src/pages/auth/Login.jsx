import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Disc3, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.username, formData.password);

        if (result.success) {
            if (result.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/app');
            }
        } else {
            setError(result.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px] opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[128px] opacity-50" />

            {/* Back Button */}
            <Button
                variant="ghost"
                className="absolute top-8 left-8 text-gray-400 hover:text-white"
                onClick={() => navigate('/')}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {/* Main Card */}
            <div className="w-full max-w-md mx-4 relative z-10">
                <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-3 rounded-xl mb-4 shadow-lg shadow-violet-500/20">
                            <Disc3 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">Welcome Back</h1>
                        <p className="text-gray-400 text-sm mt-2">Sign in to continue your journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                Email or Username
                            </Label>
                            <Input
                                type="text"
                                placeholder="name@example.com"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white h-11 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                    Password
                                </Label>
                                <a href="#" className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10 text-white h-11 pr-11 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] hover:shadow-violet-500/40"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing In...
                                </>
                            ) : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-white/5">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-white hover:text-violet-400 font-semibold transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
