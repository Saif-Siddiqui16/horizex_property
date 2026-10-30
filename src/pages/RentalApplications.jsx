import React, { useState, useEffect } from 'react';
import {
    FileCheck,
    Search,
    Filter,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    User,
    Building2,
    Briefcase,
    DollarSign,
    ShieldCheck,
    Scale,
    Phone,
    FileText,
    PawPrint,
    ChevronRight,
    Pencil,
    Check,
    X,
    Save,
    RotateCcw,
    ExternalLink,
    Trash2
} from 'lucide-react';
import { Button } from '../components/Button';
import clsx from 'clsx';

const STORAGE_KEY = 'horizex_rental_applications_v1';

// Initial preloaded data matching client requirements
const INITIAL_APPLICATIONS = [
    {
        id: 'APP-1001',
        applicantName: 'Alexandre Tremblay',
        unitAddress: 'Parkview Heights - Apt 304',
        listingAgent: 'Sarah Jenkins',
        appliedDate: '2026-10-26',
        status: 'UNDER_REVIEW',
        creditScore: {
            value: '745 (Equifax)',
            isVerified: true,
            notes: 'Excellent credit standing. 0 late payments in past 36 months.'
        },
        employment: {
            company: 'Deloitte Canada',
            role: 'Senior Financial Analyst',
            isVerified: true,
            notes: 'Full-time permanent position. Tenure 3.5 years.'
        },
        salary: {
            amount: '$88,000 / year ($7,333/mo)',
            isVerified: true,
            notes: 'Reviewed past 3 paystubs. Rent-to-income ratio is 24%.'
        },
        landlordReference: {
            contact: 'Marc Tremblay - (514) 555-0192',
            isVerified: true,
            notes: 'Spoke with previous landlord. Tenant paid on time and left unit spotless.'
        },
        employerReference: {
            contact: 'Valerie Fortin (HR Director) - v.fortin@deloitte.com',
            isVerified: true,
            notes: 'HR confirmed employment, salary, and good standing.'
        },
        talAddress: {
            address: '4210 Rue Saint-Denis, Montreal, QC',
            isVerified: true,
            notes: 'TAL registry search confirmed no historical non-payment or disturbance cases.'
        },
        judgementsOnName: {
            details: 'Zero judgements found',
            isVerified: true,
            notes: 'Tribunal administratif du logement check: Clean record on applicant name.'
        },
        pets: {
            details: '1 Domestic Shorthair Cat (10 lbs, neutered)',
            isVerified: true,
            notes: 'Complies with building pet policy. Vaccination certificate provided.'
        },
        otherNotes: 'Strong applicant with solid references and verified income. Recommended for lease execution.'
    },
    {
        id: 'APP-1002',
        applicantName: 'Sophia Patel',
        unitAddress: 'Downtown Executive Suites - Apt 102',
        listingAgent: 'Michael Chang',
        appliedDate: '2026-10-27',
        status: 'PENDING',
        creditScore: {
            value: '690 (TransUnion)',
            isVerified: false,
            notes: 'Pending credit bureau soft pull confirmation.'
        },
        employment: {
            company: 'Shopify Corp',
            role: 'Product Designer',
            isVerified: true,
            notes: 'Remote employee confirmed via Shopify internal portal verification.'
        },
        salary: {
            amount: '$95,000 / year ($7,916/mo)',
            isVerified: false,
            notes: 'Waiting for official T4 tax slip from applicant.'
        },
        landlordReference: {
            contact: 'Elite Living Mgmt - (514) 555-8831',
            isVerified: false,
            notes: 'Left voicemail with property manager, awaiting callback.'
        },
        employerReference: {
            contact: 'David Ross (Team Lead) - david.r@shopify.com',
            isVerified: true,
            notes: 'Manager provided excellent character reference.'
        },
        talAddress: {
            address: '1240 Rue Peel, Apt 6B, Montreal, QC',
            isVerified: false,
            notes: 'Need to run address verification against TAL case records.'
        },
        judgementsOnName: {
            details: 'Check in progress',
            isVerified: false,
            notes: 'Awaiting court registry cross-reference results.'
        },
        pets: {
            details: 'None declared',
            isVerified: true,
            notes: 'Applicant confirmed no pets.'
        },
        otherNotes: 'Awaiting landlord callback and T4 verification before final approval.'
    },
    {
        id: 'APP-1003',
        applicantName: 'Marcus Vance',
        unitAddress: 'Soros Capital Residences - Apt 508',
        listingAgent: 'Sarah Jenkins',
        appliedDate: '2026-10-24',
        status: 'APPROVED',
        creditScore: {
            value: '780 (Equifax)',
            isVerified: true,
            notes: 'Superb credit score with clean trade lines.'
        },
        employment: {
            company: 'Bombardier Aviation',
            role: 'Quality Assurance Lead',
            isVerified: true,
            notes: 'Permanent position since 2019.'
        },
        salary: {
            amount: '$104,000 / year ($8,666/mo)',
            isVerified: true,
            notes: 'Verified via 2025 Notice of Assessment and direct deposit stubs.'
        },
        landlordReference: {
            contact: 'Jean-Luc Picard - (514) 555-7744',
            isVerified: true,
            notes: 'Previous landlord of 4 years confirmed exemplary tenancy.'
        },
        employerReference: {
            contact: 'HR Verification Desk - hr@bombardier.ca',
            isVerified: true,
            notes: 'Official employment verification letter on file.'
        },
        talAddress: {
            address: '5800 Boulevard Decarie, Montreal, QC',
            isVerified: true,
            notes: 'Clean address history with zero TAL tribunal hearings.'
        },
        judgementsOnName: {
            details: 'No record found (Clean)',
            isVerified: true,
            notes: 'No Quebec or Federal civil court judgements.'
        },
        pets: {
            details: '1 Golden Retriever (certified service animal)',
            isVerified: true,
            notes: 'Medical documentation and vaccination up to date.'
        },
        otherNotes: 'Fully approved. Lease draft sent for digital signature.'
    }
];

