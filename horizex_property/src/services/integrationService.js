import credentialService from './credentialService';
import integrationAuditService from './integrationAuditService';

const KEY = 'mock_integrations_status';

const DEFAULTS = [
  { id: 'quickbooks', name: 'QuickBooks Integration', status: 'Connected', lastSync: new Date(Date.now() - 3600000).toISOString(), version: 'v3.0.2' },
  { id: 'google_calendar', name: 'Google Calendar Integration', status: 'Connected', lastSync: new Date(Date.now() - 7200000).toISOString(), version: 'v1.4.0' },
  { id: 'email_hub', name: 'Email Hub Services', status: 'Connected', lastSync: new Date().toISOString(), version: 'v2.1.0' }
];

export const integrationService = {
  getStore() {
    const list = localStorage.getItem(KEY);
    if (!list) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
      return DEFAULTS;
    }
    return JSON.parse(list);
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll() {
    return this.getStore();
  },

  updateStatus(id, status) {
    const list = this.getStore();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (status === 'Connected') {
        list[idx].lastSync = new Date().toISOString();
      }
      this.setStore(list);
      
      integrationAuditService.logEvent(
        status === 'Connected' ? 'Sync Completed' : 'Sync Failed',
        list[idx].name,
        `Integration connection changed to: ${status}`
      );
      
      return list[idx];
    }
    throw new Error('Integration not found');
  },

  disconnect(id) {
    this.updateStatus(id, 'Disconnected');
    credentialService.delete(id);
    return true;
  }
};

export default integrationService;
