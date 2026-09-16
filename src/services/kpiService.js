import analyticsEngineService from './analyticsEngineService';

export const kpiService = {
  getKPIs(companyId = '', buildingId = '') {
    const occupancy = analyticsEngineService.getOccupancyTrend(companyId, buildingId);
    const collection = analyticsEngineService.getCollectionTrend(companyId, buildingId);
    const renewals = analyticsEngineService.getRenewalTrend(companyId, buildingId);
    const payroll = analyticsEngineService.getPayrollTrend(companyId, buildingId);
    const attendance = analyticsEngineService.getAttendanceTrend(companyId, buildingId);
    const tal = analyticsEngineService.getTalTrend(companyId, buildingId);

    const properties = analyticsEngineService.getProperties(companyId);
    const employees = analyticsEngineService.getEmployees(companyId, buildingId);

    return {
      totalCompanies: companyId ? 1 : 3, // Apex, Soros, Masteko
      totalBuildings: properties.length,
      totalApartments: occupancy.total,
      occupiedApartments: occupancy.occupied,
      vacantApartments: occupancy.vacant,
      occupancyRate: occupancy.rate,
      activeTenants: occupancy.occupied, // Assuming 1 active tenant per occupied unit
      
      currentMonthRevenue: collection.paid,
      outstandingRent: collection.unpaid,
      collectionRate: collection.rate,
      
      renewalsDue: renewals.pending,
      renewalSuccessRate: renewals.successRate,

      activeTALCases: tal.active,
      talSuccessRate: tal.successRate,

      employeesPresent: Math.round(employees.length * (attendance.presentPct / 100)),
      payrollCost: payroll.totalCost,
      overtimeCost: payroll.overtimeCost,
      
      openRepairs: 3, // Placeholder mock count
      upcomingTasks: 5 // Placeholder mock count
    };
  }
};

export default kpiService;
