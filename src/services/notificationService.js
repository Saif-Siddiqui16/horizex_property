import integrationAuditService from './integrationAuditService';

const KEY = 'mock_integrations_notifications';

const DEFAULT_NOTIFS = [
  { id: 'notif-1', category: 'Rent', title: 'Overdue rent warning', description: 'Apt 301 rent invoice is overdue by 10 days.', priority: 'High', isRead: false, isDismissed: false, isArchived: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'notif-2', category: 'Hearings', title: 'Upcoming Court Schedule', description: 'TAL trial case hearing is scheduled for 2026-07-28.', priority: 'Medium', isRead: false, isDismissed: false, isArchived: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'notif-3', category: 'Payroll', title: 'Payroll run generated', description: 'Monthly payroll run processed. Approval pending.', priority: 'Low', isRead: true, isDismissed: false, isArchived: false, createdAt: new Date(Date.now() - 7200000).toISOString() }
];

export const notificationService = {
  getStore() {
    const list = localStorage.getItem(KEY);
    if (!list) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_NOTIFS));
      return DEFAULT_NOTIFS;
    }
    return JSON.parse(list);
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll(filters = {}) {
    let list = this.getStore().filter(n => !n.isDismissed && !n.isArchived);

    if (filters.category) {
      list = list.filter(n => n.category === filters.category);
    }
    if (filters.priority) {
      list = list.filter(n => n.priority === filters.priority);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(n => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getUnreadCount() {
    return this.getStore().filter(n => !n.isRead && !n.isDismissed && !n.isArchived).length;
  },

  markRead(id) {
    const list = this.getStore();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].isRead = true;
      this.setStore(list);
      window.dispatchEvent(new Event('notifications_updated'));
      return list[idx];
    }
    throw new Error('Notification not found');
  },

  markAllRead() {
    const list = this.getStore();
    const updated = list.map(n => ({ ...n, isRead: true }));
    this.setStore(updated);
    window.dispatchEvent(new Event('notifications_updated'));
    return true;
  },

  dismiss(id) {
    const list = this.getStore();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].isDismissed = true;
      this.setStore(list);
      window.dispatchEvent(new Event('notifications_updated'));
      return list[idx];
    }
    throw new Error('Notification not found');
  },

  archive(id) {
    const list = this.getStore();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].isArchived = true;
      this.setStore(list);
      window.dispatchEvent(new Event('notifications_updated'));
      return list[idx];
    }
    throw new Error('Notification not found');
  },

  triggerNotification(category, title, description, priority = 'Medium') {
    const list = this.getStore();
    const newNotif = {
      id: `notif-${Date.now()}`,
      category,
      title,
      description,
      priority,
      isRead: false,
      isDismissed: false,
      isArchived: false,
      createdAt: new Date().toISOString()
    };
    list.push(newNotif);
    this.setStore(list);
    
    integrationAuditService.logEvent('Notification Created', 'Notification Center', `Triggered notification: ${title}`);
    window.dispatchEvent(new Event('notifications_updated'));
    return newNotif;
  }
};

export default notificationService;
