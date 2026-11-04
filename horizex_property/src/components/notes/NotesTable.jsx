import React from 'react';
import { Link } from 'react-router-dom';
import { Pin, MessageSquare, Paperclip, Lock, Eye, Trash2, Edit2 } from 'lucide-react';
import { EntityBadge } from './EntityBadge';
import { NOTE_CATEGORIES, NOTE_PRIORITIES } from '../../constants/notes';

export const NotesTable = ({
  notes = [],
  categories = NOTE_CATEGORIES,
  priorities = NOTE_PRIORITIES,
  onTogglePin,
  onEdit,
  onDelete,
}) => {
  if (!notes.length) {
    return (
      <div className="py-16 text-center text-sm font-semibold text-slate-400 bg-white rounded-[22px] border border-slate-200">
        No notes match your filters.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Meta</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {notes.map((note) => {
              const cat = categories[note.category] || {};
              const pri = priorities[note.priority] || {};
              return (
                <tr key={note.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-2">
                      {note.isPinned && <Pin size={12} className="text-orange-500 mt-1 shrink-0" />}
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{note.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{note.noteNumber}</p>
                      </div>
                      {note.isPrivate && <Lock size={12} className="text-slate-400 mt-1 shrink-0" />}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <EntityBadge entity={note.entity} compact />
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${cat.color || ''}`}>
                      {cat.label || note.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${pri.color || ''}`}>
                      {pri.label || note.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1 text-[10px] font-bold">
                        <MessageSquare size={11} /> {note.commentCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold">
                        <Paperclip size={11} /> {note.attachmentCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-600">{note.createdBy}</td>
                  <td className="px-5 py-4 text-right text-[11px] font-medium text-slate-500">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onTogglePin && (
                        <button
                          type="button"
                          onClick={() => onTogglePin(note)}
                          title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            note.isPinned
                              ? 'text-orange-500 bg-orange-50 hover:bg-orange-100'
                              : 'text-slate-400 hover:text-orange-500 hover:bg-slate-100'
                          }`}
                        >
                          <Pin size={13} className={note.isPinned ? 'fill-orange-500' : ''} />
                        </button>
                      )}
                      <Link
                        to={`/notes-hub/${note.id}`}
                        title="View Note Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center justify-center"
                      >
                        <Eye size={14} />
                      </Link>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(note)}
                          title="Edit Note"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(note.id)}
                          title="Delete Note"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotesTable;
