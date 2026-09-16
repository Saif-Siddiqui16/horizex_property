import React from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Eye, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RENEWAL_STATUSES } from '../../mock/renewals';

export const UpcomingRenewalsWidget = ({ renewals = [] }) => {
  const navigate = useNavigate();

  // Filter for upcoming active items that are not resolved yet (i.e. not accepted, not refusing/expired)
  const upcoming = renewals
    .filter(r => r.status !== 'Accepted' && r.status !== 'Expired' && r.status !== 'Not Renewing')
    .slice(0, 5);

  return (
    <div className="saas-card p-5 rounded-[22px] bg-white shadow-sm border border-slate-200 h-fit max-h-[350px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">Upcoming Renewals</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Lease renewals pending response or notice</p>
        </div>
        <Clock className="text-indigo-500 shrink-0" size={18} />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-400">
            <span className="text-xs font-medium">No upcoming renewals found.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcoming.map(ren => {
              const statusConfig = RENEWAL_STATUSES[ren.status.toUpperCase().replace(' ', '_')] || RENEWAL_STATUSES.DRAFT;
              return (
                <div key={ren.id} className="py-2.5 flex items-center justify-between gap-3 group">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{ren.tenantName}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {ren.propertyName} • <span className="font-bold text-slate-600">{ren.unitNumber}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-7 h-7 !p-0 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={() => navigate(`/leases/renewals/${ren.id}`)}
                    >
                      <Eye size={13} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 shrink-0">
        <Button
          variant="secondary"
          className="w-full text-[11px] font-bold py-2 h-9 flex items-center justify-center"
          onClick={() => navigate('/leases/renewals')}
        >
          View All Renewals
        </Button>
      </div>
    </div>
  );
};