export const RentalApplications = () => {
    // Load persisted applications or fallback to initial
    const [applications, setApplications] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error('Failed to load rental applications:', e);
        }
        return INITIAL_APPLICATIONS;
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedApp, setSelectedApp] = useState(null);
    const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Save to localStorage whenever applications change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
        } catch (e) {
            console.error('Failed to save rental applications:', e);
        }
    }, [applications]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filter applications
    const filteredApps = applications.filter(app => {
        const matchesSearch =
            app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.unitAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.listingAgent.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Counts for stats
    const totalCount = applications.length;
    const pendingCount = applications.filter(a => a.status === 'PENDING').length;
    const underReviewCount = applications.filter(a => a.status === 'UNDER_REVIEW').length;
    const approvedCount = applications.filter(a => a.status === 'APPROVED').length;

    // Open review modal for an application
    const handleOpenReview = (app) => {
        // Deep clone so editing in drawer is isolated until saved
        setSelectedApp(JSON.parse(JSON.stringify(app)));
        setIsReviewDrawerOpen(true);
    };

    // Toggle a verification item checkbox
    const handleToggleCheck = (fieldKey) => {
        if (!selectedApp) return;
        setSelectedApp(prev => ({
            ...prev,
            [fieldKey]: {
                ...prev[fieldKey],
                isVerified: !prev[fieldKey].isVerified
            }
        }));
    };

    // Update notes for a specific item
    const handleUpdateFieldNotes = (fieldKey, notesText) => {
        if (!selectedApp) return;
        setSelectedApp(prev => ({
            ...prev,
            [fieldKey]: {
                ...prev[fieldKey],
                notes: notesText
            }
        }));
    };

    // Update overall other notes
    const handleUpdateOtherNotes = (text) => {
        if (!selectedApp) return;
        setSelectedApp(prev => ({
            ...prev,
            otherNotes: text
        }));
    };

    // Update application status
    const handleUpdateStatus = (newStatus) => {
        if (!selectedApp) return;
        setSelectedApp(prev => ({
            ...prev,
            status: newStatus
        }));
    };

    // Save the reviewed application
    const handleSaveReview = () => {
        if (!selectedApp) return;
        setApplications(prev => prev.map(a => a.id === selectedApp.id ? selectedApp : a));
        showToast(`Application for ${selectedApp.applicantName} saved successfully.`);
        setIsReviewDrawerOpen(false);
    };

    // Delete application
    const handleDeleteApp = (appId, appName) => {
        if (window.confirm(`Are you sure you want to delete the rental application for ${appName}?`)) {
            setApplications(prev => prev.filter(a => a.id !== appId));
            showToast(`Application for ${appName} deleted.`);
            if (selectedApp?.id === appId) {
                setIsReviewDrawerOpen(false);
            }
        }
    };

    // New Application Form State
    const [newAppForm, setNewAppForm] = useState({
        applicantName: '',
        unitAddress: '',
        listingAgent: '',
        creditScoreVal: '',
        employmentVal: '',
        salaryVal: '',
        landlordRefVal: '',
        employerRefVal: '',
        talAddressVal: '',
        judgementsVal: '',
        petsVal: '',
        initialNotes: ''
    });

    const handleCreateNewApp = (e) => {
        e.preventDefault();
        if (!newAppForm.applicantName || !newAppForm.unitAddress) {
            alert('Please provide applicant name and unit address.');
            return;
        }

        const newEntry = {
            id: `APP-${1000 + applications.length + 1}`,
            applicantName: newAppForm.applicantName,
            unitAddress: newAppForm.unitAddress,
            listingAgent: newAppForm.listingAgent || 'Staff Agent',
            appliedDate: new Date().toISOString().split('T')[0],
            status: 'PENDING',
            creditScore: {
                value: newAppForm.creditScoreVal || 'Pending Check',
                isVerified: false,
                notes: ''
            },
            employment: {
                company: newAppForm.employmentVal || 'Pending Verification',
                role: 'Applicant',
                isVerified: false,
                notes: ''
            },
            salary: {
                amount: newAppForm.salaryVal || '$0',
                isVerified: false,
                notes: ''
            },
            landlordReference: {
                contact: newAppForm.landlordRefVal || 'None provided',
                isVerified: false,
                notes: ''
            },
            employerReference: {
                contact: newAppForm.employerRefVal || 'None provided',
                isVerified: false,
                notes: ''
            },
            talAddress: {
                address: newAppForm.talAddressVal || newAppForm.unitAddress,
                isVerified: false,
                notes: ''
            },
            judgementsOnName: {
                details: newAppForm.judgementsVal,
                isVerified: false,
                notes: ''
            },
            pets: {
                details: newAppForm.petsVal || 'None',
                isVerified: false,
                notes: ''
            },
            otherNotes: newAppForm.initialNotes || 'New application awaiting review.'
        };

        setApplications([newEntry, ...applications]);
        setShowNewModal(false);
        setNewAppForm({
            applicantName: '',
            unitAddress: '',
            listingAgent: '',
            creditScoreVal: '',
            employmentVal: '',
            salaryVal: '',
            landlordRefVal: '',
            employerRefVal: '',
            talAddressVal: '',
            judgementsVal: '',
            petsVal: '',
            initialNotes: ''
        });
        showToast('New rental application created.');
        handleOpenReview(newEntry);
    };

    // Calculate verification count for an app
    const getVerificationScore = (app) => {
        const keys = [
            'creditScore',
            'employment',
            'salary',
            'landlordReference',
            'employerReference',
            'talAddress',
            'judgementsOnName',
            'pets'
        ];
        const verifiedCount = keys.filter(k => app[k]?.isVerified).length;
        return { count: verifiedCount, total: keys.length };
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full min-w-0">
            {/* TOAST NOTIFICATION */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-sm border border-zinc-700 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                        <FileCheck className="text-blue-600" size={26} />
                        Review Rental Applications
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Screen tenant applicants, verify references, check off requirements, and write review notes.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                    >
                        <Plus size={16} />
                        <span>New Application</span>
                    </Button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Applications</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1">{totalCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Review</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Under Verification</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{underReviewCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 w-full min-w-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by applicant name, unit, or listing agent..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto max-w-full">
                    <span className="text-xs font-medium text-zinc-500 shrink-0">Filter Status:</span>
                    {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={clsx(
                                "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shrink-0",
                                statusFilter === st
                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
                            )}
                        >
                            {st.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* APPLICATIONS TABLE */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col w-full min-w-0">
                <style>{`
                    .rental-app-scroll {
                        overflow-x: auto;
                        scrollbar-width: thin;
                        scrollbar-color: #94a3b8 #f1f5f9;
                    }
                    .rental-app-scroll::-webkit-scrollbar {
                        height: 10px;
                    }
                    .rental-app-scroll::-webkit-scrollbar-track {
                        background: #f1f5f9;
                        border-radius: 6px;
                    }
                    .rental-app-scroll::-webkit-scrollbar-thumb {
                        background: #94a3b8;
                        border-radius: 6px;
                    }
                    .rental-app-scroll::-webkit-scrollbar-thumb:hover {
                        background: #64748b;
                    }
                `}</style>
                <div 
                    className="w-full overflow-x-auto rental-app-scroll"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#94a3b8 #f1f5f9'
                    }}
                >
                    <table className="w-full text-left border-collapse text-sm min-w-[1150px]">
                        <thead className="sticky top-0 z-10 bg-zinc-50 shadow-xs">
                            <tr className="bg-zinc-50/80 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                <th className="py-3.5 px-4 whitespace-nowrap">Applicant Name</th>
                                <th className="py-3.5 px-4 whitespace-nowrap">Unit Address</th>
                                <th className="py-3.5 px-4 whitespace-nowrap">Listing Agent</th>
                                <th className="py-3.5 px-4 whitespace-nowrap">Credit Score</th>
                                <th className="py-3.5 px-4 whitespace-nowrap">Verification Checklist</th>
                                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                                <th className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-zinc-500">
                                        No rental applications found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredApps.map((app) => {
                                    const { count, total } = getVerificationScore(app);
                                    const isComplete = count === total;

                                    return (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                                            onClick={() => handleOpenReview(app)}
                                        >
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                                                        {app.applicantName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                                                            {app.applicantName}
                                                        </p>
                                                        <p className="text-[11px] text-zinc-500">{app.id} • Applied {app.appliedDate}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-zinc-700">
                                                    <Building2 size={14} className="text-zinc-400 shrink-0" />
                                                    <span className="font-medium whitespace-nowrap">{app.unitAddress}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-zinc-600 whitespace-nowrap">
                                                {app.listingAgent}
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                                                    {app.creditScore.value}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
                                                        <div
                                                            className={clsx(
                                                                "h-full transition-all duration-300",
                                                                isComplete ? "bg-emerald-500" : count > 3 ? "bg-blue-500" : "bg-amber-500"
                                                            )}
                                                            style={{ width: `${(count / total) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-zinc-600">
                                                        {count}/{total} checked
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span
                                                    className={clsx(
                                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                                                        app.status === 'APPROVED' && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                                                        app.status === 'PENDING' && "bg-amber-50 text-amber-700 border border-amber-200",
                                                        app.status === 'UNDER_REVIEW' && "bg-blue-50 text-blue-700 border border-blue-200",
                                                        app.status === 'REJECTED' && "bg-red-50 text-red-700 border border-red-200"
                                                    )}
                                                >
                                                    {app.status === 'APPROVED' && <CheckCircle2 size={12} />}
                                                    {app.status === 'PENDING' && <Clock size={12} />}
                                                    {app.status === 'UNDER_REVIEW' && <AlertCircle size={12} />}
                                                    {app.status === 'REJECTED' && <XCircle size={12} />}
                                                    {app.status.replace('_', ' ')}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenReview(app);
                                                        }}
                                                        className="p-1.5 bg-zinc-100 hover:bg-blue-50 text-zinc-700 hover:text-blue-600 rounded-md border border-zinc-300 hover:border-blue-200 transition-colors"
                                                        title="Review Application"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteApp(app.id, app.applicantName);
                                                        }}
                                                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors"
                                                        title="Delete Application"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer with Summary and Scroll Note */}
                <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 shrink-0">
                    <div className="font-semibold text-zinc-700">
                        Showing <span className="font-bold text-zinc-900">{filteredApps.length}</span> of <span className="font-bold text-zinc-900">{applications.length}</span> Total Applications
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 font-medium text-[11px]">
                        <span>← Scroll bottom bar horizontally to view full table details & actions →</span>
                    </div>
                </div>
                <div className="hidden">

                </div>
            </div>

            {/* INTERACTIVE REVIEW MODAL (CORE REQUIREMENT) */}
            {isReviewDrawerOpen && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                        {/* MODAL HEADER */}
                        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                    {selectedApp.applicantName[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold">{selectedApp.applicantName}</h2>
                                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                                            {selectedApp.id}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        Applied for <span className="text-white font-medium">{selectedApp.unitAddress}</span> • Listing Agent: <span className="text-white font-medium">{selectedApp.listingAgent}</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsReviewDrawerOpen(false)}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* STATUS SELECTION STRIP */}
                        <div className="px-6 py-3 bg-zinc-100 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Review Status:</span>
                                <div className="flex items-center gap-1.5">
                                    {[
                                        { key: 'PENDING', label: 'Pending', color: 'hover:bg-amber-50 text-amber-700', active: 'bg-amber-600 text-white' },
                                        { key: 'UNDER_REVIEW', label: 'Under Review', color: 'hover:bg-blue-50 text-blue-700', active: 'bg-blue-600 text-white' },
                                        { key: 'APPROVED', label: 'Approved', color: 'hover:bg-emerald-50 text-emerald-700', active: 'bg-emerald-600 text-white' },
                                        { key: 'REJECTED', label: 'Rejected', color: 'hover:bg-red-50 text-red-700', active: 'bg-red-600 text-white' }
                                    ].map(st => (
                                        <button
                                            key={st.key}
                                            onClick={() => handleUpdateStatus(st.key)}
                                            className={clsx(
                                                "px-2.5 py-1 text-xs font-bold rounded-md border transition-all",
                                                selectedApp.status === st.key
                                                    ? `${st.active} border-transparent shadow-xs`
                                                    : `bg-white border-zinc-300 ${st.color}`
                                            )}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="text-xs text-zinc-500 font-medium">
                                Checked: <span className="font-bold text-zinc-900">{getVerificationScore(selectedApp).count}</span> of 8 items verified
                            </div>
                        </div>

                        {/* MODAL BODY (SCROLLABLE CHECKLIST & NOTES) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-zinc-50/50">
                            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                                Screening Checklist & Review Notes (Check off and write observations):
                            </div>

                            {/* 1. APPLICANT CREDIT SCORE */}
                            <ReviewChecklistItem
                                title="Applicant Credit Score"
                                value={selectedApp.creditScore.value}
                                isVerified={selectedApp.creditScore.isVerified}
                                onToggleCheck={() => handleToggleCheck('creditScore')}
                                notes={selectedApp.creditScore.notes}
                                onNotesChange={(t) => handleUpdateFieldNotes('creditScore', t)}
                                icon={DollarSign}
                                placeholder="Write credit check notes, debt-to-income ratio, or bureau verification..."
                            />

                            {/* 2. EMPLOYMENT */}
                            <ReviewChecklistItem
                                title="Employment"
                                value={`${selectedApp.employment.company} — ${selectedApp.employment.role}`}
                                isVerified={selectedApp.employment.isVerified}
                                onToggleCheck={() => handleToggleCheck('employment')}
                                notes={selectedApp.employment.notes}
                                onNotesChange={(t) => handleUpdateFieldNotes('employment', t)}
                                icon={Briefcase}
                                placeholder="Write employment verification notes, position stability, or tenure..."
                            />

                            {/* 3. SALARY */}
                            <ReviewChecklistItem
                                title="Salary / Income"
                                value={selectedApp.salary.amount}
                                isVerified={selectedApp.salary.isVerified}
                                onToggleCheck={() => handleToggleCheck('salary')}
                                notes={selectedApp.salary.notes}
                                onNotesChange={(t) => handleUpdateFieldNotes('salary', t)}
                                icon={DollarSign}
                                placeholder="Write salary proof notes, paystubs verified, or annual income details..."
                            />

                            {/* 4. LANDLORD REFERENCE */}
                            <ReviewChecklistItem
                                title="Landlord Reference"
                                value={selectedApp.landlordReference.contact}
                                isVerified={selectedApp.landlordReference.isVerified}
                                onToggleCheck={() => handleToggleCheck('landlordReference')}
                                notes={selectedApp.landlordReference.notes}
                                onNotesChange={(t) => handleUpdateFieldNotes('landlordReference', t)}
                                icon={Building2}
                                placeholder="Write previous landlord feedback, payment habits, unit condition notes..."
                            />

                            {/* 5. EMPLOYER REFERENCE */}
                            <ReviewChecklistItem
                                title="Employer Reference"
                                value={selectedApp.employerReference.contact}
                                isVerified={selectedApp.employerReference.isVerified}
                                onToggleCheck={() => handleToggleCheck('employerReference')}
                                notes={selectedApp.employerReference.notes}
                                onNotesChange={(t) => handleUpdateFieldNotes('employerReference', t)}
                                icon={Phone}
                                placeholder="Write employer/HR manager phone or email reference notes..."
                            />

                            {/* 6. TAL ADDRESS (QUEBEC TRIBUNAL RECORD CHECK) */}
                            <ReviewChecklistItem
                                title="TAL Address Check (Tribunal Record)"
                                value={selectedApp.talAddress.address}
                                isVerified={selectedApp.talAddress.isVerified}
                                onToggleCheck={() => handleToggleCheck('talAddress')}
                                notes={selectedApp.talAddress.notes}
                                onNotesChange={(t) => handleUpdateFieldNotes('talAddress', t)}
                                icon={Scale}
                                placeholder="Write TAL tribunal address match notes or registered filings check..."
                            />

                            {/* 7. JUDGEMENTS ON NAME */}
                            <ReviewChecklistItem
                                title="Judgements on Name"
                                value={selectedApp.judgementsOnName.details}
                                isVerified={selectedApp.judgementsOnName.isVerified}
                                onToggleCheck={() => handleToggleCheck('judgementsOnName')}
                                notes={selectedApp.judgementsOnName.notes}
                                onNotesChange={(t) => handleUpdateFieldNotes('judgementsOnName', t)}
                                icon={ShieldCheck}
                                placeholder="Write court or TAL legal judgement search findings on applicant's name..."
                            />

                            {/* 8. PETS */}
                            <ReviewChecklistItem
                                title="Pets"
                                value={selectedApp.pets.details}
                                isVerified={selectedApp.pets.isVerified}
                                onToggleCheck={() => handleToggleCheck('pets')}
                                notes={selectedApp.pets.notes}
                                onNotesChange={(t) => handleUpdateFieldNotes('pets', t)}
                                icon={PawPrint}
                                placeholder="Write pet declaration notes, breed, weight, building rules compliance..."
                            />

                            {/* 9. OTHER NOTES */}
                            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                                    <FileText size={16} className="text-blue-600" />
                                    <span>Other Notes & Overall Reviewer Assessment</span>
                                </div>
                                <textarea
                                    value={selectedApp.otherNotes}
                                    onChange={(e) => handleUpdateOtherNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Write general comments, follow-up actions, conditions for lease approval, or reasoning for rejection..."
                                    className="w-full p-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all text-zinc-800"
                                />
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="px-6 py-4 bg-white border-t border-zinc-200 flex items-center justify-between shrink-0">
                            <button
                                onClick={() => setIsReviewDrawerOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleSaveReview}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 py-2.5 font-bold shadow-xs"
                                >
                                    <Save size={15} />
                                    <span>Save Review & Notes</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE NEW APPLICATION MODAL */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <Plus size={18} className="text-blue-400" />
                                Add Rental Application
                            </h2>
                            <button
                                onClick={() => setShowNewModal(false)}
                                className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateNewApp} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Applicant Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAppForm.applicantName}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, applicantName: e.target.value })}
                                        placeholder="e.g. Jean Dupont"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Unit Address *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAppForm.unitAddress}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, unitAddress: e.target.value })}
                                        placeholder="e.g. Parkview Heights - Apt 201"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Listing Agent</label>
                                    <input
                                        type="text"
                                        value={newAppForm.listingAgent}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, listingAgent: e.target.value })}
                                        placeholder="e.g. Sarah Jenkins"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Applicant Credit Score</label>
                                    <input
                                        type="text"
                                        value={newAppForm.creditScoreVal}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, creditScoreVal: e.target.value })}
                                        placeholder="e.g. 720 (Equifax)"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Employment</label>
                                    <input
                                        type="text"
                                        value={newAppForm.employmentVal}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, employmentVal: e.target.value })}
                                        placeholder="Company & Role"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Salary / Income</label>
                                    <input
                                        type="text"
                                        value={newAppForm.salaryVal}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, salaryVal: e.target.value })}
                                        placeholder="e.g. $75,000 / year"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Landlord Reference</label>
                                    <input
                                        type="text"
                                        value={newAppForm.landlordRefVal}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, landlordRefVal: e.target.value })}
                                        placeholder="Landlord name & phone"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Employer Reference</label>
                                    <input
                                        type="text"
                                        value={newAppForm.employerRefVal}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, employerRefVal: e.target.value })}
                                        placeholder="HR contact & phone/email"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">TAL Address Check</label>
                                    <input
                                        type="text"
                                        value={newAppForm.talAddressVal}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, talAddressVal: e.target.value })}
                                        placeholder="Address for TAL search"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Judgements on Name</label>
                                    <input
                                        type="text"
                                        value={newAppForm.judgementsVal}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, judgementsVal: e.target.value })}
                                        placeholder="e.g. Clean record"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Pets</label>
                                <input
                                    type="text"
                                    value={newAppForm.petsVal}
                                    onChange={(e) => setNewAppForm({ ...newAppForm, petsVal: e.target.value })}
                                    placeholder="e.g. 1 small dog (15 lbs)"
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Other Notes</label>
                                <textarea
                                    value={newAppForm.initialNotes}
                                    onChange={(e) => setNewAppForm({ ...newAppForm, initialNotes: e.target.value })}
                                    rows={2}
                                    placeholder="Any initial reviewer notes..."
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2">
                                    Create & Review
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable Checklist Item Row with Check-off Checkbox & Notes field
const ReviewChecklistItem = ({
    title,
    value,
    isVerified,
    onToggleCheck,
    notes,
    onNotesChange,
    icon: Icon,
    placeholder
}) => {
    return (
        <div
            className={clsx(
                "p-4 rounded-xl border transition-all duration-200",
                isVerified
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Title & Value */}
                <div className="flex items-start gap-3">
                    <div
                        className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            isVerified ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        )}
                    >
                        {Icon && <Icon size={16} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900">{title}</span>
                            {isVerified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                                    <Check size={10} /> Verified
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-medium text-zinc-600 mt-0.5">{value || 'Not provided'}</p>
                    </div>
                </div>

                {/* Check-off Button */}
                <button
                    type="button"
                    onClick={onToggleCheck}
                    className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shrink-0 cursor-pointer",
                        isVerified
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs hover:bg-emerald-700"
                            : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400"
                    )}
                >
                    <div
                        className={clsx(
                            "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors",
                            isVerified ? "border-white bg-emerald-600 text-white" : "border-zinc-400 bg-white"
                        )}
                    >
                        {isVerified && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span>{isVerified ? "Checked Off" : "Check Off"}</span>
                </button>
            </div>

            {/* Notes Field */}
            <div className="mt-3 pt-3 border-t border-zinc-200/60 flex items-start gap-2">
                <span className="text-[11px] font-bold text-zinc-500 mt-1 shrink-0">Notes:</span>
                <input
                    type="text"
                    value={notes || ''}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder={placeholder || "Write reviewer notes here..."}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-md focus:outline-hidden focus:border-blue-500 text-zinc-800 placeholder-zinc-400"
                />
            </div>
        </div>
    );
};

export default RentalApplications;
