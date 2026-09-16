const KEY = 'mock_integration_webhooks';

export const webhookService = {
  getStore() {
    const list = localStorage.getItem(KEY);
    if (!list) {
      const defaults = [
        { id: 'wh-1', url: 'https://api.tenant-portal.com/webhooks/rent', event: 'payment.received', status: 'Active', createdAt: new Date().toISOString() },
        { id: 'wh-2', url: 'https://analytics.horizex.com/webhooks/inflow', event: 'invoice.created', status: 'Active', createdAt: new Date().toISOString() }
      ];
      localStorage.setItem(KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(list);
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll() {
    return this.getStore();
  },

  create(webhook) {
    if (!webhook.url || !webhook.event) throw new Error('Missing URL or Event Topic');
    const list = this.getStore();
    const newWh = {
      id: `wh-${Date.now()}`,
      status: 'Active',
      createdAt: new Date().toISOString(),
      ...webhook
    };
    list.push(newWh);
    this.setStore(list);
    return newWh;
  },

  delete(id) {
    let list = this.getStore();
    list = list.filter(w => w.id !== id);
    this.setStore(list);
    return true;
  }
};

export default webhookService;
