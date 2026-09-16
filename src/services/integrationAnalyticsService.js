import integrationService from './integrationService';
import syncEngineService from './syncEngineService';

export const integrationAnalyticsService = {
  getStats() {
    const integrations = integrationService.getAll();
    const queue = syncEngineService.getAll();

    const totalConnected = integrations.filter(i => i.status === 'Connected').length;
    const totalDisconnected = integrations.filter(i => i.status === 'Disconnected' || i.status === 'Failed').length;
    
    const pendingJobs = queue.filter(j => j.status === 'Queued' || j.status === 'Running').length;
    const failedJobs = queue.filter(j => j.status === 'Failed').length;
    const completedJobs = queue.filter(j => j.status === 'Completed').length;
    
    const totalJobs = queue.length;
    const syncSuccessRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 100;

    // Last successful sync date
    const completed = queue.filter(j => j.status === 'Completed').sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const lastSyncTime = completed.length > 0 ? completed[0].updatedAt : new Date().toISOString();

    return {
      connectedCount: totalConnected,
      disconnectedCount: totalDisconnected,
      pendingSyncJobs: pendingJobs,
      failedSyncJobs: failedJobs,
      successRate: syncSuccessRate,
      lastSuccessfulSync: lastSyncTime
    };
  }
};

export default integrationAnalyticsService;
