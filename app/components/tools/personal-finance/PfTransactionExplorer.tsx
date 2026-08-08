'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, X, FileDown, ChevronLeft, ChevronRight,
  ArrowUpDown, Check, Pencil, RefreshCw, Tag, Trash2,
  ArrowRightLeft, Landmark, SlidersHorizontal, BookOpen,
  Filter, MousePointerClick, Download, Layers, AlertTriangle,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  PFButton, PFBadge, PFFilterBarHeader, PFSmartTableBar,
  type VHFilter, emptyVHF, vhfActive, applyVHF, VHFilterField, ValueHelpDialog, AdaptFiltersDialog,
} from './PfUi';
import { useToast } from '@/app/components/ui/ToastSystem';
import { downloadFile } from '@/app/lib/utils/tool-helpers';
import {
  getAccounts, getStatements, getPFTransactions, filterByPeriod, getAvailableMonths,
  getAllCategories, applyTransactionCategoryOverride, bulkApplyCategoryOverride,
  bulkMarkAsTransfer, bulkMarkAsLoan, bulkDeleteTransactions,
  addUserCategory, getLabels, assignLabels, getTransactionLabels, addLabel,
  getStatementCoverageRange, getLastUpdatedTimestamp,
  type PFAccount, type PFStatement, type PFTransaction, type PFLabel,
  fmtINR, PERIOD_OPTIONS,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTION EXPLORER
// Full searchable/filterable/sortable ledger with bulk actions.
// ═══════════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 50;
const GUIDE_KEY = 'pf-tx-explorer-guide-seen';

const normCol = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const STANDARD_COLS = new Set([
  'date', 'valuedate', 'postingdate', 'transactiondate', 'txndate',
  'day', 'dayofweek', 'weekday', 'month', 'monthname', 'year', 'yearmonth',
  'type', 'txntype', 'transactiontype', 'drcr', 'drorcr', 'debitcredit',
  'category', 'txncategory', 'transactioncategory',
  'description', 'narration', 'particulars', 'remarks', 'details', 'txndescription',
  'amount', 'debit', 'credit', 'debitamount', 'creditamount',
  'withdrawalamount', 'depositamount', 'dramt', 'cramt',
  'balance', 'closingbalance', 'openingbalance', 'availablebalance',
]);

const DIRECTION_VALUES = new Set([
  'credit', 'debit', 'cr', 'dr', 'c', 'd', 'withdrawal', 'deposit', 'received', 'paid',
]);

type SortKey = 'date' | 'amount' | 'description' | 'category' | 'type';
type SortDir = 'asc' | 'desc';
type BulkAction = 'category' | 'transfer' | 'loan' | 'label' | 'delete' | '';

// ── Onboarding Guide ──────────────────────────────────────────────────────────

const GUIDE_FEATURES = [
  {
    icon: <Filter size={18} className="text-blue-600 dark:text-blue-400" />,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'Filter anything',
    desc: 'Search by merchant name, filter by period, account, type (credit/debit), category, amount range — all at once. Combine as many filters as you need.',
  },
  {
    icon: <MousePointerClick size={18} className="text-violet-600 dark:text-violet-400" />,
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    title: 'Fix categories in bulk',
    desc: 'Select multiple rows → pick "Assign Category" → apply to all at once. Or click the pencil icon on any single row to change it inline.',
  },
  {
    icon: <Layers size={18} className="text-amber-600 dark:text-amber-400" />,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    title: 'Mark transfers & loans',
    desc: 'Internal transfers (wallet top-ups, self-transfers) and loan EMIs skew your expense totals. Select them and mark correctly — they are excluded from analysis.',
  },
  {
    icon: <Tag size={18} className="text-emerald-600 dark:text-emerald-400" />,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'Labels for custom grouping',
    desc: 'Create labels like "Trip to Goa" or "Home Renovation" and tag multiple transactions across categories. Labels are separate from categories.',
  },
  {
    icon: <Download size={18} className="text-slate-600 dark:text-slate-400" />,
    bg: 'bg-slate-50 dark:bg-slate-800',
    title: 'Export filtered results',
    desc: 'Apply any filter combination, then click Export — only the filtered rows are exported to CSV. Useful for sharing or further analysis in Excel.',
  },
];

function GuideView({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Transaction Explorer"
        subtitle="Every transaction from all your accounts — search, filter, categorise, and export"
      />

      <div className="px-4 pb-6 space-y-5">

        {/* What is this */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">What is Transaction Explorer?</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            This is your full raw ledger — every transaction from every statement you've uploaded, in one place.
            It's the one screen where you can find any transaction, fix its category, tag it, or delete it.
            All other tools (Expenses, Behavior, Budget vs Actual) read from what you clean up here.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GUIDE_FEATURES.map((f, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-3">
              <div className={`w-9 h-9 rounded-lg ${f.bg} flex items-center justify-center shrink-0`}>
                {f.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-0.5">{f.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick tip */}
        <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3">
          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            <span className="font-bold">Clean before you analyse.</span> Wrong categories here mean wrong numbers everywhere. Spend 5 minutes fixing bulk mismatches before you trust any chart.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          Open Transaction Explorer →
        </button>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          You can re-open this guide anytime from the toolbar
        </p>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────

function DeleteConfirmModal({ count, onConfirm, onCancel }: { count: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl w-80 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Delete {count} transaction{count !== 1 ? 's' : ''}?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function TransactionExplorer() {
  const { toast } = useToast();
  const [mounted, setMounted]   = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [accounts, setAccounts] = useState<PFAccount[]>([]);
  const [statements, setStatements] = useState<PFStatement[]>([]);
  const [allTxns, setAllTxns]   = useState<PFTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [labels, setLabels]     = useState<PFLabel[]>([]);

  // Filters
  const [period, setPeriod]       = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]   = useState('');
  const [accountId, setAccountId] = useState('all');
  const [statementId, setStatementId] = useState('all');
  const [search, setSearch]       = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterRecurring, setFilterRecurring] = useState<'all' | 'yes' | 'no'>('all');
  const [catVH,   setCatVH]   = useState<VHFilter>(emptyVHF());
  const [labelVH, setLabelVH] = useState<VHFilter>(emptyVHF());
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  // Sort + page
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [newCatInput, setNewCatInput] = useState('');

  // Bulk select
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkNewCat, setBulkNewCat] = useState('');
  const [bulkLabelId, setBulkLabelId]   = useState('');

  // Delete confirm modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Label quick-add
  const [newLabelName, setNewLabelName] = useState('');
  const [showAddLabel, setShowAddLabel] = useState(false);

  // Per-row labels cache
  const [rowLabelCache, setRowLabelCache] = useState<Record<string, PFLabel[]>>({});

  // Dynamic column VHFilters + open dialog tracker
  const [dynVH,   setDynVH]   = useState<Record<string, VHFilter>>({});
  const [vhField, setVhField] = useState<string | null>(null);

  // Adapt Filters
  const [hiddenFilters,  setHiddenFilters]  = useState<Set<string>>(new Set());
  const [showAdaptDialog, setShowAdaptDialog] = useState(false);

  const [showFilterBar, setShowFilterBar] = useState(true);

  const reload = () => {
    setAccounts(getAccounts());
    setStatements(getStatements());
    setAllTxns(getPFTransactions());
    setCategories(getAllCategories());
    setLabels(getLabels());
  };

  useEffect(() => {
    setMounted(true);
    // Show guide on first visit
    const seen = localStorage.getItem(GUIDE_KEY);
    if (!seen) setShowGuide(true);
    reload();
    const h = () => reload();
    window.addEventListener('pf-store-updated', h);
    return () => window.removeEventListener('pf-store-updated', h);
  }, []);

  const handleEnterExplorer = () => {
    localStorage.setItem(GUIDE_KEY, '1');
    setShowGuide(false);
  };

  const availableMonths = useMemo(() => getAvailableMonths(), [allTxns]);

  // ── Dynamic columns ────────────────────────────────────────────────────────
  const dynamicColumns = useMemo(() => {
    if (allTxns.length === 0) return [];
    const groups = new Map<string, { displayName: string; rawKeys: string[] }>();
    allTxns.forEach(t => {
      Object.keys(t.rawData ?? {}).forEach(k => {
        const nk = normCol(k);
        if (!nk || STANDARD_COLS.has(nk)) return;
        if (!groups.has(nk)) groups.set(nk, { displayName: k, rawKeys: [k] });
        else if (!groups.get(nk)!.rawKeys.includes(k)) groups.get(nk)!.rawKeys.push(k);
      });
    });
    const result: { key: string; displayName: string; rawKeys: string[]; values: string[] }[] = [];
    for (const [nk, { displayName, rawKeys }] of groups) {
      const unique = [
        ...new Set(
          allTxns.flatMap(t => rawKeys.map(k => (t.rawData?.[k] ?? '').trim())).filter(Boolean)
        ),
      ].sort();
      const isDirectionOnly = unique.every(v => DIRECTION_VALUES.has(v.toLowerCase()));
      if (unique.length >= 2 && unique.length <= 80 && !isDirectionOnly) {
        result.push({ key: nk, displayName, rawKeys, values: unique });
      }
    }
    return result;
  }, [allTxns]);

  const adaptableFields = useMemo(() => [
    { key: 'category',  label: 'Category',     group: 'Standard' },
    { key: 'recurring', label: 'Recurring',    group: 'Standard' },
    { key: 'label',     label: 'Label',        group: 'Standard' },
    { key: 'amount',    label: 'Amount Range', group: 'Standard' },
    ...dynamicColumns.map(col => ({ key: col.key, label: col.displayName, group: 'From Excel' })),
  ], [dynamicColumns]);

  // ── Filtered + Sorted ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let txns = accountId !== 'all' ? allTxns.filter(t => t.accountId === accountId) : allTxns;
    if (statementId !== 'all') txns = txns.filter(t => t.statementId === statementId);
    txns = filterByPeriod(txns, period, customFrom, customTo);
    if (filterType !== 'all') txns = txns.filter(t => t.type === filterType);
    if (filterRecurring === 'yes') txns = txns.filter(t => t.recurringFlag);
    if (filterRecurring === 'no')  txns = txns.filter(t => !t.recurringFlag);
    if (search) {
      const q = search.toLowerCase();
      txns = txns.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (amountMin) txns = txns.filter(t => t.amount >= parseFloat(amountMin));
    if (amountMax) txns = txns.filter(t => t.amount <= parseFloat(amountMax));
    if (vhfActive(catVH)) txns = txns.filter(t => applyVHF(catVH, t.category));
    if (vhfActive(labelVH)) {
      txns = txns.filter(t => {
        const txnLabels = getTransactionLabels(t.id);
        return txnLabels.some(l => applyVHF(labelVH, l.name));
      });
    }
    for (const [nk, vhf] of Object.entries(dynVH)) {
      if (!vhfActive(vhf)) continue;
      const col = dynamicColumns.find(d => d.key === nk);
      if (!col) continue;
      txns = txns.filter(t => col.rawKeys.some(k => applyVHF(vhf, (t.rawData?.[k] ?? '').trim())));
    }
    txns = [...txns].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date')        cmp = a.date.localeCompare(b.date);
      else if (sortKey === 'amount') cmp = a.amount - b.amount;
      else if (sortKey === 'description') cmp = a.description.localeCompare(b.description);
      else if (sortKey === 'category')    cmp = a.category.localeCompare(b.category);
      else if (sortKey === 'type')        cmp = a.type.localeCompare(b.type);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return txns;
  }, [allTxns, accountId, statementId, period, customFrom, customTo, filterType, catVH, labelVH, filterRecurring, search, amountMin, amountMax, dynVH, dynamicColumns, sortKey, sortDir]);

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const pageTxns    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalAmount = filtered.reduce((a, t) => a + (t.type === 'debit' ? -t.amount : t.amount), 0);

  useEffect(() => { setPage(1); }, [filtered.length]);

  useEffect(() => {
    const cache: Record<string, PFLabel[]> = {};
    pageTxns.forEach(t => { cache[t.id] = getTransactionLabels(t.id); });
    setRowLabelCache(cache);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, allTxns, labels]);

  // ── Sort toggle ────────────────────────────────────────────────────────────
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // ── Inline Edit ────────────────────────────────────────────────────────────
  const startEdit = (t: PFTransaction) => {
    setEditingId(t.id);
    setEditCategory(t.category);
    setNewCatInput('');
  };

  const commitEdit = () => {
    if (!editingId) return;
    const cat = newCatInput.trim() || editCategory;
    if (newCatInput.trim()) addUserCategory(newCatInput.trim());
    applyTransactionCategoryOverride(editingId, cat);
    setEditingId(null);
    toast('Category updated', 'success');
  };

  // ── Bulk selection — ALL filtered, not just current page ──────────────────
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    // If all filtered are already selected, deselect all; otherwise select all filtered
    const allFilteredIds = filtered.map(t => t.id);
    const allSelected = allFilteredIds.every(id => selected.has(id));
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allFilteredIds));
  };

  const pageAllSelected = pageTxns.length > 0 && pageTxns.every(t => selected.has(t.id));

  const clearSelection = () => { setSelected(new Set()); setBulkAction(''); setBulkCategory(''); setBulkNewCat(''); setBulkLabelId(''); };

  // ── Bulk Actions ───────────────────────────────────────────────────────────
  const applyBulk = () => {
    const ids = [...selected];
    if (ids.length === 0) return;

    if (bulkAction === 'category') {
      const cat = bulkNewCat.trim() || bulkCategory;
      if (!cat) return;
      if (bulkNewCat.trim()) addUserCategory(bulkNewCat.trim());
      bulkApplyCategoryOverride(ids, cat);
      toast(`Moved ${ids.length} transactions to "${cat}"`, 'success');
    } else if (bulkAction === 'transfer') {
      bulkMarkAsTransfer(ids);
      toast(`Marked ${ids.length} transactions as Transfer`, 'success');
    } else if (bulkAction === 'loan') {
      bulkMarkAsLoan(ids);
      toast(`Marked ${ids.length} transactions as Loan/EMI`, 'success');
    } else if (bulkAction === 'label' && bulkLabelId) {
      assignLabels(ids, bulkLabelId);
      toast(`Added label to ${ids.length} transactions`, 'success');
    } else if (bulkAction === 'delete') {
      setShowDeleteModal(true);
      return;
    } else {
      return;
    }
    clearSelection();
  };

  const confirmDelete = () => {
    const ids = [...selected];
    bulkDeleteTransactions(ids);
    toast(`Deleted ${ids.length} transactions`, 'success');
    setShowDeleteModal(false);
    clearSelection();
  };

  // ── Add label ──────────────────────────────────────────────────────────────
  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    addLabel(newLabelName.trim());
    setNewLabelName('');
    setShowAddLabel(false);
    toast(`Label "${newLabelName.trim()}" created`, 'success');
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const header = 'Date,Description,Amount,Type,Category,Recurring,Override,Transfer,Loan';
    const rows = filtered.map(t =>
      `"${t.date}","${t.description.replace(/"/g, '""')}",${t.amount},${t.type},"${t.category}",${t.recurringFlag},${t.userOverrideFlag},${t.isTransfer},${t.isLoan}`
    );
    downloadFile([header, ...rows].join('\n'), 'transactions.csv', 'text/csv');
    toast(`Exported ${filtered.length} transactions`, 'success');
  }, [filtered, toast]);

  const SortBtn = ({ col, children }: { col: SortKey; children: React.ReactNode }) => (
    <button
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
    >
      {children}
      <ArrowUpDown size={11} className={sortKey === col ? 'text-blue-500' : 'text-slate-300'} />
    </button>
  );

  // ── Value help helpers ──────────────────────────────────────────────────────
  const getVhFilter = (field: string): VHFilter => {
    if (field === 'category') return catVH;
    if (field === 'label')    return labelVH;
    return dynVH[field] ?? emptyVHF();
  };
  const setVhFilter = (field: string, vhf: VHFilter) => {
    if (field === 'category') setCatVH(vhf);
    else if (field === 'label') setLabelVH(vhf);
    else setDynVH(prev => ({ ...prev, [field]: vhf }));
    setPage(1);
  };
  const getVhTitle = (field: string): string => {
    if (field === 'category') return 'Category';
    if (field === 'label')    return 'Label';
    return dynamicColumns.find(d => d.key === field)?.displayName ?? field;
  };
  const getVhValues = (field: string): string[] => {
    if (field === 'category') return categories;
    if (field === 'label')    return labels.map(l => l.name);
    return dynamicColumns.find(d => d.key === field)?.values ?? [];
  };

  if (!mounted) return null;

  // ── Guide view ─────────────────────────────────────────────────────────────
  if (showGuide) {
    return <GuideView onEnter={handleEnterExplorer} />;
  }

  const hasData = allTxns.length > 0;
  const coverage    = getStatementCoverageRange();
  const lastUpdated = getLastUpdatedTimestamp();
  const hasLabels   = labels.length > 0;

  const bulkActionNeedsExtra =
    (bulkAction === 'category' && !bulkCategory && !bulkNewCat.trim()) ||
    (bulkAction === 'label'    && !bulkLabelId);

  const activeFilterCount = [
    period !== 'all', accountId !== 'all', filterType !== 'all',
    filterRecurring !== 'all', !!search, !!amountMin, !!amountMax,
    vhfActive(catVH), vhfActive(labelVH),
    ...Object.values(dynVH).map(vhfActive),
  ].filter(Boolean).length;

  return (
    <div className="space-y-0">

      {/* Delete confirm modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          count={selected.size}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Adapt Filters Dialog */}
      {showAdaptDialog && (
        <AdaptFiltersDialog
          fields={adaptableFields}
          hidden={hiddenFilters}
          onConfirm={setHiddenFilters}
          onClose={() => setShowAdaptDialog(false)}
        />
      )}

      {/* Value Help Dialog */}
      {vhField && (
        <ValueHelpDialog
          title={getVhTitle(vhField)}
          values={getVhValues(vhField)}
          filter={getVhFilter(vhField)}
          fieldType="text"
          onConfirm={vhf => setVhFilter(vhField, vhf)}
          onClose={() => setVhField(null)}
        />
      )}

      {/* ── SAP Fiori Filter Bar ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
        <PFFilterBarHeader
          activeCount={activeFilterCount}
          onClearAll={() => {
            setPeriod('all'); setAccountId('all'); setStatementId('all'); setFilterType('all');
            setFilterRecurring('all'); setSearch(''); setAmountMin(''); setAmountMax('');
            setCatVH(emptyVHF()); setLabelVH(emptyVHF()); setDynVH({});
          }}
          showFilterBar={showFilterBar}
          onToggle={() => setShowFilterBar(v => !v)}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdaptDialog(true)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors"
              >
                Adapt Filters
              </button>
              <button
                onClick={() => setShowGuide(true)}
                title="How to use"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <BookOpen size={13} />
                Guide
              </button>
            </div>
          }
        />

        {showFilterBar && (
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-3">

            {/* Search */}
            <div className="col-span-2 sm:col-span-1 xl:col-span-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Search</label>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Description or category…"
                  className="w-full pl-7 pr-6 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Period</label>
              <select value={period} onChange={e => setPeriod(e.target.value)}
                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                {PERIOD_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                {availableMonths.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>

            {/* Account */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Account</label>
              <select value={accountId} onChange={e => { setAccountId(e.target.value); setStatementId('all'); }}
                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                <option value="all">All Accounts</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Statement — only when multiple exist AND filtered to matching account */}
            {statements.filter(s => accountId === 'all' || s.accountId === accountId).length > 1 && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Statement</label>
                <select value={statementId} onChange={e => setStatementId(e.target.value)}
                  className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  <option value="all">All Statements</option>
                  {statements
                    .filter(s => accountId === 'all' || s.accountId === accountId)
                    .map(s => <option key={s.id} value={s.id}>{s.fileName}</option>)}
                </select>
              </div>
            )}

            {/* Type */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Type</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value as 'all' | 'credit' | 'debit')}
                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                <option value="all">All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>

            {/* Category */}
            {!hiddenFilters.has('category') && (
              <VHFilterField
                label="Category"
                vhf={catVH}
                placeholder="All Categories…"
                onOpen={() => setVhField('category')}
                onRemoveItem={v => setCatVH(prev => ({ ...prev, items: prev.items.filter(x => x !== v) }))}
                onRemoveCond={id => setCatVH(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== id) }))}
              />
            )}

            {/* Recurring */}
            {!hiddenFilters.has('recurring') && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Recurring</label>
                <select value={filterRecurring} onChange={e => setFilterRecurring(e.target.value as 'all' | 'yes' | 'no')}
                  className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  <option value="all">All</option>
                  <option value="yes">Recurring</option>
                  <option value="no">One-time</option>
                </select>
              </div>
            )}

            {/* Label — only when labels exist */}
            {hasLabels && !hiddenFilters.has('label') && (
              <VHFilterField
                label="Label"
                vhf={labelVH}
                placeholder="All Labels…"
                onOpen={() => setVhField('label')}
                onRemoveItem={v => setLabelVH(prev => ({ ...prev, items: prev.items.filter(x => x !== v) }))}
                onRemoveCond={id => setLabelVH(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== id) }))}
              />
            )}

            {/* Amount range */}
            {!hiddenFilters.has('amount') && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Amount Min (₹)</label>
                  <input value={amountMin} onChange={e => setAmountMin(e.target.value)} placeholder="0"
                    type="number"
                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Amount Max (₹)</label>
                  <input value={amountMax} onChange={e => setAmountMax(e.target.value)} placeholder="∞"
                    type="number"
                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
                </div>
              </>
            )}

            {/* Custom date range */}
            {period === 'custom' && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">From</label>
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">To</label>
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
                </div>
              </>
            )}

            {/* Dynamic columns from Excel */}
            {dynamicColumns.filter(col => !hiddenFilters.has(col.key)).map(col => (
              <VHFilterField
                key={col.key}
                label={col.displayName}
                vhf={dynVH[col.key] ?? emptyVHF()}
                placeholder="All…"
                onOpen={() => setVhField(col.key)}
                onRemoveItem={v => setDynVH(prev => {
                  const cur = prev[col.key] ?? emptyVHF();
                  return { ...prev, [col.key]: { ...cur, items: cur.items.filter(x => x !== v) } };
                })}
                onRemoveCond={id => setDynVH(prev => {
                  const cur = prev[col.key] ?? emptyVHF();
                  return { ...prev, [col.key]: { ...cur, conditions: cur.conditions.filter(c => c.id !== id) } };
                })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Smart Table ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 overflow-hidden">

        <PFSmartTableBar
          title="Transactions"
          count={filtered.length}
          badges={hasData && (
            <>
              <PFBadge color={totalAmount >= 0 ? 'green' : 'red'}>
                Net {totalAmount >= 0 ? '+' : ''}{fmtINR(Math.abs(totalAmount))}
              </PFBadge>
              {allTxns.filter(t => t.userOverrideFlag).length > 0 && (
                <PFBadge color="blue">
                  {allTxns.filter(t => t.userOverrideFlag).length} overridden
                </PFBadge>
              )}
              {selected.size > 0 && (
                <PFBadge color="blue">{selected.size} of {filtered.length} selected</PFBadge>
              )}
            </>
          )}
          actions={
            <>
              <PFButton icon={<FileDown size={13} />} onClick={handleExport} title="Export CSV">
                Export
              </PFButton>
              <button title="Toggle filters"
                onClick={() => setShowFilterBar(v => !v)}
                className={`relative p-1.5 border rounded-lg transition-colors ${showFilterBar ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <SlidersHorizontal size={14} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </>
          }
        />

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="border-b border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                {selected.size} selected
              </span>

              <select value={bulkAction}
                onChange={e => { setBulkAction(e.target.value as BulkAction); setBulkCategory(''); setBulkNewCat(''); setBulkLabelId(''); }}
                className="text-xs border border-blue-200 dark:border-blue-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                <option value="">— Action —</option>
                <option value="category">Assign Category</option>
                <option value="transfer">Mark as Transfer</option>
                <option value="loan">Mark as Loan/EMI</option>
                <option value="label">Add Label</option>
                <option value="delete">Delete</option>
              </select>

              {bulkAction === 'category' && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <select value={bulkCategory} onChange={e => setBulkCategory(e.target.value)}
                    className="text-xs border border-blue-200 dark:border-blue-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    <option value="">— Pick existing —</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="text-[10px] text-slate-400">or</span>
                  <input
                    value={bulkNewCat}
                    onChange={e => setBulkNewCat(e.target.value)}
                    placeholder="Type new category…"
                    className="text-xs border border-blue-200 dark:border-blue-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 w-36"
                    onKeyDown={e => { if (e.key === 'Enter') applyBulk(); }}
                  />
                </div>
              )}

              {bulkAction === 'label' && (
                <div className="flex items-center gap-1.5">
                  <select value={bulkLabelId} onChange={e => setBulkLabelId(e.target.value)}
                    className="text-xs border border-blue-200 dark:border-blue-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    <option value="">— Label —</option>
                    {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <button onClick={() => setShowAddLabel(v => !v)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                    <Tag size={11} /> New
                  </button>
                </div>
              )}

              {bulkAction === 'transfer' && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <ArrowRightLeft size={11} /> Sets category → Transfer
                </span>
              )}
              {bulkAction === 'loan' && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Landmark size={11} /> Sets category → Loan/EMI
                </span>
              )}
              {bulkAction === 'delete' && (
                <span className="text-xs text-red-500 font-semibold">Permanent · cannot be undone</span>
              )}

              <button onClick={applyBulk} disabled={!bulkAction || bulkActionNeedsExtra}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40 transition-colors flex items-center gap-1 ${
                  bulkAction === 'delete' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                {bulkAction === 'transfer' && <ArrowRightLeft size={11} />}
                {bulkAction === 'loan'     && <Landmark size={11} />}
                {bulkAction === 'delete'   && <Trash2 size={11} />}
                Apply to {selected.size}
              </button>

              <button onClick={clearSelection}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-auto flex items-center gap-1">
                <X size={11} /> Clear
              </button>
            </div>

            {showAddLabel && (
              <div className="flex items-center gap-2 mt-2">
                <Tag size={12} className="text-slate-400" />
                <input value={newLabelName} onChange={e => setNewLabelName(e.target.value)}
                  placeholder="New label name…"
                  className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 w-36"
                  onKeyDown={e => { if (e.key === 'Enter') handleAddLabel(); if (e.key === 'Escape') setShowAddLabel(false); }}
                  autoFocus
                />
                <button onClick={handleAddLabel}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Create
                </button>
                <button onClick={() => setShowAddLabel(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Table body */}
        {!hasData ? (
          <div className="text-center py-20 text-slate-400">
            <Search size={36} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium text-slate-500">No transactions found.</p>
            <p className="text-xs mt-1">Upload a bank statement in Statement Manager to get started.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <SlidersHorizontal size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-sm text-slate-400">No transactions match the current filters.</p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Try adjusting your filter criteria above.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-2.5 w-8">
                      <input type="checkbox"
                        checked={pageAllSelected}
                        onChange={selectAll}
                        title={filtered.length > PAGE_SIZE ? `Select all ${filtered.length} filtered` : 'Select all'}
                        className="rounded" />
                    </th>
                    <th className="px-4 py-2.5 text-left font-bold">
                      <SortBtn col="date">Date</SortBtn>
                    </th>
                    <th className="px-4 py-2.5 text-left font-bold">
                      <SortBtn col="description">Description</SortBtn>
                    </th>
                    <th className="px-4 py-2.5 text-left font-bold">
                      <SortBtn col="category">Category</SortBtn>
                    </th>
                    {hasLabels && (
                      <th className="px-4 py-2.5 text-left font-bold">Labels</th>
                    )}
                    <th className="px-4 py-2.5 text-right font-bold">
                      <SortBtn col="amount">Amount</SortBtn>
                    </th>
                    <th className="px-4 py-2.5 text-left font-bold">
                      <SortBtn col="type">Type</SortBtn>
                    </th>
                    <th className="px-4 py-2.5 text-left font-bold">Flags</th>
                    <th className="px-3 py-2.5 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pageTxns.map(t => {
                    const txnLabels = rowLabelCache[t.id] ?? [];
                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${selected.has(t.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                      >
                        <td className="px-4 py-2">
                          <input type="checkbox" checked={selected.has(t.id)}
                            onChange={() => toggleSelect(t.id)} className="rounded" />
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap ${!t.date ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                          {t.date || '⚠ missing'}
                        </td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-200 max-w-[220px] truncate" title={t.description}>
                          {t.description}
                        </td>
                        <td className="px-4 py-2">
                          {editingId === t.id ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                                className="text-xs border border-blue-400 rounded px-2 py-1 bg-white dark:bg-slate-900" autoFocus>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <span className="text-slate-300 text-[10px]">or</span>
                              <input value={newCatInput} onChange={e => setNewCatInput(e.target.value)}
                                placeholder="New…"
                                className="text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-900 w-20"
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                              />
                              <button onClick={commitEdit} className="text-emerald-600 hover:text-emerald-700"><Check size={13} /></button>
                              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium ${
                              t.isTransfer ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              t.isLoan     ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              {t.category}
                              {t.userOverrideFlag && <RefreshCw size={8} className="text-blue-400" />}
                            </span>
                          )}
                        </td>
                        {hasLabels && (
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {txnLabels.map(l => (
                                <span key={l.id}
                                  className="text-[10px] px-1.5 py-0.5 rounded font-semibold text-white"
                                  style={{ backgroundColor: l.color }}>
                                  {l.name}
                                </span>
                              ))}
                            </div>
                          </td>
                        )}
                        <td className={`px-4 py-2 text-right font-mono font-bold ${t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {t.type === 'credit' ? '+' : ''}{fmtINR(t.amount)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.type === 'credit' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[10px] space-x-1">
                          {t.recurringFlag && <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-semibold">recur</span>}
                          {t.isTransfer    && <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-semibold">transfer</span>}
                          {t.isLoan        && <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">loan</span>}
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => editingId === t.id ? setEditingId(null) : startEdit(t)}
                            className="p-1 text-slate-300 hover:text-blue-500 transition-colors rounded" title="Edit category">
                            <Pencil size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Select-all-filtered banner */}
            {filtered.length > PAGE_SIZE && selected.size > 0 && selected.size < filtered.length && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span>{selected.size} selected on this page.</span>
                <button onClick={() => setSelected(new Set(filtered.map(t => t.id)))}
                  className="font-bold underline hover:no-underline">
                  Select all {filtered.length} filtered transactions
                </button>
              </div>
            )}
            {filtered.length > PAGE_SIZE && selected.size === filtered.length && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span>All {filtered.length} filtered transactions selected.</span>
                <button onClick={clearSelection} className="font-bold underline hover:no-underline">Clear selection</button>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <span className="text-xs text-slate-500">
                {filtered.length} transactions · Page {page} of {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors bg-white dark:bg-slate-900">
                  <ChevronLeft size={13} />
                </button>
                <span className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">{page}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
                  className="p-1.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors bg-white dark:bg-slate-900">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Last updated footer */}
        {hasData && (
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-600 flex flex-wrap gap-x-4">
            {coverage && <span>Statements: <span className="font-medium">{coverage.from} → {coverage.to}</span></span>}
            <span>Updated: {new Date(lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
