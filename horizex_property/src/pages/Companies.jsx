import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Home,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin
} from 'lucide-react';
import { Button } from '../components/Button';
import { mockCompanies as defaultCompanies } from '../mock/companies';
import api from '../api/client';

export const Companies = () => {
  const navigate = useNavigate();

  // Load companies from localStorage (or fallback to defaults)
  const getStoredCompanies = () => {
    try {
      const stored = localStorage.getItem('mock_companies');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse mock_companies:', e);
    }
    return defaultCompanies;
  };

  // Load buildings from localStorage
  const getStoredBuildings = () => {
    try {
      const stored = localStorage.getItem('mock_properties');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse mock_properties:', e);
    }
    return [];
  };

  // Load system owners for dropdown
  const getStoredOwners = () => {
    try {
      const stored = localStorage.getItem('mock_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(u => u.role === 'OWNER' || u.role === 'ADMIN');
        }
      }
    } catch (e) {}
    return [
      { id: 1, name: 'Admin User' },
      { id: 3, name: 'David Miller' },
      { id: 5, name: 'George Soros' },
      { id: 7, name: 'Jane Doe' }
    ];
  };

  const [companies, setCompanies] = useState(getStoredCompanies);
  const [buildings, setBuildings] = useState(getStoredBuildings);
  const [availableOwners, setAvailableOwners] = useState(getStoredOwners);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);

  // Form states: Company Name, Code, Owner (Optional Dropdown), Address (Optional)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    ownerName: '',
    address: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync companies, buildings, and fetch registered owners
  useEffect(() => {
    const handleSync = () => {
      setCompanies(getStoredCompanies());
      setBuildings(getStoredBuildings());
    };
    window.addEventListener('companyChanged', handleSync);
    window.addEventListener('storage', handleSync);

    // Fetch official owners list from API
    const fetchOwnersList = async () => {
      try {
        const res = await api.get('/api/admin/owners');
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const combined = [...list];
          if (!combined.some(o => o.name === 'Admin User')) {
            combined.unshift({ id: 'admin', name: 'Admin User' });
          }
          setAvailableOwners(combined);
        }
      } catch (err) {
        // Fallback to getStoredOwners already initialized
      }
    };
    fetchOwnersList();

    return () => {
      window.removeEventListener('companyChanged', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Compute buildings & units stats per company
  const companyStats = useMemo(() => {
    const stats = {};
    companies.forEach(c => {
      stats[c.id] = { buildingsCount: 0, unitsCount: 0, buildingsList: [] };
    });

    buildings.forEach(b => {
      const compId = b.companyId ? parseInt(b.companyId) : null;
      if (compId && stats[compId]) {
        stats[compId].buildingsCount += 1;
        stats[compId].unitsCount += parseInt(b.units) || 0;
        stats[compId].buildingsList.push(b);
      }
    });

    return stats;
  }, [companies, buildings]);

  // Overall metrics
  const totalCompaniesCount = companies.length;
  const totalManagedBuildings = Object.values(companyStats).reduce((acc, curr) => acc + curr.buildingsCount, 0);
  const totalUnits = Object.values(companyStats).reduce((acc, curr) => acc + curr.unitsCount, 0);

  // Filtered companies based on search
  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const term = search.toLowerCase();
    return companies.filter(c =>
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.code && c.code.toLowerCase().includes(term)) ||
      (c.ownerName && c.ownerName.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  }, [companies, search]);

  // Auto-generate company code from name
  const handleNameChange = (nameVal, isEdit = false) => {
    if (!isEdit) {
      const words = nameVal.trim().split(/\s+/).filter(Boolean);
      let autoCode = '';
      if (words.length === 1) {
        autoCode = words[0].slice(0, 4).toUpperCase();
      } else if (words.length > 1) {
        autoCode = words.map(w => w[0]).join('').slice(0, 5).toUpperCase();
      }
      setFormData(prev => ({
        ...prev,
        name: nameVal,
        code: prev.code && prev.code !== autoCode.slice(0, -1) ? prev.code : autoCode
      }));
    } else {
      setFormData(prev => ({ ...prev, name: nameVal }));
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      code: '',
      ownerName: '',
      address: ''
    });
    setShowAddModal(true);
  };

  // Handle Create Company
  const handleCreateCompany = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a company name.');
      return;
    }

    const currentList = getStoredCompanies();
    const newId = currentList.length ? Math.max(...currentList.map(c => Number(c.id) || 0)) + 1 : 1;
    const newCode = (formData.code || formData.name.slice(0, 4)).trim().toUpperCase();

    const newCompany = {
      id: newId,
      name: formData.name.trim(),
      code: newCode,
      ownerName: formData.ownerName ? formData.ownerName.trim() : '',
      address: formData.address ? formData.address.trim() : '',
      createdAt: new Date().toISOString()
    };

    const updated = [...currentList, newCompany];
    localStorage.setItem('mock_companies', JSON.stringify(updated));
    setCompanies(updated);

    // Notify other components & global selector
    window.dispatchEvent(new Event('companyChanged'));
    setShowAddModal(false);
    showToast(`Company "${newCompany.name}" added successfully.`);
  };

  // Open Edit Modal
  const openEditModal = (comp) => {
    setSelectedCompany(comp);
    setFormData({
      name: comp.name || '',
      code: comp.code || '',
      ownerName: comp.ownerName || '',
      address: comp.address || ''
    });
    setShowEditModal(true);
  };

  // Handle Update Company
  const handleUpdateCompany = (e) => {
    e.preventDefault();
    if (!selectedCompany) return;

    const updatedList = companies.map(c => {
      if (c.id === selectedCompany.id) {
        return {
          ...c,
          name: formData.name.trim(),
          code: (formData.code || formData.name.slice(0, 4)).trim().toUpperCase(),
          ownerName: formData.ownerName ? formData.ownerName.trim() : '',
          address: formData.address ? formData.address.trim() : ''
        };
      }
      return c;
    });

    localStorage.setItem('mock_companies', JSON.stringify(updatedList));
    setCompanies(updatedList);

    // If company name changed, synchronize matching buildings in mock_properties
    if (selectedCompany.name !== formData.name.trim()) {
      const currentProps = getStoredBuildings();
      const updatedProps = currentProps.map(b => {
        if (b.companyId === selectedCompany.id) {
          return { ...b, companyName: formData.name.trim() };
        }
        return b;
      });
      localStorage.setItem('mock_properties', JSON.stringify(updatedProps));
      setBuildings(updatedProps);
    }

    window.dispatchEvent(new Event('companyChanged'));
    setShowEditModal(false);
    showToast(`Company "${formData.name}" updated successfully.`);
  };

  // Open Delete Modal
  const openDeleteModal = (comp) => {
    setSelectedCompany(comp);
    setShowDeleteModal(true);
  };

  // Handle Delete Company
  const handleDeleteCompany = () => {
    if (!selectedCompany) return;

    const updated = companies.filter(c => c.id !== selectedCompany.id);
    localStorage.setItem('mock_companies', JSON.stringify(updated));
    setCompanies(updated);

    // If deleted company was the active global filter, reset selection
    const currentActive = localStorage.getItem('global_selected_company_id');
    if (currentActive && currentActive.toString() === selectedCompany.id.toString()) {
      localStorage.setItem('global_selected_company_id', '');
    }

    window.dispatchEvent(new Event('companyChanged'));
    setShowDeleteModal(false);
    showToast(`Company "${selectedCompany.name}" deleted.`);
  };

  // Open View Details Modal
  const openViewModal = (comp) => {
    setSelectedCompany(comp);
    setShowViewModal(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-xl border border-zinc-700 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Companies</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{totalCompaniesCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Managed Buildings</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{totalManagedBuildings}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Managed Units</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{totalUnits}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <Home size={22} />
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white p-4 md:px-5 rounded-[22px] border border-slate-200 shadow-xs gap-4">
        <div className="flex gap-3 items-center flex-1">
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all w-full md:min-w-[300px] max-w-md">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search companies by name, code, owner, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-hidden text-slate-700 placeholder:text-slate-400 w-full text-xs font-medium"
            />
          </div>
        </div>

        <Button variant="primary" onClick={openAddModal} className="whitespace-nowrap flex items-center gap-2">
          <Plus size={16} />
          Add Company
        </Button>
      </div>

      {/* COMPANIES TABLE */}
      <div className="saas-table-container flex flex-col flex-1 bg-white rounded-[22px] border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="saas-table w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="pl-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Company</th>
                <th className="py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Code</th>
                <th className="py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Owner</th>
                <th className="py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Buildings</th>
                <th className="py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Total Units</th>
                <th className="pr-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No companies found matching "{search}".
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  const stats = companyStats[c.id] || { buildingsCount: 0, unitsCount: 0, buildingsList: [] };
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Company Name & Icon */}
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{c.name}</p>
                            {c.address && (
                              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <MapPin size={11} className="text-slate-400 shrink-0" />
                                {c.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code Badge */}
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
                          {c.code || c.name.slice(0, 4).toUpperCase()}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <User size={14} className="text-slate-400" />
                          <span>
                            {c.ownerName ? (
                              c.ownerName
                            ) : (
                              <span className="text-slate-400 font-normal italic">Unassigned</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Managed Buildings Count */}
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Building2 size={12} />
                          {stats.buildingsCount} {stats.buildingsCount === 1 ? 'Building' : 'Buildings'}
                        </span>
                      </td>

                      {/* Total Units */}
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Home size={12} />
                          {stats.unitsCount} Units
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="pr-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Company Details */}
                          <button
                            onClick={() => openViewModal(c)}
                            title="View Company Buildings & Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <ExternalLink size={16} />
                          </button>

                          {/* Edit Company */}
                          <button
                            onClick={() => openEditModal(c)}
                            title="Edit Company"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Delete Company */}
                          <button
                            onClick={() => openDeleteModal(c)}
                            title="Delete Company"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={16} />
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

      {/* ========================================================= */}
      {/* ADD COMPANY MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-white">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-blue-400" />
                <h2 className="text-sm font-bold">Add New Company</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="p-6 space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value, false)}
                  placeholder="e.g. Apex Real Estate Partners"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Company Code & Owner Dropdown */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. APEX"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Owner <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Select Owner --</option>
                    {availableOwners.map(o => (
                      <option key={o.id || o.name} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Office Address (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Office Address <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 1000 Rue de la Gauchetière, Montreal, QC"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT COMPANY MODAL */}
      {/* ========================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-white">
              <div className="flex items-center gap-2">
                <Pencil size={18} className="text-amber-400" />
                <h2 className="text-sm font-bold">Edit Company: {selectedCompany?.name}</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateCompany} className="p-6 space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value, true)}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Company Code & Owner Dropdown */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Owner <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Select Owner --</option>
                    {availableOwners.map(o => (
                      <option key={o.id || o.name} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Office Address (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Office Address <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 1000 Rue de la Gauchetière, Montreal, QC"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Delete Company</h3>
              <p className="text-xs text-slate-500 mb-4">
                Are you sure you want to remove <span className="font-bold text-slate-800">"{selectedCompany?.name}"</span>?
              </p>

              {companyStats[selectedCompany?.id]?.buildingsCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left mb-4">
                  <p className="text-[11px] font-semibold text-amber-800 leading-tight">
                    ⚠️ Note: There are currently {companyStats[selectedCompany?.id]?.buildingsCount} building(s) associated with this company. Deleting this company will leave those buildings unassigned.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCompany}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW DETAILS & BUILDINGS MODAL */}
      {/* ========================================================= */}
      {showViewModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-blue-400" />
                <h2 className="text-sm font-bold">{selectedCompany.name} — Details & Portfolio</h2>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Info Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Code</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedCompany.code || selectedCompany.name.slice(0, 4).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Owner</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedCompany.ownerName || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Managed Buildings</p>
                  <p className="font-bold text-indigo-600 mt-0.5">{companyStats[selectedCompany.id]?.buildingsCount || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Units</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{companyStats[selectedCompany.id]?.unitsCount || 0}</p>
                </div>
              </div>

              {selectedCompany.address && (
                <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Office Address:</span>
                  <span className="text-slate-800 font-medium">{selectedCompany.address}</span>
                </div>
              )}

              {/* Associated Buildings List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={15} className="text-indigo-600" />
                    Assigned Buildings ({companyStats[selectedCompany.id]?.buildingsList?.length || 0})
                  </h4>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      navigate('/properties/buildings');
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    Go to Buildings List <ExternalLink size={12} />
                  </button>
                </div>

                {(!companyStats[selectedCompany.id]?.buildingsList || companyStats[selectedCompany.id].buildingsList.length === 0) ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    No buildings are currently assigned to this company. You can assign buildings to this company in the Buildings section.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {companyStats[selectedCompany.id].buildingsList.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{b.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {[b.civicNumber, b.street, b.city, b.province].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {b.units || 0} Units
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {b.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end border-t border-slate-100">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
