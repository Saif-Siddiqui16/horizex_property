import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  User, 
  Building2, 
  CreditCard, 
  Car, 
  MapPin, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button } from '../components/Button';
import { useGetTenantsQuery, useCreateVehicleMutation, useUpdateVehicleMutation } from '../store/api/tenantsApi';
import clsx from 'clsx';

export const VehicleForm = ({ isOpen, onClose, editingVehicle, selectedBuildingId, effectiveCompanyId: propCompanyId }) => {
  const { t } = useTranslation();
  
  // Context from Redux or props
  const reduxCompanyId = useSelector((state) => state.auth?.effectiveCompanyId);
  const activeCompanyId = propCompanyId || reduxCompanyId || localStorage.getItem('global_selected_company_id') || '';
  const activeBuildingId = selectedBuildingId || localStorage.getItem('global_selected_building_id') || '';

  // RTK Query hooks with company context
  const tenantQueryParams = useMemo(() => {
    const p = { limit: 1000 };
    if (activeCompanyId && activeCompanyId !== 'all') {
      p.companyId = activeCompanyId;
    }
    return p;
  }, [activeCompanyId]);

  const { data: rawTenants = [], isLoading: loadingTenants } = useGetTenantsQuery(tenantQueryParams);
  const tenants = Array.isArray(rawTenants) ? rawTenants : [];

  // Filter tenants by selected company and building
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      if (activeCompanyId && activeCompanyId !== 'all') {
        if (t.companyId && String(t.companyId) !== String(activeCompanyId)) {
          return false;
        }
      }
      if (activeBuildingId && activeBuildingId !== 'all') {
        if (t.propertyId && String(t.propertyId) !== String(activeBuildingId)) {
          return false;
        }
      }
      return true;
    });
  }, [tenants, activeCompanyId, activeBuildingId]);

  const displayTenants = useMemo(() => {
    if (editingVehicle && editingVehicle.tenantId) {
      const alreadyPresent = filteredTenants.some((t) => String(t.id) === String(editingVehicle.tenantId));
      if (!alreadyPresent) {
        const currentTenant = tenants.find((t) => String(t.id) === String(editingVehicle.tenantId));
        if (currentTenant) return [currentTenant, ...filteredTenants];
      }
    }
    return filteredTenants;
  }, [filteredTenants, editingVehicle, tenants]);

  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const saving = isCreating || isUpdating;

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    tenantId: '',
    unitId: '',
    make: '',
    model: '',
    color: '',
    licensePlate: '',
    parkingSpace: '',
  });

  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        tenantId: editingVehicle.tenantId ? String(editingVehicle.tenantId) : '',
        unitId: editingVehicle.unitId ? String(editingVehicle.unitId) : '',
        make: editingVehicle.make || '',
        model: editingVehicle.model || '',
        color: editingVehicle.color !== 'N/A' ? editingVehicle.color || '' : '',
        licensePlate: editingVehicle.licensePlate || '',
        parkingSpace: editingVehicle.parkingSpace || editingVehicle.permitNumber || '',
      });
    } else {
      setFormData({
        tenantId: '',
        unitId: '',
        make: '',
        model: '',
        color: '',
        licensePlate: '',
        parkingSpace: '',
      });
      setSelectedTenant(null);
    }
    setFormError('');
  }, [editingVehicle, isOpen]);

  // Sync selected tenant when tenantId changes
  useEffect(() => {
    if (formData.tenantId) {
      const tenant = tenants.find(t => String(t.id) === String(formData.tenantId));
      if (tenant) {
        setSelectedTenant(tenant);
        if (!editingVehicle) {
          setFormData(prev => ({
            ...prev,
            unitId: tenant.unitId || '',
          }));
        }
      }
    } else {
      setSelectedTenant(null);
    }
  }, [formData.tenantId, tenants, editingVehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const resolvedUnitId = formData.unitId || selectedTenant?.unitId;

      const payload = {
        tenantId: formData.tenantId,
        unitId: resolvedUnitId || undefined,
        make: formData.make.trim(),
        model: formData.model.trim(),
        color: formData.color ? formData.color.trim() : undefined,
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        permitNumber: formData.parkingSpace ? formData.parkingSpace.trim() : undefined,
      };

      if (editingVehicle) {
        await updateVehicle({ id: editingVehicle.id, ...payload }).unwrap();
      } else {
        await createVehicle(payload).unwrap();
      }

      onClose();
    } catch (err) {
      console.error('Failed to save vehicle', err);
      const msg = err?.data?.error?.message || err?.data?.message || err?.message || 'Error saving vehicle information';
      setFormError(msg);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-3 sm:p-5 overflow-y-auto anim-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <form 
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-100 anim-zoom-in"
      >
        {/* PINNED HEADER */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Car size={24} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {editingVehicle ? t('vehicle.edit_title') || 'Edit Vehicle' : t('vehicle.register_title') || 'Register Vehicle'}
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {t('vehicle.register_desc') || 'Associate a vehicle with a tenant profile for parking security.'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={saving}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {formError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2 anim-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* SECTION: TENANT ASSIGNMENT */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400 font-black text-[11px] uppercase tracking-widest px-1">
              <User size={14} className="text-indigo-500" />
              {t('vehicle.step_resident') || 'Step 1: Assign Resident'}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1">{t('vehicle.select_tenant') || 'Select Tenant'} *</label>
              <select
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                required
                disabled={loadingTenants || saving}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
              >
                <option value="">
                  {loadingTenants 
                    ? (t('common.loading') || 'Loading tenants...') 
                    : displayTenants.length === 0 
                      ? (t('vehicle.no_tenants') || '-- No tenants found for selected company/building --') 
                      : (t('vehicle.choose_tenant') || '-- Choose Tenant --')}
                </option>
                {displayTenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim()} {t.propertyName && t.propertyName !== '-' ? `(${t.propertyName} - Unit ${t.unitNumber || '-'})` : ''}
                  </option>
                ))}
              </select>
              {displayTenants.length === 0 && !loadingTenants && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  No tenants registered under this company/building. Please switch company/building in the header or add a tenant first.
                </p>
              )}
            </div>

            {selectedTenant && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between anim-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800 uppercase tracking-tight">Auto-Populated Unit Details</div>
                    <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                      Building: {selectedTenant.property || selectedTenant.companyName || 'Main Property'} | Unit: {selectedTenant.unit || selectedTenant.unitNumber || 'Assigned'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION: VEHICLE DETAILS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400 font-black text-[11px] uppercase tracking-widest px-1">
              <CreditCard size={14} className="text-indigo-500" />
              {t('vehicle.step_info') || 'Step 2: Vehicle Information'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">{t('vehicle.plate') || 'License Plate'} *</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required
                  placeholder="E.g. ABC-1234"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none uppercase placeholder:normal-case text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">{t('vehicle.color') || 'Color'}</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="E.g. Silver, Black"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">{t('vehicle.make') || 'Make'} *</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  placeholder="E.g. Honda, Toyota"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">{t('vehicle.model') || 'Model'} *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  placeholder="E.g. Civic, RAV4"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">{t('vehicle.parking') || 'Permit / Parking Space'}</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="parkingSpace"
                    value={formData.parkingSpace}
                    onChange={handleChange}
                    placeholder="Enter assigned stall or permit number (e.g. STALL-4B)"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PINNED FOOTER */}
        <div className="px-6 py-4 sm:px-8 sm:py-4 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-slate-50/70">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider"
            disabled={saving}
          >
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 h-11 sm:h-12 rounded-xl shadow-lg shadow-indigo-100 text-xs sm:text-sm font-bold uppercase tracking-wider"
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('common.loading') || 'Saving...'}</span>
              </div>
            ) : (
              editingVehicle ? (t('vehicle.update') || 'Save Changes') : (t('vehicle.register') || 'Register Vehicle')
            )}
          </Button>
        </div>
      </form>
    </div>,
    document.body
  );
};
