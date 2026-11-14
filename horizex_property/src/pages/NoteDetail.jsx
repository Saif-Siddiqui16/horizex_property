import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { hasPermission } from '../utils/permissions';
import { EntityBadge } from '../components/notes/EntityBadge';
import { CommunicationTimeline } from '../components/notes/CommunicationTimeline';
import { NOTE_CATEGORIES, NOTE_PRIORITIES, NOTE_ENTITY_TYPES } from '../constants/notes';
import {
  ArrowLeft,
  Pin,
  Lock,
  MessageSquare,
  Paperclip,
  Send,
  Trash2,
  ShieldAlert,
  Edit2,
  X,
  StickyNote,
} from 'lucide-react';

import {
  useGetNoteByIdQuery,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from '../store/api/extraApi';
import { useGetTenantsQuery } from '../store/api/tenantsApi';
import { useGetPropertiesQuery } from '../store/api/propertiesApi';
import { useGetLeasesQuery } from '../store/api/leasesApi';

export const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [commentText, setCommentText] = useState('');
  const [fileName, setFileName] = useState('');
  const [localComments, setLocalComments] = useState([]);
  const [localAttachments, setLocalAttachments] = useState([]);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    isPinned: false,
    isPrivate: false,
  });

  const canView = hasPermission('Notes Hub', 'view');
  const canEdit = hasPermission('Notes Hub', 'edit');
  const canDelete = hasPermission('Notes Hub', 'delete');

  // RTK Queries
  const { data: rawNote, isLoading, isError } = useGetNoteByIdQuery(id, {
    skip: !id,
  });
  const { data: tenantsData = [] } = useGetTenantsQuery(undefined, { skip: !rawNote });
  const { data: propertiesData = [] } = useGetPropertiesQuery(undefined, { skip: !rawNote });
  const { data: leasesData = [] } = useGetLeasesQuery(undefined, { skip: !rawNote });

  // RTK Mutations
  const [updateNoteMutation] = useUpdateNoteMutation();
  const [deleteNoteMutation] = useDeleteNoteMutation();

  // Enriched note with entity resolution
  const note = useMemo(() => {
    if (!rawNote) return null;

    const typeKey = rawNote.entityType || rawNote.targetType || 'TENANT';
    const meta = NOTE_ENTITY_TYPES[typeKey] || {
      label: typeKey,
      icon: 'FileText',
      color: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    let label = `${meta.label} #${rawNote.entityId ? String(rawNote.entityId).slice(0, 8) : ''}`;
    let subtitle = '';
    let route = null;
    let exists = false;

    if (typeKey === 'TENANT') {
      const t = (tenantsData || []).find((x) => String(x.id) === String(rawNote.entityId || rawNote.targetId));
      if (t) {
        label = `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Tenant';
        subtitle = t.unitNumber || '';
        route = `/tenants/${t.id}`;
        exists = true;
      }
    } else if (typeKey === 'BUILDING') {
      const p = (propertiesData || []).find((x) => String(x.id) === String(rawNote.entityId || rawNote.targetId));
      if (p) {
        label = p.name || 'Building';
        subtitle = p.address || '';
        route = `/properties/${p.id}`;
        exists = true;
      }
    } else if (typeKey === 'LEASE') {
      const l = (leasesData || []).find((x) => String(x.id) === String(rawNote.entityId || rawNote.targetId));
      if (l) {
        label = l.tenantName ? `${l.tenantName} (${l.unitNumber || 'Lease'})` : `Lease #${String(l.id).slice(0, 6)}`;
        subtitle = l.propertyName || '';
        route = '/leases';
        exists = true;
      }
    }

    const timeline = [
      {
        id: `created-${rawNote.id}`,
        eventType: 'NOTE_CREATED',
        description: `Note titled "${rawNote.title}" created`,
        actorName: rawNote.createdBy || rawNote.authorName || 'Staff',
        createdAt: rawNote.createdAt,
      },
    ];

    if (rawNote.isPinned) {
      timeline.unshift({
        id: `pinned-${rawNote.id}`,
        eventType: 'NOTE_PINNED',
        description: `Note pinned by ${rawNote.createdBy || 'Staff'}`,
        actorName: rawNote.createdBy || 'Staff',
        createdAt: rawNote.updatedAt || rawNote.createdAt,
      });
    }

    return {
      ...rawNote,
      entity: {
        entityType: typeKey,
        entityId: rawNote.entityId || rawNote.targetId,
        typeLabel: meta.label,
        icon: meta.icon,
        color: meta.color,
        route,
        exists,
        label,
        subtitle,
      },
      comments: [...(rawNote.comments || []), ...localComments],
      attachments: [...(rawNote.attachments || []), ...localAttachments],
      timeline,
    };
  }, [rawNote, tenantsData, propertiesData, leasesData, localComments, localAttachments]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      content: commentText.trim(),
      createdBy: 'Admin User',
      createdAt: new Date().toISOString(),
    };
    setLocalComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    const newAttachment = {
      id: Date.now(),
      name: fileName.trim(),
      type: ext,
      size: '12 KB',
      uploadedBy: 'Admin User',
    };
    setLocalAttachments((prev) => [...prev, newAttachment]);
    setFileName('');
  };

  const handleTogglePin = async () => {
    if (!note) return;
    try {
      await updateNoteMutation({
        id: note.id,
        isPinned: !note.isPinned,
      }).unwrap();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      alert('Error updating note pin status: ' + (err?.data?.message || err.message));
    }
  };

  const handleOpenEdit = () => {
    if (!note) return;
    setEditForm({
      title: note.title || '',
      content: note.content || '',
      category: note.category || 'GENERAL',
      priority: note.priority || 'MEDIUM',
      isPinned: Boolean(note.isPinned),
      isPrivate: Boolean(note.isPrivate),
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      alert('Please enter a note title');
      return;
    }
    try {
      await updateNoteMutation({
        id: note.id,
        ...editForm,
      }).unwrap();
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update note:', err);
      alert('Error updating note: ' + (err?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await deleteNoteMutation(id).unwrap();
      navigate('/notes-hub');
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert('Error deleting note: ' + (err?.data?.message || err.message));
    }
  };

  if (!canView) {
    return (
      <>
        <div className="text-center py-20 text-slate-500 font-medium">Access restricted.</div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      </>
    );
  }

  if (isError || !note) {
    return (
      <>
        <div className="text-center py-20">
          <ShieldAlert size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium mb-4">Note not found or not visible for selected company.</p>
          <Link to="/notes-hub" className="text-indigo-600 font-bold text-sm no-underline">
            ← Back to Notes Hub
          </Link>
        </div>
      </>
    );
  }

  const cat = NOTE_CATEGORIES[note.category] || {};
  const pri = NOTE_PRIORITIES[note.priority] || {};

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/notes-hub"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 no-underline"
          >
            <ArrowLeft size={14} /> Notes Hub
          </Link>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button variant="secondary" onClick={handleTogglePin} className="flex items-center gap-1 text-xs">
                <Pin size={14} /> {note.isPinned ? 'Unpin' : 'Pin'}
              </Button>
            )}
            {canEdit && (
              <Button variant="secondary" onClick={handleOpenEdit} className="flex items-center gap-1 text-xs text-amber-600">
                <Edit2 size={14} /> Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="secondary" onClick={handleDelete} className="flex items-center gap-1 text-xs text-rose-600">
                <Trash2 size={14} /> Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 rounded-[22px] border border-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {note.isPinned && <Pin size={14} className="text-orange-500" />}
                    {note.isPrivate && <Lock size={14} className="text-slate-400" />}
                    <span className="text-[10px] font-mono text-slate-400">{note.noteNumber}</span>
                  </div>
                  <h1 className="text-xl font-black text-slate-800">{note.title}</h1>
                </div>
                <EntityBadge entity={note.entity} />
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${cat.color || ''}`}>
                  {cat.label || note.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${pri.color || ''}`}>
                  {pri.label || note.priority}
                </span>
                {(note.tags || []).map((tag) => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                {note.content}
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-wider">
                {note.createdBy} · Created {new Date(note.createdAt).toLocaleString()}
              </p>
            </Card>

            <Card className="p-5 rounded-[22px] border border-slate-200">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare size={14} /> Comments ({note.comments?.length || 0})
              </h3>
              <div className="space-y-3 mb-4 max-h-[280px] overflow-y-auto">
                {(note.comments || []).map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-700 font-medium">{c.content}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-2">
                      {c.createdBy} · {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              {canEdit && (
                <form onSubmit={handleAddComment} className="relative">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 pr-12 text-xs font-semibold border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 resize-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 bottom-3 p-1.5 bg-zinc-900 text-white rounded-xl"
                  >
                    <Send size={12} />
                  </button>
                </form>
              )}
            </Card>

            <Card className="p-5 rounded-[22px] border border-slate-200">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Paperclip size={14} /> Attachments ({note.attachments?.length || 0})
              </h3>
              <div className="space-y-2 mb-4">
                {(note.attachments || []).map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{att.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold">
                        {att.type} · {att.size} · {att.uploadedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {canEdit && (
                <form onSubmit={handleUpload} className="flex gap-2">
                  <input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="document.pdf"
                    className="flex-1 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl"
                  />
                  <Button type="submit" className="text-xs">Upload</Button>
                </form>
              )}
            </Card>
          </div>

          <Card className="p-5 rounded-[22px] border border-slate-200 h-fit">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
              Activity Timeline
            </h3>
            <CommunicationTimeline events={note.timeline || []} compact />
          </Card>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StickyNote size={18} className="text-indigo-600" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Edit Note
                </h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <input
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Note title"
                className="w-full px-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
              <textarea
                required
                rows={4}
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="Note content..."
                className="w-full px-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-indigo-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl"
                >
                  {Object.entries(NOTE_CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl"
                >
                  {Object.entries(NOTE_PRIORITIES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isPinned}
                    onChange={(e) => setEditForm({ ...editForm, isPinned: e.target.checked })}
                  />
                  Pin note
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isPrivate}
                    onChange={(e) => setEditForm({ ...editForm, isPrivate: e.target.checked })}
                  />
                  Private
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteDetail;
