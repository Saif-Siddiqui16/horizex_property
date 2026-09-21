import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import api from '../api/client';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const res = await api.post('/api/auth/login', { email, password });

      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'ADMIN' || user.role === 'COWORKER') {
        localStorage.setItem('isLoggedIn', 'true');
        if (user.role === 'COWORKER') {
          try {
            const permRes = await api.get(`/api/admin/coworkers/${user.id}/permissions`);
            localStorage.setItem('permissions', JSON.stringify(permRes.data));
          } catch (e) { console.error('Error fetching coworker permissions:', e); }
        }
        navigate('/dashboard');
      }
      else if (user.role === 'TENANT') {
        localStorage.setItem('tenantLoggedIn', 'true');
        localStorage.setItem('currentTenantId', user.id);
        navigate('/tenant/dashboard');
      }
      else if (user.role === 'OWNER') {
        localStorage.setItem('isOwnerLoggedIn', 'true');
        localStorage.setItem('ownerId', user.id);
        navigate('/owner/dashboard');
      }
      else {
        setError('Unknown user role');
        localStorage.clear();
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@property.com');
      setPassword('123456');
    } else if (role === 'tenant') {
      setEmail('tenant@property.com');
      setPassword('123456');
    } else if (role === 'owner') {
      setEmail('owner@property.com');
      setPassword('123456');
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden relative items-center justify-center">
      
      {/* --- BACKGROUND LAYER --- */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80')",
          filter: "brightness(0.6) contrast(1.1)"
        }}
      />
      {/* Dynamic Gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900/80 to-black/90 mix-blend-multiply"></div>
      <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* --- MAIN LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-[440px] px-4 md:px-0 anim-slide-up">
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[32px] p-8 sm:p-10 flex flex-col relative overflow-hidden group">
          
          {/* Glass shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_2s_infinite]"></div>

          {/* Logo Area */}
          <div className="flex flex-col items-center justify-center mb-8 relative z-10">
            <div className="w-20 h-20 bg-white/95 rounded-2xl shadow-xl flex items-center justify-center p-3 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300 ring-4 ring-white/10">
              <img src="/assets/logo.png" alt="Horizex Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">Horizex Group</h1>
            <p className="text-[10px] font-bold text-blue-300 tracking-[0.3em] uppercase mt-1">Real Estate Management</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/20 border border-rose-500/50 backdrop-blur-md rounded-xl flex items-center gap-3 anim-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></div>
              <p className="text-xs font-semibold text-rose-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            {/* Email Input */}
            <div className="space-y-1.5 group/input">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block px-1 group-focus-within/input:text-white transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-400 transition-colors" size={16} />
                <input
                  type="email"
                  placeholder="name@horizex.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[48px] pl-11 pr-4 bg-black/20 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400/50 focus:bg-black/40 focus:ring-4 focus:ring-blue-400/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 group/input">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block px-1 group-focus-within/input:text-white transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-400 transition-colors" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[48px] pl-11 pr-11 bg-black/20 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400/50 focus:bg-black/40 focus:ring-4 focus:ring-blue-400/10 transition-all tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-[48px] mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold tracking-wide shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Access Portal'
              )}
            </button>
          </form>

          {/* Quick Demo Access (Glass Pills) */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3 relative z-10">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Quick Access Demos</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => autofillDemo('admin')}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200 hover:bg-white/10 hover:border-blue-400/30 transition-all flex items-center gap-1.5 backdrop-blur-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                Admin
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('tenant')}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200 hover:bg-white/10 hover:border-emerald-400/30 transition-all flex items-center gap-1.5 backdrop-blur-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                Tenant
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('owner')}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200 hover:bg-white/10 hover:border-purple-400/30 transition-all flex items-center gap-1.5 backdrop-blur-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
                Owner
              </button>
            </div>
          </div>

        </div>
        
        {/* Footer Text */}
        <p className="text-center text-[10px] font-medium text-white/40 mt-6 tracking-wide">
          © {new Date().getFullYear()} Horizex Group. All rights reserved.
        </p>
      </div>
      
    </div>
  );
};
