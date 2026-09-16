import React from 'react';
import { Card } from '../Card';
import { Calendar, MapPin, User, Scale } from 'lucide-react';

export const UpcomingHearingsWidget = ({ hearings = [] }) => {
  return (
    <Card className="h-fit">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">Upcoming hearings</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">TAL court hearings next 30 days</p>
          </div>
          <Scale size={16} className="text-indigo-600 shrink-0" />
        </div>

        {hearings.length === 0 ? (
          <div className="py-2 text-center text-xs text-slate-400 font-medium">
            No upcoming hearings scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {hearings.map((h) => (
              <div key={h.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5 hover:bg-slate-100/50 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 font-mono tracking-tight">{h.caseNumber}</span>
                    <h4 className="text-xs font-black text-slate-800 mt-0.5 truncate">{h.tenantName}</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-bold font-mono shrink-0">
                    {new Date(h.date).toLocaleDateString('en-CA')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold border-t border-slate-200/50 pt-2 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">{h.courtRoom || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">{h.judgeName || 'TBD'}</span>
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 font-bold tracking-wide truncate border-t border-slate-100 pt-1.5">
                  {h.propertyName} — {h.unitNumber}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
export default UpcomingHearingsWidget;
