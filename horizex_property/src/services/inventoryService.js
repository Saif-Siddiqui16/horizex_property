import { notificationService } from './notificationService';

export const generateInventoryNumber = () => {
  const parts = JSON.parse(localStorage.getItem('mock_inventory') || '[]');
  const nextNum = String(parts.length + 1).padStart(4, '0');
  return `INV-${nextNum}`;
};

export const inventoryService = {
  getAllParts: () => {
    let parts = JSON.parse(localStorage.getItem('mock_inventory') || '[]');
    parts = parts.filter(p => !['INV-0001', 'INV-0002', 'INV-0003', 'INV-0004'].includes(p.id) && !['INV-0001', 'INV-0002', 'INV-0003', 'INV-0004'].includes(p.partNo));

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
