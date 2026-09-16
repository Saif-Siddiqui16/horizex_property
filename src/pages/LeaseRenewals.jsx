import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Search, Eye, Filter, Calendar as CalendarIcon, ClipboardList, Send, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockRenewalService } from '../mock/mockServices';
import { RENEWAL_STATUSES } from '../mock/renewals';
import { RenewalKPICards } from '../components/renewals/RenewalKPICards';
import { RenewalStatusChart } from '../components/renewals/RenewalStatusChart';
import { RecentRenewalsWidget } from '../components/renewals/RecentRenewalsWidget';
import { RenewalCalendarWidget } from '../components/renewals/RenewalCalendarWidget';
import { UpcomingRenewalsWidget } from '../components/renewals/UpcomingRenewalsWidget';
import api from '../api/client';

export const LeaseRenewals = () => {
  const navigate = useNavigate();
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [sortBy, setSortBy] = useState('leaseEnd');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const res = await mockRenewalService.getAll();
      setRenewals(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const res = await api.get('/api/admin/properties');
      setBuildings(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRenewals();
    fetchBuildings();
  }, []);

  useEffect(() => {
    const handleCompanyChange = () => {
      fetchRenewals();
      fetchBuildings();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  // Filter & Sort Logic
  const filteredRenewals = renewals.filter(ren => {
    const matchesSearch = 
      (ren.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (ren.unitNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchesBuilding = !selectedBuilding || ren.propertyId === parseInt(selectedBuilding);
    const matchesStatus = !selectedStatus || ren.status === selectedStatus;
    return matchesSearch && matchesBuilding && matchesStatus;
  });

  const sortedRenewals = [...filteredRenewals].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'leaseEnd') {
      comparison = new Date(a.leaseEnd).getTime() - new Date(b.leaseEnd).getTime();
    } else if (sortBy === 'renewalDate') {
      comparison = new Date(a.renewalDueDate).getTime() - new Date(b.renewalDueDate).getTime();
    } else if (sortBy === 'building') {
      comparison = (a.propertyName || '').localeCompare(b.propertyName || '');
    } else if (sortBy === 'tenant') {
      comparison = (a.tenantName || '').localeCompare(b.tenantName || '');
    } else if (sortBy === 'company') {
      comparison = (a.companyName || '').localeCompare(b.companyName || '');
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSendNotice = async (id) => {
    if (window.confirm('Send Lease Renewal Notice to Tenant?')) {
      await mockRenewalService.sendNotice(id);
      alert('Renewal notice sent successfully!');
      fetchRenewals();
    }
  };

  return (
    <MainLayout title="Lease Renewals Management">
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        
        {/* Toggle Mode & Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-4 rounded-[22px] border border-slate-200 shadow-sm gap-3">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('list')}
              className="text-xs font-bold flex-1 sm:flex-none justify-center"
            >
              <ClipboardList size={16} className="mr-1.5" />
              Table List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('calendar')}
              className="text-xs font-bold flex-1 sm:flex-none justify-center"
            >
              <CalendarIcon size={16} className="mr-1.5" />
              Expiry Calendar
            </Button>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="leaseEnd">Lease End Date</option>
              <option value="renewalDate">Renewal Due Date</option>
              <option value="building">Building</option>
              <option value="tenant">Tenant</option>
              <option value="company">Company</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-100 transition-colors"
            >
              {sortOrder === 'asc' ? 'ASC ▲' : 'DESC ▼'}
            </button>
          </div>
        </div>

        {/* KPI Summaries */}
        <RenewalKPICards renewals={renewals} />

        {/* Filters Panel */}
        <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search tenant or unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
            />
          </div>

          <div>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
            >
              <option value="">All Buildings</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
            >
              <option value="">All Statuses</option>
              {Object.keys(RENEWAL_STATUSES).map(k => (
                <option key={k} value={RENEWAL_STATUSES[k].label}>{RENEWAL_STATUSES[k].label}</option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            onClick={() => { setSearch(''); setSelectedBuilding(''); setSelectedStatus(''); }}
            className="w-full text-xs font-bold rounded-2xl h-11"
          >
            Reset Filters
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Renewals Table */}
                <div className="lg:col-span-2 bg-white rounded-[22px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] max-h-[600px]">
                  <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Company</th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Building</th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Unit</th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tenant</th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Lease Expiry</th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Notice</th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedRenewals.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">No lease renewals found matching criteria.</td>
                          </tr>
                        ) : (
                          sortedRenewals.map(ren => {
                            const statusConfig = RENEWAL_STATUSES[ren.status.toUpperCase().replace(' ', '_')] || RENEWAL_STATUSES.DRAFT;
                            return (
                              <tr key={ren.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 text-xs font-bold text-slate-700">{ren.companyName}</td>
                                <td className="px-5 py-4 text-xs font-semibold text-slate-600">{ren.propertyName}</td>
                                <td className="px-5 py-4 text-xs font-bold text-slate-900">{ren.unitNumber}</td>
                                <td className="px-5 py-4 text-xs font-bold text-slate-800">{ren.tenantName}</td>
                                <td className="px-5 py-4 text-xs text-slate-600 font-mono font-bold">{ren.leaseEnd}</td>
                                <td className="px-5 py-4 text-center">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusConfig.color}`}>
                                    {statusConfig.label}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-center">
                                  {ren.noticeSent ? (
                                    <span className="text-[10px] font-black uppercase text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">Sent</span>
                                  ) : (
                                    <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">Pending</span>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-right pr-6">
                                  <div className="flex gap-2 justify-end">
                                    {!ren.noticeSent && (
                                      <button
                                        onClick={() => handleSendNotice(ren.id)}
                                        className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all"
                                        title="Send Notice Email"
                                      >
                                        <Send size={14} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => navigate(`/leases/renewals/${ren.id}`)}
                                      className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                      title="View Details"
                                    >
                                      <Eye size={14} />
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
                </div>

                {/* Sidebar widgets */}
                <div className="flex flex-col gap-6">
                  <RenewalStatusChart renewals={filteredRenewals} />
                  <RecentRenewalsWidget renewals={renewals} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RenewalCalendarWidget renewals={renewals} />
                </div>
                <div className="flex flex-col gap-6">
                  <UpcomingRenewalsWidget renewals={renewals} />
                  <RecentRenewalsWidget renewals={renewals} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};
