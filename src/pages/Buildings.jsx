import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Search, Filter, Eye, Pencil, Trash2, Building2, Home, X } from 'lucide-react';
import api from '../api/client';
import { hasPermission } from '../utils/permissions';

export const Buildings = () => {
  const [__forceUpdate, __setForceUpdate] = useState(0);
  useEffect(() => {
    const handleUpdate = () => __setForceUpdate(p => p + 1);
    window.addEventListener('permissionsUpdated', handleUpdate);
    return () => window.removeEventListener('permissionsUpdated', handleUpdate);
  }, []);

  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState('');
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState(null);
  const [owners, setOwners] = useState([]);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState([]);

  // Fetch buildings and owners from API
  useEffect(() => {
    fetchBuildings(currentPage, search);
    fetchOwners();
  }, [currentPage, itemsPerPage]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 on search
      fetchBuildings(1, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    const handleCompanyChange = () => {
      setCurrentPage(1);
      fetchBuildings(1, search);
    };
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [search]);


  const fetchOwners = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'ADMIN') return;

    try {
      const response = await api.get('/api/admin/owners');
      setOwners(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchBuildings = async (page = 1, searchQuery = '') => {
    try {
      // Use pagination endpoint
      const response = await api.get(`/api/admin/properties?page=${page}&limit=${itemsPerPage}&search=${searchQuery}`);

      if (response.data.data && response.data.meta) {
        // Handle paginated response
        setBuildings(response.data.data || []);
        setTotalPages(response.data.meta.totalPages || 1);
        setTotalItems(response.data.meta.total || 0);
      } else {
        // Fallback or full list (as seen in user response)
        const data = Array.isArray(response.data) ? response.data : [];
        setBuildings(data);
        setTotalItems(data.length);
        setTotalPages(Math.ceil(data.length / itemsPerPage) || 1);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  // Client-side filtering is no longer needed if we use backend search
  // But strictly speaking, the original code had client side filtering. 
  // If backend returns paginated results, we MUST use backend search. 
  // Client-side filtering/pagination if backend returns full list
  const filteredBuildings = buildings.length > itemsPerPage
    ? buildings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : buildings;

  // Add new building
  const addBuilding = async (e) => {
    e.preventDefault();
    const form = e.target;
    // Note: Backend handles unit generation based on 'units' count
    const newBuilding = {
      name: form.name.value,
      units: parseInt(form.units.value),
      status: form.status.value,
      civicNumber: form.civicNumber.value,
      street: form.street.value,
      city: form.city.value,
      province: form.province.value,
      postalCode: form.postalCode.value,
      ownerIds: [] // Assigned later via edit
    };

    try {
      const response = await api.post('/api/admin/properties', newBuilding);
      setCurrentPage(1); // Reset to page 1 so new building (at top) is visible
      await fetchBuildings(1, search);
      setShowModal(false);
      form.reset();
    } catch (error) {
      console.error('Error adding building:', error);
      alert('Error adding building');
    }
  };

  // Delete building
  const deleteBuilding = async (id) => {
    if (window.confirm('Are you sure you want to delete this building?')) {
      try {
        await api.delete(`/api/admin/properties/${id}`);
        // Refresh list
        fetchBuildings(currentPage, search);
      } catch (error) {
        console.error('Error deleting building:', error);
        alert('Error deleting building');
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
    setSelectedOwnerIds(building.ownerIds || []);
    setShowEditModal(true);
  };

  // Update building
  const updateBuilding = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedData = {
      name: form.name.value,
      units: parseInt(form.units.value),
      status: form.status.value,
      civicNumber: form.civicNumber.value,
      street: form.street.value,
      city: form.city.value,
      province: form.province.value,
      postalCode: form.postalCode.value,
      ownerIds: selectedOwnerIds
    };

    try {
      const response = await api.put(`/api/admin/properties/${currentBuilding.id}`, updatedData);
      fetchBuildings(currentPage, search);
      setShowEditModal(false);
      form.reset();
    } catch (error) {
      console.error('Error updating building:', error);
      alert('Error updating building');
    }
  };

  // Calculate stats from the fetched buildings data
  const calculatedTotalUnits = buildings.reduce((acc, curr) => acc + (parseInt(curr.units) || 0), 0);
  const calculatedActiveBuildings = buildings.filter(b => b.status === 'Active').length;

  return (
    <MainLayout title="Buildings">
      <div className="flex flex-col gap-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[22px] border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Buildings</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{totalItems || buildings.length}</p>
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
            <div className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all w-full md:min-w-[280px]">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search buildings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-300 w-full text-sm font-medium"
              />
            </div>
          </div>
          {hasPermission('Buildings', 'add') && (
            <Button variant="primary" onClick={() => {
              setSelectedOwnerIds([]);
              setShowModal(true);
            }} className="whitespace-nowrap">
              <Plus size={16} />
              Add Building
            </Button>
          )}
        </div>

        {/* TABLE CARD */}
        <div className="saas-table-container flex flex-col flex-1">
          <div className="overflow-x-auto w-full">
            <table className="saas-table w-full text-left whitespace-nowrap">
              <thead>
                <tr>
                  <th className="pl-6">Building Details</th>
                  <th>Company</th>
                  <th>Owner(s)</th>
                  <th>Street</th>
                  <th>Location</th>
                  <th>Postal Code</th>
                  <th className="text-center">Units</th>
                  <th className="text-center">Status</th>
                  <th className="text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
              {filteredBuildings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500">No buildings found.</td>
                </tr>
              ) : (
                filteredBuildings.map((building, index) => (
                  <tr key={building.id} className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white hover:scale-[1.002] hover:shadow-md">
                    <td className="pl-6">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                          <Building2 size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{building.name}</span>
                          <span className="text-[10px] text-[#667eea] font-black uppercase tracking-tighter">B-{building.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-slate-700 text-xs truncate max-w-[150px] inline-block">
                        {building.companyName || '-'}
                      </span>
                    </td>
                    <td>
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
                    <td>
                      <span className="text-slate-600 text-sm truncate max-w-[200px] inline-block" title={building.street}>
                        {building.street || '-'}
                      </span>
                    </td>
                    <td>
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
                    <td>
                      <span className="text-slate-600 text-xs font-medium">
                        {building.postalCode || '-'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-[1rem] font-black text-[#667eea]">{building.units}</span>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center">
                        <span className={`saas-badge ${building.status === 'Active' ? 'saas-badge-success' : 'saas-badge-danger'}`}>
                          <span className={`w-1 h-1 rounded-full ${building.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {building.status}
                        </span>
                      </div>
                    </td>
                    <td className="text-right pr-6">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="w-7 h-7 border-none rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 bg-sky-50 text-sky-600 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(2,132,199,0.2)] hover:scale-110"
                          title="View Details"
                          onClick={() => viewBuilding(building)}
                        >
                          <Eye size={12} />
                        </button>
                        {hasPermission('Buildings', 'edit') && (
                          <button
                            className="w-7 h-7 border-none rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 bg-emerald-50 text-emerald-600 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(22,163,74,0.2)] hover:scale-110"
                            title="Edit Building"
                            onClick={() => editBuilding(building)}
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                        {hasPermission('Buildings', 'delete') && (
                          <button
                            className="w-7 h-7 border-none rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 bg-red-50 text-red-600 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(220,38,38,0.2)] hover:scale-110"
                            title="Delete Building"
                            onClick={() => deleteBuilding(building.id)}
                          >
                            <Trash2 size={12} />
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
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

        {/* Add Building Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 overflow-y-auto p-0 md:p-6">
            <form id="add-building-form" className="bg-white w-full max-w-lg rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 my-auto h-[100dvh] md:h-auto md:max-h-[90vh]" onSubmit={addBuilding}>
              
              {/* Sticky Modal Header */}
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

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2 font-medium text-slate-600">Building Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter building name"
                    required
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 bg-white"
                  />
                </div>

                {/* Address Fields */}
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

              {/* Sticky Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 md:p-8 flex justify-end gap-3 shrink-0 z-10 w-full">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button form="add-building-form" type="submit" variant="primary">
                  Add Building
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* View Building Modal */}
        {showViewModal && currentBuilding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 overflow-y-auto py-8">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
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
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.units}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Status:</span>
                  <span className="flex-1">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${currentBuilding.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${currentBuilding.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {currentBuilding.status}
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

        {/* Edit Building Modal */}
        {showEditModal && currentBuilding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 overflow-y-auto p-0 md:p-6">
            <form id="edit-building-form" className="bg-white w-full max-w-lg rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 my-auto h-[100dvh] md:h-auto md:max-h-[90vh]" onSubmit={updateBuilding}>
              
              {/* Sticky Modal Header */}
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

              {/* Scrollable Form Body */}
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

                {/* Address Fields */}
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-units" className="block mb-2 font-medium text-slate-600">Total Units</label>
                    <input
                      type="number"
                      id="edit-units"
                      name="units"
                      defaultValue={currentBuilding.units}
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

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 md:p-8 flex justify-end gap-3 shrink-0 z-10 w-full">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button form="edit-building-form" type="submit" variant="primary">
                  Update Building
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Buildings;