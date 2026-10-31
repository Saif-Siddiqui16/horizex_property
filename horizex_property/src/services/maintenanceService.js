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
    
    // Non-destructive seeding if empty
    if (list.length === 0) {
      list = [
        {
          id: 'MR-2026-0001',
          companyId: 'company-1', // Apex Real Estate Partners
          buildingId: 'building-1',
          apartmentId: 'unit-101',
          tenantId: 'tenant-1',
          leaseId: 'lease-1',
          category: 'Plumbing',
          priority: 'High',
          description: 'Water leak under kitchen sink.',
          assignedTechnicianId: 'tech-1',
          assignedVendorId: 'vendor-1',
          photos: ['sink_leak_leakage.jpg'],
          documents: ['lease_handover_report.pdf'],
          receipts: [],
          status: 'In Progress',
          createdAt: '2026-06-25T10:00:00Z',
          updatedAt: '2026-06-26T12:00:00Z',
          createdBy: 'tenant-1',
          updatedBy: 'tech-1'
        },
        {
          id: 'MR-2026-0002',
          companyId: 'company-1',
          buildingId: 'building-2',
          apartmentId: 'unit-202',
          tenantId: 'tenant-2',
          leaseId: 'lease-2',
          category: 'HVAC',
          priority: 'Emergency',
          description: 'Heating is completely broken.',
          assignedTechnicianId: 'tech-2',
          assignedVendorId: 'vendor-2',
          photos: ['hvac_vent.jpg'],
          documents: [],
          receipts: [],
          status: 'New',
          createdAt: '2026-06-29T08:00:00Z',
          updatedAt: '2026-06-29T08:00:00Z',
          createdBy: 'tenant-2',
          updatedBy: 'tenant-2'
        },
        {
          id: 'MR-2026-0003',
          companyId: 'company-1',
          buildingId: 'building-1',
          apartmentId: 'unit-304',
          tenantId: 'tenant-3',
          leaseId: 'lease-3',
          category: 'Electrical',
          priority: 'Low',
          description: 'Flickering lights in the bedroom.',
          assignedTechnicianId: '',
          assignedVendorId: '',
          photos: [],
          documents: [],
          receipts: [],
          status: 'Draft',
          createdAt: '2026-06-30T15:00:00Z',
          updatedAt: '2026-06-30T15:00:00Z',
          createdBy: 'admin-1',
          updatedBy: 'admin-1'
        }
      ];
      localStorage.setItem('mock_maintenance_requests', JSON.stringify(list));
      
      // Seed initial audits
      list.forEach(req => {
        maintenanceAuditService.logEvent(req.id, 'Request Created', `Request ${req.id} initialized by user.`);
        if (req.status === 'In Progress') {
          maintenanceAuditService.logEvent(req.id, 'Assigned', `Technician assigned to ${req.id}`);
          maintenanceAuditService.logEvent(req.id, 'Started', `Repair work started for request ${req.id}`);
        }
      });
    }

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
  }
};
