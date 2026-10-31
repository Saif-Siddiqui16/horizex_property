export const RENEWAL_STATUSES = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  NOTICE_PENDING: { label: 'Notice Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  NOTICE_SENT: { label: 'Notice Sent', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  WAITING_RESPONSE: { label: 'Waiting Response', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  NEGOTIATING: { label: 'Negotiating', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ACCEPTED: { label: 'Accepted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REFUSED: { label: 'Refused', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  OPEN_CASE: { label: 'Open Case', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  NOT_RENEWING: { label: 'Not Renewing', color: 'bg-slate-200 text-slate-800 border-slate-300' },
  EXPIRED: { label: 'Expired', color: 'bg-red-50 text-red-700 border-red-200' }
};

export const mockRenewals = [
  {
    id: 1,
    leaseId: 1, // Sarah Connor (Apt 101, Parkview Heights, Company: Apex Real Estate Partners)
    status: 'Accepted',
    proposedRent: 1200,
    renewalDueDate: '2025-09-30',
    noticeSent: true,
    noticeDate: '2025-09-01',
    responseReceived: true,
    responseDate: '2025-10-15',
    refusalDate: null,
    assignedManager: 'Michael Scott',
    history: [
      { date: '2025-09-01', activity: 'Notice Sent to Tenant' },
      { date: '2025-09-20', activity: 'Reminder Sent to Tenant' },
      { date: '2025-10-15', activity: 'Tenant Response Received: Accepted' }
    ],
    documents: [
      { id: 1, name: 'Renewal_Agreement_L1.pdf', type: 'Agreement', uploadDate: '2025-10-15', size: '2.4 MB' }
    ],
    notes: [
      { id: 1, text: 'Tenant agreed with the proposed $100 increase.', timestamp: '2025-10-15 14:30', author: 'Michael Scott' }
    ],
    reminders: [
      { id: 1, type: 'Initial Notice', status: 'Reminder Sent', dateScheduled: '2025-09-01', dateSent: '2025-09-01' },
      { id: 2, type: 'First Follow-up', status: 'Reminder Sent', dateScheduled: '2025-09-20', dateSent: '2025-09-20' }
    ]
  },
  {
    id: 2,
    leaseId: 2, // Alice Cooper (Apt 201, Sunset Towers, Company: Soros Capital LLC)
    status: 'Negotiating',
    proposedRent: 1050,
    renewalDueDate: '2026-02-28',
    noticeSent: true,
    noticeDate: '2026-02-01',
    responseReceived: true,
    responseDate: '2026-02-15',
    refusalDate: null,
    assignedManager: 'Jim Halpert',
    history: [
      { date: '2026-02-01', activity: 'Notice Sent to Tenant' },
      { date: '2026-02-15', activity: 'Tenant Counter-Proposed: $1000' }
    ],
    documents: [],
    notes: [
      { id: 2, text: 'Negotiating mid-point increase.', timestamp: '2026-02-16 10:00', author: 'Jim Halpert' }
    ],
    reminders: [
      { id: 3, type: 'Initial Notice', status: 'Reminder Sent', dateScheduled: '2026-02-01', dateSent: '2026-02-01' },
      { id: 4, type: 'Follow-up Email', status: 'Upcoming Reminder', dateScheduled: '2026-02-25', dateSent: '' }
    ]
  },
  {
    id: 3,
    leaseId: 3, // John Doe (Apt 301, Greenfield Commons, Company: Soros Capital LLC) - Historical Record
    status: 'Refused',
    proposedRent: 1300,
    renewalDueDate: '2025-03-31',
    noticeSent: true,
    noticeDate: '2025-03-01',
    responseReceived: true,
    responseDate: '2025-03-20',
    refusalDate: '2025-03-20',
    assignedManager: 'Dwight Schrute',
    history: [
      { date: '2025-03-01', activity: 'Notice Sent to Tenant' },
      { date: '2025-03-20', activity: 'Tenant Refused Proposal' }
    ],
    documents: [],
    notes: [
      { id: 3, text: 'First proposal refused.', timestamp: '2025-03-21 11:00', author: 'Dwight Schrute' }
    ],
    reminders: []
  },
  {
    id: 4,
    leaseId: 3, // John Doe - Latest active workflow (multiple renewals per lease)
    status: 'Open Case',
    proposedRent: 1250,
    renewalDueDate: '2025-05-15',
    noticeSent: true,
    noticeDate: '2025-04-15',
    responseReceived: false,
    responseDate: null,
    refusalDate: null,
    assignedManager: 'Dwight Schrute',
    history: [
      { date: '2025-04-15', activity: 'Second Notice Sent with revised rent' }
    ],
    documents: [],
    notes: [
      { id: 4, text: 'Waiting for response on second offer.', timestamp: '2025-04-16 09:00', author: 'Dwight Schrute' }
    ],
    reminders: [
      { id: 5, type: 'Second Notice', status: 'Reminder Sent', dateScheduled: '2025-04-15', dateSent: '2025-04-15' },
      { id: 6, type: 'Final Call', status: 'Reminder Scheduled', dateScheduled: '2025-05-01', dateSent: '' }
    ]
  }
];
