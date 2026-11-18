export const generateFurnitureNumber = () => {
  const list = JSON.parse(localStorage.getItem('mock_furniture') || '[]');
  const nextNum = String(list.length + 1).padStart(4, '0');
  return `FUR-${nextNum}`;
};

export const furnitureService = {
  getAll: (filters = {}) => {
    let list = JSON.parse(localStorage.getItem('mock_furniture') || '[]');
    
    // Filter out sample mock furniture
    list = list.filter(f => !String(f.id || '').startsWith('FUR-000'));

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
