import React, { useState } from 'react';
import { Eye, Edit3, ArrowUpDown, ShieldAlert, MoreVertical, FileUp, CalendarPlus, Power, FileText, CheckCircle } from 'lucide-react';
import { CaseStatusBadge } from './CaseStatusBadge';
import { TAL_CASE_PRIORITIES, TAL_CASE_STATUSES } from '../../mock/talCases';

export const CaseTable = ({ cases = [], onView, onStatusChange }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const getPriorityStyle = (priority) => {
    const config = Object.values(TAL_CASE_PRIORITIES).find(
      p => p.label.toLowerCase() === (priority || '').toLowerCase()
    );
    return config?.color || 'bg-slate-100 text-slate-700';
  };

  const getNextActionForStatus = (status) => {
    const match = Object.values(TAL_CASE_STATUSES).find(s => s.label === status);
    return match ? match.nextAction : 'Complete case information';
  };

  const getOutcomeBadgeClass = (outcome) => {
    switch (outcome) {
      case 'Landlord Won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Tenant Won':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Settled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Withdrawn':
      case 'Dismissed':
        return 'bg-slate-50 text-slate-500 border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const handlePrint = (c) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>TAL Case Report - ${c.caseNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h1 { font-size: 24px; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Tribunal administratif du logement (TAL) - Case Summary</h1>
          <table>
            <tr><th>Case Number</th><td>${c.caseNumber}</td></tr>
            <tr><th>Tenant</th><td>${c.tenantName}</td></tr>
            <tr><th>Property / Unit</th><td>${c.propertyName} (${c.unitNumber})</td></tr>
            <tr><th>Case Type</th><td>${c.caseType || 'Other'}</td></tr>
            <tr><th>Status</th><td>${c.status}</td></tr>
            <tr><th>Priority</th><td>${c.priority}</td></tr>
            <tr><th>Outstanding Balance</th><td>$${c.outstandingRent || 0}</td></tr>
            <tr><th>Amount Claimed</th><td>$${c.amountClaimed || 0}</td></tr>
            <tr><th>Assigned Lawyer</th><td>${c.assignedLawyerName}</td></tr>
          </table>
          <h3>Notes / Summary</h3>
          <p>${c.caseSummary}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[22px] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Case #</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Type</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Action</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hearing Date</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Lawyer</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-5 py-12 text-center text-xs font-semibold text-slate-400 bg-white">
                  No active TAL legal cases found matching the filters.
                </td>
              </tr>
            ) : (
              cases.map((c) => {
                const isOverdue = c.priority === 'Urgent' || c.priority === 'High';
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-slate-800 font-mono tracking-tight">{c.caseNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-slate-800">{c.tenantName}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-slate-600">{c.propertyName}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold font-mono text-slate-700">{c.unitNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-slate-500">{c.caseType || 'Other'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <CaseStatusBadge status={c.status} />
                        {c.outcome && c.outcome !== 'Pending' && (
                          <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase border ${getOutcomeBadgeClass(c.outcome)}`}>
                            {c.outcome}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${getPriorityStyle(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700">
                          {getNextActionForStatus(c.status)}
                        </span>
                        {isOverdue && (
                          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString('en-CA') : 'None'}
                        </span>
                        {c.courtRoom && (
                          <span className="text-[9px] font-semibold text-slate-400 mt-0.5">{c.courtRoom}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                      {c.assignedLawyerName}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-500 font-mono">
                      {new Date(c.updatedAt || c.createdAt).toLocaleDateString('en-CA')}
                    </td>
                    <td className="px-5 py-4 text-right relative">
                      <div className="flex justify-end gap-1.5 items-center">
                        <button
                          onClick={() => onView(c.id)}
                          title="View Details"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                          <Eye size={16} />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuId === c.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-1 flex flex-col text-left">
                                <button
                                  onClick={() => { onView(c.id); setActiveMenuId(null); }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                                >
                                  <Eye size={14} className="text-slate-400" /> View Detailed Case
                                </button>
                                <button
                                  onClick={() => { onView(c.id); setActiveMenuId(null); }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                                >
                                  <Edit3 size={14} className="text-slate-400" /> Edit Case Details
                                </button>
                                <button
                                  onClick={() => { onView(c.id); setActiveMenuId(null); }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                                >
                                  <FileUp size={14} className="text-slate-400" /> Upload Documents
                                </button>
                                <button
                                  onClick={() => { onView(c.id); setActiveMenuId(null); }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                                >
                                  <CalendarPlus size={14} className="text-slate-400" /> Add Hearing
                                </button>
                                <button
                                  onClick={() => { handlePrint(c); setActiveMenuId(null); }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                                >
                                  <FileText size={14} className="text-slate-400" /> Print Case Report
                                </button>
                                <button
                                  onClick={() => { onStatusChange(c.id, 'Closed'); setActiveMenuId(null); }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
                                >
                                  <CheckCircle size={14} className="text-rose-500" /> Close Case
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
