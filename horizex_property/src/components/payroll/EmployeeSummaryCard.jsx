import React from 'react';
import { User, Mail, Phone, Calendar, Clock } from 'lucide-react';

export const EmployeeSummaryCard = ({ employee = {}, shift = {}, department = {} }) => {
  const initial = `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card hover:shadow-md transition-all flex flex-col gap-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center border border-indigo-200 uppercase shrink-0">
          {initial}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-black text-slate-800 text-base leading-tight truncate">{employee.firstName} {employee.lastName}</span>
          <span className="text-xs text-slate-400 font-medium truncate mt-0.5">{employee.designation}</span>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{employee.employeeNo}</span>
        </div>
      </div>

      {/* Info Rows */}
      <div className="flex flex-col gap-3 text-xs border-t border-slate-50 pt-4 text-slate-600">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-slate-400" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-slate-400" />
          <span>{employee.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <span>Department: <span className="font-semibold text-slate-700">{employee.department}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-400" />
          <span>Shift: <span className="font-semibold text-slate-700">{shift.name || 'Morning'} ({shift.startTime || '09:00'} - {shift.endTime || '17:00'})</span></span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-1 text-xs">
        <span className="text-slate-400">Employment Type:</span>
        <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{employee.employmentType}</span>
      </div>
    </div>
  );
};

export default EmployeeSummaryCard;
