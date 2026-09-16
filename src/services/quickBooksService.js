import syncEngineService from './syncEngineService';
import integrationAuditService from './integrationAuditService';
import integrationAdapterService from './integrationAdapterService';

const KEY_MOCK_COA = 'mock_qb_chart_of_accounts';
const KEY_SYNC_HISTORY = 'mock_qb_sync_history';

const DEFAULT_COA = [
  { code: '1010', name: 'Cash on Hand', type: 'Asset', balance: 25000 },
  { code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 5000 },
  { code: '4000', name: 'Rental Income', type: 'Revenue', balance: 48000 },
  { code: '5010', name: 'Repairs & Maintenance Cost', type: 'Expense', balance: 3500 },
  { code: '5020', name: 'Salary & Wage Costs', type: 'Expense', balance: 12000 }
];

export const quickBooksService = {
  getCOA() {
    const list = localStorage.getItem(KEY_MOCK_COA);
    if (!list) {
      localStorage.setItem(KEY_MOCK_COA, JSON.stringify(DEFAULT_COA));
      return DEFAULT_COA;
    }
    return JSON.parse(list);
  },

  getSyncHistory() {
    return JSON.parse(localStorage.getItem(KEY_SYNC_HISTORY) || '[]');
  },

  triggerSync(companyFile, syncType) {
    if (!companyFile) throw new Error('QuickBooks company file is required.');

    // 1. Log Sync job in the main queue
    const job = syncEngineService.addJob('QuickBooks', `${syncType} Sync (${companyFile})`);

    // 2. Log in QB specific history
    const history = this.getSyncHistory();
    const newLog = {
      id: `qb-${Date.now()}`,
      companyFile,
      syncType,
      jobId: job.id,
      status: 'In Progress',
      timestamp: new Date().toISOString()
    };
    history.push(newLog);
    localStorage.setItem(KEY_SYNC_HISTORY, JSON.stringify(history));

    // Listen for progress simulation complete
    const handleSyncComplete = () => {
      const q = syncEngineService.getAll();
      const updatedJob = q.find(j => j.id === job.id);
      if (updatedJob && updatedJob.status !== 'Running' && updatedJob.status !== 'Queued') {
        // Update history status
        const currentHist = this.getSyncHistory();
        const idx = currentHist.findIndex(h => h.jobId === job.id);
        if (idx !== -1) {
          currentHist[idx].status = updatedJob.status;
          currentHist[idx].error = updatedJob.error;
          localStorage.setItem(KEY_SYNC_HISTORY, JSON.stringify(currentHist));
        }
        window.removeEventListener('sync_queue_updated', handleSyncComplete);
      }
    };
    window.addEventListener('sync_queue_updated', handleSyncComplete);

    return job;
  },

  detectConflict(entityType, localId) {
    // Simulated conflict checker
    // If the local ID is odd, mock a conflict exists! (Makes it interactive and easy to test conflict override UI!)
    const existsRemote = parseInt(String(localId).replace(/\D/g, '') || '1') % 2 === 1;
    if (existsRemote) {
      return {
        conflict: true,
        entityType,
        localId,
        message: `Conflict Detected: ${entityType} #${localId} exists in QuickBooks with different modified timestamps.`
      };
    }
    return { conflict: false };
  },

  resolveConflict(localId, resolution) {
    // resolution = 'Overwrite Remote' or 'Overwrite Local'
    integrationAuditService.logEvent(
      'Sync Completed', 
      'QuickBooks', 
      `Resolved conflict for record #${localId} using policy: ${resolution}`
    );
    return true;
  }
};

export default quickBooksService;
