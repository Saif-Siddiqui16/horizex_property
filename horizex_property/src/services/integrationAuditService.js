const KEY = 'mock_integration_audit_logs';

export const integrationAuditService = {
  getStore() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll() {
    return this.getStore();
  },

  logEvent(eventType, integrationName, description) {
    const list = this.getStore();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType,
      integrationName,
      description,
      createdAt: new Date().toISOString(),
      createdBy: user.name || 'Admin User'
    };

    list.push(newLog);
    this.setStore(list);
    return newLog;
  }
};

export default integrationAuditService;
