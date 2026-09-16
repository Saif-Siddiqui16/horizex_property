const KEY = 'mock_departments';

const DEFAULT_DEPARTMENTS = [
  { id: 1, name: 'Operations', code: 'OPS', description: 'Property and facility operations' },
  { id: 2, name: 'Maintenance', code: 'MNT', description: 'Technicians and repairs staff' },
  { id: 3, name: 'Accounting', code: 'ACT', description: 'Finance, payroll, and billing' },
  { id: 4, name: 'Sales & Leasing', code: 'SAL', description: 'Agent leasing and unit sales' },
  { id: 5, name: 'Human Resources', code: 'HR', description: 'Talent management and personnel operations' },
  { id: 6, name: 'Management', code: 'MGT', description: 'Executive and supervisor management' }
];

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_DEPARTMENTS));
    return DEFAULT_DEPARTMENTS;
  }
  return JSON.parse(data);
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const departmentService = {
  getAll() {
    return getStore();
  },
  
  getById(id) {
    return getStore().find(d => String(d.id) === String(id)) || null;
  },

  create(data) {
    const list = getStore();
    const newId = list.length ? Math.max(...list.map(d => d.id)) + 1 : 1;
    const item = {
      id: newId,
      name: data.name,
      code: data.code || data.name.substring(0, 3).toUpperCase(),
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin User',
      updatedBy: 'Admin User'
    };
    list.push(item);
    setStore(list);
    return item;
  },

  update(id, data) {
    const list = getStore();
    const idx = list.findIndex(d => String(d.id) === String(id));
    if (idx === -1) return null;
    
    list[idx] = {
      ...list[idx],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };
    setStore(list);
    return list[idx];
  },

  delete(id) {
    const list = getStore();
    const filtered = list.filter(d => String(d.id) !== String(id));
    setStore(filtered);
    return true;
  }
};

export default departmentService;
