import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button } from '../components/Button';
import { 
  Car, 
  Search, 
  Plus, 
  Trash2, 
  Pencil, 
  AlertCircle, 
  CheckCircle, 
  Building2, 
  User, 
  MapPin, 
  X, 
  Eye, 
  Phone 
} from 'lucide-react';
import { VehicleForm } from './VehicleForm';
import { hasPermission } from '../utils/permissions';
import { useGetVehiclesQuery, useDeleteVehicleMutation } from '../store/api/tenantsApi';
import clsx from 'clsx';

export const Vehicles = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get('filter');

  const effectiveCompanyId = useSelector((state) => state.auth?.effectiveCompanyId) || localStorage.getItem('global_selected_company_id') || '';
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState(() => {
    return localStorage.getItem('global_selected_building_id') || '';
  });
  const [statusFilter, setStatusFilter] = useState(initialFilter || '');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [page, setPage] = useState(1);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setForceUpdate(prev => prev + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  // Synchronize building filter with Topbar header building selection
  useEffect(() => {
    const handleHeaderSync = () => {
      const globalBuilding = localStorage.getItem('global_selected_building_id') || '';
      setBuildingFilter(globalBuilding);
      setPage(1);
    };
    window.addEventListener('buildingChanged', handleHeaderSync);
    window.addEventListener('companyChanged', handleHeaderSync);
    return () => {
      window.removeEventListener('buildingChanged', handleHeaderSync);
      window.removeEventListener('companyChanged', handleHeaderSync);
    };
  }, []);

  // RTK Query hooks
  const vehicleQueryParams = useMemo(() => {
    const p = {};
    if (effectiveCompanyId && effectiveCompanyId !== 'all') p.companyId = effectiveCompanyId;
    if (buildingFilter && buildingFilter !== 'all') p.buildingId = buildingFilter;
    if (search) p.search = search;
    if (statusFilter) p.unauthorizedOnly = statusFilter;
    p.page = page;
    p.limit = 10;
    return p;
  }, [effectiveCompanyId, search, buildingFilter, statusFilter, page]);

  const { data: rawVehicles = [], isLoading: loading } = useGetVehiclesQuery(vehicleQueryParams);

  const [deleteVehicle] = useDeleteVehicleMutation();

  const vehicles = Array.isArray(rawVehicles) ? rawVehicles : [];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this vehicle record?')) {
      try {
        await deleteVehicle(id).unwrap();
      } catch (e) {
        alert('Failed to delete vehicle');
      }
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        
        {/* TOP BAR / FILTERS */}
        <section className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all w-full xl:w-auto xl:min-w-[320px]">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search plate, brand, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 w-full text-sm font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">


            <div className="flex items-center gap-2 bg-slate-50 py-2.5 px-3.5 rounded-xl border border-slate-200 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-slate-700 font-medium cursor-pointer w-full sm:min-w-[150px]"
              >
                <option value="">All Statuses</option>
                <option value="false">Authorized Only</option>
                <option value="true">Unauthorized Only</option>
              </select>
            </div>

            {hasPermission('Vehicles', 'add') && (
              <Button 
                onClick={() => { setEditingVehicle(null); setShowForm(true); }}
                className="rounded-xl flex items-center justify-center gap-2 h-11 px-5 shadow-lg shadow-indigo-100 font-bold whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Register Vehicle</span>
              </Button>
            )}
          </div>
        </section>

        {/* VEHICLE LIST */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-slate-500 font-medium italic">{t('vehicle.loading')}</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                <Car size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">No Vehicles Found</h3>
                <p className="text-slate-500 mt-1 max-w-xs">No vehicle records match your current filters or none have been registered yet.</p>
              </div>
              <Button variant="secondary" onClick={() => { setSearch(''); setBuildingFilter(''); setStatusFilter(''); setPage(1); }}>Clear Filters</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('vehicle.details')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('sidebar.tenants')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('vehicle.location')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.status')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                            {v.photo1Url ? (
                              <img src={v.photo1Url} alt="Vehicle" className="w-full h-full object-cover" />
                            ) : (
                              <Car size={20} />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-800 uppercase tracking-tight">
                              {v.licensePlate}
                            </div>
                            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
                              {v.color !== 'N/A' && v.color ? `${v.color} ` : ''}{v.make} {v.model}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-700">{v.tenantName}</span>
                          </div>
                          {v.tenantPhone && (
                            <div className="flex items-center gap-1.5 mt-0.5 ml-0.5">
                              <Phone size={10} className="text-indigo-400" />
                              <span className="text-[11px] font-semibold text-slate-500">{v.tenantPhone}</span>
                            </div>
                          )}
                        </div>
                        {v.parkingSpace && (
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1">
                            <MapPin size={10} />
                            Space: {v.parkingSpace}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-800">{v.buildingName}</div>
                        <div className="text-xs font-semibold text-slate-500 mt-0.5">Unit {v.unitNumber}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          v.isAuthorized 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-red-50 text-red-700 border-red-100"
                        )}>
                          {v.isAuthorized ? (
                            <>
                              <CheckCircle size={10} />
                              Authorized
                            </>
                          ) : (
                            <>
                              <AlertCircle size={10} />
                              Not Authorized
                            </>
                          )}
                        </span>
                        {!v.isAuthorized && (
                          <div className="text-[9px] font-bold text-red-400 uppercase mt-1">Lease Expired: {v.leaseExpiry}</div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingVehicle(v)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {hasPermission('Vehicles', 'edit') && (
                            <button
                              onClick={() => handleEdit(v)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Vehicle"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {hasPermission('Vehicles', 'delete') && (
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Vehicle"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {viewingVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 anim-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl anim-zoom-in max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Car size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Vehicle Details</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{viewingVehicle.licensePlate}</p>
                </div>
              </div>
              <button onClick={() => setViewingVehicle(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('vehicle.make')}</p>
                  <p className="text-base font-bold text-slate-800 mt-1">{viewingVehicle.make}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('vehicle.model')}</p>
                  <p className="text-base font-bold text-slate-800 mt-1">{viewingVehicle.model}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <span className="text-xs font-semibold text-slate-500">{t('sidebar.tenants')}</span>
                  <span className="text-xs font-bold text-slate-800">{viewingVehicle.tenantName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <span className="text-xs font-semibold text-slate-500">{t('vehicle.location')}</span>
                  <span className="text-xs font-bold text-slate-800">{viewingVehicle.buildingName} - Unit {viewingVehicle.unitNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">{t('vehicle.parking')}</span>
                  <span className="text-xs font-bold text-slate-800">{viewingVehicle.parkingSpace || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex shrink-0">
              <Button type="button" variant="secondary" onClick={() => setViewingVehicle(null)} className="w-full rounded-2xl h-12 font-bold">
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <VehicleForm 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          editingVehicle={editingVehicle}
          selectedBuildingId={buildingFilter}
          effectiveCompanyId={effectiveCompanyId}
        />
      )}
    </>
  );
};
