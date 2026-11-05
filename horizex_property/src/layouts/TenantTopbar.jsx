import React, { useState, useEffect } from 'react';
import { Menu, Globe, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetTenantProfileQuery, loggedOut } from '../store';

export const TenantTopbar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [title, setTitle] = useState('Dashboard');
    const [language, setLanguage] = useState('EN');

    const { data: profile } = useGetTenantProfileQuery();

    const tenantName = profile?.name || 'Tenant';
    const initials = profile?.name
        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'TN';
    const buildingInfo = profile?.unitNumber
        ? `${profile.buildingName || 'Horizex Group'} – ${profile.unitNumber}`
        : (profile?.buildingName || 'Horizex Group');

    useEffect(() => {
        const handleTitleChange = (e) => setTitle(e.detail);
        window.addEventListener('pageTitleChange', handleTitleChange);
        return () => window.removeEventListener('pageTitleChange', handleTitleChange);
    }, []);

    const toggleLanguage = () => {
        const newLangCode = language === 'EN' ? 'fr' : 'en';
        const newLangDisplay = language === 'EN' ? 'FR' : 'EN';
        setLanguage(newLangDisplay);
        const masterSelect = document.querySelector("#google_translate_master_container select.goog-te-combo");
        if (masterSelect) {
            masterSelect.value = newLangCode;
            masterSelect.dispatchEvent(new Event('change'));
        }
    };

    const handleLogout = () => {
        dispatch(loggedOut());
        localStorage.removeItem('tenantLoggedIn');
        localStorage.removeItem('currentTenantId');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/tenant/login');
    };

    useEffect(() => {
        const syncWithMaster = () => {
            const masterSelect = document.querySelector("#google_translate_master_container select.goog-te-combo");
            if (masterSelect) {
                const currentGoogleLang = masterSelect.value === 'fr' ? 'FR' : 'EN';
                if (currentGoogleLang !== language) setLanguage(currentGoogleLang);
            }
        };
        const interval = setInterval(syncWithMaster, 1000);
        return () => clearInterval(interval);
    }, [language]);

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100/80 flex items-center justify-between px-3 sm:px-4 lg:px-8 sticky top-0 z-40 w-full">
            {/* LEFT */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <button
                    className="block lg:hidden text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition shrink-0"
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </button>
                {location.pathname !== '/tenant/dashboard' && (
                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-600 p-1.5 sm:p-2 hover:bg-slate-50 rounded-xl transition shrink-0"
                        title="Go Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-800 tracking-tight truncate max-w-[130px] sm:max-w-[220px] md:max-w-none">{title}</h1>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
                {/* Language Switcher */}
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-primary/5 hover:text-primary transition-colors group h-9 notranslate"
                >
                    <Globe size={15} className="text-slate-400 group-hover:text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-primary">
                        {language}
                    </span>
                </button>

                {/* Profile */}
                <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-100 pl-2 sm:pl-3 md:pl-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{tenantName}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{buildingInfo}</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0 cursor-default">
                        {initials}
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-bold cursor-pointer transition-all hover:bg-rose-50 hover:text-danger hover:border-rose-100"
                    title="Logout"
                >
                    <LogOut size={15} />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};
