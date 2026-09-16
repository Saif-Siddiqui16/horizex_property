import React, { useState, useEffect } from 'react';
import { TenantLayout } from '../../layouts/TenantLayout';
import { 
  Car, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  MapPin, 
  Camera,
  Info
} from 'lucide-react';
import api from '../../api/client';
import clsx from 'clsx';

export const TenantVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyVehicles = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/tenant/vehicles');
        setVehicles(res.data);
      } catch (e) {
        console.error('Failed to fetch your vehicles', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMyVehicles();
  }, []);

  return (
    <TenantLayout title="My Vehicles">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* INFO BOX */}
        <section className="bg-indigo-50 border border-indigo-100 p-4 sm:p-6 rounded-3xl flex items-start gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <Info size={18} />
          </div>
          <div>
            <h3 className="font-black text-indigo-900 uppercase tracking-tight text-xs sm:text-sm">Parking Policy</h3>
            <p className="text-indigo-700/80 text-xs sm:text-sm mt-1 font-medium leading-relaxed">
              Only registered vehicles with an "Authorized" status are permitted to park on the property. 
              If your vehicle information is incorrect or you have a new car, please contact the property manager.
            </p>
          </div>
        </section>

        {/* VEHICLE GRID */}
        {loading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-slate-500 font-medium italic text-sm">Loading your vehicle records...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                <Car size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">No Vehicles Registered</h3>
                <p className="text-slate-500 mt-1 max-w-xs font-medium text-sm">You haven't registered any vehicles with the management office yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group">
                  <div className="h-44 bg-slate-100 relative overflow-hidden flex flex-col">
                    {/* Status Header Bar */}
                    <div className={clsx(
                      "px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b shrink-0",
                      v.isAuthorized 
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-sm" 
                        : "bg-rose-500 text-white border-rose-600 shadow-sm"
                    )}>
                      {v.isAuthorized ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {v.isAuthorized ? 'Authorized' : 'Not Authorized'}
                    </div>
                    {/* Image / Placeholder */}
                    <div className="flex-1 min-h-0 relative">
                      {v.photo1Url ? (
                        <img src={v.photo1Url} alt="Vehicle" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1.5 p-4">
                          <Car size={36} />
                          <span className="text-[9px] font-black uppercase tracking-widest">No Photo Available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{v.licensePlate}</h4>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mt-0.5">{v.color} {v.make} {v.model}</p>
                        </div>
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                          <Car size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parking Space</p>
                          <p className="text-sm font-bold text-slate-700">{v.parkingSpace || 'Not Assigned'}</p>
                        </div>
                      </div>
                      
                      {!v.isAuthorized && (
                        <div className="text-right">
                          <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Issue</p>
                          <p className="text-xs font-bold text-rose-600">Lease Expired</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

      </div>
    </TenantLayout>
  );
};
