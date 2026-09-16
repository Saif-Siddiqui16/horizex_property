import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, UserPlus, Filter, X, Plus } from 'lucide-react';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';
import shiftService from '../../services/shiftService';
import permissionService from '../../services/permissionService';
import { EmployeeTable } from '../../components/payroll/EmployeeTable';

const mockCompanies = [
  { id: 1, name: 'Apex Real Estate Partners', code: 'APEX' },
  { id: 2, name: 'Soros Capital LLC', code: 'SOROS' },
  { id: 3, name: 'Masteko Group', code: 'MASTEKO' }
];

const mockBuildings = [
  { id: 1, name: 'Parkview Heights' },
  { id: 2, name: 'Sunset Towers' },
  { id: 3, name: 'Greenfield Commons' },
  { id: 4, name: 'Lakeside Villas' }
];

export const EmployeeDirectory = () => {
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [companies] = useState(mockCompanies);
  const [buildings] = useState(mockBuildings);
  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Filtering & Search
  const [filters, setFilters] = useState({
    search: '',
    buildingId: '',
    department: '',
    shiftId: '',
    status: '',
    sortBy: 'firstName',
    sortDesc: false
  });

  // Modal States
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const [shiftModal, setShiftModal] = useState(false);
  const [salaryModal, setSalaryModal] = useState(false);

  // Form States
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    companyId: '1', buildingId: '1', department: 'Operations',
    designation: '', employmentType: 'Full-time', shiftId: '1',
    salary: '3500', status: 'Active'
  });

  const loadData = () => {
    const compId = localStorage.getItem('global_selected_company_id') || '';
    const items = employeeService.getAll({ ...filters, companyId: compId });
    setEmployees(items);
    
    setShifts(shiftService.getAll());
    setDepartments(departmentService.getAll());
  };

  useEffect(() => {
    loadData();
    const handleCompanyChange = () => loadData();
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [filters]);

  useEffect(() => {
    if (location.state && location.state.openAddModal) {
      setAddModal(true);
    }
  }, [location.state]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    try {
      employeeService.create(form);
      setAddModal(false);
      resetForm();
      loadData();
      alert('Employee created successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    try {
      employeeService.update(selectedEmp.id, form);
      setEditModal(false);
      setSelectedEmp(null);
      resetForm();
      loadData();
      alert('Employee details updated.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    employeeService.delete(id);
    loadData();
  };

  const handleShiftSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    employeeService.update(selectedEmp.id, { shiftId: parseInt(form.shiftId) });
    setShiftModal(false);
    setSelectedEmp(null);
    loadData();
    alert('Shift schedule updated.');
  };

  const handleSalarySubmit = (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    employeeService.update(selectedEmp.id, { salary: parseFloat(form.salary) });
    setSalaryModal(false);
    setSelectedEmp(null);
    loadData();
    alert('Salary structure updated.');
  };

  const resetForm = () => {
    setForm({
      firstName: '', lastName: '', email: '', phone: '',
      companyId: '1', buildingId: '1', department: 'Operations',
      designation: '', employmentType: 'Full-time', shiftId: '1',
      salary: '3500', status: 'Active'
    });
  };

  const openEdit = (emp) => {
    setSelectedEmp(emp);
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      companyId: String(emp.companyId),
      buildingId: String(emp.buildingId),
      department: emp.department,
      designation: emp.designation,
      employmentType: emp.employmentType,
      shiftId: String(emp.shiftId),
      salary: String(emp.salary),
      status: emp.status
    });
    setEditModal(true);
  };

  const openShift = (emp) => {
    setSelectedEmp(emp);
    setForm(p => ({ ...p, shiftId: String(emp.shiftId) }));
    setShiftModal(true);
  };

  const openSalary = (emp) => {
    setSelectedEmp(emp);
    setForm(p => ({ ...p, salary: String(emp.salary) }));
    setSalaryModal(true);
  };

  const canManage = permissionService.canManageEmployees();

  return (
    <MainLayout title="Employee Directory">
      <div className="flex flex-col gap-6">
        
        {/* Filters and Header Operations */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 w-full md:max-w-xs focus-within:border-blue-200 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search employee or ID..." 
              value={filters.search}
              onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
              className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder-slate-400 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={filters.buildingId} 
              onChange={(e) => setFilters(p => ({ ...p, buildingId: e.target.value }))}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none font-semibold focus:border-blue-100"
            >
              <option value="">All Buildings</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {canManage && (
              <button 
                onClick={() => { resetForm(); setAddModal(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all border-none flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Directory Table */}
        <EmployeeTable 
          employees={employees}
          companies={companies}
          buildings={buildings}
          shifts={shifts}
          onEdit={openEdit}
          onDelete={handleDelete}
          onShiftChange={openShift}
          onSalaryUpdate={openSalary}
          onViewDetails={(emp) => alert(`Employee: ${emp.firstName} ${emp.lastName}\nEmail: ${emp.email}\nPhone: ${emp.phone}\nDepartment: ${emp.department}\nEmployment Type: ${emp.employmentType}`)}
        />

      </div>

      {/* ADD EMPLOYEE MODAL */}
      {addModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6 overflow-y-auto">
          <form id="add-employee-form" onSubmit={handleAddSubmit} className="bg-white w-full max-w-md rounded-none md:rounded-3xl shadow-float border border-slate-100 flex flex-col overflow-hidden animate-zoom-in my-auto h-[100dvh] md:h-auto md:max-h-[90vh]">
            
            {/* Sticky Header */}
            <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-50 shrink-0 z-10">
              <h3 className="font-bold text-slate-800 text-sm">Add New Employee</h3>
              <button type="button" onClick={() => setAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none shrink-0">×</button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                  <input 
                    type="text" 
                    value={form.firstName} 
                    onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                  <input 
                    type="text" 
                    value={form.lastName} 
                    onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="text" 
                    value={form.phone} 
                    onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</label>
                  <select 
                    value={form.companyId} 
                    onChange={(e) => setForm(p => ({ ...p, companyId: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium appearance-none"
                  >
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Building</label>
                  <select 
                    value={form.buildingId} 
                    onChange={(e) => setForm(p => ({ ...p, buildingId: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium appearance-none"
                  >
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                  <select 
                    value={form.department} 
                    onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium appearance-none"
                  >
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</label>
                  <input 
                    type="text" 
                    value={form.designation} 
                    onChange={(e) => setForm(p => ({ ...p, designation: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employment Type</label>
                  <select 
                    value={form.employmentType} 
                    onChange={(e) => setForm(p => ({ ...p, employmentType: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium appearance-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temp">Temp</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Salary ($)</label>
                  <input 
                    type="number" 
                    value={form.salary} 
                    onChange={(e) => setForm(p => ({ ...p, salary: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-150 p-6 flex items-center justify-end shrink-0 z-10 w-full">
              <button type="submit" className="w-full py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer">
                Register Employee
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6 overflow-y-auto">
          <form id="edit-employee-form" onSubmit={handleEditSubmit} className="bg-white w-full max-w-md rounded-none md:rounded-3xl shadow-float border border-slate-100 flex flex-col overflow-hidden animate-zoom-in my-auto h-[100dvh] md:h-auto md:max-h-[90vh]">
            
            {/* Sticky Header */}
            <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-50 shrink-0 z-10">
              <h3 className="font-bold text-slate-800 text-sm">Edit Employee Profile</h3>
              <button type="button" onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none shrink-0">×</button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                  <input 
                    type="text" 
                    value={form.firstName} 
                    onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                  <input 
                    type="text" 
                    value={form.lastName} 
                    onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                  <input 
                    type="text" 
                    value={form.phone} 
                    onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                  <select 
                    value={form.department} 
                    onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium appearance-none"
                  >
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</label>
                  <input 
                    type="text" 
                    value={form.designation} 
                    onChange={(e) => setForm(p => ({ ...p, designation: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select 
                    value={form.status} 
                    onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-150 p-6 flex items-center justify-end shrink-0 z-10 w-full">
              <button type="submit" className="w-full py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SHIFT MODAL */}
      {shiftModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleShiftSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Assign Work Shift</h3>
              <button type="button" onClick={() => setShiftModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500">Employee: <b className="text-slate-700">{selectedEmp?.firstName} {selectedEmp?.lastName}</b></span>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Select Shift Schedule</label>
              <select 
                value={form.shiftId} 
                onChange={(e) => setForm(p => ({ ...p, shiftId: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
              >
                {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>)}
              </select>
            </div>
            <button type="submit" className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none cursor-pointer">
              Update Assignment
            </button>
          </form>
        </div>
      )}

      {/* SALARY MODAL */}
      {salaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSalarySubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Adjust Salary Structure</h3>
              <button type="button" onClick={() => setSalaryModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500">Employee: <b className="text-slate-700">{selectedEmp?.firstName} {selectedEmp?.lastName}</b></span>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Base Monthly Salary ($)</label>
              <input 
                type="number"
                value={form.salary} 
                onChange={(e) => setForm(p => ({ ...p, salary: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-300 font-medium"
                required
              />
            </div>
            <button type="submit" className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none cursor-pointer">
              Save Base Salary
            </button>
          </form>
        </div>
      )}

    </MainLayout>
  );
};

export default EmployeeDirectory;
