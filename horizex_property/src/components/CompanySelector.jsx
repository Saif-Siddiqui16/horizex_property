import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Briefcase } from 'lucide-react';
import { useGetCompaniesQuery, setCompanyContext } from '../store';

export const CompanySelector = () => {
    const dispatch = useDispatch();
    const effectiveCompanyId = useSelector((state) => state.auth?.effectiveCompanyId);
    const { data: companies = [] } = useGetCompaniesQuery();
    const [selectedId, setSelectedId] = useState(() => {
        return localStorage.getItem('global_selected_company_id') || '';
    });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Synchronize default company selection on companies data load
    useEffect(() => {
        if (!companies || companies.length === 0) return;

        const saved = localStorage.getItem('global_selected_company_id') || effectiveCompanyId;
        const exists = saved && companies.some(c => c.id.toString() === saved.toString());

        if (exists) {
            setSelectedId(saved);
            dispatch(setCompanyContext(saved));
            localStorage.setItem('companyContext', saved);
        } else if (companies.length === 1) {
            const singleId = companies[0].id.toString();
            setSelectedId(singleId);
            dispatch(setCompanyContext(singleId));
            localStorage.setItem('global_selected_company_id', singleId);
            localStorage.setItem('companyContext', singleId);
        } else {
            setSelectedId('');
            dispatch(setCompanyContext(null));
            localStorage.setItem('global_selected_company_id', '');
            localStorage.setItem('companyContext', '');
        }
    }, [companies, dispatch]);

    // Keep state in sync with external storage/building changes
    useEffect(() => {
        const handleStorageChange = () => {
            const current = localStorage.getItem('global_selected_company_id') || '';
            setSelectedId(current);
            dispatch(setCompanyContext(current || null));
        };

        window.addEventListener('companyChanged', handleStorageChange);
        window.addEventListener('buildingChanged', handleStorageChange);
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('companyChanged', handleStorageChange);
            window.removeEventListener('buildingChanged', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [dispatch]);

    const handleChange = (e) => {
        const val = e.target.value;
        setSelectedId(val);
        dispatch(setCompanyContext(val || null));
        localStorage.setItem('global_selected_company_id', val);
        localStorage.setItem('companyContext', val);
        // Reset building selection when switching company
        localStorage.setItem('global_selected_building_id', '');
        window.dispatchEvent(new Event('companyChanged'));
        window.dispatchEvent(new Event('buildingChanged'));
    };

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
