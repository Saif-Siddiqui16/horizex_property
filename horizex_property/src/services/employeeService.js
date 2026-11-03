import api from '../api/client';
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
  },
  {
    id: 6,
    employeeNo: 'EMP-APEX-2026-00006',
    companyId: 1,
    buildingId: 1,
    department: 'Sales & Leasing',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@property.com',
    phone: '+1 (514) 555-0190',
    role: 'COWORKER',
    designation: 'Listing Agent',
    employmentType: 'Full-time',
    shiftId: 1,
    salary: 4800,
    status: 'Active',
    createdAt: '2025-03-01T09:00:00Z',
    updatedAt: '2025-03-01T09:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User'
  },
  {
    id: 7,
    employeeNo: 'EMP-APEX-2026-00007',
    companyId: 1,
    buildingId: 1,
    department: 'Maintenance',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john123@gmail.com',
    phone: '+1 (514) 555-0191',
    role: 'COWORKER',
    designation: 'Maintenance Technician',
    employmentType: 'Full-time',
    shiftId: 1,
    salary: 4000,
    status: 'Active',
    createdAt: '2025-03-05T09:00:00Z',
    updatedAt: '2025-03-05T09:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User'
  },
  {
    id: 8,
    employeeNo: 'EMP-APEX-2026-00008',
    companyId: 1,
    buildingId: 1,
    department: 'Accounting',
    firstName: 'a',
    lastName: 's',
    email: 'a1@gmail.com',
    phone: '+1 (514) 555-0192',
    role: 'COWORKER',
    designation: 'Accountant',
    employmentType: 'Full-time',
    shiftId: 1,
    salary: 4600,
    status: 'Active',
    createdAt: '2025-03-10T09:00:00Z',
    updatedAt: '2025-03-10T09:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User'
  }
];

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    localStorage.setItem(SEQ_KEY, '9');
    return [...DEFAULT_EMPLOYEES];
  }
  
  let list = [];
  try {
    list = JSON.parse(data);
  } catch (e) {
    list = [...DEFAULT_EMPLOYEES];
  }

  DEFAULT_EMPLOYEES.forEach(seed => {
    if (!list.some(item => item.id === seed.id || item.email === seed.email || (item.firstName === seed.firstName && item.lastName === seed.lastName))) {
      list.push(seed);
    }
  });
  localStorage.setItem(KEY, JSON.stringify(list));
  
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

  if (!list.some(emp => emp.department === 'Sales & Leasing')) {
    list.push({
      id: 6,
      employeeNo: 'EMP-APEX-2026-00006',
      companyId: 1,
      buildingId: 1,
      department: 'Sales & Leasing',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@property.com',
      phone: '+1 (514) 555-0190',
      role: 'COWORKER',
      designation: 'Listing Agent',
      employmentType: 'Full-time',
      shiftId: 1,
      salary: 4800,
      status: 'Active',
      createdAt: '2025-03-01T09:00:00Z',
      updatedAt: '2025-03-01T09:00:00Z',
      createdBy: 'Admin User',
      updatedBy: 'Admin User'
    });
    migrated = true;
  }

  if (migrated) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }
  return list;
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

const filterLocalList = (sourceList, filters = {}) => {
  let list = [...sourceList];
  
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
    list = list.filter(emp => emp.status.toLowerCase() === String(filters.status).toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(emp => 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
      (emp.employeeNo && emp.employeeNo.toLowerCase().includes(q)) ||
      (emp.email && emp.email.toLowerCase().includes(q)) ||
      (emp.designation && emp.designation.toLowerCase().includes(q))
    );
  }
  
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
};

