import React, { useState, useEffect } from 'react';

import { Card } from '../components/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import {
  DollarSign,
  ShieldCheck,
  Receipt,
  TrendingUp,
  Building2,
  BarChart3,
  Wrench,
  FileText,
  Activity,
  Clock
} from 'lucide-react';

import api from '../api/client';

export const RevenueDashboard = () => {
const [__forceUpdate, __setForceUpdate] = useState(0);
  useEffect(() => {
    const handleUpdate = () => __setForceUpdate(p => p + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    actualRevenue: 0,
    actualRent: 0,
    actualDeposit: 0,
    actualServiceFees: 0,
    projectedRevenue: 0,
    totalRevenue: 0,
    monthlyRevenue: [],
    revenueByProperty: [],
    recentActivity: []
  });

  const fetchStats = async (ownerId = '') => {
    try {
      setLoading(true);
      const ownerParam = ownerId ? `?ownerId=${ownerId}` : '';
      const [res, dashRes] = await Promise.all([
        api.get(`/api/admin/analytics/revenue${ownerParam}`),
        api.get(`/api/admin/dashboard/stats${ownerParam}`)
      ]);
      const data = res.data;

      // Ensure chronological sorting of monthlyRevenue (instead of alphabetical)
      const parseMonth = (s) => {
        if (!s || typeof s !== 'string') return 0;
        if (s.includes('-')) {
          const [y, m] = s.split('-');
          return new Date(y, parseInt(m, 10) - 1).getTime();
        }
        const [mName, y] = s.split(' ');
        const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        const shortMonthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

        let mIdx = monthNames.indexOf(mName.toLowerCase());
        if (mIdx === -1) mIdx = shortMonthNames.indexOf(mName.toLowerCase());

        return new Date(y, mIdx !== -1 ? mIdx : 0).getTime();
      };

      if (data.monthlyRevenue) {
        data.monthlyRevenue.sort((a, b) => parseMonth(a.month) - parseMonth(b.month));
      }

      // Also sort monthly data inside each property
      if (data.revenueByProperty) {
        data.revenueByProperty.forEach(p => {
          if (p.monthly) {
            p.monthly.sort((a, b) => parseMonth(a.month) - parseMonth(b.month));
          }
        });
      }

      setStats({
        ...data,
        recentActivity: dashRes.data.recentActivity || []
      });
      setSelectedMonth('all'); // reset month filter on owner change
    } catch (e) {
      console.error('Revenue Fetch Error:', e);
      setStats({
        actualRevenue: 0,
        projectedRevenue: 0,
        totalRevenue: 0,
        monthlyRevenue: [],
        revenueByProperty: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleCompanyChange = () => {
      fetchStats();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  // Format month label: "2025-03" → "Mar '25" or "March 2026" → "Mar '26"
  const formatMonth = (val) => {
    if (!val) return '';
    if (val.includes('-')) {
      const [year, mon] = val.split('-');
      const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${names[parseInt(mon, 10) - 1]} '${year.slice(2)}`;
    }
    const parts = val.split(' ');
    if (parts.length === 2) {
      const longMonth = parts[0];
      const year = parts[1];
      return `${longMonth.slice(0, 3)} '${year.slice(2)}`;
    }
    return val;
  };

  // Helper for recent activity metadata & aesthetics
  const getActivityMeta = (text = '') => {
    const lower = text.toLowerCase();
    if (lower.includes('ticket') || lower.includes('maintenance') || lower.includes('repair')) {
      return {
        category: 'Maintenance',
        tag: 'Maintenance',
        icon: Wrench,
        badgeBg: 'bg-amber-50',
        textColor: 'text-amber-600',
        tagBg: 'bg-amber-50/80',
        tagText: 'text-amber-700',
        tagBorder: 'border-amber-200/60'
      };
    }
    if (lower.includes('rent') || lower.includes('payment') || lower.includes('paid') || lower.includes('$')) {
      return {
        category: 'Payment',
        tag: 'Revenue Inflow',
        icon: DollarSign,
        badgeBg: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        tagBg: 'bg-emerald-50/80',
        tagText: 'text-emerald-700',
        tagBorder: 'border-emerald-200/60'
      };
    }
    if (lower.includes('lease') || lower.includes('tenant') || lower.includes('agreement')) {
      return {
        category: 'Leasing',
        tag: 'Lease Signed',
        icon: FileText,
        badgeBg: 'bg-blue-50',
        textColor: 'text-blue-600',
        tagBg: 'bg-blue-50/80',
        tagText: 'text-blue-700',
        tagBorder: 'border-blue-200/60'
      };
    }
    if (lower.includes('inspection') || lower.includes('safety') || lower.includes('check')) {
      return {
        category: 'Inspection',
        tag: 'Safety Check',
        icon: ShieldCheck,
        badgeBg: 'bg-purple-50',
        textColor: 'text-purple-600',
        tagBg: 'bg-purple-50/80',
        tagText: 'text-purple-700',
        tagBorder: 'border-purple-200/60'
      };
    }
    return {
      category: 'System',
      tag: 'Activity',
      icon: Activity,
      badgeBg: 'bg-zinc-100',
      textColor: 'text-zinc-600',
      tagBg: 'bg-zinc-100',
      tagText: 'text-zinc-700',
      tagBorder: 'border-zinc-200'
    };
  };

  // Available months for filter (from monthlyRevenue)
  const availableMonths = stats.monthlyRevenue.map(m => m.month);

  // Revenue by property — filtered by selected month if one is chosen
  const filteredRevenueByProperty = stats.revenueByProperty.map(p => {
    if (selectedMonth === 'all') {
      return p; // cumulative
    }
    const monthEntry = (p.monthly || []).find(m => m.month === selectedMonth);
    if (!monthEntry) return { ...p, amount: 0, rent: 0, deposit: 0, serviceFees: 0, _noData: true };
    return { ...p, amount: monthEntry.amount, rent: monthEntry.rent, deposit: monthEntry.deposit, serviceFees: monthEntry.serviceFees };
  });

  return (
    <>
      <div className="flex flex-col gap-6">

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
          </div>
        ) : (
          <>
            {/* KPI STAT CARDS (TOP 3 CARDS) */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="saas-card p-5 flex flex-col justify-between border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Total Rent</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none" title={`$${(stats.actualRent || 0).toLocaleString('en-CA')}`}>
                    ${(stats.actualRent || 0).toLocaleString('en-CA')}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-2 font-medium flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-blue-500" />
                    Net rental income collected
                  </p>
                </div>
              </div>

              <div className="saas-card p-5 flex flex-col justify-between border-l-4 border-l-purple-500 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Total Deposits</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none" title={`$${(stats.actualDeposit || 0).toLocaleString('en-CA')}`}>
                    ${(stats.actualDeposit || 0).toLocaleString('en-CA')}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-2 font-medium flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-purple-500" />
                    Security deposits received
                  </p>
                </div>
              </div>

              <div className="saas-card p-5 flex flex-col justify-between border-l-4 border-l-amber-500 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Total Fees</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                    <Receipt size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none" title={`$${(stats.actualServiceFees || 0).toLocaleString('en-CA')}`}>
                    ${(stats.actualServiceFees || 0).toLocaleString('en-CA')}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-2 font-medium flex items-center gap-1.5">
                    <Receipt size={13} className="text-amber-500" />
                    Service and late fees collected
                  </p>
                </div>
              </div>
            </section>

            {/* UPPER ROW: 2 CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

              {/* CARD 1: Revenue Trends (Monthly) */}
              <Card
                title="Revenue Trends (Monthly)"
                action={
                  <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      Rent
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      Deposit
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      Fees
                    </span>
                  </div>
                }
                className="h-full flex flex-col"
              >
                {stats.monthlyRevenue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[320px] text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                      <BarChart3 size={24} />
                    </div>
                    <p className="text-sm font-semibold text-zinc-700">No revenue data available yet</p>
                    <p className="text-xs text-zinc-400 mt-1">Transactions will appear here once recorded</p>
                  </div>
                ) : (
                  <div className="w-full h-[320px] pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthlyRevenue} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                        <XAxis
                          dataKey="month"
                          stroke="#a1a1aa"
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={{ stroke: '#f4f4f5' }}
                          tickFormatter={formatMonth}
                        />
                        <YAxis
                          stroke="#a1a1aa"
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(244, 244, 245, 0.6)' }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const total = payload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);
                              return (
                                <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-zinc-100 min-w-[170px]">
                                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    {formatMonth(label)}
                                  </p>
                                  <div className="space-y-1.5">
                                    {payload.map((entry, i) => (
                                      <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 font-medium text-zinc-600">
                                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                          {entry.name}
                                        </span>
                                        <span className="font-bold text-zinc-900">
                                          ${Number(entry.value).toLocaleString('en-CA')}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs font-bold">
                                    <span className="text-zinc-500">Total</span>
                                    <span className="text-zinc-900">${total.toLocaleString('en-CA')}</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="rent" name="Rent" stackId="a" fill="#3b82f6" barSize={34}>
                          <LabelList
                            dataKey="rent"
                            position="top"
                            style={{ fontSize: '9px', fill: '#64748b', fontWeight: '600' }}
                            formatter={(v) => v > 0 ? `$${parseFloat(v) >= 1000 ? (parseFloat(v) / 1000).toFixed(1) + 'k' : parseFloat(v).toFixed(0)}` : ''}
                          />
                        </Bar>
                        <Bar dataKey="deposit" name="Deposit" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="serviceFees" name="Service Fees" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              {/* CARD 2: Revenue by Property */}
              <Card
                title="Revenue by Property"
                action={
                  availableMonths.length > 0 && (
                    <div className="relative">
                      <select
                        className="text-xs font-semibold border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-700 bg-zinc-50 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 transition-all cursor-pointer shadow-2xs"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        <option value="all">Year-to-Date (All Months)</option>
                        {availableMonths.map(m => (
                          <option key={m} value={m}>{formatMonth(m)}</option>
                        ))}
                      </select>
                    </div>
                  )
                }
                className="h-full flex flex-col"
              >
                <div className="max-h-[320px] overflow-y-auto pr-1">
                  <ul className="p-0 list-none space-y-2">
                    {filteredRevenueByProperty.map((p, index) => (
                      <li
                        key={index}
                        className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/40 hover:bg-white hover:border-zinc-200 hover:shadow-2xs transition-all duration-150"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
                              <Building2 size={16} />
                            </div>
                            <span className="font-semibold text-zinc-900 text-sm truncate">{p.name}</span>
                          </div>
                          <span className={`text-base font-bold tabular-nums ${p._noData ? 'text-zinc-400 font-normal text-sm' : 'text-zinc-900'}`}>
                            ${(p.amount || 0).toLocaleString('en-CA')}
                          </span>
                        </div>
                        {p._noData ? (
                          <p className="text-xs text-zinc-400 italic pl-10.5">No revenue for {formatMonth(selectedMonth)}</p>
                        ) : (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs pl-10.5 text-zinc-500 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Rent: ${(p.rent || 0).toLocaleString('en-CA')}
                            </span>
                            <span className="text-zinc-300">•</span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                              Deposit: ${(p.deposit || 0).toLocaleString('en-CA')}
                            </span>
                            <span className="text-zinc-300">•</span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Fees: ${(p.serviceFees || 0).toLocaleString('en-CA')}
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                    {stats.revenueByProperty.length === 0 && (
                      <li className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
                          <Building2 size={20} />
                        </div>
                        <p className="text-sm font-semibold text-zinc-600">No properties found</p>
                        <p className="text-xs text-zinc-400 mt-0.5">No revenue recorded for properties</p>
                      </li>
                    )}
                  </ul>
                </div>
              </Card>

            </div>

            {/* LOWER ROW: 1 CARD (RECENT ACTIVITY - FULL WIDTH) */}
            <div className="w-full">
              <Card
                title="Recent Activity"
                action={
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600">
                    {stats.recentActivity?.length || 0} Events
                  </span>
                }
                className="w-full"
              >
                {(!stats.recentActivity || stats.recentActivity.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
                      <Clock size={20} />
                    </div>
                    <p className="text-sm font-semibold text-zinc-600">No recent activity recorded</p>
                    <p className="text-xs text-zinc-400 mt-0.5">System updates and transactions will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stats.recentActivity.map((activity, index) => {
                      const meta = getActivityMeta(activity);
                      const IconComponent = meta.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3.5 p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-zinc-200 hover:shadow-xs transition-all duration-150"
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${meta.badgeBg} ${meta.textColor}`}>
                            <IconComponent size={17} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${meta.tagBg} ${meta.tagText} ${meta.tagBorder}`}>
                                {meta.tag}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-zinc-800 leading-snug">
                              {activity}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

          </>
        )}

      </div>
    </>
  );
};
