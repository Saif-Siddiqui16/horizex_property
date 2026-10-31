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
import api from '../api/client';
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
    type: 'Bank',
    accountNumber: '',
    balance: '',
  });

  const [accounts, setAccounts] = useState([]);

  // Report Modal & Customization States
  const [reportAccount, setReportAccount] = useState(null);
  const [accountTransactions, setAccountTransactions] = useState([]);
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, THIS_MONTH, LAST_30_DAYS, THIS_QUARTER, CUSTOM
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, CREDIT, DEBIT
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('NEWEST'); // NEWEST, OLDEST

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/api/admin/accounts');
      setAccounts(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditIndex(null);
    setForm({ name: '', type: 'Bank', balance: '', accountNumber: '' });
    setShowModal(true);
  };

  const openEditModal = (acc, index) => {
    setEditIndex(index);
    setForm({
      name: acc.accountName || acc.name || '',
      type: acc.assetType || acc.type || 'Bank',
      balance: acc.openingBalance ?? acc.balance ?? '',
      accountNumber: acc.accountNumber || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.balance) {
      alert('Please fill all fields');
      return;
    }

    try {
      const payload = {
        accountName: form.name,
        assetType: form.type,
        openingBalance: form.balance,
        accountNumber: form.accountNumber || ''
      };

      if (editIndex !== null) {
        const accountId = accounts[editIndex].id;
        await api.patch(`/api/admin/accounts/${accountId}`, payload);
      } else {
        await api.post('/api/admin/accounts', payload);
      }

      fetchAccounts();
      setShowModal(false);
    } catch (e) {
      alert('Error saving account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`/api/admin/accounts/${id}`);
      fetchAccounts();
    } catch (e) {
      alert('Error deleting account');
    }
  };

  // ==========================================
  // TRANSACTION REPORT GENERATOR & STORAGE
  // ==========================================
  const generateMockTransactionsForAccount = (acc) => {
    const rawBal = parseFloat(acc.openingBalance ?? acc.balance ?? acc.currentBalance ?? 50000) || 50000;
    const accType = (acc.assetType || acc.type || 'Asset').toLowerCase();

    const today = new Date();
    const getDateStr = (daysAgo) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    if (accType === 'bank') {
      return [
        { id: 'TX-1001', date: getDateStr(1), description: 'Tenant Rent E-Transfer - Apt 304 (Alexandre Tremblay)', reference: 'E-TRF-98214', category: 'Rent Collection', type: 'CREDIT', amount: 1650.00, balance: rawBal },
        { id: 'TX-1002', date: getDateStr(3), description: 'Hydro Quebec - Monthly Electric Utility Bill', reference: 'UTIL-49102', category: 'Utilities', type: 'DEBIT', amount: 485.60, balance: rawBal - 1650.00 },
        { id: 'TX-1003', date: getDateStr(5), description: 'Tenant Rent Payment - Apt 102 (Sophia Patel)', reference: 'PAY-88201', category: 'Rent Collection', type: 'CREDIT', amount: 1450.00, balance: rawBal - 1650.00 + 485.60 },
        { id: 'TX-1004', date: getDateStr(8), description: 'City Heating & Cooling - HVAC Emergency Repair', reference: 'BILL-55192', category: 'Repairs & Maintenance', type: 'DEBIT', amount: 720.00, balance: rawBal - 1650.00 + 485.60 - 1450.00 },
        { id: 'TX-1005', date: getDateStr(12), description: 'Security Deposit Escrow Fund Allocation', reference: 'DEP-33910', category: 'Escrow Transfer', type: 'CREDIT', amount: 1500.00, balance: rawBal - 1650.00 + 485.60 - 1450.00 + 720.00 },
        { id: 'TX-1006', date: getDateStr(16), description: 'Apex Elevator Services - Routine Maintenance', reference: 'INV-11829', category: 'Maintenance', type: 'DEBIT', amount: 620.00, balance: rawBal - 1650.00 + 485.60 - 1450.00 + 720.00 - 1500.00 },
        { id: 'TX-1007', date: getDateStr(22), description: 'Commercial Unit Rent - Downtown Suites 502', reference: 'CHK-44120', category: 'Commercial Rent', type: 'CREDIT', amount: 3200.00, balance: rawBal - 1650.00 + 485.60 - 1450.00 + 720.00 - 1500.00 + 620.00 },
        { id: 'TX-1008', date: getDateStr(28), description: 'Property Management Operational Fee Disbursal', reference: 'FEE-90123', category: 'Management Fees', type: 'DEBIT', amount: 1250.00, balance: rawBal - 1650.00 + 485.60 - 1450.00 + 720.00 - 1500.00 + 620.00 - 3200.00 },
        { id: 'TX-1009', date: getDateStr(35), description: 'Tenant Rent Payment - Apt 205 (Sarah Connor)', reference: 'PAY-77192', category: 'Rent Collection', type: 'CREDIT', amount: 1800.00, balance: rawBal - 1650.00 + 485.60 - 1450.00 + 720.00 - 1500.00 + 620.00 - 3200.00 + 1250.00 },
        { id: 'TX-1010', date: getDateStr(45), description: 'Waste Management & Recycling Services', reference: 'BILL-66012', category: 'Utilities', type: 'DEBIT', amount: 340.00, balance: rawBal - 1650.00 + 485.60 - 1450.00 + 720.00 - 1500.00 + 620.00 - 3200.00 + 1250.00 - 1800.00 }
      ];
    } else if (accType === 'income' || accType === 'revenue') {
      return [
        { id: 'TX-2001', date: getDateStr(2), description: 'Monthly Residential Rent - Parkview Heights #304', reference: 'INV-2026-0081', category: 'Rent Income', type: 'CREDIT', amount: 1650.00, balance: rawBal },
        { id: 'TX-2002', date: getDateStr(4), description: 'Monthly Residential Rent - Sunset Towers #201', reference: 'INV-2026-0082', category: 'Rent Income', type: 'CREDIT', amount: 1450.00, balance: rawBal - 1650.00 },
        { id: 'TX-2003', date: getDateStr(7), description: 'Late Payment Penalty Assessment', reference: 'FEE-2026-0012', category: 'Late Fees', type: 'CREDIT', amount: 75.00, balance: rawBal - 1650.00 - 1450.00 },
        { id: 'TX-2004', date: getDateStr(11), description: 'Assigned Parking Stall #P-14 Monthly Fee', reference: 'PRK-2026-0044', category: 'Parking Income', type: 'CREDIT', amount: 150.00, balance: rawBal - 1650.00 - 1450.00 - 75.00 },
        { id: 'TX-2005', date: getDateStr(15), description: 'Commercial Lease Rent - Unit 502', reference: 'INV-2026-0075', category: 'Commercial Rent', type: 'CREDIT', amount: 3200.00, balance: rawBal - 1650.00 - 1450.00 - 75.00 - 150.00 },
        { id: 'TX-2006', date: getDateStr(21), description: 'Storage Locker Rental #S-08', reference: 'STR-2026-0019', category: 'Ancillary Income', type: 'CREDIT', amount: 90.00, balance: rawBal - 1650.00 - 1450.00 - 75.00 - 150.00 - 3200.00 },
        { id: 'TX-2007', date: getDateStr(32), description: 'Residential Rent Invoiced - Apt 104', reference: 'INV-2026-0060', category: 'Rent Income', type: 'CREDIT', amount: 1300.00, balance: rawBal - 1650.00 - 1450.00 - 75.00 - 150.00 - 3200.00 - 90.00 },
        { id: 'TX-2008', date: getDateStr(42), description: 'Tenant Move-In Cleaning Fee', reference: 'CLN-2026-0023', category: 'Fee Income', type: 'CREDIT', amount: 200.00, balance: rawBal - 1650.00 - 1450.00 - 75.00 - 150.00 - 3200.00 - 90.00 - 1300.00 }
      ];
    } else if (accType === 'expense') {
      return [
        { id: 'TX-3001', date: getDateStr(2), description: 'Plumbing Service Call - Leaking Pipe Apt 204', reference: 'EXP-4401', category: 'Plumbing', type: 'DEBIT', amount: 380.00, balance: rawBal },
        { id: 'TX-3002', date: getDateStr(6), description: 'Common Area Cleaning & Janitorial Supplies', reference: 'EXP-4402', category: 'Janitorial', type: 'DEBIT', amount: 520.00, balance: rawBal - 380.00 },
        { id: 'TX-3003', date: getDateStr(10), description: 'Electrical Panel Maintenance & Light Repairs', reference: 'EXP-4403', category: 'Electrical', type: 'DEBIT', amount: 290.00, balance: rawBal - 380.00 - 520.00 },
        { id: 'TX-3004', date: getDateStr(18), description: 'Lawn Care & Landscaping Seasonal Contract', reference: 'EXP-4404', category: 'Landscaping', type: 'DEBIT', amount: 650.00, balance: rawBal - 380.00 - 520.00 - 290.00 },
        { id: 'TX-3005', date: getDateStr(24), description: 'Fire Alarm System Annual Inspection', reference: 'EXP-4405', category: 'Safety & Compliance', type: 'DEBIT', amount: 850.00, balance: rawBal - 380.00 - 520.00 - 290.00 - 650.00 },
        { id: 'TX-3006', date: getDateStr(36), description: 'Locksmith Service - Master Key Rekeying', reference: 'EXP-4406', category: 'Security', type: 'DEBIT', amount: 195.00, balance: rawBal - 380.00 - 520.00 - 290.00 - 650.00 - 850.00 },
        { id: 'TX-3007', date: getDateStr(48), description: 'Trash Removal & Bin Sterilization Service', reference: 'EXP-4407', category: 'Waste Management', type: 'DEBIT', amount: 410.00, balance: rawBal - 380.00 - 520.00 - 290.00 - 650.00 - 850.00 - 195.00 }
      ];
    } else {
      return [
        { id: 'TX-4001', date: getDateStr(1), description: 'Tenant Monthly Rent Due - Apt 304', reference: 'AR-2026-101', category: 'Receivable', type: 'CREDIT', amount: 1650.00, balance: rawBal },
        { id: 'TX-4002', date: getDateStr(5), description: 'Payment Settlement Received - Apt 304', reference: 'REC-2026-088', category: 'Settlement', type: 'DEBIT', amount: 1650.00, balance: rawBal - 1650.00 },
        { id: 'TX-4003', date: getDateStr(9), description: 'Tenant Monthly Rent Due - Apt 102', reference: 'AR-2026-102', category: 'Receivable', type: 'CREDIT', amount: 1450.00, balance: rawBal },
        { id: 'TX-4004', date: getDateStr(14), description: 'Payment Settlement Received - Apt 102', reference: 'REC-2026-092', category: 'Settlement', type: 'DEBIT', amount: 1450.00, balance: rawBal - 1450.00 },
        { id: 'TX-4005', date: getDateStr(20), description: 'Late Payment Fee Assessed', reference: 'AR-2026-103', category: 'Fees', type: 'CREDIT', amount: 75.00, balance: rawBal + 75.00 },
        { id: 'TX-4006', date: getDateStr(30), description: 'Prepaid Rent Allocation for Next Month', reference: 'PRE-2026-004', category: 'Prepaid', type: 'DEBIT', amount: 1200.00, balance: rawBal - 1125.00 }
      ];
    }
  };

  const openAccountReport = (acc) => {
    setReportAccount(acc);
    setDateFilter('ALL');
    setTypeFilter('ALL');
    setSearchQuery('');
    setSortOrder('NEWEST');
    setCustomStartDate('');
    setCustomEndDate('');

    // Fetch or generate transactions
    const storageKey = `horizex_account_txs_${acc.id || acc.accountName}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccountTransactions(parsed);
          return;
        }
      } catch (e) {}
    }

    const generated = generateMockTransactionsForAccount(acc);
    localStorage.setItem(storageKey, JSON.stringify(generated));
    setAccountTransactions(generated);
  };

  // ==========================================
  // FILTER & CUSTOMIZATION LOGIC
  // ==========================================
  const filteredTransactions = useMemo(() => {
    if (!accountTransactions.length) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return accountTransactions
      .filter((tx) => {
        // Date Filtering
        if (dateFilter === 'THIS_MONTH') {
          const txDate = new Date(tx.date);
          if (txDate.getMonth() !== currentMonth || txDate.getFullYear() !== currentYear) {
            return false;
          }
        } else if (dateFilter === 'LAST_30_DAYS') {
          const txDate = new Date(tx.date);
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (txDate < thirtyDaysAgo) return false;
        } else if (dateFilter === 'THIS_QUARTER') {
          const txDate = new Date(tx.date);
          const currentQuarter = Math.floor(currentMonth / 3);
          const txQuarter = Math.floor(txDate.getMonth() / 3);
          if (txQuarter !== currentQuarter || txDate.getFullYear() !== currentYear) {
            return false;
          }
        } else if (dateFilter === 'CUSTOM') {
          if (customStartDate && tx.date < customStartDate) return false;
          if (customEndDate && tx.date > customEndDate) return false;
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
  }, [accountTransactions, dateFilter, customStartDate, customEndDate, typeFilter, searchQuery, sortOrder]);

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
                <th>Description / Particulars</th>
                <th>Reference #</th>
                <th style="text-align: center;">Type</th>
                <th style="text-align: right;">Debit ($)</th>
                <th style="text-align: right;">Credit ($)</th>
                <th style="text-align: right;">Balance ($)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            Horizex Real Estate • Confidential Account Statement • Printed on ${now}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredAccounts =
    filter === 'All'
      ? accounts
      : accounts.filter((a) => {
          let type = a.assetType || a.type || 'Asset';
          if (type.toLowerCase() === 'revenue') type = 'Income';
          if (type.toLowerCase() === 'bank') type = 'Bank';
          return type.toLowerCase() === filter.toLowerCase();
        });

  return (
    <>
      <div className="p-4 sm:p-6 animate-[fadeIn_0.4s_ease-in-out]">

        {/* HEADER – filter tabs + add button */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Bank', 'Asset', 'Income', 'Expense'].map((t) => (
              <button
                key={t}
                className={`py-2 px-4 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-200 ${
                  filter === t
                    ? 'bg-zinc-900 text-white border-indigo-600 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Add Button */}
          {hasPermission('Chart of Accounts', 'add') && (
            <button
              className="flex items-center justify-center gap-1.5 bg-zinc-900 text-white py-2.5 px-4 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all duration-200 hover:bg-zinc-800 hover:-translate-y-px w-full sm:w-auto"
              onClick={openAddModal}
            >
              <FiPlus />
              Add New Account
            </button>
          )}
        </div>

        {/* ACCOUNT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccounts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium">No accounts found. Add your first account to get started.</p>
            </div>
          ) : (
            filteredAccounts.map((acc, index) => {
              const rawBalance = acc.openingBalance ?? acc.balance ?? acc.currentBalance ?? 0;
              const numBalance = parseFloat(rawBalance) || 0;
              let accType = acc.assetType || acc.type || 'Asset';
              if (accType.toLowerCase() === 'revenue') accType = 'Income';

              const accName = acc.accountName || acc.name || 'Unnamed Account';

              return (
                <div
                  key={index}
                  onClick={() => openAccountReport(acc)}
                  className={`rounded-xl p-4 sm:p-5 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)] relative transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(0,0,0,0.1)] cursor-pointer group border-l-[5px] ${
                    accType.toLowerCase() === 'bank'
                      ? 'border-l-emerald-600'
                      : accType === 'Asset'
                      ? 'border-l-blue-600'
                      : accType === 'Income'
                      ? 'border-l-green-600'
                      : 'border-l-red-600'
                  } h-fit flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                        {accName}
                      </h3>
                      <div className="flex gap-1.5 items-center shrink-0">
                        {hasPermission('Chart of Accounts', 'edit') && (
                          <button
                            className="p-1.5 rounded-lg cursor-pointer text-slate-400 text-base transition-colors duration-200 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(
                                {
                                  name: acc.accountName,
                                  type: accType,
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
                            className="p-1.5 rounded-lg cursor-pointer text-slate-400 text-base transition-colors duration-200 hover:text-red-600 hover:bg-red-50"
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

                    <div className="flex items-center gap-2 mt-1">
                      <p
                        className={`text-[12px] font-bold uppercase tracking-wider ${
                          accType.toLowerCase() === 'bank' ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {accType.toLowerCase() === 'bank' ? '🏦 Bank Account' : accType}
                      </p>
                      {acc.accountNumber && (
                        <span className="text-[11px] font-mono text-slate-400 font-medium">({acc.accountNumber})</span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-[22px] font-bold my-2.5 text-slate-900">
                      $ {numBalance.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>

                    {/* MINI TREND BAR */}
                    <div className="flex gap-1 items-end h-[24px]">
                      <span className="w-1.5 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded h-[10px] animate-[grow_1.2s_ease_infinite_alternate]" />
                      <span className="w-1.5 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded h-[18px] animate-[grow_1.2s_ease_infinite_alternate_0.2s]" />
                      <span className="w-1.5 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded h-[24px] animate-[grow_1.2s_ease_infinite_alternate_0.4s]" />
                      <span className="w-1.5 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded h-[14px] animate-[grow_1.2s_ease_infinite_alternate_0.6s]" />
                    </div>
                  </div>

                  {/* CLICK INDICATOR FOOTER */}
                  <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
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
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recent transaction history, customizable statement & audit report
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
                {filteredTransactions.length === 0 ? (
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
                <input
                  placeholder="Account Name (e.g. Operating Checking - TD Bank)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Bank">Bank Account</option>
                  <option value="Asset">Asset</option>
                  <option>Income</option>
                  <option>Expense</option>
                </select>

                {form.type === 'Bank' && (
                  <input
                    placeholder="Account / Transit Number (e.g. ****4821)"
                    value={form.accountNumber || ''}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                )}

                <input
                  type="number"
                  placeholder="Opening Balance ($)"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
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
