import React from 'react';
import {
    Building2,
    Users,
    TrendingUp,
    CircleDollarSign,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Home,
    Clock,
    Wallet,
    Wrench
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
    useGetOwnerDashboardStatsQuery,
    useGetOwnerFinancialPulseQuery,
    useGetOwnerProfileQuery
} from '../../store';

export const OwnerDashboard = () => {
    const navigate = useNavigate();
    const { data: rawData, isLoading: statsLoading } = useGetOwnerDashboardStatsQuery();
    const { data: financials, isLoading: pulseLoading } = useGetOwnerFinancialPulseQuery();
    const { data: profile } = useGetOwnerProfileQuery();

    const loading = statsLoading || pulseLoading;
    const ownerName = profile?.name || 'Owner';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const propCount = rawData?.propertyCount ?? rawData?.totalProperties ?? 0;
    const unitCount = rawData?.unitCount ?? rawData?.totalUnits ?? 0;
    const vacantUnits = rawData?.occupancy?.vacantUnits ?? 0;
    const occupiedUnits = Math.max(0, unitCount - vacantUnits);
    const occupancyPercent = unitCount > 0 ? Math.round((occupiedUnits / unitCount) * 100) : 0;
    const dues = rawData?.outstandingDues ?? 0;
    const monthlyRev = rawData?.monthlyRevenue ?? 0;
    const insuranceExpiryCount = rawData?.insuranceExpiryCount || 0;
    const tenants = rawData?.tenants || [];

    // Safely handle financials array
    let finList = [];
    if (Array.isArray(financials)) {
        finList = financials;
    } else if (financials && Array.isArray(financials.trajectory)) {
        finList = financials.trajectory.map(t => ({
            month: t.month || 'Current',
            expected: t.expected ?? t.amount ?? 0,
            collected: t.collected ?? t.amount ?? 0,
            dues: t.dues ?? 0
        }));
    } else if (financials && Array.isArray(financials.data)) {
        finList = financials.data;
    } else if (financials && Array.isArray(financials.financials)) {
        finList = financials.financials;
    }

    const sortedFinancials = [...finList].sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
    });
    const recentFinancials = sortedFinancials;

    if (loading) {
        return (
            <>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="space-y-8 pb-12">

                {/* STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[
                        { title: 'Total Properties', value: propCount, subValue: 'Active Portfolio', icon: Building2, color: 'bg-blue-500', path: '/owner/properties' },
                        { title: 'Total Units', value: unitCount, subValue: 'Total Units', icon: Home, color: 'bg-emerald-500', path: '/owner/properties' },
                        { title: 'Occupied Units', value: occupiedUnits, subValue: `${occupancyPercent}% Occupied`, icon: Users, color: 'bg-indigo-500', path: '/owner/properties' },
                        { title: 'Outstanding Dues', value: `$${dues.toLocaleString('en-CA')}`, subValue: 'Total Outstanding', icon: Wallet, color: 'bg-rose-500', path: '/owner/financials' },
                        { title: 'Monthly Income', value: `$${monthlyRev.toLocaleString('en-CA')}`, subValue: 'This Month', icon: TrendingUp, color: 'bg-emerald-500', path: '/owner/financials' },
                        { title: 'Leases Expiring', value: 4, subValue: 'Next 30 Days', icon: Clock, color: 'bg-purple-500', path: '/owner/properties' },
                        { title: 'Maintenance', value: 12, subValue: 'Open Tickets', icon: Wrench, color: 'bg-amber-500', path: '/owner/properties' },
                        { title: 'Vacant Units', value: vacantUnits, subValue: 'Available Units', icon: Home, color: 'bg-blue-500', path: '/owner/properties' }
                    ].map((card, idx) => (
                        <Link
                            key={idx}
                            to={card.path}
                            className="bg-white p-6 rounded-[22px] border border-slate-200 shadow-sm hover:shadow-md transition-all group active:scale-[0.98] flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                        <card.icon size={24} />
                                    </div>
                                    <ArrowUpRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                                </div>
                                <h4 className="text-slate-500 font-bold text-xs uppercase tracking-wider">{card.title}</h4>
                                <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{card.value}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.subValue}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Secondary Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Financial Pulse */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Recent Financial Pulse</h4>
                                <button onClick={() => navigate('/owner/financials')} className="text-[10px] md:text-xs font-bold text-indigo-600 hover:underline decoration-2">View Full Financials</button>
                            </div>
                            <div className="overflow-x-auto bg-slate-50 rounded-2xl border border-slate-100 -mx-4 md:mx-0">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead className="bg-slate-100/50">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Target</th>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actual Collected</th>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Remaining Dues</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {Array.isArray(recentFinancials) && recentFinancials.length > 0 ? (
                                            recentFinancials.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-white transition-colors group">
                                                    <td className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-700">{row.month}</td>
                                                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-slate-400 text-right font-mono">${Number(row.expected || 0).toLocaleString('en-CA')}</td>
                                                    <td className="px-4 md:px-6 py-4 text-sm font-bold text-slate-900 text-right font-mono">${Number(row.collected || 0).toLocaleString('en-CA')}</td>
                                                    <td className="px-4 md:px-6 py-4 text-right">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${row.dues > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {row.dues > 0 ? `$${Number(row.dues).toLocaleString('en-CA')}` : 'CLEAR'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-slate-400 text-sm font-medium italic">
                                                    No recent financial records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Tenants */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Active Tenants</h4>
                                <button onClick={() => navigate('/owner/properties')} className="text-[10px] md:text-xs font-bold text-indigo-600 hover:underline decoration-2">View All Properties</button>
                            </div>
                            <div className="overflow-x-auto bg-slate-50 rounded-2xl border border-slate-100 -mx-4 md:mx-0">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead className="bg-slate-100/50">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant Name</th>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property / Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {Array.isArray(tenants) && tenants.map((tenant, idx) => (
                                            <tr key={idx} className="hover:bg-white transition-colors group">
                                                <td className="px-4 md:px-6 py-4 text-sm font-bold text-slate-700">{tenant.name}</td>
                                                <td className="px-4 md:px-6 py-4 text-xs font-medium text-slate-500">{tenant.email}</td>
                                                <td className="px-4 md:px-6 py-4 text-xs font-bold text-slate-600">
                                                    {tenant.property} <span className="text-slate-400 mx-1">•</span> Unit {tenant.unit}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!Array.isArray(tenants) || tenants.length === 0) && (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-8 text-center text-slate-400 text-sm font-medium italic">No recent tenants found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access / Notice & Activity */}
                    <div className="space-y-6">
                        {insuranceExpiryCount > 0 && (
                            <div className="bg-zinc-900 rounded-3xl p-8 flex flex-col justify-between text-white shadow-2xl shadow-zinc-200 overflow-hidden relative group">
                                <div className="relative z-10 space-y-6">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black italic tracking-tight uppercase">Compliance Notice</h4>
                                        <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                                            {insuranceExpiryCount} properties have insurance policies expiring.
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
