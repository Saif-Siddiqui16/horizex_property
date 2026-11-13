import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Search, Filter, Eye, Pencil, Trash2, Building2, Home, X, Landmark, Loader2 } from 'lucide-react';
import { hasPermission } from '../utils/permissions';
import {
  useGetPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetCompaniesQuery,
  useGetBankAccountsQuery,
  useGetOwnersQuery,
} from '../store';

export const Buildings = () => {
  const [__forceUpdate, __setForceUpdate] = useState(0);
  useEffect(() => {
    const handleUpdate = () => __setForceUpdate(p => p + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // RTK Query Hooks for cached server state and mutations
  const { data: buildings = [], isLoading: isLoadingBuildings, error: buildingsError } = useGetPropertiesQuery();
  const { data: availableCompanies = [] } = useGetCompaniesQuery();
  const { data: availableBankAccounts = [] } = useGetBankAccountsQuery();
  const { data: owners = [] } = useGetOwnersQuery();

  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState(null);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState([]);
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formBankAccount, setFormBankAccount] = useState('');
  const [editCompanyId, setEditCompanyId] = useState('');
  const [editBankAccount, setEditBankAccount] = useState('');

  // Global Topbar Filter States (Synchronized with Redux & Topbar)
  const reduxCompanyId = useSelector((state) => state.auth?.effectiveCompanyId);
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    return reduxCompanyId || localStorage.getItem('global_selected_company_id') || localStorage.getItem('companyContext') || '';
  });
  const [selectedBuildingId, setSelectedBuildingId] = useState(() => {
    return localStorage.getItem('global_selected_building_id') || '';
  });

  // Listen to Topbar changes (CompanySelector and BuildingSelector events)
  useEffect(() => {
    const handleSync = () => {
      setSelectedCompanyId(localStorage.getItem('global_selected_company_id') || localStorage.getItem('companyContext') || '');
      setSelectedBuildingId(localStorage.getItem('global_selected_building_id') || '');
    };

    window.addEventListener('companyChanged', handleSync);
    window.addEventListener('buildingChanged', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('companyChanged', handleSync);
      window.removeEventListener('buildingChanged', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Sync when Redux effectiveCompanyId updates
  useEffect(() => {
    if (reduxCompanyId !== undefined) {
      setSelectedCompanyId(reduxCompanyId || '');
    }
  }, [reduxCompanyId]);

  // Default company selection in Add Modal
  useEffect(() => {
    if (availableCompanies.length > 0 && !formCompanyId) {
      setFormCompanyId(String(availableCompanies[0].id));
    }
  }, [availableCompanies, formCompanyId]);

  const getCompanyBankAccounts = (companyId) => {
    if (!companyId) return availableBankAccounts;
    const compId = String(companyId);
    const matched = availableBankAccounts.filter(a => String(a.companyId) === compId);
    return matched.length > 0 ? matched : availableBankAccounts;
  };

  const getAccountLabel = (acc) => {
    if (!acc) return '';
    return acc.bankName
      ? `${acc.bankName} - ${acc.accountName} (${acc.accountNumber})`
      : (acc.shortAccount || acc.accountName);
  };

  const getCompanyBankAccount = (companyId) => {
    const accounts = getCompanyBankAccounts(companyId);
    return accounts.length > 0 ? getAccountLabel(accounts[0]) : '';
  };

  // Filtered & Paginated Buildings using RTK Query cached server state and Topbar Filters
  const filteredBuildings = useMemo(() => {
    let result = buildings;

    // 1. Topbar Company Filter
    if (selectedCompanyId && selectedCompanyId !== 'all') {
      result = result.filter(b => String(b.companyId) === String(selectedCompanyId));
    }

    // 2. Topbar Building Filter
    if (selectedBuildingId && selectedBuildingId !== 'all') {
      result = result.filter(b => String(b.id) === String(selectedBuildingId));
    }

    // 3. Search Bar Filter
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(b =>
        (b.name && b.name.toLowerCase().includes(term)) ||
        (b.street && b.street.toLowerCase().includes(term)) ||
        (b.city && b.city.toLowerCase().includes(term)) ||
        (b.companyName && b.companyName.toLowerCase().includes(term)) ||
        (b.ownerNames && b.ownerNames.toLowerCase().includes(term)) ||
        (b.postalCode && b.postalCode.toLowerCase().includes(term))
      );
    }

    return result;
  }, [buildings, selectedCompanyId, selectedBuildingId, search]);

  const totalPages = Math.ceil(filteredBuildings.length / itemsPerPage) || 1;
  const paginatedBuildings = useMemo(() => {
    return filteredBuildings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredBuildings, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCompanyId, selectedBuildingId]);

  // Add new building via RTK Query mutation
  const addBuilding = async (e) => {
    e.preventDefault();
    const form = e.target;
    const selectedComp = availableCompanies.find(c => String(c.id) === String(form.companyId?.value || formCompanyId)) || availableCompanies[0];

    const selectedOwnerObjs = owners.filter(o => selectedOwnerIds.includes(o.id));
    const ownerNamesFromSelection = selectedOwnerObjs.map(o => o.name).join(', ');
    const manualOwnerName = form.ownerName?.value?.trim() || '';
    const finalOwnerNames = manualOwnerName || ownerNamesFromSelection || (owners[0]?.name || 'Demo Owner');
    const validOwnerId = selectedOwnerIds.find(id => typeof id === 'string' && id.length > 10) || (selectedOwnerObjs[0]?.id) || null;

    const civic = form.civicNumber?.value?.trim() || '';
    const street = form.street?.value?.trim() || '';
    const fullAddress = [civic, street].filter(Boolean).join(' ') || form.name.value;
    const totalUnitsCount = parseInt(form.units.value) || 0;

    const newBuilding = {
      name: form.name.value.trim(),
      companyId: selectedComp?.id || null,
      companyName: selectedComp?.name || '',
      bankAccount: form.bankAccount?.value || formBankAccount || '',
      units: totalUnitsCount,
      totalUnits: totalUnitsCount,
      status: form.status.value,
      civicNumber: civic,
      street: street,
      address: fullAddress,
      city: form.city.value || 'Montreal',
      province: form.province.value || 'Quebec',
      state: form.province.value || 'Quebec',
      postalCode: form.postalCode.value || 'H1A 1A1',
      ownerId: validOwnerId,
      ownerIds: validOwnerId ? [validOwnerId] : [],
      ownerNames: finalOwnerNames
    };

    try {
      await createProperty(newBuilding).unwrap();
      setCurrentPage(1);
      window.dispatchEvent(new Event('buildingChanged'));
      setShowModal(false);
      form.reset();
      setSelectedOwnerIds([]);
    } catch (error) {
      console.error('Error adding building:', error);
      const errMsg = error?.data?.error?.message || error?.data?.message || error?.error || 'Error adding building';
      alert(errMsg);
    }
  };

  // Delete building via RTK Query mutation
  const deleteBuilding = async (id) => {
    if (window.confirm('Are you sure you want to delete this building?')) {
      try {
        await deleteProperty(id).unwrap();
        window.dispatchEvent(new Event('buildingChanged'));
      } catch (error) {
        console.error('Error deleting building:', error);
        const errMsg = error?.data?.error?.message || error?.data?.message || error?.error || 'Error deleting building';
        alert(errMsg);
      }
    }
  };

  // View building details
  const viewBuilding = (building) => {
    setCurrentBuilding(building);
    setShowViewModal(true);
  };

  // Edit building
  const editBuilding = (building) => {
    setCurrentBuilding(building);
    const initialOwners = building.ownerId ? [building.ownerId] : (building.ownerIds || []);
    setSelectedOwnerIds(initialOwners);
    const compId = building.companyId ? String(building.companyId) : '';
    setEditCompanyId(compId);
    const autoBank = getCompanyBankAccount(compId);
    setEditBankAccount(building.bankAccount || autoBank || '');
    setShowEditModal(true);
  };

  // Update building via RTK Query mutation
  const updateBuilding = async (e) => {
    e.preventDefault();
    const form = e.target;
    const compId = form.companyId?.value || editCompanyId;
    const selectedComp = availableCompanies.find(c => String(c.id) === String(compId));

    const selectedOwnerObjs = owners.filter(o => selectedOwnerIds.includes(o.id));
    const ownerNamesFromSelection = selectedOwnerObjs.map(o => o.name).join(', ');
    const manualOwnerName = form.ownerName?.value?.trim() || '';
    const finalOwnerNames = manualOwnerName || ownerNamesFromSelection || currentBuilding.ownerNames || (owners[0]?.name || 'Demo Owner');
    const validOwnerId = selectedOwnerIds.find(id => typeof id === 'string' && id.length > 10) || currentBuilding.ownerId || (selectedOwnerObjs[0]?.id) || null;

    const nameVal = (form.name?.value || currentBuilding.name || '').trim();
    const statusVal = form.status?.value || currentBuilding.status || 'Active';
    const civic = form.civicNumber?.value?.trim() || '';
    const street = form.street?.value?.trim() || '';
    const fullAddress = [civic, street].filter(Boolean).join(' ') || currentBuilding.address || nameVal;
    const totalUnitsCount = parseInt(form.units?.value) || 0;

    const updatedData = {
      id: currentBuilding.id,
      name: nameVal,
      companyId: selectedComp ? selectedComp.id : currentBuilding.companyId,
      companyName: selectedComp ? selectedComp.name : (currentBuilding.companyName || ''),
      bankAccount: form.bankAccount?.value || editBankAccount || currentBuilding.bankAccount || '',
      units: totalUnitsCount,
      totalUnits: totalUnitsCount,
      status: statusVal,
      civicNumber: civic,
      street: street,
      address: fullAddress,
      city: form.city?.value || currentBuilding.city || 'Montreal',
      province: form.province?.value || currentBuilding.province || 'Quebec',
      state: form.province?.value || currentBuilding.province || 'Quebec',
      postalCode: form.postalCode?.value || currentBuilding.postalCode || 'H1A 1A1',
      ownerId: validOwnerId,
      ownerIds: validOwnerId ? [validOwnerId] : [],
      ownerNames: finalOwnerNames
    };

    try {
      await updateProperty(updatedData).unwrap();
      window.dispatchEvent(new Event('buildingChanged'));
      setShowEditModal(false);
      form.reset();
      setSelectedOwnerIds([]);
    } catch (error) {
      console.error('Error updating building:', error);
      const errMsg = error?.data?.error?.message || error?.data?.message || error?.error || 'Error updating building';
      alert(errMsg);
    }
  };

  // Calculated stats from RTK Query cached server state
  const calculatedTotalUnits = buildings.reduce((acc, curr) => {
    const count = Array.isArray(curr.units) ? curr.units.length : (parseInt(curr.units) || curr._count?.units || 0);
    return acc + count;
  }, 0);
  const calculatedActiveBuildings = buildings.filter(b => b.status === 'Active' || b.isActive === true).length;

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Buildings</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{buildings.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Building2 size={22} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Units</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{calculatedTotalUnits}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Home size={22} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Buildings</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{calculatedActiveBuildings}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Building2 size={22} />
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white p-4 md:px-5 rounded-[22px] border border-slate-200 shadow-sm gap-4">
          <div className="flex gap-3 items-center flex-1">
            <div className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-[#667eea] focus-within:ring-4 focus-within:ring-[#667eea]/10 transition-all w-full md:min-w-[280px]">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search buildings by name, street, city, owner, postal code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-300 w-full text-sm font-medium"
              />
            </div>
          </div>
          {hasPermission('Buildings', 'add') && (
            <Button variant="primary" onClick={() => {
              setSelectedOwnerIds([]);
              setFormBankAccount('');
              if (availableCompanies.length > 0) {
                setFormCompanyId(String(availableCompanies[0].id));
              }
              setShowModal(true);
            }} className="whitespace-nowrap flex items-center gap-2">
              <Plus size={16} />
              Add Building
            </Button>
          )}
        </div>

        {/* TABLE CARD */}
        <div className="saas-table-container flex flex-col flex-1 bg-white rounded-[22px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="saas-table w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="pl-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Building Details</th>
                  <th className="py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Company</th>
                  <th className="py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Owner(s)</th>
                  <th className="py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Street</th>
                  <th className="py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Location</th>
                  <th className="py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Postal Code</th>
                  <th className="py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Units</th>
                  <th className="py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="py-3.5 text-right pr-6 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingBuildings ? (
                  <tr>
                    <td colSpan="9" className="p-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin text-[#667eea]" />
                        <span className="text-sm font-medium">Loading buildings from RTK Query cache...</span>
                      </div>
                    </td>
                  </tr>
                ) : buildingsError ? (
                  <tr>
                    <td colSpan="9" className="p-12 text-center text-rose-500 text-sm">
                      Failed to load buildings. Please ensure backend server is running.
                    </td>
                  </tr>
                ) : paginatedBuildings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-12 text-center text-slate-500 text-sm">No buildings found.</td>
                  </tr>
                ) : (
                  paginatedBuildings.map((building) => (
                    <tr key={building.id} className="group transition-all duration-300 hover:bg-slate-50/80">
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-xs">
                            <Building2 size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">{building.name}</span>
                            <span className="text-[10px] text-[#667eea] font-black uppercase tracking-tighter">B-{building.id ? String(building.id).slice(0, 8) : ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-xs truncate max-w-[150px] inline-block">
                            {building.companyName || '-'}
                          </span>
                          {building.bankAccount && (
                            <span className="text-[10px] text-emerald-600 font-mono font-medium truncate max-w-[160px] flex items-center gap-1 mt-0.5" title={building.bankAccount}>
                              <Landmark size={10} className="shrink-0" />
                              {building.bankAccount.split('#')[0] || building.bankAccount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {building.ownerNames ? (
                            building.ownerNames.split(', ').slice(0, 1).map((owner, oIdx) => (
                              <span key={oIdx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-100 whitespace-nowrap">
                                {owner}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">No Owner</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-slate-600 text-sm truncate max-w-[200px] inline-block" title={building.street}>
                          {building.street || '-'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col justify-center gap-0.5">
                          {building.city || building.province ? (
                            <>
                              {building.city && <span className="font-bold text-slate-700 text-sm leading-tight">{building.city}</span>}
                              {building.province && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{building.province}</span>}
                            </>
                          ) : (
                            <span className="text-slate-600 text-sm">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-slate-600 text-xs font-medium">
                          {building.postalCode || '-'}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-[1rem] font-black text-[#667eea]">
                          {Array.isArray(building.units) ? building.units.length : (building.units ?? building._count?.units ?? 0)}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex justify-center">
                          <span className={`saas-badge ${(building.status === 'Active' || building.isActive === true) ? 'saas-badge-success' : 'saas-badge-danger'}`}>
                            <span className={`w-1 h-1 rounded-full ${(building.status === 'Active' || building.isActive === true) ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {building.status || (building.isActive ? 'Active' : 'Inactive')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right pr-6">
                        <div className="flex gap-2 justify-end">
                          <button
                            className="w-7 h-7 border-none rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 bg-sky-50 text-sky-600 hover:-translate-y-0.5 hover:shadow-sm"
                            title="View Details"
                            onClick={() => viewBuilding(building)}
                          >
                            <Eye size={14} />
                          </button>
                          {hasPermission('Buildings', 'edit') && (
                            <button
                              className="w-7 h-7 border-none rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 bg-emerald-50 text-emerald-600 hover:-translate-y-0.5 hover:shadow-sm"
                              title="Edit Building"
                              onClick={() => editBuilding(building)}
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {hasPermission('Buildings', 'delete') && (
                            <button
                              className="w-7 h-7 border-none rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 bg-red-50 text-red-600 hover:-translate-y-0.5 hover:shadow-sm"
                              title="Delete Building"
                              onClick={() => deleteBuilding(building.id)}
                            >
                              <Trash2 size={14} />
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
              <div className="text-sm text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBuildings.length)} of {filteredBuildings.length} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${currentPage === page
                      ? 'bg-[#667eea] text-white shadow-md scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <Button
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add Building Modal (RTK Query) */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 anim-fade-in overflow-y-auto p-0 md:p-6">
            <form id="add-building-form" className="bg-white w-full max-w-lg rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden anim-zoom-in my-auto h-[100dvh] md:h-auto md:max-h-[90vh]" onSubmit={addBuilding}>
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 md:p-8 flex justify-between items-center shrink-0 z-10">
                <h3 className="m-0 text-slate-800 text-2xl font-bold">Add New Building</h3>
                <button
                  type="button"
                  className="bg-transparent border-none cursor-pointer text-slate-400 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 hover:text-slate-700 shrink-0"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2 font-medium text-slate-600">Building Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter building name"
                    required
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyId" className="block mb-2 font-medium text-slate-600">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="companyId"
                      name="companyId"
                      value={formCompanyId}
                      required
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormCompanyId(val);
                        setFormBankAccount('');
                      }}
                      className={`w-full p-3 border-2 border-slate-200 rounded-xl text-sm transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white font-medium cursor-pointer ${!formCompanyId ? 'text-slate-400' : 'text-slate-800'}`}
                    >
                      <option value="" disabled>Select Company</option>
                      {availableCompanies.map(c => (
                        <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="bankAccount" className="block mb-2 font-medium text-slate-600">
                      Bank Account
                    </label>
                    <select
                      id="bankAccount"
                      name="bankAccount"
                      value={formBankAccount}
                      onChange={(e) => setFormBankAccount(e.target.value)}
                      className={`w-full p-3 border-2 border-slate-200 rounded-xl text-sm transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white font-medium cursor-pointer ${!formBankAccount ? 'text-slate-400' : 'text-slate-800'}`}
                    >
                      <option value="">Default Operating Account</option>
                      {getCompanyBankAccounts(formCompanyId).map(acc => {
                        const label = getAccountLabel(acc);
                        return (
                          <option key={acc.id} value={label} className="text-slate-800">
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="civicNumber" className="block mb-2 font-medium text-slate-600">Civic Number</label>
                    <input
                      type="text"
                      id="civicNumber"
                      name="civicNumber"
                      placeholder="e.g., 82"
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="street" className="block mb-2 font-medium text-slate-600">Street</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      placeholder="e.g., Allée Marthe-Rivard"
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block mb-2 font-medium text-slate-600">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="e.g., Mont-Tremblant"
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="province" className="block mb-2 font-medium text-slate-600">Province</label>
                    <select
                      id="province"
                      name="province"
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white"
                    >
                      <option value="">Select Province</option>
                      <option value="Alberta">Alberta</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="New Brunswick">New Brunswick</option>
                      <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="Ontario">Ontario</option>
                      <option value="Prince Edward Island">Prince Edward Island</option>
                      <option value="Quebec">Quebec</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="postalCode" className="block mb-2 font-medium text-slate-600">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    placeholder="e.g., J8E 2G5"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-600">Property Owner(s)</label>
                  <div className="flex flex-wrap gap-2 p-3 border-2 border-slate-200 rounded-xl bg-slate-50/30 max-h-[120px] overflow-y-auto mb-2">
                    {owners.map(owner => (
                      <label key={owner.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg cursor-pointer hover:bg-slate-100 transition-all border border-slate-200 shadow-sm">
                        <input
                          type="checkbox"
                          checked={selectedOwnerIds.includes(owner.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOwnerIds([...selectedOwnerIds, owner.id]);
                            } else {
                              setSelectedOwnerIds(selectedOwnerIds.filter(id => id !== owner.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-[#667eea] focus:ring-[#667eea]"
                        />
                        <span className="text-sm font-medium text-slate-700">{owner.name}</span>
                      </label>
                    ))}
                    {owners.length === 0 && <span className="text-slate-400 text-xs italic p-1">No owners found</span>}
                  </div>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    placeholder="Or type owner name directly (e.g., David Miller, Grand Holdings)"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="units" className="block mb-2 font-medium text-slate-600">Total Units</label>
                    <input
                      type="number"
                      id="units"
                      name="units"
                      placeholder="Enter total units"
                      min="0"
                      defaultValue="0"
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block mb-2 font-medium text-slate-600">Status</label>
                    <select
                      id="status"
                      name="status"
                      required
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 md:p-8 flex justify-end gap-3 shrink-0 z-10 w-full">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isCreating}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button form="add-building-form" type="submit" variant="primary" disabled={isCreating} className="flex items-center gap-2">
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Building</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* View Building Modal */}
        {showViewModal && currentBuilding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 anim-fade-in overflow-y-auto py-8">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl anim-zoom-in my-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="m-0 text-slate-800 text-2xl font-bold">Building Details</h3>
                <button
                  className="bg-transparent border-none cursor-pointer text-slate-400 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setShowViewModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-8 space-y-4">
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Building Name:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.name}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Company:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.companyName || '-'}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Bank Account:</span>
                  <span className="flex-1 font-semibold text-emerald-600 font-mono flex items-center gap-1.5">
                    <Landmark size={14} className="shrink-0" />
                    {currentBuilding.bankAccount || '-'}
                  </span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Owner(s):</span>
                  <span className="flex-1 font-semibold text-[#667eea]">{currentBuilding.ownerNames || 'No Owner'}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Civic Number:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.civicNumber || '-'}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Street:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.street || '-'}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">City:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.city || '-'}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Province:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.province || '-'}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Postal Code:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.postalCode || '-'}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Total Units:</span>
                  <span className="flex-1 font-semibold text-slate-800">
                    {Array.isArray(currentBuilding.units) ? currentBuilding.units.length : (currentBuilding.units ?? currentBuilding._count?.units ?? 0)}
                  </span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Status:</span>
                  <span className="flex-1">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${(currentBuilding.status === 'Active' || currentBuilding.isActive === true)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${(currentBuilding.status === 'Active' || currentBuilding.isActive === true) ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {currentBuilding.status || (currentBuilding.isActive ? 'Active' : 'Inactive')}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowViewModal(false);
                    editBuilding(currentBuilding);
                  }}
                >
                  Edit Building
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Building Modal (RTK Query) */}
        {showEditModal && currentBuilding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 anim-fade-in overflow-y-auto p-0 md:p-6">
            <form id="edit-building-form" className="bg-white w-full max-w-lg rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden anim-zoom-in my-auto h-[100dvh] md:h-auto md:max-h-[90vh]" onSubmit={updateBuilding}>
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 md:p-8 flex justify-between items-center shrink-0 z-10">
                <h3 className="m-0 text-slate-800 text-2xl font-bold">Edit Building</h3>
                <button
                  type="button"
                  className="bg-transparent border-none cursor-pointer text-slate-400 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 hover:text-slate-700 shrink-0"
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block mb-2 font-medium text-slate-600">Building Name</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    defaultValue={currentBuilding.name}
                    required
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-companyId" className="block mb-2 font-medium text-slate-600">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-companyId"
                      name="companyId"
                      value={editCompanyId}
                      required
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditCompanyId(val);
                        setEditBankAccount('');
                      }}
                      className={`w-full p-3 border-2 border-slate-200 rounded-xl text-sm transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white font-medium cursor-pointer ${!editCompanyId ? 'text-slate-400' : 'text-slate-800'}`}
                    >
                      <option value="" disabled>Select Company</option>
                      {availableCompanies.map(c => (
                        <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-bankAccount" className="block mb-2 font-medium text-slate-600">
                      Bank Account
                    </label>
                    <select
                      id="edit-bankAccount"
                      name="bankAccount"
                      value={editBankAccount}
                      onChange={(e) => setEditBankAccount(e.target.value)}
                      className={`w-full p-3 border-2 border-slate-200 rounded-xl text-sm transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white font-medium cursor-pointer ${!editBankAccount ? 'text-slate-400' : 'text-slate-800'}`}
                    >
                      <option value="">Default Operating Account</option>
                      {getCompanyBankAccounts(editCompanyId).map(acc => {
                        const label = getAccountLabel(acc);
                        return (
                          <option key={acc.id} value={label} className="text-slate-800">
                            {label}
                          </option>
                        );
                      })}
                      {editBankAccount && !getCompanyBankAccounts(editCompanyId).some(acc => getAccountLabel(acc) === editBankAccount || acc.shortAccount === editBankAccount) && (
                        <option value={editBankAccount} className="text-slate-800">{editBankAccount} (Current)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-civicNumber" className="block mb-2 font-medium text-slate-600">Civic Number</label>
                    <input
                      type="text"
                      id="edit-civicNumber"
                      name="civicNumber"
                      defaultValue={currentBuilding.civicNumber || ''}
                      placeholder="e.g., 82"
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-street" className="block mb-2 font-medium text-slate-600">Street</label>
                    <input
                      type="text"
                      id="edit-street"
                      name="street"
                      defaultValue={currentBuilding.street || ''}
                      placeholder="e.g., Allée Marthe-Rivard"
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-city" className="block mb-2 font-medium text-slate-600">City</label>
                    <input
                      type="text"
                      id="edit-city"
                      name="city"
                      defaultValue={currentBuilding.city || ''}
                      placeholder="e.g., Mont-Tremblant"
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-province" className="block mb-2 font-medium text-slate-600">Province</label>
                    <select
                      id="edit-province"
                      name="province"
                      defaultValue={currentBuilding.province || ''}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white"
                    >
                      <option value="">Select Province</option>
                      <option value="Alberta">Alberta</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="New Brunswick">New Brunswick</option>
                      <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="Ontario">Ontario</option>
                      <option value="Prince Edward Island">Prince Edward Island</option>
                      <option value="Quebec">Quebec</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-postalCode" className="block mb-2 font-medium text-slate-600">Postal Code</label>
                  <input
                    type="text"
                    id="edit-postalCode"
                    name="postalCode"
                    defaultValue={currentBuilding.postalCode || ''}
                    placeholder="e.g., J8E 2G5"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-600">Assign Owner(s)</label>
                  <div className="flex flex-wrap gap-2 p-3 border-2 border-slate-200 rounded-xl bg-slate-50/30 max-h-[120px] overflow-y-auto">
                    {owners.map(owner => (
                      <label key={owner.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg cursor-pointer hover:bg-slate-100 transition-all border border-slate-200 shadow-sm">
                        <input
                          type="checkbox"
                          checked={selectedOwnerIds.includes(owner.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOwnerIds([...selectedOwnerIds, owner.id]);
                            } else {
                              setSelectedOwnerIds(selectedOwnerIds.filter(id => id !== owner.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-[#667eea] focus:ring-[#667eea]"
                        />
                        <span className="text-sm font-medium text-slate-700">{owner.name}</span>
                      </label>
                    ))}
                    {owners.length === 0 && <span className="text-slate-400 text-xs italic p-1">No owners found</span>}
                  </div>
                  <input
                    type="text"
                    id="edit-ownerName"
                    name="ownerName"
                    defaultValue={currentBuilding.ownerNames || ''}
                    placeholder="Or type owner name directly (e.g. David Miller, Grand Holdings)"
                    className="w-full mt-2 p-3 border-2 border-slate-200 rounded-xl text-sm transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-units" className="block mb-2 font-medium text-slate-600">Total Units</label>
                    <input
                      type="number"
                      id="edit-units"
                      name="units"
                      defaultValue={Array.isArray(currentBuilding.units) ? currentBuilding.units.length : (currentBuilding.units ?? currentBuilding._count?.units ?? 0)}
                      min="0"
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-status" className="block mb-2 font-medium text-slate-600">Status</label>
                    <select
                      id="edit-status"
                      name="status"
                      defaultValue={currentBuilding.status}
                      required
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 md:p-8 flex justify-end gap-3 shrink-0 z-10 w-full">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isUpdating}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button form="edit-building-form" type="submit" variant="primary" disabled={isUpdating} className="flex items-center gap-2">
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Building</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Buildings;
