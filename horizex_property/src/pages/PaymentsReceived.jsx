import React, { useState, useEffect, useMemo } from 'react';
import { Eye, RotateCcw, X } from 'lucide-react';
import { Button } from '../components/Button';
import api from '../api/client';
import { hasPermission } from '../utils/permissions';
import { useGetPaymentsReceivedQuery } from '../store/api/accountingApi';

const PaymentsReceived = () => {
  const [__forceUpdate, __setForceUpdate] = useState(0);
  useEffect(() => {
    const handleUpdate = () => __setForceUpdate(p => p + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  const { data: apiPayments = [], isLoading, refetch } = useGetPaymentsReceivedQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!hasPermission('Payments Received', 'view')) return null;

  useEffect(() => {
    const handleCompanyChange = () => {
      refetch();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [refetch]);

  // Helper to parse dates safely
  const parseCustomDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Normalized payments for clean UI rendering
  const payments = useMemo(() => {
    const list = Array.isArray(apiPayments) ? apiPayments : (apiPayments?.data || []);
    return list.map(p => {
      const tenantName = typeof p.tenant === 'string'
        ? p.tenant
        : (p.tenant ? `${p.tenant.firstName || ''} ${p.tenant.lastName || ''}`.trim() : (p.tenantName || 'Tenant'));

      const unitNumber = p.unit || p.invoice?.lease?.unit?.unitNumber || p.unitNumber || '-';
      const invoiceNo = p.invoice?.invoiceNumber || p.invoiceNumber || (p.id ? String(p.id).substring(0, 8).toUpperCase() : '-');
      const category = p.category || p.invoice?.category || 'RENT';
      const amount = Number(p.amount ?? p.amountPaid ?? 0);
      const method = p.method || p.paymentMethod || 'E-Transfer';
      const rawDate = p.paidAt || p.date;
      const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('en-CA') : 'Recent';
      const status = p.status || 'COMPLETED';
      const leaseType = p.type || p.leaseType || 'Full Unit Lease';

      return {
        ...p,
        displayId: invoiceNo,
        tenant: tenantName,
        unit: unitNumber,
        category,
        amount,
        method,
        date: formattedDate,
        rawDate: rawDate ? new Date(rawDate) : new Date(0),
        status,
        type: leaseType
      };
    });
  }, [apiPayments]);

  // Filtered payments logic
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const tenantStr = typeof p.tenant === 'string' ? p.tenant.toLowerCase() : '';
      const unitStr = typeof p.unit === 'string' ? p.unit.toLowerCase() : '';
      const displayIdStr = typeof p.displayId === 'string' ? p.displayId.toLowerCase() : '';
      const idStr = p.id ? String(p.id).toLowerCase() : '';
      const search = searchTerm.toLowerCase();

      const matchesSearch = tenantStr.includes(search) || 
                            unitStr.includes(search) ||
                            displayIdStr.includes(search) ||
                            idStr.includes(search);
      
      if (!matchesSearch) return false;

      // Date filtering (Midnight normalization for accurate range)
      if (startDate || endDate) {
        const pDate = p.rawDate ? new Date(p.rawDate) : parseCustomDate(p.date);
        pDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const sDate = new Date(startDate);
          sDate.setHours(0, 0, 0, 0);
          if (pDate < sDate) return false;
        }
        if (endDate) {
          const eDate = new Date(endDate);
          eDate.setHours(23, 59, 59, 999);
          if (pDate > eDate) return false;
        }
      }

      return true;
    });
  }, [payments, searchTerm, startDate, endDate]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const currentPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleRefund = async (payment) => {
    const reason = window.prompt(`Enter reason for refunding ${payment.displayId || payment.id}:`, 'Security Deposit Refund');
    if (!reason) return;

    try {
      await api.post('/api/admin/refunds', {
        type: 'Refund',
        reason: reason,
        tenantId: payment.tenantId || payment.tenant?.id,
        unitId: payment.unitId,
        amount: payment.amount,
        status: 'Completed',
        date: new Date()
      });
      alert('Refund recorded successfully');
      refetch();
    } catch (error) {
      console.error('Refund failed:', error);
      alert('Failed to record refund');
    }
  };

  return (
    <>
      <div className="p-0 pb-16">
        
        {/* FILTER BAR */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Search Tenant or Unit</label>
            <input 
              type="text" 
              placeholder="e.g. Unit 88-301 or John Doe"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">From Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">To Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {(searchTerm || startDate || endDate) && (
            <button 
              onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); setCurrentPage(1); }}
              className="mt-5 text-xs font-bold text-red-500 hover:text-red-700 underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">Invoice</th>
                  <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">Tenant</th>
                  <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">Unit</th>
                  <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">Category</th>
                  <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">Amount</th>
                  <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">Method</th>
                  <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">Date</th>
                  <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">Status</th>
                  <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-sm text-slate-400">
                      {isLoading ? 'Loading payments...' : 'No payment records found.'}
                    </td>
                  </tr>
                ) : (
                  currentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 border-b border-gray-100 text-sm text-slate-700 font-mono whitespace-nowrap">{p.displayId || p.id}</td>
                      <td className="p-4 border-b border-gray-100 text-sm text-slate-700 whitespace-nowrap font-medium">{p.tenant}</td>
                      <td className="p-4 border-b border-gray-100 text-sm text-slate-700 whitespace-nowrap">{p.unit}</td>
                      <td className="p-4 border-b border-gray-100 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          p.category === 'DEPOSIT' || p.category === 'SECURITY_DEPOSIT'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : p.category === 'SERVICE'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          { (p.category === 'DEPOSIT' || p.category === 'SECURITY_DEPOSIT') ? 'Deposit' : p.category === 'SERVICE' ? 'Service' : 'Rent'}
                        </span>
                      </td>
                      <td className="p-4 border-b border-gray-100 text-sm font-medium font-mono whitespace-nowrap">${p.amount.toLocaleString('en-CA')}</td>
                      <td className="p-4 border-b border-gray-100 text-sm text-slate-700 whitespace-nowrap">{p.method}</td>
                      <td className="p-4 border-b border-gray-100 text-sm text-slate-700 whitespace-nowrap">{p.date}</td>
                      <td className="p-4 border-b border-gray-100 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-100 whitespace-nowrap">{p.status}</span>
                      </td>
                      <td className="p-4 border-b border-gray-100 text-sm">
                        <div className="flex gap-2 whitespace-nowrap">
                          <button onClick={() => setSelectedPayment(p)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-md transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                          {hasPermission('Refunds', 'add') && (
                            <button
                              onClick={() => handleRefund(p)}
                              title="Refund"
                              className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <RotateCcw size={16} />
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
        </div>

        {/* PAGINATION UI */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${
                  currentPage === idx + 1 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100' 
                  : 'bg-white text-slate-600 border-slate-100 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* VIEW PAYMENT MODAL */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm anim-fade-in">
            <div className="bg-white p-6 rounded-xl w-[520px] shadow-2xl anim-zoom-in">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Payment Details</h3>
                <button onClick={() => setSelectedPayment(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Invoice No</label><span className="text-sm font-medium text-slate-900">{selectedPayment.displayId || selectedPayment.id}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Tenant</label><span className="text-sm font-medium text-slate-900">{selectedPayment.tenant}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Unit</label><span className="text-sm font-medium text-slate-900">{selectedPayment.unit}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Lease Type</label><span className="text-sm font-medium text-slate-900">{selectedPayment.type}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Category</label><span className="text-sm font-medium text-slate-900">{ (selectedPayment.category === 'DEPOSIT' || selectedPayment.category === 'SECURITY_DEPOSIT') ? 'Deposit' : selectedPayment.category === 'SERVICE' ? 'Service' : 'Rent'}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Payment Method</label><span className="text-sm font-medium text-slate-900">{selectedPayment.method}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Paid On</label><span className="text-sm font-medium text-slate-900">{selectedPayment.date}</span></div>

                <div className="col-span-2 mt-2 p-4 rounded-lg bg-emerald-50 text-center text-xl font-bold text-emerald-800 border border-emerald-100">
                  ${selectedPayment.amount.toLocaleString('en-CA')}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setSelectedPayment(null)}>
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const res = await api.get(`/api/admin/payments/${selectedPayment.id}/download`, { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([res.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `receipt-${selectedPayment.displayId || selectedPayment.id}.pdf`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } catch (e) { alert('Download receipt feature is processing.'); }
                  }}
                >
                  Download Receipt
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default PaymentsReceived;