import React from 'react';
import { Card } from '../Card';
import { RefreshCw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecentRenewalsWidget = ({ renewals = [] }) => {
  const navigate = useNavigate();

  // Collect history items from all renewals, sort by date/timestamp, and grab the latest 5
  const recentActivities = [];

  renewals.forEach(ren => {
    if (ren.history) {
      ren.history.forEach(hist => {
        recentActivities.push({
          renewalId: ren.id,
          tenantName: ren.tenantName,
          unitNumber: ren.unitNumber,
          date: hist.date,
          activity: hist.activity
        });
      });
    }
  });

  // Sort chronologically descending
  const sortedActivities = recentActivities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="saas-card p-5 rounded-[22px] bg-white shadow-sm border border-slate-200 h-fit max-h-[350px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">Recent Activity Feed</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Real-time lease renewal timeline audits</p>
        </div>
        <RefreshCw className="text-indigo-500 animate-spin-slow shrink-0" size={18} />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
        {sortedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-400">
            <span className="text-xs font-medium">No recent activities logged</span>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActivities.map((act, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all"
                onClick={() => navigate(`/leases/renewals/${act.renewalId}`)}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <FileText size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                    {act.tenantName} ({act.unitNumber})
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal line-clamp-2">
                    {act.activity}
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block mt-1">
                    {act.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
