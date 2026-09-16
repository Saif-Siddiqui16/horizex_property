import employeeService from './employeeService';
import payrollTimelineService from './payrollTimelineService';
import payrollSettingsService from './payrollSettingsService';

const KEY = 'mock_overtime';

const DEFAULT_OVERTIME = [
  {
    id: 1,
    employeeId: 4,
    companyId: 1,
    date: '2026-06-28',
    hours: 2,
    status: 'Approved',
    paidStatus: 'Unpaid',
    createdAt: '2026-06-28T17:30:00Z',
    createdBy: 'Sarah Smith',
    updatedAt: '2026-06-28T18:00:00Z',
    updatedBy: 'Admin User'
  },
  {
    id: 2,
    employeeId: 5,
    companyId: 1,
    date: '2026-06-29',
    hours: 1.5,
    status: 'Pending',
    paidStatus: 'Unpaid',
    createdAt: '2026-06-29T18:15:00Z',
    createdBy: 'Mike Johnson',
    updatedAt: '2026-06-29T18:15:00Z',
    updatedBy: 'Mike Johnson'
  }
];

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_OVERTIME));
    return DEFAULT_OVERTIME;
  }
  return JSON.parse(data);
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const overtimeService = {
  getAll(filters = {}) {
    let list = getStore();
    const employees = employeeService.getAll();
    const settings = payrollSettingsService.getSettings();
    const multiplier = settings.overtimeMultiplier || 1.5;

    // Enhance with calculations
    list = list.map(item => {
      const emp = employees.find(e => String(e.id) === String(item.employeeId));
      const salary = emp ? emp.salary : 3000;
      const hourlyWage = salary / 160; // 160 hours per month standard
      const rate = hourlyWage * multiplier;
      const cost = parseFloat((item.hours * rate).toFixed(2));

      return {
        ...item,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${item.employeeId}`,
        employeeNo: emp ? emp.employeeNo : '',
        department: emp ? emp.department : '',
        companyId: emp ? emp.companyId : item.companyId,
        hourlyWage: parseFloat(hourlyWage.toFixed(2)),
        overtimeRate: parseFloat(rate.toFixed(2)),
        cost
      };
    });

    if (filters.companyId) {
      list = list.filter(item => String(item.companyId) === String(filters.companyId));
    }
    if (filters.employeeId) {
      list = list.filter(item => String(item.employeeId) === String(filters.employeeId));
    }
    if (filters.status) {
      list = list.filter(item => item.status === filters.status);
    }
    if (filters.paidStatus) {
      list = list.filter(item => item.paidStatus === filters.paidStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(item => 
        item.employeeName.toLowerCase().includes(q) ||
        item.employeeNo.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getById(id) {
    return this.getAll().find(item => String(item.id) === String(id)) || null;
  },

  create(data) {
    const list = getStore();
    const emp = employeeService.getById(data.employeeId);
    if (!emp) throw new Error('Employee not found');

    const newId = list.length ? Math.max(...list.map(o => o.id)) + 1 : 1;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const author = user.name || `${emp.firstName} ${emp.lastName}`;

    const item = {
      id: newId,
      employeeId: parseInt(data.employeeId),
      companyId: emp.companyId,
      date: data.date,
      hours: parseFloat(data.hours) || 0,
      status: data.status || 'Pending',
      paidStatus: 'Unpaid',
      createdAt: new Date().toISOString(),
      createdBy: author,
      updatedAt: new Date().toISOString(),
      updatedBy: author
    };

    list.push(item);
    setStore(list);
    return item;
  },

  updateStatus(id, status) {
    const list = getStore();
    const idx = list.findIndex(item => String(item.id) === String(id));
    if (idx === -1) return null;

    const current = list[idx];
    const emp = employeeService.getById(current.employeeId);
    const oldStatus = current.status;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const author = user.name || 'Admin User';

    list[idx] = {
      ...current,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: author
    };

    setStore(list);

    if (emp && oldStatus !== status) {
      const msg = `Overtime request of ${current.hours} hours for ${emp.firstName} ${emp.lastName} on ${current.date} was ${status.toLowerCase()}`;
      payrollTimelineService.append(
        status === 'Approved' ? 'Attendance Updated' : 'Status Changed',
        msg,
        { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, companyId: emp.companyId }
      );
    }

    return list[idx];
  },

  markPaid(ids) {
    const list = getStore();
    const idSet = new Set(ids.map(String));
    
    const updatedList = list.map(item => {
      if (idSet.has(String(item.id))) {
        return {
          ...item,
          paidStatus: 'Paid',
          updatedAt: new Date().toISOString(),
          updatedBy: 'Admin User'
        };
      }
      return item;
    });

    setStore(updatedList);
    return true;
  }
};

export default overtimeService;
