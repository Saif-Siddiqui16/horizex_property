export const generateAssetNumber = () => {
  const list = JSON.parse(localStorage.getItem('mock_assets') || '[]');
  const nextNum = String(list.length + 1).padStart(4, '0');
  return `AST-${nextNum}`;
};

export const assetService = {
  getAll: (filters = {}) => {
    let list = JSON.parse(localStorage.getItem('mock_assets') || '[]');
    if (list.length === 0) {
      list = [
        {
          id: 'AST-0001',
          assetNo: 'AST-0001',
          name: 'Carrier HVAC Boiler System',
          type: 'HVAC',
          serialNumber: 'CARR-88390-H',
          purchaseDate: '2022-04-10',
          warrantyDate: '2027-04-10',
          condition: 'Good',
          buildingId: 'building-1',
          apartmentId: 'unit-101',
          tenantId: 'tenant-1',
          status: 'Active',
          lifecycleHistory: [
            { status: 'Purchased', date: '2022-04-10', note: 'Initial asset procurement.' },
            { status: 'Installed', date: '2022-04-12', note: 'Installed in main basement furnace room.' },
            { status: 'Active', date: '2022-04-12', note: 'Operational ignition.' }
          ]
        },
        {
          id: 'AST-0002',
          assetNo: 'AST-0002',
          name: 'Otis Smart Elevator Engine',
          type: 'Elevator',
          serialNumber: 'OTIS-992-M',
          purchaseDate: '2023-01-15',
          warrantyDate: '2028-01-15',
          condition: 'Excellent',
          buildingId: 'building-2',
          apartmentId: '',
          tenantId: '',
          status: 'Active',
          lifecycleHistory: [
            { status: 'Purchased', date: '2023-01-15', note: 'Procured with warranty extension.' },
            { status: 'Installed', date: '2023-01-20', note: 'Tension rails certified.' },
            { status: 'Active', date: '2023-01-20', note: 'Elevator operational.' }
          ]
        },
        {
          id: 'AST-0003',
          assetNo: 'AST-0003',
          name: 'Water Filtration Unit',
          type: 'Water',
          serialNumber: 'FILT-7729-WF',
          purchaseDate: '2024-05-18',
          warrantyDate: '2025-05-18', // Expired!
          condition: 'Fair',
          buildingId: 'building-1',
          apartmentId: 'unit-304',
          tenantId: 'tenant-3',
          status: 'Under Repair',
          lifecycleHistory: [
            { status: 'Purchased', date: '2024-05-18', note: 'Standard unit acquisition.' },
            { status: 'Installed', date: '2024-05-20', note: 'Hooked to unit 304 lines.' },
            { status: 'Active', date: '2024-05-20', note: 'Active.' },
            { status: 'Under Repair', date: '2026-06-25', note: 'Fittings show corrosion, plumber engaged.' }
          ]
        }
      ];
      localStorage.setItem('mock_assets', JSON.stringify(list));
    }

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
