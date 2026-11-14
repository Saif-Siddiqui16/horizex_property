import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Calendar, Info, Eye, X, FileText, Upload, Download, Clock, ExternalLink, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useGetTenantInsuranceQuery, useUpdateTenantInsuranceMutation } from '../../store';
import api from '../../api/client';

export const TenantInsurance = () => {
    const { data: insurance, isLoading } = useGetTenantInsuranceQuery();
    const [updateInsurance, { isLoading: isUploading }] = useUpdateTenantInsuranceMutation();

    const [showPreview, setShowPreview] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showQuotesModal, setShowQuotesModal] = useState(false);

    const [formData, setFormData] = useState({
        provider: '',
        policyNumber: '',
        coverageType: 'Tenant Liability & Contents ($2M)',
        startDate: '',
        endDate: ''
    });
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (insurance) {
            setFormData({
                provider: insurance.provider || '',
                policyNumber: insurance.policyNumber || '',
                coverageType: insurance.coverageType || 'Tenant Liability & Contents ($2M)',
                startDate: insurance.startDate ? insurance.startDate.substring(0, 10) : '',
                endDate: insurance.endDate ? insurance.endDate.substring(0, 10) : ''
            });
        }
    }, [insurance]);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            let fileUrl = null;
            let fileName = null;
            if (selectedFile) {
                fileName = selectedFile.name;
                fileUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedFile);
                });
            }

            await updateInsurance({
                provider: formData.provider,
                policyNumber: formData.policyNumber,
                coverageType: formData.coverageType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                fileName,
                fileUrl
            }).unwrap();

            setShowUploadModal(false);
            setSelectedFile(null);
            alert('Policy document submitted successfully for verification!');
        } catch (error) {
            console.error(error);
            alert('Upload failed: ' + (error?.data?.message || error?.message || 'Please try again'));
        }
    };

    if (isLoading) return <div className="p-10 text-center font-medium text-slate-500">Loading insurance details...</div>;

    // Status Styling Logic
    const getStatusConfig = (status) => {
        switch (status) {
            case 'Active':
            case 'ACTIVE': return { bg: 'emerald-50', text: 'emerald-600', border: 'emerald-100', icon: ShieldCheck, label: 'Approved & Active' };
            case 'PENDING_APPROVAL': return { bg: 'amber-50', text: 'amber-600', border: 'amber-100', icon: Info, label: 'Pending Admin Review' };
            case 'REJECTED': return { bg: 'red-50', text: 'red-600', border: 'red-100', icon: X, label: 'Policy Rejected' };
            case 'EXPIRED': return { bg: 'red-50', text: 'red-600', border: 'red-100', icon: AlertTriangle, label: 'Policy Expired' };
            case 'EXPIRING_SOON': return { bg: 'amber-50', text: 'amber-600', border: 'amber-100', icon: Clock, label: 'Expiring Soon' };
            default: return { bg: 'slate-50', text: 'slate-600', border: 'slate-100', icon: Info, label: status || 'Active' };
        }
    };

    const statusConfig = getStatusConfig(insurance?.status || 'Active');
    const canEdit = true; // Tenant can update / upload their insurance policy

    return (
        <>
            <div className="max-w-4xl space-y-8 anim-slide-up">
                {/* STATUS BAR */}
                {insurance && (
                    <div className={`p-6 rounded-3xl border bg-${statusConfig.text.split('-')[0]}-50/30 border-${statusConfig.text.split('-')[0]}-100 flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                            {(() => {
                                const StatusIcon = statusConfig.icon;
                                return (
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-emerald-500">
                                        <StatusIcon size={24} />
                                    </div>
                                );
                            })()}
                            <div>
                                <h3 className="font-black tracking-tight text-slate-800">{statusConfig.label}</h3>
                                <p className="text-sm font-medium text-slate-500">
                                    {insurance.status === 'REJECTED' ? `Reason: ${insurance.rejectionReason || 'Document unreadable'}` :
                                        insurance.status === 'PENDING_APPROVAL' ? "We'll notify you once admin reviews your document." :
                                            `Valid until ${insurance.endDate ? new Date(insurance.endDate).toLocaleDateString() : 'N/A'}`}
                                </p>
                            </div>
                        </div>
                        {canEdit && (
                            <Button size="sm" onClick={() => setShowUploadModal(true)}>Update Policy</Button>
                        )}
                    </div>
                )}

                {!insurance ? (
                    <section className="bg-white rounded-[40px] border-4 border-dashed border-slate-100 p-16 flex flex-col items-center text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 shadow-inner">
                            <ShieldCheck size={48} />
                        </div>
                        <div className="max-w-md space-y-3">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Protect Your Home</h2>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Renters insurance is mandatory for all tenants to protect your personal property and liability.
                                Please provide your policy documents to comply with building standards.
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                            <Upload size={18} className="mr-2" />
                            Upload Insurance Policy
                        </Button>
                    </section>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="p-8 rounded-[32px] shadow-xl shadow-slate-100/50 border-0 bg-white">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10 pb-6 md:pb-10 border-b border-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center italic font-black text-xl md:text-2xl border border-indigo-100 shadow-sm shrink-0">
                                            {(insurance.provider || 'IN').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{insurance.provider}</h3>
                                            <p className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{insurance.coverageType || 'Tenant Liability & Contents ($2M)'}</p>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Policy Number</p>
                                        <p className="text-lg font-mono font-black text-slate-700 tracking-tighter">{insurance.policyNumber}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={16} className="shrink-0" />
                                            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Effective Date</span>
                                        </div>
                                        <p className="text-base md:text-lg font-black text-slate-700">{insurance.startDate ? new Date(insurance.startDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1.5 sm:text-right">
                                        <div className="flex items-center gap-2 text-slate-400 sm:justify-end">
                                            <Calendar size={16} className="shrink-0" />
                                            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Expiration Date</span>
                                        </div>
                                        <p className={`text-base md:text-lg font-black ${insurance.status === 'EXPIRED' ? 'text-red-600' : 'text-slate-800'}`}>
                                            {insurance.endDate ? new Date(insurance.endDate).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-10 pt-10 border-t border-slate-50 flex gap-4">
                                    <Button variant="secondary" className="flex-1 h-14 rounded-2xl" onClick={() => setShowPreview(true)}>
                                        <Eye size={18} className="mr-2" />
                                        View Certificate
                                    </Button>
                                    {canEdit && (
                                        <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setShowUploadModal(true)}>
                                            <Upload size={18} className="mr-2" />
                                            Update Policy
                                        </Button>
                                    )}
                                </div>
                            </Card>

                            <section className="bg-slate-900 rounded-[32px] p-8 text-white flex items-center justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="space-y-2 relative z-10">
                                    <h4 className="text-xl font-black tracking-tight italic">Switch & Save?</h4>
                                    <p className="text-slate-400 text-sm font-medium max-w-xs">Compare renters insurance quotes directly from our portfolio partners.</p>
                                </div>
                                <button
                                    onClick={() => setShowQuotesModal(true)}
                                    className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-all relative z-10 cursor-pointer shadow-md hover:bg-slate-100"
                                >
                                    Get Quotes
                                </button>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <div className="p-8 rounded-[32px] bg-zinc-900 text-white border-0 shadow-xl shadow-zinc-200/30 flex flex-col">
                                <Info size={32} className="mb-6 text-indigo-200" />
                                <h4 className="text-xl font-black mb-3 italic tracking-tight uppercase text-white">Why Insurance?</h4>
                                <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                                    Did you know your landlord's insurance doesn't cover your belongings? Renter's insurance protects everything inside your home from theft, fire, or water damage.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* UPLOAD / UPDATE MODAL */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 anim-fade-in">
                    <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl anim-zoom-in max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{insurance ? 'Update Policy' : 'Upload Policy'}</h3>
                            <button onClick={() => setShowUploadModal(false)} className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="p-8 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-1.5 px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insurance Provider</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.provider}
                                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 bg-slate-50 focus:bg-white transition-all shadow-sm"
                                    placeholder="e.g. Desjardins, Intact, Sonnet, State Farm"
                                />
                            </div>
                            <div className="space-y-1.5 px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.policyNumber}
                                    onChange={e => setFormData({ ...formData, policyNumber: e.target.value })}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 bg-slate-50 focus:bg-white transition-all shadow-sm"
                                    placeholder="e.g. POL-992834-QC"
                                />
                            </div>
                            <div className="space-y-1.5 px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage Type</label>
                                <select
                                    value={formData.coverageType}
                                    onChange={e => setFormData({ ...formData, coverageType: e.target.value })}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 bg-slate-50 focus:bg-white transition-all shadow-sm appearance-none"
                                >
                                    <option value="Tenant Liability & Contents ($2M)">Tenant Liability & Contents ($2M)</option>
                                    <option value="General Liability ($1M)">General Liability ($1M)</option>
                                    <option value="Full Comprehensive Coverage">Full Comprehensive Coverage</option>
                                    <option value="Theft & Liability">Theft & Liability</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 bg-slate-50 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5 px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 bg-slate-50 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className={`w-full p-8 border-2 border-dashed rounded-3xl flex flex-col items-center gap-3 cursor-pointer transition-all ${selectedFile ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedFile ? 'bg-emerald-500 text-white' : 'bg-white shadow-sm text-slate-400'}`}>
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-black text-slate-600 tracking-tight">{selectedFile ? selectedFile.name : 'Select Policy Document (PDF/Image)'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max file size: 10MB</p>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,image/*" />
                            </div>
                            <div className="pt-4 flex gap-4 sticky bottom-0 bg-white pb-2">
                                <Button type="button" variant="secondary" className="flex-1 h-16 rounded-2xl" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" className="flex-1 h-16 rounded-2xl shadow-xl shadow-zinc-200" disabled={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Submit Policy'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DOCUMENT PREVIEW / DOWNLOAD MODAL */}
            {showPreview && insurance && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 anim-fade-in">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl anim-zoom-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Certificate of Insurance</h3>
                                    <p className="text-xs font-semibold text-slate-400">{insurance.provider} • Policy #{insurance.policyNumber}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPreview(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Summary Card */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Coverage Type</span>
                                    <span className="text-xs font-black text-indigo-600">{insurance.coverageType}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Policy Period</span>
                                    <span className="text-xs font-bold text-slate-700">
                                        {insurance.startDate ? new Date(insurance.startDate).toLocaleDateString() : 'N/A'} - {insurance.endDate ? new Date(insurance.endDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Compliance Status</span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                        <CheckCircle size={14} /> Approved & Active
                                    </span>
                                </div>
                            </div>

                            {/* Document Actions */}
                            {insurance.documentUrl ? (
                                <div className="space-y-3">
                                    <a
                                        href={insurance.documentUrl}
                                        download={insurance.documentName || "Insurance_Certificate.pdf"}
                                        className="flex items-center justify-center w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 gap-2 cursor-pointer"
                                    >
                                        <Download size={18} />
                                        Download Certificate PDF
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => window.open(insurance.documentUrl, '_blank')}
                                        className="flex items-center justify-center w-full h-12 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition gap-2"
                                    >
                                        <ExternalLink size={16} />
                                        Open in New Browser Tab
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6 space-y-3">
                                    <p className="text-sm font-semibold text-slate-500">
                                        No digital PDF file has been uploaded for this policy yet.
                                    </p>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setShowPreview(false);
                                            setShowUploadModal(true);
                                        }}
                                        className="h-12 px-6 rounded-xl"
                                    >
                                        <Upload size={16} className="mr-2" />
                                        Upload Certificate PDF
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* PARTNER QUOTES MODAL */}
            {showQuotesModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 anim-fade-in">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl anim-zoom-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Compare Renters Insurance</h3>
                                <p className="text-xs font-semibold text-slate-400 mt-0.5">Pre-negotiated partner rates for Horizex residents</p>
                            </div>
                            <button onClick={() => setShowQuotesModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            {/* Option 1 */}
                            <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-base text-slate-800">Duuo by Co-operators</h4>
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Recommended</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">$2,000,000 Liability • $30,000 Contents • Instant digital proof</p>
                                    <p className="text-xs text-indigo-600 font-bold">No cancellation fees • Auto-reported to building manager</p>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-slate-800">$15.50</span>
                                        <span className="text-xs text-slate-400 font-bold">/mo</span>
                                    </div>
                                    <a
                                        href="https://duuo.ca/tenant-insurance/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                                    >
                                        Get Instant Quote <ExternalLink size={13} />
                                    </a>
                                </div>
                            </div>

                            {/* Option 2 */}
                            <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-base text-slate-800">Sonnet Insurance</h4>
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">100% Online</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">$2,000,000 Liability • Water Damage & Identity Theft included</p>
                                    <p className="text-xs text-slate-400 font-medium">Quick 5-minute activation with instant policy document download</p>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-slate-800">$18.25</span>
                                        <span className="text-xs text-slate-400 font-bold">/mo</span>
                                    </div>
                                    <a
                                        href="https://www.sonnet.ca/tenant-insurance"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
                                    >
                                        Get Instant Quote <ExternalLink size={13} />
                                    </a>
                                </div>
                            </div>

                            {/* Option 3 */}
                            <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-base text-slate-800">Square One Insurance</h4>
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Lowest Price</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">Customizable deductible from $250 • Cancel anytime with 0 fees</p>
                                    <p className="text-xs text-slate-400 font-medium">Only pay for the coverage you actually need</p>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-slate-800">$14.00</span>
                                        <span className="text-xs text-slate-400 font-bold">/mo</span>
                                    </div>
                                    <a
                                        href="https://www.squareone.ca/renters-insurance"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
                                    >
                                        Get Instant Quote <ExternalLink size={13} />
                                    </a>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                                <p className="text-xs font-bold text-slate-600">Already bought a policy from another provider?</p>
                                <p className="text-[11px] text-slate-400">Click <strong>"Update Policy"</strong> on the main screen to submit your certificate for review.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
