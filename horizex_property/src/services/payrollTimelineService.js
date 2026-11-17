const KEY = 'mock_payroll_timeline';

const getStore = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const payrollTimelineService = {
  getAll(filters = {}) {
    let list = getStore();
    
    if (filters.companyId && filters.companyId !== 'all') {
      list = list.filter(item => String(item.companyId) === String(filters.companyId));
    }
    if (filters.employeeId) {
      list = list.filter(item => String(item.employeeId) === String(filters.employeeId));
    }
    if (filters.eventType) {
      list = list.filter(item => item.eventType === filters.eventType);
    }
    
    // Clean up any "undefined undefined" artifacts safely
    list = list.map(item => {
      let cleanDesc = item.description || '';
      let cleanName = item.employeeName || '';
      if (cleanName === 'undefined undefined' || cleanName.includes('undefined')) {
        cleanName = '';
      }
      if (cleanDesc.includes('undefined undefined')) {
        cleanDesc = cleanDesc.replace(/undefined undefined/g, 'Staff Member');
      }
      return {
        ...item,
        employeeName: cleanName,
        description: cleanDesc,
      };
    });

    // Sort descending by default
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  append(eventType, description, details = {}) {
    const list = getStore();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Admin User';
    
    const activeCompanyId = details.companyId || localStorage.getItem('global_selected_company_id') || localStorage.getItem('companyContext') || null;
    let employeeName = details.employeeName || '';
    if (employeeName === 'undefined undefined' || employeeName.includes('undefined')) {
      employeeName = '';
    }
    let desc = description || '';
    if (desc.includes('undefined undefined')) {
      desc = desc.replace(/undefined undefined/g, employeeName || 'Staff Member');
    }

    const event = {
      id: `prt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType, // 'Attendance Updated', 'Leave Approved', 'Leave Rejected', 'Payroll Generated', 'Salary Updated', 'Payslip Generated', 'Status Changed'
      description: desc,
      employeeId: details.employeeId || null,
      employeeName: employeeName,
      companyId: activeCompanyId,
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
