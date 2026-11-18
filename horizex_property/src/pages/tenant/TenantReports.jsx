import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTenantReportsQuery } from '../../store';
import {
    FileText,
    CreditCard,
    Download,
    RefreshCw,
    Receipt,
    FileBarChart,
    Calendar,
    Eye,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/Button';

const ICON_MAP = {
    payment_history: CreditCard,
    invoice_summary: Receipt
};

const COLOR_MAP = {
    payment_history: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    invoice_summary: { color: 'text-indigo-600', bg: 'bg-indigo-50' }
};

const DEFAULT_REPORTS = [
    {
        id: 'rep-payment-history',
        type: 'payment_history',
        title: 'Payment History Statement',
        description: 'Official record of all rental payments received and processed',
        lastGenerated: new Date().toLocaleDateString('en-CA'),
        data: []
    },
    {
        id: 'rep-invoice-summary',
        type: 'invoice_summary',
        title: 'Rent Invoices & Charges',
        description: 'Summary of all monthly rent charges, utility allocations and fees',
        lastGenerated: new Date().toLocaleDateString('en-CA'),
        data: []
    }
];

export const TenantReports = () => {
    const navigate = useNavigate();
    const { data, isLoading, isFetching, error: queryError, refetch } = useGetTenantReportsQuery();
    const [selectedReport, setSelectedReport] = useState(null);

    const rawList = Array.isArray(data?.reports) ? data.reports : (Array.isArray(data) ? data : []);
    const list = rawList.length > 0 ? rawList : DEFAULT_REPORTS;
    const reports = list.map(r => ({
        ...r,
        id: r.id || r.type,
        icon: ICON_MAP[r.type] || FileBarChart,
        ...COLOR_MAP[r.type]
    }));
    const stats = data?.stats || null;
    const loading = isLoading || isFetching;
    const error = queryError ? (queryError.data?.message || queryError.error || 'Failed to load reports.') : '';

    const statsRows = [
        { label: 'Reports Available', value: (stats?.reportsViewable && stats.reportsViewable > 0) ? stats.reportsViewable : reports.length, sub: stats?.reportsViewableSub || 'Real-time' },
        { label: 'Paid (Total)', value: stats?.paidAmount != null ? `$${Number(stats.paidAmount).toLocaleString()}` : '$0', sub: `${stats?.paidCount ?? 0} payments` },
        { label: 'Outstanding', value: stats?.outstandingAmount != null ? `$${Number(stats.outstandingAmount).toLocaleString()}` : '$0', sub: stats?.dataLatency || 'Real-time' }
    ];

    const handleDownloadPDF = (report) => {
        if (!report) return;
        const isPayment = report.type === 'payment_history';
        const reportTitle = report.title || (isPayment ? 'Payment History Statement' : 'Rent Invoices & Charges');
        const tenantName = data?.tenantInfo?.name || 'Tenant Statement';
        const propertyName = data?.tenantInfo?.propertyName || 'Horizex Real Estate';
        const unitNumber = data?.tenantInfo?.unitNumber ? `Unit ${data.tenantInfo.unitNumber}` : '';
        const generatedDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

        const rows = report.data || [];
        const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const totalBalance = rows.reduce((sum, r) => sum + Number(r.balance || 0), 0);

        const rowsHtml = rows.length === 0
            ? `<tr><td colspan="4" style="text-align: center; padding: 24px; color: #94a3b8; font-style: italic;">No recorded transactions found for this account.</td></tr>`
            : rows.map((row, idx) => {
                const dateStr = new Date(row.date).toLocaleDateString('en-CA');
                const col2 = isPayment ? (row.invoiceNo || '—') : (row.month || '—');
                const col3 = isPayment ? (row.method || 'Online') : (row.status || '—');
                const amountStr = `$${Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                const balanceStr = !isPayment && row.balance > 0 
                    ? `<div style="font-size:10px;color:#dc2626;font-weight:bold;margin-top:2px;">Due: $${Number(row.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>` 
                    : '';

                return `
                    <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
                        <td style="padding: 10px 14px; font-weight: 600; color: #334155;">${dateStr}</td>
                        <td style="padding: 10px 14px; font-weight: 700; color: #1e293b;">${col2}</td>
                        <td style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569;">${col3}</td>
                        <td style="padding: 10px 14px; text-align: right; font-weight: 800; color: #0f172a;">
                            ${amountStr}
                            ${balanceStr}
                        </td>
                    </tr>
                `;
            }).join('');

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to open and save the PDF report.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle} - ${tenantName}</title>
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
                    .summary-bar { display: flex; justify-content: space-between; background: #0f172a; color: white; padding: 12px 18px; border-radius: 10px; margin-bottom: 20px; }
                    .summary-bar div { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .summary-bar span { font-size: 15px; font-weight: 900; margin-left: 6px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
                    th { background: #f1f5f9; color: #475569; padding: 10px 14px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; text-align: left; border-bottom: 2px solid #cbd5e1; }
                    th:last-child { text-align: right; }
                    .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b; text-align: center; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">HORIZEX</div>
                        <div class="logo-sub">REAL ESTATE MANAGEMENT</div>
                    </div>
                    <div class="doc-type">
                        <h1>${reportTitle}</h1>
                        <p>Official Account Statement</p>
                    </div>
                </div>

                <div class="meta-grid">
                    <div class="meta-item">
                        <strong>Tenant Name</strong>
                        ${tenantName}
                    </div>
                    <div class="meta-item">
                        <strong>Property / Unit</strong>
                        ${propertyName} ${unitNumber ? `• ${unitNumber}` : ''}
                    </div>
                    <div class="meta-item">
                        <strong>Statement Type</strong>
                        ${isPayment ? 'Payment Receipts' : 'Monthly Invoices'}
                    </div>
                    <div class="meta-item">
                        <strong>Generated Date</strong>
                        ${generatedDate}
                    </div>
                </div>

                <div class="summary-bar">
                    <div>Total Records: <span>${rows.length}</span></div>
                    <div>Total Billed / Processed: <span>$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                    ${!isPayment ? `<div>Total Balance Due: <span style="color:#f87171;">$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>` : ''}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>${isPayment ? 'Invoice / Ref #' : 'Billing Month'}</th>
                            <th>${isPayment ? 'Payment Method' : 'Status'}</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <div class="footer">
                    <p>This is an official computer-generated account statement issued by Horizex Property Management.</p>
                    <p>All recorded payments are verified against the bank statement and general ledger.</p>
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

    const renderReportTable = () => {
        if (!selectedReport) return null;

        const isPayment = selectedReport.type === 'payment_history';

        return (
            <div className="space-y-6 anim-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                        onClick={() => setSelectedReport(null)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-slate-600 font-bold tracking-wider text-xs hover:text-slate-900 hover:shadow-md transition-all group w-fit cursor-pointer"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Reports
                    </button>

                    <button
                        onClick={() => handleDownloadPDF(selectedReport)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-2xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95 w-fit cursor-pointer"
                    >
                        <Download size={16} />
                        Download PDF Statement
                    </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight uppercase italic">{selectedReport.title}</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">{selectedReport.description}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{isPayment ? 'Invoice / Ref #' : 'Month'}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{isPayment ? 'Method' : 'Status'}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(!selectedReport.data || selectedReport.data.length === 0) ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">
                                            No recorded transactions found for this statement.
                                        </td>
                                    </tr>
                                ) : (
                                    selectedReport.data.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-700">{new Date(row.date).toLocaleDateString('en-CA')}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                        {isPayment ? <Receipt size={14} /> : <Calendar size={14} />}
                                                    </div>
                                                    <span className="font-black text-slate-700 uppercase tracking-tight">{isPayment ? row.invoiceNo : row.month}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {isPayment ? (
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                                                        {row.method}
                                                    </span>
                                                ) : (
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border
                                                        ${row.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            row.status === 'Partial' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                'bg-red-50 text-red-600 border-red-100'}`}>
                                                        {row.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="text-lg font-black text-slate-800 tracking-tighter italic">
                                                    ${row.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                {!isPayment && row.balance > 0 && (
                                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Due: ${row.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="space-y-8 pb-12">
                {!selectedReport && (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight italic uppercase">Account Reports</h3>
                                <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Your invoice and payment history at a glance.</p>
                            </div>
                            <Button variant="secondary" onClick={() => refetch()} disabled={loading}>
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </Button>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {statsRows.map((s, i) => (
                                <div key={i} className="bg-white px-6 py-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                    <p className="text-2xl font-black text-slate-800 italic tracking-tight leading-none">{s.value}</p>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mt-2">{s.sub}</p>
                                </div>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <RefreshCw size={40} className="animate-spin text-slate-300" />
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
                                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="font-medium">No reports available.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {reports.map((report, idx) => (
                                    <div key={report.id || idx} className="bg-white rounded-[32px] p-7 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/30 hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
                                        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
                                            <div className={`w-16 h-16 shrink-0 rounded-2xl ${report.bg || 'bg-slate-50'} ${report.color || 'text-slate-600'} flex items-center justify-center mx-auto sm:mx-0 shadow-lg shadow-current/10`}>
                                                <report.icon size={32} />
                                            </div>
                                            <div className="flex-1 text-center sm:text-left">
                                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">{report.title}</h4>
                                                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">{report.description}</p>
                                                <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                        Last Activity: {report.lastGenerated || '—'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                                        {report.data?.length || 0} Records
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                                            <Button
                                                variant="primary"
                                                className="flex-1 h-12 rounded-2xl font-black italic shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer"
                                                onClick={() => setSelectedReport(report)}
                                            >
                                                <Eye size={16} /> View Statement
                                            </Button>

                                            <button
                                                onClick={() => handleDownloadPDF(report)}
                                                className="px-5 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200/80 active:scale-95 cursor-pointer"
                                            >
                                                <Download size={16} />
                                                <span>Download PDF</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {selectedReport && renderReportTable()}

                <div className="bg-slate-900 rounded-[32px] p-8 text-white border border-slate-800 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <p className="relative z-10 font-bold opacity-80">For detailed invoices and payment history, use <span className="text-primary-400">My Invoices</span> and <span className="text-primary-400">Pay Rent</span> from the menu.</p>
                </div>
            </div>
        </>
    );
};
