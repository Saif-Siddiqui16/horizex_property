// ============================================================
// TAL CASES MOCK DATABASE — Phase 5
// Fully normalized: all relationships use ID references only.
// No data duplication across stores.
// ============================================================

// ─── CONFIGURABLE STATUS WORKFLOWS ────────────────────────────
export const TAL_CASE_STATUSES = {
  DRAFT:               { label: 'Draft',               color: 'bg-slate-100 text-slate-600 border-slate-200', step: 1, nextAction: 'Complete case information' },
  PREPARING_DOCUMENTS: { label: 'Preparing Documents', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 2, nextAction: 'Upload required legal documents' },
  READY_TO_FILE:       { label: 'Ready to File',       color: 'bg-indigo-100 text-indigo-800 border-indigo-300', step: 3, nextAction: 'Generate TAL forms' },
  FILED:               { label: 'Filed',               color: 'bg-blue-50 text-blue-700 border-blue-200', step: 4, nextAction: 'Wait for hearing scheduling' },
  HEARING_SCHEDULED:   { label: 'Hearing Scheduled',   color: 'bg-orange-50 text-orange-700 border-orange-200', step: 5, nextAction: 'Notify tenant and prepare evidence' },
  PREPARING_HEARING:   { label: 'Preparing Hearing',   color: 'bg-blue-100 text-blue-800 border-blue-300', step: 6, nextAction: 'Upload evidence and hearing notes' },
  HEARING_COMPLETED:   { label: 'Hearing Completed',   color: 'bg-orange-100 text-orange-800 border-orange-300', step: 7, nextAction: 'Await tribunal decision' },
  DECISION_RECEIVED:   { label: 'Decision Received',   color: 'bg-purple-50 text-purple-700 border-purple-200', step: 8, nextAction: 'Review tribunal order' },
  ORDER_ISSUED:        { label: 'Order Issued',        color: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 9, nextAction: 'Begin enforcement' },
  PAYMENT_ORDERED:     { label: 'Payment Ordered',     color: 'bg-emerald-100 text-emerald-800 border-emerald-300', step: 10, nextAction: 'Track payment collection' },
  EVICTION_APPROVED:   { label: 'Eviction Approved',   color: 'bg-emerald-200 text-emerald-900 border-emerald-400', step: 11, nextAction: 'Schedule eviction' },
  CLOSED:              { label: 'Closed',              color: 'bg-slate-200 text-slate-700 border-slate-300', step: 12, nextAction: 'Archive records' },
  ARCHIVED:            { label: 'Archived',            color: 'bg-slate-300 text-slate-800 border-slate-400', step: 13, nextAction: 'Read-only historical record' },
};

