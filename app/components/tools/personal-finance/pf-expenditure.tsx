'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileDown, Plus, Pencil, Check, X, Merge, BarChart3, Table, ChevronDown } from 'lucide-react';
import { PFButton, PFBadge, PFFilterBarHeader, PFSmartTableBar } from './pf-ui';
import { useToast } from '@/app/components/ui/toast-system';
import { downloadFile } from '@/app/lib/utils/tool-helpers';
import {
  getAccounts, getStatements, getPFTransactions, filterByPeriod, getAllCategories,
  addUserCategory, bulkApplyCategoryOverride,
  getAvailableMonths, getPeriodRange,
  getStatementCoverageRange, getLastUpdatedTimestamp,
  type PFAccount, type PFStatement, type PFTransaction,
  fmtINR, fmtPct,
} from './finance-store';


// ═══════════════════════════════════════════════════════════════════════════════
// EXPENDITURE DISTRIBUTION
// Category-wise breakdown with MoM comparison.
// User controls: view by (category / merchant / month), aggregate (sum/avg/count),
// sort by, edit/rename/merge categories, add new category.
// Table primary, optional bar chart.
// ═══════════════════════════════════════════════════════════════════════════════

type ViewBy  = 'category' | 'merchant' | 'month';
type AggMode = 'sum' | 'avg' | 'count';
type SortBy  = 'amount' | 'count' | 'name' | 'pct';

interface CategoryRow {
  key: string;
  amount: number;
  count: number;
  pct: number;
  prevAmount: number;
  prevCount: number;
  txnIds: string[];
}

function buildRows(txns: PFTransaction[], viewBy: ViewBy, agg: AggMode): CategoryRow[] {
  const map: Record<string, { txns: PFTransaction[]; ids: string[] }> = {};

  for (const t of txns) {
    let key: string;
    if (viewBy === 'category') key = t.category;
    else if (viewBy === 'merchant') key = t.description.split(' ').slice(0, 3).join(' ');
    else {
      key = t.date?.substring(0, 7) || 'Unknown';
    }
    if (!map[key]) map[key] = { txns: [], ids: [] };
    map[key].txns.push(t);
    map[key].ids.push(t.id);
  }

  const total = txns.reduce((a, t) => a + t.amount, 0);

  return Object.entries(map).map(([key, { txns: groupTxns, ids }]) => {
    const sum   = groupTxns.reduce((a, t) => a + t.amount, 0);
    const count = groupTxns.length;
    const amount = agg === 'sum' ? sum : agg === 'avg' ? sum / count : count;
    return {
      key,
      amount,
      count,
      pct: total > 0 ? (sum / total) * 100 : 0,
      prevAmount: 0,
      prevCount: 0,
      txnIds: ids,
    };
  });
}

