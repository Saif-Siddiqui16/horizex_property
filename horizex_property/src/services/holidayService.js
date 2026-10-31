const KEY = 'mock_holidays';

const DEFAULT_HOLIDAYS = [
  { id: 1, companyId: null, buildingId: null, name: "New Year's Day", date: '2026-01-01', type: 'Statutory' },
  { id: 2, companyId: null, buildingId: null, name: 'Good Friday', date: '2026-04-03', type: 'Statutory' },
  { id: 3, companyId: null, buildingId: null, name: 'Victoria Day / Journée Nationale des Patriotes', date: '2026-05-18', type: 'Statutory' },
  { id: 4, companyId: null, buildingId: null, name: 'Fête Nationale du Québec', date: '2026-06-24', type: 'Statutory' },
  { id: 5, companyId: null, buildingId: null, name: 'Canada Day', date: '2026-07-01', type: 'Statutory' },
  { id: 6, companyId: null, buildingId: null, name: 'Labour Day', date: '2026-09-07', type: 'Statutory' },
  { id: 7, companyId: null, buildingId: null, name: 'Thanksgiving', date: '2026-10-12', type: 'Statutory' },
  { id: 8, companyId: null, buildingId: null, name: 'Christmas Day', date: '2026-12-25', type: 'Statutory' }
];

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_HOLIDAYS));
    return DEFAULT_HOLIDAYS;
  }
  return JSON.parse(data);
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const holidayService = {
  getAll(filters = {}) {
    let list = getStore();
    if (filters.companyId) {
      list = list.filter(h => h.companyId === null || String(h.companyId) === String(filters.companyId));
    }
    if (filters.buildingId) {
      list = list.filter(h => h.buildingId === null || String(h.buildingId) === String(filters.buildingId));
    }
    return list;
  },

  isHoliday(dateStr, companyId = null, buildingId = null) {
    const list = this.getAll({ companyId, buildingId });
    return list.some(h => h.date === dateStr);
  },

  create(data) {
    const list = getStore();
    const newId = list.length ? Math.max(...list.map(h => h.id)) + 1 : 1;
    const item = {
      id: newId,
      companyId: data.companyId ? parseInt(data.companyId) : null,
      buildingId: data.buildingId ? parseInt(data.buildingId) : null,
      name: data.name,
      date: data.date,
      type: data.type || 'Statutory',
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
    const idx = list.findIndex(h => String(h.id) === String(id));
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...data,
      companyId: data.companyId ? parseInt(data.companyId) : null,
      buildingId: data.buildingId ? parseInt(data.buildingId) : null,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };
    setStore(list);
    return list[idx];
  },

  delete(id) {
    const list = getStore();
    const filtered = list.filter(h => String(h.id) !== String(id));
    setStore(filtered);
    return true;
  }
};

export default holidayService;
