const KEY = 'mock_salary_components';

const DEFAULT_COMPONENTS = [
  { id: 1, name: 'Housing Allowance', type: 'Allowance', calculationType: 'Fixed', value: 300, isDefault: true },
  { id: 2, name: 'Transport Allowance', type: 'Allowance', calculationType: 'Fixed', value: 150, isDefault: true },
  { id: 3, name: 'Income Tax', type: 'Tax', calculationType: 'Percentage', value: 15, basis: 'BasicSalary', isDefault: true },
  { id: 4, name: 'Health Insurance', type: 'Deduction', calculationType: 'Fixed', value: 100, isDefault: true },
  { id: 5, name: 'Performance Bonus', type: 'Bonus', calculationType: 'Fixed', value: 0, isDefault: false }
];

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_COMPONENTS));
    return DEFAULT_COMPONENTS;
  }
  return JSON.parse(data);
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

export const salaryComponentService = {
  getAll(filters = {}) {
    let list = getStore();
    if (filters.type) {
      list = list.filter(c => c.type === filters.type);
    }
    return list;
  },

  getById(id) {
    return getStore().find(c => String(c.id) === String(id)) || null;
  },

  create(data) {
    const list = getStore();
    const newId = list.length ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const item = {
      id: newId,
      name: data.name,
      type: data.type,
      calculationType: data.calculationType,
      value: parseFloat(data.value) || 0,
      basis: data.basis || 'BasicSalary',
      isDefault: data.isDefault ?? false,
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
    const idx = list.findIndex(c => String(c.id) === String(id));
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...data,
      value: parseFloat(data.value) ?? list[idx].value,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };
    setStore(list);
    return list[idx];
  },

  delete(id) {
    const list = getStore();
    const filtered = list.filter(c => String(c.id) !== String(id));
    setStore(filtered);
    return true;
  },

  calculateComponents(basicSalary) {
    const list = this.getAll();
    let allowances = 0;
    let deductions = 0;
    let tax = 0;
    let bonus = 0;
    
    const breakdown = list.map(comp => {
      let calculatedValue = 0;
      if (comp.calculationType === 'Fixed') {
        calculatedValue = comp.value;
      } else if (comp.calculationType === 'Percentage') {
        calculatedValue = (comp.value / 100) * basicSalary;
      }

      if (comp.type === 'Allowance') allowances += calculatedValue;
      if (comp.type === 'Deduction') deductions += calculatedValue;
      if (comp.type === 'Tax') tax += calculatedValue;
      if (comp.type === 'Bonus') bonus += calculatedValue;

      return {
        id: comp.id,
        name: comp.name,
        type: comp.type,
        amount: calculatedValue
      };
    });

    return {
      allowances,
      deductions,
      tax,
      bonus,
      breakdown
    };
  }
};

export default salaryComponentService;
