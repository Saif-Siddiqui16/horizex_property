import { hasPermission } from '../utils/permissions';

export const permissionService = {
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  },

  hasRole(role) {
    const user = this.getCurrentUser();
    return user.role === role;
  },

  isAdmin() {
    return this.hasRole('ADMIN');
  },

  isCoworker() {
    return this.hasRole('COWORKER');
  },

  canViewEmployees() {
    return hasPermission('Employees', 'view') || hasPermission('Team Access Control', 'view') || this.isAdmin();
  },

  canManageEmployees() {
    return hasPermission('Employees', 'add') || hasPermission('Employees', 'edit') || hasPermission('Team Access Control', 'edit') || this.isAdmin();
  },

  canViewShifts() {
    return hasPermission('Shifts', 'view') || hasPermission('Settings', 'view') || this.isAdmin();
  },

  canManageShifts() {
    return hasPermission('Shifts', 'edit') || hasPermission('Settings', 'edit') || this.isAdmin();
  },

  canViewAttendance() {
    return hasPermission('Attendance', 'view') || hasPermission('Dashboard', 'view') || this.isAdmin();
  },

  canManageAttendance() {
    return hasPermission('Attendance', 'edit') || hasPermission('Attendance', 'add') || this.isAdmin();
  },

  canViewLeaves() {
    return hasPermission('Leaves', 'view') || hasPermission('Dashboard', 'view') || this.isAdmin();
  },

  canManageLeaves() {
    return hasPermission('Leaves', 'edit') || hasPermission('Leaves', 'add') || this.isAdmin();
  },

  canViewOvertime() {
    return hasPermission('Overtime', 'view') || hasPermission('Dashboard', 'view') || this.isAdmin();
  },

  canManageOvertime() {
    return hasPermission('Overtime', 'edit') || hasPermission('Overtime', 'add') || this.isAdmin();
  },

  canViewPayroll() {
    return hasPermission('Payroll', 'view') || hasPermission('Accounting', 'view') || this.isAdmin();
  },

  canManagePayroll() {
    return hasPermission('Payroll', 'edit') || hasPermission('Payroll', 'add') || hasPermission('Accounting', 'edit') || this.isAdmin();
  }
};

export default permissionService;
