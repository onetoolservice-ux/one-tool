'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  SlidersHorizontal, ChevronUp, ChevronDown,
  FileDown, Trash2, Tag, ArrowLeftRight, CreditCard, X, Copy,
} from 'lucide-react';
import {
  PFButton,
  type VHOp, type VHCondition, type VHFilter,
  emptyVHF, vhfActive, applyVHF,
  VH_EXCLUDE_OPS, OP_META, TEXT_OPS, NUM_OPS, genId, condLabel,
  ValueHelpDialog, VHFilterField, VHChipStrip, AdaptFiltersDialog,
} from './pf-ui';
import { downloadFile } from '@/app/lib/utils/tool-helpers';
import {
  getAccounts, getPFTransactions, getStatements,
  getAllCategories, fmtINR,
  updatePFTransaction, bulkApplyCategoryOverride,
  bulkMarkAsTransfer, bulkMarkAsTransferToFriend, bulkDeleteTransactions,
  type PFAccount, type PFTransaction, type PFStatement,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTION LIST REPORT — SAP Fiori-style Value Help Dialog filters
// ═══════════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 50;
type SortCol = 'date' | 'description' | 'category' | 'amount' | 'type';
type SortDir = 'asc' | 'desc';


// Normalized column names covered by standard filters (hidden from dynamic bar)
const STANDARD_FILTER_NAMES = new Set([
  'date', 'valuedate', 'postingdate', 'transactiondate', 'txndate',
  'day', 'dayofweek', 'weekday', 'month', 'monthname', 'year', 'yearmonth',
  'type', 'txntype', 'transactiontype', 'drcr', 'drorcr', 'debitcredit',
  'category', 'txncategory', 'transactioncategory',
  'description', 'narration', 'particulars', 'remarks', 'details', 'txndescription',
  'amount', 'debit', 'credit', 'debitamount', 'creditamount',
  'withdrawalamount', 'depositamount', 'dramt', 'cramt',
  'balance', 'closingbalance', 'openingbalance', 'availablebalance',
]);

// ── Main Component ─────────────────────────────────────────────────────────────
export function Income() {
  const [mounted,    setMounted]    = useState(false);
  const [accounts,   setAccounts]   = useState<PFAccount[]>([]);
  const [statements, setStatements] = useState<PFStatement[]>([]);
  const [allTxns,    setAllTxns]    = useState<PFTransaction[]>([]);

  // ── Filter states ──────────────────────────────────────────────────────────
  const [statementId,    setStatementId]    = useState('all');
  const [showStmtVH,     setShowStmtVH]     = useState(false);
  const [stmtFilterAcct, setStmtFilterAcct] = useState('all');
  const stmtVHRef = useRef<HTMLDivElement>(null);
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [nameFilter,  setNameFilter]  = useState(''); // quick inline contains search
  const [nameVH,      setNameVH]      = useState<VHFilter>(emptyVHF());
  const [amountVH,    setAmountVH]    = useState<VHFilter>(emptyVHF());
  const [catVH,       setCatVH]       = useState<VHFilter>(emptyVHF());
  const [dynVH,       setDynVH]       = useState<Record<string, VHFilter>>({});

  // ── Value Help Dialog control ──────────────────────────────────────────────
  const [vhField, setVhField] = useState<string | null>(null);

  // ── Adapt Filters ──────────────────────────────────────────────────────────
  const [hiddenFilters, setHiddenFilters] = useState<Set<string>>(new Set());
  const [showAdaptDialog, setShowAdaptDialog] = useState(false);

  const [showFilterBar, setShowFilterBar] = useState(true);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState<SortCol>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Inline edit ────────────────────────────────────────────────────────────
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'category' | 'description' } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // ── Bulk ───────────────────────────────────────────────────────────────────
  const [bulkCat, setBulkCat] = useState('');
  const [showBulkCatDialog, setShowBulkCatDialog] = useState(false);
  const [bulkCatInput,      setBulkCatInput]      = useState('');

  // ── Category change warning ─────────────────────────────────────────────────
  const [pendingCatChange, setPendingCatChange] = useState<{ txnId: string; from: string; to: string } | null>(null);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Category groups ────────────────────────────────────────────────────────
  const catGroups = useMemo(() => {
    const allSys = getAllCategories();
    const freq: Record<string, number> = {};
    allTxns.forEach(t => { freq[t.category] = (freq[t.category] ?? 0) + 1; });
    const inData = [...new Set(allTxns.map(t => t.category))]
      .sort((a, b) => (freq[b] ?? 0) - (freq[a] ?? 0));
    const system = allSys.filter(c => !inData.includes(c));
    return { inData, system };
  }, [allTxns]);

  const reload = useCallback(() => {
    setAccounts(getAccounts());
    setStatements(getStatements());
    setAllTxns(getPFTransactions());
  }, []);

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, [reload]);

  // Close Statement VH on outside click
  useEffect(() => {
    if (!showStmtVH) return;
    const handler = (e: MouseEvent) => {
      if (stmtVHRef.current && !stmtVHRef.current.contains(e.target as Node)) {
        setShowStmtVH(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStmtVH]);

  // ── Column name normalization ──────────────────────────────────────────────
  const normCol = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  // ── Detected columns ───────────────────────────────────────────────────────
  const detectedNormed = useMemo(() => {
    const normed = new Set<string>();
    statements.forEach(s => {
      const d = s.detectedColumns;
      [d.date, d.description, d.amount, d.creditAmount, d.debitAmount, d.category]
        .filter(Boolean)
        .forEach(k => normed.add(normCol(k!)));
    });
    return normed;
  }, [statements]);

  // ── Dynamic columns ────────────────────────────────────────────────────────
  const dynamicColumns = useMemo(() => {
    if (allTxns.length === 0) return [];
    const groups = new Map<string, { displayName: string; rawKeys: string[] }>();
    allTxns.forEach(t => {
      Object.keys(t.rawData).forEach(k => {
        const nk = normCol(k);
        if (!nk || detectedNormed.has(nk) || STANDARD_FILTER_NAMES.has(nk)) return;
        if (!groups.has(nk)) {
          groups.set(nk, { displayName: k, rawKeys: [k] });
        } else {
          const g = groups.get(nk)!;
          if (!g.rawKeys.includes(k)) g.rawKeys.push(k);
        }
      });
    });
    const DIRECTION_VALUES = new Set([
      'credit', 'debit', 'cr', 'dr', 'c', 'd', 'withdrawal', 'deposit', 'received', 'paid',
    ]);
    const result: { key: string; displayName: string; rawKeys: string[]; values: string[] }[] = [];
    for (const [nk, { displayName, rawKeys }] of groups) {
      const unique = [
        ...new Set(
          allTxns.flatMap(t => rawKeys.map(k => (t.rawData[k] ?? '').trim())).filter(Boolean)
        ),
      ].sort();
      const isDirectionOnly = unique.every(v => DIRECTION_VALUES.has(v.toLowerCase()));
      if (unique.length >= 2 && unique.length <= 80 && !isDirectionOnly) {
        result.push({ key: nk, displayName, rawKeys, values: unique });
      }
    }
    return result;
  }, [allTxns, detectedNormed]);

  // ── Adaptable filter fields (for Adapt Filters dialog) ────────────────────
  const adaptableFields = useMemo(() => [
    { key: 'name',     label: 'Name / Description', group: 'Standard' },
    { key: 'amount',   label: 'Amount',              group: 'Standard' },
    { key: 'category', label: 'Category',            group: 'Standard' },
    ...dynamicColumns.map(col => ({ key: col.key, label: col.displayName, group: 'From Excel' })),
  ], [dynamicColumns]);

  // ── Statement VH helpers ───────────────────────────────────────────────────
  const filteredStmts = useMemo(
    () => stmtFilterAcct === 'all' ? statements : statements.filter(s => s.accountId === stmtFilterAcct),
    [statements, stmtFilterAcct],
  );

  const selectedStmtLabel = useMemo(() => {
    if (statementId === 'all') return 'All Statements';
    return statements.find(s => s.id === statementId)?.fileName ?? 'All Statements';
  }, [statementId, statements]);

  // ── Filtered ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    // Income = credit transactions only
    let txns = allTxns.filter(t => t.type === 'credit');

    // Statement filter
    if (statementId !== 'all') txns = txns.filter(t => t.statementId === statementId);

    // Date range
    if (dateFrom) txns = txns.filter(t => t.date >= dateFrom);
    if (dateTo)   txns = txns.filter(t => t.date <= dateTo);

    // Name quick text search (inline contains)
    if (nameFilter.trim()) {
      const q = nameFilter.trim().toLowerCase();
      txns = txns.filter(t => t.description.toLowerCase().includes(q));
    }

    // Name VHFilter (AND with quick search)
    if (vhfActive(nameVH))
      txns = txns.filter(t => applyVHF(nameVH, t.description));

    // Amount VHFilter (raw value = amount.toFixed(2) for consistent string key)
    if (vhfActive(amountVH))
      txns = txns.filter(t => applyVHF(amountVH, t.amount.toFixed(2)));

    // Category VHFilter
    if (vhfActive(catVH))
      txns = txns.filter(t => applyVHF(catVH, t.category));

    // Dynamic column VHFilters
    for (const [nk, vhf] of Object.entries(dynVH)) {
      const col = dynamicColumns.find(d => d.key === nk);
      if (!col || !vhfActive(vhf)) continue;
      txns = txns.filter(t =>
        col.rawKeys.some(k => applyVHF(vhf, (t.rawData[k] ?? '').trim()))
      );
    }

    return txns;
  }, [allTxns, statementId, dateFrom, dateTo, nameFilter, nameVH, amountVH, catVH, dynVH, dynamicColumns]);

  // ── Available values per field (for Tab 1, computed from filtered = progressive narrowing) ──
  const f4Values = useMemo(() => {
    const category = [...new Set(filtered.map(t => t.category))].sort();
    const name     = [...new Set(filtered.map(t => t.description))].filter(Boolean).sort();
    // Amount: store as toFixed(2) string, sorted numerically
    const amount   = [...new Set(filtered.map(t => t.amount.toFixed(2)))]
      .sort((a, b) => parseFloat(a) - parseFloat(b));
    const dyn: Record<string, string[]> = {};
    for (const col of dynamicColumns) {
      const vals = [
        ...new Set(
          filtered.flatMap(t => col.rawKeys.map(k => (t.rawData[k] ?? '').trim())).filter(Boolean)
        ),
      ].sort();
      if (vals.length > 0) dyn[col.key] = vals;
    }
    return { category, name, amount, ...dyn } as Record<string, string[]>;
  }, [filtered, dynamicColumns]);

  // ── Sorted ─────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case 'date':        cmp = a.date.localeCompare(b.date);               break;
        case 'description': cmp = a.description.localeCompare(b.description); break;
        case 'category':    cmp = a.category.localeCompare(b.category);       break;
        case 'amount':      cmp = a.amount - b.amount;                        break;
        case 'type':        cmp = a.type.localeCompare(b.type);               break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── KPI ────────────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const income = filtered
      .filter(t => t.category !== 'Self Transfer')
      .reduce((a, t) => a + t.amount, 0);
    const selfTransferCount = filtered.filter(t => t.category === 'Self Transfer').length;
    return { income, count: filtered.length, selfTransferCount };
  }, [filtered]);

  const acctName = useMemo(
    () => Object.fromEntries(accounts.map(a => [a.id, a.name])),
    [accounts]
  );

  // ── Filter activity ────────────────────────────────────────────────────────
  const activeFilterCount = [
    statementId !== 'all',
    dateFrom || dateTo,
    nameFilter.trim(),
    vhfActive(nameVH),
    vhfActive(amountVH),
    vhfActive(catVH),
    ...Object.values(dynVH).map(vhfActive),
  ].filter(Boolean).length;

  const anyFilterActive = activeFilterCount > 0;

  const clearAllFilters = () => {
    setStatementId('all');
    setDateFrom(''); setDateTo('');
    setNameFilter('');
    setNameVH(emptyVHF()); setAmountVH(emptyVHF());
    setCatVH(emptyVHF()); setDynVH({});
    setPage(1);
  };

  // ── Sorting ────────────────────────────────────────────────────────────────
  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  // ── Selection ──────────────────────────────────────────────────────────────
  const allPageSelected  = paginated.length > 0 && paginated.every(t => selectedIds.has(t.id));
  const somePageSelected = paginated.some(t => selectedIds.has(t.id));

  const toggleAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) paginated.forEach(t => next.delete(t.id));
      else paginated.forEach(t => next.add(t.id));
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Inline edit ────────────────────────────────────────────────────────────
  const cancelEdit = () => setEditingCell(null);

  const commitDescription = (id: string) => {
    const val = editInputRef.current?.value ?? '';
    if (val.trim()) updatePFTransaction(id, { description: val.trim() });
    setEditingCell(null);
  };

  // ── Bulk actions ───────────────────────────────────────────────────────────
  const selArray = Array.from(selectedIds);

  const handleBulkCategory = () => {
    if (!bulkCat || selArray.length === 0) return;
    bulkApplyCategoryOverride(selArray, bulkCat);
    setBulkCat(''); setBulkCatInput(''); setSelectedIds(new Set());
  };

  const openBulkCatDialog = () => {
    setBulkCatInput(bulkCat);
    setShowBulkCatDialog(true);
  };

  const confirmBulkCatDialog = () => {
    const val = bulkCatInput.trim();
    if (!val) return;
    setBulkCat(val);
    setShowBulkCatDialog(false);
    // Apply immediately
    bulkApplyCategoryOverride(selArray, val);
    setBulkCat(''); setBulkCatInput(''); setSelectedIds(new Set());
  };

  const handleBulkTransfer         = () => { bulkMarkAsTransfer(selArray);         setSelectedIds(new Set()); };
  const handleBulkTransferToFriend = () => { bulkMarkAsTransferToFriend(selArray); setSelectedIds(new Set()); };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selArray.length} transaction(s)? This cannot be undone.`)) return;
    bulkDeleteTransactions(selArray); setSelectedIds(new Set());
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const toExport = selectedIds.size > 0 ? sorted.filter(t => selectedIds.has(t.id)) : sorted;
    const dynKeys  = dynamicColumns.map(d => d.key);
    const headers  = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Transfer', 'Loan', 'Recurring', 'Account', ...dynKeys];
    const lines    = [headers.join(',')];
    toExport.forEach(t => {
      lines.push([
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.type,
        `"${t.category}"`,
        t.amount.toFixed(2),
        t.isTransfer    ? 'Yes' : 'No',
        t.isLoan        ? 'Yes' : 'No',
        t.recurringFlag ? 'Yes' : 'No',
        `"${acctName[t.accountId] ?? t.accountId}"`,
        ...dynKeys.map(k => `"${(t.rawData[k] ?? '').replace(/"/g, '""')}"`),
      ].join(','));
    });
    downloadFile(lines.join('\n'), 'transactions.csv', 'text/csv');
  };

  // ── Value Help Dialog dispatch helpers ─────────────────────────────────────
  const getVhFilter = (field: string): VHFilter => {
    if (field === 'name')     return nameVH;
    if (field === 'amount')   return amountVH;
    if (field === 'category') return catVH;
    return dynVH[field] ?? emptyVHF();
  };

  const setVhFilter = (field: string, vhf: VHFilter) => {
    if (field === 'name')     { setNameVH(vhf);    return; }
    if (field === 'amount')   { setAmountVH(vhf);  return; }
    if (field === 'category') { setCatVH(vhf);     return; }
    setDynVH(prev => ({ ...prev, [field]: vhf }));
  };

  const getVhTitle = (field: string): string => {
    if (field === 'name')     return 'Name / Description';
    if (field === 'amount')   return 'Amount';
    if (field === 'category') return 'Category';
    return dynamicColumns.find(d => d.key === field)?.displayName ?? field;
  };

  const getVhFieldType = (field: string): 'text' | 'number' | 'enum' => {
    if (field === 'name')   return 'text';
    if (field === 'amount') return 'number';
    return 'text'; // Category + dynamic cols get Define Conditions tab
  };

  // ── Sort icon ──────────────────────────────────────────────────────────────
  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <ChevronUp size={10} className="text-slate-300 ml-1 inline" />;
    return sortDir === 'asc'
      ? <ChevronUp   size={10} className="text-blue-500 ml-1 inline" />
      : <ChevronDown size={10} className="text-blue-500 ml-1 inline" />;
  };

  if (!mounted) return null;
  const hasData = allTxns.length > 0;

  const inputCls = 'text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200';

  return (
    <div className="space-y-0">

      {/* ── Adapt Filters Dialog ─────────────────────────────────────────────── */}
      {showAdaptDialog && (
        <AdaptFiltersDialog
          fields={adaptableFields}
          hidden={hiddenFilters}
          onConfirm={setHiddenFilters}
          onClose={() => setShowAdaptDialog(false)}
        />
      )}

      {/* ── Category Change Warning ──────────────────────────────────────────── */}
      {pendingCatChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl w-80 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-amber-500 text-lg">⚠</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Change Category?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This transaction is already categorised as{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{pendingCatChange.from}</span>.
              {' '}Are you sure you want to change it to{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{pendingCatChange.to}</span>?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingCatChange(null)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updatePFTransaction(pendingCatChange.txnId, { category: pendingCatChange.to });
                  setPendingCatChange(null);
                }}
                className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg"
              >
                Yes, Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Set Category Dialog ─────────────────────────────────────────── */}
      {showBulkCatDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl w-80 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Set Category
                <span className="ml-1.5 text-xs font-normal text-slate-400">({selArray.length} transaction{selArray.length > 1 ? 's' : ''})</span>
              </span>
              <button
                onClick={() => setShowBulkCatDialog(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={15} />
              </button>
            </div>

            {/* Free-text input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 dark:text-slate-400">Category name (type freely or pick below)</label>
              <input
                autoFocus
                type="text"
                value={bulkCatInput}
                onChange={e => setBulkCatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmBulkCatDialog(); if (e.key === 'Escape') setShowBulkCatDialog(false); }}
                placeholder="e.g. Freelance Income, Rental…"
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 dark:focus:border-blue-500"
              />
            </div>

            {/* Suggestions */}
            {(catGroups.inData.length > 0 || catGroups.system.length > 0) && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold">Suggestions</span>
                <div className="max-h-40 overflow-y-auto flex flex-col gap-0.5">
                  {catGroups.inData.length > 0 && (
                    <>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 pt-1">From your data</span>
                      {catGroups.inData.map(c => (
                        <button
                          key={c}
                          onClick={() => setBulkCatInput(c)}
                          className={`text-left text-xs px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors ${bulkCatInput === c ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </>
                  )}
                  {catGroups.system.length > 0 && (
                    <>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 pt-1">System</span>
                      {catGroups.system.map(c => (
                        <button
                          key={c}
                          onClick={() => setBulkCatInput(c)}
                          className={`text-left text-xs px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors ${bulkCatInput === c ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowBulkCatDialog(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={!bulkCatInput.trim()}
                onClick={confirmBulkCatDialog}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SAP Fiori Value Help Dialog ──────────────────────────────────────── */}
      {vhField && (
        <ValueHelpDialog
          title={getVhTitle(vhField)}
          values={f4Values[vhField] ?? []}
          filter={getVhFilter(vhField)}
          fieldType={getVhFieldType(vhField)}
          onConfirm={vhf => { setVhFilter(vhField, vhf); setPage(1); }}
          onClose={() => setVhField(null)}
        />
      )}

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Filter bar header — SAP style: white bar, Go + Hide Filter Bar + Filters (N) on right */}
        <div className="flex items-center justify-end gap-3 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mr-auto">
            Filters
            {dynamicColumns.length > 0 && (
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-2">
                +{dynamicColumns.length} col{dynamicColumns.length > 1 ? 's' : ''} from your data
              </span>
            )}
          </span>

          {anyFilterActive && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Clear All
            </button>
          )}

          <button
            onClick={() => setShowAdaptDialog(true)}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium"
          >
            Adapt Filters
          </button>

          <button
            onClick={() => setShowFilterBar(v => !v)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {showFilterBar ? 'Hide Filter Bar' : 'Show Filter Bar'}
          </button>

          {activeFilterCount > 0 && (
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Filters ({activeFilterCount})
            </span>
          )}

          <button
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full transition-colors"
            onClick={() => setPage(1)}
          >
            Go
          </button>
        </div>

        {/* Filter fields */}
        {showFilterBar && (
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-3">

            {/* Statement with Value Help */}
            <div className="flex flex-col gap-1 relative" ref={stmtVHRef}>
              <label className="text-xs font-normal text-slate-700 dark:text-slate-300">Statement:</label>
              <button
                onClick={() => setShowStmtVH(v => !v)}
                className={`flex items-center justify-between ${inputCls} hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-left w-full`}
              >
                <span className="truncate">{selectedStmtLabel}</span>
                <ChevronDown size={14} className="shrink-0 text-slate-400 ml-1" />
              </button>

              {/* Value Help Popover */}
              {showStmtVH && (
                <div className="absolute top-full left-0 mt-1 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                  {accounts.length > 1 && (
                    <div className="px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Filter by Account</label>
                      <select
                        value={stmtFilterAcct}
                        onChange={e => setStmtFilterAcct(e.target.value)}
                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                      >
                        <option value="all">All Accounts</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="max-h-48 overflow-y-auto py-1">
                    <button
                      onClick={() => { setStatementId('all'); setShowStmtVH(false); setPage(1); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${statementId === 'all' ? 'text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-700 dark:text-slate-200'}`}
                    >
                      All Statements
                    </button>
                    {filteredStmts.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setStatementId(s.id); setShowStmtVH(false); setPage(1); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${statementId === s.id ? 'text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-700 dark:text-slate-200'}`}
                      >
                        <span className="block truncate">{s.fileName}</span>
                        {accounts.length > 1 && (
                          <span className="text-[10px] text-slate-400">
                            {accounts.find(a => a.id === s.accountId)?.name ?? s.accountId}
                          </span>
                        )}
                      </button>
                    ))}
                    {filteredStmts.length === 0 && (
                      <p className="px-4 py-3 text-xs text-slate-400">No statements found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date From */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-normal text-slate-700 dark:text-slate-300">Date From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className={inputCls}
              />
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-normal text-slate-700 dark:text-slate-300">Date To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className={inputCls}
              />
            </div>

            {/* Name — inline quick search + Value Help icon */}
            {!hiddenFilters.has('name') && (
              <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                <label className="text-xs font-normal text-slate-700 dark:text-slate-300">Name:</label>
                <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-900 focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-colors">
                  <input
                    type="text"
                    placeholder="Quick search…"
                    value={nameFilter}
                    onChange={e => { setNameFilter(e.target.value); setPage(1); }}
                    className="flex-1 min-w-0 px-3 py-1.5 text-sm bg-transparent text-slate-700 dark:text-slate-200 outline-none"
                  />
                  <button
                    onClick={() => setVhField('name')}
                    title="Value Help — select values or define conditions"
                    className="px-2 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors shrink-0"
                  >
                    <Copy size={11} />
                  </button>
                </div>
                <VHChipStrip
                  vhf={nameVH}
                  fieldType="text"
                  onRemoveItem={v => { setNameVH(prev => ({ ...prev, items: prev.items.filter(x => x !== v) })); setPage(1); }}
                  onRemoveCond={id => { setNameVH(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== id) })); setPage(1); }}
                />
              </div>
            )}

            {/* Amount — VH chip picker (dialog only) */}
            {!hiddenFilters.has('amount') && (
              <VHFilterField
                label="Amount"
                vhf={amountVH}
                placeholder="Any amount…"
                displayVal={v => fmtINR(parseFloat(v) || 0)}
                onOpen={() => setVhField('amount')}
                onRemoveItem={v => { setAmountVH(prev => ({ ...prev, items: prev.items.filter(x => x !== v) })); setPage(1); }}
                onRemoveCond={id => { setAmountVH(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== id) })); setPage(1); }}
              />
            )}

            {/* Category — VH chip picker */}
            {!hiddenFilters.has('category') && (
              <VHFilterField
                label="Category"
                vhf={catVH}
                placeholder="Any category…"
                onOpen={() => setVhField('category')}
                onRemoveItem={v => { setCatVH(prev => ({ ...prev, items: prev.items.filter(x => x !== v) })); setPage(1); }}
                onRemoveCond={id => { setCatVH(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== id) })); setPage(1); }}
              />
            )}

            {/* Dynamic columns from Excel */}
            {dynamicColumns.filter(col => !hiddenFilters.has(col.key)).map(({ key, displayName }) => (
              <VHFilterField
                key={key}
                label={displayName}
                vhf={dynVH[key] ?? emptyVHF()}
                onOpen={() => setVhField(key)}
                onRemoveItem={v => {
                  setDynVH(prev => {
                    const vhf = prev[key] ?? emptyVHF();
                    return { ...prev, [key]: { ...vhf, items: vhf.items.filter(x => x !== v) } };
                  });
                  setPage(1);
                }}
                onRemoveCond={id => {
                  setDynVH(prev => {
                    const vhf = prev[key] ?? emptyVHF();
                    return { ...prev, [key]: { ...vhf, conditions: vhf.conditions.filter(c => c.id !== id) } };
                  });
                  setPage(1);
                }}
              />
            ))}

          </div>
        )}
      </div>

      {/* ── Table Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 overflow-hidden">

        {/* ── SAP-style Table Toolbar ── */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-3 min-h-[44px]">

          {/* Left — Title / KPI (SAP "Line Items (N)" style) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              Income
              {hasData && (
                <span className="font-normal text-slate-400 dark:text-slate-500 ml-1">
                  ({kpi.count.toLocaleString()})
                </span>
              )}
            </span>
            {hasData && (
              <>
                <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded">
                  {fmtINR(kpi.income)}
                </span>
                {kpi.selfTransferCount > 0 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 italic hidden sm:inline">
                    excl. {kpi.selfTransferCount} self transfer{kpi.selfTransferCount > 1 ? 's' : ''}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Right — Action toolbar (SAP icon group pattern) */}
          {hasData && (
            <div className="ml-auto flex items-center gap-1.5">

              {/* Selection indicator */}
              {selectedIds.size > 0 && (
                <>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 px-2 py-1 rounded-lg">
                    {selectedIds.size} selected
                  </span>
                  {/* Direct action buttons */}
                  <button
                    onClick={openBulkCatDialog}
                    className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7"
                  >
                    <Tag size={11} />
                    Set Category
                  </button>
                  <button
                    onClick={handleBulkTransfer}
                    className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7"
                  >
                    <ArrowLeftRight size={11} />
                    Self Transfer
                  </button>
                  <button
                    onClick={handleBulkTransferToFriend}
                    className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7"
                  >
                    <CreditCard size={11} />
                    Transferred to Friend
                  </button>
                  {/* Clear selection */}
                  <button
                    onClick={() => { setSelectedIds(new Set()); setBulkCat(''); setBulkCatInput(''); }}
                    title="Clear selection"
                    className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    <X size={13} />
                  </button>
                  <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
                </>
              )}

              {/* Delete */}
              <PFButton
                variant="danger"
                icon={<Trash2 size={14} />}
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                title={selectedIds.size > 0 ? `Delete ${selectedIds.size} selected` : 'Select rows to delete'}
              >
                Delete
              </PFButton>

              {/* Export */}
              <PFButton
                variant="primary"
                icon={<FileDown size={14} />}
                onClick={handleExport}
                title={selectedIds.size > 0 ? `Export ${selectedIds.size} selected` : 'Export all (CSV)'}
              >
                Export
              </PFButton>
            </div>
          )}
        </div>

        {/* ── Empty states ──────────────────────────────────────────────────── */}
        {!hasData ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm font-medium text-slate-500">No transactions found.</p>
            <p className="text-xs mt-1">Upload a bank statement in Statement Manager to get started.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm font-medium">No matching transactions.</p>
            <button onClick={clearAllFilters} className="text-xs text-blue-500 hover:underline mt-1">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold select-none border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                      onChange={toggleAll}
                      className="rounded cursor-pointer"
                    />
                  </th>
                  {(
                    [
                      ['date',        'Date'],
                      ['description', 'Description'],
                      ['category',    'Category'],
                      ['amount',      'Amount'],
                    ] as [SortCol, string][]
                  ).map(([col, label]) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className={`px-4 py-3 text-left cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap transition-colors ${col === 'amount' ? 'text-right' : ''}`}
                    >
                      {label}
                      <SortIcon col={col} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left">Flags</th>
                  <th className="px-4 py-3 text-left">Account</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((txn) => {
                  const isSelected  = selectedIds.has(txn.id);
                  const editingCat  = editingCell?.id === txn.id && editingCell.field === 'category';
                  const editingDesc = editingCell?.id === txn.id && editingCell.field === 'description';
                  const isSelfTransfer = txn.category === 'Self Transfer';
                  return (
                    <tr
                      key={txn.id}
                      className={`border-t border-slate-100 dark:border-slate-800 text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/30'
                          : isSelfTransfer
                          ? 'opacity-50 hover:opacity-80'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-2.5">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleRow(txn.id)}
                          className="rounded cursor-pointer" />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap font-mono text-xs">
                        {txn.date}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200 max-w-[260px]">
                        {editingDesc ? (
                          <input
                            ref={editInputRef}
                            autoFocus
                            type="text"
                            defaultValue={txn.description}
                            onBlur={() => commitDescription(txn.id)}
                            onKeyDown={e => {
                              if (e.key === 'Enter')  commitDescription(txn.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="w-full text-sm border border-blue-400 dark:border-blue-500 rounded px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => setEditingCell({ id: txn.id, field: 'description' })}
                            className="cursor-text hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                            title={txn.description}
                          >
                            {txn.description || '—'}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-2.5">
                        {editingCat ? (
                          <select
                            autoFocus
                            defaultValue={txn.category}
                            onChange={e => {
                              const next = e.target.value;
                              setEditingCell(null);
                              if (txn.category !== 'Other' && txn.category !== next) {
                                setPendingCatChange({ txnId: txn.id, from: txn.category, to: next });
                              } else {
                                updatePFTransaction(txn.id, { category: next });
                              }
                            }}
                            onBlur={cancelEdit}
                            onKeyDown={e => { if (e.key === 'Escape') cancelEdit(); }}
                            className="text-xs border border-blue-400 dark:border-blue-500 rounded px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                          >
                            {catGroups.inData.length > 0 && (
                              <optgroup label="From Your Data">
                                {catGroups.inData.map(c => <option key={c} value={c}>{c}</option>)}
                              </optgroup>
                            )}
                            {catGroups.system.length > 0 && (
                              <optgroup label="System">
                                {catGroups.system.map(c => <option key={c} value={c}>{c}</option>)}
                              </optgroup>
                            )}
                          </select>
                        ) : (
                          <span
                            onClick={() => setEditingCell({ id: txn.id, field: 'category' })}
                            title={txn.userOverrideFlag ? 'Manually assigned — click to change' : 'Click to change category'}
                            className={`text-sm cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors ${
                              txn.userOverrideFlag
                                ? 'text-slate-700 dark:text-slate-200 font-medium'
                                : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {txn.category}
                            {txn.userOverrideFlag && <span className="text-slate-400 dark:text-slate-500 font-normal ml-1 text-xs">✎</span>}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className={`px-4 py-2.5 text-right font-mono font-semibold text-sm whitespace-nowrap ${
                        isSelfTransfer
                          ? 'text-slate-400 dark:text-slate-500 line-through'
                          : 'text-[#107E3E] dark:text-green-400'
                      }`}>
                        +{fmtINR(txn.amount)}
                      </td>

                      {/* Flags */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-400">
                          {txn.isTransfer    && <span>Transfer</span>}
                          {txn.isLoan        && <span>Loan</span>}
                          {txn.recurringFlag && <span>Recurring</span>}
                        </div>
                      </td>

                      {/* Account */}
                      <td className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {acctName[txn.accountId] ?? txn.accountId}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <td colSpan={3} className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                    Total ({sorted.length.toLocaleString()} transactions)
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[#107E3E] dark:text-green-400 whitespace-nowrap">
                    +{fmtINR(sorted.reduce((sum, t) => sum + t.amount, 0))}
                  </td>
                  <td colSpan={2} className="px-4 py-2.5 text-slate-400 dark:text-slate-500 text-[10px] font-normal">
                    {totalPages > 1 && `Page ${page}: +${fmtINR(paginated.reduce((sum, t) => sum + t.amount, 0))}`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              {([
                { label: '«', fn: () => setPage(1),                              dis: page === 1 },
                { label: '‹', fn: () => setPage(p => Math.max(1, p - 1)),        dis: page === 1 },
                { label: '›', fn: () => setPage(p => Math.min(totalPages, p+1)), dis: page === totalPages },
                { label: '»', fn: () => setPage(totalPages),                     dis: page === totalPages },
              ] as { label: string; fn: () => void; dis: boolean }[]).map(({ label, fn, dis }) => (
                <button key={label} onClick={fn} disabled={dis}
                  className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800">
                  {label}
                </button>
              ))}
              <span className="text-xs text-slate-500 px-2">Page {page} / {totalPages}</span>
            </div>
          </div>
        )}

        {/* Footer hint */}
        {hasData && (
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
            Click a <span className="font-medium text-slate-500 dark:text-slate-400">category badge</span> to reassign it, or a <span className="font-medium text-slate-500 dark:text-slate-400">description</span> to rename it.
            Select rows to use bulk actions. Purple badges = manually assigned.
            Click the <span className="font-medium text-slate-500 dark:text-slate-400">Copy icon</span> on any filter for Value Help (SAP F4).
          </div>
        )}
      </div>
    </div>
  );
}
