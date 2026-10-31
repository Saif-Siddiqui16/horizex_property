import { hasPermission } from '../utils/permissions';

export const reportPermissionService = {
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  },

  canViewDashboard() {
    const user = this.getCurrentUser();
    if (user.role === 'ADMIN' || user.role === 'COWORKER' || user.role === 'OWNER') {
      return true;
    }
    return hasPermission('Reports', 'view');
  },

  canViewReports(module) {
    const user = this.getCurrentUser();
    if (user.role === 'TENANT') return false;
    if (user.role === 'ADMIN' || user.role === 'OWNER') return true;
    
    // Coworker checks
    if (user.role === 'COWORKER') {
      if (module === 'Payroll') {
        return hasPermission('Payroll', 'view');
      }
      if (module === 'Financials' || module === 'Accounting') {
        return hasPermission('Accounting', 'view') || hasPermission('Payments', 'view');
      }
      return true; // General report views allowed
    }
    return hasPermission('Reports', 'view');
  },

  canExportReports() {
    const user = this.getCurrentUser();
    return user.role === 'ADMIN' || user.role === 'OWNER' || hasPermission('Reports', 'edit');
  },

  canManageBuilder() {
    const user = this.getCurrentUser();
    return user.role === 'ADMIN' || user.role === 'OWNER';
  },

  canManageSchedules() {
    const user = this.getCurrentUser();
    return user.role === 'ADMIN' || user.role === 'OWNER';
  }
};

export default reportPermissionService;
