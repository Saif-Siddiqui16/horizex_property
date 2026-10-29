import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    CreditCard,
    DollarSign,
    Wrench,
    MessageSquare,
    ShieldAlert,
    PieChart,
    Settings as SettingsIcon,
    Car,
    Clock,
    FileSignature,
    Scale,
    StickyNote,
    Mail,
    Send,
    HelpCircle,
    Landmark
} from 'lucide-react';

const WorkspaceContext = createContext(null);

// Route to Title & Icon dictionary
const ROUTE_INFO_MAP = {
    '/dashboard': { title: 'Overview Dashboard', icon: LayoutDashboard },
    '/vacancy': { title: 'Vacancy Dashboard', icon: PieChart },
    '/revenue': { title: 'Revenue Dashboard', icon: DollarSign },
    '/properties': { title: 'Properties', icon: Building2 },
    '/properties/buildings': { title: 'Buildings List', icon: Building2 },
    '/units': { title: 'Units Dashboard', icon: Building2 },
    '/unit-readiness': { title: 'Unit Readiness', icon: Wrench },
    '/tenants': { title: 'Tenants Directory', icon: Users },
    '/tenants/vehicles': { title: 'Vehicles', icon: Car },
    '/owners': { title: 'Owners', icon: Users },
    '/insurance-alerts': { title: 'Insurance Alerts', icon: ShieldAlert },
    '/documents': { title: 'Document Library', icon: FileText },
    '/rental-applications': { title: 'Rental Applications', icon: FileSignature },
    '/leases': { title: 'Lease History', icon: FileSignature },
    '/leases/new': { title: 'New Lease', icon: FileSignature },
    '/leases/new-bedroom': { title: 'New Bedroom Lease', icon: FileSignature },
    '/leases/renewals': { title: 'Lease Renewals', icon: Clock },
    '/rent-roll': { title: 'Rent Roll', icon: FileText },
    '/tal-cases': { title: 'TAL Legal Cases', icon: Scale },
    '/tal-cases/calendar': { title: 'TAL Calendar', icon: Scale },
    '/notes-hub': { title: 'Notes Hub', icon: StickyNote },
    '/payments/invoices': { title: 'Rent Invoices', icon: FileText },
    '/payments/collection': { title: 'Rent Collection', icon: CreditCard },
    '/payments/received': { title: 'Payments Received', icon: DollarSign },
    '/payments/outstanding': { title: 'Outstanding Rent List', icon: CreditCard },
    '/payments/refunds': { title: 'Refunds & Adjustments', icon: DollarSign },
    '/payments/new': { title: 'New Payment', icon: CreditCard },
    '/accounting/bank-accounts': { title: 'Bank Accounts', icon: Landmark },
    '/accounting': { title: 'Accounting Ledger', icon: DollarSign },
    '/accounting/chart-of-accounts': { title: 'Chart of Accounts', icon: DollarSign },
    '/accounting/tax-settings': { title: 'Tax Settings', icon: SettingsIcon },
    '/settings/quickbooks': { title: 'QuickBooks Sync', icon: SettingsIcon },
    '/reports': { title: 'Financial Reports', icon: PieChart },
    '/maintenance': { title: 'Maintenance & Repairs', icon: Wrench },
    '/tickets': { title: 'Support Tickets', icon: HelpCircle },
    '/communication': { title: 'Communication Hub', icon: MessageSquare },
    '/admin/email/composer': { title: 'Email Composer', icon: Mail },
    '/admin/email/templates': { title: 'Email Templates', icon: Mail },
    '/admin/email/history': { title: 'Email History', icon: Send },
    '/admin/sms/inbox': { title: 'SMS Inbox', icon: MessageSquare },
    '/admin/sms/campaigns': { title: 'SMS Campaigns', icon: Send },
    '/admin/sms/templates': { title: 'SMS Templates', icon: MessageSquare },
    '/team-management': { title: 'Team Management', icon: Users },
    '/settings': { title: 'System Settings', icon: SettingsIcon },
    '/profile': { title: 'User Profile', icon: Users },
    '/payroll/dashboard': { title: 'Payroll Dashboard', icon: DollarSign },
    '/payroll/employees': { title: 'Employee Directory', icon: Users },
    '/payroll/attendance': { title: 'Attendance', icon: Clock },
    '/payroll/shifts': { title: 'Shifts', icon: Clock },
    '/payroll/leaves': { title: 'Leaves', icon: Clock },
    '/payroll/overtime': { title: 'Overtime', icon: Clock },
    '/payroll/run': { title: 'Run Payroll', icon: DollarSign },
    '/payroll/timeline': { title: 'Payroll Timeline', icon: Clock }
};

