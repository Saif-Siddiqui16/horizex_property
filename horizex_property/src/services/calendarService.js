import integrationAuditService from './integrationAuditService';
import calendarTemplateService from './calendarTemplateService';

const KEY = 'mock_calendar_events';

const DEFAULT_EVENTS = [
  { id: 'evt-1', title: 'Lease Expiry: Sarah Connor', description: 'Unit Apt 101 lease ending soon.', category: 'Lease Expiry', start: '2026-07-15', end: '2026-07-15', syncStatus: 'Synced', syncJobId: 'job-2', createdAt: new Date().toISOString() },
  { id: 'evt-2', title: 'Rent Due: Apt 301', description: 'Monthly rent billing invoice due.', category: 'Rent Due', start: '2026-07-01', end: '2026-07-01', syncStatus: 'Synced', syncJobId: 'job-2', createdAt: new Date().toISOString() },
  { id: 'evt-3', title: 'Tribunal Hearing: Case TAL-2026', description: 'Hearing schedule at TAL court.', category: 'Hearing', start: '2026-07-28', end: '2026-07-28', syncStatus: 'Local Only', createdAt: new Date().toISOString() }
];

export const calendarService = {
  getStore() {
    const list = localStorage.getItem(KEY);
    if (!list) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    return JSON.parse(list);
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll() {
    return this.getStore();
  },

  create(event) {
    if (!event.title || !event.start || !event.category) {
      throw new Error('Title, Start Date, and Category are required.');
    }
    const list = this.getStore();
    const newEvt = {
      id: `evt-${Date.now()}`,
      syncStatus: 'Local Only',
      createdAt: new Date().toISOString(),
      ...event
    };
    list.push(newEvt);
    this.setStore(list);

    integrationAuditService.logEvent('Calendar Event Created', 'Google Calendar', `Created local event: ${event.title}`);
    return newEvt;
  },

  update(id, fields) {
    let list = this.getStore();
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields, syncStatus: 'Local Only', updatedAt: new Date().toISOString() };
      this.setStore(list);
      return list[idx];
    }
    throw new Error('Event not found');
  },

  delete(id) {
    let list = this.getStore();
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      const title = list[idx].title;
      list = list.filter(e => e.id !== id);
      this.setStore(list);
      
      integrationAuditService.logEvent('Calendar Event Created', 'Google Calendar', `Deleted calendar event: ${title}`);
      return true;
    }
    throw new Error('Event not found');
  },

  triggerCalendarSync() {
    const list = this.getStore();
    let updatedCount = 0;
    const modified = list.map(evt => {
      if (evt.syncStatus === 'Local Only') {
        updatedCount++;
        return { ...evt, syncStatus: 'Synced', updatedAt: new Date().toISOString() };
      }
      return evt;
    });

    this.setStore(modified);
    integrationAuditService.logEvent('Sync Completed', 'Google Calendar', `Synchronized ${updatedCount} local events to Google Calendar server.`);
    return updatedCount;
  }
};

export default calendarService;
