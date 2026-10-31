import employeeService from './employeeService';
import payrollTimelineService from './payrollTimelineService';

const KEY = 'mock_leaves';

const DEFAULT_LEAVES = [
  {
    id: 1,
    employeeId: 4,
    companyId: 1,
    leaveType: 'Sick',
    startDate: '2026-06-15',
    endDate: '2026-06-15',
    reason: 'Medical checkup',
    status: 'Approved',
    createdAt: '2026-06-14T09:00:00Z',
    createdBy: 'Sarah Smith',
    updatedAt: '2026-06-14T11:00:00Z',
    updatedBy: 'Admin User'
  },
  {
    id: 2,
    employeeId: 5,
    companyId: 1,
    leaveType: 'Annual',
    startDate: '2026-07-10',
    endDate: '2026-07-15',
    reason: 'Family summer vacation',
    status: 'Pending',
    createdAt: '2026-06-25T10:00:00Z',
    createdBy: 'Mike Johnson',
    updatedAt: '2026-06-25T10:00:00Z',
    updatedBy: 'Mike Johnson'
  }
];

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_LEAVES));
    return DEFAULT_LEAVES;
  }
  return JSON.parse(data);
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const leaveService = {
  getAll(filters = {}) {
    let list = getStore();
    const employees = employeeService.getAll();

    list = list.map(item => {
      const emp = employees.find(e => String(e.id) === String(item.employeeId));
      return {
        ...item,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${item.employeeId}`,
        employeeNo: emp ? emp.employeeNo : '',
        department: emp ? emp.department : '',
        companyId: emp ? emp.companyId : item.companyId
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
    if (filters.leaveType) {
      list = list.filter(item => item.leaveType === filters.leaveType);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(item => 
        item.employeeName.toLowerCase().includes(q) ||
        item.employeeNo.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  },

  getById(id) {
    return this.getAll().find(item => String(item.id) === String(id)) || null;
  },

  create(data) {
    const list = getStore();
    const emp = employeeService.getById(data.employeeId);
    if (!emp) throw new Error('Employee not found');

    const newId = list.length ? Math.max(...list.map(l => l.id)) + 1 : 1;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const author = user.name || `${emp.firstName} ${emp.lastName}`;

    const item = {
      id: newId,
      employeeId: parseInt(data.employeeId),
      companyId: emp.companyId,
      leaveType: data.leaveType || 'Annual',
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason || '',
      status: data.status || 'Pending',
      createdAt: new Date().toISOString(),
      createdBy: author,
      updatedAt: new Date().toISOString(),
      updatedBy: author
    };

    list.push(item);
    setStore(list);

    payrollTimelineService.append(
      'Status Changed',
      `New leave request (${item.leaveType}) submitted for ${emp.firstName} ${emp.lastName}`,
      { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, companyId: emp.companyId }
    );

    return item;
  },

  updateStatus(id, status, reason = '') {
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
      rejectReason: reason || current.rejectReason,
      updatedAt: new Date().toISOString(),
      updatedBy: author
    };

    setStore(list);

    if (emp && oldStatus !== status) {
      const eventType = status === 'Approved' ? 'Leave Approved' : status === 'Rejected' ? 'Leave Rejected' : 'Status Changed';
      const msg = status === 'Approved' 
        ? `Leave request approved for ${emp.firstName} ${emp.lastName} (${current.startDate} to ${current.endDate})`
        : status === 'Rejected'
        ? `Leave request rejected for ${emp.firstName} ${emp.lastName}. Reason: ${reason}`
        : `Leave request status changed to ${status} for ${emp.firstName} ${emp.lastName}`;

      payrollTimelineService.append(
        eventType,
        msg,
        { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, companyId: emp.companyId }
      );
    }

    return list[idx];
  }
};

export default leaveService;
