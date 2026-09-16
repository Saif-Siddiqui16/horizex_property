const TEMPLATES_KEY = 'mock_saved_report_templates';

export const reportBuilderService = {
  getStore() {
    const list = localStorage.getItem(TEMPLATES_KEY);
    if (!list) {
      const defaults = [
        {
          id: 'temp-1',
          templateName: 'Soros Unpaid Leases',
          module: 'Financials',
          selectedColumns: ['tenantName', 'unitNumber', 'balance', 'status'],
          filters: { companyId: '2', status: 'Unpaid' },
          grouping: 'buildingName',
          sorting: { column: 'dueDate', direction: 'asc' },
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(list);
  },

  setStore(data) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(data));
  },

  getTemplatesByModule(module) {
    return this.getStore().filter(t => t.module === module);
  },

  saveTemplate(template) {
    if (!template.templateName || !template.module) {
      throw new Error('Template Name and Module are required.');
    }
    const list = this.getStore();
    const newTemplate = {
      id: template.id || `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...template
    };

    const idx = list.findIndex(t => t.id === newTemplate.id);
    if (idx !== -1) {
      list[idx] = newTemplate;
    } else {
      list.push(newTemplate);
    }

    this.setStore(list);
    return newTemplate;
  },

  deleteTemplate(id) {
    let list = this.getStore();
    list = list.filter(t => t.id !== id);
    this.setStore(list);
    return true;
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
          { key: 'status', label: 'Invoice Status' }
        ];
      case 'Properties':
        return [
          { key: 'buildingName', label: 'Building Name' },
          { key: 'unitNumber', label: 'Unit Number' },
          { key: 'unitType', label: 'Apartment Type' },
          { key: 'monthlyRent', label: 'Monthly Rent' },
          { key: 'status', label: 'Lease Status' }
        ];
      case 'Leases':
        return [
          { key: 'tenantName', label: 'Tenant Name' },
          { key: 'buildingName', label: 'Building Name' },
          { key: 'unitNumber', label: 'Unit / Apartment' },
          { key: 'endDate', label: 'Expiration Date' },
          { key: 'daysRemaining', label: 'Days Remaining' },
          { key: 'status', label: 'Status' }
        ];
      case 'TAL Cases':
        return [
          { key: 'caseNo', label: 'Case Number' },
          { key: 'tenantName', label: 'Tenant Name' },
          { key: 'buildingName', label: 'Building Name' },
          { key: 'unitNumber', label: 'Unit / Apartment' },
          { key: 'category', label: 'Dispute Category' },
          { key: 'status', label: 'Tribunal Status' },
          { key: 'hearDate', label: 'Hearing Date' }
        ];
      case 'Payroll':
        return [
          { key: 'payrollNo', label: 'Payroll Number' },
          { key: 'employeeName', label: 'Employee Name' },
          { key: 'employeeNo', label: 'Employee ID' },
          { key: 'department', label: 'Department' },
          { key: 'netSalary', label: 'Net Payout' },
          { key: 'overtimePay', label: 'Overtime Pay' },
          { key: 'status', label: 'Payout Status' }
        ];
      default:
        return [];
    }
  }
};

export default reportBuilderService;
