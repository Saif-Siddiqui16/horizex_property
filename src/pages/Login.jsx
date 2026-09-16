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
    <div className="flex h-screen w-full bg-[#F4F8FF] font-sans overflow-hidden relative">
      {/* LEFT FORM PANEL */}
      <div className="w-full lg:w-[42%] h-full flex flex-col items-center p-4 sm:p-6 z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-md border border-slate-100 rounded-[22px] p-6 md:p-8 shadow-float flex flex-col my-auto mx-auto">

          <div className="flex items-center gap-3 mb-5">
            <div className="bg-white border border-slate-200 shadow-md rounded-full p-0.5 shrink-0 w-20 h-20 flex items-center justify-center overflow-hidden">
              <img src="/assets/logo.png" alt="Horizex Logo" className="h-19 w-19 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800 uppercase tracking-wider">Horizex Group</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real Estate</span>
            </div>
          </div>

          <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-1">Login</h2>
          <p className="text-[11px] text-slate-400 font-semibold mb-4">Sign in to manage your property portfolio</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[40px] pl-[54px] pr-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs text-slate-700 placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[40px] pl-[54px] pr-[44px] rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs text-slate-700 placeholder:text-slate-300"
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
              className="w-full h-[40px] bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white border-0 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all duration-200 active:scale-[0.98] cursor-pointer mt-4"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Internal Access / Demo</p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => autofillDemo('admin')}
                className="px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-1"
              >
                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                Admin
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('tenant')}
                className="px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-1"
              >
                <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                Tenant
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('owner')}
                className="px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-1"
              >
                <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                Owner
              </button>
            </div>
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
