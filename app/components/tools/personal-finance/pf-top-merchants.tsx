'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, X, Tag } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFButton, PFBadge, PFFilterBarHeader } from './pf-ui';
import { useToast } from '@/app/components/ui/toast-system';
import {
  getPFTransactions, getAllCategories, getAccounts, getAvailableMonths,
  bulkApplyCategoryOverride, filterByPeriod, fmtINR,
  type PFTransaction, type PFAccount,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// TOP MERCHANTS — All debits grouped by merchant, sorted by total spend.
// ═══════════════════════════════════════════════════════════════════════════════

interface MerchantRow {
  merchant: string;
  category: string;
  count: number;
  total: number;
  avg: number;
  txnIds: string[];
}

type SortCol = 'merchant' | 'category' | 'count' | 'avg' | 'total';
type SortDir = 'asc' | 'desc';

const PERIOD_OPTIONS = [
  { key: 'all',           label: 'All Time' },
  { key: 'this-month',    label: 'This Month' },
  { key: 'last-month',    label: 'Last Month' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'this-year',     label: 'This Year' },
];

function normMerchant(desc: string): string {
  return desc.toLowerCase().replace(/\d{6,}/g, '').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
}

export function TopMerchants() {
  const { toast } = useToast();
  const [mounted, setMounted]       = useState(false);
  const [allTxns, setAllTxns]       = useState<PFTransaction[]>([]);
  const [accounts, setAccounts]     = useState<PFAccount[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [months, setMonths]         = useState<{ key: string; label: string }[]>([]);

  const [period,        setPeriod]        = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [catFilter,     setCatFilter]     = useState('all');
  const [search,        setSearch]        = useState('');
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [sortCol,       setSortCol]       = useState<SortCol>('total');
  const [sortDir,       setSortDir]       = useState<SortDir>('desc');

  const [editMerchant, setEditMerchant] = useState<string | null>(null);
  const [editCat,      setEditCat]      = useState('');
  const [newCat,       setNewCat]       = useState('');

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

  const rows = useMemo((): MerchantRow[] => {
    let txns = filterByPeriod(allTxns, period);
    if (accountFilter !== 'all') txns = txns.filter(t => t.accountId === accountFilter);

    const map = new Map<string, PFTransaction[]>();
    for (const t of txns) {
      const key = normMerchant(t.description);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.values()).map(ts => {
      const total = ts.reduce((s, t) => s + t.amount, 0);
      const last = [...ts].sort((a, b) => b.date.localeCompare(a.date))[0];
      return { merchant: last.description, category: last.category, count: ts.length, total, avg: total / ts.length, txnIds: ts.map(t => t.id) };
    });
  }, [allTxns, period, accountFilter]);

  const filtered = useMemo(() => {
    let r = rows;
    if (catFilter !== 'all') r = r.filter(row => row.category === catFilter);
    if (search.trim()) r = r.filter(row => row.merchant.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [rows, catFilter, search]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortCol === 'merchant')  cmp = a.merchant.localeCompare(b.merchant);
    else if (sortCol === 'category') cmp = a.category.localeCompare(b.category);
    else if (sortCol === 'count')    cmp = a.count - b.count;
    else if (sortCol === 'avg')      cmp = a.avg - b.avg;
    else                             cmp = a.total - b.total;
    return sortDir === 'asc' ? cmp : -cmp;
  }), [filtered, sortCol, sortDir]);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const saveCategory = (row: MerchantRow, cat: string) => {
    const c = cat.trim();
    if (!c) return;
    bulkApplyCategoryOverride(row.txnIds, c);
    toast(`Updated ${row.txnIds.length} transactions → ${c}`, 'success');
    setEditMerchant(null);
    setNewCat('');
    reload();
  };

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  const activeFilters = [catFilter !== 'all', accountFilter !== 'all', !!search.trim(), period !== 'all'].filter(Boolean).length;

  const SI = ({ col }: { col: SortCol }) =>
    sortCol === col
      ? (sortDir === 'asc' ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />)
      : <ChevronDown size={11} className="text-slate-300 dark:text-slate-600" />;

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Top Merchants"
        subtitle="All debit transactions grouped and ranked by total spend"
        kpis={rows.length > 0 ? [
          { label: 'Merchants',   value: rows.length,          color: 'primary' },
          { label: 'Total Spend', value: fmtINR(grandTotal),   color: 'warning' },
          { label: 'Top Merchant', value: sorted[0]?.merchant.slice(0, 20) ?? '—', color: 'neutral' },
          { label: 'Top Spend',   value: sorted[0] ? fmtINR(sorted[0].total) : '—', color: 'error' },
        ] : undefined}
      />
      <div className="space-y-4 px-4 pb-4">

        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
          <PFFilterBarHeader
            activeCount={activeFilters}
            onClearAll={() => { setSearch(''); setCatFilter('all'); setAccountFilter('all'); setPeriod('all'); }}
            showFilterBar={showFilterBar}
            onToggle={() => setShowFilterBar(v => !v)}
          />
          {showFilterBar && (
            <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Search</label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Merchant name…"
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={12} className="text-slate-400" /></button>}
                </div>
              </div>
            </div>
          )}
        </div>

        {sorted.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
            <p className="text-sm text-slate-400">No transactions found for the selected filters.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <span className="text-xs text-slate-500">{sorted.length} merchants · {sorted.reduce((s, r) => s + r.count, 0)} transactions</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtINR(sorted.reduce((s, r) => s + r.total, 0))} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
                    <th className="px-3 py-2.5 text-left w-8">#</th>
                    <th className="px-4 py-2.5 text-left"><button className="flex items-center gap-1" onClick={() => toggleSort('merchant')}>Merchant <SI col="merchant" /></button></th>
                    <th className="px-4 py-2.5 text-left"><button className="flex items-center gap-1" onClick={() => toggleSort('category')}>Category <SI col="category" /></button></th>
                    <th className="px-4 py-2.5 text-right"><button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('count')}><SI col="count" />Txns</button></th>
                    <th className="px-4 py-2.5 text-right"><button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('avg')}><SI col="avg" />Avg</button></th>
                    <th className="px-4 py-2.5 text-right"><button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('total')}><SI col="total" />Total</button></th>
                    <th className="px-4 py-2.5 text-left">% of Spend</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row, i) => {
                    const pct = grandTotal > 0 ? (row.total / grandTotal) * 100 : 0;
                    const isEditing = editMerchant === row.merchant;
                    return (
                      <tr key={row.merchant} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-3 text-slate-400 font-mono text-[10px]">{i + 1}</td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate" title={row.merchant}>{row.merchant}</p>
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5 min-w-[160px]">
                              <select value={editCat} onChange={e => setEditCat(e.target.value)}
                                className="text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-900">
                                <option value="">— pick —</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Or new category…"
                                onKeyDown={e => e.key === 'Enter' && saveCategory(row, newCat || editCat)}
                                className="text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-900" />
                              <div className="flex gap-1">
                                <button onClick={() => saveCategory(row, newCat || editCat)} disabled={!editCat && !newCat.trim()}
                                  className="flex-1 text-[10px] font-semibold bg-blue-600 text-white rounded px-2 py-1 disabled:opacity-40">
                                  Apply ({row.count})
                                </button>
                                <button onClick={() => { setEditMerchant(null); setNewCat(''); }}
                                  className="text-[10px] px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-500">✕</button>
                              </div>
                            </div>
                          ) : (
                            <PFBadge color="slate">{row.category}</PFBadge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-600 dark:text-slate-300">{row.count}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">{fmtINR(row.avg)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{fmtINR(row.total)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                              <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <span className="text-slate-500 text-[10px] w-8 text-right">{pct.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!isEditing && (
                            <PFButton variant="primary" icon={<Tag size={12} />}
                              onClick={() => { setEditMerchant(row.merchant); setEditCat(row.category); setNewCat(''); }}>
                              Category
                            </PFButton>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
