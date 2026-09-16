import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, Calendar, Clock, Edit3, ShieldAlert } from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';
import permissionService from '../../services/permissionService';
import AttendanceTable from '../../components/payroll/AttendanceTable';
import AttendanceTimeline from '../../components/payroll/AttendanceTimeline';

export const AttendanceManagement = () => {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    date: ''
  });

  // Modal States
  const [overrideModal, setOverrideModal] = useState(false);
  const [correctionModal, setCorrectionModal] = useState(false);
  
  const [overrideForm, setOverrideForm] = useState({
    clockIn: '', clockOut: '', breakStart: '', breakEnd: '', status: 'Present'
  });
  
  const [correctionForm, setCorrectionForm] = useState({
    clockIn: '', clockOut: '', breakStart: '', breakEnd: '', reason: ''
  });

  const loadData = () => {
    const compId = localStorage.getItem('global_selected_company_id') || '';
    const items = attendanceService.getAll({ ...filters, companyId: compId });
    setLogs(items);
    
    // Auto-select first log if none selected
    if (items.length > 0 && !selectedLog) {
      setSelectedLog(items[0]);
    } else if (selectedLog) {
      // Refresh selected log
      const updated = items.find(i => i.id === selectedLog.id);
      if (updated) setSelectedLog(updated);
    }

    setEmployees(employeeService.getAll({ companyId: compId }));
    setDepartments(departmentService.getAll());
  };

  useEffect(() => {
    loadData();
    const handleCompanyChange = () => {
      setSelectedLog(null);
      loadData();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [filters]);

  const handleOverrideOpen = (log) => {
    setSelectedLog(log);
    const formatIso = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : '';
    setOverrideForm({
      clockIn: formatIso(log.clockIn),
      clockOut: formatIso(log.clockOut),
      breakStart: formatIso(log.breakStart),
      breakEnd: formatIso(log.breakEnd),
      status: log.status
    });
    setOverrideModal(true);
  };

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    if (!selectedLog) return;
    
    const formatBack = (val) => val ? new Date(val).toISOString() : null;
    
    attendanceService.updateAttendance(selectedLog.id, {
      clockIn: formatBack(overrideForm.clockIn),
      clockOut: formatBack(overrideForm.clockOut),
      breakStart: formatBack(overrideForm.breakStart),
      breakEnd: formatBack(overrideForm.breakEnd),
      status: overrideForm.status
    });
    
    setOverrideModal(false);
    loadData();
    alert('Attendance details updated successfully.');
  };

  const handleCorrectionOpen = (log) => {
    setSelectedLog(log);
    const formatIso = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : '';
    setCorrectionForm({
      clockIn: formatIso(log.clockIn),
      clockOut: formatIso(log.clockOut),
      breakStart: formatIso(log.breakStart),
      breakEnd: formatIso(log.breakEnd),
      reason: ''
    });
    setCorrectionModal(true);
  };

  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    if (!selectedLog) return;
    if (!correctionForm.reason) return alert('Please input correction justification reason');

    const formatBack = (val) => val ? new Date(val).toISOString() : null;

    attendanceService.submitCorrection(selectedLog.id, {
      clockIn: formatBack(correctionForm.clockIn),
      clockOut: formatBack(correctionForm.clockOut),
      breakStart: formatBack(correctionForm.breakStart),
      breakEnd: formatBack(correctionForm.breakEnd),
      reason: correctionForm.reason
    });

    setCorrectionModal(false);
    loadData();
    alert('Correction request submitted for approval.');
  };

  const canManage = permissionService.canManageAttendance();

  return (
    <MainLayout title="Attendance Logs">
      <div className="flex flex-col gap-8">
        
        {/* Filters Header bar */}
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
            <input 
              type="date" 
              value={filters.date}
              onChange={(e) => setFilters(p => ({ ...p, date: e.target.value }))}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none font-semibold focus:border-blue-100"
            />

            <select 
              value={filters.department} 
              onChange={(e) => setFilters(p => ({ ...p, department: e.target.value }))}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none font-semibold focus:border-blue-100"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>

            <select 
              value={filters.status} 
              onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none font-semibold focus:border-blue-100"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Work From Home">WFH</option>
              <option value="Holiday">Holiday</option>
              <option value="Weekend">Weekend</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Logs List Table */}
          <div className="lg:col-span-2">
            <AttendanceTable 
              logs={logs}
              onEdit={canManage ? handleOverrideOpen : null}
              onCorrect={handleCorrectionOpen}
              onSelect={setSelectedLog}
            />
          </div>

          {/* Visual Day Activity Timeline */}
          <div className="flex flex-col gap-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-card">
            <div className="border-b border-slate-50 pb-4 flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Visualizer</span>
              <h4 className="font-bold text-slate-800 text-sm">
                {selectedLog ? selectedLog.employeeName : 'Select staff member'}
              </h4>
              {selectedLog && (
                <span className="text-xs text-slate-400 font-mono">Date: {selectedLog.date}</span>
              )}
            </div>
            
            <AttendanceTimeline log={selectedLog} />
          </div>
        </div>

      </div>

      {/* OVERRIDE ATTENDANCE MODAL */}
      {overrideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleOverrideSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Override Attendance Log</h3>
              <button type="button" onClick={() => setOverrideModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clock In Time</label>
              <input 
                type="datetime-local" 
                value={overrideForm.clockIn} 
                onChange={(e) => setOverrideForm(p => ({ ...p, clockIn: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clock Out Time</label>
              <input 
                type="datetime-local" 
                value={overrideForm.clockOut} 
                onChange={(e) => setOverrideForm(p => ({ ...p, clockOut: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Break Start</label>
                <input 
                  type="datetime-local" 
                  value={overrideForm.breakStart} 
                  onChange={(e) => setOverrideForm(p => ({ ...p, breakStart: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Break End</label>
                <input 
                  type="datetime-local" 
                  value={overrideForm.breakEnd} 
                  onChange={(e) => setOverrideForm(p => ({ ...p, breakEnd: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Status</label>
              <select 
                value={overrideForm.status} 
                onChange={(e) => setOverrideForm(p => ({ ...p, status: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Work From Home">Work From Home</option>
                <option value="Absent">Absent</option>
                <option value="Holiday">Holiday</option>
                <option value="Weekend">Weekend</option>
              </select>
            </div>

            <button type="submit" className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none cursor-pointer">
              Save Attendance Record
            </button>
          </form>
        </div>
      )}

      {/* CORRECTION REQUEST MODAL */}
      {correctionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCorrectionSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Submit Clock Correction</h3>
              <button type="button" onClick={() => setCorrectionModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested Clock In</label>
              <input 
                type="datetime-local" 
                value={correctionForm.clockIn} 
                onChange={(e) => setCorrectionForm(p => ({ ...p, clockIn: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested Clock Out</label>
              <input 
                type="datetime-local" 
                value={correctionForm.clockOut} 
                onChange={(e) => setCorrectionForm(p => ({ ...p, clockOut: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correction Justification Reason</label>
              <textarea 
                value={correctionForm.reason} 
                onChange={(e) => setCorrectionForm(p => ({ ...p, reason: e.target.value }))}
                rows={2}
                placeholder="E.g. keycard scanner didn't record clock-in..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium resize-none"
                required
              />
            </div>

            <button type="submit" className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl border-none shadow-lg cursor-pointer">
              Submit Request for Review
            </button>
          </form>
        </div>
      )}

    </MainLayout>
  );
};

export default AttendanceManagement;
