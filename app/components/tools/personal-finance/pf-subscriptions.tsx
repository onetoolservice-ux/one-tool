'use client';

import { useState, useEffect, useMemo } from 'react';
import { Repeat2, Tag } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFButton, PFBadge } from './pf-ui';
import { useToast } from '@/app/components/ui/toast-system';
import {
  getPFTransactions, getAllCategories, getAccounts, bulkApplyCategoryOverride,
  fmtINR, type PFTransaction, type PFAccount,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION FINDER — Recurring debits with highly consistent amounts.
// Detects subscriptions (Netflix, Spotify, SIPs, etc.) from recurring txns.
// ═══════════════════════════════════════════════════════════════════════════════

interface SubRow {
  merchant: string;
  category: string;
  count: number;
  avgAmount: number;
  variance: number;       // coefficient of variation %
  monthlyEst: number;
  annualEst: number;
  txnIds: string[];
  lastDate: string;
}

function normMerchant(desc: string): string {
  return desc.toLowerCase().replace(/\d{6,}/g, '').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
}

function stdDev(vals: number[]): number {
  if (vals.length < 2) return 0;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
}

export function SubscriptionFinder() {
  const { toast } = useToast();
  const [mounted, setMounted]       = useState(false);
  const [allTxns, setAllTxns]       = useState<PFTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [accounts, setAccounts]     = useState<PFAccount[]>([]);
  const [accountFilter, setAccountFilter] = useState('all');
  const [maxCV, setMaxCV]           = useState(10);  // coefficient of variation threshold %

  const [editMerchant, setEditMerchant] = useState<string | null>(null);
  const [editCat,      setEditCat]      = useState('');
  const [newCat,       setNewCat]       = useState('');

  const reload = () => {
    setAllTxns(getPFTransactions({ recurring: true, type: 'debit' }));
    setCategories(getAllCategories());
    setAccounts(getAccounts());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  const subs = useMemo((): SubRow[] => {
    let txns = allTxns;
    if (accountFilter !== 'all') txns = txns.filter(t => t.accountId === accountFilter);

    const map = new Map<string, PFTransaction[]>();
    for (const t of txns) {
      const key = normMerchant(t.description);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }

    const rows: SubRow[] = [];
    for (const ts of map.values()) {
      if (ts.length < 2) continue;
      const amounts = ts.map(t => t.amount);
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const cv = avg > 0 ? (stdDev(amounts) / avg) * 100 : 0;
      if (cv > maxCV) continue; // not consistent enough

      const sorted = [...ts].sort((a, b) => b.date.localeCompare(a.date));
      // Estimate frequency from interval
      const dates = [...ts].sort((a, b) => a.date.localeCompare(b.date)).map(t => new Date(t.date + 'T12:00:00').getTime());
      const intervals = dates.slice(1).map((d, i) => Math.round((d - dates[i]) / 86400000));
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const monthlyEst = avgInterval > 0 ? avg * (30.4 / avgInterval) : avg;

      rows.push({
        merchant: sorted[0].description,
        category: sorted[0].category,
        count: ts.length,
        avgAmount: avg,
        variance: cv,
        monthlyEst,
        annualEst: monthlyEst * 12,
        txnIds: ts.map(t => t.id),
        lastDate: sorted[0].date,
      });
    }
    return rows.sort((a, b) => b.annualEst - a.annualEst);
  }, [allTxns, accountFilter, maxCV]);

  const saveCategory = (row: SubRow, cat: string) => {
    const c = cat.trim();
    if (!c) return;
    bulkApplyCategoryOverride(row.txnIds, c);
    toast(`Updated ${row.txnIds.length} transactions → ${c}`, 'success');
    setEditMerchant(null);
    setNewCat('');
    reload();
  };

  const totalMonthly = subs.reduce((s, r) => s + r.monthlyEst, 0);
  const totalAnnual  = subs.reduce((s, r) => s + r.annualEst,  0);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Subscription Finder"
        subtitle="Recurring payments with consistent amounts — likely subscriptions & SIPs"
        kpis={subs.length > 0 ? [
          { label: 'Subscriptions',   value: subs.length,             color: 'primary' },
          { label: 'Est. Monthly',    value: fmtINR(totalMonthly),    color: 'warning' },
          { label: 'Est. Annual',     value: fmtINR(totalAnnual),     color: 'error' },
        ] : undefined}
      />
      <div className="space-y-4 px-4 pb-4">

        {/* Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Account</label>
              <select value={accountFilter} onChange={e => setAccountFilter(e.target.value)}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                <option value="all">All Accounts</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Amount Consistency</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={50} value={maxCV} onChange={e => setMaxCV(parseInt(e.target.value, 10))}
                  className="flex-1" />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-12">≤{maxCV}% CV</span>
              </div>
              <p className="text-[10px] text-slate-400">Lower = stricter (fixed amounts only)</p>
            </div>
          </div>
        </div>

        {subs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
            <Repeat2 size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No subscriptions detected.</p>
            <p className="text-xs text-slate-400 mt-1">Try increasing the consistency threshold, or upload more statement data.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
              <span className="text-xs text-slate-500">{subs.length} detected · consistency ≤{maxCV}% variation</span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{fmtINR(totalAnnual)} / year</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
                    <th className="px-4 py-2.5 text-left">Merchant</th>
                    <th className="px-4 py-2.5 text-left">Category</th>
                    <th className="px-4 py-2.5 text-right">Occurrences</th>
                    <th className="px-4 py-2.5 text-right">Avg Amount</th>
                    <th className="px-4 py-2.5 text-right">Est. Monthly</th>
                    <th className="px-4 py-2.5 text-right">Est. Annual</th>
                    <th className="px-4 py-2.5 text-right">Consistency</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map(row => {
                    const isEditing = editMerchant === row.merchant;
                    return (
                      <tr key={row.merchant} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate" title={row.merchant}>{row.merchant}</p>
                          <p className="text-[10px] text-slate-400">{row.lastDate}</p>
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5 min-w-[150px]">
                              <select value={editCat} onChange={e => setEditCat(e.target.value)}
                                className="text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-900">
                                <option value="">— pick —</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Or new…"
                                onKeyDown={e => e.key === 'Enter' && saveCategory(row, newCat || editCat)}
                                className="text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-900" />
                              <div className="flex gap-1">
                                <button onClick={() => saveCategory(row, newCat || editCat)} disabled={!editCat && !newCat.trim()}
                                  className="flex-1 text-[10px] font-semibold bg-blue-600 text-white rounded px-2 py-1 disabled:opacity-40">Apply</button>
                                <button onClick={() => { setEditMerchant(null); setNewCat(''); }}
                                  className="text-[10px] px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-500">✕</button>
                              </div>
                            </div>
                          ) : <PFBadge color="blue">{row.category}</PFBadge>}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">{row.count}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">{fmtINR(row.avgAmount)}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">{fmtINR(row.monthlyEst)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-orange-600 dark:text-orange-400">{fmtINR(row.annualEst)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${row.variance < 5 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'}`}>
                            {row.variance.toFixed(1)}% CV
                          </span>
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
