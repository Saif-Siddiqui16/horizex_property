import { NOTE_ENTITY_TYPES, NOTE_CATEGORIES, NOTE_PRIORITIES } from '../constants/notes';
import { entityResolverService } from './entityResolverService';
import { activityService } from './activityService';
import api from '../api/client';

const getActiveCompanyId = () => {
  const id = localStorage.getItem('global_selected_company_id');
  return id ? id : null;
};

const withEntity = (note) => ({
  ...note,
  entity: entityResolverService.resolve(note.entityType, note.entityId),
  commentCount: (note.commentIds || []).length,
  attachmentCount: (note.attachmentIds || []).length,
});

export const notesHubService = {
  getConfig: () => ({
    entityTypes: NOTE_ENTITY_TYPES,
    categories: NOTE_CATEGORIES,
    priorities: NOTE_PRIORITIES,
  }),

  listNotes: (filters = {}) => {
    return [];
  },

  getPinnedNotes: () => {
    return [];
  },

  getNoteDetail: async (id) => {
    try {
      const res = await api.get(`/admin/notes/${id}`);
      const note = res.data?.data || res.data;
      if (!note) return null;
      return withEntity(note);
    } catch {
      return null;
    }
  },

  getStats: () => ({ total: 0, pinned: 0, byCategory: {} }),

  getRecentActivity: () => [],

  getNotesByEntityType: () => [],

  getMentionsForUser: () => [],

  createNote: async (payload) => {
    try {
      const res = await api.post('/admin/notes', payload);
      return res.data?.data || res.data;
    } catch {
      return null;
    }
  },

  updateNote: async (id, payload) => {
    try {
      const res = await api.put(`/admin/notes/${id}`, payload);
      return res.data?.data || res.data;
    } catch {
      return null;
    }
  },

  deleteNote: async (id) => {
    try {
      await api.delete(`/admin/notes/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  togglePin: async (id) => {
    try {
      const res = await api.put(`/admin/notes/${id}`, { isPinned: true });
      return res.data?.data || res.data;
    } catch {
      return null;
    }
  },

  addComment: async (noteId, content) => {
    return { id: Date.now(), content };
  },

  updateComment: async () => {},

  deleteComment: async () => {},

  uploadAttachment: async () => {},

  deleteAttachment: async () => {},

  resolveEntity: (entityType, entityId) => entityResolverService.resolve(entityType, entityId),

  searchEntities: (entityType, query) => entityResolverService.search(entityType, query),

  getEntityTypes: () => entityResolverService.getEntityTypes(),
};

export default notesHubService;
