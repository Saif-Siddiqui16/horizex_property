import React, { useState } from 'react';
import { Download, Mail, CheckCircle, Printer, DollarSign, ArrowLeft } from 'lucide-react';
import payrollService from '../../services/payrollService';

export const PayslipCard = ({ record = {}, onClose }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [emailed, setEmailed] = useState(false);

  if (!record || !record.id) return null;

  const handleDownload = () => {
    payrollService.downloadPayslipPdf(record.id);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleEmail = () => {
    const defaultEmail = record.employeeEmail || 'employee@property.com';
    const email = window.prompt("Confirm email to send payslip:", defaultEmail);
    if (email) {
      payrollService.emailPayslip(record.id, email);
      setEmailed(true);
      setTimeout(() => setEmailed(false), 3000);
    }
  };

  const earnings = [
    { name: 'Basic Salary', amount: record.basicSalary || 0 },
    { name: 'Housing Allowance', amount: record.allowances > 300 ? 300 : (record.allowances > 0 ? 300 : 0) },
    { name: 'Transport Allowance', amount: record.allowances > 300 ? 150 : 0 },
    { name: 'Overtime Allowance', amount: record.overtimePay || 0 },
    { name: 'Performance Bonus', amount: record.bonus || 0 }
  ].filter(e => e.amount > 0);

  const deductions = [
    { name: 'Income Tax', amount: record.tax || 0 },
    { name: 'Health Insurance', amount: record.deductions > 0 ? 100 : 0 },
    { name: 'Unpaid Leave Deduction', amount: record.unpaidDaysCount > 0 ? parseFloat((record.unpaidDaysCount * (record.basicSalary / 22)).toFixed(2)) : 0 }
  ].filter(d => d.amount > 0);

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-card flex flex-col gap-8 max-w-2xl mx-auto relative overflow-hidden">
      
      {/* Payslip Header & Stamp */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Payslip Receipt</span>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{record.payrollNo}</h3>
          <span className="text-xs text-slate-400 font-mono">Payslip Ref: {record.payslipNo}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Apex Real Estate Partners</span>
          <span className="text-xs text-slate-400">Montreal, QC</span>
          <span className="text-xs text-slate-400 mt-1 font-mono">{record.payrollMonth} cycle</span>
        </div>
      </div>

      {/* Roster & Date */}
      <div className="grid grid-cols-2 gap-6 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-600">
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-slate-400 block">Employee Name:</span>
            <span className="font-bold text-slate-800">{record.employeeName}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Employee ID:</span>
            <span className="font-mono font-bold text-slate-700">{record.employeeNo}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-slate-400 block">Pay Period:</span>
            <span className="font-semibold text-slate-700 font-mono">{record.periodStart} to {record.periodEnd}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Designation / Department:</span>
            <span className="font-semibold text-slate-700">{record.designation} ({record.department})</span>
          </div>
        </div>
      </div>

      {/* Itemized Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Earnings */}
        <div className="flex flex-col">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Earnings</h4>
          <div className="flex flex-col gap-3">
            {earnings.map((e, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-slate-500">{e.name}</span>
                <span className="font-semibold text-slate-800">${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deductions */}
        <div className="flex flex-col">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Deductions & Taxes</h4>
          <div className="flex flex-col gap-3">
            {deductions.map((d, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-slate-500">{d.name}</span>
                <span className="font-semibold text-rose-500">-${d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pay Summary Box */}
      <div className="border-t border-slate-100 pt-6 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Earnings</span>
          <span className="text-sm font-bold text-slate-700">${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Deductions</span>
          <span className="text-sm font-bold text-rose-500">-${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-slate-900 text-white rounded-2xl p-4 text-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Net Payout</span>
          <span className="text-lg font-black text-white">${record.netSalary?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Operations Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
        <button 
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Runs
        </button>

        <div className="flex gap-3">
          <button 
            onClick={handleEmail}
            className={`font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 transition-all text-slate-600 ${emailed ? 'text-emerald-600 border-emerald-200' : ''}`}
          >
            {emailed ? <CheckCircle size={14} /> : <Mail size={14} />}
            {emailed ? 'Emailed Mock' : 'Email Employee'}
          </button>
          <button 
            onClick={handleDownload}
            className={`font-bold text-xs px-4 py-2.5 rounded-xl text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-1.5 transition-all border-none ${downloaded ? 'bg-emerald-600' : ''}`}
          >
            {downloaded ? <CheckCircle size={14} /> : <Download size={14} />}
            {downloaded ? 'Downloaded PDF' : 'Download PDF'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default PayslipCard;
