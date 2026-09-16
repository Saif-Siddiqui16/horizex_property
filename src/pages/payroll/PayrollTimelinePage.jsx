import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, Calendar, History, User } from 'lucide-react';
import payrollTimelineService from '../../services/payrollTimelineService';

export const PayrollTimelinePage = () => {
  const [events, setEvents] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    eventType: ''
  });

  const loadData = () => {
    const compId = localStorage.getItem('global_selected_company_id') || '';
    const list = payrollTimelineService.getAll({ ...filters, companyId: compId });
    setEvents(list);
  };

  useEffect(() => {
    loadData();
    const handleCompanyChange = () => loadData();
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [filters]);

  const getEventBadgeColor = (type) => {
    switch (type) {
      case 'Attendance Updated': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Leave Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Leave Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Payroll Generated': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Salary Updated': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'Payslip Generated': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'Status Changed': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <MainLayout title="Payroll Audit Logs">
      <div className="flex flex-col gap-6">
        
        {/* Header Filter Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-card">
          <div className="flex flex-col gap-0.5">
            <h4 className="font-bold text-slate-800 text-sm">Append-Only Audit Logs</h4>
            <span className="text-xs text-slate-400">Chronological history of workflow changes, updates, and payroll generations. Records cannot be deleted.</span>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={filters.eventType} 
              onChange={(e) => setFilters(p => ({ ...p, eventType: e.target.value }))}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none font-semibold focus:border-blue-100"
            >
              <option value="">All Event Types</option>
              <option value="Attendance Updated">Attendance Updated</option>
              <option value="Leave Approved">Leave Approved</option>
              <option value="Leave Rejected">Leave Rejected</option>
              <option value="Payroll Generated">Payroll Generated</option>
              <option value="Salary Updated">Salary Updated</option>
              <option value="Payslip Generated">Payslip Generated</option>
              <option value="Status Changed">Status Changed</option>
            </select>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-card flex flex-col gap-6">
          <div className="relative pl-6 border-l border-slate-100 flex flex-col gap-8">
            {events.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No payroll timeline events found
              </div>
            ) : (
              events.map((evt, idx) => (
                <div key={evt.id} className="relative group flex flex-col gap-1.5">
                  {/* Circle Pinpoint */}
                  <div className="absolute left-[-29px] top-1.5 w-3 h-3 rounded-full border bg-white border-slate-300" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border uppercase ${getEventBadgeColor(evt.eventType)}`}>
                        {evt.eventType}
                      </span>
                      {evt.employeeName && (
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          {evt.employeeName}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono font-semibold">
                      {new Date(evt.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-1">
                    {evt.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold tracking-tight mt-1 border-t border-slate-50/60 pt-1">
                    <span>Actor: {evt.createdBy}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default PayrollTimelinePage;