export const TAL_CASE_PRIORITIES = {
  LOW:    { label: 'Low',    color: 'bg-slate-100 text-slate-600 border border-slate-200' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  HIGH:   { label: 'High',   color: 'bg-orange-50 text-orange-700 border border-orange-200' },
  URGENT: { label: 'Urgent', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

export const TAL_DOCUMENT_TYPES = {
  LEASE_AGREEMENT:       { label: 'Lease Agreement',       icon: 'FileText' },
  RENT_LEDGER:           { label: 'Rent Ledger',           icon: 'FileText' },
  PAYMENT_HISTORY:       { label: 'Payment History',       icon: 'DollarSign' },
  INSPECTION_REPORTS:    { label: 'Inspection Reports',    icon: 'ClipboardList' },
  PROPERTY_PHOTOS:       { label: 'Property Photos',       icon: 'Image' },
  VIDEOS:                { label: 'Videos',                icon: 'Video' },
  TENANT_COMMUNICATIONS: { label: 'Tenant Communications', icon: 'MessageSquare' },
  EMAILS:                { label: 'Emails',                icon: 'Mail' },
  SMS_RECORDS:           { label: 'SMS Records',           icon: 'Smartphone' },
  LEGAL_NOTICES:         { label: 'Legal Notices',         icon: 'AlertCircle' },
  TAL_FORMS:             { label: 'TAL Forms',             icon: 'Scale' },
  HEARING_NOTICE:        { label: 'Hearing Notice',        icon: 'Calendar' },
  TRIBUNAL_DECISION:     { label: 'Tribunal Decision',     icon: 'Scale' },
  INVOICES:              { label: 'Invoices',              icon: 'DollarSign' },
  RECEIPTS:              { label: 'Receipts',              icon: 'FileCheck' },
  OTHER_EVIDENCE:        { label: 'Other Evidence',        icon: 'Paperclip' },
};

// ─── CONFIGURABLE TASK WORKFLOWS ──────────────────────────────
export const TASK_STATUSES = {
  PENDING:     { label: 'Pending',     color: 'bg-amber-50 text-amber-700 border-amber-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED:   { label: 'Completed',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED:   { label: 'Cancelled',   color: 'bg-slate-100 text-slate-500 border-slate-200' },
  OVERDUE:     { label: 'Overdue',     color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const TASK_PRIORITIES = {
  LOW:    { label: 'Low',    color: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-50 text-amber-700' },
  HIGH:   { label: 'High',   color: 'bg-orange-50 text-orange-700' },
  URGENT: { label: 'Urgent', color: 'bg-rose-50 text-rose-700' },
};

// ─── SEED: LAWYERS ────────────────────────────────────────────
export const mockLawyers = [
  { id: 'lwy-001', name: 'Me. Jean Tremblay', firm: 'Tremblay Legal Group', phone: '514-555-0101', email: 'jtremblay@legal.ca', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', createdBy: 'System', updatedBy: 'System' },
  { id: 'lwy-002', name: 'Me. Marie Leblanc',  firm: 'Leblanc & Associates', phone: '514-555-0102', email: 'mleblanc@legal.ca',  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', createdBy: 'System', updatedBy: 'System' },
  { id: 'lwy-003', name: 'Me. Ahmed Hassan',   firm: 'Hassan Law Office',    phone: '514-555-0103', email: 'ahassan@legal.ca',   createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', createdBy: 'System', updatedBy: 'System' },
];

// ─── SEED: JUDGES ─────────────────────────────────────────────
export const mockJudges = [
  { id: 'jdg-001', name: 'Justice Robert Côté',    courtRoom: 'Room 4A', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', createdBy: 'System', updatedBy: 'System' },
  { id: 'jdg-002', name: 'Justice Fatima Al-Said', courtRoom: 'Room 2B', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', createdBy: 'System', updatedBy: 'System' },
];

// ─── SEED: TAL CASES (normalized — IDs only for relationships) ──
export const mockTalCases = [
  {
    id: 1,
    caseNumber: 'TAL-2026-000001',

    // Hierarchy references (ID only)
    companyId: 1,
    propertyId: 3,
    propertyName: 'Greenfield Commons',
    unitId: 3,
    unitNumber: 'Apt 301',
    tenantId: 103,
    tenantName: 'John Doe',
    leaseId: 3,
    renewalId: null,

    // Linked financial records (ID refs only)
    invoiceIds: [3],

    // Related sub-entity ID refs
    hearingIds: [1],
    documentIds: [1, 2],
    noteIds: [1],
    taskIds: [1, 2],

    // Case details
    caseType: 'Non-Payment of Rent',
    subject: 'Unpaid Rent Recovery',
    caseSummary: 'Claim filed for recovery of $1,150 in outstanding rent and associated late fees for the period of June 2026. Tenant acknowledged debt but has not made payment.',
    status: 'Hearing Scheduled',
    priority: 'High',
    filedDate: '2026-06-10',
    closedDate: null,
    outcome: 'Pending',

    // Assigned team
    assignedManagerId: 'usr-001',
    assignedManagerName: 'Admin User',
    assignedLawyerId: 'lwy-001',
    assignedLawyerName: 'Me. Jean Tremblay',

    // Next hearing (denormalized for table display performance)
    nextHearingDate: '2026-07-20T10:00:00Z',
    courtRoom: 'Room 4A',
    judgeId: 'jdg-001',
    judgeName: 'Justice Robert Côté',

    // Financial Details
    monthlyRent: 1200,
    outstandingRent: 1150,
    filingFee: 98,
    legalFees: 450,
    amountClaimed: 1698,
    recoveredAmount: 0,
    paymentStatus: 'Unpaid',

    // Append-only audit timeline (embedded for atomic reads)
    timeline: [
      { id: 1, date: '2026-06-01T09:00:00Z', event: 'Case Created: TAL-2026-000001', actor: 'Admin User', createdAt: '2026-06-01T09:00:00Z' },
      { id: 2, date: '2026-06-05T14:00:00Z', event: 'Status changed: Draft → Preparing Documents', actor: 'Admin User', createdAt: '2026-06-05T14:00:00Z' },
      { id: 3, date: '2026-06-08T10:00:00Z', event: 'Notice Sent to tenant John Doe via registered mail', actor: 'Admin User', createdAt: '2026-06-08T10:00:00Z' },
      { id: 4, date: '2026-06-08T10:05:00Z', event: 'Status changed: Preparing Documents → Ready to File', actor: 'Admin User', createdAt: '2026-06-08T10:05:00Z' },
      { id: 5, date: '2026-06-10T09:00:00Z', event: 'Case Filed at Tribunal Administratif du Logement', actor: 'Me. Jean Tremblay', createdAt: '2026-06-10T09:00:00Z' },
      { id: 6, date: '2026-06-10T09:05:00Z', event: 'Status changed: Ready to File → Filed', actor: 'Admin User', createdAt: '2026-06-10T09:05:00Z' },
      { id: 7, date: '2026-06-15T11:00:00Z', event: 'Hearing scheduled for 2026-07-20 in Room 4A', actor: 'Me. Jean Tremblay', createdAt: '2026-06-15T11:00:00Z' },
      { id: 8, date: '2026-06-15T11:05:00Z', event: 'Status changed: Filed → Hearing Scheduled', actor: 'Admin User', createdAt: '2026-06-15T11:05:00Z' },
    ],

    // Immutable Audit Log
    auditLog: [
      { id: 1, user: 'Admin User', timestamp: '2026-06-01T09:00:00Z', field: 'Status', oldValue: 'None', newValue: 'Draft', action: 'Create Case' },
      { id: 2, user: 'Admin User', timestamp: '2026-06-05T14:00:00Z', field: 'Status', oldValue: 'Draft', newValue: 'Preparing Documents', action: 'Update Status' },
      { id: 3, user: 'Admin User', timestamp: '2026-06-08T10:05:00Z', field: 'Status', oldValue: 'Preparing Documents', newValue: 'Ready to File', action: 'Update Status' },
      { id: 4, user: 'Admin User', timestamp: '2026-06-10T09:05:00Z', field: 'Status', oldValue: 'Ready to File', newValue: 'Filed', action: 'Update Status' },
      { id: 5, user: 'Admin User', timestamp: '2026-06-15T11:05:00Z', field: 'Status', oldValue: 'Filed', newValue: 'Hearing Scheduled', action: 'Update Status' }
    ],

    // Audit fields
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-15T11:05:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
  {
    id: 2,
    caseNumber: 'TAL-2026-000002',

    companyId: 1,
    propertyId: 2,
    propertyName: 'Sunset Towers',
    unitId: 2,
    unitNumber: 'Apt 201',
    tenantId: 102,
    tenantName: 'Alice Cooper',
    leaseId: 2,
    renewalId: 1,

    invoiceIds: [],
    hearingIds: [],
    documentIds: [3],
    noteIds: [2],
    taskIds: [3],

    caseType: 'Rent Increase Dispute',
    subject: 'Contested Rent Increase',
    caseSummary: 'Tenant has formally contested the proposed 4.5% rent increase for the upcoming renewal term, citing comparable unit rates in the same building.',
    status: 'Preparing Documents',
    priority: 'Medium',
    filedDate: null,
    closedDate: null,
    outcome: 'Pending',

    assignedManagerId: 'usr-001',
    assignedManagerName: 'Admin User',
    assignedLawyerId: 'lwy-002',
    assignedLawyerName: 'Me. Marie Leblanc',

    nextHearingDate: null,
    courtRoom: null,
    judgeId: null,
    judgeName: null,

    // Financial Details
    monthlyRent: 1500,
    outstandingRent: 0,
    filingFee: 98,
    legalFees: 200,
    amountClaimed: 298,
    recoveredAmount: 0,
    paymentStatus: 'No Balance',

    timeline: [
      { id: 1, date: '2026-06-20T08:00:00Z', event: 'Case Created: TAL-2026-000002', actor: 'Admin User', createdAt: '2026-06-20T08:00:00Z' },
      { id: 2, date: '2026-06-22T09:00:00Z', event: 'Status changed: Draft → Preparing Documents', actor: 'Admin User', createdAt: '2026-06-22T09:00:00Z' },
      { id: 3, date: '2026-06-23T10:00:00Z', event: 'Document uploaded: Rent increase notice letter', actor: 'Admin User', createdAt: '2026-06-23T10:00:00Z' },
    ],

    auditLog: [
      { id: 1, user: 'Admin User', timestamp: '2026-06-20T08:00:00Z', field: 'Status', oldValue: 'None', newValue: 'Draft', action: 'Create Case' },
      { id: 2, user: 'Admin User', timestamp: '2026-06-22T09:00:00Z', field: 'Status', oldValue: 'Draft', newValue: 'Preparing Documents', action: 'Update Status' }
    ],

    createdAt: '2026-06-20T08:00:00Z',
    updatedAt: '2026-06-23T10:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
  {
    id: 3,
    caseNumber: 'TAL-2026-000003',

    companyId: 1,
    propertyId: 1,
    propertyName: 'Parkview Heights',
    unitId: 1,
    unitNumber: 'Apt 101',
    tenantId: 101,
    tenantName: 'Sarah Connor',
    leaseId: 1,
    renewalId: null,

    invoiceIds: [4],
    hearingIds: [2],
    documentIds: [4, 5],
    noteIds: [3],
    taskIds: [4],

    caseType: 'Property Damage',
    subject: 'Property Damage Recovery',
    caseSummary: 'Tenant caused water damage to the unit bathroom. Insurance estimate places repair cost at $3,200. TAL case filed for cost recovery.',
    status: 'Hearing Completed',
    priority: 'Urgent',
    filedDate: '2026-06-18',
    closedDate: null,
    outcome: 'Pending',

    assignedManagerId: 'usr-001',
    assignedManagerName: 'Admin User',
    assignedLawyerId: 'lwy-003',
    assignedLawyerName: 'Me. Ahmed Hassan',

    nextHearingDate: '2026-07-28T14:00:00Z',
    courtRoom: 'Room 2B',
    judgeId: 'jdg-002',
    judgeName: 'Justice Fatima Al-Said',

    // Financial Details
    monthlyRent: 1350,
    outstandingRent: 3200,
    filingFee: 98,
    legalFees: 600,
    amountClaimed: 3898,
    recoveredAmount: 1000,
    paymentStatus: 'Partially Paid',

    timeline: [
      { id: 1, date: '2026-06-18T10:00:00Z', event: 'Case Created: TAL-2026-000003', actor: 'Admin User', createdAt: '2026-06-18T10:00:00Z' },
      { id: 2, date: '2026-06-18T10:30:00Z', event: 'Status changed: Draft → Filed', actor: 'Admin User', createdAt: '2026-06-18T10:30:00Z' },
      { id: 3, date: '2026-06-19T09:00:00Z', event: 'Document uploaded: Damage photos package', actor: 'Admin User', createdAt: '2026-06-19T09:00:00Z' },
      { id: 4, date: '2026-06-20T11:00:00Z', event: 'Hearing scheduled for 2026-07-28 in Room 2B', actor: 'Me. Ahmed Hassan', createdAt: '2026-06-20T11:00:00Z' },
      { id: 5, date: '2026-06-25T10:00:00Z', event: 'Status changed: Filed → Hearing Scheduled', actor: 'Admin User', createdAt: '2026-06-25T10:00:00Z' },
      { id: 6, date: '2026-07-01T15:00:00Z', event: 'Status changed: Hearing Scheduled → Preparing Hearing', actor: 'Admin User', createdAt: '2026-07-01T15:00:00Z' },
      { id: 7, date: '2026-07-03T17:00:00Z', event: 'Status changed: Preparing Hearing → Hearing Completed', actor: 'Me. Ahmed Hassan', createdAt: '2026-07-03T17:00:00Z' },
    ],

    auditLog: [
      { id: 1, user: 'Admin User', timestamp: '2026-06-18T10:00:00Z', field: 'Status', oldValue: 'None', newValue: 'Draft', action: 'Create Case' },
      { id: 2, user: 'Admin User', timestamp: '2026-06-18T10:30:00Z', field: 'Status', oldValue: 'Draft', newValue: 'Filed', action: 'Update Status' },
      { id: 3, user: 'Admin User', timestamp: '2026-06-25T10:00:00Z', field: 'Status', oldValue: 'Filed', newValue: 'Hearing Scheduled', action: 'Update Status' },
      { id: 4, user: 'Admin User', timestamp: '2026-07-01T15:00:00Z', field: 'Status', oldValue: 'Hearing Scheduled', newValue: 'Preparing Hearing', action: 'Update Status' },
      { id: 5, user: 'Me. Ahmed Hassan', timestamp: '2026-07-03T17:00:00Z', field: 'Status', oldValue: 'Preparing Hearing', newValue: 'Hearing Completed', action: 'Update Status' }
    ],

    createdAt: '2026-06-18T10:00:00Z',
    updatedAt: '2026-07-03T17:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
];

// ─── SEED: CASE HEARINGS ───────────────────────────────────────
export const mockCaseHearings = [
  {
    id: 1,
    caseId: 1,
    date: '2026-07-20T10:00:00Z',
    courtRoom: 'Room 4A',
    judgeId: 'jdg-001',
    judgeName: 'Justice Robert Côté',
    notes: 'Initial hearing. Both parties to present evidence.',
    outcome: null,
    reminderSent: false,
    createdAt: '2026-06-15T11:00:00Z',
    updatedAt: '2026-06-15T11:00:00Z',
    createdBy: 'Me. Jean Tremblay',
    updatedBy: 'Me. Jean Tremblay',
  },
  {
    id: 2,
    caseId: 3,
    date: '2026-07-28T14:00:00Z',
    courtRoom: 'Room 2B',
    judgeId: 'jdg-002',
    judgeName: 'Justice Fatima Al-Said',
    notes: 'Damage assessment hearing.',
    outcome: null,
    reminderSent: false,
    createdAt: '2026-06-20T11:00:00Z',
    updatedAt: '2026-06-20T11:00:00Z',
    createdBy: 'Me. Ahmed Hassan',
    updatedBy: 'Me. Ahmed Hassan',
  },
];

// ─── SEED: CASE DOCUMENTS ─────────────────────────────────────
export const mockCaseDocuments = [
  {
    id: 1,
    caseId: 1,
    name: 'TAL Notice — John Doe.pdf',
    type: 'NOTICE',
    size: '128 KB',
    uploadedAt: '2026-06-08T10:00:00Z',
    url: '#mock-document-1',
    createdAt: '2026-06-08T10:00:00Z',
    updatedAt: '2026-06-08T10:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
  {
    id: 2,
    caseId: 1,
    name: 'Lease Agreement — Apt 301.pdf',
    type: 'LEASE',
    size: '256 KB',
    uploadedAt: '2026-06-10T09:00:00Z',
    url: '#mock-document-2',
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
    createdBy: 'Me. Jean Tremblay',
    updatedBy: 'Me. Jean Tremblay',
  },
  {
    id: 3,
    caseId: 2,
    name: 'Rent Increase Notice — Alice Cooper.pdf',
    type: 'NOTICE',
    size: '96 KB',
    uploadedAt: '2026-06-23T10:00:00Z',
    url: '#mock-document-3',
    createdAt: '2026-06-23T10:00:00Z',
    updatedAt: '2026-06-23T10:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
  {
    id: 4,
    caseId: 3,
    name: 'Damage Photos Package.zip',
    type: 'PHOTOS',
    size: '4.2 MB',
    uploadedAt: '2026-06-19T09:00:00Z',
    url: '#mock-document-4',
    createdAt: '2026-06-19T09:00:00Z',
    updatedAt: '2026-06-19T09:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
  {
    id: 5,
    caseId: 3,
    name: 'Insurance Damage Estimate.pdf',
    type: 'EVIDENCE',
    size: '512 KB',
    uploadedAt: '2026-06-19T09:30:00Z',
    url: '#mock-document-5',
    createdAt: '2026-06-19T09:30:00Z',
    updatedAt: '2026-06-19T09:30:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
];

// ─── SEED: CASE NOTES ─────────────────────────────────────────
export const mockCaseNotes = [
  {
    id: 1,
    caseId: 1,
    text: 'Spoke with tenant. He acknowledges the debt but is seeking a payment plan. Lawyer advises we proceed with TAL hearing as planned.',
    author: 'Admin User',
    timestamp: '2026-06-12T15:30:00Z',
    createdAt: '2026-06-12T15:30:00Z',
    updatedAt: '2026-06-12T15:30:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
  {
    id: 2,
    caseId: 2,
    text: 'Tenant has submitted comparable rent analysis showing similar units renting at $900-$920. This may affect our position.',
    author: 'Me. Marie Leblanc',
    timestamp: '2026-06-24T10:00:00Z',
    createdAt: '2026-06-24T10:00:00Z',
    updatedAt: '2026-06-24T10:00:00Z',
    createdBy: 'Me. Marie Leblanc',
    updatedBy: 'Me. Marie Leblanc',
  },
  {
    id: 3,
    caseId: 3,
    text: 'Plumber confirmed damage was caused by tenant negligence (leaving tap running). Strong case for full recovery.',
    author: 'Me. Ahmed Hassan',
    timestamp: '2026-06-21T14:00:00Z',
    createdAt: '2026-06-21T14:00:00Z',
    updatedAt: '2026-06-21T14:00:00Z',
    createdBy: 'Me. Ahmed Hassan',
    updatedBy: 'Me. Ahmed Hassan',
  },
];

// ─── SEED: CASE TASKS ─────────────────────────────────────────
// entityType: 'TAL_CASE' — reusable for RENEWAL, INVOICE, MAINTENANCE
export const mockCaseTasks = [
  {
    id: 'TASK-2026-000001',
    title: 'Gather all unpaid invoice records',
    description: 'Compile invoices INV-2026-000003 and supporting payment records for case TAL-2026-000001.',
    entityType: 'TAL_CASE',
    entityId: 1,

    // Full hierarchy linkage (for future Calendar/Notification modules)
    companyId: 1,
    propertyId: 3,
    propertyName: 'Greenfield Commons',
    unitId: 3,
    unitNumber: 'Apt 301',
    tenantId: 103,
    tenantName: 'John Doe',
    leaseId: 3,

    assignedTo: 'Admin User',
    assignedToId: 'usr-001',
    dueDate: '2026-07-05',
    priority: 'HIGH',
    status: 'COMPLETED',
    completionDate: '2026-07-03',
    reminderDate: '2026-07-04',
    reminderSent: true,

    history: [
      { date: '2026-06-10T09:00:00Z', activity: 'Task Created', actor: 'Admin User' },
      { date: '2026-07-03T11:00:00Z', activity: 'Status changed: Pending → Completed', actor: 'Admin User' },
    ],

    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-07-03T11:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
  {
    id: 'TASK-2026-000002',
    title: 'Serve legal notice via registered mail',
    description: 'Send TAL notice package to tenant John Doe at Apt 301 via registered Canada Post.',
    entityType: 'TAL_CASE',
    entityId: 1,

    companyId: 1,
    propertyId: 3,
    propertyName: 'Greenfield Commons',
    unitId: 3,
    unitNumber: 'Apt 301',
    tenantId: 103,
    tenantName: 'John Doe',
    leaseId: 3,

    assignedTo: 'Me. Jean Tremblay',
    assignedToId: 'lwy-001',
    dueDate: '2026-07-18',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    completionDate: null,
    reminderDate: '2026-07-17',
    reminderSent: false,

    history: [
      { date: '2026-06-15T11:00:00Z', activity: 'Task Created', actor: 'Admin User' },
      { date: '2026-06-16T09:00:00Z', activity: 'Status changed: Pending → In Progress', actor: 'Me. Jean Tremblay' },
    ],

    createdAt: '2026-06-15T11:00:00Z',
    updatedAt: '2026-06-16T09:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Me. Jean Tremblay',
  },
  {
    id: 'TASK-2026-000003',
    title: 'Prepare comparable rent analysis rebuttal',
    description: 'Research and document counter-evidence for TAL-2026-000002 rent increase contestation.',
    entityType: 'TAL_CASE',
    entityId: 2,

    companyId: 1,
    propertyId: 2,
    propertyName: 'Sunset Towers',
    unitId: 2,
    unitNumber: 'Apt 201',
    tenantId: 102,
    tenantName: 'Alice Cooper',
    leaseId: 2,

    assignedTo: 'Me. Marie Leblanc',
    assignedToId: 'lwy-002',
    dueDate: '2026-07-01',
    priority: 'MEDIUM',
    status: 'OVERDUE',
    completionDate: null,
    reminderDate: '2026-06-30',
    reminderSent: true,

    history: [
      { date: '2026-06-22T09:00:00Z', activity: 'Task Created', actor: 'Admin User' },
    ],

    createdAt: '2026-06-22T09:00:00Z',
    updatedAt: '2026-06-22T09:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
  {
    id: 'TASK-2026-000004',
    title: 'File damage claim and supporting evidence at TAL',
    description: 'Submit case TAL-2026-000003 with all damage documentation to Tribunal Administratif du Logement.',
    entityType: 'TAL_CASE',
    entityId: 3,

    companyId: 1,
    propertyId: 1,
    propertyName: 'Parkview Heights',
    unitId: 1,
    unitNumber: 'Apt 101',
    tenantId: 101,
    tenantName: 'Sarah Connor',
    leaseId: 1,

    assignedTo: 'Me. Ahmed Hassan',
    assignedToId: 'lwy-003',
    dueDate: '2026-07-25',
    priority: 'URGENT',
    status: 'PENDING',
    completionDate: null,
    reminderDate: '2026-07-24',
    reminderSent: false,

    history: [
      { date: '2026-06-18T10:00:00Z', activity: 'Task Created', actor: 'Admin User' },
    ],

    createdAt: '2026-06-18T10:00:00Z',
    updatedAt: '2026-06-18T10:00:00Z',
    createdBy: 'Admin User',
    updatedBy: 'Admin User',
  },
];
