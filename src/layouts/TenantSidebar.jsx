import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    Files,
    ShieldCheck,
    Wrench,
    LogOut,
    X,
    CreditCard as PaymentIcon,
    MessageSquare,
    BarChart3,
    Car
} from "lucide-react";
import clsx from "clsx";

const TENANT_NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/tenant/dashboard" },
    { icon: FileText, label: "My Lease", path: "/tenant/lease" },
    { icon: PaymentIcon, label: "My Invoices", path: "/tenant/invoices" },
    { icon: CreditCard, label: "Pay Rent", path: "/tenant/payments" },
    { icon: Files, label: "My Documents", path: "/tenant/documents" },
    { icon: ShieldCheck, label: "Insurance", path: "/tenant/insurance" },
    { icon: Wrench, label: "Maintenance Tickets", path: "/tenant/tickets" },
    { icon: MessageSquare, label: "Messages", path: "/tenant/communication" },
    { icon: Car, label: "My Vehicles", path: "/tenant/vehicles" },
    { icon: BarChart3, label: "Reports", path: "/tenant/reports" },
];

export const TenantSidebar = ({ isOpen, onClose }) => {
    const handleLogout = () => {
        localStorage.removeItem("tenantLoggedIn");
        window.location.href = "/tenant/login";
    };

    return (
        <>
            <div
                className={clsx(
                    "fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 block" : "opacity-0 hidden"
                )}
                onClick={onClose}
            />

            <aside className={clsx(
                "fixed left-0 top-0 h-screen w-[260px] bg-[#111827] border-r border-slate-800 shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "lg:translate-x-0"
            )}>
                <div className="h-16 flex items-center px-5 justify-between border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-full p-0.5 shadow-md shrink-0 w-14 h-14 flex items-center justify-center overflow-hidden">
                            <img src="/assets/logo.png" alt="Horizex Logo" className="h-13 w-13 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase tracking-wider leading-none">Horizex</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real Estate</span>
                        </div>
                    </div>
                    <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-md transition" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-[6px] custom-scrollbar flex flex-col">
                    <div className="flex-1 space-y-[6px]">
                        {TENANT_NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    clsx(
                                        "flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-bold transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-lg shadow-blue-500/20"
                                            : "text-slate-400 hover:bg-[#1F2937] hover:text-white"
                                    )
                                }
                              >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-600/20 hover:text-rose-400 transition-all duration-200 mt-auto border border-transparent"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>
        </>
    );
};
