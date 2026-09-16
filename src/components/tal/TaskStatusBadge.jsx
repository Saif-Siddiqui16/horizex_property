import React from 'react';
import { TASK_STATUSES } from '../../mock/talCases';

export const TaskStatusBadge = ({ status }) => {
  const config = Object.values(TASK_STATUSES).find(
    s => s.label.toLowerCase() === (status || '').toLowerCase()
  ) || { label: status || 'Unknown', color: 'bg-slate-100 text-slate-700' };

  return (
    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${config.color}`}>
      {config.label}
    </span>
  );
};
export default TaskStatusBadge;
