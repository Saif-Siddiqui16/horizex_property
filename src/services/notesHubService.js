import {
  noteService,
  commentService,
  noteAttachmentService,
  communicationAnalyticsService,
} from '../mock/mockServices';
import { NOTE_ENTITY_TYPES, NOTE_CATEGORIES, NOTE_PRIORITIES } from '../mock/notes';
import { entityResolverService } from './entityResolverService';
import { activityService } from './activityService';

const getActiveCompanyId = () => {
  const id = localStorage.getItem('global_selected_company_id');
  return id ? parseInt(id, 10) : null;
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
    const companyId = getActiveCompanyId();
    const notes = noteService.getAll({
      ...filters,
      ...(companyId ? { companyId } : {}),
    });
    return notes.map(withEntity);
  },

  getPinnedNotes: () => {
    const companyId = getActiveCompanyId();
    return noteService.getPinnedNotes(companyId).map(withEntity);
  },

  getNoteDetail: (id) => {
    const note = noteService.getById(id);
    if (!note) return null;

    const companyId = getActiveCompanyId();
    if (companyId && note.companyId !== companyId) return null;

    return {
      ...withEntity(note),
      comments: commentService.getByNote(id),
      attachments: noteAttachmentService.getByNote(id),
      timeline: activityService.getByEntity(note.entityType, note.entityId, { noteId: id }),
    };
  },

  getStats: () => communicationAnalyticsService.getStats(getActiveCompanyId()),

  getRecentActivity: (limit = 15) =>
    activityService.getRecent(limit, getActiveCompanyId() ? { companyId: getActiveCompanyId() } : {}),

  getNotesByEntityType: () => {
    const companyId = getActiveCompanyId();
    let notes = noteService.getAll(companyId ? { companyId } : {});
    const breakdown = {};
    notes.forEach((n) => {
      breakdown[n.entityType] = (breakdown[n.entityType] || 0) + 1;
    });
    return Object.entries(breakdown).map(([type, count]) => ({
      type,
      count,
      label: NOTE_ENTITY_TYPES[type]?.label || type,
    }));
  },

  getMentionsForUser: (userName) => noteService.getMentions(userName).map(withEntity),

  createNote: (payload) => {
    const companyId = payload.companyId || getActiveCompanyId() || 1;
    return withEntity(
      noteService.create({
        ...payload,
        companyId,
        createdBy: payload.createdBy || 'Admin User',
      })
    );
  },

  updateNote: (id, payload) => withEntity(noteService.update(id, payload)),

  deleteNote: (id) => noteService.delete(id),

  togglePin: (id, actorName = 'Admin User') => withEntity(noteService.togglePin(id, actorName)),

  addComment: (noteId, content, createdBy = 'Admin User') =>
    commentService.create(noteId, { content, createdBy }),

  updateComment: (commentId, content, updatedBy = 'Admin User') =>
    commentService.update(commentId, { content, updatedBy }),

  deleteComment: (commentId) => commentService.delete(commentId),

  uploadAttachment: (noteId, fileMeta) => noteAttachmentService.upload(noteId, fileMeta),

  deleteAttachment: (attachmentId) => noteAttachmentService.delete(attachmentId),

  resolveEntity: (entityType, entityId) => entityResolverService.resolve(entityType, entityId),

  searchEntities: (entityType, query) => entityResolverService.search(entityType, query),

  getEntityTypes: () => entityResolverService.getEntityTypes(),
};

export default notesHubService;
