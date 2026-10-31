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
    X,
    FileCheck,
    FileSpreadsheet,
    History,
    Sparkles
} from 'lucide-react';
import { Button } from '../components/Button';
import clsx from 'clsx';
import { mockCompanies } from '../mock/companies';
import { BankReconciliationModal } from '../components/accounting/BankReconciliationModal';

const STORAGE_KEY = 'horizex_bank_accounts_data_v2';

// Default dummy data generator for demonstration
const getInitialBankData = () => {
    const nowMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonth = prevMonthDate.toISOString().slice(0, 7);

    return {
        accounts: [
            {
                id: 1,
                companyId: 1,
                companyName: 'Apex Real Estate Partners',
                bankName: 'RBC Royal Bank',
                accountName: 'RBC Main Operating Account',
                shortAccount: 'RBC (Apex Real Estate Partners)',
                accountNumber: '****-4820',
                routingNumber: '003-10292',
                balance: 54230.50,
                currency: 'CAD',
                buildingsCount: 3,
                color: 'border-blue-500'
            },
            {
                id: 2,
                companyId: 1,
                companyName: 'Apex Real Estate Partners',
                bankName: 'TD Canada Trust',
                accountName: 'TD Security Deposit Reserve',
                shortAccount: 'TD (Apex Real Estate Partners)',
                accountNumber: '****-9104',
                routingNumber: '004-88319',
                balance: 28400.00,
                currency: 'CAD',
                buildingsCount: 2,
                color: 'border-emerald-500'
            }
        ],
        transactions: [
            {
                id: 'TX-101',
                accountId: 1,
                companyId: 1,
                date: `${nowMonth}-02`,
                building: 'Tower A',
                description: 'Tenant Rent Interac e-Transfer Apt 101 (John Smith)',
                category: 'Rent Collection',
                type: 'INCOME',
                amount: 1450.00,
                balanceAfter: 54230.50,
                reference: 'ETR-8812',
                reconciled: false
            },
            {
                id: 'TX-102',
                accountId: 1,
                companyId: 1,
                date: `${nowMonth}-03`,
                building: 'Tower B',
                description: 'Tenant Direct Deposit Apt 204 (Emily Watson)',
                category: 'Rent Collection',
                type: 'INCOME',
                amount: 1850.00,
                balanceAfter: 52780.50,
                reference: 'DIR-9931',
                reconciled: false
            },
            {
                id: 'TX-103',
                accountId: 1,
                companyId: 1,
                date: `${nowMonth}-05`,
                building: 'Tower A',
                description: 'Commercial Plaza - Retail Lease Suite 100',
                category: 'Rent Collection',
                type: 'INCOME',
                amount: 3200.00,
                balanceAfter: 50930.50,
                reference: 'CHQ-5521',
                reconciled: false
            },
            {
                id: 'TX-104',
                accountId: 1,
                companyId: 1,
                date: `${nowMonth}-08`,
                building: 'Tower A',
                description: 'Apex Plumbing Services - Repair Apt 304',
                category: 'Maintenance',
                type: 'EXPENSE',
                amount: 420.00,
                balanceAfter: 47730.50,
                reference: 'BILL-410',
                reconciled: false
            },
            {
                id: 'TX-105',
                accountId: 1,
                companyId: 1,
                date: `${nowMonth}-12`,
                building: 'Tower B',
                description: 'Hydro-Quebec Monthly Electric Bill',
                category: 'Utilities',
                type: 'EXPENSE',
                amount: 785.60,
                balanceAfter: 48150.50,
                reference: 'UTIL-882',
                reconciled: false
            },
            // Prior month reconciled transactions
            {
                id: 'TX-091',
                accountId: 1,
                companyId: 1,
                date: `${prevMonth}-02`,
                building: 'Tower A',
                description: 'Tenant Rent Interac e-Transfer Apt 101',
                category: 'Rent Collection',
                type: 'INCOME',
                amount: 1450.00,
                balanceAfter: 48936.10,
                reference: 'ETR-8100',
                reconciled: true,
                reconciledMonth: prevMonth,
                reconciledAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
            },
            {
                id: 'TX-092',
                accountId: 1,
                companyId: 1,
                date: `${prevMonth}-05`,
                building: 'Tower B',
                description: 'Tenant Direct Deposit Apt 204',
                category: 'Rent Collection',
                type: 'INCOME',
                amount: 1850.00,
                balanceAfter: 47486.10,
                reference: 'DIR-8101',
                reconciled: true,
                reconciledMonth: prevMonth,
                reconciledAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
            },
            {
                id: 'TX-093',
                accountId: 1,
                companyId: 1,
                date: `${prevMonth}-15`,
                building: 'Tower A',
                description: 'Building HVAC Maintenance Service',
                category: 'Maintenance',
                type: 'EXPENSE',
                amount: 650.00,
                balanceAfter: 45636.10,
                reference: 'CHQ-4491',
                reconciled: true,
                reconciledMonth: prevMonth,
                reconciledAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
            }
        ]
    };
};

