import React from 'react';
import { Card } from '../Card';
import { ShieldAlert } from 'lucide-react';

export const HighestOutstandingWidget = ({ aging = {} }) => {
  return (
    <Card className="h-fit">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase tracking-widest">Highest Outstanding</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Top debtors by category</p>
          </div>
          <ShieldAlert size={16} className="text-rose-500 shrink-0" />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5">Tenants</p>
            {(!aging.highestTenants || aging.highestTenants.length === 0) ? (
              <p className="text-[10px] text-slate-400 font-medium">No active outstanding tenants.</p>
            ) : (
              <div className="space-y-1">
                {aging.highestTenants.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 truncate mr-2">{t.name}</span>
                    <span className="font-mono text-slate-900 font-bold shrink-0">${t.amount.toLocaleString('en-CA')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5">Buildings</p>
            {(!aging.highestBuildings || aging.highestBuildings.length === 0) ? (
              <p className="text-[10px] text-slate-400 font-medium">No active outstanding buildings.</p>
            ) : (
              <div className="space-y-1">
                {aging.highestBuildings.map((b, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 truncate mr-2">{b.name}</span>
                    <span className="font-mono text-slate-900 font-bold shrink-0">${b.amount.toLocaleString('en-CA')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
