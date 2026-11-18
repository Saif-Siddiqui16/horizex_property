import { useState, useEffect, useMemo } from 'react';
import {
  FiPlus,
  FiEdit,
  FiX,
  FiTrash2,
  FiDownload,
  FiPrinter,
  FiSearch,
  FiCalendar,
  FiFilter,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiRefreshCw
} from 'react-icons/fi';
import {
  useGetBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useGetAccountTransactionsQuery,
} from '../store/api/accountingApi';
import { useGetCompaniesQuery } from '../store/api/companiesApi';
import { useGetPropertiesQuery } from '../store/api/propertiesApi';
import { hasPermission } from '../utils/permissions';
import { AccessControl } from '../components/AccessControl';

export const ChartOfAccounts = () => {
  const [__forceUpdate, __setForceUpdate] = useState(0);
  useEffect(() => {
    const handleUpdate = () => __setForceUpdate(p => p + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  if (!hasPermission('Chart of Accounts', 'view')) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-8">
        <h3 className="text-xl font-black text-slate-800">Access Restricted</h3>
        <p className="max-w-md mx-auto mt-2 text-slate-500 font-medium italic">
          You do not have permission to view this section. Please contact your administrator.
        </p>
      </div>
    );
  }

  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    name: '',
    bankName: 'RBC Royal Bank',
    accountNumber: '',
    balance: '',
    companyId: '',
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState(
    () => localStorage.getItem('global_selected_company_id') || ''
  );
  const [selectedBuildingId, setSelectedBuildingId] = useState(
    () => localStorage.getItem('global_selected_building_id') || ''
  );

  useEffect(() => {
    const handleSync = () => {
      setSelectedCompanyId(localStorage.getItem('global_selected_company_id') || '');
      setSelectedBuildingId(localStorage.getItem('global_selected_building_id') || '');
    };
    window.addEventListener('companyChanged', handleSync);
    window.addEventListener('buildingChanged', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('companyChanged', handleSync);
      window.removeEventListener('buildingChanged', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const { data: realCompanies = [] } = useGetCompaniesQuery();
  const { data: realProperties = [] } = useGetPropertiesQuery(
    selectedCompanyId ? { companyId: selectedCompanyId } : {},
    { skip: !selectedCompanyId }
  );

  const selectedBuildingObj = useMemo(() => {
    if (!selectedBuildingId || selectedBuildingId === 'all') return null;
    return realProperties.find(p => String(p.id) === String(selectedBuildingId)) || null;
  }, [realProperties, selectedBuildingId]);

  const { data: accounts = [], isLoading: isLoadingAccounts, refetch: fetchAccounts } = useGetBankAccountsQuery(
    {
      ...(selectedCompanyId ? { companyId: selectedCompanyId } : {}),
      ...(selectedBuildingId && selectedBuildingId !== 'all' ? { buildingId: selectedBuildingId } : {}),
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createAccountApi] = useCreateBankAccountMutation();
  const [updateAccountApi] = useUpdateBankAccountMutation();
  const [deleteAccountApi] = useDeleteBankAccountMutation();

  // Report Modal & Customization States
  const [reportAccount, setReportAccount] = useState(null);
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, THIS_MONTH, LAST_30_DAYS, THIS_QUARTER, CUSTOM
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, CREDIT, DEBIT
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('NEWEST'); // NEWEST, OLDEST

  // Live Backend Account Transactions Query
  const {
    data: txApiResponse,
    isLoading: isLoadingTxs,
    refetch: refetchTxs,
  } = useGetAccountTransactionsQuery(
    {
      accountId: reportAccount?.id,
      companyId: selectedCompanyId || undefined,
      buildingId: selectedBuildingId && selectedBuildingId !== 'all' ? selectedBuildingId : undefined,
    },
    { skip: !reportAccount?.id, refetchOnMountOrArgChange: true }
  );

  const liveTransactions = useMemo(() => {
    if (txApiResponse?.transactions && Array.isArray(txApiResponse.transactions)) {
      return txApiResponse.transactions;
    }
    if (Array.isArray(txApiResponse)) {
      return txApiResponse;
    }
    return [];
  }, [txApiResponse]);

  const openAddModal = () => {
    setEditIndex(null);
    setForm({
      name: '',
      bankName: 'RBC Royal Bank',
      balance: '',
      accountNumber: '',
      companyId: selectedCompanyId || (realCompanies[0]?.id ? String(realCompanies[0].id) : ''),
    });
    setShowModal(true);
  };

  const openEditModal = (acc, index) => {
    setEditIndex(index);
    setForm({
      id: acc.id,
      name: acc.accountName || acc.name || '',
      bankName: acc.bankName || 'RBC Royal Bank',
      balance: acc.openingBalance ?? acc.balance ?? '',
      accountNumber: acc.accountNumber || '',
      companyId: acc.companyId || selectedCompanyId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || form.balance === undefined || form.balance === '') {
      alert('Please fill Account Name and Balance');
      return;
    }

    try {
      const targetCompanyId = form.companyId || selectedCompanyId || (realCompanies[0]?.id ? String(realCompanies[0].id) : undefined);
      const bankTitle = form.bankName || 'RBC Royal Bank';
      const balNum = parseFloat(form.balance) || 0;

      if (editIndex !== null) {
        const targetAcc = filteredAccounts[editIndex] || accounts[editIndex];
        const accountId = targetAcc?.id || form.id;
        await updateAccountApi({
          id: String(accountId),
          accountName: form.name.trim(),
          bankName: bankTitle,
          routingNumber: bankTitle,
          balance: balNum,
          accountNumber: form.accountNumber || targetAcc?.accountNumber || '0001',
          companyId: targetCompanyId ? String(targetCompanyId) : undefined,
        }).unwrap();
      } else {
        await createAccountApi({
          accountName: form.name.trim(),
          bankName: bankTitle,
          routingNumber: bankTitle,
          accountNumber: form.accountNumber || `****-${Date.now().toString().slice(-4)}`,
          initialBalance: balNum,
          companyId: targetCompanyId ? String(targetCompanyId) : undefined,
        }).unwrap();
      }

      setShowModal(false);
    } catch (e) {
      console.error('Error saving account:', e);
      const errMsg = e?.data?.message || e?.message || 'Error saving account';
      alert(`Error saving account: ${errMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await deleteAccountApi(String(id)).unwrap();
    } catch (e) {
      console.error('Error deleting account:', e);
      alert('Error deleting account');
    }
  };

  // ==========================================
  // TRANSACTION REPORT GENERATOR & STORAGE
  // ==========================================
  const openAccountReport = (acc) => {
    setReportAccount(acc);
    setDateFilter('ALL');
    setTypeFilter('ALL');
    setSearchQuery('');
    setSortOrder('NEWEST');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // ==========================================
  // FILTER & CUSTOMIZATION LOGIC
  // ==========================================
  const filteredTransactions = useMemo(() => {
    if (!liveTransactions.length) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentYyyyMm = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const todayStr = now.toISOString().split('T')[0];
    const d30Str = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return liveTransactions
      .filter((tx) => {
        const txDateStr = String(tx.date || '').slice(0, 10);

        // Date Filtering
        if (dateFilter === 'THIS_MONTH') {
          if (!txDateStr.startsWith(currentYyyyMm)) {
            const parts = txDateStr.split('-');
            if (parts.length >= 2) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10);
              if (y !== currentYear || m !== currentMonth + 1) return false;
            } else {
              return false;
            }
          }
        } else if (dateFilter === 'LAST_30_DAYS') {
          if (txDateStr < d30Str || txDateStr > todayStr) {
            const txTime = new Date(txDateStr + 'T12:00:00').getTime();
            const diffDays = Math.abs((now.getTime() - txTime) / (1000 * 60 * 60 * 24));
            if (diffDays > 30) return false;
          }
        } else if (dateFilter === 'THIS_QUARTER') {
          const currentQuarter = Math.floor(currentMonth / 3);
          const parts = txDateStr.split('-');
          if (parts.length >= 2) {
            const txQ = Math.floor((parseInt(parts[1], 10) - 1) / 3);
            const txY = parseInt(parts[0], 10);
            if (txY !== currentYear || txQ !== currentQuarter) return false;
          }
        } else if (dateFilter === 'CUSTOM') {
          if (customStartDate && txDateStr < customStartDate) return false;
          if (customEndDate && txDateStr > customEndDate) return false;
        }

        // Type Filtering
        if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = (tx.description || '').toLowerCase().includes(q);
          const matchRef = (tx.reference || '').toLowerCase().includes(q);
          const matchCat = (tx.category || '').toLowerCase().includes(q);
          const matchAmt = String(tx.amount || '').includes(q);
          if (!matchDesc && !matchRef && !matchCat && !matchAmt) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
      });
  }, [liveTransactions, dateFilter, customStartDate, customEndDate, typeFilter, searchQuery, sortOrder]);

  // Summary Metrics
  const { totalCredits, totalDebits, netFlow } = useMemo(() => {
    let cr = 0;
    let dr = 0;
    filteredTransactions.forEach((tx) => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'CREDIT') cr += amt;
      else if (tx.type === 'DEBIT') dr += amt;
    });
    return { totalCredits: cr, totalDebits: dr, netFlow: cr - dr };
  }, [filteredTransactions]);

  // ==========================================
  // EXPORT & DOWNLOAD HANDLERS
  // ==========================================
  const handleDownloadCSV = () => {
    if (!reportAccount || filteredTransactions.length === 0) {
      alert('No transactions available to download.');
      return;
    }

    const accName = reportAccount.accountName || reportAccount.name || 'Account';
    const accNum = reportAccount.accountNumber ? `(${reportAccount.accountNumber})` : '';
    const compName = realCompanies.find(c => String(c.id) === String(selectedCompanyId))?.name || 'All Companies';
    const bldName = selectedBuildingObj ? selectedBuildingObj.name : 'All Buildings';
    const now = new Date().toISOString().split('T')[0];

    const headers = ['Date', 'Description', 'Reference #', 'Category', 'Type', 'Debit ($)', 'Credit ($)', 'Balance ($)'];
    const rows = filteredTransactions.map(t => [
      `"${t.date}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.reference || ''}"`,
      `"${t.category || ''}"`,
      `"${t.type}"`,
      `"${t.type === 'DEBIT' ? (t.amount || 0).toFixed(2) : ''}"`,
      `"${t.type === 'CREDIT' ? (t.amount || 0).toFixed(2) : ''}"`,
      `"${(t.balance || 0).toFixed(2)}"`
    ]);

    const csvContent = [
      `"ACCOUNT STATEMENT & TRANSACTION REPORT"`,
      `"Account Name: ${accName} ${accNum}"`,
      `"Company Context: ${compName}"`,
      `"Building Filter: ${bldName}"`,
      `"Generated On: ${now}"`,
      `"Date Filter: ${dateFilter}"`,
      `"Total Credits: $${totalCredits.toFixed(2)}"`,
      `"Total Debits: $${totalDebits.toFixed(2)}"`,
      `"Net Flow: $${netFlow.toFixed(2)}"`,
      `""`,
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Statement_${accName.replace(/[^a-zA-Z0-9]/g, '_')}_${now}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    if (!reportAccount) return;
    const accName = reportAccount.accountName || reportAccount.name || 'Account';
    const accNum = reportAccount.accountNumber ? `(${reportAccount.accountNumber})` : '';
    const accType = reportAccount.assetType || reportAccount.type || 'Asset';
    const compName = realCompanies.find(c => String(c.id) === String(selectedCompanyId))?.name || 'All Companies';
    const bldName = selectedBuildingObj ? selectedBuildingObj.name : 'All Buildings';
    const now = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

    const printWindow = window.open('', '_blank', 'width=950,height=750');
    if (!printWindow) {
      alert('Please allow pop-ups to print the statement.');
      return;
    }

    const tableRows = filteredTransactions.map(t => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155;">${t.date}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #0f172a;">
          ${t.description}
          <div style="font-size: 10px; color: #64748b; font-weight: normal;">${t.category || ''}</div>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-family: monospace; color: #64748b;">${t.reference || '-'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold; color: ${t.type === 'CREDIT' ? '#059669' : '#dc2626'}; text-align: center;">${t.type}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #dc2626; text-align: right;">${t.type === 'DEBIT' ? '$' + t.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 }) : '-'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #059669; text-align: right;">${t.type === 'CREDIT' ? '$' + t.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 }) : '-'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: bold; color: #0f172a; text-align: right;">$${(t.balance || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Account Statement - ${accName}</title>
          <style>
            @page { margin: 12mm; size: auto; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
            .brand { font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
            .brand-sub { font-size: 10px; color: #64748b; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
            .title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
            .meta { font-size: 11px; color: #64748b; margin-top: 4px; }
            .kpi-row { display: flex; gap: 12px; margin-bottom: 20px; }
            .kpi { flex: 1; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
            .kpi-label { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
            .kpi-value { font-size: 16px; font-weight: 800; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">HORIZEX</div>
              <div class="brand-sub">Real Estate Management</div>
            </div>
            <div style="text-align: right;">
              <h2 class="title">ACCOUNT STATEMENT</h2>
              <div class="meta">Account: <strong>${accName} ${accNum}</strong></div>
              <div class="meta">Company: <strong>${compName}</strong> | Building: <strong>${bldName}</strong></div>
              <div class="meta">Category: ${accType} | Generated: ${now}</div>
            </div>
          </div>

          <div class="kpi-row">
            <div class="kpi">
              <div class="kpi-label">Current Balance</div>
              <div class="kpi-value">$${parseFloat(reportAccount.openingBalance ?? reportAccount.balance ?? 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Total Credits (Inflow)</div>
              <div class="kpi-value" style="color: #059669;">+$${totalCredits.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Total Debits (Outflow)</div>
              <div class="kpi-value" style="color: #dc2626;">-$${totalDebits.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Net Activity</div>
              <div class="kpi-value" style="color: ${netFlow >= 0 ? '#059669' : '#dc2626'};">${netFlow >= 0 ? '+' : ''}$${netFlow.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Reference #</th>
                <th style="text-align: center;">Type</th>
                <th style="text-align: right;">Debit ($)</th>
                <th style="text-align: right;">Credit ($)</th>
                <th style="text-align: right;">Balance ($)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="7" style="text-align: center; padding: 20px;">No transactions recorded.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Generated via Horizex Property Pro · Official Bank Ledger Audit Statement
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getAccountType = (acc) => {
    let t = acc.assetType || acc.bankName || acc.routingNumber || acc.type || 'Bank';
    const lower = String(t).toLowerCase();
    if (lower === 'bank' || lower.includes('bank') || lower.includes('checking') || lower.includes('saving') || lower.includes('rbc') || lower.includes('td') || lower.includes('bmo') || lower.includes('cibc') || lower.includes('cash') || lower.includes('trust')) return 'Bank';
    if (lower === 'income' || lower === 'revenue') return 'Bank';
    if (lower === 'expense') return 'Expense';
    if (lower === 'asset') return 'Asset';
    return 'Bank';
  };

  const { totalBankCash, accountCounts } = useMemo(() => {
    let bankCash = 0;
    const counts = { All: 0 };
    (accounts || []).forEach((a) => {
      if (selectedCompanyId && a.companyId && String(a.companyId) !== String(selectedCompanyId)) {
        return;
      }
      counts.All += 1;
      const bank = a.bankName || 'Bank Account';
      counts[bank] = (counts[bank] || 0) + 1;
      const bal = parseFloat(a.openingBalance ?? a.balance ?? a.currentBalance ?? 0) || 0;
      bankCash += bal;
    });
    return { totalBankCash: bankCash, accountCounts: counts };
  }, [accounts, selectedCompanyId]);

  const filteredAccounts = useMemo(() => {
    return (accounts || []).filter((a) => {
      if (selectedCompanyId && a.companyId && String(a.companyId) !== String(selectedCompanyId)) {
        return false;
      }
      if (filter === 'All') return true;
      const bank = a.bankName || 'Bank Account';
      return bank.toLowerCase() === filter.toLowerCase();
    });
  }, [accounts, filter, selectedCompanyId]);

  return (
    <>
      <div className="p-4 sm:p-6 animate-[fadeIn_0.4s_ease-in-out]">

        {/* TOP OVERVIEW SUMMARY BANNER */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Liquid Bank Balance</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              ${totalBankCash.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Showing <strong className="text-slate-800">{accountCounts.All || 0} Bank Accounts</strong> • Click any card to inspect recent transactions, customize dates, or export statements.
            </p>
          </div>

          {hasPermission('Chart of Accounts', 'add') && (
            <button
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm shrink-0"
              onClick={openAddModal}
            >
              <FiPlus size={16} />
              Add New Account
            </button>
          )}
        </div>

        {/* FILTER TABS (Clean Bank Account filters - Removed redundant Assets, Income, Expense) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'All', label: `All Accounts (${accountCounts.All || 0})` },
            ...Object.keys(accountCounts)
              .filter(k => k !== 'All')
              .map(bank => ({ key: bank, label: `🏦 ${bank} (${accountCounts[bank]})` }))
          ].map((t) => (
            <button
              key={t.key}
              className={`py-2 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                filter === t.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ACCOUNT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccounts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-sm font-semibold text-slate-600">No accounts found in this category.</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add New Account" above to register bank accounts or operating ledgers.</p>
            </div>
          ) : (
            filteredAccounts.map((acc, index) => {
              const rawBalance = acc.openingBalance ?? acc.balance ?? acc.currentBalance ?? 0;
              const numBalance = parseFloat(rawBalance) || 0;
              const accType = getAccountType(acc);
              const accName = acc.accountName || acc.name || 'Unnamed Account';
              const isBank = accType.toLowerCase() === 'bank';

              return (
                <div
                  key={index}
                  onClick={() => openAccountReport(acc)}
                  className={`rounded-2xl p-5 bg-white border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer group flex flex-col justify-between ${
                    isBank
                      ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                          {accName}
                        </h3>
                        {acc.company?.name && (
                          <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                            {acc.company.name}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 items-center shrink-0">
                        {hasPermission('Chart of Accounts', 'edit') && (
                          <button
                            className="p-1.5 rounded-lg cursor-pointer text-slate-400 text-sm transition-colors duration-200 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(
                                {
                                  id: acc.id,
                                  accountName: accName,
                                  assetType: accType,
                                  accountNumber: acc.accountNumber,
                                  balance: rawBalance
                                },
                                index
                              );
                            }}
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                        )}
                        {hasPermission('Chart of Accounts', 'delete') && (
                          <button
                            className="p-1.5 rounded-lg cursor-pointer text-slate-400 text-sm transition-colors duration-200 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(acc.id);
                            }}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isBank
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : accType === 'Asset'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : accType === 'Income'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isBank ? '🏦 Bank Account' : accType}
                      </span>
                      {acc.accountNumber && (
                        <span className="text-[11px] font-mono text-slate-400 font-medium">({acc.accountNumber})</span>
                      )}
                    </div>

                    <div className="mt-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Balance</span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        $ {numBalance.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h2>
                    </div>
                  </div>

                  {/* CLICK INDICATOR FOOTER */}
                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                    <span>View Transactions Report</span>
                    <span className="text-xs transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ==========================================
            CUSTOMIZABLE TRANSACTION REPORT MODAL
           ========================================== */}
        {reportAccount && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[999] p-2 sm:p-4 animate-[fadeIn_0.2s_ease]">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 animate-[scaleIn_0.25s_ease]">
              
              {/* MODAL HEADER */}
              <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                      {reportAccount.assetType || reportAccount.type || 'Account'}
                    </span>
                    {reportAccount.accountNumber && (
                      <span className="text-xs font-mono text-slate-300 font-semibold">{reportAccount.accountNumber}</span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                    {reportAccount.accountName || reportAccount.name || 'Account Statement'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Company: <strong className="text-slate-200">{realCompanies.find(c => String(c.id) === String(selectedCompanyId))?.name || 'All Companies'}</strong></span>
                    <span>•</span>
                    <span>Building: <strong className="text-slate-200">{selectedBuildingObj ? selectedBuildingObj.name : 'All Buildings'}</strong></span>
                  </p>
                </div>

                {/* HEADER ACTIONS: DOWNLOAD & PRINT */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/20 shadow-xs"
                    title="Export as CSV spreadsheet"
                  >
                    <FiDownload size={14} />
                    <span>Download CSV</span>
                  </button>

                  <button
                    onClick={handlePrintPDF}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-xs"
                    title="Print or Save as PDF"
                  >
                    <FiPrinter size={14} />
                    <span>Print / PDF</span>
                  </button>

                  <button
                    onClick={() => setReportAccount(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer transition-colors ml-1"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* SUMMARY STATS BAR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 shrink-0">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Account Balance</p>
                  <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    $ {parseFloat(reportAccount.openingBalance ?? reportAccount.balance ?? 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                    <FiArrowDownLeft size={12} /> Total Credits
                  </p>
                  <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">
                    +${totalCredits.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-rose-600 tracking-wider flex items-center gap-1">
                    <FiArrowUpRight size={12} /> Total Debits
                  </p>
                  <p className="text-base sm:text-lg font-black text-rose-600 mt-0.5">
                    -${totalDebits.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Net Activity</p>
                  <p className={`text-base sm:text-lg font-black mt-0.5 ${netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {netFlow >= 0 ? '+' : ''}${netFlow.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* CUSTOMIZATION TOOLBAR */}
              <div className="p-4 border-b border-slate-200 flex flex-col gap-3 bg-white shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  
                  {/* Date Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <FiCalendar size={13} /> Period:
                    </span>
                    {[
                      { key: 'ALL', label: 'All Time' },
                      { key: 'THIS_MONTH', label: 'This Month' },
                      { key: 'LAST_30_DAYS', label: 'Last 30 Days' },
                      { key: 'THIS_QUARTER', label: 'This Quarter' },
                      { key: 'CUSTOM', label: 'Custom Range' }
                    ].map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setDateFilter(p.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          dateFilter === p.key
                            ? 'bg-zinc-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Type Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <FiFilter size={13} /> Type:
                    </span>
                    {[
                      { key: 'ALL', label: 'All' },
                      { key: 'CREDIT', label: 'Credits (In)' },
                      { key: 'DEBIT', label: 'Debits (Out)' }
                    ].map((tf) => (
                      <button
                        key={tf.key}
                        onClick={() => setTypeFilter(tf.key)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          typeFilter === tf.key
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Pickers (if CUSTOM selected) & Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {dateFilter === 'CUSTOM' ? (
                    <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-700">
                      <span>From:</span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <span>To:</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-500">
                      Showing <strong className="text-slate-800">{filteredTransactions.length}</strong> transactions
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="Search description, ref #..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>

                    {/* Sort Order Toggle */}
                    <button
                      onClick={() => setSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                      title="Toggle Date Sort Order"
                    >
                      <FiRefreshCw size={12} />
                      <span>{sortOrder === 'NEWEST' ? 'Newest' : 'Oldest'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* TRANSACTIONS TABLE */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {isLoadingTxs ? (
                  <div className="py-20 text-center text-slate-400">
                    <FiRefreshCw className="animate-spin mx-auto text-indigo-500 mb-2" size={24} />
                    <p className="text-sm font-semibold text-slate-600">Loading live transactions from database...</p>
                    <span className="text-xs text-slate-400">Filtering by selected company & building</span>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <p className="text-sm font-semibold">No transactions match your current filters.</p>
                    <button
                      onClick={() => {
                        setDateFilter('ALL');
                        setTypeFilter('ALL');
                        setSearchQuery('');
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }}
                      className="mt-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Description / Particulars</th>
                          <th className="py-3 px-4">Reference #</th>
                          <th className="py-3 px-4 text-center">Type</th>
                          <th className="py-3 px-4 text-right">Debit ($)</th>
                          <th className="py-3 px-4 text-right">Credit ($)</th>
                          <th className="py-3 px-4 text-right">Balance ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                              {tx.date}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900 leading-snug">{tx.description}</p>
                              {tx.category && (
                                <span className="inline-block mt-0.5 text-[10px] text-slate-400 font-normal">
                                  {tx.category}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                              {tx.reference || '-'}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  tx.type === 'CREDIT'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {tx.type === 'CREDIT' ? 'Credit' : 'Debit'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap font-semibold text-rose-600">
                              {tx.type === 'DEBIT' ? `$${tx.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap font-semibold text-emerald-600">
                              {tx.type === 'CREDIT' ? `$${tx.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                              ${(tx.balance || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="p-3.5 px-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                <span className="text-[11px] text-slate-400">
                  Tip: Use Download CSV or Print / PDF to export full customizable statements.
                </span>
                <button
                  onClick={() => setReportAccount(null)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            ADD / EDIT ACCOUNT MODAL (ORIGINAL)
           ========================================== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[999] p-4 animate-[fadeIn_0.2s_ease]">
            <div className="bg-white w-full max-w-[420px] rounded-xl shadow-2xl animate-[scaleIn_0.25s_ease]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-base font-semibold text-slate-900">{editIndex !== null ? 'Edit Account' : 'Add Account'}</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg cursor-pointer text-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100">
                  <FiX />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Account Name *</label>
                  <input
                    placeholder="e.g. Operating Checking, Rental Revenue Account"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Bank / Institution</label>
                    <select
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="RBC Royal Bank">RBC Royal Bank</option>
                      <option value="TD Canada Trust">TD Canada Trust</option>
                      <option value="BMO Bank of Montreal">BMO Bank of Montreal</option>
                      <option value="Scotiabank">Scotiabank</option>
                      <option value="CIBC">CIBC</option>
                      <option value="National Bank">National Bank</option>
                      <option value="Cash / Operating Fund">Cash / Operating Fund</option>
                      <option value="Other Bank">Other Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Account / Transit #</label>
                    <input
                      placeholder="e.g. ****4821 or 003-10292"
                      value={form.accountNumber || ''}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Opening Balance ($) *</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.balance}
                      onChange={(e) => setForm({ ...form, balance: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Associated Company</label>
                    <select
                      value={form.companyId || ''}
                      onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      {realCompanies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 flex justify-end gap-2.5">
                <button onClick={() => setShowModal(false)} className="py-2 px-4 rounded-lg border-none cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-sm">Cancel</button>
                <button className="py-2 px-4 rounded-lg border-none cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 font-medium text-sm" onClick={handleSave}>
                  Save Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
