import React, { useState, useEffect } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings as SettingsIcon,
  PieChart,
  CreditCard,
  Calculator,
  ChevronDown,
  ChevronRight,
  X,
  Wrench,
  ShieldAlert,
  MessageSquare,
  ClipboardList,
  Landmark,
  Mail,
  User,
  Car,
  LogOut,
  Gavel,
  StickyNote,
  Clock,
  Network
} from "lucide-react";
import clsx from "clsx";

/* =========================
   MENU CONFIG (FIXED)
 ========================= */

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    tKey: "sidebar.dashboard",
    path: "/dashboard",
    children: [
      { label: "Overview Dashboard", tKey: "sidebar.overview", path: "/dashboard" },
      { label: "Vacancy Dashboard", tKey: "sidebar.vacancy", path: "/vacancy" },
      { label: "Revenue Dashboard", tKey: "sidebar.revenue", path: "/revenue" }
    ]
  },
  {
    icon: Building2,
    label: "Buildings",
    tKey: "sidebar.properties",
    path: "/properties/buildings",
    children: [
      { label: "Buildings List", tKey: "sidebar.buildings", path: "/properties/buildings" },
      { label: "Units", tKey: "sidebar.units", path: "/units" },
      { label: "Unit Readiness", path: "/unit-readiness" }
    ]
  },
  {
    icon: Users,
    label: "Tenants",
    tKey: "sidebar.tenants",
    path: "/tenants",
    children: [
      { label: "Tenant List", tKey: "sidebar.tenant_list", path: "/tenants" },
      { label: "Vehicle Management", tKey: "sidebar.vehicles", path: "/tenants/vehicles" }
    ]
  },
  {
    icon: Landmark,
    label: "Owners",
    tKey: "sidebar.owners",
    path: "/owners"
  },
  {
    icon: FileText,
    label: "Leases",
    tKey: "sidebar.leases",
    path: "/leases",
    children: [
      { label: "Lease History", tKey: "sidebar.lease_history", path: "/leases" },
      { label: "Lease Renewals", tKey: "sidebar.renewals", path: "/leases/renewals" }
    ]
  },
  {
    icon: FileText,
    label: "Rent Roll",
    tKey: "sidebar.rent_roll",
    path: "/rent-roll"
  },
  {
    icon: FileText,
    label: "Documents",
    tKey: "sidebar.documents",
    path: "/documents"
  },
  {
    icon: CreditCard,
    label: "Payments",
    tKey: "sidebar.payments",
    path: "/payments/collection",
    children: [
      { label: "Rent Collection & Ledger", tKey: "sidebar.collection", path: "/payments/collection" },
      { label: "Payments Received", tKey: "sidebar.received", path: "/payments/received" },
      { label: "Outstanding Dues", tKey: "sidebar.outstanding", path: "/payments/outstanding" },
      { label: "Refunds & Adjustments", tKey: "sidebar.refunds", path: "/payments/refunds" }
    ]
  },
  {
    icon: Calculator,
    label: "Accounting",
    tKey: "sidebar.accounting",
    path: "/accounting",
    children: [
      { label: "General Ledger", tKey: "sidebar.ledger", path: "/accounting" },
      { label: "QuickBooks Sync", tKey: "sidebar.quickbooks", path: "/settings/quickbooks" },
      { label: "Chart of Accounts", tKey: "sidebar.chart_of_accounts", path: "/accounting/chart-of-accounts" },
      { label: "Tax Settings", tKey: "sidebar.tax_settings", path: "/accounting/tax-settings" }
    ]
  },
  {
    icon: Clock,
    label: "Time & Payroll",
    tKey: "sidebar.time_payroll",
    path: "/payroll/dashboard",
    children: [
      { label: "Dashboard", tKey: "sidebar.payroll_dash", path: "/payroll/dashboard" },
      { label: "Employees", tKey: "sidebar.employees", path: "/payroll/employees" },
      { label: "Attendance", tKey: "sidebar.attendance", path: "/payroll/attendance" },
      { label: "Shifts", tKey: "sidebar.shifts", path: "/payroll/shifts" },
      { label: "Leaves", tKey: "sidebar.leaves", path: "/payroll/leaves" },
      { label: "Overtime", tKey: "sidebar.overtime", path: "/payroll/overtime" },
      { label: "Run Payroll", tKey: "sidebar.run_payroll", path: "/payroll/run" },
      { label: "Audit Timeline", tKey: "sidebar.payroll_timeline", path: "/payroll/timeline" }
    ]
  },
  {
    icon: Gavel,
    label: "TAL Cases",
    tKey: "sidebar.tal_cases",
    path: "/tal-cases"
  },
  {
    icon: StickyNote,
    label: "Notes Hub",
    tKey: "sidebar.notes_hub",
    path: "/notes-hub"
  },
  {
    icon: PieChart,
    label: "Reports",
    tKey: "sidebar.reports",
    path: "/reports"
  },
  {
    icon: MessageSquare,
    label: "SMS Hub",
    tKey: "sidebar.sms_hub",
    path: "/admin/sms/inbox",
    children: [
      { label: "Inbox", tKey: "sidebar.inbox", path: "/admin/sms/inbox" },
      { label: "Campaign Manager", tKey: "sidebar.campaigns", path: "/admin/sms/campaigns" },
      { label: "Templates", tKey: "sidebar.templates", path: "/admin/sms/templates" }
    ]
  },
  {
    icon: Mail,
    label: "Email Hub",
    tKey: "sidebar.email_hub",
    path: "/admin/email/composer",
    children: [
      { label: "Send Email", tKey: "sidebar.send_email", path: "/admin/email/composer" },
      { label: "Email Templates", tKey: "sidebar.email_templates", path: "/admin/email/templates" },
      { label: "Sent Emails", tKey: "sidebar.email_history", path: "/admin/email/history" }
    ]
  },
  {
    icon: ClipboardList,
    label: "Maintenance",
    tKey: "sidebar.maintenance",
    path: "/maintenance"
  },
  {
    icon: Wrench,
    label: "Tickets",
    tKey: "sidebar.tickets",
    path: "/tickets"
  },
  {
    icon: Users,
    label: "Team Access Control",
    tKey: "sidebar.team",
    path: "/team-management"
  },

  {
    icon: SettingsIcon,
    label: "Settings",
    tKey: "sidebar.settings",
    path: "/settings"
  },
  {
    icon: User,
    label: "Profile",
    tKey: "sidebar.profile",
    path: "/profile"
  }
];

