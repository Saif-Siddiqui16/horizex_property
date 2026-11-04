import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../components/Button';
import { 
    Search, Eye, Filter, CheckCircle, Clock, AlertTriangle, X, Plus, User, 
    Building, ChevronDown, Trash2, Edit2, Play, Camera, Printer, 
    Calendar, Mail, Send, DollarSign, AtSign, Link2, ExternalLink, RefreshCw, RotateCcw
} from 'lucide-react';
import clsx from 'clsx';
import api from '../api/client';
import { hasPermission } from '../utils/permissions';
import { 
    useGetTicketsQuery, 
    useCreateTicketMutation, 
    useUpdateTicketStatusMutation,
    useUpdateTicketMutation,
    useDeleteTicketMutation
} from '../store/api/maintenanceApi';
import { useGetPropertiesQuery } from '../store/api/propertiesApi';
import { useGetTenantsQuery } from '../store/api/tenantsApi';

const getPriorityBadgeClass = (priority) => {
    const p = String(priority || '').toLowerCase();
    if (p === 'high' || p === 'emergency') return 'bg-rose-50 text-rose-700 border-rose-200/80';
    if (p === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200/80';
    return 'bg-blue-50 text-blue-700 border-blue-200/80';
};

const formatPriorityText = (priority) => {
    const p = String(priority || '').toLowerCase();
    if (p === 'high' || p === 'emergency') return 'High';
    if (p === 'medium') return 'Medium';
    return 'Low';
};

const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'resolved' || s === 'closed') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
                <CheckCircle size={13} className="text-emerald-600 flex-shrink-0" />
                Resolved
            </span>
        );
    }
    if (s === 'in progress' || s === 'pending_parts') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
                <Clock size={13} className="text-blue-600 flex-shrink-0" />
                In Progress
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
            Open
        </span>
    );
};

