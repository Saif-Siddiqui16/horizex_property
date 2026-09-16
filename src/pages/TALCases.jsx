import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Search, Plus, Filter, Gavel, Calendar, ClipboardList, TrendingUp, X, Download, FileText } from 'lucide-react';
import {
  talCaseService,
  taskService,
  legalAnalyticsService
} from '../mock/mockServices';
import { TAL_CASE_STATUSES, TAL_CASE_PRIORITIES, mockLawyers } from '../mock/talCases';
import { TALKPICards } from '../components/tal/TALKPICards';
import { CaseTable } from '../components/tal/CaseTable';
import { CaseStatusChart } from '../components/tal/CaseStatusChart';
import { UpcomingHearingsWidget } from '../components/tal/UpcomingHearingsWidget';
import { UrgentCasesWidget } from '../components/tal/UrgentCasesWidget';
import { HearingCalendarWidget } from '../components/tal/HearingCalendarWidget';
import { DashboardTasksWidget } from '../components/tal/DashboardTasksWidget';
import api from '../api/client';

export const TALCases = ({ defaultTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);

  // Data States
  const [cases, setCases] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [urgentCases, setUrgentCases] = useState([]);

  // Form selections dropdown data
  const [leases, setLeases] = useState([]);
  const [lawyers, setLawyers] = useState(mockLawyers);
  const [properties, setProperties] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedHearingDate, setSelectedHearingDate] = useState('');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form Fields
  const [formLeaseId, setFormLeaseId] = useState('');
  const [formLawyerId, setFormLawyerId] = useState('');
  const [formCaseType, setFormCaseType] = useState('Non-Payment of Rent');
  const [formReason, setFormReason] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [formDescription, setFormDescription] = useState('');
  const [formAmountOwed, setFormAmountOwed] = useState('');
  const [formExpectedFilingDate, setFormExpectedFilingDate] = useState('');
  const [formInternalNotes, setFormInternalNotes] = useState('');

  const loadData = () => {
    try {
      setLoading(true);
      const caseList = talCaseService.getAll();
      setCases(caseList);

      setMetrics(legalAnalyticsService.getMetrics());
      setStatusBreakdown(legalAnalyticsService.getCasesByStatus());
      setUpcomingHearings(legalAnalyticsService.getUpcomingHearings(30));
      setOverdueTasks(legalAnalyticsService.getOverdueTasks());

      const summary = legalAnalyticsService.getDashboardSummary();
      setUrgentCases(summary.urgentCases || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [leaseRes, propRes] = await Promise.all([
        api.get('/api/admin/leases'),
        api.get('/api/admin/properties')
      ]);
      setLeases(leaseRes.data?.data || leaseRes.data || []);
      setProperties(propRes.data?.data || propRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    loadDropdownData();
  }, []);

  useEffect(() => {
    const handleCompanyChange = () => {
      loadData();
      loadDropdownData();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Filter & Search logic
  const filteredCases = cases.filter(c => {
    const matchesSearch =
      (c.caseNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.propertyName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.unitNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.assignedLawyerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.subject || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !selectedStatus || 
      (selectedStatus === 'Open' ? !['Closed', 'Archived'].includes(c.status) : c.status === selectedStatus);
    const matchesPriority = !selectedPriority || c.priority.toUpperCase() === selectedPriority.toUpperCase();
    const matchesLawyer = !selectedLawyer || c.assignedLawyerId === selectedLawyer;
    const matchesCaseType = !selectedCaseType || c.caseType === selectedCaseType;
    const matchesProperty = !selectedProperty || String(c.propertyId) === selectedProperty;
    const matchesHearingDate = !selectedHearingDate || 
      (c.nextHearingDate && c.nextHearingDate.startsWith(selectedHearingDate));

    return matchesSearch && matchesStatus && matchesPriority && matchesLawyer && matchesCaseType && matchesProperty && matchesHearingDate;
  });

  const handleKPIFilterClick = (type, value) => {
    if (type === 'status') {
      setSelectedStatus(value);
      setSelectedPriority('');
    } else if (type === 'priority') {
      setSelectedPriority(value);
      setSelectedStatus('');
    }
    setActiveTab('cases');
  };

  const handleStatusChange = (caseId, newStatus) => {
    try {
      talCaseService.update(caseId, { status: newStatus });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateCaseSubmit = (e, isDraft = false) => {
    if (e) e.preventDefault();
    if (!formSubject || !formLeaseId || !formLawyerId) {
      alert('Please fill out Subject, Lease, and Lawyer details.');
      return;
    }

    const matchedLease = leases.find(l => l.id === parseInt(formLeaseId));
    const matchedLawyer = lawyers.find(l => l.id === formLawyerId);

    const newCasePayload = {
      companyId: matchedLease?.companyId || 1,
      propertyId: matchedLease?.propertyId || 3,
      propertyName: matchedLease?.propertyName || 'Greenfield Commons',
      unitId: matchedLease?.unitId || 3,
      unitNumber: matchedLease?.unitNumber || 'Apt 301',
      tenantId: matchedLease?.tenantId || 103,
      tenantName: matchedLease?.tenantName || 'John Doe',
      leaseId: matchedLease?.id || 3,
      renewalId: null,

      caseType: formCaseType,
      reason: formReason,
      subject: formSubject,
      caseSummary: formDescription,
      status: isDraft ? 'Draft' : 'Preparing Documents',
      priority: formPriority,
      amountOwed: parseFloat(formAmountOwed || '0'),
      expectedFilingDate: formExpectedFilingDate,
      internalNotes: formInternalNotes,
      
      monthlyRent: matchedLease?.monthlyRent || 1200,
      outstandingRent: parseFloat(formAmountOwed || '0'),
      filingFee: 98,
      legalFees: 350,
      amountClaimed: parseFloat(formAmountOwed || '0') + 98 + 350,
      recoveredAmount: 0,
      paymentStatus: parseFloat(formAmountOwed || '0') > 0 ? 'Unpaid' : 'No Balance',

      filedDate: isDraft ? null : new Date().toLocaleDateString('en-CA'),
      assignedManagerId: 'usr-001',
      assignedManagerName: 'Admin User',
      assignedLawyerId: formLawyerId,
      assignedLawyerName: matchedLawyer?.name || 'Unassigned',
      nextHearingDate: null,
      courtRoom: null,
      judgeId: null,
      judgeName: null
    };

    talCaseService.create(newCasePayload);
    setShowCreateModal(false);
    
    // Reset inputs
    setFormSubject('');
    setFormLeaseId('');
    setFormLawyerId('');
    setFormCaseType('Non-Payment of Rent');
    setFormReason('');
    setFormDescription('');
    setFormPriority('MEDIUM');
    setFormAmountOwed('');
    setFormExpectedFilingDate('');
    setFormInternalNotes('');

    loadData();
  };

  const handleCompleteTask = (taskId) => {
    taskService.markComplete(taskId);
    loadData();
  };

  const handleViewDetail = (id) => {
    window.location.href = `/tal-cases/${id}`;
  };

  const handleExportCSV = () => {
    const headers = ['Case #', 'Tenant', 'Property', 'Unit', 'Case Type', 'Status', 'Priority', 'Amount Claimed', 'Lawyer'];
    const rows = filteredCases.map(c => [
      c.caseNumber,
      c.tenantName,
      c.propertyName,
      c.unitNumber,
      c.caseType || 'Other',
      c.status,
      c.priority,
      `$${c.amountClaimed || 0}`,
      c.assignedLawyerName
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TAL_Cases_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout title="TAL Cases">
      <div className="flex flex-col gap-4">
        
        {/* Subtitle / Header Section */}
        <div className="bg-white px-5 py-3 rounded-[22px] border border-slate-200 shadow-sm">
          <h2 className="text-base font-black text-slate-800 tracking-tight">TAL Legal Disputes Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
            Manage all Tribunal administratif du logement (TAL) legal cases, hearings, legal documents, and tenant disputes.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-3 sm:p-4 rounded-[22px] border border-slate-200 shadow-sm gap-3">
          <div className="grid grid-cols-2 sm:flex gap-2">
            {[
              { id: 'overview', label: 'Case Overview', icon: TrendingUp },
              { id: 'cases', label: 'All Cases', icon: Gavel },
              { id: 'calendar', label: 'Hearings', icon: Calendar },
              { id: 'tasks', label: 'Action Tasks', icon: ClipboardList }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'secondary'}
                onClick={() => setActiveTab(tab.id)}
                className="text-xs font-bold justify-center"
              >
                <tab.icon size={14} className="mr-1 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </Button>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-bold justify-center w-full sm:w-auto"
          >
            <Plus size={16} className="mr-1.5 shrink-0" />
            File TAL Case
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-4">
                <TALKPICards metrics={metrics} onFilterClick={handleKPIFilterClick} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CaseStatusChart statusBreakdown={statusBreakdown} />
                  <UpcomingHearingsWidget hearings={upcomingHearings.slice(0, 3)} />
                  <UrgentCasesWidget cases={urgentCases} onView={handleViewDetail} />
                </div>
              </div>
            )}

            {/* TAL Cases List Grid Tab */}
            {activeTab === 'cases' && (
              <div className="flex flex-col gap-4">
                {/* Search & Filter Toolbar */}
                <div className="bg-white p-4 rounded-[22px] border border-slate-200 shadow-sm flex flex-col gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search Case #, Tenant, Property, Unit or Lawyer..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                    />
                  </div>

                  {/* Dropdowns + Reset */}
                  <div className="grid grid-cols-2 md:flex md:flex-row gap-3">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="Open">Open Cases</option>
                      {Object.keys(TAL_CASE_STATUSES).map(k => (
                        <option key={k} value={TAL_CASE_STATUSES[k].label}>{TAL_CASE_STATUSES[k].label}</option>
                      ))}
                    </select>

                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none"
                    >
                      <option value="">All Priorities</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>

                    <select
                      value={selectedCaseType}
                      onChange={(e) => setSelectedCaseType(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none"
                    >
                      <option value="">All Case Types</option>
                      <option value="Non-Payment of Rent">Non-Payment of Rent</option>
                      <option value="Eviction">Eviction</option>
                      <option value="Lease Termination">Lease Termination</option>
                      <option value="Property Damage">Property Damage</option>
                      <option value="Lease Violation">Lease Violation</option>
                      <option value="Rent Increase Dispute">Rent Increase Dispute</option>
                      <option value="Other">Other</option>
                    </select>

                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none"
                    >
                      <option value="">All Properties</option>
                      {properties.map(p => (
                        <option key={p.id} value={String(p.id)}>{p.name}</option>
                      ))}
                    </select>

                    <select
                      value={selectedLawyer}
                      onChange={(e) => setSelectedLawyer(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none"
                    >
                      <option value="">All Lawyers</option>
                      {lawyers.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>

                    <div className="flex gap-2 col-span-2 md:col-span-1">
                      <Button
                        variant="secondary"
                        onClick={handleExportCSV}
                        className="flex-1 md:w-28 text-xs font-bold rounded-2xl h-11 justify-center"
                        title="Export filtered rows to CSV"
                      >
                        <Download size={14} className="mr-1" /> Export
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSearch('');
                          setSelectedStatus('');
                          setSelectedPriority('');
                          setSelectedLawyer('');
                          setSelectedCaseType('');
                          setSelectedProperty('');
                          setSelectedHearingDate('');
                        }}
                        className="flex-1 md:w-32 text-xs font-bold rounded-2xl h-11 justify-center"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </div>

                <CaseTable
                  cases={filteredCases}
                  onView={handleViewDetail}
                  onStatusChange={handleStatusChange}
                />
              </div>
            )}

            {/* Hearing Monthly Calendar Tab */}
            {activeTab === 'calendar' && (
              <HearingCalendarWidget hearings={upcomingHearings} />
            )}

            {/* Action Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DashboardTasksWidget tasks={overdueTasks} onCompleteTask={handleCompleteTask} />
                </div>
                <div className="bg-slate-950 rounded-[22px] p-6 text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider mb-2">Legal Management Checklist</h3>
                    <p className="text-xs text-slate-400 font-medium">Verify court filings are submitted 15 days before hearings.</p>
                  </div>
                  <div className="mt-5">
                    <Button onClick={() => setActiveTab('cases')} className="w-full text-xs font-bold bg-indigo-600 border-none hover:bg-indigo-700">Open Case List</Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* File Case Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[26px] p-5 sm:p-6 max-w-2xl w-full border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-6 top-6 p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-4 flex items-center gap-2">
              <Gavel size={18} className="text-indigo-600" />
              File TAL Case Application
            </h3>
            
            <form onSubmit={(e) => handleCreateCaseSubmit(e, false)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lease & Tenant</label>
                  <select
                    required
                    value={formLeaseId}
                    onChange={(e) => setFormLeaseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="">-- Select Active Lease --</option>
                    {leases.map(l => (
                      <option key={l.id} value={l.id}>{l.tenantName} - {l.propertyName} ({l.unitNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Lawyer</label>
                  <select
                    required
                    value={formLawyerId}
                    onChange={(e) => setFormLawyerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="">-- Choose Attorney Counsel --</option>
                    {lawyers.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.firm})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Case Type</label>
                  <select
                    required
                    value={formCaseType}
                    onChange={(e) => setFormCaseType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="Non-Payment of Rent">Non-Payment of Rent</option>
                    <option value="Eviction">Eviction</option>
                    <option value="Lease Termination">Lease Termination</option>
                    <option value="Property Damage">Property Damage</option>
                    <option value="Lease Violation">Lease Violation</option>
                    <option value="Rent Increase Dispute">Rent Increase Dispute</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reason for Filing</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unpaid June Rent"
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Case Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. June Rent Recovery and Late Fees"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Amount Owed ($ CAD)</label>
                  <input
                    type="number"
                    placeholder="1150"
                    value={formAmountOwed}
                    onChange={(e) => setFormAmountOwed(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the background context, notices sent, tenant response..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Expected Filing Date</label>
                  <input
                    type="date"
                    value={formExpectedFilingDate}
                    onChange={(e) => setFormExpectedFilingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Supporting Documents / Evidence Upload</label>
                  <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-2.5 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <Download size={14} className="text-slate-400" />
                      Click or drag files here
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Private staff directives or legal strategy details..."
                  value={formInternalNotes}
                  onChange={(e) => setFormInternalNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-800 resize-none"
                />
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button onClick={() => setShowCreateModal(false)} variant="secondary" className="flex-1 text-xs font-bold">Cancel</Button>
                <Button onClick={() => handleCreateCaseSubmit(null, true)} variant="secondary" className="flex-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200">Save Draft</Button>
                <Button onClick={() => handleCreateCaseSubmit(null, false)} variant="secondary" className="flex-1 text-xs font-bold bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">Generate Documents</Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs font-bold">File TAL Case</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
