import React from 'react';
import { Calendar, Check, X, FileText } from 'lucide-react';

export const PendingLeaveWidget = ({ requests = [], onApprove, onReject }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Calendar size={18} className="text-slate-500" />
          Pending Leave Requests
        </h4>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-amber-50 text-amber-600 border border-amber-100 uppercase">
          {requests.length} Requests
        </span>
      </div>

      <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1">
            <span className="text-xl">✓</span>
            <p className="font-semibold text-slate-500">All leave requests processed</p>
          </div>
        ) : (
          requests.map((req) => (
            <div 
              key={req.id} 
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-50 bg-slate-50/20 hover:bg-slate-50/50 transition-all gap-4"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-800 text-xs block truncate">{req.employeeName}</span>
                <span className="text-[10px] text-slate-400 block truncate">{req.leaveType} · {req.startDate} to {req.endDate}</span>
                <span className="text-[10px] font-medium text-slate-500 block line-clamp-1 italic mt-0.5">"{req.reason || 'No reason specified'}"</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => onApprove && onApprove(req.id)}
                  className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center border border-emerald-100 transition-all"
                  title="Approve"
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => {
                    const reason = window.prompt("Enter rejection reason:");
                    if (reason !== null) {
                      onReject && onReject(req.id, reason);
                    }
                  }}
                  className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center border border-rose-100 transition-all"
                  title="Reject"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingLeaveWidget;
