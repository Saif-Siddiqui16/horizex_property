import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { 
  Building2, 
  Landmark, 
  ArrowUpDown, 
  CheckSquare, 
  Square, 
  DollarSign, 
  MapPin, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Receipt, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import api from '../../api/client';
import { paymentService } from '../../mock/mockServices';

export const CompanyRentCollection = ({ onPaymentRecorded = null }) => {
  // State
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(1);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting & Filtering state
  // Options: 'balance-desc', 'balance-asc', 'address-asc', 'name-asc'
  const [sortBy, setSortBy] = useState('balance-desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected tenants for rent collection: { [tenantId]: { checked: boolean, amountPaid: number, originalBalance: number } }
  const [paymentEntries, setPaymentEntries] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('E-Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [successNotice, setSuccessNotice] = useState(null);

  // Local storage key for persistent custom balances
  const BALANCE_STORAGE_KEY = 'company_rent_collection_balances';

  // Load Companies, Properties, Tenants, and Invoices
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [compRes, propRes, tenantRes, invRes] = await Promise.all([
        api.get('/api/admin/companies'),
        api.get('/api/admin/properties'),
        api.get('/api/admin/tenants'),
        api.get('/api/admin/invoices')
      ]);

      const compList = compRes.data?.data || compRes.data || [];
      const propList = propRes.data?.data || propRes.data || [];
      const tenantList = tenantRes.data?.data || tenantRes.data || [];
      const invList = invRes.data?.data || invRes.data || [];

      setCompanies(compList);
      setProperties(propList);
      setTenants(tenantList);
      setInvoices(invList);

      // Default company
      if (compList.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(compList[0].id);
      }
    } catch (e) {
      console.error('Failed to load rent collection data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Get current active company object
  const activeCompany = useMemo(() => {
    return companies.find(c => c.id === parseInt(selectedCompanyId)) || {
      id: 1,
      name: 'Apex Real Estate Partners',
      code: 'APEX',
      bankName: 'TD Canada Trust',
      bankAccount: 'TD Commercial Operating #0144-8829-10',
      ownerName: 'Owner User'
    };
  }, [companies, selectedCompanyId]);

  // Saved balances dictionary from localStorage
  const getStoredBalances = () => {
    try {
      const raw = localStorage.getItem(BALANCE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  const saveStoredBalances = (balances) => {
    localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(balances));
  };

  // Buildings belonging to the selected company
  const companyBuildings = useMemo(() => {
    return properties.filter(p => p.companyId === parseInt(selectedCompanyId));
  }, [properties, selectedCompanyId]);

  const companyBuildingIds = useMemo(() => {
    return companyBuildings.map(b => b.id);
  }, [companyBuildings]);

  // Combined Tenant List across all buildings of the selected company
  const companyTenantsWithBalances = useMemo(() => {
    const storedBalances = getStoredBalances();

    // Filter tenants who belong to any building owned by this company
    const matchingTenants = tenants.filter(t => companyBuildingIds.includes(t.propertyId));

    return matchingTenants.map(t => {
      const prop = companyBuildings.find(b => b.id === t.propertyId);
      const fullAddress = prop 
        ? `${prop.address || prop.name}, ${t.unitNumber || 'Unit'}`
        : `${t.propertyName || 'Building'}, ${t.unitNumber || 'Unit'}`;

      // Find matching invoice for this tenant (prefer unpaid/generated invoice for active cycle)
      const matchingInvoices = invoices.filter(i => i.tenantId === t.id);
      const activeUnpaidInv = matchingInvoices.find(i => i.status !== 'Paid');
      const latestInvoice = matchingInvoices[matchingInvoices.length - 1];

      // Monthly rent defaults to active invoice amount (or lease/renewal rent)
      let monthlyRent = parseFloat(t.rent || 600);
      if (activeUnpaidInv && (activeUnpaidInv.amountDue || activeUnpaidInv.amount)) {
        monthlyRent = parseFloat(activeUnpaidInv.amountDue || activeUnpaidInv.amount);
      } else if (latestInvoice && (latestInvoice.amountDue || latestInvoice.amount)) {
        monthlyRent = parseFloat(latestInvoice.amountDue || latestInvoice.amount);
      }
      
      // Check if custom balance exists in storage for this tenant
      let currentBalance = monthlyRent;
      if (storedBalances[t.id] !== undefined) {
        currentBalance = parseFloat(storedBalances[t.id]);
      } else if (activeUnpaidInv) {
        currentBalance = activeUnpaidInv.outstandingBalance !== undefined
          ? parseFloat(activeUnpaidInv.outstandingBalance)
          : parseFloat(activeUnpaidInv.amountDue || activeUnpaidInv.amount || monthlyRent);
      } else if (matchingInvoices.length > 0 && matchingInvoices.every(i => i.status === 'Paid')) {
        currentBalance = 0;
      }

      return {
        ...t,
        fullName: t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Tenant',
        buildingName: prop ? prop.name : t.propertyName,
        buildingAddress: prop ? prop.address : '',
        fullAddress,
        monthlyRent,
        currentBalance: Math.max(0, currentBalance),
        status: currentBalance <= 0 ? 'Paid' : currentBalance < monthlyRent ? 'Partial' : 'Unpaid'
      };
    });
  }, [tenants, companyBuildingIds, companyBuildings, invoices]);

  // Sort and filter the company tenants list
  const filteredAndSortedTenants = useMemo(() => {
    let list = [...companyTenantsWithBalances];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(t => 
        t.fullName.toLowerCase().includes(term) ||
        t.fullAddress.toLowerCase().includes(term) ||
        (t.unitNumber || '').toLowerCase().includes(term) ||
        t.buildingName.toLowerCase().includes(term)
      );
    }

    // Sort by Rent balance or Address
    list.sort((a, b) => {
      if (sortBy === 'balance-desc') {
        return b.currentBalance - a.currentBalance;
      }
      if (sortBy === 'balance-asc') {
        return a.currentBalance - b.currentBalance;
      }
      if (sortBy === 'address-asc') {
        return (a.fullAddress || '').localeCompare(b.fullAddress || '');
      }
      if (sortBy === 'name-asc') {
        return (a.fullName || '').localeCompare(b.fullName || '');
      }
      return 0;
    });

    return list;
  }, [companyTenantsWithBalances, searchTerm, sortBy]);

  // Toggle tenant checkbox
  const handleToggleTenant = (tenant) => {
    const tId = tenant.id;
    const isCurrentlyChecked = paymentEntries[tId]?.checked;

    if (isCurrentlyChecked) {
      // Uncheck
      const updated = { ...paymentEntries };
      delete updated[tId];
      setPaymentEntries(updated);
    } else {
      // Check: default payment amount is their current rent balance
      setPaymentEntries({
        ...paymentEntries,
        [tId]: {
          checked: true,
          amountPaid: tenant.currentBalance,
          originalBalance: tenant.currentBalance
        }
      });
    }
  };

  // Edit custom rent amount received
  const handleAmountChange = (tenantId, newAmountStr, originalBalance) => {
    const val = parseFloat(newAmountStr) || 0;
    setPaymentEntries({
      ...paymentEntries,
      [tenantId]: {
        checked: true,
        amountPaid: val,
        originalBalance
      }
    });
  };

  // Select all / Deselect all
  const handleSelectAll = () => {
    const unpaidTenants = filteredAndSortedTenants.filter(t => t.currentBalance > 0);
    if (Object.keys(paymentEntries).length === unpaidTenants.length) {
      setPaymentEntries({});
    } else {
      const newEntries = {};
      unpaidTenants.forEach(t => {
        newEntries[t.id] = {
          checked: true,
          amountPaid: t.currentBalance,
          originalBalance: t.currentBalance
        };
      });
      setPaymentEntries(newEntries);
    }
  };

  // Submit Rent Collection Batch
  const handleRecordPayments = () => {
    const selectedIds = Object.keys(paymentEntries).filter(id => paymentEntries[id]?.checked);
    if (selectedIds.length === 0) {
      alert('Please check off at least one tenant to record rent payment.');
      return;
    }

    const storedBalances = getStoredBalances();
    const recordedSummary = [];

    selectedIds.forEach(idStr => {
      const id = parseInt(idStr);
      const entry = paymentEntries[id];
      const tenant = companyTenantsWithBalances.find(t => t.id === id);
      if (!tenant) return;

      const amountPaid = parseFloat(entry.amountPaid) || 0;
      const currentBalance = tenant.currentBalance;
      const remainingBalance = Math.max(0, currentBalance - amountPaid);

      // Save updated remaining balance
      storedBalances[id] = remainingBalance;

      // Also record payment in mock payment service
      const matchingInvoice = invoices.find(inv => inv.tenantId === id && inv.status !== 'Paid');
      if (matchingInvoice) {
        paymentService.record(matchingInvoice.id, amountPaid, paymentMethod);
      }

      recordedSummary.push({
        tenantName: tenant.fullName,
        amountPaid,
        remainingBalance,
        unit: tenant.unitNumber,
        building: tenant.buildingName
      });
    });

    // Persist new balances
    saveStoredBalances(storedBalances);

    // Clear checked inputs
    setPaymentEntries({});

    // Success notice
    setSuccessNotice({
      companyName: activeCompany.name,
      bankAccount: activeCompany.bankAccount,
      payments: recordedSummary,
      totalCollected: recordedSummary.reduce((sum, p) => sum + p.amountPaid, 0)
    });

    if (onPaymentRecorded) {
      onPaymentRecorded();
    }
    loadAllData();
  };

  // Reset all balances back to defaults for testing/fresh cycle
  const handleResetBalances = () => {
    if (!window.confirm('Reset all tenant rent balances for this company back to full monthly rent?')) return;
    const stored = getStoredBalances();
    companyTenantsWithBalances.forEach(t => {
      delete stored[t.id];
    });
    saveStoredBalances(stored);
    setPaymentEntries({});
    setSuccessNotice(null);
    loadAllData();
  };

  // Summary stats for active company
  const totalMonthlyRent = companyTenantsWithBalances.reduce((sum, t) => sum + t.monthlyRent, 0);
  const totalCurrentBalance = companyTenantsWithBalances.reduce((sum, t) => sum + t.currentBalance, 0);
  const totalCollectedSoFar = totalMonthlyRent - totalCurrentBalance;

  // Selected totals
  const selectedEntries = Object.values(paymentEntries).filter(e => e.checked);
  const totalSelectedAmount = selectedEntries.reduce((sum, e) => sum + (parseFloat(e.amountPaid) || 0), 0);

  return (
    <div className="flex flex-col gap-6">

      {/* 🏢 1. Company Selection & Bank Account Banner */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Building2 size={18} />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  Company Multi-Building Rent Collection
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select a company to view and collect rent across all its associated buildings into its designated bank account.
                </p>
              </div>
            </div>
          </div>

          {/* Company Dropdown */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:flex-initial">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Filter / Sort by Company:
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(parseInt(e.target.value));
                  setPaymentEntries({});
                  setSuccessNotice(null);
                }}
                className="w-full lg:w-64 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="secondary"
              onClick={handleResetBalances}
              title="Reset tenant balances"
              className="text-[10px] font-bold h-9.5 px-3 text-slate-400 hover:text-slate-600 mt-4.5"
            >
              <RotateCcw size={13} className="mr-1" />
              Reset Cycle
            </Button>
          </div>
        </div>

        {/* Company Bank Account & Stats Summary Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bank Account Details */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/70 rounded-2xl border border-indigo-100/80 flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
              <Landmark size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">
                Direct Deposit Bank Account
              </span>
              <p className="text-xs font-black text-slate-800 tracking-tight truncate mt-0.5">
                {activeCompany.bankAccount || 'TD Commercial #0144-8829-10'}
              </p>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                Owner: {activeCompany.ownerName || 'Owner User'}
              </span>
            </div>
          </div>

          {/* Buildings in this company */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-slate-200 text-slate-700 rounded-xl shrink-0 mt-0.5">
              <Building2 size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Company Buildings
              </span>
              <p className="text-base font-black text-slate-800 tracking-tight mt-0.5">
                {companyBuildings.length} {companyBuildings.length === 1 ? 'Building' : 'Buildings'}
              </p>
              <span className="text-[10px] text-slate-500 font-medium block truncate">
                {companyBuildings.map(b => b.name).join(', ') || 'No buildings'}
              </span>
            </div>
          </div>

          {/* Total Outstanding Balance */}
          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 flex items-start gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0 mt-0.5">
              <TrendingDown size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider block">
                Outstanding Balance Due
              </span>
              <p className="text-base font-black text-rose-700 font-mono tracking-tight mt-0.5">
                ${totalCurrentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-500 font-medium block">
                Across {companyTenantsWithBalances.length} active tenants
              </span>
            </div>
          </div>

          {/* Collected Rent Amount */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 mt-0.5">
              <DollarSign size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                Rent Collected To Date
              </span>
              <p className="text-base font-black text-emerald-700 font-mono tracking-tight mt-0.5">
                ${totalCollectedSoFar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-500 font-medium block">
                Of ${totalMonthlyRent.toLocaleString('en-US', { minimumFractionDigits: 2 })} expected
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 🔔 Success Recording Notice Banner */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 p-4.5 rounded-2xl flex items-start justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-emerald-500 text-white rounded-lg mt-0.5 shrink-0">
              <CheckCircle size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-900 tracking-tight">
                Rent Payments Successfully Recorded for {successNotice.companyName}!
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Total <span className="font-bold font-mono">${successNotice.totalCollected.toFixed(2)}</span> deposited into <span className="font-semibold">{successNotice.bankAccount}</span>.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {successNotice.payments.map((p, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-[10px] font-bold text-slate-700 shadow-2xs">
                    <span>{p.tenantName}:</span>
                    <span className="text-emerald-700 font-mono">Paid ${p.amountPaid}</span>
                    {p.remainingBalance > 0 ? (
                      <span className="text-rose-600 font-mono">(${p.remainingBalance} balance stays on list)</span>
                    ) : (
                      <span className="text-emerald-600 font-mono">($0 paid in full)</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSuccessNotice(null)} 
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            &times; Close
          </button>
        </div>
      )}

      {/* 📋 2. Controls Toolbar: Sort by Rent Balance or Address & Search */}
      <Card className="p-4 bg-white border border-slate-200 rounded-[22px] shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search tenant name, unit number, address, or building..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
          />
        </div>

        {/* Sort Controls (Client explicitly required: Sort by Rent Balance or by Address) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <ArrowUpDown size={12} />
            Sort List By:
          </span>

          <Button
            variant={sortBy.startsWith('balance') ? 'primary' : 'secondary'}
            onClick={() => setSortBy(sortBy === 'balance-desc' ? 'balance-asc' : 'balance-desc')}
            className="text-xs font-bold h-9 px-3"
            title="Sort by tenant rent balance"
          >
            <DollarSign size={13} className="mr-1" />
            Rent Balance {sortBy === 'balance-desc' ? '(High → Low)' : sortBy === 'balance-asc' ? '(Low → High)' : ''}
          </Button>

          <Button
            variant={sortBy === 'address-asc' ? 'primary' : 'secondary'}
            onClick={() => setSortBy('address-asc')}
            className="text-xs font-bold h-9 px-3"
            title="Sort alphabetically by property & unit address"
          >
            <MapPin size={13} className="mr-1" />
            Address (A → Z)
          </Button>

          <Button
            variant="secondary"
            onClick={handleSelectAll}
            className="text-xs font-bold h-9 px-3 text-slate-700 bg-slate-100 hover:bg-slate-200"
          >
            <CheckSquare size={13} className="mr-1 text-slate-500" />
            {selectedEntries.length > 0 ? 'Clear Selection' : 'Select All Unpaid'}
          </Button>
        </div>
      </Card>

      {/* 📝 3. Tenant Rent Collection Table */}
      <Card className="bg-white border border-slate-200 rounded-[22px] shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Tenants in {activeCompany.name} (Across All Buildings)
            </h4>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              Check off names to collect rent. Enter a customized payment amount to leave remaining balances.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            {filteredAndSortedTenants.length} Tenants Listed
          </span>
        </div>

        {filteredAndSortedTenants.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-xs font-semibold">No tenants found for this company.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Collect</th>
                  <th className="py-3 px-4">Tenant Name</th>
                  <th className="py-3 px-4">Building & Address</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-right">Monthly Rent</th>
                  <th className="py-3 px-4 text-right">Current Balance</th>
                  <th className="py-3 px-4 w-52">Amount Received ($)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAndSortedTenants.map((tenant) => {
                  const entry = paymentEntries[tenant.id];
                  const isChecked = !!entry?.checked;
                  const enteredAmount = isChecked ? entry.amountPaid : 0;
                  const calculatedRemaining = isChecked 
                    ? Math.max(0, tenant.currentBalance - enteredAmount)
                    : tenant.currentBalance;

                  return (
                    <tr 
                      key={tenant.id}
                      className={`transition-colors hover:bg-slate-50/60 ${
                        isChecked ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleTenant(tenant)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all mx-auto ${
                            isChecked
                              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                              : 'border-2 border-slate-300 hover:border-indigo-500 text-transparent bg-white'
                          }`}
                          aria-label={`Check off ${tenant.fullName}`}
                        >
                          {isChecked ? (
                            <CheckSquare size={14} className="stroke-[2.5]" />
                          ) : (
                            <Square size={14} className="text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Tenant Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 text-xs">
                          {tenant.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {tenant.email || tenant.phone}
                        </div>
                      </td>

                      {/* Building & Address */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 size={12} className="text-slate-400 shrink-0" />
                          <span>{tenant.buildingName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-slate-400 shrink-0" />
                          <span>{tenant.buildingAddress || tenant.fullAddress}</span>
                        </div>
                      </td>

                      {/* Unit Number */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {tenant.unitNumber}
                      </td>

                      {/* Monthly Rent */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                        ${tenant.monthlyRent.toFixed(2)}
                      </td>

                      {/* Current Balance */}
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-black ${
                          tenant.currentBalance > 0 
                            ? 'text-rose-600 text-xs' 
                            : 'text-emerald-600 text-xs'
                        }`}>
                          ${tenant.currentBalance.toFixed(2)}
                        </span>
                      </td>

                      {/* Amount Received Input (Customizable) */}
                      <td className="py-3 px-4">
                        {isChecked ? (
                          <div className="space-y-1">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={tenant.currentBalance}
                                value={entry.amountPaid}
                                onChange={(e) => handleAmountChange(tenant.id, e.target.value, tenant.currentBalance)}
                                className="w-full pl-6 pr-3 py-1.5 bg-white border-2 border-indigo-500 rounded-xl text-xs font-black font-mono text-slate-900 outline-none shadow-xs"
                                placeholder={tenant.currentBalance.toString()}
                              />
                            </div>
                            
                            {/* Live Remaining Balance Helper */}
                            <div className="text-[10px] font-bold">
                              {calculatedRemaining === 0 ? (
                                <span className="text-emerald-600 flex items-center gap-0.5">
                                  <CheckCircle size={10} /> Paid in full ($0 balance)
                                </span>
                              ) : (
                                <span className="text-amber-600">
                                  Remaining balance: <strong className="font-mono text-rose-600">${calculatedRemaining.toFixed(2)}</strong> stays on list
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">
                            Check box to enter payment
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {tenant.currentBalance <= 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Paid
                          </span>
                        ) : tenant.currentBalance < tenant.monthlyRent ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                            Partial (${tenant.currentBalance})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                            Unpaid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 💳 4. Floating / Sticky Payment Submission Dock */}
      {selectedEntries.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-slate-950 text-white p-4.5 rounded-[22px] border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs">
                {selectedEntries.length}
              </span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tenants Selected
                </span>
                <span className="text-sm font-black text-white">
                  Total Rent to Collect: <span className="text-emerald-400 font-mono">${totalSelectedAmount.toFixed(2)}</span>
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            {/* Payment Method Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Method:</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none"
              >
                <option value="E-Transfer">Interac E-Transfer</option>
                <option value="Bank Transfer">Direct Bank Transfer</option>
                <option value="Cheque">Physical Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            {/* Deposit Target Account Notice */}
            <div className="text-[10px] text-slate-400 hidden xl:block">
              Depositing into: <strong className="text-slate-200">{activeCompany.bankAccount}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPaymentEntries({})}
              className="text-xs font-bold text-slate-400 bg-slate-900 hover:bg-slate-800 border-slate-700"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleRecordPayments}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
            >
              <CheckCircle size={15} className="mr-1.5" />
              Confirm & Record Rent Received (${totalSelectedAmount.toFixed(2)})
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyRentCollection;
