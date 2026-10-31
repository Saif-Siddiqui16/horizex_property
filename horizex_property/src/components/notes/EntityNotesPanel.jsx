/**
 * EntityNotesPanel — reusable notes panel that can be embedded
 * inside any entity detail page (Tenant, Unit/Apartment, etc.)
 *
 * Props:
 *   entityType  — 'TENANT' | 'APARTMENT' | 'BUILDING' | ...
 *   entityId    — the numeric/string id of the entity
 *   entityLabel — display label for empty states e.g. "tenant" or "apartment"
 *   companyId   — optional, defaults to localStorage value
 */
import React, { useState, useEffect, useCallback } from 'react';
import { noteService } from '../../mock/mockServices';
import { NOTE_CATEGORIES, NOTE_PRIORITIES } from '../../mock/notes';
import {
  StickyNote, Plus, Pin, Trash2, Lock, X, ChevronDown, ChevronUp,
  Search, Tag, AlertCircle
} from 'lucide-react';

const PRIORITY_STYLES = {
  LOW:    'bg-slate-100 text-slate-600 border-slate-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH:   'bg-orange-50 text-orange-700 border-orange-200',
  URGENT: 'bg-rose-50 text-rose-700 border-rose-200',
};

const CATEGORY_STYLES = {
  GENERAL:       'bg-slate-100 text-slate-600',
  LEGAL:         'bg-rose-50 text-rose-700',
  FINANCIAL:     'bg-emerald-50 text-emerald-700',
  MAINTENANCE:   'bg-amber-50 text-amber-700',
  LEASE:         'bg-violet-50 text-violet-700',
  COMMUNICATION: 'bg-blue-50 text-blue-700',
};

const getCompanyId = () => {
  const id = localStorage.getItem('global_selected_company_id');
  return id ? parseInt(id, 10) : 1;
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* ── Note Card ─────────────────────────────────────────────── */
const NoteCard = ({ note, onDelete, onTogglePin, onToggleExpand, expanded }) => (
  <div className={`group bg-white border rounded-2xl p-4 transition-all hover:shadow-md ${
    note.isPinned ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'
  }`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {note.isPinned && (
            <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase tracking-wider">
              <Pin size={10} /> Pinned
            </span>
          )}
          {note.isPrivate && (
            <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              <Lock size={10} /> Private
            </span>
          )}
          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[note.priority] || PRIORITY_STYLES.MEDIUM}`}>
            {NOTE_PRIORITIES[note.priority]?.label || note.priority}
          </span>
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${CATEGORY_STYLES[note.category] || CATEGORY_STYLES.GENERAL}`}>
            {NOTE_CATEGORIES[note.category]?.label || note.category}
          </span>
        </div>

        <p className="text-sm font-bold text-slate-800 leading-snug">{note.title}</p>

        {expanded ? (
          <p className="text-xs text-slate-500 font-medium mt-1.5 whitespace-pre-wrap leading-relaxed">{note.content}</p>
        ) : (
          <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-2">{note.content}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-semibold">
          <span>{note.createdBy}</span>
          <span>·</span>
          <span>{formatDate(note.createdAt)}</span>
          {note.mentions?.length > 0 && (
            <>
              <span>·</span>
              <span className="text-indigo-500">@{note.mentions.join(', @')}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <button
          onClick={onToggleExpand}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button
          onClick={onTogglePin}
          className={`p-1.5 rounded-lg transition-all ${
            note.isPinned
              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
              : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
          }`}
          title={note.isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          title="Delete note"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </div>
);

/* ── Main Panel ─────────────────────────────────────────────── */
export const EntityNotesPanel = ({ entityType, entityId, entityLabel = 'entity', companyId: propCompanyId }) => {
  const companyId = propCompanyId || getCompanyId();

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '',
    category: 'GENERAL', priority: 'MEDIUM',
    isPinned: false, isPrivate: false, mentions: '',
  });

  const load = useCallback(() => {
    const all = noteService.getByEntity(entityType, entityId);
    setNotes(all);
  }, [entityType, entityId]);

  useEffect(() => { load(); }, [load]);

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    const matchSearch = !q || (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q);
    const matchCat = !filterCategory || n.category === filterCategory;
    const matchPri = !filterPriority || n.priority === filterPriority;
    return matchSearch && matchCat && matchPri;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    noteService.create({
      entityType,
      entityId,
      companyId,
      title: form.title,
      content: form.content,
      category: form.category,
      priority: form.priority,
      isPinned: form.isPinned,
      isPrivate: form.isPrivate,
      mentions: form.mentions ? form.mentions.split(',').map(m => m.trim()).filter(Boolean) : [],
      createdBy: JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin User',
    });
    setForm({ title: '', content: '', category: 'GENERAL', priority: 'MEDIUM', isPinned: false, isPrivate: false, mentions: '' });
    setShowForm(false);
    load();
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this note?')) return;
    noteService.delete(id);
    load();
  };

  const handleTogglePin = (id) => {
    noteService.togglePin(id);
    load();
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const pinnedCount = notes.filter(n => n.isPinned).length;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <StickyNote size={16} />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Notes</span>
            <span className="text-[10px] text-slate-400 font-semibold block">
              {notes.length} total{pinnedCount > 0 ? ` · ${pinnedCount} pinned` : ''}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-indigo-200"
        >
          <Plus size={14} /> Add Note
        </button>
      </div>

      {/* Filter bar */}
      {notes.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="pl-7 pr-3 py-2 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 w-44"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-[11px] font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          >
            <option value="">All Categories</option>
            {Object.entries(NOTE_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="text-[11px] font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          >
            <option value="">All Priorities</option>
            {Object.entries(NOTE_PRIORITIES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {(search || filterCategory || filterPriority) && (
            <button
              onClick={() => { setSearch(''); setFilterCategory(''); setFilterPriority(''); }}
              className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <StickyNote size={28} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-500">No notes for this {entityLabel}</p>
          <p className="text-xs text-slate-400 mt-1">Click "Add Note" to create the first one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              expanded={expandedIds.has(note.id)}
              onDelete={() => handleDelete(note.id)}
              onTogglePin={() => handleTogglePin(note.id)}
              onToggleExpand={() => toggleExpand(note.id)}
            />
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StickyNote size={18} className="text-indigo-600" />
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Add Note</h2>
                  <p className="text-[10px] text-slate-400 font-semibold capitalize">
                    Linked to this {entityLabel}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Note title..."
                  className="w-full px-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content *</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your note here..."
                  className="w-full px-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Category + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  >
                    {Object.entries(NOTE_CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  >
                    {Object.entries(NOTE_PRIORITIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mentions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentions (comma-separated)</label>
                <input
                  value={form.mentions}
                  onChange={e => setForm({ ...form, mentions: e.target.value })}
                  placeholder="e.g. John, Sarah"
                  className="w-full px-3 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <Pin size={12} className="text-amber-500" /> Pin note
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isPrivate}
                    onChange={e => setForm({ ...form, isPrivate: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <Lock size={12} className="text-slate-400" /> Private
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityNotesPanel;
