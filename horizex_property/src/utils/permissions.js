
/**
 * Permission Utility
 * Checks if the current user has the required action permission for a given module.
 */
export const hasPermission = (moduleName, action) => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;
        
        const user = JSON.parse(userStr);
        
        // Super Admin gets all access
        if (user.role === 'ADMIN') return true;

        // Owner gets access to the Rent Roll view
        if (user.role === 'OWNER') {
            if (moduleName?.toLowerCase() === 'rent roll' && action?.toLowerCase() === 'view') {
                return true;
            }
            return false;
        }
        
        // If not a coworker, they shouldn't even be in the admin panel
        if (user.role !== 'COWORKER') return false;

        const permsStr = localStorage.getItem('permissions');
        if (!permsStr) return false;

        const permissions = JSON.parse(permsStr);
        if (!permissions || !Array.isArray(permissions)) return false;
        
        // Find the specific module record
        const perm = permissions.find(p => p.moduleName?.toLowerCase() === moduleName?.toLowerCase());
        
        if (!perm) return false;

        // Map action words to schema fields
        const act = action.toLowerCase();
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
