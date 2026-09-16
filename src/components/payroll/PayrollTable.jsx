import React, { useState } from 'react';
import { Eye, FileText, CheckCircle2, AlertCircle, Upload, Paperclip, Check, MapPin, Printer } from 'lucide-react';
import { hasPermission } from '../../utils/permissions';
import payrollService from '../../services/payrollService';

export const PayrollTable = ({ records = [], onApprove, onReject, onPay, onViewPayslip, settings = {}, onUploadReceipt }) => {
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [activeReceiptRecord, setActiveReceiptRecord] = useState(null);
  const [receiptFile, setReceiptFile] = useState('');

  const getStatusBadge = (status) => {
    const base = 'px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ';
    switch (status) {
      case 'Paid':
        return base + 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Approved':
        return base + 'bg-green-50 text-green-600 border-green-100';
      case 'Level 1 Approved':
        return base + 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Pending Approval':
        return base + 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Rejected':
        return base + 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return base + 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const isCoworker = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role === 'COWORKER';
    } catch (e) {
      return false;
    }
  };

  const canApprove = hasPermission('Payroll', 'edit') || !isCoworker();

  const handleReceiptSubmit = (e) => {
    e.preventDefault();
    if (!receiptFile.trim()) return alert('Please enter a mock filename/receipt URL.');
    try {
      payrollService.uploadReceipt(activeReceiptRecord.id, receiptFile);
      setReceiptFile('');
      setActiveReceiptRecord(null);
      if (onUploadReceipt) onUploadReceipt();
      alert('Receipt uploaded and attached successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Run ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period / Cycle</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Basic</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Allowances</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Overtime</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deductions/Tax</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right font-black">Net Salary</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600 text-sm">
            {records.length === 0 ? (
              <tr>
                <td colSpan="11" className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl text-slate-300">∅</span>
                    <p className="font-semibold text-slate-500">No payroll runs found</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((rec) => {
                const showWorkflowApproval = rec.status === 'Pending Approval' || (rec.status === 'Level 1 Approved' && settings.approvalWorkflowType === 'TwoLevelApproval');
                
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/20 transition-colors duration-200">
                    <td className="px-6 py-4 font-mono font-bold text-slate-700 text-xs">
                      {rec.payrollNo}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{rec.employeeName}</span>
                        <span className="text-xs text-slate-400">{rec.department} · {rec.employeeNo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                        <MapPin size={12} className="text-slate-400" />
                        {rec.buildingName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{rec.payrollMonth}</span>
                        <span className="text-xs text-slate-400 font-mono">{rec.periodStart} to {rec.periodEnd}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">
                      ${rec.basicSalary?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      +${rec.allowances?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-indigo-600 font-medium">
                      +${rec.overtimePay?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-500 text-xs">
                      -${(rec.deductions + rec.tax)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 bg-slate-50/30">
                      ${rec.netSalary?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={getStatusBadge(rec.status)}>
                          {rec.status}
                        </span>
                        {rec.receiptFile && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 font-bold tracking-tight">
                            <Paperclip size={10} />
                            Receipt Attached
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => onViewPayslip && onViewPayslip(rec)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                          title="View & Generate Payslip"
                        >
                          <Eye size={16} />
                        </button>

                        <button 
                          onClick={() => setActiveInvoice(rec)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Create Location Invoice"
                        >
                          <FileText size={16} />
                        </button>
                        
                        {/* Configurable Workflow Actions */}
                        {showWorkflowApproval && canApprove && (
                          <>
                            <button 
                              onClick={() => {
                                const level = rec.status === 'Level 1 Approved' ? 2 : 1;
                                onApprove && onApprove(rec.payrollNo, level);
                              }}
                              className="px-2 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all border border-emerald-100"
                              title="Approve Run"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => {
                                const reason = window.prompt("Enter rejection reason:");
                                if (reason !== null) {
                                  onReject && onReject(rec.payrollNo, reason);
                                }
                              }}
                              className="px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all border border-rose-100"
                              title="Reject Run"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Pay Action */}
                        {rec.status === 'Approved' && canApprove && (
                          <button 
                            onClick={() => onPay && onPay(rec.payrollNo)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-md shadow-emerald-600/10 border-none"
                            title="Process Payout"
                          >
                            Pay
                          </button>
                        )}

                        {/* Receipt Upload Action */}
                        {rec.status === 'Paid' && canApprove && (
                          <button 
                            onClick={() => setActiveReceiptRecord(rec)}
                            className={`p-1.5 rounded-xl transition-all ${
                              rec.receiptFile 
                                ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600' 
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title={rec.receiptFile ? "Update Attached Receipt" : "Attach Bank Payout Receipt"}
                          >
                            <Upload size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* LOCATION INVOICE GENERATION MODAL */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full flex flex-col gap-6 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Internal Cost Allocation</span>
                <h3 className="font-bold text-slate-800 text-base">Location Invoice - {activeInvoice.buildingName}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveInvoice(null)} 
                className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none"
              >
                ×
              </button>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col gap-4 font-sans">
              <div className="flex justify-between text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Bill From (Entity)</span>
                  <span className="font-bold text-slate-700">Corporate Staffing Hub</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Charge To (Location)</span>
                  <span className="font-bold text-slate-700">{activeInvoice.buildingName}</span>
                </div>
              </div>

              <div className="flex justify-between text-xs border-t border-slate-100 pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Invoice Number</span>
                  <span className="font-mono text-slate-600 font-bold">INV-{activeInvoice.payrollNo}-{activeInvoice.employeeNo}</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Billing Period</span>
                  <span className="font-semibold text-slate-600">{activeInvoice.payrollMonth} ({activeInvoice.periodStart} to {activeInvoice.periodEnd})</span>
                </div>
              </div>

              <table className="w-full text-xs text-left border-collapse border-t border-slate-100 pt-3 mt-2">
                <thead>
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="py-2 font-medium">Regular Salary ({activeInvoice.employeeName} - {activeInvoice.designation})</td>
                    <td className="py-2 text-right font-semibold">${activeInvoice.basicSalary?.toFixed(2)}</td>
                  </tr>
                  {activeInvoice.allowances > 0 && (
                    <tr>
                      <td className="py-2 font-medium">Allowances & Benefits Allocation</td>
                      <td className="py-2 text-right font-semibold">+${activeInvoice.allowances?.toFixed(2)}</td>
                    </tr>
                  )}
                  {activeInvoice.overtimePay > 0 && (
                    <tr>
                      <td className="py-2 font-medium">Approved Overtime Hours Allocation</td>
                      <td className="py-2 text-right font-semibold">+${activeInvoice.overtimePay?.toFixed(2)}</td>
                    </tr>
                  )}
                  {activeInvoice.deductions > 0 && (
                    <tr>
                      <td className="py-2 font-medium">Absence & Leave Deductions</td>
                      <td className="py-2 text-right text-rose-500 font-semibold">-${activeInvoice.deductions?.toFixed(2)}</td>
                    </tr>
                  )}
                  {activeInvoice.tax > 0 && (
                    <tr>
                      <td className="py-2 font-medium">Payroll Tax Allocations</td>
                      <td className="py-2 text-right text-rose-500 font-semibold">-${activeInvoice.tax?.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-between items-center border-t-2 border-slate-200 pt-3 mt-2">
                <span className="text-xs font-black text-slate-700 uppercase">Total Allocated Cost</span>
                <span className="text-base font-black text-slate-800">${activeInvoice.netSalary?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end text-xs">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Print Invoice
              </button>
              <button 
                onClick={() => {
                  alert('Invoice dispatched to accounting workspace (mock).');
                  setActiveInvoice(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border-none shadow-md cursor-pointer"
              >
                Post to General Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BANK RECEIPT UPLOAD MODAL */}
      {activeReceiptRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReceiptSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Attach Payout Receipt</h3>
              <button 
                type="button" 
                onClick={() => setActiveReceiptRecord(null)} 
                className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              <span className="font-medium">Run ID: <strong className="font-mono text-slate-800">{activeReceiptRecord.payrollNo}</strong></span>
              <span className="font-medium">Employee: <strong className="text-slate-800">{activeReceiptRecord.employeeName}</strong></span>
              <span className="font-medium">Location: <strong className="text-slate-800">{activeReceiptRecord.buildingName}</strong></span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mock Receipt Filename / URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. wire_transfer_Apex_june_2026.pdf" 
                  value={receiptFile} 
                  onChange={(e) => setReceiptFile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <button type="submit" className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer flex items-center justify-center gap-1.5">
                <Upload size={14} /> Attach Receipt Document
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PayrollTable;
