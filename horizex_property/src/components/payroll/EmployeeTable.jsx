import React from 'react';
import { Edit2, Trash2, Eye, Award, DollarSign, Calendar } from 'lucide-react';

export const EmployeeTable = ({ employees = [], companies = [], buildings = [], shifts = [], onEdit, onDelete, onViewDetails, onShiftChange, onSalaryUpdate }) => {
  
  const getCompanyName = (companyId) => {
    const c = companies.find(comp => String(comp.id) === String(companyId));
    return c ? c.name : `Company #${companyId}`;
  };

  const getBuildingName = (buildingId) => {
    const b = buildings.find(build => String(build.id) === String(buildingId));
    return b ? b.name : `Building #${buildingId}`;
  };

  const getShiftName = (shiftId) => {
    const s = shifts.find(sh => String(sh.id) === String(shiftId));
    return s ? s.name : `Shift #${shiftId}`;
  };

  return (
    <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company / Building</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department / Role</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employment Type</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-slate-600 text-sm">
          {employees.length === 0 ? (
            <tr>
              <td colSpan="9" className="p-12 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl text-slate-300">∅</span>
                  <p className="font-semibold text-slate-500">No employees found</p>
                </div>
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/20 transition-colors duration-200">
                <td className="px-6 py-4 font-mono font-bold text-slate-700 text-xs">
                  {emp.employeeNo}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{emp.firstName} {emp.lastName}</span>
                    <span className="text-xs text-slate-400">{emp.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">{getCompanyName(emp.companyId)}</span>
                    <span className="text-xs text-slate-400">{getBuildingName(emp.buildingId)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">{emp.department}</span>
                    <span className="text-xs text-slate-400">{emp.designation}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/50">
                    {emp.employmentType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">{getShiftName(emp.shiftId)}</span>
                    <button 
                      onClick={() => onShiftChange && onShiftChange(emp)} 
                      className="text-slate-400 hover:text-blue-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
                      title="Change Shift"
                    >
                      <Calendar size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span>${emp.salary.toLocaleString()}</span>
                    <button 
                      onClick={() => onSalaryUpdate && onSalaryUpdate(emp)} 
                      className="text-slate-400 hover:text-emerald-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
                      title="Update Salary"
                    >
                      <DollarSign size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide border uppercase ${
                    emp.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onViewDetails && onViewDetails(emp)}
                      className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => onEdit && onEdit(emp)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                      title="Edit Profile"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete && onDelete(emp.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all"
                      title="Remove Employee"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
