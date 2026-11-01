// TAL CASE CONSTANTS
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

export const mockLawyers = [
  { id: 'lwy-001', name: 'Me. Jean Tremblay', firm: 'Tremblay Legal Group', phone: '514-555-0101', email: 'jtremblay@legal.ca' },
  { id: 'lwy-002', name: 'Me. Marie Leblanc',  firm: 'Leblanc & Associates', phone: '514-555-0102', email: 'mleblanc@legal.ca' },
  { id: 'lwy-003', name: 'Me. Ahmed Hassan',   firm: 'Hassan Law Office',    phone: '514-555-0103', email: 'ahassan@legal.ca' },
];

