'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFFilterBarHeader } from './pf-ui';
import {
  getPFTransactions, getAccounts, getAvailableMonths, filterByPeriod, fmtINR,
  type PFTransaction, type PFAccount,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// INCOME SOURCES — Credit transactions grouped by category.
// ═══════════════════════════════════════════════════════════════════════════════

interface SourceRow {
  category: string;
  count: number;
  total: number;
  avg: number;
  pct: number;
}

type SortCol = 'category' | 'count' | 'avg' | 'total' | 'pct';
type SortDir = 'asc' | 'desc';

const PERIOD_OPTIONS = [
  { key: 'all',           label: 'All Time' },
  { key: 'this-month',    label: 'This Month' },
  { key: 'last-month',    label: 'Last Month' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'this-year',     label: 'This Year' },
];

export function IncomeSources() {
  const [mounted, setMounted]   = useState(false);
  const [allTxns, setAllTxns]   = useState<PFTransaction[]>([]);
  const [accounts, setAccounts] = useState<PFAccount[]>([]);
  const [months, setMonths]     = useState<{ key: string; label: string }[]>([]);

  const [period,        setPeriod]        = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [sortCol,       setSortCol]       = useState<SortCol>('total');
  const [sortDir,       setSortDir]       = useState<SortDir>('desc');

  const reload = () => {
    setAllTxns(getPFTransactions({ type: 'credit' }));
    setAccounts(getAccounts());
    setMonths(getAvailableMonths());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  const { rows, grandTotal } = useMemo(() => {
    let txns = filterByPeriod(allTxns, period);
    if (accountFilter !== 'all') txns = txns.filter(t => t.accountId === accountFilter);

    const map = new Map<string, PFTransaction[]>();
    for (const t of txns) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    const grand = txns.reduce((s, t) => s + t.amount, 0);
    const r: SourceRow[] = Array.from(map.entries()).map(([cat, ts]) => {
      const total = ts.reduce((s, t) => s + t.amount, 0);
      return { category: cat, count: ts.length, total, avg: total / ts.length, pct: grand > 0 ? (total / grand) * 100 : 0 };
    });
    return { rows: r, grandTotal: grand };
  }, [allTxns, period, accountFilter]);

  const sorted = useMemo(() => [...rows].sort((a, b) => {
    let cmp = 0;
    if (sortCol === 'category') cmp = a.category.localeCompare(b.category);
    else if (sortCol === 'count') cmp = a.count - b.count;
    else if (sortCol === 'avg')   cmp = a.avg - b.avg;
    else if (sortCol === 'pct')   cmp = a.pct - b.pct;
    else                          cmp = a.total - b.total;
    return sortDir === 'asc' ? cmp : -cmp;
  }), [rows, sortCol, sortDir]);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const SI = ({ col }: { col: SortCol }) =>
    sortCol === col
      ? (sortDir === 'asc' ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />)
      : <ChevronDown size={11} className="text-slate-300 dark:text-slate-600" />;

  const totalTxns = rows.reduce((s, r) => s + r.count, 0);
  const activeFilters = [accountFilter !== 'all', period !== 'all'].filter(Boolean).length;

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Income Sources"
        subtitle="Credit transactions broken down by category"
        kpis={rows.length > 0 ? [
          { label: 'Sources',      value: rows.length,         color: 'primary' },
          { label: 'Total Income', value: fmtINR(grandTotal),  color: 'success' },
          { label: 'Transactions', value: totalTxns,           color: 'neutral' },
          { label: 'Top Source',   value: sorted[0]?.category ?? '—', color: 'neutral' },
        ] : undefined}
      />
      <div className="space-y-4 px-4 pb-4">

        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
          <PFFilterBarHeader
            activeCount={activeFilters}
            onClearAll={() => { setAccountFilter('all'); setPeriod('all'); }}
            showFilterBar={showFilterBar}
            onToggle={() => setShowFilterBar(v => !v)}
          />
          {showFilterBar && (
            <div className="px-4 py-3 grid grid-cols-2 gap-3">
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
            </div>
          )}
        </div>

        {sorted.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
            <TrendingUp size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No credit transactions found.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
              <span className="text-xs text-slate-500">{sorted.length} income categories</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{fmtINR(grandTotal)} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
                    <th className="px-4 py-2.5 text-left"><button className="flex items-center gap-1" onClick={() => toggleSort('category')}>Source / Category <SI col="category" /></button></th>
                    <th className="px-4 py-2.5 text-right"><button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('count')}><SI col="count" />Transactions</button></th>
                    <th className="px-4 py-2.5 text-right"><button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('avg')}><SI col="avg" />Avg Credit</button></th>
                    <th className="px-4 py-2.5 text-right"><button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('total')}><SI col="total" />Total</button></th>
                    <th className="px-4 py-2.5 text-left"><button className="flex items-center gap-1" onClick={() => toggleSort('pct')}>% Share <SI col="pct" /></button></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(row => (
                    <tr key={row.category} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{row.category}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300 font-mono">{row.count}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">{fmtINR(row.avg)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{fmtINR(row.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${Math.min(row.pct, 100)}%` }} />
                          </div>
                          <span className="text-slate-500 text-[10px] w-10 text-right">{row.pct.toFixed(1)}%</span>
                        </div>
                      </td>
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
