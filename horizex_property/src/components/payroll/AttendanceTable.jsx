import React from 'react';
import { Edit3, Clock, AlertTriangle } from 'lucide-react';

export const AttendanceTable = ({ logs = [], onEdit, onCorrect }) => {
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '--:--';
    }
  };

  const getStatusBadge = (status) => {
    const base = 'px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ';
    switch (status) {
      case 'Present':
        return base + 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Late':
        return base + 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Half Day':
        return base + 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Work From Home':
        return base + 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Absent':
        return base + 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Holiday':
        return base + 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Weekend':
        return base + 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return base + 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Date</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Employee</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Department</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Clock In</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Clock Out</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Break Interval</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Total Hours</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Overtime (Hr)</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-slate-600 text-sm">
          {logs.length === 0 ? (
            <tr>
              <td colSpan="10" className="p-12 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl text-slate-300">∅</span>
                  <p className="font-semibold text-slate-500">No attendance logs found</p>
                </div>
              </td>
            </tr>
          ) : (
            logs.map((log) => {
              const hasAnomaly = log.clockIn && !log.clockOut && log.date !== new Date().toISOString().split('T')[0];
              return (
                <tr key={log.id} className="hover:bg-slate-50/20 transition-colors duration-200">
                  <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{log.employeeName}</span>
                      <span className="text-xs text-slate-400">{log.employeeNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                    {log.department}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                    {formatTime(log.clockIn)}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                    {formatTime(log.clockOut)}
                    {hasAnomaly && (
                      <span className="ml-1.5 inline-flex items-center text-rose-500" title="Missing Clock-Out Alert">
                        <AlertTriangle size={14} className="animate-pulse" />
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                    {log.breakStart && log.breakEnd ? (
                      `${formatTime(log.breakStart)} - ${formatTime(log.breakEnd)}`
                    ) : log.breakStart ? (
                      <span className="text-amber-500 font-semibold">On Break</span>
                    ) : (
                      '--:--'
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                    {log.totalHours || '0'} hrs
                  </td>
                  <td className="px-6 py-4 font-semibold text-violet-600 whitespace-nowrap">
                    {log.overtimeHours > 0 ? `+${log.overtimeHours} hrs` : '0 hrs'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(log.status)}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onCorrect && onCorrect(log)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg border border-slate-200/50 hover:border-blue-200/50 transition-all flex items-center gap-1"
                        title="Submit Correction"
                      >
                        <Clock size={12} />
                        Correction
                      </button>
                      <button 
                        onClick={() => onEdit && onEdit(log)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                        title="Override Attendance"
                      >
                        <Edit3 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
