export const maintenanceAuditService = {
  getAll: (requestId = null) => {
    let audits = JSON.parse(localStorage.getItem('mock_maintenance_audits') || '[]');
    
    // Filter out sample mock audits
    audits = audits.filter(a => !String(a.id || '').startsWith('AUD-000'));

    if (requestId) {
      return audits.filter(a => a.requestId === requestId);
    }
    return audits;
  },

  logEvent: (requestId, event, description, createdBy = 'System') => {
    const audits = JSON.parse(localStorage.getItem('mock_maintenance_audits') || '[]');
    const nextNum = String(audits.length + 1).padStart(4, '0');
    const newAudit = {
      id: `AUD-${nextNum}`,
      requestId,
      event,
      description,
      timestamp: new Date().toISOString(),
      createdBy
    };
    audits.unshift(newAudit);
    localStorage.setItem('mock_maintenance_audits', JSON.stringify(audits));
    return newAudit;
  }
};
