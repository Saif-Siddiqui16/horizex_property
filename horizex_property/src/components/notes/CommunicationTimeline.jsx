import React from 'react';
import { COMM_EVENT_TYPES } from '../../mock/notes';

export const CommunicationTimeline = ({ events = [], compact = false }) => {
  if (!events.length) {
    return (
      <div className="py-8 text-center text-xs font-semibold text-slate-400">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {events.map((evt) => {
        const meta = COMM_EVENT_TYPES[evt.eventType] || { label: evt.eventType, color: 'bg-slate-400' };
        return (
          <div key={evt.id} className="flex gap-3 items-start">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${meta.color}`} />
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-slate-800 ${compact ? 'text-[11px]' : 'text-xs'}`}>
                {meta.label}
              </p>
              <p className={`text-slate-600 mt-0.5 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {evt.description}
              </p>
              <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                {evt.actorName} · {new Date(evt.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommunicationTimeline;
