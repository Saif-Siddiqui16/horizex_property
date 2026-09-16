import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { hasPermission } from '../utils/permissions';
import { notesHubService } from '../services/notesHubService';
import { EntityBadge } from '../components/notes/EntityBadge';
import { CommunicationTimeline } from '../components/notes/CommunicationTimeline';
import { NOTE_CATEGORIES, NOTE_PRIORITIES } from '../mock/notes';
import {
  ArrowLeft,
  Pin,
  Lock,
  MessageSquare,
  Paperclip,
  Send,
  Trash2,
  ShieldAlert,
} from 'lucide-react';

export const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [fileName, setFileName] = useState('');

  const canView = hasPermission('Notes Hub', 'view');
  const canEdit = hasPermission('Notes Hub', 'edit');
  const canDelete = hasPermission('Notes Hub', 'delete');

  const loadNote = () => {
    try {
      setLoading(true);
      const data = notesHubService.getNoteDetail(id);
      setNote(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNote();
  }, [id]);

  useEffect(() => {
    const handleCompanyChange = () => loadNote();
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [id]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    notesHubService.addComment(id, commentText);
    setCommentText('');
    loadNote();
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    notesHubService.uploadAttachment(id, {
      name: fileName,
      type: ext,
      size: '1 KB',
    });
    setFileName('');
    loadNote();
  };

  const handleTogglePin = () => {
    notesHubService.togglePin(id);
    loadNote();
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this note permanently?')) return;
    notesHubService.deleteNote(id);
    navigate('/notes-hub');
  };

  if (!canView) {
    return (
      <MainLayout title="Access Denied">
        <div className="text-center py-20 text-slate-500 font-medium">Access restricted.</div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout title="Note Detail">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      </MainLayout>
    );
  }

  if (!note) {
    return (
      <MainLayout title="Note Not Found">
        <div className="text-center py-20">
          <ShieldAlert size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium mb-4">Note not found or not visible for selected company.</p>
          <Link to="/notes-hub" className="text-indigo-600 font-bold text-sm no-underline">
            ← Back to Notes Hub
          </Link>
        </div>
      </MainLayout>
    );
  }

  const cat = NOTE_CATEGORIES[note.category] || {};
  const pri = NOTE_PRIORITIES[note.priority] || {};

  return (
    <MainLayout title="Note Detail">
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
                  {cat.label}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${pri.color || ''}`}>
                  {pri.label}
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
                    className="absolute right-3 bottom-3 p-1.5 bg-indigo-600 text-white rounded-xl"
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
    </MainLayout>
  );
};

export default NoteDetail;
