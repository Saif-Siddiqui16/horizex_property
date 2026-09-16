import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Briefcase } from 'lucide-react';

export const CompanySelector = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await api.get('/api/admin/companies');
                const list = res.data || [];
                setCompanies(list);
                
                // Initialize default selection
                const saved = localStorage.getItem('global_selected_company_id');
                if (saved) {
                    // Verify if saved company is in allowed list
                    const exists = list.some(c => c.id.toString() === saved.toString());
                    if (exists) {
                        setSelectedId(saved);
                    } else if (list.length === 1) {
                        // Lock to the only assigned company
                        localStorage.setItem('global_selected_company_id', list[0].id.toString());
                        setSelectedId(list[0].id.toString());
                    } else {
                        localStorage.setItem('global_selected_company_id', '');
                        setSelectedId('');
                    }
                } else if (list.length === 1) {
                    localStorage.setItem('global_selected_company_id', list[0].id.toString());
                    setSelectedId(list[0].id.toString());
                } else {
                    localStorage.setItem('global_selected_company_id', '');
                    setSelectedId('');
                }
            } catch (error) {
                console.error('Failed to fetch companies', error);
            }
        };

        fetchCompanies();

        // Listen for changes in company from other parts if needed
        const handleStorageChange = () => {
            const current = localStorage.getItem('global_selected_company_id') || '';
            setSelectedId(current);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        localStorage.setItem('global_selected_company_id', val);
        setSelectedId(val);
        window.dispatchEvent(new Event('companyChanged'));
    };

    // If landlord or maintenance with single building limit, or if no companies, we can hide or restrict.
    // If user has no company access (like basic Tenant), don't render.
    if (user.role === 'TENANT') return null;

    // Show "All Companies" option only if user has access to more than one company.
    const showAllOption = companies.length > 1;

    return (
        <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 bg-slate-100/80 rounded-xl border border-slate-200/50 min-w-[100px] sm:min-w-[150px] md:min-w-[200px] h-8 sm:h-9">
            <Briefcase size={14} className="hidden sm:block text-slate-400 shrink-0" />
            <select
                value={selectedId}
                onChange={handleChange}
                className="bg-transparent border-none outline-none text-slate-700 font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wider cursor-pointer w-full appearance-none pr-3 sm:pr-4"
            >
                {showAllOption && (
                    <option value="">All Companies</option>
                )}
                {companies.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
export default CompanySelector;
