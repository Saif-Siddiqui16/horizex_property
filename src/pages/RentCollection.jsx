import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Search, Plus, Filter, ClipboardList, TrendingUp, CreditCard, ChevronRight, FileText, X } from 'lucide-react';
import {
  invoiceService,
  paymentService,
  ledgerService,
  agingService,
  collectionAnalyticsService
} from '../mock/mockServices';
import { COLLECTION_STATUSES } from '../mock/rentCollection';
import { CollectionKPICards } from '../components/collection/CollectionKPICards';
import { OutstandingBalanceWidget } from '../components/collection/OutstandingBalanceWidget';
import { HighestOutstandingWidget } from '../components/collection/HighestOutstandingWidget';
import { CollectionStatusChart } from '../components/collection/CollectionStatusChart';
import { TenantLedgerCard } from '../components/collection/TenantLedgerCard';
import { InvoiceTable } from '../components/collection/InvoiceTable';
import { RecentPaymentsWidget } from '../components/collection/RecentPaymentsWidget';
import api from '../api/client';

export const RentCollection = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'invoices', 'ledger', 'aging'
  const [loading, setLoading] = useState(true);

  // Data States
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [aging, setAging] = useState({});
  const [buildings, setBuildings] = useState([]);
  const [leases, setLeases] = useState([]);
  const [tenants, setTenants] = useState([]);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedTenantLedger, setSelectedTenantLedger] = useState('');
  const [tenantLedgerData, setTenantLedgerData] = useState(null);

  // Modals States
  const [activeModal, setActiveModal] = useState(null); // 'payment', 'adjustment', 'credit', 'generate'
  const [targetInvoiceId, setTargetInvoiceId] = useState(null);

  // Form Fields
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('E-Transfer');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjType, setAdjType] = useState('Late Fee');
  const [adjReason, setAdjReason] = useState('');
  const [credAmount, setCredAmount] = useState('');
  const [credReason, setCredReason] = useState('');
  
  const [genLeaseId, setGenLeaseId] = useState('');
  const [genAmount, setGenAmount] = useState('');
  const [genDueDate, setGenDueDate] = useState('');

  const loadData = () => {
    try {
      setLoading(true);
      const invList = invoiceService.getAll();
      const rawPayments = localStorage.getItem('mock_payments');
      const payList = rawPayments ? JSON.parse(rawPayments) : [];
      
      setInvoices(invList);
      setPayments(payList);

      // Business services call (Do NOT calculate inside components!)
      setMetrics(collectionAnalyticsService.getMetrics());
      setAging(agingService.getAgingReport());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPropertiesAndLeases = async () => {
    try {
      const [propRes, leaseRes, tenantRes] = await Promise.all([
        api.get('/api/admin/properties'),
        api.get('/api/admin/leases'),
        api.get('/api/admin/tenants')
      ]);
      setBuildings(propRes.data?.data || propRes.data || []);
      setLeases(leaseRes.data?.data || leaseRes.data || []);
      setTenants(tenantRes.data?.data || tenantRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    loadPropertiesAndLeases();
  }, []);

  useEffect(() => {
    const handleCompanyChange = () => {
      loadData();
      loadPropertiesAndLeases();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  useEffect(() => {
    if (selectedTenantLedger) {
      setTenantLedgerData(ledgerService.getLedger(selectedTenantLedger));
    } else {
      setTenantLedgerData(null);
    }
  }, [selectedTenantLedger, invoices, payments]);

  // Filters logic
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      (inv.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.invoiceNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.unitNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchesBuilding = !selectedBuilding || inv.propertyId === parseInt(selectedBuilding);
    const matchesStatus = !selectedStatus || inv.status === selectedStatus;
    const matchesMethod = !selectedPaymentMethod || inv.paymentsList?.some(p => p.paymentMethod === selectedPaymentMethod);
    return matchesSearch && matchesBuilding && matchesStatus && matchesMethod;
  });

  // Modal handlers
  const openModal = (type, invoiceId = null) => {
    setTargetInvoiceId(invoiceId);
    setActiveModal(type);

    // Populate defaults
    if (invoiceId) {
      const inv = invoices.find(i => i.id === invoiceId);
      if (inv) {
        setPayAmount(inv.outstandingBalance || '');
        setAdjAmount('');
        setCredAmount('');
      }
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setTargetInvoiceId(null);
  };

  // Actions trigger
  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!payAmount || parseFloat(payAmount) <= 0) return;
    paymentService.record(targetInvoiceId, payAmount, payMethod);
    closeModal();
    loadData();
  };

  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    if (!adjAmount || parseFloat(adjAmount) === 0) return;
    invoiceService.addAdjustment(targetInvoiceId, adjAmount, adjType, adjReason);
    closeModal();
    loadData();
  };

  const handleCreditSubmit = (e) => {
    e.preventDefault();
    if (!credAmount || parseFloat(credAmount) <= 0) return;
    invoiceService.addCredit(targetInvoiceId, credAmount, credReason);
    closeModal();
    loadData();
  };

  const handleGenerateInvoiceSubmit = (e) => {
    e.preventDefault();
    if (!genLeaseId || !genAmount || !genDueDate) return;
    invoiceService.generate(genLeaseId, genAmount, genDueDate);
    closeModal();
    loadData();
  };

  const handleDuplicate = (id) => {
    invoiceService.duplicate(id);
    loadData();
  };

  const handleMarkSent = (id) => {
    invoiceService.markSent(id);
    loadData();
  };

  const handleEmail = (id) => {
    invoiceService.emailInvoice(id);
    alert('Mock invoice email dispatched successfully to tenant.');
    loadData();
  };

  const handleDownload = (id) => {
    invoiceService.emailInvoice(id);
    alert('Mock invoice PDF downloaded successfully.');
    loadData();
  };

  const handleRegenerate = (id) => {
    invoiceService.regenerate(id);
    loadData();
  };

  return (
    <MainLayout title="Rent Collection & Accounts Receivable">
      <div className="flex flex-col gap-6">

        {/* Tab Selection Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center bg-white p-4 rounded-[22px] border border-slate-200 shadow-sm gap-3">
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: TrendingUp },
              { id: 'invoices', label: 'Rent Invoices Grid', icon: ClipboardList },
              { id: 'ledger', label: 'Tenant Ledgers', icon: FileText },
              { id: 'aging', label: 'Accounts Aging', icon: CreditCard }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'secondary'}
                onClick={() => setActiveTab(tab.id)}
                className="text-xs font-bold justify-center"
              >
                <tab.icon size={16} className="mr-1.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </Button>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={() => openModal('generate')}
            className="text-xs font-bold justify-center lg:self-auto self-stretch"
          >
            <Plus size={16} className="mr-1.5" />
            Generate Invoice
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Overview Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-6">
                <CollectionKPICards metrics={metrics} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <OutstandingBalanceWidget aging={aging} />
                  <HighestOutstandingWidget aging={aging} />
                  <CollectionStatusChart invoices={invoices} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <RecentPaymentsWidget payments={payments} invoices={invoices} />
                  </div>
                  <Card className="bg-slate-900 text-white rounded-[22px] shadow-lg flex flex-col justify-between h-fit">
                    <div>
                      <h3 className="text-base font-black tracking-tight mb-2">AR Collection Quick Actions</h3>
                      <p className="text-xs text-slate-400 font-medium">Instantly generate cycles or adjust balances</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button onClick={() => openModal('generate')} className="w-full text-xs bg-indigo-600 text-white border-0 hover:bg-indigo-700">Gen Invoice</Button>
                      <Button onClick={() => { setActiveTab('invoices'); }} variant="secondary" className="w-full text-xs text-slate-800 bg-white">View Ledger</Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="flex flex-col gap-6">
                {/* Search & Filters */}
                <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search invoice, unit, or tenant..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <select
                      value={selectedBuilding}
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    >
                      <option value="">All Buildings</option>
                      {buildings.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    >
                      <option value="">All Statuses</option>
                      {Object.keys(COLLECTION_STATUSES).map(k => (
                        <option key={k} value={COLLECTION_STATUSES[k].label}>{COLLECTION_STATUSES[k].label}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => { setSearch(''); setSelectedBuilding(''); setSelectedStatus(''); setSelectedPaymentMethod(''); }}
                    className="w-full text-xs font-bold rounded-2xl h-11"
                  >
                    Reset Filters
                  </Button>
                </div>

                <InvoiceTable
                  invoices={filteredInvoices}
                  onView={(id) => {
                    const inv = invoices.find(i => i.id === id);
                    if (inv) {
                      setSelectedTenantLedger(inv.tenantId);
                      setActiveTab('ledger');
                    }
                  }}
                  onDuplicate={handleDuplicate}
                  onMarkSent={handleMarkSent}
                  onEmail={handleEmail}
                  onDownload={handleDownload}
                  onRecordPayment={(id) => openModal('payment', id)}
                  onAddAdjustment={(id) => openModal('adjustment', id)}
                  onAddCredit={(id) => openModal('credit', id)}
                  onRegenerate={handleRegenerate}
                />
              </div>
            )}

            {/* Tenant Ledgers Tab */}
            {activeTab === 'ledger' && (
              <div className="flex flex-col gap-6">
                <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="w-full md:w-1/3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Tenant Ledger Statement</label>
                    <select
                      value={selectedTenantLedger}
                      onChange={(e) => setSelectedTenantLedger(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    >
                      <option value="">-- Choose Tenant --</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedTenantLedger && (
                    <Button
                      variant="secondary"
                      onClick={() => window.print()}
                      className="text-xs font-bold rounded-2xl"
                    >
                      Print Statement
                    </Button>
                  )}
                </div>

                {selectedTenantLedger ? (
                  tenantLedgerData && <TenantLedgerCard ledger={tenantLedgerData} />
                ) : (
                  <div className="bg-white p-12 text-center text-slate-400 rounded-[22px] border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium">Please select a tenant from the dropdown above to view their double-entry accounting ledger.</p>
                  </div>
                )}
              </div>
            )}

            {/* Aging Reports Tab */}
            {activeTab === 'aging' && (
              <div className="flex flex-col gap-6">
                <OutstandingBalanceWidget aging={aging} />
              </div>
            )}
          </>
        )}

      </div>

      {/* Action Modals */}
      {activeModal === 'payment' && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[26px] p-6 max-w-md w-full border border-slate-100 shadow-2xl relative">
            <button onClick={closeModal} className="absolute right-6 top-6 p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-4">Record Rent Payment</h3>
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Payment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="E-Transfer">E-Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <Button onClick={closeModal} variant="secondary" className="flex-1 text-xs font-bold">Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs font-bold">Post Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'adjustment' && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[26px] p-6 max-w-md w-full border border-slate-100 shadow-2xl relative">
            <button onClick={closeModal} className="absolute right-6 top-6 p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-4">Add Late Fee / Adjustment</h3>
            <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Adjustment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50 or -50 for waiver"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Adjustment Type</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="Late Fee">Late Fee</option>
                  <option value="Maintenance Credit">Fee Waiver</option>
                  <option value="Other Adjustment">Other Adjustment</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reason / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. grace period overdue"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button onClick={closeModal} variant="secondary" className="flex-1 text-xs font-bold">Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs font-bold">Post Adjustment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'credit' && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[26px] p-6 max-w-md w-full border border-slate-100 shadow-2xl relative">
            <button onClick={closeModal} className="absolute right-6 top-6 p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-4">Apply Credit Balance</h3>
            <form onSubmit={handleCreditSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Credit Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={credAmount}
                  onChange={(e) => setCredAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reason / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Overpayment from last month"
                  value={credReason}
                  onChange={(e) => setCredReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button onClick={closeModal} variant="secondary" className="flex-1 text-xs font-bold">Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs font-bold">Apply Credit</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'generate' && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[26px] p-6 max-w-md w-full border border-slate-100 shadow-2xl relative">
            <button onClick={closeModal} className="absolute right-6 top-6 p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-4">Generate Rent Invoice</h3>
            <form onSubmit={handleGenerateInvoiceSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Lease Agreement</label>
                <select
                  required
                  value={genLeaseId}
                  onChange={(e) => setGenLeaseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="">-- Choose Lease --</option>
                  {leases.map(l => (
                    <option key={l.id} value={l.id}>{l.tenantName} - {l.propertyName} ({l.unitNumber})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Invoice Due Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={genAmount}
                  onChange={(e) => setGenAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={genDueDate}
                  onChange={(e) => setGenDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button onClick={closeModal} variant="secondary" className="flex-1 text-xs font-bold">Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs font-bold">Generate Invoice</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </MainLayout>
  );
};
