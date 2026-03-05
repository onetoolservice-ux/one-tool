'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFFilterBarHeader } from './pf-ui';
import {
  getPFTransactions, getAccounts, getAllCategories, getAvailableMonths,
  filterByPeriod, fmtINR,
  type PFTransaction, type PFAccount,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// BIG SPENDS — Debit transactions above a user-set threshold.
// ═══════════════════════════════════════════════════════════════════════════════

type SortCol = 'date' | 'description' | 'category' | 'amount';
type SortDir = 'asc' | 'desc';

const PERIOD_OPTIONS = [
  { key: 'all',           label: 'All Time' },
  { key: 'this-month',    label: 'This Month' },
  { key: 'last-month',    label: 'Last Month' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'this-year',     label: 'This Year' },
];

const THRESHOLD_PRESETS = [1000, 2000, 5000, 10000, 25000, 50000];

export function BigSpends() {
  const [mounted, setMounted]       = useState(false);
  const [allTxns, setAllTxns]       = useState<PFTransaction[]>([]);
  const [accounts, setAccounts]     = useState<PFAccount[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [months, setMonths]         = useState<{ key: string; label: string }[]>([]);

  const [period,        setPeriod]        = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [catFilter,     setCatFilter]     = useState('all');
  const [threshold,     setThreshold]     = useState(5000);
  const [thresholdInput, setThresholdInput] = useState('5000');
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [sortCol,       setSortCol]       = useState<SortCol>('amount');
  const [sortDir,       setSortDir]       = useState<SortDir>('desc');

  const reload = () => {
    setAllTxns(getPFTransactions({ type: 'debit' }));
    setAccounts(getAccounts());
    setCategories(getAllCategories());
    setMonths(getAvailableMonths());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  const filtered = useMemo(() => {
    let txns = filterByPeriod(allTxns, period);
    txns = txns.filter(t => t.amount >= threshold);
    if (accountFilter !== 'all') txns = txns.filter(t => t.accountId === accountFilter);
    if (catFilter !== 'all')     txns = txns.filter(t => t.category === catFilter);
    return txns;
  }, [allTxns, period, threshold, accountFilter, catFilter]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortCol === 'date')        cmp = a.date.localeCompare(b.date);
    else if (sortCol === 'description') cmp = a.description.localeCompare(b.description);
    else if (sortCol === 'category')    cmp = a.category.localeCompare(b.category);
    else                                cmp = a.amount - b.amount;
    return sortDir === 'asc' ? cmp : -cmp;
  }), [filtered, sortCol, sortDir]);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const totalSpend = filtered.reduce((s, t) => s + t.amount, 0);
  const avgSpend   = filtered.length > 0 ? totalSpend / filtered.length : 0;
  const activeFilters = [catFilter !== 'all', accountFilter !== 'all', period !== 'all'].filter(Boolean).length;

  const SI = ({ col }: { col: SortCol }) =>
    sortCol === col
      ? (sortDir === 'asc' ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />)
      : <ChevronDown size={11} className="text-slate-300 dark:text-slate-600" />;

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Big Spends"
        subtitle={`Transactions above ${fmtINR(threshold)}`}
        kpis={filtered.length > 0 ? [
          { label: 'Count',       value: filtered.length,     color: 'primary' },
          { label: 'Total',       value: fmtINR(totalSpend),  color: 'error' },
          { label: 'Avg Amount',  value: fmtINR(avgSpend),    color: 'warning' },
          { label: 'Largest',     value: fmtINR(sorted[0]?.amount ?? 0), color: 'error' },
        ] : undefined}
      />
      <div className="space-y-4 px-4 pb-4">

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
          <PFFilterBarHeader
            activeCount={activeFilters}
            onClearAll={() => { setCatFilter('all'); setAccountFilter('all'); setPeriod('all'); }}
            showFilterBar={showFilterBar}
            onToggle={() => setShowFilterBar(v => !v)}
          />
          {showFilterBar && (
            <div className="px-4 py-3 space-y-3">
              {/* Threshold */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Threshold (Min Amount)</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {THRESHOLD_PRESETS.map(p => (
                    <button key={p} onClick={() => { setThreshold(p); setThresholdInput(String(p)); }}
                      className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-colors
                        ${threshold === p ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      {fmtINR(p)}
                    </button>
                  ))}
                  <input
                    type="number"
                    value={thresholdInput}
                    onChange={e => setThresholdInput(e.target.value)}
                    onBlur={() => {
                      const n = parseFloat(thresholdInput);
                      if (!isNaN(n) && n >= 0) setThreshold(n);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const n = parseFloat(thresholdInput);
                        if (!isNaN(n) && n >= 0) setThreshold(n);
                      }
                    }}
                    placeholder="Custom…"
                    className="w-28 text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>
              {/* Other filters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Period</label>
                  <select value={period} onChange={e => setPeriod(e.target.value)}
                    className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    {PERIOD_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                    {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Account</label>
                  <select value={accountFilter} onChange={e => setAccountFilter(e.target.value)}
                    className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    <option value="all">All Accounts</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Category</label>
                  <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                    className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {sorted.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
            <AlertCircle size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No transactions above {fmtINR(threshold)}.</p>
            <p className="text-xs text-slate-400 mt-1">Try lowering the threshold.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
              <span className="text-xs text-slate-500">{sorted.length} transactions</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtINR(totalSpend)} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
                    <th className="px-4 py-2.5 text-left"><button className="flex items-center gap-1" onClick={() => toggleSort('date')}>Date <SI col="date" /></button></th>
                    <th className="px-4 py-2.5 text-left"><button className="flex items-center gap-1" onClick={() => toggleSort('description')}>Description <SI col="description" /></button></th>
                    <th className="px-4 py-2.5 text-left"><button className="flex items-center gap-1" onClick={() => toggleSort('category')}>Category <SI col="category" /></button></th>
                    <th className="px-4 py-2.5 text-right"><button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('amount')}><SI col="amount" />Amount</button></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(t => (
                    <tr key={t.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.date}</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-100 max-w-[240px] truncate" title={t.description}>{t.description}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{t.category}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-red-600 dark:text-red-400">{fmtINR(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
