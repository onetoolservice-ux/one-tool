"use client";
// ══════════════════════════════════════════════════════════════════════════════
// pf-bp-calendar.tsx — Cash Flow Calendar
// Day-by-day income & expense timeline + running balance + tight day detection
// ══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Calendar, Lock, Zap } from 'lucide-react';
import {
  getCashFlowCalendar, getOrCreateMonthPlan,
  type CashFlowEntry,
} from './budget-planner-store';
import { fmtINR } from './finance-store';

const fmt = fmtINR;

// ── Running Balance ───────────────────────────────────────────────────────────

interface DayGroup {
  day: number;
  date: string;
  entries: CashFlowEntry[];
  dayIncome: number;
  dayExpense: number;
  netDay: number;
  runningBalance: number;
  isTight: boolean;
  isSalaryDay: boolean;
}

function buildDayGroups(month: string, entries: CashFlowEntry[], startingBalance: number): DayGroup[] {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();

  const byDay: Record<number, CashFlowEntry[]> = {};
  for (const e of entries) {
    if (!byDay[e.day]) byDay[e.day] = [];
    byDay[e.day].push(e);
  }

  const groups: DayGroup[] = [];
  let balance = startingBalance;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEntries = byDay[day] ?? [];
    if (dayEntries.length === 0) continue;

    const dayIncome  = dayEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const dayExpense = dayEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const netDay = dayIncome - dayExpense;
    balance += netDay;

    const date = new Date(y, m - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });

    groups.push({
      day, date, entries: dayEntries, dayIncome, dayExpense, netDay,
      runningBalance: balance,
      isTight: balance < startingBalance * 0.15 && balance > 0,
      isSalaryDay: dayIncome > dayExpense * 5 && dayIncome > 20000,
    });
  }

  return groups;
}

// ── Day Entry Row ─────────────────────────────────────────────────────────────

function DayEntryRow({ entry }: { entry: CashFlowEntry }) {
  const isIncome = entry.type === 'income';
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
        isIncome ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
      }`}>
        {isIncome
          ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          : <ArrowUpRight className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{entry.label}</p>
        <p className="text-[10px] text-slate-400">{entry.category}{entry.isCommitted ? ' · Committed' : ''}</p>
      </div>
      {entry.isCommitted && (
        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
      )}
      <span className={`text-xs font-bold tabular-nums shrink-0 ${
        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {isIncome ? '+' : '−'}{fmt(entry.amount)}
      </span>
    </div>
  );
}

// ── Day Block ─────────────────────────────────────────────────────────────────

