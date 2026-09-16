import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../api/client';

export const OwnerLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('owner@example.com');
    const [password, setPassword] = useState('123456');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/api/auth/login', { email, password });

            if (res.data.user.role !== 'OWNER' && res.data.user.role !== 'ADMIN') {
                setError('Access denied. Not an owner account.');
                setLoading(false);
                return;
            }

            const { accessToken, user } = res.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('isOwnerLoggedIn', 'true');
            localStorage.setItem('ownerId', user.id);

            navigate('/owner/dashboard');
        } catch (err) {
            console.error(err);
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const autofillDemo = () => {
        setEmail('owner@example.com');
        setPassword('123456');
    };

    return (
        <div className="flex h-screen w-screen bg-[#F4F8FF] font-sans overflow-hidden">
            {/* LEFT FORM PANEL */}
            <div className="w-full lg:w-[42%] h-full flex flex-col justify-center items-center p-4 md:p-6 z-10 overflow-y-auto custom-scrollbar">
                <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-md border border-slate-100 rounded-[22px] p-6 md:p-8 shadow-float flex flex-col my-auto">

                    <div className="flex items-center gap-3 mb-5">
                        <div className="bg-white border border-slate-200 shadow-md rounded-full p-0.5 shrink-0 w-20 h-20 flex items-center justify-center overflow-hidden">
                            <img src="/assets/logo.png" alt="Horizex Logo" className="h-19 w-19 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800 uppercase tracking-wider">Horizex Group</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real Estate</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-1">Owner Login</h2>
                    <p className="text-[11px] text-slate-400 font-semibold mb-4">Secure access to your property portfolio</p>

                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl border border-rose-100 flex items-center gap-2">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block px-1">Owner Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[40px] pl-[54px] pr-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs text-slate-700 placeholder:text-slate-300"
                                    placeholder="owner@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block px-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-[40px] pl-[54px] pr-[44px] rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs text-slate-700 placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-[40px] bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white border-0 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-200 active:scale-[0.98] cursor-pointer mt-4 flex items-center justify-center gap-1.5"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Enter Portal'}
                            {!loading && <ArrowRight size={14} />}
                        </button>
                    </form>

                    {/* Quick Demo buttons */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 mt-5">
                        <div className="flex items-center justify-between">
                            <strong className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Demo Credentials</strong>
                            <button onClick={autofillDemo} className="text-[9px] font-black text-primary hover:text-blue-700 hover:underline uppercase tracking-wider">Autofill</button>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[11px] font-medium text-slate-500">Email: <span className="text-slate-700 font-bold">owner@example.com</span></p>
                            <p className="text-[11px] font-medium text-slate-500">Password: <span className="text-slate-700 font-bold">123456</span></p>
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                            Are you an Admin?{" "}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-primary font-bold hover:underline cursor-pointer"
                            >
                                Admin Login
                            </button>
                        </p>
                    </div>

                </div>
            </div>

            {/* RIGHT BACKGROUND IMAGE PANEL */}
            <div className="hidden lg:block lg:w-[58%] h-full relative">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 to-slate-900/10"></div>
            </div>
        </div>
    );
};
