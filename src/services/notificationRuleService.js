const KEY = 'mock_notification_rules';

const DEFAULTS = [
  { id: 'rule-1', event: 'Rent Overdue', minAmount: 500, daysThreshold: 5, channel: 'In-App & Email', isActive: true },
  { id: 'rule-2', event: 'Late Attendance', minAmount: 0, daysThreshold: 0, channel: 'In-App Only', isActive: true },
  { id: 'rule-3', event: 'TAL Hearing Approaching', minAmount: 0, daysThreshold: 3, channel: 'In-App & Push', isActive: true }
];

export const notificationRuleService = {
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

  updateRule(id, isActive) {
    const list = this.getStore();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx].isActive = isActive;
      list[idx].updatedAt = new Date().toISOString();
      this.setStore(list);
      return list[idx];
    }
    throw new Error('Notification rule not found');
  }
};

export default notificationRuleService;
