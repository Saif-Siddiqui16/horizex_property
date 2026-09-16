export const COLLECTION_STATUSES = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  GENERATED: { label: 'Generated', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  SENT: { label: 'Sent', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  PARTIAL_PAYMENT: { label: 'Partial Payment', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  PAID: { label: 'Paid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  OVERDUE: { label: 'Overdue', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  PAYMENT_PLAN: { label: 'Payment Plan', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  LEGAL_NOTICE: { label: 'Legal Notice', color: 'bg-red-50 text-red-700 border-red-200' },
  SENT_TO_TAL: { label: 'Sent to TAL', color: 'bg-red-100 text-red-800 border-red-300' },
  CLOSED: { label: 'Closed', color: 'bg-slate-200 text-slate-800 border-slate-300' }
};

export const mockInvoices = [
  {
    id: 1,
    invoiceNo: 'INV-2026-000001',
    leaseId: 1, // Sarah Connor
    tenantId: 101,
    tenantName: 'Sarah Connor',
    propertyName: 'Parkview Heights',
    propertyId: 1,
    unitNumber: 'Apt 101',
    unitId: 1,
    amountDue: 1100,
    dueDate: '2026-06-01',
    invoiceDate: '2026-05-15',
    status: 'Paid',
    category: 'Rent',
    history: [
      { date: '2026-05-15', activity: 'Invoice Generated: INV-2026-000001' },
      { date: '2026-05-16', activity: 'Invoice Sent to Sarah Connor' }
    ],
    notes: [
      { id: 1, author: 'System', text: 'Auto-generated invoice for June rent cycle.', timestamp: '2026-05-15 08:00:00' }
    ]
  },
  {
    id: 2,
    invoiceNo: 'INV-2026-000002',
    leaseId: 2, // Alice Cooper
    tenantId: 102,
    tenantName: 'Alice Cooper',
    propertyName: 'Sunset Towers',
    propertyId: 2,
    unitNumber: 'Apt 201',
    unitId: 2,
    amountDue: 950,
    dueDate: '2026-06-01',
    invoiceDate: '2026-05-15',
    status: 'Paid',
    category: 'Rent',
    history: [
      { date: '2026-05-15', activity: 'Invoice Generated: INV-2026-000002' },
      { date: '2026-05-16', activity: 'Invoice Sent to Alice Cooper' }
    ],
    notes: []
  },
  {
    id: 3,
    invoiceNo: 'INV-2026-000003',
    leaseId: 3, // John Doe
    tenantId: 103,
    tenantName: 'John Doe',
    propertyName: 'Greenfield Commons',
    propertyId: 3,
    unitNumber: 'Apt 301',
    unitId: 3,
    amountDue: 1200,
    dueDate: '2026-06-01',
    invoiceDate: '2026-05-15',
    status: 'Overdue',
    category: 'Rent',
    history: [
      { date: '2026-05-15', activity: 'Invoice Generated: INV-2026-000003' },
      { date: '2026-05-16', activity: 'Invoice Sent to John Doe' },
      { date: '2026-06-05', activity: 'Reminder Sent: First overdue warning notification sent' }
    ],
    notes: [
      { id: 1, author: 'Agent Smith', text: 'Spoke with John. Promises payment by end of month.', timestamp: '2026-06-10 14:30:00' }
    ]
  },
  {
    id: 4,
    invoiceNo: 'INV-2026-000004',
    leaseId: 1, // Sarah Connor (next cycle)
    tenantId: 101,
    tenantName: 'Sarah Connor',
    propertyName: 'Parkview Heights',
    propertyId: 1,
    unitNumber: 'Apt 101',
    unitId: 1,
    amountDue: 1100,
    dueDate: '2026-07-01',
    invoiceDate: '2026-06-15',
    status: 'Sent',
    category: 'Rent',
    history: [
      { date: '2026-06-15', activity: 'Invoice Generated: INV-2026-000004' },
      { date: '2026-06-16', activity: 'Invoice Sent to Sarah Connor' }
    ],
    notes: []
  }
];

export const mockPayments = [
  {
    id: 1,
    invoiceId: 1,
    amountPaid: 1100,
    paymentDate: '2026-05-28',
    paymentMethod: 'E-Transfer',
    transactionId: 'TXN-99881'
  },
  {
    id: 2,
    invoiceId: 2,
    amountPaid: 950,
    paymentDate: '2026-06-01',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-99882'
  }
];

export const mockCredits = [
  {
    id: 1,
    invoiceId: 3,
    amount: 100,
    date: '2026-06-02',
    reason: 'Prepayment credit balance'
  }
];

export const mockAdjustments = [
  {
    id: 1,
    invoiceId: 3,
    amount: 50,
    type: 'Late Fee',
    reason: 'Grace period expired, auto late fee charge',
    date: '2026-06-05'
  }
];

export const mockRefunds = [];
