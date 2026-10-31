const KEY = 'mock_saved_filters';

export const savedFilterService = {
  getStore() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  },

  setStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  getAll(module = '') {
    const list = this.getStore();
    if (module) {
      return list.filter(f => f.module === module);
    }
    return list;
  },

  save(name, module, filters) {
    if (!name || !module) throw new Error('Filter Name and Module are required');
    const list = this.getStore();
    
    // Check if name already exists for this module
    const idx = list.findIndex(f => f.name.toLowerCase() === name.toLowerCase() && f.module === module);
    const newFilter = {
      id: idx !== -1 ? list[idx].id : `filter-${Date.now()}`,
      name,
      module,
      filters,
      createdAt: idx !== -1 ? list[idx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      list[idx] = newFilter;
    } else {
      list.push(newFilter);
    }

    this.setStore(list);
    return newFilter;
  },

  delete(id) {
    let list = this.getStore();
    list = list.filter(f => f.id !== id);
    this.setStore(list);
    return true;
  }
};

export default savedFilterService;
