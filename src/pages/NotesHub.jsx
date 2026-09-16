import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { hasPermission } from '../utils/permissions';
import { notesHubService } from '../services/notesHubService';
import { NotesKPICards } from '../components/notes/NotesKPICards';
import { NotesTable } from '../components/notes/NotesTable';
import { CommunicationTimeline } from '../components/notes/CommunicationTimeline';
import { RecentNotesWidget } from '../components/notes/RecentNotesWidget';
import { Search, Plus, Filter, StickyNote, List, LayoutDashboard, X, ShieldAlert } from 'lucide-react';

export const NotesHub = () => {
  const config = notesHubService.getConfig();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [entityBreakdown, setEntityBreakdown] = useState([]);
  const [pinnedNotes, setPinnedNotes] = useState([]);

  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [entityOptions, setEntityOptions] = useState([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    entityType: 'TENANT',
    entityId: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    isPinned: false,
    isPrivate: false,
    mentions: '',
  });

  const canView = hasPermission('Notes Hub', 'view');
  const canAdd = hasPermission('Notes Hub', 'add');

  const loadData = useCallback(() => {
    try {
      setLoading(true);
      const filters = {
        ...(search ? { search } : {}),
        ...(entityType ? { entityType } : {}),
        ...(category ? { category } : {}),
        ...(priority ? { priority } : {}),
      };
      setNotes(notesHubService.listNotes(filters));
      setStats(notesHubService.getStats());
      setActivity(notesHubService.getRecentActivity(12));
      setEntityBreakdown(notesHubService.getNotesByEntityType());
      setPinnedNotes(notesHubService.getPinnedNotes());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, entityType, category, priority]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleCompanyChange = () => loadData();
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [loadData]);

  useEffect(() => {
    if (showCreate && form.entityType) {
      setEntityOptions(notesHubService.searchEntities(form.entityType, ''));
    }
  }, [showCreate, form.entityType]);

  const handleCreate = (e) => {
    e.preventDefault();
    notesHubService.createNote({
      title: form.title,
      content: form.content,
      entityType: form.entityType,
      entityId: form.entityId,
      category: form.category,
      priority: form.priority,
      isPinned: form.isPinned,
      isPrivate: form.isPrivate,
      mentions: form.mentions
        ? form.mentions.split(',').map((m) => m.trim()).filter(Boolean)
        : [],
    });
    setShowCreate(false);
    setForm({
      title: '',
      content: '',
      entityType: 'TENANT',
      entityId: '',
      category: 'GENERAL',
      priority: 'MEDIUM',
      isPinned: false,
      isPrivate: false,
      mentions: '',
    });
    loadData();
  };

  if (!canView) {
    return (
      <MainLayout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[32px] border border-slate-100 shadow-2xl p-16 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3 uppercase">Access Restricted</h2>
          <p className="text-slate-500 max-w-sm font-medium">
            You do not have permission to view Notes Hub. Contact your administrator.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Notes Hub">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1 w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'notes', label: 'All Notes', icon: List },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
          {canAdd && (
            <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
              <Plus size={16} /> New Note
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : activeTab === 'overview' ? (
          <>
            <NotesKPICards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card className="p-5 rounded-[22px] border border-slate-200">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
                    Recent Activity
                  </h3>
                  <CommunicationTimeline events={activity} />
                </Card>
              </div>
              <RecentNotesWidget notes={pinnedNotes.slice(0, 5)} title="Pinned Notes" />
            </div>
            <Card className="p-5 rounded-[22px] border border-slate-200">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
                Notes by Entity Type
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {entityBreakdown.map((row) => (
                  <div key={row.type} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-lg font-black text-slate-800">{row.count}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                      {row.label}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-[22px] border border-slate-200 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">All Entities</option>
                {Object.entries(config.entityTypes).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">All Categories</option>
                {Object.entries(config.categories).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">All Priorities</option>
                {Object.entries(config.priorities).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <Filter size={14} className="text-slate-400 hidden sm:block" />
            </div>
            <NotesTable
              notes={notes}
              categories={config.categories}
              priorities={config.priorities}
            />
          </>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StickyNote size={18} className="text-indigo-600" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Create Note</h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Note title"
                className="w-full px-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
              <textarea
                required
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Note content..."
                className="w-full px-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-indigo-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.entityType}
                  onChange={(e) => setForm({ ...form, entityType: e.target.value, entityId: '' })}
                  className="text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl"
                >
                  {Object.entries(config.entityTypes).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <select
                  required
                  value={form.entityId}
                  onChange={(e) => setForm({ ...form, entityId: e.target.value })}
                  className="text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl"
                >
                  <option value="">Select entity...</option>
                  {entityOptions.map((opt) => (
                    <option key={opt.entityId} value={opt.entityId}>
                      {opt.label} {opt.subtitle ? `— ${opt.subtitle}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl"
                >
                  {Object.entries(config.categories).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl"
                >
                  {Object.entries(config.priorities).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <input
                value={form.mentions}
                onChange={(e) => setForm({ ...form, mentions: e.target.value })}
                placeholder="Mentions (comma-separated names)"
                className="w-full px-3 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl"
              />
              <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  />
                  Pin note
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPrivate}
                    onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
                  />
                  Private
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Note</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default NotesHub;
