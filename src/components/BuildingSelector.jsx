import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Building2 } from 'lucide-react';

export const BuildingSelector = () => {
    const [buildings, setBuildings] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchBuildings = async () => {
        try {
            // Read properties
            let allProps = [];
            try {
                const stored = localStorage.getItem('mock_properties');
                if (stored) {
                    allProps = JSON.parse(stored);
                }
            } catch (e) {
                console.error('Failed reading mock_properties:', e);
            }

            if (!allProps || allProps.length === 0) {
                const res = await api.get('/api/admin/properties');
                allProps = res.data?.data || res.data || [];
            }

            // Filter buildings by current active company if one is selected
            const activeCompanyId = localStorage.getItem('global_selected_company_id');
            let filtered = allProps;
            if (activeCompanyId && activeCompanyId !== 'all' && activeCompanyId !== '') {
                filtered = allProps.filter(p => p.companyId === parseInt(activeCompanyId));
            }

            setBuildings(filtered);

            // Verify if saved building is still in the valid list
            const savedBuildingId = localStorage.getItem('global_selected_building_id') || '';
            if (savedBuildingId) {
                const exists = filtered.some(b => b.id.toString() === savedBuildingId.toString());
                if (exists) {
                    setSelectedId(savedBuildingId);
                } else {
                    localStorage.setItem('global_selected_building_id', '');
                    setSelectedId('');
                }
            } else {
                setSelectedId('');
            }
        } catch (error) {
            console.error('Failed to load buildings for selector', error);
        }
    };

    useEffect(() => {
        fetchBuildings();

        const handleSync = () => {
            fetchBuildings();
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

    const handleChange = (e) => {
        const val = e.target.value;
        localStorage.setItem('global_selected_building_id', val);
        setSelectedId(val);

        // If a specific building was chosen, align active company if needed
        if (val) {
            const foundBuilding = buildings.find(b => b.id.toString() === val.toString());
            if (foundBuilding && foundBuilding.companyId) {
                const currentComp = localStorage.getItem('global_selected_company_id');
                if (currentComp !== foundBuilding.companyId.toString()) {
                    localStorage.setItem('global_selected_company_id', foundBuilding.companyId.toString());
                }
            }
        }

        window.dispatchEvent(new Event('buildingChanged'));
        window.dispatchEvent(new Event('companyChanged'));
    };

    if (user.role === 'TENANT') return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100/80 rounded-[var(--radius-md)] border border-zinc-200 min-w-[120px] sm:min-w-[170px] h-9 transition-colors group relative">
            <Building2 size={16} className="hidden sm:block text-zinc-400 group-hover:text-zinc-600 transition-colors shrink-0" />
            <select
                value={selectedId}
                onChange={handleChange}
                className="bg-transparent border-none outline-none text-zinc-800 font-semibold text-xs sm:text-sm cursor-pointer w-full appearance-none pr-6 truncate"
            >
                <option value="">All Buildings</option>
                {buildings.map(b => (
                    <option key={b.id} value={b.id}>
                        {b.name}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
        </div>
    );
};

export default BuildingSelector;
