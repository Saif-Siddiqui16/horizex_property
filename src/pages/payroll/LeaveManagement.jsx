import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, Calendar, FileText, Check, X, Plus } from 'lucide-react';
import leaveService from '../../services/leaveService';
import employeeService from '../../services/employeeService';
import permissionService from '../../services/permissionService';
import LeaveCalendar from '../../components/payroll/LeaveCalendar';

export const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'calendar'
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    leaveType: ''
  });

  // Modal States
  const [requestModal, setRequestModal] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Pending'
  });

  const loadData = () => {
    const compId = localStorage.getItem('global_selected_company_id') || '';
    const list = leaveService.getAll({ ...filters, companyId: compId });
    setLeaves(list);
    setEmployees(employeeService.getAll({ companyId: compId }));
  };

  useEffect(() => {
    loadData();
    const handleCompanyChange = () => loadData();
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [filters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.startDate || !form.endDate) {
      return alert('Please fill in all required fields');
    }
    try {
      leaveService.create(form);
      setRequestModal(false);
      resetForm();
      loadData();
      alert('Leave request submitted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = (id) => {
    leaveService.updateStatus(id, 'Approved');
    loadData();
  };

  const handleReject = (id) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason !== null) {
      leaveService.updateStatus(id, 'Rejected', reason);
      loadData();
    }
  };

  const resetForm = () => {
    setForm({
      employeeId: '',
      leaveType: 'Annual',
      startDate: '',
      endDate: '',
      reason: '',
      status: 'Pending'
    });
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'Annual': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Sick': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Emergency': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Casual': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Maternity': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Paternity': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Unpaid': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const canManage = permissionService.canManageLeaves();

  return (
    <MainLayout title="Leave Planner">
      <div className="flex flex-col gap-6">
        
        {/* Header Options */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 bg-white border border-slate-100 rounded-[22px] p-5 shadow-card">
          <div className="flex items-center justify-between w-full xl:w-auto">
            {/* Roster Tabs */}
            <div className="flex bg-slate-50 border border-slate-100 rounded-2xl p-1 gap-1 shrink-0">
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                List View
              </button>
              <button 
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Calendar View
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 focus-within:border-blue-100 flex-1 sm:flex-none sm:w-44 md:w-56 transition-all">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                value={filters.search}
                onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
                className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder-slate-400 font-medium"
              />
            </div>

            <select 
              value={filters.leaveType} 
              onChange={(e) => setFilters(p => ({ ...p, leaveType: e.target.value }))}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none font-semibold focus:border-blue-100 shrink-0"
            >
              <option value="">All Types</option>
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Emergency">Emergency</option>
              <option value="Casual">Casual</option>
              <option value="Maternity">Maternity</option>
              <option value="Paternity">Paternity</option>
              <option value="Unpaid">Unpaid</option>
            </select>

            <select 
              value={filters.status} 
              onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none font-semibold focus:border-blue-100 shrink-0"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {canManage && (
              <button 
                onClick={() => { resetForm(); setRequestModal(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg border-none flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ml-auto sm:ml-0"
              >
                <Plus size={14} /> Request Leave
              </button>
            )}
          </div>
        </div>

        {activeTab === 'calendar' ? (
          <LeaveCalendar leaves={leaves} />
        ) : (
          /* List View Table */
          <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Department</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Leave Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Period Range</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Absence Justification</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  {canManage && (
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 text-sm">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? "7" : "6"} className="p-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl text-slate-300">∅</span>
                        <p className="font-semibold text-slate-500">No leave requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaves.map((lv) => (
                    <tr key={lv.id} className="hover:bg-slate-50/20 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{lv.employeeName}</span>
                          <span className="text-xs text-slate-400">{lv.employeeNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-500 whitespace-nowrap">
                        {lv.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getLeaveTypeColor(lv.leaveType)}`}>
                          {lv.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600 font-mono text-xs whitespace-nowrap">
                        {lv.startDate} to {lv.endDate}
                      </td>
                      <td className="px-6 py-4 italic text-slate-500 max-w-xs truncate whitespace-nowrap">
                        "{lv.reason || 'No description'}"
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide border uppercase ${getStatusColor(lv.status)}`}>
                          {lv.status}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {lv.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => handleApprove(lv.id)}
                                className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center border border-emerald-100 transition-all cursor-pointer"
                                title="Approve Leave"
                              >
                                <Check size={14} />
                              </button>
                              <button 
                                onClick={() => handleReject(lv.id)}
                                className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center border border-rose-100 transition-all cursor-pointer"
                                title="Reject Leave"
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
        )}

      </div>

      {/* REQUEST LEAVE MODAL */}
      {requestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Submit Leave Request</h3>
              <button type="button" onClick={() => setRequestModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Type</label>
              <select 
                value={form.leaveType} 
                onChange={(e) => setForm(p => ({ ...p, leaveType: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                required
              >
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Emergency">Emergency</option>
                <option value="Casual">Casual</option>
                <option value="Maternity">Maternity</option>
                <option value="Paternity">Paternity</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                <input 
                  type="date" 
                  value={form.startDate} 
                  onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                <input 
                  type="date" 
                  value={form.endDate} 
                  onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Notes</label>
              <textarea 
                value={form.reason} 
                onChange={(e) => setForm(p => ({ ...p, reason: e.target.value }))}
                rows={2}
                placeholder="Absence explanation details..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium resize-none"
              />
            </div>

            <button type="submit" className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer">
              Register Leave Request
            </button>
          </form>
        </div>
      )}

    </MainLayout>
  );
};

export default LeaveManagement;