export const getRouteInfo = (pathname) => {
    // Exact match first
    if (ROUTE_INFO_MAP[pathname]) {
        return ROUTE_INFO_MAP[pathname];
    }

    // Dynamic paths match
    if (pathname.startsWith('/properties/')) {
        return { title: 'Property Detail', icon: Building2 };
    }
    if (pathname.startsWith('/units/')) {
        if (pathname.includes('/bedrooms')) return { title: 'Bedroom Setup', icon: Building2 };
        if (pathname.includes('/switch-mode')) return { title: 'Rental Mode', icon: Building2 };
        return { title: 'Unit Detail', icon: Building2 };
    }
    if (pathname.startsWith('/tenants/')) {
        return { title: 'Tenant Detail', icon: Users };
    }
    if (pathname.startsWith('/leases/renewals/')) {
        return { title: 'Renewal Detail', icon: Clock };
    }
    if (pathname.startsWith('/tal-cases/')) {
        return { title: 'TAL Case Detail', icon: Scale };
    }
    if (pathname.startsWith('/notes-hub/')) {
        return { title: 'Note Detail', icon: StickyNote };
    }

    // Fallback: capitalize last segment
    const segments = pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1] || 'Dashboard';
    const formatted = lastSeg.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return { title: formatted, icon: LayoutDashboard };
};

const STORAGE_KEY = 'horizex_workspace_windows_v1';
const STORAGE_SPLIT_KEY = 'horizex_workspace_split_v1';

