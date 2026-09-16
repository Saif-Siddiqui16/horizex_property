import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Users, Home, TrendingUp, Wallet, BadgeDollarSign, 
  ShieldAlert, FileText, Gavel, Calendar, Clock, Landmark, AlertTriangle, Info, Play, CheckCircle, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, Label
} from 'recharts';

// Color Palette Constants
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Helper to format currency
const formatCurr = (val) => `$${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/* 1. EXECUTIVE KPI CARDS (with Drilldown support) */
export const ExecutiveKPICards = ({ kpis = {}, onDrilldown }) => {
  const cards = [
    { id: 'apartments', title: 'Total Units', value: kpis.totalApartments || 0, subValue: `${kpis.occupiedApartments} Occ · ${kpis.vacantApartments} Vac`, icon: Home, color: 'bg-blue-50 border-blue-100 text-blue-600', path: '/units' },
    { id: 'occupancy', title: 'Occupancy Rate', value: `${kpis.occupancyRate || 0}%`, subValue: 'Target: 95%', icon: Building2, color: 'bg-emerald-50 border-emerald-100 text-emerald-600', path: '/vacancy' },
    { id: 'revenue', title: 'Current Revenue', value: formatCurr(kpis.currentMonthRevenue), subValue: 'This Month Cash', icon: TrendingUp, color: 'bg-indigo-50 border-indigo-100 text-indigo-600', path: '/payments/collection' },
    { id: 'overdue', title: 'Outstanding Rent', value: formatCurr(kpis.outstandingRent), subValue: 'Pending Collections', icon: Clock, color: 'bg-amber-50 border-amber-100 text-amber-600', path: '/payments/collection' },
    { id: 'tal_cases', title: 'Active Lawsuits', value: kpis.activeTALCases || 0, subValue: 'Tribunal Cases', icon: Gavel, color: 'bg-rose-50 border-rose-100 text-rose-600', path: '/tal-cases' },
    { id: 'payroll', title: 'Payroll Cost', value: formatCurr(kpis.payrollCost), subValue: 'Staff Expenses', icon: Landmark, color: 'bg-violet-50 border-violet-100 text-violet-600', path: '/payroll/run' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c) => (
        <div 
          key={c.id}
          onClick={() => onDrilldown ? onDrilldown(c.path) : (window.location.href = c.path)}
          className="bg-white p-4.5 rounded-[22px] border border-slate-100 shadow-sm hover:shadow-md transition-all group active:scale-[0.98] flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${c.color} shadow-sm`}>
                <c.icon size={16} />
              </div>
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest leading-none">Drill</span>
                <ArrowUpRight size={12} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>
            </div>
            <h4 className="text-slate-400 font-bold text-[9px] uppercase tracking-wider leading-none">{c.title}</h4>
            <p className="text-lg font-black text-slate-800 tracking-tight mt-1.5 leading-none">{c.value}</p>
          </div>
          <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none block truncate">{c.subValue}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* 2. EXECUTIVE ALERTS WIDGET */
