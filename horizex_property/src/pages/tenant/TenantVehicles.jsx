import React, { useState } from 'react';
import { 
  Car, 
  AlertCircle, 
  CheckCircle, 
  MapPin, 
  Info,
  Plus,
  X,
  Trash2,
  Building2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import { 
  useGetTenantVehiclesQuery, 
  useAddTenantVehicleMutation, 
  useDeleteTenantVehicleMutation 
} from '../../store';

export const TenantVehicles = () => {
  const { data: rawVehicles = [], isLoading: loading, refetch } = useGetTenantVehiclesQuery();
  const [addVehicle, { isLoading: isAdding }] = useAddTenantVehicleMutation();
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteTenantVehicleMutation();

  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    licensePlate: '',
    make: '',
    model: '',
    color: '',
    parkingSpace: '',
  });

  const vehicles = Array.isArray(rawVehicles) ? rawVehicles : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setFormData({
      licensePlate: '',
      make: '',
      model: '',
      color: '',
      parkingSpace: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.licensePlate.trim()) {
      setFormError('License plate is required.');
      return;
    }
    if (!formData.make.trim()) {
      setFormError('Vehicle make is required.');
      return;
    }
    if (!formData.model.trim()) {
      setFormError('Vehicle model is required.');
      return;
    }

    try {
      await addVehicle({
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        color: formData.color.trim() || 'Black',
        parkingSpace: formData.parkingSpace.trim() || undefined,
        permitNumber: formData.parkingSpace.trim() || undefined,
      }).unwrap();

      setShowModal(false);
    } catch (err) {
      console.error('Failed to register vehicle:', err);
      const msg = err?.data?.message || err?.message || 'Failed to register vehicle. Please verify information.';
      setFormError(msg);
    }
  };

  const handleDelete = async (vehicleId, plate) => {
    if (!window.confirm(`Are you sure you want to remove vehicle ${plate || ''}?`)) {
      return;
    }

    try {
      setDeletingId(vehicleId);
      await deleteVehicle(vehicleId).unwrap();
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
      alert(err?.data?.message || 'Failed to remove vehicle record.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="space-y-8 anim-slide-up">
        
        {/* INFO BOX & REGISTER BUTTON */}
        <section className="bg-indigo-50/70 border border-indigo-100 p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0 border border-indigo-50">
              <Info size={20} />
            </div>
            <div>
              <h3 className="font-black text-indigo-950 uppercase tracking-tight text-xs sm:text-sm">Parking Policy</h3>
              <p className="text-indigo-800/80 text-xs sm:text-sm mt-0.5 font-medium leading-relaxed max-w-2xl">
                Only registered vehicles with an "Authorized" status are permitted to park on the property. 
                If your vehicle information is incorrect or you have a new car, you can register it below or contact the property manager.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenModal}
            className="w-full sm:w-auto px-5 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={16} />
            <span>Register Vehicle</span>
          </button>
        </section>

        {/* VEHICLE GRID */}
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 font-medium italic text-sm">Loading your vehicle records...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white p-16 sm:p-20 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 border border-slate-100">
              <Car size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">No Vehicles Registered</h3>
              <p className="text-slate-500 mt-1 max-w-xs font-medium text-sm leading-relaxed">
                You haven't registered any vehicles with the management office yet.
              </p>
            </div>
            <button
              onClick={handleOpenModal}
              className="mt-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Register Vehicle Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group">
                <div className="h-40 bg-slate-100/70 relative overflow-hidden flex flex-col justify-between">
                  {/* Status Header Bar */}
                  <div className={clsx(
                    "px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center justify-between border-b shrink-0",
                    v.isAuthorized 
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-sm" 
                      : "bg-rose-500 text-white border-rose-600 shadow-sm"
                  )}>
                    <div className="flex items-center gap-1.5">
                      {v.isAuthorized ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      <span>{v.isAuthorized ? 'Authorized' : 'Not Authorized'}</span>
                    </div>

                    <button
                      onClick={() => handleDelete(v.id, v.licensePlate)}
                      disabled={deletingId === v.id}
                      title="Remove vehicle"
                      className="p-1 rounded-md hover:bg-black/20 text-white transition-colors disabled:opacity-50"
                    >
                      {deletingId === v.id ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>

                  {/* Visual / Car Placeholder */}
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-slate-500 border border-slate-200/60">
                      <Car size={26} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {v.color || 'Standard'} • {v.make}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{v.licensePlate}</h4>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                          {v.color && v.color !== 'Standard' ? `${v.color} ` : ''}{v.make} {v.model}
                        </p>
                      </div>
                      <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                        <Car size={22} />
                      </div>
                    </div>

                    {/* Location detail */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Building2 size={14} className="text-slate-400" />
                      <span>{v.buildingName || 'Main Building'} • Unit {v.unitNumber || '-'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/60">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parking Space</p>
                        <p className="text-sm font-bold text-slate-800">{v.parkingSpace || v.permitNumber || 'Assigned'}</p>
                      </div>
                    </div>
                    
                    {!v.isAuthorized && (
                      <div className="text-right">
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Issue</p>
                        <p className="text-xs font-bold text-rose-600">{v.issue || 'Lease Expired'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* REGISTER VEHICLE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
                  <Car size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Register Vehicle</h3>
                  <p className="text-xs text-slate-500">Add vehicle for parking authorization</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-semibold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  License Plate <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="e.g. ABC-1234"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 outline-none text-sm font-semibold uppercase text-slate-800 placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Make <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    placeholder="e.g. Honda, Toyota"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Model <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g. Civic, RAV4"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g. Black, White, Silver"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Requested Parking Space
                  </label>
                  <input
                    type="text"
                    name="parkingSpace"
                    value={formData.parkingSpace}
                    onChange={handleInputChange}
                    placeholder="e.g. Spot #12 (Optional)"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>Vehicle will be submitted for management authorization under your current active lease.</span>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isAdding}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isAdding ? <RefreshCw size={14} className="animate-spin" /> : null}
                  <span>{isAdding ? 'Registering...' : 'Confirm Registration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
