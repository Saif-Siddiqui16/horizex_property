import { maintenanceAuditService } from './maintenanceAuditService';
import { notificationService } from './notificationService';

export const generateMaintenanceNumber = () => {
  const year = new Date().getFullYear();
  const requests = JSON.parse(localStorage.getItem('mock_maintenance_requests') || '[]');
  const nextNum = String(requests.length + 1).padStart(4, '0');
  return `MR-${year}-${nextNum}`;
};

export const maintenanceService = {
  getAll: (filters = {}) => {
    let list = JSON.parse(localStorage.getItem('mock_maintenance_requests') || '[]');
    
    // Filter out legacy sample mock requests
    list = list.filter(r => !String(r.id || '').startsWith('MR-2026-000'));

    // Apply company selection filter
    const selectedCompany = localStorage.getItem('global_selected_company_id');
    if (selectedCompany && selectedCompany !== 'all') {
      list = list.filter(r => r.companyId === selectedCompany || !r.companyId);
    }

    if (filters.buildingId && filters.buildingId !== 'all') {
      list = list.filter(r => r.buildingId === filters.buildingId);
    }
    if (filters.apartmentId && filters.apartmentId !== 'all') {
      list = list.filter(r => r.apartmentId === filters.apartmentId);
    }
    if (filters.priority) {
      list = list.filter(r => r.priority === filters.priority);
    }
    if (filters.status) {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters.category) {
      list = list.filter(r => r.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(r => 
        r.id.toLowerCase().includes(q) || 
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    return list;
  },

  getById: (id) => {
    const list = JSON.parse(localStorage.getItem('mock_maintenance_requests') || '[]');
    return list.find(r => r.id === id);
  },

  create: (data) => {
    const list = JSON.parse(localStorage.getItem('mock_maintenance_requests') || '[]');
    const newRequest = {
      ...data,
      id: generateMaintenanceNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy || 'Admin',
      updatedBy: data.createdBy || 'Admin',
      photos: data.photos || [],
      documents: data.documents || [],
      receipts: data.receipts || [],
      status: data.status || 'New'
    };

    list.unshift(newRequest);
    localStorage.setItem('mock_maintenance_requests', JSON.stringify(list));
    
    // Log event
    maintenanceAuditService.logEvent(newRequest.id, 'Request Created', `Maintenance request created: ${newRequest.description}`);
    
    // Push notifications
    try {
      notificationService.create({
        category: 'Rent',
        title: 'New Maintenance Request',
        description: `Request ${newRequest.id} created for ${newRequest.category}.`,
        priority: newRequest.priority === 'Emergency' ? 'High' : 'Medium'
      });
    } catch(err) {
      console.warn('Notification log failed', err);
    }

    return newRequest;
  },

  updateStatus: (id, status, updatedBy = 'Admin') => {
    const list = JSON.parse(localStorage.getItem('mock_maintenance_requests') || '[]');
    const reqIndex = list.findIndex(r => r.id === id);
    if (reqIndex === -1) return null;

    const oldStatus = list[reqIndex].status;
    list[reqIndex].status = status;
    list[reqIndex].updatedAt = new Date().toISOString();
    list[reqIndex].updatedBy = updatedBy;

    localStorage.setItem('mock_maintenance_requests', JSON.stringify(list));

    // Audit transition
    maintenanceAuditService.logEvent(id, status, `Workflow transitioned from ${oldStatus} to ${status}`);
    
    // Trigger relative notifications
    if (status === 'Assigned') {
      try {
        notificationService.create({
          category: 'Rent',
          title: 'Assigned Work Order',
          description: `Request ${id} has been assigned to a technician.`,
          priority: 'Medium'
        });
      } catch (e) {}
    } else if (status === 'Overdue') {
      try {
        notificationService.create({
          category: 'Rent',
          title: 'Overdue Repair Alert',
          description: `Request ${id} is marked overdue.`,
          priority: 'High'
        });
      } catch (e) {}
    }

    return list[reqIndex];
  },

  update: (id, data) => {
    const list = JSON.parse(localStorage.getItem('mock_maintenance_requests') || '[]');
    const reqIndex = list.findIndex(r => r.id === id);
    if (reqIndex === -1) return null;

    list[reqIndex] = {
      ...list[reqIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('mock_maintenance_requests', JSON.stringify(list));
    return list[reqIndex];
  },

  delete: (id) => {
    let list = JSON.parse(localStorage.getItem('mock_maintenance_requests') || '[]');
    list = list.filter(r => r.id !== id);
    localStorage.setItem('mock_maintenance_requests', JSON.stringify(list));
    return true;
  }
};
