export const maintenanceAuditService = {
  getAll: (requestId = null) => {
    let audits = JSON.parse(localStorage.getItem('mock_maintenance_audits') || '[]');
    if (audits.length === 0) {
      audits = [
        {
          id: 'AUD-0001',
          requestId: 'MR-2026-0001',
          event: 'Request Created',
          description: 'Request MR-2026-0001 initialized by user.',
          timestamp: '2026-06-25T10:00:00Z',
          createdBy: 'tenant-1'
        },
        {
          id: 'AUD-0002',
          requestId: 'MR-2026-0001',
          event: 'Assigned',
          description: 'Technician assigned to MR-2026-0001',
          timestamp: '2026-06-25T11:00:00Z',
          createdBy: 'admin-1'
        },
        {
          id: 'AUD-0003',
          requestId: 'MR-2026-0001',
          event: 'Started',
          description: 'Repair work started for request MR-2026-0001',
          timestamp: '2026-06-26T12:00:00Z',
          createdBy: 'tech-1'
        }
      ];
      localStorage.setItem('mock_maintenance_audits', JSON.stringify(audits));
    }
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
