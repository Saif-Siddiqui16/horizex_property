import { store } from '../store';

/**
 * Permission Utility
 * Checks if the current user has the required action permission for a given module.
 * Reads primarily from the in-memory Redux store to prevent client-side localStorage tampering.
 */
export const hasPermission = (moduleName, action) => {
  try {
    const state = store?.getState?.();
    const user = state?.auth?.user || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

    if (!user) return false;

    // ADMIN has full unrestricted access
    if (user.role === 'ADMIN') return true;

    // Owner gets access to the Rent Roll view
    if (user.role === 'OWNER') {
      if (moduleName?.toLowerCase() === 'rent roll' && action?.toLowerCase() === 'view') {
        return true;
      }
      return false;
    }

    // Only COWORKER is restricted by granular permissions
    if (user.role !== 'COWORKER') return false;

    const permissions = state?.auth?.permissions || [];
    if (!Array.isArray(permissions) || permissions.length === 0) return false;

    // Find the specific module record
    const perm = permissions.find((p) => p.moduleName?.toLowerCase() === moduleName?.toLowerCase());
    if (!perm) return false;

    const act = (action || 'view').toLowerCase();
    if (act === 'view') return !!perm.canView;
    if (act === 'add') return !!perm.canAdd;
    if (act === 'edit') return !!perm.canEdit;
    if (act === 'delete') return !!perm.canDelete;

    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};
