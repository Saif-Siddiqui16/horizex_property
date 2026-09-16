import React, { useState } from 'react';
import { Card } from '../Card';
import { ChevronLeft, ChevronRight, Scale, Clock, MapPin, UserCheck } from 'lucide-react';
import { Button } from '../Button';

export const HearingCalendarWidget = ({ hearings = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const prefixEmptyDays = Array.from({ length: firstDayIndex }, (_, i) => null);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Find hearings matching a specific date
  const getHearingsForDay = (day) => {
    if (!day) return [];
    return hearings.filter(h => {
      const hDate = new Date(h.date);
      return hDate.getFullYear() === year && hDate.getMonth() === month && hDate.getDate() === day;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <Card className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">Hearing Schedule Calendar</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Monthly legal team docket</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button variant="secondary" onClick={prevMonth} className="p-2 h-8 w-8 rounded-lg flex items-center justify-center">
              <ChevronLeft size={14} />
            </Button>
            <span className="text-xs font-black text-slate-700 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl select-none">
              {monthNames[month]} {year}
            </span>
            <Button variant="secondary" onClick={nextMonth} className="p-2 h-8 w-8 rounded-lg flex items-center justify-center">
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {prefixEmptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-xl" />
          ))}
          {daysArray.map(day => {
            const dayHearings = getHearingsForDay(day);
            const hasHearing = dayHearings.length > 0;
            return (
              <div
                key={day}
                className={`aspect-square p-1 rounded-xl flex flex-col justify-between items-center transition-all ${
                  hasHearing
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-slate-50/50 border border-slate-100 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-[10px] font-black">{day}</span>
                {hasHearing && (
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Hearing Side Drawer Detail */}
      <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-1">Scheduled Docket Listings</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Detailed upcoming appearances for this month</p>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {hearings.filter(h => {
              const hDate = new Date(h.date);
              return hDate.getFullYear() === year && hDate.getMonth() === month;
            }).length === 0 ? (
              <p className="text-xs font-semibold text-slate-400 text-center py-2">No hearings this month.</p>
            ) : (
              hearings
                .filter(h => {
                  const hDate = new Date(h.date);
                  return hDate.getFullYear() === year && hDate.getMonth() === month;
                })
                .map(h => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 font-mono tracking-tight">{h.caseNumber}</span>
                        <h4 className="text-xs font-black text-slate-800 mt-0.5">{h.tenantName}</h4>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[9px] font-bold font-mono">
                        Day {new Date(h.date).getDate()}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-500 font-semibold border-t border-slate-200/50 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-slate-400 shrink-0" />
                        <span>{new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{h.courtRoom || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{h.judgeName || 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
export default HearingCalendarWidget;
