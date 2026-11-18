export const DEFAULT_TEMPLATES = [];

export const reportBuilderService = {
  getDefaultTemplates(module) {
    return [];
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
