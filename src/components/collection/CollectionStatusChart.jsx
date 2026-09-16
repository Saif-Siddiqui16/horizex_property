import React from 'react';
import { Card } from '../Card';
import { PieChart as PieIcon } from 'lucide-react';
import { COLLECTION_STATUSES } from '../../mock/rentCollection';

export const CollectionStatusChart = ({ invoices = [] }) => {
  const total = invoices.length || 1;

  // Aggregate invoice statuses
  const counts = {};
  invoices.forEach(inv => {
    counts[inv.status] = (counts[inv.status] || 0) + 1;
  });

  const chartSegments = Object.keys(counts).map(status => {
    // Find status config
    const key = Object.keys(COLLECTION_STATUSES).find(k => COLLECTION_STATUSES[k].label === status);
    const config = COLLECTION_STATUSES[key] || { color: 'bg-slate-400 text-slate-700', label: status };
    
    // Assign raw color class map
    const bgMap = {
      'bg-slate-100': 'bg-slate-400',
      'bg-blue-50': 'bg-blue-500',
      'bg-indigo-50': 'bg-indigo-500',
      'bg-amber-50': 'bg-amber-500',
      'bg-orange-50': 'bg-orange-500',
      'bg-emerald-50': 'bg-emerald-500',
      'bg-rose-50': 'bg-rose-500',
      'bg-purple-50': 'bg-purple-500',
      'bg-red-50': 'bg-red-500',
      'bg-red-100': 'bg-red-600',
      'bg-slate-200': 'bg-slate-500'
    };
    
    const colorClass = bgMap[config.color.split(' ')[0]] || 'bg-slate-400';

    return {
      label: status,
      value: counts[status],
      pct: Math.round((counts[status] / total) * 100),
      color: colorClass
    };
  }).sort((a, b) => b.value - a.value);

  return (
    <Card className="h-fit">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Collection Status Breakdown</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Summary of invoice workflow distribution</p>
          </div>
          <PieIcon className="text-indigo-600" size={20} />
        </div>

        {invoices.length === 0 ? (
          <p className="text-xs text-slate-400 py-2 text-center">No invoices available</p>
        ) : (
          <div className="space-y-4">
            {/* Visual Progress Stack */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
              {chartSegments.map((seg, idx) => (
                <div
                  key={idx}
                  style={{ width: `${(seg.value / total) * 100}%` }}
                  className={`${seg.color} h-full transition-all duration-300`}
                  title={`${seg.label}: ${seg.value} (${seg.pct}%)`}
                />
              ))}
            </div>

            {/* Legends */}
            <div className="space-y-3 pt-2">
              {chartSegments.map((seg, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${seg.color}`}></span>
                      <span>{seg.label}</span>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
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
    </Card>
  );
};
