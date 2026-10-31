import { maintenanceService } from './maintenanceService';
import { workOrderService } from './workOrderService';
import { technicianService } from './technicianService';
import { vendorService } from './vendorService';
import { assetService } from './assetService';
import { inventoryService } from './inventoryService';
import { preventiveMaintenanceService } from './preventiveMaintenanceService';

export const vendorAnalyticsService = {
  getSummary: () => {
    const list = vendorService.getAll() || [];
    const wos = workOrderService.getAll() || [];
    
    const costPerVendor = {};
    wos.forEach(w => {
      if (w.vendorId) {
        costPerVendor[w.vendorId] = (costPerVendor[w.vendorId] || 0) + (w.actualCost || 0);
      }
    });

    const performance = list.map(v => {
      const vendorWos = wos.filter(w => w.vendorId === v.id);
      const completedCount = vendorWos.length;
      const totalCost = costPerVendor[v.id] || 0;
      
      return {
        vendorId: v.id,
        name: v.name,
        completedJobs: completedCount + (v.completedJobs || 0),
        rating: v.rating,
        avgCompletionTime: '2.5 Days', // Mock Average Completion
        totalCost,
        performance: v.rating >= 4.5 ? 'Excellent' : 'Good'
      };
    });

    return {
      activeVendors: list.filter(v => v.status === 'Active').length,
      completedJobs: wos.filter(w => w.vendorId).length,
      costPerVendor,
      performance
    };
  }
};

export const technicianAnalyticsService = {
  getSummary: () => {
    const list = technicianService.getAll() || [];
    const requests = maintenanceService.getAll() || [];
    const wos = workOrderService.getAll() || [];

    const stats = list.map(t => {
      const assigned = requests.filter(r => r.assignedTechnicianId === t.id);
      const completed = assigned.filter(r => r.status === 'Completed' || r.status === 'Closed');
      const pending = assigned.filter(r => r.status !== 'Completed' && r.status !== 'Closed' && r.status !== 'Rejected');
      
      const techHours = technicianService.getPayrollHours(t.id);
      // Standard 160 hrs/month capacity. Utilization = techHours / 160
      const utilization = Math.min(100, Math.round((techHours / 160) * 100));

      return {
        technicianId: t.id,
        name: t.name,
        role: t.role,
        assignedCount: assigned.length,
        completedCount: completed.length,
        pendingCount: pending.length,
        utilization,
        payrollHours: techHours,
        avgCompletionTime: '1.8 Days' // Mock average completion time
      };
    });

    return stats;
  }
};

export const assetAnalyticsService = {
  getSummary: () => {
    const list = assetService.getAll() || [];
    const properties = JSON.parse(localStorage.getItem('mock_properties') || '[]');

    const totalValue = list.length * 15000.00; // Mock average value estimation
    
    // Assets by building
    const buildingMap = {};
    list.forEach(a => {
      const prop = properties.find(p => p.id === a.buildingId);
      const name = prop ? prop.name : `Building ${a.buildingId}`;
      buildingMap[name] = (buildingMap[name] || 0) + 1;
    });

    const assetsByBuilding = Object.keys(buildingMap).map(key => ({
      name: key,
      value: buildingMap[key]
    }));

    // Warranty expiring in next 90 days
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);
    const expiringCount = list.filter(a => {
      const wDate = new Date(a.warrantyDate);
      return wDate <= ninetyDays;
    }).length;

    return {
      totalValue,
      assetsByBuilding,
      warrantyExpiringCount: expiringCount,
      repairFrequency: 'Low (0.2/year)',
      replacementDueCount: list.filter(a => a.condition === 'Poor').length
    };
  }
};

export const inventoryAnalyticsService = {
  getSummary: () => {
    const list = inventoryService.getAllParts() || [];
    
    let totalVal = 0;
    const lowStockParts = [];

    list.forEach(p => {
      const val = (p.currentStock || 0) * (p.unitCost || 0);
      totalVal += val;
      if (p.isLowStock) {
        lowStockParts.push(p);
      }
    });

    return {
      currentInventoryValue: totalVal,
      lowStockCount: lowStockParts.length,
      lowStockList: lowStockParts,
      fastMovingParts: [
        { name: 'Copper Pipe Joint 3/4"', consumption: '18 units/mo' },
        { name: 'HVAC Air Filter', consumption: '12 units/mo' }
      ],
      monthlyConsumptionCost: 350.00
    };
  }
};

export const maintenanceAnalyticsService = {
  getKPIMetrics: () => {
    const reqs = maintenanceService.getAll() || [];
    
    const open = reqs.filter(r => r.status === 'New' || r.status === 'Draft').length;
    const assigned = reqs.filter(r => r.status === 'Assigned' || r.status === 'Accepted').length;
    const inProgress = reqs.filter(r => r.status === 'In Progress').length;
    const waitingParts = reqs.filter(r => r.status === 'Waiting Parts').length;
    const waitingVendor = reqs.filter(r => r.status === 'Waiting Vendor').length;
    const completed = reqs.filter(r => r.status === 'Completed' || r.status === 'Closed').length;
    const emergency = reqs.filter(r => r.priority === 'Emergency' || r.priority === 'High').length;

    const pm = preventiveMaintenanceService.getAll() || [];
    const pmDue = pm.filter(p => p.status === 'Overdue').length;

    const parts = inventoryService.getAllParts() || [];
    const invLow = parts.filter(p => p.isLowStock).length;

    return {
      open,
      assigned,
      inProgress,
      waitingParts,
      waitingVendor,
      completed,
      emergency,
      pmDue,
      invLow
    };
  }
};
export default maintenanceAnalyticsService;
