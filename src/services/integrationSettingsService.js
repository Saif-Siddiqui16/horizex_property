const KEY = 'mock_integration_settings';

const DEFAULT_SETTINGS = {
  quickbooks: { autoSync: true, syncInterval: 'Daily', conflictResolution: 'Overwrite Remote' },
  google_calendar: { autoSync: true, syncInterval: 'Hourly', conflictResolution: 'Overwrite Local' },
  email_hub: { saveSentEmails: true, trackDeliverability: true }
};

export const integrationSettingsService = {
  getSettings() {
    const list = localStorage.getItem(KEY);
    if (!list) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(list);
  },

  saveSettings(module, newSettings) {
    const current = this.getSettings();
    current[module] = { ...current[module], ...newSettings };
    localStorage.setItem(KEY, JSON.stringify(current));
    return current;
  }
};

export default integrationSettingsService;
