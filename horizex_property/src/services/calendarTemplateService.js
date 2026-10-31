const TEMPLATES = {
  'Lease Expiry': { color: 'bg-green-50 border-green-200 text-green-700', label: 'Lease Expiry' },
  'Rent Due': { color: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Rent Due' },
  'Payroll Run': { color: 'bg-violet-50 border-violet-200 text-violet-700', label: 'Payroll Run' },
  'Employee Leave': { color: 'bg-blue-50 border-blue-200 text-blue-700', label: 'Employee Leave' },
  'Hearing': { color: 'bg-rose-50 border-rose-200 text-rose-700', label: 'Court Hearing' },
  'Task': { color: 'bg-slate-100 border-slate-200 text-slate-700', label: 'Urgent Task' },
  'Meeting': { color: 'bg-indigo-50 border-indigo-200 text-indigo-700', label: 'Corporate Meeting' }
};

export const calendarTemplateService = {
  getTemplates() {
    return TEMPLATES;
  },

  getTemplateForCategory(category) {
    return TEMPLATES[category] || { color: 'bg-slate-50 border-slate-200 text-slate-600', label: category };
  }
};

export default calendarTemplateService;
