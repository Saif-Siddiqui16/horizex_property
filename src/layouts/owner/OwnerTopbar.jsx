import React, { useState, useEffect } from 'react';
import { Menu, Globe, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export const OwnerTopbar = ({ title, onMenuClick }) => {
    const navigate = useNavigate();
    const [ownerName, setOwnerName] = useState('Owner User');
    const [ownerInitials, setOwnerInitials] = useState('OU');
    const [propertyName, setPropertyName] = useState('Horizex Group');
    const [language, setLanguage] = useState('EN');

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
        localStorage.removeItem('isOwnerLoggedIn');
        localStorage.removeItem('ownerId');
        navigate('/owner/login');
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/owner/profile');
                if (res.data.name) {
                    setOwnerName(res.data.name);
                    const initials = res.data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    setOwnerInitials(initials);
                }
            } catch (err) {
                setOwnerName('Owner');
                setOwnerInitials('OW');
            }
        };
        fetchProfile();
    }, []);

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
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
            {/* LEFT */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-black text-slate-900 tracking-tight truncate max-w-[150px] md:max-w-none">{title}</h1>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Language Toggle */}
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
                <div className="flex items-center gap-3 border-l border-slate-100 pl-3 md:pl-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{ownerName}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{propertyName}</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0 cursor-default">
                        {ownerInitials}
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
