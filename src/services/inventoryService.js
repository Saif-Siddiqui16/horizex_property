import { notificationService } from './notificationService';

export const generateInventoryNumber = () => {
  const parts = JSON.parse(localStorage.getItem('mock_inventory') || '[]');
  const nextNum = String(parts.length + 1).padStart(4, '0');
  return `INV-${nextNum}`;
};

export const inventoryService = {
  getAllParts: () => {
    let parts = JSON.parse(localStorage.getItem('mock_inventory') || '[]');
    if (parts.length === 0) {
      parts = [
        {
          id: 'INV-0001',
          partNo: 'INV-0001',
          name: 'Copper Pipe Joint 3/4"',
          category: 'Plumbing',
          supplier: 'Apex Plumbing Solutions',
          unitCost: 12.50,
          minimumStock: 10
        },
        {
          id: 'INV-0002',
          partNo: 'INV-0002',
          name: 'HVAC Air Filter 16x25x1',
          category: 'HVAC',
          supplier: 'Nordic HVAC Systems',
          unitCost: 18.00,
          minimumStock: 15
        },
        {
          id: 'INV-0003',
          partNo: 'INV-0003',
          name: 'LED Bulb 9W (10-pack)',
          category: 'Electrical',
          supplier: 'ElectroCorp Montreal',
          unitCost: 22.00,
          minimumStock: 8
        },
        {
          id: 'INV-0004',
          partNo: 'INV-0004',
          name: 'Elevator Lift Cable Joint',
          category: 'Elevator',
          supplier: 'Otis Canada',
          unitCost: 450.00,
          minimumStock: 2
        }
      ];
      localStorage.setItem('mock_inventory', JSON.stringify(parts));

      // Seed initial movements (Initial Purchase)
      const initialMovements = [
        { id: 'MVT-0001', partId: 'INV-0001', type: 'Purchase', quantity: 25, note: 'Initial stock load', createdAt: '2026-06-01T08:00:00Z' },
        { id: 'MVT-0002', partId: 'INV-0002', type: 'Purchase', quantity: 30, note: 'Initial stock load', createdAt: '2026-06-01T08:00:00Z' },
        { id: 'MVT-0003', partId: 'INV-0003', type: 'Purchase', quantity: 5, note: 'Initial low load', createdAt: '2026-06-01T08:00:00Z' }, // Below min stock (8)
        { id: 'MVT-0004', partId: 'INV-0004', type: 'Purchase', quantity: 4, note: 'Initial stock load', createdAt: '2026-06-01T08:00:00Z' },
        
        // Log consumption
        { id: 'MVT-0005', partId: 'INV-0001', type: 'Consumption', quantity: 5, note: 'Used on request MR-2026-0001', createdAt: '2026-06-25T11:00:00Z' }
      ];
      localStorage.setItem('mock_inventory_movements', JSON.stringify(initialMovements));
    }

    // Map current stock and alerts dynamically
    return parts.map(part => {
      const stock = inventoryService.getCurrentStock(part.id);
      return {
        ...part,
        currentStock: stock,
        isLowStock: stock <= part.minimumStock
      };
    });
  },

  getCurrentStock: (partId) => {
    const movements = JSON.parse(localStorage.getItem('mock_inventory_movements') || '[]');
    let stock = 0;
    movements.filter(m => m.partId === partId).forEach(m => {
      if (m.type === 'Purchase' || m.type === 'Return' || (m.type === 'Adjustment' && m.quantity > 0)) {
        stock += m.quantity;
      } else if (m.type === 'Issue' || m.type === 'Consumption' || (m.type === 'Adjustment' && m.quantity < 0) || m.type === 'Transfer') {
        stock -= Math.abs(m.quantity);
      }
    });
    return stock;
  },

  getMovements: (partId = null) => {
    const list = JSON.parse(localStorage.getItem('mock_inventory_movements') || '[]');
    if (partId) {
      return list.filter(m => m.partId === partId);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  logMovement: (partId, type, quantity, note = '') => {
    const movements = JSON.parse(localStorage.getItem('mock_inventory_movements') || '[]');
    const nextId = `MVT-${String(movements.length + 1).padStart(4, '0')}`;
    const newMvt = {
      id: nextId,
      partId,
      type, // Purchase, Issue, Return, Adjustment, Transfer, Consumption
      quantity: Number(quantity),
      note,
      createdAt: new Date().toISOString()
    };
    movements.unshift(newMvt);
    localStorage.setItem('mock_inventory_movements', JSON.stringify(movements));

    // Check low stock trigger
    const parts = JSON.parse(localStorage.getItem('mock_inventory') || '[]');
    const part = parts.find(p => p.id === partId);
    if (part) {
      const currentStock = inventoryService.getCurrentStock(partId);
      if (currentStock <= part.minimumStock) {
        try {
          notificationService.create({
            category: 'Rent',
            title: 'Low Stock Alert',
            description: `Part ${part.name} has fallen below minimum threshold. Current: ${currentStock}`,
            priority: 'Medium'
          });
        } catch(e) {}
      }
    }

    return newMvt;
  },

  createPart: (data) => {
    const list = JSON.parse(localStorage.getItem('mock_inventory') || '[]');
    const newPart = {
      ...data,
      id: generateInventoryNumber(),
      partNo: generateInventoryNumber(),
      unitCost: Number(data.unitCost || 0),
      minimumStock: Number(data.minimumStock || 0)
    };
    list.unshift(newPart);
    localStorage.setItem('mock_inventory', JSON.stringify(list));

    // Register initial purchase movement
    if (data.initialStock > 0) {
      inventoryService.logMovement(newPart.id, 'Purchase', data.initialStock, 'Initial stock loading');
    }

    return newPart;
  }
};
