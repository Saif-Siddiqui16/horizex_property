import React from 'react';
import { Card } from '../Card';
import { ClipboardList, AlertCircle, Calendar, User, ArrowRight } from 'lucide-react';
import { TaskStatusBadge } from './TaskStatusBadge';

export const DashboardTasksWidget = ({ tasks = [], onCompleteTask }) => {
  return (
    <Card className="h-fit">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">Urgent Legal Tasks</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Tasks requires immediate follow-up action</p>
          </div>
          <ClipboardList size={16} className="text-rose-500 shrink-0" />
        </div>

        {tasks.length === 0 ? (
          <div className="py-2 text-center text-xs text-slate-400 font-medium">
            No urgent or overdue tasks found.
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-rose-50/30 rounded-2xl border border-rose-100/50 flex items-start justify-between gap-3 hover:bg-rose-50/50 transition-colors"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <AlertCircle size={12} className="text-rose-500 shrink-0" />
                    <span className="truncate">{task.title}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{task.description}</p>
                  
                  <div className="flex items-center gap-2 mt-2 text-[9px] text-slate-400 font-bold flex-wrap">
                    <TaskStatusBadge status={task.status} />
                    <span className="flex items-center gap-0.5 font-mono text-rose-600">
                      <Calendar size={10} />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <User size={10} />
                      {task.assignedTo}
                    </span>
                  </div>
                </div>

                {onCompleteTask && (
                  <button
                    onClick={() => onCompleteTask(task.id)}
                    className="p-1 hover:bg-rose-100 rounded-lg text-rose-500 hover:text-rose-600 transition-colors shrink-0"
                    title="Mark Completed"
                  >
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
export default DashboardTasksWidget;
