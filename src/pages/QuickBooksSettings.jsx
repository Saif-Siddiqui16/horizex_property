import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { hasPermission } from '../utils/permissions';

// Services
import integrationService from '../services/integrationService';
import syncEngineService from '../services/syncEngineService';
import quickBooksService from '../services/quickBooksService';
import calendarService from '../services/calendarService';
import notificationService from '../services/notificationService';
import integrationAnalyticsService from '../services/integrationAnalyticsService';
import integrationAuditService from '../services/integrationAuditService';
import credentialService from '../services/credentialService';
import webhookService from '../services/webhookService';
import notificationRuleService from '../services/notificationRuleService';

// Reusable Components
import {
  IntegrationKPICards,
  IntegrationTable,
  SyncQueueTable,
  QuickBooksStatusCard,
  CalendarWidget,
  NotificationList,
  SyncTimeline,
  IntegrationLogs,
  IntegrationHealthWidget
} from '../components/integrations/IntegrationWidgets';

// Lucide Icons
import {
  RefreshCw, Gavel, Calendar as CalendarIcon, Landmark, HelpCircle, 
  Trash2, Mail, Play, AlertCircle, Plus, Edit2, FileText, Check, ShieldAlert
} from 'lucide-react';

export const QuickBooksSettings = () => {
  const [__forceUpdate, __setForceUpdate] = useState(0);
  useEffect(() => {
    const handleUpdate = () => __setForceUpdate(p => p + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  // RBAC check
  if (!hasPermission('QuickBooks Sync', 'view')) {
    return (
      <MainLayout title="Permission Denied">
        <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-8">
          <h3 className="text-xl font-black text-slate-800">Access Restricted</h3>
          <p className="max-w-md mx-auto mt-2 text-slate-500 font-medium italic">
            You do not have permission to view this section. Please contact your administrator.
          </p>
        </div>
      </MainLayout>
    );
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'quickbooks');

  // States
  const [integrations, setIntegrations] = useState([]);
  const [syncQueue, setSyncQueue] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedCompanyId, setSelectedCompanyId] = useState(localStorage.getItem('global_selected_company_id') || '');

  // Sub-tab states
  const [qbCompany, setQbCompany] = useState('Apex Real Estate Partners');
  const [qbSyncType, setQbSyncType] = useState('Invoice');
  const [coa, setCoa] = useState([]);
  const [qbCredentials, setQbCredentials] = useState({ clientId: '', clientSecret: '' });

  // Notification Filter States
  const [notifPriority, setNotifPriority] = useState('');
  const [notifCategory, setNotifCategory] = useState('');

  // Webhook and Rules
  const [webhooks, setWebhooks] = useState([]);
  const [notifRules, setNotifRules] = useState([]);
  
  // Modals
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarForm, setCalendarForm] = useState({ title: '', start: '', category: 'Meeting', description: '' });

  // Sync state triggers
  const refreshAllData = () => {
    setIntegrations(integrationService.getAll());
    setSyncQueue(syncEngineService.getAll());
    setEvents(calendarService.getAll());
    setNotifications(notificationService.getAll({ priority: notifPriority, category: notifCategory }));
    setAuditLogs(integrationAuditService.getAll());
    setStats(integrationAnalyticsService.getStats());
    setCoa(quickBooksService.getCOA());
    setWebhooks(webhookService.getAll());
    setNotifRules(notificationRuleService.getAll());

    const creds = credentialService.get('quickbooks');
    if (creds) setQbCredentials(creds);
  };

  // Sync with global company selection
  useEffect(() => {
    const handleCompanyChange = () => {
      setSelectedCompanyId(localStorage.getItem('global_selected_company_id') || '');
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  // Listen for sync simulation notifications
  useEffect(() => {
    window.addEventListener('sync_queue_updated', refreshAllData);
    window.addEventListener('notifications_updated', refreshAllData);
    return () => {
      window.removeEventListener('sync_queue_updated', refreshAllData);
      window.removeEventListener('notifications_updated', refreshAllData);
    };
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [notifPriority, notifCategory, selectedCompanyId]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // ── INTEGRATIONS INTERACTIONS ──────────────────────────────────────────
  const handleConnectIntegration = (id) => {
    integrationService.updateStatus(id, 'Connected');
    refreshAllData();
  };

  const handleDisconnectIntegration = (id) => {
    integrationService.disconnect(id);
    refreshAllData();
  };

  const handleSyncIntegration = (id) => {
    if (id === 'quickbooks') {
      quickBooksService.triggerSync(qbCompany, qbSyncType);
    } else if (id === 'google_calendar') {
      calendarService.triggerCalendarSync();
    } else {
      syncEngineService.addJob(id, 'Full Database Sync');
    }
    refreshAllData();
  };

  // ── QUICKBOOKS ACTIONS ────────────────────────────────────────────────
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    credentialService.save('quickbooks', qbCredentials);
    integrationService.updateStatus('quickbooks', 'Connected');
    refreshAllData();
  };

  const handleQbTriggerFullSync = () => {
    quickBooksService.triggerSync(qbCompany, 'Full Account Ledger');
    refreshAllData();
  };

  // ── GOOGLE CALENDAR EVENTS ────────────────────────────────────────────
  const handleOpenCalendarCreate = (day) => {
    const formattedDay = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setCalendarForm({ title: '', start: formattedDay, category: 'Meeting', description: '' });
    setShowCalendarModal(true);
  };

  const handleCalendarCreateSubmit = (e) => {
    e.preventDefault();
    calendarService.create(calendarForm);
    setShowCalendarModal(false);
    refreshAllData();
  };

  const handleCalendarDelete = (id) => {
    calendarService.delete(id);
    refreshAllData();
  };

  // ── NOTIFICATION CONTROLS ─────────────────────────────────────────────
  const handleNotifRead = (id) => {
    notificationService.markRead(id);
    refreshAllData();
  };

  const handleNotifDismiss = (id) => {
    notificationService.dismiss(id);
    refreshAllData();
  };

  const handleNotifArchive = (id) => {
    notificationService.archive(id);
    refreshAllData();
  };

  const handleNotifMarkAllRead = () => {
    notificationService.markAllRead();
    refreshAllData();
  };

  const handleRuleToggle = (id, active) => {
    notificationRuleService.updateRule(id, !active);
    refreshAllData();
  };

  // ── SYNC QUEUE RETRY/CANCEL ──────────────────────────────────────────
  const handleJobRetry = (id) => {
    syncEngineService.retryJob(id);
    refreshAllData();
  };

  const handleJobCancel = (id) => {
    syncEngineService.cancelJob(id);
    refreshAllData();
  };

  const tabs = [
    { id: 'quickbooks', label: 'QuickBooks Integration' },
    { id: 'calendar', label: 'Google Calendar Sync' },
    { id: 'notifications', label: 'Notification Settings' },
    { id: 'queue', label: 'Operations Sync Queue' }
  ];

  return (
    <MainLayout title="QuickBooks Sync & Integrations">
      <div className="flex flex-col gap-6 w-full pb-24">
        
        {/* KPI CARDS & STATUS */}
        <IntegrationKPICards stats={stats} />

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
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">OAuth Credentials</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Verify credentials mapped to QuickBooks Online Sandbox</p>
                </div>

                <form onSubmit={handleSaveCredentials} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client ID / Key</label>
                    <input 
                      type="text" 
                      value={qbCredentials.clientId}
                      onChange={(e) => setQbCredentials({ ...qbCredentials, clientId: e.target.value })}
                      placeholder="Enter OAuth Client ID"
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none text-xs font-bold text-slate-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Secret</label>
                    <input 
                      type="password" 
                      value={qbCredentials.clientSecret}
                      onChange={(e) => setQbCredentials({ ...qbCredentials, clientSecret: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none text-xs font-bold text-slate-700"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl border-none shadow-md transition-all cursor-pointer"
                  >
                    Save & Connect
                  </button>
                </form>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Manual Operations</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Trigger manual synchronizations per segment</p>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company File</label>
                    <select 
                      value={qbCompany} 
                      onChange={(e) => setQbCompany(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                    >
                      <option value="Apex Real Estate Partners">Apex Real Estate Partners</option>
                      <option value="Soros Property Management">Soros Property Management</option>
                      <option value="Masteko Properties Ltd.">Masteko Properties Ltd.</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Entity Type</label>
                    <select 
                      value={qbSyncType} 
                      onChange={(e) => setQbSyncType(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                    >
                      <option value="Invoice">Invoices & Bills</option>
                      <option value="Payment">Payments & Deposits</option>
                      <option value="Customer">Customers (Tenants)</option>
                      <option value="Vendor">Vendors (Owners)</option>
                      <option value="COA">Chart of Accounts</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => handleSyncIntegration('quickbooks')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl border-none shadow-sm cursor-pointer"
                  >
                    Trigger Manual Sync
                  </button>
                </div>
              </div>
            </div>

            {/* Mapped Chart of Accounts Ledger & Statuses */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <QuickBooksStatusCard onFullSync={handleQbTriggerFullSync} />

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">QuickBooks Mapped Chart of Accounts</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Mapped balance sheets items</p>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Account Code</th>
                        <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Account Name</th>
                        <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Account Type</th>
                        <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                      {coa.map((account, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20">
                          <td className="px-4 py-3 font-mono font-bold text-slate-700">{account.code}</td>
                          <td className="px-4 py-3">{account.name}</td>
                          <td className="px-4 py-3">{account.type}</td>
                          <td className="px-4 py-3 text-right font-mono">${account.balance.toLocaleString()}</td>
                        </tr>
                      ))}
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
                <p className="text-[10px] text-slate-400 font-medium">Synchronize rental renewals, lease periods, and legal tribunal hearings to your calendar</p>
              </div>
              <button 
                onClick={() => handleSyncIntegration('google_calendar')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer border-none"
              >
                <RefreshCw size={13} /> Full Sync Calendar
              </button>
            </div>

            <CalendarWidget 
              events={events}
              onCreateEvent={handleOpenCalendarCreate}
              onDeleteEvent={handleCalendarDelete}
            />

            {/* Event create modal */}
            {showCalendarModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <form onSubmit={handleCalendarCreateSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float animate-zoom-in">
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Title</label>
                      <input 
                        type="text" 
                        value={calendarForm.title}
                        onChange={(e) => setCalendarForm({ ...calendarForm, title: e.target.value })}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                        placeholder="e.g. Unit 301 Walkthrough"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                        <select 
                          value={calendarForm.category}
                          onChange={(e) => setCalendarForm({ ...calendarForm, category: e.target.value })}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                        >
                          <option value="Lease Expiry">Lease Expiry</option>
                          <option value="Rent Due">Rent Due</option>
                          <option value="Payroll Run">Payroll Run</option>
                          <option value="Employee Leave">Employee Leave</option>
                          <option value="Hearing">Tribunal Hearing</option>
                          <option value="Meeting">Meeting</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Date</label>
                        <input 
                          type="date" 
                          value={calendarForm.start}
                          onChange={(e) => setCalendarForm({ ...calendarForm, start: e.target.value })}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                      <textarea 
                        value={calendarForm.description}
                        onChange={(e) => setCalendarForm({ ...calendarForm, description: e.target.value })}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-600 outline-none h-16 resize-none"
                        placeholder="Additional sync notes..."
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
                  <p className="text-[10px] text-slate-400 font-medium">Automatic system warning limits</p>
                </div>

                <div className="flex flex-col gap-3">
                  {notifRules.map((rule) => (
                    <div key={rule.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs font-semibold">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">{rule.event} Rule</span>
                        <span className="text-[10px] text-slate-400 font-medium">{rule.channel} channel</span>
                      </div>

                      <button 
                        onClick={() => handleRuleToggle(rule.id, rule.isActive)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black border cursor-pointer ${
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
                  <p className="text-[10px] text-slate-400 font-medium">Configure filters to view targeted events</p>
                </div>

                <div className="flex flex-col gap-3.5 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Priority</label>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Category</label>
                    <select 
                      value={notifCategory} 
                      onChange={(e) => setNotifCategory(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                    >
                      <option value="">All Categories</option>
                      <option value="Rent">Rent Collections</option>
                      <option value="Hearings">TAL Hearings</option>
                      <option value="Payroll">Payroll runs</option>
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
                  <p className="text-[10px] text-slate-400 font-medium">{notificationService.getUnreadCount()} unread alerts</p>
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
                onArchive={handleNotifArchive}
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
    </MainLayout>
  );
};
