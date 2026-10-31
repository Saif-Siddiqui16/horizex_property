import integrationAuditService from './integrationAuditService';

const KEY = 'mock_sync_queue';

const DEFAULT_JOBS = [
  { id: 'job-1', module: 'QuickBooks', type: 'Invoice Sync', status: 'Completed', progress: 100, error: null, createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'job-2', module: 'Google Calendar', type: 'Event Sync', status: 'Completed', progress: 100, error: null, createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'job-3', module: 'QuickBooks', type: 'Customer Mapping', status: 'Failed', progress: 45, error: 'OAuth Connection Timeout', createdAt: new Date(Date.now() - 14400000).toISOString(), updatedAt: new Date(Date.now() - 14400000).toISOString() }
];

export const syncEngineService = {
  getStore() {
    const list = localStorage.getItem(KEY);
    if (!list) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_JOBS));
      return DEFAULT_JOBS;
    }
    return JSON.parse(list);
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll() {
    return this.getStore();
  },

  addJob(module, type) {
    const list = this.getStore();
    const jobId = `job-${Date.now()}`;
    const newJob = {
      id: jobId,
      module,
      type,
      status: 'Queued',
      progress: 0,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newJob);
    this.setStore(list);

    integrationAuditService.logEvent('Sync Started', module, `Initiated ${type} (Job ID: ${jobId})`);
    
    // Simulate process automatically
    this.runJobSimulation(jobId);

    return newJob;
  },

  runJobSimulation(id) {
    setTimeout(() => {
      let list = this.getStore();
      const idx = list.findIndex(j => j.id === id);
      if (idx === -1) return;

      if (list[idx].status === 'Queued') {
        list[idx].status = 'Running';
        list[idx].progress = 30;
        list[idx].updatedAt = new Date().toISOString();
        this.setStore(list);
        window.dispatchEvent(new Event('sync_queue_updated'));

        // Next stage
        setTimeout(() => {
          list = this.getStore();
          const i = list.findIndex(j => j.id === id);
          if (i === -1) return;

          list[i].progress = 70;
          list[i].updatedAt = new Date().toISOString();
          this.setStore(list);
          window.dispatchEvent(new Event('sync_queue_updated'));

          // Finalize - 20% chance of failing
          setTimeout(() => {
            list = this.getStore();
            const fIdx = list.findIndex(j => j.id === id);
            if (fIdx === -1) return;

            const isFail = Math.random() < 0.2;
            if (isFail) {
              list[fIdx].status = 'Failed';
              list[fIdx].progress = 85;
              list[fIdx].error = 'API Conflict: Record already exists in QuickBooks';
              list[fIdx].updatedAt = new Date().toISOString();
              this.setStore(list);
              integrationAuditService.logEvent('Sync Failed', list[fIdx].module, `Job ${list[fIdx].type} failed: ${list[fIdx].error}`);
            } else {
              list[fIdx].status = 'Completed';
              list[fIdx].progress = 100;
              list[fIdx].error = null;
              list[fIdx].updatedAt = new Date().toISOString();
              this.setStore(list);
              integrationAuditService.logEvent('Sync Completed', list[fIdx].module, `Job ${list[fIdx].type} completed successfully`);
            }
            window.dispatchEvent(new Event('sync_queue_updated'));
          }, 1000);
        }, 1000);
      }
    }, 500);
  },

  retryJob(id) {
    let list = this.getStore();
    const idx = list.findIndex(j => j.id === id);
    if (idx !== -1) {
      list[idx].status = 'Queued';
      list[idx].progress = 0;
      list[idx].error = null;
      list[idx].updatedAt = new Date().toISOString();
      this.setStore(list);

      integrationAuditService.logEvent('Retry', list[idx].module, `Retrying failed job ${list[idx].type}`);
      window.dispatchEvent(new Event('sync_queue_updated'));
      
      this.runJobSimulation(id);
      return list[idx];
    }
    throw new Error('Sync job not found');
  },

  cancelJob(id) {
    let list = this.getStore();
    const idx = list.findIndex(j => j.id === id);
    if (idx !== -1) {
      if (list[idx].status === 'Queued' || list[idx].status === 'Running') {
        list[idx].status = 'Failed';
        list[idx].error = 'User Cancelled';
        list[idx].updatedAt = new Date().toISOString();
        this.setStore(list);

        integrationAuditService.logEvent('Sync Failed', list[idx].module, `Cancelled job ${list[idx].type}`);
        window.dispatchEvent(new Event('sync_queue_updated'));
        return list[idx];
      }
    }
    throw new Error('Sync job cannot be cancelled');
  }
};

export default syncEngineService;
