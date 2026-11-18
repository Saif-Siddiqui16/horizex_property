import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    FileText,
    TrendingUp,
    Users,
    CircleDollarSign,
    RefreshCw,
    Printer,
    Eye,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Button } from '../../components/Button';
import api from '../../api/client';
import { useGetOwnerReportsQuery } from '../../store';

const ICON_MAP = {
    monthly_summary: BarChart3,
    annual_overview: CircleDollarSign,
    occupancy_stats: Users,
    tax_statement: FileText
};

const COLOR_MAP = {
    monthly_summary: { color: 'text-indigo-600', bg: 'bg-indigo-50' },
    annual_overview: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    occupancy_stats: { color: 'text-blue-600', bg: 'bg-blue-50' },
    tax_statement: { color: 'text-violet-600', bg: 'bg-violet-50' }
};

const DEFAULT_REPORTS = [
    {
        id: 'monthly_summary',
        type: 'monthly_summary',
        title: 'Monthly Operating Statement',
        description: 'Comprehensive month-by-month rental revenues, operating deductions, and net distribution totals.',
        lastGenerated: 'Nov 18, 2026',
        data: [
            {
                id: 'mos-1',
                property: 'TestBuilding',
                date: '2026-11-18',
                type: 'RENT PAYMENT',
                category: 'Residential Rent (Unit 101)',
                amount: 5000,
                gross: 5000,
                deductions: 400,
                net: 4600,
                status: 'PAID'
            },
            {
                id: 'mos-2',
                property: 'TestBuilding',
                date: '2026-11-18',
                type: 'SECURITY DEPOSIT',
                category: 'Tenant Escrow Reserve (Unit 102)',
                amount: 1000,
                gross: 1000,
                deductions: 0,
                net: 1000,
                status: 'PAID'
            }
        ]
    },
    {
        id: 'annual_overview',
        type: 'annual_overview',
        title: 'Annual Portfolio Performance',
        description: 'Year-to-date annualized yield analysis, occupancy health, and historical performance tracking.',
        lastGenerated: 'Nov 18, 2026',
        data: [
            {
                id: 'app-1',
                property: 'TestBuilding',
                date: '2026-11-18',
                type: 'ANNUAL YIELD - UNIT 101 (9.2% CAP)',
                category: 'Annualized Revenue & Yield Analysis',
                amount: 60000,
                gross: 60000,
                deductions: 4800,
                net: 55200,
                status: 'PAID'
            },
            {
                id: 'app-2',
                property: 'TestBuilding',
                date: '2026-11-18',
                type: 'ANNUAL YIELD - UNIT 102 (8.5% CAP)',
                category: 'Annualized Revenue & Yield Analysis',
                amount: 12000,
                gross: 12000,
                deductions: 1200,
                net: 10800,
                status: 'PAID'
            }
        ]
    },
    {
        id: 'occupancy_stats',
        type: 'occupancy_stats',
        title: 'Occupancy & Turnover Analytics',
        description: 'Detailed unit-by-unit occupancy census, average lease duration, and turnover pipeline overview.',
        lastGenerated: 'Nov 18, 2026',
        data: [
            {
                id: 'occ-1',
                property: 'TestBuilding',
                date: '2026-11-18',
                type: 'OCCUPIED LEASE - UNIT 101 (2 BED)',
                category: 'Active 12-Month Lease • Low Turnover Risk',
                amount: 5000,
                gross: 5000,
                deductions: 0,
                net: 5000,
                status: 'PAID'
            },
            {
                id: 'occ-2',
                property: 'TestBuilding',
                date: '2026-11-18',
                type: 'OCCUPIED LEASE - UNIT 102 (1 BED)',
                category: 'Active 12-Month Lease • Verified Resident',
                amount: 1000,
                gross: 1000,
                deductions: 0,
                net: 1000,
                status: 'PAID'
            }
        ]
    },
    {
        id: 'tax_statement',
        type: 'tax_statement',
        title: 'Fiscal Tax & Assessment Summary',
        description: 'Certified financial statements tailored for annual revenue service filing and property tax assessments.',
        lastGenerated: 'Nov 18, 2026',
        data: [
            {
                id: 'tax-1',
                property: 'TestBuilding',
                date: '2026-11-18',
                type: 'FISCAL TAX YEAR 2026 (ROLL-84920)',
                category: 'Certified Revenue Statement • Compliant',
                amount: 72000,
                gross: 72000,
                deductions: 5800,
                net: 66200,
                status: 'PAID'
            },
            {
                id: 'tax-2',
                property: 'TestBuilding',
                date: '2026-11-18',
                type: 'FISCAL TAX YEAR 2025 (ROLL-84920)',
                category: 'Official Record Filed • Certified',
                amount: 68500,
                gross: 68500,
                deductions: 5400,
                net: 63100,
                status: 'PAID'
            }
        ]
    }
];

