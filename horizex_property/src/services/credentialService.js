const KEY = 'mock_integration_credentials';

export const credentialService = {
  getStore() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  get(integrationId) {
    return this.getStore().find(c => c.integrationId === integrationId) || null;
  },

  save(integrationId, credentials) {
    const list = this.getStore();
    const idx = list.findIndex(c => c.integrationId === integrationId);
    const newCred = {
      integrationId,
      ...credentials,
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      list[idx] = newCred;
    } else {
      list.push(newCred);
    }

    this.setStore(list);
    return newCred;
  },

  delete(integrationId) {
    let list = this.getStore();
    list = list.filter(c => c.integrationId !== integrationId);
    this.setStore(list);
    return true;
  }
};

export default credentialService;
