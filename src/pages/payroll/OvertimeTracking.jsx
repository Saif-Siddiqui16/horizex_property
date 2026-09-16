import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, Calendar, FileText, Check, X, Plus, Clock, Zap } from 'lucide-react';
import overtimeService from '../../services/overtimeService';
import employeeService from '../../services/employeeService';
import permissionService from '../../services/permissionService';

export const OvertimeTracking = () => {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [metrics, setMetrics] = useState({ approved: 0, pending: 0, rejected: 0, cost: 0 });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  // Modal States
  const [logModal, setLogModal] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    hours: '2',
    status: 'Pending'
  });

  const loadData = () => {
    const compId = localStorage.getItem('global_selected_company_id') || '';
    const list = overtimeService.getAll({ ...filters, companyId: compId });
    setLogs(list);
    setEmployees(employeeService.getAll({ companyId: compId }));

    // Compute metrics
    const rawList = overtimeService.getAll({ companyId: compId });
    const approved = rawList.filter(l => l.status === 'Approved').reduce((s, l) => s + l.hours, 0);
    const pending = rawList.filter(l => l.status === 'Pending').reduce((s, l) => s + l.hours, 0);
    const rejected = rawList.filter(l => l.status === 'Rejected').reduce((s, l) => s + l.hours, 0);
    const cost = rawList.filter(l => l.status === 'Approved').reduce((s, l) => s + l.cost, 0);

    setMetrics({ approved, pending, rejected, cost });
  };

  useEffect(() => {
    loadData();
    const handleCompanyChange = () => loadData();
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [filters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.hours || !form.date) {
      return alert('Please fill in all required fields');
    }
    try {
      overtimeService.create(form);
      setLogModal(false);
      resetForm();
      loadData();
      alert('Overtime log logged successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = (id) => {
    overtimeService.updateStatus(id, 'Approved');
    loadData();
  };

  const handleReject = (id) => {
    overtimeService.updateStatus(id, 'Rejected');
    loadData();
  };

  const resetForm = () => {
    setForm({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      hours: '2',
      status: 'Pending'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getPaidColor = (paidStatus) => {
    switch (paidStatus) {
      case 'Paid': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const canManage = permissionService.canManageOvertime();

  return (
    <MainLayout title="Overtime Tracking">
      <div className="flex flex-col gap-8">
        
        {/* KPI metrics row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved Hours</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight">{metrics.approved} hrs</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Hours</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight">{metrics.pending} hrs</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejected Hours</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight">{metrics.rejected} hrs</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved Cost</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight">${metrics.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center">
              <Zap size={20} />
            </div>
          </div>
        </div>

        {/* Filter Operations */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 w-full md:max-w-xs focus-within:border-blue-200 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={filters.search}
              onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
              className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder-slate-400 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={filters.status} 
              onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none font-semibold focus:border-blue-100"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {canManage && (
              <button 
                onClick={() => { resetForm(); setLogModal(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg border-none flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Log Overtime
              </button>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Logged</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hours</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hourly Rate</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Cost</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                {canManage && (
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? "9" : "8"} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-2xl text-slate-300">∅</span>
                      <p className="font-semibold text-slate-500">No overtime logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/20 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{log.employeeName}</span>
                        <span className="text-xs text-slate-400">{log.employeeNo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">
                      {log.department}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600 font-mono text-xs">
                      {log.date}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">
                      {log.hours} hrs
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      ${log.overtimeRate?.toFixed(2)}/hr
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      ${log.cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide border uppercase ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPaidColor(log.paidStatus)}`}>
                        {log.paidStatus}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        {log.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleApprove(log.id)}
                              className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center border border-emerald-100 transition-all cursor-pointer"
                              title="Approve Hours"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => handleReject(log.id)}
                              className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center border border-rose-100 transition-all cursor-pointer"
                              title="Reject Hours"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Resolved</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* LOG OVERTIME MODAL */}
      {logModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Log Overtime Hours</h3>
              <button type="button" onClick={() => setLogModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</label>
              <select 
                value={form.employeeId} 
                onChange={(e) => setForm(p => ({ ...p, employeeId: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                required
              >
                <option value="">Select Employee...</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeNo})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Worked</label>
              <input 
                type="date" 
                value={form.date} 
                onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overtime Hours Worked</label>
              <input 
                type="number" 
                step="0.5"
                value={form.hours} 
                onChange={(e) => setForm(p => ({ ...p, hours: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                required
              />
            </div>

            <button type="submit" className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer">
              Log Overtime Record
            </button>
          </form>
        </div>
      )}

    </MainLayout>
  );
};

export default OvertimeTracking;
