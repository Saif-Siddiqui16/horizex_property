import React, { useState, useEffect, useMemo } from 'react';
import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
} from '../store/api/maintenanceApi';
import { useGetPropertiesQuery } from '../store/api/propertiesApi';


// Services
import { maintenanceService } from '../services/maintenanceService';
import { workOrderService } from '../services/workOrderService';
import { technicianService } from '../services/technicianService';
import { vendorService } from '../services/vendorService';
import { assetService } from '../services/assetService';
import { furnitureService } from '../services/furnitureService';
import { inventoryService } from '../services/inventoryService';
import { maintenanceCalendarService } from '../services/maintenanceCalendarService';
import { preventiveMaintenanceService } from '../services/preventiveMaintenanceService';
import { repairCostService } from '../services/repairCostService';
import {
  maintenanceAnalyticsService,
  vendorAnalyticsService,
  technicianAnalyticsService,
  assetAnalyticsService,
  inventoryAnalyticsService
} from '../services/maintenanceAnalyticsService';
import { maintenanceAuditService } from '../services/maintenanceAuditService';

// Reusable Components
import {
  MaintenanceKPICards,
  MaintenanceRequestTable,
  WorkOrderTable,
  TechnicianBoard,
  VendorTable,
  AssetTable,
  FurnitureTable,
  InventoryTable,
  PreventiveMaintenanceWidget,
  MaintenanceCalendar,
  MaintenanceTimeline,
  RepairCostWidget,
  OpenRepairsWidget,
  EmergencyRepairsWidget,
  VendorPerformanceWidget,
  TechnicianUtilizationWidget,
  AssetHealthWidget,
  InventoryAlertsWidget,
  MaintenanceQuickActions,
  ApartmentMaintenanceCard,
  TenantMaintenanceCard,
  AssetHistoryCard
} from '../components/maintenance/MaintenanceWidgets';

