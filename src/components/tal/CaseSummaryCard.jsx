import React from 'react';
import { Card } from '../Card';
import { CaseStatusBadge } from './CaseStatusBadge';
import { TAL_CASE_PRIORITIES } from '../../mock/talCases';
import { Shield, User, Scale, FileText } from 'lucide-react';

export const CaseSummaryCard = ({ caseData = {} }) => {
  const getPriorityStyle = (priority) => {
    const config = Object.values(TAL_CASE_PRIORITIES).find(
      p => p.label.toLowerCase() === (priority || '').toLowerCase()
    );
    return config?.color || 'bg-slate-100 text-slate-700';
  };

  return (
    <Card className="p-6 bg-slate-900 text-white rounded-[26px] shadow-lg flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none" />

      <div>
        <div className="flex justify-between items-start gap-4 flex-wrap mb-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-widest uppercase">
              {caseData.caseNumber}
            </span>
            <h2 className="text-lg font-black tracking-tight mt-0.5">{caseData.subject || 'Legal Dispute'}</h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <CaseStatusBadge status={caseData.status} />
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${getPriorityStyle(caseData.priority)}`}>
              {caseData.priority}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-medium mb-6">
          {caseData.caseSummary || 'No case summary description provided.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 shrink-0">
              <User size={15} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Manager</p>
              <p className="text-xs font-bold text-slate-200">{caseData.assignedManagerName || 'Unassigned'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 shrink-0">
              <Scale size={15} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Counsel Lawyer</p>
              <p className="text-xs font-bold text-slate-200">{caseData.assignedLawyerName || 'Unassigned'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 shrink-0">
              <FileText size={15} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Filing Date</p>
              <p className="text-xs font-bold text-slate-200 font-mono">
                {caseData.filedDate ? new Date(caseData.filedDate).toLocaleDateString('en-CA') : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
export default CaseSummaryCard;
