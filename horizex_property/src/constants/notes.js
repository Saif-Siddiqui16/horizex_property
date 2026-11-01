// ENTITY TYPE REGISTRY
export const NOTE_ENTITY_TYPES = {
  TENANT:     { label: 'Tenant',        icon: 'User',        color: 'bg-blue-50 text-blue-700 border-blue-200' },
  LEASE:      { label: 'Lease',         icon: 'FileText',    color: 'bg-violet-50 text-violet-700 border-violet-200' },
  RENEWAL:    { label: 'Renewal',       icon: 'RefreshCw',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  INVOICE:    { label: 'Invoice',       icon: 'Receipt',     color: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAYMENT:    { label: 'Payment',       icon: 'CreditCard',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  TAL_CASE:   { label: 'TAL Case',     icon: 'Gavel',       color: 'bg-rose-50 text-rose-700 border-rose-200' },
  BUILDING:   { label: 'Building',      icon: 'Building2',   color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  APARTMENT:  { label: 'Apartment',     icon: 'Home',        color: 'bg-orange-50 text-orange-700 border-orange-200' },
  COMPANY:    { label: 'Company',       icon: 'Briefcase',   color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

// NOTE CATEGORIES
export const NOTE_CATEGORIES = {
  GENERAL:       { label: 'General',       color: 'bg-slate-100 text-slate-600 border-slate-200' },
  LEGAL:         { label: 'Legal',         color: 'bg-rose-50 text-rose-700 border-rose-200' },
  FINANCIAL:     { label: 'Financial',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  MAINTENANCE:   { label: 'Maintenance',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  LEASE:         { label: 'Lease',         color: 'bg-violet-50 text-violet-700 border-violet-200' },
  COMMUNICATION: { label: 'Communication', color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

// NOTE PRIORITIES
export const NOTE_PRIORITIES = {
  LOW:    { label: 'Low',    color: 'bg-slate-100 text-slate-600 border-slate-200' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  HIGH:   { label: 'High',   color: 'bg-orange-50 text-orange-700 border-orange-200' },
  URGENT: { label: 'Urgent', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

// TIMELINE EVENT TYPES
export const COMM_EVENT_TYPES = {
  NOTE_CREATED:        { label: 'Note Added',           color: 'bg-blue-500' },
  NOTE_UPDATED:        { label: 'Note Edited',          color: 'bg-indigo-500' },
  NOTE_DELETED:        { label: 'Note Deleted',         color: 'bg-slate-400' },
  COMMENT_ADDED:       { label: 'Comment Added',        color: 'bg-violet-500' },
  COMMENT_UPDATED:     { label: 'Comment Edited',       color: 'bg-purple-400' },
  COMMENT_DELETED:     { label: 'Comment Deleted',      color: 'bg-slate-300' },
  ATTACHMENT_UPLOADED: { label: 'Attachment Uploaded',  color: 'bg-emerald-500' },
  ATTACHMENT_DELETED:  { label: 'Attachment Deleted',   color: 'bg-slate-400' },
  MENTION_ADDED:       { label: 'Mention Added',        color: 'bg-amber-500' },
  NOTE_PINNED:         { label: 'Note Pinned',          color: 'bg-orange-500' },
  NOTE_UNPINNED:       { label: 'Note Unpinned',        color: 'bg-slate-400' },
};

