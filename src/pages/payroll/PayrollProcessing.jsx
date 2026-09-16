import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, DollarSign, Settings, Plus, Eye, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import payrollService from '../../services/payrollService';
import payrollSettingsService from '../../services/payrollSettingsService';
import permissionService from '../../services/permissionService';
import PayrollTable from '../../components/payroll/PayrollTable';
import PayslipCard from '../../components/payroll/PayslipCard';

export const PayrollProcessing = () => {
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('runs'); // 'runs' | 'settings'
  const [settings, setSettings] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    payrollMonth: ''
  });

  // Modal States
  const [runModal, setRunModal] = useState(false);
  const [runForm, setRunForm] = useState({
    payrollMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  const loadData = () => {
    const compId = localStorage.getItem('global_selected_company_id') || '';
    const list = payrollService.getAll({ ...filters, companyId: compId });
    setRecords(list);
    setSettings(payrollSettingsService.getSettings());
  };

  useEffect(() => {
    loadData();
    const handleCompanyChange = () => {
      setSelectedRecord(null);
      loadData();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [filters]);

  const handleRunSubmit = (e) => {
    e.preventDefault();
    const compId = localStorage.getItem('global_selected_company_id') || '';
    if (!compId) return alert('Please select a specific company using the Global Company Selector before generating payroll');

    try {
      payrollService.generatePayroll(
        compId,
        runForm.payrollMonth,
        runForm.periodStart,
        runForm.periodEnd
      );
      setRunModal(false);
      loadData();
      alert('Payroll run generated successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = (payrollNo, currentLevel) => {
    try {
      payrollService.approvePayroll(payrollNo, currentLevel);
      loadData();
      alert('Payroll run approved.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = (payrollNo, reason) => {
    try {
      payrollService.rejectPayroll(payrollNo, reason);
      loadData();
      alert('Payroll run rejected.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePay = (payrollNo) => {
    try {
      payrollService.markPaidPayroll(payrollNo);
      loadData();
      alert('Payroll run marked as paid. Bank/API payloads dispatched (mock).');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSettingsUpdate = (fields) => {
    payrollSettingsService.updateSettings(fields);
    setSettings(payrollSettingsService.getSettings());
    alert('Payroll settings updated successfully.');
  };

  const canManage = permissionService.canManagePayroll();

  // Get unique months for filter dropdown
  const uniqueMonths = Array.from(new Set(payrollService.getAll().map(r => r.payrollMonth)));

  return (
    <MainLayout title="Payroll Processing">
      <div className="flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-card">
          <div className="flex bg-slate-50 border border-slate-100 rounded-2xl p-1 gap-1">
            <button 
              onClick={() => { setSelectedRecord(null); setActiveTab('runs'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                activeTab === 'runs' && !selectedRecord ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Payroll Runs
            </button>
            {canManage && (
              <button 
                onClick={() => { setSelectedRecord(null); setActiveTab('settings'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Workflow Config
              </button>
            )}
          </div>

          {!selectedRecord && activeTab === 'runs' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 focus-within:border-blue-100 w-44 md:w-56 transition-all">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search run ID or staff..." 
                  value={filters.search}
                  onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
                  className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder-slate-400 font-medium"
                />
              </div>

              <select 
                value={filters.payrollMonth} 
                onChange={(e) => setFilters(p => ({ ...p, payrollMonth: e.target.value }))}
                className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none font-semibold focus:border-blue-100"
              >
                <option value="">All Cycles</option>
                {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              {canManage && (
                <button 
                  onClick={() => setRunModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg border-none flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Run Payroll
                </button>
              )}
            </div>
          )}
        </div>

        {/* Selected Payslip Detail view */}
        {selectedRecord ? (
          <PayslipCard record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        ) : activeTab === 'settings' ? (
          /* Workflow Configurations tab */
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card max-w-xl flex flex-col gap-6">
            <div className="flex flex-col gap-0.5 border-b border-slate-50 pb-4">
              <h4 className="font-bold text-slate-800 text-sm">Approval Workflow Configurator</h4>
              <p className="text-xs text-slate-400">Define the approval steps required before generating payslips and bank payout transfers.</p>
            </div>

            <div className="flex flex-col gap-5 text-xs text-slate-600">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Policy</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    type="button"
                    onClick={() => handleSettingsUpdate({ approvalWorkflowType: 'AutoApproval' })}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      settings.approvalWorkflowType === 'AutoApproval'
                        ? 'border-blue-200 bg-blue-50/20 text-slate-800'
                        : 'border-slate-100 bg-slate-50/30 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs">Auto Approval</span>
                    <span className="text-[10px] text-slate-400 font-medium leading-relaxed">Runs are auto-approved instantly on generation.</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleSettingsUpdate({ approvalWorkflowType: 'SingleApproval' })}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      settings.approvalWorkflowType === 'SingleApproval'
                        ? 'border-blue-200 bg-blue-50/20 text-slate-800'
                        : 'border-slate-100 bg-slate-50/30 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs">Single Level</span>
                    <span className="text-[10px] text-slate-400 font-medium leading-relaxed">Requires one admin approval before payment processing.</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleSettingsUpdate({ approvalWorkflowType: 'TwoLevelApproval' })}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      settings.approvalWorkflowType === 'TwoLevelApproval'
                        ? 'border-blue-200 bg-blue-50/20 text-slate-800'
                        : 'border-slate-100 bg-slate-50/30 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs">Two Level</span>
                    <span className="text-[10px] text-slate-400 font-medium leading-relaxed">Requires Level 1 and Level 2 approvals before payment.</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay Cycle Frequency</label>
                  <select 
                    value={settings.payCycle}
                    onChange={(e) => handleSettingsUpdate({ payCycle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-medium"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Biweekly">Biweekly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OT Multiplier</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.overtimeMultiplier}
                    onChange={(e) => handleSettingsUpdate({ overtimeMultiplier: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Payroll Runs Table */
          <PayrollTable 
            records={records}
            onApprove={handleApprove}
            onReject={handleReject}
            onPay={handlePay}
            onViewPayslip={setSelectedRecord}
            settings={settings}
            onUploadReceipt={loadData}
          />
        )}

      </div>

      {/* GENERATE RUN MODAL */}
      {runModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRunSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Initiate Payroll Run</h3>
              <button type="button" onClick={() => setRunModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Payroll Month</label>
              <input 
                type="month"
                value={runForm.payrollMonth} 
                onChange={(e) => setRunForm(p => ({ ...p, payrollMonth: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Start</label>
                <input 
                  type="date" 
                  value={runForm.periodStart} 
                  onChange={(e) => setRunForm(p => ({ ...p, periodStart: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period End</label>
                <input 
                  type="date" 
                  value={runForm.periodEnd} 
                  onChange={(e) => setRunForm(p => ({ ...p, periodEnd: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer">
              Process & Calculate Runs
            </button>
          </form>
        </div>
      )}

    </MainLayout>
  );
};

export default PayrollProcessing;
