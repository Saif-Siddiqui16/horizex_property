import React from 'react';
import { FileText, Calendar, DollarSign, Home, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetTenantLeaseQuery } from '../../store';
import { formatDisplayDate } from '../../utils/dateUtils';

export const TenantLease = () => {
  const { data: lease, isLoading } = useGetTenantLeaseQuery();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">Loading lease details...</div>
    );
  }

  const hasLease = Boolean(lease && lease.hasLease !== false && lease.id && lease.id !== 'DEMO-LEASE');
  const rentValue = Number(lease?.monthlyRent ?? lease?.rent ?? 0);
  const depositValue = Number(lease?.deposit ?? lease?.securityDeposit ?? 0);
  const adminPhone = lease?.adminPhone || 'N/A';

  return (
    <div className="w-full space-y-8 anim-slide-up">
      {hasLease ? (
        /* LEASE SUMMARY CARD */
        <section className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden shadow-slate-100/50">
          <div className="bg-zinc-900 p-8 text-white flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Standard Lease Agreement</h2>
              <p className="text-indigo-100 font-medium tracking-wide">Agreement ID: {lease.id}</p>
            </div>
            <div className="bg-emerald-400/20 text-emerald-50 px-4 py-2 rounded-xl border border-emerald-400/30 flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 size={18} />
              {lease.status || 'ACTIVE'}
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Home size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Lease Property</p>
                  <h4 className="text-lg font-bold text-slate-800">{lease.property || 'Property'} {lease.unit ? `- Unit ${lease.unit}` : ''}</h4>
                  <p className="text-sm text-slate-500 font-medium">{lease.address || 'Address on file'}</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                  <DollarSign size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Monthly Rent</p>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tight">${rentValue.toLocaleString('en-CA')}</h4>
                  <p className="text-sm text-slate-500 font-medium">Due on 1st of every month</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Calendar size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Lease Period</p>
                  <h4 className="text-lg font-bold text-slate-800">Fixed Term</h4>
                  <p className="text-sm text-slate-500 font-medium tracking-tight">
                    {lease.startDate ? formatDisplayDate(lease.startDate) : 'N/A'} – {lease.endDate ? formatDisplayDate(lease.endDate) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Security Deposit</p>
                  <h4 className="text-lg font-bold text-slate-800 tracking-tight">${depositValue.toLocaleString('en-CA')}</h4>
                  <p className="text-sm text-slate-500 font-medium">Held in Escrow</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* NO ACTIVE LEASE EMPTY STATE */
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
            <FileText size={32} />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-xl font-bold text-slate-800">No Active Lease Agreement</h3>
            <p className="text-sm text-slate-500 font-medium">
              There is currently no active lease agreement linked to your account. Once your lease is assigned, your agreement details will appear here.
            </p>
          </div>
        </section>
      )}

      {/* CONTACT SUPPORT */}
      <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6 max-w-xl">
        <h3 className="text-lg font-black text-slate-800">Contact Support</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          For any queries regarding your lease agreement, please contact the property management office.
        </p>
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-sm font-bold text-slate-700">Office Phone</span>
            <span className="text-sm font-black text-indigo-600 uppercase">{adminPhone}</span>
          </div>
          <Link
            to="/tenant/communication"
            className="block w-full py-4 rounded-2xl bg-zinc-900 text-white font-bold text-center hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 active:scale-95"
          >
            Message Admin
          </Link>
        </div>
      </section>
    </div>
  );
};
