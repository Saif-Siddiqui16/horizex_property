import kpiService from './kpiService';
import dashboardLayoutService from './dashboardLayoutService';
import analyticsEngineService from './analyticsEngineService';

export const dashboardService = {
  getDashboardData(companyId = '', buildingId = '') {
    const kpis = kpiService.getKPIs(companyId, buildingId);
    const layout = dashboardLayoutService.getLayout();

    // Generate alerts
    const alerts = [];
    if (kpis.outstandingRent > 2000) {
      alerts.push({ id: 'alert-1', severity: 'Critical', message: `Outstanding receivables exceed limit: $${kpis.outstandingRent.toLocaleString()}` });
    }
    if (kpis.activeTALCases > 0) {
      alerts.push({ id: 'alert-2', severity: 'Warning', message: `${kpis.activeTALCases} TAL lawsuit cases active. Check case milestones.` });
    }
    if (kpis.occupancyRate < 85) {
      alerts.push({ id: 'alert-3', severity: 'Info', message: `Occupancy rate drop alert: ${kpis.occupancyRate}% (Target: 90%)` });
    }
    if (kpis.overtimeCost > 500) {
      alerts.push({ id: 'alert-4', severity: 'Warning', message: `Elevated overtime costs detected: $${kpis.overtimeCost}` });
    }

    return {
      kpis,
      layout,
      alerts,
      revenueTrend: analyticsEngineService.getRevenueTrend(companyId, buildingId),
      occupancy: analyticsEngineService.getOccupancyTrend(companyId, buildingId),
      collection: analyticsEngineService.getCollectionTrend(companyId, buildingId),
      renewals: analyticsEngineService.getRenewalTrend(companyId, buildingId),
      payroll: analyticsEngineService.getPayrollTrend(companyId, buildingId),
      attendance: analyticsEngineService.getAttendanceTrend(companyId, buildingId),
      tal: analyticsEngineService.getTalTrend(companyId, buildingId)
    };
  }
};

export default dashboardService;