export const WorkspaceProvider = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Load initial windows from sessionStorage
    const [openWindows, setOpenWindows] = useState(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Failed to parse saved workspace windows:', e);
        }
        // Default initial tab
        const initialInfo = getRouteInfo(location.pathname);
        return [{
            id: location.pathname,
            path: location.pathname + location.search,
            title: initialInfo.title,
            closable: location.pathname !== '/dashboard'
        }];
    });

    const [activeWindowId, setActiveWindowId] = useState(location.pathname);

    // Split Screen state
    const [splitMode, setSplitMode] = useState(() => {
        try {
            return sessionStorage.getItem(STORAGE_SPLIT_KEY) === 'true';
        } catch (e) {
            return false;
        }
    });

    const [secondaryWindowId, setSecondaryWindowId] = useState(() => {
        return null;
    });

    // Save windows to sessionStorage on update
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(openWindows));
        } catch (e) {}
    }, [openWindows]);

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_SPLIT_KEY, String(splitMode));
        } catch (e) {}
    }, [splitMode]);

    // Track route changes and auto-register active window
    useEffect(() => {
        const path = location.pathname;
        const fullPath = location.pathname + location.search;

        // Skip registration if in embedded viewMode
        const params = new URLSearchParams(location.search);
        if (params.get('viewMode') === 'embedded') return;

        setActiveWindowId(path);

        setOpenWindows(prev => {
            const exists = prev.some(w => w.id === path);
            if (exists) {
                // Update fullPath in case search query changed
                return prev.map(w => w.id === path ? { ...w, path: fullPath } : w);
            }
            const info = getRouteInfo(path);
            return [
                ...prev,
                {
                    id: path,
                    path: fullPath,
                    title: info.title,
                    closable: path !== '/dashboard'
                }
            ];
        });
    }, [location.pathname, location.search]);

    // Open or switch to a window
    const openWindow = useCallback((path, title) => {
        const basePath = path.split('?')[0];
        const info = getRouteInfo(basePath);
        const windowTitle = title || info.title;

        setOpenWindows(prev => {
            if (prev.some(w => w.id === basePath)) {
                return prev.map(w => w.id === basePath ? { ...w, path } : w);
            }
            return [
                ...prev,
                {
                    id: basePath,
                    path,
                    title: windowTitle,
                    closable: basePath !== '/dashboard'
                }
            ];
        });

        setActiveWindowId(basePath);
        navigate(path);
    }, [navigate]);

    // Close a window
    const closeWindow = useCallback((idToClose, e) => {
        if (e) e.stopPropagation();

        setOpenWindows(prev => {
            const remaining = prev.filter(w => w.id !== idToClose);
            
            // If we closed the active window, switch to another open window
            if (activeWindowId === idToClose) {
                if (remaining.length > 0) {
                    const nextActive = remaining[remaining.length - 1];
                    setActiveWindowId(nextActive.id);
                    navigate(nextActive.path);
                } else {
                    // Fallback to dashboard
                    setActiveWindowId('/dashboard');
                    navigate('/dashboard');
                    return [{
                        id: '/dashboard',
                        path: '/dashboard',
                        title: 'Overview Dashboard',
                        closable: false
                    }];
                }
            }

            // If secondary split window was closed
            if (secondaryWindowId === idToClose) {
                const nextSec = remaining.find(w => w.id !== activeWindowId);
                setSecondaryWindowId(nextSec ? nextSec.id : null);
                if (!nextSec) {
                    setSplitMode(false);
                }
            }

            return remaining.length > 0 ? remaining : [{
                id: '/dashboard',
                path: '/dashboard',
                title: 'Overview Dashboard',
                closable: false
            }];
        });
    }, [activeWindowId, secondaryWindowId, navigate]);

    // Switch active window
    const switchToWindow = useCallback((windowItem) => {
        setActiveWindowId(windowItem.id);
        navigate(windowItem.path);
    }, [navigate]);

    // Toggle split mode
    const toggleSplitMode = useCallback((forcedSecondaryId) => {
        setSplitMode(prev => {
            const nextMode = !prev;
            if (nextMode) {
                // If opening split mode, select a secondary window
                if (forcedSecondaryId) {
                    setSecondaryWindowId(forcedSecondaryId);
                } else if (!secondaryWindowId || secondaryWindowId === activeWindowId) {
                    const candidate = openWindows.find(w => w.id !== activeWindowId);
                    if (candidate) {
                        setSecondaryWindowId(candidate.id);
                    } else {
                        // Open Outstanding Dues or Units as example secondary window if only 1 tab is open
                        const fallbackPath = activeWindowId === '/units' ? '/payments/outstanding' : '/units';
                        const fallbackInfo = getRouteInfo(fallbackPath);
                        setOpenWindows(wList => {
                            if (wList.some(w => w.id === fallbackPath)) return wList;
                            return [...wList, {
                                id: fallbackPath,
                                path: fallbackPath,
                                title: fallbackInfo.title,
                                closable: true
                            }];
                        });
                        setSecondaryWindowId(fallbackPath);
                    }
                }
            }
            return nextMode;
        });
    }, [activeWindowId, secondaryWindowId, openWindows]);

    // Close all other windows
    const closeOtherWindows = useCallback((keepId) => {
        setOpenWindows(prev => {
            const kept = prev.filter(w => w.id === keepId || w.id === '/dashboard');
            return kept.length > 0 ? kept : prev;
        });
        if (secondaryWindowId !== keepId) {
            setSecondaryWindowId(null);
            setSplitMode(false);
        }
    }, [secondaryWindowId]);

    // Close all windows and go to dashboard
    const closeAllWindows = useCallback(() => {
        setOpenWindows([{
            id: '/dashboard',
            path: '/dashboard',
            title: 'Overview Dashboard',
            closable: false
        }]);
        setActiveWindowId('/dashboard');
        setSecondaryWindowId(null);
        setSplitMode(false);
        navigate('/dashboard');
    }, [navigate]);

    return (
        <WorkspaceContext.Provider
            value={{
                openWindows,
                activeWindowId,
                splitMode,
                secondaryWindowId,
                openWindow,
                closeWindow,
                switchToWindow,
                toggleSplitMode,
                setSecondaryWindowId,
                closeOtherWindows,
                closeAllWindows
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};
