import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Disc3, Eye, EyeOff, Loader2, ArrowLeft, Check, X } from 'lucide-react';

const PasswordStrengthBar = ({ password }) => {
    if (!password) return null;

    const calculateStrength = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = calculateStrength(password);

    const getColor = (score) => {
        if (score === 0) return 'bg-gray-700';
        if (score <= 2) return 'bg-red-500';
        if (score <= 3) return 'bg-yellow-500';
        if (score <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getLabel = (score) => {
        if (score === 0) return 'Enter password';
        if (score <= 2) return 'Weak';
        if (score <= 3) return 'Medium';
        if (score <= 4) return 'Good';
        return 'Strong';
    };

    // Requirements list
    const requirements = [
        { label: "At least 8 characters", met: password.length > 8 },
        { label: "Uppercase & Lowercase", met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
        { label: "Number & Symbol", met: /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) }
    ];

    return (
        <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
                <span className={`${strength > 0 ? 'text-white' : 'text-gray-500'} font-medium transition-colors`}>
                    {getLabel(strength)}
                </span>
                <span className="text-gray-500">{strength}/5</span>
            </div>

            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getColor(strength)} transition-all duration-300 ease-out`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                />
            </div>

            <div className="grid grid-cols-1 gap-1 pt-1">
                {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-[10px] transition-colors duration-300">
                        {req.met ?
                            <Check size={10} className="text-green-500" /> :
                            <div className="w-2.5 h-2.5 rounded-full border border-gray-600" />
                        }
                        <span className={req.met ? "text-gray-300" : "text-gray-500"}>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        const result = await register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            displayName: formData.displayName
        });

        if (result.success) {
            navigate('/app');
        } else {
            setError(result.error || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden py-10">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[128px] opacity-50" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px] opacity-50" />

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
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-gradient-to-br from-fuchsia-600 to-violet-600 p-3 rounded-xl mb-4 shadow-lg shadow-fuchsia-500/20">
                            <Disc3 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">Create Account</h1>
                        <p className="text-gray-400 text-sm mt-2">Join us and start streaming today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                Display Name
                            </Label>
                            <Input
                                type="text"
                                placeholder="Your Name"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white h-10 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                Email
                            </Label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white h-10 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                Username
                            </Label>
                            <Input
                                type="text"
                                placeholder="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white h-10 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10 text-white h-10 pr-10 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <PasswordStrengthBar password={formData.password} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                Confirm Password
                            </Label>
                            <Input
                                type="password"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white h-10 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all font-medium"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-500/25 transition-all hover:scale-[1.02] hover:shadow-fuchsia-500/40 mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-white/5">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-white hover:text-fuchsia-400 font-semibold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
