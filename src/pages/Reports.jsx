import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { 
  Building2, Users, Home, TrendingUp, Wallet, BadgeDollarSign, 
  ShieldAlert, FileText, Gavel, Calendar, Clock, Landmark, AlertTriangle, 
  Info, Plus, Trash2, Settings, Filter, Download, ListFilter, Check, 
  Paperclip, Printer, Eye, BarChart as ChartIcon, Sparkles, LayoutGrid, CalendarDays
} from 'lucide-react';

// Services
import reportService from '../services/reportService';
import analyticsEngineService from '../services/analyticsEngineService';
import dashboardService from '../services/dashboardService';
import kpiService from '../services/kpiService';
import dashboardLayoutService from '../services/dashboardLayoutService';
import reportBuilderService from '../services/reportBuilderService';
import exportService from '../services/exportService';
import scheduledReportService from '../services/scheduledReportService';
import savedFilterService from '../services/savedFilterService';
import reportPermissionService from '../services/reportPermissionService';

// Executive Widgets
import { 
  ExecutiveKPICards, ExecutiveAlertsWidget, RevenueTrendWidget, 
  OccupancyWidget, OutstandingBalanceWidget, RentRollWidget, 
  RenewalWidget, LegalCasesWidget, AttendanceWidget, PayrollWidget, 
  VacancyWidget, ListingStatusWidget, UpcomingTasksWidget 
} from '../components/reports/ExecutiveWidgets';