export function ExpenditureDistribution() {
  const { toast } = useToast();
  const [mounted, setMounted]   = useState(false);
  const [accounts, setAccounts] = useState<PFAccount[]>([]);
  const [statements, setStatements] = useState<PFStatement[]>([]);
  const [allTxns, setAllTxns]   = useState<PFTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Controls
  const [period, setPeriod]       = useState('all');
  const [statementId, setStatementId] = useState('all');
  const [viewBy, setViewBy]       = useState<ViewBy>('category');
  const [agg, setAgg]             = useState<AggMode>('sum');
  const [sortBy, setSortBy]       = useState<SortBy>('amount');
  const [showMoM, setShowMoM]     = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [drillKey, setDrillKey]   = useState<string | null>(null);

  // Statement Value Help
  const [showStmtVH, setShowStmtVH]       = useState(false);
  const [stmtFilterAcct, setStmtFilterAcct] = useState('all');
  const stmtVHRef = useRef<HTMLDivElement>(null);

  // Category management
  const [renamingKey, setRenamingKey] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [mergingKey, setMergingKey]   = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState('');
  const [newCatName, setNewCatName]   = useState('');
  const [showAddCat, setShowAddCat]   = useState(false);

  const reload = () => {
    setAccounts(getAccounts());
    setStatements(getStatements());
    setAllTxns(getPFTransactions());
    setCategories(getAllCategories());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    const h = () => reload();
    window.addEventListener('pf-store-updated', h);
    return () => window.removeEventListener('pf-store-updated', h);
  }, []);

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

  const availableMonths = useMemo(() => getAvailableMonths(), [allTxns]);

  const filteredStmts = useMemo(
    () => stmtFilterAcct === 'all' ? statements : statements.filter(s => s.accountId === stmtFilterAcct),
    [statements, stmtFilterAcct],
  );

  const selectedStmtLabel = useMemo(() => {
    if (statementId === 'all') return 'All Statements';
    return statements.find(s => s.id === statementId)?.fileName ?? 'All Statements';
  }, [statementId, statements]);

  const base = useMemo(() => {
    let txns = statementId !== 'all' ? allTxns.filter(t => t.statementId === statementId) : allTxns;
    txns = filterByPeriod(txns, period);
    txns = txns.filter(t => t.type === 'debit');
    return txns;
  }, [allTxns, statementId, period]);

  // Previous period transactions
  const prevBase = useMemo(() => {
    if (!showMoM || period === 'all') return [];
    const range = getPeriodRange(period);
    if (!range) return [];
    const from  = new Date(range.from);
    const to    = new Date(range.to);
    const days  = (to.getTime() - from.getTime()) / 86400000;
    const prevTo   = new Date(from.getTime() - 86400000);
    const prevFrom = new Date(prevTo.getTime() - days * 86400000);
    let txns = statementId !== 'all' ? allTxns.filter(t => t.statementId === statementId) : allTxns;
    txns = txns.filter(t =>
      t.date >= prevFrom.toISOString().split('T')[0] &&
      t.date <= prevTo.toISOString().split('T')[0]
    );
    txns = txns.filter(t => t.type === 'debit');
    return txns;
  }, [allTxns, statementId, period, showMoM]);

  const rows = useMemo(() => {
    const curr = buildRows(base, viewBy, agg);
    const prev = buildRows(prevBase, viewBy, agg);
    const prevMap: Record<string, CategoryRow> = {};
    prev.forEach(r => { prevMap[r.key] = r; });
    return curr.map(r => ({
      ...r,
      prevAmount: prevMap[r.key]?.amount ?? 0,
      prevCount:  prevMap[r.key]?.count  ?? 0,
    }));
  }, [base, prevBase, viewBy, agg]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'count')  return b.count  - a.count;
      if (sortBy === 'pct')    return b.pct     - a.pct;
      return a.key.localeCompare(b.key);
    });
  }, [rows, sortBy]);

  const drillTxns = useMemo(() => {
    if (!drillKey) return [];
    const row = rows.find(r => r.key === drillKey);
    if (!row) return [];
    return base.filter(t => row.txnIds.includes(t.id));
  }, [drillKey, rows, base]);

  const maxAmount = sorted.length > 0 ? sorted[0].amount : 1;

  // ── Category management ─────────────────────────────────────────────────────

  const handleRename = (oldKey: string) => {
    if (!renameValue.trim() || renameValue.trim() === oldKey) { setRenamingKey(null); return; }
    const newCat = renameValue.trim();
    addUserCategory(newCat);
    const ids = rows.find(r => r.key === oldKey)?.txnIds ?? [];
    bulkApplyCategoryOverride(ids, newCat);
    setRenamingKey(null);
    toast(`Renamed "${oldKey}" → "${newCat}" (${ids.length} transactions)`, 'success');
  };

  const handleMerge = (sourceKey: string) => {
    if (!mergeTarget || mergeTarget === sourceKey) { setMergingKey(null); return; }
    const ids = rows.find(r => r.key === sourceKey)?.txnIds ?? [];
    bulkApplyCategoryOverride(ids, mergeTarget);
    setMergingKey(null);
    toast(`Merged "${sourceKey}" into "${mergeTarget}" (${ids.length} transactions)`, 'success');
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addUserCategory(newCatName.trim());
    setNewCatName('');
    setShowAddCat(false);
    toast(`Category "${newCatName.trim()}" added`, 'success');
  };

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const header = showMoM
      ? 'Category,Amount,Count,% of Total,Previous,Change'
      : 'Category,Amount,Count,% of Total';
    const rowLines = sorted.map(r => {
      const change = showMoM ? `,${(r.amount - r.prevAmount).toFixed(2)}` : '';
      const prev   = showMoM ? `,${r.prevAmount.toFixed(2)}` : '';
      return `"${r.key}",${r.amount.toFixed(2)},${r.count},${r.pct.toFixed(1)}${prev}${change}`;
    });
    downloadFile([header, ...rowLines].join('\n'), 'expenditure.csv', 'text/csv');
    toast(`Exported ${sorted.length} rows`, 'success');
  };

  if (!mounted) return null;
  const hasData = allTxns.length > 0;
  const totalAmount = base.reduce((a, t) => a + t.amount, 0);
  const coverage    = getStatementCoverageRange();
  const lastUpdated = getLastUpdatedTimestamp();

  return (
    <div className="space-y-0">
      {/* ── SAP Filter Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
        <PFFilterBarHeader
          actions={
            <button onClick={() => setShowAddCat(v => !v)}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              <Plus size={11} /> Add Category
            </button>
          }
        />
        <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">

          {/* Month */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Month</label>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              <option value="all">All Months</option>
              {availableMonths.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>

          {/* Statement with Value Help */}
          <div className="flex flex-col gap-1 relative" ref={stmtVHRef}>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Statement</label>
            <button
              onClick={() => setShowStmtVH(v => !v)}
              className="flex items-center justify-between text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-[#0070F3] transition-colors text-left w-full"
            >
              <span className="truncate">{selectedStmtLabel}</span>
              <ChevronDown size={14} className="shrink-0 text-slate-400 ml-1" />
            </button>

            {/* Value Help Popover */}
            {showStmtVH && (
              <div className="absolute top-full left-0 mt-1 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                {/* Account filter inside VH */}
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

                {/* Statement list */}
                <div className="max-h-48 overflow-y-auto py-1">
                  <button
                    onClick={() => { setStatementId('all'); setShowStmtVH(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${statementId === 'all' ? 'text-[#0070F3] font-semibold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    All Statements
                  </button>
                  {filteredStmts.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setStatementId(s.id); setShowStmtVH(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${statementId === s.id ? 'text-[#0070F3] font-semibold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-700 dark:text-slate-200'}`}
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

          {/* Sort By */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              <option value="amount">Amount</option>
              <option value="pct">% Share</option>
              <option value="count">Count</option>
              <option value="name">Name</option>
            </select>
          </div>

        </div>

        {/* Add Category inline form */}
        {showAddCat && (
          <div className="px-4 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">New Category Name</label>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Entertainment"
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }} />
              </div>
              <button onClick={handleAddCategory} className="mt-5 text-sm bg-[#0070F3] text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-[#005DD1] transition-colors">
                Add
              </button>
              <button onClick={() => setShowAddCat(false)} className="mt-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Smart Table Card ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 overflow-hidden">
        {/* Smart Table Header */}
        <PFSmartTableBar
          title="Expenditure Distribution"
          badges={hasData && (
            <>
              <PFBadge color="slate">{fmtINR(totalAmount)} total</PFBadge>
              <PFBadge color="blue">
                {sorted.length} {viewBy === 'category' ? 'categories' : viewBy === 'merchant' ? 'merchants' : 'months'}
              </PFBadge>
              <PFBadge color="slate">{base.length} txns</PFBadge>
            </>
          )}
          actions={
            <>
              {/* View By */}
              <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
                {(['category', 'merchant', 'month'] as ViewBy[]).map(v => (
                  <button key={v} onClick={() => setViewBy(v)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${viewBy === v ? 'bg-[#0070F3] text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                    {v === 'category' ? 'Category' : v === 'merchant' ? 'Merchant' : 'Month'}
                  </button>
                ))}
              </div>

              {/* Aggregate */}
              <select value={agg} onChange={e => setAgg(e.target.value as AggMode)}
                className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                <option value="sum">Sum</option>
                <option value="avg">Avg / Txn</option>
                <option value="count">Count</option>
              </select>

              {/* Compare prev period */}
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer px-1">
                <input type="checkbox" checked={showMoM} onChange={e => setShowMoM(e.target.checked)} className="rounded" />
                MoM
              </label>

              <PFButton
                variant={showChart ? 'active' : 'default'}
                icon={showChart ? <Table size={13} /> : <BarChart3 size={13} />}
                onClick={() => setShowChart(v => !v)}
              >
                {showChart ? 'Table' : 'Chart'}
              </PFButton>
              <PFButton icon={<FileDown size={13} />} onClick={handleExport}>
                Export
              </PFButton>
            </>
          }
        />

        {!hasData ? (
          <div className="text-center py-20 text-slate-400">
            <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Upload a bank statement in Statement Manager to see expenditure distribution.</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No transactions found for the selected filters.
          </div>
        ) : (
          <>
            {/* Chart view */}
            {showChart && (
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
                {sorted.slice(0, 20).map((r, i) => (
                  <div key={r.key} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-32 truncate text-right" title={r.key}>{r.key}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-5 rounded-full transition-all flex items-center pl-2"
                        style={{
                          width: `${(r.amount / maxAmount) * 100}%`,
                          backgroundColor: ['#0070F3','#107E3E','#E76500','#6A1B9A','#00838F','#C62828','#F9A825'][i % 7],
                        }}
                      >
                        <span className="text-[10px] text-white font-bold truncate">{fmtINR(r.amount)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">{r.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Table view */}
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">
                    {viewBy === 'category' ? 'Category' : viewBy === 'merchant' ? 'Merchant' : 'Month'}
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">{agg === 'count' ? 'Count' : agg === 'avg' ? 'Avg / Txn' : 'Amount'}</th>
                  <th className="px-4 py-3 text-right font-semibold">Txns</th>
                  <th className="px-4 py-3 text-right font-semibold">% of Total</th>
                  {showMoM && <th className="px-4 py-3 text-right font-semibold">Prev Period</th>}
                  {showMoM && <th className="px-4 py-3 text-right font-semibold">Change</th>}
                  <th className="px-4 py-3 text-center font-semibold w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => {
                  const change = r.amount - r.prevAmount;
                  const isRenaming = renamingKey === r.key;
                  const isMerging  = mergingKey  === r.key;
                  return (
                    <React.Fragment key={r.key}>
                      <tr
                        className={`border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${drillKey === r.key ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        onClick={() => !isRenaming && !isMerging && setDrillKey(drillKey === r.key ? null : r.key)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: ['#0070F3','#107E3E','#E76500','#6A1B9A','#00838F','#C62828','#F9A825'][i % 7] }} />
                            {isRenaming ? (
                              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                <input value={renameValue} onChange={e => setRenameValue(e.target.value)}
                                  className="text-sm border border-[#0070F3] rounded px-2 py-1 bg-white dark:bg-slate-900 w-36"
                                  autoFocus
                                  onKeyDown={e => { if (e.key === 'Enter') handleRename(r.key); if (e.key === 'Escape') setRenamingKey(null); }} />
                                <button onClick={() => handleRename(r.key)} className="text-[#107E3E]"><Check size={13} /></button>
                                <button onClick={() => setRenamingKey(null)} className="text-slate-400"><X size={13} /></button>
                              </div>
                            ) : (
                              <span className="font-medium text-slate-700 dark:text-slate-200">{r.key}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                          {agg === 'count' ? r.count : fmtINR(r.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">{r.count}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 hidden sm:block">
                              <div className="h-1.5 rounded-full bg-[#0070F3]" style={{ width: `${r.pct}%` }} />
                            </div>
                            <span className="text-slate-600 dark:text-slate-300 font-semibold">{fmtPct(r.pct)}</span>
                          </div>
                        </td>
                        {showMoM && (
                          <>
                            <td className="px-4 py-3 text-right text-slate-500 font-mono">{r.prevAmount > 0 ? fmtINR(r.prevAmount) : '—'}</td>
                            <td className={`px-4 py-3 text-right font-mono font-semibold ${change > 0 ? 'text-[#E76500]' : change < 0 ? 'text-[#107E3E]' : 'text-slate-400'}`}>
                              {r.prevAmount > 0 ? (change >= 0 ? '+' : '') + fmtINR(change) : '—'}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {viewBy === 'category' && (
                              <>
                                <button title="Rename"
                                  onClick={() => { setRenamingKey(r.key); setRenameValue(r.key); setMergingKey(null); }}
                                  className="p-1 text-slate-300 hover:text-[#0070F3] transition-colors">
                                  <Pencil size={12} />
                                </button>
                                <button title="Merge into another category"
                                  onClick={() => { setMergingKey(isMerging ? null : r.key); setMergeTarget(''); setRenamingKey(null); }}
                                  className="p-1 text-slate-300 hover:text-[#E76500] transition-colors">
                                  <Merge size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isMerging && (
                        <tr className="bg-orange-50 dark:bg-orange-900/10 border-t border-orange-200 dark:border-orange-800">
                          <td colSpan={showMoM ? 7 : 5} className="px-4 py-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-600 dark:text-slate-300 font-medium">Merge "{r.key}" into:</span>
                              <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)}
                                className="border border-orange-300 dark:border-orange-700 rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                                <option value="">— select target —</option>
                                {categories.filter(c => c !== r.key).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <button onClick={() => handleMerge(r.key)} disabled={!mergeTarget}
                                className="text-sm bg-[#E76500] text-white px-3 py-1 rounded font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors">
                                Merge
                              </button>
                              <button onClick={() => setMergingKey(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      {drillKey === r.key && drillTxns.length > 0 && !isRenaming && !isMerging && (
                        <tr className="bg-blue-50 dark:bg-blue-900/10">
                          <td colSpan={showMoM ? 7 : 5} className="px-4 py-2">
                            <div className="max-h-48 overflow-y-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-slate-400 uppercase text-[10px]">
                                    <th className="text-left py-1">Date</th>
                                    <th className="text-left py-1">Description</th>
                                    <th className="text-right py-1">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {drillTxns.slice(0, 20).map(t => (
                                    <tr key={t.id} className="border-t border-blue-100 dark:border-blue-800">
                                      <td className="py-1 text-slate-500">{t.date}</td>
                                      <td className="py-1 text-slate-600 dark:text-slate-300 max-w-[240px] truncate">{t.description}</td>
                                      <td className="py-1 text-right font-mono font-semibold text-slate-700 dark:text-slate-200">{fmtINR(t.amount)}</td>
                                    </tr>
                                  ))}
                                  {drillTxns.length > 20 && (
                                    <tr><td colSpan={3} className="py-1 text-slate-400 text-center">…and {drillTxns.length - 20} more</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {/* Footer */}
        {hasData && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600 space-y-0.5">
            {coverage && (
              <p>Statements covering: <span className="font-medium">{coverage.from} → {coverage.to}</span></p>
            )}
            <p>Last updated: {new Date(lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
