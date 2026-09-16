import { mockDashboardStats, mockRevenueAnalytics } from './dashboard';
import { mockProperties } from './properties';
import { mockApartments, mockUnitTypes } from './apartments';
import { mockTenants } from './tenants';
import { mockLeases } from './leases';
import { mockRenewals } from './renewals';
import { mockInvoices, mockPayments, mockCredits, mockAdjustments, mockRefunds } from './rentCollection';
import { mockEmployees, mockClockLogs } from './employees';
import { mockMaintenanceTickets } from './maintenance';
import { mockMoveIns, mockMoveOuts, mockPrepUnits, mockInspections, mockInspectionTemplates, mockResponseGroups } from './tasks';
import { mockDocuments } from './documents';
import { mockNotifications } from './notifications';
import { mockTalCases, mockCaseHearings, mockCaseDocuments, mockCaseNotes, mockCaseTasks, mockLawyers, mockJudges } from './talCases';
import { mockCalendarEvents } from './calendar';
import { mockReports, mockReportsAnalytics } from './reports';
import { mockTaxSettings, mockQuickBooksSettings, mockChartOfAccounts } from './settings';
import { mockUsers, mockPermissions } from './users';
import { mockReadinessUnits, mockReadinessSettings, mockReadinessHolidays } from './readiness';
import { mockInsuranceCompliance, mockInsuranceStats } from './insurance';
import { mockRentRollData } from './rentRoll';
import { mockGeneralSettings, mockServiceItems } from './generalSettings';
import { mockLedgerData } from './accounting';
import { mockCompanies } from './companies';
import { mockNotes, mockNoteComments, mockNoteAttachments, mockCommTimeline } from './notes';
import { activityService } from '../services/activityService';
export { mockUsers, mockPermissions, mockReadinessUnits, mockReadinessSettings, mockReadinessHolidays, mockInsuranceCompliance, mockInsuranceStats, mockRentRollData, mockGeneralSettings, mockServiceItems, mockLedgerData, mockCompanies };
export { mockNotes, mockNoteComments, mockNoteAttachments, mockCommTimeline };

// Initialize localStorage databases with mock seed data if empty
export const initMockDatabase = () => {
  if (localStorage.getItem('mock_db_version') !== '2.5') {
    localStorage.removeItem('mock_dashboard_stats');
    localStorage.removeItem('mock_revenue_analytics');
    localStorage.removeItem('mock_properties');
    localStorage.removeItem('mock_apartments');
    localStorage.removeItem('mock_unit_types');
    localStorage.removeItem('mock_tenants');
    localStorage.removeItem('mock_leases');
    localStorage.removeItem('mock_renewals');
    localStorage.removeItem('mock_invoices');
    localStorage.removeItem('mock_payments');
    localStorage.removeItem('mock_credits');
    localStorage.removeItem('mock_adjustments');
    localStorage.removeItem('mock_refunds');
    localStorage.removeItem('mock_employees');
    localStorage.removeItem('mock_clock_logs');
    localStorage.removeItem('mock_maintenance_tickets');
    localStorage.removeItem('mock_move_ins');
    localStorage.removeItem('mock_move_outs');
    localStorage.removeItem('mock_prep_units');
    localStorage.removeItem('mock_inspections');
    localStorage.removeItem('mock_inspection_templates');
    localStorage.removeItem('mock_response_groups');
    localStorage.removeItem('mock_documents');
    localStorage.removeItem('mock_notifications');
    localStorage.removeItem('mock_tal_cases');
    localStorage.removeItem('mock_case_hearings');
    localStorage.removeItem('mock_case_documents');
    localStorage.removeItem('mock_case_notes');
    localStorage.removeItem('mock_case_tasks');
    localStorage.removeItem('tal_case_seq');
    localStorage.removeItem('task_seq');
    localStorage.removeItem('mock_calendar_events');
    localStorage.removeItem('mock_reports');
    localStorage.removeItem('mock_tax_settings');
    localStorage.removeItem('mock_quickbooks_settings');
    localStorage.removeItem('mock_chart_of_accounts');
    localStorage.removeItem('mock_users');
    localStorage.removeItem('mock_permissions');
    localStorage.removeItem('mock_readiness_units');
    localStorage.removeItem('mock_readiness_settings');
    localStorage.removeItem('mock_readiness_holidays');
    localStorage.removeItem('mock_insurance_compliance');
    localStorage.removeItem('mock_insurance_stats');
    localStorage.removeItem('mock_rent_roll');
    localStorage.removeItem('mock_general_settings');
    localStorage.removeItem('mock_service_items');
    localStorage.removeItem('mock_ledger');
    localStorage.removeItem('mock_reports_analytics');
    localStorage.removeItem('mock_companies');
    localStorage.setItem('mock_db_version', '2.5');
  }

  const checkAndSeed = (key, initialData) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(initialData));
    }
  };

  checkAndSeed('mock_dashboard_stats', mockDashboardStats);
  checkAndSeed('mock_revenue_analytics', mockRevenueAnalytics);
  checkAndSeed('mock_properties', mockProperties);
  checkAndSeed('mock_apartments', mockApartments);
  checkAndSeed('mock_unit_types', mockUnitTypes);
  checkAndSeed('mock_tenants', mockTenants);
  checkAndSeed('mock_leases', mockLeases);
  checkAndSeed('mock_renewals', mockRenewals);
  checkAndSeed('mock_invoices', mockInvoices);
  checkAndSeed('mock_payments', mockPayments);
  checkAndSeed('mock_credits', mockCredits);
  checkAndSeed('mock_adjustments', mockAdjustments);
  checkAndSeed('mock_refunds', mockRefunds);
  checkAndSeed('mock_employees', mockEmployees);
  checkAndSeed('mock_clock_logs', mockClockLogs);
  checkAndSeed('mock_maintenance_tickets', mockMaintenanceTickets);
  checkAndSeed('mock_move_ins', mockMoveIns);
  checkAndSeed('mock_move_outs', mockMoveOuts);
  checkAndSeed('mock_prep_units', mockPrepUnits);
  checkAndSeed('mock_inspections', mockInspections);
  checkAndSeed('mock_inspection_templates', mockInspectionTemplates);
  checkAndSeed('mock_response_groups', mockResponseGroups);
  checkAndSeed('mock_documents', mockDocuments);
  checkAndSeed('mock_notifications', mockNotifications);
  checkAndSeed('mock_tal_cases', mockTalCases);
  checkAndSeed('mock_case_hearings', mockCaseHearings);
  checkAndSeed('mock_case_documents', mockCaseDocuments);
  checkAndSeed('mock_case_notes', mockCaseNotes);
  checkAndSeed('mock_case_tasks', mockCaseTasks);
  if (!localStorage.getItem('tal_case_seq')) {
    localStorage.setItem('tal_case_seq', '3');
  }
  if (!localStorage.getItem('task_seq')) {
    localStorage.setItem('task_seq', '4');
  }
  checkAndSeed('mock_calendar_events', mockCalendarEvents);
  checkAndSeed('mock_reports', mockReports);
  checkAndSeed('mock_tax_settings', mockTaxSettings);
  checkAndSeed('mock_quickbooks_settings', mockQuickBooksSettings);
  checkAndSeed('mock_chart_of_accounts', mockChartOfAccounts);
  checkAndSeed('mock_users', mockUsers);
  checkAndSeed('mock_permissions', mockPermissions);
  checkAndSeed('mock_readiness_units', mockReadinessUnits);
  checkAndSeed('mock_readiness_settings', mockReadinessSettings);
  checkAndSeed('mock_readiness_holidays', mockReadinessHolidays);
  checkAndSeed('mock_insurance_compliance', mockInsuranceCompliance);
  checkAndSeed('mock_insurance_stats', mockInsuranceStats);
  checkAndSeed('mock_rent_roll', mockRentRollData);
  checkAndSeed('mock_general_settings', mockGeneralSettings);
  checkAndSeed('mock_service_items', mockServiceItems);
  checkAndSeed('mock_ledger', mockLedgerData);
  checkAndSeed('mock_reports_analytics', mockReportsAnalytics);
  checkAndSeed('mock_companies', mockCompanies);

  const mockPaymentsReceivedData = [
    { id: 1, invoice: 'INV-2026-000001', tenant: 'Sarah Connor', unit: 'Apt 101', category: 'Rent', amount: 1100, method: 'E-Transfer', date: '2026-05-28', status: 'Completed' },
    { id: 2, invoice: 'INV-2026-000002', tenant: 'Alice Cooper', unit: 'Apt 201', category: 'Rent', amount: 950, method: 'Credit Card', date: '2026-06-01', status: 'Completed' },
    { id: 3, invoice: 'INV-2026-000003', tenant: 'John Doe', unit: 'Apt 301', category: 'Deposit', amount: 1500, method: 'Bank Transfer', date: '2026-06-15', status: 'Completed' },
    { id: 4, invoice: 'INV-2026-000004', tenant: 'Jane Miller', unit: 'Apt 104', category: 'Rent', amount: 950, method: 'Cash', date: '2026-07-01', status: 'Pending' }
  ];
  checkAndSeed('mock_payments_received', mockPaymentsReceivedData);

  const mockOutstandingDuesData = [
    { id: 1, invoice: 'INV-2026-000005', tenant: 'Robert Dow', unit: 'Apt 104B', category: 'RENT', leaseType: 'Bedroom Lease', amount: 950, dueDate: '2026-06-01', status: 'Overdue', daysOverdue: 36, building: 'Sunset Towers', tenantId: 103, unitId: 3, invoiceId: 5 },
    { id: 2, invoice: 'INV-2026-000006', tenant: 'John Doe', unit: 'Apt 301', category: 'RENT', leaseType: 'Full Unit', amount: 1500, dueDate: '2026-06-15', status: 'Overdue', daysOverdue: 22, building: 'Parkview Heights', tenantId: 104, unitId: 4, invoiceId: 6 },
    { id: 3, invoice: 'INV-2026-000007', tenant: 'Sarah Connor', unit: 'Apt 101', category: 'SERVICE', leaseType: 'Full Unit', amount: 200, dueDate: '2026-07-01', status: 'Pending', daysOverdue: 0, building: 'Parkview Heights', tenantId: 101, unitId: 1, invoiceId: 7 },
    { id: 4, invoice: 'INV-2026-000008', tenant: 'Alice Cooper', unit: 'Apt 201', category: 'SECURITY_DEPOSIT', leaseType: 'Full Unit', amount: 1900, dueDate: '2026-05-01', status: 'Partial', daysOverdue: 0, building: 'Sunset Towers', tenantId: 102, unitId: 2, invoiceId: 8 },
    { id: 5, invoice: 'INV-2026-000009', tenant: 'Jane Miller', unit: 'Apt 104A', category: 'RENT', leaseType: 'Bedroom Lease', amount: 950, dueDate: '2026-07-05', status: 'Pending', daysOverdue: 0, building: 'Sunset Towers', tenantId: 105, unitId: 5, invoiceId: 9 },
  ];
  checkAndSeed('mock_outstanding_dues', mockOutstandingDuesData);

  const mockRefundsData = [
    { id: 1, type: 'Security Deposit Refund', tenant: 'Alice Cooper', unit: 'Apt 201', amount: 1900, date: '2026-06-10', issuedDate: '2026-06-15', status: 'Completed', tenantId: 102, unitId: 2, reason: 'Lease ended, full deposit returned' },
    { id: 2, type: 'Refund', tenant: 'Robert Dow', unit: 'Apt 104B', amount: 475, date: '2026-06-20', issuedDate: null, status: 'Pending', tenantId: 103, unitId: 3, reason: 'Overpayment on June rent' },
    { id: 3, type: 'Adjustment', tenant: 'John Doe', unit: 'Apt 301', amount: -150, date: '2026-06-25', issuedDate: '2026-06-26', status: 'Applied', tenantId: 104, unitId: 4, reason: 'Late fee waiver — grace period granted' },
    { id: 4, type: 'Security Deposit Refund', tenant: 'Sarah Connor', unit: 'Apt 101', amount: 1100, date: '2026-07-01', issuedDate: null, status: 'Pending', tenantId: 101, unitId: 1, reason: 'Tenant vacated, deposit to be refunded after inspection' },
    { id: 5, type: 'Adjustment', tenant: 'Jane Miller', unit: 'Apt 104A', amount: -50, date: '2026-07-05', issuedDate: '2026-07-05', status: 'Applied', tenantId: 105, unitId: 5, reason: 'Utilities adjustment for June' },
  ];
  checkAndSeed('mock_refunds', mockRefundsData);

  // Payroll runs data for Run Payroll page
  const mockPayrollData = [
    {
      id: 'pay-2026-001', payrollNo: 'PAY-APEX-2026-001', payslipNo: 'PSP-APEX-2026-001',
      employeeId: 4, companyId: 1,
      payrollMonth: '2026-06', periodStart: '2026-06-01', periodEnd: '2026-06-30',
      cycle: 'Monthly',
      basicSalary: 4500, allowances: 450, bonus: 0, overtimePay: 320, deductions: 200, tax: 540, netSalary: 4530,
      status: 'Paid',
      createdAt: '2026-06-30T10:00:00Z', createdBy: 'Admin User',
      generatedBy: 'Admin User', generatedAt: '2026-06-30T10:00:00Z',
      approvedBy: 'Admin User', approvedAt: '2026-07-01T09:00:00Z',
      paidBy: 'Admin User', paidAt: '2026-07-01T10:00:00Z',
      linkedOvertimeIds: [], unpaidDaysCount: 0
    },
    {
      id: 'pay-2026-002', payrollNo: 'PAY-APEX-2026-002', payslipNo: 'PSP-APEX-2026-002',
      employeeId: 5, companyId: 1,
      payrollMonth: '2026-06', periodStart: '2026-06-01', periodEnd: '2026-06-30',
      cycle: 'Monthly',
      basicSalary: 3800, allowances: 380, bonus: 200, overtimePay: 0, deductions: 150, tax: 456, netSalary: 3774,
      status: 'Approved',
      createdAt: '2026-06-30T10:15:00Z', createdBy: 'Admin User',
      generatedBy: 'Admin User', generatedAt: '2026-06-30T10:15:00Z',
      approvedBy: 'Admin User', approvedAt: '2026-07-01T09:30:00Z',
      paidBy: null, paidAt: null,
      linkedOvertimeIds: [], unpaidDaysCount: 0
    },
    {
      id: 'pay-2026-003', payrollNo: 'PAY-APEX-2026-003', payslipNo: 'PSP-APEX-2026-003',
      employeeId: 4, companyId: 1,
      payrollMonth: '2026-07', periodStart: '2026-07-01', periodEnd: '2026-07-31',
      cycle: 'Monthly',
      basicSalary: 4500, allowances: 450, bonus: 500, overtimePay: 0, deductions: 200, tax: 540, netSalary: 4710,
      status: 'Pending Approval',
      createdAt: '2026-07-05T10:00:00Z', createdBy: 'Admin User',
      generatedBy: 'Admin User', generatedAt: '2026-07-05T10:00:00Z',
      approvedBy: null, approvedAt: null,
      paidBy: null, paidAt: null,
      linkedOvertimeIds: [], unpaidDaysCount: 0
    }
  ];
  checkAndSeed('mock_payroll', mockPayrollData);

  // Payroll audit timeline data for Audit Timeline page
  const mockPayrollTimelineData = [
    {
      id: 'prt-001', eventType: 'Payroll Generated', description: 'Payroll PAY-APEX-2026-003 generated for July 2026 (2 employees)',
      employeeId: null, employeeName: '', companyId: 1,
      metadata: { payrollNo: 'PAY-APEX-2026-003', month: '2026-07', employeeCount: 2 },
      createdAt: '2026-07-05T10:00:00Z', createdBy: 'Admin User', updatedAt: '2026-07-05T10:00:00Z', updatedBy: 'Admin User'
    },
    {
      id: 'prt-002', eventType: 'Salary Updated', description: 'Salary updated for Sarah Smith: $4,200 → $4,500',
      employeeId: 4, employeeName: 'Sarah Smith', companyId: 1,
      metadata: { oldSalary: 4200, newSalary: 4500 },
      createdAt: '2026-06-28T14:00:00Z', createdBy: 'Admin User', updatedAt: '2026-06-28T14:00:00Z', updatedBy: 'Admin User'
    },
    {
      id: 'prt-003', eventType: 'Payroll Generated', description: 'Payroll PAY-APEX-2026-001 generated for June 2026 (2 employees)',
      employeeId: null, employeeName: '', companyId: 1,
      metadata: { payrollNo: 'PAY-APEX-2026-001', month: '2026-06', employeeCount: 2 },
      createdAt: '2026-06-30T10:00:00Z', createdBy: 'Admin User', updatedAt: '2026-06-30T10:00:00Z', updatedBy: 'Admin User'
    },
    {
      id: 'prt-004', eventType: 'Status Changed', description: 'Payslip PSP-APEX-2026-001 status changed to Paid for Sarah Smith',
      employeeId: 4, employeeName: 'Sarah Smith', companyId: 1,
      metadata: { payslipNo: 'PSP-APEX-2026-001', newStatus: 'Paid' },
      createdAt: '2026-07-01T10:00:00Z', createdBy: 'Admin User', updatedAt: '2026-07-01T10:00:00Z', updatedBy: 'Admin User'
    },
    {
      id: 'prt-005', eventType: 'Leave Approved', description: 'Leave approved for Mike Johnson: Annual Leave (Jun 15 – Jun 16)',
      employeeId: 5, employeeName: 'Mike Johnson', companyId: 1,
      metadata: { leaveType: 'Annual', startDate: '2026-06-15', endDate: '2026-06-16', days: 2 },
      createdAt: '2026-06-12T09:30:00Z', createdBy: 'Admin User', updatedAt: '2026-06-12T09:30:00Z', updatedBy: 'Admin User'
    },
    {
      id: 'prt-006', eventType: 'Attendance Updated', description: 'Attendance corrected for Sarah Smith on Jun 28 (Clock-out added)',
      employeeId: 4, employeeName: 'Sarah Smith', companyId: 1,
      metadata: { date: '2026-06-28', action: 'clock-out-updated' },
      createdAt: '2026-06-29T08:00:00Z', createdBy: 'Admin User', updatedAt: '2026-06-29T08:00:00Z', updatedBy: 'Admin User'
    }
  ];
  checkAndSeed('mock_payroll_timeline', mockPayrollTimelineData);

  // ── Phase 6: Non-destructive seed (only creates if missing) ──
  checkAndSeed('mock_notes', mockNotes);
  checkAndSeed('mock_note_comments', mockNoteComments);
  checkAndSeed('mock_note_attachments', mockNoteAttachments);
  checkAndSeed('mock_comm_timeline', mockCommTimeline);
  if (!localStorage.getItem('note_seq')) {
    localStorage.setItem('note_seq', '6');
  }
};

