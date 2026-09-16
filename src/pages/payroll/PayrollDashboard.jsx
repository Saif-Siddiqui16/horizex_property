import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Card } from '../../components/Card';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, UserPlus, FilePlus2, CheckCircle, DollarSign, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import payrollAnalyticsService from '../../services/payrollAnalyticsService';
import attendanceService from '../../services/attendanceService';
import leaveService from '../../services/leaveService';
import payrollSettingsService from '../../services/payrollSettingsService';
import employeeService from '../../services/employeeService';
import payrollTimelineService from '../../services/payrollTimelineService';
import { PayrollKPICards } from '../../components/payroll/PayrollKPICards';
import { PendingLeaveWidget } from '../../components/payroll/PendingLeaveWidget';
import { UpcomingPayrollWidget } from '../../components/payroll/UpcomingPayrollWidget';

export const PayrollDashboard = () => {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState(localStorage.getItem('global_selected_company_id') || '');
  const [kpis, setKpis] = useState({});
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingCorrections, setPendingCorrections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [settings, setSettings] = useState({});
  const [timeline, setTimeline] = useState([]);
  
  // Quick Clock Modal State
  const [clockModal, setClockModal] = useState(false);
  const [selectedEmpClock, setSelectedEmpClock] = useState('');
  const [clockMessage, setClockMessage] = useState('');

  // Submit Leave Modal State
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ employeeId: '', leaveType: 'Annual', startDate: '', endDate: '', reason: '' });

  const loadData = () => {
    const compId = localStorage.getItem('global_selected_company_id') || '';
    setCompanyId(compId);

    const stats = payrollAnalyticsService.getKPIs(compId);
    setKpis(stats);

    const leaves = leaveService.getAll({ companyId: compId, status: 'Pending' });
    setPendingLeaves(leaves);

    const corrections = attendanceService.getCorrections({ companyId: compId, status: 'Pending' });
    setPendingCorrections(corrections);

    const emps = employeeService.getAll({ companyId: compId });
    setEmployees(emps);

    const config = payrollSettingsService.getSettings();
    setSettings(config);

    const events = payrollTimelineService.getAll({ companyId: compId }).slice(0, 5);
    setTimeline(events);
  };

  useEffect(() => {
    loadData();
    const handleCompanyChange = () => loadData();
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  const handleApproveLeave = (id) => {
    leaveService.updateStatus(id, 'Approved');
    loadData();
  };

  const handleRejectLeave = (id, reason) => {
    leaveService.updateStatus(id, 'Rejected', reason);
    loadData();
  };

  const handleApproveCorrection = (id) => {
    try {
      attendanceService.approveCorrection(id);
      loadData();
      alert('Correction request approved.');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRejectCorrection = (id) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason !== null) {
      try {
        attendanceService.rejectCorrection(id, reason);
        loadData();
        alert('Correction request rejected.');
      } catch (e) {
        alert(e.message);
      }
    }
  };

  // Clock Actions
  const handleClockIn = () => {
    if (!selectedEmpClock) return alert('Select an employee first');
    try {
      attendanceService.clockIn(selectedEmpClock);
      setClockMessage('Successfully clocked in!');
      setTimeout(() => {
        setClockMessage('');
        setClockModal(false);
        loadData();
      }, 1500);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleClockOut = () => {
    if (!selectedEmpClock) return alert('Select an employee first');
    try {
      attendanceService.clockOut(selectedEmpClock);
      setClockMessage('Successfully clocked out!');
      setTimeout(() => {
        setClockMessage('');
        setClockModal(false);
        loadData();
      }, 1500);
    } catch (e) {
      alert(e.message);
    }
  };

  // Submit Leave
  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveForm.employeeId || !leaveForm.startDate || !leaveForm.endDate) {
      return alert('Please fill in all required fields');
    }
    try {
      leaveService.create(leaveForm);
      setLeaveModal(false);
      setLeaveForm({ employeeId: '', leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
      loadData();
      alert('Leave request submitted successfully.');
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <MainLayout title="Payroll Dashboard">
      <div className="flex flex-col gap-8">
        
        {/* KPI Cards Grid */}
        <PayrollKPICards kpis={kpis} />

        {/* Quick Actions Panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card">
          <h4 className="font-bold text-slate-800 text-sm mb-4">Quick Management Actions</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <button 
              onClick={() => navigate('/payroll/employees', { state: { openAddModal: true } })}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-blue-50/50 hover:border-blue-100 text-slate-700 hover:text-blue-600 transition-all gap-2 cursor-pointer font-bold text-xs"
            >
              <UserPlus size={18} />
              Add Employee
            </button>
            <button 
              onClick={() => setClockModal(true)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-emerald-50/50 hover:border-emerald-100 text-slate-700 hover:text-emerald-600 transition-all gap-2 cursor-pointer font-bold text-xs"
            >
              <Clock size={18} />
              Record Attendance
            </button>
            <button 
              onClick={() => setLeaveModal(true)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-amber-50/50 hover:border-amber-100 text-slate-700 hover:text-amber-600 transition-all gap-2 cursor-pointer font-bold text-xs"
            >
              <FilePlus2 size={18} />
              Submit Leave
            </button>
            <button 
              onClick={() => navigate('/payroll/leaves')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-indigo-50/50 hover:border-indigo-100 text-slate-700 hover:text-indigo-600 transition-all gap-2 cursor-pointer font-bold text-xs"
            >
              <CheckCircle size={18} />
              Approve Leaves
            </button>
            <button 
              onClick={() => navigate('/payroll/run')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-violet-50/50 hover:border-violet-100 text-slate-700 hover:text-violet-600 transition-all gap-2 cursor-pointer font-bold text-xs"
            >
              <DollarSign size={18} />
              Process Payroll
            </button>
            <button 
              onClick={() => navigate('/payroll/employees')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-sky-50/50 hover:border-sky-100 text-slate-700 hover:text-sky-600 transition-all gap-2 cursor-pointer font-bold text-xs"
            >
              <RefreshCw size={18} />
              Update Salary
            </button>
          </div>
        </div>

        {/* Dashboard Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Widgets Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Attendance Corrections Widget (Workflow) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose-500" />
                  Attendance Correction Approvals
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-rose-50 text-rose-600 border border-rose-100 uppercase">
                  {pendingCorrections.length} Correction Alerts
                </span>
              </div>

              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
                {pendingCorrections.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1">
                    <span className="text-lg">✓</span>
                    <p className="font-semibold text-slate-500">All clock logs correct & resolved</p>
                  </div>
                ) : (
                  pendingCorrections.map((corr) => (
                    <div 
                      key={corr.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/20 hover:bg-slate-50/50 transition-all gap-4"
                    >
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-bold text-slate-800">{corr.employeeName}</span>
                        <span className="text-slate-400 font-mono">Date: {corr.date}</span>
                        <div className="flex gap-4 text-slate-500 font-mono mt-1 bg-slate-100/50 px-2 py-1 rounded">
                          <span>Req In: {new Date(corr.requestedClockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>Req Out: {corr.requestedClockOut ? new Date(corr.requestedClockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                        </div>
                        <span className="italic text-slate-500 mt-1">"Reason: {corr.reason}"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleApproveCorrection(corr.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all border border-emerald-100"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectCorrection(corr.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all border border-rose-100"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reusable Leave Requests Widget */}
            <PendingLeaveWidget 
              requests={pendingLeaves} 
              onApprove={handleApproveLeave} 
              onReject={handleRejectLeave} 
            />

          </div>

          {/* Side Column widgets */}
          <div className="flex flex-col gap-8">
            
            {/* Reusable Upcoming Payroll Widget */}
            <UpcomingPayrollWidget employees={employees} settings={settings} />

            {/* Timeline Mini Widget */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-card flex flex-col gap-6">
              <h4 className="font-bold text-indigo-300 text-xs uppercase tracking-wider">Payroll Activity Logs</h4>
              <div className="flex flex-col gap-4">
                {timeline.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs p-6">
                    No recent events logged
                  </div>
                ) : (
                  timeline.map(evt => (
                    <div key={evt.id} className="flex gap-3 text-xs leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-200">{evt.eventType}</span>
                        <p className="text-slate-400 text-[11px] mt-0.5">{evt.description}</p>
                        <span className="text-[10px] text-slate-500 mt-0.5">{new Date(evt.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Clock In/Out Quick Action Modal */}
      {clockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-6 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Roster Attendance Override</h3>
              <button onClick={() => setClockModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Employee</label>
              <select 
                value={selectedEmpClock} 
                onChange={(e) => setSelectedEmpClock(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
              >
                <option value="">Select Employee...</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeNo})</option>
                ))}
              </select>
            </div>

            {clockMessage && (
              <div className="p-3 text-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-100 animate-fade-in">
                {clockMessage}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button 
                onClick={handleClockIn}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl border-none shadow-lg shadow-blue-600/10 transition-all cursor-pointer"
              >
                Clock In Today
              </button>
              <button 
                onClick={handleClockOut}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl border-none shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
              >
                Clock Out Today
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Leave Quick Action Modal */}
      {leaveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLeaveSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Submit New Leave Request</h3>
              <button type="button" onClick={() => setLeaveModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Employee</label>
              <select 
                value={leaveForm.employeeId} 
                onChange={(e) => setLeaveForm(p => ({ ...p, employeeId: e.target.value }))}
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
                value={leaveForm.leaveType} 
                onChange={(e) => setLeaveForm(p => ({ ...p, leaveType: e.target.value }))}
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
                  value={leaveForm.startDate} 
                  onChange={(e) => setLeaveForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                <input 
                  type="date"
                  value={leaveForm.endDate} 
                  onChange={(e) => setLeaveForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Notes</label>
              <textarea 
                value={leaveForm.reason} 
                onChange={(e) => setLeaveForm(p => ({ ...p, reason: e.target.value }))}
                rows={2}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium resize-none"
                placeholder="Reason for requesting absence..."
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer transition-all"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

    </MainLayout>
  );
};

export default PayrollDashboard;
