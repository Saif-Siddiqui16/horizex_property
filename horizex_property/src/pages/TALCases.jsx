import React, { useState, useEffect } from 'react';



import { Button } from '../components/Button';

import { Search, Plus, Filter, Gavel, Calendar, ClipboardList, TrendingUp, X, Download, FileText } from 'lucide-react';

import { TAL_CASE_STATUSES, TAL_CASE_PRIORITIES, mockLawyers } from '../constants/talCases';

import { TALKPICards } from '../components/tal/TALKPICards';

import { CaseTable } from '../components/tal/CaseTable';

import { CaseStatusChart } from '../components/tal/CaseStatusChart';

import { UpcomingHearingsWidget } from '../components/tal/UpcomingHearingsWidget';

import { UrgentCasesWidget } from '../components/tal/UrgentCasesWidget';

import { HearingCalendarWidget } from '../components/tal/HearingCalendarWidget';

import { DashboardTasksWidget } from '../components/tal/DashboardTasksWidget';

import { CaseOverviewSteps } from '../components/tal/CaseOverviewSteps';

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



  const loadData = async () => {

    try {

      setLoading(true);

      const casesRes = await api.get('/admin/tal-cases').catch(() => ({ data: [] }));

      const apiCases = casesRes.data?.data || casesRes.data || [];



      const DEFAULT_TAL_CASES = [

        {

          id: 'tal-case-1',

          caseNumber: 'TAL-2026-0001',

          docketNumber: 'TAL-2026-0001',

          companyId: 1,

          propertyId: 1,

          propertyName: 'Parkview Heights',

          unitId: 1,

          unitNumber: 'Unit 101',

          tenantId: 1,

          tenantName: 'Demo Tenant',

          leaseId: 1,

          caseType: 'Non-Payment of Rent',

          reason: 'Unpaid Rent for October & November 2026',

          subject: 'Rent Recovery and Late Fee Arrears',

          caseSummary: 'Tenant has not paid rent for 2 consecutive months despite formal notices sent.',

          status: 'Preparing Documents',

          priority: 'HIGH',

          amountOwed: 2500,

          amountClaimed: 2948,

          filingFee: 98,

          legalFees: 350,

          outstandingRent: 2500,

          recoveredAmount: 0,

          paymentStatus: 'Unpaid',

          filedDate: '2026-11-01',

          assignedManagerName: 'Admin Administrator',

          assignedLawyerId: 'lwy-001',

          assignedLawyerName: 'Me. Jean Tremblay (Tremblay Legal Group)',

          nextHearingDate: '2026-12-15T10:00:00Z',

          courtRoom: 'Room 302 - TAL Montreal',

          createdAt: '2026-11-01T10:00:00Z'

        }

      ];



      const localSaved = JSON.parse(localStorage.getItem('mock_tal_cases') || 'null');

      const localCases = localSaved !== null ? localSaved : DEFAULT_TAL_CASES;

      if (localSaved === null) {

        localStorage.setItem('mock_tal_cases', JSON.stringify(DEFAULT_TAL_CASES));

      }



      const map = new Map();

      localCases.forEach(c => map.set(String(c.id || c.caseNumber || c.docketNumber), c));

      apiCases.forEach(c => {

        const id = String(c.id || c.caseNumber || c.docketNumber);

        const existing = map.get(id) || {};

        map.set(id, {

          ...existing,

          ...c,

          caseNumber: c.caseNumber || c.docketNumber || existing.caseNumber,

          tenantName: c.tenantName || (c.tenant ? `${c.tenant.firstName || ''} ${c.tenant.lastName || ''}`.trim() : existing.tenantName),

          propertyName: c.propertyName || c.property?.name || existing.propertyName,

          unitNumber: c.unitNumber || c.unit?.unitNumber || existing.unitNumber,

        });

      });

      const caseList = Array.from(map.values());

      setCases(caseList);



      const openCases = caseList.filter(c => !['Closed', 'Archived', 'RESOLVED'].includes(c.status)).length;

      const draftCases = caseList.filter(c => c.status === 'Draft' || c.status === 'DRAFTED').length;

      const filedCases = caseList.filter(c => ['Filed', 'FILED', 'Ready to File', 'Preparing Documents'].includes(c.status)).length;

      const hearingsScheduled = caseList.filter(c => c.status === 'Hearing Scheduled' || c.status === 'HEARING_SCHEDULED' || c.nextHearingDate).length;

      const awaitingDecision = caseList.filter(c => ['Hearing Completed', 'Decision Received'].includes(c.status)).length;

      const ordersIssued = caseList.filter(c => ['Order Issued', 'Payment Ordered', 'Eviction Approved'].includes(c.status)).length;

      const closedCases = caseList.filter(c => ['Closed', 'Archived', 'RESOLVED'].includes(c.status)).length;

      const urgentList = caseList.filter(c => (c.priority || '').toUpperCase() === 'URGENT');



      setMetrics({

        openCases,

        draftCases,

        filedCases,

        hearingsScheduled,

        awaitingDecision,

        ordersIssued,

        closedCases,

        urgentCases: urgentList.length,

        totalCases: caseList.length,

        activeLitigation: openCases

      });



      const statusMap = {};

      caseList.forEach(c => {

        statusMap[c.status] = (statusMap[c.status] || 0) + 1;

      });

      setStatusBreakdown(Object.entries(statusMap).map(([status, count]) => ({ status, count })));

      setUpcomingHearings(caseList.filter(c => c.nextHearingDate));

      setUrgentCases(urgentList);

      let allTasks = caseList.flatMap(c => (c.tasks || []).map(t => ({
        ...t,
        caseId: c.id,
        caseNumber: c.caseNumber,
        tenantName: c.tenantName
      })));
      if (allTasks.length === 0) {
        allTasks = [
          {
            id: 'task-1',
            title: 'Serve Formal Notice of Non-Payment',
            description: 'Send registered demand letter before filing TAL application',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'PENDING',
            priority: 'HIGH'
          },
          {
            id: 'task-2',
            title: 'Prepare Evidence Dossier',
            description: 'Compile lease agreement, payment ledger, and communication records',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'PENDING',
            priority: 'MEDIUM'
          }
        ];
      }
      setOverdueTasks(allTasks);

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



  const handleStatusChange = async (caseId, newStatus) => {

    try {

      const currentLocal = JSON.parse(localStorage.getItem('mock_tal_cases') || '[]');

      const idx = currentLocal.findIndex(c => String(c.id) === String(caseId));

      if (idx !== -1) {

        currentLocal[idx].status = newStatus;

        localStorage.setItem('mock_tal_cases', JSON.stringify(currentLocal));

      }

      await api.put(`/admin/tal-cases/${caseId}`, { status: newStatus }).catch(() => {});

      loadData();

    } catch (e) {

      alert(e.message);

    }

  };



  const handleCreateCaseSubmit = async (e, isDraft = false) => {

    if (e) e.preventDefault();

    if (!formSubject || !formLeaseId || !formLawyerId) {

      alert('Please fill out Subject, Lease, and Lawyer details.');

      return;

    }



    const matchedLease = leases.find(l => String(l.id) === String(formLeaseId));

    const matchedLawyer = lawyers.find(l => String(l.id) === String(formLawyerId));



    const generatedCaseNum = `TAL-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newCaseId = `tal-case-${Date.now()}`;



    const newCasePayload = {

      id: newCaseId,

      caseNumber: generatedCaseNum,

      docketNumber: generatedCaseNum,

      companyId: matchedLease?.companyId || 1,

      propertyId: matchedLease?.propertyId || (properties[0]?.id || '1'),

      propertyName: matchedLease?.propertyName || matchedLease?.property?.name || 'Parkview Heights',

      unitId: matchedLease?.unitId || matchedLease?.unit?.id || '1',

      unitNumber: matchedLease?.unitNumber || matchedLease?.unit?.unitNumber || 'Unit 101',

      tenantId: matchedLease?.tenantId || matchedLease?.tenant?.id || '1',

      tenantName: matchedLease?.tenantName || (matchedLease?.tenant ? `${matchedLease.tenant.firstName || ''} ${matchedLease.tenant.lastName || ''}`.trim() : 'John Doe'),

      leaseId: matchedLease?.id || formLeaseId,

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

      filingDate: formExpectedFilingDate ? new Date(formExpectedFilingDate).toISOString() : new Date().toISOString(),

      assignedManagerId: 'usr-001',

      assignedManagerName: 'Admin Administrator',

      assignedLawyerId: formLawyerId,

      assignedLawyerName: matchedLawyer?.name || 'Me. Jean Tremblay (Tremblay Legal Group)',

      nextHearingDate: null,

      courtRoom: null,

      judgeId: null,

      judgeName: null,

      createdAt: new Date().toISOString()

    };



    // Resilient local save so newly created case appears immediately

    const currentLocal = JSON.parse(localStorage.getItem('mock_tal_cases') || '[]');

    currentLocal.unshift(newCasePayload);

    localStorage.setItem('mock_tal_cases', JSON.stringify(currentLocal));



    // Backend API sync

    try {

      await api.post('/admin/tal-cases', newCasePayload);

    } catch (apiErr) {

      console.warn('Backend sync note (saved locally):', apiErr);

    }



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

    alert(isDraft ? 'Case draft saved successfully.' : 'TAL Case filed successfully.');

  };



  const handleCompleteTask = async (taskId) => {
    try {
      const currentLocal = JSON.parse(localStorage.getItem('mock_tal_cases') || '[]');
      currentLocal.forEach(c => {
        if (c.tasks) {
          const t = c.tasks.find(x => String(x.id) === String(taskId));
          if (t) t.status = 'COMPLETED';
        }
      });
      localStorage.setItem('mock_tal_cases', JSON.stringify(currentLocal));
    } catch (e) {}
    await api.put(`/admin/tal-cases/tasks/${taskId}`, { status: 'COMPLETED' }).catch(() => {});
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

    <>

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

                

                {/* TAL Case Overview Steps to Follow */}

                <CaseOverviewSteps 

                  availableCases={cases}

                  selectedCaseId={cases[0]?.id}

                />

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

                    <Button onClick={() => setActiveTab('cases')} className="w-full text-xs font-bold bg-zinc-900 border-none hover:bg-zinc-800">Open Case List</Button>

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

    </>

  );

};

