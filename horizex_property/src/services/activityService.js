import { COMM_EVENT_TYPES } from '../mock/notes';

const TIMELINE_KEY = 'mock_comm_timeline';
const NOTIFICATIONS_KEY = 'mock_notifications';

const getStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const NOTIFICATION_EVENT_TYPES = new Set([
  'NOTE_CREATED',
  'COMMENT_ADDED',
  'MENTION_ADDED',
  'ATTACHMENT_UPLOADED',
  'NOTE_PINNED',
]);

const notificationTypeFor = (eventType) => {
  if (eventType === 'MENTION_ADDED') return 'warning';
  if (eventType === 'ATTACHMENT_UPLOADED') return 'success';
  return 'info';
};

const pushNotification = (event) => {
  if (!NOTIFICATION_EVENT_TYPES.has(event.eventType)) return;

  const notifications = getStore(NOTIFICATIONS_KEY);
  const nextId = notifications.length
    ? Math.max(...notifications.map((n) => n.id)) + 1
    : 1;

  const label = COMM_EVENT_TYPES[event.eventType]?.label || 'Activity Update';

  notifications.unshift({
    id: nextId,
    title: label,
    message: event.description,
    type: notificationTypeFor(event.eventType),
    source: 'activity',
    activityId: event.id,
    entityType: event.entityType,
    entityId: event.entityId,
    noteId: event.noteId,
    createdAt: event.createdAt,
    read: false,
  });

  setStore(NOTIFICATIONS_KEY, notifications);
  window.dispatchEvent(new Event('notificationsUpdated'));
};

export const activityService = {
  publish(eventType, payload = {}) {
    const timeline = getStore(TIMELINE_KEY);
    const now = new Date().toISOString();
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      eventType,
      noteId: payload.noteId ?? null,
      entityType: payload.entityType ?? null,
      entityId: payload.entityId ?? null,
      companyId: payload.companyId ?? 1,
      description: payload.description || '',
      actorName: payload.actorName || 'Admin User',
      metadata: payload.metadata || null,
      createdAt: now,
      updatedAt: now,
      createdBy: payload.actorName || 'Admin User',
      updatedBy: payload.actorName || 'Admin User',
    };

    timeline.unshift(event);
    setStore(TIMELINE_KEY, timeline);
    pushNotification(event);
    window.dispatchEvent(new CustomEvent('activityPublished', { detail: event }));
    return event;
  },

  getRecent(limit = 20, filters = {}) {
    let events = getStore(TIMELINE_KEY);
    if (filters.companyId) {
      events = events.filter((e) => e.companyId === filters.companyId);
    }
    if (filters.entityType) {
      events = events.filter((e) => e.entityType === filters.entityType);
    }
    if (filters.noteId) {
      events = events.filter((e) => e.noteId === filters.noteId);
    }
    return events
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  getByEntity(entityType, entityId, extraFilters = {}) {
    let events = getStore(TIMELINE_KEY).filter(
      (e) =>
        e.entityType === entityType &&
        String(e.entityId) === String(entityId)
    );
    if (extraFilters.noteId) {
      events = events.filter((e) => e.noteId === extraFilters.noteId);
    }
    return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getForDashboard(limit = 10, companyId = null) {
    return activityService.getRecent(limit, companyId ? { companyId } : {});
  },

  getNotifications(limit = 20) {
    return getStore(NOTIFICATIONS_KEY)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  getUnreadNotificationCount() {
    return getStore(NOTIFICATIONS_KEY).filter((n) => !n.read).length;
  },

  markNotificationRead(id) {
    const notifications = getStore(NOTIFICATIONS_KEY);
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx === -1) return;
    notifications[idx].read = true;
    setStore(NOTIFICATIONS_KEY, notifications);
    window.dispatchEvent(new Event('notificationsUpdated'));
  },

  markAllNotificationsRead() {
    const notifications = getStore(NOTIFICATIONS_KEY).map((n) => ({ ...n, read: true }));
    setStore(NOTIFICATIONS_KEY, notifications);
    window.dispatchEvent(new Event('notificationsUpdated'));
  },
};

export default activityService;
