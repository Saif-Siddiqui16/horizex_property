import React from 'react';
import { Calendar, User, ShieldAlert } from 'lucide-react';

export const LeaveCalendar = ({ leaves = [] }) => {
  // Get unique months present in leaves
  const approvedLeaves = leaves.filter(l => l.status === 'Approved');
  const pendingLeaves = leaves.filter(l => l.status === 'Pending');

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'Annual': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sick': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Emergency': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Casual': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Maternity': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Paternity': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Unpaid': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Visual Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approved Leave List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Calendar size={18} className="text-slate-500" />
            <h4 className="font-bold text-slate-800">Approved Leave Roster</h4>
          </div>
          
          <div className="flex flex-col gap-4">
            {approvedLeaves.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No approved leave scheduled in the system
              </div>
            ) : (
              approvedLeaves.map(lv => (
                <div 
                  key={lv.id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/20 hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-sm shrink-0">
                      <User size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">{lv.employeeName}</span>
                      <span className="text-xs text-slate-400 block">{lv.department} · {lv.employeeNo}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLeaveTypeColor(lv.leaveType)}`}>
                      {lv.leaveType}
                    </span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                      {lv.startDate} {lv.endDate !== lv.startDate ? `to ${lv.endDate}` : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calendar Side Info Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-card flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-300" />
              <span className="font-bold tracking-tight text-indigo-200">Scheduled Outages</span>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <span className="text-4xl font-black">{approvedLeaves.length}</span>
              <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Approved Leave Periods</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Review upcoming absence lists to maintain appropriate operations, ticket management, and guest shuttle support.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Pending Requests:</span>
              <span className="font-bold text-amber-400">{pendingLeaves.length} requests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;
