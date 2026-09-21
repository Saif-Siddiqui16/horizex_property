import React from 'react';

import { Card } from '../components/Card';

import { useState, useEffect } from 'react';
import api from '../api/client';
import { Calendar, Home, Building2 } from 'lucide-react';


export const VacancyDashboard = () => {
const [__forceUpdate, __setForceUpdate] = useState(0);
  useEffect(() => {
    const handleUpdate = () => __setForceUpdate(p => p + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    vacant: 0,
    occupied: 0,
    totalVacantBedrooms: 0,
    fullUnitCount: 0,
    bedroomWiseCount: 0,
    vacancyByBuilding: [],
    willBeVacant: 0,
    upcomingVacancies: []
  });

  const fetchStats = async (ownerId = '') => {
    try {
      setLoading(true);
      const url = ownerId ? `/api/admin/analytics/vacancy?ownerId=${ownerId}` : '/api/admin/analytics/vacancy';
      const res = await api.get(url);
      setStats(res.data);
    } catch (e) {
      console.error('Vacancy Fetch Error:', e);
      setStats({
        total: 0,
        vacant: 0,
        occupied: 0,
        totalVacantBedrooms: 0,
        fullUnitCount: 0,
        bedroomWiseCount: 0,
        vacancyByBuilding: [],
        willBeVacant: 0,
        upcomingVacancies: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleCompanyChange = () => {
      fetchStats();
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('T')[0].split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
  };

  return (
    <>
      <div className="flex flex-col gap-8">

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
              <Card className="saas-card">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Units</span>
                <h2 className="text-3xl font-black mt-2 text-slate-800 leading-tight">{stats.total}</h2>
                <p className="mt-2 text-slate-500 text-xs">Across all buildings</p>
              </Card>

              <Card className="saas-card border-l-4 border-rose-500">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Currently Vacant</span>
                <h2 className="text-3xl font-black mt-2 text-rose-600 leading-tight">{stats.vacant}</h2>
                <p className="mt-2 text-slate-500 text-xs">Needs immediate attention</p>
              </Card>

              <Card className="saas-card border-l-4 border-orange-500">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Will Be Vacant</span>
                <h2 className="text-3xl font-black mt-2 text-orange-600 leading-tight">{stats.willBeVacant || 0}</h2>
                <p className="mt-2 text-slate-500 text-xs">Upcoming move-outs (next 90 days)</p>
              </Card>

              <Card className="saas-card border-l-4 border-emerald-500">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Occupied Units</span>
                <h2 className="text-3xl font-black mt-2 text-emerald-600 leading-tight">{stats.occupied}</h2>
                <p className="mt-2 text-slate-500 text-xs">Generating active revenue</p>
              </Card>
            </section>

            {/* UPCOMING VACANCIES TABLE */}
            <section>
              <div className="saas-table-container p-5 md:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                      <Calendar size={20} className="text-orange-500" /> Upcoming Vacancies
                    </h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Units whose leases expire in the next 90 days</p>
                  </div>
                  <div className="px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                      {stats.upcomingVacancies?.length || 0} Units
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="saas-table">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Tenant</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Unit</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Building</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Vacant Date</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center pr-2">Days Left</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stats.upcomingVacancies?.map((item) => (
                        <tr key={item.id} className="group transition-colors hover:bg-gray-50/50">
                          <td className="py-4 pl-2">
                            <span className="text-sm font-bold text-gray-800">{item.tenantName}</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Home size={14} className="text-slate-400" />
                              <span className="text-sm font-semibold text-gray-700">{item.unitName}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-slate-400" />
                              <span className="text-sm text-gray-500">{item.building}</span>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 italic">
                              {formatDate(item.vacantDate)}
                            </span>
                          </td>
                          <td className="py-4 text-center pr-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              item.daysLeft <= 14
                                ? 'bg-red-50 text-red-600'
                                : item.daysLeft <= 30
                                ? 'bg-orange-50 text-orange-600'
                                : 'bg-yellow-50 text-yellow-600'
                            }`}>
                              {item.daysLeft} Days
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!stats.upcomingVacancies || stats.upcomingVacancies.length === 0) && (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-gray-400 italic text-sm font-medium">
                            <Calendar size={24} className="mx-auto mb-2 text-slate-300" />
                            No upcoming vacancies in the next 90 days
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* DETAILS */}
            <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">

              {/* Vacancy by Building */}
              <Card title="Vacancy by Building">
                <ul className="p-0 list-none">
                  {stats.vacancyByBuilding.map((b, index) => (
                    <li key={index} className="flex flex-col py-4 border-b border-slate-100 last:border-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex flex-col gap-2.5">
                          <span className="font-bold text-slate-800 text-sm">{b.name}</span>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Total: <strong className="text-slate-700">{b.total}</strong></span>
                            <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Occupied: <strong className="text-slate-700">{b.occupied}</strong></span>
                            {b.hasBedroomWise && (
                              <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md font-bold text-[10px]">Bedroom-wise rental</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap sm:justify-end gap-2 shrink-0">
                          {b.vacant > 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                              {b.vacant} Unit{b.vacant > 1 ? 's' : ''} Vacant (Agent: Unassigned)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              All Units Occupied
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                  {stats.vacancyByBuilding.length === 0 && <li className="text-gray-400 italic">No buildings found for this owner</li>}
                </ul>
              </Card>

              {/* Removed Unit vs Bedroom Rental Mode per client request */}

            </section>
          </>
        )}

      </div>
    </>
  );
};
