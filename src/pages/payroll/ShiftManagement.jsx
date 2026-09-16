import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Plus, X, Calendar, Settings } from 'lucide-react';
import shiftService from '../../services/shiftService';
import employeeService from '../../services/employeeService';
import permissionService from '../../services/permissionService';
import ShiftCalendar from '../../components/payroll/ShiftCalendar';

export const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Modal States
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [rotationModal, setRotationModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  // Form States
  const [form, setForm] = useState({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    graceTime: '15',
    breakDuration: '60',
    weeklyOff: [0, 6], // Array of day indices
    rotation: 'Fixed Schedule'
  });

  const loadData = () => {
    const compId = localStorage.getItem('global_selected_company_id') || '';
    setShifts(shiftService.getAll());
    setEmployees(employeeService.getAll({ companyId: compId }));
  };

  useEffect(() => {
    loadData();
    const handleCompanyChange = () => loadData();
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    shiftService.create(form);
    setAddModal(false);
    resetForm();
    loadData();
    alert('New shift schedule created.');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedShift) return;
    shiftService.update(selectedShift.id, form);
    setEditModal(false);
    setSelectedShift(null);
    resetForm();
    loadData();
    alert('Shift settings updated.');
  };

  const openEdit = (sh) => {
    setSelectedShift(sh);
    setForm({
      name: sh.name,
      startTime: sh.startTime,
      endTime: sh.endTime,
      graceTime: String(sh.graceTime),
      breakDuration: String(sh.breakDuration),
      weeklyOff: sh.weeklyOff,
      rotation: sh.rotation
    });
    setEditModal(true);
  };

  const handleWeeklyOffToggle = (dayIndex) => {
    setForm(p => {
      const current = [...p.weeklyOff];
      const idx = current.indexOf(dayIndex);
      if (idx === -1) {
        current.push(dayIndex);
      } else {
        current.splice(idx, 1);
      }
      return { ...p, weeklyOff: current };
    });
  };

  const resetForm = () => {
    setForm({
      name: '',
      startTime: '09:00',
      endTime: '17:00',
      graceTime: '15',
      breakDuration: '60',
      weeklyOff: [0, 6],
      rotation: 'Fixed Schedule'
    });
  };

  const canManage = permissionService.canManageShifts();

  const days = [
    { label: 'S', index: 0, full: 'Sunday' },
    { label: 'M', index: 1, full: 'Monday' },
    { label: 'T', index: 2, full: 'Tuesday' },
    { label: 'W', index: 3, full: 'Wednesday' },
    { label: 'T', index: 4, full: 'Thursday' },
    { label: 'F', index: 5, full: 'Friday' },
    { label: 'S', index: 6, full: 'Saturday' }
  ];

  return (
    <MainLayout title="Shifts & Schedules">
      <div className="flex flex-col gap-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-white border border-slate-100 rounded-3xl p-6 shadow-card">
          <div className="flex flex-col gap-0.5">
            <h4 className="font-bold text-slate-800 text-sm">Shift Profiles</h4>
            <span className="text-xs text-slate-400">Configure corporate time brackets, grace parameters, and off days.</span>
          </div>
          {canManage && (
            <button 
              onClick={() => { resetForm(); setAddModal(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg border-none flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Define Shift
            </button>
          )}
        </div>

        {/* Calendar / Roster view */}
        <ShiftCalendar 
          shifts={shifts}
          employees={employees}
          onEdit={canManage ? openEdit : null}
          onRotate={() => setRotationModal(true)}
        />

      </div>

      {/* ADD SHIFT MODAL */}
      {addModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Define New Shift</h3>
              <button type="button" onClick={() => setAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Name</label>
              <input 
                type="text" 
                placeholder="E.g. Morning, Night, Afternoon"
                value={form.name} 
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                <input 
                  type="time" 
                  value={form.startTime} 
                  onChange={(e) => setForm(p => ({ ...p, startTime: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                <input 
                  type="time" 
                  value={form.endTime} 
                  onChange={(e) => setForm(p => ({ ...p, endTime: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grace Period (Min)</label>
                <input 
                  type="number" 
                  value={form.graceTime} 
                  onChange={(e) => setForm(p => ({ ...p, graceTime: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Break Duration (Min)</label>
                <input 
                  type="number" 
                  value={form.breakDuration} 
                  onChange={(e) => setForm(p => ({ ...p, breakDuration: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Rest Days</label>
              <div className="flex items-center justify-between gap-1 mt-1 bg-slate-50 border border-slate-100 rounded-xl p-2">
                {days.map(d => (
                  <button 
                    key={d.index}
                    type="button"
                    onClick={() => handleWeeklyOffToggle(d.index)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs border transition-all ${
                      form.weeklyOff.includes(d.index)
                        ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-sm'
                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                    title={d.full}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer">
              Register Shift
            </button>
          </form>
        </div>
      )}

      {/* EDIT SHIFT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Edit Shift Configuration</h3>
              <button type="button" onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                <input 
                  type="time" 
                  value={form.startTime} 
                  onChange={(e) => setForm(p => ({ ...p, startTime: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                <input 
                  type="time" 
                  value={form.endTime} 
                  onChange={(e) => setForm(p => ({ ...p, endTime: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grace Period (Min)</label>
                <input 
                  type="number" 
                  value={form.graceTime} 
                  onChange={(e) => setForm(p => ({ ...p, graceTime: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Break Duration (Min)</label>
                <input 
                  type="number" 
                  value={form.breakDuration} 
                  onChange={(e) => setForm(p => ({ ...p, breakDuration: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Rest Days</label>
              <div className="flex items-center justify-between gap-1 mt-1 bg-slate-50 border border-slate-100 rounded-xl p-2">
                {days.map(d => (
                  <button 
                    key={d.index}
                    type="button"
                    onClick={() => handleWeeklyOffToggle(d.index)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs border transition-all ${
                      form.weeklyOff.includes(d.index)
                        ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-sm'
                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                    title={d.full}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer">
              Save Shift Profile
            </button>
          </form>
        </div>
      )}

      {/* ROTATION SCHEME MODAL (MOCK) */}
      {rotationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Settings size={18} className="text-indigo-500" />
                Configure Rotation Scheme
              </h3>
              <button onClick={() => setRotationModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Design automated scheduling shifts to rotate staff rosters. For example, transition staff from Morning to Evening cycles every 14 days.
            </p>

            <div className="flex flex-col gap-3 mt-2 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rotation Frequency</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-700 font-medium">
                  <option>Bi-Weekly (Every 14 Days)</option>
                  <option>Monthly (Every 30 Days)</option>
                  <option>Weekly (Every 7 Days)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Staff Group</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-700 font-medium">
                  <option>Maintenance Technicians (Department 2)</option>
                  <option>Operations staff (Department 1)</option>
                  <option>All coworkers</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => {
                alert('Shift rotation cycle scheduled successfully (mock).');
                setRotationModal(false);
              }}
              className="w-full mt-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl border-none shadow-lg cursor-pointer"
            >
              Apply Scheme
            </button>
          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default ShiftManagement;
