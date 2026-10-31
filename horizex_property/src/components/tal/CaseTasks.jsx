import React, { useState } from 'react';
import { Card } from '../Card';
import { Plus, Check, Trash2, Calendar, User, ClipboardList, ShieldAlert, X } from 'lucide-react';
import { TaskStatusBadge } from './TaskStatusBadge';
import { Button } from '../Button';
import { TASK_PRIORITIES } from '../../mock/talCases';

export const CaseTasks = ({ tasks = [], onAddTask, onCompleteTask, onDeleteTask }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('Admin User');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    onAddTask({
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      status: 'Pending'
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('MEDIUM');
    setShowAddForm(false);
  };

  const getPriorityStyle = (priorityName) => {
    const config = Object.values(TASK_PRIORITIES).find(
      p => p.label.toLowerCase() === (priorityName || '').toLowerCase()
    );
    return config?.color || 'bg-slate-100 text-slate-700';
  };

  return (
    <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">Legal Tasks & Follow-ups</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Tasks linked directly to this TAL Case file</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-[10px] font-black uppercase tracking-wider py-1.5 h-8.5"
        >
          {showAddForm ? 'Cancel' : 'Add Task'}
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 mb-5 space-y-3.5">
          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
            <ClipboardList size={12} />
            Create Case Task
          </h4>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                required
                placeholder="Task Title... (e.g. File evidence document)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Task Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Assignee</label>
                <input
                  type="text"
                  required
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
                >
                  {Object.keys(TASK_PRIORITIES).map(k => (
                    <option key={k} value={k}>{TASK_PRIORITIES[k].label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              variant="primary"
              className="text-[10px] font-black uppercase tracking-wider px-4 py-2"
            >
              Save Task
            </Button>
          </div>
        </form>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="py-6 text-center text-xs font-semibold text-slate-400">
          No tasks assigned to this case.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
          {tasks.map((task) => (
            <div key={task.id} className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-all">
              <div className="flex items-start gap-3 min-w-0">
                {task.status === 'COMPLETED' ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                ) : (
                  <button
                    onClick={() => onCompleteTask(task.id)}
                    title="Mark Complete"
                    className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-center text-transparent hover:text-indigo-600 shrink-0 mt-0.5 transition-all"
                  >
                    <Check size={10} />
                  </button>
                )}
                <div className="min-w-0">
                  <p className={`text-xs font-bold text-slate-700 ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2.5 mt-1 text-[9px] text-slate-400 font-bold flex-wrap">
                    <TaskStatusBadge status={task.status} />
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <User size={10} />
                      {task.assignedTo}
                    </span>
                    <span className="flex items-center gap-0.5 font-mono">
                      <Calendar size={10} />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                title="Delete Task"
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
export default CaseTasks;