export const ExecutiveAlertsWidget = ({ alerts = [] }) => {
  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Warning': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case 'Critical': return <AlertTriangle size={16} className="text-rose-500 shrink-0" />;
      case 'Warning': return <AlertTriangle size={16} className="text-amber-500 shrink-0" />;
      default: return <Info size={16} className="text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
        <h3 className="font-bold text-slate-800 text-sm">Executive Operational Alerts</h3>
        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-black text-[10px] tracking-wide">{alerts.length} Alerts</span>
      </div>

      <div className="flex flex-col gap-3 max-h-56 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">All systems nominal. No alerts found.</p>
        ) : (
          alerts.map((al) => (
            <div key={al.id} className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold ${getSeverityStyle(al.severity)}`}>
              {getSeverityIcon(al.severity)}
              <span className="flex-1">{al.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* 3. REVENUE TREND WIDGET (Area Chart) */
export const RevenueTrendWidget = ({ data = [] }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Monthly Revenue Trend</h3>
        <p className="text-xs text-slate-400 font-medium">Consolidated cash flow collections</p>
      </div>

      <div className="w-full" style={{height: 200}}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* 4. OCCUPANCY WIDGET (Pie / Donut Chart) */
export const OccupancyWidget = ({ occupancy = {} }) => {
  const chartData = [
    { name: 'Occupied', value: occupancy.occupied || 1 },
    { name: 'Vacant', value: occupancy.vacant || 0 }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Occupancy Target Ratio</h3>
        <p className="text-xs text-slate-400 font-medium">Currently occupied vs vacant ratio</p>
      </div>

      <div className="w-full relative flex items-center justify-center" style={{height: 160}}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
              <Cell fill="#10B981" />
              <Cell fill="#F1F5F9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-slate-800 tracking-tight">{occupancy.rate || 0}%</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occupied</span>
        </div>
      </div>

      <div className="flex justify-around text-xs border-t border-slate-50 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-bold text-slate-700">{occupancy.occupied} Leased</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="font-bold text-slate-700">{occupancy.vacant} Vacant</span>
        </div>
      </div>
    </div>
  );
};

/* 5. OUTSTANDING BALANCE WIDGET (Bar Chart) */
export const OutstandingBalanceWidget = ({ collection = {} }) => {
  const chartData = [
    { name: 'Collected', value: collection.paid || 0 },
    { name: 'Overdue', value: collection.unpaid || 0 }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Rent Outstanding Ledger</h3>
        <p className="text-xs text-slate-400 font-medium">Collections vs outstanding balances</p>
      </div>

      <div className="w-full" style={{height: 200}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']} />
            <Bar dataKey="value" fill="#EAB308" radius={[10, 10, 0, 0]}>
              <Cell fill="#10B981" />
              <Cell fill="#EF4444" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* 6. RENT ROLL WIDGET (Quick Rollup list) */
export const RentRollWidget = ({ rentRoll = [] }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Lease Rent Roll Overview</h3>
          <p className="text-[10px] text-slate-400 font-medium">Top monthly lease amounts</p>
        </div>
        <Link to="/reports?tab=standard&report=Rent Roll" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
      </div>

      <div className="flex flex-col gap-2">
        {rentRoll.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No rent roll data found.</p>
        ) : (
          rentRoll.slice(0, 4).map((row, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/50 border border-slate-100/50">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 text-xs">{row.tenantName}</span>
                <span className="text-[10px] text-slate-400 font-medium">{row.buildingName} · {row.unitNumber}</span>
              </div>
              <span className="font-mono font-bold text-slate-700 text-xs">${row.rentAmount?.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* 7. RENEWAL WIDGET (Line Graph Success Rate) */
export const RenewalWidget = ({ renewals = {} }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Lease Renewal Performance</h3>
        <p className="text-xs text-slate-400 font-medium">Renewal success rate and statuses</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 py-3">
        <span className="text-4xl font-black text-indigo-600 tracking-tight">{renewals.successRate || 100}%</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Renewal Success Rate</span>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-50 pt-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Accepted/Renewed</span>
          <span className="font-bold text-slate-800">{renewals.accepted}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Pending Decision</span>
          <span className="font-bold text-slate-800">{renewals.pending}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Refused/Terminated</span>
          <span className="font-bold text-slate-800">{renewals.rejected}</span>
        </div>
      </div>
    </div>
  );
};

/* 8. LEGAL CASES WIDGET (Court Case lists) */
export const LegalCasesWidget = ({ tal = {} }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">TAL Litigation Milestones</h3>
        <p className="text-xs text-slate-400 font-medium">Active lawsuits and trial outcomes</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 py-3">
        <span className="text-4xl font-black text-rose-600 tracking-tight">{tal.active || 0}</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tribunal Cases</span>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-50 pt-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Resolved Cases</span>
          <span className="font-bold text-slate-800">{tal.closed}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Court Win Ratio</span>
          <span className="font-bold text-slate-800">{tal.successRate}%</span>
        </div>
      </div>
    </div>
  );
};

/* 9. ATTENDANCE WIDGET (KPI & Stats chart) */
export const AttendanceWidget = ({ attendance = {} }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Staff Attendance Ratios</h3>
        <p className="text-xs text-slate-400 font-medium">Monthly check-in summary percentages</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 py-3">
        <span className="text-4xl font-black text-emerald-600 tracking-tight">{attendance.presentPct || 100}%</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Present Rate</span>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-50 pt-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Late Arrival rate</span>
          <span className="font-bold text-slate-800">{attendance.latePct}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Leave/Absence rate</span>
          <span className="font-bold text-slate-800">{attendance.leavePct}%</span>
        </div>
      </div>
    </div>
  );
};

/* 10. PAYROLL WIDGET (Cost distributions) */
export const PayrollWidget = ({ payroll = {} }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Corporate Payroll Breakdown</h3>
        <p className="text-xs text-slate-400 font-medium">Labor salary allocations</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 py-3">
        <span className="text-3xl font-black text-slate-800 tracking-tight">{formatCurr(payroll.totalCost)}</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Payroll</span>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-50 pt-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Overtime compensation</span>
          <span className="font-bold text-slate-800">{formatCurr(payroll.overtimeCost)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Allowances allocation</span>
          <span className="font-bold text-slate-800">{formatCurr(payroll.allowancesCost)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Employees Processed</span>
          <span className="font-bold text-slate-800">{payroll.count} Staff</span>
        </div>
      </div>
    </div>
  );
};

/* 11. VACANCY WIDGET (Vacant units lists) */
export const VacancyWidget = ({ vacantList = [] }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Vacant Apartments List</h3>
          <p className="text-[10px] text-slate-400 font-medium">Unleased units ready for rent</p>
        </div>
        <Link to="/reports?tab=standard&report=Vacancy Report" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
      </div>

      <div className="flex flex-col gap-2">
        {vacantList.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">All units are currently occupied.</p>
        ) : (
          vacantList.slice(0, 4).map((apt, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/30 border border-amber-100/30">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 text-xs">{apt.propertyName || apt.buildingName}</span>
                <span className="text-[10px] text-slate-400 font-medium">{apt.unitNumber} · {apt.unitType || 'Apartment'}</span>
              </div>
              <span className="font-bold text-slate-700 text-xs">${(apt.monthlyRent || apt.rent || 1200).toLocaleString()}/mo</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* 12. LISTING STATUS WIDGET (Listing list) */
export const ListingStatusWidget = ({ listingList = [] }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Unit Marketing Listing</h3>
          <p className="text-[10px] text-slate-400 font-medium">Marketing listings status</p>
        </div>
        <Link to="/reports?tab=standard&report=Listing Status" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
      </div>

      <div className="flex flex-col gap-2">
        {listingList.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No listing data available.</p>
        ) : (
          listingList.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/50 border border-slate-100/50 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 text-xs">{item.buildingName} · {item.unitNumber}</span>
                <span className="text-[10px] text-slate-400">Monthly Rent: ${item.monthlyRent || item.rent || 1200}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                item.status === 'Vacant' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {item.status === 'Vacant' ? 'Listed' : 'Leased'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* 13. UPCOMING TASKS WIDGET (Reminders / Task checklist) */
export const UpcomingTasksWidget = ({ tasks = [] }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">High Priority Follow-ups</h3>
          <p className="text-[10px] text-slate-400 font-medium">Urgent operations calendar list</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No high priority follow-up tasks.</p>
        ) : (
          tasks.slice(0, 4).map((t, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-rose-50/20 border border-rose-100/20">
              <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 text-xs">{t.description || t.title}</span>
                <span className="text-[10px] text-slate-400 font-medium">Due Date: {t.dueDate || 'Today'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