import { hasPermission } from '../utils/permissions';
import { Plus, X } from 'lucide-react';
export const Maintenance = () => {
  const [__forceUpdate, __setForceUpdate] = useState(0);
  useEffect(() => {
    const handleUpdate = () => __setForceUpdate(p => p + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  // RBAC Permission Guard
  if (!hasPermission('Maintenance', 'view')) {
    return (
      <>
        <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-8">
          <h3 className="text-xl font-black text-slate-800">Access Restricted</h3>
          <p className="max-w-md mx-auto mt-2 text-slate-500 font-medium italic">
            You do not have permission to view this section. Please contact your administrator.
          </p>
        </div>
      </>
    );
  }

  // Active workspace tab
  const [activeTab, setActiveTab] = useState('overview');

  // Filter conditions
  const [selectedBuildingId, setSelectedBuildingId] = useState('all');
  const [selectedApartmentId, setSelectedApartmentId] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Loaded database states
  const [requests, setRequests] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [parts, setParts] = useState([]);
  const [preventive, setPreventive] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [audits, setAudits] = useState([]);

  // Analytics states
  const [stats, setStats] = useState({ open: 0, inProgress: 0, waitingParts: 0, waitingVendor: 0, emergency: 0 });
  const [costSummary, setCostSummary] = useState({ budget: 0, actual: 0 });
  const [costByBuilding, setCostByBuilding] = useState([]);
  const [vendorStats, setVendorStats] = useState({ performance: [] });
  const [techStats, setTechStats] = useState([]);
  const [assetStats, setAssetStats] = useState({});
  const [inventoryStats, setInventoryStats] = useState({ lowStockList: [] });

  // Detail View Focus
  const [focusedRequest, setFocusedRequest] = useState(null);

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState({
    buildingId: 'building-1',
    apartmentId: 'unit-101',
    category: 'Plumbing',
    priority: 'Medium',
    description: '',
    assignedTechnicianId: '',
    assignedVendorId: '',
    photos: []
  });
  const [newWorkOrderForm, setNewWorkOrderForm] = useState({
    requestId: '',
    technicianId: '',
    vendorId: '',
    estimatedCost: 100.00
  });

  // Company Context State
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    return localStorage.getItem('global_selected_company_id') || localStorage.getItem('companyContext') || '';
  });

  // RTK Queries & Mutations
  const queryParams = useMemo(() => {
    const p = {};
    if (selectedCompanyId && selectedCompanyId !== 'all') p.companyId = selectedCompanyId;
    if (selectedBuildingId && selectedBuildingId !== 'all') p.propertyId = selectedBuildingId;
    if (selectedPriority) p.priority = selectedPriority.toUpperCase();
    if (selectedStatus) {
      const upper = selectedStatus.toUpperCase().replace(/\s+/g, '_');
      if (upper === 'NEW' || upper === 'SUBMITTED' || upper === 'OPEN' || upper === 'DRAFT') p.status = 'SUBMITTED';
      else if (upper === 'IN_PROGRESS' || upper === 'ASSIGNED') p.status = 'IN_PROGRESS';
      else if (upper === 'WAITING_PARTS' || upper === 'WAITING_VENDOR' || upper === 'PENDING_PARTS') p.status = 'PENDING_PARTS';
      else if (upper === 'COMPLETED' || upper === 'RESOLVED') p.status = 'RESOLVED';
      else if (upper === 'CLOSED') p.status = 'CLOSED';
      else p.status = upper;
    }
    return Object.keys(p).length > 0 ? p : undefined;
  }, [selectedCompanyId, selectedBuildingId, selectedPriority, selectedStatus]);

  const { data: backendTickets = [], isLoading: isTicketsLoading, isSuccess: isTicketsSuccess, refetch: refetchTickets } = useGetTicketsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });
  const { data: propertiesData = [] } = useGetPropertiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createTicketMutation] = useCreateTicketMutation();
  const [updateTicketStatusMutation] = useUpdateTicketStatusMutation();

  // Unified properties list
  const properties = useMemo(() => {
    if (propertiesData && propertiesData.length > 0) {
      if (selectedCompanyId && selectedCompanyId !== 'all') {
        const filtered = propertiesData.filter(p => String(p.companyId) === String(selectedCompanyId));
        return filtered.length > 0 ? filtered : propertiesData;
      }
      return propertiesData;
    }
    return JSON.parse(localStorage.getItem('mock_properties') || '[]');
  }, [propertiesData, selectedCompanyId]);

  // Selected building units for modal
  const selectedBuildingUnits = useMemo(() => {
    const prop = properties.find(p => p.id === newRequestForm.buildingId);
    return prop?.units || [];
  }, [properties, newRequestForm.buildingId]);

  // Auto-select valid building/unit on load
  useEffect(() => {
    if (properties.length > 0 && (!newRequestForm.buildingId || newRequestForm.buildingId === 'building-1')) {
      const firstProp = properties[0];
      const firstUnit = firstProp.units?.[0]?.id || 'unit-101';
      setNewRequestForm(prev => ({
        ...prev,
        buildingId: firstProp.id,
        apartmentId: firstUnit,
      }));
    }
  }, [properties]);

  // Normalized backend tickets
  const normalizedBackendRequests = useMemo(() => {
    if (!backendTickets || !Array.isArray(backendTickets)) return null;
    return backendTickets.map(t => {
      const rawPriority = t.priority || 'MEDIUM';
      const priority = rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase();

      let status = 'New';
      if (t.status === 'IN_PROGRESS') status = 'In Progress';
      else if (t.status === 'PENDING_PARTS') status = 'Waiting Parts';
      else if (t.status === 'RESOLVED') status = 'Completed';
      else if (t.status === 'CLOSED') status = 'Closed';
      else if (t.status === 'SUBMITTED') status = 'New';
      else status = t.status || 'New';

      const resolvedBuildingName = t.property?.name || (properties.find(p => p.id === t.propertyId)?.name) || t.propertyId || 'Building';
      const resolvedUnitNumber = t.unit?.unitNumber || String(t.unitId || '').replace(/^unit-/i, '') || 'Unit';

      return {
        id: t.id,
        ticketNumber: `TICK-${t.id.slice(0, 8).toUpperCase()}`,
        buildingId: resolvedBuildingName,
        buildingName: resolvedBuildingName,
        apartmentId: resolvedUnitNumber,
        propertyId: t.propertyId,
        unitId: t.unitId,
        category: t.title || 'General',
        priority,
        description: t.description || '',
        status,
        assignedTechnicianId: t.assignee?.id || '',
        assignedVendorId: '',
        photos: t.photoUrls || [],
        documents: [],
        receipts: [],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        createdBy: t.tenant ? `${t.tenant.firstName || ''} ${t.tenant.lastName || ''}`.trim() : 'Admin User',
        rawTicket: t,
      };
    });
  }, [backendTickets, properties]);

  const refreshWorkspaceData = () => {
    const filters = {
      buildingId: selectedBuildingId,
      apartmentId: selectedApartmentId,
      priority: selectedPriority,
      status: selectedStatus,
      category: selectedCategory,
      search: searchQuery
    };

    const resolvePropName = (bId, pId) => {
      const match = properties.find(p => p.id === bId || p.id === pId || p.name === bId);
      if (match?.name) return match.name;
      if (bId === 'building-1' && properties[0]?.name) return properties[0].name;
      if (bId === 'building-2' && properties[1]?.name) return properties[1].name;
      if (bId === 'building-3' && properties[2]?.name) return properties[2].name;
      if (bId === 'building-4' && properties[3]?.name) return properties[3].name;
      return bId;
    };

    const rawLocalReqs = maintenanceService.getAll(filters);
    const localReqs = rawLocalReqs.map(r => {
      const propName = resolvePropName(r.buildingId, r.propertyId);
      const cleanUnit = String(r.apartmentId || '').replace(/^unit-/i, '');
      const matchedProp = properties.find(p => p.id === r.buildingId || p.name === propName);
      return {
        ...r,
        buildingName: propName,
        buildingId: propName,
        apartmentId: cleanUnit || r.apartmentId,
        propertyId: matchedProp?.id || r.buildingId,
      };
    });

    if (isTicketsSuccess && normalizedBackendRequests) {
      const filteredBackend = normalizedBackendRequests.filter(r => {
        if (selectedBuildingId && selectedBuildingId !== 'all') {
          const selectedProp = properties.find(p => p.id === selectedBuildingId);
          const selectedName = selectedProp?.name || selectedBuildingId;
          const matches = r.propertyId === selectedBuildingId || 
                          r.buildingId === selectedBuildingId ||
                          r.buildingName === selectedName ||
                          r.buildingId === selectedName;
          if (!matches) return false;
        }
        if (selectedPriority && r.priority.toLowerCase() !== selectedPriority.toLowerCase()) return false;
        if (selectedStatus && r.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
        if (selectedCategory && r.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (r.id && r.id.toLowerCase().includes(q)) ||
            (r.ticketNumber && r.ticketNumber.toLowerCase().includes(q)) ||
            (r.description && r.description.toLowerCase().includes(q)) ||
            (r.category && r.category.toLowerCase().includes(q)) ||
            (r.buildingId && String(r.buildingId).toLowerCase().includes(q)) ||
            (r.apartmentId && String(r.apartmentId).toLowerCase().includes(q));
        }
        return true;
      });
      setRequests(filteredBackend);
    } else {
      let filteredLocal = localReqs;
      if (selectedBuildingId && selectedBuildingId !== 'all') {
        const selectedProp = properties.find(p => p.id === selectedBuildingId);
        const selectedName = selectedProp?.name || selectedBuildingId;
        filteredLocal = localReqs.filter(r => 
          r.propertyId === selectedBuildingId || 
          r.buildingId === selectedBuildingId ||
          r.buildingName === selectedName ||
          r.buildingId === selectedName
        );
      }
      setRequests(filteredLocal);
    }

    // Filter work orders
    let allWos = workOrderService.getAll();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allWos = allWos.filter(w =>
        (w.id && w.id.toLowerCase().includes(q)) ||
        (w.requestId && w.requestId.toLowerCase().includes(q)) ||
        (w.technicianId && w.technicianId.toLowerCase().includes(q)) ||
        (w.vendorId && w.vendorId.toLowerCase().includes(q))
      );
    }
    setWorkOrders(allWos);

    setTechnicians(technicianService.getAll());

    // Filter vendors
    let allVendors = vendorService.getAll();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allVendors = allVendors.filter(v =>
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.vendorNo && v.vendorNo.toLowerCase().includes(q)) ||
        ((v.services || []).some(s => s.toLowerCase().includes(q)))
      );
    }
    setVendors(allVendors);

    // Filter assets
    let allAssets = assetService.getAll({ buildingId: selectedBuildingId });
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allAssets = allAssets.filter(a =>
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.assetNo && a.assetNo.toLowerCase().includes(q)) ||
        (a.serialNumber && a.serialNumber.toLowerCase().includes(q))
      );
    }
    setAssets(allAssets);

    // Filter furniture
    let allFurniture = furnitureService.getAll({ buildingId: selectedBuildingId });
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allFurniture = allFurniture.filter(f =>
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.furnitureNo && f.furnitureNo.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q))
      );
    }
    setFurniture(allFurniture);

    // Filter parts
    let allParts = inventoryService.getAllParts();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allParts = allParts.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.partNo && p.partNo.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    setParts(allParts);

    setPreventive(preventiveMaintenanceService.getAll());
    setCalendarEvents(maintenanceCalendarService.getAllEvents());
    setAudits(maintenanceAuditService.getAll());

    // Analytics compilation
    const baseStats = maintenanceAnalyticsService.getKPIMetrics();
    if (isTicketsSuccess && normalizedBackendRequests && normalizedBackendRequests.length > 0) {
      const open = normalizedBackendRequests.filter(r => r.status === 'New' || r.status === 'Draft').length;
      const inProgress = normalizedBackendRequests.filter(r => r.status === 'In Progress').length;
      const waitingParts = normalizedBackendRequests.filter(r => r.status === 'Waiting Parts').length;
      const emergency = normalizedBackendRequests.filter(r => r.priority === 'Emergency' || r.priority === 'High').length;
      setStats({
        ...baseStats,
        open,
        inProgress,
        waitingParts,
        emergency,
      });
    } else {
      setStats(baseStats);
    }

    setCostSummary(repairCostService.getSummary());
    setCostByBuilding(repairCostService.getCostByBuilding());
    setVendorStats(vendorAnalyticsService.getSummary());
    setTechStats(technicianAnalyticsService.getSummary());
    setAssetStats(assetAnalyticsService.getSummary());
    setInventoryStats(inventoryAnalyticsService.getSummary());
  };

  // Sync with Global Company Selector & Filters
  useEffect(() => {
    refreshWorkspaceData();

    const handleCompanyChange = () => {
      const current = localStorage.getItem('global_selected_company_id') || localStorage.getItem('companyContext') || '';
      setSelectedCompanyId(current);
      if (typeof refetchTickets === 'function') refetchTickets();
      refreshWorkspaceData();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    window.addEventListener('storage', handleCompanyChange);
    return () => {
      window.removeEventListener('companyChanged', handleCompanyChange);
      window.removeEventListener('storage', handleCompanyChange);
    };
  }, [selectedBuildingId, selectedApartmentId, selectedPriority, selectedStatus, selectedCategory, searchQuery, normalizedBackendRequests, isTicketsSuccess, refetchTickets]);

  // ── OPERATIONS HANDLERS ───────────────────────────────────────────────

  // Requests creation
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const matchedProp = properties.find(p => p.id === newRequestForm.buildingId);

    const requestPayload = {
      ...newRequestForm,
      companyId: matchedProp ? (matchedProp.companyId || selectedCompanyId || 'company-1') : (selectedCompanyId || 'company-1'),
      tenantId: 'tenant-1',
      leaseId: 'lease-1',
      status: 'New',
      createdBy: 'Admin User'
    };

    maintenanceService.create(requestPayload);

    // Send to backend via RTK Query mutation
    try {
      const selectedPropId = newRequestForm.buildingId || properties[0]?.id || 'building-1';
      const selectedUnitId = newRequestForm.apartmentId || matchedProp?.units?.[0]?.id || 'unit-101';
      await createTicketMutation({
        propertyId: selectedPropId,
        unitId: selectedUnitId,
        title: newRequestForm.category || 'Maintenance Request',
        description: newRequestForm.description,
        priority: newRequestForm.priority.toUpperCase(),
      }).unwrap();
    } catch (err) {
      console.warn('Backend ticket creation notice:', err);
    }

    setShowRequestModal(false);
    setNewRequestForm({
      buildingId: properties[0]?.id || 'building-1',
      apartmentId: properties[0]?.units?.[0]?.id || 'unit-101',
      category: 'Plumbing',
      priority: 'Medium',
      description: '',
      assignedTechnicianId: '',
      assignedVendorId: '',
      photos: []
    });
    refreshWorkspaceData();
  };

  // Workflow status updates
  const handleStatusChange = async (id, newStatus) => {
    maintenanceService.updateStatus(id, newStatus, 'System Operator');
    refreshWorkspaceData();

    // Update via RTK Query mutation
    try {
      await updateTicketStatusMutation({
        id,
        status: newStatus,
        resolutionNote: newStatus === 'Completed' || newStatus === 'Closed' ? 'Resolved by operator' : undefined,
      }).unwrap();
    } catch (err) {
      console.warn('Backend ticket status update notice:', err);
    }
  };

  // Work Orders assignment
  const handleWorkOrderSubmit = (e) => {
    e.preventDefault();
    if (!newWorkOrderForm.requestId) return;

    workOrderService.create(newWorkOrderForm);
    setShowWorkOrderModal(false);
    setNewWorkOrderForm({
      requestId: '',
      technicianId: '',
      vendorId: '',
      estimatedCost: 100.00
    });
    refreshWorkspaceData();
  };

  // Technicians Shifts Clocking
  const handleToggleClock = (id) => {
    technicianService.toggleClock(id);
    refreshWorkspaceData();
  };

  // Lifecycle changes on assets
  const handleAssetLifecycleChange = (id, newStatus) => {
    assetService.updateLifecycle(id, newStatus, `Transitioned state to ${newStatus} on Asset registry.`);
    refreshWorkspaceData();
  };

  // Condition checks on furniture items
  const handleFurnitureConditionChange = (id, newCondition) => {
    furnitureService.updateCondition(id, newCondition);
    refreshWorkspaceData();
  };

  // Inventory movements posting
  const handlePostInventoryMovement = (partId, type, qty, note) => {
    inventoryService.logMovement(partId, type, qty, note);
    refreshWorkspaceData();
  };

  // Complete preventive maintenance runs
  const handleCompletePMCycle = (id) => {
    preventiveMaintenanceService.completeCycle(id);
    refreshWorkspaceData();
  };

  const tabs = [
    { id: 'overview', label: 'Operations Dashboard' },
    { id: 'requests', label: 'Maintenance Requests' },
    { id: 'workorders', label: 'Work Orders' },
    { id: 'preventive', label: 'Preventive Checks' },
    { id: 'techs', label: 'Technicians clock' },
    { id: 'vendors', label: 'Vendors contracts' },
    { id: 'assets', label: 'Asset lifecycle' },
    { id: 'furniture', label: 'Furniture checklist' },
    { id: 'inventory', label: 'Warehouse Stock' },
    { id: 'calendar', label: 'Repairs Calendar' }
  ];

  return (
    <>
      <div className="flex flex-col gap-6 w-full pb-24">

        {/* Operations KPI Strip */}
        <MaintenanceKPICards stats={stats} />

        {/* Filters Tray */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold text-slate-700">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase text-slate-400">Property</span>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl outline-none"
            >
              <option value="all">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase text-slate-400">Priority</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase text-slate-400">Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl outline-none"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting Parts">Waiting Parts</option>
              <option value="Completed">Completed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase text-slate-400">Search Keywords</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. plumbing leak..."
              className="p-2 border border-slate-200 rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Tab system tray */}
        <div className="flex border-b border-slate-200/60 overflow-x-auto gap-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFocusedRequest(null);
              }}
              className={`py-3 px-4.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all outline-none cursor-pointer ${activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: OVERVIEW DASHBOARD ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <OpenRepairsWidget stats={stats} onTabRedirect={setActiveTab} />
            <EmergencyRepairsWidget stats={stats} onTabRedirect={setActiveTab} />
            <InventoryAlertsWidget summary={inventoryStats} onTabRedirect={setActiveTab} />

            <div className="lg:col-span-2 flex flex-col gap-6">
              <TechnicianUtilizationWidget analytics={techStats} />
              <PreventiveMaintenanceWidget preventive={preventive.slice(0, 3)} onCompleteCycle={handleCompletePMCycle} />
            </div>

            <div className="flex flex-col gap-6">
              <MaintenanceQuickActions
                onCreateRequest={() => setShowRequestModal(true)}
                onClockTech={() => setActiveTab('techs')}
                onPostInventory={() => setActiveTab('inventory')}
              />
              <AssetHealthWidget summary={assetStats} />
            </div>

            <div className="lg:col-span-2">
              <VendorPerformanceWidget analytics={vendorStats} />
            </div>

            <div>
              <RepairCostWidget summary={costSummary} costByBuilding={costByBuilding} />
            </div>

            <div className="lg:col-span-3">
              <MaintenanceTimeline logs={audits.slice(0, 6)} />
            </div>
          </div>
        )}

        {/* ── TAB 2: REQUESTS ────────────────────────────────────────────── */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-white border border-slate-100 rounded-3xl p-4 shadow-sm text-xs font-bold">
              <div>
                <h4 className="font-bold text-slate-800 text-sm font-black">Maintenance Request Directory</h4>
                <p className="text-[10px] text-slate-400 font-medium">Log tenant issues and dispatch workflows</p>
              </div>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer border-none"
              >
                <Plus size={14} /> File Request Ticket
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <MaintenanceRequestTable
                  requests={requests}
                  onSelect={setFocusedRequest}
                  onStatusChange={handleStatusChange}
                />
              </div>

              <div>
                {focusedRequest ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="font-bold text-slate-800 text-sm font-black">Request Detail</span>
                      <button onClick={() => setFocusedRequest(null)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer font-bold">×</button>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between">
                        <span>Ticket ID:</span>
                        <span className="font-mono font-bold text-slate-800">{focusedRequest.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property:</span>
                        <span className="font-bold text-slate-800">{focusedRequest.buildingName || focusedRequest.buildingId} - Apt {String(focusedRequest.apartmentId).replace(/^unit-/i, '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-bold text-slate-800">{focusedRequest.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-bold text-slate-800">{new Date(focusedRequest.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</span>
                      <p className="bg-slate-50 p-3 rounded-2xl font-medium border border-slate-100 text-slate-700 leading-relaxed">
                        {focusedRequest.description}
                      </p>
                    </div>

                    {/* Mapped work orders costs */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Child Work Orders</span>
                      {workOrders.filter(w => w.requestId === focusedRequest.id).map(w => (
                        <div key={w.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between font-mono">
                          <span>{w.id}</span>
                          <span className="text-indigo-600 font-bold">${w.actualCost}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions links to trigger work order */}
                    <button
                      onClick={() => {
                        setNewWorkOrderForm({ ...newWorkOrderForm, requestId: focusedRequest.id });
                        setShowWorkOrderModal(true);
                      }}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border-none shadow-sm cursor-pointer text-center"
                    >
                      Issue Work Order
                    </button>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 italic bg-white border border-slate-100 rounded-3xl font-medium shadow-sm">
                    Select a request row to view detailed workflow, timeline, and document lists.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: WORK ORDERS ─────────────────────────────────────────── */}
        {activeTab === 'workorders' && (
          <WorkOrderTable
            workOrders={workOrders}
            onCreate={() => setShowWorkOrderModal(true)}
          />
        )}

        {/* ── TAB 4: PREVENTIVE MAINTENANCE ──────────────────────────────── */}
        {activeTab === 'preventive' && (
          <PreventiveMaintenanceWidget
            preventive={preventive}
            onCompleteCycle={handleCompletePMCycle}
          />
        )}

        {/* ── TAB 5: TECHNICIANS ─────────────────────────────────────────── */}
        {activeTab === 'techs' && (
          <div className="flex flex-col gap-6">
            <TechnicianBoard
              technicians={technicians}
              onToggleClock={handleToggleClock}
            />

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Clock Log & Mapped Payroll hours</h3>
                <p className="text-[10px] text-slate-400 font-medium">Automatic payroll allocations synced directly from work order sheets</p>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Technician</th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Role</th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-center">Clock Status</th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-center">Total Working Hours</th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-center font-bold text-indigo-600">Payroll Synced Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {techStats.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="px-4 py-3 font-bold text-slate-800">{t.name}</td>
                        <td className="px-4 py-3">{t.role}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.pendingCount > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-400'}`}>
                            {t.pendingCount} active jobs
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{t.payrollHours} hrs</td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-600">{t.payrollHours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: VENDORS ────────────────────────────────────────────── */}
        {activeTab === 'vendors' && (
          <VendorTable vendors={vendors} />
        )}

        {/* ── TAB 7: ASSETS ─────────────────────────────────────────────── */}
        {activeTab === 'assets' && (
          <AssetTable
            assets={assets}
            onLifecycleChange={handleAssetLifecycleChange}
          />
        )}

        {/* ── TAB 8: FURNITURE ──────────────────────────────────────────── */}
        {activeTab === 'furniture' && (
          <FurnitureTable
            furniture={furniture}
            onConditionChange={handleFurnitureConditionChange}
          />
        )}

        {/* ── TAB 9: INVENTORY ──────────────────────────────────────────── */}
        {activeTab === 'inventory' && (
          <InventoryTable
            parts={parts}
            onLogMovement={handlePostInventoryMovement}
          />
        )}

        {/* ── TAB 10: CALENDAR ──────────────────────────────────────────── */}
        {activeTab === 'calendar' && (
          <MaintenanceCalendar events={calendarEvents} />
        )}

        {/* ── CREATE REQUEST MODAL ── */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleRequestSubmit} className="bg-white rounded-[2rem] p-6 max-w-md w-full flex flex-col gap-4 shadow-float animate-zoom-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">File Maintenance Request</h3>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold border-none bg-transparent cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3.5 text-xs font-bold text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Property</label>
                    <select
                      value={newRequestForm.buildingId}
                      onChange={(e) => {
                        const bId = e.target.value;
                        const prop = properties.find(p => p.id === bId);
                        const firstUnit = prop?.units?.[0]?.id || 'unit-101';
                        setNewRequestForm({ ...newRequestForm, buildingId: bId, apartmentId: firstUnit });
                      }}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700"
                    >
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit / Apartment</label>
                    <select
                      value={newRequestForm.apartmentId}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, apartmentId: e.target.value })}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700"
                    >
                      {selectedBuildingUnits.length > 0 ? (
                        selectedBuildingUnits.map(u => (
                          <option key={u.id} value={u.id}>Unit {u.unitNumber || u.name || u.id}</option>
                        ))
                      ) : (
                        <option value="unit-101">Unit 101 (General)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select
                      value={newRequestForm.category}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, category: e.target.value })}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="HVAC">HVAC / Heating</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Elevator">Elevator</option>
                      <option value="Structure">Structural</option>
                      <option value="Cleaning">Cleaning</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                    <select
                      value={newRequestForm.priority}
                      onChange={(e) => setNewRequestForm({ ...newRequestForm, priority: e.target.value })}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Request Description</label>
                  <textarea
                    value={newRequestForm.description}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, description: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-600 outline-none h-20 resize-none"
                    placeholder="Provide details about the required repair..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl border-none shadow-md cursor-pointer uppercase tracking-wider"
                >
                  File Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── CREATE WORK ORDER MODAL ── */}
        {showWorkOrderModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleWorkOrderSubmit} className="bg-white rounded-[2rem] p-6 max-w-md w-full flex flex-col gap-4 shadow-float animate-zoom-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Issue Repair Work Order</h3>
                <button
                  type="button"
                  onClick={() => setShowWorkOrderModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold border-none bg-transparent cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3.5 text-xs font-bold text-slate-700">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Request Ticket</label>
                  <select
                    value={newWorkOrderForm.requestId}
                    onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, requestId: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  >
                    <option value="">-- Choose Ticket --</option>
                    {requests.map(r => (
                      <option key={r.id} value={r.id}>{r.id}: {r.category} ({r.priority})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assign Technician</label>
                    <select
                      value={newWorkOrderForm.technicianId}
                      onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, technicianId: e.target.value, vendorId: '' })}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="">-- Internal Tech --</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Or Assign Vendor</label>
                    <select
                      value={newWorkOrderForm.vendorId}
                      onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, vendorId: e.target.value, technicianId: '' })}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="">-- External Vendor --</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimated Cost Budget ($)</label>
                  <input
                    type="number"
                    value={newWorkOrderForm.estimatedCost}
                    onChange={(e) => setNewWorkOrderForm({ ...newWorkOrderForm, estimatedCost: Number(e.target.value) })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowWorkOrderModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl border-none shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Issue Work Order
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </>
  );
};
