'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  getPFTransactions, getAvailableMonths, getPeriodRange, fmtINR,
  type PFTransaction,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// MONTH COMPARISON — Side-by-side category breakdown for any two periods.
// ═══════════════════════════════════════════════════════════════════════════════

const PERIOD_OPTIONS = [
  { key: 'this-month',    label: 'This Month' },
  { key: 'last-month',    label: 'Last Month' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'this-year',     label: 'This Year' },
  { key: 'all',           label: 'All Time' },
];

interface CatRow {
  category: string;
  aTotal: number;
  bTotal: number;
  diff: number;
  diffPct: number;
}

export function MonthComparison() {
  const [mounted, setMounted] = useState(false);
  const [allTxns, setAllTxns] = useState<PFTransaction[]>([]);
  const [months, setMonths]   = useState<{ key: string; label: string }[]>([]);

  const [periodA, setPeriodA] = useState('last-month');
  const [periodB, setPeriodB] = useState('this-month');
  const [mode,    setMode]    = useState<'debit' | 'credit'>('debit');

  const reload = () => {
    setAllTxns(getPFTransactions());
    setMonths(getAvailableMonths());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  const allPeriods = useMemo(() => [...PERIOD_OPTIONS, ...months], [months]);

  const getTxns = (period: string, type: 'debit' | 'credit') => {
    if (period === 'all') return allTxns.filter(t => t.type === type && !t.isTransfer);
    const range = getPeriodRange(period);
    if (!range) return [];
    return allTxns.filter(t => t.type === type && !t.isTransfer && t.date >= range.from && t.date <= range.to);
  };

  const { rows, totalA, totalB } = useMemo(() => {
    const txnsA = getTxns(periodA, mode);
    const txnsB = getTxns(periodB, mode);

    const mapA = new Map<string, number>();
    const mapB = new Map<string, number>();
    for (const t of txnsA) mapA.set(t.category, (mapA.get(t.category) ?? 0) + t.amount);
    for (const t of txnsB) mapB.set(t.category, (mapB.get(t.category) ?? 0) + t.amount);

    const allCats = new Set([...mapA.keys(), ...mapB.keys()]);
    const r: CatRow[] = Array.from(allCats).map(cat => {
      const a = mapA.get(cat) ?? 0;
      const b = mapB.get(cat) ?? 0;
      const diff = b - a;
      const diffPct = a > 0 ? (diff / a) * 100 : (b > 0 ? 100 : 0);
      return { category: cat, aTotal: a, bTotal: b, diff, diffPct };
    }).sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));

    const tA = txnsA.reduce((s, t) => s + t.amount, 0);
    const tB = txnsB.reduce((s, t) => s + t.amount, 0);
    return { rows: r, totalA: tA, totalB: tB };
  }, [allTxns, periodA, periodB, mode]);

  const labelA = allPeriods.find(p => p.key === periodA)?.label ?? periodA;
  const labelB = allPeriods.find(p => p.key === periodB)?.label ?? periodB;
  const totalDiff = totalB - totalA;
  const increased = rows.filter(r => r.diff > 0).length;
  const decreased = rows.filter(r => r.diff < 0).length;

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Month Comparison"
        subtitle={`${labelA} vs ${labelB}`}
        kpis={rows.length > 0 ? [
          { label: labelA,     value: fmtINR(totalA),   color: 'neutral' },
          { label: labelB,     value: fmtINR(totalB),   color: 'primary' },
          { label: '↑ Higher', value: increased,         color: 'error' },
          { label: '↓ Lower',  value: decreased,         color: 'success' },
        ] : undefined}
      />
      <div className="space-y-4 px-4 pb-4">

        {/* Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Period A (Base)</label>
              <select value={periodA} onChange={e => setPeriodA(e.target.value)}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                {allPeriods.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Period B (Compare)</label>
              <select value={periodB} onChange={e => setPeriodB(e.target.value)}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                {allPeriods.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Type</label>
              <div className="flex gap-1">
                {(['debit', 'credit'] as const).map(t => (
                  <button key={t} onClick={() => setMode(t)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border font-semibold transition-colors capitalize
                      ${mode === t ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
            <p className="text-sm text-slate-400">No data for selected periods.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
              <span className="text-xs text-slate-500">{rows.length} categories</span>
              <span className={`text-xs font-bold ${totalDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                Total diff: {totalDiff > 0 ? '+' : ''}{fmtINR(totalDiff)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
                    <th className="px-4 py-2.5 text-left">Category</th>
                    <th className="px-4 py-2.5 text-right">{labelA}</th>
                    <th className="px-4 py-2.5 text-right">{labelB}</th>
                    <th className="px-4 py-2.5 text-right">Difference</th>
                    <th className="px-4 py-2.5 text-right">Change %</th>
                    <th className="px-4 py-2.5 text-center">Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.category} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{row.category}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">{row.aTotal > 0 ? fmtINR(row.aTotal) : '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-200 font-semibold">{row.bTotal > 0 ? fmtINR(row.bTotal) : '—'}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${row.diff > 0 ? 'text-red-600 dark:text-red-400' : row.diff < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {row.diff !== 0 ? `${row.diff > 0 ? '+' : ''}${fmtINR(row.diff)}` : '—'}
                      </td>
                      <td className={`px-4 py-3 text-right text-[11px] font-semibold ${row.diff > 0 ? 'text-red-500' : row.diff < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {row.aTotal > 0 ? `${row.diffPct > 0 ? '+' : ''}${row.diffPct.toFixed(1)}%` : 'New'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.diff > 0 ? <ArrowUp size={14} className="mx-auto text-red-500" />
                          : row.diff < 0 ? <ArrowDown size={14} className="mx-auto text-emerald-500" />
                          : <Minus size={14} className="mx-auto text-slate-300" />}
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
