import { workOrderService } from './workOrderService';
import { maintenanceService } from './maintenanceService';

export const repairCostService = {
  getSummary: () => {
    const wos = workOrderService.getAll() || [];
    
    let totalLabor = 0;
    let totalMaterials = 0;
    let totalVendor = 0;
    let totalActual = 0;
    let totalEstimated = 0;

    wos.forEach(w => {
      totalLabor += w.laborCost || 0;
      totalMaterials += w.materialCost || 0;
      totalVendor += w.vendorId ? (w.actualCost || 0) : 0;
      totalActual += w.actualCost || 0;
      totalEstimated += w.estimatedCost || 0;
    });

    const budget = 5000.00; // Mock standard monthly portfolio maintenance budget
    const variance = budget - totalActual;

    return {
      labor: totalLabor,
      materials: totalMaterials,
      vendorCost: totalVendor,
      estimated: totalEstimated,
      actual: totalActual,
      budget,
      variance,
      taxes: totalActual * 0.15 // 15% estimated sales taxes
    };
  },

  getCostByBuilding: () => {
    const wos = workOrderService.getAll() || [];
    const requests = maintenanceService.getAll() || [];
    const properties = JSON.parse(localStorage.getItem('mock_properties') || '[]');

    const buildingCostMap = {};
    wos.forEach(w => {
      const req = requests.find(r => r.id === w.requestId);
      if (req) {
        const prop = properties.find(p => p.id === req.buildingId);
        const name = prop ? prop.name : `Building ${req.buildingId}`;
        buildingCostMap[name] = (buildingCostMap[name] || 0) + w.actualCost;
      }
    });

    return Object.keys(buildingCostMap).map(key => ({
      name: key,
      value: buildingCostMap[key]
    }));
  },

  getCostByVendor: () => {
    const wos = workOrderService.getAll() || [];
    const vendors = JSON.parse(localStorage.getItem('mock_vendors') || '[]');

    const vendorCostMap = {};
    wos.forEach(w => {
      if (w.vendorId) {
        const v = vendors.find(vend => vend.id === w.vendorId);
        const name = v ? v.name : `Vendor ${w.vendorId}`;
        vendorCostMap[name] = (vendorCostMap[name] || 0) + w.actualCost;
      }
    });

    return Object.keys(vendorCostMap).map(key => ({
      name: key,
      value: vendorCostMap[key]
    }));
  }
};
export default repairCostService;
