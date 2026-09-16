import React from 'react';
import { StickyNote, Pin, MessageSquare, Paperclip, AtSign, Clock } from 'lucide-react';

export const NotesKPICards = ({ stats = {} }) => {
  const cards = [
    { title: 'Total Notes', value: stats.totalNotes ?? 0, icon: StickyNote, color: 'bg-blue-500' },
    { title: 'Pinned', value: stats.pinnedNotes ?? 0, icon: Pin, color: 'bg-orange-500' },
    { title: 'Comments', value: stats.totalComments ?? 0, icon: MessageSquare, color: 'bg-violet-500' },
    { title: 'Attachments', value: stats.totalAttachments ?? 0, icon: Paperclip, color: 'bg-emerald-500' },
    { title: 'Mentions', value: stats.totalMentions ?? 0, icon: AtSign, color: 'bg-amber-500' },
    { title: 'This Week', value: stats.recentCount ?? 0, icon: Clock, color: 'bg-indigo-500' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white p-4 rounded-[22px] border border-slate-200 shadow-sm flex flex-col gap-2"
        >
          <div className={`w-9 h-9 ${card.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
            <card.icon size={16} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
          <p className="text-xl font-black text-slate-800">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default NotesKPICards;
