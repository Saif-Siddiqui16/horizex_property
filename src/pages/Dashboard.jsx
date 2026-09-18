import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { hasPermission } from '../utils/permissions';
import { UpcomingRenewalsWidget } from '../components/renewals/UpcomingRenewalsWidget';
import { RecentRenewalsWidget } from '../components/renewals/RecentRenewalsWidget';
import { mockRenewalService, collectionAnalyticsService, invoiceService, legalAnalyticsService, taskService } from '../mock/mockServices';
import { notesHubService } from '../services/notesHubService';

/* TIME & PAYROLL INTEGRATION */
import payrollAnalyticsService from '../services/payrollAnalyticsService';
import leaveService from '../services/leaveService';
import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';
import payrollSettingsService from '../services/payrollSettingsService';
import { PendingLeaveWidget } from '../components/payroll/PendingLeaveWidget';
import { UpcomingPayrollWidget } from '../components/payroll/UpcomingPayrollWidget';
import { RecentPaymentsWidget } from '../components/collection/RecentPaymentsWidget';
import { UpcomingHearingsWidget } from '../components/tal/UpcomingHearingsWidget';
import { DashboardTasksWidget } from '../components/tal/DashboardTasksWidget';
import { UrgentCasesWidget } from '../components/tal/UrgentCasesWidget';
import { CommunicationTimeline } from '../components/notes/CommunicationTimeline';
import { RecentNotesWidget } from '../components/notes/RecentNotesWidget';

