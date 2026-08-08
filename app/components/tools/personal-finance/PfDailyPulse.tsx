'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFFilterBarHeader } from './PfUi';
import { ToolEmptyState } from '@/app/components/tools/shared/ToolEmptyState';
import {
  getPFTransactions, getAccounts, getAvailableMonths, filterByPeriod, fmtINR,
  type PFTransaction, type PFAccount,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY TRANSACTION PULSE — Avg daily spend, txn frequency, and day-level trends.
// ═══════════════════════════════════════════════════════════════════════════════

const PERIOD_OPTIONS = [
  { key: 'all',           label: 'All Time' },
  { key: 'this-month',    label: 'This Month' },
  { key: 'last-month',    label: 'Last Month' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'this-year',     label: 'This Year' },
];

const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getBudgetData(): { totalBudget: number; dailyBudget: number } {
  try {
    const s = typeof window !== 'undefined' ? localStorage.getItem('otsd-budget-vs-actual') : null;
    if (!s) return { totalBudget: 0, dailyBudget: 0 };
    const data = JSON.parse(s);
    const totalBudget = (data.categories ?? []).reduce(
      (sum: number, c: { budget: number }) => sum + (c.budget ?? 0), 0
    );
    return { totalBudget, dailyBudget: totalBudget > 0 ? Math.round(totalBudget / 30) : 0 };
  } catch { return { totalBudget: 0, dailyBudget: 0 }; }
}

export function DailyTransactionPulse() {
  const [mounted, setMounted]         = useState(false);
  const [allTxns, setAllTxns]         = useState<PFTransaction[]>([]);
  const [accounts, setAccounts]       = useState<PFAccount[]>([]);
  const [months, setMonths]           = useState<{ key: string; label: string }[]>([]);
  const [period, setPeriod]           = useState('this-month');
  const [accountFilter, setAccountFilter] = useState('all');
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [selectedTopDay, setSelectedTopDay] = useState<string | null>(null);
  const [budgetData, setBudgetData]   = useState({ totalBudget: 0, dailyBudget: 0 });

  const reload = () => {
    setAllTxns(getPFTransactions({ type: 'debit' }));
    setAccounts(getAccounts());
    setMonths(getAvailableMonths());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    setBudgetData(getBudgetData());
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  const txns = useMemo(() => {
    let t = filterByPeriod(allTxns, period);
    if (accountFilter !== 'all') t = t.filter(x => x.accountId === accountFilter);
    return t;
  }, [allTxns, period, accountFilter]);

  // Daily map: date → { total, count }
  const dailyMap = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const t of txns) {
      const cur = map.get(t.date) ?? { total: 0, count: 0 };
      map.set(t.date, { total: cur.total + t.amount, count: cur.count + 1 });
    }
    return map;
  }, [txns]);

  const activeDays    = dailyMap.size;
  const totalSpend    = txns.reduce((s, t) => s + t.amount, 0);
  const totalTxns     = txns.length;
  const avgDailySpend = activeDays > 0 ? totalSpend / activeDays : 0;
  const avgTxnsPerDay = activeDays > 0 ? totalTxns / activeDays : 0;
  const avgTxnSize    = totalTxns > 0 ? totalSpend / totalTxns : 0;

  // Rest days (calendar days in range minus active days)
  const calendarStats = useMemo(() => {
    if (txns.length === 0) return { restDays: 0, calendarDays: 0 };
    if (period === 'this-month') {
      const daysElapsed = new Date().getDate();
      return { restDays: Math.max(0, daysElapsed - activeDays), calendarDays: daysElapsed };
    }
    const dates = txns.map(t => t.date).sort();
    const from = new Date(dates[0] + 'T00:00:00');
    const to   = new Date(dates[dates.length - 1] + 'T00:00:00');
    const calendarDays = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    return { restDays: Math.max(0, calendarDays - activeDays), calendarDays };
  }, [txns, period, activeDays]);

  // Month-end forecast — only for 'this-month'
  const forecast = useMemo(() => {
    if (period !== 'this-month' || txns.length === 0) return null;
    const today       = new Date();
    const daysElapsed = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - daysElapsed;
    const projected   = daysElapsed > 0 ? (totalSpend / daysElapsed) * daysInMonth : 0;
    const dailyPace   = daysElapsed > 0 ? totalSpend / daysElapsed : 0;
    return { projected, dailyPace, daysElapsed, daysRemaining, daysInMonth };
  }, [period, txns, totalSpend]);

  // Longest spend-free streak in range
  const longestStreak = useMemo(() => {
    if (txns.length === 0) return null;
    const dates = txns.map(t => t.date).sort();
    const from  = new Date(dates[0] + 'T00:00:00');
    const to    = new Date(dates[dates.length - 1] + 'T00:00:00');
    let best = { length: 0, from: '', to: '' };
    let cur  = { length: 0, from: '', to: '' };
    const d = new Date(from);
    while (d <= to) {
      const key = d.toISOString().slice(0, 10);
      if (!dailyMap.has(key)) {
        if (cur.length === 0) cur.from = key;
        cur.length++;
        cur.to = key;
        if (cur.length > best.length) best = { ...cur };
      } else {
        cur = { length: 0, from: '', to: '' };
      }
      d.setDate(d.getDate() + 1);
    }
    return best.length >= 2 ? best : null;
  }, [txns, dailyMap]);

  // Peak day-of-week insight
  const dowInsight = useMemo(() => {
    const buckets = Array.from({ length: 7 }, (_, i) => ({ dow: i, label: DOW_FULL[i], spend: 0, days: 0 }));
    for (const [date, data] of dailyMap) {
      const dow = new Date(date + 'T12:00:00').getDay();
      buckets[dow].spend += data.total;
      buckets[dow].days++;
    }
    const withAvg = buckets.map(b => ({ ...b, avg: b.days > 0 ? b.spend / b.days : 0 }));
    const peak = withAvg.reduce((best, b) => b.avg > best.avg ? b : best, withAvg[0]);
    return peak.days >= 2 ? peak : null;
  }, [dailyMap]);

  // Top 5 highest spend days
  const topDays = useMemo(() => {
    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [dailyMap]);

  // Per-day transaction list + category breakdown for top days
  const topDayDetails = useMemo(() => {
    const result = new Map<string, { dayTxns: PFTransaction[]; catBreakdown: { cat: string; amount: number }[] }>();
    for (const d of topDays) {
      const dayTxns = txns.filter(t => t.date === d.date).sort((a, b) => b.amount - a.amount);
      const catMap  = new Map<string, number>();
      for (const t of dayTxns) catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
      const catBreakdown = Array.from(catMap.entries())
        .map(([cat, amount]) => ({ cat, amount }))
        .sort((a, b) => b.amount - a.amount);
      result.set(d.date, { dayTxns, catBreakdown });
    }
    return result;
  }, [txns, topDays]);

  // Monthly stats for bar chart + table
  const monthlyStats = useMemo(() => {
    const map = new Map<string, { activeDays: number; totalSpend: number; label: string }>();
    for (const [date, data] of dailyMap) {
      const [y, m] = date.split('-');
      const key   = `${y}-${m}`;
      const label = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      const cur   = map.get(key) ?? { activeDays: 0, totalSpend: 0, label };
      map.set(key, { activeDays: cur.activeDays + 1, totalSpend: cur.totalSpend + data.total, label });
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        key,
        label: v.label,
        activeDays: v.activeDays,
        totalSpend: v.totalSpend,
        avgDailySpend: v.activeDays > 0 ? v.totalSpend / v.activeDays : 0,
      }));
  }, [dailyMap]);

  // Weekday vs Weekend
  const dayTypeStats = useMemo(() => {
    let wdSpend = 0, wdCount = 0, wdDays = 0;
    let weSpend = 0, weCount = 0, weDays = 0;
    for (const [date, data] of dailyMap) {
      const dow = new Date(date + 'T12:00:00').getDay();
      if (dow === 0 || dow === 6) { weSpend += data.total; weCount += data.count; weDays++; }
      else                        { wdSpend += data.total; wdCount += data.count; wdDays++; }
    }
    return { wdSpend, wdCount, wdDays, weSpend, weCount, weDays };
  }, [dailyMap]);

  // Spend intensity distribution (percentile buckets)
  const distribution = useMemo(() => {
    const vals = Array.from(dailyMap.values()).map(d => d.total).sort((a, b) => a - b);
    if (vals.length === 0) return [];
    const p50 = vals[Math.floor(vals.length * 0.5)] ?? 0;
    const p75 = vals[Math.floor(vals.length * 0.75)] ?? 0;
    const p90 = vals[Math.floor(vals.length * 0.9)] ?? 0;
    const buckets = [
      { label: 'Light',    range: `< ${fmtINR(p50)}`,                count: 0, color: 'bg-emerald-400' },
      { label: 'Moderate', range: `${fmtINR(p50)} – ${fmtINR(p75)}`, count: 0, color: 'bg-amber-400'   },
      { label: 'Heavy',    range: `${fmtINR(p75)} – ${fmtINR(p90)}`, count: 0, color: 'bg-orange-500'  },
      { label: 'Splurge',  range: `> ${fmtINR(p90)}`,                count: 0, color: 'bg-red-500'     },
    ];
    for (const v of vals) {
      if (v < p50)      buckets[0].count++;
      else if (v < p75) buckets[1].count++;
      else if (v < p90) buckets[2].count++;
      else              buckets[3].count++;
    }
    return buckets;
  }, [dailyMap]);

  const activeFilters = [
    accountFilter !== 'all',
    period !== 'all' && period !== 'last-3-months',
  ].filter(Boolean).length;

  if (!mounted) return null;

  const hasData = txns.length > 0;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Daily Transaction Pulse"
        subtitle="Average daily spend, transaction frequency, and day-level patterns"
        kpis={hasData ? [
          { label: 'Avg Daily Spend', value: fmtINR(avgDailySpend),      color: 'warning'  },
          { label: 'Avg Txns / Day',  value: avgTxnsPerDay.toFixed(1),   color: 'primary'  },
          { label: 'Avg Txn Size',    value: fmtINR(avgTxnSize),         color: 'neutral'  },
          { label: 'Active Days',     value: activeDays,                 color: 'neutral'  },
          { label: 'Rest Days',       value: calendarStats.restDays,     color: 'success'  },
          ...(budgetData.dailyBudget > 0
            ? [{ label: 'Daily Budget', value: fmtINR(budgetData.dailyBudget), color: 'neutral' as const }]
            : []),
        ] : undefined}
      />

      <div className="space-y-4 px-4 pb-4">

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
          <PFFilterBarHeader
            activeCount={activeFilters}
            onClearAll={() => { setAccountFilter('all'); setPeriod('last-3-months'); }}
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

        {!hasData ? (
          <ToolEmptyState
            compact
            icon={Activity}
            iconColorClass="text-amber-600 dark:text-amber-400"
            iconBgClass="bg-amber-100 dark:bg-amber-900/40"
            title="No transactions found"
            description="No debit transactions for the selected period. Try a different period or account filter."
            secondaryCta={{ label: 'Go to Statement Manager', href: '/tools/personal-finance/pf-statement-manager' }}
          />
        ) : (
          <>
            {/* ── Month-end Forecast ── */}
            {forecast && (
              <div className={`rounded-xl px-4 py-3 border flex items-center justify-between gap-4
                ${budgetData.totalBudget > 0 && forecast.projected > budgetData.totalBudget
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'}`}>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Month-end Forecast</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {forecast.daysElapsed}d elapsed · {forecast.daysRemaining}d remaining · at {fmtINR(forecast.dailyPace)}/day
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{fmtINR(forecast.projected)}</p>
                  <p className="text-[10px] text-slate-400">projected this month</p>
                </div>
              </div>
            )}

            {/* ── Budget vs Avg Spend comparison ── */}
            {budgetData.dailyBudget > 0 && (
              <div className={`rounded-xl px-4 py-3 border flex items-center justify-between gap-4
                ${avgDailySpend > budgetData.dailyBudget
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'}`}>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {avgDailySpend > budgetData.dailyBudget ? 'Over Daily Budget' : 'Within Daily Budget'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {fmtINR(budgetData.dailyBudget)}/day budget · from{' '}
                    <Link href="/tools/personal-finance/pf-budget-vs-actual" className="underline hover:text-slate-600">Budget vs Actual</Link>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold font-mono
                    ${avgDailySpend > budgetData.dailyBudget
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {avgDailySpend > budgetData.dailyBudget ? '+' : '-'}{fmtINR(Math.abs(avgDailySpend - budgetData.dailyBudget))}/day
                  </p>
                  <p className="text-[10px] text-slate-400">vs avg daily spend</p>
                </div>
              </div>
            )}

            {/* ── Peak DOW insight ── */}
            {dowInsight && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-base">📅</span>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Your heaviest spending day is{' '}
                  <span className="font-bold">{dowInsight.label}</span> — avg{' '}
                  <span className="font-bold">{fmtINR(dowInsight.avg)}</span> across {dowInsight.days} active {dowInsight.label}s.{' '}
                  <Link href="/tools/personal-finance/pf-behavior" className="underline font-medium">
                    See full DOW breakdown →
                  </Link>
                </p>
              </div>
            )}

            {/* ── Longest spend-free streak ── */}
            {longestStreak && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-base">🏆</span>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">
                  Longest spend-free streak:{' '}
                  <span className="font-bold">{longestStreak.length} consecutive days</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {' '}({new Date(longestStreak.from + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(longestStreak.to + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                  </span>
                </p>
              </div>
            )}

            {/* ── Monthly Avg Daily Spend Chart ── */}
            {monthlyStats.length > 1 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 font-medium">Avg Daily Spend — Month over Month</span>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyStats} barSize={28}>
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        formatter={(v: number) => [fmtINR(v), 'Avg Daily Spend']}
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="avgDailySpend" radius={[4, 4, 0, 0]}>
                        {monthlyStats.map((_, i) => (
                          <Cell key={i} fill={i === monthlyStats.length - 1 ? '#f97316' : '#fbbf24'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Weekday vs Weekend + Intensity Distribution ── */}
            <div className="grid grid-cols-2 gap-4">

              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 font-medium">Weekday vs Weekend</span>
                </div>
                <div className="p-4 space-y-4">
                  {[
                    { label: 'Weekdays', days: dayTypeStats.wdDays, spend: dayTypeStats.wdSpend, count: dayTypeStats.wdCount, color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Weekends', days: dayTypeStats.weDays, spend: dayTypeStats.weSpend, count: dayTypeStats.weCount, color: 'text-orange-500 dark:text-orange-400' },
                  ].map(row => (
                    <div key={row.label} className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-semibold ${row.color}`}>{row.label}</span>
                        <span className="text-[10px] text-slate-400">{row.days}d</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {row.days > 0 ? fmtINR(row.spend / row.days) : '—'} / day
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {row.days > 0 ? (row.count / row.days).toFixed(1) : '0'} txns · {fmtINR(row.spend)} total
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 font-medium">Day Intensity Split</span>
                </div>
                <div className="p-4 space-y-3">
                  {distribution.map(b => (
                    <div key={b.label} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${b.color} shrink-0`} />
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{b.label}</span>
                          <span className="text-[9px] text-slate-400">{b.range}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{b.count}d</span>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${b.color} transition-all`}
                          style={{ width: activeDays > 0 ? `${(b.count / activeDays) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Top 5 Highest Spend Days — expandable ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-500 font-medium">Top 5 Highest Spend Days — click to expand</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {topDays.map((d, i) => {
                  const date    = new Date(d.date + 'T12:00:00');
                  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  const dow     = date.toLocaleDateString('en-IN', { weekday: 'short' });
                  const isOpen  = selectedTopDay === d.date;
                  const details = topDayDetails.get(d.date);

                  return (
                    <div key={d.date}>
                      {/* Summary row */}
                      <button
                        onClick={() => setSelectedTopDay(isOpen ? null : d.date)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                      >
                        <span className="text-xs font-bold text-slate-300 dark:text-slate-600 w-5 shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {dateStr} <span className="text-slate-400 font-normal">({dow})</span>
                          </p>
                          {/* Category pills */}
                          {details && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {details.catBreakdown.slice(0, 4).map(c => (
                                <span key={c.cat}
                                  className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                                  {c.cat} · {fmtINR(c.amount)}
                                </span>
                              ))}
                              {details.catBreakdown.length > 4 && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full">
                                  +{details.catBreakdown.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold text-red-600 dark:text-red-400 font-mono">{fmtINR(d.total)}</span>
                          <span className={`text-[10px] text-slate-400 transition-transform inline-block ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      </button>

                      {/* Expanded transaction list */}
                      {isOpen && details && (
                        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                          <div className="px-4 py-2 flex justify-between items-center">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                              {d.count} transaction{d.count !== 1 ? 's' : ''}
                            </span>
                            <Link href="/tools/personal-finance/pf-tx-explorer"
                              className="text-[10px] text-blue-500 hover:text-blue-700 font-medium">
                              View all in Explorer →
                            </Link>
                          </div>
                          {details.dayTxns.map(t => (
                            <div key={t.id}
                              className="px-4 py-2.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
                                <p className="text-[10px] text-slate-400">{t.category}</p>
                              </div>
                              <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono shrink-0 ml-3">
                                {fmtINR(t.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Monthly Breakdown Table ── */}
            {monthlyStats.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 font-medium">Monthly Breakdown</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Month</th>
                        <th className="text-right px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Active Days</th>
                        <th className="text-right px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total Spend</th>
                        <th className="text-right px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Avg / Day</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {monthlyStats.map(m => (
                        <tr key={m.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{m.label}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">{m.activeDays}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-slate-700 dark:text-slate-200">{fmtINR(m.totalSpend)}</td>
                          <td className="px-4 py-2.5 text-right font-bold font-mono text-orange-600 dark:text-orange-400">{fmtINR(m.avgDailySpend)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Link href="/tools/personal-finance/pf-month-compare"
                              className="text-[10px] text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap">
                              Compare →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Related Tools ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-500 font-medium">Related Tools</span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-700">
                {[
                  { href: '/tools/personal-finance/pf-heatmap',       label: 'Spending Heatmap',     desc: 'Calendar view of daily spend intensity' },
                  { href: '/tools/personal-finance/pf-behavior',      label: 'Spending Behavior',    desc: 'Day-of-week & day-of-month patterns'    },
                  { href: '/tools/personal-finance/pf-month-compare', label: 'Month Comparison',     desc: 'Side-by-side category breakdown'        },
                  { href: '/tools/personal-finance/pf-tx-explorer',   label: 'Transaction Explorer', desc: 'Full searchable transaction ledger'      },
                ].map(tool => (
                  <Link key={tool.href} href={tool.href}
                    className="bg-white dark:bg-slate-900 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{tool.label} →</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tool.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
