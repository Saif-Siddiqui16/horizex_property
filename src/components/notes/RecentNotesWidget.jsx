import React from 'react';
import { Link } from 'react-router-dom';
import { Pin } from 'lucide-react';
import { Card } from '../Card';
import { EntityBadge } from './EntityBadge';

export const RecentNotesWidget = ({ notes = [], title = 'Recent Notes' }) => (
  <Card className="h-fit">
    <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4">{title}</h3>
    {!notes.length ? (
      <p className="text-xs text-slate-400 font-medium text-center py-2">No notes yet.</p>
    ) : (
      <div className="space-y-3">
        {notes.map((note) => (
          <Link
            key={note.id}
            to={`/notes-hub/${note.id}`}
            className="block p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all no-underline"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-slate-800 line-clamp-1">{note.title}</p>
              {note.isPinned && <Pin size={11} className="text-orange-500 shrink-0" />}
            </div>
            <div className="mt-2">
              <EntityBadge entity={note.entity} compact />
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-wider">
              {note.createdBy} · {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    )}
  </Card>
);

export default RecentNotesWidget;