/* ENTERPRISE INTEGRATIONS MODULE */
import syncEngineService from '../services/syncEngineService';
import calendarService from '../services/calendarService';
import notificationService from '../services/notificationService';
import emailService from '../services/emailService';
import integrationAnalyticsService from '../services/integrationAnalyticsService';
import { 
  BarChart, 

  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { 
  Building2, 
  Home, 
  Users, 
  TrendingUp, 
  Wallet, 
  BadgeDollarSign, 
  ShieldAlert, 
  FileText, 
  Car, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserPlus,
  Wrench,
  Gavel,
  StickyNote,
  CheckCircle
} from 'lucide-react';



export const Dashboard = () => {
    const [__forceUpdate, __setForceUpdate] = useState(0);
    useEffect(() => {
        const handleUpdate = () => __setForceUpdate(p => p + 1);
        window.addEventListener('permissionsUpdated', handleUpdate);
        return () => window.removeEventListener('permissionsUpdated', handleUpdate);
    }, []);

    // Dynamic greeting and user name
    const [adminName, setAdminName] = useState('Admin');
    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.name) setAdminName(user.name.split(' ')[0]);
        } catch (e) {}
    }, []);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const canViewAnyDashboard = hasPermission('Dashboard', 'view') || 
                               hasPermission('Overview', 'view') || 
                               hasPermission('Vacancy Dashboard', 'view') || 
                               hasPermission('Revenue Dashboard', 'view');

  const [stats, setStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [renewals, setRenewals] = useState([]);
  const [collectionMetrics, setCollectionMetrics] = useState({});
  const [dashboardInvoices, setDashboardInvoices] = useState([]);
  const [legalSummary, setLegalSummary] = useState({});
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [notesActivity, setNotesActivity] = useState([]);
  const [notesStats, setNotesStats] = useState({});
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [leaseAlertPage, setLeaseAlertPage] = useState(1);
  const [reservedUnitPage, setReservedUnitPage] = useState(1);
  const leaseAlertsPerPage = 5;
  const reservedUnitsPerPage = 5;

  // Time & Payroll States
  const [payrollKPIs, setPayrollKPIs] = useState({});
  const [dashboardPendingLeaves, setDashboardPendingLeaves] = useState([]);
  const [dashboardEmployees, setDashboardEmployees] = useState([]);
  const [dashboardSettings, setDashboardSettings] = useState({});
  const [dashboardCorrections, setDashboardCorrections] = useState([]);

  // Integrations States
  const [integrationStats, setIntegrationStats] = useState({});
  const [dashboardEvents, setDashboardEvents] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [sentEmailsCount, setSentEmailsCount] = useState(0);


  const fetchStats = async (ownerId = '') => {
    try {
      setLoading(true);
      const ownerParam = ownerId ? `?ownerId=${ownerId}` : '';
      const [dashRes, revRes, renewalRes] = await Promise.all([
        api.get(`/api/admin/dashboard/stats${ownerParam}`),
        api.get(`/api/admin/analytics/revenue${ownerParam}`),
        mockRenewalService.getAll()
      ]);
      setStats(dashRes.data);
      setRevenueStats(revRes.data);
      setRenewals(renewalRes.data || []);
      setCollectionMetrics(collectionAnalyticsService.getMetrics());
      setDashboardInvoices(invoiceService.getAll());
      setLegalSummary(legalAnalyticsService.getDashboardSummary());
      setUpcomingHearings(legalAnalyticsService.getUpcomingHearings(7));
      setOverdueTasks(legalAnalyticsService.getOverdueTasks());
      setNotesActivity(notesHubService.getRecentActivity(8));
      setNotesStats(notesHubService.getStats());
      setRecentNotes(notesHubService.listNotes({}).slice(0, 5));

      // Fetch Time & Payroll
      const compId = localStorage.getItem('global_selected_company_id') || '';
      setPayrollKPIs(payrollAnalyticsService.getKPIs(compId));
      setDashboardPendingLeaves(leaveService.getAll({ companyId: compId, status: 'Pending' }));
      setDashboardEmployees(employeeService.getAll({ companyId: compId }));
      setDashboardSettings(payrollSettingsService.getSettings());
      setDashboardCorrections(attendanceService.getCorrections({ companyId: compId, status: 'Pending' }));

      // Fetch Integrations
      setIntegrationStats(integrationAnalyticsService.getStats());
      setDashboardEvents(calendarService.getAll());
      setUnreadNotifsCount(notificationService.getUnreadCount());
      setSentEmailsCount(emailService.getAll().length);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      setStats(null);
      setRevenueStats(null);
      setRenewals([]);
      setCollectionMetrics({});
      setDashboardInvoices([]);
      setLegalSummary({});
      setUpcomingHearings([]);
      setOverdueTasks([]);
      setNotesActivity([]);
      setNotesStats({});
      setRecentNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleCompanyChange = () => {
      fetchStats();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  const handleCompleteTask = (taskId) => {
    taskService.markComplete(taskId);
    fetchStats();
  };

  const handleCancelRefund = async (tenantId, unitId) => {
    if (!window.confirm('Are you sure you want to cancel the refund process for this tenant?')) return;
    try {
      await api.post('/api/admin/refunds', {
        tenantId: parseInt(tenantId),
        unitId: parseInt(unitId),
        type: 'Security Deposit',
        status: 'Cancelled',
        outcomeReason: 'Cancelled – lease renewed',
        amount: 0,
        reason: 'Refund process cancelled via Dashboard Alert'
      });
      alert('Refund process cancelled successfully.');
      fetchStats();
    } catch (error) {
      console.error('Failed to cancel refund process', error);
      alert('Failed to cancel refund process');
    }
  };

  // Fallback to initial structure if API fails or returns partial
  const data = stats || {
    totalProperties: 0,
    totalUnits: 0,
    occupancy: { occupied: 0, vacant: 0 },
    projectedRevenue: 0,
    actualRevenue: 0,
    insuranceAlerts: { expired: 0, expiringSoon: 0 },
    leaseAlerts: { expired: 0, expiringSoon: 0 },
    leaseAlertList: [],
    recentActivity: []
  };

  const { totalProperties, totalUnits, occupancy, projectedRevenue, actualRevenue, outstandingRent, outstandingDeposits, insuranceAlerts, leaseAlerts, leaseAlertList, recentActivity, vehicleStats, pendingRefunds, reservedUnits } = data;

  const sortedLeaseAlertList = leaseAlertList ? [...leaseAlertList].sort((a, b) => a.daysLeft - b.daysLeft) : [];
  const totalLeaseAlertPages = Math.ceil(sortedLeaseAlertList.length / leaseAlertsPerPage);
  const paginatedLeaseAlerts = sortedLeaseAlertList.slice(
    (leaseAlertPage - 1) * leaseAlertsPerPage,
    leaseAlertPage * leaseAlertsPerPage
  );

  const paginatedReservedUnits = reservedUnits ? reservedUnits.slice(
    (reservedUnitPage - 1) * reservedUnitsPerPage,
    reservedUnitPage * reservedUnitsPerPage
  ) : [];
  const totalReservedUnitPages = Math.ceil((reservedUnits?.length || 0) / reservedUnitsPerPage);

  // Build revenue chart from real monthly data (sorted chronologically)
  const revenueData = [...(revenueStats?.monthlyRevenue || [])]
    .sort((a, b) => {
      const parse = (s) => {
        if (!s) return 0;
        if (typeof s !== 'string') return 0;
        if (s.includes('-')) {
          const [y, m] = s.split('-');
          return new Date(y, parseInt(m, 10) - 1).getTime();
        }
        const [mName, y] = s.split(' ');
        const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        const shortMonthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

        let mIdx = monthNames.indexOf(mName.toLowerCase());
        if (mIdx === -1) mIdx = shortMonthNames.indexOf(mName.toLowerCase());

        return new Date(y, mIdx !== -1 ? mIdx : 0).getTime();
      };
      return parse(a.month) - parse(b.month);
    })
    .map(m => ({
      month: m.month,          // e.g. "2025-03"
      revenue: m.amount,
      rent: m.rent,
      deposit: m.deposit,
      serviceFees: m.serviceFees,
    }));

  // Format month label: "2025-03" -> "Mar '25" or "March 2026" -> "Mar '26"
  const formatMonth = (val) => {
    if (!val) return '';
    if (val.toString().includes('-')) {
      const [year, mon] = val.split('-');
      const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${names[parseInt(mon, 10) - 1]} '${year.slice(2)}`;
    }
    // Handle "March 2025" format
    const parts = val.toString().split(' ');
    if (parts.length === 2) {
      const longMonth = parts[0];
      const year = parts[1];
      return `${longMonth.substring(0, 3)} '${year.slice(2)}`;
    }
    return val;
  };

  // NEW: Fix for the "One-Day Backup" bug (Ignores timezone shifting)
  const formatTableDate = (dateString) => {
    if (!dateString) return 'N/A';
    // dateString looks like "2026-04-30T00:00:00.000Z"
    // We only care about the part BEFORE the 'T'
    const [year, month, day] = dateString.split('T')[0].split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
  };

  if (!canViewAnyDashboard) {
    return (
      <MainLayout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[32px] border border-slate-100 shadow-2xl p-16 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6 shadow-xl shadow-rose-100/50">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight uppercase italic">Access Restricted</h2>
          <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
            You do not have the necessary permissions to view the unified Dashboard. Please contact your property administrator.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard Overview">
      <div className="flex flex-col gap-4">

        {/* TOP BAR / FILTERS */}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {(() => {
                    const upcomingVacancies = sortedLeaseAlertList.filter(a => a.daysLeft > 0);
                    return [
                        { title: 'Upcoming Renewals', value: renewals.length || 0, subValue: 'Requires Action', icon: FileText, color: 'bg-orange-500', path: '/leases/renewals' },
                        { title: 'Upcoming Vacancies', value: upcomingVacancies.length || 0, subValue: upcomingVacancies.length > 0 ? `Next: ${formatTableDate(upcomingVacancies[0].expiryDate)}` : 'None upcoming', icon: Calendar, color: 'bg-teal-500', path: '/vacancy' },
                        { title: 'Outstanding Rent', value: `$${(collectionMetrics.totalOutstanding || 0).toLocaleString('en-CA')}`, subValue: 'AR Receivables', icon: Wallet, color: 'bg-rose-500', path: '/payments/outstanding' },
                        { title: 'Collection Rate', value: `${collectionMetrics.collectionRate || 0}%`, subValue: 'Overall Performance', icon: TrendingUp, color: 'bg-indigo-500', path: '/payments/collection' },
                        { title: 'Overdue Invoices', value: collectionMetrics.overdueCount || 0, subValue: 'Requires Collection', icon: Clock, color: 'bg-amber-500', path: '/payments/invoices' },
                        { title: 'This Month Collected', value: `$${(collectionMetrics.thisMonthCollection || 0).toLocaleString('en-CA')}`, subValue: 'Cash Inflow', icon: TrendingUp, color: 'bg-emerald-500', path: '/payments/received' },
                        { title: 'Active TAL Cases', value: legalSummary.activeCasesCount || 0, subValue: 'In Litigation', icon: Gavel, color: 'bg-violet-500', path: '/tal-cases' },
                        { title: 'Notes Hub', value: notesStats.totalNotes || 0, subValue: `${notesStats.recentCount || 0} This Week`, icon: StickyNote, color: 'bg-indigo-500', path: '/notes-hub' },
                        { title: 'Vacant Units', value: occupancy?.vacant || 0, subValue: 'Available Units', icon: Home, color: 'bg-blue-500', path: '/vacancy' }
                    ];
                })().map((card, idx) => (
                    <Link
                        key={idx}
                        to={card.path}
                        className="saas-card p-4 flex flex-col justify-between h-fit hover:ring-2 hover:ring-indigo-500 hover:-translate-y-1 transition-all cursor-pointer block"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                    <card.icon size={20} />
                                </div>
                            </div>
                            <h4 className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">{card.title}</h4>
                            <p className="text-xl font-black text-slate-800 tracking-tight mt-0.5">{card.value}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{card.subValue}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* LEASE EXPIRATION ALERTS TABLE (Detailed List) */}
            <section className="mt-6 mb-4">
              <div className="saas-table-container p-5 md:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">Lease Expiration Alerts</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Clients criteria: 45 days for short-term, 4 months for long-term leases</p>
                  </div>
                  <div className="px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                      {leaseAlertList?.length || 0} Alerts Found
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="saas-table">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Lease Holder</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Unit / Building</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Expiry Date</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Remaining</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedLeaseAlerts?.map((alert) => (
                        <tr key={alert.id} className="group transition-colors hover:bg-gray-50/50">
                          <td className="py-5 pl-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-800">{alert.tenant}</span>
                              <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{alert.type}</span>
                            </div>
                          </td>
                          <td className="py-5">
                            <span className="text-sm font-semibold text-gray-600">{alert.unit}</span>
                          </td>
                          <td className="py-5 text-center">
                            <span className="text-sm font-medium text-gray-500">
                              {formatTableDate(alert.expiryDate)}
                            </span>
                          </td>
                          <td className="py-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${alert.status === 'Expired'
                              ? 'bg-red-50 text-red-600'
                              : alert.daysLeft <= 30 ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'
                              }`}>
                              {alert.status === 'Expired' ? 'PAST DUE' : `${alert.daysLeft} Days Left`}
                            </span>
                          </td>
                          <td className="py-5 text-right pr-2">
                            <button
                              onClick={() => window.location.href = `/leases`}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline uppercase tracking-widest transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!leaseAlertList || leaseAlertList.length === 0) && (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-gray-400 italic text-sm font-medium">
                            No urgent lease expirations based on current criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {totalLeaseAlertPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                    <button
                      onClick={() => setLeaseAlertPage(p => Math.max(1, p - 1))}
                      disabled={leaseAlertPage === 1}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all uppercase tracking-widest cursor-pointer focus-visible:ring-2 rounded-lg"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Page</span>
                       <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black ring-1 ring-indigo-100 italic">{leaseAlertPage}</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">of {totalLeaseAlertPages}</span>
                    </div>
                    <button
                      onClick={() => setLeaseAlertPage(p => Math.min(totalLeaseAlertPages, p + 1))}
                      disabled={leaseAlertPage === totalLeaseAlertPages}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all uppercase tracking-widest cursor-pointer focus-visible:ring-2 rounded-lg"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* LEASE RENEWALS WIDGETS */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 items-start">
              <UpcomingRenewalsWidget renewals={renewals} />
              <RecentRenewalsWidget renewals={renewals} />
            </section>

            {/* RENT COLLECTION WIDGETS */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 items-start">
              <RecentPaymentsWidget
                payments={dashboardInvoices.flatMap(inv => inv.paymentsList || [])}
                invoices={dashboardInvoices}
              />
              
              {/* Quick Actions Card */}
              <div className="p-6 bg-slate-900 text-white rounded-[22px] shadow-[0_10px_30px_rgba(15,23,42,0.15)] hover:shadow-[0_15px_40px_rgba(15,23,42,0.25)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black tracking-tight mb-2">Rent Collection Quick Actions</h3>
                  <p className="text-xs text-slate-400 font-medium">Post transactions, waivers, and track ledgers</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => window.location.href = '/payments/collection'}
                    className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Open Workspace
                  </button>
                  <button
                    onClick={() => window.location.href = '/payments/collection'}
                    className="py-2.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl transition-all"
                  >
                    View Tenant Ledger
                  </button>
                </div>
              </div>
            </section>

            {/* TAL LEGAL WIDGETS */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 items-start">
              <UpcomingHearingsWidget hearings={upcomingHearings} />
              <DashboardTasksWidget tasks={overdueTasks} onCompleteTask={handleCompleteTask} />
              <UrgentCasesWidget cases={legalSummary.urgentCases || []} onView={(id) => window.location.href = `/tal-cases/${id}`} />
            </section>
            {/* NOTES & ACTIVITY */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 items-start">
              <Card className="lg:col-span-2 h-fit">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
                  Recent Notes Activity
                </h3>
                <CommunicationTimeline events={notesActivity} compact />
              </Card>
              <RecentNotesWidget notes={recentNotes} />
            </section>

            {/* TIME & PAYROLL SUMMARY INTEGRATION */}
            <section className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex flex-col gap-0.5 mb-6">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                  Time & Payroll Overview
                </h3>
                <span className="text-xs text-slate-400">Current company stats for attendance, pending leaves, and upcoming cycles.</span>
              </div>

              {/* KPI cards subset for Main Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 items-start">
                <div className="saas-card p-5 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present Today</span>
                    <span className="text-xl font-black text-slate-800">{payrollKPIs.presentToday || 0} Staff</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employees On Leave</span>
                    <span className="text-xl font-black text-slate-800">{payrollKPIs.employeesOnLeave || 0} Staff</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Corrections</span>
                    <span className="text-xl font-black text-rose-600">{dashboardCorrections.length} Alerts</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                </div>

                {/* Quick actions box for Main Dashboard */}
                <div className="bg-slate-900 text-white border border-slate-950 rounded-3xl p-5 shadow-card flex flex-col justify-between gap-3">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Time & Payroll Workspaces</span>
                  <div className="flex gap-2">
                    <Link to="/payroll/dashboard" className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition-all border-none">
                      Dashboard
                    </Link>
                    <Link to="/payroll/run" className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-bold transition-all border-none">
                      Runs
                    </Link>
                  </div>
                </div>
              </div>

              {/* Multi Widgets grid for Main Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-2">
                  <PendingLeaveWidget 
                    requests={dashboardPendingLeaves} 
                    onApprove={(id) => { leaveService.updateStatus(id, 'Approved'); fetchStats(); }}
                    onReject={(id, r) => { leaveService.updateStatus(id, 'Rejected', r); fetchStats(); }}
                  />
                </div>
                <div>
                  <UpcomingPayrollWidget 
                    employees={dashboardEmployees} 
                    settings={dashboardSettings} 
                  />
                </div>
              </div>
            </section>

            {/* RESERVED UNITS TABLE */}
            <section className="mt-6 mb-6">
              <div className="saas-table-container p-5 md:p-8 border-t-[4px] border-t-primary">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                       <UserPlus size={20} className="text-indigo-500" /> Reserved Units
                    </h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Confirmed reservations waiting for lease creation and move-in.</p>
                  </div>
                  <div className="px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                      {reservedUnits?.length || 0} Future Residents
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Tenant Name</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Property / Unit</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Tentative Move-In</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedReservedUnits?.map((item) => (
                        <tr key={item.id} className="group transition-colors hover:bg-gray-50/50">
                          <td className="py-5 pl-2">
                            <span className="text-sm font-bold text-gray-800">{item.tenantName}</span>
                          </td>
                          <td className="py-5">
                            <span className="text-sm font-semibold text-gray-600">{item.building} / {item.unitNumber}</span>
                          </td>
                          <td className="py-5 text-center">
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 italic">
                                {formatTableDate(item.moveInDate)}
                                </span>
                            </div>
                          </td>
                          <td className="py-5 text-right pr-2">
                            {item.isNewConstruction ? (
                              <button
                                onClick={() => window.location.href = `/unit-readiness`}
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                              >
                                View Readiness
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-300 font-bold uppercase italic mr-4">Existing Unit</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(!reservedUnits || reservedUnits.length === 0) && (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-gray-400 italic text-sm font-medium">
                            <Calendar size={24} className="mx-auto mb-2 text-slate-300" />
                            No active reservations at the moment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalReservedUnitPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50 px-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       Showing page {reservedUnitPage} of {totalReservedUnitPages}
                    </div>
                    <div className="flex items-center gap-1.5 font-sans">
                        <button
                          onClick={() => setReservedUnitPage(p => Math.max(1, p - 1))}
                          disabled={reservedUnitPage === 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                        </button>

                        {[...Array(totalReservedUnitPages)].map((_, i) => {
                          const p = i + 1;
                           // Only show first, last, and pages around current
                           if (p === 1 || p === totalReservedUnitPages || (p >= reservedUnitPage - 1 && p <= reservedUnitPage + 1)) {
                             return (
                              <button
                                key={p}
                                onClick={() => setReservedUnitPage(p)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all cursor-pointer ${
                                  reservedUnitPage === p
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                                }`}
                              >
                                {p}
                              </button>
                             );
                           }
                           if (p === reservedUnitPage - 2 || p === reservedUnitPage + 2) {
                            return <span key={p} className="text-slate-300 text-[10px] px-0.5">...</span>;
                           }
                           return null;
                        })}

                        <button
                          onClick={() => setReservedUnitPage(p => Math.min(totalReservedUnitPages, p + 1))}
                          disabled={reservedUnitPage === totalReservedUnitPages}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <ChevronRight size={14} />
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ENTERPRISE INTEGRATIONS MODULE WIDGETS */}
            <section className="mt-6 mb-4">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-black text-gray-800 tracking-tight">Enterprise Integrations Hub</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                  
                  {/* Sync Queue Summary */}
                  <div className="saas-card p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Sync & Connection Status</span>
                      <Link to="/integrations?tab=queue" className="text-[10px] text-indigo-600 font-bold hover:underline">Manage Queue</Link>
                    </div>
                    <div className="flex flex-col gap-3 justify-center flex-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-medium">Pending Sync Jobs</span>
                        <span className="font-bold text-slate-850 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-100">{integrationStats.pendingSyncJobs || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-medium">Failed Sync Jobs</span>
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">{integrationStats.failedSyncJobs || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-medium">Last Sync Attempt</span>
                        <span className="font-mono text-slate-500">{integrationStats.lastSuccessfulSync ? new Date(integrationStats.lastSuccessfulSync).toLocaleTimeString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Calendar Events */}
                  <div className="saas-card p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Upcoming Calendar Events</span>
                      <Link to="/integrations?tab=calendar" className="text-[10px] text-indigo-600 font-bold hover:underline">View Calendar</Link>
                    </div>
                    <div className="flex flex-col gap-2.5 max-h-[100px] overflow-y-auto pr-1">
                      {dashboardEvents.slice(0, 3).map((evt) => (
                        <div key={evt.id} className="flex justify-between text-xs font-semibold items-center">
                          <span className="text-slate-700 truncate w-36" title={evt.title}>{evt.title}</span>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded-md">{evt.start}</span>
                        </div>
                      ))}
                      {dashboardEvents.length === 0 && <span className="text-xs text-slate-400 italic">No sync events found.</span>}
                    </div>
                  </div>

                  {/* Unread Notifications / Recent Emails */}
                  <div className="saas-card p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Mails & Alerts</span>
                      <Link to="/integrations?tab=notifications" className="text-[10px] text-indigo-600 font-bold hover:underline">Open Inbox</Link>
                    </div>
                    <div className="flex flex-col gap-3 justify-center flex-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-medium">Unread System Alerts</span>
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold text-[10px] border border-rose-100">{unreadNotifsCount || 0} Alerts</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-medium">Sent Emails Count</span>
                        <span className="font-bold text-slate-700">{sentEmailsCount || 0} Emails</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-medium">Webhook Target Listeners</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Active</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

          </>
        )}

      </div>
    </MainLayout>
  );
};