export const Tickets = () => {
    const [__forceUpdate, __setForceUpdate] = useState(0);
    useEffect(() => {
        const handleUpdate = () => __setForceUpdate(p => p + 1);
        window.addEventListener('permissionsUpdated', handleUpdate);
        return () => window.removeEventListener('permissionsUpdated', handleUpdate);
    }, []);

    // Redux Toolkit Selectors
    const reduxCompanyId = useSelector((state) => state.auth?.effectiveCompanyId);
    const currentUser = useSelector((state) => state.auth?.user);
    const currentRole = useSelector((state) => state.auth?.role);

    // Active Company & Building (Synchronized with Redux & Topbar)
    const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
        return reduxCompanyId || localStorage.getItem('global_selected_company_id') || 'all';
    });
    const [topbarBuildingId, setTopbarBuildingId] = useState(() => {
        return localStorage.getItem('global_selected_building_id') || 'all';
    });

    useEffect(() => {
        const handleCompany = () => {
            const comp = localStorage.getItem('global_selected_company_id') || 'all';
            setSelectedCompanyId(comp);
        };
        const handleBuilding = () => {
            const bld = localStorage.getItem('global_selected_building_id') || 'all';
            setTopbarBuildingId(bld);
        };

        window.addEventListener('companyChanged', handleCompany);
        window.addEventListener('buildingChanged', handleBuilding);
        return () => {
            window.removeEventListener('companyChanged', handleCompany);
            window.removeEventListener('buildingChanged', handleBuilding);
        };
    }, []);

    useEffect(() => {
        if (reduxCompanyId && reduxCompanyId !== selectedCompanyId) {
            setSelectedCompanyId(reduxCompanyId);
        }
    }, [reduxCompanyId]);

    const activeCompanyParam = selectedCompanyId && selectedCompanyId !== 'all' ? selectedCompanyId : undefined;
    const activeBuildingParam = topbarBuildingId && topbarBuildingId !== 'all' ? topbarBuildingId : undefined;

    // Filter states
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [isStatusExpanded, setIsStatusExpanded] = useState(true);
    const [isPriorityExpanded, setIsPriorityExpanded] = useState(true);
    const filterRef = useRef(null);

    const activeFilterCount = (statusFilter !== 'ALL' ? 1 : 0) + (priorityFilter !== 'ALL' ? 1 : 0);

    // Close filter dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        };
        if (showFilterDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilterDropdown]);

    // RTK Query: Tickets
    const {
        data: fetchedTickets = [],
        isLoading: isLoadingTickets,
        isFetching: isFetchingTickets,
        refetch: refetchTickets,
    } = useGetTicketsQuery({
        ...(activeCompanyParam ? { companyId: activeCompanyParam } : {}),
        ...(activeBuildingParam ? { propertyId: activeBuildingParam } : {}),
    });

    // RTK Query: Properties (Buildings)
    const { data: propertiesData = [], isLoading: isLoadingBuildings } = useGetPropertiesQuery(
        activeCompanyParam ? { companyId: activeCompanyParam } : undefined
    );

    // Normalized Buildings list
    const buildings = useMemo(() => {
        if (Array.isArray(propertiesData)) return propertiesData;
        if (Array.isArray(propertiesData?.data)) return propertiesData.data;
        return [];
    }, [propertiesData]);

    // Modal Form State for New/Edit Ticket
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [formApt, setFormApt] = useState('');
    const [formRent, setFormRent] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formRequestDate, setFormRequestDate] = useState(new Date().toISOString().split('T')[0]);
    const [formCompletionDate, setFormCompletionDate] = useState('');
    const [formSubject, setFormSubject] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPriority, setFormPriority] = useState('Low');
    const [formImagesCount, setFormImagesCount] = useState(0);
    const [formVideoName, setFormVideoName] = useState('');

    // RTK Query: Tenants
    const tenantQueryParams = useMemo(() => {
        const params = { limit: 1000 };
        if (selectedBuildingId && selectedBuildingId !== 'all') {
            params.propertyId = selectedBuildingId;
        } else if (activeBuildingParam) {
            params.propertyId = activeBuildingParam;
        }
        if (activeCompanyParam) {
            params.companyId = activeCompanyParam;
        }
        return params;
    }, [selectedBuildingId, activeBuildingParam, activeCompanyParam]);

    const { data: tenantsData = [], isLoading: loadingTenants } = useGetTenantsQuery(tenantQueryParams);

    // Normalized Tenants list
    const tenants = useMemo(() => {
        const raw = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.data || []);
        return raw.map(t => {
            const activeLease = t.leases?.[0] || {};
            const unitObj = activeLease.unit || t.unit || {};
            const fullName = t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Tenant';
            const unitNum = unitObj.unitNumber || t.unitNumber || t.unit || '';
            const unitId = unitObj.id || t.unitId || '';
            const rentVal = activeLease.rentAmount || t.rent || '';
            const propId = unitObj.property?.id || unitObj.propertyId || t.propertyId || '';

            return {
                ...t,
                id: t.id,
                name: fullName,
                unit: unitNum,
                unitNumber: unitNum,
                unitId,
                propertyId: propId,
                rent: rentVal,
                email: t.email || '',
                phone: t.phone || '',
            };
        });
    }, [tenantsData]);

    // Local Tickets state synced from RTK Query data
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        if (fetchedTickets) {
            setTickets(fetchedTickets);
        }
    }, [fetchedTickets]);

    // RTK Mutations
    const [createTicketMutation, { isLoading: isCreatingTicket }] = useCreateTicketMutation();
    const [updateTicketStatusMutation] = useUpdateTicketStatusMutation();
    const [updateTicketMutation, { isLoading: isUpdatingTicket }] = useUpdateTicketMutation();
    const [deleteTicketMutation] = useDeleteTicketMutation();

    const [search, setSearch] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [viewingTenantDetails, setViewingTenantDetails] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Quick completion date in Ticket Details Modal
    const [quickCompletionDate, setQuickCompletionDate] = useState('');

    // Tenant email notification modal
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyData, setNotifyData] = useState({
        ticket: null,
        email: '',
        tenantName: '',
        unit: '',
        subject: '',
        visitDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        repairmanName: 'Mike Johnson (Contractor)',
        message: ''
    });
    const [sendingNotice, setSendingNotice] = useState(false);

    // Print State
    const [selectedForPrint, setSelectedForPrint] = useState(new Set());

    // Populate form fields when editing or opening modal
    useEffect(() => {
        if (editingTicket) {
            setSelectedBuildingId(editingTicket.propertyId ? editingTicket.propertyId.toString() : '');
            setSelectedTenantId(editingTicket.tenantId ? editingTicket.tenantId.toString() : '');
            setFormApt(editingTicket.unit || editingTicket.unitNumber || '');
            setFormRent(editingTicket.rent || '');
            setFormEmail(editingTicket.email || '');
            setFormRequestDate(editingTicket.requestDate || (editingTicket.createdAt ? editingTicket.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]));
            setFormCompletionDate(editingTicket.completionDate || '');
            setFormSubject(editingTicket.subject || editingTicket.title || '');
            setFormDescription(editingTicket.desc || editingTicket.description || '');
            setFormPriority(editingTicket.priority || 'Low');
            setFormImagesCount(editingTicket.attachments?.filter(a => a.type === 'image')?.length || 0);
            setFormVideoName(editingTicket.attachments?.find(a => a.type === 'video')?.url ? 'Attached Video' : '');
        } else if (showAddModal) {
            setSelectedTenantId('');
            setFormApt('');
            setFormRent('');
            setFormEmail('');
            setFormRequestDate(new Date().toISOString().split('T')[0]);
            setFormCompletionDate('');
            setFormSubject('');
            setFormDescription('');
            setFormPriority('Low');
            setFormImagesCount(0);
            setFormVideoName('');
            if (activeBuildingParam) {
                setSelectedBuildingId(activeBuildingParam);
            }
        }
    }, [editingTicket, showAddModal, activeBuildingParam]);

    // Sync quick completion date when viewing a ticket
    useEffect(() => {
        if (selectedTicket) {
            setQuickCompletionDate(selectedTicket.completionDate || '');
        }
    }, [selectedTicket]);

    // Auto-populate Apt Number, Rent Amount, Email Address, and Request Date when tenant is selected
    const handleTenantChange = (tenantIdVal) => {
        setSelectedTenantId(tenantIdVal);
        const ten = tenants.find(t => String(t.id) === String(tenantIdVal));
        if (ten) {
            setFormApt(ten.unitNumber || ten.unit || '');
            setFormRent(ten.rent ? (ten.rent.toString().startsWith('$') ? ten.rent : `$${ten.rent}`) : '');
            setFormEmail(ten.email || '');
            setFormRequestDate(new Date().toISOString().split('T')[0]);
        } else {
            setFormApt('');
            setFormRent('');
            setFormEmail('');
        }
    };

    // Filter tickets by topbar selection and sort alphabetically by building
    const sortedTickets = useMemo(() => {
        let list = Array.isArray(tickets) ? [...tickets] : [];

        // Apply Topbar building filter if active
        if (activeBuildingParam) {
            list = list.filter(t => 
                String(t.propertyId) === String(activeBuildingParam) ||
                (t.building && buildings.some(b => String(b.id) === String(activeBuildingParam) && b.name.toLowerCase() === t.building.toLowerCase()))
            );
        }

        return list.sort((a, b) => {
            const buildingA = (a.building || a.propertyName || '').toLowerCase();
            const buildingB = (b.building || b.propertyName || '').toLowerCase();
            if (buildingA !== buildingB) {
                return buildingA.localeCompare(buildingB);
            }
            return (b.dbId || 0) - (a.dbId || 0);
        });
    }, [tickets, activeBuildingParam, buildings]);

    // Apply Status, Priority, and Search Filters
    const filteredTickets = useMemo(() => {
        let list = sortedTickets;

        // Apply Status Filter
        if (statusFilter !== 'ALL') {
            list = list.filter(t => {
                const s = String(t.status || '').toLowerCase();
                const target = statusFilter.toLowerCase();
                if (target === 'open') return s === 'open' || s === 'submitted';
                if (target === 'in progress') return s === 'in progress' || s === 'pending_parts';
                if (target === 'resolved') return s === 'resolved' || s === 'closed';
                return s === target;
            });
        }

        // Apply Priority Filter
        if (priorityFilter !== 'ALL') {
            list = list.filter(t => {
                const p = String(t.priority || '').toLowerCase();
                const target = priorityFilter.toLowerCase();
                if (target === 'high') return p === 'high' || p === 'emergency';
                return p === target;
            });
        }

        // Apply Search query
        const q = (search || '').toLowerCase().trim();
        if (!q) return list;
        return list.filter(t =>
            (t.tenant || '').toLowerCase().includes(q) ||
            (t.id || '').toLowerCase().includes(q) ||
            (t.displayId || '').toLowerCase().includes(q) ||
            (t.subject || '').toLowerCase().includes(q) ||
            (t.building || t.propertyName || '').toLowerCase().includes(q) ||
            (t.unit || '').toLowerCase().includes(q)
        );
    }, [sortedTickets, statusFilter, priorityFilter, search]);

    const updateStatus = async (id, newStatus) => {
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return;

        // Optimistically update local UI state
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);

        try {
            await updateTicketStatusMutation({
                id: ticket.dbId || ticket.id,
                status: newStatus,
                resolutionNote: newStatus === 'Resolved' ? 'Resolved by maintenance team' : undefined,
            }).unwrap();
            setSuccessMessage(`Ticket status updated to ${newStatus}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            console.warn('Status update via RTK mutation fallback to direct API', e);
            try {
                await api.put(`/api/admin/tickets/${ticket.dbId || ticket.id}/status`, { status: newStatus });
                setSuccessMessage(`Ticket status updated to ${newStatus}`);
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err) {
                console.error('Failed to update status:', err);
                // Revert on failure
                setTickets(prev => prev.map(t => t.id === id ? { ...t, status: ticket.status } : t));
                setSelectedTicket(prev => prev ? { ...prev, status: ticket.status } : null);
                alert('Failed to update status');
            }
        }
    };

    const updatePriority = async (id, newPriority) => {
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return;

        let normPriority = 'MEDIUM';
        if (newPriority === 'High') normPriority = 'HIGH';
        else if (newPriority === 'Low') normPriority = 'LOW';

        // Optimistically update local state
        setTickets(prev => prev.map(t => t.id === id ? { ...t, priority: newPriority } : t));
        setSelectedTicket(prev => prev ? { ...prev, priority: newPriority } : null);
        setSuccessMessage(`Importance level updated to ${newPriority}`);
        setTimeout(() => setSuccessMessage(''), 3000);

        try {
            await updateTicketMutation({ id: ticket.dbId || ticket.id, priority: normPriority }).unwrap();
        } catch (e) {
            console.warn('Priority updated via RTK mutation fallback to api.put:', e);
            try {
                await api.put(`/api/admin/tickets/${ticket.dbId || ticket.id}`, { priority: normPriority });
            } catch (err) {}
        }
        refetchTickets();
    };

    const handleCopyRepairLink = () => {
        const propParam = selectedBuildingId && selectedBuildingId !== 'all' 
            ? `?propertyId=${selectedBuildingId}` 
            : '';
        const url = `${window.location.origin}/repair-request${propParam}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
        }
        setSuccessMessage(`Tenant Repair Link copied: ${url}`);
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    const handleDeleteTicket = async (dbId) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;
        setTickets(prev => prev.filter(t => t.dbId !== dbId && t.id !== dbId));
        setSuccessMessage('Ticket Deleted Successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);

        try {
            await deleteTicketMutation(dbId).unwrap();
        } catch (e) {
            console.warn('Ticket removed locally. Backend delete status:', e);
            try {
                await api.delete(`/api/admin/tickets/${dbId}`);
            } catch (err) {}
        }
        refetchTickets();
    };

    const handleSaveTicket = async (e) => {
        e.preventDefault();
        const tenantObj = tenants.find(t => String(t.id) === String(selectedTenantId));
        const buildingObj = buildings.find(b => String(b.id) === String(selectedBuildingId));

        const buildingName = buildingObj ? buildingObj.name : (editingTicket?.building || 'General Building');
        const tenantName = tenantObj ? (tenantObj.name || `${tenantObj.firstName} ${tenantObj.lastName}`) : (editingTicket?.tenant || 'General Tenant');
        const unitVal = formApt || tenantObj?.unitNumber || tenantObj?.unit || editingTicket?.unit || 'N/A';
        const unitIdVal = tenantObj?.unitId || editingTicket?.unitId;

        try {
            if (editingTicket) {
                let normPriority = 'MEDIUM';
                if (formPriority === 'High') normPriority = 'HIGH';
                else if (formPriority === 'Low') normPriority = 'LOW';

                const targetPropId = selectedBuildingId && selectedBuildingId !== 'all'
                    ? selectedBuildingId
                    : (editingTicket.propertyId || editingTicket.property?.id || buildings[0]?.id || '');
                const targetUnitId = unitIdVal || editingTicket.unitId || editingTicket.unit?.id || (tenantObj?.unitId) || (buildingObj?.units?.[0]?.id || '');

                const updatePayload = {
                    id: editingTicket.dbId || editingTicket.id,
                    propertyId: targetPropId || undefined,
                    unitId: targetUnitId || undefined,
                    tenantId: selectedTenantId || undefined,
                    title: formSubject || 'Maintenance Request',
                    subject: formSubject || 'Maintenance Request',
                    description: formDescription || formSubject || 'Maintenance request submitted',
                    priority: normPriority,
                };

                const localPayload = {
                    propertyId: targetPropId,
                    building: buildingName,
                    propertyName: buildingName,
                    tenantId: selectedTenantId ? selectedTenantId : null,
                    tenant: tenantName,
                    tenantName: tenantName,
                    unitId: targetUnitId,
                    unit: unitVal,
                    unitNumber: unitVal,
                    rent: formRent,
                    email: formEmail,
                    requestDate: formRequestDate,
                    completionDate: formCompletionDate || null,
                    subject: formSubject,
                    title: formSubject,
                    description: formDescription,
                    priority: formPriority,
                };

                try {
                    await updateTicketMutation(updatePayload).unwrap();
                } catch (mutationErr) {
                    console.warn('RTK updateTicketMutation fallback to api.put:', mutationErr);
                    try {
                        await api.put(`/api/admin/tickets/${editingTicket.dbId || editingTicket.id}`, updatePayload);
                    } catch (fallbackErr) {
                        console.error('Update ticket fallback error:', fallbackErr);
                    }
                }

                setTickets(prev => prev.map(t => (t.id === editingTicket.id || t.dbId === editingTicket.dbId) ? { ...t, ...localPayload } : t));
                refetchTickets();
                setSuccessMessage('Ticket Updated Successfully!');
            } else {
                let normPriority = 'MEDIUM';
                if (formPriority === 'High') normPriority = 'HIGH';
                else if (formPriority === 'Low') normPriority = 'LOW';

                const targetPropId = selectedBuildingId && selectedBuildingId !== 'all' ? selectedBuildingId : (buildings[0]?.id || '');
                const targetUnitId = unitIdVal || (tenantObj?.unitId) || (buildingObj?.units?.[0]?.id || '');

                const jsonPayload = {
                    propertyId: targetPropId,
                    unitId: targetUnitId,
                    tenantId: selectedTenantId || undefined,
                    title: formSubject || 'Maintenance Request',
                    description: formDescription || formSubject || 'Maintenance request submitted',
                    priority: normPriority,
                    photoUrls: [],
                };

                try {
                    await createTicketMutation(jsonPayload).unwrap();
                } catch (mutationErr) {
                    console.warn('RTK createTicketMutation error, trying api fallback:', mutationErr);
                    await api.post('/api/admin/tickets', jsonPayload);
                }

                refetchTickets();
                setSuccessMessage('Ticket Created Successfully!');
            }

            setShowAddModal(false);
            setEditingTicket(null);
            setSelectedBuildingId('');
            setFormImagesCount(0);
            setFormVideoName('');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            console.error('Error saving ticket:', e);
            alert('Failed to save ticket: ' + (e?.data?.message || e.message || 'Unknown error'));
        }
    };

    // Quick assign/update date work will be completed
    const handleUpdateCompletionDate = async () => {
        if (!selectedTicket) return;
        try {
            await api.put(`/api/admin/tickets/${selectedTicket.dbId || selectedTicket.id}`, {
                completionDate: quickCompletionDate || null
            });
            const updated = { ...selectedTicket, completionDate: quickCompletionDate || null };
            setSelectedTicket(updated);
            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            setSuccessMessage('Work Completion Date Updated Successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            alert('Failed to update completion date');
        }
    };

    // Notify tenant by email with scheduled repairman visit date
    const handleSendRepairmanNotice = async (e) => {
        e.preventDefault();
        if (!notifyData.ticket) return;
        setSendingNotice(true);
        try {
            const emailBody = notifyData.message || `Hello ${notifyData.tenantName || 'Tenant'},\n\nA repairman (${notifyData.repairmanName || 'Technician'}) has been scheduled to visit your unit (${notifyData.unit || ''}) on ${notifyData.visitDate} regarding your maintenance ticket #${notifyData.ticket.displayId || notifyData.ticket.id} ("${notifyData.subject}").\n\nPlease ensure someone is available or unit access is granted.\n\nThank you,\nProperty Management Team`;

            await api.post('/api/admin/communication/send-email', {
                tenantId: notifyData.ticket.tenantId,
                email: notifyData.email,
                subject: `Repairman Visit Scheduled for Ticket #${notifyData.ticket.displayId || notifyData.ticket.id}`,
                body: emailBody
            });

            await api.put(`/api/admin/tickets/${notifyData.ticket.dbId || notifyData.ticket.id}`, {
                repairmanVisitDate: notifyData.visitDate
            });

            const updated = { ...notifyData.ticket, repairmanVisitDate: notifyData.visitDate };
            if (selectedTicket && selectedTicket.id === notifyData.ticket.id) {
                setSelectedTicket(updated);
            }
            setTickets(tickets.map(t => t.id === notifyData.ticket.id ? updated : t));

            setShowNotifyModal(false);
            setSuccessMessage(`Email notice sent to ${notifyData.email} for visit on ${notifyData.visitDate}!`);
            setTimeout(() => setSuccessMessage(''), 3500);
        } catch (e) {
            console.error('Error sending email notification:', e);
            alert('Failed to send email notification');
        } finally {
            setSendingNotice(false);
        }
    };

    const allFilteredSelected = filteredTickets.length > 0 && filteredTickets.every(t => selectedForPrint.has(t.id));
    
    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            setSelectedForPrint(new Set());
        } else {
            const newSet = new Set(selectedForPrint);
            filteredTickets.forEach(t => newSet.add(t.id));
            setSelectedForPrint(newSet);
        }
    };

    const toggleSelect = (id) => {
        const newSet = new Set(selectedForPrint);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedForPrint(newSet);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=900,height=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Tickets</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #1e293b; }
                        h1 { text-align: center; margin-bottom: 24px; color: #0f172a; grid-column: span 2; }
                        .print-container { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                        .page { page-break-inside: avoid; break-inside: avoid; }
                        .ticket-card { border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #fff; height: 100%; box-sizing: border-box; }
                        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px; }
                        .badge { padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase; border: 1px solid #e2e8f0; }
                        .priority-High { background: #fef2f2; color: #b91c1c; border-color: #fee2e2; }
                        .priority-Medium { background: #fffbeb; color: #b45309; border-color: #fef3c7; }
                        .priority-Low { background: #eff6ff; color: #1d4ed8; border-color: #dbeafe; }
                        .title { font-weight: 900; font-size: 16px; margin: 0; color: #4f46e5; }
                        .subject { font-weight: 800; font-size: 14px; margin-bottom: 8px; color: #0f172a; }
                        .detail { font-size: 12px; margin-bottom: 4px; color: #334155; }
                        .desc-box { background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 12px; margin-top: 8px; white-space: pre-wrap; border: 1px solid #f1f5f9; }
                        .date { font-size: 10px; color: #64748b; margin-top: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <h1>Maintenance Tickets (Sorted by Building)</h1>
                        ${tickets.filter(t => selectedForPrint.has(t.id)).map(ticket => `
                            <div class="page">
                                <div class="ticket-card">
                                    <div class="header">
                                        <h3 class="title">${ticket.displayId || ticket.id}</h3>
                                        <span class="badge priority-${formatPriorityText(ticket.priority)}">${formatPriorityText(ticket.priority)}</span>
                                    </div>
                                    <div class="subject">${ticket.subject}</div>
                                    <div class="detail"><strong>Building:</strong> ${ticket.building || ticket.propertyName}</div>
                                    <div class="detail"><strong>Tenant:</strong> ${ticket.tenant}</div>
                                    <div class="detail"><strong>Unit:</strong> ${ticket.unit}</div>
                                    <div class="detail"><strong>Rent:</strong> ${ticket.rent || 'N/A'}</div>
                                    <div class="detail"><strong>Email:</strong> ${ticket.email || 'N/A'}</div>
                                    <div class="detail"><strong>Status:</strong> ${ticket.status}</div>
                                    ${ticket.completionDate ? `<div class="detail"><strong>Completion Date:</strong> ${ticket.completionDate}</div>` : ''}
                                    ${ticket.repairmanVisitDate ? `<div class="detail"><strong>Repairman Visit:</strong> ${ticket.repairmanVisitDate}</div>` : ''}
                                    <div class="desc-box"><strong>Description:</strong><br/>${ticket.desc || 'No description'}</div>
                                    <div class="date"><strong>Requested:</strong> ${ticket.requestDate || ticket.createdAt}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <>
            <div className="flex flex-col gap-6 relative">

                {successMessage && (
                    <div className="fixed top-24 right-8 z-[100] anim-slide-up">
                        <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
                            <CheckCircle size={20} />
                            <span className="font-bold">{successMessage}</span>
                        </div>
                    </div>
                )}

                {/* Top Section: Search bar on left, Add Ticket anchored in the Top-Right Corner */}
                <section className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-4 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.06)] gap-4">
                    
                    {/* Search Bar (Separate from Filter Button) */}
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all w-full sm:w-80 md:w-96">
                        <Search size={18} className="text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by building, ID, tenant, or subject"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 w-full text-sm font-medium"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* Top-Right Corner Actions: Add Ticket is prominent in top-right */}
                    <div className="flex items-center gap-2.5 justify-end flex-wrap sm:flex-nowrap">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCopyRepairLink}
                            className="!border-indigo-200 !text-indigo-700 hover:!bg-indigo-50 font-bold flex items-center gap-1.5 shadow-sm h-10 px-3.5"
                            title="Copy link to send to tenants when they request repairs"
                        >
                            <Link2 size={16} className="text-indigo-600" />
                            <span className="hidden md:inline">Copy Tenant Repair Link</span>
                            <span className="md:hidden">Repair Link</span>
                        </Button>

                        <a
                            href={selectedBuildingId && selectedBuildingId !== 'all' ? `/repair-request?propertyId=${selectedBuildingId}` : '/repair-request'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                            title="Open Tenant Repair Request Form in new tab"
                        >
                            <ExternalLink size={16} />
                        </a>

                        {selectedForPrint.size > 0 && (
                            <Button variant="secondary" size="sm" onClick={handlePrint} className="!border-indigo-200 !text-indigo-600 hover:!bg-indigo-50 h-10">
                                <Printer size={16} />
                                Print ({selectedForPrint.size})
                            </Button>
                        )}

                        {/* Add Ticket button anchored at top-right corner */}
                        {hasPermission('Tickets', 'add') && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowAddModal(true)}
                                className="h-10 px-4 font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                            >
                                <Plus size={16} />
                                Add Ticket
                            </Button>
                        )}
                    </div>
                </section>

                {/* Sub-bar directly above the Ticket List: Filter button and active filter pills */}
                <div className="flex flex-wrap items-center gap-3 px-1">
                    <div className="relative" ref={filterRef}>
                        <button
                            type="button"
                            onClick={() => setShowFilterDropdown(prev => !prev)}
                            className={clsx(
                                "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold shadow-sm transition-all bg-white h-9",
                                (showFilterDropdown || activeFilterCount > 0)
                                    ? "border-indigo-300 text-indigo-700 bg-indigo-50/70 ring-2 ring-indigo-500/10"
                                    : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                            )}
                            title="Filter tickets by Status and Priority"
                        >
                            <Filter size={14} className={activeFilterCount > 0 ? "text-indigo-600" : "text-slate-500"} />
                            <span>Filters</span>
                            {activeFilterCount > 0 ? (
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            ) : (
                                <ChevronDown size={14} className={clsx("text-slate-400 transition-transform duration-200", showFilterDropdown && "rotate-180")} />
                            )}
                        </button>

                        {/* Floating Filter Popover */}
                        {showFilterDropdown && (
                            <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 anim-zoom-in">
                                {/* Header: Title on left, Refresh icon on top-right corner to reset/refresh filters */}
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Filter size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            Filter Tickets
                                        </span>
                                    </div>

                                    {/* Refresh/Reset icon in top-right corner of popup */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStatusFilter('ALL');
                                            setPriorityFilter('ALL');
                                            refetchTickets();
                                        }}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        title="Reset / Refresh filters"
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* Status Collapsible Dropdown */}
                                    <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50">
                                        <button
                                            type="button"
                                            onClick={() => setIsStatusExpanded(prev => !prev)}
                                            className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/70 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</span>
                                                <span className={clsx(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                                    statusFilter !== 'ALL'
                                                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                        : "bg-slate-200/60 text-slate-600 border-slate-300/50"
                                                )}>
                                                    {statusFilter === 'ALL' ? 'All' : statusFilter}
                                                </span>
                                            </div>
                                            <ChevronDown size={14} className={clsx("text-slate-400 transition-transform duration-200", isStatusExpanded && "rotate-180")} />
                                        </button>

                                        {isStatusExpanded && (
                                            <div className="grid grid-cols-2 gap-1.5 p-2 bg-white border-t border-slate-200/60 anim-fade-in">
                                                {[
                                                    { label: 'All', value: 'ALL' },
                                                    { label: 'Open', value: 'Open' },
                                                    { label: 'In Progress', value: 'In Progress' },
                                                    { label: 'Resolved', value: 'Resolved' },
                                                ].map((st) => (
                                                    <button
                                                        key={st.value}
                                                        type="button"
                                                        onClick={() => setStatusFilter(st.value)}
                                                        className={clsx(
                                                            "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border text-left flex items-center justify-between",
                                                            statusFilter === st.value
                                                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm font-bold"
                                                                : "bg-slate-50/60 text-slate-600 border-slate-200/60 hover:bg-slate-100"
                                                        )}
                                                    >
                                                        <span>{st.label}</span>
                                                        {statusFilter === st.value && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Priority Collapsible Dropdown */}
                                    <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50">
                                        <button
                                            type="button"
                                            onClick={() => setIsPriorityExpanded(prev => !prev)}
                                            className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/70 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Priority</span>
                                                <span className={clsx(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                                    priorityFilter !== 'ALL'
                                                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                        : "bg-slate-200/60 text-slate-600 border-slate-300/50"
                                                )}>
                                                    {priorityFilter === 'ALL' ? 'All' : priorityFilter}
                                                </span>
                                            </div>
                                            <ChevronDown size={14} className={clsx("text-slate-400 transition-transform duration-200", isPriorityExpanded && "rotate-180")} />
                                        </button>

                                        {isPriorityExpanded && (
                                            <div className="grid grid-cols-2 gap-1.5 p-2 bg-white border-t border-slate-200/60 anim-fade-in">
                                                {[
                                                    { label: 'All', value: 'ALL' },
                                                    { label: 'High', value: 'High' },
                                                    { label: 'Medium', value: 'Medium' },
                                                    { label: 'Low', value: 'Low' },
                                                ].map((pr) => (
                                                    <button
                                                        key={pr.value}
                                                        type="button"
                                                        onClick={() => setPriorityFilter(pr.value)}
                                                        className={clsx(
                                                            "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border text-left flex items-center justify-between",
                                                            priorityFilter === pr.value
                                                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm font-bold"
                                                                : "bg-slate-50/60 text-slate-600 border-slate-200/60 hover:bg-slate-100"
                                                        )}
                                                    >
                                                        <span>{pr.label}</span>
                                                        {priorityFilter === pr.value && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium text-[11px]">
                                        {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowFilterDropdown(false)}
                                        className="px-3 py-1 rounded-lg bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors text-xs"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Filter Removable Badges directly above table */}
                    {(statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            {statusFilter !== 'ALL' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs">
                                    Status: {statusFilter}
                                    <button onClick={() => setStatusFilter('ALL')} className="hover:text-indigo-900 ml-0.5">
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                            {priorityFilter !== 'ALL' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs">
                                    Priority: {priorityFilter}
                                    <button onClick={() => setPriorityFilter('ALL')} className="hover:text-indigo-900 ml-0.5">
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Ticket List Table */}
                <section className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden w-full border border-slate-100">
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-[1020px] w-full">
                            {/* Table Header: Stable and consistently aligned */}
                            <div className="grid grid-cols-[44px_110px_140px_minmax(180px,1.5fr)_150px_90px_110px_130px_140px] gap-3 bg-slate-50/90 border-b border-slate-200 px-6 py-3.5 items-center">
                                <div className="flex items-center justify-center">
                                    <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket ID</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Building size={14} className="text-indigo-500" />
                                    Building
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {isLoadingTickets ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm font-semibold text-slate-500">Loading tickets...</span>
                                    </div>
                                ) : filteredTickets.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400 font-medium text-sm flex flex-col items-center justify-center gap-2">
                                        <AlertTriangle size={28} className="text-slate-300" />
                                        <span className="font-semibold text-slate-600">No tickets found.</span>
                                        <span className="text-xs text-slate-400">
                                            {activeFilterCount > 0 || search
                                                ? 'No tickets match your active filters or search criteria.'
                                                : (activeBuildingParam ? 'No maintenance tickets match the selected building.' : 'Create a new ticket or adjust filters.')}
                                        </span>
                                        {(activeFilterCount > 0 || search) && (
                                            <button
                                                onClick={() => {
                                                    setStatusFilter('ALL');
                                                    setPriorityFilter('ALL');
                                                    setSearch('');
                                                }}
                                                className="mt-2 px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors"
                                            >
                                                Reset All Filters
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="grid grid-cols-[44px_110px_140px_minmax(180px,1.5fr)_150px_90px_110px_130px_140px] gap-3 px-6 py-3.5 items-center hover:bg-slate-50/80 transition-all duration-150 border-b border-slate-100 last:border-b-0"
                                        >
                                            <div className="flex items-center justify-center">
                                                <input type="checkbox" checked={selectedForPrint.has(ticket.id)} onChange={() => toggleSelect(ticket.id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer" />
                                            </div>
                                            
                                            {/* Ticket ID: Solid badge that will never wrap onto multiple lines */}
                                            <div className="overflow-hidden">
                                                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-100/90 whitespace-nowrap inline-block" title={ticket.id}>
                                                    {ticket.displayId || ticket.id}
                                                </span>
                                            </div>
                                            
                                            {/* Building Column */}
                                            <div className="overflow-hidden">
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-800 border border-slate-200/60 text-xs font-semibold truncate block w-fit max-w-full" title={ticket.building || ticket.propertyName}>
                                                    {ticket.building || ticket.propertyName || 'General Building'}
                                                </span>
                                            </div>

                                            {/* Subject Column */}
                                            <div className="flex flex-col pr-2 overflow-hidden min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-800 font-bold truncate" title={ticket.subject}>{ticket.subject}</span>
                                                    {ticket.isRequired && (
                                                        <span className="px-1.5 py-0.5 rounded bg-red-50 text-[8px] font-black text-red-600 uppercase border border-red-100 flex-shrink-0">Required</span>
                                                    )}
                                                    {ticket.attachments && ticket.attachments.length > 0 && (
                                                        <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex-shrink-0" title={`${ticket.attachments.length} attachments`}>
                                                            <Camera size={10} />
                                                            <span className="text-[10px] font-bold">{ticket.attachments.length}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {ticket.completionDate && (
                                                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 whitespace-nowrap">
                                                            <Calendar size={11} /> Comp: {ticket.completionDate}
                                                        </span>
                                                    )}
                                                    {ticket.repairmanVisitDate && (
                                                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 whitespace-nowrap">
                                                            <Clock size={11} /> Visit: {ticket.repairmanVisitDate}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tenant Column */}
                                            <div className="flex flex-col items-start min-w-0 overflow-hidden">
                                                <button
                                                    onClick={() => {
                                                        setViewingTenantDetails(ticket.tenantDetails || { name: ticket.tenant, unit: ticket.unit, rent: ticket.rent, email: ticket.email, property: ticket.building || ticket.propertyName });
                                                    }}
                                                    className="text-sm text-indigo-600 font-semibold hover:underline text-left truncate w-full"
                                                    title={ticket.tenant}
                                                >
                                                    {ticket.tenant}
                                                </button>
                                                {ticket.email && (
                                                    <span className="text-[11px] text-slate-400 font-medium truncate w-full" title={ticket.email}>
                                                        {ticket.email}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Unit Column */}
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-semibold text-slate-700 truncate">{ticket.unit}</span>
                                                {ticket.rent && (
                                                    <span className="text-[11px] text-emerald-600 font-bold truncate">
                                                        {ticket.rent.toString().startsWith('$') ? ticket.rent : `$${ticket.rent}`}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Priority Badge */}
                                            <div>
                                                <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase", getPriorityBadgeClass(ticket.priority))}>
                                                    {formatPriorityText(ticket.priority)}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <div>
                                                {getStatusBadge(ticket.status)}
                                            </div>

                                            {/* Actions Column */}
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setSelectedTicket(ticket)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                                    title="View Details & Completion Date"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setNotifyData({
                                                            ticket,
                                                            email: ticket.email || '',
                                                            tenantName: ticket.tenant || '',
                                                            unit: ticket.unit || '',
                                                            subject: ticket.subject || '',
                                                            visitDate: ticket.repairmanVisitDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                                                            repairmanName: 'Mike Johnson (Contractor)',
                                                            message: `Hello ${ticket.tenant || 'Tenant'},\n\nA repairman (Mike Johnson) is scheduled to visit your unit (${ticket.unit}) on ${ticket.repairmanVisitDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]} regarding ticket #${ticket.displayId || ticket.id} (${ticket.subject}).\n\nPlease ensure unit access is available. Thank you, Property Management.`
                                                        });
                                                        setShowNotifyModal(true);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                                    title="Notify Tenant by Email with Repair Date"
                                                >
                                                    <Mail size={16} />
                                                </button>
                                                {hasPermission('Tickets', 'edit') && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingTicket(ticket);
                                                            setShowAddModal(true);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                        title="Edit Ticket"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {hasPermission('Tickets', 'delete') && (
                                                    <button
                                                        onClick={() => handleDeleteTicket(ticket.dbId || ticket.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                        title="Delete Ticket"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* View Ticket Details Modal */}
                {selectedTicket && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 anim-fade-in p-4">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl anim-zoom-in max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-bold text-slate-800">{selectedTicket.displayId || selectedTicket.id}</h3>
                                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                            {selectedTicket.building || selectedTicket.propertyName}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Requested Date: {selectedTicket.requestDate || selectedTicket.createdAt?.split('T')[0]}</p>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Auto-populated Tenant Details Card */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenant Name</label>
                                        <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedTicket.tenant}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Apt / Unit Number</label>
                                        <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedTicket.unit}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                        <p className="font-medium text-slate-700 text-sm mt-0.5">{selectedTicket.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rent Amount</label>
                                        <p className="font-bold text-emerald-600 text-sm mt-0.5">
                                            {selectedTicket.rent ? (selectedTicket.rent.toString().startsWith('$') ? selectedTicket.rent : `$${selectedTicket.rent}`) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</label>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 flex-1 font-bold text-base">
                                            {selectedTicket.subject}
                                        </p>
                                        {selectedTicket.isRequired && (
                                            <div className="flex flex-col items-center gap-1 bg-rose-50 border border-rose-100 p-2 rounded-lg min-w-[100px]">
                                                <AlertTriangle size={16} className="text-rose-600" />
                                                <span className="text-[10px] font-black text-rose-700 uppercase tracking-tighter text-center leading-none">Blocking<br/>Readiness</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                                    <p className="text-slate-600 text-sm mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        {selectedTicket.desc || selectedTicket.description || 'No description provided'}
                                    </p>
                                </div>

                                {/* Option to Assign Date Work Will Be Completed */}
                                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar size={15} className="text-emerald-600" />
                                            Date Work Will Be Completed
                                        </label>
                                        {selectedTicket.completionDate && (
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                                                Assigned: {selectedTicket.completionDate}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="date"
                                            value={quickCompletionDate}
                                            onChange={(e) => setQuickCompletionDate(e.target.value)}
                                            className="px-3.5 py-2 rounded-xl border border-emerald-200 text-sm font-semibold bg-white text-slate-800 flex-1 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={handleUpdateCompletionDate}
                                            className="!bg-emerald-600 hover:!bg-emerald-700 !text-white text-xs font-bold"
                                        >
                                            Save Completion Date
                                        </Button>
                                    </div>
                                </div>

                                {/* Option to Notify Tenant by Email with Date Repairman Will Pass By */}
                                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                                            <Mail size={15} className="text-indigo-600" />
                                            Notify Tenant of Repair Visit
                                        </p>
                                        <p className="text-xs text-indigo-700 mt-1">
                                            {selectedTicket.repairmanVisitDate 
                                                ? `Visit scheduled on ${selectedTicket.repairmanVisitDate} (Tenant notified)`
                                                : `Send an email notice to ${selectedTicket.tenant} with the scheduled repair date`}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        className="!bg-indigo-600 hover:!bg-indigo-700 !text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                                        onClick={() => {
                                            setNotifyData({
                                                ticket: selectedTicket,
                                                email: selectedTicket.email || '',
                                                tenantName: selectedTicket.tenant || '',
                                                unit: selectedTicket.unit || '',
                                                subject: selectedTicket.subject || '',
                                                visitDate: selectedTicket.repairmanVisitDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                                                repairmanName: 'Mike Johnson (Contractor)',
                                                message: `Hello ${selectedTicket.tenant || 'Tenant'},\n\nA repairman (Mike Johnson) is scheduled to visit your unit (${selectedTicket.unit}) on ${selectedTicket.repairmanVisitDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]} regarding ticket #${selectedTicket.displayId || selectedTicket.id}: "${selectedTicket.subject}".\n\nPlease ensure access is available. Thank you, Property Management Team`
                                            });
                                            setShowNotifyModal(true);
                                        }}
                                    >
                                        <Mail size={14} />
                                        {selectedTicket.repairmanVisitDate ? 'Resend Notice' : 'Notify Tenant by Email'}
                                    </Button>
                                </div>

                                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Attachments
                                        </label>
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            {selectedTicket.attachments.map((att, idx) => (
                                                <div key={idx} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                                                    {att.type === 'image' && (
                                                        <img src={att.url} alt="attachment" className="w-full h-32 object-cover rounded-md" />
                                                    )}
                                                    {att.type === 'video' && (
                                                        <video src={att.url} controls className="w-full h-32 rounded-md" />
                                                    )}
                                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-indigo-600 font-semibold mt-2 text-center hover:underline">
                                                        Open in new tab
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Update Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Open', 'In Progress', 'Resolved'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => updateStatus(selectedTicket.id, status)}
                                                className={clsx(
                                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                                    selectedTicket.status === status
                                                        ? "bg-zinc-900 text-white border-indigo-600 shadow-lg shadow-zinc-200"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                                                )}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Importance Level (Priority)
                                        </label>
                                        <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold border", getPriorityBadgeClass(selectedTicket.priority))}>
                                            Current: {formatPriorityText(selectedTicket.priority)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Low', 'Medium', 'High'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => updatePriority(selectedTicket.id, p)}
                                                className={clsx(
                                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all border",
                                                    formatPriorityText(selectedTicket.priority) === p
                                                        ? p === 'High' ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-200"
                                                          : p === 'Medium' ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200"
                                                          : "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                {p === 'High' ? '🔴 High Priority' : p === 'Medium' ? '🟡 Medium Priority' : '🔵 Low Priority'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button variant="primary" onClick={() => setSelectedTicket(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* New / Edit Maintenance Ticket Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] anim-fade-in p-4">
                        <form
                            className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl anim-zoom-in max-h-[90vh] overflow-y-auto"
                            onSubmit={handleSaveTicket}
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <h3 className="text-2xl font-bold text-slate-800">
                                    {editingTicket ? 'Edit Ticket' : 'New Maintenance Ticket'}
                                </h3>
                                <button type="button" onClick={() => { setShowAddModal(false); setEditingTicket(null); }} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Building Dropdown */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Building</label>
                                    <div className="relative">
                                        <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select
                                            value={selectedBuildingId}
                                            onChange={(e) => setSelectedBuildingId(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white appearance-none text-slate-800 font-medium"
                                        >
                                            <option value="">Select Building</option>
                                            <option value="all" className="font-bold text-indigo-600">🏢 All Buildings (Total wide task)</option>
                                            {buildings.map(b => (
                                                <option key={b.id} value={b.id.toString()}>{b.name}{b.civicNumber ? ` - ${b.civicNumber}` : ''}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Tenant Dropdown */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Tenant</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select
                                            value={selectedTenantId}
                                            onChange={(e) => handleTenantChange(e.target.value)}
                                            required={selectedBuildingId !== 'all'}
                                            disabled={loadingTenants || !selectedBuildingId}
                                            className="w-full pl-12 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white appearance-none text-slate-800 font-medium disabled:opacity-50"
                                        >
                                            <option value="">{loadingTenants ? 'Fetching tenants...' : 'Select Tenant'}</option>
                                            {tenants.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Auto-populated Fields from Tenant List */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Apt Number</label>
                                        <input
                                            name="aptNumber"
                                            value={formApt}
                                            onChange={(e) => setFormApt(e.target.value)}
                                            placeholder="e.g. Apt 101"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 font-semibold text-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Rent Amount (Auto)</label>
                                        <input
                                            name="rent"
                                            value={formRent}
                                            onChange={(e) => setFormRent(e.target.value)}
                                            placeholder="e.g. $1,100"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 font-semibold text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address (Auto)</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formEmail}
                                            onChange={(e) => setFormEmail(e.target.value)}
                                            placeholder="tenant@example.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 font-medium text-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Request Date (Auto)</label>
                                        <input
                                            type="date"
                                            name="requestDate"
                                            value={formRequestDate}
                                            onChange={(e) => setFormRequestDate(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 font-semibold text-slate-800"
                                        />
                                    </div>
                                </div>

                                {/* Subject Input */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Subject / Category</label>
                                    <input
                                        name="subject"
                                        required
                                        list="ticket-subject-options"
                                        value={formSubject}
                                        onChange={(e) => setFormSubject(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-semibold text-slate-800"
                                        placeholder="Select or enter subject (e.g. Plumbing, Electrical work...)"
                                    />
                                    <datalist id="ticket-subject-options">
                                        <option value="General repairs" />
                                        <option value="Electrical work" />
                                        <option value="Plumbing" />
                                        <option value="Extermination" />
                                        <option value="Other" />
                                    </datalist>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 h-20 resize-none font-medium text-slate-800"
                                        placeholder="Describe the issue in detail..."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Priority</label>
                                        <select
                                            name="priority"
                                            value={formPriority}
                                            onChange={(e) => setFormPriority(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white font-medium"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>

                                    {/* Option to assign date work will be completed */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Date Work Completed</label>
                                        <input
                                            type="date"
                                            name="completionDate"
                                            value={formCompletionDate}
                                            onChange={(e) => setFormCompletionDate(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white font-medium text-slate-800"
                                        />
                                    </div>
                                </div>

                                {/* Images and Video Upload Buttons: Separate, side by side in a single line with proper alignment, spacing, and consistent sizing */}
                                <div className="grid grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1.5 min-w-0">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 block truncate" title="Images (Optional)">
                                            Images (Optional)
                                        </label>
                                        <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer h-10 w-full group overflow-hidden select-none">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 transition-colors">
                                                <Camera size={14} />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 truncate flex-1">
                                                {formImagesCount > 0 ? `${formImagesCount} photo${formImagesCount > 1 ? 's' : ''}` : 'Upload Images'}
                                            </span>
                                            <input
                                                type="file"
                                                name="images"
                                                multiple
                                                accept=".jpg,.png,.jpeg"
                                                onChange={(e) => setFormImagesCount(e.target.files?.length || 0)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-1.5 min-w-0">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 block truncate" title="Video (Optional)">
                                            Video (Optional)
                                        </label>
                                        <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer h-10 w-full group overflow-hidden select-none">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 transition-colors">
                                                <Play size={14} />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 truncate flex-1">
                                                {formVideoName ? formVideoName : 'Upload Video'}
                                            </span>
                                            <input
                                                type="file"
                                                name="video"
                                                accept=".mp4,.mov"
                                                onChange={(e) => setFormVideoName(e.target.files?.[0]?.name || '')}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowAddModal(false); setEditingTicket(null); }}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={isCreatingTicket} className="flex-1">
                                    {isCreatingTicket ? 'Saving...' : (editingTicket ? 'Update Ticket' : 'Save Ticket')}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Modal to Notify Tenant by Email with Repairman Visit Date */}
                {showNotifyModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] anim-fade-in p-4">
                        <form
                            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl anim-zoom-in"
                            onSubmit={handleSendRepairmanNotice}
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Notify Tenant of Repair</h3>
                                        <p className="text-xs text-slate-500">Send scheduled visit date to tenant</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Tenant Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={notifyData.email}
                                        onChange={(e) => setNotifyData({ ...notifyData, email: e.target.value })}
                                        placeholder="tenant@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium text-slate-800"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Repairman Visit Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={notifyData.visitDate}
                                            onChange={(e) => setNotifyData({ ...notifyData, visitDate: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Repairman / Tech</label>
                                        <input
                                            type="text"
                                            value={notifyData.repairmanName}
                                            onChange={(e) => setNotifyData({ ...notifyData, repairmanName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Message Preview</label>
                                    <textarea
                                        rows={4}
                                        value={notifyData.message}
                                        onChange={(e) => setNotifyData({ ...notifyData, message: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-xs font-medium text-slate-700 resize-none bg-slate-50"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowNotifyModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={sendingNotice} className="flex-1 flex items-center justify-center gap-1.5">
                                    <Send size={15} />
                                    {sendingNotice ? 'Sending...' : 'Send Notification'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tenant Details Modal */}
                {viewingTenantDetails && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] anim-fade-in p-4">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl anim-zoom-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Tenant Info</h3>
                                <button onClick={() => setViewingTenantDetails(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border-4 border-white shadow-lg">
                                    <User size={40} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{viewingTenantDetails.name}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{viewingTenantDetails.email || 'No email'}</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white text-slate-400 shadow-sm">
                                        <Building size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Property & Unit</p>
                                        <p className="font-semibold text-slate-700">{viewingTenantDetails.property || 'General'} • {viewingTenantDetails.unit || 'Apt'}</p>
                                    </div>
                                </div>
                                {viewingTenantDetails.rent && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white text-emerald-600 shadow-sm">
                                            <DollarSign size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Rent</p>
                                            <p className="font-bold text-emerald-600">{viewingTenantDetails.rent.toString().startsWith('$') ? viewingTenantDetails.rent : `$${viewingTenantDetails.rent}`}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setViewingTenantDetails(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};
