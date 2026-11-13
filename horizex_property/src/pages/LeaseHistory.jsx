import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, X, FileText, Calendar, User, Home, Bed, AlertTriangle, CheckCircle, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { hasPermission } from '../utils/permissions';
import {
  useGetLeasesQuery,
  useGetPropertiesQuery,
  useUpdateLeaseMutation,
  useDeleteLeaseMutation,
  useSendLeaseCredentialsMutation,
  useRenewLeaseMutation,
} from '../store';

export const LeaseHistory = () => {
    const navigate = useNavigate();
    const [__forceUpdate, __setForceUpdate] = useState(0);
    useEffect(() => {
        const handleUpdate = () => __setForceUpdate(p => p + 1);
        window.addEventListener('permissionsUpdated', handleUpdate);
        return () => window.removeEventListener('permissionsUpdated', handleUpdate);
    }, []);

    // RTK Query Hooks
    const { data: rawLeases = [], isLoading } = useGetLeasesQuery();
    const { data: buildings = [] } = useGetPropertiesQuery();
    const [updateLease] = useUpdateLeaseMutation();
    const [deleteLease] = useDeleteLeaseMutation();
    const [sendLeaseCredentials] = useSendLeaseCredentialsMutation();
    const [renewLeaseMutation] = useRenewLeaseMutation();
    const [renewingLease, setRenewingLease] = useState(null);
    const [renewalForm, setRenewalForm] = useState({ proposedRent: '', proposedEndDate: '' });

    const [selectedLease, setSelectedLease] = useState(null);
    const [editLease, setEditLease] = useState(null);
    const [search, setSearch] = useState('');
    const [buildingFilter, setBuildingFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
        return localStorage.getItem('global_selected_company_id') || localStorage.getItem('companyContext') || '';
    });
    const [selectedBuildingId, setSelectedBuildingId] = useState(() => {
        return localStorage.getItem('global_selected_building_id') || '';
    });

    useEffect(() => {
        const handleSync = () => {
            setSelectedCompanyId(localStorage.getItem('global_selected_company_id') || localStorage.getItem('companyContext') || '');
            setSelectedBuildingId(localStorage.getItem('global_selected_building_id') || '');
        };
        window.addEventListener('companyChanged', handleSync);
        window.addEventListener('buildingChanged', handleSync);
        window.addEventListener('storage', handleSync);
        return () => {
            window.removeEventListener('companyChanged', handleSync);
            window.removeEventListener('buildingChanged', handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, []);

    const [page, setPage] = useState(1);
    const limit = 15;

    // Reset page to 1 on filter changes
    useEffect(() => {
        setPage(1);
    }, [search, buildingFilter, typeFilter, statusFilter, selectedCompanyId, selectedBuildingId]);

    // Client-side filtering over query cache
    const filteredLeases = useMemo(() => {
        let result = Array.isArray(rawLeases) ? rawLeases : [];

        // 1. Topbar Company Filter
        if (selectedCompanyId && selectedCompanyId !== 'all') {
            result = result.filter(l => {
                const b = buildings.find(bld => String(bld.id) === String(l.propertyId || l.unit?.propertyId || l.unit?.property?.id || l.buildingId));
                const cId = l.companyId || l.unit?.property?.companyId || b?.companyId;
                return String(cId) === String(selectedCompanyId);
            });
        }

        // 2. Topbar Building Filter
        if (selectedBuildingId && selectedBuildingId !== 'all') {
            result = result.filter(l => {
                const bId = l.propertyId || l.unit?.propertyId || l.unit?.property?.id || l.buildingId;
                return String(bId) === String(selectedBuildingId);
            });
        }

        if (statusFilter) {
            result = result.filter(l => (l.status || '').toLowerCase() === statusFilter.toLowerCase());
        }

        if (buildingFilter) {
            result = result.filter(l => {
                const bId = l.propertyId || l.unit?.propertyId || l.unit?.property?.id || l.buildingId;
                const bName = l.buildingName || l.building || l.unit?.property?.name;
                return String(bId) === String(buildingFilter) || bName === buildingFilter;
            });
        }

        if (typeFilter) {
            result = result.filter(l => {
                const lType = l.leaseType || (l.type === 'BEDROOM' || l.bedroom ? 'Bedroom Lease' : 'Full Unit Lease');
                return lType.toLowerCase() === typeFilter.toLowerCase();
            });
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(l => {
                const tenantName = (typeof l.tenant === 'object'
                    ? `${l.tenant?.firstName || ''} ${l.tenant?.lastName || ''}`
                    : String(l.tenant || '')).toLowerCase();
                const unitNum = (typeof l.unit === 'object' ? String(l.unit?.unitNumber || '') : String(l.unit || '')).toLowerCase();
                const bName = String(l.buildingName || l.building || l.unit?.property?.name || '').toLowerCase();
                const ownerName = String(l.ownerName || l.owner || '').toLowerCase();
                return tenantName.includes(q) || unitNum.includes(q) || bName.includes(q) || ownerName.includes(q);
            });
        }

        return result;
    }, [rawLeases, buildings, selectedCompanyId, selectedBuildingId, statusFilter, buildingFilter, typeFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filteredLeases.length / limit));
    const displayLeases = useMemo(() => {
        const startIndex = (page - 1) * limit;
        return filteredLeases.slice(startIndex, startIndex + limit);
    }, [filteredLeases, page, limit]);

    /* SEND CREDENTIALS */
    const handleSendCredentials = async (leaseId) => {
        try {
            await sendLeaseCredentials(leaseId).unwrap();
            alert('Credentials sent successfully!');
        } catch (error) {
            console.error(error);
            alert(error?.data?.message || 'Failed to send credentials');
        }
    };

    /* DELETE */
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this lease?')) return;
        try {
            await deleteLease(id).unwrap();
        } catch (error) {
            console.error(error);
            alert(error?.data?.message || 'Failed to delete lease');
        }
    };

    /* SAVE EDIT */
    const handleEditSave = async (e) => {
        if (!editLease.tenantFirstName?.trim() || !editLease.tenantLastName?.trim()) {
            alert('First Name and Last Name are required.');
            return;
        }

        e?.preventDefault();
        try {
            const payload = {
                id: editLease.id,
                monthlyRent: editLease.monthlyRent,
                startDate: editLease.startDate,
                endDate: editLease.endDate,
                firstName: editLease.tenantFirstName,
                lastName: editLease.tenantLastName
            };

            await updateLease(payload).unwrap();
            setEditLease(null);
        } catch (error) {
            console.error(error);
            alert(error?.data?.message || 'Failed to update lease');
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6">

                {/* FILTERS */}
                <div className="flex flex-col gap-3 bg-white p-3 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-slate-100">
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by tenant, unit, or building..."
                            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Dropdowns row */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1">
                            <Home size={16} className="text-slate-400 shrink-0" />
                            <select
                                className="bg-transparent border-none outline-none text-sm text-slate-700 w-full cursor-pointer"
                                value={buildingFilter}
                                onChange={(e) => setBuildingFilter(e.target.value)}
                            >
                                <option value="">All Buildings</option>
                                {buildings.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1">
                            <FileText size={16} className="text-slate-400 shrink-0" />
                            <select
                                className="bg-transparent border-none outline-none text-sm text-slate-700 w-full cursor-pointer"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">All Lease Types</option>
                                <option value="Full Unit Lease">Full Unit Lease</option>
                                <option value="Bedroom Lease">Bedroom Lease</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1">
                            <AlertTriangle size={16} className="text-slate-400 shrink-0" />
                            <select
                                className="bg-transparent border-none outline-none text-sm text-slate-700 w-full cursor-pointer font-medium"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        {hasPermission('Leases', 'add') && (
                            <>
                                <Button variant="secondary" onClick={() => navigate('/leases/new-bedroom')} className="flex-1 justify-center">
                                    <Bed size={16} />
                                    Bedroom Lease
                                </Button>
                                <Button variant="primary" onClick={() => navigate('/leases/new')} className="flex-1 justify-center">
                                    <FileText size={16} />
                                    Full Unit Lease
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lease Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Building</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bedroom</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Term</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Rent</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                                            Loading leases...
                                        </td>
                                    </tr>
                                ) : displayLeases.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                                            No leases found
                                        </td>
                                    </tr>
                                ) : (
                                    displayLeases.map((lease, index) => (
                                        <tr
                                            key={lease.id}
                                            className="hover:bg-slate-50/80 transition-all duration-200 anim-slide-upfade-in fill-mode-forwards"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${lease.leaseType === 'Bedroom Lease' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                                    {lease.leaseType || (lease.type === 'BEDROOM' || lease.bedroom ? 'Bedroom Lease' : 'Full Unit Lease')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-bold">{lease.ownerName || lease.owner || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{lease.buildingName || lease.building || lease.unit?.property?.name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-800">{typeof lease.unit === 'object' ? (lease.unit?.unitNumber || '-') : (lease.unit || '-')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lease.bedroom || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                                                {typeof lease.tenant === 'object' ? `${lease.tenant?.firstName || ''} ${lease.tenant?.lastName || ''}`.trim() : (lease.tenant || '-')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono text-[13px]">{lease.term || (lease.startDate && lease.endDate ? `${new Date(lease.startDate).toLocaleDateString()} - ${new Date(lease.endDate).toLocaleDateString()}` : '-')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">${(Number(lease.monthlyRent || lease.rentAmount) || 0).toLocaleString('en-CA')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${(lease.status || '').toLowerCase() === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${(lease.status || '').toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {lease.status ? (lease.status.charAt(0).toUpperCase() + lease.status.slice(1).toLowerCase()) : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                                            onClick={() => {
                                                                setRenewingLease(lease);
                                                                const nextYear = new Date();
                                                                nextYear.setFullYear(nextYear.getFullYear() + 1);
                                                                setRenewalForm({
                                                                    proposedRent: lease.monthlyRent || lease.rentAmount || '',
                                                                    proposedEndDate: nextYear.toISOString().split('T')[0]
                                                                });
                                                            }}
                                                            title="Renew Lease"
                                                        >
                                                            <RefreshCw size={15} />
                                                        </button>
                                                    <button
                                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${lease.isCredentialsSent
                                                            ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                                            : 'text-amber-600 bg-amber-50 hover:bg-amber-100 hover:scale-105 shadow-sm'
                                                            }`}
                                                        onClick={() => handleSendCredentials(lease.id)}
                                                        title={lease.isCredentialsSent ? "Credentials already sent - Click to Resend" : "⚠️ Credentials Not Sent - Click to Send"}
                                                    >
                                                        {lease.isCredentialsSent ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                                    </button>
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                                                        onClick={() => setSelectedLease(lease)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {hasPermission('Leases', 'edit') && (
                                                        <button
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                                                            onClick={() => setEditLease({ ...lease, tenantFirstName: lease.tenant?.firstName || '', tenantLastName: lease.tenant?.lastName || '' })}
                                                            title="Edit Lease"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    )}
                                                    {hasPermission('Leases', 'delete') && (
                                                        <button
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                                            onClick={() => handleDelete(lease.id)}
                                                            title="Delete Lease"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider order-2 sm:order-1">
                            Showing Page {page} of {totalPages} <span className="mx-1">•</span> {filteredLeases.length} Total Leases
                        </div>
                        <div className="flex items-center gap-1.5 order-1 sm:order-2">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1 || isLoading}
                                className="!px-2 !py-1"
                            >
                                <ChevronLeft size={14} />
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        disabled={isLoading}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                                            page === pageNum
                                            ? 'bg-zinc-900 text-white shadow-md shadow-zinc-200'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages || isLoading}
                                className="!px-2 !py-1"
                            >
                                <ChevronRight size={14} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* VIEW MODAL */}
                {selectedLease && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 anim-fade-in">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl anim-zoom-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Lease Details</h3>
                                <button
                                    onClick={() => setSelectedLease(null)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Lease Type</span>
                                    <span className="text-sm font-semibold text-slate-900">{selectedLease.leaseType || (selectedLease.type === 'BEDROOM' || selectedLease.bedroom ? 'Bedroom Lease' : 'Full Unit Lease')}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Building</span>
                                    <span className="text-sm font-semibold text-slate-900">{selectedLease.buildingName || selectedLease.building || selectedLease.unit?.property?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Unit</span>
                                    <span className="text-sm font-semibold text-slate-900">{typeof selectedLease.unit === 'object' ? (selectedLease.unit?.unitNumber || '-') : (selectedLease.unit || '-')}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Bedroom</span>
                                    <span className="text-sm font-semibold text-slate-900">{selectedLease.bedroom || '-'}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Tenant</span>
                                    <span className="text-sm font-medium text-slate-900">{typeof selectedLease.tenant === 'object' ? `${selectedLease.tenant?.firstName || ''} ${selectedLease.tenant?.lastName || ''}`.trim() : (selectedLease.tenant || '-')}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Term</span>
                                    <span className="text-sm font-medium text-slate-900">{selectedLease.term || (selectedLease.startDate && selectedLease.endDate ? `${new Date(selectedLease.startDate).toLocaleDateString()} - ${new Date(selectedLease.endDate).toLocaleDateString()}` : '-')}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Monthly Rent</span>
                                    <span className="text-sm font-semibold text-slate-900">${(Number(selectedLease.monthlyRent || selectedLease.rentAmount) || 0).toLocaleString('en-CA')}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${(selectedLease.status || '').toLowerCase() === 'active'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {selectedLease.status ? (selectedLease.status.charAt(0).toUpperCase() + selectedLease.status.slice(1).toLowerCase()) : 'Active'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button variant="secondary" onClick={() => setSelectedLease(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* RENEW LEASE MODAL */}
                {renewingLease && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 anim-fade-in">
                        <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl anim-zoom-in">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Initiate Lease Renewal</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        {typeof renewingLease.tenant === 'object' ? `${renewingLease.tenant?.firstName || ''} ${renewingLease.tenant?.lastName || ''}` : renewingLease.tenant} • Unit {typeof renewingLease.unit === 'object' ? renewingLease.unit?.unitNumber : renewingLease.unit}
                                    </p>
                                </div>
                                <button onClick={() => setRenewingLease(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    await renewLeaseMutation({
                                        id: renewingLease.id,
                                        proposedRent: parseFloat(renewalForm.proposedRent) || 0,
                                        proposedEndDate: renewalForm.proposedEndDate,
                                    }).unwrap();
                                    alert('Renewal offer created successfully! View it in the Lease Renewals tab.');
                                    setRenewingLease(null);
                                    navigate('/leases/renewals');
                                } catch (err) {
                                    console.error(err);
                                    alert(err?.data?.message || 'Failed to initiate renewal');
                                }
                            }} className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Proposed Monthly Rent ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={renewalForm.proposedRent}
                                        onChange={(e) => setRenewalForm(prev => ({ ...prev, proposedRent: e.target.value }))}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium"
                                        placeholder="e.g. 4500"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Proposed New End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={renewalForm.proposedEndDate}
                                        onChange={(e) => setRenewalForm(prev => ({ ...prev, proposedEndDate: e.target.value }))}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                    <Button type="button" variant="secondary" onClick={() => setRenewingLease(null)}>Cancel</Button>
                                    <Button type="submit" variant="primary">Create Renewal Offer</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* EDIT MODAL */}
                {editLease && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 anim-fade-in">
                        <form onSubmit={handleEditSave} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl anim-zoom-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Edit Lease</h3>
                                <button
                                    type="button"
                                    onClick={() => setEditLease(null)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">First Name</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                                                value={editLease.tenantFirstName || ''}
                                                onChange={(e) => setEditLease({ ...editLease, tenantFirstName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Last Name</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                                                value={editLease.tenantLastName || ''}
                                                onChange={(e) => setEditLease({ ...editLease, tenantLastName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Start Date</label>
                                        <div className="relative">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="date"
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                                                value={editLease.startDate ? new Date(editLease.startDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setEditLease({ ...editLease, startDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">End Date</label>
                                        <div className="relative">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="date"
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                                                value={editLease.endDate ? new Date(editLease.endDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setEditLease({ ...editLease, endDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Monthly Rent</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-semibold"
                                            value={editLease.monthlyRent || ''}
                                            onChange={(e) => setEditLease({ ...editLease, monthlyRent: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setEditLease(null)}>Cancel</Button>
                                <Button type="submit" variant="primary">Save Changes</Button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </>
    );
};
