export const generateVendorNumber = () => {
  const vendors = JSON.parse(localStorage.getItem('mock_vendors') || '[]');
  const nextNum = String(vendors.length + 1).padStart(4, '0');
  return `VEN-${nextNum}`;
};

export const vendorService = {
  getAll: () => {
    const list = JSON.parse(localStorage.getItem('mock_vendors') || '[]');
    return list.filter(v => !['vendor-1', 'vendor-2', 'vendor-3'].includes(v.id) && !['Apex Plumbing Solutions', 'Nordic HVAC Systems', 'ElectroCorp'].includes(v.name));
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
