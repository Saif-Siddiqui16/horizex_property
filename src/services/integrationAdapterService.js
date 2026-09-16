export const integrationAdapterService = {
  // Adapter to convert SaaS invoice to QuickBooks Online API structure
  toQuickBooksInvoice(invoice) {
    return {
      Line: [
        {
          Amount: parseFloat(invoice.amountDue || invoice.amount || 0),
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              name: invoice.category || invoice.type || 'Rent',
              value: '1'
            },
            UnitPrice: parseFloat(invoice.amountDue || invoice.amount || 0),
            Qty: 1
          }
        }
      ],
      CustomerRef: {
        value: String(invoice.tenantId || invoice.leaseId || '101'),
        name: invoice.tenantName || 'Unknown Customer'
      },
      BillEmail: {
        Address: 'tenant@property.com'
      },
      TxnDate: invoice.invoiceDate || new Date().toISOString().split('T')[0],
      DueDate: invoice.dueDate,
      DocNumber: invoice.invoiceNo || `INV-${invoice.id}`
    };
  },

  // Adapter to convert SaaS entities to standard Google Calendar Event schema
  toGoogleCalendarEvent(type, entity) {
    switch (type) {
      case 'Lease Expiry':
        return {
          summary: `Lease Expiration: ${entity.tenantName || 'Tenant'} - Unit ${entity.unitNumber || 'Apt'}`,
          description: `Active lease ending. Days remaining: ${entity.daysRemaining || 0}`,
          start: { date: entity.endDate },
          end: { date: entity.endDate },
          colorId: '10' // Green
        };
      case 'Rent Due':
        return {
          summary: `Rent Collection Due: ${entity.tenantName || 'Tenant'} - ${entity.invoiceNo}`,
          description: `Total amount due: $${entity.amount || 0}. Status: ${entity.status}`,
          start: { date: entity.dueDate },
          end: { date: entity.dueDate },
          colorId: '5' // Amber/Yellow
        };
      case 'Payroll Run':
        return {
          summary: `Execute Corporate Payroll Run: ${entity.payrollNo}`,
          description: `Net salary payouts for staff in ${entity.payrollMonth}. Status: ${entity.status}`,
          start: { date: entity.periodEnd },
          end: { date: entity.periodEnd },
          colorId: '2' // Violet
        };
      case 'Hearing':
        return {
          summary: `TAL Tribunal Case Hearing: Case ${entity.caseNo}`,
          description: `Trial schedule for ${entity.tenantName} at location ${entity.buildingName}. Status: ${entity.status}`,
          start: { dateTime: `${entity.hearDate || new Date().toISOString().split('T')[0]}T10:00:00Z` },
          end: { dateTime: `${entity.hearDate || new Date().toISOString().split('T')[0]}T12:00:00Z` },
          colorId: '11' // Red/Rose
        };
      default:
        return {
          summary: entity.title || 'SaaS Generated Event',
          description: entity.description || 'Calendar synchronization detail',
          start: { date: entity.date || new Date().toISOString().split('T')[0] },
          end: { date: entity.date || new Date().toISOString().split('T')[0] },
          colorId: '9' // Slate
        };
    }
  }
};

export default integrationAdapterService;
