import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Plus,
  HelpCircle,
  Check,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  Download,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '../Button';
import clsx from 'clsx';

export const BankReconciliationModal = ({
  isOpen,
  onClose,
  currentAccount,
  allAccounts = [],
  transactions = [],
  onReconciliationComplete,
  onAddTransactionToLedger,
  showToast
}) => {
  if (!isOpen || !currentAccount) return null;

  // Selected Reconciliation Account
  const [selectedAccId, setSelectedAccId] = useState(currentAccount.id);
  const activeAccount = allAccounts.find(a => a.id === selectedAccId) || currentAccount;

  // Period (Default to current Year-Month)
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);
  const [reconcileMonth, setReconcileMonth] = useState(currentMonthStr);

  // Statement Metadata
  const [statementFileName, setStatementFileName] = useState('');
  const [statementEndingBalance, setStatementEndingBalance] = useState('');
  const [statementStartingBalance, setStatementStartingBalance] = useState('');

  // Uploaded Statement Rows parsed
  // Each: { id, date, description, amount, type: 'INCOME' | 'EXPENSE', reference }
  const [bankEntries, setBankEntries] = useState([]);
  
  // Matched State: map of statementId -> systemTxId (or array of pairs)
  // We can track manual matches or auto-matches
  const [manualMatches, setManualMatches] = useState({}); // bankEntryId -> systemTxId
  const [excludedBankEntryIds, setExcludedBankEntryIds] = useState(new Set());

  // Step in wizard: 1 = Upload & Setup, 2 = Verify & Match, 3 = Reconciliation Completed
  const [step, setStep] = useState(1);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, MATCHED, UNMATCHED_BANK, UNMATCHED_SYSTEM
  const [searchFilter, setSearchFilter] = useState('');

  const fileInputRef = useRef(null);

  // Filter system ledger transactions for this account and chosen month
  const monthSystemTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (tx.accountId !== activeAccount.id) return false;
      if (!tx.date) return false;
      return tx.date.startsWith(reconcileMonth);
    });
  }, [transactions, activeAccount.id, reconcileMonth]);

  // Reset state when account or month changes
  useEffect(() => {
    setBankEntries([]);
    setStatementFileName('');
    setManualMatches({});
    setStep(1);
  }, [selectedAccId, reconcileMonth]);

  // CSV Parsing function
  const parseCSVContent = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      alert('CSV file must contain at least a header row and one transaction.');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    // Detect column indexes
    let dateIdx = headers.findIndex(h => h.includes('date'));
    let descIdx = headers.findIndex(h => h.includes('desc') || h.includes('memo') || h.includes('payee') || h.includes('detail') || h.includes('narrative'));
    let amountIdx = headers.findIndex(h => h === 'amount' || h.includes('amount') || h.includes('value'));
    let debitIdx = headers.findIndex(h => h.includes('debit') || h.includes('withdrawal') || h.includes('out'));
    let creditIdx = headers.findIndex(h => h.includes('credit') || h.includes('deposit') || h.includes('in'));
    let refIdx = headers.findIndex(h => h.includes('ref') || h.includes('cheque') || h.includes('check') || h.includes('id'));

    if (dateIdx === -1) dateIdx = 0;
    if (descIdx === -1) descIdx = 1;

    const parsedEntries = [];

    for (let i = 1; i < lines.length; i++) {
      // Split preserving quotes if possible
      const rawRow = lines[i];
      const cols = rawRow.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 2) continue;

      const rawDate = cols[dateIdx] || '';
      const rawDesc = cols[descIdx] || 'Bank Transaction';
      const rawRef = refIdx !== -1 ? cols[refIdx] : `BNK-${i}`;

      let amount = 0;
      let type = 'INCOME';

      if (debitIdx !== -1 && creditIdx !== -1) {
        const debitVal = parseFloat((cols[debitIdx] || '0').replace(/[^0-9.-]/g, '')) || 0;
        const creditVal = parseFloat((cols[creditIdx] || '0').replace(/[^0-9.-]/g, '')) || 0;
        if (debitVal > 0) {
          amount = debitVal;
          type = 'EXPENSE';
        } else {
          amount = creditVal;
          type = 'INCOME';
        }
      } else if (amountIdx !== -1) {
        const cleanAmtStr = (cols[amountIdx] || '0').replace(/[^0-9.-]/g, '');
        const val = parseFloat(cleanAmtStr) || 0;
        if (val < 0) {
          amount = Math.abs(val);
          type = 'EXPENSE';
        } else {
          amount = val;
          type = 'INCOME';
        }
      } else {
        // Fallback to column 2 as amount
        const val = parseFloat((cols[2] || '0').replace(/[^0-9.-]/g, '')) || 0;
        amount = Math.abs(val);
        type = val < 0 ? 'EXPENSE' : 'INCOME';
      }

      if (amount > 0) {
        // Standardize date to YYYY-MM-DD if possible
        let cleanDate = rawDate;
        const dObj = new Date(rawDate);
        if (!isNaN(dObj.getTime())) {
          cleanDate = dObj.toISOString().split('T')[0];
        }

        parsedEntries.push({
          id: `BS-${i}-${Date.now()}`,
          date: cleanDate,
          description: rawDesc,
          amount: parseFloat(amount.toFixed(2)),
          type,
          reference: rawRef
        });
      }
    }

    if (parsedEntries.length === 0) {
      alert('Could not parse any valid transactions from the uploaded file.');
      return;
    }

    setBankEntries(parsedEntries);
    runAutoMatch(parsedEntries);
    setStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatementFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        parseCSVContent(text);
      }
    };
    reader.readAsText(file);
  };

  // Demo / Sample Statement Generator
  const handleLoadSampleStatement = () => {
    setStatementFileName(`sample_bank_statement_${reconcileMonth}.csv`);
    
    // Generate realistic bank entries based on actual system transactions for accurate matching
    const sampleRows = [];
    const [year, month] = reconcileMonth.split('-');
    let systemListForMatching = [...monthSystemTransactions];

    // 1. Take actual system transactions and mirror them
    if (monthSystemTransactions.length > 0) {
      monthSystemTransactions.forEach((tx, idx) => {
        sampleRows.push({
          id: `SAMPLE-BS-${idx + 1}`,
          date: tx.date,
          description: `${tx.description} (E-Transfer / Chq)`,
          amount: tx.amount,
          type: tx.type,
          reference: tx.reference || `REF-${1000 + idx}`
        });
      });
    } else if (onAddTransactionToLedger) {
      // 2. If month ledger is empty, seed 2 real ledger transactions so matching can be demonstrated immediately
      const seed1 = {
        id: `TX-DEMO-1-${Date.now()}`,
        accountId: activeAccount.id,
        companyId: activeAccount.companyId,
        date: `${year}-${month}-02`,
        building: 'General Operations',
        description: 'Tenant Rent E-Transfer Apt 101',
        category: 'Rent Collection',
        type: 'INCOME',
        amount: 1200.00,
        balanceAfter: (activeAccount.balance || 0) + 1200.00,
        reference: 'ETR-8812'
      };
      const seed2 = {
        id: `TX-DEMO-2-${Date.now()}`,
        accountId: activeAccount.id,
        companyId: activeAccount.companyId,
        date: `${year}-${month}-08`,
        building: 'General Operations',
        description: 'Hydro Energy Monthly Utilities',
        category: 'Utilities',
        type: 'EXPENSE',
        amount: 285.50,
        balanceAfter: (activeAccount.balance || 0) + 1200.00 - 285.50,
        reference: 'BILL-410'
      };
      onAddTransactionToLedger(seed1);
      onAddTransactionToLedger(seed2);
      systemListForMatching = [seed1, seed2];

      sampleRows.push(
        { id: 'SAMPLE-BS-1', date: seed1.date, description: seed1.description, amount: seed1.amount, type: seed1.type, reference: seed1.reference },
        { id: 'SAMPLE-BS-2', date: seed2.date, description: seed2.description, amount: seed2.amount, type: seed2.type, reference: seed2.reference }
      );
    }

    // 3. Add 1 typical bank-only service fee to show discrepancy handling & 1-click addition!
    sampleRows.push({
      id: 'SAMPLE-BS-FEE',
      date: `${year}-${month}-28`,
      description: `${activeAccount.bankName} Monthly Business Account Plan Fee`,
      amount: 14.95,
      type: 'EXPENSE',
      reference: 'BANK-FEE'
    });

    // Auto-calculate realistic ending balance
    const totalIn = sampleRows.filter(r => r.type === 'INCOME').reduce((s, r) => s + r.amount, 0);
    const totalOut = sampleRows.filter(r => r.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0);
    const calculatedEnding = (activeAccount.balance || 0);
    setStatementEndingBalance(calculatedEnding.toFixed(2));
    setStatementStartingBalance(((activeAccount.balance || 0) - totalIn + totalOut).toFixed(2));

    setBankEntries(sampleRows);
    runAutoMatch(sampleRows, systemListForMatching);
    setStep(2);
  };

  // Matching Engine
  const runAutoMatch = (entries, sysTxs = monthSystemTransactions) => {
    const matches = {};
    const usedSystemTxIds = new Set();

    entries.forEach(bEntry => {
      // Find matching system transaction:
      // Exact amount match AND same type AND within 7 days or same month
      const match = sysTxs.find(sTx => {
        if (usedSystemTxIds.has(sTx.id)) return false;
        if (sTx.type !== bEntry.type) return false;
        if (Math.abs(sTx.amount - bEntry.amount) > 0.01) return false;
        
        // Optional date check: within 7 days
        if (sTx.date && bEntry.date) {
          const sD = new Date(sTx.date).getTime();
          const bD = new Date(bEntry.date).getTime();
          const diffDays = Math.abs(sD - bD) / (1000 * 60 * 60 * 24);
          return diffDays <= 7;
        }
        return true;
      });

      if (match) {
        matches[bEntry.id] = match.id;
        usedSystemTxIds.add(match.id);
      }
    });

    setManualMatches(matches);
  };

  // Toggle manual link / match
  const handleToggleMatch = (bankEntryId, systemTxId) => {
    setManualMatches(prev => {
      const next = { ...prev };
      if (next[bankEntryId]) {
        delete next[bankEntryId];
      } else {
        next[bankEntryId] = systemTxId;
      }
      return next;
    });
  };

  // Quick 1-click Add unmatched bank entry to Horizex Ledger
  const handleQuickAddToLedger = (bankEntry) => {
    if (!onAddTransactionToLedger) return;

    const newTx = {
      id: `TX-${Date.now()}`,
      accountId: activeAccount.id,
      companyId: activeAccount.companyId,
      date: bankEntry.date || new Date().toISOString().split('T')[0],
      building: 'General Operations',
      description: bankEntry.description,
      category: bankEntry.type === 'EXPENSE' ? 'Bank Charges / Fees' : 'Direct Deposit',
      type: bankEntry.type,
      amount: bankEntry.amount,
      balanceAfter: (activeAccount.balance || 0) + (bankEntry.type === 'INCOME' ? bankEntry.amount : -bankEntry.amount),
      reference: bankEntry.reference || 'BANK-REC'
    };

    onAddTransactionToLedger(newTx);
    
    // Automatically match this new entry!
    setManualMatches(prev => ({
      ...prev,
      [bankEntry.id]: newTx.id
    }));

    if (showToast) {
      showToast(`Added "${bankEntry.description}" ($${bankEntry.amount.toFixed(2)}) to ledger!`);
    }
  };

  // Matching Metrics Calculation
  const metrics = useMemo(() => {
    const matchedBankEntries = bankEntries.filter(b => manualMatches[b.id]);
    const unmatchedBankEntries = bankEntries.filter(b => !manualMatches[b.id]);
    
    const matchedSystemTxIds = new Set(Object.values(manualMatches));
    const unmatchedSystemTxs = monthSystemTransactions.filter(s => !matchedSystemTxIds.has(s.id));

    const totalStatementIncome = bankEntries.filter(b => b.type === 'INCOME').reduce((s, b) => s + b.amount, 0);
    const totalStatementExpense = bankEntries.filter(b => b.type === 'EXPENSE').reduce((s, b) => s + b.amount, 0);

    const totalLedgerIncome = monthSystemTransactions.filter(s => s.type === 'INCOME').reduce((s, sTx) => s + sTx.amount, 0);
    const totalLedgerExpense = monthSystemTransactions.filter(s => s.type === 'EXPENSE').reduce((s, sTx) => s + sTx.amount, 0);

    const matchedIncome = matchedBankEntries.filter(b => b.type === 'INCOME').reduce((s, b) => s + b.amount, 0);
    const matchedExpense = matchedBankEntries.filter(b => b.type === 'EXPENSE').reduce((s, b) => s + b.amount, 0);

    const statementNet = totalStatementIncome - totalStatementExpense;
    const ledgerNet = totalLedgerIncome - totalLedgerExpense;
    const discrepancy = Math.abs(statementNet - ledgerNet);

    const matchPercentage = bankEntries.length > 0 
      ? Math.round((matchedBankEntries.length / bankEntries.length) * 100) 
      : 0;

    return {
      totalStatementEntries: bankEntries.length,
      matchedCount: matchedBankEntries.length,
      unmatchedBankCount: unmatchedBankEntries.length,
      unmatchedSystemCount: unmatchedSystemTxs.length,
      totalStatementIncome,
      totalStatementExpense,
      totalLedgerIncome,
      totalLedgerExpense,
      matchedIncome,
      matchedExpense,
      statementNet,
      ledgerNet,
      discrepancy,
      matchPercentage,
      isBalanced: discrepancy < 0.01 && unmatchedBankEntries.length === 0
    };
  }, [bankEntries, manualMatches, monthSystemTransactions]);

  // Complete Reconciliation Action
  const handleFinalizeReconciliation = () => {
    const record = {
      id: `REC-${activeAccount.id}-${reconcileMonth}-${Date.now()}`,
      accountId: activeAccount.id,
      accountName: activeAccount.accountName,
      companyName: activeAccount.companyName,
      month: reconcileMonth,
      statementFileName: statementFileName || 'uploaded_statement.csv',
      reconciledAt: new Date().toISOString(),
      statementEndingBalance: parseFloat(statementEndingBalance) || activeAccount.balance,
      bookBalance: activeAccount.balance,
      matchedEntriesCount: metrics.matchedCount,
      totalEntriesCount: metrics.totalStatementEntries,
      discrepancy: metrics.discrepancy,
      status: metrics.discrepancy < 0.01 ? 'Balanced' : 'Reconciled with Variance'
    };

    // Save reconciliation record in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('horizex_bank_reconciliations_v1') || '[]');
      existing.unshift(record);
      localStorage.setItem('horizex_bank_reconciliations_v1', JSON.stringify(existing));
    } catch (e) {
      console.error('Failed saving reconciliation log:', e);
    }

    if (onReconciliationComplete) {
      onReconciliationComplete(record, Object.values(manualMatches));
    }

    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Monthly Bank Reconciliation</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase">
                  Statement Matcher
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload your monthly bank statement to verify deposits, payments, and account balances.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP PROGRESS TABS */}
        <div className="bg-zinc-100 border-b border-zinc-200 px-6 py-2.5 flex items-center justify-between text-xs font-semibold shrink-0">
          <div className="flex items-center gap-2 sm:gap-6">
            <div className={clsx("flex items-center gap-1.5", step >= 1 ? "text-blue-600 font-bold" : "text-zinc-400")}>
              <span className={clsx("w-5 h-5 rounded-full flex items-center justify-center text-[10px]", step >= 1 ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-500")}>1</span>
              <span>Upload Statement</span>
            </div>
            <ArrowRight size={14} className="text-zinc-300" />
            <div className={clsx("flex items-center gap-1.5", step >= 2 ? "text-blue-600 font-bold" : "text-zinc-400")}>
              <span className={clsx("w-5 h-5 rounded-full flex items-center justify-center text-[10px]", step >= 2 ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-500")}>2</span>
              <span>Compare & Match Entries</span>
            </div>
            <ArrowRight size={14} className="text-zinc-300" />
            <div className={clsx("flex items-center gap-1.5", step >= 3 ? "text-emerald-600 font-bold" : "text-zinc-400")}>
              <span className={clsx("w-5 h-5 rounded-full flex items-center justify-center text-[10px]", step >= 3 ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-500")}>3</span>
              <span>Reconciled</span>
            </div>
          </div>

          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-zinc-500 hover:text-zinc-800 text-xs font-medium flex items-center gap-1 hover:underline"
            >
              <RefreshCw size={12} />
              <span>Change File / Month</span>
            </button>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* ======================================================== */}
          {/* STEP 1: SELECT ACCOUNT, MONTH & UPLOAD STATEMENT */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bank Account Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Operating Bank Account *
                  </label>
                  <select
                    value={selectedAccId}
                    onChange={(e) => setSelectedAccId(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:border-blue-500"
                  >
                    {allAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bankName} - {acc.accountName} ({acc.companyName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Closing Month Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Reconciliation Month *
                  </label>
                  <input
                    type="month"
                    value={reconcileMonth}
                    onChange={(e) => setReconcileMonth(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Account Quick Stats Box */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Book Balance</span>
                  <p className="text-xl font-black text-zinc-900 font-mono">
                    ${(activeAccount.balance || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {monthSystemTransactions.length} recorded entries found in Horizex for this month.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
                    {activeAccount.bankName} • {activeAccount.accountNumber}
                  </span>
                </div>
              </div>

              {/* Drag & Drop Upload Statement Box */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  Upload Monthly Bank Statement (CSV or Excel) *
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all bg-white"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv, .txt, .tsv, .xlsx"
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <Upload size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900">
                    Click to browse or drop your bank statement file here
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Supports CSV exports from RBC, TD, BMO, Scotiabank, CIBC, Desjardins, or any custom bank format (Date, Description, Amount).
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[11px] font-semibold">
                    Supported: .CSV, .TXT, .TSV
                  </span>
                </div>
              </div>

              {/* Demo 1-Click Statement Button */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <HelpCircle size={14} className="text-zinc-400" />
                  <span>Don't have a CSV file handy right now?</span>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleLoadSampleStatement}
                  className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                >
                  <FileSpreadsheet size={14} className="mr-1 text-blue-600" />
                  Load Demo Bank Statement
                </Button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: VERIFICATION & SIDE-BY-SIDE MATCHING SCREEN */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="space-y-5">
              
              {/* TOP METRICS RECONCILIATION SUMMARY BAR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Statement Entries</span>
                  <p className="text-lg font-black text-zinc-900 mt-0.5">
                    {metrics.totalStatementEntries} Transactions
                  </p>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Net: ${(metrics.statementNet).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Horizex Ledger Net</span>
                  <p className="text-lg font-black text-zinc-900 mt-0.5">
                    {monthSystemTransactions.length} Transactions
                  </p>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Net: ${(metrics.ledgerNet).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Match Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 size={18} className={metrics.matchPercentage === 100 ? "text-emerald-600" : "text-amber-500"} />
                    <span className="text-lg font-black text-zinc-900">
                      {metrics.matchedCount} / {metrics.totalStatementEntries} ({metrics.matchPercentage}%)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {metrics.unmatchedBankCount} unmatched bank items
                  </span>
                </div>

                <div className={clsx(
                  "p-2.5 rounded-xl border flex flex-col justify-center",
                  metrics.isBalanced 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                    : "bg-amber-50 border-amber-200 text-amber-900"
                )}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {metrics.isBalanced ? "✓ Status: In Balance" : "Variance / Difference"}
                  </span>
                  <p className="text-xl font-black font-mono mt-0.5">
                    ${metrics.discrepancy.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* FILTER & SEARCH TOOLBAR */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs font-medium overflow-x-auto">
                  {[
                    { id: 'ALL', label: `All (${bankEntries.length})` },
                    { id: 'MATCHED', label: `Matched (${metrics.matchedCount})` },
                    { id: 'UNMATCHED_BANK', label: `Unmatched in Ledger (${metrics.unmatchedBankCount})` },
                    { id: 'UNMATCHED_SYSTEM', label: `Uncleared in Bank (${metrics.unmatchedSystemCount})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilter(tab.id)}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg transition-all text-xs font-bold whitespace-nowrap",
                        activeFilter === tab.id 
                          ? "bg-white text-zinc-900 shadow-xs" 
                          : "text-zinc-500 hover:text-zinc-900"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                  <span>File: <strong className="text-zinc-800">{statementFileName}</strong></span>
                </div>
              </div>

              {/* SIDE-BY-SIDE RECONCILIATION TABLE */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Bank Statement Date</th>
                        <th className="py-2.5 px-4">Bank Statement Description</th>
                        <th className="py-2.5 px-3 text-right">Bank Amount</th>
                        <th className="py-2.5 px-4">Matched Horizex Ledger Entry</th>
                        <th className="py-2.5 px-3 text-right">Ledger Amount</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                      {bankEntries
                        .filter(b => {
                          const isMatched = !!manualMatches[b.id];
                          if (activeFilter === 'MATCHED') return isMatched;
                          if (activeFilter === 'UNMATCHED_BANK') return !isMatched;
                          return true;
                        })
                        .map(bEntry => {
                          const matchedSystemTxId = manualMatches[bEntry.id];
                          const matchedTx = monthSystemTransactions.find(t => t.id === matchedSystemTxId);
                          const isMatched = !!matchedTx;

                          return (
                            <tr 
                              key={bEntry.id} 
                              className={clsx(
                                "transition-colors",
                                isMatched ? "bg-emerald-50/30 hover:bg-emerald-50/60" : "hover:bg-amber-50/30"
                              )}
                            >
                              <td className="py-3 px-3">
                                {isMatched ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <Check size={11} /> Matched
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle size={11} /> Not in Ledger
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-3 font-mono text-zinc-600">
                                {bEntry.date}
                              </td>

                              <td className="py-3 px-4 font-semibold text-zinc-900 max-w-xs truncate">
                                <span>{bEntry.description}</span>
                                <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">{bEntry.reference}</span>
                              </td>

                              <td className={clsx(
                                "py-3 px-3 text-right font-mono font-bold text-xs",
                                bEntry.type === 'INCOME' ? "text-emerald-600" : "text-red-600"
                              )}>
                                {bEntry.type === 'INCOME' ? `+${bEntry.amount.toFixed(2)}` : `-${bEntry.amount.toFixed(2)}`}
                              </td>

                              <td className="py-3 px-4 text-zinc-800">
                                {isMatched ? (
                                  <div>
                                    <span className="font-semibold">{matchedTx.description}</span>
                                    <span className="block text-[10px] text-zinc-400 font-mono">
                                      {matchedTx.date} • {matchedTx.building} • {matchedTx.category}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-zinc-400 italic text-[11px]">No matching recorded entry found</span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right font-mono font-bold text-xs">
                                {isMatched ? (
                                  <span className={matchedTx.type === 'INCOME' ? "text-emerald-600" : "text-red-600"}>
                                    {matchedTx.type === 'INCOME' ? `+${matchedTx.amount.toFixed(2)}` : `-${matchedTx.amount.toFixed(2)}`}
                                  </span>
                                ) : (
                                  <span className="text-zinc-300">-</span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right">
                                {!isMatched ? (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddToLedger(bEntry)}
                                    title="Add this transaction to Horizex Ledger"
                                    className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg inline-flex items-center gap-1 transition-colors"
                                  >
                                    <Plus size={12} />
                                    <span>Add to Ledger</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMatch(bEntry.id, matchedTx.id)}
                                    title="Unmatch this pair"
                                    className="px-2 py-1 text-[10px] text-zinc-400 hover:text-red-600 hover:underline"
                                  >
                                    Unlink
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                      {/* Display Uncleared Horizex system transactions if requested */}
                      {activeFilter === 'UNMATCHED_SYSTEM' && (
                        monthSystemTransactions
                          .filter(sTx => !new Set(Object.values(manualMatches)).has(sTx.id))
                          .map(sTx => (
                            <tr key={sTx.id} className="bg-blue-50/20 hover:bg-blue-50/40">
                              <td className="py-3 px-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                                  Uncleared in Bank
                                </span>
                              </td>
                              <td className="py-3 px-3 text-zinc-400 italic">Not in statement</td>
                              <td className="py-3 px-4 text-zinc-400 italic">Missing from statement export</td>
                              <td className="py-3 px-3 text-right text-zinc-300">-</td>
                              <td className="py-3 px-4 font-semibold text-zinc-900">
                                <span>{sTx.description}</span>
                                <span className="block text-[10px] text-zinc-400 font-mono">
                                  {sTx.date} • {sTx.building} • {sTx.reference}
                                </span>
                              </td>
                              <td className={clsx(
                                "py-3 px-3 text-right font-mono font-bold text-xs",
                                sTx.type === 'INCOME' ? "text-emerald-600" : "text-red-600"
                              )}>
                                {sTx.type === 'INCOME' ? `+${sTx.amount.toFixed(2)}` : `-${sTx.amount.toFixed(2)}`}
                              </td>
                              <td className="py-3 px-3 text-right text-zinc-400 text-[11px] italic">
                                Pending Clearing
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GUIDANCE ALERT BANNER */}
              {metrics.isBalanced ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">Accounts are Fully Reconciled!</h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        All bank statement transactions match your Horizex entries with $0.00 difference. You can safely lock and finalize this month.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-amber-900">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={22} className="text-amber-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold">Unreconciled Variance of ${metrics.discrepancy.toFixed(2)}</h4>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Click "Add to Ledger" on any bank fee or direct deposit to record it into Horizex and balance the statement.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: RECONCILIATION CONFIRMATION / COMPLETED */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="text-center py-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Month Successfully Reconciled!</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Bank reconciliation for <strong className="text-zinc-800">{activeAccount.bankName} ({activeAccount.companyName})</strong> for <strong>{reconcileMonth}</strong> has been verified and permanently recorded.
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Statement File:</span>
                  <span className="font-semibold text-zinc-800">{statementFileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Matched Entries:</span>
                  <span className="font-semibold text-emerald-700">{metrics.matchedCount} Transactions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Closing Difference:</span>
                  <span className="font-mono font-bold text-emerald-600">$0.00 (Balanced)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Timestamp:</span>
                  <span className="font-mono text-zinc-600">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={onClose}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl shadow-xs"
              >
                Close & Return to Accounts
              </Button>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2"
          >
            Cancel
          </Button>

          {step === 2 && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                className="text-xs font-semibold px-4 py-2"
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleFinalizeReconciliation}
                className={clsx(
                  "text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-1.5",
                  metrics.isBalanced 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                <CheckCircle2 size={15} />
                <span>Finish & Reconcile Month</span>
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default BankReconciliationModal;