/* =========================
   NAV ITEM
 ========================= */

const NavItem = ({ item, depth = 0, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const hasChildren = item.children?.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (hasChildren) {
      const activeChild = item.children.some(child =>
        location.pathname.startsWith(child.path)
      );
      setIsOpen(activeChild);
    }
  }, [location.pathname]);

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(prev => !prev);
    } else {
      onClose?.();
    }
  };

  return (
    <>
      <NavLink
        to={item.path}
        end={item.path === '/leases' || item.path === '/tenants' || item.path === '/dashboard' || item.path === '/properties/buildings' || item.path === '/accounting' || item.path === '/tal-cases' || item.path === '/notes-hub' || item.path === '/payments/collection' || item.path === '/payroll/dashboard'}
        onClick={handleClick}
        className={({ isActive }) =>
          clsx(
            "flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-200 group relative",
            isActive && !hasChildren
              ? "bg-zinc-800/80 text-white relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-1/2 before:w-1 before:bg-blue-500 before:rounded-r-full"
              : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100"
          )
        }
        style={{ paddingLeft: `calc(16px + ${depth * 14}px)` }}
      >
        {item.icon && <item.icon size={18} className={clsx("shrink-0 transition-colors", hasChildren ? "text-zinc-400 group-hover:text-zinc-300" : "")} />}
        <span className="flex-1 truncate">{t(item.tKey || item.label)}</span>
        {(item.label === 'SMS Hub' || item.label === 'Inbox') && (
          <UnreadSMSBadge />
        )}
        {hasChildren && (isOpen ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />)}
      </NavLink>

      {hasChildren && isOpen && (
        <div className="ml-2">
          {item.children.map(child => (
            <NavItem
              key={child.path}
              item={child}
              depth={depth + 1}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </>
  );
};

/* =========================
   SIDEBAR
 ========================= */

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  /* SCROLL PRESERVATION */
  const navRef = React.useRef(null);

  useEffect(() => {
    // Restore scroll position on mount
    const savedScroll = sessionStorage.getItem('adminSidebarScroll');
    if (navRef.current && savedScroll) {
      navRef.current.scrollTop = Number(savedScroll);
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      if (navRef.current) {
        sessionStorage.setItem('adminSidebarScroll', navRef.current.scrollTop);
      }
    };

    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (navElement) {
        navElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 bg-black/40 z-40 lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={onClose}
      />

      <aside className={clsx(
        "fixed left-0 top-0 h-screen w-[280px] bg-zinc-950 border-r border-zinc-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        <div className="h-14 sm:h-16 flex items-center px-4 lg:px-6 justify-between shrink-0 border-b border-zinc-800/50">
          <div className="flex items-center gap-4">
            <div className="bg-[#1a1a1a] border border-slate-700/50 rounded-2xl shrink-0 w-[52px] h-[52px] flex items-center justify-center overflow-hidden">
              <img src="/assets/logo.png" alt="Horizex Logo" className="w-[80%] h-[80%] object-contain brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-wide leading-none">HORIZEX</span>
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">WORKSPACE</span>
            </div>
          </div>
          <button className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-[var(--radius-md)] transition-colors" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="px-4 mb-3 mt-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Main Menu</p>
          </div>
          {(() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
            
            // Re-render trigger from custom event
            const [forceUpdate, setForceUpdate] = React.useState(0);
            React.useEffect(() => {
              const handleUpdate = () => setForceUpdate(prev => prev + 1);
              window.addEventListener('permissionsUpdated', handleUpdate);
              return () => window.removeEventListener('permissionsUpdated', handleUpdate);
            }, []);

            const labelToModule = {
              'Dashboard': 'Dashboard',
              'Overview': 'Overview',
              'Vacancy Dashboard': 'Vacancy Dashboard',
              'Revenue Dashboard': 'Revenue Dashboard',
              'Properties': 'Properties',
              'Buildings': 'Buildings',
              'Units': 'Units',
              'Unit Readiness': 'Unit Readiness', // Now using its own independent permission
              'Tenants': 'Tenants',
              'Tenant List': 'Tenant List',
              'Vehicle Management': 'Vehicles',
              'Owners': 'Owners',
              'Leases': 'Leases',
              'Rent Roll': 'Rent Roll',
              'Documents': 'Documents',
              'Payments': 'Payments',
              'Rent Invoices': 'Invoices',
              'Payments Received': 'Payments Received',
              'Outstanding Dues': 'Outstanding Dues',
              'Refunds & Adjustments': 'Refunds',
              'Accounting': 'Accounting',
              'General Ledger': 'General Ledger',
              'QuickBooks Sync': 'QuickBooks Sync',
              'Chart of Accounts': 'Chart of Accounts',
              'Tax Settings': 'Tax Settings',
              'TAL Cases': 'TAL Cases',
              'Notes Hub': 'Notes Hub',
              'Reports': 'Reports',
              'SMS Hub': 'Communication',
              'Inbox': 'Inbox',
              'Campaign Manager': 'Campaign Manager',
              'Templates': 'Templates',
              'Email Hub': 'Email Hub',
              'Send Email': 'Send Email',
              'Email Templates': 'Email Templates',
              'Sent Emails': 'Sent Emails',
              'Maintenance': 'Maintenance',
              'Tickets': 'Tickets',
              'Inspections': 'Inspections',
              'Inspection List': 'Inspection List',
              'Inspection Templates': 'Inspection Templates',
              'Team Access Control': 'Settings',
              'Settings': 'Settings'
            };

            const canUserView = (navItem) => {
              if (user.role === 'ADMIN') return true;
              if (navItem.label === 'Profile') return true;

              // Hide admin-only accounting and configuration panels from coworkers entirely
              const adminOnlyLabels = ['QuickBooks Sync', 'Chart of Accounts', 'Tax Settings', 'Team Access Control', 'Settings'];
              if (adminOnlyLabels.includes(navItem.label)) return false;

              const moduleName = labelToModule[navItem.label];

              // If it has children, the parent is visible if at least one child is visible
              if (navItem.children?.length > 0) {
                return navItem.children.some(child => canUserView(child));
              }

              // If no mapping exists for a leaf node, show it by default
              if (!moduleName) return true;

              const perm = Array.isArray(permissions) ? permissions.find(p => p.moduleName === moduleName) : null;
              return perm ? perm.canView : false;
            };

            const getVisibleItems = (items) => {
              return items.reduce((acc, item) => {
                if (!canUserView(item)) return acc;
                
                const newItem = { ...item };
                if (newItem.children?.length > 0) {
                  newItem.children = getVisibleItems(newItem.children);
                }
                acc.push(newItem);
                return acc;
              }, []);
            };

            return getVisibleItems(NAV_ITEMS).map(item => (
              <NavItem key={item.label} item={item} onClose={onClose} />
            ));
          })()}
        </nav>

        <div className="p-4 border-t border-zinc-800/50 shrink-0">
          <Link to="/profile" className="block no-underline">
            <div className="bg-zinc-900/40 rounded-[var(--radius-md)] p-2.5 border border-zinc-800/50 group cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/80 transition-all duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] overflow-hidden bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-zinc-700/50">
                  {JSON.parse(localStorage.getItem('user') || '{}').profilePictureUrl ? (
                    <img src={JSON.parse(localStorage.getItem('user') || '{}').profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    JSON.parse(localStorage.getItem('user') || '{}').firstName?.[0] || 'A'
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-semibold text-zinc-100 truncate leading-tight group-hover:text-white transition-colors">{JSON.parse(localStorage.getItem('user') || '{}').firstName ? `${JSON.parse(localStorage.getItem('user') || '{}').firstName} ${JSON.parse(localStorage.getItem('user') || '{}').lastName || ''}` : 'Admin User'}</p>
                  <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">{JSON.parse(localStorage.getItem('user') || '{}').title || (JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN' ? 'Super Admin' : 'Staff')}</p>
                </div>
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-[var(--radius-md)] border border-transparent hover:bg-red-500/10 hover:text-red-400 text-zinc-500 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const UnreadSMSBadge = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await api.get('/api/communication/unread-stats');
                setCount(res.data.count || 0);
            } catch (e) { }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    if (count === 0) return null;

    return (
        <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full inline-flex items-center justify-center min-w-[1.25rem] h-5 shadow-sm ml-auto mr-2">
            {count > 99 ? '99+' : count}
        </span>
    );
};

