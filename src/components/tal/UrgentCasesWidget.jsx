import React from 'react';
import { Card } from '../Card';
import { ShieldAlert, ArrowRight, User } from 'lucide-react';
import { CaseStatusBadge } from './CaseStatusBadge';

export const UrgentCasesWidget = ({ cases = [], onView }) => {
  return (
    <Card className="h-fit">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">Urgent Legal Cases</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Disputes requiring management review</p>
          </div>
          <ShieldAlert size={16} className="text-rose-500 shrink-0" />
        </div>

        {cases.length === 0 ? (
          <div className="py-2 text-center text-xs text-slate-400 font-medium">
            No urgent or high priority cases currently.
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-rose-50/20 rounded-2xl border border-rose-100/50 flex items-center justify-between gap-3 hover:bg-rose-50/50 transition-all cursor-pointer"
                onClick={() => onView(c.id)}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black text-rose-500 font-mono tracking-widest">{c.caseNumber}</span>
                  <h4 className="text-xs font-black text-slate-800 mt-0.5">{c.tenantName}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{c.subject}</p>
                  
                  <div className="flex items-center gap-2.5 mt-2.5 text-[9px] text-slate-400 font-bold flex-wrap">
                    <CaseStatusBadge status={c.status} size="sm" />
                    <span className="flex items-center gap-1 min-w-0">
                      <User size={10} className="text-slate-400 shrink-0" />
                      <span className="truncate text-slate-500">{c.propertyName}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(c.id);
                  }}
                  className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-500 hover:text-rose-600 transition-all shrink-0"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
export default UrgentCasesWidget;
