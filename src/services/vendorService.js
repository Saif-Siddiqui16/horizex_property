export const generateVendorNumber = () => {
  const vendors = JSON.parse(localStorage.getItem('mock_vendors') || '[]');
  const nextNum = String(vendors.length + 1).padStart(4, '0');
  return `VEN-${nextNum}`;
};

export const vendorService = {
  getAll: () => {
    let list = JSON.parse(localStorage.getItem('mock_vendors') || '[]');
    if (list.length === 0) {
      list = [
        {
          id: 'vendor-1',
          vendorNo: 'VEN-0001',
          name: 'Apex Plumbing Solutions',
          services: ['Plumbing', 'Drain Cleaning', 'Emergency Leaks'],
          contact: 'Jean-Luc Picard (514-555-0199)',
          rating: 4.7,
          contracts: ['Master Services Agreement 2026', 'Emergency Service SLA'],
          outstandingBills: 450.00,
          completedJobs: 14,
          status: 'Active'
        },
        {
          id: 'vendor-2',
          vendorNo: 'VEN-0002',
          name: 'Nordic HVAC Systems',
          services: ['Heating', 'Air Conditioning', 'Ventilation Repair'],
          contact: 'Karen Miller (514-555-0144)',
          rating: 4.2,
          contracts: ['Quarterly HVAC Maintenance Plan'],
          outstandingBills: 1200.00,
          completedJobs: 8,
          status: 'Active'
        },
        {
          id: 'vendor-3',
          vendorNo: 'VEN-0003',
          name: 'ElectroCorp Montreal',
          services: ['High Voltage Panels', 'Wiring', 'Fuse Repair'],
          contact: 'Robert Chen (514-555-0188)',
          rating: 4.9,
          contracts: ['General Electrical Maintenance contract'],
          outstandingBills: 0.00,
          completedJobs: 23,
          status: 'Active'
        }
      ];
      localStorage.setItem('mock_vendors', JSON.stringify(list));
    }
    return list;
  },

  create: (data) => {
    const list = JSON.parse(localStorage.getItem('mock_vendors') || '[]');
    const newVendor = {
      ...data,
      id: `vendor-${list.length + 1}`,
      vendorNo: generateVendorNumber(),
      rating: 5.0,
      completedJobs: 0,
      outstandingBills: Number(data.outstandingBills || 0),
      contracts: data.contracts || [],
      services: data.services || [],
      status: 'Active'
    };
    list.unshift(newVendor);
    localStorage.setItem('mock_vendors', JSON.stringify(list));
    return newVendor;
  },

  payBill: (id, amount) => {
    const list = JSON.parse(localStorage.getItem('mock_vendors') || '[]');
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) return null;

    list[idx].outstandingBills = Math.max(0, list[idx].outstandingBills - amount);
    localStorage.setItem('mock_vendors', JSON.stringify(list));
    return list[idx];
  }
};
