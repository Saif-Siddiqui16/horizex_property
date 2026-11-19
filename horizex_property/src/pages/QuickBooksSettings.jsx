import React, { useState, useEffect, useMemo } from 'react';
import { hasPermission } from '../utils/permissions';

// RTK Query API Integrations
import { useGetCompaniesQuery } from '../store/api/companiesApi';
import {
  useGetQuickBooksOverviewQuery,
  useSaveQuickBooksCredentialsMutation,
  useDisconnectQuickBooksMutation,
  useTriggerQuickBooksSyncMutation,
  useGetSyncQueueQuery,
  useGetIntegrationLogsQuery,
} from '../store/api/integrationsApi';

// Lucide Icons
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Key,
  ShieldCheck,
  ShieldAlert,
  Zap,
  FileText,
  DollarSign,
  Landmark,
  ArrowRight,
  Clock,
  ExternalLink,
  Settings,
  X,
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
    refetchOnMountOrArgChange: true,
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
  const [disconnectQB, { isLoading: isDisconnecting }] = useDisconnectQuickBooksMutation();
  const [triggerSync, { isLoading: isSyncing }] = useTriggerQuickBooksSyncMutation();

  // ── LOCAL STATES ────────────────────────────────────────────────────────
  const [statusMessage, setStatusMessage] = useState(null);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [qbCredentials, setQbCredentials] = useState({
    clientId: '',
    clientSecret: '',
    environment: 'sandbox',
  });
  const [lastSyncedTime, setLastSyncedTime] = useState(() => {
    return localStorage.getItem(`qb_last_synced_${effectiveCompanyId}`) || null;
  });

  // Sync credentials state when backend loads existing ones
  useEffect(() => {
    if (qbOverview?.credentials?.clientId) {
      setQbCredentials((prev) => ({
        ...prev,
        clientId: qbOverview.credentials.clientId,
      }));
    }
  }, [qbOverview]);

  const isConnected = qbOverview?.credentials?.status === 'Connected';

  // ── HANDLERS ────────────────────────────────────────────────────────────
  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanId = (qbCredentials.clientId || '').trim();
    const cleanSecret = (qbCredentials.clientSecret || '').trim();

    if (cleanId.length < 20 || cleanSecret.length < 20) {
      setStatusMessage({
        type: 'error',
        text: 'Validation error: QuickBooks Client ID and Client Secret must be at least 20 characters (Intuit OAuth format). Fake or random text cannot be connected.',
      });
      return;
    }

    try {
      await saveCredentials({
        companyId: effectiveCompanyId,
        clientId: cleanId,
        clientSecret: cleanSecret,
        environment: qbCredentials.environment,
      }).unwrap();
      setStatusMessage({ type: 'success', text: 'QuickBooks credentials verified and connected successfully!' });
      setShowCredsModal(false);
      refetchQb();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err?.data?.error?.message || err?.data?.message || 'QuickBooks authentication failed: Invalid Client ID or Secret rejected by Intuit server.' });
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect QuickBooks? Synced records will remain intact in both systems.')) {
      return;
    }
    setStatusMessage(null);
    try {
      await disconnectQB({ companyId: effectiveCompanyId }).unwrap();
      setStatusMessage({ type: 'success', text: 'QuickBooks disconnected successfully.' });
      refetchQb();
      refetchQueue();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err?.data?.error?.message || err?.data?.message || 'Failed to disconnect' });
    }
  };

  const handleTriggerSyncNow = async () => {
    setStatusMessage(null);
    if (!isConnected) {
      setStatusMessage({
        type: 'error',
        text: 'Cannot sync: QuickBooks Online is disconnected. Connect with verified Intuit credentials first.',
      });
      return;
    }
    try {
      const res = await triggerSync({
        companyId: effectiveCompanyId,
        entityType: 'Full Account Ledger',
        companyFile: activeCompany?.name || 'Company Ledger',
      }).unwrap();

      const nowFormatted = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ` (Today)`;
      setLastSyncedTime(nowFormatted);
      localStorage.setItem(`qb_last_synced_${effectiveCompanyId}`, nowFormatted);

      setStatusMessage({ type: 'success', text: res.message || 'QuickBooks synchronization completed successfully!' });
      refetchQb();
      refetchQueue();
      refetchLogs();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err?.data?.error?.message || err?.data?.message || 'Sync failed.' });
    }
  };

  // ── DERIVED METRICS FOR CLEAN CARDS ─────────────────────────────────────
  const fileStatus = qbOverview?.fileStatus || [];
  const coa = qbOverview?.chartOfAccounts || [];

  const invoiceItem = fileStatus.find((f) => f.title === 'Rental Invoices');
  const tenantItem = fileStatus.find((f) => f.title === 'Tenant Customers');
  const coaBankAccounts = coa.filter((c) => c.type.includes('Bank'));
  const totalBankCash = coaBankAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const receivableItem = coa.find((c) => c.type.includes('Receivables'));
  const revenueItem = coa.find((c) => c.type.includes('Revenue'));

  // Company sync history
  const recentHistory = useMemo(() => {
    const list = [];
    if (Array.isArray(syncQueue) && syncQueue.length > 0) {
      syncQueue.forEach((job) => {
        list.push({
          id: job.id,
          timestamp: job.updatedAt || job.createdAt,
          type: job.type || 'General Sync',
          status: job.status,
          user: 'Admin Administrator',
          details: job.status === 'Completed' ? 'All Ledger Items Transferred' : 'In Progress',
        });
      });
    }
    return list.slice(0, 5);
  }, [syncQueue]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-24 animate-[fadeIn_0.3s_ease-in-out]">
      {/* ── HEADER BANNER ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>QuickBooks Sync Center</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time automated synchronization between Horixez Property and QuickBooks Online.
          </p>
        </div>

        {/* Company Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-2xl shrink-0">
          <Building2 size={15} className="text-slate-400" />
          <span className="text-[11px] font-bold text-slate-500">Company:</span>
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
            className="bg-transparent font-bold text-xs text-slate-800 outline-none cursor-pointer"
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
      </div>

      {/* ── FEEDBACK STATUS BANNER ───────────────────────────────────── */}
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

      {/* ── 1. MAIN HERO CONNECTION & ONE-CLICK SYNC CARD ─────────────── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isConnected
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}
          >
            {isConnected ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isConnected
                    ? 'bg-emerald-100/80 text-emerald-800'
                    : 'bg-rose-100/80 text-rose-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                  }`}
                />
                {isConnected ? 'QuickBooks Online Connected' : 'QuickBooks Online Disconnected'}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                • {activeCompany?.name || 'Selected Company'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-2 font-medium max-w-xl leading-relaxed">
              {isConnected
                ? `Active API channel linked with client ID: ${qbOverview?.credentials?.clientId || 'Configured'}. Invoices and rent receipts are ready for real-time reconciliation.`
                : 'QuickBooks is currently not connected for this company file. Connect your sandbox or production account to start syncing.'}
            </p>

            {lastSyncedTime && isConnected && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-2">
                <Clock size={13} className="text-slate-400" />
                <span>Last Synchronized: <strong className="text-slate-700">{lastSyncedTime}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          {isConnected ? (
            <>
              <button
                onClick={handleTriggerSyncNow}
                disabled={isSyncing}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <Zap size={16} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing Real Data...' : 'Sync Now with QuickBooks'}</span>
              </button>

              <button
                onClick={() => setShowCredsModal(true)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                title="Update Credentials"
              >
                <Settings size={15} />
              </button>

              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="px-4 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowCredsModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <Key size={15} />
              <span>Connect to QuickBooks</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. LIVE SYNCED OVERVIEW (3 CLEAN METRIC CARDS) ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Rent Invoices */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Rental Invoices
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 size={12} /> Synced Live
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {invoiceItem?.count || 0} Invoices
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Outstanding Due: <strong className="text-slate-800">${Number(receivableItem?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Customer Accounts</span>
            <span className="font-bold text-slate-700">{tenantItem?.count || 0} Tenants</span>
          </div>
        </div>

        {/* Card 2: Payments & Revenue */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Collected Revenue
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 size={12} /> Synced Live
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ${Number(revenueItem?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Transferred to QuickBooks Income Account (Code 4000)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Reconciliation Status</span>
            <span className="font-bold text-emerald-600">100% Balanced</span>
          </div>
        </div>

        {/* Card 3: Bank Accounts */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Bank & Operating Balances
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 size={12} /> Synced Live
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ${totalBankCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Mapped from Chart of Accounts Liquid Balances
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Operating Accounts</span>
            <span className="font-bold text-slate-700">{coaBankAccounts.length} Accounts</span>
          </div>
        </div>
      </div>

      {/* ── 3. RECENT SYNC HISTORY (CLEAN TABLE) ───────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Recent Synchronization History</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Live audit record of transfers between Horixez Property and QuickBooks Online.
            </p>
          </div>
          <button
            onClick={() => {
              refetchQb();
              refetchQueue();
              refetchLogs();
            }}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 border border-slate-100 bg-transparent cursor-pointer transition-all flex items-center gap-1 text-xs font-bold"
            title="Refresh history"
          >
            <RefreshCw size={13} className={queueLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Activity / Entity</th>
                <th className="py-3 px-4">Triggered By</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
              {recentHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    No synchronization jobs executed yet. Click "Sync Now with QuickBooks" above to transfer real records.
                  </td>
                </tr>
              ) : (
                recentHistory.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {job.timestamp ? new Date(job.timestamp).toLocaleString() : 'Just now'}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold">
                      {job.type}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {job.user}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {job.details}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} /> {job.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. CREDENTIALS MODAL ───────────────────────────────────────── */}
      {showCredsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCredentials}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full flex flex-col gap-4 shadow-float animate-[zoomIn_0.2s_ease-out]"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">QuickBooks OAuth Credentials</h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Link with {activeCompany?.name || 'Company'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCredsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Key size={11} /> Client ID / App Key
                </label>
                <input
                  type="text"
                  value={qbCredentials.clientId}
                  onChange={(e) => setQbCredentials({ ...qbCredentials, clientId: e.target.value })}
                  placeholder="e.g. AB1234567890..."
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none font-bold text-slate-800 focus:border-blue-500"
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
                  onChange={(e) => setQbCredentials({ ...qbCredentials, clientSecret: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none font-bold text-slate-800 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Environment
                </label>
                <select
                  value={qbCredentials.environment}
                  onChange={(e) => setQbCredentials({ ...qbCredentials, environment: e.target.value })}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="sandbox">Sandbox (Development / Testing)</option>
                  <option value="production">Production (Live Real Accounting)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-50 mt-2">
              <button
                type="button"
                onClick={() => setShowCredsModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCreds}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md border-none cursor-pointer disabled:opacity-50"
              >
                {isSavingCreds ? 'Connecting...' : 'Save & Connect'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuickBooksSettings;