function DayBlock({ group, today }: { group: DayGroup; today: number }) {
  const isToday = group.day === today;
  const isPast = group.day < today;

  return (
    <div className={`rounded-lg border transition-all bg-white dark:bg-slate-900 ${
      group.isSalaryDay ? 'border-positive/40'
      : group.isTight ? 'border-warning/40'
      : isToday ? 'border-fin-accent/40'
      : 'border-slate-200 dark:border-slate-700'
    }`}>
      {/* Day header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {isToday && <span className="w-1.5 h-1.5 rounded-full bg-fin-accent animate-pulse" />}
          <span className={`text-xs font-bold ${
            isToday ? 'text-fin-accent'
            : group.isSalaryDay ? 'text-positive'
            : 'text-slate-600 dark:text-slate-300'
          }`}>
            {group.date}
            {isToday && ' (Today)'}
            {group.isSalaryDay && ' 💰'}
          </span>
          {group.isTight && (
            <span className="flex items-center gap-1 text-[9px] font-bold bg-warning-tint text-warning px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-2.5 h-2.5" /> Tight
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {group.dayIncome > 0 && (
            <span className="text-[10px] font-bold text-positive">+{fmt(group.dayIncome)}</span>
          )}
          {group.dayExpense > 0 && (
            <span className="text-[10px] font-bold text-negative">−{fmt(group.dayExpense)}</span>
          )}
          <div className={`text-right ${group.runningBalance < 0 ? 'text-negative' : isPast ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
            <p className="text-xs font-black tabular-nums">{fmt(group.runningBalance)}</p>
            <p className="text-[9px] text-slate-400">balance</p>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="px-4 py-1.5 divide-y divide-slate-100 dark:divide-slate-800">
        {group.entries.map((e, i) => (
          <DayEntryRow key={i} entry={e} />
        ))}
      </div>
    </div>
  );
}

// ── Running Balance Chart ─────────────────────────────────────────────────────

function BalanceCurve({ groups }: { groups: DayGroup[] }) {
  if (groups.length < 2) return null;

  const maxBal = Math.max(...groups.map(g => g.runningBalance));
  const minBal = Math.min(...groups.map(g => g.runningBalance), 0);
  const range = maxBal - minBal || 1;
  const W = 400, H = 80;

  const points = groups.map((g, i) => {
    const x = (i / (groups.length - 1)) * W;
    const y = H - ((g.runningBalance - minBal) / range) * H;
    return `${x},${y}`;
  }).join(' ');

  const zeroY = H - ((0 - minBal) / range) * H;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-3">Running Balance</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        {/* Zero line */}
        {minBal < 0 && (
          <line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 2" opacity={0.5} />
        )}
        {/* Balance line */}
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots for tight days */}
        {groups.map((g, i) => {
          if (!g.isTight && !g.isSalaryDay) return null;
          const x = (i / (groups.length - 1)) * W;
          const y = H - ((g.runningBalance - minBal) / range) * H;
          return (
            <circle key={i} cx={x} cy={y} r={4}
              fill={g.isSalaryDay ? '#10b981' : '#f59e0b'}
              stroke="white" strokeWidth={1.5}
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
        <span>Day 1</span>
        <span>Mid-month</span>
        <span>End</span>
      </div>
    </div>
  );
}

// ── Committed Obligations Summary ─────────────────────────────────────────────

function CommittedSummary({ entries }: { entries: CashFlowEntry[] }) {
  const committed = entries.filter(e => e.isCommitted && e.type === 'expense');
  if (committed.length === 0) return null;

  const total = committed.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Committed This Month</span>
        </div>
        <span className="text-sm font-black text-neutral-value">{fmt(total)}</span>
      </div>
      <div className="space-y-1.5">
        {committed
          .sort((a, b) => b.amount - a.amount)
          .map((e, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-8 shrink-0">Day {e.day}</span>
                <span className="text-slate-700 dark:text-slate-300 truncate">{e.label}</span>
                <span className="text-[9px] text-slate-400">{e.category}</span>
              </div>
              <span className="font-bold tabular-nums text-neutral-value shrink-0">{fmt(e.amount)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Tight Days Alert ──────────────────────────────────────────────────────────

function TightDaysAlert({ groups }: { groups: DayGroup[] }) {
  const tight = groups.filter(g => g.isTight);
  if (tight.length === 0) return null;

  return (
    <div className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-bold text-warning">Tight days detected</p>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
          Days {tight.map(g => g.day).join(', ')} — your running balance drops very low.
          Avoid large discretionary purchases on these days.
        </p>
      </div>
    </div>
  );
}

// ── Main Calendar ─────────────────────────────────────────────────────────────

export function CashFlowCalendar({ month }: { month: string }) {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [startingBalance, setStartingBalance] = useState(10000);
  const [showCommittedOnly, setShowCommittedOnly] = useState(false);

  const reload = useCallback(() => {
    setEntries(getCashFlowCalendar(month));
  }, [month]);

  useEffect(() => {
    reload();
    const handler = () => reload();
    window.addEventListener('bp-store-updated', handler);
    window.addEventListener('pf-store-updated', handler);
    return () => {
      window.removeEventListener('bp-store-updated', handler);
      window.removeEventListener('pf-store-updated', handler);
    };
  }, [reload]);

  const now = new Date();
  const isCurrentMonth = now.toISOString().slice(0, 7) === month;
  const today = isCurrentMonth ? now.getDate() : 0;

  const filteredEntries = useMemo(() =>
    showCommittedOnly ? entries.filter(e => e.isCommitted) : entries,
  [entries, showCommittedOnly]);

  const dayGroups = useMemo(() =>
    buildDayGroups(month, filteredEntries, startingBalance),
  [month, filteredEntries, startingBalance]);

  const totalIncome  = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="p-4 space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total In',  value: fmt(totalIncome),  prefix: '' },
          { label: 'Total Out', value: fmt(totalExpense), prefix: '' },
          { label: 'Net Flow',  value: fmt(Math.abs(netFlow)),
            prefix: netFlow < 0 ? '−' : '+' },
          { label: 'Transactions', value: String(entries.length), prefix: '' },
        ].map(({ label, value, prefix }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xl font-black tabular-nums text-neutral-value">{prefix}{value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Starting balance input */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Starting Balance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input
                type="number" step={1000} value={startingBalance}
                onChange={e => setStartingBalance(parseInt(e.target.value) || 0)}
                className="w-36 pl-7 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-fin-accent font-bold"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <div
              onClick={() => setShowCommittedOnly(x => !x)}
              className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${showCommittedOnly ? 'bg-fin-accent' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${showCommittedOnly ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Committed only</span>
          </label>
        </div>
      </div>

      {/* Committed summary */}
      <CommittedSummary entries={entries} />

      {/* Running balance chart */}
      {dayGroups.length > 2 && <BalanceCurve groups={dayGroups} />}

      {/* Tight days alert */}
      <TightDaysAlert groups={dayGroups} />

      {/* Day-by-day list */}
      {dayGroups.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-1">No transactions found for this month</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Import bank statements or add recurring commitments to see your cash flow timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Daily Timeline — {dayGroups.length} active days
            </p>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-positive inline-block" /> Salary day</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block" /> Tight day</span>
            </div>
          </div>
          {dayGroups.map(group => (
            <DayBlock key={group.day} group={group} today={today} />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 pt-2">
        <span className="flex items-center gap-1.5"><ArrowDownLeft className="w-3 h-3 text-positive" /> Income</span>
        <span className="flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3 text-negative" /> Expense</span>
        <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Committed (recurring)</span>
        <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-warning" /> Tight day (&lt;15% of starting balance)</span>
      </div>
    </div>
  );
}
