import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { hasPermission } from '../utils/permissions';
import { notesHubService } from '../services/notesHubService';
import { NotesKPICards } from '../components/notes/NotesKPICards';
import { NotesTable } from '../components/notes/NotesTable';
import { CommunicationTimeline } from '../components/notes/CommunicationTimeline';
import { RecentNotesWidget } from '../components/notes/RecentNotesWidget';
import { Search, Plus, Filter, StickyNote, List, LayoutDashboard, X, ShieldAlert } from 'lucide-react';

import {
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from '../store/api/extraApi';
import { useGetCompaniesQuery } from '../store/api/companiesApi';
import { useGetTenantsQuery } from '../store/api/tenantsApi';
import { useGetPropertiesQuery } from '../store/api/propertiesApi';
import { useGetLeasesQuery } from '../store/api/leasesApi';
import { NOTE_ENTITY_TYPES } from '../constants/notes';

export const NotesHub = () => {
  const config = notesHubService.getConfig();
  const [activeTab, setActiveTab] = useState('overview');

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');

  // Company Selector Context State
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    return localStorage.getItem('global_selected_company_id') || localStorage.getItem('companyContext') || '';
  });

  // Pagination State (10 notes per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
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

  // RTK Queries
  const queryParams = useMemo(() => {
    if (selectedCompanyId && selectedCompanyId !== 'all') {
      return { companyId: selectedCompanyId };
    }
    return undefined;
  }, [selectedCompanyId]);

  const { data: notesData = [], isLoading: isNotesLoading, refetch } = useGetNotesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });
  const { data: companiesData = [] } = useGetCompaniesQuery(undefined, { skip: !showCreate && activeTab !== 'overview' && activeTab !== 'notes' });
  const { data: tenantsData = [] } = useGetTenantsQuery(undefined, { skip: !showCreate && activeTab !== 'overview' && activeTab !== 'notes' });
  const { data: propertiesData = [] } = useGetPropertiesQuery(undefined, { skip: !showCreate && activeTab !== 'overview' && activeTab !== 'notes' });
  const { data: leasesData = [] } = useGetLeasesQuery(undefined, { skip: !showCreate && activeTab !== 'overview' && activeTab !== 'notes' });

  // RTK Mutations
  const [createNoteMutation, { isLoading: isCreating }] = useCreateNoteMutation();
  const [updateNoteMutation, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const [deleteNoteMutation] = useDeleteNoteMutation();

  const handleOpenCreate = () => {
    setEditingNote(null);
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
    setShowCreate(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setForm({
      title: note.title || '',
      content: note.content || '',
      entityType: note.entityType || note.targetType || 'TENANT',
      entityId: note.entityId || note.targetId || '',
      category: note.category || 'GENERAL',
      priority: note.priority || 'MEDIUM',
      isPinned: Boolean(note.isPinned),
      isPrivate: Boolean(note.isPrivate),
      mentions: Array.isArray(note.mentions) ? note.mentions.join(', ') : (note.mentions || ''),
    });
    setShowCreate(true);
  };

  const handleTogglePin = async (note) => {
    try {
      await updateNoteMutation({
        id: note.id,
        isPinned: !note.isPinned,
      }).unwrap();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      alert('Error updating note: ' + (err?.data?.message || err?.error || err.message));
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await deleteNoteMutation(noteId).unwrap();
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert('Error deleting note: ' + (err?.data?.message || err?.error || err.message));
    }
  };

  // Listen to company & building changed events
  useEffect(() => {
    const handleSync = () => {
      const current = localStorage.getItem('global_selected_company_id') || localStorage.getItem('companyContext') || '';
      setSelectedCompanyId(current);
      setCurrentPage(1);
      if (typeof refetch === 'function') refetch();
    };
    window.addEventListener('companyChanged', handleSync);
    window.addEventListener('buildingChanged', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('companyChanged', handleSync);
      window.removeEventListener('buildingChanged', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refetch]);

  // Dynamic Entity Resolution for each note
  const resolveEntityForNote = useCallback((note) => {
    const typeKey = note.entityType || note.targetType || 'TENANT';
    const meta = NOTE_ENTITY_TYPES[typeKey] || {
      label: typeKey,
      icon: 'FileText',
      color: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    let label = `${meta.label} #${note.entityId ? String(note.entityId).slice(0, 8) : ''}`;
    let subtitle = '';
    let route = null;
    let exists = false;

    if (typeKey === 'TENANT') {
      const t = (tenantsData || []).find((x) => String(x.id) === String(note.entityId || note.targetId));
      if (t) {
        label = `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Tenant';
        subtitle = t.unitNumber || '';
        route = `/tenants/${t.id}`;
        exists = true;
      }
    } else if (typeKey === 'BUILDING') {
      const p = (propertiesData || []).find((x) => String(x.id) === String(note.entityId || note.targetId));
      if (p) {
        label = p.name || 'Building';
        subtitle = p.address || '';
        route = `/properties/${p.id}`;
        exists = true;
      }
    } else if (typeKey === 'LEASE') {
      const l = (leasesData || []).find((x) => String(x.id) === String(note.entityId || note.targetId));
      if (l) {
        label = l.tenantName ? `${l.tenantName} (${l.unitNumber || 'Lease'})` : `Lease #${String(l.id).slice(0, 6)}`;
        subtitle = l.propertyName || '';
        route = '/leases';
        exists = true;
      }
    } else if (typeKey === 'COMPANY') {
      const c = (companiesData || []).find((x) => String(x.id) === String(note.entityId || note.targetId));
      if (c) {
        label = c.name || 'Company';
        subtitle = c.email || '';
        route = '/companies';
        exists = true;
      }
    }

    return {
      entityType: typeKey,
      entityId: note.entityId || note.targetId,
      typeLabel: meta.label,
      icon: meta.icon,
      color: meta.color,
      route,
      exists,
      label,
      subtitle,
    };
  }, [tenantsData, propertiesData, leasesData, companiesData]);

  // Filter by company in addition to backend query
  const companyMatchedNotes = useMemo(() => {
    if (!notesData || !Array.isArray(notesData)) return [];
    if (!selectedCompanyId || selectedCompanyId === 'all') return notesData;
    const compIdStr = String(selectedCompanyId);

    return notesData.filter((n) => {
      if (n.companyId && String(n.companyId) === compIdStr) return true;
      if (n.author?.companyId && String(n.author.companyId) === compIdStr) return true;
      if ((n.entityType === 'COMPANY' || n.targetType === 'COMPANY') && String(n.entityId || n.targetId) === compIdStr) {
        return true;
      }
      if (n.entityType === 'BUILDING' || n.targetType === 'BUILDING') {
        const prop = (propertiesData || []).find((p) => String(p.id) === String(n.entityId || n.targetId));
        if (prop && String(prop.companyId) === compIdStr) return true;
      }
      if (n.entityType === 'TENANT' || n.targetType === 'TENANT') {
        const ten = (tenantsData || []).find((t) => String(t.id) === String(n.entityId || n.targetId));
        if (ten && (String(ten.companyId) === compIdStr || (ten.property && String(ten.property.companyId) === compIdStr))) {
          return true;
        }
      }
      return false;
    });
  }, [notesData, selectedCompanyId, propertiesData, tenantsData]);

  // Enriched notes
  const enrichedNotes = useMemo(() => {
    return companyMatchedNotes.map((note) => ({
      ...note,
      entity: resolveEntityForNote(note),
      commentCount: note.commentCount || 0,
      attachmentCount: note.attachmentCount || 0,
    }));
  }, [companyMatchedNotes, resolveEntityForNote]);

  // Filtered notes for "All Notes" Table
  const filteredNotes = useMemo(() => {
    return enrichedNotes.filter((n) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        (n.title || '').toLowerCase().includes(searchLower) ||
        (n.content || '').toLowerCase().includes(searchLower) ||
        (n.createdBy || '').toLowerCase().includes(searchLower) ||
        (n.noteNumber || '').toLowerCase().includes(searchLower) ||
        (n.entity?.label || '').toLowerCase().includes(searchLower);

      const matchesEntity = !entityType || n.entityType === entityType || n.targetType === entityType;
      const matchesCategory = !category || n.category === category;
      const matchesPriority =
        !priority || (n.priority && n.priority.toUpperCase() === priority.toUpperCase());

      return matchesSearch && matchesEntity && matchesCategory && matchesPriority;
    });
  }, [enrichedNotes, search, entityType, category, priority]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, entityType, category, priority]);

  // Paginated Notes (10 notes per page)
  const totalPages = Math.ceil(filteredNotes.length / pageSize) || 1;
  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredNotes.slice(startIndex, startIndex + pageSize);
  }, [filteredNotes, currentPage, pageSize]);

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const totalNotes = enrichedNotes.length;
    const pinnedNotes = enrichedNotes.filter((n) => n.isPinned).length;
    const totalComments = enrichedNotes.reduce((acc, n) => acc + (n.commentCount || 0), 0);
    const totalAttachments = enrichedNotes.reduce((acc, n) => acc + (n.attachmentCount || 0), 0);
    const totalMentions = enrichedNotes.filter((n) =>
      Array.isArray(n.mentions) ? n.mentions.length > 0 : !!n.mentions
    ).length;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentCount = enrichedNotes.filter(
      (n) => new Date(n.createdAt) >= oneWeekAgo
    ).length;

    return {
      totalNotes,
      pinnedNotes,
      totalComments,
      totalAttachments,
      totalMentions,
      recentCount,
    };
  }, [enrichedNotes]);

  // Pinned Notes
  const pinnedNotes = useMemo(() => {
    return enrichedNotes.filter((n) => n.isPinned);
  }, [enrichedNotes]);

  // Recent Activity for Timeline (Strictly top 10 most recent activities)
  const activity = useMemo(() => {
    const sorted = [...enrichedNotes].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    return sorted.slice(0, 10).map((n) => ({
      id: n.id,
      eventType: n.isPinned ? 'NOTE_PINNED' : 'NOTE_CREATED',
      description: `${n.title}: ${n.content ? (n.content.length > 60 ? n.content.slice(0, 60) + '...' : n.content) : 'Note recorded'}`,
      actorName: n.createdBy || n.authorName || 'Admin User',
      createdAt: n.createdAt,
    }));
  }, [enrichedNotes]);

  // Notes by Entity Type Breakdown
  const entityBreakdown = useMemo(() => {
    const counts = {};
    enrichedNotes.forEach((n) => {
      const type = n.entityType || n.targetType || 'TENANT';
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(NOTE_ENTITY_TYPES).map(([key, val]) => ({
      type: key,
      label: val.label,
      count: counts[key] || 0,
    }));
  }, [enrichedNotes]);

  // Dynamic Entity Options for Modal Select
  const entityOptions = useMemo(() => {
    if (form.entityType === 'TENANT') {
      return (tenantsData || []).map((t) => ({
        entityId: String(t.id),
        label: `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Tenant',
        subtitle: t.unitNumber || t.phone || '',
      }));
    }
    if (form.entityType === 'BUILDING') {
      return (propertiesData || []).map((p) => ({
        entityId: String(p.id),
        label: p.name || 'Building',
        subtitle: p.address || '',
      }));
    }
    if (form.entityType === 'LEASE') {
      return (leasesData || []).map((l) => ({
        entityId: String(l.id),
        label: l.tenantName ? `${l.tenantName} (${l.unitNumber || 'Lease'})` : `Lease #${String(l.id).slice(0, 6)}`,
        subtitle: l.propertyName || '',
      }));
    }
    if (form.entityType === 'COMPANY') {
      if (companiesData && companiesData.length > 0) {
        return companiesData.map((c) => ({
          entityId: String(c.id),
          label: c.name || 'Company',
          subtitle: c.email || '',
        }));
      }
      return [{ entityId: 'comp-1', label: 'Horizex Real Estate Corp', subtitle: 'Main Company' }];
    }
    // Fallback to resolver search or default
    const fallback = notesHubService.searchEntities(form.entityType, '');
    return fallback.length > 0
      ? fallback
      : [{ entityId: '0', label: 'General / All', subtitle: '' }];
  }, [form.entityType, tenantsData, propertiesData, leasesData, companiesData]);

  // Handle Note Submission
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a note title');
      return;
    }

    try {
      const payload = {
        title: form.title,
        content: form.content,
        entityType: form.entityType,
        entityId: form.entityId || '0',
        targetType: form.entityType,
        targetId: form.entityId || '0',
        category: form.category,
        priority: form.priority,
        isPinned: form.isPinned,
        isPrivate: form.isPrivate,
        companyId: selectedCompanyId && selectedCompanyId !== 'all' ? selectedCompanyId : undefined,
        mentions: form.mentions
          ? (typeof form.mentions === 'string' ? form.mentions.split(',').map((m) => m.trim()).filter(Boolean) : form.mentions)
          : [],
      };

      if (editingNote) {
        await updateNoteMutation({
          id: editingNote.id,
          ...payload,
        }).unwrap();
      } else {
        await createNoteMutation(payload).unwrap();
      }

      setShowCreate(false);
      setEditingNote(null);
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
    } catch (err) {
      console.error('Failed to save note:', err);
      const errorMsg =
        err?.data?.message ||
        err?.error ||
        err?.message ||
        'Server se connect nahi ho pa raha hai. Kripya check karein ki Backend Server running hai.';
      alert('Error saving note: ' + errorMsg);
    }
  };

  if (!canView) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[32px] border border-slate-100 shadow-2xl p-16 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3 uppercase">Access Restricted</h2>
          <p className="text-slate-500 max-w-sm font-medium">
            You do not have permission to view Notes Hub. Contact your administrator.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
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
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
          {canAdd && (
            <Button onClick={handleOpenCreate} className="flex items-center gap-2">
              <Plus size={16} /> New Note
            </Button>
          )}
        </div>

        {isNotesLoading ? (
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
              notes={paginatedNotes}
              categories={config.categories}
              priorities={config.priorities}
              onTogglePin={handleTogglePin}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteNote}
            />

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-[22px] shadow-sm">
                <span className="text-xs font-semibold text-slate-500">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredNotes.length)} of {filteredNotes.length} notes
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={`text-xs px-3 py-1.5 h-8 font-bold ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 7) return true;
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const hasGap = prevPage && page - prevPage > 1;
                      return (
                        <React.Fragment key={page}>
                          {hasGap && <span className="text-xs text-slate-400 px-1">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                              currentPage === page
                                ? 'bg-zinc-900 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  <Button
                    variant="secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={`text-xs px-3 py-1.5 h-8 font-bold ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StickyNote size={18} className="text-indigo-600" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {editingNote ? 'Edit Note' : 'Create Note'}
                </h2>
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
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Saving...' : (editingNote ? 'Update Note' : 'Save Note')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NotesHub;
