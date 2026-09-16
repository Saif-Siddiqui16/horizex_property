import React from 'react';
import { Clock, Calendar, ShieldCheck, ArrowRightLeft } from 'lucide-react';

export const ShiftCalendar = ({ shifts = [], employees = [], onEdit, onRotate }) => {
  const getDaysOfWeek = (dayIndices = []) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayIndices.map(idx => days[idx]).join(', ');
  };

  const getEmployeesInShift = (shiftId) => {
    return employees.filter(e => String(e.shiftId) === String(shiftId));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Shifts Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {shifts.map((sh) => {
          const shiftEmployees = getEmployeesInShift(sh.id);
          return (
            <div 
              key={sh.id}
              className="bg-white border border-slate-100 rounded-[22px] p-5 shadow-card hover:shadow-md hover:translate-y-[-1px] transition-all duration-300 ease-in-out flex flex-col gap-4 h-fit"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">{sh.name} Shift</span>
                  <button 
                    onClick={() => onEdit && onEdit(sh)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 transition-all"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Clock size={13} className="text-slate-400" />
                  <span className="font-mono font-bold">{sh.startTime} - {sh.endTime}</span>
                </div>
              </div>

              {/* Roster & Times details */}
              <div className="flex flex-col gap-3 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Grace Time:</span>
                  <span className="font-semibold text-slate-700 text-right">{sh.graceTime} mins</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Break Duration:</span>
                  <span className="font-semibold text-slate-700 text-right">{sh.breakDuration} mins</span>
                </div>
                <div className="flex flex-col gap-1 mt-1 border-t border-slate-100/80 pt-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Off</span>
                  <span className="font-semibold text-slate-600 line-clamp-1">
                    {sh.weeklyOff?.length ? getDaysOfWeek(sh.weeklyOff) : 'None'}
                  </span>
                </div>
              </div>

              {/* Assigned Employees */}
              <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Staff</span>
                <span className="text-xs font-semibold text-slate-600">
                  {shiftEmployees.length} {shiftEmployees.length === 1 ? 'employee' : 'employees'}
                </span>
                {shiftEmployees.length > 0 && (
                  <div className="flex -space-x-2 overflow-hidden mt-1.5">
                    {shiftEmployees.slice(0, 4).map((emp, i) => (
                      <div 
                        key={emp.id}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 text-[10px] font-black flex items-center justify-center text-slate-600 uppercase border border-slate-300"
                        title={`${emp.firstName} ${emp.lastName}`}
                      >
                        {emp.firstName.substring(0, 1)}{emp.lastName.substring(0, 1)}
                      </div>
                    ))}
                    {shiftEmployees.length > 4 && (
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-300 text-[10px] font-black flex items-center justify-center text-slate-600">
                        +{shiftEmployees.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mock Shift Rotation Trigger */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
            <ArrowRightLeft size={22} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Shift Rotation Scheme (Mock)</h4>
            <p className="text-xs text-slate-400 mt-1">Configure automated shift cycles, bi-weekly handovers, or morning/evening schedule switching models.</p>
          </div>
        </div>
        <button 
          onClick={() => onRotate && onRotate()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all border-none"
        >
          Configure Rotation
        </button>
      </div>
    </div>
  );
};

export default ShiftCalendar;