export const employeeService = {
  getAll(filters = {}) {
    const cachedStore = getStore();
    return filterLocalList(cachedStore, filters);
  },

  getById(id) {
    return getStore().find(emp => String(emp.id) === String(id)) || null;
  },

  create(data) {
    const list = getStore();
    
    let seq = parseInt(localStorage.getItem(SEQ_KEY) || '6');
    const newId = seq;
    localStorage.setItem(SEQ_KEY, String(seq + 1));
    
    let companyCode = 'APEX';
    if (String(data.companyId) === '2') companyCode = 'SOROS';
    if (String(data.companyId) === '3') companyCode = 'HORIZEX';
    
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
    
    // Call backend API to persist in PostgreSQL database
    const apiPromise = api.post('/admin/employees', { ...data, employeeNo: empNo })
      .then(res => {
        const serverCreated = res.data?.data || res.data;
        if (serverCreated && serverCreated.id) {
          // Update in local cache with database record
          const currentStore = getStore();
          const targetIdx = currentStore.findIndex(e => e.employeeNo === empNo || e.id === item.id);
          if (targetIdx !== -1) {
            currentStore[targetIdx] = { ...currentStore[targetIdx], ...serverCreated };
            setStore(currentStore);
          }
          return { ...item, ...serverCreated };
        }
        return item;
      })
      .catch(err => {
        console.error('API create employee error:', err);
        // Throw or return item based on preference; returning item keeps UI resilient
        return item;
      });

    Object.defineProperty(item, 'then', {
      value: function(resolve, reject) {
        return apiPromise.then(resolve, reject);
      },
      writable: true,
      configurable: true
    });

    return item;
  },

  update(id, data) {
    const list = getStore();
    const idx = list.findIndex(emp => String(emp.id) === String(id));
    
    let oldEmp = idx !== -1 ? list[idx] : { id };
    const isSalaryChanged = data.salary !== undefined && parseFloat(data.salary) !== oldEmp.salary;
    const isStatusChanged = data.status !== undefined && data.status !== oldEmp.status;

    const updatedEmp = {
      ...oldEmp,
      ...data,
      companyId: data.companyId !== undefined ? (parseInt(data.companyId) || data.companyId) : oldEmp.companyId,
      buildingId: data.buildingId !== undefined ? (parseInt(data.buildingId) || data.buildingId) : oldEmp.buildingId,
      shiftId: data.shiftId !== undefined ? (parseInt(data.shiftId) || data.shiftId) : oldEmp.shiftId,
      salary: data.salary !== undefined ? parseFloat(data.salary) : oldEmp.salary,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };

    if (idx !== -1) {
      list[idx] = updatedEmp;
      setStore(list);
    }
    
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
    
    const apiPromise = api.put(`/admin/employees/${id}`, data)
      .then(res => {
        const serverUpdated = res.data?.data || res.data;
        if (serverUpdated) {
          const currentStore = getStore();
          const targetIdx = currentStore.findIndex(e => String(e.id) === String(id));
          if (targetIdx !== -1) {
            currentStore[targetIdx] = { ...currentStore[targetIdx], ...serverUpdated };
            setStore(currentStore);
          }
          return { ...updatedEmp, ...serverUpdated };
        }
        return updatedEmp;
      })
      .catch(err => {
        console.warn('API update employee error, using local update:', err);
        return updatedEmp;
      });

    Object.defineProperty(updatedEmp, 'then', {
      value: function(resolve, reject) {
        return apiPromise.then(resolve, reject);
      },
      writable: true,
      configurable: true
    });

    return updatedEmp;
  },

  delete(id) {
    const list = getStore();
    const emp = list.find(e => String(e.id) === String(id));
    
    const filtered = list.filter(e => String(e.id) !== String(id));
    setStore(filtered);
    
    if (emp) {
      payrollTimelineService.append(
        'Status Changed',
        `Employee ${emp.firstName} ${emp.lastName} (${emp.employeeNo}) removed from directory`,
        { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, companyId: emp.companyId }
      );
    }
    
    const resObj = { success: true };
    const apiPromise = api.delete(`/admin/employees/${id}`)
      .then(() => true)
      .catch(err => {
        console.warn('API delete employee error:', err);
        return true;
      });

    Object.defineProperty(resObj, 'then', {
      value: function(resolve, reject) {
        return apiPromise.then(resolve, reject);
      },
      writable: true,
      configurable: true
    });

    return resObj;
  }
};

export default employeeService;
