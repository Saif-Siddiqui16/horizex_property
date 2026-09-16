import React, { useState } from 'react';

// Lucide Icons
import {
  Wrench, AlertCircle, Clock, CheckCircle, Package, UserCheck, ShieldAlert,
  Landmark, Trash2, Calendar as CalendarIcon, Edit2, Play, Users, MapPin, 
  Thermometer, CheckCircle2, DollarSign, Plus, ArrowUpRight, ShieldCheck,
  ChevronLeft, ChevronRight, Info, FileText, Check, Activity
} from 'lucide-react';

// ── 1. KPI WIDGETS & CARDS ───────────────────────────────────────────────
export const MaintenanceKPICards = ({ stats }) => {
  const items = [
    { label: 'Open Requests', value: stats.open, color: 'text-blue-600 bg-blue-50 border-blue-100', icon: AlertCircle },
    { label: 'In Progress', value: stats.inProgress, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: Clock },
    { label: 'Waiting Parts/Vendor', value: stats.waitingParts + stats.waitingVendor, color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Package },
    { label: 'Emergency Alerts', value: stats.emergency, color: 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse', icon: ShieldAlert }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {items.map((item, idx) => (
        <div key={idx} className={`p-5 rounded-3xl border bg-white flex items-center justify-between shadow-sm`}>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{item.label}</span>
            <p className="text-3xl font-black text-slate-800 mt-1">{item.value}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.color}`}>
            <item.icon size={20} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ── 2. MAINTENANCE REQUESTS TABLE ────────────────────────────────────────
export const MaintenanceRequestTable = ({ requests, onSelect, onStatusChange }) => {
  const getPriorityStyle = (p) => {
    switch (p) {
      case 'Emergency': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'High': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusStyle = (s) => {
    switch (s) {
      case 'Completed':
      case 'Closed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Waiting Parts':
      case 'Waiting Vendor':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Active Maintenance Requests</h3>
        <p className="text-[10px] text-slate-400 font-medium">Lifecycle tracking per unit and category</p>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Request ID</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Property</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Category</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Description</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Priority</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Status</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-slate-400 italic">No maintenance requests found.</td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/20">
                  <td className="px-4 py-3 font-mono font-bold text-slate-700">{req.id}</td>
                  <td className="px-4 py-3">{req.buildingId} - Apt {req.apartmentId}</td>
                  <td className="px-4 py-3">{req.category}</td>
                  <td className="px-4 py-3 truncate max-w-[180px]">{req.description}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${getPriorityStyle(req.priority)}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={req.status}
                      onChange={(e) => onStatusChange(req.id, e.target.value)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase outline-none cursor-pointer ${getStatusStyle(req.status)}`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="New">New</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting Parts">Waiting Parts</option>
                      <option value="Waiting Vendor">Waiting Vendor</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelect(req)}
                      className="px-3 py-1 bg-slate-900 text-white font-bold text-[10px] rounded-lg hover:bg-slate-800 transition-all cursor-pointer border-none"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── 3. WORK ORDERS TABLE ────────────────────────────────────────────────
export const WorkOrderTable = ({ workOrders, onCreate }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Work Orders Cost Ledger</h3>
          <p className="text-[10px] text-slate-400 font-medium">Estimated vs Actual repairs metrics</p>
        </div>
        <button 
          onClick={onCreate}
          className="bg-slate-950 text-white hover:bg-slate-800 px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1 cursor-pointer border-none"
        >
          <Plus size={11} /> Create Work Order
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">WO Number</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Req ID</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Assignee</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Est. Cost</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Actual Cost</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Hrs Logged</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Receipts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
            {workOrders.map((wo) => (
              <tr key={wo.id} className="hover:bg-slate-50/20">
                <td className="px-4 py-3 font-mono font-bold text-slate-700">{wo.id}</td>
                <td className="px-4 py-3 font-mono text-slate-500">{wo.requestId}</td>
                <td className="px-4 py-3">{wo.technicianId || wo.vendorId || 'Unassigned'}</td>
                <td className="px-4 py-3 text-right font-mono">${(wo.estimatedCost || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-indigo-600">${(wo.actualCost || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono">{wo.hoursWorked} hrs</td>
                <td className="px-4 py-3 text-slate-400 font-medium">
                  {wo.receipts.length > 0 ? (
                    <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold">
                      <FileText size={12} /> {wo.receipts[0]}
                    </span>
                  ) : 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── 4. TECHNICIAN MANAGEMENT BOARD ──────────────────────────────────────
export const TechnicianBoard = ({ technicians, onToggleClock }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Technician Status & Clock Board</h3>
        <p className="text-[10px] text-slate-400 font-medium">GPS location ready active shifts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <div key={tech.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tech.role}</span>
                <h4 className="font-bold text-slate-800 text-xs mt-0.5">{tech.name}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${tech.clockedIn ? 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                {tech.clockedIn ? 'CLOCKED IN' : 'OFFLINE'}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 font-semibold flex flex-col gap-1.5">
              <div className="flex items-center gap-1 text-slate-400">
                <MapPin size={11} />
                <span className="truncate">{tech.gpsLocation?.address || 'GPS Offline'}</span>
              </div>
              {tech.clockedIn && (
                <div className="text-[9px] text-emerald-600 font-bold">
                  Shift Active since: {new Date(tech.clockInTime).toLocaleTimeString()}
                </div>
              )}
            </div>

            <button
              onClick={() => onToggleClock(tech.id)}
              className={`w-full py-2 font-bold text-xs rounded-xl border-none shadow-sm cursor-pointer transition-all ${
                tech.clockedIn 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {tech.clockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 5. VENDOR DIRECTORY TABLE ───────────────────────────────────────────
export const VendorTable = ({ vendors }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Vendor Contracts Directory</h3>
        <p className="text-[10px] text-slate-400 font-medium">Compliance SLA status and active balances</p>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Vendor No</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Company Name</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Services Mapped</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Contact</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Rating</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Outstanding bills</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/20">
                <td className="px-4 py-3 font-mono font-bold text-slate-700">{v.vendorNo}</td>
                <td className="px-4 py-3">{v.name}</td>
                <td className="px-4 py-3 truncate max-w-[120px]">{v.services.join(', ')}</td>
                <td className="px-4 py-3">{v.contact}</td>
                <td className="px-4 py-3">
                  <span className="text-amber-500 font-black">★ {v.rating}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-rose-500">${(v.outstandingBills || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── 6. ASSET MANAGEMENT TABLE ───────────────────────────────────────────
export const AssetTable = ({ assets, onLifecycleChange }) => {
  const getStatusColor = (s) => {
    switch (s) {
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Under Repair': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Out of Service': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Asset Registry & Lifecycle</h3>
        <p className="text-[10px] text-slate-400 font-medium">Warranty expiration dates and condition parameters</p>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Asset Code</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Asset Name</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Serial No</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Warranty Till</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Condition</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Status</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Lifecycle Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50/20">
                <td className="px-4 py-3 font-mono font-bold text-slate-700">{asset.assetNo}</td>
                <td className="px-4 py-3">{asset.name}</td>
                <td className="px-4 py-3 font-mono text-[10px]">{asset.serialNumber}</td>
                <td className="px-4 py-3">{asset.warrantyDate}</td>
                <td className="px-4 py-3">{asset.condition}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={asset.status}
                    onChange={(e) => onLifecycleChange(asset.id, e.target.value)}
                    className="p-1 border border-slate-200 rounded-lg text-[10px] font-black text-slate-700 outline-none"
                  >
                    <option value="Purchased">Purchased</option>
                    <option value="Installed">Installed</option>
                    <option value="Active">Active</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Out of Service">Out of Service</option>
                    <option value="Replaced">Replaced</option>
                    <option value="Disposed">Disposed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── 7. FURNITURE MANAGEMENT TABLE ──────────────────────────────────────
export const FurnitureTable = ({ furniture, onConditionChange }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Apartments Furniture & Appliances Checklist</h3>
        <p className="text-[10px] text-slate-400 font-medium">Condition tracking and replacements liability</p>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Item No</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Unit</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Item Name</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Category</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Condition</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Replacement Cost</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
            {furniture.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/20">
                <td className="px-4 py-3 font-mono font-bold text-slate-700">{item.furnitureNo}</td>
                <td className="px-4 py-3">Apt {item.apartmentId}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                    item.condition === 'New' || item.condition === 'Good' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {item.condition}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">${(item.replacementCost || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={item.condition}
                    onChange={(e) => onConditionChange(item.id, e.target.value)}
                    className="p-1 border border-slate-200 rounded-lg text-[10px] font-black text-slate-700 outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Replaced">Replaced</option>
                    <option value="Removed">Removed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── 8. INVENTORY & SPARE PARTS TABLE ───────────────────────────────────
export const InventoryTable = ({ parts, onLogMovement }) => {
  const [mvtForm, setMvtForm] = useState({ partId: '', type: 'Purchase', quantity: 1, note: '' });

  const handleMvtSubmit = (e) => {
    e.preventDefault();
    if (!mvtForm.partId || mvtForm.quantity <= 0) return;
    onLogMovement(mvtForm.partId, mvtForm.type, mvtForm.quantity, mvtForm.note);
    setMvtForm({ partId: '', type: 'Purchase', quantity: 1, note: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Master Inventory grid */}
      <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Warehouse Parts Inventory</h3>
          <p className="text-[10px] text-slate-400 font-medium">Double-entry stock movement tracking ledger</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Part Number</th>
                <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Name</th>
                <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Category</th>
                <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Unit Cost</th>
                <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-center">Min Stock</th>
                <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-center font-bold">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
              {parts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/20">
                  <td className="px-4 py-3 font-mono font-bold text-slate-700">{p.partNo}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 text-right font-mono">${(p.unitCost || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{p.minimumStock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                      p.isLowStock 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
                        : 'text-slate-800'
                    }`}>
                      {p.currentStock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Logger Form */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Post Stock Movement</h3>
          <p className="text-[10px] text-slate-400 font-medium">Log stock movements dynamically to the database</p>
        </div>

        <form onSubmit={handleMvtSubmit} className="flex flex-col gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Part</label>
            <select
              value={mvtForm.partId}
              onChange={(e) => setMvtForm({ ...mvtForm, partId: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
              required
            >
              <option value="">-- Choose Item --</option>
              {parts.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.partNo})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</label>
              <select
                value={mvtForm.type}
                onChange={(e) => setMvtForm({ ...mvtForm, type: e.target.value })}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
              >
                <option value="Purchase">Purchase (+)</option>
                <option value="Issue">Issue (-)</option>
                <option value="Return">Return (+)</option>
                <option value="Adjustment">Adjustment (+/-)</option>
                <option value="Transfer">Transfer (-)</option>
                <option value="Consumption">Consumption (-)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
              <input 
                type="number"
                value={mvtForm.quantity}
                onChange={(e) => setMvtForm({ ...mvtForm, quantity: Number(e.target.value) })}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Memo / Note</label>
            <input 
              type="text"
              value={mvtForm.note}
              onChange={(e) => setMvtForm({ ...mvtForm, note: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none"
              placeholder="e.g. Received shipment"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl border-none shadow-md cursor-pointer mt-2"
          >
            Post Movement
          </button>
        </form>
      </div>

    </div>
  );
};

// ── 9. PREVENTIVE MAINTENANCE SCHEDULES ─────────────────────────────────
export const PreventiveMaintenanceWidget = ({ preventive, onCompleteCycle }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Scheduled Preventive Maintenance Runs</h3>
        <p className="text-[10px] text-slate-400 font-medium">Elevators, water pressure boilers, and safety drills checklist</p>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Run ID</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Schedule Name</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Category</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Frequency</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Last Completed</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Next Due Date</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase">Status</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
            {preventive.map((pm) => (
              <tr key={pm.id} className="hover:bg-slate-50/20">
                <td className="px-4 py-3 font-mono font-bold text-slate-700">{pm.id}</td>
                <td className="px-4 py-3">{pm.name}</td>
                <td className="px-4 py-3">{pm.category}</td>
                <td className="px-4 py-3">{pm.frequency}</td>
                <td className="px-4 py-3 font-mono text-[10px]">{pm.lastCompletedDate}</td>
                <td className="px-4 py-3 font-mono font-bold text-indigo-600">{pm.nextDueDate}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border uppercase ${
                    pm.status === 'Overdue' 
                      ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {pm.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onCompleteCycle(pm.id)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] rounded-lg border-none cursor-pointer"
                  >
                    Mark Done
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── 10. MAINTENANCE CALENDAR INTEGRATION ────────────────────────────────
export const MaintenanceCalendar = ({ events }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrev = () => setCurrentMonth(p => p === 0 ? 11 : p - 1);
  const handleNext = () => setCurrentMonth(p => p === 11 ? 0 : p + 1);

  // Filter events matching active month
  const filteredEvents = events.filter(e => {
    const d = new Date(e.start);
    return d.getMonth() === currentMonth;
  });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Maintenance Events Schedule</h3>
          <p className="text-[10px] text-slate-400 font-medium">Preventive inspections and technician bookings calendar</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 p-1.5 rounded-xl">
          <button onClick={handlePrev} className="p-1 hover:bg-white rounded-lg border-none cursor-pointer">
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 font-black w-24 text-center">{monthNames[currentMonth]} 2026</span>
          <button onClick={handleNext} className="p-1 hover:bg-white rounded-lg border-none cursor-pointer">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400 italic font-semibold">
            No events scheduled for {monthNames[currentMonth]} 2026.
          </div>
        ) : (
          filteredEvents.map((evt, idx) => (
            <div key={idx} className="p-4 border border-slate-100 bg-slate-50/20 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute right-0 top-0 text-[8px] font-black uppercase bg-slate-150 px-2 py-0.5 rounded-bl-lg text-slate-400">
                {evt.category}
              </div>
              <span className="text-[10px] font-black text-blue-600 font-mono">{evt.start}</span>
              <h4 className="font-bold text-slate-800 text-xs mt-0.5">{evt.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{evt.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── 11. MAINTENANCE AUDITS TIMELINE ─────────────────────────────────────
export const MaintenanceTimeline = ({ logs }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 max-h-[400px] overflow-y-auto">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">System Pipeline Audit logs</h3>
        <p className="text-[10px] text-slate-400 font-medium">Un-overwritable workflow timelines</p>
      </div>

      <div className="flex flex-col gap-4 font-semibold text-xs pl-2 border-l-2 border-slate-100">
        {logs.map((log, idx) => (
          <div key={idx} className="relative pl-6">
            <div className="absolute left-[-27px] top-0 w-3.5 h-3.5 bg-white border-2 border-slate-800 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
            </div>
            <div className="flex justify-between items-start">
              <span className="font-black text-slate-800 text-[11px]">{log.event}</span>
              <span className="text-[9px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{log.description}</p>
            <span className="text-[8px] text-slate-400 uppercase tracking-widest block mt-0.5">Logged by: {log.createdBy}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 12. ANALYTICS & HEALTH WIDGETS ─────────────────────────────────────
export const RepairCostWidget = ({ summary, costByBuilding }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Cost Variance & Allocation</h3>
        <p className="text-[10px] text-slate-400 font-medium">Repairs actual budgets vs variances</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600 border-b border-slate-50 pb-4">
        <div className="p-3 bg-slate-50/50 rounded-2xl flex flex-col">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Target Budget</span>
          <span className="text-xl font-black text-slate-800 mt-1">${summary.budget?.toFixed(2)}</span>
        </div>
        <div className="p-3 bg-slate-50/50 rounded-2xl flex flex-col">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Portfolio Cost</span>
          <span className="text-xl font-black text-indigo-600 mt-1">${summary.actual?.toFixed(2)}</span>
        </div>
        <div className="p-3 bg-slate-50/50 rounded-2xl flex flex-col col-span-2">
          <div className="flex justify-between text-[10px] font-black text-slate-400">
            <span>BUDGET UTILIZATION</span>
            <span>{Math.round((summary.actual / summary.budget) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, (summary.actual / summary.budget) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 text-xs font-semibold">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Costs By Property</span>
        {costByBuilding.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-slate-600">
            <span>{item.name}</span>
            <span className="font-bold text-slate-800 font-mono">${item.value?.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const OpenRepairsWidget = ({ stats, onTabRedirect }) => {
  return (
    <div 
      onClick={() => onTabRedirect('requests')}
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 cursor-pointer hover:border-blue-300 transition-all"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Open Repairs Panel</h3>
          <p className="text-[10px] text-slate-400 font-medium">New and unassigned tickets queue</p>
        </div>
        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xs font-black">
          {stats.open}
        </span>
      </div>
      <div className="flex justify-between items-center text-xs font-bold text-slate-500 mt-2">
        <span>Requires Dispatching:</span>
        <span className="text-blue-600 font-black flex items-center gap-0.5">
          View Requests <ArrowUpRight size={13} />
        </span>
      </div>
    </div>
  );
};

export const EmergencyRepairsWidget = ({ stats, onTabRedirect }) => {
  return (
    <div 
      onClick={() => onTabRedirect('requests')}
      className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 cursor-pointer hover:shadow-lg transition-all bg-rose-50/10"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-rose-800 text-sm">Emergency Hotlist</h3>
          <p className="text-[10px] text-rose-500 font-medium">Urgent hazard repairs awaiting resolution</p>
        </div>
        <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center text-xs font-black animate-ping">
          {stats.emergency}
        </span>
      </div>
      <div className="flex justify-between items-center text-xs font-bold text-rose-600 mt-2">
        <span>SLA Breaches:</span>
        <span className="font-black flex items-center gap-0.5">
          Dispatch Roster <ArrowUpRight size={13} />
        </span>
      </div>
    </div>
  );
};

export const VendorPerformanceWidget = ({ analytics }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Vendor Performance & Ratings</h3>
        <p className="text-[10px] text-slate-400 font-medium">Compliance scoring per contracts vendor</p>
      </div>

      <div className="flex flex-col gap-3 text-xs font-semibold">
        {analytics.performance.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2">
            <div>
              <span className="font-bold text-slate-800">{item.name}</span>
              <div className="text-[9px] text-slate-400 font-medium mt-0.5">Jobs: {item.completedJobs} • Speed: {item.avgCompletionTime}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-amber-500 font-bold">★ {item.rating}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-black uppercase">
                {item.performance}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TechnicianUtilizationWidget = ({ analytics }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Technician Workload Utilization</h3>
        <p className="text-[10px] text-slate-400 font-medium">Capacity check based on clocked payroll hours</p>
      </div>

      <div className="flex flex-col gap-4 text-xs font-semibold">
        {analytics.map((t, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex justify-between text-slate-700">
              <div>
                <span className="font-bold">{t.name}</span>
                <span className="text-[9px] text-slate-400 font-medium ml-1">({t.role})</span>
              </div>
              <span className="font-bold font-mono">{t.utilization}% ({t.payrollHours} hrs)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  t.utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${t.utilization}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AssetHealthWidget = ({ summary }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Asset Health & Warranty</h3>
        <p className="text-[10px] text-slate-400 font-medium">Total portfolio asset replacements value analysis</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600">
        <div className="p-3 bg-slate-50/50 rounded-2xl flex flex-col">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Asset Value</span>
          <span className="text-xl font-black text-slate-800 mt-1">${summary.totalValue?.toLocaleString()}</span>
        </div>
        <div className="p-3 bg-slate-50/50 rounded-2xl flex flex-col">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Warranty Alert</span>
          <span className="text-xl font-black text-amber-600 mt-1">{summary.warrantyExpiringCount} items</span>
        </div>
      </div>
      
      <div className="text-[10px] text-slate-500 font-semibold border-t border-slate-50 pt-2 flex justify-between">
        <span>Critical repairs required:</span>
        <span className="text-rose-500 font-black">{summary.replacementDueCount} Replacements due</span>
      </div>
    </div>
  );
};

export const InventoryAlertsWidget = ({ summary, onTabRedirect }) => {
  return (
    <div 
      onClick={() => onTabRedirect('inventory')}
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 cursor-pointer hover:border-rose-300 transition-all"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Inventory Alarms</h3>
          <p className="text-[10px] text-slate-400 font-medium">Parts falling below safety stock minimums</p>
        </div>
        <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center text-xs font-black animate-pulse">
          {summary.lowStockCount}
        </span>
      </div>

      <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
        {summary.lowStockList.map((part, idx) => (
          <div key={idx} className="flex justify-between text-[10px]">
            <span>{part.name}</span>
            <span className="font-bold text-rose-500">Stock: {part.currentStock} (Min: {part.minimumStock})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 13. ADDITIONAL CARDS FOR DETAILS ──────────────────────────────────
export const ApartmentMaintenanceCard = ({ apartmentId, buildingId, requests }) => {
  const unitRequests = requests.filter(r => r.apartmentId === apartmentId);
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
      <h4 className="font-bold text-slate-800 text-xs">Unit Apt {apartmentId} Active Operations</h4>
      <div className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
        <div className="flex justify-between">
          <span>Active Requests:</span>
          <span className="font-bold text-slate-800">{unitRequests.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Pending Invoices:</span>
          <span className="font-bold text-slate-800">{unitRequests.filter(r => r.status === 'Waiting Vendor').length}</span>
        </div>
      </div>
    </div>
  );
};

export const TenantMaintenanceCard = ({ tenantName, requests }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
      <h4 className="font-bold text-slate-800 text-xs">Tenant: {tenantName}</h4>
      <div className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
        <div className="flex justify-between">
          <span>Total Requests Logged:</span>
          <span className="font-bold text-slate-800">{requests.length}</span>
        </div>
      </div>
    </div>
  );
};

export const AssetHistoryCard = ({ assetId, lifecycleHistory }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
      <h4 className="font-bold text-slate-800 text-xs">Asset {assetId} State Timeline</h4>
      <div className="flex flex-col gap-3 text-xs font-semibold text-slate-500 border-l border-slate-100 pl-4 ml-1">
        {lifecycleHistory.map((item, idx) => (
          <div key={idx} className="relative">
            <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 bg-blue-600 rounded-full" />
            <div className="flex justify-between">
              <span className="font-bold text-slate-800">{item.status}</span>
              <span className="text-[9px] text-slate-400">{item.date}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 14. QUICK ACTIONS WIDGET ───────────────────────────────────────────
export const MaintenanceQuickActions = ({ onCreateRequest, onClockTech, onPostInventory }) => {
  const actions = [
    { label: 'File Repair Request', onClick: onCreateRequest, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { label: 'Clock In/Out Tech', onClick: onClockTech, color: 'bg-slate-900 hover:bg-slate-800 text-white' },
    { label: 'Post Parts Movement', onClick: onPostInventory, color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">Operations Quick Actions</h3>
        <p className="text-[10px] text-slate-400 font-medium">Primary operator triggers</p>
      </div>

      <div className="flex flex-col gap-2.5 text-xs font-bold">
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            className={`w-full py-3 rounded-xl border-none shadow-sm cursor-pointer transition-all ${act.color}`}
          >
            {act.label}
          </button>
        ))}
      </div>
    </div>
  );
};