export const Reports = () => {
  // Global selector company binding
  const [companyId, setCompanyId] = useState(localStorage.getItem('global_company_id') || 'all');
  
  useEffect(() => {
    const handleCompany = () => setCompanyId(localStorage.getItem('global_company_id') || 'all');
    window.addEventListener('companyChanged', handleCompany);
    return () => window.removeEventListener('companyChanged', handleCompany);
  }, []);

  // Check RBAC Permissions
  const hasAccess = reportPermissionService.canViewDashboard();

  // Selected Hub Tab
  const [activeTab, setActiveTab] = useState('executive');

  // Executive Dashboard Layout and Stats State
  const [dashData, setDashData] = useState(null);
  const [dashLayout, setDashLayout] = useState([]);
  const [layoutModal, setLayoutModal] = useState(false);

  // Standard Reports State
  const [selectedReport, setSelectedReport] = useState('Rent Roll');
  const [reportData, setReportData] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  
  // Standard Report Filter State
  const [reportFilters, setReportFilters] = useState({
    buildingId: '',
    status: '',
    dateStart: '',
    dateEnd: '',
    search: '',
    tenantId: ''
  });

  // Report Builder State
  const [builderModule, setBuilderModule] = useState('Financials');
  const [builderColumns, setBuilderColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [builderFilters, setBuilderFilters] = useState({ buildingId: '', status: '', search: '' });
  const [builderSorting, setBuilderSorting] = useState({ column: 'dueDate', direction: 'asc' });
  const [builderGrouping, setBuilderGrouping] = useState('');
  const [builderData, setBuilderData] = useState([]);
  const [builderTemplates, setBuilderTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Scheduled Reports State
  const [schedules, setSchedules] = useState([]);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    reportType: 'Rent Roll',
    recurrence: 'Weekly',
    recipients: '',
    format: 'PDF'
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Fetch properties (buildings) for selector drop-downs
  const [buildings, setBuildings] = useState([]);
  useEffect(() => {
    const list = analyticsEngineService.getProperties(companyId === 'all' ? '' : companyId);
    setBuildings(list);
  }, [companyId]);

  // Load Executive Dashboard metrics
  const loadDashboard = () => {
    const cleanComp = companyId === 'all' ? '' : companyId;
    const data = dashboardService.getDashboardData(cleanComp, reportFilters.buildingId);
    setDashData(data);
    setDashLayout(dashboardLayoutService.getLayout());
  };

  // Refresh standard reports based on criteria
  const loadStandardReport = () => {
    try {
      const cleanComp = companyId === 'all' ? '' : companyId;
      const data = reportService.generate(selectedReport, {
        ...reportFilters,
        companyId: cleanComp
      });
      setReportData(data);
    } catch (e) {
      console.error(e);
      setReportData([]);
    }
  };

  // Run initial state loading routines
  useEffect(() => {
    loadDashboard();
    loadStandardReport();
    setAuditLogs(reportService.getAuditLogs());
    setSchedules(scheduledReportService.getAll());
    setSavedFilters(savedFilterService.getAll());
    
    // Set builder columns
    const cols = reportBuilderService.getAvailableColumns(builderModule);
    setBuilderColumns(cols);
    setSelectedColumns(cols.slice(0, 4).map(c => c.key));
    setBuilderTemplates(reportBuilderService.getTemplatesByModule(builderModule));
  }, [companyId, selectedReport, reportFilters.buildingId, reportFilters.status, reportFilters.dateStart, reportFilters.dateEnd, reportFilters.tenantId]);

  // Execute custom builder queries
  const handleBuilderQuery = () => {
    try {
      const cleanComp = companyId === 'all' ? '' : companyId;
      // Get base report mapping
      let reportName = 'Outstanding Balance';
      if (builderModule === 'Properties') reportName = 'Vacancy Report';
      else if (builderModule === 'Leases') reportName = 'Lease Expiry';
      else if (builderModule === 'TAL Cases') reportName = 'Active TAL Cases';
      else if (builderModule === 'Payroll') reportName = 'Payroll Cost';

      let results = reportService.generate(reportName, {
        ...builderFilters,
        companyId: cleanComp
      });

      // Apply Search filter
      if (builderFilters.search) {
        const q = builderFilters.search.toLowerCase();
        results = results.filter(row => 
          Object.values(row).some(v => String(v).toLowerCase().includes(q))
        );
      }

      // Apply Sorting
      if (builderSorting.column) {
        results.sort((a, b) => {
          const valA = a[builderSorting.column];
          const valB = b[builderSorting.column];
          if (typeof valA === 'number') {
            return builderSorting.direction === 'asc' ? valA - valB : valB - valA;
          }
          return builderSorting.direction === 'asc' 
            ? String(valA).localeCompare(String(valB)) 
            : String(valB).localeCompare(String(valA));
        });
      }

      setBuilderData(results);
      setAuditLogs(reportService.getAuditLogs());
    } catch (e) {
      alert(e.message);
      setBuilderData([]);
    }
  };

  // Re-trigger builder query on module switch
  useEffect(() => {
    const cols = reportBuilderService.getAvailableColumns(builderModule);
    setBuilderColumns(cols);
    setSelectedColumns(cols.slice(0, 4).map(c => c.key));
    setBuilderTemplates(reportBuilderService.getTemplatesByModule(builderModule));
    setBuilderData([]);
  }, [builderModule]);

  // Handle widget toggle changes
  const handleToggleWidget = (id, visible) => {
    const updated = dashboardLayoutService.toggleWidget(id, visible);
    setDashLayout(updated);
  };

  // Drilldown helper
  const handleKPIDrilldown = (path) => {
    if (path.includes('vacancy')) {
      setSelectedReport('Vacancy Report');
      setActiveTab('standard');
    } else if (path.includes('units')) {
      setSelectedReport('Listing Status');
      setActiveTab('standard');
    } else if (path.includes('payments')) {
      setSelectedReport('Outstanding Balance');
      setActiveTab('standard');
    } else if (path.includes('tal-cases')) {
      setSelectedReport('Active TAL Cases');
      setActiveTab('standard');
    } else if (path.includes('payroll')) {
      setSelectedReport('Payroll Cost');
      setActiveTab('standard');
    }
  };

  // Save active parameters to savedFilterService
  const handleSaveFilter = () => {
    if (!filterName.trim()) return alert('Please enter a filter name.');
    try {
      savedFilterService.save(filterName, selectedReport, reportFilters);
      setFilterName('');
      setSavedFilters(savedFilterService.getAll());
      alert('Report filter template saved.');
    } catch (e) {
      alert(e.message);
    }
  };

  // Load criteria from saved filter template
  const handleLoadFilter = (item) => {
    setReportFilters({
      ...reportFilters,
      ...item.filters
    });
    alert(`Loaded filter profile: ${item.name}`);
  };

  // Save report builder query as custom layout template
  const handleSaveBuilderTemplate = () => {
    if (!newTemplateName.trim()) return alert('Please enter a template name.');
    try {
      reportBuilderService.saveTemplate({
        templateName: newTemplateName,
        module: builderModule,
        selectedColumns,
        filters: builderFilters,
        grouping: builderGrouping,
        sorting: builderSorting
      });
      setNewTemplateName('');
      setBuilderTemplates(reportBuilderService.getTemplatesByModule(builderModule));
      alert('Custom Report Template saved successfully.');
    } catch (e) {
      alert(e.message);
    }
  };

  // Load custom template details to builder view
  const handleLoadBuilderTemplate = (temp) => {
    setSelectedColumns(temp.selectedColumns || []);
    setBuilderFilters(temp.filters || {});
    setBuilderGrouping(temp.grouping || '');
    setBuilderSorting(temp.sorting || { column: 'dueDate', direction: 'asc' });
    alert(`Loaded Template: ${temp.templateName}`);
  };

  // Delete builder template
  const handleDeleteTemplate = (id) => {
    if (confirm('Are you sure you want to delete this template?')) {
      reportBuilderService.deleteTemplate(id);
      setBuilderTemplates(reportBuilderService.getTemplatesByModule(builderModule));
    }
  };

  // Trigger file download mock exports
  const handleExport = (exportType, isBuilder = false) => {
    const title = isBuilder ? `${builderModule} Custom Report` : selectedReport;
    const data = isBuilder ? builderData : reportData;
    const filters = isBuilder ? builderFilters : reportFilters;
    
    exportService.exportData(title, data, exportType, filters);
    setAuditLogs(reportService.getAuditLogs());
  };

  // Create scheduled distribution reports
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    try {
      scheduledReportService.create(newSchedule);
      setNewSchedule({ reportType: 'Rent Roll', recurrence: 'Weekly', recipients: '', format: 'PDF' });
      setScheduleModal(false);
      setSchedules(scheduledReportService.getAll());
      alert('Report schedule configured.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Render drill-down tables
  const renderStandardTable = () => {
    if (reportData.length === 0) {
      return (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl shadow-card">
          ∅ No records match the active parameters.
        </div>
      );
    }

    const headers = Object.keys(reportData[0]);

    return (
      <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {headers.map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.replace(/([A-Z])/g, ' $1')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
            {reportData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                {headers.map(h => (
                  <td key={h} className="px-6 py-3.5 font-sans">
                    {typeof row[h] === 'number' && h.toLowerCase().includes('amount') || h.toLowerCase().includes('cost') || h.toLowerCase().includes('balance') || h.toLowerCase().includes('salary') || h.toLowerCase().includes('pay')
                      ? `$${row[h].toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : String(row[h])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!hasAccess) {
    return (
      <MainLayout title="Enterprise Reports Hub">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-card max-w-md mx-auto mt-12 gap-4">
          <ShieldAlert size={48} className="text-rose-500 animate-bounce" />
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Your system role does not have authorization to view portfolios, payroll costs, or tribunal records.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Enterprise Reports & Portfolio Analytics">
      <div className="flex flex-col gap-6">
        
        {/* VIEW NAVIGATION TABS */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl w-full lg:w-auto">
            <button 
              onClick={() => setActiveTab('executive')}
              className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'executive' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid size={14} className="shrink-0" /> <span className="truncate">Executive Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('standard')}
              className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'standard' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText size={14} className="shrink-0" /> <span className="truncate">Standard Reports</span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'analytics' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <ChartIcon size={14} className="shrink-0" /> <span className="truncate">Interactive Charts</span>
            </button>
            <button 
              onClick={() => setActiveTab('builder')}
              className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'builder' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Sparkles size={14} className="shrink-0" /> <span className="truncate">Custom Builder</span>
            </button>
            <button 
              onClick={() => setActiveTab('schedules')}
              className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'schedules' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <CalendarDays size={14} className="shrink-0" /> <span className="truncate">Schedules</span>
            </button>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            {activeTab === 'executive' && (
              <button 
                onClick={() => setLayoutModal(true)}
                className="w-full lg:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Settings size={14} /> Configure Dashboard Layout
              </button>
            )}
          </div>
        </div>

        {/* 1. TAB: EXECUTIVE DASHBOARD */}
        {activeTab === 'executive' && dashData && (
          <div className="flex flex-col gap-4">
            {/* KPI Cards */}
            <ExecutiveKPICards kpis={dashData.kpis} onDrilldown={handleKPIDrilldown} />

            {/* Alert Banner */}
            <ExecutiveAlertsWidget alerts={dashData.alerts} />

            {/* Grid of Custom Ordered Layout Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {dashLayout.filter(w => w.visible).sort((a,b) => a.order - b.order).map((widget) => {
                switch (widget.id) {
                  case 'RevenueTrendWidget':
                    return <RevenueTrendWidget key={widget.id} data={dashData.revenueTrend} />;
                  case 'OccupancyWidget':
                    return <OccupancyWidget key={widget.id} occupancy={dashData.occupancy} />;
                  case 'OutstandingBalanceWidget':
                    return <OutstandingBalanceWidget key={widget.id} collection={dashData.collection} />;
                  case 'RenewalWidget':
                    return <RenewalWidget key={widget.id} renewals={dashData.renewals} />;
                  case 'LegalCasesWidget':
                    return <LegalCasesWidget key={widget.id} tal={dashData.tal} />;
                  case 'AttendanceWidget':
                    return <AttendanceWidget key={widget.id} attendance={dashData.attendance} />;
                  case 'PayrollWidget':
                    return <PayrollWidget key={widget.id} payroll={dashData.payroll} />;
                  case 'RentRollWidget':
                    return <RentRollWidget key={widget.id} rentRoll={reportData} />;
                  case 'VacancyWidget':
                    return <VacancyWidget key={widget.id} vacantList={reportService.generate('Vacancy Report', { companyId })} />;
                  case 'ListingStatusWidget':
                    return <ListingStatusWidget key={widget.id} listingList={reportService.generate('Listing Status', { companyId })} />;
                  case 'UpcomingTasksWidget':
                    return <UpcomingTasksWidget key={widget.id} tasks={[{ title: 'Prepare June TAL evidence', dueDate: '2026-07-05' }, { title: 'Review outstanding payroll cycle', dueDate: '2026-07-02' }, { title: 'Follow up on Apt 104B overdue rent', dueDate: '2026-07-08' }, { title: 'Process security deposit refund – Alice Cooper', dueDate: '2026-07-10' }]} />;
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        )}

        {/* 2. TAB: STANDARD REPORTS */}
        {activeTab === 'standard' && (
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
            
            {/* Report Side Navigation Bar */}
            <div className="flex flex-col gap-4 bg-white border border-slate-100 rounded-3xl p-4 shadow-card">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Financial Reports</span>
              <div className="flex flex-col gap-1 text-xs">
                {['Rent Roll', 'Outstanding Balance', 'Rent Collection', 'Late Payments', 'Aging Report'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setSelectedReport(r)}
                    className={`text-left p-2.5 rounded-xl font-bold border-none transition-all cursor-pointer ${
                      selectedReport === r ? 'bg-blue-50 text-blue-700' : 'bg-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 pt-2">Property & Leases</span>
              <div className="flex flex-col gap-1 text-xs">
                {['Vacancy Report', 'Listing Status', 'Lease Expiry', 'Renewal Status'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setSelectedReport(r)}
                    className={`text-left p-2.5 rounded-xl font-bold border-none transition-all cursor-pointer ${
                      selectedReport === r ? 'bg-blue-50 text-blue-700' : 'bg-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 pt-2">Litigation & Team</span>
              <div className="flex flex-col gap-1 text-xs">
                {['Active TAL Cases', 'Closed TAL Cases', 'Attendance Summary', 'Leave Summary', 'Payroll Cost'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setSelectedReport(r)}
                    className={`text-left p-2.5 rounded-xl font-bold border-none transition-all cursor-pointer ${
                      selectedReport === r ? 'bg-blue-50 text-blue-700' : 'bg-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 pt-2">Maintenance & Assets</span>
              <div className="flex flex-col gap-1 text-xs">
                {['Outstanding Repairs', 'Upcoming Repairs', 'Repair Cost', 'Furniture Status'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setSelectedReport(r)}
                    className={`text-left p-2.5 rounded-xl font-bold border-none transition-all cursor-pointer ${
                      selectedReport === r ? 'bg-blue-50 text-blue-700' : 'bg-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Pane Report Panel */}
            <div className="flex flex-col gap-5">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <h4 className="font-bold text-slate-800 text-sm">Report Filters: {selectedReport}</h4>
                  
                  {/* Saved Filters Loader */}
                  <div className="flex items-center gap-2">
                    <ListFilter size={14} className="text-slate-400" />
                    <select 
                      onChange={(e) => {
                        const target = savedFilters.find(f => f.id === e.target.value);
                        if (target) handleLoadFilter(target);
                      }}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 text-xs text-slate-600 font-semibold cursor-pointer outline-none"
                    >
                      <option value="">Load Saved Filter Template</option>
                      {savedFilters.filter(f => f.module === selectedReport).map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Building Location</label>
                    <select 
                      value={reportFilters.buildingId}
                      onChange={(e) => setReportFilters(p => ({ ...p, buildingId: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    >
                      <option value="">All Buildings</option>
                      {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Status</label>
                    <select 
                      value={reportFilters.status}
                      onChange={(e) => setReportFilters(p => ({ ...p, status: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Active">Active</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Date Start</label>
                    <input 
                      type="date" 
                      value={reportFilters.dateStart}
                      onChange={(e) => setReportFilters(p => ({ ...p, dateStart: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Date End</label>
                    <input 
                      type="date" 
                      value={reportFilters.dateEnd}
                      onChange={(e) => setReportFilters(p => ({ ...p, dateEnd: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-3 border-t border-slate-50 pt-3 mt-1">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Save current filters as..." 
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-medium focus:border-blue-100"
                    />
                    <button 
                      onClick={handleSaveFilter}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border-none shadow cursor-pointer transition-all"
                    >
                      Save Filters
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {['CSV', 'Excel', 'PDF', 'Print'].map(fmt => (
                      <button 
                        key={fmt}
                        onClick={() => handleExport(fmt)}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        {fmt === 'Print' ? <Printer size={13} /> : <Download size={13} />} {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              {renderStandardTable()}
            </div>
          </div>
        )}

        {/* 3. TAB: INTERACTIVE ANALYTICS */}
        {activeTab === 'analytics' && dashData && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card text-xs flex flex-wrap gap-4 items-center">
              <span className="font-bold text-slate-700 text-sm">Portfolio Interactive Analytics Panel</span>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span>Select Location:</span>
                <select 
                  value={reportFilters.buildingId}
                  onChange={(e) => setReportFilters(p => ({ ...p, buildingId: e.target.value }))}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none font-semibold cursor-pointer"
                >
                  <option value="">All Buildings</option>
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RevenueTrendWidget data={dashData.revenueTrend} />
              <OccupancyWidget occupancy={dashData.occupancy} />
              <OutstandingBalanceWidget collection={dashData.collection} />
              <RenewalWidget renewals={dashData.renewals} />
              <LegalCasesWidget tal={dashData.tal} />
              <AttendanceWidget attendance={dashData.attendance} />
              <PayrollWidget payroll={dashData.payroll} />
              
              {/* Heat Map Placeholder */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4 h-[350px]">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Location Heat Map (Mock)</h3>
                  <p className="text-xs text-slate-400 font-medium">Daily building access activity density</p>
                </div>
                <div className="grid grid-cols-7 gap-2 flex-1 items-center justify-center p-4">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-8 rounded-lg flex items-center justify-center font-bold text-[9px] text-white shadow-sm transition-all hover:scale-105 cursor-pointer ${
                        i % 4 === 0 ? 'bg-emerald-600' : i % 3 === 0 ? 'bg-emerald-400' : i % 2 === 0 ? 'bg-emerald-200' : 'bg-slate-100 text-slate-400'
                      }`}
                      title={`Access Activity Log density`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB: CUSTOM REPORT BUILDER */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
            
            {/* Custom Builder Settings Panel */}
            <div className="flex flex-col gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-card text-xs text-slate-600">
              <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                <h4 className="font-black text-slate-800 tracking-wide uppercase text-[10px]">Report Configurator</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Select columns, groupings, and output templates.</p>
              </div>

              {/* Module selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Module</label>
                <select 
                  value={builderModule} 
                  onChange={(e) => setBuilderModule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                >
                  <option value="Financials">Financials & Rent</option>
                  <option value="Properties">Properties & Vacancy</option>
                  <option value="Leases">Lease Agreements</option>
                  <option value="TAL Cases">Litigations (TAL)</option>
                  <option value="Payroll">Payroll Costs</option>
                </select>
              </div>

              {/* Columns Checkbox selections */}
              <div className="flex flex-col gap-2 border-t border-slate-50 pt-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Columns</label>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {builderColumns.map(col => (
                    <label key={col.key} className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-500 hover:text-slate-700">
                      <input 
                        type="checkbox"
                        checked={selectedColumns.includes(col.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColumns([...selectedColumns, col.key]);
                          } else {
                            setSelectedColumns(selectedColumns.filter(c => c !== col.key));
                          }
                        }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sorting option */}
              <div className="flex flex-col gap-2 border-t border-slate-50 pt-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sort Parameters</label>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={builderSorting.column}
                    onChange={(e) => setBuilderSorting(p => ({ ...p, column: e.target.value }))}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 text-xs text-slate-700 outline-none"
                  >
                    {builderColumns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>

                  <select 
                    value={builderSorting.direction}
                    onChange={(e) => setBuilderSorting(p => ({ ...p, direction: e.target.value }))}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              {/* Saved Query Layout templates list */}
              <div className="flex flex-col gap-2 border-t border-slate-50 pt-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Load Templates</label>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                  {builderTemplates.length === 0 ? (
                    <span className="text-[10px] text-slate-400 font-medium italic">No templates for this module.</span>
                  ) : (
                    builderTemplates.map(t => (
                      <div key={t.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100">
                        <button 
                          onClick={() => handleLoadBuilderTemplate(t)}
                          className="font-bold text-left text-blue-600 hover:underline bg-transparent border-none text-[11px] cursor-pointer flex-1"
                        >
                          {t.templateName}
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="text-rose-500 hover:text-rose-700 p-0.5 bg-transparent border-none cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2 border-t border-slate-50 pt-4">
                <button 
                  onClick={handleBuilderQuery}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Generate Custom Report
                </button>
              </div>
            </div>

            {/* Generated Custom Grid View */}
            <div className="flex flex-col gap-5">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card text-xs flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Save active layout as template..." 
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-medium focus:border-blue-100"
                  />
                  <button 
                    onClick={handleSaveBuilderTemplate}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border-none shadow cursor-pointer transition-all"
                  >
                    Save Template
                  </button>
                </div>

                <div className="flex gap-2">
                  {['CSV', 'Excel', 'PDF'].map(fmt => (
                    <button 
                      key={fmt}
                      onClick={() => handleExport(fmt, true)}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} /> {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Builder Data Grid */}
              {builderData.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl shadow-card">
                  Click "Generate Custom Report" to render datasets.
                </div>
              ) : (
                <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
                  <table className="w-full border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {selectedColumns.map(colKey => {
                          const col = builderColumns.find(c => c.key === colKey);
                          return (
                            <th key={colKey} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{col ? col.label : colKey}</th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
                      {builderData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                          {selectedColumns.map(colKey => (
                            <td key={colKey} className="px-6 py-3.5 font-sans">
                              {typeof row[colKey] === 'number' && colKey.toLowerCase().includes('amount') || colKey.toLowerCase().includes('balance') || colKey.toLowerCase().includes('pay') || colKey.toLowerCase().includes('salary')
                                ? `$${row[colKey].toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                : String(row[colKey] || '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. TAB: SCHEDULES & AUDITING */}
        {activeTab === 'schedules' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
            
            {/* Audit Trail Table */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">System Generated Report Logs</h3>
                  <p className="text-xs text-slate-400 font-medium">Compliance record of generated/exported summaries</p>
                </div>
              </div>

              {auditLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl shadow-card">
                  No reports compiled yet in this session.
                </div>
              ) : (
                <div className="overflow-x-auto w-full bg-white border border-slate-100 rounded-3xl shadow-card">
                  <table className="w-full border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Type</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medium</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-600 font-medium font-sans">
                      {auditLogs.slice().reverse().map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/20">
                          <td className="px-6 py-3.5 font-mono text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-3.5 font-bold text-slate-800">{log.reportType}</td>
                          <td className="px-6 py-3.5">{log.generatedBy}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.exportType === 'Screen' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {log.exportType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Scheduled Reports panel */}
            <div className="flex flex-col gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-card">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h4 className="font-bold text-slate-800 text-sm">Scheduled Automations</h4>
                <button 
                  onClick={() => setScheduleModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} /> Schedule
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {schedules.map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex justify-between items-start text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800">{item.reportType}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Recurrence: {item.recurrence} ({item.format})</span>
                      <span className="text-[10px] text-slate-500 font-bold font-mono">Mail: {item.recipients}</span>
                    </div>
                    <button 
                      onClick={() => {
                        scheduledReportService.delete(item.id);
                        setSchedules(scheduledReportService.getAll());
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1 bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* DASHBOARD LAYOUT CONFIGURATOR MODAL */}
      {layoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Executive Layout Configurator</h3>
              <button type="button" onClick={() => setLayoutModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {dashLayout.map(widget => (
                <label key={widget.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-600">
                  <span>{widget.id.replace('Widget', '').replace(/([A-Z])/g, ' $1')}</span>
                  <input 
                    type="checkbox"
                    checked={widget.visible}
                    onChange={(e) => handleToggleWidget(widget.id, e.target.checked)}
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-50">
              <button 
                type="button" 
                onClick={() => {
                  setDashLayout(dashboardLayoutService.resetLayout());
                  alert('Layout order reset to enterprise defaults.');
                }}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer bg-white"
              >
                Reset Default
              </button>
              <button 
                type="button" 
                onClick={() => {
                  loadDashboard();
                  setLayoutModal(false);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border-none shadow-md text-xs cursor-pointer"
              >
                Apply Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SCHEDULE MODAL */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleScheduleSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-float border border-slate-100 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Schedule Report Generation</h3>
              <button type="button" onClick={() => setScheduleModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-none">×</button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-slate-600">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Report Type</label>
                <select 
                  value={newSchedule.reportType}
                  onChange={(e) => setNewSchedule(p => ({ ...p, reportType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                >
                  <option value="Rent Roll">Rent Roll</option>
                  <option value="Outstanding Balance">Outstanding Balance</option>
                  <option value="Vacancy Report">Vacancy Report</option>
                  <option value="Active TAL Cases">Active TAL Cases</option>
                  <option value="Payroll Cost">Payroll Cost</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recurrence</label>
                  <select 
                    value={newSchedule.recurrence}
                    onChange={(e) => setNewSchedule(p => ({ ...p, recurrence: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</label>
                  <select 
                    value={newSchedule.format}
                    onChange={(e) => setNewSchedule(p => ({ ...p, format: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Emails</label>
                <input 
                  type="text" 
                  placeholder="e.g. manager@soros.com, director@apex.com" 
                  value={newSchedule.recipients}
                  onChange={(e) => setNewSchedule(p => ({ ...p, recipients: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-semibold"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-50 mt-2">
              <button type="submit" className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl border-none shadow-lg cursor-pointer">
                Confirm Schedule Configuration
              </button>
            </div>
          </form>
        </div>
      )}

    </MainLayout>
  );
};

export default Reports;
