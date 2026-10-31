import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Network, Cable, Check, AlertTriangle, Play, RefreshCw, X, Trash2, 
  Mail, Calendar, Landmark, Settings, Search, ArrowUpRight, Eye, 
  CheckCircle2, Clock, Globe, ShieldAlert, Info, Bell, ShieldCheck, 
  AlertCircle, ChevronRight, Activity, Moon, Sun, Archive, HelpCircle,
  Gavel
} from 'lucide-react';

// Helpers
const getStatusClass = (status) => {
  const base = 'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ';
  switch (status) {
    case 'Connected':
    case 'Completed':
    case 'Active':
      return base + 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'Running':
      return base + 'bg-blue-50 text-blue-600 border-blue-100';
    case 'Pending':
    case 'Queued':
      return base + 'bg-amber-50 text-amber-600 border-amber-100';
    case 'Failed':
    case 'Disconnected':
      return base + 'bg-rose-50 text-rose-600 border-rose-100';
    default:
      return base + 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

/* 1. INTEGRATION KPI CARDS */
export const IntegrationKPICards = ({ stats = {} }) => {
  const cards = [
    { label: 'Connected integrations', value: stats.connectedCount || 0, sub: 'Active sync feeds', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: Network },
    { label: 'Disconnected modules', value: stats.disconnectedCount || 0, sub: 'Needs re-auth', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: ShieldAlert },
    { label: 'Pending Sync Jobs', value: stats.pendingSyncJobs || 0, sub: 'Currently queued', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
    { label: 'Failed Sync Attempts', value: stats.failedSyncJobs || 0, sub: 'Errors logged', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: AlertTriangle },
    { label: 'Sync Success Rate', value: `${stats.successRate || 100}%`, sub: 'Target: 98%', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Activity }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-start">
      {cards.map((c, i) => (
        <div key={i} className="bg-white p-4 rounded-[22px] border border-slate-100 shadow-sm flex flex-col justify-between h-fit">
          <div className="flex justify-between items-start mb-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.color} shadow-sm`}>
              <c.icon size={18} />
            </div>
          </div>
          <div>
            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{c.label}</h4>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{c.value}</p>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-2">{c.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* 2. INTEGRATION TABLE */
export const IntegrationTable = ({ integrations = [], onSync, onDisconnect, onConnect }) => {
  return (
    <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
      <table className="w-full border-collapse text-left text-xs font-sans">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Integration Platform</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Version</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Successful Sync</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
          {integrations.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Identifier: {item.id}</span>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-slate-500 font-bold">{item.version}</td>
              <td className="px-6 py-4 font-mono text-slate-500">{new Date(item.lastSync).toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className={getStatusClass(item.status)}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {item.status === 'Connected' ? (
                    <>
                      <button 
                        onClick={() => onSync(item.id)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold border border-blue-100 rounded-xl cursor-pointer transition-all flex items-center gap-1"
                      >
                        <RefreshCw size={12} className="animate-spin-hover" /> Sync Now
                      </button>
                      <button 
                        onClick={() => onDisconnect(item.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold rounded-xl cursor-pointer transition-all"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => onConnect(item.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer border-none shadow-sm transition-all"
                    >
                      Establish Connection
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* 3. SYNC QUEUE TABLE */
export const SyncQueueTable = ({ queue = [], onRetry, onCancel }) => {
  return (
    <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
      <table className="w-full border-collapse text-left text-xs font-sans">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job ID</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform / Task</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Progress</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
          {queue.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-12 text-center text-slate-400">
                ∅ Sync Queue is currently empty.
              </td>
            </tr>
          ) : (
            queue.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-slate-700">{job.id}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{job.type}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Domain: {job.module}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5 w-32">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          job.status === 'Failed' ? 'bg-rose-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-[9px] text-slate-400">{job.progress}% Sync Complete</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={getStatusClass(job.status)}>
                    {job.status}
                  </span>
                  {job.error && (
                    <span className="block text-[9px] text-rose-500 mt-1 font-mono font-medium truncate w-40" title={job.error}>
                      {job.error}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {job.status === 'Failed' && (
                      <button 
                        onClick={() => onRetry(job.id)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold border border-amber-100 rounded-lg cursor-pointer text-[10px]"
                      >
                        Retry Job
                      </button>
                    )}
                    {(job.status === 'Queued' || job.status === 'Running') && (
                      <button 
                        onClick={() => onCancel(job.id)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold rounded-lg cursor-pointer text-[10px]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* 4. QUICKBOOKS STATUS CARD */
export const QuickBooksStatusCard = ({ onFullSync }) => {
  const assets = [
    { title: 'Chart of Accounts', status: 'Synced', count: 18, date: '10 mins ago' },
    { title: 'Tenant Customers', status: 'Synced', count: 32, date: '15 mins ago' },
    { title: 'Landlord Vendors', status: 'Synced', count: 8, date: '2 hrs ago' },
    { title: 'Rental Invoices', status: 'Pending', count: 4, date: 'Queued' }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-5">
      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">QuickBooks File Status</h4>
          <p className="text-[10px] text-slate-400 font-medium">Mapped ledger assets and balances</p>
        </div>
        <button 
          onClick={onFullSync}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl border-none shadow-sm cursor-pointer"
        >
          Sync All Ledger Files
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {assets.map((a, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-800">{a.title}</span>
              <span className="text-[10px] text-slate-400 font-medium">{a.count} records · Mapped</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={getStatusClass(a.status)}>{a.status}</span>
              <span className="text-[9px] text-slate-400 font-mono">{a.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* 5. EMAIL HISTORY TABLE */
export const EmailHistoryTable = ({ emails = [], onDelete }) => {
  const [selectedMail, setSelectedMail] = useState(null);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Sent</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
            {emails.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-400">
                  ∅ Email history log is empty.
                </td>
              </tr>
            ) : (
              emails.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{m.recipients}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Template: {m.templateName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium truncate max-w-[200px]">{m.subject}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={getStatusClass(m.status)}>{m.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => setSelectedMail(m)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer border-none"
                        title="Read Email Body"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(m.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer border-none"
                        title="Delete Log"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW EMAIL BODY MODAL */}
      {selectedMail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Email Viewer</span>
                <h3 className="font-bold text-slate-800 text-base">{selectedMail.subject}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedMail(null)} 
                className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-slate-500 border-b border-slate-50 pb-3">
              <span>Recipients: <strong className="text-slate-700">{selectedMail.recipients}</strong></span>
              <span>Dispatched At: <strong className="text-slate-700">{new Date(selectedMail.createdAt).toLocaleString()}</strong></span>
              <span>Delivery Status: <span className={getStatusClass(selectedMail.status)}>{selectedMail.status}</span></span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-100">
              {selectedMail.body}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setSelectedMail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border-none shadow-md text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 6. CALENDAR WIDGET */
export const CalendarWidget = ({ events = [], onCreateEvent, onDeleteEvent }) => {
  const [activeDate, setActiveDate] = useState(new Date());
  
  // Custom simple monthly view rendering
  const daysInMonth = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 1));
  };

  const getEventsForDay = (day) => {
    const dayStr = `${activeDate.getFullYear()}-${String(activeDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.start === dayStr);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
        <div className="flex items-center gap-3">
          <h4 className="font-bold text-slate-800 text-sm">Google Calendar Synced Schedule</h4>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-black text-[9px] uppercase tracking-wider">Mock Server</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-50 rounded-lg cursor-pointer bg-white border border-slate-200">◀</button>
          <span className="w-24 text-center font-black uppercase tracking-wider">{activeDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-slate-50 rounded-lg cursor-pointer bg-white border border-slate-200">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1.5 font-sans">
        {Array.from({ length: startDay }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-20 bg-slate-50/20 border border-slate-100/10 rounded-xl" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const dayEvents = getEventsForDay(day);
          return (
            <div key={day} className="h-20 bg-white border border-slate-100 rounded-2xl p-1.5 flex flex-col gap-1 hover:border-blue-300 transition-all cursor-pointer relative group">
              <span className="text-[10px] font-black text-slate-400 leading-none">{day}</span>
              <div className="flex flex-col gap-0.5 overflow-y-auto max-h-12 pr-0.5 mt-0.5">
                {dayEvents.map(e => (
                  <span 
                    key={e.id} 
                    className="text-[8px] font-bold px-1 py-0.5 rounded truncate bg-blue-50 text-blue-600 border border-blue-100/50 leading-none select-none block"
                    title={e.title}
                  >
                    {e.title}
                  </span>
                ))}
              </div>

              {/* Quick actions popup overlay */}
              <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                <button 
                  onClick={() => onCreateEvent(day)} 
                  className="w-3.5 h-3.5 rounded bg-slate-900 text-white text-[9px] font-black flex items-center justify-center cursor-pointer border-none"
                  title="Create event"
                >
                  +
                </button>
                {dayEvents.length > 0 && (
                  <button 
                    onClick={() => onDeleteEvent(dayEvents[0].id)} 
                    className="w-3.5 h-3.5 rounded bg-rose-500 text-white text-[9px] font-black flex items-center justify-center cursor-pointer border-none"
                    title="Delete last event"
                  >
                    -
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* 7. NOTIFICATION LIST */
export const NotificationList = ({ notifications = [], onRead, onDismiss, onArchive }) => {
  return (
    <div className="flex flex-col gap-3">
      {notifications.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl shadow-card">
          ∅ No notifications found in this category.
        </div>
      ) : (
        notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`p-4 rounded-3xl border flex gap-4 items-start justify-between shadow-sm transition-all hover:shadow-md ${
              notif.isRead ? 'bg-white border-slate-100 text-slate-600' : 'bg-blue-50/20 border-blue-100/50 text-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 ${
                notif.priority === 'High' ? 'bg-rose-500 shadow-rose-500/20' : notif.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
              }`}>
                {notif.category === 'Rent' ? <Landmark size={14} /> : notif.category === 'Hearings' ? <Gavel size={14} /> : <Info size={14} />}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">{notif.title}</span>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    notif.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {notif.priority}
                  </span>
                </div>
                <span className="text-xs text-slate-500 leading-relaxed font-medium">{notif.description}</span>
                <span className="text-[9px] text-slate-400 font-mono mt-1">{new Date(notif.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {!notif.isRead && (
                <button 
                  onClick={() => onRead(notif.id)}
                  className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg cursor-pointer"
                >
                  Mark Read
                </button>
              )}
              <button 
                onClick={() => onArchive(notif.id)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer border-none"
                title="Archive"
              >
                <Archive size={14} />
              </button>
              <button 
                onClick={() => onDismiss(notif.id)}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer border-none"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

/* 8. NOTIFICATION BELL (Top bar bell badge) */
export const NotificationBell = ({ count = 0, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-all border-none bg-transparent cursor-pointer"
      title="In-App Notification Feed"
    >
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white animate-pulse">
          {count}
        </span>
      )}
    </button>
  );
};

/* 9. SYNC TIMELINE */
export const SyncTimeline = ({ logs = [] }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
      <div>
        <h4 className="font-bold text-slate-800 text-sm">System Operations Audit log</h4>
        <p className="text-xs text-slate-400 font-medium">Append-only synchronization transactions logs</p>
      </div>

      <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-12">No audit timeline entries recorded yet.</p>
        ) : (
          logs.slice().reverse().map((l) => (
            <div key={l.id} className="flex gap-3 text-xs items-start">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 border-2 border-white outline outline-2 ${
                l.eventType === 'Sync Completed' || l.eventType === 'Email Sent'
                  ? 'outline-emerald-500 bg-emerald-500'
                  : l.eventType === 'Sync Failed'
                  ? 'outline-rose-500 bg-rose-500'
                  : 'outline-blue-500 bg-blue-500'
              }`} />
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{l.eventType} - {l.integrationName}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{new Date(l.createdAt).toLocaleTimeString()}</span>
                </div>
                <span className="text-slate-500 leading-relaxed font-semibold text-[11px]">{l.description}</span>
                <span className="text-[9px] text-slate-400 font-mono">By: {l.createdBy}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* 10. INTEGRATION LOGS */
export const IntegrationLogs = ({ logs = [] }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-xs text-slate-300 font-mono shadow-card flex flex-col gap-3 h-80">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-emerald-400 tracking-wider">ROOT SYSTEM CONSOLE LOGS</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] text-slate-500 font-black">API LISTENER ACTIVE</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1 text-[11px] leading-relaxed">
        {logs.slice(-10).map((l, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-slate-500">[{new Date(l.createdAt).toISOString().split('T')[1].slice(0,8)}]</span>
            <span className="text-blue-400">[{l.integrationName}]</span>
            <span className={l.eventType === 'Sync Failed' ? 'text-rose-400' : 'text-slate-200'}>
              {l.description}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-slate-500 italic">Listening for integration hooks...</p>
        )}
      </div>
    </div>
  );
};

/* 11. RECENT SYNC WIDGET */
export const RecentSyncWidget = ({ queue = [] }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
        <h4 className="font-bold text-slate-800 text-sm">Recent Sync Jobs</h4>
        <Link to="/integrations?tab=queue" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All Queue</Link>
      </div>

      <div className="flex flex-col gap-3">
        {queue.slice(0, 3).map((job) => (
          <div key={job.id} className="flex justify-between items-center text-xs">
            <div className="flex flex-col">
              <span className="font-bold text-slate-800">{job.type}</span>
              <span className="text-[9px] text-slate-400 font-mono">{job.module}</span>
            </div>
            <span className={getStatusClass(job.status)}>{job.status}</span>
          </div>
        ))}
        {queue.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">No sync jobs run yet.</p>
        )}
      </div>
    </div>
  );
};

/* 12. INTEGRATION HEALTH WIDGET */
export const IntegrationHealthWidget = () => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-5 justify-between h-80">
      <div>
        <h4 className="font-bold text-slate-800 text-sm">Integrations Pipeline Health</h4>
        <p className="text-[10px] text-slate-400 font-medium">Uptime, latencies, and packet delivery speed</p>
      </div>

      <div className="flex flex-col gap-4.5 flex-1 justify-center">
        <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Globe size={14} className="text-slate-400" /> API Gateway Speed
          </span>
          <span className="font-mono text-xs font-bold text-emerald-600">245 ms (Optimal)</span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Activity size={14} className="text-slate-400" /> Pipeline Packet Loss
          </span>
          <span className="font-mono text-xs font-bold text-emerald-600">0.00% (Lossless)</span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-slate-400" /> API Security Checks
          </span>
          <span className="font-mono text-xs font-bold text-emerald-600">Passed (AES-256)</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Sun size={14} className="text-slate-400" /> Service SLA Uptime
          </span>
          <span className="font-mono text-xs font-bold text-blue-600">99.98%</span>
        </div>
      </div>
    </div>
  );
};
