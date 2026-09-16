import React from 'react';
import { Gavel, FileText, FileCheck, Calendar, Clock, Scale, CheckCircle2, ShieldAlert } from 'lucide-react';

export const TALKPICards = ({ metrics = {}, onFilterClick }) => {
  const cards = [
    {
      title: 'Open Cases',
      value: metrics.openCases ?? 0,
      description: 'Active disputes in progress',
      icon: Gavel,
      color: 'bg-indigo-600 text-white',
      filterType: 'status',
      filterValue: 'Open'
    },
    {
      title: 'Draft Cases',
      value: metrics.draftCases ?? 0,
      description: 'Cases being prepared',
      icon: FileText,
      color: 'bg-slate-400 text-white',
      filterType: 'status',
      filterValue: 'Draft'
    },
    {
      title: 'Filed Cases',
      value: metrics.filedCases ?? 0,
      description: 'Submitted to the TAL office',
      icon: FileCheck,
      color: 'bg-blue-500 text-white',
      filterType: 'status',
      filterValue: 'Filed'
    },
    {
      title: 'Hearings Scheduled',
      value: metrics.hearingsScheduled ?? 0,
      description: 'Court hearings with set dates',
      icon: Calendar,
      color: 'bg-orange-500 text-white',
      filterType: 'status',
      filterValue: 'Hearing Scheduled'
    },
    {
      title: 'Awaiting Decision',
      value: metrics.awaitingDecision ?? 0,
      description: 'Hearings done, pending outcome',
      icon: Clock,
      color: 'bg-amber-500 text-white',
      filterType: 'status',
      filterValue: 'Hearing Completed'
    },
    {
      title: 'Orders Issued',
      value: metrics.ordersIssued ?? 0,
      description: 'Enforceable orders from judge',
      icon: Scale,
      color: 'bg-emerald-600 text-white',
      filterType: 'status',
      filterValue: 'Order Issued'
    },
    {
      title: 'Closed Cases',
      value: metrics.closedCases ?? 0,
      description: 'Resolved and archived disputes',
      icon: CheckCircle2,
      color: 'bg-slate-700 text-white',
      filterType: 'status',
      filterValue: 'Closed'
    },
    {
      title: 'Urgent Cases',
      value: metrics.urgentCases ?? 0,
      description: 'High priority/risk matters',
      icon: ShieldAlert,
      color: 'bg-rose-600 text-white',
      filterType: 'priority',
      filterValue: 'Urgent'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          onClick={() => onFilterClick && onFilterClick(card.filterType, card.filterValue)}
          className="p-3 bg-white border border-slate-200 rounded-[18px] shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-300 group"
        >
          <div className="flex items-center justify-between w-full">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color} shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
              <card.icon size={16} />
            </div>
            <span className="text-xl font-black text-slate-800 font-mono tracking-tight">
              {card.value}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
              {card.title}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 leading-snug">
              {card.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
