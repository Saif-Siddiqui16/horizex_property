import { notificationService } from './notificationService';

export const preventiveMaintenanceService = {
  getAll: () => {
    let list = JSON.parse(localStorage.getItem('mock_preventive') || '[]');
    if (list.length === 0) {
      list = [
        {
          id: 'PM-0001',
          name: 'Annual Fire Extinguisher Certification',
          category: 'Fire Equipment',
          frequency: 'Annual',
          lastCompletedDate: '2025-06-15',
          nextDueDate: '2026-06-15', // Overdue!
          buildingId: 'building-1',
          assignedVendorId: 'vendor-3',
          status: 'Overdue'
        },
        {
          id: 'PM-0002',
          name: 'Quarterly HVAC Boiler Inspection',
          category: 'HVAC',
          frequency: 'Quarterly',
          lastCompletedDate: '2026-03-10',
          nextDueDate: '2026-06-10', // Overdue!
          buildingId: 'building-1',
          assignedVendorId: 'vendor-2',
          status: 'Overdue'
        },
        {
          id: 'PM-0003',
          name: 'Monthly Elevator Pressure Valve Check',
          category: 'Elevator',
          frequency: 'Monthly',
          lastCompletedDate: '2026-06-15',
          nextDueDate: '2026-07-15',
          buildingId: 'building-2',
          assignedVendorId: 'vendor-1',
          status: 'Active'
        },
        {
          id: 'PM-0004',
          name: 'Half Yearly Electrical Panel Thermography',
          category: 'Electrical',
          frequency: 'Half Yearly',
          lastCompletedDate: '2026-01-20',
          nextDueDate: '2026-07-20',
          buildingId: 'building-1',
          assignedVendorId: 'vendor-3',
          status: 'Active'
        }
      ];
      localStorage.setItem('mock_preventive', JSON.stringify(list));

      // Trigger alerts for the seeded overdue items
      list.filter(p => p.status === 'Overdue').forEach(p => {
        try {
          notificationService.create({
            category: 'Rent',
            title: 'Preventive Maintenance Due',
            description: `Scheduled run "${p.name}" is overdue (Target: ${p.nextDueDate})`,
            priority: 'High'
          });
        } catch(e) {}
      });
    }

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
