import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { hasPermission } from '../utils/permissions';

// RTK Query API Integrations
import { useGetCompaniesQuery } from '../store/api/companiesApi';
import {
  useGetQuickBooksOverviewQuery,
  useSaveQuickBooksCredentialsMutation,
  useTriggerQuickBooksSyncMutation,
  useGetCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useTriggerCalendarSyncMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDismissNotificationMutation,
  useGetNotificationRulesQuery,
  useToggleNotificationRuleMutation,
  useGetSyncQueueQuery,
  useRetrySyncJobMutation,
  useCancelSyncJobMutation,
  useGetIntegrationLogsQuery,
} from '../store/api/integrationsApi';

// Reusable Components
import {
  IntegrationKPICards,
  SyncQueueTable,
  QuickBooksStatusCard,
  CalendarWidget,
  NotificationList,
  SyncTimeline,
  IntegrationLogs,
  IntegrationHealthWidget,
} from '../components/integrations/IntegrationWidgets';

// Lucide Icons
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building,
  Key,
  ShieldCheck,
} from 'lucide-react';

export const QuickBooksSettings = () => {
  const [__forceUpdate, __setForceUpdate] = useState(0);
  useEffect(() => {
    const handleUpdate = () => __setForceUpdate((p) => p + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  // RBAC check
  if (!hasPermission('QuickBooks Sync', 'view')) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-8">
        <h3 className="text-xl font-black text-slate-800">Access Restricted</h3>
        <p className="max-w-md mx-auto mt-2 text-slate-500 font-medium italic">
          You do not have permission to view this section. Please contact your administrator.
        </p>
      </div>
    );
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'quickbooks');

  // ── COMPANY CONTEXT FROM HEADER FILTER ──────────────────────────────────
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    () => localStorage.getItem('global_selected_company_id') || ''
  );

  useEffect(() => {
    const handleCompanyChange = () => {
      const id = localStorage.getItem('global_selected_company_id') || '';
      setSelectedCompanyId(id);
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  // Query real companies from backend
  const { data: companies = [] } = useGetCompaniesQuery();

  const activeCompany = useMemo(() => {
    if (selectedCompanyId) {
      const match = companies.find((c) => String(c.id) === String(selectedCompanyId));
      if (match) return match;
    }
    return companies[0] || null;
  }, [companies, selectedCompanyId]);

  const effectiveCompanyId = activeCompany?.id || selectedCompanyId || '';

  // ── BACKEND RTK QUERIES ─────────────────────────────────────────────────
  const {
    data: qbOverview,
    isLoading: qbLoading,
    refetch: refetchQb,
  } = useGetQuickBooksOverviewQuery(effectiveCompanyId, {
    skip: !effectiveCompanyId && companies.length > 0,
  });

  const {
    data: calendarEvents = [],
    isLoading: calLoading,
    refetch: refetchCalendar,
  } = useGetCalendarEventsQuery(effectiveCompanyId, {
    skip: !effectiveCompanyId && companies.length > 0,
  });

  // Notification Filter States
  const [notifPriority, setNotifPriority] = useState('');
  const [notifCategory, setNotifCategory] = useState('');

  const {
    data: notifications = [],
    isLoading: notifLoading,
    refetch: refetchNotifs,
  } = useGetNotificationsQuery(
    {
      companyId: effectiveCompanyId,
      priority: notifPriority || undefined,
      category: notifCategory || undefined,
    },
    { skip: !effectiveCompanyId && companies.length > 0 }
  );

  const {
    data: notifRules = [],
    refetch: refetchRules,
  } = useGetNotificationRulesQuery(effectiveCompanyId, {
    skip: !effectiveCompanyId && companies.length > 0,
  });

  const {
    data: syncQueue = [],
    isLoading: queueLoading,
    refetch: refetchQueue,
  } = useGetSyncQueueQuery(effectiveCompanyId, {
    skip: !effectiveCompanyId && companies.length > 0,
  });

  const {
    data: auditLogs = [],
    refetch: refetchLogs,
  } = useGetIntegrationLogsQuery(effectiveCompanyId, {
    skip: !effectiveCompanyId && companies.length > 0,
  });

  // ── BACKEND MUTATIONS ───────────────────────────────────────────────────
  const [saveCredentials, { isLoading: isSavingCreds }] = useSaveQuickBooksCredentialsMutation();
  const [triggerSync, { isLoading: isSyncing }] = useTriggerQuickBooksSyncMutation();
  const [createCalEvent] = useCreateCalendarEventMutation();
  const [deleteCalEvent] = useDeleteCalendarEventMutation();
  const [syncCalendar, { isLoading: isSyncingCal }] = useTriggerCalendarSyncMutation();
  const [markNotifRead] = useMarkNotificationReadMutation();
  const [markAllNotifsRead] = useMarkAllNotificationsReadMutation();
  const [dismissNotif] = useDismissNotificationMutation();
  const [toggleRule] = useToggleNotificationRuleMutation();
  const [retryJob] = useRetrySyncJobMutation();
  const [cancelJob] = useCancelSyncJobMutation();

  // ── LOCAL COMPONENT STATES ─────────────────────────────────────────────
  const [qbCredentials, setQbCredentials] = useState({ clientId: '', clientSecret: '' });
  const [qbSyncType, setQbSyncType] = useState('Invoice');
  const [statusMessage, setStatusMessage] = useState(null);

  // Sync credentials state when backend loads existing ones
  useEffect(() => {
    if (qbOverview?.credentials?.clientId) {
      setQbCredentials((prev) => ({
        ...prev,
        clientId: qbOverview.credentials.clientId,
      }));
    }
  }, [qbOverview]);

  // Calendar Modal State
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarForm, setCalendarForm] = useState({
    title: '',
    start: '',
    category: 'Meeting',
    description: '',
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // ── ACTIONS ─────────────────────────────────────────────────────────────
  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      await saveCredentials({
        companyId: effectiveCompanyId,
        clientId: qbCredentials.clientId,
        clientSecret: qbCredentials.clientSecret,
      }).unwrap();
      setStatusMessage({ type: 'success', text: 'QuickBooks credentials linked successfully!' });
      refetchQb();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err?.data?.error?.message || 'Failed to save credentials' });
    }
  };

  const handleTriggerManualSync = async () => {
    setStatusMessage(null);
    try {
      const res = await triggerSync({
        companyId: effectiveCompanyId,
        entityType: qbSyncType,
        companyFile: activeCompany?.name || 'Company Ledger',
      }).unwrap();
      setStatusMessage({ type: 'success', text: res.message || 'QuickBooks synchronization executed.' });
      refetchQb();
      refetchQueue();
      refetchLogs();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err?.data?.error?.message || 'Sync failed.' });
    }
  };

  const handleFullLedgerSync = async () => {
    setStatusMessage(null);
    try {
      const res = await triggerSync({
        companyId: effectiveCompanyId,
        entityType: 'Full Account Ledger',
        companyFile: activeCompany?.name || 'Company Ledger',
      }).unwrap();
      setStatusMessage({ type: 'success', text: res.message || 'Full ledger sync completed.' });
      refetchQb();
      refetchQueue();
      refetchLogs();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err?.data?.error?.message || 'Full ledger sync failed.' });
    }
  };

  // ── CALENDAR ACTIONS ───────────────────────────────────────────────────
  const handleOpenCalendarCreate = (day) => {
    const formattedDay = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setCalendarForm({ title: '', start: formattedDay, category: 'Meeting', description: '' });
    setShowCalendarModal(true);
  };

  const handleCalendarCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCalEvent({
        companyId: effectiveCompanyId,
        ...calendarForm,
      }).unwrap();
      setShowCalendarModal(false);
      refetchCalendar();
    } catch (err) {
      alert(err?.data?.error?.message || 'Failed to create calendar event');
    }
  };

  const handleCalendarDelete = async (id) => {
    try {
      await deleteCalEvent({ id, companyId: effectiveCompanyId }).unwrap();
      refetchCalendar();
    } catch (err) {
      alert(err?.data?.error?.message || 'Failed to delete calendar event');
    }
  };

  const handleCalendarSyncAll = async () => {
    try {
      await syncCalendar({ companyId: effectiveCompanyId }).unwrap();
      refetchCalendar();
      refetchQueue();
    } catch (err) {
      alert(err?.data?.error?.message || 'Failed to sync calendar');
    }
  };

  // ── NOTIFICATION ACTIONS ───────────────────────────────────────────────
  const handleNotifRead = async (id) => {
    await markNotifRead(id);
    refetchNotifs();
  };

  const handleNotifDismiss = async (id) => {
    await dismissNotif(id);
    refetchNotifs();
  };

  const handleNotifMarkAllRead = async () => {
    await markAllNotifsRead(effectiveCompanyId);
    refetchNotifs();
  };

  const handleRuleToggle = async (id, active) => {
    await toggleRule({ id, isActive: !active, companyId: effectiveCompanyId });
    refetchRules();
  };

  // ── SYNC QUEUE ACTIONS ────────────────────────────────────────────────
  const handleJobRetry = async (id) => {
    await retryJob(id);
    refetchQueue();
    refetchQb();
  };

  const handleJobCancel = async (id) => {
    await cancelJob(id);
    refetchQueue();
  };

  const tabs = [
    { id: 'quickbooks', label: 'QuickBooks Integration' },
    { id: 'calendar', label: 'Google Calendar Sync' },
    { id: 'notifications', label: 'Notification Settings' },
    { id: 'queue', label: 'Operations Sync Queue' },
  ];

  const stats = qbOverview?.stats || {
    connectedCount: qbOverview?.credentials?.status === 'Connected' ? 1 : 0,
    disconnectedCount: qbOverview?.credentials?.status === 'Connected' ? 0 : 1,
    pendingSyncJobs: syncQueue.filter((j) => j.status === 'Queued' || j.status === 'Running').length,
    failedSyncJobs: syncQueue.filter((j) => j.status === 'Failed').length,
    successRate: 100,
  };

  const coa = qbOverview?.chartOfAccounts || [];
  const fileStatus = qbOverview?.fileStatus || [];

  return (
    <div className="flex flex-col gap-6 w-full pb-24">
      {/* KPI CARDS & STATUS */}
      <IntegrationKPICards stats={stats} />

      {/* FEEDBACK STATUS BANNER */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold bg-transparent border-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* TAB SYSTEM TRAY */}
      <div className="flex border-b border-slate-200/60 overflow-x-auto gap-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`py-3.5 px-5 text-xs font-bold border-b-2 whitespace-nowrap transition-all outline-none cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ────────────────── 1. QUICKBOOKS TAB ────────────────── */}
      {activeTab === 'quickbooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credentials & Mappings Setup */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">OAuth Credentials</h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Link QuickBooks Online Sandbox for {activeCompany?.name || 'Selected Company'}
                  </p>
                </div>
                {qbOverview?.credentials?.status === 'Connected' ? (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    <ShieldCheck size={12} /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                    Not Linked
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveCredentials} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Key size={11} /> Client ID / Key
                  </label>
                  <input
                    type="text"
                    value={qbCredentials.clientId}
                    onChange={(e) =>
                      setQbCredentials({ ...qbCredentials, clientId: e.target.value })
                    }
                    placeholder="Enter OAuth Client ID"
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none text-xs font-bold text-slate-700"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={qbCredentials.clientSecret}
                    onChange={(e) =>
                      setQbCredentials({ ...qbCredentials, clientSecret: e.target.value })
                    }
                    placeholder="••••••••••••••••"
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none text-xs font-bold text-slate-700"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingCreds}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl border-none shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingCreds ? 'Saving...' : 'Save & Connect to Backend'}
                </button>
              </form>
            </div>

            {/* Manual Operations Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Manual Operations</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Trigger live database reconciliation per company
                </p>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Building size={11} /> Company File
                  </label>
                  <select
                    value={activeCompany?.name || ''}
                    onChange={(e) => {
                      const matched = companies.find((c) => c.name === e.target.value);
                      if (matched) {
                        setSelectedCompanyId(matched.id);
                        localStorage.setItem('global_selected_company_id', matched.id);
                        window.dispatchEvent(new Event('companyChanged'));
                      }
                    }}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    {companies.map((comp) => (
                      <option key={comp.id} value={comp.name}>
                        {comp.name}
                      </option>
                    ))}
                    {companies.length === 0 && (
                      <option value="Apex Real Estate Partners">Apex Real Estate Partners</option>
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Data Entity Type
                  </label>
                  <select
                    value={qbSyncType}
                    onChange={(e) => setQbSyncType(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="Invoice">Invoices & Bills</option>
                    <option value="Payment">Payments & Deposits</option>
                    <option value="Customer">Customers (Tenants)</option>
                    <option value="Vendor">Vendors (Properties / Owners)</option>
                    <option value="COA">Chart of Accounts</option>
                  </select>
                </div>

                <button
                  onClick={handleTriggerManualSync}
                  disabled={isSyncing}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl border-none shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Reconciling...' : 'Trigger Manual Sync'}
                </button>
              </div>
            </div>
          </div>

          {/* Mapped Chart of Accounts Ledger & Statuses */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <QuickBooksStatusCard
              onFullSync={handleFullLedgerSync}
              fileStatus={fileStatus}
            />

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    QuickBooks Mapped Chart of Accounts
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Live balance sheet & general ledger mapping for {activeCompany?.name || 'Selected Company'}
                  </p>
                </div>
                <button
                  onClick={() => refetchQb()}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 border border-slate-100 bg-transparent cursor-pointer"
                  title="Refresh Balance Sheet"
                >
                  <RefreshCw size={14} className={qbLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">
                        Account Code
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">
                        Account Name
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">
                        Account Type
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                    {coa.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">
                          No bank accounts or Chart of Accounts records found for this company.
                        </td>
                      </tr>
                    ) : (
                      coa.map((account, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20">
                          <td className="px-4 py-3 font-mono font-bold text-slate-700">
                            {account.code}
                          </td>
                          <td className="px-4 py-3">{account.name}</td>
                          <td className="px-4 py-3">{account.type}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                            ${Number(account.balance || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── 2. GOOGLE CALENDAR TAB ────────────────── */}
      {activeTab === 'calendar' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex justify-between items-center text-xs">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Google Calendar Integration</h4>
              <p className="text-[10px] text-slate-400 font-medium">
                Live synchronization of rental renewals, lease periods, and legal tribunal hearings for{' '}
                <strong className="text-slate-600">{activeCompany?.name || 'Company'}</strong>
              </p>
            </div>
            <button
              onClick={handleCalendarSyncAll}
              disabled={isSyncingCal}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer border-none shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={13} className={isSyncingCal ? 'animate-spin' : ''} />
              {isSyncingCal ? 'Syncing...' : 'Full Sync Calendar'}
            </button>
          </div>

          <CalendarWidget
            events={calendarEvents}
            onCreateEvent={handleOpenCalendarCreate}
            onDeleteEvent={handleCalendarDelete}
          />

          {/* Event create modal */}
          {showCalendarModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form
                onSubmit={handleCalendarCreateSubmit}
                className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float animate-zoom-in"
              >
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm">Add Calendar Event</h3>
                  <button
                    type="button"
                    onClick={() => setShowCalendarModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold border-none bg-transparent cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-col gap-3.5 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={calendarForm.title}
                      onChange={(e) =>
                        setCalendarForm({ ...calendarForm, title: e.target.value })
                      }
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                      placeholder="e.g. Unit 301 Walkthrough"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Category
                      </label>
                      <select
                        value={calendarForm.category}
                        onChange={(e) =>
                          setCalendarForm({ ...calendarForm, category: e.target.value })
                        }
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                      >
                        <option value="Lease Expiry">Lease Expiry</option>
                        <option value="Rent Due">Rent Due</option>
                        <option value="Payroll Run">Payroll Run</option>
                        <option value="Hearing">Tribunal Hearing</option>
                        <option value="Meeting">Meeting</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={calendarForm.start}
                        onChange={(e) =>
                          setCalendarForm({ ...calendarForm, start: e.target.value })
                        }
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Description
                    </label>
                    <textarea
                      value={calendarForm.description}
                      onChange={(e) =>
                        setCalendarForm({ ...calendarForm, description: e.target.value })
                      }
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-600 outline-none h-16 resize-none"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowCalendarModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border-none shadow-md cursor-pointer"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── 3. NOTIFICATION SETTINGS TAB ────────────────── */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notification Rules Setup */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Trigger Notification Rules</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Backend warning limit rules for {activeCompany?.name || 'Company'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {notifRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs font-semibold"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800">{rule.event}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {rule.channel} · {rule.threshold}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRuleToggle(rule.id, rule.isActive)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black border cursor-pointer transition-all ${
                        rule.isActive
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Muted'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Inbox Filtering</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Configure filters to view targeted events
                </p>
              </div>

              <div className="flex flex-col gap-3.5 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Filter Priority
                  </label>
                  <select
                    value={notifPriority}
                    onChange={(e) => setNotifPriority(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="">All Priorities</option>
                    <option value="High">High Priority Only</option>
                    <option value="Medium">Medium Priority Only</option>
                    <option value="Low">Low Priority Only</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Filter Category
                  </label>
                  <select
                    value={notifCategory}
                    onChange={(e) => setNotifCategory(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="">All Categories</option>
                    <option value="Rent">Rent Collections</option>
                    <option value="Hearings">TAL Hearings</option>
                    <option value="Maintenance">Maintenance Alerts</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notification log list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center bg-white border border-slate-100 rounded-3xl p-4 shadow-sm text-xs">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">In-App Notification Feed</h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {notifications.filter((n) => !n.isRead).length} unread alerts
                </p>
              </div>

              <button
                onClick={handleNotifMarkAllRead}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border-none shadow-sm cursor-pointer"
              >
                Mark All as Read
              </button>
            </div>

            <NotificationList
              notifications={notifications}
              onRead={handleNotifRead}
              onDismiss={handleNotifDismiss}
              onArchive={handleNotifDismiss}
            />
          </div>
        </div>
      )}

      {/* ────────────────── 4. OPERATIONS SYNC QUEUE TAB ────────────────── */}
      {activeTab === 'queue' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SyncQueueTable
                queue={syncQueue}
                onRetry={handleJobRetry}
                onCancel={handleJobCancel}
              />
            </div>
            <div>
              <IntegrationHealthWidget />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SyncTimeline logs={auditLogs} />
            <IntegrationLogs logs={auditLogs} />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickBooksSettings;
