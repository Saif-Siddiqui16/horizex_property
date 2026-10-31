import React from 'react';
import { Card } from '../Card';
import { RefreshCw, DollarSign } from 'lucide-react';

export const RecentPaymentsWidget = ({ payments = [], invoices = [] }) => {
  // Map payments with parent invoice details
  const enriched = payments.map(p => {
    const inv = invoices.find(i => i.id === p.invoiceId);
    return {
      ...p,
      tenantName: inv ? inv.tenantName : 'Tenant',
      unitNumber: inv ? inv.unitNumber : 'Apt',
      propertyName: inv ? inv.propertyName : 'Building'
    };
  }).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).slice(0, 5);

  return (
    <Card className="h-fit">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Recent Payments Received</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Real-time ledger updates of transactions</p>
          </div>
          <RefreshCw size={18} className="text-indigo-600 animate-spin-slow" />
        </div>

        {enriched.length === 0 ? (
          <p className="text-xs text-slate-400 py-2 text-center">No recent payments recorded.</p>
        ) : (
          <div className="space-y-4">
            {enriched.map((pay, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <DollarSign size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">{pay.tenantName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {pay.propertyName} • <span className="font-bold">{pay.unitNumber}</span>
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">{pay.paymentDate} via {pay.paymentMethod}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900 font-mono shrink-0">+${pay.amountPaid.toLocaleString('en-CA')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
