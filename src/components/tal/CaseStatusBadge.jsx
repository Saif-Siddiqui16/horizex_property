import React from 'react';
import { TAL_CASE_STATUSES } from '../../mock/talCases';

export const CaseStatusBadge = ({ status, size = 'md' }) => {
  const config = Object.values(TAL_CASE_STATUSES).find(
    s => s.label.toLowerCase() === (status || '').toLowerCase()
  ) || { label: status || 'Unknown', color: 'bg-slate-100 text-slate-700' };

  return (
    <span className={`font-black uppercase tracking-wider rounded-full border shrink-0 ${
      size === 'sm'
        ? 'px-1.5 py-0.5 text-[8px]'
        : 'px-2.5 py-1 text-[10px]'
    } ${config.color}`}>
      {config.label}
    </span>
  );
};
export default CaseStatusBadge;
