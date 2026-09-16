import React from 'react';
import { LogIn, LogOut, Coffee, Clock, ShieldAlert } from 'lucide-react';

export const AttendanceTimeline = ({ log = {} }) => {
  if (!log || !log.clockIn) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-400 text-sm gap-2">
        <Clock size={24} className="text-slate-300" />
        <p className="font-medium">No clock activity recorded for this date</p>
      </div>
    );
  }

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const timelineEvents = [
    {
      title: 'Clocked In',
      time: formatTime(log.clockIn),
      icon: LogIn,
      color: 'bg-blue-500 text-white border-blue-200',
      desc: `Logged in to shift. Status: ${log.status}`
    }
  ];

  if (log.breakStart) {
    timelineEvents.push({
      title: 'Break Started',
      time: formatTime(log.breakStart),
      icon: Coffee,
      color: 'bg-amber-500 text-white border-amber-200',
      desc: 'Lunch/Rest break initiated'
    });
  }

  if (log.breakEnd) {
    timelineEvents.push({
      title: 'Break Ended',
      time: formatTime(log.breakEnd),
      icon: Coffee,
      color: 'bg-emerald-500 text-white border-emerald-200',
      desc: 'Returned to shift'
    });
  }

  if (log.clockOut) {
    timelineEvents.push({
      title: 'Clocked Out',
      time: formatTime(log.clockOut),
      icon: LogOut,
      color: 'bg-indigo-500 text-white border-indigo-200',
      desc: `Completed work day. Worked: ${log.totalHours} hrs. Overtime: ${log.overtimeHours} hrs.`
    });
  } else {
    timelineEvents.push({
      title: 'Current Shift Active',
      time: 'In Progress',
      icon: Clock,
      color: 'bg-orange-500 text-white border-orange-200 animate-pulse',
      desc: 'Still on-duty. Awaiting clock-out.'
    });
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="relative pl-6 border-l-2 border-slate-100 flex flex-col gap-8">
        {timelineEvents.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <div key={idx} className="relative group">
              {/* Dot Icon Indicator */}
              <div className={`absolute left-[-35px] top-0.5 w-7.5 h-7.5 rounded-full border-2 flex items-center justify-center ${evt.color}`}>
                <Icon size={14} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-bold text-slate-800 text-sm leading-none">
                  {evt.title}
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">
                  {evt.time}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {evt.desc}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Visual Analytics Box */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 mt-2 grid grid-cols-2 gap-4 text-center">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Hours</span>
          <span className="text-lg font-black text-slate-800">{log.totalHours || 0} hrs</span>
        </div>
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Overtime Pay</span>
          <span className="text-lg font-black text-violet-600">{log.overtimeHours || 0} hrs</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTimeline;
