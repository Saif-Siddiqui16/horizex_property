import React from 'react';
import { Card } from '../Card';
import { PieChart as PieIcon } from 'lucide-react';

export const RenewalStatusChart = ({ renewals = [] }) => {
  const total = renewals.length || 1;
  const counts = {
    Accepted: renewals.filter(r => r.status === 'Accepted').length,
    Negotiating: renewals.filter(r => r.status === 'Negotiating').length,
    Refused: renewals.filter(r => r.status === 'Refused').length,
    'Open Case': renewals.filter(r => r.status === 'Open Case').length,
    Other: renewals.filter(r => !['Accepted', 'Negotiating', 'Refused', 'Open Case'].includes(r.status)).length
  };

  const percentages = {
    Accepted: Math.round((counts.Accepted / total) * 100),
    Negotiating: Math.round((counts.Negotiating / total) * 100),
    Refused: Math.round((counts.Refused / total) * 100),
    'Open Case': Math.round((counts['Open Case'] / total) * 100),
    Other: Math.round((counts.Other / total) * 100)
  };

  const chartSegments = [
    { label: 'Accepted', value: counts.Accepted, pct: percentages.Accepted, color: 'bg-emerald-500', barColor: '#10b981' },
    { label: 'Negotiating', value: counts.Negotiating, pct: percentages.Negotiating, color: 'bg-purple-500', barColor: '#a855f7' },
    { label: 'Refused', value: counts.Refused, pct: percentages.Refused, color: 'bg-rose-500', barColor: '#f43f5e' },
    { label: 'Open Case', value: counts['Open Case'], pct: percentages['Open Case'], color: 'bg-orange-500', barColor: '#f97316' },
    { label: 'Other', value: counts.Other, pct: percentages.Other, color: 'bg-slate-400', barColor: '#94a3b8' }
  ].filter(s => s.value > 0);

  return (
    <div className="saas-card p-5 rounded-[22px] bg-white shadow-sm border border-slate-200 h-[288px] max-h-[288px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">Status Distribution</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Lease renewals outcome breakdown</p>
        </div>
        <PieIcon className="text-indigo-500 shrink-0" size={18} />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
        {renewals.length === 0 ? (
          <div className="flex items-center justify-center h-full py-12 text-slate-400">
            <span className="text-xs font-medium">No renewal stats available</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Visual stacked progress bar chart */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shrink-0">
              {chartSegments.map((seg, idx) => (
                <div
                  key={idx}
                  style={{ width: `${(seg.value / total) * 100}%` }}
                  className={`${seg.color} h-full transition-all duration-500`}
                  title={`${seg.label}: ${seg.value} (${seg.pct}%)`}
                />
              ))}
            </div>

            {/* Legends & percentage bars */}
            <div className="space-y-2">
              {chartSegments.map((seg, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-750">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${seg.color}`}></span>
                      <span>{seg.label}</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[10px]">
                      {seg.value} ({seg.pct}%)
                    </div>
                  </div>
                  <div className="h-1 bg-slate-50 w-full rounded-full overflow-hidden">
                    <div
                      style={{ width: `${seg.pct}%` }}
                      className={`h-full ${seg.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
