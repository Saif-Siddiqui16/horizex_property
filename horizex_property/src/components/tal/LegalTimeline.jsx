import React from 'react';
import { Clock, User } from 'lucide-react';
import { Card } from '../Card';

export const LegalTimeline = ({ timeline = [] }) => {
  // Sort timeline chronologically (latest first for timeline stream)
  const sortedEvents = [...timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm">
      <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-1">Audit Timeline & History</h3>
      <p className="text-[10px] text-slate-400 font-medium mb-5">Immutable record of case modifications and events</p>

      {sortedEvents.length === 0 ? (
        <p className="text-xs font-semibold text-slate-400 text-center py-2">No timeline events logged.</p>
      ) : (
        <div className="relative pl-6 border-l border-slate-200 ml-2.5 space-y-6">
          {sortedEvents.map((ev, idx) => (
            <div key={ev.id || idx} className="relative">
              {/* Timeline bubble */}
              <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-indigo-50 border-2 border-indigo-500 flex items-center justify-center">
                <Clock size={9} className="text-indigo-600" />
              </div>

              <div>
                <div className="flex justify-between items-start gap-4">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{ev.event}</p>
                  <span className="text-[9px] font-bold font-mono text-slate-400 shrink-0">
                    {new Date(ev.date).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-bold">
                  <User size={10} className="shrink-0" />
                  <span>By: {ev.actor || 'System'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
export default LegalTimeline;