const getInitialReconciliations = () => {
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonth = prevMonthDate.toISOString().slice(0, 7);

    return [
        {
            id: `REC-1-${prevMonth}`,
            accountId: 1,
            accountName: 'RBC Main Operating Account',
            companyName: 'Apex Real Estate Partners',
            month: prevMonth,
            statementFileName: `rbc_statement_${prevMonth}.csv`,
            matchedCount: 3,
            statementEndingBalance: '48936.10',
            reconciledAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString()
        }
    ];
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
    // Load persisted bank account data or preload realistic initial demo accounts
    const [bankData, setBankData] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && Array.isArray(parsed.accounts) && parsed.accounts.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Failed to load bank accounts data:', e);
        }
        const initial = getInitialBankData();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        } catch (e) {}
        return initial;
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
        return 1;
    });

    const [filterType, setFilterType] = useState('ALL'); // ALL, INCOME, EXPENSE
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [showPayBillModal, setShowPayBillModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showReconciliationModal, setShowReconciliationModal] = useState(false);
    const [activeViewTab, setActiveViewTab] = useState('LEDGER'); // 'LEDGER' | 'RECONCILIATION_HISTORY'
    const [reconciliationHistory, setReconciliationHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('horizex_bank_reconciliations_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {}
        const initialRecs = getInitialReconciliations();
        try {
            localStorage.setItem('horizex_bank_reconciliations_v1', JSON.stringify(initialRecs));
        } catch (e) {}
        return initialRecs;
    });
    const [toastMessage, setToastMessage] = useState(null);

    // New Bank Account Form State
    const [newAccountForm, setNewAccountForm] = useState({
        companyId: '',
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

    const handleReconciliationComplete = (record, matchedTxIds = []) => {
        const matchedSet = new Set(matchedTxIds);
        const updatedTxs = bankData.transactions.map(t => {
            if (matchedSet.has(t.id)) {
                return { ...t, reconciled: true, reconciledMonth: record.month, reconciledAt: record.reconciledAt };
            }
            return t;
        });

        setBankData(prev => ({
            ...prev,
            transactions: updatedTxs
        }));

        setReconciliationHistory(prev => [record, ...prev]);
        showToast(`✓ ${record.accountName} reconciled for ${record.month} ($0.00 difference)!`);
    };

    const handleAddTransactionToLedger = (newTx) => {
        setBankData(prev => {
            const updatedAccs = prev.accounts.map(a => {
                if (a.id === newTx.accountId) {
                    const amt = parseFloat(newTx.amount) || 0;
                    const newBal = newTx.type === 'INCOME' ? (a.balance || 0) + amt : (a.balance || 0) - amt;
                    return { ...a, balance: newBal };
                }
                return a;
            });

            return {
                accounts: updatedAccs,
                transactions: [newTx, ...prev.transactions]
            };
        });
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

        const targetCompanyId = parseInt(newAccountForm.companyId);
        const currentCompanies = getStoredCompanies();
        const matchedComp = currentCompanies.find(c => c.id === targetCompanyId);
        if (!matchedComp) {
            alert('Please select a company.');
            return;
        }
        const targetCompanyName = matchedComp.name;

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
            companyId: '',
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

    // Demo account loader for quick 1-click preview
    const handleLoadDemoAccount = () => {
        const targetComp = companies[0] || { id: 1, name: 'Apex Real Estate Partners' };
        const demoAcc = {
            id: 1,
            companyId: targetComp.id,
            companyName: targetComp.name,
            bankName: 'RBC Royal Bank',
            accountName: 'RBC Operating Account',
            shortAccount: `RBC (${targetComp.name})`,
            accountNumber: '****-4820',
            routingNumber: '003-10292',
            balance: 48500.00,
            currency: 'CAD',
            buildingsCount: 3,
            color: 'border-blue-500'
        };
        const nowMonth = new Date().toISOString().slice(0, 7);
        const demoTxs = [
            {
                id: `TX-101`,
                accountId: 1,
                companyId: targetComp.id,
                date: `${nowMonth}-02`,
                building: 'Tower A',
                description: 'Tenant Rent Interac e-Transfer Apt 101',
                category: 'Rent Collection',
                type: 'INCOME',
                amount: 1450.00,
                balanceAfter: 48500.00,
                reference: 'ETR-8812'
            },
            {
                id: `TX-102`,
                accountId: 1,
                companyId: targetComp.id,
                date: `${nowMonth}-05`,
                building: 'Tower B',
                description: 'Tenant Direct Deposit Apt 204',
                category: 'Rent Collection',
                type: 'INCOME',
                amount: 1850.00,
                balanceAfter: 47050.00,
                reference: 'DIR-9931'
            },
            {
                id: `TX-103`,
                accountId: 1,
                companyId: targetComp.id,
                date: `${nowMonth}-10`,
                building: 'Commercial Plaza',
                description: 'Hydro Energy Monthly Utilities',
                category: 'Utilities',
                type: 'EXPENSE',
                amount: 520.40,
                balanceAfter: 45200.00,
                reference: 'BILL-410'
            }
        ];

        setBankData({
            accounts: [demoAcc],
            transactions: demoTxs
        });
        setSelectedAccountId(1);
        showToast('Operating Bank Account loaded with active transactions!');
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full max-w-full min-w-0 overflow-hidden">
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
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                        <Landmark className="text-blue-600" size={24} />
                        Company Bank Accounts
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                        Track separate operating bank accounts for each company, monitor live balances, and route rent payments & bills automatically.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <Button
                        onClick={() => setShowAddAccountModal(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xs"
                    >
                        <Plus size={15} />
                        <span>Add Bank Account</span>
                    </Button>

                    {bankData.accounts.length > 0 && (
                        <>
                            <Button
                                onClick={() => setShowReconciliationModal(true)}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xs font-semibold"
                            >
                                <FileCheck size={15} />
                                <span>Monthly Reconciliation</span>
                            </Button>

                            <Button
                                onClick={() => setShowDepositModal(true)}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xs"
                            >
                                <ArrowDownLeft size={15} />
                                <span>Record Payment (In)</span>
                            </Button>

                            <Button
                                onClick={() => setShowPayBillModal(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xs"
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
                <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 shadow-xs max-w-2xl mx-auto my-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <Landmark size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Bank Accounts Added Yet</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                        Create an operating bank account for your companies to start tracking balances, tenant rent deposits, and monthly bank statement reconciliation.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                            onClick={() => setShowAddAccountModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 shadow-xs"
                        >
                            <Plus size={18} />
                            <span>Add First Bank Account</span>
                        </Button>
                        <Button
                            onClick={handleLoadDemoAccount}
                            variant="secondary"
                            className="px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 border border-zinc-200 hover:bg-zinc-50"
                        >
                            <Sparkles size={16} className="text-amber-500" />
                            <span>Load Demo Operating Account</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {/* 🏢 BANK ACCOUNT SELECTOR CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-w-0">
                        {bankData.accounts.map((acc) => {
                            const isSelected = acc.id === selectedAccountId;
                            return (
                                <div
                                    key={acc.id}
                                    onClick={() => setSelectedAccountId(acc.id)}
                                    className={clsx(
                                        "p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden bg-white shadow-xs w-full min-w-0",
                                        isSelected
                                            ? "border-blue-600 ring-4 ring-blue-500/10 shadow-md"
                                            : "border-zinc-200 hover:border-zinc-300 hover:shadow-xs"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block truncate">
                                                {acc.companyName}
                                            </span>
                                            <h3 className="text-base font-bold text-zinc-900 mt-0.5 truncate">{acc.accountName}</h3>
                                            <p className="text-xs font-mono text-zinc-500 truncate">{acc.bankName} • {acc.accountNumber}</p>
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

                                    <div className="mt-4 pt-4 border-t border-zinc-100 flex items-baseline justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Live Balance</span>
                                            <p className="text-xl sm:text-2xl font-black text-zinc-900 font-mono tracking-tight">
                                                ${(acc.balance || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <span className={clsx(
                                            "text-xs px-2 py-0.5 rounded-full font-bold shrink-0",
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
                        <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
                            <div className="flex items-start sm:items-center gap-3.5">
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                    <Wallet size={22} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center flex-wrap gap-2">
                                        <h2 className="text-base sm:text-lg font-bold text-zinc-900 truncate">{currentAccount.accountName}</h2>
                                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono">
                                            {currentAccount.accountNumber}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditModal(currentAccount)}
                                                title="Edit this bank account"
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
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
                                            <button
                                                type="button"
                                                onClick={() => setShowReconciliationModal(true)}
                                                title="Reconcile this account with bank statement"
                                                className="ml-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all border border-indigo-200 inline-flex items-center gap-1.5 shadow-2xs"
                                            >
                                                <FileCheck size={13} />
                                                <span>Reconcile Month</span>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1 break-words">
                                        Operating account for <span className="font-semibold text-zinc-800">{currentAccount.companyName}</span> • Routing Transit: {currentAccount.routingNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100">
                                <div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                        <TrendingUp size={12} /> Total Deposits
                                    </span>
                                    <p className="text-base sm:text-lg font-bold text-zinc-900 font-mono">
                                        +${totalDeposited.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                <div className="h-8 w-px bg-zinc-200"></div>

                                <div>
                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                                        <TrendingDown size={12} /> Total Bills Paid
                                    </span>
                                    <p className="text-base sm:text-lg font-bold text-zinc-900 font-mono">
                                        -${totalBillsPaid.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TRANSACTIONS & RECONCILIATIONS SECTION */}
                    <div className="space-y-4 w-full min-w-0">
                        {/* VIEW SWITCHER TABS */}
                        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                            <button
                                type="button"
                                onClick={() => setActiveViewTab('LEDGER')}
                                className={clsx(
                                    "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                                    activeViewTab === 'LEDGER'
                                        ? "bg-zinc-900 text-white shadow-xs"
                                        : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                                )}
                            >
                                <Receipt size={14} />
                                <span>Transactions Ledger</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveViewTab('RECONCILIATION_HISTORY')}
                                className={clsx(
                                    "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                                    activeViewTab === 'RECONCILIATION_HISTORY'
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50"
                                )}
                            >
                                <History size={14} />
                                <span>Reconciliation Reports ({reconciliationHistory.length})</span>
                            </button>
                        </div>

                        {activeViewTab === 'LEDGER' && (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                                        <Receipt size={18} className="text-zinc-500" />
                                        Recent Transactions Ledger
                                    </h3>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                        {/* Search input */}
                                        <div className="relative w-full sm:w-auto">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search building, ref, or memo..."
                                                className="pl-8 pr-3 py-2 sm:py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-blue-500 w-full sm:w-60"
                                            />
                                        </div>

                                        {/* Filter Tabs */}
                                        <div className="flex items-center justify-between sm:justify-start bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 overflow-x-auto">
                                            {[
                                                { key: 'ALL', label: 'All Activity' },
                                                { key: 'INCOME', label: 'Payments In' },
                                                { key: 'EXPENSE', label: 'Bills Paid Out' }
                                            ].map(flt => (
                                                <button
                                                    key={flt.key}
                                                    onClick={() => setFilterType(flt.key)}
                                                    className={clsx(
                                                        "flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-1 text-[11px] sm:text-xs rounded-md font-medium transition-all text-center whitespace-nowrap",
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
                                <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden w-full min-w-0">
                                    <div className="overflow-x-auto w-full">
                                        <table className="w-full text-left text-xs whitespace-nowrap min-w-[700px]">
                                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                                                <tr>
                                                    <th className="py-3 px-4">Date</th>
                                                    <th className="py-3 px-4">Building</th>
                                                    <th className="py-3 px-4">Description / Payee</th>
                                                    <th className="py-3 px-4">Category</th>
                                                    <th className="py-3 px-4">Reference</th>
                                                    <th className="py-3 px-4">Match Status</th>
                                                    <th className="py-3 px-4 text-right">Amount</th>
                                                    <th className="py-3 px-4 text-right">Balance After</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {filteredTransactions.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="py-8 text-center text-zinc-400 italic">
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
                                                                <td className="py-3 px-4">
                                                                    {tx.reconciled ? (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200" title={`Reconciled in ${tx.reconciledMonth || 'period'}`}>
                                                                            <CheckCircle2 size={11} /> Reconciled
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                                                                            Uncleared
                                                                        </span>
                                                                    )}
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
                            </>
                        )}

                        {activeViewTab === 'RECONCILIATION_HISTORY' && (
                            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden w-full min-w-0">
                                <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                            <History size={16} className="text-indigo-600" />
                                            Closed Monthly Bank Reconciliations
                                        </h4>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            Permanent audit log of verified monthly bank statements and matched records.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setShowReconciliationModal(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs font-semibold"
                                    >
                                        <Plus size={14} />
                                        <span>New Month Reconciliation</span>
                                    </Button>
                                </div>

                                {reconciliationHistory.length === 0 ? (
                                    <div className="p-12 text-center max-w-md mx-auto">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                                            <FileSpreadsheet size={24} />
                                        </div>
                                        <h4 className="text-sm font-bold text-zinc-800">No Monthly Reconciliations Logged Yet</h4>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Upload your bank statement at the end of each month to ensure zero variance and lock the period.
                                        </p>
                                        <Button
                                            onClick={() => setShowReconciliationModal(true)}
                                            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 font-semibold"
                                        >
                                            <FileCheck size={14} />
                                            <span>Reconcile This Month</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto w-full">
                                        <table className="w-full text-left text-xs whitespace-nowrap min-w-[650px]">
                                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                                                <tr>
                                                    <th className="py-3 px-4">Period / Month</th>
                                                    <th className="py-3 px-4">Bank Account & Company</th>
                                                    <th className="py-3 px-4">Statement File</th>
                                                    <th className="py-3 px-4">Verified Matches</th>
                                                    <th className="py-3 px-4">Closing Difference</th>
                                                    <th className="py-3 px-4">Status</th>
                                                    <th className="py-3 px-4 text-right">Reconciled On</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 font-medium">
                                                {reconciliationHistory.map((rec) => (
                                                    <tr key={rec.id} className="hover:bg-zinc-50/80 transition-colors">
                                                        <td className="py-3 px-4 font-mono font-bold text-zinc-900 flex items-center gap-1.5">
                                                            <Calendar size={13} className="text-indigo-600" />
                                                            {rec.month}
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-zinc-800">
                                                            <span>{rec.accountName}</span>
                                                            <span className="block text-[10px] text-zinc-400">{rec.companyName}</span>
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-zinc-600">
                                                            {rec.statementFileName}
                                                        </td>
                                                        <td className="py-3 px-4 text-zinc-700">
                                                            <span className="font-bold text-emerald-700">{rec.matchedEntriesCount}</span> / {rec.totalEntriesCount} Entries
                                                        </td>
                                                        <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                                                            ${(rec.discrepancy || 0).toFixed(2)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                <CheckCircle2 size={11} /> {rec.status || 'Balanced'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono text-zinc-500 text-[11px]">
                                                            {new Date(rec.reconciledAt).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
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

                        <form onSubmit={handleCreateAccount} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Company Selection */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">Company *</label>
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

                        <form onSubmit={handlePayBill} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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

                        <form onSubmit={handleRecordDeposit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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

                        <form onSubmit={handleUpdateAccount} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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

            {/* MONTHLY BANK RECONCILIATION MODAL */}
            {showReconciliationModal && (
                <BankReconciliationModal
                    isOpen={showReconciliationModal}
                    onClose={() => setShowReconciliationModal(false)}
                    currentAccount={currentAccount}
                    allAccounts={bankData.accounts}
                    transactions={bankData.transactions}
                    onReconciliationComplete={handleReconciliationComplete}
                    onAddTransactionToLedger={handleAddTransactionToLedger}
                    showToast={showToast}
                />
            )}
        </div>
    );
};

export default BankAccounts;
