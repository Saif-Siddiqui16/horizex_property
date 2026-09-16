import { NOTE_ENTITY_TYPES } from '../mock/notes';

const getStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');

const matchId = (value, id) => String(value) === String(id);

const ROUTES = {
  TENANT: (id) => `/tenants/${id}`,
  LEASE: () => '/leases',
  RENEWAL: (id) => `/leases/renewals/${id}`,
  INVOICE: () => '/payments/collection',
  PAYMENT: () => '/payments/received',
  TAL_CASE: (id) => `/tal-cases/${id}`,
  BUILDING: (id) => `/properties/${id}`,
  APARTMENT: (id) => `/units/${id}`,
  COMPANY: () => '/owners',
};

const findInStore = (storeKey, id, labelFn, subtitleFn) => {
  const item = getStore(storeKey).find((row) => matchId(row.id, id));
  if (!item) return null;
  return {
    exists: true,
    label: labelFn(item),
    subtitle: subtitleFn ? subtitleFn(item) : '',
    raw: item,
  };
};

export const entityResolverService = {
  resolve(entityType, entityId) {
    const meta = NOTE_ENTITY_TYPES[entityType] || {
      label: entityType,
      icon: 'FileText',
      color: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    const base = {
      entityType,
      entityId,
      typeLabel: meta.label,
      icon: meta.icon,
      color: meta.color,
      route: ROUTES[entityType]?.(entityId) || null,
      exists: false,
      label: `${meta.label} #${entityId}`,
      subtitle: '',
      companyId: null,
    };

    if (entityId === null || entityId === undefined || entityId === '') {
      return base;
    }

    let resolved = null;

    switch (entityType) {
      case 'TENANT':
        resolved = findInStore(
          'mock_tenants',
          entityId,
          (t) => `${t.firstName || ''} ${t.lastName || ''}`.trim() || `Tenant #${entityId}`,
          (t) => [t.unitNumber, t.propertyName].filter(Boolean).join(' · ')
        );
        break;
      case 'LEASE':
        resolved = findInStore(
          'mock_leases',
          entityId,
          (l) => l.tenantName || `Lease #${entityId}`,
          (l) => [l.unitNumber, l.propertyName].filter(Boolean).join(' · ')
        );
        break;
      case 'RENEWAL':
        resolved = findInStore(
          'mock_renewals',
          entityId,
          (r) => r.tenantName || `Renewal #${entityId}`,
          (r) => [r.unitNumber, r.buildingName || r.propertyName].filter(Boolean).join(' · ')
        );
        break;
      case 'INVOICE': {
        const inv = getStore('mock_invoices').find((row) => matchId(row.id, entityId));
        if (inv) {
          resolved = {
            exists: true,
            label: inv.invoiceNo || `Invoice #${entityId}`,
            subtitle: [inv.tenantName, inv.unitNumber].filter(Boolean).join(' · '),
            raw: inv,
          };
        }
        break;
      }
      case 'PAYMENT': {
        const pay = getStore('mock_payments').find((row) => matchId(row.id, entityId));
        if (pay) {
          resolved = {
            exists: true,
            label: `Payment #${entityId}`,
            subtitle: pay.tenantName || '',
            raw: pay,
          };
        }
        break;
      }
      case 'TAL_CASE': {
        const tal = getStore('mock_tal_cases').find((row) => matchId(row.id, entityId));
        if (tal) {
          resolved = {
            exists: true,
            label: tal.caseNumber || `Case #${entityId}`,
            subtitle: [tal.tenantName, tal.unitNumber].filter(Boolean).join(' · '),
            raw: tal,
            companyId: tal.companyId,
          };
        }
        break;
      }
      case 'BUILDING':
        resolved = findInStore(
          'mock_properties',
          entityId,
          (p) => p.name || `Building #${entityId}`,
          (p) => p.address || ''
        );
        break;
      case 'APARTMENT':
        resolved = findInStore(
          'mock_apartments',
          entityId,
          (u) => u.unitNumber || `Unit #${entityId}`,
          (u) => u.propertyName || u.buildingName || ''
        );
        break;
      case 'COMPANY': {
        const co = getStore('mock_companies').find((row) => matchId(row.id, entityId));
        if (co) {
          resolved = {
            exists: true,
            label: co.name || `Company #${entityId}`,
            subtitle: co.code || '',
            raw: co,
            companyId: co.id,
          };
        }
        break;
      }
      default:
        break;
    }

    if (!resolved) return base;

    return {
      ...base,
      ...resolved,
      route: ROUTES[entityType]?.(entityId) || null,
      companyId: resolved.companyId ?? resolved.raw?.companyId ?? resolved.raw?.propertyId ?? null,
    };
  },

  getRoute(entityType, entityId) {
    return ROUTES[entityType]?.(entityId) || null;
  },

  getEntityTypes() {
    return Object.entries(NOTE_ENTITY_TYPES).map(([key, val]) => ({
      value: key,
      ...val,
    }));
  },

  search(entityType, query = '', limit = 20) {
    const q = query.toLowerCase().trim();
    const results = [];

    const add = (id, label, subtitle, companyId = null) => {
      if (results.length >= limit) return;
      const haystack = `${label} ${subtitle}`.toLowerCase();
      if (!q || haystack.includes(q)) {
        results.push({ entityType, entityId: id, label, subtitle, companyId });
      }
    };

    switch (entityType) {
      case 'TENANT':
        getStore('mock_tenants').forEach((t) =>
          add(t.id, `${t.firstName} ${t.lastName}`, `${t.unitNumber || ''} ${t.propertyName || ''}`)
        );
        break;
      case 'LEASE':
        getStore('mock_leases').forEach((l) =>
          add(l.id, l.tenantName, `${l.unitNumber || ''} ${l.propertyName || ''}`)
        );
        break;
      case 'RENEWAL':
        getStore('mock_renewals').forEach((r) =>
          add(r.id, r.tenantName, `${r.unitNumber || ''} ${r.buildingName || r.propertyName || ''}`)
        );
        break;
      case 'INVOICE':
        getStore('mock_invoices').forEach((inv) =>
          add(inv.id, inv.invoiceNo, inv.tenantName)
        );
        break;
      case 'PAYMENT':
        getStore('mock_payments').forEach((p) =>
          add(p.id, `Payment #${p.id}`, p.tenantName || '')
        );
        break;
      case 'TAL_CASE':
        getStore('mock_tal_cases').forEach((c) =>
          add(c.id, c.caseNumber, c.tenantName, c.companyId)
        );
        break;
      case 'BUILDING':
        getStore('mock_properties').forEach((p) =>
          add(p.id, p.name, p.address, p.companyId)
        );
        break;
      case 'APARTMENT':
        getStore('mock_apartments').forEach((u) =>
          add(u.id, u.unitNumber, u.propertyName || u.buildingName)
        );
        break;
      case 'COMPANY':
        getStore('mock_companies').forEach((c) => add(c.id, c.name, c.code, c.id));
        break;
      default:
        break;
    }

    return results;
  },
};

export default entityResolverService;
