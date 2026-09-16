import { maintenanceAuditService } from './maintenanceAuditService';

export const generateWorkOrderNumber = () => {
  const year = new Date().getFullYear();
  const list = JSON.parse(localStorage.getItem('mock_work_orders') || '[]');
  const nextNum = String(list.length + 1).padStart(4, '0');
  return `WO-${year}-${nextNum}`;
};

export const workOrderService = {
  getAll: (filters = {}) => {
    let list = JSON.parse(localStorage.getItem('mock_work_orders') || '[]');
    
    if (list.length === 0) {
      list = [
        {
          id: 'WO-2026-0001',
          requestId: 'MR-2026-0001',
          technicianId: 'tech-1',
          vendorId: 'vendor-1',
          estimatedCost: 150.00,
          actualCost: 175.00,
          laborCost: 100.00,
          materialCost: 75.00,
          hoursWorked: 4,
          completionNotes: 'Replaced joint pipe, leak resolved.',
          photos: ['sink_resolved.jpg'],
          receipts: ['receipt_plumbing_joint.pdf'],
          createdAt: '2026-06-25T11:00:00Z',
          updatedAt: '2026-06-26T12:00:00Z'
        },
        {
          id: 'WO-2026-0002',
          requestId: 'MR-2026-0002',
          technicianId: 'tech-2',
          vendorId: 'vendor-2',
          estimatedCost: 1200.00,
          actualCost: 0,
          laborCost: 0,
          materialCost: 0,
          hoursWorked: 0,
          completionNotes: '',
          photos: [],
          receipts: [],
          createdAt: '2026-06-29T08:30:00Z',
          updatedAt: '2026-06-29T08:30:00Z'
        }
      ];
      localStorage.setItem('mock_work_orders', JSON.stringify(list));
    }

    if (filters.requestId) {
      list = list.filter(w => w.requestId === filters.requestId);
    }
    if (filters.technicianId) {
      list = list.filter(w => w.technicianId === filters.technicianId);
    }
    if (filters.vendorId) {
      list = list.filter(w => w.vendorId === filters.vendorId);
    }

    return list;
  },

  create: (data) => {
    const list = JSON.parse(localStorage.getItem('mock_work_orders') || '[]');
    const newWO = {
      ...data,
      id: generateWorkOrderNumber(),
      estimatedCost: Number(data.estimatedCost || 0),
      actualCost: Number(data.actualCost || 0),
      laborCost: Number(data.laborCost || 0),
      materialCost: Number(data.materialCost || 0),
      hoursWorked: Number(data.hoursWorked || 0),
      photos: data.photos || [],
      receipts: data.receipts || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newWO);
    localStorage.setItem('mock_work_orders', JSON.stringify(list));
    
    // Log event in request timeline
    maintenanceAuditService.logEvent(data.requestId, 'Assigned', `Work Order ${newWO.id} created and assigned.`);
    
    return newWO;
  },

  update: (id, data) => {
    const list = JSON.parse(localStorage.getItem('mock_work_orders') || '[]');
    const index = list.findIndex(w => w.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...data,
      estimatedCost: Number(data.estimatedCost !== undefined ? data.estimatedCost : list[index].estimatedCost),
      actualCost: Number(data.actualCost !== undefined ? data.actualCost : list[index].actualCost),
      laborCost: Number(data.laborCost !== undefined ? data.laborCost : list[index].laborCost),
      materialCost: Number(data.materialCost !== undefined ? data.materialCost : list[index].materialCost),
      hoursWorked: Number(data.hoursWorked !== undefined ? data.hoursWorked : list[index].hoursWorked),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('mock_work_orders', JSON.stringify(list));
    
    return list[index];
  }
};
