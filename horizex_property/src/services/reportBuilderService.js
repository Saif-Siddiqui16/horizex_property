export const DEFAULT_TEMPLATES = [
  {
    id: 'temp-fin-1',
    templateName: 'Unpaid Rent Collections',
    module: 'Financials',
    selectedColumns: ['invoiceNo', 'tenantName', 'buildingName', 'unitNumber', 'dueDate', 'amount', 'balance', 'status'],
    filters: {},
    grouping: 'buildingName',
    sorting: { column: 'dueDate', direction: 'asc' },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'temp-prop-1',
    templateName: 'Vacant Units Overview',
    module: 'Properties',
    selectedColumns: ['buildingName', 'unitNumber', 'unitType', 'monthlyRent', 'status'],
    filters: {},
    grouping: 'buildingName',
    sorting: { column: 'buildingName', direction: 'asc' },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'temp-lease-1',
    templateName: 'Upcoming Lease Renewals',
    module: 'Leases',
    selectedColumns: ['tenantName', 'buildingName', 'unitNumber', 'endDate', 'daysRemaining', 'status'],
    filters: {},
    grouping: 'buildingName',
    sorting: { column: 'endDate', direction: 'asc' },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'temp-tal-1',
    templateName: 'Active Court Litigations',
    module: 'TAL Cases',
    selectedColumns: ['caseNo', 'tenantName', 'buildingName', 'unitNumber', 'category', 'status', 'hearDate'],
    filters: {},
    grouping: 'buildingName',
    sorting: { column: 'caseNo', direction: 'asc' },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'temp-pay-1',
    templateName: 'Monthly Payroll Payouts',
    module: 'Payroll',
    selectedColumns: ['employeeName', 'department', 'grossAmount', 'deductions', 'netAmount', 'payrollMonth'],
    filters: {},
    grouping: 'department',
    sorting: { column: 'grossAmount', direction: 'desc' },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const reportBuilderService = {
  getDefaultTemplates(module) {
    if (!module) return DEFAULT_TEMPLATES;
    return DEFAULT_TEMPLATES.filter((t) => t.module === module);
  },

  getAvailableColumns(module) {
    switch (module) {
      case 'Financials':
        return [
          { key: 'invoiceNo', label: 'Invoice No' },
          { key: 'tenantName', label: 'Tenant Name' },
          { key: 'buildingName', label: 'Building Name' },
          { key: 'unitNumber', label: 'Unit / Apartment' },
          { key: 'dueDate', label: 'Due Date' },
          { key: 'amount', label: 'Total Amount' },
          { key: 'balance', label: 'Outstanding Balance' },
          { key: 'status', label: 'Invoice Status' },
        ];
      case 'Properties':
        return [
          { key: 'buildingName', label: 'Building Name' },
          { key: 'unitNumber', label: 'Unit Number' },
          { key: 'unitType', label: 'Apartment Type' },
          { key: 'monthlyRent', label: 'Monthly Rent' },
          { key: 'status', label: 'Lease Status' },
        ];
      case 'Leases':
        return [
          { key: 'tenantName', label: 'Tenant Name' },
          { key: 'buildingName', label: 'Building Name' },
          { key: 'unitNumber', label: 'Unit / Apartment' },
          { key: 'endDate', label: 'Expiration Date' },
          { key: 'daysRemaining', label: 'Days Remaining' },
          { key: 'status', label: 'Status' },
        ];
      case 'TAL Cases':
        return [
          { key: 'caseNo', label: 'Case Number' },
          { key: 'tenantName', label: 'Tenant Name' },
          { key: 'buildingName', label: 'Building Name' },
          { key: 'unitNumber', label: 'Unit / Apartment' },
          { key: 'category', label: 'Dispute Category' },
          { key: 'status', label: 'Tribunal Status' },
          { key: 'hearDate', label: 'Hearing Date' },
        ];
      case 'Payroll':
        return [
          { key: 'employeeName', label: 'Employee Name' },
          { key: 'department', label: 'Role / Department' },
          { key: 'grossAmount', label: 'Gross Earnings' },
          { key: 'deductions', label: 'Deductions' },
          { key: 'netAmount', label: 'Net Payout' },
          { key: 'payrollMonth', label: 'Payroll Month' },
        ];
      default:
        return [];
    }
  },
};

export default reportBuilderService;
