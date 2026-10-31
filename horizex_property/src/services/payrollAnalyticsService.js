import employeeService from './employeeService';
import attendanceService from './attendanceService';
import leaveService from './leaveService';
import overtimeService from './overtimeService';
import payrollService from './payrollService';

export const payrollAnalyticsService = {
  getKPIs(companyId = null) {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7); // 'YYYY-MM'

    // 1. Get employees for company
    const allEmployees = employeeService.getAll({ companyId });
    const totalEmployees = allEmployees.length;
    const activeEmployees = allEmployees.filter(e => e.status === 'Active').length;

    // 2. Get attendance for today
    const todayAttendance = attendanceService.getAll({ companyId, date: todayStr });
    
    // Statuses that count as present
    const presentStatuses = new Set(['Present', 'Late', 'Half Day', 'Work From Home']);
    const presentToday = todayAttendance.filter(a => presentStatuses.has(a.status)).length;
    const lateArrivals = todayAttendance.filter(a => a.status === 'Late').length;

    // 3. Get leaves for today
    const leaves = leaveService.getAll({ companyId, status: 'Approved' });
    const employeesOnLeave = leaves.filter(lv => todayStr >= lv.startDate && todayStr <= lv.endDate).length;

    // 4. Calculate absent today: active employees - present - on leave
    let absentToday = activeEmployees - presentToday - employeesOnLeave;
    if (absentToday < 0) absentToday = 0;

    // 5. Calculate payroll this month
    const payrollRun = payrollService.getAll({ companyId, payrollMonth: currentMonthStr });
    const payrollThisMonth = payrollRun.reduce((sum, r) => sum + r.netSalary, 0);

    // 6. Calculate overtime cost this month (approved OT logs)
    const otList = overtimeService.getAll({ companyId, status: 'Approved' });
    const overtimeCost = otList
      .filter(ot => ot.date.substring(0, 7) === currentMonthStr)
      .reduce((sum, r) => sum + r.cost, 0);

    return {
      totalEmployees,
      activeEmployees,
      presentToday,
      absentToday,
      employeesOnLeave,
      lateArrivals,
      payrollThisMonth: parseFloat(payrollThisMonth.toFixed(2)),
      overtimeCost: parseFloat(overtimeCost.toFixed(2))
    };
  },

  getMonthlyComparison(companyId = null) {
    const payrollList = payrollService.getAll({ companyId });
    
    // Group net salary by month
    const monthlySum = {};
    payrollList.forEach(p => {
      const m = p.payrollMonth;
      monthlySum[m] = (monthlySum[m] || 0) + p.netSalary;
    });

    return Object.keys(monthlySum).map(month => ({
      month,
      amount: parseFloat(monthlySum[month].toFixed(2))
    })).sort((a, b) => a.month.localeCompare(b.month));
  }
};

export default payrollAnalyticsService;
