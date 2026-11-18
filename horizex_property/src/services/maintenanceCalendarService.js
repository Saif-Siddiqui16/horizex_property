import { calendarService } from './calendarService';
import { maintenanceService } from './maintenanceService';
import { preventiveMaintenanceService } from './preventiveMaintenanceService';
import { assetService } from './assetService';

export const maintenanceCalendarService = {
  getAllEvents: (providedRequests = null) => {
    const base = calendarService.getAll() || [];

    // Convert Maintenance Requests
    const requests = providedRequests || maintenanceService.getAll() || [];
    const requestEvts = requests.map(r => ({
      id: `mreq-${r.id}`,
      title: `Repair ${r.id}: ${r.category || 'Repair'}`,
      description: r.description || '',
      category: 'Repairs',
      start: (r.createdAt || new Date().toISOString()).split('T')[0],
      end: (r.createdAt || new Date().toISOString()).split('T')[0],
      syncStatus: 'Synced'
    }));

    // Convert Preventive Maintenance Runs
    const preventive = preventiveMaintenanceService.getAll() || [];
    const preventiveEvts = preventive.map(p => ({
      id: `pm-${p.id}`,
      title: `PM: ${p.name}`,
      description: `Frequency: ${p.frequency}, Category: ${p.category}`,
      category: 'Preventive Maintenance',
      start: p.nextDueDate,
      end: p.nextDueDate,
      syncStatus: 'Synced'
    }));

    // Convert Asset Warranty Expirations
    const assets = assetService.getAll() || [];
    const assetEvts = assets.map(a => ({
      id: `warr-${a.id}`,
      title: `Warranty Expiry: ${a.name}`,
      description: `Serial: ${a.serialNumber}`,
      category: 'Warranty Expiry',
      start: a.warrantyDate,
      end: a.warrantyDate,
      syncStatus: 'Synced'
    }));

    return [...base, ...requestEvts, ...preventiveEvts, ...assetEvts];
  }
};
