import React, { useState, useEffect } from 'react';
import { 
    Wrench, Building, Home, User, Mail, AlertCircle, CheckCircle, 
    Upload, X, Camera, ArrowRight, ShieldCheck, FileText, Check 
} from 'lucide-react';
import api from '../api/client';

const SUBJECT_OPTIONS = [
    'General repairs',
    'Electrical work',
    'Plumbing',
    'Extermination',
    'Other'
];

export const TenantRepairRequest = () => {
    const [properties, setProperties] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form inputs
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [aptNumber, setAptNumber] = useState('');
    const [matchedTenant, setMatchedTenant] = useState(null);
    const [tenantName, setTenantName] = useState('');
    const [tenantEmail, setTenantEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [details, setDetails] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [submittedTicket, setSubmittedTicket] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoadingData(true);
        try {
            const [propsRes, tenantsRes] = await Promise.all([
                api.get('/api/admin/properties'),
                api.get('/api/admin/tenants?limit=1000')
            ]);
            setProperties(propsRes.data || []);
            setTenants(tenantsRes.data?.data || tenantsRes.data || []);
        } catch (e) {
            console.error('Error loading property/tenant data:', e);
        } finally {
            setLoadingData(false);
        }
    };

    // When building selection changes
    const handlePropertyChange = (propertyId) => {
        setSelectedPropertyId(propertyId);
        const prop = properties.find(p => p.id.toString() === propertyId.toString());
        setSelectedBuilding(prop || null);

        // Reset tenant match if building changes
        setAptNumber('');
        setMatchedTenant(null);
        setTenantName('');
        setTenantEmail('');
    };

    // Auto-lookup tenant name and email when apartment number changes
    const handleAptChange = (unitVal) => {
        setAptNumber(unitVal);
        if (!unitVal.trim()) {
            setMatchedTenant(null);
            setTenantName('');
            setTenantEmail('');
            return;
        }

        const normalizedInput = unitVal.trim().toLowerCase().replace(/^apt\.?\s*/i, '');

        // Search in current selected property's tenants first, or across all if not selected
        const found = tenants.find(t => {
            const propMatch = !selectedPropertyId || t.propertyId?.toString() === selectedPropertyId.toString();
            if (!propMatch) return false;

            const tUnit = (t.unitNumber || t.unit || '').trim().toLowerCase().replace(/^apt\.?\s*/i, '');
            return tUnit === normalizedInput || (t.unitNumber || t.unit || '').trim().toLowerCase() === unitVal.trim().toLowerCase();
        });

        if (found) {
            setMatchedTenant(found);
            const fullName = found.name || `${found.firstName || ''} ${found.lastName || ''}`.trim();
            setTenantName(fullName);
            setTenantEmail(found.email || '');
            if (!selectedPropertyId && found.propertyId) {
                setSelectedPropertyId(found.propertyId.toString());
                const prop = properties.find(p => p.id.toString() === found.propertyId.toString());
                setSelectedBuilding(prop || null);
            }
        } else {
            setMatchedTenant(null);
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Append new images
        const updatedImages = [...images, ...files];
        setImages(updatedImages);

        // Generate previews
        const newPreviews = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
        }));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        setErrorMessage('');
    };

    // Remove single image
    const handleRemoveImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
        setImagePreviews(prev => {
            // Revoke URL to prevent memory leaks
            if (prev[indexToRemove]?.url) {
                URL.revokeObjectURL(prev[indexToRemove].url);
            }
            return prev.filter((_, idx) => idx !== indexToRemove);
        });
    };

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Strict Client Rule: "if they don't upload images request can't be filed"
        if (!images || images.length === 0) {
            setErrorMessage('Photos are required: Please upload at least one image of the repair issue so we can process your request.');
            return;
        }

        if (!selectedPropertyId) {
            setErrorMessage('Please select your property address.');
            return;
        }

        if (!aptNumber.trim()) {
            setErrorMessage('Please provide your apartment number.');
            return;
        }

        if (!subject) {
            setErrorMessage('Please choose a subject for your repair request.');
            return;
        }

        if (!details.trim()) {
            setErrorMessage('Please provide details about what needs to be repaired.');
            return;
        }

        if (details.length > 150) {
            setErrorMessage('Details must be 150 characters or less.');
            return;
        }

        setSubmitting(true);
        try {
            const buildingName = selectedBuilding ? selectedBuilding.name : 'Main Building';
            const propertyAddress = selectedBuilding ? (selectedBuilding.address || selectedBuilding.name) : buildingName;
            const finalTenantName = tenantName.trim() || (matchedTenant ? (matchedTenant.name || `${matchedTenant.firstName} ${matchedTenant.lastName}`) : 'Tenant');
            const finalTenantEmail = tenantEmail.trim() || matchedTenant?.email || '';

            const formData = new FormData();
            formData.append('propertyId', selectedPropertyId);
            formData.append('building', buildingName);
            formData.append('propertyName', buildingName);
            formData.append('address', propertyAddress);
            formData.append('tenantId', matchedTenant?.id ? matchedTenant.id.toString() : '');
            formData.append('tenant', finalTenantName);
            formData.append('tenantName', finalTenantName);
            formData.append('unit', aptNumber);
            formData.append('unitNumber', aptNumber);
            formData.append('aptNumber', aptNumber);
            formData.append('email', finalTenantEmail);
            formData.append('subject', subject);
            formData.append('title', subject);
            formData.append('description', details);
            formData.append('desc', details);
            // Tenants do NOT set importance level - default to Medium for admin to review
            formData.append('priority', 'Medium');
            formData.append('status', 'Open');
            formData.append('requestDate', new Date().toISOString().split('T')[0]);

            images.forEach(img => {
                formData.append('images', img);
            });

            const res = await api.post('/api/admin/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSubmittedTicket(res.data || {
                ticketNumber: 'TKT-PENDING',
                subject,
                unit: aptNumber,
                building: buildingName
            });
        } catch (err) {
            console.error('Failed to submit repair request:', err);
            setErrorMessage('Failed to submit your repair request. Please verify your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Reset to file another request
    const handleReset = () => {
        setSubmittedTicket(null);
        setSelectedPropertyId('');
        setSelectedBuilding(null);
        setAptNumber('');
        setMatchedTenant(null);
        setTenantName('');
        setTenantEmail('');
        setSubject('');
        setDetails('');
        setImages([]);
        setImagePreviews([]);
        setErrorMessage('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 mb-4">
                        <Wrench size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
                        Tenant Repair Request
                    </h1>
                    <p className="mt-2 text-base text-slate-600 font-medium">
                        Please fill in the repair details below so our maintenance team can assist you promptly.
                    </p>
                </div>

                {/* SUCCESS SCREEN */}
                {submittedTicket ? (
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 text-center space-y-6 anim-zoom-in">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle size={44} />
                        </div>

                        <div className="space-y-2">
                            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Request Filed Successfully
                            </span>
                            <h2 className="text-2xl font-black text-slate-900">
                                Repair Ticket #{submittedTicket.ticketNumber || submittedTicket.id}
                            </h2>
                            <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                                Thank you! We have logged your request under <strong>{submittedTicket.subject}</strong> for unit <strong>{submittedTicket.unit || aptNumber}</strong>. Our management team will review the details and schedule the repair visit.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-200/80 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500 font-medium">Subject / Category</span>
                                <span className="font-bold text-slate-800">{submittedTicket.subject}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500 font-medium">Apartment</span>
                                <span className="font-bold text-slate-800">{aptNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500 font-medium">Tenant</span>
                                <span className="font-bold text-slate-800">{tenantName || 'Tenant'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Photos Attached</span>
                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                    <Check size={14} /> {images.length} Image(s) Uploaded
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all"
                        >
                            Submit Another Request
                        </button>
                    </div>
                ) : (
                    /* THE REPAIR FORM */
                    <form 
                        onSubmit={handleSubmit}
                        className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-7"
                    >
                        {errorMessage && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm font-semibold">
                                <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-600" />
                                <div>{errorMessage}</div>
                            </div>
                        )}

                        {/* 1. ADDRESS / BUILDING */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                                <Building size={15} className="text-indigo-600" />
                                Address / Building <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedPropertyId}
                                onChange={(e) => handlePropertyChange(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            >
                                <option value="">Select your building address...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} {p.address ? `— ${p.address}` : ''}
                                    </option>
                                ))}
                            </select>
                            {selectedBuilding?.address && (
                                <p className="text-xs text-slate-500 font-medium pl-1">
                                    {selectedBuilding.address}
                                </p>
                            )}
                        </div>

                        {/* 2. APT NUMBER (AUTO-BRINGS UP TENANT NAME & EMAIL) */}
                        <div className="space-y-2">
                            <label className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider">
                                <span className="flex items-center gap-2">
                                    <Home size={15} className="text-indigo-600" />
                                    Apt Number <span className="text-red-500">*</span>
                                </span>
                                <span className="text-[11px] font-bold text-indigo-600 normal-case">
                                    (Auto-detects tenant details)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={aptNumber}
                                onChange={(e) => handleAptChange(e.target.value)}
                                placeholder="e.g. Apt 101 or 201"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                            />

                            {/* AUTO-POPULATED TENANT DETAILS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                                        <User size={13} /> Tenant Name
                                    </label>
                                    <input
                                        type="text"
                                        value={tenantName}
                                        onChange={(e) => setTenantName(e.target.value)}
                                        placeholder={matchedTenant ? 'Auto-detected' : 'Tenant full name'}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:bg-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                                        <Mail size={13} /> Tenant Email
                                    </label>
                                    <input
                                        type="email"
                                        value={tenantEmail}
                                        onChange={(e) => setTenantEmail(e.target.value)}
                                        placeholder={matchedTenant ? 'Auto-detected' : 'tenant@example.com'}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:bg-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {matchedTenant && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                    <ShieldCheck size={16} /> Verified Tenant: {matchedTenant.name || `${matchedTenant.firstName} ${matchedTenant.lastName}`}
                                </div>
                            )}
                        </div>

                        {/* 3. SUBJECT (DROPDOWN WITH 5 SPECIFIC OPTIONS) */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                                <FileText size={15} className="text-indigo-600" />
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            >
                                <option value="">Select repair subject...</option>
                                {SUBJECT_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* 4. DETAILS (MAX 150 CHARACTERS) */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                    Details <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-xs font-bold ${
                                    details.length >= 140 ? 'text-amber-600' : 'text-slate-400'
                                }`}>
                                    {details.length}/150 characters
                                </span>
                            </div>
                            <textarea
                                value={details}
                                maxLength={150}
                                onChange={(e) => setDetails(e.target.value)}
                                required
                                rows={3}
                                placeholder="Describe the repair in detail (maximum 150 characters)..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none transition-all placeholder:text-slate-400"
                            />
                            <p className="text-[11px] text-slate-400 font-medium pl-1">
                                Please keep your summary concise and under 150 characters.
                            </p>
                        </div>

                        {/* 5. UPLOAD IMAGES (MANDATORY) */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                                    <Camera size={15} className="text-indigo-600" />
                                    Upload Images <span className="text-red-500">* (Mandatory)</span>
                                </label>
                                <span className="text-[11px] font-bold text-red-500">
                                    Required to file request
                                </span>
                            </div>

                            {/* Dropzone */}
                            <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform mb-2">
                                    <Upload size={22} />
                                </div>
                                <span className="text-sm font-bold text-slate-800">
                                    Click or tap to upload photo(s)
                                </span>
                                <span className="text-xs text-slate-500 mt-1">
                                    JPG, PNG, or WEBP (Take a photo or choose from gallery)
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-square bg-slate-100">
                                            <img
                                                src={preview.url}
                                                alt={`Issue photo ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 hover:bg-red-600 text-white transition-colors"
                                                title="Remove photo"
                                            >
                                                <X size={14} />
                                            </button>
                                            <span className="absolute bottom-1 left-1 right-1 text-[10px] font-bold text-white bg-black/60 px-1 py-0.5 rounded truncate text-center">
                                                {preview.size}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {images.length === 0 && (
                                <p className="text-xs text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 font-medium">
                                    📸 <strong>Notice:</strong> As per building management policy, requests cannot be filed without uploading photos of the repair.
                                </p>
                            )}
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting || images.length === 0}
                                className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                                    submitting || images.length === 0
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-indigo-600/25'
                                }`}
                            >
                                {submitting ? (
                                    <>Filing Repair Request...</>
                                ) : (
                                    <>
                                        Submit Repair Request <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Footer Note */}
                <div className="text-center mt-8 text-xs text-slate-400 font-medium">
                    Property Management Maintenance Portal • Requests are reviewed and scheduled by management staff.
                </div>
            </div>
        </div>
    );
};
export default TenantRepairRequest;
