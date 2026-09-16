import React from 'react';
import { DollarSign, Percent, AlertCircle, Calendar } from 'lucide-react';

export const CollectionKPICards = ({ metrics = {} }) => {
  const cards = [
    { title: 'Total Rent Due', value: `$${(metrics.totalDue || 0).toLocaleString('en-CA')}`, color: 'bg-blue-500 text-white', icon: DollarSign },
    { title: 'Total Collected', value: `$${(metrics.totalCollected || 0).toLocaleString('en-CA')}`, color: 'bg-emerald-500 text-white', icon: DollarSign },
    { title: 'Outstanding Bal', value: `$${(metrics.totalOutstanding || 0).toLocaleString('en-CA')}`, color: 'bg-rose-500 text-white', icon: AlertCircle },
    { title: 'Collection Rate', value: `${metrics.collectionRate || 0}%`, color: 'bg-indigo-500 text-white', icon: Percent },
    { title: 'Overdue Invoices', value: metrics.overdueCount || 0, color: 'bg-amber-500 text-white', icon: AlertCircle },
    { title: 'This Month Cash', value: `$${(metrics.thisMonthCollection || 0).toLocaleString('en-CA')}`, color: 'bg-purple-500 text-white', icon: Calendar },
    { title: 'Last Month Cash', value: `$${(metrics.lastMonthCollection || 0).toLocaleString('en-CA')}`, color: 'bg-slate-500 text-white', icon: Calendar }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate" title={card.title}>{card.title}</span>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${card.color} shrink-0`}>
              <card.icon size={12} />
            </div>
          </div>
          <span className="text-base font-black text-slate-800 font-mono tracking-tight">{card.value}</span>
        </div>
      ))}
    </div>
  );
};
