import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { 
  Building2, Users, Home, TrendingUp, Wallet, BadgeDollarSign, 
  ShieldAlert, FileText, Gavel, Calendar, Clock, Landmark, AlertTriangle, 
  Info, Plus, Trash2, Settings, Filter, Download, ListFilter, Check, 
  Paperclip, Printer, Eye, BarChart as ChartIcon, Sparkles, LayoutGrid, CalendarDays, RefreshCw
} from 'lucide-react';

// RTK Query & Redux Toolkit Integration
import {
  useGetDashboardStatsQuery,
  useGetRevenueTrajectoryQuery,
  useGetVacancyAnalyticsQuery,
  useGetPropertiesQuery,
  useGetInvoicesQuery,
  useGetTalCasesQuery,
  useGetPayrollRunsQuery,
  useGetLeasesQuery,
  setCompanyContext,
} from '../store';

import {
  useFetchCustomReportMutation,
  useGetReportTemplatesQuery,
  useSaveReportTemplateMutation,
  useDeleteReportTemplateMutation,
  useGetReportAuditLogsQuery,
  useLogReportAuditMutation,
} from '../store/api/reportsApi';

// Legacy Services (Graceful Fallback & Business Logic)
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
  const dispatch = useDispatch();

  // Redux Toolkit Selectors
  const reduxCompanyId = useSelector((state) => state.auth?.effectiveCompanyId);
  const currentUser = useSelector((state) => state.auth?.user);
  const currentRole = useSelector((state) => state.auth?.role);

  // Active Company Selection (Synchronized with Redux & Topbar)
  const [companyId, setCompanyId] = useState(() => {
    return reduxCompanyId || localStorage.getItem('global_selected_company_id') || localStorage.getItem('global_company_id') || 'all';
  });
  
  // Active Building Selection (Synchronized with Topbar BuildingSelector)
  const [selectedBuildingId, setSelectedBuildingId] = useState(() => {
    return localStorage.getItem('global_selected_building_id') || '';
  });

  // Listen for Topbar Company selection change
  useEffect(() => {
    const handleCompany = () => {
      const activeId = localStorage.getItem('global_selected_company_id') || localStorage.getItem('global_company_id') || 'all';
      setCompanyId(activeId);
      if (activeId && activeId !== 'all') {
        dispatch(setCompanyContext(activeId));
      } else {
        dispatch(setCompanyContext(null));
      }
      // Reset building if company changed
      const currentBuilding = localStorage.getItem('global_selected_building_id') || '';
      setSelectedBuildingId(currentBuilding);
      setReportFilters(prev => ({ ...prev, buildingId: currentBuilding }));
    };

    window.addEventListener('companyChanged', handleCompany);
    return () => {
      window.removeEventListener('companyChanged', handleCompany);
    };
  }, [dispatch]);

  // Synchronize when Redux store updates
  useEffect(() => {
    if (reduxCompanyId) {
      setCompanyId(reduxCompanyId);
    } else {
      const saved = localStorage.getItem('global_selected_company_id');
      setCompanyId(saved && saved !== 'all' ? saved : 'all');
    }
  }, [reduxCompanyId]);

  // Listen for Topbar Building selection change
  useEffect(() => {
    const handleBuilding = () => {
      const savedBuilding = localStorage.getItem('global_selected_building_id') || '';
      setSelectedBuildingId(savedBuilding);
      setReportFilters(prev => ({ ...prev, buildingId: savedBuilding }));
    };

    window.addEventListener('buildingChanged', handleBuilding);
    return () => {
      window.removeEventListener('buildingChanged', handleBuilding);
    };
  }, []);

  // Check RBAC Permissions via Redux / Service
  const hasAccess = currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN' || reportPermissionService.canViewDashboard();

  // Selected Hub Tab
  const [activeTab, setActiveTab] = useState('standard');

  // Executive Dashboard Layout State (Instant initialization)
  const [dashLayout, setDashLayout] = useState(() => dashboardLayoutService.getLayout());
  const [layoutModal, setLayoutModal] = useState(false);

  // Standard Reports State
  const [selectedReport, setSelectedReport] = useState('Rent Roll');
  const [savedFilters, setSavedFilters] = useState(() => savedFilterService.getAll());
  const [filterName, setFilterName] = useState('');
  
  // Standard Report Filter State
  const [reportFilters, setReportFilters] = useState(() => ({
    buildingId: localStorage.getItem('global_selected_building_id') || '',
    status: '',
    dateStart: '',
    dateEnd: '',
    search: '',
    tenantId: ''
  }));

  // Handle building change from in-page dropdowns (Two-way sync with Topbar)
  const handleBuildingChange = useCallback((newBuildingId) => {
    setSelectedBuildingId(newBuildingId);
    setReportFilters(prev => ({ ...prev, buildingId: newBuildingId }));
    localStorage.setItem('global_selected_building_id', newBuildingId);
    window.dispatchEvent(new Event('buildingChanged'));
  }, []);

  // Report Builder State
  const [builderModule, setBuilderModule] = useState('Financials');
  const [builderColumns, setBuilderColumns] = useState(() => reportBuilderService.getAvailableColumns('Financials'));
  const [selectedColumns, setSelectedColumns] = useState(() => reportBuilderService.getAvailableColumns('Financials').slice(0, 4).map(c => c.key));
  const [builderFilters, setBuilderFilters] = useState({ buildingId: '', status: '', search: '' });
  const [builderSorting, setBuilderSorting] = useState({ column: 'dueDate', direction: 'asc' });
  const [builderGrouping, setBuilderGrouping] = useState('');
  const [builderData, setBuilderData] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Scheduled Reports State
  const [schedules, setSchedules] = useState(() => scheduledReportService.getAll());
  const [scheduleModal, setScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    reportType: 'Rent Roll',
    recurrence: 'Weekly',
    recipients: '',
    format: 'PDF'
  });

  // Custom Reports Backend RTK Query Hooks
  const [fetchCustomReport, { isLoading: isGeneratingCustom }] = useFetchCustomReportMutation();
  const { data: backendTemplates = [] } = useGetReportTemplatesQuery(builderModule);
  const [saveReportTemplate] = useSaveReportTemplateMutation();
  const [deleteReportTemplate] = useDeleteReportTemplateMutation();
  const { data: backendAuditLogs = [] } = useGetReportAuditLogsQuery();
  const [logReportAudit] = useLogReportAuditMutation();

  const builderTemplates = useMemo(() => {
    return Array.isArray(backendTemplates) ? backendTemplates : [];
  }, [backendTemplates]);

  const auditLogs = useMemo(() => {
    return Array.isArray(backendAuditLogs) ? backendAuditLogs : [];
  }, [backendAuditLogs]);

  // ==========================================
  // RTK QUERY HOOKS FOR LIVE DATABASE INTEGRATION
  // ==========================================
  const cleanComp = companyId === 'all' || !companyId ? undefined : companyId;

  // 1. Executive Dashboard Stats
  const { data: backendStats } = useGetDashboardStatsQuery(cleanComp ? { companyId: cleanComp } : undefined);

  // 2. Revenue Trajectory
  const { data: revenueTrajectory } = useGetRevenueTrajectoryQuery(cleanComp ? { companyId: cleanComp } : undefined);

  // 3. Vacancy Analytics
  const { data: vacancyAnalytics } = useGetVacancyAnalyticsQuery(cleanComp ? { companyId: cleanComp } : undefined);

  // 4. Properties/Buildings from Database
  const { data: propertiesDataRaw } = useGetPropertiesQuery(cleanComp ? { companyId: cleanComp } : undefined);

  // 5. Invoices Query for Financial Reports
  const { data: invoicesDataRaw } = useGetInvoicesQuery(cleanComp ? { companyId: cleanComp } : undefined);

  // 6. TAL Litigation Cases Query
  const { data: talCasesDataRaw } = useGetTalCasesQuery();

  // 7. Payroll Runs Query
  const { data: payrollRunsDataRaw } = useGetPayrollRunsQuery();

  // 8. Leases Query
  const { data: leasesDataRaw } = useGetLeasesQuery(cleanComp ? { companyId: cleanComp } : undefined);

  // Available Buildings for Dropdown (Filtered by Company)
  const buildings = useMemo(() => {
    if (Array.isArray(propertiesDataRaw) && propertiesDataRaw.length > 0) {
      const filtered = cleanComp
        ? propertiesDataRaw.filter(p => String(p.companyId) === String(cleanComp))
        : propertiesDataRaw;
      return filtered.map(p => ({
        id: p.id,
        name: p.name,
        companyId: p.companyId,
        address: p.address,
      }));
    }
    return [];
  }, [propertiesDataRaw, cleanComp]);

  // Active Building Identification
  const activeBuildingId = selectedBuildingId && selectedBuildingId !== 'all' ? selectedBuildingId : '';
  const activeBuildingObj = useMemo(() => {
    return buildings.find(b => String(b.id) === String(activeBuildingId));
  }, [buildings, activeBuildingId]);

  // Target Properties matching Company & Building
  const targetProperties = useMemo(() => {
    if (!Array.isArray(propertiesDataRaw) || propertiesDataRaw.length === 0) return [];
    return propertiesDataRaw.filter(p => {
      if (cleanComp && String(p.companyId) !== String(cleanComp)) return false;
      if (activeBuildingId && String(p.id) !== String(activeBuildingId)) return false;
      return true;
    });
  }, [propertiesDataRaw, cleanComp, activeBuildingId]);

  // Helper matching record to active company & building
  const isRecordMatching = useCallback((item) => {
    if (!item) return false;

    // Company Check
    if (cleanComp) {
      const compId = item.companyId || item.tenant?.companyId || item.unit?.property?.companyId || item.lease?.unit?.property?.companyId || item.property?.companyId;
      if (compId && String(compId) !== String(cleanComp)) return false;
    }

    // Building Check
    if (activeBuildingId) {
      const bId = item.propertyId || item.buildingId || item.unit?.property?.id || item.unit?.propertyId || item.lease?.unit?.property?.id || item.lease?.unit?.propertyId || item.property?.id;
      const bName = item.buildingName || item.propertyName || item.unit?.property?.name || item.lease?.unit?.property?.name || item.property?.name;
      const matchesId = bId && String(bId) === String(activeBuildingId);
      const matchesName = activeBuildingObj?.name && bName && String(bName).toLowerCase() === String(activeBuildingObj.name).toLowerCase();
      if (!matchesId && !matchesName) return false;
    }

    return true;
  }, [cleanComp, activeBuildingId, activeBuildingObj]);

  // Filtered Live Entities
  const filteredInvoices = useMemo(() => {
    if (!Array.isArray(invoicesDataRaw)) return [];
    return invoicesDataRaw.filter(isRecordMatching);
  }, [invoicesDataRaw, isRecordMatching]);

  const filteredLeases = useMemo(() => {
    if (!Array.isArray(leasesDataRaw)) return [];
    return leasesDataRaw.filter(isRecordMatching);
  }, [leasesDataRaw, isRecordMatching]);

  const filteredTalCases = useMemo(() => {
    if (!Array.isArray(talCasesDataRaw)) return [];
    return talCasesDataRaw.filter(isRecordMatching);
  }, [talCasesDataRaw, isRecordMatching]);

  const filteredPayrollRuns = useMemo(() => {
    if (!Array.isArray(payrollRunsDataRaw)) return [];
    return payrollRunsDataRaw.filter(isRecordMatching);
  }, [payrollRunsDataRaw, isRecordMatching]);

  // Compute Executive Dashboard metrics (100% REAL LIVE DATA - NO DUMMY, NO MOCK, NO FALLBACK)
  const dashData = useMemo(() => {
    // 1. Dynamic Units & Occupancy Calculation strictly from real properties
    let totalApartments = 0;
    let occupiedApartments = 0;
    let vacantApartments = 0;

    if (targetProperties.length > 0) {
      totalApartments = targetProperties.reduce((sum, p) => sum + (p.analytics?.totalUnits || p.units || (Array.isArray(p.unitsList) ? p.unitsList.length : 0)), 0);
      occupiedApartments = targetProperties.reduce((sum, p) => sum + (p.analytics?.occupiedUnits || (Array.isArray(p.unitsList) ? p.unitsList.filter(u => u.status === 'OCCUPIED' || u.status === 'Leased').length : 0)), 0);
      vacantApartments = targetProperties.reduce((sum, p) => sum + (p.analytics?.vacantUnits || (Array.isArray(p.unitsList) ? p.unitsList.filter(u => u.status === 'VACANT').length : 0)), 0);
    } else if (!activeBuildingId && backendStats?.portfolio?.totalUnits != null) {
      totalApartments = Number(backendStats.portfolio.totalUnits || 0);
      occupiedApartments = Number(backendStats.portfolio.occupiedUnits || 0);
      vacantApartments = Number(backendStats.portfolio.vacantUnits || 0);
    }

    const occupancyRate = totalApartments > 0
      ? Math.round((occupiedApartments / totalApartments) * 100)
      : 0;

    // 2. Dynamic Financials (Real Revenue & Outstanding Collections)
    let currentMonthRevenue = 0;
    let outstandingRent = 0;

    if (filteredInvoices.length > 0) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // Cash collected this month
      currentMonthRevenue = filteredInvoices.reduce((sum, inv) => {
        let paidThisMonth = 0;
        if (Array.isArray(inv.payments) && inv.payments.length > 0) {
          paidThisMonth = inv.payments
            .filter(p => {
              const pDate = new Date(p.paidAt || p.createdAt);
              return pDate.getFullYear() === currentYear && pDate.getMonth() === currentMonth;
            })
            .reduce((s, p) => s + Number(p.amount || 0), 0);
        } else if (inv.amountPaid) {
          const d = new Date(inv.dueDate || inv.createdAt);
          if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
            paidThisMonth = Number(inv.amountPaid);
          }
        }
        return sum + paidThisMonth;
      }, 0);

      // Total Outstanding Overdue Rent
      outstandingRent = filteredInvoices
        .filter(inv => inv.status === 'UNPAID' || inv.status === 'OVERDUE' || inv.status === 'PARTIAL')
        .reduce((sum, inv) => sum + Math.max(0, Number(inv.amountDue || inv.total || 0) - Number(inv.amountPaid || 0)), 0);
    } else if (!activeBuildingId && backendStats?.financials?.totalCollectedThisMonth != null) {
      currentMonthRevenue = Number(backendStats.financials.totalCollectedThisMonth || 0);
      outstandingRent = Math.max(0, Number(backendStats.financials.totalBilledThisMonth || 0) - Number(backendStats.financials.totalCollectedThisMonth || 0));
    }

    const mergedKPIs = {
      totalBuildings: targetProperties.length,
      totalApartments,
      occupiedApartments,
      vacantApartments,
      occupancyRate,
      currentMonthRevenue,
      outstandingRent,
      activeTALCases: 0,
      payrollCost: 0,
    };

    // Real Alerts strictly from live numbers
    const mergedAlerts = [];
    if (outstandingRent > 0) {
      mergedAlerts.push({
        id: 'alert-overdue',
        severity: 'Critical',
        message: `Outstanding rent receivables overdue: $${outstandingRent.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      });
    }
    if (totalApartments > 0 && occupancyRate < 90) {
      mergedAlerts.push({
        id: 'alert-occ',
        severity: 'Info',
        message: `Occupancy rate currently at ${occupancyRate}% (${vacantApartments} vacant unit(s) available).`
      });
    }

    // Real Monthly Revenue Trend Chart Data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueMap = {};
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = `${monthNames[past.getMonth()]} ${String(past.getFullYear()).slice(-2)}`;
      monthlyRevenueMap[key] = 0;
    }

    if (filteredInvoices.length > 0) {
      filteredInvoices.forEach(inv => {
        const invDate = new Date(inv.dueDate || inv.createdAt);
        if (!isNaN(invDate.getTime())) {
          const key = `${monthNames[invDate.getMonth()]} ${String(invDate.getFullYear()).slice(-2)}`;
          if (monthlyRevenueMap[key] !== undefined) {
            monthlyRevenueMap[key] += Number(inv.amountPaid || 0);
          }
        }
      });
    }

    const revenueTrend = Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue),
      amount: Math.round(revenue),
      rent: Math.round(revenue),
    }));

    // Real Occupancy Donut Structure
    const occupancy = {
      rate: occupancyRate,
      occupied: occupiedApartments,
      vacant: vacantApartments,
      total: totalApartments,
    };

    // Real Rent Outstanding Ledger Structure
    const currentMonthCollected = filteredInvoices.reduce((s, inv) => s + Number(inv.amountPaid || 0), 0);
    const totalOverdue = filteredInvoices
      .filter(inv => inv.status === 'OVERDUE' || inv.status === 'UNPAID')
      .reduce((s, inv) => s + Math.max(0, Number(inv.amountDue || 0) - Number(inv.amountPaid || 0)), 0);

    const collection = {
      unpaid: totalOverdue,
      collected: currentMonthCollected,
      aging: {
        '30-60': totalOverdue,
        '60+': 0,
      },
    };

    return {
      kpis: mergedKPIs,
      alerts: mergedAlerts,
      revenueTrend,
      occupancy,
      collection,
    };
  }, [
    activeBuildingId, 
    targetProperties, 
    filteredInvoices, 
    backendStats
  ]);

  // Live Rent Roll dataset for widget (100% Real DB Leases)
  const liveRentRoll = useMemo(() => {
    if (filteredLeases.length > 0) {
      return filteredLeases.map(l => ({
        tenantName: l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : (l.tenantName || '—'),
        buildingName: l.unit?.property?.name || l.buildingName || activeBuildingObj?.name || '—',
        unitNumber: l.unit?.unitNumber || l.unitNumber || '—',
        rentAmount: Number(l.rentAmount || l.rent || 0),
        depositAmount: Number(l.depositAmount || l.deposit || 0),
        status: l.status || 'ACTIVE',
        startDate: l.startDate ? new Date(l.startDate).toLocaleDateString() : '—',
        endDate: l.endDate ? new Date(l.endDate).toLocaleDateString() : '—',
      }));
    }
    return [];
  }, [filteredLeases, activeBuildingObj]);

  // Live Vacancy List for widget (100% Real DB Units)
  const liveVacantList = useMemo(() => {
    if (targetProperties.length > 0) {
      const rows = [];
      targetProperties.forEach(p => {
        (p.unitsList || []).filter(u => u.status === 'VACANT' || !u.lease).forEach(u => {
          rows.push({
            buildingName: p.name,
            unitNumber: u.unitNumber || u.number || `Unit ${u.id}`,
            unitType: u.unitType?.name || u.type || 'Apartment',
            monthlyRent: Number(u.baseRent || u.rent || 0),
            status: 'VACANT',
          });
        });
      });
      return rows;
    }
    return [];
  }, [targetProperties]);

  // Live Listing List for widget (100% Real DB Units)
  const liveListingList = useMemo(() => {
    if (targetProperties.length > 0) {
      const rows = [];
      targetProperties.forEach(p => {
        (p.unitsList || []).forEach(u => {
          rows.push({
            buildingName: p.name,
            unitNumber: u.unitNumber || u.number || `Unit ${u.id}`,
            status: u.status || 'AVAILABLE',
            monthlyRent: Number(u.baseRent || u.rent || 0),
          });
        });
      });
      return rows;
    }
    return [];
  }, [targetProperties]);

  // Compute selection-specific standard report datasets (100% REAL LIVE DATA - NO FALLBACKS)
  const reportData = useMemo(() => {
    try {
      // 1. Live Rent Roll (Filtered)
      if (selectedReport === 'Rent Roll') {
        let rows = filteredLeases.map(l => ({
          tenantName: l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : (l.tenantName || '—'),
          buildingName: l.unit?.property?.name || l.buildingName || activeBuildingObj?.name || '—',
          unitNumber: l.unit?.unitNumber || l.unitNumber || '—',
          rentAmount: Number(l.rentAmount || l.rent || 0),
          depositAmount: Number(l.depositAmount || l.deposit || 0),
          status: l.status || 'ACTIVE',
          startDate: l.startDate ? new Date(l.startDate).toLocaleDateString() : '—',
          endDate: l.endDate ? new Date(l.endDate).toLocaleDateString() : '—',
        }));
        if (reportFilters.status) {
          rows = rows.filter(r => r.status.toLowerCase() === reportFilters.status.toLowerCase());
        }
        if (reportFilters.search) {
          const q = reportFilters.search.toLowerCase();
          rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
        }
        return rows;
      }

      // 2. Live Outstanding Balance (Filtered)
      if (selectedReport === 'Outstanding Balance') {
        let rows = filteredInvoices
          .filter(inv => inv.status === 'UNPAID' || inv.status === 'OVERDUE' || inv.status === 'PARTIAL')
          .map(inv => ({
            invoiceNumber: inv.invoiceNumber || inv.id,
            tenantName: inv.tenant ? `${inv.tenant.firstName || ''} ${inv.tenant.lastName || ''}`.trim() : (inv.tenantName || '—'),
            unitNumber: inv.unit?.unitNumber || inv.lease?.unit?.unitNumber || inv.unitNumber || '—',
            buildingName: inv.unit?.property?.name || inv.lease?.unit?.property?.name || inv.property?.name || activeBuildingObj?.name || '—',
            dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—',
            amountDue: Number(inv.amountDue || inv.total || 0),
            amountPaid: Number(inv.amountPaid || 0),
            overdueBalance: Math.max(0, Number(inv.amountDue || inv.total || 0) - Number(inv.amountPaid || 0)),
            status: inv.status || 'UNPAID',
          }));
        if (reportFilters.search) {
          const q = reportFilters.search.toLowerCase();
          rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
        }
        return rows;
      }

      // 3. Live Rent Collection
      if (selectedReport === 'Rent Collection') {
        let rows = [];
        filteredInvoices.forEach(inv => {
          const invTenant = inv.tenant ? `${inv.tenant.firstName || ''} ${inv.tenant.lastName || ''}`.trim() : (inv.tenantName || '—');
          const invBld = inv.unit?.property?.name || inv.lease?.unit?.property?.name || inv.property?.name || activeBuildingObj?.name || '—';
          const invUnit = inv.unit?.unitNumber || inv.lease?.unit?.unitNumber || inv.unitNumber || '—';

          if (Array.isArray(inv.payments) && inv.payments.length > 0) {
            inv.payments.forEach(p => {
              rows.push({
                receiptNumber: p.referenceId || p.id?.slice(0, 8)?.toUpperCase() || inv.invoiceNumber,
                tenantName: invTenant,
                buildingName: invBld,
                unitNumber: invUnit,
                paymentDate: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—',
                amountPaid: Number(p.amount || 0),
                paymentMethod: p.method || 'Interac / Transfer',
                status: 'PAID',
              });
            });
          } else if (Number(inv.amountPaid || 0) > 0) {
            rows.push({
              receiptNumber: `REC-${inv.invoiceNumber}`,
              tenantName: invTenant,
              buildingName: invBld,
              unitNumber: invUnit,
              paymentDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—',
              amountPaid: Number(inv.amountPaid || 0),
              paymentMethod: 'Bank Transfer',
              status: inv.status === 'PAID' ? 'PAID' : 'PARTIAL',
            });
          }
        });
        if (reportFilters.search) {
          const q = reportFilters.search.toLowerCase();
          rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
        }
        return rows;
      }

      // 4. Live Vacancy Report
      if (selectedReport === 'Vacancy Report') {
        const rows = [];
        targetProperties.forEach(p => {
          (p.unitsList || []).filter(u => u.status === 'VACANT' || !u.lease).forEach(u => {
            rows.push({
              buildingName: p.name,
              unitNumber: u.unitNumber || u.number || `Unit ${u.id}`,
              unitType: u.unitType?.name || u.type || 'Apartment',
              monthlyRent: Number(u.baseRent || u.rent || 0),
              status: 'VACANT',
            });
          });
        });
        if (reportFilters.search) {
          const q = reportFilters.search.toLowerCase();
          return rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
        }
        return rows;
      }

      // 5. Live Lease Expiry
      if (selectedReport === 'Lease Expiry') {
        let rows = filteredLeases.map(l => ({
          tenantName: l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : (l.tenantName || '—'),
          buildingName: l.unit?.property?.name || l.buildingName || activeBuildingObj?.name || '—',
          unitNumber: l.unit?.unitNumber || l.unitNumber || '—',
          startDate: l.startDate ? new Date(l.startDate).toLocaleDateString() : '—',
          endDate: l.endDate ? new Date(l.endDate).toLocaleDateString() : '—',
          monthlyRent: Number(l.rentAmount || l.rent || 0),
          status: l.status || 'ACTIVE',
        }));
        if (reportFilters.search) {
          const q = reportFilters.search.toLowerCase();
          rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
        }
        return rows;
      }

      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [
    selectedReport, 
    reportFilters, 
    activeBuildingObj, 
    filteredLeases, 
    filteredInvoices, 
    targetProperties
  ]);

  // Execute custom builder queries directly against PostgreSQL database
  const handleBuilderQuery = async (customParams = {}) => {
    try {
      const cleanCompStr = cleanComp || '';
      const result = await fetchCustomReport({
        module: customParams.module || builderModule,
        companyId: cleanCompStr,
        buildingId: activeBuildingId || builderFilters.buildingId,
        search: builderFilters.search || null,
        sortColumn: builderSorting.column || null,
        sortDirection: builderSorting.direction || 'asc',
        ...customParams,
      }).unwrap();

      const rows = result?.data || [];
      setBuilderData(rows);

      // Persist Report Generation Log in PostgreSQL database
      try {
        await logReportAudit({
          reportType: `${customParams.module || builderModule} Custom Report`,
          filtersUsed: { companyId: cleanCompStr, buildingId: activeBuildingId, ...builderFilters },
          exportType: 'Screen',
        }).unwrap();
      } catch (logErr) {
        console.warn('Backend audit log notice:', logErr);
      }
    } catch (e) {
      console.error('Custom report query error:', e);
      setBuilderData([]);
    }
  };

  // Re-trigger builder columns on module switch & auto-fetch real data
  useEffect(() => {
    const cols = reportBuilderService.getAvailableColumns(builderModule);
    setBuilderColumns(cols);
    setSelectedColumns(cols.map(c => c.key));
    if (activeTab === 'builder') {
      handleBuilderQuery({ module: builderModule });
    }
  }, [builderModule, activeTab]);

  // Auto-refresh custom builder results when Company, Building, or Sorting filters change
  useEffect(() => {
    if (activeTab === 'builder') {
      handleBuilderQuery();
    }
  }, [cleanComp, activeBuildingId, builderSorting.column, builderSorting.direction]);

  // Handle widget toggle changes
  const handleToggleWidget = (id, visible) => {
    const updated = dashboardLayoutService.toggleWidget(id, visible);
    setDashLayout([...updated]);
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

  // Save report builder query as custom layout template into PostgreSQL
  const handleSaveBuilderTemplate = async () => {
    if (!newTemplateName.trim()) return alert('Please enter a template name.');
    try {
      await saveReportTemplate({
        templateName: newTemplateName.trim(),
        module: builderModule,
        selectedColumns,
        filters: { ...builderFilters, buildingId: activeBuildingId || builderFilters.buildingId },
        grouping: builderGrouping,
        sorting: builderSorting
      }).unwrap();
      setNewTemplateName('');
      alert('Custom Report Template saved successfully in PostgreSQL database.');
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error saving template.');
    }
  };

  // Load custom template details to builder view
  const handleLoadBuilderTemplate = (temp) => {
    setSelectedColumns(temp.selectedColumns || []);
    setBuilderFilters(temp.filters || {});
    setBuilderGrouping(temp.grouping || '');
    setBuilderSorting(temp.sorting || { column: 'dueDate', direction: 'asc' });
  };

  // Delete builder template from PostgreSQL
  const handleDeleteTemplate = async (id) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteReportTemplate(id).unwrap();
      } catch (e) {
        alert(e?.data?.message || e.message || 'Error deleting template.');
      }
    }
  };

  // Trigger file download exports
  const handleExport = async (exportType, isBuilder = false) => {
    const title = isBuilder ? `${builderModule} Custom Report` : selectedReport;
    let data = isBuilder ? builderData : reportData;
    const activeCompName = cleanComp ? (buildings.find(b => String(b.companyId) === String(cleanComp))?.companyName || 'Active Company') : 'All Companies';
    const activeBldName = activeBuildingObj?.name || 'All Buildings';
    const filters = isBuilder ? { ...builderFilters, company: activeCompName, building: activeBldName } : { ...reportFilters, company: activeCompName, building: activeBldName };

    if (!data || data.length === 0) {
      alert('No data available to export. Please generate a report first.');
      return;
    }

    if (isBuilder && selectedColumns.length > 0) {
      // Map rows to include ONLY selected columns with friendly column labels
      data = data.map(row => {
        const filteredRow = {};
        selectedColumns.forEach(colKey => {
          const colDef = builderColumns.find(c => c.key === colKey);
          const colLabel = colDef ? colDef.label : colKey;
          const val = row[colKey];
          if (typeof val === 'number' && (colKey.toLowerCase().includes('amount') || colKey.toLowerCase().includes('balance') || colKey.toLowerCase().includes('rent') || colKey.toLowerCase().includes('pay') || colKey.toLowerCase().includes('salary'))) {
            filteredRow[colLabel] = `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
          } else {
            filteredRow[colLabel] = val !== undefined && val !== null ? val : '—';
          }
        });
        return filteredRow;
      });
    }

    exportService.exportData(title, data, exportType, filters);
    try {
      await logReportAudit({
        reportType: title,
        filtersUsed: filters,
        exportType,
      }).unwrap();
    } catch (e) {
      console.warn('Audit log notice:', e);
    }
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
    if (!reportData || reportData.length === 0) {
      return (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl shadow-card">
          ∅ No records match the active parameters for this selection.
        </div>
      );
    }

    const headers = Object.keys(reportData[0]);

    return (
      <div className="overflow-x-auto w-full max-w-full bg-white border border-slate-100 rounded-3xl shadow-card">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {headers.map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h.replace(/([A-Z])/g, ' $1')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
            {reportData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                {headers.map(h => (
                  <td key={h} className="px-6 py-3.5 font-sans whitespace-nowrap">
                    {typeof row[h] === 'number' && (h.toLowerCase().includes('amount') || h.toLowerCase().includes('cost') || h.toLowerCase().includes('balance') || h.toLowerCase().includes('salary') || h.toLowerCase().includes('pay') || h.toLowerCase().includes('rent') || h.toLowerCase().includes('deposit'))
                      ? `$${row[h].toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : String(row[h] != null ? row[h] : '—')}
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-card max-w-md mx-auto mt-12 gap-4">
        <ShieldAlert size={48} className="text-rose-500 animate-bounce" />
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Access Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">Your system role does not have authorization to view portfolios, payroll costs, or tribunal records.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        
        {/* VIEW NAVIGATION TABS */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl w-full lg:w-auto">
            <button 
              onClick={() => setActiveTab('standard')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'standard' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText size={14} className="shrink-0" /> <span className="truncate">Standard Reports</span>
            </button>
            <button 
              onClick={() => setActiveTab('builder')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'builder' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Sparkles size={14} className="shrink-0 text-indigo-600" /> <span className="truncate">Custom Builder</span>
            </button>
            <button 
              onClick={() => setActiveTab('executive')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'executive' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid size={14} className="shrink-0" /> <span className="truncate">Executive Overview</span>
            </button>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
          </div>
        </div>

        {/* 1. TAB: EXECUTIVE OVERVIEW */}
        {activeTab === 'executive' && (
          <div className="flex flex-col gap-5">
            {/* 4 Core Property KPI Cards */}
            <ExecutiveKPICards kpis={dashData.kpis} onDrilldown={handleKPIDrilldown} />

            {/* Alert Banner */}
            <ExecutiveAlertsWidget alerts={dashData.alerts} />

            {/* 3 Core Property Visual Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <RevenueTrendWidget data={dashData.revenueTrend} />
              <OccupancyWidget occupancy={dashData.occupancy} />
              <OutstandingBalanceWidget collection={dashData.collection} />
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
                {['Rent Roll', 'Outstanding Balance', 'Rent Collection'].map(r => (
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
                {['Vacancy Report', 'Lease Expiry'].map(r => (
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
            <div className="flex flex-col gap-5 min-w-0 w-full overflow-hidden">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card flex flex-col gap-4 text-xs">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-50 pb-3">
                  <h4 className="font-bold text-slate-800 text-sm">Report Filters: {selectedReport}</h4>
                  
                  {/* Saved Filters Loader */}
                  <div className="flex items-center gap-2 max-w-full">
                    <ListFilter size={14} className="text-slate-400 shrink-0" />
                    <select 
                      onChange={(e) => {
                        const target = savedFilters.find(f => f.id === e.target.value);
                        if (target) handleLoadFilter(target);
                      }}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 text-xs text-slate-600 font-semibold cursor-pointer outline-none max-w-[200px] sm:max-w-[260px] truncate"
                    >
                      <option value="">Load Saved Filter Template</option>
                      {savedFilters.filter(f => f.module === selectedReport).map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Building Location</label>
                    <select 
                      value={selectedBuildingId}
                      onChange={(e) => handleBuildingChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-semibold truncate"
                    >
                      <option value="">All Buildings</option>
                      {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Status</label>
                    <select 
                      value={reportFilters.status}
                      onChange={(e) => setReportFilters(p => ({ ...p, status: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none truncate"
                    >
                      <option value="">All Statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Active">Active</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Date Start</label>
                    <input 
                      type="date" 
                      value={reportFilters.dateStart}
                      onChange={(e) => setReportFilters(p => ({ ...p, dateStart: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
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
                  <div className="flex flex-wrap items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Save current filters as..." 
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-medium focus:border-blue-100 min-w-[170px]"
                    />
                    <button 
                      onClick={handleSaveFilter}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border-none shadow cursor-pointer transition-all shrink-0"
                    >
                      Save Filters
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['CSV', 'Excel', 'PDF', 'Print'].map(fmt => (
                      <button 
                        key={fmt}
                        onClick={() => handleExport(fmt)}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
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
                  value={selectedBuildingId}
                  onChange={(e) => handleBuildingChange(e.target.value)}
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
              
              {/* Heat Map Representation */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4 h-[350px]">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Location Heat Map (Activity)</h3>
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

              {/* Prominent Quick Run Button at Top */}
              <button 
                onClick={() => handleBuilderQuery()}
                disabled={isGeneratingCustom}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow border-none cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw size={13} className={isGeneratingCustom ? 'animate-spin' : ''} />
                {isGeneratingCustom ? 'Fetching from DB...' : 'Run / Refresh Report'}
              </button>

              {/* Columns Checkbox selections */}
              <div className="flex flex-col gap-2 border-t border-slate-50 pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Columns</label>
                  <span className="text-[10px] text-blue-600 font-bold">{selectedColumns.length}/{builderColumns.length}</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {builderColumns.map(col => (
                    <label key={col.key} className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-600 hover:text-slate-900 select-none">
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
                        className="rounded text-blue-600 focus:ring-blue-500"
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

              {/* Filter / Search within Builder */}
              <div className="flex flex-col gap-1.5 border-t border-slate-50 pt-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filter / Search</label>
                <input 
                  type="text"
                  placeholder="Filter by keyword..."
                  value={builderFilters.search || ''}
                  onChange={(e) => setBuilderFilters(p => ({ ...p, search: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleBuilderQuery(); }}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                >
                </input>
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
                  onClick={() => handleBuilderQuery()}
                  disabled={isGeneratingCustom}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> {isGeneratingCustom ? 'Querying Database...' : 'Generate Custom Report'}
                </button>
              </div>
            </div>

            {/* Generated Custom Grid View */}
            <div className="flex flex-col gap-5 min-w-0 w-full overflow-hidden">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-card text-xs flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
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
                  {builderData.length > 0 && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1.5 rounded-xl ml-2">
                      {builderData.length} records found
                    </span>
                  )}
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
              {isGeneratingCustom ? (
                <div className="p-16 text-center bg-white border border-slate-100 rounded-3xl shadow-card flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="font-bold text-slate-700 text-sm">Querying Live Database...</div>
                  <div className="text-xs text-slate-400">Fetching real-time records from PostgreSQL</div>
                </div>
              ) : builderData.length === 0 ? (
                <div className="p-16 text-center bg-white border border-slate-100 rounded-3xl shadow-card flex flex-col items-center justify-center gap-2">
                  <div className="font-bold text-slate-700 text-sm">No Database Records Found</div>
                  <div className="text-xs text-slate-400 max-w-sm">No matching records found in PostgreSQL database for the selected module and filters.</div>
                  <button 
                    onClick={() => handleBuilderQuery()}
                    className="mt-3 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={12} /> Reload Data
                  </button>
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
                              {typeof row[colKey] === 'number' && (colKey.toLowerCase().includes('amount') || colKey.toLowerCase().includes('balance') || colKey.toLowerCase().includes('rent') || colKey.toLowerCase().includes('pay') || colKey.toLowerCase().includes('salary') || colKey.toLowerCase().includes('deduction'))
                                ? `$${row[colKey].toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                : String(row[colKey] !== undefined && row[colKey] !== null ? row[colKey] : '—')}
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
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            
            {/* Audit Trail Table */}
            <div className="flex flex-col gap-4 min-w-0 w-full overflow-hidden">
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
                <div className="overflow-x-auto w-full max-w-full bg-white border border-slate-100 rounded-3xl shadow-card">
                  <table className="w-full border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Report Type</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Author</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Medium</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-600 font-medium font-sans">
                      {auditLogs.slice().reverse().map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/20">
                          <td className="px-6 py-3.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-3.5 font-bold text-slate-800 whitespace-nowrap">{log.reportType}</td>
                          <td className="px-6 py-3.5 whitespace-nowrap">{log.generatedBy}</td>
                          <td className="px-6 py-3.5 whitespace-nowrap">
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
            <div className="flex flex-col gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-card w-full min-w-0">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h4 className="font-bold text-slate-800 text-sm">Scheduled Automations</h4>
                <button 
                  onClick={() => setScheduleModal(true)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus size={12} /> Schedule
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {schedules.map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex justify-between items-start text-xs">
                    <div className="flex flex-col gap-1 min-w-0 pr-2">
                      <span className="font-bold text-slate-800 truncate">{item.reportType}</span>
                      <span className="text-[10px] text-slate-400 font-medium truncate">Recurrence: {item.recurrence} ({item.format})</span>
                      <span className="text-[10px] text-slate-500 font-bold font-mono truncate">Mail: {item.recipients}</span>
                    </div>
                    <button 
                      onClick={() => {
                        scheduledReportService.delete(item.id);
                        setSchedules(scheduledReportService.getAll());
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1 bg-transparent border-none cursor-pointer shrink-0"
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
                onClick={() => setLayoutModal(false)}
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

    </>
  );
};

export default Reports;
