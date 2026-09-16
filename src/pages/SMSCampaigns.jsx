import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Send, Users, Building2, CheckCircle, Clock, AlertCircle, Plus, X, Search, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { hasPermission } from '../utils/permissions';

const SMSCampaigns = () => {
    const [__forceUpdate, __setForceUpdate] = useState(0);
    useEffect(() => {
        const handleUpdate = () => __setForceUpdate(p => p + 1);
        window.addEventListener('permissionsUpdated', handleUpdate);
        return () => window.removeEventListener('permissionsUpdated', handleUpdate);
    }, []);

    const [campaigns, setCampaigns] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [useTemplate, setUseTemplate] = useState(true);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        templateId: '',
        customContent: '',
        buildingId: '',
        recipientType: 'TENANTS'
    });

    // Granular Selection States
    const [tenants, setTenants] = useState([]);
    const [coworkers, setCoworkers] = useState([]);
    const [selection, setSelection] = useState({
        buildingIds: [],
        excludedTenantIds: [],
        extraTenantIds: [],
        coworkerIds: []
    });
    const [tenantSearchTerm, setTenantSearchTerm] = useState('');

    // Pagination for Campaign List
    const [currentPage, setCurrentPage] = useState(1);
    const campaignsPerPage = 4;

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchCampaigns, 5000); // Poll for progress
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchCampaigns(),
                fetchTemplates(),
                fetchBuildings(),
                fetchTenants(),
                fetchCoworkers()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const response = await api.get('/api/communication/campaigns');
            setCampaigns(response.data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await api.get('/api/communication/templates');
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const fetchBuildings = async () => {
        try {
            const response = await api.get('/api/admin/properties?limit=1000');
            const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setBuildings(data);
        } catch (error) {
            console.error('Error fetching buildings:', error);
        }
    };

    const fetchTenants = async () => {
        try {
            const res = await api.get('/api/admin/tenants?limit=1000&status=Active');
            setTenants(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (e) {
            console.error('Error fetching tenants:', e);
        }
    };

    const fetchCoworkers = async () => {
        try {
            const res = await api.get('/api/admin/coworkers');
            setCoworkers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (e) {
            console.error('Error fetching coworkers:', e);
        }
    };

    const getFilteredRecipients = () => {
        const selectedMap = new Map();

        // 1. If "All Buildings" or specific buildings selected in NEW logic
        const targetBIds = newCampaign.buildingId ? [parseInt(newCampaign.buildingId)] : [];
        
        if (newCampaign.recipientType === 'TENANTS' || newCampaign.recipientType === 'ALL') {
            tenants.forEach(t => {
                const bId = t.buildingId || t.propertyId;
                
                // If building matches OR no building filter (All Buildings)
                const matchesBuilding = targetBIds.length === 0 || targetBIds.includes(bId);
                
                if (matchesBuilding) {
                    if (!selection.excludedTenantIds.includes(t.id)) {
                        selectedMap.set(`tenant-${t.id}`, { ...t, type: 'TENANT' });
                    }
                }
            });
        }

        // 2. Extra tenants manually added (Future feature or via search)
        selection.extraTenantIds.forEach(id => {
            const t = tenants.find(x => x.id === id);
            if (t && !selection.excludedTenantIds.includes(id)) {
                selectedMap.set(`tenant-${t.id}`, { ...t, type: 'TENANT' });
            }
        });

        // 3. Coworkers
        if (newCampaign.recipientType === 'COWORKERS' || newCampaign.recipientType === 'ALL') {
            coworkers.forEach(c => {
                if (!selection.excludedTenantIds.includes(`coworker-${c.id}`)) {
                    selectedMap.set(`coworker-${c.id}`, { ...c, type: 'COWORKER' });
                }
            });
        }

        return Array.from(selectedMap.values());
    };

    const toggleExclusion = (id, isCoworker = false) => {
        const key = isCoworker ? `coworker-${id}` : id;
        setSelection(prev => ({
            ...prev,
            excludedTenantIds: prev.excludedTenantIds.includes(key)
                ? prev.excludedTenantIds.filter(x => x !== key)
                : [...prev.excludedTenantIds, key]
        }));
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        try {
            const recipients = getFilteredRecipients();
            const payload = { 
                ...newCampaign,
                recipientIds: recipients.map(r => r.id) 
            };
            if (useTemplate) {
                payload.customContent = '';
            } else {
                payload.templateId = '';
            }

            await api.post('/api/communication/campaign', payload);
            setIsModalOpen(false);
            setNewCampaign({ name: '', templateId: '', customContent: '', buildingId: '', recipientType: 'TENANTS' });
            setSelection({ buildingIds: [], excludedTenantIds: [], extraTenantIds: [], coworkerIds: [] });
            fetchCampaigns();
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert(error.response?.data?.error || 'Failed to start campaign');
        }
    };

    const handleDeleteCampaign = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign? This won\'t stop any active sends but will remove it from history.')) return;
        try {
            await api.delete(`/api/communication/campaign/${id}`);
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            alert('Failed to delete campaign');
        }
    };

    const [reportModal, setReportModal] = useState({ open: false, data: [] });

    const fetchReport = async (id) => {
        try {
            const response = await api.get(`/api/communication/campaign/${id}/failures`);
            setReportModal({ open: true, data: response.data.failures });
        } catch (error) {
            console.error('Error fetching report:', error);
            alert('Failed to load report');
        }
    };

    const handleRetryCampaign = async (id) => {
        try {
            await api.post(`/api/communication/campaign/${id}/retry`);
            fetchCampaigns();
        } catch (error) {
            console.error('Error retrying campaign:', error);
            alert('Failed to retry campaign');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'PROCESSING': return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
            case 'FAILED': return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'STUCK': return <AlertCircle className="h-5 w-5 text-amber-600" />;
        default: return <Clock className="h-5 w-5 text-slate-400" />;
        }
    };

    return (
        <MainLayout title="SMS Campaigns">
            <div className="space-y-4 text-slate-800 w-full max-w-full overflow-hidden">
                
                {/* Page Header Card */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 w-full">
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Send className="h-5 w-5 text-indigo-600 shrink-0" />
                            SMS Campaigns
                        </h1>
                        <p className="text-gray-500 mt-0.5 text-xs">Broadcast messages to buildings or specific tenant groups.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center shrink-0">
                        <button 
                            onClick={fetchCampaigns}
                            className="bg-white hover:bg-gray-50 text-gray-600 p-2 rounded-xl border border-gray-200 transition-all active:scale-95 shadow-sm flex items-center justify-center w-full sm:w-10 h-10 shrink-0 font-bold text-xs"
                            title="Refresh List"
                        >
                            <Clock className="h-4 w-4 shrink-0" />
                            <span className="sm:hidden ml-2">Refresh List</span>
                        </button>
                        {hasPermission('Campaign Manager', 'add') && (
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-10 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 w-full sm:w-auto font-bold text-xs"
                            >
                                <Plus className="h-4 w-4 shrink-0" />
                                <span className="whitespace-nowrap">New Campaign</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Campaign List */}
                <div className="grid grid-cols-1 gap-4 w-full">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-24 rounded-3xl animate-pulse border border-gray-100"></div>
                        ))
                    ) : campaigns.length === 0 ? (
                        <div className="bg-white p-10 md:p-20 text-center rounded-3xl border border-dashed border-gray-200 w-full">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600">No campaigns yet</h3>
                            <p className="text-gray-400 mt-2">Start your first broadcast to reach your tenants.</p>
                        </div>
                    ) : (
                        (() => {
                            const totalPages = Math.ceil(campaigns.length / campaignsPerPage);
                            const startIndex = (currentPage - 1) * campaignsPerPage;
                            const currentCampaigns = campaigns.slice(startIndex, startIndex + campaignsPerPage);

                            return (
                                <>
                                    {currentCampaigns.map(campaign => (
                                        <div key={campaign.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6 group w-full">
                                            <div className="flex items-center gap-4 flex-1 w-full min-w-0">
                                                <div className={`p-4 rounded-2xl shrink-0 ${campaign.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">
                                                        {campaign.name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-2">
                                                        <span className="text-xs text-gray-400 font-bold">#{campaign.id}</span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1 font-semibold">
                                                            <Clock size={12} />
                                                            {new Date(campaign.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Section */}
                                            <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-64">
                                                <div className="flex justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-400">
                                                    <span>Progress</span>
                                                    <span className={['PROCESSING', 'STUCK'].includes(campaign.status) ? 'text-amber-500' : 'text-gray-600'}>
                                                        {campaign.successCount + campaign.failedCount} / {campaign.totalRecipients}
                                                    </span>
                                                </div>
                                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                                    <div 
                                                        className="h-full bg-indigo-600 transition-all duration-1000"
                                                        style={{ width: `${( (campaign.successCount + campaign.failedCount) / campaign.totalRecipients) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter">
                                                    <span className="text-emerald-500">Success: {campaign.successCount}</span>
                                                    <span className="text-red-500">Failed: {campaign.failedCount}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 pl-0 md:pl-6 md:border-l border-gray-100 w-full md:w-auto justify-between md:justify-end">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(campaign.status)}
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">{campaign.status}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {campaign.failedCount > 0 && (
                                                        <button 
                                                            onClick={() => fetchReport(campaign.id)}
                                                            className="p-2.5 hover:bg-amber-50 text-amber-600 hover:text-amber-800 rounded-xl transition-all border border-transparent hover:border-amber-100"
                                                            title="View Missing Recipients"
                                                        >
                                                            <Search size={18} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleRetryCampaign(campaign.id)}
                                                        className="p-2.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                                        title="Retry/Resume sending"
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                    {hasPermission('Campaign Manager', 'delete') && (
                                                        <button 
                                                            onClick={() => handleDeleteCampaign(campaign.id)}
                                                            className="p-2.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                            title="Delete Campaign"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Report Modal */}
                                    {reportModal.open && (
                                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
                                            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 my-auto">
                                                <div className="px-6 md:px-10 py-6 md:py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Missing Delivery</h2>
                                                    <button onClick={() => setReportModal({ open: false, data: [] })} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                                                        <X size={24} className="text-gray-400" />
                                                    </button>
                                                </div>
                                                <div className="p-6 md:p-10">
                                                    {reportModal.data.length === 0 ? (
                                                        <p className="text-gray-500 text-center py-10 font-bold">Everyone has been reached!</p>
                                                    ) : (
                                                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                                                                The following {reportModal.data.length} people have not received their message:
                                                            </p>
                                                            {reportModal.data.map(user => (
                                                                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                                                                            <Users size={16} className="text-indigo-500" />
                                                                        </div>
                                                                        <span className="font-bold text-gray-700">{user.name}</span>
                                                                    </div>
                                                                    <span className="text-xs font-medium text-gray-400">{user.phone || 'No Phone'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={() => setReportModal({ open: false, data: [] })}
                                                        className="w-full mt-6 py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl md:rounded-3xl hover:bg-black transition-all"
                                                    >
                                                        Close Report
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* List Pagination Controls */}
                                    {campaigns.length > campaignsPerPage && (
                                        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-[2rem] mt-6 border border-gray-100 gap-4 w-full">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                Showing {startIndex + 1} - {Math.min(startIndex + campaignsPerPage, campaigns.length)} of {campaigns.length} Campaigns
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-2 hover:bg-gray-50 rounded-xl disabled:opacity-20 transition-all"
                                                >
                                                    <ChevronLeft size={20} className="text-gray-600" />
                                                </button>
                                                
                                                <div className="flex items-center gap-1">
                                                    {[...Array(totalPages)].map((_, i) => {
                                                        const pageNum = i + 1;
                                                        if (
                                                            totalPages <= 7 || 
                                                            pageNum === 1 || 
                                                            pageNum === totalPages || 
                                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => setCurrentPage(pageNum)}
                                                                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                                                                        currentPage === pageNum 
                                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110' 
                                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        } else if (
                                                            (pageNum === 2 && currentPage > 3) || 
                                                            (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                                        ) {
                                                            return <span key={pageNum} className="px-1 text-gray-300">...</span>;
                                                        }
                                                        return null;
                                                    })}
                                                </div>

                                                <button 
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 hover:bg-gray-50 rounded-xl disabled:opacity-20 transition-all"
                                                >
                                                    <ChevronRight size={20} className="text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()
                    )}
                </div>

                {/* Create Campaign Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white w-full h-[100dvh] md:h-[90vh] max-w-full md:max-w-4xl rounded-none md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                            
                            {/* Sticky Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 md:px-10 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 z-20">
                                <div className="flex items-center gap-3 flex-wrap min-w-0">
                                    <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">New Broadcast</h2>
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold uppercase whitespace-nowrap">
                                        {getFilteredRecipients().length} Recipients
                                    </span>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors self-end sm:self-auto">
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>
                            
                            {/* Scrollable Body containing 2-Column Grid */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                                    
                                    {/* Left Column: Campaign Information Form */}
                                    <div className="space-y-4">
                                        <form id="campaign-form" onSubmit={handleCreateCampaign} className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Campaign Name</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={newCampaign.name}
                                                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                                                    className="w-full px-4 h-10 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-white font-semibold text-xs text-gray-700"
                                                    placeholder="e.g. October Maintenance Alert"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Target Audience</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    {['TENANTS', 'COWORKERS', 'ALL'].map(type => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setNewCampaign({...newCampaign, recipientType: type})}
                                                            className={`px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                                                                newCampaign.recipientType === type 
                                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                                                                : 'border-gray-150 bg-gray-50 text-gray-400 hover:border-gray-200'
                                                            }`}
                                                        >
                                                            {type.replace('_', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                             {newCampaign.recipientType !== 'COWORKERS' && (
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Target Building</label>
                                                    <select 
                                                        value={newCampaign.buildingId}
                                                        onChange={(e) => setNewCampaign({...newCampaign, buildingId: e.target.value})}
                                                        className="w-full px-4 h-10 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-white font-semibold text-xs text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="">All Buildings</option>
                                                        {buildings.map(b => (
                                                            <option key={b.id} value={b.id}>{b.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex gap-2.5 mb-3">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setUseTemplate(true)}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${useTemplate ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                                                    >
                                                        Use Template
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setUseTemplate(false)}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!useTemplate ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                                                    >
                                                        Custom Message
                                                    </button>
                                                </div>

                                                {useTemplate ? (
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Message Template</label>
                                                        <select 
                                                            required={useTemplate}
                                                            value={newCampaign.templateId}
                                                            onChange={(e) => setNewCampaign({...newCampaign, templateId: e.target.value})}
                                                            className="w-full px-4 h-10 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-white font-semibold text-xs text-gray-700"
                                                        >
                                                            <option value="">Select a Template</option>
                                                            {templates.map(t => (
                                                                <option key={t.id} value={t.id}>{t.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Your Message</label>
                                                        <textarea 
                                                            required={!useTemplate}
                                                            value={newCampaign.customContent}
                                                            onChange={(e) => setNewCampaign({...newCampaign, customContent: e.target.value})}
                                                            rows="3"
                                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-white font-semibold text-xs text-gray-700"
                                                            placeholder="Type your bulk message here..."
                                                        />
                                                        <p className="mt-1 text-[9px] text-gray-400 font-bold italic">Character count: {newCampaign.customContent.length}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                                                <p className="text-[9px] text-amber-800 font-black uppercase leading-relaxed tracking-wider">
                                                    Note: Messages are sent at 1 req/sec. Max selection recommended: 50.
                                                </p>
                                            </div>
                                        </form>
                                    </div>
                                    
                                    {/* Right Column: Recipient Panel */}
                                    <div className="space-y-6 lg:border-l lg:border-gray-100 lg:pl-10">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recipient List</h3>
                                            <div className="relative">
                                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Filter list..." 
                                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-100 outline-none"
                                                    value={tenantSearchTerm}
                                                    onChange={(e) => setTenantSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Individual</p>
                                            <div className="relative group/search">
                                                <Plus size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search all tenants..." 
                                                    className="w-full pl-10 pr-4 py-3 bg-indigo-50/50 border-2 border-transparent rounded-2xl text-xs focus:border-indigo-100 focus:bg-white transition-all outline-none"
                                                    onChange={(e) => {
                                                        const term = e.target.value.toLowerCase();
                                                        if (term.length > 2) {
                                                            const match = tenants.find(t => 
                                                                (t.name?.toLowerCase().includes(term) || t.email?.toLowerCase().includes(term)) && 
                                                                !getFilteredRecipients().some(r => r.id === t.id)
                                                            );
                                                            if (match) {
                                                                setSelection(prev => ({
                                                                    ...prev,
                                                                    extraTenantIds: [...new Set([...prev.extraTenantIds, match.id])],
                                                                    excludedTenantIds: prev.excludedTenantIds.filter(id => id !== match.id)
                                                                }));
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border border-gray-100 p-4 rounded-3xl bg-gray-50/50">
                                            {getFilteredRecipients().filter(r => 
                                                r.name.toLowerCase().includes(tenantSearchTerm.toLowerCase()) || 
                                                r.email?.toLowerCase().includes(tenantSearchTerm.toLowerCase())
                                            ).map(r => (
                                                <div key={`${r.type}-${r.id}`} className="bg-white p-3 rounded-2xl border border-gray-100 flex justify-between items-center group hover:border-red-100 transition-all">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs font-bold text-gray-800 truncate">{r.name}</div>
                                                        <div className="text-[10px] text-gray-400 flex items-center gap-1 font-medium mt-0.5 min-w-0">
                                                            <span className={`px-1.5 py-0.5 rounded shrink-0 ${r.type === 'TENANT' ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-50 text-amber-500'}`}>
                                                                {r.type}
                                                            </span>
                                                            <span className="truncate">{r.building?.name || r.role}</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleExclusion(r.id, r.type === 'COWORKER')}
                                                        className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all shrink-0"
                                                        title="Exclude recipient"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            {getFilteredRecipients().length === 0 && (
                                                <div className="py-12 text-center opacity-30 select-none">
                                                    <Users size={32} className="mx-auto mb-2 text-gray-400" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No Recipients</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Sticky Modal Footer */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 md:px-10 md:py-6 flex flex-col sm:flex-row justify-end items-center gap-4 shrink-0 z-20">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm text-center font-bold"
                                >
                                    Cancel
                                </button>
                                <button 
                                    form="campaign-form"
                                    type="submit"
                                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 text-sm"
                                >
                                    <Send size={16} />
                                    Start Broadcast
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default SMSCampaigns;
