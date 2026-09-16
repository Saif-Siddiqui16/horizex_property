import React from 'react';
import { DollarSign, Clock, Calendar, CheckSquare } from 'lucide-react';

export const UpcomingPayrollWidget = ({ employees = [], settings = {} }) => {
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const cycle = settings.payCycle || 'Monthly';
  const totalBaseSalary = employees.filter(e => e.status === 'Active').reduce((sum, e) => sum + e.salary, 0);
  
  // Basic estimates
  const estAllowances = activeCount * 450; // $450 average allowances
  const estTax = totalBaseSalary * 0.15; // 15% estimated average tax
  const estNet = totalBaseSalary + estAllowances - estTax;

  const getNextPayday = () => {
    const today = new Date();
    // Assuming payroll is processed on the last day of the month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return endOfMonth.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <DollarSign size={18} className="text-slate-500" />
          Upcoming Payroll Run
        </h4>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-blue-50 text-blue-600 border border-blue-100 uppercase">
          {cycle} Cycle
        </span>
      </div>

      <div className="flex flex-col gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Calendar size={18} className="text-slate-500" />
          </div>
          <div>
            <span className="text-slate-400 block">Next Scheduled Run:</span>
            <span className="font-bold text-slate-800 font-sans">{getNextPayday()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-slate-500" />
          </div>
          <div>
            <span className="text-slate-400 block">Active Employees Registered:</span>
            <span className="font-bold text-slate-800">{activeCount} Staff members</span>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="border-t border-slate-50 pt-4 mt-2 flex flex-col gap-2.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Estimated Basic Payroll:</span>
            <span className="font-semibold text-slate-700">${totalBaseSalary.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Estimated Allowances:</span>
            <span className="font-semibold text-slate-700">+${estAllowances.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
            <span className="text-slate-800">Total Net Est Payout:</span>
            <span className="text-indigo-600">${estNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingPayrollWidget;
