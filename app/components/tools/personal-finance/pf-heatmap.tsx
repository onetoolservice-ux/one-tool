'use client';

import { useState, useEffect, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { fmtINR, getPFTransactions, getAccounts, type PFTransaction, type PFAccount } from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// SPENDING HEATMAP — Calendar grid colored by daily spend intensity.
// ═══════════════════════════════════════════════════════════════════════════════

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getIntensityClass(amount: number, max: number): string {
  if (amount === 0 || max === 0) return 'bg-slate-100 dark:bg-slate-800';
  const ratio = amount / max;
  if (ratio < 0.2)  return 'bg-amber-100 dark:bg-amber-900/30';
  if (ratio < 0.4)  return 'bg-amber-200 dark:bg-amber-800/50';
  if (ratio < 0.6)  return 'bg-orange-300 dark:bg-orange-700/60';
  if (ratio < 0.8)  return 'bg-orange-400 dark:bg-orange-600/80';
  return 'bg-red-500 dark:bg-red-500';
}

export function SpendingHeatmap() {
  const [mounted, setMounted]   = useState(false);
  const [allTxns, setAllTxns]   = useState<PFTransaction[]>([]);
  const [accounts, setAccounts] = useState<PFAccount[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [accountFilter, setAccountFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const reload = () => {
    setAllTxns(getPFTransactions({ type: 'debit' }));
    setAccounts(getAccounts());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  // Available years from data
  const years = useMemo(() => {
    const ys = new Set(allTxns.map(t => parseInt(t.date.split('-')[0], 10)));
    return Array.from(ys).sort((a, b) => b - a);
  }, [allTxns]);

  // Daily spend map: 'YYYY-MM-DD' → total
  const dailyMap = useMemo(() => {
    const map = new Map<string, number>();
    let txns = allTxns.filter(t => t.date.startsWith(String(selectedYear)));
    if (accountFilter !== 'all') txns = txns.filter(t => t.accountId === accountFilter);
    for (const t of txns) map.set(t.date, (map.get(t.date) ?? 0) + t.amount);
    return map;
  }, [allTxns, selectedYear, accountFilter]);

  const maxDay   = useMemo(() => Math.max(...Array.from(dailyMap.values()), 0), [dailyMap]);
  const yearTotal = useMemo(() => Array.from(dailyMap.values()).reduce((s, v) => s + v, 0), [dailyMap]);
  const activeDays = dailyMap.size;

  // Transactions for selected day
  const selectedTxns = useMemo(() => {
    if (!selectedDay) return [];
    let txns = allTxns.filter(t => t.date === selectedDay && t.type === 'debit');
    if (accountFilter !== 'all') txns = txns.filter(t => t.accountId === accountFilter);
    return txns;
  }, [allTxns, selectedDay, accountFilter]);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Spending Heatmap"
        subtitle="Daily spending intensity across the year"
        kpis={yearTotal > 0 ? [
          { label: 'Year',        value: selectedYear,              color: 'primary' },
          { label: 'Total Spend', value: fmtINR(yearTotal),         color: 'warning' },
          { label: 'Active Days', value: activeDays,                color: 'neutral' },
          { label: 'Avg / Day',   value: fmtINR(activeDays > 0 ? yearTotal / activeDays : 0), color: 'neutral' },
        ] : undefined}
      />
      <div className="space-y-4 px-4 pb-4">

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Year</label>
            <select value={selectedYear} onChange={e => { setSelectedYear(parseInt(e.target.value, 10)); setSelectedDay(null); }}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
              {years.length === 0 && <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Account</label>
            <select value={accountFilter} onChange={e => { setAccountFilter(e.target.value); setSelectedDay(null); }}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              <option value="all">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          {/* Legend */}
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400">Low</span>
            {['bg-slate-100 dark:bg-slate-800', 'bg-amber-100', 'bg-amber-200', 'bg-orange-300', 'bg-orange-400', 'bg-red-500'].map((cls, i) => (
              <div key={i} className={`w-4 h-4 rounded-sm ${cls}`} />
            ))}
            <span className="text-[10px] text-slate-400">High</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-4 space-y-3 overflow-x-auto">
          {MONTH_NAMES.map((mon, mi) => {
            const daysInMonth = new Date(selectedYear, mi + 1, 0).getDate();
            return (
              <div key={mon} className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-500 w-7 shrink-0">{mon}</span>
                <div className="flex gap-0.5 flex-wrap">
                  {Array.from({ length: daysInMonth }, (_, di) => {
                    const dd = `${selectedYear}-${String(mi + 1).padStart(2, '0')}-${String(di + 1).padStart(2, '0')}`;
                    const amt = dailyMap.get(dd) ?? 0;
                    const cls = getIntensityClass(amt, maxDay);
                    const isSelected = selectedDay === dd;
                    return (
                      <button
                        key={dd}
                        onClick={() => setSelectedDay(selectedDay === dd ? null : dd)}
                        title={amt > 0 ? `${dd}: ${fmtINR(amt)}` : dd}
                        className={`w-5 h-5 rounded-sm transition-all ${cls} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:ring-1 hover:ring-slate-400'}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Detail */}
        {selectedDay && (
          <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 flex justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{selectedDay} · {fmtINR(dailyMap.get(selectedDay) ?? 0)}</span>
              <button onClick={() => setSelectedDay(null)} className="text-xs text-blue-500 hover:text-blue-700">✕</button>
            </div>
            {selectedTxns.length === 0 ? (
              <p className="px-4 py-3 text-xs text-slate-400">No debit transactions on this day.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedTxns.map(t => (
                  <div key={t.id} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate max-w-xs">{t.description}</p>
                      <p className="text-[10px] text-slate-400">{t.category}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">{fmtINR(t.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
