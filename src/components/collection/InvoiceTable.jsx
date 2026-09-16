import React from 'react';
import { COLLECTION_STATUSES } from '../../mock/rentCollection';
import { Eye, Edit, Send, Copy, Mail, Download, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export const InvoiceTable = ({
  invoices = [],
  onView = () => {},
  onDuplicate = () => {},
  onMarkSent = () => {},
  onEmail = () => {},
  onDownload = () => {},
  onRecordPayment = () => {},
  onAddAdjustment = () => {},
  onAddCredit = () => {},
  onRegenerate = () => {}
}) => {
  const [expandedRow, setExpandedRow] = React.useState(null);

  const toggleRow = (id) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-10"></th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Invoice No</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Building</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Unit</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tenant</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Rent Due</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Outstanding</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Due Date</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-8 text-center text-slate-400 font-medium">No invoices found.</td>
              </tr>
            ) : (
              invoices.map(inv => {
                const key = Object.keys(COLLECTION_STATUSES).find(k => COLLECTION_STATUSES[k].label === inv.status);
                const statusConfig = COLLECTION_STATUSES[key] || { label: inv.status, color: 'bg-slate-50 text-slate-500 border-slate-200' };
                const isExpanded = expandedRow === inv.id;

                return (
                  <React.Fragment key={inv.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="pl-4">
                        <button
                          onClick={() => toggleRow(inv.id)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-xs font-black text-slate-800 font-mono pl-2">{inv.invoiceNo}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-600 truncate max-w-[120px]">{inv.propertyName}</td>
                      <td className="px-5 py-4 text-xs font-black text-slate-800 font-mono">{inv.unitNumber}</td>
                      <td className="px-5 py-4 text-xs font-bold text-slate-900">{inv.tenantName}</td>
                      <td className="px-5 py-4 text-xs font-bold font-mono text-right text-slate-800">${(inv.amountDue || 0).toLocaleString()}</td>
                      <td className={`px-5 py-4 text-xs font-black font-mono text-right ${inv.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ${(inv.outstandingBalance || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-center text-slate-500 font-mono">{inv.dueDate}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right pr-6">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => onView(inv.id)}
                            className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="View Details / Ledger"
                          >
                            <Eye size={13} />
                          </button>
                          
                          {inv.outstandingBalance > 0 && (
                            <>
                              <button
                                onClick={() => onRecordPayment(inv.id)}
                                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all font-black text-[9px] uppercase tracking-wider px-2.5"
                                title="Record Rent Payment"
                              >
                                Record Pay
                              </button>
                              <button
                                onClick={() => onAddAdjustment(inv.id)}
                                className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all font-black text-[9px] uppercase tracking-wider px-2"
                                title="Late Fee / Adjustment"
                              >
                                + Adj
                              </button>
                              <button
                                onClick={() => onAddCredit(inv.id)}
                                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all font-black text-[9px] uppercase tracking-wider px-2"
                                title="Apply Credit Balance"
                              >
                                + Cred
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => onDuplicate(inv.id)}
                            className="p-2 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                            title="Duplicate Invoice"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Collapsible Row details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="10" className="bg-slate-50/50 p-5 pl-14">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Payments and Timeline Audit */}
                            <div className="md:col-span-2">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Timeline Audit History</h4>
                              <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-3">
                                {inv.history?.map((h, i) => (
                                  <div key={i} className="relative">
                                    <span className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white"></span>
                                    <p className="text-xs font-semibold text-slate-700">{h.activity}</p>
                                    <span className="text-[9px] text-slate-400 font-mono">{h.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Additional Actions */}
                            <div className="flex flex-col gap-2 border-l border-slate-100 pl-6">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invoice Dispatches</h4>
                              
                              <button
                                onClick={() => onMarkSent(inv.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                              >
                                <Send size={13} className="text-indigo-500" />
                                Mark Sent
                              </button>

                              <button
                                onClick={() => onEmail(inv.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                              >
                                <Mail size={13} className="text-blue-500" />
                                Email Invoice (Mock)
                              </button>

                              <button
                                onClick={() => onDownload(inv.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                              >
                                <Download size={13} className="text-emerald-500" />
                                Download PDF (Mock)
                              </button>

                              <button
                                onClick={() => onRegenerate(inv.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-indigo-600 rounded-xl text-xs font-bold text-white shadow-md shadow-slate-200"
                              >
                                <Edit size={13} />
                                Regenerate Invoice
                              </button>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
