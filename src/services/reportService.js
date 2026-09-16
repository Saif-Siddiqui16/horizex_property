import analyticsEngineService from './analyticsEngineService';

const AUDIT_KEY = 'mock_generated_reports';

export const reportService = {
  getStore(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getAuditLogs() {
    return this.getStore(AUDIT_KEY);
  },

  logReportGeneration(reportType, filtersUsed, exportType = 'Screen') {
    const logs = this.getAuditLogs();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newLog = {
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      generatedBy: user.name || 'Admin User',
      reportType,
      filtersUsed,
      exportType
    };
    logs.push(newLog);
    this.setStore(AUDIT_KEY, logs);
    return newLog;
  },

  generate(reportType, filters = {}) {
    const companyId = filters.companyId || '';
    const buildingId = filters.buildingId || '';
    const dateStart = filters.dateStart || '';
    const dateEnd = filters.dateEnd || '';

    // Log the audit event
    this.logReportGeneration(reportType, filters);

    switch (reportType) {
      case 'Rent Roll':
        return this.getRentRoll(companyId, buildingId);
      case 'Outstanding Balance':
        return this.getOutstandingBalance(companyId, buildingId);
      case 'Rent Collection':
        return this.getRentCollection(companyId, buildingId, dateStart, dateEnd);
      case 'Late Payments':
        return this.getLatePayments(companyId, buildingId);
      case 'Monthly Revenue':
        return this.getMonthlyRevenue(companyId, buildingId);
      case 'Vacancy Report':
        return this.getVacancyReport(companyId, buildingId);
      case 'Listing Status':
        return this.getListingStatus(companyId, buildingId);
      case 'Lease Expiry':
        return this.getLeaseExpiry(companyId, buildingId);
      case 'Renewal Status':
        return this.getRenewalStatus(companyId, buildingId);
      case 'Tenant Ledger':
        return this.getTenantLedger(filters.tenantId || '');
      case 'Aging Report':
        return this.getAgingReport(companyId, buildingId);
      case 'Active TAL Cases':
        return this.getTALCases(companyId, buildingId, 'Active');
      case 'Closed TAL Cases':
        return this.getTALCases(companyId, buildingId, 'Closed');
      case 'Attendance Summary':
        return this.getAttendanceSummary(companyId, buildingId);
      case 'Leave Summary':
        return this.getLeaveSummary(companyId, buildingId);
      case 'Payroll Cost':
        return this.getPayrollCost(companyId, buildingId);
      
      // Maintenance Placeholders
      case 'Outstanding Repairs':
        return this.getRepairsPlaceholder(companyId, buildingId, 'Pending');
      case 'Upcoming Repairs':
        return this.getRepairsPlaceholder(companyId, buildingId, 'Scheduled');
      case 'Repair Cost':
        return this.getRepairCostPlaceholder(companyId, buildingId);
      case 'Furniture Status':
        return this.getFurnitureStatusPlaceholder(companyId, buildingId);

      default:
        throw new Error(`Report type "${reportType}" is not supported.`);
    }
  },

  getRentRoll(companyId, buildingId) {
    const leases = analyticsEngineService.getLeases(companyId, buildingId);
    const apartments = analyticsEngineService.getApartments(companyId, buildingId);
    const tenants = this.getStore('mock_tenants');
    
    return leases.map(l => {
      const apt = apartments.find(a => a.id === l.unitId);
      const tenant = tenants.find(t => t.id === l.tenantId);
      return {
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : `Tenant #${l.tenantId}`,
        buildingName: apt ? apt.propertyName : 'Unknown Building',
        unitNumber: apt ? apt.unitNumber : 'Apt',
        rentAmount: l.rentAmount || 0,
        securityDeposit: l.securityDeposit || 0,
        startDate: l.startDate,
        endDate: l.endDate,
        status: l.status
      };
    });
  },

  getOutstandingBalance(companyId, buildingId) {
    const invoices = analyticsEngineService.getInvoices(companyId, buildingId);
    const unpaid = invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue' || inv.status === 'Partial Payment');
    const tenants = this.getStore('mock_tenants');
    const leases = this.getStore('mock_leases');
    const apartments = this.getStore('mock_apartments');

    return unpaid.map(inv => {
      const lease = leases.find(l => l.id === inv.leaseId);
      const tenant = lease ? tenants.find(t => t.id === lease.tenantId) : null;
      const apt = lease ? apartments.find(a => a.id === lease.unitId) : null;
      const amt = parseFloat(inv.amountDue || inv.amount || 0);
      return {
        invoiceNo: inv.invoiceNo || `INV-${inv.id}`,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A',
        buildingName: apt ? apt.propertyName : 'N/A',
        unitNumber: apt ? apt.unitNumber : 'N/A',
        dueDate: inv.dueDate,
        amount: amt,
        balance: inv.status === 'Paid' ? 0 : amt,
        status: inv.status
      };
    });
  },

  getRentCollection(companyId, buildingId, dateStart, dateEnd) {
    let invoices = analyticsEngineService.getInvoices(companyId, buildingId);
    if (dateStart) invoices = invoices.filter(inv => inv.dueDate >= dateStart);
    if (dateEnd) invoices = invoices.filter(inv => inv.dueDate <= dateEnd);

    const leases = this.getStore('mock_leases');
    const tenants = this.getStore('mock_tenants');

    return invoices.map(inv => {
      const lease = leases.find(l => l.id === inv.leaseId);
      const tenant = lease ? tenants.find(t => t.id === lease.tenantId) : null;
      const amt = parseFloat(inv.amountDue || inv.amount || 0);
      const isPaid = inv.status === 'Paid' || inv.status === 'Settled';
      return {
        invoiceNo: inv.invoiceNo || `INV-${inv.id}`,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A',
        dueDate: inv.dueDate,
        amount: amt,
        paidAmount: isPaid ? amt : 0,
        balance: isPaid ? 0 : amt,
        status: inv.status
      };
    });
  },

  getLatePayments(companyId, buildingId) {
    const invoices = analyticsEngineService.getInvoices(companyId, buildingId);
    // Overdue or Paid but paid late
    const overdue = invoices.filter(inv => inv.status === 'Overdue');
    const leases = this.getStore('mock_leases');
    const tenants = this.getStore('mock_tenants');

    return overdue.map(inv => {
      const lease = leases.find(l => l.id === inv.leaseId);
      const tenant = lease ? tenants.find(t => t.id === lease.tenantId) : null;
      // Calculate days overdue
      const due = new Date(inv.dueDate);
      const today = new Date();
      const diffTime = Math.abs(today - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        invoiceNo: inv.invoiceNo || `INV-${inv.id}`,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A',
        dueDate: inv.dueDate,
        amount: parseFloat(inv.amountDue || inv.amount || 0),
        daysLate: diffDays,
        penaltyFee: diffDays > 5 ? 50 : 0
      };
    });
  },

  getMonthlyRevenue(companyId, buildingId) {
    return analyticsEngineService.getRevenueTrend(companyId, buildingId);
  },

  getVacancyReport(companyId, buildingId) {
    const apartments = analyticsEngineService.getApartments(companyId, buildingId);
    const vacant = apartments.filter(a => a.status === 'Vacant' || a.status === 'Available');

    return vacant.map(apt => ({
      buildingName: apt.propertyName,
      unitNumber: apt.unitNumber,
      unitType: apt.unitType || 'Apartment',
      monthlyRent: apt.monthlyRent || 1200,
      bedrooms: apt.bedrooms || 1,
      bathrooms: apt.bathrooms || 1
    }));
  },

  getListingStatus(companyId, buildingId) {
    const apartments = analyticsEngineService.getApartments(companyId, buildingId);
    return apartments.map(apt => ({
      buildingName: apt.propertyName,
      unitNumber: apt.unitNumber,
      status: apt.status || 'Leased',
      monthlyRent: apt.monthlyRent || 1200,
      listingStatus: apt.status === 'Vacant' ? 'Listed' : 'Unlisted'
    }));
  },

  getLeaseExpiry(companyId, buildingId) {
    const leases = analyticsEngineService.getLeases(companyId, buildingId);
    const active = leases.filter(l => l.status === 'Active');
    const tenants = this.getStore('mock_tenants');
    const apartments = this.getStore('mock_apartments');

    return active.map(l => {
      const tenant = tenants.find(t => t.id === l.tenantId);
      const apt = apartments.find(a => a.id === l.unitId);
      
      const expiry = new Date(l.endDate);
      const today = new Date();
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A',
        buildingName: apt ? apt.propertyName : 'N/A',
        unitNumber: apt ? apt.unitNumber : 'N/A',
        endDate: l.endDate,
        daysRemaining: diffDays,
        status: diffDays < 60 ? 'Critical (Expiring Soon)' : 'Stable'
      };
    });
  },

  getRenewalStatus(companyId, buildingId) {
    const renewals = this.getStore('mock_renewals');
    const apartments = analyticsEngineService.getApartments(companyId, buildingId);
    const aptIds = apartments.map(a => a.id);
    const tenants = this.getStore('mock_tenants');

    return renewals.filter(r => aptIds.includes(r.unitId)).map(r => {
      const tenant = tenants.find(t => t.id === r.tenantId);
      const apt = apartments.find(a => a.id === r.unitId);
      return {
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A',
        buildingName: apt ? apt.propertyName : 'N/A',
        unitNumber: apt ? apt.unitNumber : 'N/A',
        currentRent: r.currentRent || 1200,
        proposedRent: r.proposedRent || 1250,
        status: r.status,
        deadline: r.responseDeadline || 'N/A'
      };
    });
  },

  getTenantLedger(tenantId) {
    if (!tenantId) return [];
    const invoices = this.getStore('mock_invoices');
    const leases = this.getStore('mock_leases');
    const tenantLeases = leases.filter(l => String(l.tenantId) === String(tenantId));
    const leaseIds = tenantLeases.map(l => l.id);

    const filteredInvoices = invoices.filter(inv => leaseIds.includes(inv.leaseId));

    return filteredInvoices.map(inv => {
      const amt = parseFloat(inv.amountDue || inv.amount || 0);
      const isPaid = inv.status === 'Paid' || inv.status === 'Settled';
      return {
        invoiceNo: inv.invoiceNo || `INV-${inv.id}`,
        dueDate: inv.dueDate,
        type: inv.category || inv.type || 'Rent',
        amount: amt,
        paid: isPaid ? amt : 0,
        balance: isPaid ? 0 : amt,
        status: inv.status
      };
    });
  },

  getAgingReport(companyId, buildingId) {
    const invoices = analyticsEngineService.getInvoices(companyId, buildingId);
    const unpaid = invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue');
    const tenants = this.getStore('mock_tenants');
    const leases = this.getStore('mock_leases');

    return unpaid.map(inv => {
      const lease = leases.find(l => l.id === inv.leaseId);
      const tenant = lease ? tenants.find(t => t.id === lease.tenantId) : null;
      
      const due = new Date(inv.dueDate);
      const today = new Date();
      const diffTime = today - due;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let bucket = 'Current';
      if (diffDays > 90) bucket = '90+ Days';
      else if (diffDays > 60) bucket = '61-90 Days';
      else if (diffDays > 30) bucket = '31-60 Days';
      else if (diffDays > 0) bucket = '1-30 Days';

      return {
        invoiceNo: inv.invoiceNo || `INV-${inv.id}`,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A',
        amount: parseFloat(inv.amountDue || inv.amount || 0),
        daysOutstanding: diffDays > 0 ? diffDays : 0,
        bucket
      };
    });
  },

  getTALCases(companyId, buildingId, filterStatus) {
    const cases = this.getStore('mock_tal_cases');
    const apartments = analyticsEngineService.getApartments(companyId, buildingId);
    const aptIds = apartments.map(a => a.id);
    const tenants = this.getStore('mock_tenants');

    const filtered = cases.filter(c => aptIds.includes(c.unitId));

    const finalCases = filterStatus === 'Active' 
      ? filtered.filter(c => c.status !== 'Closed' && c.status !== 'Resolved')
      : filtered.filter(c => c.status === 'Closed' || c.status === 'Resolved');

    return finalCases.map(c => {
      const apt = apartments.find(a => a.id === c.unitId);
      const tenant = tenants.find(t => t.id === c.tenantId);
      return {
        caseNo: c.caseNumber || `TAL-${c.id}`,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A',
        buildingName: apt ? apt.propertyName : 'N/A',
        unitNumber: apt ? apt.unitNumber : 'N/A',
        category: c.category || 'Rent Arrears',
        status: c.status,
        hearDate: c.hearingDate || 'N/A',
        outcome: c.outcome || 'Pending'
      };
    });
  },

  getAttendanceSummary(companyId, buildingId) {
    const logs = this.getStore('mock_attendance');
    const employees = analyticsEngineService.getEmployees(companyId, buildingId);
    const empIds = employees.map(e => e.id);

    return logs.filter(l => empIds.includes(l.employeeId)).map(l => {
      const emp = employees.find(e => e.id === l.employeeId);
      return {
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'N/A',
        employeeNo: emp ? emp.employeeNo : 'N/A',
        department: emp ? emp.department : 'N/A',
        date: l.date,
        status: l.status,
        clockIn: l.clockIn ? new Date(l.clockIn).toLocaleTimeString() : 'N/A',
        clockOut: l.clockOut ? new Date(l.clockOut).toLocaleTimeString() : 'N/A',
        totalHours: l.totalHours || 0
      };
    });
  },

  getLeaveSummary(companyId, buildingId) {
    const leaves = this.getStore('mock_leaves');
    const employees = analyticsEngineService.getEmployees(companyId, buildingId);
    const empIds = employees.map(e => e.id);

    return leaves.filter(lv => empIds.includes(lv.employeeId)).map(lv => {
      const emp = employees.find(e => e.id === lv.employeeId);
      return {
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'N/A',
        employeeNo: emp ? emp.employeeNo : 'N/A',
        leaveType: lv.leaveType,
        startDate: lv.startDate,
        endDate: lv.endDate,
        status: lv.status
      };
    });
  },

  getPayrollCost(companyId, buildingId) {
    const payroll = this.getStore('mock_payroll');
    const employees = analyticsEngineService.getEmployees(companyId, buildingId);
    const empIds = employees.map(e => e.id);

    return payroll.filter(p => empIds.includes(p.employeeId)).map(p => {
      const emp = employees.find(e => e.id === p.employeeId);
      return {
        payrollNo: p.payrollNo,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'N/A',
        employeeNo: emp ? emp.employeeNo : 'N/A',
        department: emp ? emp.department : 'N/A',
        basicSalary: p.basicSalary || 0,
        allowances: p.allowances || 0,
        overtimePay: p.overtimePay || 0,
        deductions: p.deductions || 0,
        tax: p.tax || 0,
        netSalary: p.netSalary || 0,
        status: p.status
      };
    });
  },

  // Maintenance Placeholders
  getRepairsPlaceholder(companyId, buildingId, filterStatus) {
    const sampleRepairs = [
      { id: 1, title: 'Plumbing leak in kitchen', priority: 'High', building: 'Parkview Heights', unit: 'Apt 104', assignedTo: 'John Plumber', status: 'Pending', cost: 150 },
      { id: 2, title: 'HVAC filter replacement', priority: 'Medium', building: 'Sunset Towers', unit: 'Apt 302', assignedTo: 'Mike Tech', status: 'Scheduled', cost: 75 },
      { id: 3, title: 'Broken lock replacement', priority: 'Low', building: 'Parkview Heights', unit: 'Apt 201', assignedTo: 'Locksmith L', status: 'Pending', cost: 120 }
    ];

    let list = sampleRepairs;
    if (buildingId) {
      list = list.filter(r => r.building.includes(buildingId === '1' ? 'Parkview' : 'Sunset'));
    }
    return list.filter(r => r.status === filterStatus);
  },

  getRepairCostPlaceholder(companyId, buildingId) {
    const sampleCosts = [
      { building: 'Parkview Heights', month: 'Jun 26', repairsCount: 15, totalCost: 2450 },
      { building: 'Sunset Towers', month: 'Jun 26', repairsCount: 8, totalCost: 1200 },
      { building: 'Ocean View', month: 'Jun 26', repairsCount: 4, totalCost: 650 }
    ];

    if (buildingId) {
      return sampleCosts.filter(c => c.building.includes(buildingId === '1' ? 'Parkview' : 'Sunset'));
    }
    return sampleCosts;
  },

  getFurnitureStatusPlaceholder(companyId, buildingId) {
    const items = [
      { unit: 'Apt 104', item: 'Refrigerator', brand: 'Samsung', condition: 'Excellent', status: 'Included' },
      { unit: 'Apt 104', item: 'Microwave', brand: 'LG', condition: 'Good', status: 'Included' },
      { unit: 'Apt 201', item: 'Dishwasher', brand: 'Bosch', condition: 'Needs Repair', status: 'Under Maintenance' },
      { unit: 'Apt 302', item: 'Washing Machine', brand: 'Whirlpool', condition: 'Excellent', status: 'Included' }
    ];
    return items;
  }
};

export default reportService;