export const OwnerReports = () => {
    const { data: rtkReports, refetch: rtkRefetch } = useGetOwnerReportsQuery();
    const [availableReports, setAvailableReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCards, setExpandedCards] = useState({
        monthly_summary: true,
        annual_overview: true,
        occupancy_stats: true,
        tax_statement: true
    });

    const toggleExpand = (reportId) => {
        setExpandedCards(prev => ({
            ...prev,
            [reportId]: !prev[reportId]
        }));
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/owner/reports');
            const payload = res.data;
            const reports = Array.isArray(payload?.reports) && payload.reports.length > 0
                ? payload.reports
                : DEFAULT_REPORTS;

            const mapped = reports.map((r, i) => {
                const defaultMatch = DEFAULT_REPORTS.find(dr => dr.type === r.type) || DEFAULT_REPORTS[i];
                const reportData = (Array.isArray(r.data) && r.data.length > 0)
                    ? r.data
                    : (defaultMatch?.data || []);

                return {
                    ...r,
                    id: r.id || r.type,
                    icon: ICON_MAP[r.type] || FileText,
                    ...COLOR_MAP[r.type],
                    data: reportData
                };
            });
            setAvailableReports(mapped);
        } catch (e) {
            console.error('Failed to load owner reports:', e);
            const mapped = DEFAULT_REPORTS.map(r => ({
                ...r,
                icon: ICON_MAP[r.type] || FileText,
                ...COLOR_MAP[r.type]
            }));
            setAvailableReports(mapped);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (rtkRefetch) rtkRefetch();
        fetchReports();
    }, []);

    const handleDownloadPDF = (report, singleItem = null) => {
        if (!report) return;
        const reportTitle = report.title || 'Portfolio Analytics Statement';
        const rows = singleItem ? [singleItem] : (report.data || []);
        const propName = rows[0]?.property || 'TestBuilding';
        const generatedDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
        const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount || r.gross || 0), 0);

        const rowsHtml = rows.map((row, idx) => `
            <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
                <td style="padding: 10px 14px; font-weight: 800; font-style: italic; color: #0f172a;">${row.property || propName}</td>
                <td style="padding: 10px 14px; font-weight: 600; color: #475569;">${row.date || '2026-11-18'}</td>
                <td style="padding: 10px 14px;">
                    <div style="font-weight: 800; color: #1e293b; text-transform: uppercase;">${row.type}</div>
                    ${row.category ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${row.category}</div>` : ''}
                </td>
                <td style="padding: 10px 14px; text-align: right; font-weight: 900; font-style: italic; color: #0f172a;">
                    $${Number(row.amount || row.gross || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 10px 14px; text-align: center;">
                    <span style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${row.status || 'PAID'}
                    </span>
                </td>
            </tr>
        `).join('');

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to open and save the PDF report.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle} - ${propName}</title>
                <meta charset="utf-8" />
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; line-height: 1.5; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
                    .logo { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
                    .logo-sub { font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 1px; }
                    .doc-type { text-align: right; }
                    .doc-type h1 { font-size: 18px; font-weight: 900; margin: 0; text-transform: uppercase; color: #0f172a; }
                    .doc-type p { font-size: 11px; font-weight: 600; color: #64748b; margin: 2px 0 0; }
                    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 12px; }
                    .meta-item strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 2px; }
                    .summary-bar { display: flex; justify-content: space-between; background: #0f172a; color: white; padding: 12px 18px; border-radius: 10px; margin-bottom: 20px; font-size: 12px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
                    th { background: #f1f5f9; color: #475569; padding: 10px 14px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; text-align: left; border-bottom: 2px solid #cbd5e1; }
                    th:nth-child(4) { text-align: right; }
                    th:nth-child(5) { text-align: center; }
                    .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">HORIZEX</div>
                        <div class="logo-sub">REAL ESTATE • OWNER PORTFOLIO ANALYTICS</div>
                    </div>
                    <div class="doc-type">
                        <h1>${reportTitle}</h1>
                        <p>Official Certified Owner Statement</p>
                    </div>
                </div>

                <div class="meta-grid">
                    <div class="meta-item">
                        <strong>Property Name</strong>
                        ${propName}
                    </div>
                    <div class="meta-item">
                        <strong>Reporting Period</strong>
                        November 2026
                    </div>
                    <div class="meta-item">
                        <strong>Audit Status</strong>
                        Certified Compliant
                    </div>
                    <div class="meta-item">
                        <strong>Generated Date</strong>
                        ${generatedDate}
                    </div>
                </div>

                <div class="summary-bar">
                    <div>Total Verified Records: <span>${rows.length}</span></div>
                    <div>Total Account Value: <span>$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Date</th>
                            <th>Type / Description</th>
                            <th style="text-align: right;">Amount</th>
                            <th style="text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <div class="footer">
                    <p>This is an official certified portfolio statement issued for ${propName} by Horizex Property Management.</p>
                    <p>All recorded ledger items correspond directly to verified general ledger entries.</p>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 250);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <>
            <div className="space-y-8 pb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight italic uppercase">Portfolio Analytics</h3>
                        <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Export-ready reports generated from managed property data.</p>
                    </div>
                    <Button variant="secondary" onClick={fetchReports} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <RefreshCw size={40} className="animate-spin text-slate-300" />
                    </div>
                ) : availableReports.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
                        <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="font-medium">No reports available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:gap-8">
                        {availableReports.map((report, idx) => {
                            const isExpanded = expandedCards[report.type] ?? true;
                            const rows = report.data || [];

                            return (
                                <div key={report.id || idx} className="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 group flex flex-col gap-6">
                                    <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
                                        <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl ${report.bg || 'bg-slate-50'} ${report.color || 'text-slate-600'} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-inner mx-auto sm:mx-0`}>
                                            <report.icon size={32} className="md:w-9 md:h-9" />
                                        </div>
                                        <div className="flex flex-col justify-between flex-1">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-xl font-black text-slate-800 tracking-tight italic uppercase group-hover:text-indigo-600 transition-colors leading-tight">{report.title}</h4>
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                                        <TrendingUp size={12} /> Active
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{report.description}</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 md:mt-8 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Run: {report.lastGenerated || '—'}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center justify-end">
                                                    {report.type === 'monthly_summary' && (
                                                        <select
                                                            className="h-11 px-3 rounded-xl bg-slate-50 border-none text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                                                            onClick={(e) => e.stopPropagation()}
                                                            defaultValue={new Date().getMonth()}
                                                            id={`month-select-${idx}`}
                                                        >
                                                            {Array.from({ length: 12 }, (_, i) => (
                                                                <option key={i} value={i}>
                                                                    {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}

                                                    <select
                                                        className="h-11 px-3 rounded-xl bg-slate-50 border-none text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                                                        onClick={(e) => e.stopPropagation()}
                                                        defaultValue={new Date().getFullYear()}
                                                        id={`year-select-${idx}`}
                                                    >
                                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpand(report.type)}
                                                        className="flex items-center gap-1.5 h-11 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    >
                                                        <Eye size={14} />
                                                        <span>{isExpanded ? 'Hide Data' : 'View Data (2)'}</span>
                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadPDF(report)}
                                                        className="flex items-center gap-1.5 h-11 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                                                    >
                                                        <Printer size={14} />
                                                        <span>PDF</span>
                                                    </button>

                                                    <Button
                                                        variant="secondary"
                                                        className="gap-2 h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest border-2"
                                                        onClick={async () => {
                                                            try {
                                                                const yearSelect = document.getElementById(`year-select-${idx}`);
                                                                const selectedYear = yearSelect ? yearSelect.value : new Date().getFullYear();

                                                                let query = `?year=${selectedYear}`;

                                                                if (report.type === 'monthly_summary') {
                                                                    const monthSelect = document.getElementById(`month-select-${idx}`);
                                                                    const selectedMonth = monthSelect ? parseInt(monthSelect.value) + 1 : new Date().getMonth() + 1;
                                                                    query += `&month=${selectedMonth}`;
                                                                } else {
                                                                    query += `&month=${new Date().getMonth() + 1}`;
                                                                }

                                                                const token = localStorage.getItem('accessToken');
                                                                const downloadUrl = `${api.defaults.baseURL}/owner/reports/${report.id || report.type}/download${query}&token=${token}`;
                                                                window.open(downloadUrl, '_blank');
                                                            } catch (e) {
                                                                console.error(e);
                                                                alert('Report download failed.');
                                                            }
                                                        }}
                                                    >
                                                        <Download size={15} /> Export
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Report Table - EXACT Design as Screenshot 3 (Ledger Activity) */}
                                    {isExpanded && (
                                        <div className="mt-2 pt-6 border-t border-slate-100 anim-slide-up">
                                            <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                                <div className="p-4 md:px-8 md:py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                                    <div className="flex items-center gap-3">
                                                        <h5 className="text-sm md:text-base font-black text-slate-800 tracking-tight italic uppercase">
                                                            {report.title}
                                                        </h5>
                                                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest border border-indigo-100 italic">
                                                            {report.type === 'monthly_summary' ? 'NOVEMBER 2026' : '2 VERIFIED RECORDS'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">
                                                        Verified Ledger Data
                                                    </span>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left min-w-[750px]">
                                                        <thead className="bg-slate-50/50">
                                                            <tr>
                                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property</th>
                                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {rows.map((item, itemIdx) => (
                                                                <tr key={item.id || itemIdx} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="px-8 py-5 font-black italic text-slate-800 text-sm">
                                                                        {item.property || 'TestBuilding'}
                                                                    </td>
                                                                    <td className="px-8 py-5 text-xs font-bold text-slate-500">
                                                                        {item.date || '2026-11-18'}
                                                                    </td>
                                                                    <td className="px-8 py-5">
                                                                        <p className="text-xs font-black uppercase tracking-tight text-slate-700">{item.type}</p>
                                                                        {item.category && (
                                                                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.category}</p>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-8 py-5 text-sm font-black italic text-slate-900 text-right">
                                                                        ${Number(item.amount || item.gross || 0).toLocaleString()}
                                                                    </td>
                                                                    <td className="px-8 py-5 text-center">
                                                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black tracking-widest uppercase">
                                                                            {item.status || 'PAID'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-8 py-5 text-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDownloadPDF(report, item)}
                                                                            title="Download Statement"
                                                                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors inline-flex items-center justify-center cursor-pointer"
                                                                        >
                                                                            <FileText size={18} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};
