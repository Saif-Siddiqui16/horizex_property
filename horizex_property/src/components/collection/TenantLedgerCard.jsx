import React from 'react';
import { Card } from '../Card';
import { FileText } from 'lucide-react';

export const TenantLedgerCard = ({ ledger = {} }) => {
  const rows = ledger.rows || [];

  return (
    <Card className="p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-800 tracking-tight">Tenant Statement of Ledger</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Chronological double-entry transactions log</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Closing Balance</p>
          <p className={`text-lg font-black font-mono mt-0.5 ${ledger.closingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ${(ledger.closingBalance || 0).toLocaleString('en-CA')}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest pl-4">Date</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Reference</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Description</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Debit (+)</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Credit (-)</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right pr-4">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">No ledger records found.</td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-600 font-mono pl-4">{row.date}</td>
                  <td className="px-4 py-3 text-xs font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider ${
                      row.type === 'Invoice' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      row.type === 'Payment' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      row.type === 'Adjustment' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-purple-50 text-purple-700 border border-purple-100'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-800 font-mono">{row.reference}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-semibold">{row.description}</td>
                  <td className="px-4 py-3 text-xs text-slate-700 font-bold font-mono text-right">
                    {row.debit > 0 ? `$${row.debit.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 font-bold font-mono text-right">
                    {row.credit > 0 ? `$${row.credit.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono font-black text-right pr-4 text-slate-900">
                    ${row.runningBalance.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
