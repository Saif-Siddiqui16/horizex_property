export const generateFurnitureNumber = () => {
  const list = JSON.parse(localStorage.getItem('mock_furniture') || '[]');
  const nextNum = String(list.length + 1).padStart(4, '0');
  return `FUR-${nextNum}`;
};

export const furnitureService = {
  getAll: (filters = {}) => {
    let list = JSON.parse(localStorage.getItem('mock_furniture') || '[]');
    if (list.length === 0) {
      list = [
        {
          id: 'FUR-0001',
          furnitureNo: 'FUR-0001',
          name: 'Solid Oak Dining Set',
          category: 'Furniture',
          apartmentId: 'unit-101',
          buildingId: 'building-1',
          condition: 'Good',
          purchaseDate: '2023-05-12',
          warrantyDate: '2025-05-12',
          replacementCost: 1200.00,
          repairHistory: []
        },
        {
          id: 'FUR-0002',
          furnitureNo: 'FUR-0002',
          name: 'Stainless Steel Refrigerator',
          category: 'Appliance',
          apartmentId: 'unit-202',
          buildingId: 'building-2',
          condition: 'New',
          purchaseDate: '2025-06-01',
          warrantyDate: '2028-06-01',
          replacementCost: 1850.00,
          repairHistory: []
        },
        {
          id: 'FUR-0003',
          furnitureNo: 'FUR-0003',
          name: 'Front-Load Washing Machine',
          category: 'Appliance',
          apartmentId: 'unit-304',
          buildingId: 'building-1',
          condition: 'Needs Repair',
          purchaseDate: '2021-08-15',
          warrantyDate: '2023-08-15',
          replacementCost: 950.00,
          repairHistory: ['MR-2026-0001']
        }
      ];
      localStorage.setItem('mock_furniture', JSON.stringify(list));
    }

    if (filters.buildingId && filters.buildingId !== 'all') {
      list = list.filter(f => f.buildingId === filters.buildingId);
    }
    if (filters.apartmentId && filters.apartmentId !== 'all') {
      list = list.filter(f => f.apartmentId === filters.apartmentId);
    }
    if (filters.condition) {
      list = list.filter(f => f.condition === filters.condition);
    }

    return list;
  },

  create: (data) => {
    const list = JSON.parse(localStorage.getItem('mock_furniture') || '[]');
    const newItem = {
      ...data,
      id: generateFurnitureNumber(),
      furnitureNo: generateFurnitureNumber(),
      replacementCost: Number(data.replacementCost || 0),
      repairHistory: []
    };
    list.unshift(newItem);
    localStorage.setItem('mock_furniture', JSON.stringify(list));
    return newItem;
  },

  updateCondition: (id, newCondition) => {
    const list = JSON.parse(localStorage.getItem('mock_furniture') || '[]');
    const idx = list.findIndex(f => f.id === id);
    if (idx === -1) return null;

    list[idx].condition = newCondition;
    localStorage.setItem('mock_furniture', JSON.stringify(list));
    return list[idx];
  },

  addRepairLog: (id, requestId) => {
    const list = JSON.parse(localStorage.getItem('mock_furniture') || '[]');
    const idx = list.findIndex(f => f.id === id);
    if (idx === -1) return null;

    if (!list[idx].repairHistory.includes(requestId)) {
      list[idx].repairHistory.push(requestId);
    }
    localStorage.setItem('mock_furniture', JSON.stringify(list));
    return list[idx];
  }
};
