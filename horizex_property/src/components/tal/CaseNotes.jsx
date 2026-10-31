import React, { useState } from 'react';
import { Card } from '../Card';
import { Send, FileText, User, Calendar } from 'lucide-react';

export const CaseNotes = ({ notes = [], onAddNote }) => {
  const [noteText, setNoteText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    onAddNote({
      text: noteText,
      author: 'Admin User',
      timestamp: new Date().toISOString()
    });

    setNoteText('');
  };

  return (
    <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm">
      <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-1">Internal Legal Notes</h3>
      <p className="text-[10px] text-slate-400 font-medium mb-4">Confidential strategy and manager comments</p>

      {/* Notes Form */}
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="relative">
          <textarea
            required
            rows={3}
            placeholder="Add internal counsel notes or case update comments..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full p-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 text-slate-700 placeholder:text-slate-400 resize-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-3.5 bottom-4 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shrink-0"
          >
            <Send size={12} />
          </button>
        </div>
      </form>

      {/* Notes Stream */}
      {notes.length === 0 ? (
        <div className="py-6 text-center text-xs font-semibold text-slate-400">
          No internal notes logged.
        </div>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {[...notes].reverse().map((note) => (
            <div key={note.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
              <p className="text-xs text-slate-700 font-medium whitespace-pre-line">{note.text}</p>
              
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold border-t border-slate-200/40 pt-1.5">
                <div className="flex items-center gap-1">
                  <User size={10} className="shrink-0" />
                  <span>{note.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={10} className="shrink-0" />
                  <span>{new Date(note.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
export default CaseNotes;
