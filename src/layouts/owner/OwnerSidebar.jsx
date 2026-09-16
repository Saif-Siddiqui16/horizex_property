import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Building2,
    CircleDollarSign,
    BarChart3,
    LogOut,
    ShieldCheck,
    MessageSquare,
    X
} from 'lucide-react';
import clsx from 'clsx';

export const OwnerSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isOwnerLoggedIn');
        localStorage.removeItem('ownerId');
        navigate('/owner/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/owner/dashboard' },
        { icon: Building2, label: 'Properties', path: '/owner/properties' },
        { icon: CircleDollarSign, label: 'Financials', path: '/owner/financials' },
        { icon: BarChart3, label: 'Reports', path: '/owner/reports' },
        { icon: BarChart3, label: 'Rent Roll', path: '/owner/rent-roll' },
        { icon: MessageSquare, label: 'Messages', path: '/owner/communication' },
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={clsx(
                    "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            <aside className={clsx(
                "fixed inset-y-0 left-0 lg:sticky lg:top-0 z-[60] w-72 bg-[#111827] border-r border-slate-800 flex flex-col h-screen shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className="h-16 flex items-center px-5 justify-between border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/owner/dashboard')}>
                        <div className="bg-white rounded-full p-0.5 shadow-md shrink-0 w-14 h-14 flex items-center justify-center overflow-hidden">
                            <img src="/assets/logo.png" alt="Horizex Logo" className="h-13 w-13 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase tracking-wider leading-none">Horizex</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real Estate</span>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-[6px] overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-2 mt-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
                    </div>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-bold transition-all duration-200 group",
                                isActive
                                    ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-lg shadow-blue-500/20"
                                    : "text-slate-400 hover:bg-[#1F2937] hover:text-white"
                            )}
                        >
                            <item.icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-slate-800 shrink-0">
                    <div className="bg-slate-800/20 rounded-xl p-2.5 border border-slate-800/60">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700 shadow-sm shrink-0">
                                <ShieldCheck size={16} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Access Mode</p>
                                <p className="text-xs font-bold text-slate-300 mt-1">Read-Only</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-rose-950/20 hover:border-rose-900/40 text-slate-400 hover:text-rose-400 text-[11px] font-bold transition-all cursor-pointer"
                    >
                        <LogOut size={13} />
                        <span>Secure Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
