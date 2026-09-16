const KEY = 'mock_scheduled_reports';

export const scheduledReportService = {
  getStore() {
    const list = localStorage.getItem(KEY);
    if (!list) {
      // Seed some default schedules
      const defaults = [
        { id: 'sched-1', reportType: 'Rent Roll', recurrence: 'Monthly', recipients: 'finance@apex.com', format: 'PDF', isActive: true, createdAt: new Date().toISOString() },
        { id: 'sched-2', reportType: 'Vacancy Report', recurrence: 'Weekly', recipients: 'leasing@soros.com', format: 'Excel', isActive: true, createdAt: new Date().toISOString() }
      ];
      localStorage.setItem(KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(list);
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll() {
    return this.getStore();
  },

  create(schedule) {
    if (!schedule.reportType || !schedule.recurrence || !schedule.recipients) {
      throw new Error('Missing required fields for scheduled report');
    }
    const list = this.getStore();
    const newSchedule = {
      id: `sched-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...schedule
    };
    list.push(newSchedule);
    this.setStore(list);
    return newSchedule;
  },

  update(id, fields) {
    let list = this.getStore();
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields, updatedAt: new Date().toISOString() };
      this.setStore(list);
      return list[idx];
    }
    throw new Error('Scheduled report not found');
  },

  delete(id) {
    let list = this.getStore();
    list = list.filter(s => s.id !== id);
    this.setStore(list);
    return true;
  }
};

export default scheduledReportService;