// Auto-init database on load
initMockDatabase();

// Simulates real backend delay
const withDelay = (resultFn) => {
  return new Promise((resolve, reject) => {
    const delay = Math.floor(Math.random() * (600 - 300 + 1)) + 300;
    setTimeout(() => {
      try {
        resolve({ data: resultFn() });
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
};

const getStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const mockDashboardService = {
  getStats: () => withDelay(() => {
    const stats = JSON.parse(localStorage.getItem('mock_dashboard_stats'));
    // Dynamically count entities based on current storage
    stats.totalProperties = getStore('mock_properties').length;
    stats.totalUnits = getStore('mock_apartments').length;
    stats.totalTenants = getStore('mock_tenants').length;
    stats.activeLeases = getStore('mock_leases').filter(l => l.status === 'Active').length;
    stats.pendingMaintenance = getStore('mock_maintenance_tickets').filter(t => t.status !== 'Resolved').length;
    
    // Pagination slicing helper for components
    stats.leaseAlerts = getStore('mock_dashboard_stats').leaseAlerts || [];
    stats.refundAlerts = getStore('mock_refunds') || [];
    stats.reservedUnits = getStore('mock_dashboard_stats').reservedUnits || [];
    stats.pendingRefunds = (getStore('mock_dashboard_stats').pendingRefunds || []).map(item => ({
      depositAmount: 0,
      leaseExpiryDate: '',
      building: '',
      unitNumber: '',
      tenantName: '',
      ...item
    }));
    stats.recentActivity = (getStore('mock_dashboard_stats').recentActivity || []).map(act => 
      typeof act === 'object' ? (act.description || act.message || JSON.stringify(act)) : act
    );
    
    return stats;
  }),
  getRevenue: () => withDelay(() => {
    const invoices = getStore('mock_invoices');
    const properties = getStore('mock_properties');
    const apartments = getStore('mock_apartments');
    
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid' || inv.status === 'paid');
    const actualRevenue = paidInvoices.reduce((acc, inv) => acc + (parseFloat(inv.amount) || 0), 0);
    const actualRent = paidInvoices.filter(inv => inv.type === 'Rent' || inv.type === 'rent').reduce((acc, inv) => acc + (parseFloat(inv.amount) || 0), 0);
    const actualDeposit = paidInvoices.filter(inv => inv.type === 'Deposit' || inv.type === 'deposit').reduce((acc, inv) => acc + (parseFloat(inv.amount) || 0), 0);
    const actualServiceFees = actualRevenue - actualRent - actualDeposit;
    
    const projectedRevenue = invoices.reduce((acc, inv) => acc + (parseFloat(inv.amount) || 0), 0);
    const totalRevenue = actualRevenue;

    const monthlyRevenue = [
      { month: "Jan 2026", revenue: 24000, rent: 22000, other: 2000 },
      { month: "Feb 2026", revenue: 24500, rent: 22500, other: 2000 },
      { month: "Mar 2026", revenue: 26000, rent: 23500, other: 2500 },
      { month: "Apr 2026", revenue: 25800, rent: 23800, other: 2000 },
      { month: "May 2026", revenue: 27000, rent: 24500, other: 2500 },
      { month: "Jun 2026", revenue: 28400, rent: 25800, other: 2600 }
    ];

    const revenueByProperty = properties.map(p => {
      const propInvoices = invoices.filter(inv => {
        const apt = apartments.find(a => a.unitNumber === inv.unitName || a.id === inv.unitId);
        return apt && apt.propertyId === p.id;
      });
      const pPaid = propInvoices.filter(inv => inv.status === 'Paid' || inv.status === 'paid');
      
      const rent = pPaid.filter(inv => inv.type === 'Rent' || inv.type === 'rent').reduce((acc, inv) => acc + (parseFloat(inv.amount) || 0), 0);
      const deposit = pPaid.filter(inv => inv.type === 'Deposit' || inv.type === 'deposit').reduce((acc, inv) => acc + (parseFloat(inv.amount) || 0), 0);
      const serviceFees = pPaid.filter(inv => inv.type !== 'Rent' && inv.type !== 'rent' && inv.type !== 'Deposit' && inv.type !== 'deposit').reduce((acc, inv) => acc + (parseFloat(inv.amount) || 0), 0);
      const amount = rent + deposit + serviceFees;

      const monthly = [
        { month: "Jan 2026", amount: amount * 0.8, rent: rent * 0.8, deposit: deposit * 0.8, serviceFees: serviceFees * 0.8 },
        { month: "Feb 2026", amount: amount * 0.85, rent: rent * 0.85, deposit: deposit * 0.85, serviceFees: serviceFees * 0.85 },
        { month: "Mar 2026", amount: amount * 0.9, rent: rent * 0.9, deposit: deposit * 0.9, serviceFees: serviceFees * 0.9 },
        { month: "Apr 2026", amount: amount * 0.92, rent: rent * 0.92, deposit: deposit * 0.92, serviceFees: serviceFees * 0.92 },
        { month: "May 2026", amount: amount * 0.95, rent: rent * 0.95, deposit: deposit * 0.95, serviceFees: serviceFees * 0.95 },
        { month: "Jun 2026", amount, rent, deposit, serviceFees }
      ];

      return {
        id: p.id,
        name: p.name,
        amount,
        rent,
        deposit,
        serviceFees,
        monthly
      };
    });

    return {
      actualRevenue,
      actualRent,
      actualDeposit,
      actualServiceFees,
      projectedRevenue,
      totalRevenue,
      monthlyRevenue,
      revenueByProperty
    };
  }),
  getVacancyStats: () => withDelay(() => {
    const apartments = getStore('mock_apartments');
    const properties = getStore('mock_properties');
    
    const total = apartments.length;
    const vacant = apartments.filter(a => a.status === 'Vacant').length;
    const occupied = total - vacant;
    
    let totalVacantBedrooms = 0;
    apartments.forEach(a => {
      if (a.rentalMode === 'BEDROOM_WISE' && a.bedroomsList) {
        totalVacantBedrooms += a.bedroomsList.filter(b => b.status === 'Vacant').length;
      }
    });

    const fullUnitCount = apartments.filter(a => a.rentalMode === 'FULL_UNIT').length;
    const bedroomWiseCount = total - fullUnitCount;

    const vacancyByBuilding = properties.map(p => {
      const pUnits = apartments.filter(a => a.propertyId === p.id);
      const pVacant = pUnits.filter(a => a.status === 'Vacant').length;
      const pOccupied = pUnits.length - pVacant;
      
      const hasBedroomWise = pUnits.some(a => a.rentalMode === 'BEDROOM_WISE');
      let vacantBedrooms = 0;
      pUnits.forEach(a => {
        if (a.rentalMode === 'BEDROOM_WISE' && a.bedroomsList) {
          vacantBedrooms += a.bedroomsList.filter(b => b.status === 'Vacant').length;
        }
      });

      return {
        id: p.id,
        name: p.name,
        total: pUnits.length,
        vacant: pVacant,
        occupied: pOccupied,
        hasBedroomWise,
        vacantBedrooms
      };
    });

    return {
      total,
      vacant,
      occupied,
      totalVacantBedrooms,
      fullUnitCount,
      bedroomWiseCount,
      vacancyByBuilding
    };
  }),
  cancelRefund: (tenantId, unitId) => withDelay(() => {
    let refunds = getStore('mock_refunds');
    refunds = refunds.map(r => r.tenantId === tenantId && r.unitId === unitId ? { ...r, status: 'Cancelled', outcomeReason: 'Cancelled – lease renewed' } : r);
    setStore('mock_refunds', refunds);
    return { success: true };
  })
};

export const getAllowedPropertyIds = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const selectedCompanyId = localStorage.getItem('global_selected_company_id');
  
  let properties = getStore('mock_properties');
  
  if (currentUser.role === 'ADMIN' && currentUser.assignedCompanyIds && currentUser.assignedCompanyIds.length > 0) {
    if (currentUser.assignedCompanyIds.length < 3) {
      properties = properties.filter(p => currentUser.assignedCompanyIds.includes(p.companyId));
    }
  } else if (currentUser.role === 'OWNER' && currentUser.assignedBuildingIds && currentUser.assignedBuildingIds.length > 0) {
    properties = properties.filter(p => currentUser.assignedBuildingIds.includes(p.id));
  } else if (currentUser.role === 'COWORKER' && currentUser.assignedBuildingIds && currentUser.assignedBuildingIds.length > 0) {
    properties = properties.filter(p => currentUser.assignedBuildingIds.includes(p.id));
  }

  if (selectedCompanyId && selectedCompanyId !== 'all' && selectedCompanyId !== '') {
    properties = properties.filter(p => p.companyId === parseInt(selectedCompanyId));
  }

  return properties.map(p => p.id);
};

export const mockPropertyService = {
  getAll: (search = '') => withDelay(() => {
    let list = getStore('mock_properties');
    const allowedIds = getAllowedPropertyIds();
    list = list.filter(p => allowedIds.includes(p.id));
    if (search) {
      list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase()));
    }
    const allUnits = getStore('mock_apartments');
    return list.map(p => {
      const pUnits = allUnits.filter(u => u.propertyId === p.id);
      const occupiedCount = pUnits.filter(u => u.status === 'Occupied').length;
      const rate = pUnits.length ? Math.round((occupiedCount / pUnits.length) * 100) : 0;
      return {
        ...p,
        units: pUnits.length,
        totalUnits: pUnits.length,
        occupancy: `${rate}%`,
        occupancyRate: rate
      };
    });
  }),
  getById: (id) => withDelay(() => {
    const properties = getStore('mock_properties');
    const prop = properties.find(p => p.id === parseInt(id));
    if (!prop) throw new Error('Property not found');
    const allUnits = getStore('mock_apartments');
    const pUnits = allUnits.filter(u => u.propertyId === parseInt(id));
    const occupiedCount = pUnits.filter(u => u.status === 'Occupied').length;
    const rate = pUnits.length ? Math.round((occupiedCount / pUnits.length) * 100) : 0;
    
    return {
      ...prop,
      totalUnits: pUnits.length,
      occupancyRate: rate,
      units: pUnits.map(u => ({
        id: u.id,
        name: u.unitNumber,
        type: u.unitType,
        mode: u.rentalMode === 'FULL_UNIT' ? 'Full Unit' : 'Bedroom Mode',
        status: u.status,
        tenant: u.tenant || 'Vacant'
      }))
    };
  }),
  create: (data) => withDelay(() => {
    const list = getStore('mock_properties');
    const newProp = {
      id: list.length ? Math.max(...list.map(p => p.id)) + 1 : 1,
      name: data.name,
      address: data.address,
      status: data.status || 'Active',
      ownerNames: data.ownerNames || 'Owner User',
      ownerIds: data.ownerIds || [3],
      units: 0,
      totalUnits: 0,
      occupancy: '0%',
      occupancyRate: 0,
      revenue: 0
    };
    list.push(newProp);
    setStore('mock_properties', list);
    return newProp;
  }),
  update: (id, data) => withDelay(() => {
    let list = getStore('mock_properties');
    let updated = null;
    list = list.map(p => {
      if (p.id === parseInt(id)) {
        updated = { ...p, ...data };
        return updated;
      }
      return p;
    });
    setStore('mock_properties', list);
    return updated;
  }),
  delete: (id) => withDelay(() => {
    let list = getStore('mock_properties');
    list = list.filter(p => p.id !== parseInt(id));
    setStore('mock_properties', list);
    return { success: true };
  })
};

export const mockTenantService = {
  getAll: (search = '') => withDelay(() => {
    let list = getStore('mock_tenants');
    const allowedPropertyIds = getAllowedPropertyIds();
    list = list.filter(t => allowedPropertyIds.includes(t.propertyId));
    if (search) {
      list = list.filter(t => 
        t.firstName.toLowerCase().includes(search.toLowerCase()) || 
        t.lastName.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    const properties = getStore('mock_properties');
    return list.map(t => {
      const prop = properties.find(p => p.id === t.propertyId);
      return {
        ...t,
        companyName: prop ? prop.companyName : '-',
        name: t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Unknown Tenant'
      };
    });
  }),
  getById: (id) => withDelay(() => {
    const list = getStore('mock_tenants');
    const tenant = list.find(t => t.id === parseInt(id));
    if (!tenant) throw new Error('Tenant not found');
    return tenant;
  }),
  create: (data) => withDelay(() => {
    const list = getStore('mock_tenants');
    const newTenant = {
      id: list.length ? Math.max(...list.map(t => t.id)) + 1 : 101,
      ...data,
      status: data.status || 'Active'
    };
    list.push(newTenant);
    setStore('mock_tenants', list);

    // If unit linked, update unit occupancy
    if (data.unitId) {
      let units = getStore('mock_apartments');
      units = units.map(u => u.id === parseInt(data.unitId) ? { ...u, status: 'Occupied', tenant: `${data.firstName} ${data.lastName}` } : u);
      setStore('mock_apartments', units);
    }
    return newTenant;
  }),
  update: (id, data) => withDelay(() => {
    let list = getStore('mock_tenants');
    let updated = null;
    list = list.map(t => {
      if (t.id === parseInt(id)) {
        updated = { ...t, ...data };
        return updated;
      }
      return t;
    });
    setStore('mock_tenants', list);
    return updated;
  }),
  delete: (id) => withDelay(() => {
    let list = getStore('mock_tenants');
    const tenant = list.find(t => t.id === parseInt(id));
    list = list.filter(t => t.id !== parseInt(id));
    setStore('mock_tenants', list);

    // Update unit status to vacant
    if (tenant && tenant.unitId) {
      let units = getStore('mock_apartments');
      units = units.map(u => u.id === tenant.unitId ? { ...u, status: 'Vacant', tenant: 'Vacant' } : u);
      setStore('mock_apartments', units);
    }
    return { success: true };
  })
};

export const mockApartmentService = {
  getAll: (filters = {}) => withDelay(() => {
    let list = getStore('mock_apartments');
    const allowedPropertyIds = getAllowedPropertyIds();
    list = list.filter(u => allowedPropertyIds.includes(u.propertyId));
    if (filters.search) {
      list = list.filter(u => u.unitNumber.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.propertyId) {
      list = list.filter(u => u.propertyId === parseInt(filters.propertyId));
    }
    if (filters.unitType) {
      list = list.filter(u => u.unitType === filters.unitType);
    }
    if (filters.showInactive === 'false') {
      list = list.filter(u => u.unit_status !== 'INACTIVE');
    }
    
    // Paginate in memory
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const properties = getStore('mock_properties');
    const mappedList = list.map(u => {
      const prop = properties.find(p => p.id === u.propertyId);
      return {
        ...u,
        companyName: prop ? prop.companyName : '-',
        buildingName: prop ? prop.name : u.propertyName
      };
    });

    return {
      data: mappedList.slice(startIndex, endIndex),
      pagination: {
        total: list.length,
        totalPages: Math.ceil(list.length / limit),
        page: page,
        limit: limit
      }
    };
  }),
  getById: (id) => withDelay(() => {
    const list = getStore('mock_apartments');
    const unit = list.find(u => u.id === parseInt(id));
    if (!unit) throw new Error('Unit not found');
    const properties = getStore('mock_properties');
    const prop = properties.find(p => p.id === unit.propertyId);
    return {
      ...unit,
      companyName: prop ? prop.companyName : '-',
      buildingName: prop ? prop.name : unit.propertyName
    };
  }),
  create: (data) => withDelay(() => {
    const list = getStore('mock_apartments');
    const properties = getStore('mock_properties');
    const prop = properties.find(p => p.id === parseInt(data.propertyId));
    
    const newUnit = {
      id: list.length ? Math.max(...list.map(u => u.id)) + 1 : 1,
      propertyId: parseInt(data.propertyId),
      propertyName: prop ? prop.name : 'Unknown Property',
      unitNumber: data.unitNumber,
      unitType: data.unitType,
      floor: data.floor,
      rentalMode: data.rentalMode || 'FULL_UNIT',
      bedrooms: parseInt(data.bedrooms) || 1,
      status: data.status || 'Vacant',
      tenant: data.status === 'Occupied' ? 'Initial Tenant' : 'Vacant',
      unit_status: data.unit_status || 'ACTIVE',
      gc_delivered_target_date: data.gc_delivered_target_date || '',
      reserved_flag: data.reserved_flag || false,
      reserve_firstName: data.reserve_firstName || '',
      reserve_lastName: data.reserve_lastName || '',
      reserve_email: data.reserve_email || '',
      reserve_phone: data.reserve_phone || '',
      tentative_move_in_date: data.tentative_move_in_date || '',
      classification: data.classification || 'Existing'
    };
    list.push(newUnit);
    setStore('mock_apartments', list);
    return newUnit;
  }),
  update: (id, data) => withDelay(() => {
    let list = getStore('mock_apartments');
    let updated = null;
    list = list.map(u => {
      if (u.id === parseInt(id)) {
        updated = { ...u, ...data };
        return updated;
      }
      return u;
    });
    setStore('mock_apartments', list);
    return updated;
  }),
  delete: (id) => withDelay(() => {
    let list = getStore('mock_apartments');
    list = list.filter(u => u.id !== parseInt(id));
    setStore('mock_apartments', list);
    return { success: true };
  }),
  getTypes: () => withDelay(() => getStore('mock_unit_types'))
};

export const mockLeaseService = {
  getAll: () => withDelay(() => {
    let list = getStore('mock_leases');
    const allowedPropertyIds = getAllowedPropertyIds();
    const properties = getStore('mock_properties');
    const apartments = getStore('mock_apartments');
    const tenants = getStore('mock_tenants');
    
    list = list.filter(l => {
      const unit = apartments.find(u => u.id === l.unitId || u.unitNumber === l.unitNumber);
      const propId = unit ? unit.propertyId : l.propertyId;
      return allowedPropertyIds.includes(propId);
    });

    return list.map(l => {
      const unit = apartments.find(u => u.id === l.unitId || u.unitNumber === l.unitNumber);
      const prop = properties.find(p => p.id === (unit ? unit.propertyId : l.propertyId));
      const tenant = tenants.find(t => t.id === l.tenantId);
      const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : l.tenantName || 'Unknown Tenant';
      return {
        ...l,
        id: l.id,
        leaseType: unit && unit.rentalMode === 'BEDROOM' ? 'Bedroom Lease' : 'Full Unit Lease',
        companyName: prop ? prop.companyName : '-',
        buildingName: prop ? prop.name : l.propertyName || 'Parkview Heights',
        unit: unit ? unit.unitNumber : l.unitNumber || 'Apt 101',
        bedroom: l.bedroomNumber || l.bedroom || '-',
        tenant: tenantName,
        term: `${l.startDate} to ${l.endDate}`,
        monthlyRent: l.rentAmount || l.monthlyRent || 0,
        status: l.status || 'Active'
      };
    });
  }),
  create: (data) => withDelay(() => {
    const list = getStore('mock_leases');
    const tenants = getStore('mock_tenants');
    const tenant = tenants.find(t => t.id === parseInt(data.tenantId));
    const apartments = getStore('mock_apartments');
    const unit = apartments.find(u => u.id === parseInt(data.unitId));

    const newLease = {
      id: list.length ? Math.max(...list.map(l => l.id)) + 1 : 1,
      tenantId: parseInt(data.tenantId),
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : `Tenant #${data.tenantId}`,
      unitId: parseInt(data.unitId),
      unitNumber: unit ? unit.unitNumber : `Apt #${data.unitId}`,
      propertyId: unit ? unit.propertyId : 1,
      propertyName: unit ? unit.propertyName : 'Main Property',
      startDate: data.startDate,
      endDate: data.endDate,
      rentAmount: parseFloat(data.rentAmount),
      securityDeposit: parseFloat(data.securityDeposit || 0),
      status: 'Active',
      documentUrl: '#'
    };
    list.push(newLease);
    setStore('mock_leases', list);

    // Update Tenant lease info
    if (tenant) {
      let tenantsList = getStore('mock_tenants');
      tenantsList = tenantsList.map(t => t.id === tenant.id ? { 
        ...t, 
        unitId: newLease.unitId,
        unitNumber: newLease.unitNumber,
        propertyName: newLease.propertyName,
        propertyId: newLease.propertyId,
        leaseStart: newLease.startDate,
        leaseEnd: newLease.endDate,
        rent: newLease.rentAmount,
        deposit: newLease.securityDeposit
      } : t);
      setStore('mock_tenants', tenantsList);
    }
    
    // Update Apartment Tenant and Status
    if (unit) {
      let units = getStore('mock_apartments');
      units = units.map(u => u.id === unit.id ? { 
        ...u, 
        status: 'Occupied', 
        tenant: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Tenant occupant' 
      } : u);
      setStore('mock_apartments', units);
    }

    return newLease;
  }),
  delete: (id) => withDelay(() => {
    let list = getStore('mock_leases');
    list = list.filter(l => l.id !== parseInt(id));
    setStore('mock_leases', list);
    return { success: true };
  })
};

export const mockMaintenanceService = {
  getAll: (filters = {}) => withDelay(() => {
    let list = getStore('mock_maintenance_tickets');
    const allowedPropertyIds = getAllowedPropertyIds();
    const properties = getStore('mock_properties');
    const allowedPropertyNames = properties.filter(p => allowedPropertyIds.includes(p.id)).map(p => p.name);
    list = list.filter(t => allowedPropertyNames.includes(t.building || t.propertyName));
    if (filters.status && filters.status !== 'All') {
      list = list.filter(t => t.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.priority && filters.priority !== 'All') {
      list = list.filter(t => t.priority.toLowerCase() === filters.priority.toLowerCase());
    }
    return list.map(t => ({
      ...t,
      dbId: t.dbId || t.id,
      name: t.name || t.title || 'General Maintenance Task',
      building: t.building || t.propertyName || 'Sunset Towers',
      vendor: t.vendor || t.assignedTo || 'Mike Johnson',
      dueDate: t.dueDate || (t.createdAt ? t.createdAt.split('T')[0] : '2026-06-30'),
      frequency: t.frequency || 'One-time',
      type: t.type || t.category || 'Other',
      status: t.status || 'Upcoming',
      notes: typeof t.notes === 'string' ? t.notes : (Array.isArray(t.notes) ? t.notes.map(n => n.text).join(', ') : '')
    }));
  }),
  create: (data) => withDelay(() => {
    const list = getStore('mock_maintenance_tickets');
    const id = list.length ? Math.max(...list.map(t => t.id)) + 1 : 301;
    const newTkt = {
      id,
      dbId: id,
      ticketNumber: `TKT-${1000 + list.length + 1}`,
      tenantName: data.tenantName || 'Admin User',
      propertyName: data.building || data.propertyName || 'Parkview Heights',
      unitNumber: data.unitNumber || 'Common Area',
      title: data.name || data.title || 'General Maintenance Task',
      description: data.description || data.notes || '',
      category: data.type || data.category || 'General',
      priority: data.priority || 'Medium',
      status: data.status || 'Upcoming',
      assignedTo: data.vendor || data.assignedTo || 'Unassigned',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      name: data.name,
      building: data.building || data.propertyName || 'Parkview Heights',
      vendor: data.vendor,
      dueDate: data.dueDate,
      frequency: data.frequency,
      type: data.type
    };
    list.push(newTkt);
    setStore('mock_maintenance_tickets', list);
    return newTkt;
  }),
  update: (id, data) => withDelay(() => {
    let list = getStore('mock_maintenance_tickets');
    let updated = null;
    list = list.map(t => {
      if (t.id === parseInt(id)) {
        updated = {
          ...t,
          ...data,
          title: data.name || t.title,
          assignedTo: data.vendor || t.assignedTo,
          propertyName: data.building || t.propertyName
        };
        return updated;
      }
      return t;
    });
    setStore('mock_maintenance_tickets', list);
    return updated;
  }),
  addNote: (id, text, author) => withDelay(() => {
    let list = getStore('mock_maintenance_tickets');
    let updated = null;
    list = list.map(t => {
      if (t.id === parseInt(id)) {
        const notes = Array.isArray(t.notes) ? t.notes : [];
        const newNote = {
          id: notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1,
          author: author || 'Admin User',
          text: text,
          createdAt: new Date().toISOString()
        };
        updated = { ...t, notes: [...notes, newNote] };
        return updated;
      }
      return t;
    });
    setStore('mock_maintenance_tickets', list);
    return updated;
  }),
  delete: (id) => withDelay(() => {
    let list = getStore('mock_maintenance_tickets');
    list = list.filter(t => t.id !== parseInt(id));
    setStore('mock_maintenance_tickets', list);
    return { success: true };
  })
};

export const mockEmployeeService = {
  getAll: () => withDelay(() => getStore('mock_employees')),
  create: (data) => withDelay(() => {
    const list = getStore('mock_employees');
    const newEmp = {
      id: list.length ? Math.max(...list.map(e => e.id)) + 1 : 4,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || '',
      role: 'COWORKER',
      status: 'Invited',
      title: data.title || 'Staff member',
      createdAt: new Date().toISOString(),
      permissions: [
        { moduleName: 'Dashboard', canView: true, canAdd: false, canEdit: false, canDelete: false },
        { moduleName: 'Properties', canView: true, canAdd: false, canEdit: false, canDelete: false },
        { moduleName: 'Tenants', canView: true, canAdd: false, canEdit: false, canDelete: false },
        { moduleName: 'Leases', canView: true, canAdd: false, canEdit: false, canDelete: false },
        { moduleName: 'Maintenance', canView: true, canAdd: true, canEdit: true, canDelete: false },
        { moduleName: 'Accounting', canView: false, canAdd: false, canEdit: false, canDelete: false },
        { moduleName: 'Settings', canView: false, canAdd: false, canEdit: false, canDelete: false }
      ]
    };
    list.push(newEmp);
    setStore('mock_employees', list);
    return newEmp;
  }),
  updatePermissions: (id, permissions) => withDelay(() => {
    let list = getStore('mock_employees');
    let updated = null;
    list = list.map(e => {
      if (e.id === parseInt(id)) {
        updated = { ...e, permissions };
        return updated;
      }
      return e;
    });
    setStore('mock_employees', list);
    return updated;
  }),
  getClockLogs: () => withDelay(() => getStore('mock_clock_logs')),
  clockIn: (userId, userName) => withDelay(() => {
    const logs = getStore('mock_clock_logs');
    const active = logs.find(l => l.userId === userId && l.clockOut === null);
    if (active) return active; // already clocked in

    const newLog = {
      id: logs.length ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      userId: userId,
      userName: userName,
      clockIn: new Date().toISOString(),
      clockOut: null,
      hoursWorked: 0.0
    };
    logs.push(newLog);
    setStore('mock_clock_logs', logs);
    return newLog;
  }),
  clockOut: (userId) => withDelay(() => {
    let logs = getStore('mock_clock_logs');
    let updated = null;
    logs = logs.map(l => {
      if (l.userId === userId && l.clockOut === null) {
        const inDate = new Date(l.clockIn);
        const outDate = new Date();
        const diffMs = outDate - inDate;
        const diffHrs = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        updated = { ...l, clockOut: outDate.toISOString(), hoursWorked: diffHrs };
        return updated;
      }
      return l;
    });
    setStore('mock_clock_logs', logs);
    return updated;
  })
};

export const mockVehicleService = {
  getAll: (filters = {}) => withDelay(() => {
    const list = getStore('mock_apartments'); // vehicles are saved in units or setting up simple mock_vehicles if needed
    // Simple vehicles helper
    let vehicles = getStore('mock_vehicles');
    if (vehicles.length === 0) {
      vehicles = [
        { id: 1, make: 'Honda', model: 'Civic', color: 'Black', licensePlate: 'ABC 123', stallNumber: 'P-12', tenantName: 'Sarah Connor', propertyName: 'Parkview Heights' },
        { id: 2, make: 'Tesla', model: 'Model 3', color: 'White', licensePlate: 'TES-990', stallNumber: 'P-03', tenantName: 'Alice Cooper', propertyName: 'Sunset Towers' }
      ];
      setStore('mock_vehicles', vehicles);
    }
    return { data: vehicles, pagination: { total: vehicles.length, totalPages: 1, limit: 10 } };
  }),
  create: (data) => withDelay(() => {
    const list = getStore('mock_vehicles') || [];
    const newVeh = {
      id: list.length ? Math.max(...list.map(v => v.id)) + 1 : 1,
      ...data
    };
    list.push(newVeh);
    setStore('mock_vehicles', list);
    return newVeh;
  }),
  delete: (id) => withDelay(() => {
    let list = getStore('mock_vehicles');
    list = list.filter(v => v.id !== parseInt(id));
    setStore('mock_vehicles', list);
    return { success: true };
  })
};

export const mockDocumentService = {
  getAll: () => withDelay(() => getStore('mock_documents')),
  create: (name, type, size, propertyId) => withDelay(() => {
    const list = getStore('mock_documents');
    const newDoc = {
      id: list.length ? Math.max(...list.map(d => d.id)) + 1 : 1,
      name,
      type: type || 'OTHER',
      size: size || '1.0 MB',
      propertyId: propertyId ? parseInt(propertyId) : 1,
      createdAt: new Date().toISOString()
    };
    list.push(newDoc);
    setStore('mock_documents', list);
    return newDoc;
  }),
  delete: (id) => withDelay(() => {
    let list = getStore('mock_documents');
    list = list.filter(d => d.id !== parseInt(id));
    setStore('mock_documents', list);
    return { success: true };
  })
};

export const mockInvoiceService = {
  getAll: () => withDelay(() => {
    const list = getStore('mock_invoices');
    const allowedPropertyIds = getAllowedPropertyIds();
    const apartments = getStore('mock_apartments');
    const properties = getStore('mock_properties');
    return list.filter(inv => {
      const apt = apartments.find(a => a.unitNumber === inv.unitNumber || a.id === inv.unitId);
      return apt ? allowedPropertyIds.includes(apt.propertyId) : true;
    }).map(inv => {
      const apt = apartments.find(a => a.unitNumber === inv.unitNumber || a.id === inv.unitId);
      const prop = properties.find(p => p.id === (apt ? apt.propertyId : inv.propertyId));
      return {
        ...inv,
        id: inv.id,
        invoiceNo: inv.invoiceNo || inv.invoiceNumber,
        companyName: prop ? prop.companyName : '-',
        tenant: inv.tenant || inv.tenantName,
        unit: inv.unit || inv.unitNumber
      };
    });
  }),
  create: (data) => withDelay(() => {
    const list = getStore('mock_invoices');
    const tenants = getStore('mock_tenants');
    const tenant = tenants.find(t => t.id === parseInt(data.tenantId));
    
    const newInvoice = {
      id: list.length ? Math.max(...list.map(i => i.id)) + 1 : 1,
      invoiceNumber: `INV-2026-${(list.length + 1).toString().padStart(3, '0')}`,
      tenantId: parseInt(data.tenantId),
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : `Tenant #${data.tenantId}`,
      unitNumber: tenant ? tenant.unitNumber : 'Apt 101',
      propertyName: tenant ? tenant.propertyName : 'Parkview Heights',
      amount: parseFloat(data.amount),
      dueDate: data.dueDate,
      status: data.status || 'Unpaid',
      category: data.category || 'Rent',
      createdAt: new Date().toISOString(),
      payments: []
    };
    list.push(newInvoice);
    setStore('mock_invoices', list);
    return newInvoice;
  }),
  pay: (id, amount, method, transId) => withDelay(() => {
    let list = getStore('mock_invoices');
    let updated = null;
    list = list.map(inv => {
      if (inv.id === parseInt(id)) {
        const payments = inv.payments || [];
        const newPayment = {
          id: payments.length ? Math.max(...payments.map(p => p.id)) + 1 : 10,
          amount: parseFloat(amount),
          paymentMethod: method || 'Credit Card',
          transactionId: transId || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          paymentDate: new Date().toISOString()
        };
        
        updated = {
          ...inv,
          status: 'Paid',
          payments: [...payments, newPayment]
        };
        
        // Also log to received payments list
        const recList = getStore('mock_payments_received');
        recList.push({
          id: newPayment.id,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          tenantName: inv.tenantName,
          unitNumber: inv.unitNumber,
          propertyName: inv.propertyName,
          amount: newPayment.amount,
          paymentMethod: newPayment.paymentMethod,
          transactionId: newPayment.transactionId,
          paymentDate: newPayment.paymentDate
        });
        setStore('mock_payments_received', recList);
        
        return updated;
      }
      return inv;
    });
    setStore('mock_invoices', list);
    return updated;
  })
};

export const mockWorkflowService = {
  getMoveIns: () => withDelay(() => getStore('mock_move_ins')),
  updateMoveInRequirement: (moveInId, reqId, status) => withDelay(() => {
    let list = getStore('mock_move_ins');
    list = list.map(m => {
      if (m.id === parseInt(moveInId)) {
        const requirements = m.requirements.map(r => r.id === parseInt(reqId) ? { ...r, status } : r);
        const allCompleted = requirements.every(r => r.status === 'Completed');
        return {
          ...m,
          requirements,
          status: allCompleted ? 'Ready' : 'Awaiting Documents'
        };
      }
      return m;
    });
    setStore('mock_move_ins', list);
    return { success: true };
  }),
  approveMoveIn: (id) => withDelay(() => {
    let list = getStore('mock_move_ins');
    list = list.map(m => m.id === parseInt(id) ? { ...m, status: 'Approved' } : m);
    setStore('mock_move_ins', list);
    return { success: true };
  }),
  cancelMoveIn: (id) => withDelay(() => {
    let list = getStore('mock_move_ins');
    list = list.map(m => m.id === parseInt(id) ? { ...m, status: 'Cancelled' } : m);
    setStore('mock_move_ins', list);
    return { success: true };
  }),
  overrideMoveIn: (id) => withDelay(() => {
    let list = getStore('mock_move_ins');
    list = list.map(m => m.id === parseInt(id) ? { ...m, status: 'Approved' } : m);
    setStore('mock_move_ins', list);
    return { success: true };
  }),

  getMoveOuts: () => withDelay(() => getStore('mock_move_outs')),
  cancelMoveOut: (leaseId) => withDelay(() => {
    let list = getStore('mock_move_outs');
    list = list.filter(m => m.leaseId !== parseInt(leaseId));
    setStore('mock_move_outs', list);
    return { success: true };
  }),
  confirmMoveOut: (id) => withDelay(() => {
    let list = getStore('mock_move_outs');
    list = list.map(m => m.id === parseInt(id) ? { ...m, status: 'Confirmed' } : m);
    setStore('mock_move_outs', list);
    return { success: true };
  }),
  completeMoveOut: (id) => withDelay(() => {
    let list = getStore('mock_move_outs');
    list = list.map(m => m.id === parseInt(id) ? { ...m, status: 'Completed' } : m);
    setStore('mock_move_outs', list);
    return { success: true };
  }),
  scheduleFinalMoveOut: (id, date) => withDelay(() => {
    let list = getStore('mock_move_outs');
    list = list.map(m => m.id === parseInt(id) ? { ...m, status: 'Scheduled Final', finalInspectionDate: date } : m);
    setStore('mock_move_outs', list);
    return { success: true };
  }),

  getPrepUnits: () => withDelay(() => getStore('mock_prep_units')),
  updatePrepStage: (unitId, nextStage) => withDelay(() => {
    let list = getStore('mock_prep_units');
    let updated = null;
    list = list.map(u => {
      if (u.unitId === parseInt(unitId)) {
        updated = { ...u, current_stage: nextStage };
        return updated;
      }
      return u;
    });
    setStore('mock_prep_units', list);
    return { success: true, data: updated };
  }),

  getInspections: (page = 1, limit = 10) => withDelay(() => {
    const list = getStore('mock_inspections');
    const start = (page - 1) * limit;
    return {
      data: list.slice(start, start + limit),
      pagination: { total: list.length, totalPages: Math.ceil(list.length / limit), page, limit }
    };
  }),
  getInspectionById: (id) => withDelay(() => {
    const list = getStore('mock_inspections');
    const insp = list.find(i => i.id === parseInt(id));
    if (!insp) throw new Error('Inspection not found');
    return insp;
  }),
  createInspection: (data) => withDelay(() => {
    const list = getStore('mock_inspections');
    const templates = getStore('mock_inspection_templates');
    const template = templates.find(t => t.id === parseInt(data.templateId));
    const apartments = getStore('mock_apartments');
    const unit = apartments.find(u => u.id === parseInt(data.unitId));
    const employees = getStore('mock_employees');
    const coworker = employees.find(e => e.id === parseInt(data.inspectorId));

    const newInsp = {
      id: list.length ? Math.max(...list.map(i => i.id)) + 1 : 1,
      title: data.title || 'New Inspection',
      inspectorName: coworker ? `${coworker.firstName} ${coworker.lastName}` : 'Staff Inspector',
      inspectorId: parseInt(data.inspectorId),
      unitId: parseInt(data.unitId),
      unitNumber: unit ? unit.unitNumber : 'Apt 101',
      propertyName: unit ? unit.propertyName : 'Parkview Heights',
      status: 'Scheduled',
      scheduledDate: data.scheduledDate,
      completedDate: null,
      templateId: parseInt(data.templateId),
      templateName: template ? template.name : 'Standard Checklist',
      tickets: [],
      structure: template ? template.structure : { rooms: [] }
    };
    list.push(newInsp);
    setStore('mock_inspections', list);
    return newInsp;
  }),
  updateInspectionStatus: (id, status) => withDelay(() => {
    let list = getStore('mock_inspections');
    list = list.map(i => i.id === parseInt(id) ? { ...i, status } : i);
    setStore('mock_inspections', list);
    return { success: true };
  }),
  deleteInspection: (id) => withDelay(() => {
    let list = getStore('mock_inspections');
    list = list.filter(i => i.id !== parseInt(id));
    setStore('mock_inspections', list);
    return { success: true };
  }),
  addInspectionTicket: (id, ticketData) => withDelay(() => {
    let list = getStore('mock_inspections');
    let newTicket = null;
    list = list.map(i => {
      if (i.id === parseInt(id)) {
        const tickets = i.tickets || [];
        newTicket = {
          id: tickets.length ? Math.max(...tickets.map(t => t.id)) + 1 : 1,
          ...ticketData,
          status: 'Open',
          createdAt: new Date().toISOString()
        };
        // Also add to global maintenance list
        const mList = getStore('mock_maintenance_tickets');
        mList.push({
          id: 500 + newTicket.id,
          ticketNumber: `TKT-${2000 + newTicket.id}`,
          tenantName: 'Inspection Auto-Generated',
          propertyName: i.propertyName,
          unitNumber: i.unitNumber,
          title: newTicket.title,
          description: newTicket.description,
          category: 'Inspection Issue',
          priority: 'High',
          status: 'Open',
          assignedTo: 'Mike Johnson',
          notes: [],
          createdAt: new Date().toISOString()
        });
        setStore('mock_maintenance_tickets', mList);

        return { ...i, tickets: [...tickets, newTicket] };
      }
      return i;
    });
    setStore('mock_inspections', list);
    return newTicket;
  }),
  deleteInspectionTicket: (id, ticketId) => withDelay(() => {
    let list = getStore('mock_inspections');
    list = list.map(i => {
      if (i.id === parseInt(id)) {
        return { ...i, tickets: (i.tickets || []).filter(t => t.id !== parseInt(ticketId)) };
      }
      return i;
    });
    setStore('mock_inspections', list);
    return { success: true };
  }),

  getTemplates: (page = 1, limit = 10) => withDelay(() => {
    const list = getStore('mock_inspection_templates');
    const start = (page - 1) * limit;
    return {
      data: list.slice(start, start + limit),
      pagination: { total: list.length, totalPages: Math.ceil(list.length / limit), page, limit }
    };
  }),
  createTemplate: (data) => withDelay(() => {
    const list = getStore('mock_inspection_templates');
    const newTemp = {
      id: list.length ? Math.max(...list.map(t => t.id)) + 1 : 1,
      name: data.name,
      structure: data.structure || { rooms: [] }
    };
    list.push(newTemp);
    setStore('mock_inspection_templates', list);
    return newTemp;
  }),
  updateTemplate: (id, data) => withDelay(() => {
    let list = getStore('mock_inspection_templates');
    let updated = null;
    list = list.map(t => {
      if (t.id === parseInt(id)) {
        updated = { ...t, name: data.name, structure: data.structure };
        return updated;
      }
      return t;
    });
    setStore('mock_inspection_templates', list);
    return updated;
  }),
  deleteTemplate: (id) => withDelay(() => {
    let list = getStore('mock_inspection_templates');
    list = list.filter(t => t.id !== parseInt(id));
    setStore('mock_inspection_templates', list);
    return { success: true };
  }),
  duplicateTemplate: (id) => withDelay(() => {
    const list = getStore('mock_inspection_templates');
    const temp = list.find(t => t.id === parseInt(id));
    if (!temp) throw new Error('Template not found');
    const newTemp = {
      id: list.length ? Math.max(...list.map(t => t.id)) + 1 : 1,
      name: `${temp.name} (Copy)`,
      structure: JSON.parse(JSON.stringify(temp.structure))
    };
    list.push(newTemp);
    setStore('mock_inspection_templates', list);
    return newTemp;
  }),

  getResponseSeries: () => withDelay(() => getStore('mock_response_groups')),
  createResponseSeries: (data) => withDelay(() => {
    const list = getStore('mock_response_groups');
    const newSer = {
      id: list.length ? Math.max(...list.map(r => r.id)) + 1 : 1,
      name: data.name,
      responses: Array.isArray(data.responses) ? data.responses : (data.responses || '').split(',').map(s => s.trim())
    };
    list.push(newSer);
    setStore('mock_response_groups', list);
    return newSer;
  }),
  updateResponseSeries: (id, data) => withDelay(() => {
    let list = getStore('mock_response_groups');
    let updated = null;
    list = list.map(r => {
      if (r.id === parseInt(id)) {
        updated = {
          ...r,
          name: data.name,
          responses: Array.isArray(data.responses) ? data.responses : (data.responses || '').split(',').map(s => s.trim())
        };
        return updated;
      }
      return r;
    });
    setStore('mock_response_groups', list);
    return updated;
  }),
  deleteResponseSeries: (id) => withDelay(() => {
    let list = getStore('mock_response_groups');
    list = list.filter(r => r.id !== parseInt(id));
    setStore('mock_response_groups', list);
    return { success: true };
  })
};

export const mockCompanyService = {
  getAll: () => withDelay(() => {
    const list = getStore('mock_companies');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.role === 'ADMIN' && currentUser.assignedCompanyIds) {
      return list.filter(c => currentUser.assignedCompanyIds.includes(c.id));
    }
    if (currentUser.role === 'OWNER' && currentUser.assignedCompanyIds) {
      return list.filter(c => currentUser.assignedCompanyIds.includes(c.id));
    }
    if (currentUser.role === 'COWORKER' && currentUser.assignedCompanyIds) {
      return list.filter(c => currentUser.assignedCompanyIds.includes(c.id));
    }
    return list;
  })
};

export const mockOwnerService = {
  getAll: () => withDelay(() => {
    const list = getStore('mock_users').filter(u => u.role === 'OWNER');
    return list.map(u => ({
      properties: [],
      companyName: '',
      totalUnits: 0,
      ...u
    }));
  }),
  getDashboardStats: (ownerId) => withDelay(() => {
    // Return owner dashboard metrics
    return {
      totalProperties: ownerId ? 1 : 3,
      totalUnits: ownerId ? 16 : 118,
      occupancyRate: '93%',
      activeLeases: ownerId ? 14 : 110,
      collectedRent: 48500,
      outstandingRent: 1200,
      maintenanceTickets: 4,
      properties: [
        { id: 1, name: 'Parkview Heights', units: 42, occupancy: '95%', rentCollected: 48500, outstanding: 0 },
        { id: 2, name: 'Sunset Towers', units: 60, occupancy: '90%', rentCollected: 0, outstanding: 1200 }
      ]
    };
  })
};

export const mockSettingsService = {
  getTaxSettings: () => withDelay(() => getStore('mock_tax_settings')),
  saveTaxSettings: (data) => withDelay(() => {
    setStore('mock_tax_settings', data);
    return data;
  }),
  createTax: (data) => withDelay(() => {
    const list = getStore('mock_tax_settings');
    const newTax = {
      id: list.length ? Math.max(...list.map(t => t.id)) + 1 : 1,
      name: data.name,
      rate: parseFloat(data.rate) || 0,
      status: data.status || 'Active'
    };
    list.push(newTax);
    setStore('mock_tax_settings', list);
    return newTax;
  }),
  updateTax: (id, data) => withDelay(() => {
    let list = getStore('mock_tax_settings');
    let updated = null;
    list = list.map(item => {
      if (item.id === parseInt(id)) {
        updated = {
          ...item,
          ...data,
          rate: data.rate !== undefined ? parseFloat(data.rate) : item.rate
        };
        return updated;
      }
      return item;
    });
    setStore('mock_tax_settings', list);
    return updated;
  }),
  deleteTax: (id) => withDelay(() => {
    let list = getStore('mock_tax_settings');
    list = list.filter(item => item.id !== parseInt(id));
    setStore('mock_tax_settings', list);
    return { success: true };
  }),
  getQuickBooks: () => withDelay(() => JSON.parse(localStorage.getItem('mock_quickbooks_settings'))),
  disconnectQuickBooks: () => withDelay(() => {
    const qb = { connected: false, connectedEmail: '', lastSyncTime: null, companyName: '' };
    localStorage.setItem('mock_quickbooks_settings', JSON.stringify(qb));
    return qb;
  }),
  getChartOfAccounts: () => withDelay(() => getStore('mock_chart_of_accounts')),
  createChartOfAccount: (data) => withDelay(() => {
    const list = getStore('mock_chart_of_accounts');
    const newAcc = {
      id: list.length ? Math.max(...list.map(c => c.id)) + 1 : 1,
      code: data.code,
      name: data.name,
      type: data.type,
      balance: parseFloat(data.balance || 0)
    };
    list.push(newAcc);
    setStore('mock_chart_of_accounts', list);
    return newAcc;
  }),
  updateChartOfAccount: (id, data) => withDelay(() => {
    let list = getStore('mock_chart_of_accounts');
    let updated = null;
    list = list.map(item => {
      if (item.id === parseInt(id)) {
        updated = {
          ...item,
          ...data
        };
        return updated;
      }
      return item;
    });
    setStore('mock_chart_of_accounts', list);
    return updated;
  }),
  deleteChartOfAccount: (id) => withDelay(() => {
    let list = getStore('mock_chart_of_accounts');
    list = list.filter(item => item.id !== parseInt(id));
    setStore('mock_chart_of_accounts', list);
    return { success: true };
  })
};

export const mockCalendarService = {
  getAll: () => withDelay(() => getStore('mock_calendar_events'))
};

export const mockReportsService = {
  getAll: () => withDelay(() => getStore('mock_reports_analytics')),
  getRentRoll: () => withDelay(() => {
    const raw = getStore('mock_rent_roll') || {};
    const list = raw.rentRoll || raw.units || [];
    const allowedPropertyIds = getAllowedPropertyIds();
    const properties = getStore('mock_properties');
    
    const filtered = list.filter(row => {
      const prop = properties.find(p => p.name === row.buildingName);
      return prop && allowedPropertyIds.includes(prop.id);
    });

    const enriched = filtered.map(row => {
      const prop = properties.find(p => p.name === row.buildingName);
      return {
        ...row,
        companyName: prop ? prop.companyName : '-'
      };
    });

    const summary = {
      totalRentCollected: enriched.reduce((sum, r) => sum + (r.rentAmount || 0), 0),
      totalDepositsHeld: enriched.reduce((sum, r) => sum + (r.depositBalance || 0), 0),
      totalOutstandingBalance: enriched.reduce((sum, r) => sum + (r.rentBalance || 0), 0),
      occupancyRate: enriched.length ? Math.round((enriched.filter(r => r.tenantName !== 'Vacant').length / enriched.length) * 100) : 0
    };

    return {
      summary,
      rentRoll: enriched
    };
  })
};

export const mockCommunicationService = {
  getConversations: () => withDelay(() => [
    { id: 4, name: 'Sarah Smith', role: 'COWORKER', unreadCount: 1, lastMessage: 'Let me check the lease details.' },
    { id: 101, name: 'Sarah Connor', role: 'TENANT', unreadCount: 0, lastMessage: 'Thank you for repairing the AC!' },
    { id: 3, name: 'Owner User', role: 'OWNER', unreadCount: 0, lastMessage: 'Are the financial statements ready?' }
  ]),
  getHistory: (userId) => withDelay(() => {
    const currentLogs = getStore(`mock_chat_history_${userId}`);
    if (currentLogs.length > 0) return currentLogs;

    const defaultHistory = [
      { id: 1, senderId: parseInt(userId), content: 'Hello, I had a question regarding my unit.', createdAt: '2026-06-28T09:00:00Z' },
      { id: 2, senderId: 1, content: 'Sure, how can we help you today?', createdAt: '2026-06-28T09:05:00Z' }
    ];
    setStore(`mock_chat_history_${userId}`, defaultHistory);
    return defaultHistory;
  }),
  sendMessage: (receiverId, content) => withDelay(() => {
    const history = getStore(`mock_chat_history_${receiverId}`);
    const newMsg = {
      id: history.length ? Math.max(...history.map(m => m.id)) + 1 : 1,
      senderId: 1, // Logged in Admin
      content,
      createdAt: new Date().toISOString()
    };
    history.push(newMsg);
    setStore(`mock_chat_history_${receiverId}`, history);
    return newMsg;
  }),
  markAsRead: (senderId) => withDelay(() => {
    return { success: true };
  })
};

export const mockReadinessService = {
  getBuildings: () => withDelay(() => {
    return getStore('mock_properties').map(p => ({ id: p.id, name: p.name }));
  }),
  getStats: (propertyId, showLeased) => withDelay(() => {
    const units = getStore('mock_readiness_units');
    let filtered = units;
    if (propertyId) {
      // Compare by name or parsed ID
      const p = getStore('mock_properties').find(prop => prop.id === parseInt(propertyId));
      if (p) {
        filtered = units.filter(u => u.building === p.name);
      }
    }
    const totalUnits = filtered.length;
    const readyForLeasing = filtered.filter(u => {
      const allDone = Object.values(u.completion || {}).filter(v => v).length === 7;
      return allDone && (showLeased ? true : !u.reserved);
    }).length;
    const reservedUnits = filtered.filter(u => u.reserved).length;
    const overdueUnits = filtered.filter(u => u.daysLate > 0).length;

    return {
      totalUnits,
      readyForLeasing,
      reservedUnits,
      overdueUnits
    };
  }),
  getDashboard: (params) => withDelay(() => {
    const units = getStore('mock_readiness_units');
    let filtered = units;

    if (params.propertyId) {
      const p = getStore('mock_properties').find(prop => prop.id === parseInt(params.propertyId));
      if (p) {
        filtered = filtered.filter(u => u.building === p.name);
      }
    }

    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(u => u.unitNumber.toLowerCase().includes(s) || u.building.toLowerCase().includes(s));
    }

    if (params.status) {
      if (params.status === 'Reserved') {
        filtered = filtered.filter(u => u.reserved);
      } else if (params.status === 'Available') {
        filtered = filtered.filter(u => !u.reserved);
      }
    }

    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 15;
    const start = (page - 1) * limit;
    const end = page * limit;
    const paginated = filtered.slice(start, end);

    return {
      units: paginated,
      total: filtered.length
    };
  }),
  getSettings: () => withDelay(() => {
    return JSON.parse(localStorage.getItem('mock_readiness_settings')) || mockReadinessSettings;
  }),
  updateSettings: (newSettings) => withDelay(() => {
    localStorage.setItem('mock_readiness_settings', JSON.stringify(newSettings));
    return newSettings;
  }),
  getHolidays: () => withDelay(() => {
    return getStore('mock_readiness_holidays');
  }),
  addHoliday: (holiday) => withDelay(() => {
    const holidays = getStore('mock_readiness_holidays');
    const newHoliday = {
      id: holidays.length ? Math.max(...holidays.map(h => h.id)) + 1 : 1,
      ...holiday
    };
    holidays.push(newHoliday);
    setStore('mock_readiness_holidays', holidays);
    return newHoliday;
  }),
  deleteHoliday: (id) => withDelay(() => {
    let holidays = getStore('mock_readiness_holidays');
    holidays = holidays.filter(h => h.id !== parseInt(id));
    setStore('mock_readiness_holidays', holidays);
    return { success: true };
  }),
  updateStep: (unitId, stepKey, status, isGcDelivered) => withDelay(() => {
    let units = getStore('mock_readiness_units');
    let updatedUnit = null;
    units = units.map(u => {
      if (u.id === parseInt(unitId)) {
        const completion = { ...u.completion };
        completion[stepKey] = status;
        completion[stepKey + '_at'] = status ? new Date().toISOString() : null;
        
        const allDone = Object.values(completion).filter(v => v).length === 7;
        let stage = u.stage;
        if (allDone) {
          stage = u.reserved ? "Reserved – Ready" : "Unit Ready";
        } else if (completion.gc_delivered && !completion.gc_cleaned) {
          stage = "GC Cleaning In Progress";
        } else if (completion.gc_cleaned && !completion.ffe_installed) {
          stage = "Ops FF&E Pending";
        } else {
          stage = "On Schedule";
        }

        updatedUnit = { ...u, completion, stage };
        return updatedUnit;
      }
      return u;
    });
    setStore('mock_readiness_units', units);
    return updatedUnit;
  })
};

export const mockInsuranceService = {
  getCompliance: () => withDelay(() => {
    return getStore('mock_insurance_compliance');
  }),
  getStats: () => withDelay(() => {
    const list = getStore('mock_insurance_compliance');
    return {
      missing: list.filter(i => i.status === 'MISSING').length,
      expired: list.filter(i => i.status === 'EXPIRED').length,
      expiringSoon: list.filter(i => i.status === 'EXPIRING_SOON' || i.status === 'EXPIRING').length,
      active: list.filter(i => i.status === 'ACTIVE').length
    };
  }),
  create: (data) => withDelay(() => {
    const list = getStore('mock_insurance_compliance');
    const tenant = getStore('mock_tenants').find(t => t.id === parseInt(data.userId));
    const newRecord = {
      id: list.length ? Math.max(...list.map(i => i.id)) + 1 : 1,
      tenantId: parseInt(data.userId),
      tenantName: tenant ? tenant.name : 'Unknown Tenant',
      unitId: parseInt(data.unitId),
      leaseId: parseInt(data.leaseId),
      building: data.building || 'Parkview Heights',
      provider: data.provider,
      policyNumber: data.policyNumber,
      startDate: data.startDate,
      endDate: data.endDate,
      status: new Date(data.endDate) < new Date() ? 'EXPIRED' : 'ACTIVE',
      notes: data.notes || '',
      documentUrl: data.documentUrl || '',
      uploadedDocumentId: data.uploadedDocumentId || ''
    };
    list.push(newRecord);
    setStore('mock_insurance_compliance', list);
    return newRecord;
  }),
  update: (id, data) => withDelay(() => {
    let list = getStore('mock_insurance_compliance');
    let updated = null;
    list = list.map(item => {
      if (item.id === parseInt(id)) {
        updated = {
          ...item,
          provider: data.provider || item.provider,
          policyNumber: data.policyNumber || item.policyNumber,
          startDate: data.startDate || item.startDate,
          endDate: data.endDate || item.endDate,
          status: new Date(data.endDate) < new Date() ? 'EXPIRED' : 'ACTIVE',
          notes: data.notes !== undefined ? data.notes : item.notes
        };
        return updated;
      }
      return item;
    });
    setStore('mock_insurance_compliance', list);
    return updated;
  })
};

export const mockGeneralSettingsService = {
  getSettings: () => withDelay(() => {
    return getStore('mock_general_settings');
  }),
  saveSettings: (newSettings) => withDelay(() => {
    const current = getStore('mock_general_settings');
    current.settings = { ...current.settings, ...newSettings };
    setStore('mock_general_settings', current);
    return current;
  }),
  getServiceItems: () => withDelay(() => {
    return getStore('mock_service_items');
  }),
  addServiceItem: (item) => withDelay(() => {
    const list = getStore('mock_service_items');
    const newItem = {
      id: list.length ? Math.max(...list.map(i => i.id)) + 1 : 1,
      name: item.name,
      amount: parseFloat(item.amount) || 0
    };
    list.push(newItem);
    setStore('mock_service_items', list);
    return newItem;
  }),
  deleteServiceItem: (id) => withDelay(() => {
    let list = getStore('mock_service_items');
    list = list.filter(i => i.id !== parseInt(id));
    setStore('mock_service_items', list);
    return { success: true };
  }),
  getPayments: () => withDelay(() => {
    return getStore('mock_payments_received');
  }),
  createPayment: (payment) => withDelay(() => {
    const list = getStore('mock_payments_received');
    const newPayment = {
      id: list.length ? Math.max(...list.map(p => p.id)) + 1 : 201,
      tenant: payment.tenantName || 'Unknown Tenant',
      unit: payment.unitNumber || 'Apt -',
      date: new Date().toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' }), // e.g. "27 Mar 2026"
      amount: parseFloat(payment.amount) || 0,
      paymentMethod: payment.paymentMethod || 'Cash',
      type: payment.type || 'Rent',
      status: 'Paid'
    };
    list.push(newPayment);
    setStore('mock_payments_received', list);
    return newPayment;
  })
};

export const mockLedgerService = {
  getTransactions: () => withDelay(() => {
    return getStore('mock_ledger');
  })
};

export const mockTicketsService = {
  getAll: () => withDelay(() => {
    let list = getStore('mock_maintenance_tickets');
    const allowedPropertyIds = getAllowedPropertyIds();
    const properties = getStore('mock_properties');
    const allowedPropertyNames = properties.filter(p => allowedPropertyIds.includes(p.id)).map(p => p.name);
    list = list.filter(t => allowedPropertyNames.includes(t.propertyName || t.building));
    return list.map(t => ({
      ...t,
      dbId: t.id,
      id: `TKT-${t.id}`,
      subject: t.title || t.name || 'Maintenance Request',
      tenant: t.tenantName || 'Alice Cooper',
      unit: t.unitNumber || 'Apt 101',
      desc: t.description || t.notes || '',
      status: t.status || 'Open',
      priority: t.priority || 'Medium',
      attachments: t.attachments || []
    }));
  }),
  create: (data) => withDelay(() => {
    const list = getStore('mock_maintenance_tickets');
    const id = list.length ? Math.max(...list.map(t => t.id)) + 1 : 301;
    const newTkt = {
      id,
      dbId: id,
      ticketNumber: `TKT-${id}`,
      tenantName: data.tenant || data.tenantName || 'Alice Cooper',
      propertyName: data.building || data.propertyName || 'Sunset Towers',
      unitNumber: data.unit || data.unitNumber || 'Apt 101',
      title: data.subject || data.name || 'Maintenance Request',
      description: data.desc || data.description || '',
      category: data.category || 'General',
      priority: data.priority || 'Medium',
      status: data.status || 'Open',
      assignedTo: data.vendor || 'Mike Johnson',
      notes: [],
      createdAt: new Date().toISOString(),
      attachments: data.attachments || []
    };
    list.push(newTkt);
    setStore('mock_maintenance_tickets', list);
    return newTkt;
  }),
  update: (id, data) => withDelay(() => {
    let list = getStore('mock_maintenance_tickets');
    let updated = null;
    list = list.map(t => {
      if (t.id === parseInt(id)) {
        updated = {
          ...t,
          ...data,
          tenantName: data.tenant || t.tenantName,
          propertyName: data.building || t.propertyName,
          unitNumber: data.unit || t.unitNumber,
          title: data.subject || t.title,
          description: data.desc || t.description
        };
        return updated;
      }
      return t;
    });
    setStore('mock_maintenance_tickets', list);
    return updated;
  }),
  updateStatus: (id, status) => withDelay(() => {
    let list = getStore('mock_maintenance_tickets');
    let updated = null;
    list = list.map(t => {
      if (t.id === parseInt(id)) {
        updated = {
          ...t,
          status
        };
        return updated;
      }
      return t;
    });
    setStore('mock_maintenance_tickets', list);
    return updated;
  }),
  delete: (id) => withDelay(() => {
    let list = getStore('mock_maintenance_tickets');
    list = list.filter(t => t.id !== parseInt(id));
    setStore('mock_maintenance_tickets', list);
    return { success: true };
  })
};

export const mockTenantDashboardService = {
  getProfile: (tenantId) => withDelay(() => {
    const list = getStore('mock_tenants');
    const tenant = list.find(t => t.id === parseInt(tenantId)) || list[0];
    return {
      name: `${tenant.firstName} ${tenant.lastName}`,
      buildingName: tenant.propertyName || 'Parkview Heights',
      unitNumber: tenant.unitNumber || 'Apt 101'
    };
  }),
  getDashboard: (tenantId) => withDelay(() => {
    const list = getStore('mock_tenants');
    const tenant = list.find(t => t.id === parseInt(tenantId)) || list[0];
    const tickets = getStore('mock_maintenance_tickets').filter(t => t.tenantName === `${tenant.firstName} ${tenant.lastName}`);
    return {
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      stats: {
        recentTickets: tickets.slice(0, 3).map(t => ({
          id: `TKT-${t.id}`,
          subject: t.title || t.name || 'Maintenance Request',
          status: t.status || 'Open',
          priority: t.priority || 'Medium',
          createdAt: t.createdAt
        })),
        unreadCount: 0,
        nextDueDate: tenant.leaseEnd,
        currentRent: tenant.rent || 0,
        rentDueStatus: 'Paid',
        leaseStatus: tenant.status || 'Active',
        leaseExpiry: tenant.leaseEnd,
        openTickets: tickets.filter(t => t.status !== 'Resolved').length
      }
    };
  }),
  getLease: (tenantId) => withDelay(() => {
    const list = getStore('mock_tenants');
    const tenant = list.find(t => t.id === parseInt(tenantId)) || list[0];
    return {
      id: `LSE-${tenant.id}`,
      status: 'Active',
      property: tenant.propertyName || 'Parkview Heights',
      unit: tenant.unitNumber || 'Apt 101',
      address: '123 Parkview Ave, Montreal, QC',
      startDate: tenant.leaseStart || '2025-01-01',
      endDate: tenant.leaseEnd || '2025-12-31',
      monthlyRent: tenant.rent || 0,
      deposit: tenant.deposit || 0,
      adminPhone: '+1 (514) 555-0100'
    };
  }),
  getVehicles: (tenantId) => withDelay(() => {
    return [
      { id: 1, make: 'Toyota', model: 'Corolla', year: '2022', plate: 'XYZ 123', color: 'Silver' }
    ];
  }),
  getTickets: (tenantId) => withDelay(() => {
    const list = getStore('mock_tenants');
    const tenant = list.find(t => t.id === parseInt(tenantId)) || list[0];
    const tickets = getStore('mock_maintenance_tickets').filter(t => t.tenantName === `${tenant.firstName} ${tenant.lastName}`);
    return tickets.map(t => ({
      ...t,
      dbId: t.id,
      id: `TKT-${t.id}`,
      subject: t.title || t.name || 'Maintenance Request',
      tenant: t.tenantName || 'Alice Cooper',
      unit: t.unitNumber || 'Apt 101',
      desc: t.description || t.notes || '',
      status: t.status || 'Open',
      priority: t.priority || 'Medium',
      attachments: t.attachments || []
    }));
  }),
  createTicket: (tenantId, data) => withDelay(() => {
    const list = getStore('mock_tenants');
    const tenant = list.find(t => t.id === parseInt(tenantId)) || list[0];
    const mList = getStore('mock_maintenance_tickets');
    const id = mList.length ? Math.max(...mList.map(t => t.id)) + 1 : 301;
    const newTkt = {
      id,
      dbId: id,
      ticketNumber: `TKT-${id}`,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      propertyName: tenant.propertyName || 'Parkview Heights',
      unitNumber: tenant.unitNumber || 'Apt 101',
      title: data.get ? data.get('title') : (data.title || 'General Maintenance Request'),
      description: data.get ? data.get('description') : (data.description || ''),
      category: data.get ? data.get('category') : (data.category || 'General'),
      priority: data.get ? data.get('priority') : (data.priority || 'Medium'),
      status: 'Open',
      assignedTo: 'Unassigned',
      notes: [],
      createdAt: new Date().toISOString(),
      attachments: []
    };
    mList.push(newTkt);
    setStore('mock_maintenance_tickets', mList);
    return newTkt;
  }),
  getReports: (tenantId) => withDelay(() => {
    return [];
  }),
  getInvoices: (tenantId) => withDelay(() => {
    const list = getStore('mock_tenants');
    const tenant = list.find(t => t.id === parseInt(tenantId)) || list[0];
    const invoices = getStore('mock_invoices') || [];
    return invoices.filter(i => i.tenantId === tenant.id || i.tenantName === `${tenant.firstName} ${tenant.lastName}`).map(i => ({
      ...i,
      dbId: i.id
    }));
  }),
  payInvoice: (tenantId, data) => withDelay(() => {
    let invoices = getStore('mock_invoices') || [];
    invoices = invoices.map(i => {
      if (i.id === parseInt(data.invoiceId)) {
        return {
          ...i,
          status: 'Paid',
          paidAmount: i.amount,
          paymentMethod: data.method || 'Credit Card',
          paymentDate: new Date().toLocaleDateString('en-CA')
        };
      }
      return i;
    });
    setStore('mock_invoices', invoices);
    return { success: true };
  }),
  getInsurance: (tenantId) => withDelay(() => {
    const list = getStore('mock_insurance_compliance') || [];
    const item = list.find(i => i.tenantId === parseInt(tenantId));
    return item || null;
  }),
  saveInsurance: (tenantId, data) => withDelay(() => {
    const list = getStore('mock_insurance_compliance') || [];
    const id = list.length ? Math.max(...list.map(i => i.id)) + 1 : 1;
    const newRecord = {
      id,
      tenantId: parseInt(tenantId),
      provider: data.get ? data.get('provider') : data.provider,
      policyNumber: data.get ? data.get('policyNumber') : data.policyNumber,
      startDate: data.get ? data.get('startDate') : data.startDate,
      endDate: data.get ? data.get('endDate') : data.endDate,
      status: 'ACTIVE',
      notes: '',
      documentUrl: '',
      uploadedDocumentId: ''
    };
    list.push(newRecord);
    setStore('mock_insurance_compliance', list);
    return newRecord;
  }),
  getDocuments: (tenantId) => withDelay(() => {
    const list = getStore('mock_documents') || [];
    return list.filter(d => d.tenantId === parseInt(tenantId));
  }),
  saveDocument: (tenantId, data) => withDelay(() => {
    const list = getStore('mock_documents') || [];
    const id = list.length ? Math.max(...list.map(d => d.id)) + 1 : 1;
    const newDoc = {
      id,
      tenantId: parseInt(tenantId),
      name: data.get ? data.get('name') : data.name,
      fileSize: '1.2 MB',
      uploadedAt: new Date().toISOString(),
      url: '#'
    };
    list.push(newDoc);
    setStore('mock_documents', list);
    return newDoc;
  })
};

export const mockOwnerDashboardService = {
  getProfile: (ownerId) => withDelay(() => {
    return {
      name: 'Owner User',
      email: 'owner@property.com',
      role: 'OWNER'
    };
  }),
  getStats: (ownerId) => withDelay(() => {
    return {
      propertyCount: 2,
      unitCount: 20,
      occupancy: {
        vacantUnits: 2,
        vacantUnitsList: ['Sunset Towers - Apt 304', 'Sunset Towers - Apt 405'],
        vacantBedrooms: 3,
        vacantBedroomsList: ['Sunset Towers - Apt 202 Bed A', 'Sunset Towers - Apt 202 Bed B']
      },
      outstandingDues: 2500,
      insuranceExpiryCount: 1,
      recentActivity: [
        { id: 1, text: 'Rent paid by Alice Cooper for Sunset Towers Apt 201', time: '2 hours ago' },
        { id: 2, text: 'Maintenance task leaking kitchen faucet completed', time: '1 day ago' }
      ],
      tenants: [
        { id: 101, name: 'Sarah Connor', unit: 'Apt 101', property: 'Parkview Heights' },
        { id: 102, name: 'Alice Cooper', unit: 'Apt 201', property: 'Sunset Towers' }
      ]
    };
  }),
  getFinancialPulse: (ownerId) => withDelay(() => {
    return [
      { month: '2026-01', expected: 15000, collected: 15000, dues: 0 },
      { month: '2026-02', expected: 15000, collected: 14000, dues: 1000 },
      { month: '2026-03', expected: 15000, collected: 15000, dues: 0 },
      { month: '2026-04', expected: 18000, collected: 17500, dues: 500 },
      { month: '2026-05', expected: 18000, collected: 18000, dues: 0 },
      { month: '2026-06', expected: 18000, collected: 15500, dues: 2500 }
    ];
  }),
  getProperties: (ownerId) => withDelay(() => {
    return getStore('mock_properties') || [];
  }),
  getFinancials: (ownerId) => withDelay(() => {
    return {
      collected: 18000,
      outstandingDues: 2500,
      securityDepositsHeld: 5000,
      netEarnings: 15500,
      transactions: [
        { id: 1, date: '2026-06-15', description: 'Monthly Revenue Payout', type: 'Payout', amount: 15500.00, status: 'Completed' },
        { id: 2, date: '2026-05-15', description: 'Monthly Revenue Payout', type: 'Payout', amount: 18000.00, status: 'Completed' }
      ]
    };
  }),
  getReports: (ownerId) => withDelay(() => {
    return [
      { id: 1, name: 'Monthly Owner Statement - Jun 2026', type: 'Owner Statement', generatedAt: '2026-06-25T16:00:00Z', url: '#' }
    ];
  })
};

export const mockRenewalService = {
  getAll: () => withDelay(() => {
    const list = getStore('mock_renewals') || [];
    const leases = getStore('mock_leases') || [];
    const apartments = getStore('mock_apartments') || [];
    const properties = getStore('mock_properties') || [];
    const tenants = getStore('mock_tenants') || [];
    const allowedPropertyIds = getAllowedPropertyIds();

    const joined = list.map(ren => {
      const lease = leases.find(l => l.id === ren.leaseId);
      if (!lease) return null;
      const apt = apartments.find(a => a.id === lease.unitId);
      const prop = properties.find(p => p.id === lease.propertyId);
      const tenant = tenants.find(t => t.id === lease.tenantId);

      return {
        ...ren,
        lease,
        companyId: prop ? prop.companyId : 1,
        companyName: prop ? prop.companyName : '-',
        propertyId: lease.propertyId,
        propertyName: prop ? prop.name : lease.propertyName,
        unitId: lease.unitId,
        unitNumber: apt ? apt.unitNumber : lease.unitNumber,
        tenantId: lease.tenantId,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : lease.tenantName,
        leaseStart: lease.startDate,
        leaseEnd: lease.endDate,
        currentRent: lease.rentAmount
      };
    }).filter(Boolean);

    return joined.filter(r => allowedPropertyIds.includes(r.propertyId));
  }),

  getById: (id) => withDelay(() => {
    const list = getStore('mock_renewals') || [];
    const ren = list.find(r => r.id === parseInt(id));
    if (!ren) throw new Error('Renewal not found');

    const leases = getStore('mock_leases') || [];
    const apartments = getStore('mock_apartments') || [];
    const properties = getStore('mock_properties') || [];
    const tenants = getStore('mock_tenants') || [];

    const lease = leases.find(l => l.id === ren.leaseId);
    const apt = apartments.find(a => a.id === (lease ? lease.unitId : 0));
    const prop = properties.find(p => p.id === (lease ? lease.propertyId : 0));
    const tenant = tenants.find(t => t.id === (lease ? lease.tenantId : 0));

    const previousRenewals = list.filter(r => r.leaseId === ren.leaseId && r.id !== ren.id);

    return {
      ...ren,
      lease,
      companyId: prop ? prop.companyId : 1,
      companyName: prop ? prop.companyName : '-',
      propertyId: lease ? lease.propertyId : 0,
      propertyName: prop ? prop.name : (lease ? lease.propertyName : '-'),
      unitId: lease ? lease.unitId : 0,
      unitNumber: apt ? apt.unitNumber : (lease ? lease.unitNumber : '-'),
      tenantId: lease ? lease.tenantId : 0,
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : (lease ? lease.tenantName : '-'),
      leaseStart: lease ? lease.startDate : '-',
      leaseEnd: lease ? lease.endDate : '-',
      currentRent: lease ? lease.rentAmount : 0,
      previousRenewals
    };
  }),

  updateStatus: (id, status) => withDelay(() => {
    const list = getStore('mock_renewals') || [];
    const index = list.findIndex(r => r.id === parseInt(id));
    if (index === -1) throw new Error('Renewal not found');

    const prevStatus = list[index].status;
    list[index].status = status;
    
    if (!list[index].history) list[index].history = [];
    list[index].history.push({
      date: new Date().toLocaleDateString('en-CA'),
      activity: `Status changed from ${prevStatus} to ${status}`
    });

    setStore('mock_renewals', list);
    return list[index];
  }),

  addNote: (id, text, author = 'Admin') => withDelay(() => {
    const list = getStore('mock_renewals') || [];
    const index = list.findIndex(r => r.id === parseInt(id));
    if (index === -1) throw new Error('Renewal not found');

    if (!list[index].notes) list[index].notes = [];
    const noteId = list[index].notes.length ? Math.max(...list[index].notes.map(n => n.id)) + 1 : 1;
    list[index].notes.push({
      id: noteId,
      text,
      timestamp: new Date().toLocaleString(),
      author
    });

    setStore('mock_renewals', list);
    return list[index];
  }),

  uploadDocument: (id, docName, docType = 'Agreement') => withDelay(() => {
    const list = getStore('mock_renewals') || [];
    const index = list.findIndex(r => r.id === parseInt(id));
    if (index === -1) throw new Error('Renewal not found');

    if (!list[index].documents) list[index].documents = [];
    const docId = list[index].documents.length ? Math.max(...list[index].documents.map(d => d.id)) + 1 : 1;
    list[index].documents.push({
      id: docId,
      name: docName,
      type: docType,
      uploadDate: new Date().toLocaleDateString('en-CA'),
      size: '1.5 MB'
    });

    setStore('mock_renewals', list);
    return list[index];
  }),

  deleteDocument: (id, docId) => withDelay(() => {
    const list = getStore('mock_renewals') || [];
    const index = list.findIndex(r => r.id === parseInt(id));
    if (index === -1) throw new Error('Renewal not found');

    if (list[index].documents) {
      list[index].documents = list[index].documents.filter(d => d.id !== parseInt(docId));
    }

    setStore('mock_renewals', list);
    return list[index];
  }),

  sendNotice: (id) => withDelay(() => {
    const list = getStore('mock_renewals') || [];
    const index = list.findIndex(r => r.id === parseInt(id));
    if (index === -1) throw new Error('Renewal not found');

    list[index].noticeSent = true;
    list[index].noticeDate = new Date().toLocaleDateString('en-CA');
    list[index].status = 'Notice Sent';

    if (!list[index].history) list[index].history = [];
    list[index].history.push({
      date: new Date().toLocaleDateString('en-CA'),
      activity: 'Lease Renewal Notice Sent to Tenant (Email / PDF)'
    });

    if (!list[index].reminders) list[index].reminders = [];
    list[index].reminders.push({
      id: list[index].reminders.length + 1,
      type: 'Initial Notice',
      status: 'Reminder Sent',
      dateScheduled: new Date().toLocaleDateString('en-CA'),
      dateSent: new Date().toLocaleDateString('en-CA')
    });

    setStore('mock_renewals', list);
    return list[index];
  })
};

// ==========================================
// PHASE 4 - RENT COLLECTION & LEDGER SERVICES
// ==========================================

export const invoiceService = {
  getAll: () => {
    const invoices = getStore('mock_invoices') || [];
    const payments = getStore('mock_payments') || [];
    const credits = getStore('mock_credits') || [];
    const adjustments = getStore('mock_adjustments') || [];
    const properties = getStore('mock_properties') || [];
    const allowedPropertyIds = getAllowedPropertyIds();

    const today = new Date().toISOString().split('T')[0];

    const enriched = invoices.map(inv => {
      const prop = properties.find(p => p.id === inv.propertyId);
      const companyId = prop ? prop.companyId : 1;
      const companyName = prop ? prop.companyName : '-';

      // Sum allocations
      const invPayments = payments.filter(p => p.invoiceId === inv.id);
      const totalPaid = invPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      
      const invCredits = credits.filter(c => c.invoiceId === inv.id);
      const totalCredits = invCredits.reduce((sum, c) => sum + (c.amount || 0), 0);

      const invAdjs = adjustments.filter(a => a.invoiceId === inv.id);
      const totalAdjustments = invAdjs.reduce((sum, a) => sum + (a.amount || 0), 0);

      const outstanding = inv.amountDue - totalPaid - totalCredits + totalAdjustments;

      // Status Allocation Engine
      let status = inv.status;
      if (outstanding <= 0) {
        status = 'Paid';
      } else if (totalPaid > 0) {
        status = 'Partial Payment';
      } else if (inv.dueDate < today && ['Pending', 'Sent', 'Generated'].includes(inv.status)) {
        status = 'Overdue';
      }

      return {
        ...inv,
        companyId,
        companyName,
        totalPaid,
        totalCredits,
        totalAdjustments,
        outstandingBalance: outstanding,
        status,
        paymentsList: invPayments,
        creditsList: invCredits,
        adjustmentsList: invAdjs
      };
    });

    return enriched.filter(inv => allowedPropertyIds.includes(inv.propertyId));
  },

  generate: (leaseId, amount, dueDate) => {
    const leases = getStore('mock_leases') || [];
    const tenants = getStore('mock_tenants') || [];
    const properties = getStore('mock_properties') || [];
    const lease = leases.find(l => l.id === parseInt(leaseId));
    if (!lease) throw new Error('Lease not found');

    const tenant = tenants.find(t => t.id === lease.tenantId);
    const prop = properties.find(p => p.id === lease.propertyId);

    const invoices = getStore('mock_invoices') || [];
    const nextId = invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    const year = new Date().getFullYear();
    const invoiceNo = `INV-${year}-${String(nextId).padStart(6, '0')}`;

    const newInvoice = {
      id: nextId,
      invoiceNo,
      leaseId: lease.id,
      tenantId: lease.tenantId,
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : lease.tenantName,
      propertyName: prop ? prop.name : lease.propertyName,
      propertyId: lease.propertyId,
      unitNumber: lease.unitNumber,
      unitId: lease.unitId,
      amountDue: parseFloat(amount),
      dueDate,
      invoiceDate: new Date().toISOString().split('T')[0],
      status: 'Generated',
      category: 'Rent',
      history: [
        { date: new Date().toLocaleDateString('en-CA'), activity: `Invoice Generated: ${invoiceNo}` }
      ],
      notes: []
    };

    invoices.push(newInvoice);
    setStore('mock_invoices', invoices);
    return newInvoice;
  },

  regenerate: (id) => {
    const invoices = getStore('mock_invoices') || [];
    const idx = invoices.findIndex(i => i.id === parseInt(id));
    if (idx === -1) throw new Error('Invoice not found');

    invoices[idx].history.push({
      date: new Date().toLocaleDateString('en-CA'),
      activity: 'Invoice Regenerated and status updated'
    });

    setStore('mock_invoices', invoices);
    return invoices[idx];
  },

  duplicate: (id) => {
    const invoices = getStore('mock_invoices') || [];
    const orig = invoices.find(i => i.id === parseInt(id));
    if (!orig) throw new Error('Invoice not found');

    const nextId = invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    const year = new Date().getFullYear();
    const invoiceNo = `INV-${year}-${String(nextId).padStart(6, '0')}`;

    const dupe = {
      ...orig,
      id: nextId,
      invoiceNo,
      invoiceDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      history: [
        { date: new Date().toLocaleDateString('en-CA'), activity: `Invoice Duplicated from ${orig.invoiceNo}` }
      ],
      notes: []
    };

    invoices.push(dupe);
    setStore('mock_invoices', invoices);
    return dupe;
  },

  markSent: (id) => {
    const invoices = getStore('mock_invoices') || [];
    const idx = invoices.findIndex(i => i.id === parseInt(id));
    if (idx === -1) throw new Error('Invoice not found');

    invoices[idx].status = 'Sent';
    invoices[idx].history.push({
      date: new Date().toLocaleDateString('en-CA'),
      activity: 'Invoice marked as Sent to Tenant'
    });

    setStore('mock_invoices', invoices);
    return invoices[idx];
  },

  emailInvoice: (id) => {
    const invoices = getStore('mock_invoices') || [];
    const idx = invoices.findIndex(i => i.id === parseInt(id));
    if (idx === -1) throw new Error('Invoice not found');

    invoices[idx].history.push({
      date: new Date().toLocaleDateString('en-CA'),
      activity: 'Invoice Sent via Email (Mock dispatch)'
    });

    setStore('mock_invoices', invoices);
    return invoices[idx];
  },

  addAdjustment: (invoiceId, amount, type, reason) => {
    const adjs = getStore('mock_adjustments') || [];
    const nextId = adjs.length ? Math.max(...adjs.map(a => a.id)) + 1 : 1;

    const newAdj = {
      id: nextId,
      invoiceId: parseInt(invoiceId),
      amount: parseFloat(amount),
      type,
      reason,
      date: new Date().toLocaleDateString('en-CA')
    };

    adjs.push(newAdj);
    setStore('mock_adjustments', adjs);

    const invoices = getStore('mock_invoices') || [];
    const idx = invoices.findIndex(i => i.id === parseInt(invoiceId));
    if (idx !== -1) {
      if (!invoices[idx].history) invoices[idx].history = [];
      invoices[idx].history.push({
        date: new Date().toLocaleDateString('en-CA'),
        activity: `Adjustment Added: $${amount} (${type} - ${reason})`
      });
      setStore('mock_invoices', invoices);
    }
    return newAdj;
  },

  addCredit: (invoiceId, amount, reason) => {
    const credits = getStore('mock_credits') || [];
    const nextId = credits.length ? Math.max(...credits.map(c => c.id)) + 1 : 1;

    const newCredit = {
      id: nextId,
      invoiceId: parseInt(invoiceId),
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString('en-CA'),
      reason
    };

    credits.push(newCredit);
    setStore('mock_credits', credits);

    const invoices = getStore('mock_invoices') || [];
    const idx = invoices.findIndex(i => i.id === parseInt(invoiceId));
    if (idx !== -1) {
      if (!invoices[idx].history) invoices[idx].history = [];
      invoices[idx].history.push({
        date: new Date().toLocaleDateString('en-CA'),
        activity: `Credit Applied: $${amount} (${reason})`
      });
      setStore('mock_invoices', invoices);
    }
    return newCredit;
  },

  addNote: (invoiceId, text, author = 'Admin') => {
    const invoices = getStore('mock_invoices') || [];
    const idx = invoices.findIndex(i => i.id === parseInt(invoiceId));
    if (idx === -1) throw new Error('Invoice not found');

    if (!invoices[idx].notes) invoices[idx].notes = [];
    const nextNoteId = invoices[idx].notes.length ? Math.max(...invoices[idx].notes.map(n => n.id)) + 1 : 1;
    invoices[idx].notes.push({
      id: nextNoteId,
      author,
      text,
      timestamp: new Date().toLocaleString()
    });

    setStore('mock_invoices', invoices);
    return invoices[idx];
  }
};

export const paymentService = {
  record: (invoiceId, amount, method) => {
    const payments = getStore('mock_payments') || [];
    const nextId = payments.length ? Math.max(...payments.map(p => p.id)) + 1 : 1;

    const newPayment = {
      id: nextId,
      invoiceId: parseInt(invoiceId),
      amountPaid: parseFloat(amount),
      paymentDate: new Date().toLocaleDateString('en-CA'),
      paymentMethod: method,
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`
    };

    payments.push(newPayment);
    setStore('mock_payments', payments);

    const invoices = getStore('mock_invoices') || [];
    const idx = invoices.findIndex(i => i.id === parseInt(invoiceId));
    if (idx !== -1) {
      if (!invoices[idx].history) invoices[idx].history = [];
      invoices[idx].history.push({
        date: new Date().toLocaleDateString('en-CA'),
        activity: `Payment Received: $${amount} via ${method}`
      });
      setStore('mock_invoices', invoices);
    }

    return newPayment;
  }
};

export const ledgerService = {
  getLedger: (tenantId) => {
    const allInvoices = invoiceService.getAll();
    const tenantInvoices = allInvoices.filter(i => i.tenantId === parseInt(tenantId));

    const ledgerRows = [];
    let runningBalance = 0;

    tenantInvoices.forEach(inv => {
      runningBalance += inv.amountDue;
      ledgerRows.push({
        date: inv.invoiceDate,
        type: 'Invoice',
        reference: inv.invoiceNo,
        description: 'Monthly Rent Invoice',
        debit: inv.amountDue,
        credit: 0,
        runningBalance
      });

      inv.adjustmentsList?.forEach(adj => {
        runningBalance += adj.amount;
        ledgerRows.push({
          date: adj.date,
          type: 'Adjustment',
          reference: `ADJ-${adj.id}`,
          description: `${adj.type} - ${adj.reason}`,
          debit: adj.amount > 0 ? adj.amount : 0,
          credit: adj.amount < 0 ? Math.abs(adj.amount) : 0,
          runningBalance
        });
      });

      inv.creditsList?.forEach(cred => {
        runningBalance -= cred.amount;
        ledgerRows.push({
          date: cred.date,
          type: 'Credit',
          reference: `CRD-${cred.id}`,
          description: cred.reason,
          debit: 0,
          credit: cred.amount,
          runningBalance
        });
      });

      inv.paymentsList?.forEach(pay => {
        runningBalance -= pay.amountPaid;
        ledgerRows.push({
          date: pay.paymentDate,
          type: 'Payment',
          reference: pay.transactionId,
          description: `Payment Received via ${pay.paymentMethod}`,
          debit: 0,
          credit: pay.amountPaid,
          runningBalance
        });
      });
    });

    ledgerRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentBalance = 0;
    const finalRows = ledgerRows.map(row => {
      currentBalance = currentBalance + row.debit - row.credit;
      return {
        ...row,
        runningBalance: currentBalance
      };
    });

    return {
      openingBalance: 0,
      closingBalance: currentBalance,
      rows: finalRows
    };
  }
};

export const agingService = {
  getAgingReport: () => {
    const invoices = invoiceService.getAll();
    const today = new Date();

    const report = {
      current: 0,
      thirty: 0,
      sixty: 0,
      ninety: 0,
      ninetyPlus: 0,
      highestTenants: [],
      highestBuildings: [],
      highestCompanies: []
    };

    const tenantBalances = {};
    const buildingBalances = {};
    const companyBalances = {};

    invoices.forEach(inv => {
      const bal = inv.outstandingBalance;
      if (bal <= 0) return;

      const dueDate = new Date(inv.dueDate);
      const diffTime = today - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        report.current += bal;
      } else if (diffDays <= 30) {
        report.thirty += bal;
      } else if (diffDays <= 60) {
        report.sixty += bal;
      } else if (diffDays <= 90) {
        report.ninety += bal;
      } else {
        report.ninetyPlus += bal;
      }

      tenantBalances[inv.tenantName] = (tenantBalances[inv.tenantName] || 0) + bal;
      buildingBalances[inv.propertyName] = (buildingBalances[inv.propertyName] || 0) + bal;
      companyBalances[inv.companyName] = (companyBalances[inv.companyName] || 0) + bal;
    });

    report.highestTenants = Object.keys(tenantBalances).map(k => ({ name: k, amount: tenantBalances[k] })).sort((a, b) => b.amount - a.amount).slice(0, 5);
    report.highestBuildings = Object.keys(buildingBalances).map(k => ({ name: k, amount: buildingBalances[k] })).sort((a, b) => b.amount - a.amount).slice(0, 5);
    report.highestCompanies = Object.keys(companyBalances).map(k => ({ name: k, amount: companyBalances[k] })).sort((a, b) => b.amount - a.amount).slice(0, 5);

    return report;
  }
};

export const collectionAnalyticsService = {
  getMetrics: () => {
    const invoices = invoiceService.getAll();
    const payments = getStore('mock_payments') || [];

    const totalDue = invoices.reduce((sum, i) => sum + i.amountDue, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalOutstanding = invoices.reduce((sum, i) => sum + i.outstandingBalance, 0);
    const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

    const rate = totalDue ? Math.round((totalCollected / totalDue) * 100) : 100;

    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthCollection = payments
      .filter(p => p.paymentDate && p.paymentDate.startsWith(thisMonthStr))
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const lastMonthCollection = payments
      .filter(p => p.paymentDate && p.paymentDate.startsWith(lastMonthStr))
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleString('en-US', { month: 'short' });

      const dueInMonth = invoices
        .filter(inv => inv.dueDate && inv.dueDate.startsWith(mStr))
        .reduce((sum, inv) => sum + inv.amountDue, 0);

      const paidInMonth = payments
        .filter(p => p.paymentDate && p.paymentDate.startsWith(mStr))
        .reduce((sum, p) => sum + p.amountPaid, 0);

      trend.push({
        month: monthName,
        expected: dueInMonth,
        collected: paidInMonth
      });
    }

    return {
      totalDue,
      totalCollected,
      totalOutstanding,
      overdueCount,
      collectionRate: rate,
      thisMonthCollection,
      lastMonthCollection,
      trend
    };
  }
};

// ─── CASE AND TASK NUMBER GENERATORS ────────────────────────
export const generateCaseNumber = (companyCode = 'TAL') => {
  const year = new Date().getFullYear();
  const seq = (parseInt(localStorage.getItem('tal_case_seq') || '0') + 1);
  localStorage.setItem('tal_case_seq', String(seq));
  return `${companyCode}-${year}-${String(seq).padStart(6, '0')}`;
};

export const generateTaskNumber = () => {
  const seq = (parseInt(localStorage.getItem('task_seq') || '0') + 1);
  localStorage.setItem('task_seq', String(seq));
  return `TASK-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;
};

// ─── TAL CASE & LEGAL MANAGEMENT SERVICES ───────────────────
export const talCaseService = {
  getAll: () => {
    const cases = getStore('mock_tal_cases') || [];
    const activeCompanyId = localStorage.getItem('global_selected_company_id');
    const filtered = activeCompanyId
      ? cases.filter(c => c.companyId === parseInt(activeCompanyId))
      : cases;
    
    return filtered.map(c => {
      const ledger = ledgerService.getLedger(c.tenantId);
      return {
        ...c,
        outstandingBalance: ledger ? ledger.closingBalance : 0
      };
    });
  },

  getById: (id) => {
    const cases = talCaseService.getAll();
    const c = cases.find(item => item.id === parseInt(id));
    if (!c) return null;

    const hearings = getStore('mock_case_hearings') || [];
    const documents = getStore('mock_case_documents') || [];
    const notes = getStore('mock_case_notes') || [];
    const tasks = getStore('mock_case_tasks') || [];
    const invoices = getStore('mock_invoices') || [];

    return {
      ...c,
      hearings: hearings.filter(h => c.hearingIds?.includes(h.id)),
      documents: documents.filter(d => c.documentIds?.includes(d.id)),
      notes: notes.filter(n => c.noteIds?.includes(n.id)),
      tasks: tasks.filter(t => c.taskIds?.includes(t.id)),
      invoices: invoices.filter(inv => c.invoiceIds?.includes(inv.id))
    };
  },

  create: (data) => {
    const cases = getStore('mock_tal_cases') || [];
    const nextId = cases.length ? Math.max(...cases.map(c => c.id)) + 1 : 1;
    const newCaseNumber = generateCaseNumber();

    const newCase = {
      ...data,
      id: nextId,
      caseNumber: newCaseNumber,
      invoiceIds: data.invoiceIds || [],
      hearingIds: [],
      documentIds: [],
      noteIds: [],
      taskIds: [],
      timeline: [
        {
          id: Date.now(),
          date: new Date().toISOString(),
          event: `Case Created: ${newCaseNumber}`,
          actor: 'Admin User',
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin User',
      updatedBy: 'Admin User'
    };

    cases.push(newCase);
    setStore('mock_tal_cases', cases);
    return newCase;
  },

  update: (id, data) => {
    const cases = getStore('mock_tal_cases') || [];
    const idx = cases.findIndex(c => c.id === parseInt(id));
    if (idx === -1) throw new Error('Case not found');

    const oldCase = cases[idx];
    const updatedTimeline = [...(oldCase.timeline || [])];
    const updatedAuditLog = [...(oldCase.auditLog || [])];

    // Smart Transition Validation
    if (data.status && data.status !== oldCase.status) {
      const allowedPreRequisites = {
        'Decision Received': ['Hearing Completed'],
        'Order Issued': ['Decision Received'],
        'Payment Ordered': ['Decision Received', 'Order Issued'],
        'Eviction Approved': ['Decision Received', 'Order Issued'],
        'Closed': ['Draft', 'Preparing Documents', 'Ready to File', 'Filed', 'Hearing Scheduled', 'Preparing Hearing', 'Hearing Completed', 'Decision Received', 'Order Issued', 'Payment Ordered', 'Eviction Approved']
      };

      const requiredPrev = allowedPreRequisites[data.status];
      if (requiredPrev && !requiredPrev.includes(oldCase.status)) {
        throw new Error(`Invalid transition: Cannot transition to "${data.status}" from "${oldCase.status}". Prerequisite status must be one of: ${requiredPrev.join(', ')}.`);
      }

      // Add to timeline
      updatedTimeline.push({
        id: Date.now(),
        date: new Date().toISOString(),
        event: `Status changed: ${oldCase.status} → ${data.status}`,
        actor: 'Admin User',
        createdAt: new Date().toISOString()
      });

      // Add to audit log
      updatedAuditLog.push({
        id: Date.now(),
        user: 'Admin User',
        timestamp: new Date().toISOString(),
        field: 'Status',
        oldValue: oldCase.status,
        newValue: data.status,
        action: 'Update Status'
      });
    }

    // Capture other field edits in the audit log
    for (const key of Object.keys(data)) {
      if (key !== 'status' && key !== 'timeline' && key !== 'auditLog' && data[key] !== oldCase[key]) {
        updatedAuditLog.push({
          id: Date.now() + Math.random(),
          user: 'Admin User',
          timestamp: new Date().toISOString(),
          field: key,
          oldValue: String(oldCase[key] || ''),
          newValue: String(data[key] || ''),
          action: 'Edit Field'
        });
      }
    }

    const updatedCase = {
      ...oldCase,
      ...data,
      timeline: updatedTimeline,
      auditLog: updatedAuditLog,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };

    cases[idx] = updatedCase;
    setStore('mock_tal_cases', cases);
    return updatedCase;
  },

  addHearing: (caseId, hearingData) => {
    const hearings = getStore('mock_case_hearings') || [];
    const nextId = hearings.length ? Math.max(...hearings.map(h => h.id)) + 1 : 1;

    const newHearing = {
      ...hearingData,
      id: nextId,
      caseId: parseInt(caseId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin User',
      updatedBy: 'Admin User'
    };

    hearings.push(newHearing);
    setStore('mock_case_hearings', hearings);

    const cases = getStore('mock_tal_cases') || [];
    const idx = cases.findIndex(c => c.id === parseInt(caseId));
    if (idx !== -1) {
      const c = cases[idx];
      const hIds = c.hearingIds || [];
      hIds.push(nextId);

      const timeline = c.timeline || [];
      timeline.push({
        id: Date.now(),
        date: new Date().toISOString(),
        event: `Hearing scheduled for ${new Date(hearingData.date).toLocaleDateString()} in ${hearingData.courtRoom || 'TBD'}`,
        actor: 'Admin User',
        createdAt: new Date().toISOString()
      });

      const auditLog = c.auditLog || [];
      auditLog.push({
        id: Date.now(),
        user: 'Admin User',
        timestamp: new Date().toISOString(),
        field: 'Hearings',
        oldValue: 'N/A',
        newValue: `Scheduled: ${hearingData.date} - ${hearingData.courtRoom || 'TBD'}`,
        action: 'Add Hearing'
      });

      cases[idx] = {
        ...c,
        hearingIds: hIds,
        nextHearingDate: hearingData.date,
        courtRoom: hearingData.courtRoom,
        judgeId: hearingData.judgeId,
        judgeName: hearingData.judgeName,
        timeline,
        auditLog,
        updatedAt: new Date().toISOString()
      };
      setStore('mock_tal_cases', cases);
    }

    return newHearing;
  },

  addDocument: (caseId, docData) => {
    const docs = getStore('mock_case_documents') || [];
    const nextId = docs.length ? Math.max(...docs.map(d => d.id)) + 1 : 1;

    const newDoc = {
      ...docData,
      id: nextId,
      caseId: parseInt(caseId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin User',
      updatedBy: 'Admin User'
    };

    docs.push(newDoc);
    setStore('mock_case_documents', docs);

    const cases = getStore('mock_tal_cases') || [];
    const idx = cases.findIndex(c => c.id === parseInt(caseId));
    if (idx !== -1) {
      const c = cases[idx];
      const docIds = c.documentIds || [];
      docIds.push(nextId);

      const timeline = c.timeline || [];
      timeline.push({
        id: Date.now(),
        date: new Date().toISOString(),
        event: `Document uploaded: ${docData.name} (${docData.type || 'Other'})`,
        actor: 'Admin User',
        createdAt: new Date().toISOString()
      });

      const auditLog = c.auditLog || [];
      auditLog.push({
        id: Date.now(),
        user: 'Admin User',
        timestamp: new Date().toISOString(),
        field: 'Documents',
        oldValue: 'N/A',
        newValue: `${docData.name} (${docData.type || 'Other'})`,
        action: 'Upload Document'
      });

      cases[idx] = {
        ...c,
        documentIds: docIds,
        timeline,
        auditLog,
        updatedAt: new Date().toISOString()
      };
      setStore('mock_tal_cases', cases);
    }

    return newDoc;
  },

  deleteDocument: (caseId, docId) => {
    const docs = getStore('mock_case_documents') || [];
    const filteredDocs = docs.filter(d => d.id !== parseInt(docId));
    setStore('mock_case_documents', filteredDocs);

    const cases = getStore('mock_tal_cases') || [];
    const idx = cases.findIndex(c => c.id === parseInt(caseId));
    if (idx !== -1) {
      const c = cases[idx];
      const docIds = (c.documentIds || []).filter(id => id !== parseInt(docId));
      
      const timeline = c.timeline || [];
      timeline.push({
        id: Date.now(),
        date: new Date().toISOString(),
        event: `Document deleted`,
        actor: 'Admin User',
        createdAt: new Date().toISOString()
      });

      const auditLog = c.auditLog || [];
      auditLog.push({
        id: Date.now(),
        user: 'Admin User',
        timestamp: new Date().toISOString(),
        field: 'Documents',
        oldValue: `Doc ID: ${docId}`,
        newValue: 'Deleted',
        action: 'Delete Document'
      });

      cases[idx] = {
        ...c,
        documentIds: docIds,
        timeline,
        auditLog,
        updatedAt: new Date().toISOString()
      };
      setStore('mock_tal_cases', cases);
    }
  },

  addNote: (caseId, noteData) => {
    const notes = getStore('mock_case_notes') || [];
    const nextId = notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1;

    const newNote = {
      ...noteData,
      id: nextId,
      caseId: parseInt(caseId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin User',
      updatedBy: 'Admin User'
    };

    notes.push(newNote);
    setStore('mock_case_notes', notes);

    const cases = getStore('mock_tal_cases') || [];
    const idx = cases.findIndex(c => c.id === parseInt(caseId));
    if (idx !== -1) {
      const c = cases[idx];
      const noteIds = c.noteIds || [];
      noteIds.push(nextId);

      cases[idx] = {
        ...c,
        noteIds,
        updatedAt: new Date().toISOString()
      };
      setStore('mock_tal_cases', cases);
    }

    return newNote;
  },

  appendTimeline: (caseId, eventText) => {
    const cases = getStore('mock_tal_cases') || [];
    const idx = cases.findIndex(c => c.id === parseInt(caseId));
    if (idx !== -1) {
      const c = cases[idx];
      const timeline = c.timeline || [];
      timeline.push({
        id: Date.now(),
        date: new Date().toISOString(),
        event: eventText,
        actor: 'Admin User',
        createdAt: new Date().toISOString()
      });

      cases[idx] = {
        ...c,
        timeline,
        updatedAt: new Date().toISOString()
      };
      setStore('mock_tal_cases', cases);
    }
  }
};

// ============================================================
// PHASE 6 — NOTES & COMMUNICATION SERVICES
// All business logic inside services. Zero component logic.
// ============================================================

// ─── AUTO-NUMBER GENERATOR ───────────────────────────────────
const generateNoteNumber = () => {
  const seq = parseInt(localStorage.getItem('note_seq') || '0', 10) + 1;
  localStorage.setItem('note_seq', String(seq));
  const year = new Date().getFullYear();
  return `NOTE-${year}-${String(seq).padStart(6, '0')}`;
};

// ─── NOTE SERVICE ────────────────────────────────────────────
export const noteService = {
  getAll: (filters = {}) => {
    let notes = getStore('mock_notes');
    if (filters.companyId) notes = notes.filter(n => n.companyId === filters.companyId);
    if (filters.entityType) notes = notes.filter(n => n.entityType === filters.entityType);
    if (filters.entityId !== undefined) notes = notes.filter(n => String(n.entityId) === String(filters.entityId));
    if (filters.category) notes = notes.filter(n => n.category === filters.category);
    if (filters.priority) notes = notes.filter(n => n.priority === filters.priority);
    if (filters.author) notes = notes.filter(n => n.createdBy === filters.author);
    if (filters.tag) notes = notes.filter(n => (n.tags || []).includes(filters.tag));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      notes = notes.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (filters.dateFrom) notes = notes.filter(n => new Date(n.createdAt) >= new Date(filters.dateFrom));
    if (filters.dateTo) notes = notes.filter(n => new Date(n.createdAt) <= new Date(filters.dateTo));
    // Pinned first, then newest
    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  getByEntity: (entityType, entityId) => {
    const notes = getStore('mock_notes');
    return notes
      .filter(n => n.entityType === entityType && String(n.entityId) === String(entityId))
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  },

  getById: (id) => {
    return getStore('mock_notes').find(n => n.id === id) || null;
  },

  create: (payload) => {
    const notes = getStore('mock_notes');
    const now = new Date().toISOString();
    const newNote = {
      id: `note-${Date.now()}`,
      noteNumber: generateNoteNumber(),
      entityType: payload.entityType || 'GENERAL',
      entityId: payload.entityId || null,
      companyId: payload.companyId || 1,
      title: payload.title || 'Untitled Note',
      content: payload.content || '',
      category: payload.category || 'GENERAL',
      priority: payload.priority || 'MEDIUM',
      tags: payload.tags || [],
      isPinned: payload.isPinned || false,
      isPrivate: payload.isPrivate || false,
      mentions: payload.mentions || [],
      attachmentIds: [],
      commentIds: [],
      createdAt: now,
      updatedAt: now,
      createdBy: payload.createdBy || 'Admin User',
      updatedBy: payload.createdBy || 'Admin User',
    };
    notes.unshift(newNote);
    setStore('mock_notes', notes);
    activityService.publish('NOTE_CREATED', {
      noteId: newNote.id,
      entityType: newNote.entityType,
      entityId: newNote.entityId,
      companyId: newNote.companyId,
      description: `Note "${newNote.title}" was created.`,
      actorName: newNote.createdBy,
    });
    if ((newNote.mentions || []).length > 0) {
      activityService.publish('MENTION_ADDED', {
        noteId: newNote.id,
        entityType: newNote.entityType,
        entityId: newNote.entityId,
        companyId: newNote.companyId,
        description: `Mentioned: ${newNote.mentions.join(', ')} in note "${newNote.title}".`,
        actorName: newNote.createdBy,
      });
    }
    return newNote;
  },

  update: (id, payload) => {
    const notes = getStore('mock_notes');
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) throw new Error(`Note ${id} not found`);
    const updated = { ...notes[idx], ...payload, id, updatedAt: new Date().toISOString() };
    notes[idx] = updated;
    setStore('mock_notes', notes);
    activityService.publish('NOTE_UPDATED', {
      noteId: id,
      entityType: updated.entityType,
      entityId: updated.entityId,
      companyId: updated.companyId,
      description: `Note "${updated.title}" was edited.`,
      actorName: payload.updatedBy || 'Admin User',
    });
    return updated;
  },

  delete: (id) => {
    const notes = getStore('mock_notes');
    const note = notes.find(n => n.id === id);
    setStore('mock_notes', notes.filter(n => n.id !== id));
    if (note) {
      activityService.publish('NOTE_DELETED', {
        noteId: id,
        entityType: note.entityType,
        entityId: note.entityId,
        companyId: note.companyId,
        description: `Note "${note.title}" was deleted.`,
        actorName: 'Admin User',
      });
    }
  },

  togglePin: (id, actorName = 'Admin User') => {
    const notes = getStore('mock_notes');
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return;
    notes[idx].isPinned = !notes[idx].isPinned;
    notes[idx].updatedAt = new Date().toISOString();
    setStore('mock_notes', notes);
    activityService.publish(notes[idx].isPinned ? 'NOTE_PINNED' : 'NOTE_UNPINNED', {
      noteId: id,
      entityType: notes[idx].entityType,
      entityId: notes[idx].entityId,
      companyId: notes[idx].companyId,
      description: `Note "${notes[idx].title}" was ${notes[idx].isPinned ? 'pinned' : 'unpinned'}.`,
      actorName,
    });
    return notes[idx];
  },

  getMentions: (userName) => {
    return getStore('mock_notes').filter(n => (n.mentions || []).includes(userName));
  },

  getPinnedNotes: (companyId) => {
    let notes = getStore('mock_notes').filter(n => n.isPinned);
    if (companyId) notes = notes.filter(n => n.companyId === companyId);
    return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  getRecentNotes: (limit = 10) => {
    return getStore('mock_notes')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },
};

// ─── COMMENT SERVICE ─────────────────────────────────────────
export const commentService = {
  getByNote: (noteId) => {
    return getStore('mock_note_comments')
      .filter(c => c.noteId === noteId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  create: (noteId, payload) => {
    const comments = getStore('mock_note_comments');
    const now = new Date().toISOString();
    const newComment = {
      id: `cmt-${Date.now()}`,
      noteId,
      content: payload.content || '',
      createdAt: now,
      updatedAt: now,
      createdBy: payload.createdBy || 'Admin User',
      updatedBy: payload.createdBy || 'Admin User',
    };
    comments.push(newComment);
    setStore('mock_note_comments', comments);
    // Update note's commentIds array
    const notes = getStore('mock_notes');
    const noteIdx = notes.findIndex(n => n.id === noteId);
    if (noteIdx !== -1) {
      notes[noteIdx].commentIds = [...(notes[noteIdx].commentIds || []), newComment.id];
      notes[noteIdx].updatedAt = now;
      setStore('mock_notes', notes);
    }
    const note = notes.find(n => n.id === noteId);
    activityService.publish('COMMENT_ADDED', {
      noteId,
      entityType: note?.entityType,
      entityId: note?.entityId,
      companyId: note?.companyId || 1,
      description: `Comment added to "${note?.title || 'note'}".`,
      actorName: payload.createdBy || 'Admin User',
    });
    return newComment;
  },

  update: (commentId, payload) => {
    const comments = getStore('mock_note_comments');
    const idx = comments.findIndex(c => c.id === commentId);
    if (idx === -1) throw new Error(`Comment ${commentId} not found`);
    comments[idx] = { ...comments[idx], ...payload, id: commentId, updatedAt: new Date().toISOString() };
    setStore('mock_note_comments', comments);
    const note = getStore('mock_notes').find((n) => n.id === comments[idx].noteId);
    activityService.publish('COMMENT_UPDATED', {
      noteId: comments[idx].noteId,
      entityType: note?.entityType,
      entityId: note?.entityId,
      companyId: note?.companyId || 1,
      description: `A comment was edited on "${note?.title || 'note'}".`,
      actorName: payload.updatedBy || 'Admin User',
    });
    return comments[idx];
  },

  delete: (commentId) => {
    const comments = getStore('mock_note_comments');
    const comment = comments.find(c => c.id === commentId);
    setStore('mock_note_comments', comments.filter(c => c.id !== commentId));
    if (comment) {
      // Remove from note's commentIds
      const notes = getStore('mock_notes');
      const noteIdx = notes.findIndex(n => n.id === comment.noteId);
      if (noteIdx !== -1) {
        notes[noteIdx].commentIds = (notes[noteIdx].commentIds || []).filter(id => id !== commentId);
        setStore('mock_notes', notes);
      }
      const note = getStore('mock_notes').find((n) => n.id === comment.noteId);
      activityService.publish('COMMENT_DELETED', {
        noteId: comment.noteId,
        entityType: note?.entityType,
        entityId: note?.entityId,
        companyId: note?.companyId || 1,
        description: `A comment was deleted.`,
        actorName: 'Admin User',
      });
    }
  },
};

// ─── NOTE ATTACHMENT SERVICE ─────────────────────────────────
export const noteAttachmentService = {
  getByNote: (noteId) => {
    return getStore('mock_note_attachments').filter(a => a.noteId === noteId);
  },

  upload: (noteId, payload) => {
    const attachments = getStore('mock_note_attachments');
    const now = new Date().toISOString();
    const newAtt = {
      id: `att-${Date.now()}`,
      noteId,
      name: payload.name || 'document.pdf',
      type: payload.type || 'PDF',
      size: payload.size || '0 KB',
      uploadedAt: now,
      uploadedBy: payload.uploadedBy || 'Admin User',
      createdAt: now,
      updatedAt: now,
      createdBy: payload.uploadedBy || 'Admin User',
      updatedBy: payload.uploadedBy || 'Admin User',
    };
    attachments.push(newAtt);
    setStore('mock_note_attachments', attachments);
    // Update note's attachmentIds
    const notes = getStore('mock_notes');
    const noteIdx = notes.findIndex(n => n.id === noteId);
    if (noteIdx !== -1) {
      notes[noteIdx].attachmentIds = [...(notes[noteIdx].attachmentIds || []), newAtt.id];
      notes[noteIdx].updatedAt = now;
      setStore('mock_notes', notes);
    }
    const note = notes.find(n => n.id === noteId);
    activityService.publish('ATTACHMENT_UPLOADED', {
      noteId,
      entityType: note?.entityType,
      entityId: note?.entityId,
      companyId: note?.companyId || 1,
      description: `Attachment "${newAtt.name}" was uploaded.`,
      actorName: payload.uploadedBy || 'Admin User',
    });
    return newAtt;
  },

  delete: (attachmentId) => {
    const attachments = getStore('mock_note_attachments');
    const att = attachments.find(a => a.id === attachmentId);
    setStore('mock_note_attachments', attachments.filter(a => a.id !== attachmentId));
    if (att) {
      const notes = getStore('mock_notes');
      const noteIdx = notes.findIndex(n => n.id === att.noteId);
      if (noteIdx !== -1) {
        notes[noteIdx].attachmentIds = (notes[noteIdx].attachmentIds || []).filter(id => id !== attachmentId);
        setStore('mock_notes', notes);
      }
      const note = getStore('mock_notes').find((n) => n.id === att.noteId);
      activityService.publish('ATTACHMENT_DELETED', {
        noteId: att.noteId,
        entityType: note?.entityType,
        entityId: note?.entityId,
        companyId: note?.companyId || 1,
        description: `Attachment "${att.name}" was deleted.`,
        actorName: 'Admin User',
      });
    }
  },
};

// ─── COMMUNICATION ANALYTICS SERVICE ────────────────────────
export const communicationAnalyticsService = {
  getStats: (companyId) => {
    let notes = getStore('mock_notes');
    if (companyId) notes = notes.filter(n => n.companyId === companyId);
    const pinned = notes.filter(n => n.isPinned).length;
    const comments = getStore('mock_note_comments').length;
    const attachments = getStore('mock_note_attachments').length;
    const mentions = notes.reduce((acc, n) => acc + (n.mentions || []).length, 0);
    return {
      totalNotes: notes.length,
      pinnedNotes: pinned,
      totalComments: comments,
      totalAttachments: attachments,
      totalMentions: mentions,
      recentCount: notes.filter(n => {
        const d = new Date(n.createdAt);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        return d >= cutoff;
      }).length,
    };
  },

  getRecentActivity: (limit = 20, companyId = null) => {
    return activityService.getRecent(limit, companyId ? { companyId } : {});
  },

  getNotesByEntityType: () => {
    const notes = getStore('mock_notes');
    const breakdown = {};
    notes.forEach(n => {
      breakdown[n.entityType] = (breakdown[n.entityType] || 0) + 1;
    });
    return Object.entries(breakdown).map(([type, count]) => ({ type, count }));
  },

  getTimelineEvents: (entityType, entityId) => {
    let events = getStore('mock_comm_timeline');
    if (entityType) events = events.filter(e => e.entityType === entityType);
    if (entityId !== undefined) events = events.filter(e => String(e.entityId) === String(entityId));
    return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getMentionsSummary: (userName) => {
    const mentioned = getStore('mock_notes').filter(n => (n.mentions || []).includes(userName));
    return {
      count: mentioned.length,
      notes: mentioned.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
    };
  },
};

export const taskService = {
  getAll: () => {
    const tasks = getStore('mock_case_tasks') || [];
    const activeCompanyId = localStorage.getItem('global_selected_company_id');
    return activeCompanyId
      ? tasks.filter(t => t.companyId === parseInt(activeCompanyId))
      : tasks;
  },

  getByEntity: (entityType, entityId) => {
    const tasks = taskService.getAll();
    return tasks.filter(t => t.entityType === entityType && t.entityId === parseInt(entityId));
  },

  create: (data) => {
    const tasks = getStore('mock_case_tasks') || [];
    const newId = generateTaskNumber();

    const newTask = {
      ...data,
      id: newId,
      status: data.status || 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin User',
      updatedBy: 'Admin User',
      history: [
        {
          date: new Date().toISOString(),
          activity: 'Task Created',
          actor: 'Admin User'
        }
      ]
    };

    tasks.push(newTask);
    setStore('mock_case_tasks', tasks);

    if (data.entityType === 'TAL_CASE') {
      const cases = getStore('mock_tal_cases') || [];
      const idx = cases.findIndex(c => c.id === parseInt(data.entityId));
      if (idx !== -1) {
        const c = cases[idx];
        const taskIds = c.taskIds || [];
        taskIds.push(newId);
        cases[idx] = {
          ...c,
          taskIds,
          updatedAt: new Date().toISOString()
        };
        setStore('mock_tal_cases', cases);
      }
    }

    return newTask;
  },

  update: (id, data) => {
    const tasks = getStore('mock_case_tasks') || [];
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found');

    const oldTask = tasks[idx];
    const history = [...(oldTask.history || [])];

    if (data.status && data.status !== oldTask.status) {
      history.push({
        date: new Date().toISOString(),
        activity: `Status changed: ${oldTask.status} → ${data.status}`,
        actor: 'Admin User'
      });
    }

    const updatedTask = {
      ...oldTask,
      ...data,
      history,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };

    tasks[idx] = updatedTask;
    setStore('mock_case_tasks', tasks);
    return updatedTask;
  },

  markComplete: (id) => {
    return taskService.update(id, {
      status: 'COMPLETED',
      completionDate: new Date().toISOString()
    });
  },

  delete: (id) => {
    const tasks = getStore('mock_case_tasks') || [];
    const filtered = tasks.filter(t => t.id !== id);
    setStore('mock_case_tasks', filtered);

    const cases = getStore('mock_tal_cases') || [];
    cases.forEach((c, idx) => {
      if (c.taskIds?.includes(id)) {
        cases[idx].taskIds = c.taskIds.filter(tid => tid !== id);
      }
    });
    setStore('mock_tal_cases', cases);
  }
};

export const legalAnalyticsService = {
  getMetrics: () => {
    const cases = talCaseService.getAll();
    const open = cases.filter(c => !['Closed', 'Archived'].includes(c.status)).length;
    const draft = cases.filter(c => c.status === 'Draft').length;
    const filed = cases.filter(c => c.status === 'Filed').length;
    const hearings = cases.filter(c => c.status === 'Hearing Scheduled').length;
    const awaitingDecision = cases.filter(c => ['Hearing Completed', 'Decision Received'].includes(c.status)).length;
    const ordersIssued = cases.filter(c => ['Order Issued', 'Payment Ordered', 'Eviction Approved'].includes(c.status)).length;
    const closed = cases.filter(c => ['Closed', 'Archived'].includes(c.status)).length;
    const urgent = cases.filter(c => c.priority?.toLowerCase() === 'urgent').length;

    return {
      openCases: open,
      draftCases: draft,
      filedCases: filed,
      hearingsScheduled: hearings,
      awaitingDecision,
      ordersIssued,
      closedCases: closed,
      urgentCases: urgent
    };
  },

  getCasesByStatus: () => {
    const cases = talCaseService.getAll();
    const statuses = {};
    cases.forEach(c => {
      statuses[c.status] = (statuses[c.status] || 0) + 1;
    });

    return Object.keys(statuses).map(status => ({
      status,
      count: statuses[status],
      percentage: Math.round((statuses[status] / (cases.length || 1)) * 100)
    }));
  },

  getCasesByPriority: () => {
    const cases = talCaseService.getAll();
    const priorities = {};
    cases.forEach(c => {
      priorities[c.priority] = (priorities[c.priority] || 0) + 1;
    });
    return Object.keys(priorities).map(p => ({
      priority: p,
      count: priorities[p]
    }));
  },

  getUpcomingHearings: (days = 30) => {
    const hearings = getStore('mock_case_hearings') || [];
    const cases = talCaseService.getAll();
    const caseIds = cases.map(c => c.id);

    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + days);

    return hearings
      .filter(h => {
        const hDate = new Date(h.date);
        return caseIds.includes(h.caseId) && hDate >= now && hDate <= limit;
      })
      .map(h => {
        const c = cases.find(item => item.id === h.caseId);
        return {
          ...h,
          caseNumber: c?.caseNumber,
          tenantName: c?.tenantName,
          propertyName: c?.propertyName,
          unitNumber: c?.unitNumber
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  getOverdueTasks: () => {
    const tasks = taskService.getAll();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < now && !['COMPLETED', 'CANCELLED'].includes(t.status);
    });
  },

  getDashboardSummary: () => {
    const cases = talCaseService.getAll();
    const active = cases.filter(c => !['Resolved', 'Closed'].includes(c.status));
    const urgent = active.filter(c => c.priority === 'Urgent' || c.priority === 'High');
    const upcomingHearings = legalAnalyticsService.getUpcomingHearings(7);
    const overdueTasks = legalAnalyticsService.getOverdueTasks();

    return {
      activeCasesCount: active.length,
      urgentCases: urgent,
      upcomingHearingsCount: upcomingHearings.length,
      overdueTaskCount: overdueTasks.length
    };
  }
};
