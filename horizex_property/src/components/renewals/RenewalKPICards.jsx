import React from 'react';
import { FileText, Calendar, CheckCircle2, MessageSquare, AlertTriangle, AlertCircle, Trash2, ShieldAlert } from 'lucide-react';

export const RenewalKPICards = ({ renewals = [] }) => {
  const isDueThisMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const stats = [
    {
      title: 'Total Renewals',
      value: renewals.length,
      color: 'bg-indigo-500 text-white',
      textColor: 'text-indigo-600',
      icon: FileText
    },
    {
      title: 'Due This Month',
      value: renewals.filter(r => isDueThisMonth(r.renewalDueDate)).length,
      color: 'bg-amber-500 text-white',
      textColor: 'text-amber-600',
      icon: Calendar
    },
    {
      title: 'Accepted',
      value: renewals.filter(r => r.status === 'Accepted').length,
      color: 'bg-emerald-500 text-white',
      textColor: 'text-emerald-600',
      icon: CheckCircle2
    },
    {
      title: 'Negotiating',
      value: renewals.filter(r => r.status === 'Negotiating').length,
      color: 'bg-purple-600 text-white',
      textColor: 'text-purple-600',
      icon: MessageSquare
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-4 rounded-[22px] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color} shadow-sm`}>
              <stat.icon size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
