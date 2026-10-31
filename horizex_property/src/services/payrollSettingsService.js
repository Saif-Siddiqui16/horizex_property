const KEY = 'mock_payroll_settings';

const DEFAULT_SETTINGS = {
  approvalWorkflowType: 'SingleApproval', // 'SingleApproval' | 'TwoLevelApproval' | 'AutoApproval'
  payCycle: 'Monthly', // 'Monthly' | 'Biweekly' | 'Weekly'
  overtimeMultiplier: 1.5,
  autoApproveLeaves: false,
  autoApproveOvertime: false,
  taxRateDefault: 15,
  graceTimeMinutes: 15,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Admin User'
};

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const payrollSettingsService = {
  getSettings() {
    return getStore();
  },

  updateSettings(data) {
    const current = getStore();
    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };
    setStore(updated);
    return updated;
  }
};

export default payrollSettingsService;
