import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ArrowLeft, User, Calendar, DollarSign, Clock, FileText, ClipboardList, Scale, Download, Shield, ShieldAlert, CheckCircle, Edit2 } from 'lucide-react';
import { talCaseService, taskService, ledgerService } from '../mock/mockServices';
import { TAL_CASE_STATUSES, TAL_CASE_PRIORITIES } from '../mock/talCases';
import { CaseSummaryCard } from '../components/tal/CaseSummaryCard';
import { LegalTimeline } from '../components/tal/LegalTimeline';
import { CaseDocuments } from '../components/tal/CaseDocuments';
import { CaseNotes } from '../components/tal/CaseNotes';
import { CaseTasks } from '../components/tal/CaseTasks';
import { CaseHearingList } from '../components/tal/CaseHearingList';
import api from '../api/client';

export const TALCaseDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState(null);

  // Profile data states
  const [tenant, setTenant] = useState(null);
  const [lease, setLease] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);

  // Role Permissions state
  const [activeRole, setActiveRole] = useState(localStorage.getItem('tal_role_override') || 'Super Admin');

  // Status Change State
  const [showStatusTransition, setShowStatusTransition] = useState(false);

  const loadCaseDetail = async () => {
    try {
      setLoading(true);
      const data = talCaseService.getById(id);
      if (!data) return;

      setCaseData(data);

      const [tenantRes, leaseRes] = await Promise.all([
        api.get(`/api/admin/tenants/${data.tenantId}`).catch(() => null),
        api.get(`/api/admin/leases/${data.leaseId}`).catch(() => null)
      ]);

      if (tenantRes?.data) setTenant(tenantRes.data);
      if (leaseRes?.data) setLease(leaseRes.data);

      setLedgerData(ledgerService.getLedger(data.tenantId));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseDetail();
  }, [id]);

  // Actions
  const handleAddHearing = (hearing) => {
    talCaseService.addHearing(id, hearing);
    loadCaseDetail();
  };

  const handleUploadDocument = (doc) => {
    talCaseService.addDocument(id, doc);
    loadCaseDetail();
  };

  const handleDeleteDocument = (docId) => {
    talCaseService.deleteDocument(id, docId);
    loadCaseDetail();
  };

  const handleAddNote = (note) => {
    talCaseService.addNote(id, note);
    loadCaseDetail();
  };

  const handleAddTask = (task) => {
    const taskPayload = {
      ...task,
      entityType: 'TAL_CASE',
      entityId: parseInt(id),
      companyId: caseData.companyId || 1,
      propertyId: caseData.propertyId || 3,
      propertyName: caseData.propertyName || 'Greenfield Commons',
      unitId: caseData.unitId || 3,
      unitNumber: caseData.unitNumber || 'Apt 301',
      tenantId: caseData.tenantId || 103,
      tenantName: caseData.tenantName || 'John Doe',
      leaseId: caseData.leaseId || 3
    };

    taskService.create(taskPayload);
    loadCaseDetail();
  };

  const handleCompleteTask = (taskId) => {
    taskService.markComplete(taskId);
    loadCaseDetail();
  };

  const handleDeleteTask = (taskId) => {
    taskService.delete(taskId);
    loadCaseDetail();
  };

  const handleStatusChange = (newStatus) => {
    try {
      talCaseService.update(id, { status: newStatus });
      loadCaseDetail();
      setShowStatusTransition(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleBack = () => {
    window.location.href = '/tal-cases';
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    localStorage.setItem('tal_role_override', role);
  };

  // Permissions helper
  const canModify = ['Super Admin', 'Property Manager'].includes(activeRole);
  const canUpdateHearings = ['Super Admin', 'Property Manager', 'Lawyer'].includes(activeRole);
  const isReadOnly = activeRole === 'Read Only';
  const isLawyer = activeRole === 'Lawyer';

  // Export functions
  const handleExportReport = (format) => {
    if (!caseData) return;
    const reportTitle = `TAL_Case_Report_${caseData.caseNumber}`;
    
    if (format === 'CSV') {
      const rows = [
        ['Field', 'Value'],
        ['Case Number', caseData.caseNumber],
        ['Tenant Name', caseData.tenantName],
        ['Property', caseData.propertyName],
        ['Unit', caseData.unitNumber],
        ['Case Type', caseData.caseType || 'Other'],
        ['Current Status', caseData.status],
        ['Priority', caseData.priority],
        ['Monthly Rent', `$${caseData.monthlyRent || 0}`],
        ['Outstanding Rent', `$${caseData.outstandingRent || 0}`],
        ['Filing Fee', `$${caseData.filingFee || 0}`],
        ['Legal Fees', `$${caseData.legalFees || 0}`],
        ['Amount Claimed', `$${caseData.amountClaimed || 0}`],
        ['Recovered Amount', `$${caseData.recoveredAmount || 0}`],
        ['Outstanding Balance', `$${(caseData.amountClaimed || 0) - (caseData.recoveredAmount || 0)}`],
        ['Payment Status', caseData.paymentStatus || 'Unpaid']
      ];
      
      const csvContent = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportTitle}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Exporting case report as ${format}. (Simulated download complete)`);
    }
  };

  return (
    <MainLayout title="TAL Legal Case File Details">
      <div className="flex flex-col gap-6 p-6">
        
        {/* Header Action Row */}
        <div className="flex justify-between items-center bg-white p-4 rounded-[22px] border border-slate-200 shadow-sm flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleBack} className="text-xs font-bold">
              <ArrowLeft size={16} className="mr-1.5" />
              Back to Case List
            </Button>

            {/* Developer Permission Switcher */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Simulate Role:</span>
              <select
                value={activeRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 outline-none"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Property Manager">Property Manager</option>
                <option value="Lawyer">Lawyer</option>
                <option value="Staff">Staff</option>
                <option value="Read Only">Read Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              onChange={(e) => handleExportReport(e.target.value)}
              className="text-[10px] font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 outline-none"
              defaultValue=""
            >
              <option value="" disabled>Export Report...</option>
              <option value="PDF">Export PDF</option>
              <option value="CSV">Export CSV</option>
              <option value="Excel">Export Excel</option>
            </select>

            <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono hidden sm:inline">
              TAL Legal File
            </span>
          </div>
        </div>

        {loading || !caseData ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Stepper Status Workflow Panel */}
            <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm overflow-x-auto no-scrollbar">
              <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4 flex items-center justify-between">
                <span>TAL Legal Status Flow Stepper</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase font-mono bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                  Current Status: {caseData.status}
                </span>
              </h3>
              
              <div className="flex items-center gap-3 min-w-[900px] py-2">
                {Object.keys(TAL_CASE_STATUSES).map((k, idx) => {
                  const stepConfig = TAL_CASE_STATUSES[k];
                  const currentStep = Object.values(TAL_CASE_STATUSES).find(s => s.label === caseData.status);
                  const isCompleted = currentStep ? stepConfig.step < currentStep.step : false;
                  const isCurrent = stepConfig.label === caseData.status;

                  let bulletColor = 'bg-slate-200 text-slate-500 border-slate-300';
                  if (isCompleted) {
                    bulletColor = 'bg-emerald-500 text-white border-emerald-600';
                  } else if (isCurrent) {
                    bulletColor = 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-100';
                  }

                  return (
                    <div key={k} className="flex-1 flex flex-col items-center text-center relative group">
                      {/* Connector Line */}
                      {idx > 0 && (
                        <div className={`absolute right-1/2 top-4 w-full h-0.5 -translate-y-1/2 z-0 ${
                          isCompleted || isCurrent ? 'bg-emerald-500' : 'bg-slate-100'
                        }`} />
                      )}
                      
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs z-10 transition-all ${bulletColor}`}>
                        {idx + 1}
                      </div>
                      
                      <span className={`text-[9px] font-black uppercase tracking-wider mt-2 block ${
                        isCurrent ? 'text-indigo-600 font-black' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {stepConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Summary + Stepper + Finances */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Case Summary Panel */}
                <div className="relative">
                  <CaseSummaryCard caseData={caseData} />
                  
                  {/* Status Transition Control (Role Checked) */}
                  {canModify && (
                    <div className="absolute right-6 bottom-6">
                      <Button
                        variant="secondary"
                        onClick={() => setShowStatusTransition(!showStatusTransition)}
                        className="text-[10px] font-black uppercase tracking-wider py-1 h-8 bg-white/20 text-white border-white/20 hover:bg-white/30"
                      >
                        Transition Status
                      </Button>

                      {showStatusTransition && (
                        <div className="absolute right-0 bottom-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-1 flex flex-col text-left">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-1.5 border-b border-slate-100">Move Workflow to:</h4>
                          {Object.keys(TAL_CASE_STATUSES).map((k) => {
                            const val = TAL_CASE_STATUSES[k].label;
                            if (val === caseData.status) return null;
                            return (
                              <button
                                key={k}
                                onClick={() => handleStatusChange(val)}
                                className="px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Workflow Automated Next Action Card */}
                <Card className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-[22px] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-mono">
                      Workflow Engine: Next Action Directive
                    </span>
                    <h4 className="text-sm font-black text-slate-800">
                      {Object.values(TAL_CASE_STATUSES).find(s => s.label === caseData.status)?.nextAction || 'Complete case information'}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Filing Target Due Date: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')}
                    </p>
                  </div>
                  {caseData.priority === 'Urgent' && (
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase rounded-full bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                      Urgent Action Required
                    </span>
                  )}
                </Card>

                {/* Financial Summary Card */}
                <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm">
                  <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-indigo-600" />
                    TAL Dispute Financial Statement
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Monthly Rent</span>
                      <span className="text-base font-black text-slate-800 font-mono mt-1 block">${caseData.monthlyRent || 1200}</span>
                    </div>
                    
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Outstanding Rent</span>
                      <span className="text-base font-black text-rose-600 font-mono mt-1 block">${caseData.outstandingRent || 0}</span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Filing & Legal Fees</span>
                      <span className="text-base font-black text-slate-800 font-mono mt-1 block">${(caseData.filingFee || 0) + (caseData.legalFees || 0)}</span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Total Claim Amount</span>
                      <span className="text-base font-black text-indigo-600 font-mono mt-1 block">${caseData.amountClaimed || 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-100 mt-4 pt-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Recovered Amount</span>
                        <span className="text-xs font-bold text-slate-700 font-mono block mt-0.5">${caseData.recoveredAmount || 0}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-200" />
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Outstanding Balance</span>
                        <span className="text-xs font-black text-rose-600 font-mono block mt-0.5">
                          ${(caseData.amountClaimed || 0) - (caseData.recoveredAmount || 0)}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-md">
                      Payment Status: {caseData.paymentStatus || 'Unpaid'}
                    </span>
                  </div>
                </Card>
                
                {/* Case Hearings Schedule */}
                <CaseHearingList hearings={caseData.hearings} onAddHearing={canUpdateHearings ? handleAddHearing : () => alert('Unauthorized')} />
                
                {/* Reusable Tasks Lists */}
                <CaseTasks
                  tasks={caseData.tasks}
                  onAddTask={canModify ? handleAddTask : () => alert('Unauthorized')}
                  onCompleteTask={!isReadOnly ? handleCompleteTask : () => alert('Unauthorized')}
                  onDeleteTask={canModify ? handleDeleteTask : () => alert('Unauthorized')}
                />

                {/* Audit Logs Table */}
                <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm">
                  <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-1">Immutable Audit Log</h3>
                  <p className="text-[10px] text-slate-400 font-medium mb-4">Chronological log of edits and status logs</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-2 font-black text-slate-400 uppercase">Timestamp</th>
                          <th className="px-4 py-2 font-black text-slate-400 uppercase">User</th>
                          <th className="px-4 py-2 font-black text-slate-400 uppercase">Action</th>
                          <th className="px-4 py-2 font-black text-slate-400 uppercase">Field</th>
                          <th className="px-4 py-2 font-black text-slate-400 uppercase">Old Value</th>
                          <th className="px-4 py-2 font-black text-slate-400 uppercase">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                        {(caseData.auditLog || []).map((log, idx) => (
                          <tr key={log.id || idx}>
                            <td className="px-4 py-2 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-2 font-bold text-slate-700">{log.user}</td>
                            <td className="px-4 py-2">{log.action}</td>
                            <td className="px-4 py-2 font-mono">{log.field}</td>
                            <td className="px-4 py-2 text-rose-600 font-mono truncate max-w-[100px]">{log.oldValue}</td>
                            <td className="px-4 py-2 text-emerald-600 font-mono truncate max-w-[100px]">{log.newValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Right Column: Docs + Notes + Timeline */}
              <div className="space-y-6">
                <CaseDocuments
                  documents={caseData.documents}
                  onUpload={!isReadOnly ? handleUploadDocument : () => alert('Unauthorized')}
                  onDelete={canModify ? handleDeleteDocument : () => alert('Unauthorized')}
                />
                <CaseNotes notes={caseData.notes} onAddNote={!isReadOnly ? handleAddNote : () => alert('Unauthorized')} />
                <LegalTimeline timeline={caseData.timeline} />
              </div>

            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
