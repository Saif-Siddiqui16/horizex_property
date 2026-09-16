import { generateEmployeeNumber } from '../utils/numberGenerators';
import payrollTimelineService from './payrollTimelineService';

const KEY = 'mock_employees';
const SEQ_KEY = 'employee_seq';

const DEFAULT_EMPLOYEES = [
  {
    id: 4,
    employeeNo: 'EMP-APEX-2026-00004',
    companyId: 1,
    buildingId: 1,
    department: 'Operations',
    firstName: 'Sarah',
    lastName: 'Smith',
    email: 'sarah.smith@property.com',
    phone: '+1 (514) 555-0188',
    role: 'COWORKER',
    designation: 'Assistant Property Manager',
    employmentType: 'Full-time',
    shiftId: 1,
    salary: 4500,
    status: 'Active',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-10T09:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User'
  },
  {
    id: 5,
    employeeNo: 'EMP-APEX-2026-00005',
    companyId: 1,
    buildingId: 1,
    department: 'Maintenance',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@property.com',
    phone: '+1 (514) 555-0189',
    role: 'COWORKER',
    designation: 'Maintenance Supervisor',
    employmentType: 'Full-time',
    shiftId: 1,
    salary: 4200,
    status: 'Active',
    createdAt: '2025-02-15T09:00:00Z',
    updatedAt: '2025-02-15T09:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User'
  }
];

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    localStorage.setItem(SEQ_KEY, '6');
    return DEFAULT_EMPLOYEES;
  }
  
  let list = [];
  try {
    list = JSON.parse(data);
  } catch (e) {
    list = DEFAULT_EMPLOYEES;
  }
  
  // Non-destructive migration
  let migrated = false;
  list = list.map(emp => {
    let changed = false;
    if (!emp.employeeNo) {
      emp.employeeNo = `EMP-APEX-2026-0000${emp.id}`;
      changed = true;
    }
    if (emp.companyId === undefined) {
      emp.companyId = 1;
      changed = true;
    }
    if (emp.buildingId === undefined) {
      emp.buildingId = 1;
      changed = true;
    }
    if (!emp.department) {
      emp.department = emp.title === 'Maintenance Supervisor' ? 'Maintenance' : 'Operations';
      changed = true;
    }
    if (!emp.designation) {
      emp.designation = emp.title || 'Specialist';
      changed = true;
    }
    if (!emp.employmentType) {
      emp.employmentType = 'Full-time';
      changed = true;
    }
    if (emp.shiftId === undefined) {
      emp.shiftId = 1;
      changed = true;
    }
    if (emp.salary === undefined) {
      emp.salary = emp.title === 'Maintenance Supervisor' ? 4200 : 4500;
      changed = true;
    }
    if (!emp.createdAt) {
      emp.createdAt = new Date().toISOString();
      changed = true;
    }
    if (!emp.updatedAt) {
      emp.updatedAt = new Date().toISOString();
      changed = true;
    }
    if (!emp.createdBy) {
      emp.createdBy = 'Admin User';
      changed = true;
    }
    if (!emp.updatedBy) {
      emp.updatedBy = 'Admin User';
      changed = true;
    }
    if (changed) migrated = true;
    return emp;
  });

  if (migrated) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }
  return list;
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const employeeService = {
  getAll(filters = {}) {
    let list = getStore();
    
    // Filter by Global Company Selector
    if (filters.companyId) {
      list = list.filter(emp => String(emp.companyId) === String(filters.companyId));
    }
    if (filters.buildingId) {
      list = list.filter(emp => String(emp.buildingId) === String(filters.buildingId));
    }
    if (filters.department) {
      list = list.filter(emp => emp.department === filters.department);
    }
    if (filters.shiftId) {
      list = list.filter(emp => String(emp.shiftId) === String(filters.shiftId));
    }
    if (filters.status) {
      list = list.filter(emp => emp.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
        emp.employeeNo.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        (emp.designation && emp.designation.toLowerCase().includes(q))
      );
    }
    
    // Sort
    if (filters.sortBy) {
      const key = filters.sortBy;
      const desc = filters.sortDesc;
      list.sort((a, b) => {
        let valA = a[key] ?? '';
        let valB = b[key] ?? '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return desc ? 1 : -1;
        if (valA > valB) return desc ? -1 : 1;
        return 0;
      });
    }
    
    return list;
  },

  getById(id) {
    return getStore().find(emp => String(emp.id) === String(id)) || null;
  },

  create(data) {
    const list = getStore();
    
    // Get next sequence
    let seq = parseInt(localStorage.getItem(SEQ_KEY) || '6');
    const newId = seq;
    localStorage.setItem(SEQ_KEY, String(seq + 1));
    
    // Resolve company code
    let companyCode = 'APEX';
    if (String(data.companyId) === '2') companyCode = 'SOROS';
    if (String(data.companyId) === '3') companyCode = 'MASTEKO';
    
    const empNo = generateEmployeeNumber(companyCode, newId);
    
    const item = {
      id: newId,
      employeeNo: empNo,
      companyId: parseInt(data.companyId) || 1,
      buildingId: parseInt(data.buildingId) || 1,
      department: data.department || 'Operations',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      role: 'COWORKER',
      designation: data.designation || 'Specialist',
      employmentType: data.employmentType || 'Full-time',
      shiftId: parseInt(data.shiftId) || 1,
      salary: parseFloat(data.salary) || 3000,
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin User',
      updatedBy: 'Admin User'
    };
    
    list.push(item);
    setStore(list);
    
    payrollTimelineService.append(
      'Status Changed',
      `Employee ${item.firstName} ${item.lastName} added with ID ${empNo}`,
      { employeeId: item.id, employeeName: `${item.firstName} ${item.lastName}`, companyId: item.companyId }
    );
    
    return item;
  },

  update(id, data) {
    const list = getStore();
    const idx = list.findIndex(emp => String(emp.id) === String(id));
    if (idx === -1) return null;

    const oldEmp = list[idx];
    const isSalaryChanged = data.salary !== undefined && parseFloat(data.salary) !== oldEmp.salary;
    const isStatusChanged = data.status !== undefined && data.status !== oldEmp.status;

    list[idx] = {
      ...oldEmp,
      ...data,
      companyId: data.companyId ? parseInt(data.companyId) : oldEmp.companyId,
      buildingId: data.buildingId ? parseInt(data.buildingId) : oldEmp.buildingId,
      shiftId: data.shiftId ? parseInt(data.shiftId) : oldEmp.shiftId,
      salary: data.salary !== undefined ? parseFloat(data.salary) : oldEmp.salary,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };
    
    const updatedEmp = list[idx];
    setStore(list);
    
    if (isSalaryChanged) {
      payrollTimelineService.append(
        'Salary Updated',
        `Salary updated to $${updatedEmp.salary} for employee ${updatedEmp.firstName} ${updatedEmp.lastName}`,
        { employeeId: updatedEmp.id, employeeName: `${updatedEmp.firstName} ${updatedEmp.lastName}`, companyId: updatedEmp.companyId }
      );
    }
    
    if (isStatusChanged) {
      payrollTimelineService.append(
        'Status Changed',
        `Status changed to ${updatedEmp.status} for employee ${updatedEmp.firstName} ${updatedEmp.lastName}`,
        { employeeId: updatedEmp.id, employeeName: `${updatedEmp.firstName} ${updatedEmp.lastName}`, companyId: updatedEmp.companyId }
      );
    }
    
    return updatedEmp;
  },

  delete(id) {
    const list = getStore();
    const emp = list.find(e => String(e.id) === String(id));
    if (!emp) return false;
    
    const filtered = list.filter(e => String(e.id) !== String(id));
    setStore(filtered);
    
    payrollTimelineService.append(
      'Status Changed',
      `Employee ${emp.firstName} ${emp.lastName} (${emp.employeeNo}) removed from directory`,
      { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, companyId: emp.companyId }
    );
    
    return true;
  }
};

export default employeeService;
