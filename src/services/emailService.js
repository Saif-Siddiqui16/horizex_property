import integrationAuditService from './integrationAuditService';

const KEY = 'mock_integrations_emails';

const SEEDED_EMAILS = [
  { id: 'mail-1', templateName: 'Rent Due Reminder', subject: 'Monthly Rent Reminder - Unit Apt 101', body: 'Dear Sarah Connor, your monthly rent of $1,100 is due on 2026-06-01.', recipients: 'sarah.connor@sky.net', status: 'Sent', attachments: [], createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'mail-2', templateName: 'Overdue Rent Alert', subject: 'URGENT: Overdue Notice for Unit Apt 301', body: 'Dear John Doe, your rent of $1,200 is overdue.', recipients: 'john.doe@gmail.com', status: 'Failed', error: 'SMTP Connection Failed', attachments: [], createdAt: new Date(Date.now() - 7200000).toISOString() }
];

export const emailService = {
  getStore() {
    const list = localStorage.getItem(KEY);
    if (!list) {
      localStorage.setItem(KEY, JSON.stringify(SEEDED_EMAILS));
      return SEEDED_EMAILS;
    }
    return JSON.parse(list);
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll() {
    return this.getStore();
  },

  resolveMergeFields(body, data = {}) {
    let resolved = body;
    const mergeMaps = {
      '{{Tenant_Name}}': data.tenantName || 'Valued Tenant',
      '{{Unit_No}}': data.unitNo || 'Apt',
      '{{Due_Amount}}': data.dueAmount ? `$${data.dueAmount.toLocaleString()}` : '$0.00',
      '{{Due_Date}}': data.dueDate || new Date().toLocaleDateString(),
      '{{Expiry_Date}}': data.expiryDate || new Date().toLocaleDateString(),
      '{{Proposed_Rent}}': data.proposedRent ? `$${data.proposedRent.toLocaleString()}` : '$0.00',
      '{{Deadline}}': data.deadline || new Date().toLocaleDateString(),
      '{{Company_Name}}': 'Horizex Real Estate Partners'
    };

    Object.keys(mergeMaps).forEach(tag => {
      resolved = resolved.replaceAll(tag, mergeMaps[tag]);
    });
    return resolved;
  },

  send(email) {
    const list = this.getStore();
    const newMail = {
      id: `mail-${Date.now()}`,
      status: email.isDraft ? 'Draft' : 'Sent',
      attachments: email.attachments || [],
      createdAt: new Date().toISOString(),
      ...email
    };

    // Simulate occasional delivery failures (15% chance to test fail state)
    if (!email.isDraft && Math.random() < 0.15) {
      newMail.status = 'Failed';
      newMail.error = 'Deliverability Error: Recipient mailbox is full or rejected';
      integrationAuditService.logEvent('Sync Failed', 'Email Hub', `Failed to send email to ${email.recipients}: Mailbox Full`);
    } else if (!email.isDraft) {
      integrationAuditService.logEvent('Email Sent', 'Email Hub', `Email dispatched to ${email.recipients} (Subject: ${email.subject})`);
    } else {
      integrationAuditService.logEvent('Draft Saved', 'Email Hub', `Draft saved for subject: ${email.subject}`);
    }

    list.push(newMail);
    this.setStore(list);
    return newMail;
  },

  delete(id) {
    let list = this.getStore();
    list = list.filter(m => m.id !== id);
    this.setStore(list);
    return true;
  }
};

export default emailService;
