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
    
    // Filter out any sample mock work orders
    list = list.filter(w => !String(w.id || '').startsWith('WO-2026-000'));

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
