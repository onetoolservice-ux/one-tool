'use client';

import { useState, useEffect, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFFilterBarHeader } from './pf-ui';
import {
  getPFTransactions, getAccounts, getAvailableMonths, filterByPeriod, fmtINR,
  type PFTransaction, type PFAccount,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// SPENDING BEHAVIOR — Day-of-week + day-of-month breakdown.
// ═══════════════════════════════════════════════════════════════════════════════

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIOD_OPTIONS = [
  { key: 'all',           label: 'All Time' },
  { key: 'this-month',    label: 'This Month' },
  { key: 'last-month',    label: 'Last Month' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'this-year',     label: 'This Year' },
];

type View = 'dow' | 'dom';

export function SpendingBehavior() {
  const [mounted, setMounted]   = useState(false);
  const [allTxns, setAllTxns]   = useState<PFTransaction[]>([]);
  const [accounts, setAccounts] = useState<PFAccount[]>([]);
  const [months, setMonths]     = useState<{ key: string; label: string }[]>([]);

  const [period,        setPeriod]        = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [view,          setView]          = useState<View>('dow');

  const reload = () => {
    setAllTxns(getPFTransactions({ type: 'debit' }));
    setAccounts(getAccounts());
    setMonths(getAvailableMonths());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  const txns = useMemo(() => {
    let t = filterByPeriod(allTxns, period);
    if (accountFilter !== 'all') t = t.filter(x => x.accountId === accountFilter);
    return t;
  }, [allTxns, period, accountFilter]);

  // Day of week stats
  const dowStats = useMemo(() => {
    const buckets = Array.from({ length: 7 }, (_, i) => ({ day: DAYS[i], count: 0, total: 0 }));
    for (const t of txns) {
      const d = new Date(t.date + 'T12:00:00').getDay();
      buckets[d].count++;
      buckets[d].total += t.amount;
    }
    return buckets;
  }, [txns]);

  // Day of month stats (1-31)
  const domStats = useMemo(() => {
    const buckets = Array.from({ length: 31 }, (_, i) => ({ day: i + 1, count: 0, total: 0 }));
    for (const t of txns) {
      const d = parseInt(t.date.split('-')[2], 10) - 1;
      if (d >= 0 && d < 31) { buckets[d].count++; buckets[d].total += t.amount; }
    }
    return buckets;
  }, [txns]);

  const stats = view === 'dow' ? dowStats : domStats;
  const maxTotal = Math.max(...stats.map(s => s.total), 1);
  const grandTotal = txns.reduce((s, t) => s + t.amount, 0);
  const activeFilters = [accountFilter !== 'all', period !== 'all'].filter(Boolean).length;

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Spending Behavior"
        subtitle="When do you spend most? Day-of-week and day-of-month patterns."
        kpis={txns.length > 0 ? [
          { label: 'Transactions', value: txns.length,         color: 'primary' },
          { label: 'Total Spend',  value: fmtINR(grandTotal),  color: 'warning' },
          { label: 'Avg / Day',    value: fmtINR(grandTotal / (view === 'dow' ? 7 : 31)), color: 'neutral' },
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

        {/* View Toggle */}
        <div className="flex gap-2">
          {(['dow', 'dom'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`text-xs px-4 py-1.5 rounded-lg border font-semibold transition-colors
                ${view === v ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {v === 'dow' ? 'Day of Week' : 'Day of Month'}
            </button>
          ))}
        </div>

        {txns.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
            <p className="text-sm text-slate-400">No debit transactions found.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 font-medium">
                {view === 'dow' ? 'Spending by Day of Week' : 'Spending by Day of Month'}
              </span>
            </div>
            <div className="p-4 space-y-2">
              {stats.filter(s => view === 'dom' ? s.total > 0 : true).map(s => (
                <div key={s.day} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-24 shrink-0 text-right">
                    {view === 'dow' ? (s as typeof dowStats[0]).day : `Day ${(s as typeof domStats[0]).day}`}
                  </span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-5 relative overflow-hidden">
                    <div
                      className="h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                      style={{ width: `${(s.total / maxTotal) * 100}%` }}
                    />
                    {s.total > 0 && (
                      <span className="absolute inset-0 flex items-center pl-2 text-[10px] font-semibold text-white/90">
                        {fmtINR(s.total)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 w-10 text-right shrink-0">{s.count} txn{s.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
