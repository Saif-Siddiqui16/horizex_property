import React, { useState } from 'react';
import { Card } from '../Card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { RENEWAL_STATUSES } from '../../mock/renewals';

export const RenewalCalendarWidget = ({ renewals = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Get start day of month (0 = Sunday, etc.)
  const startDay = new Date(year, month, 1).getDay();

  // Create grid arrays
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blankDays = Array.from({ length: startDay }, (_, i) => i);

  // Group renewals by day of the active month
  const activeMonthRenewals = renewals.filter(r => {
    if (!r.leaseEnd) return false;
    const end = new Date(r.leaseEnd);
    return end.getMonth() === month && end.getFullYear() === year;
  });

  const getRenewalsForDay = (day) => {
    return activeMonthRenewals.filter(r => {
      const end = new Date(r.leaseEnd);
      return end.getDate() === day;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <Card className="p-6 rounded-[22px] bg-white shadow-sm border border-slate-200 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Lease Expiry Calendar</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Upcoming lease expirations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-700 font-mono w-28 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {blankDays.map(d => (
            <div key={`blank-${d}`} className="h-10 bg-slate-50/50 rounded-xl"></div>
          ))}

          {daysArray.map(day => {
            const dayRenewals = getRenewalsForDay(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

            return (
              <div
                key={day}
                className={`h-10 relative flex flex-col justify-between p-1 rounded-xl border ${
                  isToday 
                    ? 'border-indigo-600 bg-indigo-50/20' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                } transition-all`}
              >
                <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {day}
                </span>

                {/* Display renewal dots */}
                {dayRenewals.length > 0 && (
                  <div className="flex gap-0.5 justify-center mt-auto">
                    {dayRenewals.slice(0, 3).map((r, i) => {
                      const statusConfig = RENEWAL_STATUSES[r.status.toUpperCase().replace(' ', '_')] || RENEWAL_STATUSES.DRAFT;
                      const dotColor = statusConfig.color.includes('emerald') ? 'bg-emerald-500' :
                                       statusConfig.color.includes('purple') ? 'bg-purple-500' :
                                       statusConfig.color.includes('amber') ? 'bg-amber-500' :
                                       statusConfig.color.includes('rose') ? 'bg-rose-500' : 'bg-slate-400';
                      return (
                        <span
                          key={i}
                          title={`${r.tenantName} - ${r.status}`}
                          className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {dayRenewalsLegend(activeMonthRenewals)}
    </Card>
  );
};

function dayRenewalsLegend(activeRenewals) {
  if (activeRenewals.length === 0) return null;
  return (
    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] font-bold text-slate-500">
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Accepted
      </span>
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Negotiating
      </span>
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Refused
      </span>
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Pending/Sent
      </span>
    </div>
  );
}
