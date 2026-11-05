import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectUserPermissions } from '../store/authSlice';

/**
 * AccessControl component to conditionally render children based on in-memory user permissions.
 * @param {string} module - The name of the module (e.g., 'Tenants', 'Invoices')
 * @param {string} action - The action required ('view', 'add', 'edit', 'delete')
 */
export const AccessControl = ({ module, action, children }) => {
  const user = useSelector(selectCurrentUser);
  const permissions = useSelector(selectUserPermissions);

  // ADMIN has unrestricted superuser access
  if (user?.role === 'ADMIN') {
    return <>{children}</>;
  }

  // Only COWORKER role is filtered by these granular permissions
  if (user?.role !== 'COWORKER') {
    return <>{children}</>;
  }

  const perm = Array.isArray(permissions)
    ? permissions.find((p) => p.moduleName?.toLowerCase() === module?.toLowerCase())
    : null;

  if (!perm) return null;

  let hasAccess = false;
  const reqAction = (action || 'view').toLowerCase();

  if (reqAction === 'view') hasAccess = !!perm.canView;
  else if (reqAction === 'add') hasAccess = !!perm.canAdd;
  else if (reqAction === 'edit') hasAccess = !!perm.canEdit;
  else if (reqAction === 'delete') hasAccess = !!perm.canDelete;

  return hasAccess ? <>{children}</> : null;
};

export default AccessControl;
