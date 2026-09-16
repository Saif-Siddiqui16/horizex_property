import axios from 'axios';
import * as mockDb from '../mock/mockServices';

const api = axios.create({
    baseURL: 'https://saif-property-client-railway-production.up.railway.app',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Custom adapter to run offline using mockServices.js
api.defaults.adapter = async (config) => {
  const urlStr = config.url || '';
  let path = urlStr.replace(config.baseURL || '', '');
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    const parts = path.split('/api');
    if (parts.length > 1) {
      path = '/api' + parts.slice(1).join('/api');
    }
  }

  const [cleanPath, queryString] = path.split('?');
  const query = new URLSearchParams(queryString || '');
  const method = (config.method || 'get').toLowerCase();

  let body = {};
  if (config.data) {
    if (typeof config.data === 'string') {
      try {
        body = JSON.parse(config.data);
      } catch (e) {
        body = config.data;
      }
    } else {
      body = config.data;
    }
  }

  // Helper for status 200 response
  const response200 = (data) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
    request: {}
  });

  // Handle export / download binary blob requests
  if (config.responseType === 'blob' || cleanPath.includes('export') || cleanPath.includes('download')) {
    return {
      data: new Blob(['dummy document content'], { type: 'application/pdf' }),
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/pdf' },
      config,
      request: {}
    };
  }

  // --- ROUTING PATHS ---

  // Auth & Permissions
  if (cleanPath === '/api/auth/login') {
    const email = body.email || 'admin@property.com';
    let role = 'ADMIN';
    let id = 1;
    let name = 'Admin User';
    
    if (email.includes('tenant')) {
      role = 'TENANT';
      id = 101;
      name = 'Tenant User';
    } else if (email.includes('owner')) {
      role = 'OWNER';
      id = 3;
      name = 'Owner User';
    } else if (email.includes('coworker')) {
      role = 'COWORKER';
      id = 4;
      name = 'Sarah Smith';
    }

    const resData = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id, email, name, role }
    };
    return response200(resData);
  }

  if (cleanPath === '/api/admin/my-permissions') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const res = await mockDb.mockEmployeeService.getAll();
      const emp = res.data.find(e => e.id === parseInt(user.id));
      return response200(emp ? emp.permissions : mockDb.mockPermissions);
    }
    return response200(mockDb.mockPermissions);
  }

  const coworkerPermsMatch = cleanPath.match(/\/api\/admin\/coworkers\/(\d+)\/permissions/);
  if (coworkerPermsMatch) {
    if (method === 'get') {
      const res = await mockDb.mockEmployeeService.getAll();
      const emp = res.data.find(e => e.id === parseInt(coworkerPermsMatch[1]));
      return response200(emp ? emp.permissions : mockDb.mockPermissions);
    } else {
      const res = await mockDb.mockEmployeeService.updatePermissions(coworkerPermsMatch[1], body);
      return response200(res.data);
    }
  }

  // Companies
  if (cleanPath === '/api/admin/companies') {
    const res = await mockDb.mockCompanyService.getAll();
    return response200(res.data);
  }

  // Properties / Buildings
  if (cleanPath === '/api/admin/properties') {
    if (method === 'get') {
      const search = query.get('search') || '';
      const res = await mockDb.mockPropertyService.getAll(search);
      return response200(res.data);
    } else {
      const res = await mockDb.mockPropertyService.create(body);
      return response200(res.data);
    }
  }
  
  const propertyIdMatch = cleanPath.match(/\/api\/admin\/properties\/(\d+)$/);
  if (propertyIdMatch) {
    const id = propertyIdMatch[1];
    if (method === 'get') {
      const res = await mockDb.mockPropertyService.getById(id);
      return response200(res.data);
    } else if (method === 'put') {
      const res = await mockDb.mockPropertyService.update(id, body);
      return response200(res.data);
    } else if (method === 'delete') {
      const res = await mockDb.mockPropertyService.delete(id);
      return response200(res.data);
    }
  }

  // Units
  if (cleanPath === '/api/admin/units') {
    if (method === 'get') {
      const page = query.get('page');
      const limit = query.get('limit');
      const search = query.get('search');
      const unitType = query.get('unitType');
      const propertyId = query.get('propertyId');
      const showInactive = query.get('showInactive');
      const res = await mockDb.mockApartmentService.getAll({ page, limit, search, unitType, propertyId, showInactive });
      return response200(res.data);
    } else {
      const res = await mockDb.mockApartmentService.create(body);
      return response200(res.data);
    }
  }

  const unitIdMatch = cleanPath.match(/\/api\/admin\/units\/(\d+)$/);
  if (unitIdMatch) {
    const id = unitIdMatch[1];
    if (method === 'get') {
      const res = await mockDb.mockApartmentService.getById(id);
      return response200(res.data);
    } else if (method === 'put') {
      const res = await mockDb.mockApartmentService.update(id, body);
      return response200(res.data);
    } else if (method === 'delete') {
      const res = await mockDb.mockApartmentService.delete(id);
      return response200(res.data);
    }
  }

  if (cleanPath === '/api/admin/unit-types') {
    const res = await mockDb.mockApartmentService.getTypes();
    return response200(res.data);
  }

  // Tenants
  if (cleanPath === '/api/admin/tenants') {
    if (method === 'get') {
      const search = query.get('search') || '';
      const res = await mockDb.mockTenantService.getAll(search);
      return response200(res.data);
    } else {
      const res = await mockDb.mockTenantService.create(body);
      return response200(res.data);
    }
  }

  const tenantIdMatch = cleanPath.match(/\/api\/admin\/tenants\/(\d+)$/);
  if (tenantIdMatch) {
    const id = tenantIdMatch[1];
    if (method === 'get') {
      const res = await mockDb.mockTenantService.getById(id);
      return response200(res.data);
    } else if (method === 'put') {
      const res = await mockDb.mockTenantService.update(id, body);
      return response200(res.data);
    } else if (method === 'delete') {
      const res = await mockDb.mockTenantService.delete(id);
      return response200(res.data);
    }
  }

  // Leases
  if (cleanPath === '/api/admin/leases') {
    if (method === 'get') {
      const res = await mockDb.mockLeaseService.getAll();
      return response200(res.data);
    } else {
      const res = await mockDb.mockLeaseService.create(body);
      return response200(res.data);
    }
  }

  const leaseIdMatch = cleanPath.match(/\/api\/admin\/leases\/(\d+)$/);
  if (leaseIdMatch) {
    const id = leaseIdMatch[1];
    if (method === 'delete') {
      const res = await mockDb.mockLeaseService.delete(id);
      return response200(res.data);
    }
  }

  // Maintenance Tickets
  if (cleanPath === '/api/admin/maintenance') {
    const status = query.get('status') || 'All';
    const priority = query.get('priority') || 'All';
    const res = await mockDb.mockMaintenanceService.getAll({ status, priority });
    return response200(res.data);
  }

  const maintenanceIdNoteMatch = cleanPath.match(/\/api\/admin\/maintenance\/(\d+)\/notes/);
  if (maintenanceIdNoteMatch) {
    const id = maintenanceIdNoteMatch[1];
    const res = await mockDb.mockMaintenanceService.addNote(id, body.text, body.author);
    return response200(res.data);
  }

  const maintenanceIdMatch = cleanPath.match(/\/api\/admin\/maintenance\/(\d+)$/);
  if (maintenanceIdMatch) {
    const id = maintenanceIdMatch[1];
    if (method === 'put') {
      const res = await mockDb.mockMaintenanceService.update(id, body);
      return response200(res.data);
    } else if (method === 'delete') {
      const res = await mockDb.mockMaintenanceService.delete(id);
      return response200(res.data);
    }
  }

  // Tickets Dashboard
  if (cleanPath === '/api/admin/tickets') {
    if (method === 'post' || method === 'POST') {
      const res = await mockDb.mockTicketsService.create(body);
      return response200(res.data);
    }
    const res = await mockDb.mockTicketsService.getAll();
    return response200(res.data);
  }

  const ticketStatusMatch = cleanPath.match(/\/api\/admin\/tickets\/(\d+)\/status/);
  if (ticketStatusMatch) {
    if (method === 'put' || method === 'PUT') {
      const res = await mockDb.mockTicketsService.updateStatus(ticketStatusMatch[1], body.status);
      return response200(res.data);
    }
  }

  const ticketIdMatch = cleanPath.match(/\/api\/admin\/tickets\/(\d+)$/);
  if (ticketIdMatch) {
    const id = ticketIdMatch[1];
    if (method === 'put' || method === 'PUT') {
      const res = await mockDb.mockTicketsService.update(id, body);
      return response200(res.data);
    } else if (method === 'delete' || method === 'DELETE') {
      const res = await mockDb.mockTicketsService.delete(id);
      return response200(res.data);
    }
  }

  // Employees / Coworkers / Clock logs
  if (cleanPath === '/api/admin/coworkers') {
    if (method === 'get') {
      const res = await mockDb.mockEmployeeService.getAll();
      return response200(res.data);
    } else {
      const res = await mockDb.mockEmployeeService.create(body);
      return response200(res.data);
    }
  }

  if (cleanPath === '/api/admin/clock-logs') {
    const res = await mockDb.mockEmployeeService.getClockLogs();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/clock-in') {
    const res = await mockDb.mockEmployeeService.clockIn(body.userId, body.userName);
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/clock-out') {
    const res = await mockDb.mockEmployeeService.clockOut(body.userId);
    return response200(res.data);
  }

  // Vehicles
  if (cleanPath === '/api/admin/vehicles') {
    if (method === 'get') {
      const res = await mockDb.mockVehicleService.getAll();
      return response200(res.data);
    } else {
      const res = await mockDb.mockVehicleService.create(body);
      return response200(res.data);
    }
  }

  const vehicleIdMatch = cleanPath.match(/\/api\/admin\/vehicles\/(\d+)$/);
  if (vehicleIdMatch) {
    if (method === 'delete') {
      const res = await mockDb.mockVehicleService.delete(vehicleIdMatch[1]);
      return response200(res.data);
    }
  }

  // Documents
  if (cleanPath === '/api/admin/documents' || cleanPath === '/api/admin/documents/upload') {
    if (method === 'get') {
      const res = await mockDb.mockDocumentService.getAll();
      return response200(res.data);
    } else {
      const name = body.name || 'uploaded_document.pdf';
      const type = body.type || 'LEASE';
      const size = body.size || '1.5 MB';
      const propertyId = body.propertyId || 1;
      const res = await mockDb.mockDocumentService.create(name, type, size, propertyId);
      return response200(res.data);
    }
  }

  const documentIdMatch = cleanPath.match(/\/api\/admin\/documents\/(\d+)$/);
  if (documentIdMatch) {
    if (method === 'delete') {
      const res = await mockDb.mockDocumentService.delete(documentIdMatch[1]);
      return response200(res.data);
    }
  }

  // Invoices
  if (cleanPath === '/api/admin/invoices') {
    if (method === 'get') {
      const res = await mockDb.mockInvoiceService.getAll();
      return response200(res.data);
    } else {
      const res = await mockDb.mockInvoiceService.create(body);
      return response200(res.data);
    }
  }

  const invoicePayMatch = cleanPath.match(/\/api\/admin\/invoices\/(\d+)\/pay/);
  if (invoicePayMatch) {
    const res = await mockDb.mockInvoiceService.pay(invoicePayMatch[1], body.amount, body.paymentMethod, body.transactionId);
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/payments-received') {
    const list = JSON.parse(localStorage.getItem('mock_payments_received') || '[]');
    return response200(list);
  }

  if (cleanPath === '/api/admin/outstanding-dues') {
    const list = JSON.parse(localStorage.getItem('mock_outstanding_dues') || '[]');
    return response200(list);
  }

  if (cleanPath === '/api/admin/refunds') {
    if (method === 'post') {
      const res = await mockDb.mockDashboardService.cancelRefund(body.tenantId, body.unitId);
      return response200(res.data);
    } else {
      const list = JSON.parse(localStorage.getItem('mock_refunds') || '[]');
      const page = parseInt(query.get('page')) || 1;
      const limit = parseInt(query.get('limit')) || 10;
      const start = (page - 1) * limit;
      const paginated = list.slice(start, start + limit);
      return response200({ data: paginated, total: list.length, totalPages: Math.ceil(list.length / limit), page });
    }
  }

  // Disabled workflow modules (Move-In, Move-Out, Unit Preparation)
  if (
    cleanPath.includes('/api/admin/workflow/move-in') ||
    cleanPath.includes('/api/admin/workflow/move-out') ||
    cleanPath.includes('/api/admin/workflow/unit-prep')
  ) {
    return {
      data: { success: false, message: 'This module has been disabled.' },
      status: 403,
      statusText: 'Forbidden',
      headers: { 'content-type': 'application/json' },
      config,
      request: {},
    };
  }

  // Workflow Inspections & Templates
  if (cleanPath === '/api/admin/workflow/inspections') {
    if (method === 'get') {
      const page = parseInt(query.get('page')) || 1;
      const limit = parseInt(query.get('limit')) || 10;
      const res = await mockDb.mockWorkflowService.getInspections(page, limit);
      return response200(res.data);
    } else {
      const res = await mockDb.mockWorkflowService.createInspection(body);
      return response200(res.data);
    }
  }

  if (cleanPath === '/api/admin/workflow/inspections/upload-media') {
    return response200({ success: true, url: 'https://images.unsplash.com/photo-1560185008-b033106af5c3' });
  }

  const inspectionTicketMatch = cleanPath.match(/\/api\/admin\/workflow\/inspections\/(\d+)\/tickets\/(\d+)/);
  if (inspectionTicketMatch) {
    if (method === 'delete') {
      const res = await mockDb.mockWorkflowService.deleteInspectionTicket(inspectionTicketMatch[1], inspectionTicketMatch[2]);
      return response200(res.data);
    }
  }

  const inspectionTicketsMatch = cleanPath.match(/\/api\/admin\/workflow\/inspections\/(\d+)\/tickets/);
  if (inspectionTicketsMatch) {
    if (method === 'post') {
      const res = await mockDb.mockWorkflowService.addInspectionTicket(inspectionTicketsMatch[1], body);
      return response200(res.data);
    }
  }

  const inspectionIdMatch = cleanPath.match(/\/api\/admin\/workflow\/inspections\/(\d+)/);
  if (inspectionIdMatch) {
    const id = inspectionIdMatch[1];
    if (method === 'get') {
      const res = await mockDb.mockWorkflowService.getInspectionById(id);
      return response200(res.data);
    } else if (method === 'put') {
      const res = await mockDb.mockWorkflowService.updateInspectionStatus(id, body.status);
      return response200(res.data);
    } else if (method === 'delete') {
      const res = await mockDb.mockWorkflowService.deleteInspection(id);
      return response200(res.data);
    }
  }

  if (cleanPath === '/api/admin/workflow/templates') {
    if (method === 'get') {
      const page = parseInt(query.get('page')) || 1;
      const limit = parseInt(query.get('limit')) || 10;
      const res = await mockDb.mockWorkflowService.getTemplates(page, limit);
      return response200(res.data);
    } else {
      const res = await mockDb.mockWorkflowService.createTemplate(body);
      return response200(res.data);
    }
  }

  const templateDuplicateMatch = cleanPath.match(/\/api\/admin\/workflow\/templates\/(\d+)\/duplicate/);
  if (templateDuplicateMatch) {
    const res = await mockDb.mockWorkflowService.duplicateTemplate(templateDuplicateMatch[1]);
    return response200(res.data);
  }

  const templateIdMatch = cleanPath.match(/\/api\/admin\/workflow\/templates\/(\d+)/);
  if (templateIdMatch) {
    const id = templateIdMatch[1];
    if (method === 'put') {
      const res = await mockDb.mockWorkflowService.updateTemplate(id, body);
      return response200(res.data);
    } else if (method === 'delete') {
      const res = await mockDb.mockWorkflowService.deleteTemplate(id);
      return response200(res.data);
    }
  }

  if (cleanPath === '/api/admin/workflow/response-series') {
    const res = await mockDb.mockWorkflowService.getResponseSeries();
    return response200(res.data);
  }

  const responseSeriesIdMatch = cleanPath.match(/\/api\/admin\/workflow\/response-series\/(\d+)/);
  if (responseSeriesIdMatch) {
    const id = responseSeriesIdMatch[1];
    if (method === 'put') {
      const res = await mockDb.mockWorkflowService.updateResponseSeries(id, body);
      return response200(res.data);
    } else if (method === 'delete') {
      const res = await mockDb.mockWorkflowService.deleteResponseSeries(id);
      return response200(res.data);
    }
  }

  // Settings / Taxes
  if (cleanPath === '/api/admin/settings/tax') {
    if (method === 'get') {
      const res = await mockDb.mockSettingsService.getTaxSettings();
      return response200(res.data);
    } else {
      const res = await mockDb.mockSettingsService.saveTaxSettings(body);
      return response200(res.data);
    }
  }

  if (cleanPath === '/api/admin/taxes') {
    if (method === 'post' || method === 'POST') {
      const res = await mockDb.mockSettingsService.createTax(body);
      return response200(res.data);
    }
    const res = await mockDb.mockSettingsService.getTaxSettings();
    return response200(res.data);
  }

  const taxIdMatch = cleanPath.match(/\/api\/admin\/taxes\/(\d+)/);
  if (taxIdMatch) {
    if (method === 'patch' || method === 'PATCH') {
      const res = await mockDb.mockSettingsService.updateTax(taxIdMatch[1], body);
      return response200(res.data);
    }
    if (method === 'delete' || method === 'DELETE') {
      const res = await mockDb.mockSettingsService.deleteTax(taxIdMatch[1]);
      return response200(res.data);
    }
  }

  if (cleanPath === '/api/admin/settings/quickbooks') {
    const res = await mockDb.mockSettingsService.getQuickBooks();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/settings/quickbooks/disconnect') {
    const res = await mockDb.mockSettingsService.disconnectQuickBooks();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/settings/chart-of-accounts') {
    if (method === 'get') {
      const res = await mockDb.mockSettingsService.getChartOfAccounts();
      return response200(res.data);
    } else {
      const res = await mockDb.mockSettingsService.createChartOfAccount(body);
      return response200(res.data);
    }
  }

  // Chart of Accounts (standard routes)
  if (cleanPath === '/api/admin/accounts') {
    if (method === 'post' || method === 'POST') {
      const res = await mockDb.mockSettingsService.createChartOfAccount(body);
      return response200(res.data);
    }
    const res = await mockDb.mockSettingsService.getChartOfAccounts();
    return response200(res.data);
  }

  const patchAccountMatch = cleanPath.match(/\/api\/admin\/accounts\/(\d+)/);
  if (patchAccountMatch) {
    if (method === 'patch' || method === 'PATCH') {
      const res = await mockDb.mockSettingsService.updateChartOfAccount(patchAccountMatch[1], body);
      return response200(res.data);
    }
    if (method === 'delete' || method === 'DELETE') {
      const res = await mockDb.mockSettingsService.deleteChartOfAccount(patchAccountMatch[1]);
      return response200(res.data);
    }
  }

  // General Settings
  if (cleanPath === '/api/admin/settings') {
    if (method === 'post' || method === 'POST') {
      const res = await mockDb.mockGeneralSettingsService.saveSettings(body);
      return response200(res.data);
    }
    const res = await mockDb.mockGeneralSettingsService.getSettings();
    return response200(res.data);
  }

  // Service Items presets
  if (cleanPath === '/api/admin/service-items') {
    if (method === 'post' || method === 'POST') {
      const res = await mockDb.mockGeneralSettingsService.addServiceItem(body);
      return response200(res.data);
    }
    const res = await mockDb.mockGeneralSettingsService.getServiceItems();
    return response200(res.data);
  }

  const deleteServiceItemMatch = cleanPath.match(/\/api\/admin\/service-items\/(\d+)/);
  if (deleteServiceItemMatch) {
    const res = await mockDb.mockGeneralSettingsService.deleteServiceItem(deleteServiceItemMatch[1]);
    return response200(res.data);
  }

  // Payments
  if (cleanPath === '/api/admin/payments') {
    if (method === 'post' || method === 'POST') {
      const res = await mockDb.mockGeneralSettingsService.createPayment(body);
      return response200(res.data);
    }
    const res = await mockDb.mockGeneralSettingsService.getPayments();
    return response200(res.data);
  }

  const paymentDownloadMatch = cleanPath.match(/\/api\/admin\/payments\/(\d+)\/download/);
  if (paymentDownloadMatch) {
    return {
      status: 200,
      data: new Blob(["Mock PDF receipt content"], { type: "application/pdf" }),
      headers: { "content-type": "application/pdf" }
    };
  }

  // Owners
  if (cleanPath === '/api/admin/owners') {
    const res = await mockDb.mockOwnerService.getAll();
    return response200(res.data);
  }

  if (cleanPath === '/api/owner/dashboard/stats') {
    const ownerId = query.get('ownerId') || '';
    const res = await mockDb.mockOwnerService.getDashboardStats(ownerId);
    return response200(res.data);
  }

  // Dashboard Unified Stats
  if (cleanPath === '/api/admin/dashboard/stats') {
    const res = await mockDb.mockDashboardService.getStats();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/analytics/revenue') {
    const res = await mockDb.mockDashboardService.getRevenue();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/analytics/vacancy') {
    const res = await mockDb.mockDashboardService.getVacancyStats();
    return response200(res.data);
  }

  // Unit Readiness
  if (cleanPath === '/api/admin/readiness/buildings') {
    const res = await mockDb.mockReadinessService.getBuildings();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/readiness/stats') {
    const propertyId = query.get('propertyId') || '';
    const showLeased = query.get('showLeased') === 'true';
    const res = await mockDb.mockReadinessService.getStats(propertyId, showLeased);
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/readiness/dashboard') {
    const search = query.get('search') || '';
    const status = query.get('status') || '';
    const propertyId = query.get('propertyId') || '';
    const showLeased = query.get('showLeased') === 'true';
    const page = query.get('page') || 1;
    const limit = query.get('limit') || 15;
    
    const res = await mockDb.mockReadinessService.getDashboard({ search, status, propertyId, showLeased, page, limit });
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/readiness/settings') {
    if (method === 'put' || method === 'PUT') {
      const res = await mockDb.mockReadinessService.updateSettings(body);
      return response200(res.data);
    }
    const res = await mockDb.mockReadinessService.getSettings();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/readiness/holidays') {
    if (method === 'post' || method === 'POST') {
      const res = await mockDb.mockReadinessService.addHoliday(body);
      return response200(res.data);
    }
    const res = await mockDb.mockReadinessService.getHolidays();
    return response200(res.data);
  }

  const deleteHolidayMatch = cleanPath.match(/\/api\/admin\/readiness\/holidays\/(\d+)/);
  if (deleteHolidayMatch) {
    const res = await mockDb.mockReadinessService.deleteHoliday(deleteHolidayMatch[1]);
    return response200(res.data);
  }

  const updateStepMatch = cleanPath.match(/\/api\/admin\/readiness\/update-step\/(\d+)/);
  if (updateStepMatch) {
    const res = await mockDb.mockReadinessService.updateStep(updateStepMatch[1], body.stepKey, body.status, body.isGcDelivered);
    return response200(res.data);
  }

  // Insurance Alerts
  if (cleanPath === '/api/admin/insurance/compliance') {
    const res = await mockDb.mockInsuranceService.getCompliance();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/insurance/stats') {
    const res = await mockDb.mockInsuranceService.getStats();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/insurance') {
    if (method === 'post' || method === 'POST') {
      const res = await mockDb.mockInsuranceService.create(body);
      return response200(res.data);
    }
  }

  const insuranceIdMatch = cleanPath.match(/\/api\/admin\/insurance\/(\d+)/);
  if (insuranceIdMatch) {
    if (method === 'put' || method === 'PUT') {
      const res = await mockDb.mockInsuranceService.update(insuranceIdMatch[1], body);
      return response200(res.data);
    }
  }

  // Calendar
  if (cleanPath === '/api/admin/calendar') {
    const res = await mockDb.mockCalendarService.getAll();
    return response200(res.data);
  }

  // Reports
  if (cleanPath === '/api/admin/reports') {
    const res = await mockDb.mockReportsService.getAll();
    return response200(res.data);
  }

  if (cleanPath === '/api/admin/reports/rent-roll' || cleanPath === '/api/owner/reports/rent-roll') {
    const res = await mockDb.mockReportsService.getRentRoll();
    return response200(res.data);
  }

  // Accounting / Ledger
  if (cleanPath === '/api/admin/accounting/transactions') {
    const res = await mockDb.mockLedgerService.getTransactions();
    return response200(res.data);
  }

  // Communication / Chat / SMS
  if (cleanPath === '/api/communication/unread-stats') {
    return response200({ count: 1 });
  }

  if (cleanPath === '/api/communication/conversations') {
    const res = await mockDb.mockCommunicationService.getConversations();
    return response200(res.data);
  }

  const commHistoryMatch = cleanPath.match(/\/api\/communication\/history\/(\w+)/);
  if (commHistoryMatch) {
    const res = await mockDb.mockCommunicationService.getHistory(commHistoryMatch[1]);
    return response200(res.data);
  }

  if (cleanPath === '/api/communication/send' || cleanPath === '/api/admin/communication/send-email' || cleanPath === '/api/admin/email/send-bulk') {
    const receiverId = body.receiverId || body.tenantId || 101;
    const content = body.content || body.body || 'Mock message sent';
    const res = await mockDb.mockCommunicationService.sendMessage(receiverId, content);
    return response200(res.data);
  }

  if (cleanPath === '/api/communication/mark-read') {
    const res = await mockDb.mockCommunicationService.markAsRead(body.senderId);
    return response200(res.data);
  }

  // SMS & Email templates / campaigns
  if (cleanPath === '/api/communication/templates' || cleanPath === '/api/admin/email/templates') {
    if (method === 'get') {
      const list = JSON.parse(localStorage.getItem('mock_sms_templates') || '[]');
      if (list.length === 0) {
        const defaults = [
          { id: 1, name: 'Rent Due Reminder', body: 'Hi {{name}}, this is a friendly reminder that rent is due on the 1st.' },
          { id: 2, name: 'Inspection Notice', body: 'Dear {{name}}, we have scheduled an inspection on {{date}}.' }
        ];
        localStorage.setItem('mock_sms_templates', JSON.stringify(defaults));
        return response200(defaults);
      }
      return response200(list);
    } else {
      const list = JSON.parse(localStorage.getItem('mock_sms_templates') || '[]');
      const newTemp = { id: list.length ? Math.max(...list.map(t => t.id)) + 1 : 1, ...body };
      list.push(newTemp);
      localStorage.setItem('mock_sms_templates', JSON.stringify(list));
      return response200(newTemp);
    }
  }

  const commTemplateIdMatch = cleanPath.match(/\/api\/communication\/templates\/(\d+)/) || cleanPath.match(/\/api\/admin\/email\/templates\/(\d+)/);
  if (commTemplateIdMatch) {
    const id = parseInt(commTemplateIdMatch[1]);
    if (method === 'put') {
      let list = JSON.parse(localStorage.getItem('mock_sms_templates') || '[]');
      list = list.map(t => t.id === id ? { ...t, ...body } : t);
      localStorage.setItem('mock_sms_templates', JSON.stringify(list));
      return response200({ success: true });
    } else if (method === 'delete') {
      let list = JSON.parse(localStorage.getItem('mock_sms_templates') || '[]');
      list = list.filter(t => t.id !== id);
      localStorage.setItem('mock_sms_templates', JSON.stringify(list));
      return response200({ success: true });
    }
  }

  if (cleanPath === '/api/communication/campaigns') {
    const list = JSON.parse(localStorage.getItem('mock_sms_campaigns') || '[]');
    return response200(list);
  }

  if (cleanPath === '/api/communication/campaign') {
    if (method === 'post') {
      const list = JSON.parse(localStorage.getItem('mock_sms_campaigns') || '[]');
      const newCamp = {
        id: list.length ? Math.max(...list.map(c => c.id)) + 1 : 1,
        ...body,
        status: 'Sent',
        sentAt: new Date().toISOString(),
        deliveredCount: 15,
        failedCount: 0
      };
      list.push(newCamp);
      localStorage.setItem('mock_sms_campaigns', JSON.stringify(list));
      return response200(newCamp);
    }
  }

  const campaignIdMatch = cleanPath.match(/\/api\/communication\/campaign\/(\d+)/);
  if (campaignIdMatch) {
    const id = parseInt(campaignIdMatch[1]);
    if (method === 'delete') {
      let list = JSON.parse(localStorage.getItem('mock_sms_campaigns') || '[]');
      list = list.filter(c => c.id !== id);
      localStorage.setItem('mock_sms_campaigns', JSON.stringify(list));
      return response200({ success: true });
    }
  }

  const campaignIdFailuresMatch = cleanPath.match(/\/api\/communication\/campaign\/(\d+)\/failures/);
  if (campaignIdFailuresMatch) {
    return response200([]);
  }

  const campaignIdRetryMatch = cleanPath.match(/\/api\/communication\/campaign\/(\d+)\/retry/);
  if (campaignIdRetryMatch) {
    return response200({ success: true });
  }

  if (cleanPath === '/api/admin/communication/emails') {
    const list = JSON.parse(localStorage.getItem('mock_sent_emails') || '[]');
    return response200(list);
  }

  if (cleanPath === '/api/admin/email/history') {
    const list = JSON.parse(localStorage.getItem('mock_email_history') || '[]');
    return response200(list);
  }

  const emailHistoryIdMatch = cleanPath.match(/\/api\/admin\/email\/history\/(\d+)/);
  if (emailHistoryIdMatch) {
    const id = parseInt(emailHistoryIdMatch[1]);
    const list = JSON.parse(localStorage.getItem('mock_email_history') || '[]');
    const item = list.find(h => h.id === id);
    return response200(item || { id, subject: 'Mock Email', body: 'Body content' });
  }

  if (cleanPath === '/api/admin/email/signature') {
    return response200({ signature: 'Best regards,\nSaif Property Management Team' });
  }

  // Tenant Portal API Interceptors
  if (cleanPath.startsWith('/api/tenant/')) {
    const tenantId = parseInt(localStorage.getItem('currentTenantId') || '101');
    const tenantSubPath = cleanPath.replace('/api/tenant/', '');

    if (tenantSubPath === 'profile') {
      const res = await mockDb.mockTenantDashboardService.getProfile(tenantId);
      return response200(res.data);
    }
    if (tenantSubPath === 'dashboard') {
      const res = await mockDb.mockTenantDashboardService.getDashboard(tenantId);
      return response200(res.data);
    }
    if (tenantSubPath === 'lease') {
      const res = await mockDb.mockTenantDashboardService.getLease(tenantId);
      return response200(res.data);
    }
    if (tenantSubPath === 'vehicles') {
      const res = await mockDb.mockTenantDashboardService.getVehicles(tenantId);
      return response200(res.data);
    }
    if (tenantSubPath === 'tickets') {
      if (method === 'post' || method === 'POST') {
        const res = await mockDb.mockTenantDashboardService.createTicket(tenantId, body);
        return response200(res.data);
      }
      const res = await mockDb.mockTenantDashboardService.getTickets(tenantId);
      return response200(res.data);
    }
    if (tenantSubPath === 'reports') {
      const res = await mockDb.mockTenantDashboardService.getReports(tenantId);
      return response200(res.data);
    }
    if (tenantSubPath === 'invoices') {
      const res = await mockDb.mockTenantDashboardService.getInvoices(tenantId);
      return response200(res.data);
    }
    if (tenantSubPath === 'pay') {
      const res = await mockDb.mockTenantDashboardService.payInvoice(tenantId, body);
      return response200(res.data);
    }
    if (tenantSubPath === 'insurance') {
      if (method === 'post' || method === 'POST') {
        const res = await mockDb.mockTenantDashboardService.saveInsurance(tenantId, body);
        return response200(res.data);
      }
      const res = await mockDb.mockTenantDashboardService.getInsurance(tenantId);
      return response200(res.data);
    }
    if (tenantSubPath === 'documents') {
      if (method === 'post' || method === 'POST') {
        const res = await mockDb.mockTenantDashboardService.saveDocument(tenantId, body);
        return response200(res.data);
      }
      const res = await mockDb.mockTenantDashboardService.getDocuments(tenantId);
      return response200(res.data);
    }

    const downloadInvoiceMatch = tenantSubPath.match(/^invoices\/(\d+)\/download/);
    if (downloadInvoiceMatch) {
      return response200(new Blob(['Mock invoice PDF content'], { type: 'application/pdf' }));
    }

    const downloadDocumentMatch = tenantSubPath.match(/^documents\/(\d+)\/download/);
    if (downloadDocumentMatch) {
      return response200(new Blob(['Mock document content'], { type: 'application/octet-stream' }));
    }
  }

  // Owner Portal API Interceptors
  if (cleanPath.startsWith('/api/owner/')) {
    const ownerId = parseInt(localStorage.getItem('ownerId') || '3');
    const ownerSubPath = cleanPath.replace('/api/owner/', '');

    if (ownerSubPath === 'profile') {
      const res = await mockDb.mockOwnerDashboardService.getProfile(ownerId);
      return response200(res.data);
    }
    if (ownerSubPath === 'dashboard/stats') {
      const res = await mockDb.mockOwnerDashboardService.getStats(ownerId);
      return response200(res.data);
    }
    if (ownerSubPath === 'dashboard/financial-pulse') {
      const res = await mockDb.mockOwnerDashboardService.getFinancialPulse(ownerId);
      return response200(res.data);
    }
    if (ownerSubPath === 'properties') {
      const res = await mockDb.mockOwnerDashboardService.getProperties(ownerId);
      return response200(res.data);
    }
    if (ownerSubPath === 'financials') {
      const res = await mockDb.mockOwnerDashboardService.getFinancials(ownerId);
      return response200(res.data);
    }
    if (ownerSubPath === 'reports') {
      const res = await mockDb.mockOwnerDashboardService.getReports(ownerId);
      return response200(res.data);
    }
    if (ownerSubPath === 'reports/rent-roll') {
      const res = await mockDb.mockReportsService.getRentRoll();
      return response200(res.data);
    }

    const downloadInvoiceMatch = ownerSubPath.match(/^invoices\/(\d+)\/download/);
    if (downloadInvoiceMatch) {
      return response200(new Blob(['Mock invoice PDF content'], { type: 'application/pdf' }));
    }

    const downloadReportMatch = ownerSubPath.match(/^reports\/([^\/]+)\/download/);
    if (downloadReportMatch) {
      return response200(new Blob(['Mock report content'], { type: 'application/octet-stream' }));
    }
  }

  // Notes Hub (Phase 6)
  if (cleanPath === '/api/admin/notes/stats') {
    const { notesHubService } = await import('../services/notesHubService');
    return response200(notesHubService.getStats());
  }

  if (cleanPath === '/api/admin/notes/activity') {
    const { activityService } = await import('../services/activityService');
    const limit = parseInt(query.get('limit') || '20', 10);
    const companyId = localStorage.getItem('global_selected_company_id');
    return response200(
      activityService.getRecent(limit, companyId ? { companyId: parseInt(companyId, 10) } : {})
    );
  }

  if (cleanPath === '/api/admin/notes') {
    const { notesHubService } = await import('../services/notesHubService');
    if (method === 'get') {
      return response200(notesHubService.listNotes({
        search: query.get('search') || '',
        entityType: query.get('entityType') || '',
        category: query.get('category') || '',
        priority: query.get('priority') || '',
      }));
    }
    if (method === 'post') {
      return response200(notesHubService.createNote(body));
    }
  }

  const noteIdMatch = cleanPath.match(/\/api\/admin\/notes\/([^/]+)$/);
  if (noteIdMatch) {
    const { notesHubService } = await import('../services/notesHubService');
    const noteId = noteIdMatch[1];
    if (method === 'get') {
      return response200(notesHubService.getNoteDetail(noteId));
    }
    if (method === 'put') {
      return response200(notesHubService.updateNote(noteId, body));
    }
    if (method === 'delete') {
      notesHubService.deleteNote(noteId);
      return response200({ success: true });
    }
  }

  const notePinMatch = cleanPath.match(/\/api\/admin\/notes\/([^/]+)\/pin$/);
  if (notePinMatch && method === 'post') {
    const { notesHubService } = await import('../services/notesHubService');
    return response200(notesHubService.togglePin(notePinMatch[1]));
  }

  const noteCommentsMatch = cleanPath.match(/\/api\/admin\/notes\/([^/]+)\/comments$/);
  if (noteCommentsMatch && method === 'post') {
    const { notesHubService } = await import('../services/notesHubService');
    return response200(notesHubService.addComment(noteCommentsMatch[1], body.content, body.createdBy));
  }

  const noteAttachmentsMatch = cleanPath.match(/\/api\/admin\/notes\/([^/]+)\/attachments$/);
  if (noteAttachmentsMatch && method === 'post') {
    const { notesHubService } = await import('../services/notesHubService');
    return response200(notesHubService.uploadAttachment(noteAttachmentsMatch[1], body));
  }

  if (cleanPath === '/api/admin/notifications') {
    const { activityService } = await import('../services/activityService');
    return response200(activityService.getNotifications(parseInt(query.get('limit') || '20', 10)));
  }

  if (cleanPath === '/api/admin/notifications/unread-count') {
    const { activityService } = await import('../services/activityService');
    return response200({ count: activityService.getUnreadNotificationCount() });
  }

  if (cleanPath === '/api/admin/shuttle/requests') {
    return response200({
      requests: [
        { id: 1, tenant_name: "John Doe", date: "2026-07-08", time: "09:00", origin: "Parkview Heights", destination: "Downtown", passengers: 1, status: "pending" },
        { id: 2, tenant_name: "Jane Miller", date: "2026-07-09", time: "10:30", origin: "Sunset Towers", destination: "Airport", passengers: 2, status: "approved" }
      ]
    });
  }
  if (cleanPath === '/api/admin/shuttle/trips') {
    return response200({ 
      trips: [
        { id: 1, time: "08:00", date: "2026-07-06", origin: "Parkview Heights", destination: "Downtown", seats_total: 7, is_recurring: true, actual_passengers: 5, status: "completed" },
        { id: 2, time: "17:30", date: "2026-07-06", origin: "Downtown", destination: "Parkview Heights", seats_total: 7, is_recurring: true, actual_passengers: 7, status: "completed" },
        { id: 3, time: "09:00", date: "2026-07-08", origin: "Parkview Heights", destination: "Airport", seats_total: 4, is_recurring: false, actual_passengers: 0, status: "scheduled" }
      ] 
    });
  }
  if (cleanPath === '/api/admin/shuttle/users') {
    return response200({ users: [] });
  }
  if (cleanPath === '/api/admin/shuttle/trips/locations') {
    return response200({ locations: [] });
  }

  // Default fallback for any unhandled routes to prevent application crash
  console.warn(`Mock API Interceptor: Unhandled path ${method.toUpperCase()} ${cleanPath}. Returning generic success structure.`);
  return response200({
    success: true,
    data: [],
    message: 'Mock bypass fallback success'
  });
};

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 (optional for now)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Only redirect if NOT already on login or invite page
            if (!window.location.pathname.match(/\/(login|invite)/)) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
