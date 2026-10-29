import React, { useState, useEffect } from 'react';
import {
    Landmark,
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    Building2,
    Calendar,
    Filter,
    Search,
    Plus,
    CheckCircle2,
    Receipt,
    Wallet,
    CreditCard,
    FileText,
    TrendingUp,
    TrendingDown,
    Trash2,
    Pencil,
    X
} from 'lucide-react';
import { Button } from '../components/Button';
import clsx from 'clsx';
import { mockCompanies } from '../mock/companies';

const STORAGE_KEY = 'horizex_bank_accounts_data_v2';

const EMPTY_BANK_DATA = {
    accounts: [],
    transactions: []
};

// Helper to get companies from localStorage or fallback
const getStoredCompanies = () => {
    try {
        const stored = localStorage.getItem('mock_companies');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}
    return mockCompanies;
};

// Helper to get real properties from localStorage
const getStoredBuildings = () => {
    try {
        const stored = localStorage.getItem('mock_properties');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}
    return [];
};

export const BankAccounts = () => {
    // Load persisted bank account data or start empty
    const [bankData, setBankData] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && Array.isArray(parsed.accounts) && Array.isArray(parsed.transactions)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Failed to load bank accounts data:', e);
        }
        return EMPTY_BANK_DATA;
    });

    const [companies, setCompanies] = useState(getStoredCompanies);
    const [buildingsList, setBuildingsList] = useState(getStoredBuildings);

    const [selectedAccountId, setSelectedAccountId] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.accounts && parsed.accounts.length > 0) {
                    return parsed.accounts[0].id;
                }
            } catch (e) {}
        }
        return null;
    });

    const [filterType, setFilterType] = useState('ALL'); // ALL, INCOME, EXPENSE
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [showPayBillModal, setShowPayBillModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // New Bank Account Form State
    const [newAccountForm, setNewAccountForm] = useState({
        companyMode: 'existing', // 'existing' or 'new'
        companyId: '',
        newCompanyName: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        openingBalance: '',
        currency: 'CAD'
    });

    // Edit Bank Account Form State
    const [showEditAccountModal, setShowEditAccountModal] = useState(false);
    const [editAccountForm, setEditAccountForm] = useState({
        id: null,
        companyId: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        balance: '',
        currency: 'CAD'
    });

    // Bill payment form state
    const [billForm, setBillForm] = useState({
        building: '',
        description: '',
        category: 'Utilities',
        amount: '',
        reference: ''
    });

    // Deposit form state
    const [depositForm, setDepositForm] = useState({
        building: '',
        description: '',
        category: 'Rent Collection',
        amount: '',
        reference: ''
    });

    // Save to localStorage whenever bankData changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bankData));
            // Notify other components like Buildings.jsx
            window.dispatchEvent(new Event('bankAccountsUpdated'));
        } catch (e) {
            console.error('Failed to save bank data:', e);
        }
    }, [bankData]);

    // Keep companies & buildings in sync
    useEffect(() => {
        const handleSync = () => {
            setCompanies(getStoredCompanies());
            setBuildingsList(getStoredBuildings());
        };
        window.addEventListener('companyChanged', handleSync);
        return () => window.removeEventListener('companyChanged', handleSync);
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Current selected account object
    const currentAccount = bankData.accounts.find(a => a.id === selectedAccountId) || bankData.accounts[0] || null;

    // Filter transactions for the selected bank account
    const accountTransactions = currentAccount
        ? bankData.transactions.filter(t => t.accountId === currentAccount.id)
        : [];

    const filteredTransactions = accountTransactions.filter(t => {
        const matchesType = filterType === 'ALL' || t.type === filterType;
        const matchesSearch =
            (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.building || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Calculate stats
    const totalDeposited = accountTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const totalBillsPaid = accountTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    // ==========================================
    // CREATE NEW BANK ACCOUNT (DYNAMIC)
    // ==========================================
    const handleCreateAccount = (e) => {
        e.preventDefault();

        let targetCompanyId = parseInt(newAccountForm.companyId);
        let targetCompanyName = '';

        if (newAccountForm.companyMode === 'new') {
            targetCompanyName = newAccountForm.newCompanyName.trim();
            if (!targetCompanyName) {
                alert('Please enter a company name.');
                return;
            }
            const currentCompanies = getStoredCompanies();
            targetCompanyId = currentCompanies.length ? Math.max(...currentCompanies.map(c => c.id)) + 1 : 1;
            const newComp = {
                id: targetCompanyId,
                name: targetCompanyName,
                code: targetCompanyName.slice(0, 4).toUpperCase(),
                bankName: newAccountForm.bankName,
                bankAccount: `${newAccountForm.bankName} #${newAccountForm.accountNumber}`,
                shortAccount: `${newAccountForm.bankName} (${targetCompanyName})`,
                ownerName: 'Admin User'
            };
            const updatedCompanies = [...currentCompanies, newComp];
            localStorage.setItem('mock_companies', JSON.stringify(updatedCompanies));
            setCompanies(updatedCompanies);
            window.dispatchEvent(new Event('companyChanged'));
        } else {
            const currentCompanies = getStoredCompanies();
            const matchedComp = currentCompanies.find(c => c.id === targetCompanyId);
            if (!matchedComp) {
                alert('Please select a company.');
                return;
            }
            targetCompanyName = matchedComp.name;
        }

        const newAccountId = bankData.accounts.length ? Math.max(...bankData.accounts.map(a => a.id)) + 1 : 1;
        const openingBal = parseFloat(newAccountForm.openingBalance) || 0;
        const shortAccountName = `${newAccountForm.bankName} (${targetCompanyName})`;

        const newAccount = {
            id: newAccountId,
            companyId: targetCompanyId,
            companyName: targetCompanyName,
            bankName: newAccountForm.bankName,
            accountName: newAccountForm.accountName || `${newAccountForm.bankName} Operating`,
            shortAccount: shortAccountName,
            accountNumber: newAccountForm.accountNumber,
            routingNumber: newAccountForm.routingNumber || '001-00000',
            balance: openingBal,
            currency: newAccountForm.currency || 'CAD',
            buildingsCount: 0,
            color: 'border-blue-500'
        };

        const newTransactions = [...bankData.transactions];
        if (openingBal > 0) {
            newTransactions.unshift({
                id: `TX-${Date.now()}`,
                accountId: newAccountId,
                companyId: targetCompanyId,
                date: new Date().toISOString().split('T')[0],
                building: '-',
                description: 'Opening Balance Deposit',
                category: 'Initial Deposit',
                type: 'INCOME',
                amount: openingBal,
                balanceAfter: openingBal,
                reference: `DEP-00${newAccountId}`
            });
        }

        setBankData({
            accounts: [...bankData.accounts, newAccount],
            transactions: newTransactions
        });
        setSelectedAccountId(newAccountId);
        setShowAddAccountModal(false);
        setNewAccountForm({
            companyMode: 'existing',
            companyId: '',
            newCompanyName: '',
            bankName: '',
            accountName: '',
            accountNumber: '',
            routingNumber: '',
            openingBalance: '',
            currency: 'CAD'
        });
        showToast(`Bank account "${newAccount.accountName}" added successfully.`);
    };

    // ==========================================
    // EDIT BANK ACCOUNT
    // ==========================================
    const handleOpenEditModal = (acc) => {
        setEditAccountForm({
            id: acc.id,
            companyId: String(acc.companyId || ''),
            bankName: acc.bankName || '',
            accountName: acc.accountName || '',
            accountNumber: acc.accountNumber || '',
            routingNumber: acc.routingNumber || '',
            balance: acc.balance !== undefined ? String(acc.balance) : '0',
            currency: acc.currency || 'CAD'
        });
        setShowEditAccountModal(true);
    };

    const handleUpdateAccount = (e) => {
        e.preventDefault();
        if (!editAccountForm.id) return;

        const matchedComp = companies.find(c => c.id === parseInt(editAccountForm.companyId));
        const targetCompanyName = matchedComp ? matchedComp.name : (currentAccount ? currentAccount.companyName : '');
        const shortAcc = `${editAccountForm.bankName} (${targetCompanyName})`;

        const updatedAccounts = bankData.accounts.map(acc => {
            if (acc.id === editAccountForm.id) {
                return {
                    ...acc,
                    companyId: matchedComp ? matchedComp.id : acc.companyId,
                    companyName: targetCompanyName,
                    bankName: editAccountForm.bankName,
                    accountName: editAccountForm.accountName,
                    shortAccount: shortAcc,
                    accountNumber: editAccountForm.accountNumber,
                    routingNumber: editAccountForm.routingNumber,
                    balance: parseFloat(editAccountForm.balance) || 0,
                    currency: editAccountForm.currency || 'CAD'
                };
            }
            return acc;
        });

        setBankData({
            ...bankData,
            accounts: updatedAccounts
        });

        setShowEditAccountModal(false);
        showToast(`Bank account "${editAccountForm.accountName}" updated successfully.`);
    };

    // ==========================================
    // DELETE BANK ACCOUNT
    // ==========================================
    const handleDeleteAccount = (accId) => {
        const accToDelete = bankData.accounts.find(a => a.id === accId);
        if (!accToDelete) return;

        if (window.confirm(`Are you sure you want to remove "${accToDelete.accountName}"?`)) {
            const remainingAccounts = bankData.accounts.filter(a => a.id !== accId);
            const remainingTransactions = bankData.transactions.filter(t => t.accountId !== accId);
            const nextSelectedId = remainingAccounts.length > 0 ? remainingAccounts[0].id : null;

            setBankData({
                accounts: remainingAccounts,
                transactions: remainingTransactions
            });
            setSelectedAccountId(nextSelectedId);
            showToast(`Bank account "${accToDelete.accountName}" removed.`);
        }
    };

    // ==========================================
    // PAY BILL (MONEY OUT / DEBIT)
    // ==========================================
    const handlePayBill = (e) => {
        e.preventDefault();
        if (!currentAccount) return;

        const amt = parseFloat(billForm.amount);
        if (isNaN(amt) || amt <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const newBalance = currentAccount.balance - amt;
        const newTx = {
            id: `TX-${Date.now()}`,
            accountId: currentAccount.id,
            companyId: currentAccount.companyId,
            date: new Date().toISOString().split('T')[0],
            building: billForm.building || 'General Property',
            description: billForm.description || 'Vendor Bill Paid',
            category: billForm.category,
            type: 'EXPENSE',
            amount: amt,
            balanceAfter: newBalance,
            reference: billForm.reference || `BILL-${Date.now().toString().slice(-5)}`
        };

        const updatedAccounts = bankData.accounts.map(acc => {
            if (acc.id === currentAccount.id) {
                return { ...acc, balance: newBalance };
            }
            return acc;
        });

        setBankData({
            accounts: updatedAccounts,
            transactions: [newTx, ...bankData.transactions]
        });

        setShowPayBillModal(false);
        setBillForm({ building: '', description: '', category: 'Utilities', amount: '', reference: '' });
        showToast(`Bill paid. $${amt.toFixed(2)} deducted from ${currentAccount.accountName}.`);
    };

    // ==========================================
    // RECORD DEPOSIT (MONEY IN / CREDIT)
    // ==========================================
    const handleRecordDeposit = (e) => {
        e.preventDefault();
        if (!currentAccount) return;

        const amt = parseFloat(depositForm.amount);
        if (isNaN(amt) || amt <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const newBalance = currentAccount.balance + amt;
        const newTx = {
            id: `TX-${Date.now()}`,
            accountId: currentAccount.id,
            companyId: currentAccount.companyId,
            date: new Date().toISOString().split('T')[0],
            building: depositForm.building || 'General Property',
            description: depositForm.description || 'Tenant Payment Received',
            category: depositForm.category,
            type: 'INCOME',
            amount: amt,
            balanceAfter: newBalance,
            reference: depositForm.reference || `PAY-${Date.now().toString().slice(-5)}`
        };

        const updatedAccounts = bankData.accounts.map(acc => {
            if (acc.id === currentAccount.id) {
                return { ...acc, balance: newBalance };
            }
            return acc;
        });

        setBankData({
            accounts: updatedAccounts,
            transactions: [newTx, ...bankData.transactions]
        });

        setShowDepositModal(false);
        setDepositForm({ building: '', description: '', category: 'Rent Collection', amount: '', reference: '' });
        showToast(`Payment recorded. $${amt.toFixed(2)} deposited into ${currentAccount.accountName}.`);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* TOAST NOTIFICATION */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-sm border border-zinc-700 animate-in fade-in">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                        <Landmark className="text-blue-600" size={26} />
                        Company Bank Accounts
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Track separate operating bank accounts for each company, monitor live balances, and route rent payments & bills automatically.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        onClick={() => setShowAddAccountModal(true)}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-xl shadow-xs"
                    >
                        <Plus size={15} />
                        <span>Add Bank Account</span>
                    </Button>

                    {bankData.accounts.length > 0 && (
                        <>
                            <Button
                                onClick={() => setShowDepositModal(true)}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl shadow-xs"
                            >
                                <ArrowDownLeft size={15} />
                                <span>Record Payment (In)</span>
                            </Button>

                            <Button
                                onClick={() => setShowPayBillModal(true)}
                                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-3.5 py-2 rounded-xl shadow-xs"
                            >
                                <ArrowUpRight size={15} />
                                <span>Pay Bill (Out)</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* IF NO ACCOUNTS EXIST (EMPTY STATE) */}
            {bankData.accounts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 shadow-xs max-w-2xl mx-auto my-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <Landmark size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Bank Accounts Added Yet</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                        Create an operating bank account for your companies to start tracking balances, tenant rent deposits, and vendor bills.
                    </p>
                    <Button
                        onClick={() => setShowAddAccountModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 shadow-xs"
                    >
                        <Plus size={18} />
                        <span>Add First Bank Account</span>
                    </Button>
                </div>
            ) : (
                <>
                    {/* 🏢 BANK ACCOUNT SELECTOR CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {bankData.accounts.map((acc) => {
                            const isSelected = acc.id === selectedAccountId;
                            return (
                                <div
                                    key={acc.id}
                                    onClick={() => setSelectedAccountId(acc.id)}
                                    className={clsx(
                                        "p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden bg-white shadow-xs",
                                        isSelected
                                            ? "border-blue-600 ring-4 ring-blue-500/10 shadow-md"
                                            : "border-zinc-200 hover:border-zinc-300 hover:shadow-xs"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                                                {acc.companyName}
                                            </span>
                                            <h3 className="text-base font-bold text-zinc-900 mt-0.5">{acc.accountName}</h3>
                                            <p className="text-xs font-mono text-zinc-500">{acc.bankName} • {acc.accountNumber}</p>
                                        </div>
                                        <div
                                            className={clsx(
                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                                isSelected ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500"
                                            )}
                                        >
                                            <Landmark size={18} />
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-zinc-100 flex items-baseline justify-between">
                                        <div>
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Live Balance</span>
                                            <p className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
                                                ${(acc.balance || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <span className={clsx(
                                            "text-xs px-2 py-0.5 rounded-full font-bold",
                                            isSelected ? "bg-blue-100 text-blue-800" : "bg-zinc-100 text-zinc-600"
                                        )}>
                                            {isSelected ? "Active View" : "Select"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* SELECTED ACCOUNT SUMMARY BANNER */}
                    {currentAccount && (
                        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-zinc-900">{currentAccount.accountName}</h2>
                                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono">
                                            {currentAccount.accountNumber}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditModal(currentAccount)}
                                            title="Edit this bank account"
                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 ml-1"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAccount(currentAccount.id)}
                                            title="Delete this bank account"
                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Operating account for <span className="font-semibold text-zinc-800">{currentAccount.companyName}</span> • Routing Transit: {currentAccount.routingNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100">
                                <div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                        <TrendingUp size={12} /> Total Deposits
                                    </span>
                                    <p className="text-lg font-bold text-zinc-900 font-mono">
                                        +${totalDeposited.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                <div className="h-8 w-px bg-zinc-200"></div>

                                <div>
                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                                        <TrendingDown size={12} /> Total Bills Paid
                                    </span>
                                    <p className="text-lg font-bold text-zinc-900 font-mono">
                                        -${totalBillsPaid.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TRANSACTIONS SECTION */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                                <Receipt size={18} className="text-zinc-500" />
                                Recent Transactions Ledger
                            </h3>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Search input */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search building, ref, or memo..."
                                        className="pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-blue-500 w-48 sm:w-60"
                                    />
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                                    {[
                                        { key: 'ALL', label: 'All Activity' },
                                        { key: 'INCOME', label: 'Payments In' },
                                        { key: 'EXPENSE', label: 'Bills Paid Out' }
                                    ].map(flt => (
                                        <button
                                            key={flt.key}
                                            onClick={() => setFilterType(flt.key)}
                                            className={clsx(
                                                "px-3 py-1 text-xs rounded-md font-medium transition-all",
                                                filterType === flt.key
                                                    ? "bg-white text-zinc-900 shadow-xs font-semibold"
                                                    : "text-zinc-500 hover:text-zinc-800"
                                            )}
                                        >
                                            {flt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                                        <tr>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Building</th>
                                            <th className="py-3 px-4">Description / Payee</th>
                                            <th className="py-3 px-4">Category</th>
                                            <th className="py-3 px-4">Reference</th>
                                            <th className="py-3 px-4 text-right">Amount</th>
                                            <th className="py-3 px-4 text-right">Balance After</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {filteredTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-zinc-400 italic">
                                                    No transactions recorded yet. Click "Record Payment" or "Pay Bill" to add entries.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map((tx) => {
                                                const isIncome = tx.type === 'INCOME';
                                                return (
                                                    <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors">
                                                        <td className="py-3 px-4 font-mono text-zinc-600 flex items-center gap-1.5">
                                                            <Calendar size={13} className="text-zinc-400" />
                                                            {tx.date}
                                                        </td>
                                                        <td className="py-3 px-4 font-medium text-zinc-800">
                                                            <div className="flex items-center gap-1.5">
                                                                <Building2 size={13} className="text-zinc-400" />
                                                                <span>{tx.building}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-zinc-900">
                                                            {tx.description}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                                                                {tx.category}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                                                            {tx.reference}
                                                        </td>
                                                        <td className={clsx(
                                                            "py-3 px-4 text-right font-mono font-bold text-sm",
                                                            isIncome ? "text-emerald-600" : "text-red-600"
                                                        )}>
                                                            {isIncome ? `+${tx.amount.toFixed(2)}` : `-${tx.amount.toFixed(2)}`}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-800">
                                                            ${(tx.balanceAfter || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ADD BANK ACCOUNT MODAL (DYNAMIC USER INPUT) */}
            {showAddAccountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <Plus size={18} className="text-blue-400" />
                                Add Company Bank Account
                            </h2>
                            <button onClick={() => setShowAddAccountModal(false)} className="text-zinc-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
                            {/* Company Mode: Select Existing or Type New */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-semibold text-zinc-700">Company Name *</label>
                                    <button
                                        type="button"
                                        onClick={() => setNewAccountForm({
                                            ...newAccountForm,
                                            companyMode: newAccountForm.companyMode === 'new' ? 'existing' : 'new'
                                        })}
                                        className="text-[11px] text-blue-600 font-semibold hover:underline"
                                    >
                                        {newAccountForm.companyMode === 'new' ? '← Choose Existing Company' : '+ Create New Company'}
                                    </button>
                                </div>

                                {newAccountForm.companyMode === 'new' ? (
                                    <input
                                        type="text"
                                        required
                                        value={newAccountForm.newCompanyName}
                                        onChange={(e) => setNewAccountForm({ ...newAccountForm, newCompanyName: e.target.value })}
                                        placeholder="Enter new company name (e.g. Apex Holdings LLC)"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                ) : (
                                    <select
                                        required
                                        value={newAccountForm.companyId}
                                        onChange={(e) => setNewAccountForm({ ...newAccountForm, companyId: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                                    >
                                        <option value="" disabled>Select Company</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Bank Name */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Bank Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newAccountForm.bankName}
                                    onChange={(e) => setNewAccountForm({ ...newAccountForm, bankName: e.target.value })}
                                    placeholder="e.g. TD Canada Trust, RBC Royal Bank, BMO, Chase"
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                />
                            </div>

                            {/* Account Name & Number */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Account Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAccountForm.accountName}
                                        onChange={(e) => setNewAccountForm({ ...newAccountForm, accountName: e.target.value })}
                                        placeholder="e.g. Commercial Operating"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Account Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAccountForm.accountNumber}
                                        onChange={(e) => setNewAccountForm({ ...newAccountForm, accountNumber: e.target.value })}
                                        placeholder="e.g. #0144-8829-10"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Starting Balance & Currency */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Initial Opening Balance ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newAccountForm.openingBalance}
                                        onChange={(e) => setNewAccountForm({ ...newAccountForm, openingBalance: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Currency</label>
                                    <select
                                        value={newAccountForm.currency}
                                        onChange={(e) => setNewAccountForm({ ...newAccountForm, currency: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                                    >
                                        <option value="CAD">CAD ($)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Routing Number */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Routing / Transit Number</label>
                                <input
                                    type="text"
                                    value={newAccountForm.routingNumber}
                                    onChange={(e) => setNewAccountForm({ ...newAccountForm, routingNumber: e.target.value })}
                                    placeholder="e.g. 004-10292"
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                />
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAddAccountModal(false)}
                                    className="text-xs px-4 py-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2"
                                >
                                    Create Bank Account
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PAY BILL MODAL (MONEY OUT) */}
            {showPayBillModal && currentAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <ArrowUpRight size={18} className="text-red-400" />
                                Pay Bill From Bank Account
                            </h2>
                            <button onClick={() => setShowPayBillModal(false)} className="text-zinc-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handlePayBill} className="p-6 space-y-4">
                            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-xs">
                                <span className="text-zinc-500 block">Deducting from Account:</span>
                                <span className="font-bold text-zinc-900">{currentAccount.accountName} ({currentAccount.companyName})</span>
                                <span className="block text-zinc-500 font-mono mt-0.5">Current Balance: ${(currentAccount.balance || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Building</label>
                                {buildingsList.length > 0 ? (
                                    <select
                                        required
                                        value={billForm.building}
                                        onChange={(e) => setBillForm({ ...billForm, building: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                                    >
                                        <option value="">Select Building</option>
                                        {buildingsList.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        required
                                        value={billForm.building}
                                        onChange={(e) => setBillForm({ ...billForm, building: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                        placeholder="Enter building name"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Bill Description / Payee</label>
                                <input
                                    type="text"
                                    required
                                    value={billForm.description}
                                    onChange={(e) => setBillForm({ ...billForm, description: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    placeholder="e.g. Hydro-Québec Common Areas"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
                                    <select
                                        value={billForm.category}
                                        onChange={(e) => setBillForm({ ...billForm, category: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                                    >
                                        <option value="Utilities">Utilities</option>
                                        <option value="Maintenance & Repairs">Maintenance</option>
                                        <option value="Cleaning Services">Cleaning</option>
                                        <option value="Insurance">Insurance</option>
                                        <option value="Taxes">Property Tax</option>
                                        <option value="Other Expenses">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Amount ($ CAD) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={billForm.amount}
                                        onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Reference / Invoice #</label>
                                <input
                                    type="text"
                                    value={billForm.reference}
                                    onChange={(e) => setBillForm({ ...billForm, reference: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                    placeholder="e.g. HQ-INV-99201"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowPayBillModal(false)}
                                    className="text-xs px-4 py-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-4 py-2"
                                >
                                    Confirm Bill Payment
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RECORD PAYMENT/DEPOSIT MODAL (MONEY IN) */}
            {showDepositModal && currentAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <ArrowDownLeft size={18} className="text-emerald-400" />
                                Record Payment / Rent Deposit
                            </h2>
                            <button onClick={() => setShowDepositModal(false)} className="text-zinc-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleRecordDeposit} className="p-6 space-y-4">
                            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-xs">
                                <span className="text-zinc-500 block">Depositing into Account:</span>
                                <span className="font-bold text-zinc-900">{currentAccount.accountName} ({currentAccount.companyName})</span>
                                <span className="block text-zinc-500 font-mono mt-0.5">Current Balance: ${(currentAccount.balance || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Building</label>
                                {buildingsList.length > 0 ? (
                                    <select
                                        required
                                        value={depositForm.building}
                                        onChange={(e) => setDepositForm({ ...depositForm, building: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                                    >
                                        <option value="">Select Building</option>
                                        {buildingsList.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        required
                                        value={depositForm.building}
                                        onChange={(e) => setDepositForm({ ...depositForm, building: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                        placeholder="Enter building name"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Payment Description / Tenant</label>
                                <input
                                    type="text"
                                    required
                                    value={depositForm.description}
                                    onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    placeholder="e.g. Rent Payment - Apt 201"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
                                    <select
                                        value={depositForm.category}
                                        onChange={(e) => setDepositForm({ ...depositForm, category: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                                    >
                                        <option value="Rent Collection">Rent Collection</option>
                                        <option value="Security Deposit">Security Deposit</option>
                                        <option value="Parking Fee">Parking Fee</option>
                                        <option value="Late Fee">Late Fee</option>
                                        <option value="Other Income">Other Income</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Amount ($ CAD) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={depositForm.amount}
                                        onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Reference / Confirmation #</label>
                                <input
                                    type="text"
                                    value={depositForm.reference}
                                    onChange={(e) => setDepositForm({ ...depositForm, reference: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                    placeholder="e.g. INTERAC-881923"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowDepositModal(false)}
                                    className="text-xs px-4 py-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2"
                                >
                                    Record Deposit
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT BANK ACCOUNT MODAL */}
            {showEditAccountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <Pencil size={18} className="text-blue-400" />
                                Edit Company Bank Account
                            </h2>
                            <button onClick={() => setShowEditAccountModal(false)} className="text-zinc-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateAccount} className="p-6 space-y-4">
                            {/* Company Name */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Name *</label>
                                <select
                                    required
                                    value={editAccountForm.companyId}
                                    onChange={(e) => setEditAccountForm({ ...editAccountForm, companyId: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                                >
                                    <option value="" disabled>Select Company</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Bank Name */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Bank Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editAccountForm.bankName}
                                    onChange={(e) => setEditAccountForm({ ...editAccountForm, bankName: e.target.value })}
                                    placeholder="e.g. TD Canada Trust, RBC, BMO, Chase"
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                />
                            </div>

                            {/* Account Name & Number */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Account Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editAccountForm.accountName}
                                        onChange={(e) => setEditAccountForm({ ...editAccountForm, accountName: e.target.value })}
                                        placeholder="e.g. Operating Account"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Account Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editAccountForm.accountNumber}
                                        onChange={(e) => setEditAccountForm({ ...editAccountForm, accountNumber: e.target.value })}
                                        placeholder="e.g. #0144-8829-10"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Balance & Currency */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Current Balance ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editAccountForm.balance}
                                        onChange={(e) => setEditAccountForm({ ...editAccountForm, balance: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Currency</label>
                                    <select
                                        value={editAccountForm.currency}
                                        onChange={(e) => setEditAccountForm({ ...editAccountForm, currency: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                                    >
                                        <option value="CAD">CAD ($)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Routing Number */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Routing / Transit Number</label>
                                <input
                                    type="text"
                                    value={editAccountForm.routingNumber}
                                    onChange={(e) => setEditAccountForm({ ...editAccountForm, routingNumber: e.target.value })}
                                    placeholder="e.g. 004-10292"
                                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                                />
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowEditAccountModal(false)}
                                    className="text-xs px-4 py-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankAccounts;
