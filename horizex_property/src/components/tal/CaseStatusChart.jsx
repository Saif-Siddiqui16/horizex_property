import React from 'react';
import { Card } from '../Card';
import { TAL_CASE_STATUSES } from '../../mock/talCases';

export const CaseStatusChart = ({ statusBreakdown = [] }) => {
  const total = statusBreakdown.reduce((sum, item) => sum + item.count, 0) || 1;

  const getStatusColor = (statusName) => {
    const config = Object.values(TAL_CASE_STATUSES).find(
      s => s.label.toLowerCase() === (statusName || '').toLowerCase()
    );
    return config?.color || 'bg-slate-100 text-slate-700';
  };

  return (
    <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-1">Case Status Distribution</h3>
        <p className="text-[10px] text-slate-400 font-medium mb-4">Total active litigation case breakdown</p>

        {statusBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No case data available.
          </div>
        ) : (
          <div className="space-y-3">
            {statusBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600 truncate mr-2">{item.status}</span>
                  <span className="text-slate-800 font-bold shrink-0">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      getStatusColor(item.status).split(' ')[0]
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
export default CaseStatusChart;
