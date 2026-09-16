import employeeService from './employeeService';
import overtimeService from './overtimeService';
import leaveService from './leaveService';
import salaryComponentService from './salaryComponentService';
import payrollSettingsService from './payrollSettingsService';
import payrollTimelineService from './payrollTimelineService';
import { generatePayrollNumber, generatePayslipNumber } from '../utils/numberGenerators';

const KEY = 'mock_payroll';
const RUN_SEQ_KEY = 'payroll_run_seq';
const SLIP_SEQ_KEY = 'payslip_seq';

const getStore = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const payrollService = {
  getAll(filters = {}) {
    let list = getStore();
    const employees = employeeService.getAll();
    const properties = JSON.parse(localStorage.getItem('mock_properties') || '[]');

    // Enhance records with employee names and identifiers
    list = list.map(item => {
      const emp = employees.find(e => String(e.id) === String(item.employeeId));
      const prop = emp ? properties.find(p => String(p.id) === String(emp.buildingId)) : null;
      return {
        ...item,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${item.employeeId}`,
        employeeNo: emp ? emp.employeeNo : '',
        department: emp ? emp.department : '',
        designation: emp ? emp.designation : '',
        companyId: emp ? emp.companyId : item.companyId,
        buildingId: emp ? emp.buildingId : null,
        buildingName: prop ? prop.name : 'Unknown Location'
      };
    });

    if (filters.companyId) {
      list = list.filter(item => String(item.companyId) === String(filters.companyId));
    }
    if (filters.status) {
      list = list.filter(item => item.status === filters.status);
    }
    if (filters.payrollMonth) {
      list = list.filter(item => item.payrollMonth === filters.payrollMonth);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(item => 
        item.employeeName.toLowerCase().includes(q) ||
        item.employeeNo.toLowerCase().includes(q) ||
        item.payrollNo.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  uploadReceipt(id, receiptFile) {
    const list = getStore();
    const idx = list.findIndex(item => String(item.id) === String(id));
    if (idx !== -1) {
      list[idx].receiptFile = receiptFile;
      list[idx].updatedAt = new Date().toISOString();
      setStore(list);

      // Audit timeline entry
      payrollTimelineService.create({
        eventType: 'Status Changed',
        employeeId: list[idx].employeeId,
        employeeName: list[idx].employeeName,
        companyId: list[idx].companyId,
        description: `Receipt uploaded for payslip ${list[idx].payslipNo}: ${receiptFile}`
      });

      return list[idx];
    }
    throw new Error('Payroll run not found.');
  },

  getById(id) {
    return this.getAll().find(item => String(item.id) === String(id)) || null;
  },

  generatePayroll(companyId, payrollMonth, periodStart, periodEnd) {
    const list = getStore();
    const employees = employeeService.getAll({ companyId });
    const settings = payrollSettingsService.getSettings();
    
    // Check if payroll already exists for this company and month
    const existing = list.filter(item => String(item.companyId) === String(companyId) && item.payrollMonth === payrollMonth);
    if (existing.length > 0) {
      throw new Error(`Payroll for this month (${payrollMonth}) has already been generated for this company.`);
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const generatorName = user.name || 'Admin User';
    
    let runSeq = parseInt(localStorage.getItem(RUN_SEQ_KEY) || '1');
    let slipSeq = parseInt(localStorage.getItem(SLIP_SEQ_KEY) || '1');
    
    let companyCode = 'APEX';
    if (String(companyId) === '2') companyCode = 'SOROS';
    if (String(companyId) === '3') companyCode = 'MASTEKO';

    const payrollNo = generatePayrollNumber(companyCode, runSeq);
    localStorage.setItem(RUN_SEQ_KEY, String(runSeq + 1));

    const generatedRecords = [];

    employees.forEach(emp => {
      // 1. Calculate Overtime Pay (Approved and Unpaid) for period
      const otRecords = overtimeService.getAll({ 
        employeeId: emp.id, 
        status: 'Approved',
        paidStatus: 'Unpaid' 
      }).filter(ot => ot.date >= periodStart && ot.date <= periodEnd);

      const overtimePay = otRecords.reduce((sum, r) => sum + r.cost, 0);
      const otIds = otRecords.map(r => r.id);

      // 2. Calculate Unpaid Leave deductions
      // Deduct basic salary per day of unpaid leave (Assuming 22 standard working days per month)
      const leaves = leaveService.getAll({
        employeeId: emp.id,
        status: 'Approved',
        leaveType: 'Unpaid'
      }).filter(lv => lv.startDate >= periodStart && lv.startDate <= periodEnd);

      let unpaidDaysCount = 0;
      leaves.forEach(lv => {
        const start = new Date(lv.startDate);
        const end = new Date(lv.endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        unpaidDaysCount += diffDays;
      });

      const dailyRate = emp.salary / 22;
      const deductionsVal = parseFloat((unpaidDaysCount * dailyRate).toFixed(2));

      // 3. Compute allowances, tax, deductions from salary components
      const comps = salaryComponentService.calculateComponents(emp.salary);
      
      const basicSalary = emp.salary;
      const allowances = comps.allowances;
      const bonus = comps.bonus; 
      const deductions = parseFloat((comps.deductions + deductionsVal).toFixed(2));
      const tax = comps.tax;

      const netSalary = parseFloat((basicSalary + allowances + bonus + overtimePay - deductions - tax).toFixed(2));
      const payslipNo = generatePayslipNumber(companyCode, slipSeq);
      slipSeq += 1;

      // Determine initial workflow status based on settings
      let status = 'Draft';
      if (settings.approvalWorkflowType === 'AutoApproval') {
        status = 'Approved';
      } else {
        status = 'Pending Approval';
      }

      const recordId = `pay-${Date.now()}-${emp.id}`;
      const record = {
        id: recordId,
        payrollNo,
        payslipNo,
        employeeId: emp.id,
        companyId: emp.companyId,
        payrollMonth,
        periodStart,
        periodEnd,
        cycle: settings.payCycle || 'Monthly',
        basicSalary,
        allowances,
        bonus,
        overtimePay,
        deductions,
        tax,
        netSalary,
        status,
        
        // Audit Fields (Audit Rules & Config Workflow tracking)
        createdAt: new Date().toISOString(),
        createdBy: generatorName,
        updatedAt: new Date().toISOString(),
        updatedBy: generatorName,
        
        generatedBy: generatorName,
        generatedAt: new Date().toISOString(),
        approvedBy: settings.approvalWorkflowType === 'AutoApproval' ? 'System Auto-Approval' : null,
        approvedAt: settings.approvalWorkflowType === 'AutoApproval' ? new Date().toISOString() : null,
        paidBy: null,
        paidAt: null,
        
        // Metadata of linked records
        linkedOvertimeIds: otIds,
        unpaidDaysCount
      };

      generatedRecords.push(record);
      list.push(record);

      // If OT logs were included, we mark them paid when payroll is processed
      if (otIds.length > 0 && settings.approvalWorkflowType === 'AutoApproval') {
        overtimeService.markPaid(otIds);
      }
    });

    localStorage.setItem(SLIP_SEQ_KEY, String(slipSeq));
    setStore(list);

    payrollTimelineService.append(
      'Payroll Generated',
      `Payroll ${payrollNo} generated for ${payrollMonth} with ${generatedRecords.length} records. Status: ${settings.approvalWorkflowType === 'AutoApproval' ? 'Auto-Approved' : 'Pending Approval'}.`,
      { companyId }
    );

    return generatedRecords;
  },

  approvePayroll(payrollNo, currentLevel = 1) {
    const list = getStore();
    const settings = payrollSettingsService.getSettings();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const approverName = user.name || 'Admin User';
    
    const records = list.filter(item => item.payrollNo === payrollNo);
    if (!records.length) throw new Error('Payroll run not found');

    let nextStatus = 'Pending Approval';
    let isFullyApproved = false;

    if (settings.approvalWorkflowType === 'TwoLevelApproval') {
      if (currentLevel === 1) {
        nextStatus = 'Level 1 Approved';
      } else if (currentLevel === 2) {
        nextStatus = 'Approved';
        isFullyApproved = true;
      }
    } else {
      // SingleApproval or fallback
      nextStatus = 'Approved';
      isFullyApproved = true;
    }

    const updatedList = list.map(item => {
      if (item.payrollNo === payrollNo) {
        return {
          ...item,
          status: nextStatus,
          approvedBy: isFullyApproved ? approverName : item.approvedBy,
          approvedAt: isFullyApproved ? new Date().toISOString() : item.approvedAt,
          updatedAt: new Date().toISOString(),
          updatedBy: approverName,
          // Track custom approval steps in audit
          approvalAudit: [
            ...(item.approvalAudit || []),
            { level: currentLevel, approver: approverName, timestamp: new Date().toISOString(), action: 'Approve' }
          ]
        };
      }
      return item;
    });

    setStore(updatedList);

    // If fully approved, mark associated overtime records paid
    if (isFullyApproved) {
      records.forEach(r => {
        if (r.linkedOvertimeIds && r.linkedOvertimeIds.length) {
          overtimeService.markPaid(r.linkedOvertimeIds);
        }
      });
    }

    payrollTimelineService.append(
      'Leave Approved', // Map to matching timeline event type
      `Payroll run ${payrollNo} approved at Level ${currentLevel} by ${approverName}`,
      { companyId: records[0].companyId }
    );

    return true;
  },

  rejectPayroll(payrollNo, reason = '') {
    const list = getStore();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const rejecterName = user.name || 'Admin User';
    
    const records = list.filter(item => item.payrollNo === payrollNo);
    if (!records.length) throw new Error('Payroll run not found');

    const updatedList = list.map(item => {
      if (item.payrollNo === payrollNo) {
        return {
          ...item,
          status: 'Rejected',
          rejectReason: reason,
          updatedAt: new Date().toISOString(),
          updatedBy: rejecterName,
          approvalAudit: [
            ...(item.approvalAudit || []),
            { level: 'Reject', approver: rejecterName, timestamp: new Date().toISOString(), action: 'Reject', comment: reason }
          ]
        };
      }
      return item;
    });

    setStore(updatedList);

    payrollTimelineService.append(
      'Leave Rejected', // Map to timeline event type
      `Payroll run ${payrollNo} rejected by ${rejecterName}. Reason: ${reason}`,
      { companyId: records[0].companyId }
    );

    return true;
  },

  markPaidPayroll(payrollNo) {
    const list = getStore();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const payerName = user.name || 'Admin User';
    
    const records = list.filter(item => item.payrollNo === payrollNo);
    if (!records.length) throw new Error('Payroll run not found');

    const updatedList = list.map(item => {
      if (item.payrollNo === payrollNo) {
        return {
          ...item,
          status: 'Paid',
          paidBy: payerName,
          paidAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: payerName
        };
      }
      return item;
    });

    setStore(updatedList);

    payrollTimelineService.append(
      'Payslip Generated', // Triggered event
      `Salary payout processed for payroll run ${payrollNo} by ${payerName}`,
      { companyId: records[0].companyId }
    );

    return true;
  },

  // Mock methods for PDF & Email
  downloadPayslipPdf(recordId) {
    payrollTimelineService.append(
      'Payslip Generated',
      `Payslip PDF downloaded for payroll record #${recordId}`
    );
    return true;
  },

  emailPayslip(recordId, email) {
    payrollTimelineService.append(
      'Payslip Generated',
      `Payslip emailed successfully to ${email} for payroll record #${recordId}`
    );
    return true;
  }
};

export default payrollService;
