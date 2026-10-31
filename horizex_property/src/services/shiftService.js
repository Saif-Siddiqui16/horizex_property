const KEY = 'mock_shifts';

const DEFAULT_SHIFTS = [
  { id: 1, name: 'Morning', startTime: '09:00', endTime: '17:00', graceTime: 15, breakDuration: 60, weeklyOff: [0, 6], rotation: 'Fixed Schedule' },
  { id: 2, name: 'Evening', startTime: '17:00', endTime: '01:00', graceTime: 15, breakDuration: 60, weeklyOff: [0, 1], rotation: 'Fixed Schedule' },
  { id: 3, name: 'Night', startTime: '01:00', endTime: '09:00', graceTime: 15, breakDuration: 60, weeklyOff: [5, 6], rotation: 'Bi-weekly Rotation' },
  { id: 4, name: 'Flexible', startTime: '00:00', endTime: '24:00', graceTime: 30, breakDuration: 60, weeklyOff: [0], rotation: 'No Rotation' }
];

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_SHIFTS));
    return DEFAULT_SHIFTS;
  }
  return JSON.parse(data);
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const shiftService = {
  getAll() {
    return getStore();
  },

  getById(id) {
    return getStore().find(s => String(s.id) === String(id)) || null;
  },

  create(data) {
    const list = getStore();
    const newId = list.length ? Math.max(...list.map(s => s.id)) + 1 : 1;
    const item = {
      id: newId,
      name: data.name,
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '17:00',
      graceTime: parseInt(data.graceTime) || 15,
      breakDuration: parseInt(data.breakDuration) || 60,
      weeklyOff: data.weeklyOff || [0, 6], // Array of day indices (0 for Sunday, 6 for Saturday)
      rotation: data.rotation || 'Fixed Schedule',
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
    const idx = list.findIndex(s => String(s.id) === String(id));
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...data,
      graceTime: data.graceTime !== undefined ? parseInt(data.graceTime) : list[idx].graceTime,
      breakDuration: data.breakDuration !== undefined ? parseInt(data.breakDuration) : list[idx].breakDuration,
      weeklyOff: data.weeklyOff || list[idx].weeklyOff,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };
    setStore(list);
    return list[idx];
  },

  delete(id) {
    const list = getStore();
    const filtered = list.filter(s => String(s.id) !== String(id));
    setStore(filtered);
    return true;
  }
};

export default shiftService;
