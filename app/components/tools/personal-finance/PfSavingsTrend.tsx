'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  getPFTransactions, getAvailableMonths, getPeriodRange, fmtINR, fmtPct,
  type PFTransaction,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// SAVINGS TREND — Monthly savings rate + surplus/deficit over time.
// ═══════════════════════════════════════════════════════════════════════════════

interface MonthRow {
  key: string;
  label: string;
  income: number;
  outflow: number;
  surplus: number;
  savingsRate: number;
}

export function SavingsTrend() {
  const [mounted, setMounted] = useState(false);
  const [allTxns, setAllTxns] = useState<PFTransaction[]>([]);
  const [months, setMonths]   = useState<{ key: string; label: string }[]>([]);

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

  const rows = useMemo((): MonthRow[] => {
    return months.map(m => {
      const range = getPeriodRange(m.key);
      if (!range) return null;
      const txns = allTxns.filter(t => t.date >= range.from && t.date <= range.to && !t.isTransfer);
      const income  = txns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
      const outflow = txns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
      const surplus = income - outflow;
      const savingsRate = income > 0 ? (surplus / income) * 100 : 0;
      return { key: m.key, label: m.label, income, outflow, surplus, savingsRate };
    }).filter((r): r is MonthRow => r !== null && r.income > 0).reverse();
  }, [allTxns, months]);

  const avgSavings = rows.length > 0 ? rows.reduce((s, r) => s + r.savingsRate, 0) / rows.length : 0;
  const bestMonth  = rows.length > 0 ? rows.reduce((a, b) => a.savingsRate > b.savingsRate ? a : b) : null;
  const worstMonth = rows.length > 0 ? rows.reduce((a, b) => a.savingsRate < b.savingsRate ? a : b) : null;
  const maxAbs     = Math.max(...rows.map(r => Math.abs(r.surplus)), 1);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Savings Trend"
        subtitle="Month-by-month savings rate and surplus/deficit"
        kpis={rows.length > 0 ? [
          { label: 'Months',       value: rows.length,                                  color: 'primary' },
          { label: 'Avg Savings',  value: fmtPct(avgSavings),                           color: avgSavings >= 20 ? 'success' : avgSavings >= 10 ? 'warning' : 'error' },
          { label: 'Best Month',   value: bestMonth?.label ?? '—',                      color: 'success' },
          { label: 'Worst Month',  value: worstMonth?.label ?? '—',                     color: 'error' },
        ] : undefined}
      />
      <div className="space-y-4 px-4 pb-4">
        {rows.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No monthly data available.</p>
            <p className="text-xs text-slate-400 mt-1">Upload statements spanning multiple months to see the trend.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500">{rows.length} months · avg savings rate {fmtPct(avgSavings)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
                    <th className="px-4 py-2.5 text-left">Month</th>
                    <th className="px-4 py-2.5 text-right">Income</th>
                    <th className="px-4 py-2.5 text-right">Outflow</th>
                    <th className="px-4 py-2.5 text-right">Surplus / Deficit</th>
                    <th className="px-4 py-2.5 text-left">Savings Rate</th>
                    <th className="px-4 py-2.5 text-left">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const prev = rows[i - 1];
                    const delta = prev ? row.savingsRate - prev.savingsRate : null;
                    const ratePct = Math.min(Math.abs(row.savingsRate), 100);
                    return (
                      <tr key={row.key} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{row.label}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">{fmtINR(row.income)}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">{fmtINR(row.outflow)}</td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${row.surplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {row.surplus >= 0 ? '+' : ''}{fmtINR(row.surplus)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${row.savingsRate >= 20 ? 'bg-emerald-400' : row.savingsRate >= 10 ? 'bg-amber-400' : row.savingsRate >= 0 ? 'bg-orange-400' : 'bg-red-400'}`}
                                style={{ width: `${ratePct}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${row.savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : row.savingsRate >= 10 ? 'text-amber-600 dark:text-amber-400' : row.savingsRate >= 0 ? 'text-orange-600' : 'text-red-600 dark:text-red-400'}`}>
                              {fmtPct(row.savingsRate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {delta === null ? (
                            <Minus size={14} className="text-slate-300" />
                          ) : delta > 0 ? (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <TrendingUp size={14} />
                              <span className="text-[10px] font-semibold">+{delta.toFixed(1)}%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
                              <TrendingDown size={14} />
                              <span className="text-[10px] font-semibold">{delta.toFixed(1)}%</span>
                            </div>
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
