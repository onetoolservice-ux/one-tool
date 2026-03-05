'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Search, Tag, ChevronUp, ChevronDown, X } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFButton, PFBadge, PFFilterBarHeader } from './pf-ui';
import { useToast } from '@/app/components/ui/toast-system';
import {
  getPFTransactions, getAllCategories, bulkApplyCategoryOverride,
  getAccounts, rerunRecurringDetection,
  fmtINR,
  type PFTransaction, type PFAccount,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// RECURRING PAYMENTS — Groups recurring-flagged debits by merchant.
// User can assign/change category per merchant group (bulk applies to all txns).
// ═══════════════════════════════════════════════════════════════════════════════

interface MerchantGroup {
  merchant: string;          // display name (first txn description)
  category: string;          // current category (from first txn)
  count: number;
  totalAmount: number;
  avgAmount: number;
  firstDate: string;
  lastDate: string;
  txnIds: string[];
  accountIds: Set<string>;
}

type SortCol = 'merchant' | 'category' | 'count' | 'avgAmount' | 'totalAmount' | 'lastDate';
type SortDir = 'asc' | 'desc';

function normMerchant(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/\d{6,}/g, '')        // strip long numbers (refs/acc numbers)
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);
}

export function RecurringPayments() {
  const { toast } = useToast();
  const [mounted, setMounted]       = useState(false);
  const [allTxns, setAllTxns]       = useState<PFTransaction[]>([]);
  const [accounts, setAccounts]     = useState<PFAccount[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [showFilterBar, setShowFilterBar] = useState(true);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState<SortCol>('totalAmount');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Inline category edit ───────────────────────────────────────────────────
  const [editMerchant, setEditMerchant] = useState<string | null>(null);
  const [editCatVal, setEditCatVal]     = useState('');
  const [newCatInput, setNewCatInput]   = useState('');

  const reload = () => {
    setAllTxns(getPFTransactions({ recurring: true, type: 'debit' }));
    setAccounts(getAccounts());
    setCategories(getAllCategories());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    const h = () => reload();
    window.addEventListener('pf-store-updated', h);
    return () => window.removeEventListener('pf-store-updated', h);
  }, []);

  // ── Group by normalized merchant ───────────────────────────────────────────
  const groups = useMemo((): MerchantGroup[] => {
    const map = new Map<string, PFTransaction[]>();
    for (const t of allTxns) {
      const key = normMerchant(t.description);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).map(([, txns]) => {
      const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date));
      const total = txns.reduce((s, t) => s + t.amount, 0);
      return {
        merchant: sorted[sorted.length - 1].description,
        category: sorted[sorted.length - 1].category,
        count: txns.length,
        totalAmount: total,
        avgAmount: total / txns.length,
        firstDate: sorted[0].date,
        lastDate: sorted[sorted.length - 1].date,
        txnIds: txns.map(t => t.id),
        accountIds: new Set(txns.map(t => t.accountId)),
      } satisfies MerchantGroup;
    });
  }, [allTxns]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = groups;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(g => g.merchant.toLowerCase().includes(q));
    }
    if (catFilter !== 'all') rows = rows.filter(g => g.category === catFilter);
    if (accountFilter !== 'all') rows = rows.filter(g => g.accountIds.has(accountFilter));
    return rows;
  }, [groups, search, catFilter, accountFilter]);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'merchant')     cmp = a.merchant.localeCompare(b.merchant);
      else if (sortCol === 'category')    cmp = a.category.localeCompare(b.category);
      else if (sortCol === 'count')       cmp = a.count - b.count;
      else if (sortCol === 'avgAmount')   cmp = a.avgAmount - b.avgAmount;
      else if (sortCol === 'totalAmount') cmp = a.totalAmount - b.totalAmount;
      else if (sortCol === 'lastDate')    cmp = a.lastDate.localeCompare(b.lastDate);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  // ── Category save ──────────────────────────────────────────────────────────
  const saveCategory = (group: MerchantGroup, cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    bulkApplyCategoryOverride(group.txnIds, trimmed);
    toast(`Category updated → ${trimmed} (${group.txnIds.length} txns)`, 'success');
    setEditMerchant(null);
    setNewCatInput('');
    reload();
  };

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const totalRecurring = groups.reduce((s, g) => s + g.totalAmount, 0);
  const uniqueMerchants = groups.length;
  const totalTxns = groups.reduce((s, g) => s + g.count, 0);

  const activeFilters = [search, catFilter !== 'all', accountFilter !== 'all'].filter(Boolean).length;

  const SortIcon = ({ col }: { col: SortCol }) => (
    sortCol === col
      ? (sortDir === 'asc' ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />)
      : <ChevronDown size={11} className="text-slate-300 dark:text-slate-600" />
  );

  if (!mounted) return null;

  const hasData = allTxns.length > 0;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Recurring Payments"
        subtitle="Auto-detected repetitive debits grouped by merchant"
        kpis={hasData ? [
          { label: 'Merchants',   value: uniqueMerchants,       color: 'primary' },
          { label: 'Transactions', value: totalTxns,            color: 'neutral' },
          { label: 'Total Spend', value: fmtINR(totalRecurring), color: 'warning' },
          { label: 'Avg / Merchant', value: fmtINR(uniqueMerchants ? totalRecurring / uniqueMerchants : 0), color: 'neutral' },
        ] : undefined}
      />

      <div className="space-y-4 px-4 pb-4">

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
          <PFFilterBarHeader
            activeCount={activeFilters}
            onClearAll={() => { setSearch(''); setCatFilter('all'); setAccountFilter('all'); }}
            showFilterBar={showFilterBar}
            onToggle={() => setShowFilterBar(v => !v)}
            actions={
              <PFButton
                icon={<RefreshCw size={12} />}
                onClick={() => { rerunRecurringDetection(); reload(); toast('Recurring detection re-run', 'success'); }}
              >
                Re-detect
              </PFButton>
            }
          />
          {showFilterBar && (
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Search Merchant</label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Type to search…"
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Category</label>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Account */}
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

        {/* Empty state */}
        {!hasData ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
            <RefreshCw size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No recurring payments detected.</p>
            <p className="text-xs text-slate-400 mt-1">Upload statements with at least 3 months of data for auto-detection.</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-400">No results match your filters.</p>
          </div>
        ) : (

          /* Table */
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
            {/* Result count */}
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {sorted.length} merchant{sorted.length !== 1 ? 's' : ''} · {filtered.reduce((s, g) => s + g.count, 0)} transactions
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {fmtINR(filtered.reduce((s, g) => s + g.totalAmount, 0))} total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
                    <th className="px-4 py-2.5 text-left">
                      <button className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('merchant')}>
                        Merchant <SortIcon col="merchant" />
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-left">
                      <button className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('category')}>
                        Category <SortIcon col="category" />
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-right">
                      <button className="flex items-center gap-1 ml-auto hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('count')}>
                        <SortIcon col="count" /> Occurrences
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-right">
                      <button className="flex items-center gap-1 ml-auto hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('avgAmount')}>
                        <SortIcon col="avgAmount" /> Avg Amount
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-right">
                      <button className="flex items-center gap-1 ml-auto hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('totalAmount')}>
                        <SortIcon col="totalAmount" /> Total Spend
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-left">
                      <button className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('lastDate')}>
                        Last Seen <SortIcon col="lastDate" />
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-left">First Seen</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(group => {
                    const isEditing = editMerchant === group.merchant;
                    return (
                      <tr
                        key={group.merchant}
                        className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      >
                        {/* Merchant */}
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate" title={group.merchant}>
                            {group.merchant}
                          </p>
                        </td>

                        {/* Category — inline edit */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5 min-w-[180px]">
                              {/* Existing categories */}
                              <select
                                value={editCatVal}
                                onChange={e => setEditCatVal(e.target.value)}
                                className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                              >
                                <option value="">— pick existing —</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              {/* Or type new */}
                              <input
                                type="text"
                                placeholder="Or type new category…"
                                value={newCatInput}
                                onChange={e => setNewCatInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveCategory(group, newCatInput || editCatVal); }}
                                className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => saveCategory(group, newCatInput || editCatVal)}
                                  disabled={!editCatVal && !newCatInput.trim()}
                                  className="flex-1 text-[10px] font-semibold bg-blue-600 text-white rounded px-2 py-1 disabled:opacity-40"
                                >
                                  Apply to all {group.count} txns
                                </button>
                                <button
                                  onClick={() => { setEditMerchant(null); setNewCatInput(''); }}
                                  className="text-[10px] px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <PFBadge color="slate">{group.category}</PFBadge>
                          )}
                        </td>

                        {/* Count */}
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300 font-mono font-semibold">
                          {group.count}
                        </td>

                        {/* Avg Amount */}
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-200">
                          {fmtINR(group.avgAmount)}
                        </td>

                        {/* Total Spend */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          {fmtINR(group.totalAmount)}
                        </td>

                        {/* Last Date */}
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{group.lastDate}</td>

                        {/* First Date */}
                        <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{group.firstDate}</td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          {!isEditing && (
                            <PFButton
                              variant="primary"
                              icon={<Tag size={12} />}
                              onClick={() => {
                                setEditMerchant(group.merchant);
                                setEditCatVal(group.category);
                                setNewCatInput('');
                              }}
                            >
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
