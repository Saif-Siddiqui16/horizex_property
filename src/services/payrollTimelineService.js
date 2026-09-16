const KEY = 'mock_payroll_timeline';

const getStore = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const payrollTimelineService = {
  getAll(filters = {}) {
    let list = getStore();
    
    if (filters.companyId) {
      list = list.filter(item => !item.companyId || String(item.companyId) === String(filters.companyId));
    }
    if (filters.employeeId) {
      list = list.filter(item => String(item.employeeId) === String(filters.employeeId));
    }
    if (filters.eventType) {
      list = list.filter(item => item.eventType === filters.eventType);
    }
    
    // Sort descending by default
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  append(eventType, description, details = {}) {
    const list = getStore();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Admin User';
    
    const event = {
      id: `prt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType, // 'Attendance Updated', 'Leave Approved', 'Leave Rejected', 'Payroll Generated', 'Salary Updated', 'Payslip Generated', 'Status Changed'
      description,
      employeeId: details.employeeId || null,
      employeeName: details.employeeName || '',
      companyId: details.companyId || null,
      metadata: details.metadata || {},
      createdAt: new Date().toISOString(),
      createdBy: userName,
      updatedAt: new Date().toISOString(), // Audit field compliance
      updatedBy: userName
    };

    list.unshift(event); // Add to beginning so it's naturally sorted desc
    setStore(list);
    return event;
  }
};

export default payrollTimelineService;
