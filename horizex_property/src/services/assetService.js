export const generateAssetNumber = () => {
  const list = JSON.parse(localStorage.getItem('mock_assets') || '[]');
  const nextNum = String(list.length + 1).padStart(4, '0');
  return `AST-${nextNum}`;
};

export const assetService = {
  getAll: (filters = {}) => {
    let list = JSON.parse(localStorage.getItem('mock_assets') || '[]');
    
    // Filter out sample mock assets
    list = list.filter(a => !String(a.id || '').startsWith('AST-000'));

    // Filter by company
    const selectedCompany = localStorage.getItem('global_selected_company_id');
    const properties = JSON.parse(localStorage.getItem('mock_properties') || '[]');
    
    // Resolve building company IDs
    list = list.map(item => {
      const prop = properties.find(p => p.id === item.buildingId);
      return {
        ...item,
        companyId: prop ? prop.companyId : 'company-1'
      };
    });

    if (selectedCompany && selectedCompany !== 'all') {
      list = list.filter(a => a.companyId === selectedCompany);
    }

    if (filters.buildingId && filters.buildingId !== 'all') {
      list = list.filter(a => a.buildingId === filters.buildingId);
    }
    if (filters.status) {
      list = list.filter(a => a.status === filters.status);
    }
    if (filters.type) {
      list = list.filter(a => a.type === filters.type);
    }
    
    return list;
  },

  create: (data) => {
    const list = JSON.parse(localStorage.getItem('mock_assets') || '[]');
    const newAsset = {
      ...data,
      id: generateAssetNumber(),
      assetNo: generateAssetNumber(),
      status: 'Purchased',
      lifecycleHistory: [
        { status: 'Purchased', date: new Date().toISOString().split('T')[0], note: 'Asset added to inventory.' }
      ]
    };
    list.unshift(newAsset);
    localStorage.setItem('mock_assets', JSON.stringify(list));
    return newAsset;
  },

  updateLifecycle: (id, newStatus, note = '') => {
    const list = JSON.parse(localStorage.getItem('mock_assets') || '[]');
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return null;

    list[idx].status = newStatus;
    list[idx].lifecycleHistory.push({
      status: newStatus,
      date: new Date().toISOString().split('T')[0],
      note: note || `State transitioned to ${newStatus}`
    });

    localStorage.setItem('mock_assets', JSON.stringify(list));
    return list[idx];
  },

  getRepairHistory: (id) => {
    const requests = JSON.parse(localStorage.getItem('mock_maintenance_requests') || '[]');
    // Filter requests matching this asset description or mapped directly
    return requests.filter(r => r.description.toLowerCase().includes(id.toLowerCase()) || r.id === id);
  }
};
