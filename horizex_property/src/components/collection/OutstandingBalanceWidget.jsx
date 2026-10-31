import React from 'react';
import { Card } from '../Card';
import { Clock } from 'lucide-react';

export const OutstandingBalanceWidget = ({ aging = {} }) => {
  const buckets = [
    { label: 'Current', amount: aging.current || 0, color: 'bg-emerald-500' },
    { label: '0–30 Days', amount: aging.thirty || 0, color: 'bg-amber-500' },
    { label: '31–60 Days', amount: aging.sixty || 0, color: 'bg-orange-500' },
    { label: '61–90 Days', amount: aging.ninety || 0, color: 'bg-rose-500' },
    { label: '90+ Days', amount: aging.ninetyPlus || 0, color: 'bg-red-600' }
  ];

  const total = buckets.reduce((sum, b) => sum + b.amount, 0) || 1;

  return (
    <Card className="h-fit">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">Accounts Receivable Aging</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Outstanding balance distribution by overdue days</p>
          </div>
          <Clock size={16} className="text-indigo-600 shrink-0" />
        </div>

        <div className="space-y-5">
          {/* Custom horizontal stacked progress bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {buckets.map((b, idx) => (
              <div
                key={idx}
                style={{ width: `${(b.amount / total) * 100}%` }}
                className={`${b.color} h-full transition-all duration-300`}
                title={`${b.label}: $${b.amount.toLocaleString()}`}
              />
            ))}
          </div>

          {/* Bucket Legends and Details */}
          <div className="space-y-3 pt-2">
            {buckets.map((b, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${b.color}`}></span>
                    <span>{b.label}</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    ${b.amount.toLocaleString('en-CA')} ({Math.round((b.amount / total) * 100)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
