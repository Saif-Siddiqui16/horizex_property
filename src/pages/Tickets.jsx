import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { 
    Search, Eye, Filter, CheckCircle, Clock, AlertTriangle, X, Plus, User, 
    Building, ChevronDown, Trash2, Edit2, Play, Camera, Printer, 
    Calendar, Mail, Send, DollarSign, AtSign 
} from 'lucide-react';
import clsx from 'clsx';
import api from '../api/client';
import { hasPermission } from '../utils/permissions';

const priorityColors = {
    High: 'bg-red-50 text-red-700 border-red-100',
    Medium: 'bg-amber-50 text-amber-700 border-amber-100',
    Low: 'bg-blue-50 text-blue-700 border-blue-100',
};

const statusIcons = {
    'Open': <AlertTriangle size={14} className="text-amber-500" />,
    'In Progress': <Clock size={14} className="text-blue-500" />,
    'Resolved': <CheckCircle size={14} className="text-emerald-500" />,
};

export const Tickets = () => {
    const [__forceUpdate, __setForceUpdate] = useState(0);
    useEffect(() => {
        const handleUpdate = () => __setForceUpdate(p => p + 1);
        window.addEventListener('permissionsUpdated', handleUpdate);
        return () => window.removeEventListener('permissionsUpdated', handleUpdate);
    }, []);

    const [tickets, setTickets] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [loadingTenants, setLoadingTenants] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [viewingTenantDetails, setViewingTenantDetails] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Form State for New/Edit Ticket
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [formApt, setFormApt] = useState('');
    const [formRent, setFormRent] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formRequestDate, setFormRequestDate] = useState(new Date().toISOString().split('T')[0]);
    const [formCompletionDate, setFormCompletionDate] = useState('');
    const [formSubject, setFormSubject] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPriority, setFormPriority] = useState('Low');

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

    useEffect(() => {
        fetchTickets();
        fetchBuildings();
        const handleCompanyChange = () => {
            fetchTickets();
            fetchBuildings();
        };
        window.addEventListener('companyChanged', handleCompanyChange);
        return () => window.removeEventListener('companyChanged', handleCompanyChange);
    }, []);

    useEffect(() => {
        if (selectedBuildingId && selectedBuildingId !== 'all') {
            fetchTenants(selectedBuildingId);
        } else if (selectedBuildingId === 'all') {
            fetchAllTenants();
        } else {
            setTenants([]);
        }
    }, [selectedBuildingId]);

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
        }
    }, [editingTicket, showAddModal]);

    // Sync quick completion date when viewing a ticket
    useEffect(() => {
        if (selectedTicket) {
            setQuickCompletionDate(selectedTicket.completionDate || '');
        }
    }, [selectedTicket]);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/api/admin/tickets');
            setTickets(res.data);
        } catch (e) {
            console.error('Error fetching tickets', e);
        }
    };

    const fetchBuildings = async () => {
        try {
            const res = await api.get('/api/admin/properties');
            setBuildings(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchTenants = async (buildingId) => {
        setLoadingTenants(true);
        try {
            const res = await api.get(`/api/admin/tenants?propertyId=${buildingId}&limit=1000`);
            setTenants(res.data?.data || res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoadingTenants(false); }
    };

    const fetchAllTenants = async () => {
        setLoadingTenants(true);
        try {
            const res = await api.get(`/api/admin/tenants?limit=1000`);
            setTenants(res.data?.data || res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoadingTenants(false); }
    };

    // Auto-populate Apt Number, Rent Amount, Email Address, and Request Date when tenant is selected
    const handleTenantChange = (tenantIdVal) => {
        setSelectedTenantId(tenantIdVal);
        const ten = tenants.find(t => t.id === parseInt(tenantIdVal));
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

    // Automatically sort all tickets by building alphabetically
    const sortedTickets = [...tickets].sort((a, b) => {
        const buildingA = (a.building || a.propertyName || '').toLowerCase();
        const buildingB = (b.building || b.propertyName || '').toLowerCase();
        if (buildingA !== buildingB) {
            return buildingA.localeCompare(buildingB);
        }
        return (b.dbId || 0) - (a.dbId || 0);
    });

    const filteredTickets = sortedTickets.filter(t =>
        (t.tenant || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.building || t.propertyName || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.unit || '').toLowerCase().includes(search.toLowerCase())
    );

    const updateStatus = async (id, newStatus) => {
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return;

        try {
            await api.put(`/api/admin/tickets/${ticket.dbId}/status`, { status: newStatus });
            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
            setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const handleDeleteTicket = async (dbId) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;
        try {
            await api.delete(`/api/admin/tickets/${dbId}`);
            setTickets(tickets.filter(t => t.dbId !== dbId));
            setSuccessMessage('Ticket Deleted Successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            alert('Failed to delete ticket');
        }
    };

    const handleSaveTicket = async (e) => {
        e.preventDefault();
        const tenantObj = tenants.find(t => t.id === parseInt(selectedTenantId));
        const buildingObj = buildings.find(b => b.id.toString() === selectedBuildingId);

        const buildingName = buildingObj ? buildingObj.name : (editingTicket?.building || 'General Building');
        const tenantName = tenantObj ? (tenantObj.name || `${tenantObj.firstName} ${tenantObj.lastName}`) : (editingTicket?.tenant || 'General Tenant');
        const unitVal = formApt || tenantObj?.unitNumber || tenantObj?.unit || editingTicket?.unit || 'N/A';

        try {
            const formData = new FormData();
            formData.append('propertyId', selectedBuildingId);
            formData.append('building', buildingName);
            formData.append('propertyName', buildingName);
            formData.append('tenantId', selectedTenantId);
            formData.append('tenant', tenantName);
            formData.append('tenantName', tenantName);
            formData.append('unitId', tenantObj?.unitId || editingTicket?.unitId || '');
            formData.append('unit', unitVal);
            formData.append('unitNumber', unitVal);
            formData.append('aptNumber', unitVal);
            formData.append('rent', formRent || tenantObj?.rent || '');
            formData.append('email', formEmail || tenantObj?.email || '');
            formData.append('requestDate', formRequestDate || new Date().toISOString().split('T')[0]);
            formData.append('completionDate', formCompletionDate || '');
            formData.append('subject', formSubject);
            formData.append('title', formSubject);
            formData.append('description', formDescription);
            formData.append('priority', formPriority);

            if (editingTicket) {
                await api.put(`/api/admin/tickets/${editingTicket.dbId}`, {
                    propertyId: selectedBuildingId ? parseInt(selectedBuildingId) : null,
                    building: buildingName,
                    propertyName: buildingName,
                    tenantId: selectedTenantId ? parseInt(selectedTenantId) : null,
                    tenant: tenantName,
                    tenantName: tenantName,
                    unitId: tenantObj?.unitId || editingTicket.unitId,
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
                });
            } else {
                if (e.target.images && e.target.images.files.length > 0) {
                    Array.from(e.target.images.files).forEach(file => {
                        formData.append('images', file);
                    });
                }

                if (e.target.video && e.target.video.files.length > 0) {
                    formData.append('video', e.target.video.files[0]);
                }

                await api.post('/api/admin/tickets', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            fetchTickets();
            setShowAddModal(false);
            setEditingTicket(null);
            setSelectedBuildingId('');
            setSuccessMessage(editingTicket ? 'Ticket Updated Successfully!' : 'Ticket Created Successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            console.error('Error saving ticket:', e);
            alert('Failed to save ticket');
        }
    };

    // Quick assign/update date work will be completed
    const handleUpdateCompletionDate = async () => {
        if (!selectedTicket) return;
        try {
            await api.put(`/api/admin/tickets/${selectedTicket.dbId}`, {
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
            const emailBody = notifyData.message || `Hello ${notifyData.tenantName || 'Tenant'},\n\nA repairman (${notifyData.repairmanName || 'Technician'}) has been scheduled to visit your unit (${notifyData.unit || ''}) on ${notifyData.visitDate} regarding your maintenance ticket #${notifyData.ticket.id} ("${notifyData.subject}").\n\nPlease ensure someone is available or unit access is granted.\n\nThank you,\nProperty Management Team`;

            await api.post('/api/admin/communication/send-email', {
                tenantId: notifyData.ticket.tenantId || 101,
                email: notifyData.email,
                subject: `Repairman Visit Scheduled for Ticket #${notifyData.ticket.id}`,
                body: emailBody
            });

            await api.put(`/api/admin/tickets/${notifyData.ticket.dbId}`, {
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
                                        <h3 class="title">${ticket.id}</h3>
                                        <span class="badge priority-${ticket.priority}">${ticket.priority}</span>
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

                <section className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.06)] gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all w-full md:w-auto md:min-w-[320px]">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by building, ID, tenant, or subject"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 w-full text-sm font-medium"
                        />
                    </div>

                    <div className="flex gap-2">
                        {selectedForPrint.size > 0 && (
                            <Button variant="secondary" size="sm" onClick={handlePrint} className="!border-indigo-200 !text-indigo-600 hover:!bg-indigo-50">
                                <Printer size={16} />
                                Print ({selectedForPrint.size})
                            </Button>
                        )}
                        <Button variant="secondary" size="sm">
                            <Filter size={16} />
                            Filters
                        </Button>
                        {hasPermission('Tickets', 'add') && (
                            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                                <Plus size={16} />
                                Add Ticket
                            </Button>
                        )}
                    </div>
                </section>

                <section className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden w-full">
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-[950px]">
                            {/* Table Header: Automatically sorted by building */}
                            <div className="grid grid-cols-[auto_0.8fr_1.3fr_1.5fr_1.2fr_0.8fr_0.8fr_1fr_0.9fr] gap-4 bg-slate-50 border-b border-slate-200 px-6 py-4 items-center">
                                <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer" />
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket ID</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Building size={14} className="text-indigo-500" />
                                    Building
                                </span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {filteredTickets.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 font-medium text-sm">
                                        No tickets found.
                                    </div>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="grid grid-cols-[auto_0.8fr_1.3fr_1.5fr_1.2fr_0.8fr_0.8fr_1fr_0.9fr] gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-all duration-200"
                                        >
                                            <input type="checkbox" checked={selectedForPrint.has(ticket.id)} onChange={() => toggleSelect(ticket.id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer" />
                                            <span className="text-sm font-semibold text-indigo-600">{ticket.id}</span>
                                            
                                            {/* Building Column */}
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-100/80 text-xs font-bold truncate">
                                                    {ticket.building || ticket.propertyName || 'Sunset Towers'}
                                                </span>
                                            </div>

                                            <div className="flex flex-col pr-3 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-800 font-bold truncate">{ticket.subject}</span>
                                                    {ticket.isRequired && (
                                                        <span className="px-1.5 py-0.5 rounded bg-red-50 text-[8px] font-black text-red-600 uppercase border border-red-100">Required</span>
                                                    )}
                                                    {ticket.attachments && ticket.attachments.length > 0 && (
                                                        <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100" title={`${ticket.attachments.length} attachments`}>
                                                            <Camera size={10} />
                                                            <span className="text-[10px] font-bold">{ticket.attachments.length}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {ticket.completionDate && (
                                                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                            <Calendar size={11} /> Comp: {ticket.completionDate}
                                                        </span>
                                                    )}
                                                    {ticket.repairmanVisitDate && (
                                                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                                            <Clock size={11} /> Visit: {ticket.repairmanVisitDate}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start gap-0.5">
                                                <button
                                                    onClick={() => {
                                                        setViewingTenantDetails(ticket.tenantDetails || { name: ticket.tenant, unit: ticket.unit, rent: ticket.rent, email: ticket.email, property: ticket.building || ticket.propertyName });
                                                    }}
                                                    className="text-sm text-indigo-600 font-semibold hover:underline text-left w-fit"
                                                >
                                                    {ticket.tenant}
                                                </button>
                                                {ticket.email && (
                                                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]" title={ticket.email}>
                                                        {ticket.email}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700">{ticket.unit}</span>
                                                {ticket.rent && (
                                                    <span className="text-[11px] text-emerald-600 font-bold">
                                                        {ticket.rent.toString().startsWith('$') ? ticket.rent : `$${ticket.rent}`}
                                                    </span>
                                                )}
                                            </div>

                                            <span>
                                                <span className={clsx("px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight", priorityColors[ticket.priority])}>
                                                    {ticket.priority}
                                                </span>
                                            </span>

                                            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                {statusIcons[ticket.status]}
                                                {ticket.status}
                                            </span>

                                            <span className="flex justify-center gap-1">
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
                                                            message: `Hello ${ticket.tenant || 'Tenant'},\n\nA repairman (Mike Johnson) is scheduled to visit your unit (${ticket.unit}) on ${ticket.repairmanVisitDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]} regarding ticket #${ticket.id} (${ticket.subject}).\n\nPlease ensure unit access is available. Thank you, Property Management.`
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
                                                        onClick={() => handleDeleteTicket(ticket.dbId)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                        title="Delete Ticket"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </span>
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
                                        <h3 className="text-2xl font-bold text-slate-800">{selectedTicket.id}</h3>
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
                                                message: `Hello ${selectedTicket.tenant || 'Tenant'},\n\nA repairman (Mike Johnson) is scheduled to visit your unit (${selectedTicket.unit}) on ${selectedTicket.repairmanVisitDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]} regarding maintenance ticket #${selectedTicket.id}: "${selectedTicket.subject}".\n\nPlease ensure access is available.\n\nThank you,\nProperty Management Team`
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
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Subject</label>
                                    <input
                                        name="subject"
                                        required
                                        value={formSubject}
                                        onChange={(e) => setFormSubject(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-semibold text-slate-800"
                                        placeholder="e.g. Toilet leaking"
                                    />
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

                                <div className="grid grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Images</label>
                                        <input
                                            type="file"
                                            name="images"
                                            multiple
                                            accept=".jpg,.png,.jpeg"
                                            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-100 file:text-slate-600 cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Video</label>
                                        <input
                                            type="file"
                                            name="video"
                                            accept=".mp4,.mov"
                                            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-100 file:text-slate-600 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowAddModal(false); setEditingTicket(null); }}>Cancel</Button>
                                <Button type="submit" variant="primary" className="flex-1">{editingTicket ? 'Update Ticket' : 'Save Ticket'}</Button>
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
