export const analyticsEngineService = {
  getStore(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  getProperties(companyId = '') {
    const list = this.getStore('mock_properties');
    if (companyId) {
      return list.filter(p => String(p.companyId) === String(companyId));
    }
    return list;
  },

  getApartments(companyId = '', buildingId = '') {
    let list = this.getStore('mock_apartments');
    const properties = this.getProperties(companyId);
    const propIds = properties.map(p => p.id);
    
    list = list.filter(apt => propIds.includes(apt.propertyId));

    if (buildingId) {
      list = list.filter(apt => String(apt.propertyId) === String(buildingId));
    }
    return list;
  },

  getLeases(companyId = '', buildingId = '') {
    let list = this.getStore('mock_leases');
    const apartments = this.getApartments(companyId, buildingId);
    const aptIds = apartments.map(a => a.id);
    return list.filter(l => aptIds.includes(l.unitId));
  },

  getInvoices(companyId = '', buildingId = '') {
    let list = this.getStore('mock_invoices');
    const leases = this.getLeases(companyId, buildingId);
    const leaseIds = leases.map(l => l.id);
    return list.filter(inv => leaseIds.includes(inv.leaseId));
  },

  getEmployees(companyId = '', buildingId = '') {
    let list = this.getStore('mock_employees');
    if (companyId) {
      list = list.filter(emp => String(emp.companyId) === String(companyId));
    }
    if (buildingId) {
      list = list.filter(emp => String(emp.buildingId) === String(buildingId));
    }
    return list;
  },

  getRevenueTrend(companyId = '', buildingId = '') {
    const invoices = this.getInvoices(companyId, buildingId);
    const monthlyMap = {};

    invoices.forEach(inv => {
      // e.g. inv.dueDate might look like "2026-06-01"
      const date = new Date(inv.dueDate);
      if (isNaN(date.getTime())) return;
      const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g. "Jun 26"
      
      if (!monthlyMap[monthLabel]) {
        monthlyMap[monthLabel] = { month: monthLabel, revenue: 0, rent: 0, other: 0 };
      }
      const amt = parseFloat(inv.amountDue || inv.amount || 0);
      monthlyMap[monthLabel].revenue += amt;
      if (inv.category === 'Rent' || inv.type === 'Rent') {
        monthlyMap[monthLabel].rent += amt;
      } else {
        monthlyMap[monthLabel].other += amt;
      }
    });

    // Return chronological order of last 6 months
    const order = ['Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26'];
    return order.filter(m => monthlyMap[m] || m === 'Jun 26').map(m => monthlyMap[m] || { month: m, revenue: 0, rent: 0, other: 0 });
  },

  getOccupancyTrend(companyId = '', buildingId = '') {
    const apartments = this.getApartments(companyId, buildingId);
    const total = apartments.length;
    const occupied = apartments.filter(a => a.status === 'Leased' || a.status === 'Occupied').length;
    const vacant = total - occupied;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return {
      total,
      occupied,
      vacant,
      rate
    };
  },

  getCollectionTrend(companyId = '', buildingId = '') {
    const invoices = this.getInvoices(companyId, buildingId);
    const paid = invoices.filter(inv => inv.status === 'Paid' || inv.status === 'Settled').reduce((s, i) => s + parseFloat(i.amountDue || i.amount || 0), 0);
    const unpaid = invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue').reduce((s, i) => s + parseFloat(i.amountDue || i.amount || 0), 0);
    const partial = invoices.filter(inv => inv.status === 'Partial Payment').reduce((s, i) => s + parseFloat(i.amountDue || i.amount || 0), 0);
    const total = paid + unpaid + partial;

    const rate = total > 0 ? Math.round(((paid + partial * 0.5) / total) * 100) : 100;
    return {
      paid,
      unpaid,
      partial,
      total,
      rate
    };
  },

  getRenewalTrend(companyId = '', buildingId = '') {
    const renewals = this.getStore('mock_renewals');
    // Filter renewals linked to selected apartments
    const apartments = this.getApartments(companyId, buildingId);
    const aptIds = apartments.map(a => a.id);
    const filtered = renewals.filter(r => aptIds.includes(r.unitId));

    const total = filtered.length;
    const accepted = filtered.filter(r => r.status === 'Accepted' || r.status === 'Renewed').length;
    const rejected = filtered.filter(r => r.status === 'Refused' || r.status === 'Terminated').length;
    const pending = total - accepted - rejected;

    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 100;

    return {
      total,
      accepted,
      rejected,
      pending,
      successRate
    };
  },

  getPayrollTrend(companyId = '', buildingId = '') {
    const payroll = this.getStore('mock_payroll');
    const employees = this.getEmployees(companyId, buildingId);
    const empIds = employees.map(e => e.id);
    const filtered = payroll.filter(p => empIds.includes(p.employeeId));

    const totalCost = filtered.reduce((s, p) => s + parseFloat(p.netSalary || 0), 0);
    const overtimeCost = filtered.reduce((s, p) => s + parseFloat(p.overtimePay || 0), 0);
    const allowancesCost = filtered.reduce((s, p) => s + parseFloat(p.allowances || 0), 0);

    return {
      totalCost,
      overtimeCost,
      allowancesCost,
      count: filtered.length
    };
  },

  getAttendanceTrend(companyId = '', buildingId = '') {
    const attendance = this.getStore('mock_attendance');
    const employees = this.getEmployees(companyId, buildingId);
    const empIds = employees.map(e => e.id);
    const filtered = attendance.filter(a => empIds.includes(a.employeeId));

    const present = filtered.filter(a => a.status === 'Present').length;
    const absent = filtered.filter(a => a.status === 'Absent').length;
    const late = filtered.filter(a => a.status === 'Late').length;
    const total = present + absent + late;

    const presentPct = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
    const latePct = total > 0 ? Math.round((late / total) * 100) : 0;
    const leavePct = total > 0 ? Math.round((absent / total) * 100) : 0;

    return {
      presentPct,
      latePct,
      leavePct,
      totalLogs: total
    };
  },

  getTalTrend(companyId = '', buildingId = '') {
    const cases = this.getStore('mock_tal_cases');
    const apartments = this.getApartments(companyId, buildingId);
    const aptIds = apartments.map(a => a.id);
    const filtered = cases.filter(c => aptIds.includes(c.unitId));

    const active = filtered.filter(c => c.status === 'Active' || c.status === 'Pending Hearing').length;
    const closed = filtered.filter(c => c.status === 'Closed' || c.status === 'Resolved').length;
    const total = active + closed;

    const won = filtered.filter(c => c.outcome === 'Won' || c.outcome === 'Favorable').length;
    const successRate = total > 0 ? Math.round((won / total) * 100) : 100;

    return {
      active,
      closed,
      total,
      successRate
    };
  }
};

export default analyticsEngineService;
