import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { BedDouble, Calendar, DollarSign, Home, User, Shield, ChevronDown, CheckCircle, Bed } from 'lucide-react';
import {
  useGetPropertiesQuery,
  useGetTenantsQuery,
  useGetUnitsQuery,
  useGetVacantBedroomsQuery,
  useGetLeasesQuery,
  useCreateLeaseMutation,
} from '../store';

export const LeaseFormBedroom = () => {
    const navigate = useNavigate();

    // RTK Query Hooks
    const { data: buildings = [] } = useGetPropertiesQuery();
    const { data: rawTenants = [] } = useGetTenantsQuery();
    const { data: allUnits = [] } = useGetUnitsQuery({ showInactive: true });
    const { data: rawLeases = [] } = useGetLeasesQuery();
    const [createLease, { isLoading: isCreating }] = useCreateLeaseMutation();

    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [lockedFields, setLockedFields] = useState(false);
    const [form, setForm] = useState({
        unitId: '',
        bedroomId: '',
        tenantId: '',
        coTenantIds: [],
        startDate: '',
        endDate: '',
        monthlyRent: '',
        securityDeposit: '',
        sendCredentials: false
    });

    // Vacant bedrooms for selected unit from backend API
    const { data: rawBedrooms = [] } = useGetVacantBedroomsQuery(
        { unitId: form.unitId },
        { skip: !form.unitId }
    );

    // Analyze active leases to know which units have full-unit leases or all bedrooms filled
    const activeUnitLeaseInfo = useMemo(() => {
        const map = {};
        (Array.isArray(rawLeases) ? rawLeases : []).forEach(l => {
            const s = String(l.status || '').toUpperCase();
            if (s === 'ACTIVE' || s === 'EXPIRING_SOON' || s === 'PENDING' || s === 'DRAFT') {
                const uId = String(l.unitId || l.unit?.id || '');
                if (!uId) return;
                if (!map[uId]) {
                    map[uId] = { hasFullUnitLease: false, occupiedBedrooms: new Set(), bedroomLeaseCount: 0 };
                }

                const lType = String(l.leaseType || l.type || '').toUpperCase();
                const bedStr = String(l.bedroom || '').trim();
                const isBedLease =
                    Boolean(l.bedroomId) ||
                    lType === 'BEDROOM LEASE' ||
                    lType === 'BEDROOM' ||
                    (bedStr && bedStr !== '-' && !bedStr.toLowerCase().includes('bed') && !bedStr.toLowerCase().includes('room'));

                if (Boolean(l.bedroomId) || isBedLease || (bedStr && bedStr.toLowerCase().startsWith('bedroom'))) {
                    map[uId].bedroomLeaseCount += 1;
                    if (l.bedroomId) {
                        map[uId].occupiedBedrooms.add(String(l.bedroomId).trim());
                    }
                    if (bedStr) {
                        map[uId].occupiedBedrooms.add(bedStr);
                        const match = bedStr.match(/(\d+)/);
                        if (match) {
                            map[uId].occupiedBedrooms.add(match[1]);
                        }
                    }
                } else if (lType === 'FULL UNIT LEASE' || lType === 'FULL_UNIT' || !l.bedroomId) {
                    map[uId].hasFullUnitLease = true;
                }
            }
        });
        return map;
    }, [rawLeases]);

    // Derived vacant bedrooms: exclude any bedroom with an active lease
    const bedrooms = useMemo(() => {
        if (!form.unitId) return [];
        const leaseInfo = activeUnitLeaseInfo[String(form.unitId)];
        const occupiedBeds = leaseInfo ? leaseInfo.occupiedBedrooms : new Set();

        return (Array.isArray(rawBedrooms) ? rawBedrooms : []).filter(b => {
            const idStr = String(b.id ?? '').trim();
            const bedIdStr = String(b.bedroomId ?? '').trim();
            const bedNumStr = String(b.bedroomNumber ?? b.displayName ?? b.roomNumber ?? '').trim();

            if (idStr && occupiedBeds.has(idStr)) return false;
            if (bedIdStr && occupiedBeds.has(bedIdStr)) return false;
            if (bedNumStr && occupiedBeds.has(bedNumStr)) return false;

            for (const occ of occupiedBeds) {
                if (bedNumStr && (occ === bedNumStr || bedNumStr.endsWith(`-${occ}`))) return false;
            }

            return true;
        });
    }, [form.unitId, rawBedrooms, activeUnitLeaseInfo]);

    // Derived tenants
    const tenants = useMemo(() => {
        return (Array.isArray(rawTenants) ? rawTenants : []).map(t => {
            const fullName = `${t.firstName || ''} ${t.lastName || ''}`.trim();
            const displayName = t.name || fullName || t.companyName || 'Tenant';
            return {
                ...t,
                name: displayName
            };
        });
    }, [rawTenants]);

    // Filter available units for bedroom-wise leasing:
    // Exclude units with an active full unit lease, or where all bedrooms are already leased
    const units = useMemo(() => {
        if (!selectedBuilding) return [];
        return (Array.isArray(allUnits) ? allUnits : []).filter(u => {
            const match = String(u.propertyId || u.property?.id) === String(selectedBuilding);
            if (!match) return false;

            const uId = String(u.id);
            const leaseInfo = activeUnitLeaseInfo[uId];

            // 1. If unit already has an active full unit lease, no bedrooms can be leased
            if (leaseInfo?.hasFullUnitLease) return false;

            // 2. If unit's activeLease is explicitly a full unit lease with no bedrooms
            if (u.activeLease && !u.activeLease.bedroomId && String(u.activeLease.leaseType || '').toUpperCase() === 'FULL UNIT LEASE') {
                if (!leaseInfo || leaseInfo.bedroomLeaseCount === 0) {
                    return false;
                }
            }

            // 3. Status check: fully booked
            const uStatus = String(u.status || '').toUpperCase();
            if (uStatus === 'FULLY BOOKED') return false;

            // 4. Exclude if unit is in construction phase / inactive / not ready
            const isConstruction =
                u.classification === 'New Construction' ||
                String(u.classification || '').toLowerCase().includes('construction') ||
                u.unit_status === 'INACTIVE' ||
                u.isActive === false ||
                uStatus === 'IN_CONSTRUCTION' ||
                uStatus === 'UNDER_MAINTENANCE' ||
                uStatus === 'TURNOVER';
            if (isConstruction) return false;

            // 5. Total bedrooms capacity check:
            const metaIdentifiers = (() => {
                try {
                    const notes = typeof u.readiness?.notes === 'string' ? JSON.parse(u.readiness.notes) : u.readiness?.notes;
                    if (Array.isArray(notes?.bedroomIdentifiers)) return notes.bedroomIdentifiers.length;
                } catch {}
                return 0;
            })();
            const totalBeds = Math.max(1, Number(u.bedrooms) || 0, metaIdentifiers, Array.isArray(u.bedroomDetails) ? u.bedroomDetails.length : 0);

            // Exclude only if all bedrooms in this unit are already leased
            if (leaseInfo) {
                const leasedCount = Math.max(leaseInfo.bedroomLeaseCount, leaseInfo.occupiedBedrooms.size);
                if (leasedCount >= totalBeds) {
                    return false;
                }
            }

            return true;
        });
    }, [allUnits, selectedBuilding, activeUnitLeaseInfo]);

    const handleBuildingChange = (e) => {
        const buildingId = e.target.value;
        setSelectedBuilding(buildingId);
        setForm(prev => ({
            ...prev,
            unitId: '',
            bedroomId: '',
            tenantId: '',
            coTenantIds: [],
            startDate: '',
            endDate: '',
            monthlyRent: '',
            securityDeposit: ''
        }));
        setLockedFields(false);
    };

    const handleUnitChange = (e) => {
        const unitId = e.target.value;
        const selectedUnit = units.find(u => u.id.toString() === unitId);

        let newForm = { ...form, unitId, bedroomId: '', tenantId: '', coTenantIds: [] };
        let isLocked = false;

        const currentTenant = tenants.find(t => t.id.toString() === form.tenantId);
        const isResident = currentTenant?.type === 'RESIDENT' || currentTenant?.type === 'Resident';

        if (selectedUnit && selectedUnit.hasCompanyLease && selectedUnit.companyLeaseDetails &&
            selectedUnit.companyLeaseDetails.leaseType === 'FULL_UNIT' && isResident) {
            newForm.startDate = selectedUnit.companyLeaseDetails.startDate ? selectedUnit.companyLeaseDetails.startDate.substring(0, 10) : '';
            newForm.endDate = selectedUnit.companyLeaseDetails.endDate ? selectedUnit.companyLeaseDetails.endDate.substring(0, 10) : '';
            newForm.monthlyRent = selectedUnit.companyLeaseDetails.monthlyRent || '';
            newForm.securityDeposit = selectedUnit.companyLeaseDetails.securityDeposit || '';
            isLocked = true;
        } else {
            newForm.startDate = '';
            newForm.endDate = '';
            newForm.monthlyRent = '';
            newForm.securityDeposit = '';
        }

        setForm(newForm);
        setLockedFields(isLocked);
    };

    const handleBedroomChange = (e) => {
        const bedId = e.target.value;
        if (!bedId) {
            setForm(prev => ({
                ...prev,
                bedroomId: '',
                tenantId: '',
                coTenantIds: []
            }));
            return;
        }

        const selectedBed = bedrooms.find(b => String(b.id) === String(bedId));
        const selectedBedNum = String(selectedBed?.bedroomNumber || selectedBed?.roomNumber || selectedBed?.displayName || '').trim();
        const selectedUnit = units.find(u => String(u.id) === String(form.unitId));

        // Find assigned resident for this unit & bedroom
        const assignedResident = tenants.find(t => {
            const isResidentType = String(t.type || '').toUpperCase() === 'RESIDENT';
            if (!isResidentType) return false;

            const matchesUnit =
                (t.unitId && String(t.unitId) === String(form.unitId)) ||
                (selectedUnit && (
                    (t.unitNumber && String(t.unitNumber).trim().toLowerCase() === String(selectedUnit.unitNumber || selectedUnit.name).trim().toLowerCase()) ||
                    (t.unit && String(t.unit).trim().toLowerCase() === String(selectedUnit.unitNumber || selectedUnit.name).trim().toLowerCase())
                ));

            if (!matchesUnit) return false;

            const resBed = String(t.bedroomId || '').trim();
            if (!resBed) return false;

            const bedIdStr = String(bedId).trim();
            const matchesBed =
                resBed.toLowerCase() === bedIdStr.toLowerCase() ||
                (selectedBedNum && resBed.toLowerCase() === selectedBedNum.toLowerCase()) ||
                (selectedBedNum && (resBed.endsWith(`-${bedIdStr}`) || selectedBedNum.endsWith(`-${resBed}`)));

            return Boolean(matchesBed);
        });

        let targetTenantId = '';
        let newCoTenantIds = [];

        if (assignedResident) {
            if (assignedResident.parentId) {
                targetTenantId = String(assignedResident.parentId);
                newCoTenantIds = [String(assignedResident.id)];
            } else {
                targetTenantId = String(assignedResident.id);
            }
        }

        setForm(prev => ({
            ...prev,
            bedroomId: bedId,
            tenantId: targetTenantId,
            coTenantIds: newCoTenantIds
        }));
    };

    // Handle field locking when tenant changes
    useEffect(() => {
        if (!form.unitId) return;
        const selectedUnit = units.find(u => u.id.toString() === form.unitId);
        const currentTenant = tenants.find(t => t.id.toString() === form.tenantId);
        const isResident = currentTenant?.type === 'RESIDENT' || currentTenant?.type === 'Resident';

        if (selectedUnit && selectedUnit.hasCompanyLease && selectedUnit.companyLeaseDetails &&
            selectedUnit.companyLeaseDetails.leaseType === 'FULL_UNIT' && isResident) {
            setForm(prev => ({
                ...prev,
                startDate: selectedUnit.companyLeaseDetails.startDate ? selectedUnit.companyLeaseDetails.startDate.substring(0, 10) : '',
                endDate: selectedUnit.companyLeaseDetails.endDate ? selectedUnit.companyLeaseDetails.endDate.substring(0, 10) : '',
                monthlyRent: selectedUnit.companyLeaseDetails.monthlyRent || '',
                securityDeposit: selectedUnit.companyLeaseDetails.securityDeposit || ''
            }));
            setLockedFields(true);
        } else {
            setLockedFields(false);
        }
    }, [form.tenantId, form.unitId, units, tenants]);

    const handleSave = async () => {
        if (!form.unitId || !form.bedroomId || !form.tenantId || !form.startDate || !form.endDate) {
            alert('Please fill all required fields (Unit, Bedroom, Tenant, Dates)');
            return;
        }

        try {
            const payload = {
                ...form,
                unitId: form.unitId,
                bedroomId: form.bedroomId || undefined,
                tenantId: form.tenantId,
                coTenantIds: form.coTenantIds || [],
                monthlyRent: parseFloat(form.monthlyRent) || 0,
                rentAmount: parseFloat(form.monthlyRent) || 0,
                securityDeposit: parseFloat(form.securityDeposit) || 0,
                depositAmount: parseFloat(form.securityDeposit) || 0,
                startDate: form.startDate,
                endDate: form.endDate,
                isFullUnitLease: false,
                sendCredentials: form.sendCredentials
            };
            const res = await createLease(payload).unwrap();

            let msg = 'Bedroom Lease created successfully.';
            const resData = res?.data || res;
            if (resData?.notifications) {
                const { status, sms, email, message } = resData.notifications;
                if (status === 'Sent') {
                    msg += `\n\nCredentials sent via: ${sms ? 'SMS ' : ''}${email ? 'Email' : ''}`;
                } else if (status === 'Skipped') {
                    msg += `\n\nOnboarding: ${message}`;
                } else if (status === 'Failed') {
                    msg += '\n\nFailed to send credentials (check SMS/Email settings)';
                }
            }

            alert(msg);
            navigate('/leases');
        } catch (error) {
            console.error('Failed to create lease', error);
            const errMsg = error?.data?.error?.message 
                || (error?.data?.error?.details && error.data.error.details.map(d => `${d.field ? d.field + ': ' : ''}${d.issue}`).join(', '))
                || error?.data?.message 
                || error.response?.data?.message 
                || error?.message 
                || 'Error creating lease';
            alert(errMsg);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <>
            <div className="max-w-3xl mx-auto py-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl anim-slide-up fade-in border border-slate-100">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <BedDouble size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 m-0">New Bedroom Lease</h2>
                            <p className="text-slate-500 text-sm mt-1">Create a lease for an individual bedroom</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Building Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">BUILDING NAME</label>
                            <div className="relative">
                                <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={selectedBuilding}
                                    onChange={handleBuildingChange}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none"
                                >
                                    <option value="">Choose a Building</option>
                                    {buildings.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Unit Selection */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Unit</label>
                            <div className="relative">
                                <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    name="unitId"
                                    value={form.unitId}
                                    onChange={handleUnitChange}
                                    disabled={!selectedBuilding}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
                                >
                                    <option value="">{selectedBuilding && units.length === 0 ? 'No units with vacant bedrooms available' : 'Select Unit'}</option>
                                    {units.map(u => {
                                        const leaseInfo = activeUnitLeaseInfo[String(u.id)];
                                        const metaIdentifiers = (() => {
                                            try {
                                                const notes = typeof u.readiness?.notes === 'string' ? JSON.parse(u.readiness.notes) : u.readiness?.notes;
                                                if (Array.isArray(notes?.bedroomIdentifiers)) return notes.bedroomIdentifiers.length;
                                            } catch {}
                                            return 0;
                                        })();
                                        const totalBeds = Math.max(1, Number(u.bedrooms) || 0, metaIdentifiers, Array.isArray(u.bedroomDetails) ? u.bedroomDetails.length : 0);
                                        const leasedCount = leaseInfo ? Math.max(leaseInfo.bedroomLeaseCount, leaseInfo.occupiedBedrooms.size) : 0;
                                        const vacantCount = Math.max(0, totalBeds - leasedCount);

                                        let displayStatus = u.status || 'VACANT';
                                        if (leasedCount > 0 && vacantCount > 0) {
                                            displayStatus = `${vacantCount} BEDROOM${vacantCount > 1 ? 'S' : ''} VACANT`;
                                        }

                                        return (
                                            <option key={u.id} value={u.id}>
                                                {u.unitNumber || u.unit_identifier || u.name} ({displayStatus})
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Bedroom Selection */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Bedroom</label>
                            <div className="relative">
                                <Bed size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    name="bedroomId"
                                    value={form.bedroomId}
                                    onChange={handleBedroomChange}
                                    disabled={!form.unitId}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
                                >
                                    <option value="">{form.unitId && bedrooms.length === 0 ? 'No vacant bedrooms available in this unit' : 'Select Bedroom'}</option>
                                    {Array.isArray(bedrooms) && bedrooms.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.bedroomNumber || b.displayName}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Tenant Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Select Tenant</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    name="tenantId"
                                    value={form.tenantId}
                                    onChange={handleChange}
                                    disabled={!form.bedroomId}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
                                >
                                    <option value="">Select Tenant</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Co-Tenants Selection (Multi-select) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Co-Applicants / Occupants (Optional)</label>
                            <div className="relative">
                                <div className="flex flex-wrap gap-2 mb-2 p-1 min-h-[30px]">
                                    {form.coTenantIds.map(id => {
                                        const t = tenants.find(tenant => tenant.id.toString() === id.toString());
                                        return t ? (
                                            <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-medium text-indigo-700">
                                                {t.name} {t.type === 'RESIDENT' && t.parentName ? `(Res. of ${t.parentName})` : ''}
                                                <button
                                                    type="button"
                                                    onClick={() => setForm(prev => ({
                                                        ...prev,
                                                        coTenantIds: prev.coTenantIds.filter(cid => cid !== id)
                                                    }))}
                                                    className="hover:text-indigo-900"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                                <User size={18} className="absolute left-4 top-[50%] -translate-y-1/2 text-slate-400 mt-2" />
                                <select
                                    value=""
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !form.coTenantIds.includes(val)) {
                                            setForm(prev => ({
                                                ...prev,
                                                coTenantIds: [...prev.coTenantIds, val]
                                            }));
                                        }
                                    }}
                                    disabled={!form.unitId || !form.tenantId}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
                                >
                                    <option value="">Add Co-Tenant...</option>
                                    {tenants
                                        .filter(t => t.id.toString() !== form.tenantId && !form.coTenantIds.includes(t.id.toString()))
                                        .map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                </select>
                                <div className="absolute right-4 top-[50%] -translate-y-1/2 pointer-events-none text-slate-400 mt-2">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Select additional tenants for this bedroom lease.</p>
                        </div>

                        {/* Financials */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Monthly Rent ($)</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="monthlyRent"
                                    placeholder="0.00"
                                    type="number"
                                    value={form.monthlyRent}
                                    onChange={handleChange}
                                    disabled={lockedFields}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 ${lockedFields ? 'bg-slate-100 text-slate-500' : 'bg-slate-50/50'}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Security Deposit ($)</label>
                            <div className="relative">
                                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="securityDeposit"
                                    placeholder="0.00"
                                    type="number"
                                    value={form.securityDeposit}
                                    onChange={handleChange}
                                    disabled={lockedFields}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 ${lockedFields ? 'bg-slate-100 text-slate-500' : 'bg-slate-50/50'}`}
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Start Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    disabled={lockedFields}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder-slate-400 ${lockedFields ? 'bg-slate-100 text-slate-500' : 'bg-slate-50/50'}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">End Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                    disabled={lockedFields}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder-slate-400 ${lockedFields ? 'bg-slate-100 text-slate-500' : 'bg-slate-50/50'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Send Credentials Toggle (Commented out)
                    <div className="flex items-center mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <input
                            type="checkbox"
                            id="sendCredentials"
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            checked={form.sendCredentials}
                            onChange={(e) => setForm({ ...form, sendCredentials: e.target.checked })}
                        />
                        <label htmlFor="sendCredentials" className="ml-3 block text-sm font-medium text-blue-900">
                            Send Welcome Credentials
                            <span className="block text-xs text-blue-600 font-normal mt-0.5">
                                Automatically send login details to the tenant via Email and SMS
                            </span>
                        </label>
                    </div>
                    */}

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => navigate('/leases')}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave} disabled={isCreating} className="min-w-[140px] shadow-lg shadow-zinc-200">
                            <CheckCircle size={18} />
                            {isCreating ? 'Saving...' : 'Save Lease'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
