const KEY = 'mock_email_templates';

const DEFAULTS = [
  {
    id: 'tpl-1',
    templateName: 'Rent Due Reminder',
    subject: 'Monthly Rent Reminder - Unit {{Unit_No}}',
    body: 'Dear {{Tenant_Name}},\n\nThis is a friendly reminder that your monthly rent of {{Due_Amount}} for unit {{Unit_No}} is due on {{Due_Date}}.\n\nPlease complete your transfer through the portal.\n\nBest Regards,\n{{Company_Name}} Management'
  },
  {
    id: 'tpl-2',
    templateName: 'Overdue Rent Alert',
    subject: 'URGENT: Overdue Notice for Unit {{Unit_No}}',
    body: 'Dear {{Tenant_Name}},\n\nOur records show that your monthly rent balance of {{Due_Amount}} is currently overdue. Please settle this balance immediately to avoid late fees.\n\nContact the office if you need support.\n\nSincerely,\n{{Company_Name}} Office'
  },
  {
    id: 'tpl-3',
    templateName: 'Lease Renewal Offer',
    subject: 'Renewal Proposal - Unit {{Unit_No}}',
    body: 'Dear {{Tenant_Name}},\n\nYour current lease is expiring on {{Expiry_Date}}. We would love to propose a renewal rate of {{Proposed_Rent}} per month.\n\nPlease accept or negotiate before {{Deadline}}.\n\nBest,\n{{Company_Name}} leasing'
  }
];

export const emailTemplateService = {
  getStore() {
    const list = localStorage.getItem(KEY);
    if (!list) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
      return DEFAULTS;
    }
    return JSON.parse(list);
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll() {
    return this.getStore();
  },

  create(tpl) {
    if (!tpl.templateName || !tpl.body) throw new Error('Missing Template Name or Body');
    const list = this.getStore();
    const newTpl = {
      id: `tpl-${Date.now()}`,
      ...tpl
    };
    list.push(newTpl);
    this.setStore(list);
    return newTpl;
  },

  delete(id) {
    let list = this.getStore();
    list = list.filter(t => t.id !== id);
    this.setStore(list);
    return true;
  }
};

export default emailTemplateService;
