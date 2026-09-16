import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const EntityBadge = ({ entity, compact = false }) => {
  if (!entity) return null;

  const content = (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-bold border rounded-full',
        compact ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1',
        entity.color || 'bg-slate-100 text-slate-600 border-slate-200'
      )}
    >
      <span>{entity.typeLabel}</span>
      <span className="opacity-70">·</span>
      <span className="truncate max-w-[120px]">{entity.label}</span>
    </span>
  );

  if (entity.route && entity.exists) {
    return (
      <Link to={entity.route} className="no-underline hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

export default EntityBadge;
