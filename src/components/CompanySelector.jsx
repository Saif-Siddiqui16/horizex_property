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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100/80 rounded-[var(--radius-md)] border border-zinc-200 min-w-[120px] sm:min-w-[180px] h-9 transition-colors group relative">
            <Briefcase size={16} className="hidden sm:block text-zinc-400 group-hover:text-zinc-600 transition-colors shrink-0" />
            <select
                value={selectedId}
                onChange={handleChange}
                className="bg-transparent border-none outline-none text-zinc-800 font-semibold text-xs sm:text-sm cursor-pointer w-full appearance-none pr-6 truncate"
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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
        </div>
    );
};
export default CompanySelector;
