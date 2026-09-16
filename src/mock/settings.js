export const mockTaxSettings = [
  { id: 1, name: 'GST (Goods and Services Tax)', rate: 5.0, status: 'Active' },
  { id: 2, name: 'QST (Quebec Sales Tax)', rate: 9.975, status: 'Active' }
];

export const mockQuickBooksSettings = {
  connected: true,
  connectedEmail: 'finance@property.com',
  lastSyncTime: '2026-06-28T22:00:00Z',
  companyName: 'Saif Property Management Inc.'
};

export const mockChartOfAccounts = [
  { id: 1, code: '4000', name: 'Residential Rent Income', type: 'Revenue', balance: 154800 },
  { id: 2, code: '4100', name: 'Commercial Rent Income', type: 'Revenue', balance: 89000 },
  { id: 3, code: '5000', name: 'Repairs & Maintenance Expense', type: 'Expense', balance: 14500 },
  { id: 4, code: '5100', name: 'Property Management Fees', type: 'Expense', balance: 12000 },
  { id: 5, code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 4200 }
];
