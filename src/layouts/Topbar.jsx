import React, { useState, useEffect } from 'react';
import { Menu, LogOut, MessageSquare, Bell, ArrowLeft } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import clsx from 'clsx';
import { CompanySelector } from '../components/CompanySelector';

export const Topbar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { i18n } = useTranslation();
    const [title, setTitle] = useState('Overview');
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifCount, setNotifCount] = useState(0);
    const [currentLang, setCurrentLang] = React.useState(i18n.language?.split('-')[0] || 'en');

    useEffect(() => {
        const handleTitleChange = (e) => setTitle(e.detail);
        window.addEventListener('pageTitleChange', handleTitleChange);
        return () => window.removeEventListener('pageTitleChange', handleTitleChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
    };

    const updateNotifCount = () => {
        try {
            const list = JSON.parse(localStorage.getItem('mock_integrations_notifications') || '[]');
            const count = list.filter(n => !n.isRead && !n.isDismissed && !n.isArchived).length;
            setNotifCount(count);
        } catch(e) {}
    };

    useEffect(() => {
        updateNotifCount();
        window.addEventListener('notifications_updated', updateNotifCount);
        const interval = setInterval(updateNotifCount, 5000);
        return () => {
            window.removeEventListener('notifications_updated', updateNotifCount);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await api.get('/api/communication/unread-stats');
                setUnreadCount(res.data.count || 0);
            } catch (err) { }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const syncWithGoogle = () => {
            const masterSelect = document.querySelector("#google_translate_master_container select.goog-te-combo");
            if (masterSelect && masterSelect.value && masterSelect.value !== currentLang) {
                setCurrentLang(masterSelect.value);
                i18n.changeLanguage(masterSelect.value);
            }
        };
        const interval = setInterval(syncWithGoogle, 1000);
        return () => clearInterval(interval);
    }, [currentLang, i18n]);

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        setCurrentLang(lang);
        const masterSelect = document.querySelector("#google_translate_master_container select.goog-te-combo");
        if (masterSelect) {
            masterSelect.value = lang;
            masterSelect.dispatchEvent(new Event("change"));
        }
    };

    return (
        <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 transition-all">
            {/* LEFT */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button
                    className="block lg:hidden text-zinc-500 p-2 hover:bg-zinc-100 hover:text-zinc-900 rounded-[var(--radius-md)] transition-colors shrink-0"
                    onClick={onMenuClick}
                >
                    <Menu size={20} />
                </button>
                {location.pathname !== '/dashboard' && (
                    <button
                        onClick={() => navigate(-1)}
                        className="text-zinc-500 p-1.5 sm:p-2 hover:bg-zinc-100 hover:text-zinc-900 rounded-[var(--radius-md)] transition-colors shrink-0"
                        title="Go Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight truncate">{title}</h1>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {/* COMPANY SELECTOR */}
                <CompanySelector />

                <div className="h-6 w-px bg-zinc-200 hidden sm:block mx-1"></div>

                {/* SMS NOTIFICATION */}
                <Link
                    to="/admin/sms/inbox"
                    className="relative p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors flex items-center justify-center w-9 h-9"
                    title="SMS Inbox"
                >
                    <MessageSquare size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                    )}
                </Link>

                {/* LANGUAGE SWITCHER */}
                <div className="flex items-center bg-zinc-100/80 p-0.5 rounded-[var(--radius-md)] h-9 border border-zinc-200/50 notranslate">
                    <button
                        onClick={() => handleLanguageChange('en')}
                        className={clsx(
                            "px-2.5 h-full text-xs font-semibold rounded-[var(--radius-sm)] transition-all",
                            currentLang === 'en'
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
                        )}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => handleLanguageChange('fr')}
                        className={clsx(
                            "px-2.5 h-full text-xs font-semibold rounded-[var(--radius-sm)] transition-all",
                            currentLang === 'fr'
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
                        )}
                    >
                        FR
                    </button>
                </div>

                {/* LOGOUT */}
                <button
                    className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-red-600 transition-colors cursor-pointer"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
};
