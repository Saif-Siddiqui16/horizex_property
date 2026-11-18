import { notificationService } from './notificationService';

export const preventiveMaintenanceService = {
  getAll: () => {
    let list = JSON.parse(localStorage.getItem('mock_preventive') || '[]');
    list = list.filter(p => !['PM-0001', 'PM-0002', 'PM-0003', 'PM-0004'].includes(p.id));

    // Apply company selector filter
    const selectedCompany = localStorage.getItem('global_selected_company_id');
    const properties = JSON.parse(localStorage.getItem('mock_properties') || '[]');
    
    list = list.map(item => {
      const prop = properties.find(p => p.id === item.buildingId);
      return {
        ...item,
        companyId: prop ? prop.companyId : 'company-1'
      };
    });

    if (selectedCompany && selectedCompany !== 'all') {
      list = list.filter(p => p.companyId === selectedCompany);
    }

    return list;
  },

  create: (data) => {
    const list = JSON.parse(localStorage.getItem('mock_preventive') || '[]');
    const newPM = {
      ...data,
      id: `PM-${String(list.length + 1).padStart(4, '0')}`,
      status: 'Active'
    };
    list.unshift(newPM);
    localStorage.setItem('mock_preventive', JSON.stringify(list));
    return newPM;
  },

  completeCycle: (id) => {
    const list = JSON.parse(localStorage.getItem('mock_preventive') || '[]');
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const pm = list[idx];
    pm.lastCompletedDate = new Date().toISOString().split('T')[0];
    
    // Calculate next due date dynamically based on frequency
    const due = new Date();
    if (pm.frequency === 'Monthly') due.setMonth(due.getMonth() + 1);
    else if (pm.frequency === 'Quarterly') due.setMonth(due.getMonth() + 3);
    else if (pm.frequency === 'Half Yearly') due.setMonth(due.getMonth() + 6);
    else if (pm.frequency === 'Annual') due.setFullYear(due.getFullYear() + 1);
    
    pm.nextDueDate = due.toISOString().split('T')[0];
    pm.status = 'Active';

    localStorage.setItem('mock_preventive', JSON.stringify(list));
    return pm;
  }
};
