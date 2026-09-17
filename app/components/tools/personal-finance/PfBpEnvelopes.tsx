"use client";
// ══════════════════════════════════════════════════════════════════════════════
// pf-bp-envelopes.tsx — Envelope Intelligence Board
// Live spend tracking, traffic lights, velocity, drill-down & rebalancing
// ══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus, AlertTriangle, Info, ExternalLink, X, ChevronRight } from 'lucide-react';
import {
  getOrCreateMonthPlan, getEnvelopeActuals, moveMoneyBetweenEnvelopes,
  getConsecutiveOverspend, computeMonthHealth,
  type EnvelopeActuals, type ConsecutiveOverspend, type MonthPlan,
} from './budget-planner-store';
import { getPFTransactions, fmtINR } from './finance-store';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = fmtINR;

const STATUS_CONFIG = {
  safe:    { bar: 'bg-positive', border: 'border-positive/40', badge: 'bg-positive-tint text-positive', label: 'On Track'  },
  warning: { bar: 'bg-warning',  border: 'border-warning/40',  badge: 'bg-warning-tint text-warning',   label: 'At Risk'   },
  danger:  { bar: 'bg-warning',  border: 'border-warning/60',  badge: 'bg-warning-tint text-warning',   label: 'Near Limit'},
  over:    { bar: 'bg-negative', border: 'border-negative/40', badge: 'bg-negative-tint text-negative', label: 'Overspent' },
};

// ── Transaction Drill-Down ────────────────────────────────────────────────────

function TransactionDrillDown({ month, category, onClose }: {
  month: string; category: string; onClose: () => void;
}) {
  const txns = useMemo(() =>
    getPFTransactions({ type: 'debit' }).filter(
      t => t.date.startsWith(month) && t.category === category && !t.isTransfer
    ).sort((a, b) => b.date.localeCompare(a.date))
  , [month, category]);

  const total = txns.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">{category}</p>
            <p className="text-xs text-slate-400">{txns.length} transactions · {fmt(total)} total</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {txns.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No transactions yet this month.</div>
          ) : txns.map(t => (
            <div key={t.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
                <p className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
              <span className="text-sm font-bold tabular-nums text-neutral-value">{fmt(t.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Move Money Dialog ─────────────────────────────────────────────────────────

function MoveMoney({ month, plan, fromId, onClose }: {
  month: string; plan: MonthPlan; fromId: string; onClose: () => void;
}) {
  const from = plan.envelopes.find(e => e.id === fromId);
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState(1000);

  const others = plan.envelopes.filter(e => e.id !== fromId);

  const handle = () => {
    if (!toId || amount <= 0) return;
    moveMoneyBetweenEnvelopes(month, fromId, toId, amount);
    onClose();
  };

  if (!from) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-slate-500" />
            <p className="font-bold text-slate-800 dark:text-slate-100">Move Money</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="space-y-3">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">From</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">{from.category}</p>
            <p className="text-xs text-slate-400">Allocated: {fmt(from.allocated)}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">To Envelope</label>
            <select value={toId} onChange={e => setToId(e.target.value)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none w-full">
              <option value="">Select envelope…</option>
              {others.map(e => <option key={e.id} value={e.id}>{e.category} ({fmt(e.allocated)})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Amount (₹)</label>
            <input type="number" min={100} step={100} value={amount}
              onChange={e => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handle} disabled={!toId || amount <= 0}
            className="flex-1 py-2.5 bg-fin-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-40">
            Move {fmt(amount)}
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Envelope Card ─────────────────────────────────────────────────────────────

function EnvelopeCard({
  ea, month, plan, onMove,
}: {
  ea: EnvelopeActuals; month: string; plan: MonthPlan; onMove: (id: string) => void;
}) {
  const [showDrill, setShowDrill] = useState(false);
  const cfg = STATUS_CONFIG[ea.status];
  const envelope = plan.envelopes.find(e => e.category === ea.category);

  const velocityIcon = ea.velocity === 'overpacing'
    ? <TrendingUp className="w-3 h-3 text-negative" />
    : ea.velocity === 'underpacing'
    ? <TrendingDown className="w-3 h-3 text-positive" />
    : <Minus className="w-3 h-3 text-slate-400" />;

  return (
    <>
      {showDrill && (
        <TransactionDrillDown month={month} category={ea.category} onClose={() => setShowDrill(false)} />
      )}

      <div className={`rounded-lg border bg-white dark:bg-slate-900 transition-all ${cfg.border}`}>
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{ea.category}</p>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
              {ea.rollover > 0 && (
                <span className="text-[9px] font-semibold bg-positive-tint text-positive px-1.5 py-0.5 rounded-full">
                  +{fmt(ea.rollover)} rollover
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {velocityIcon}
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{ea.velocityLabel}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-xl font-black tabular-nums ${ea.remaining >= 0 ? 'text-neutral-value' : 'text-negative'}`}>
              {ea.remaining >= 0 ? fmt(ea.remaining) : `−${fmt(Math.abs(ea.remaining))}`}
            </p>
            <p className="text-[10px] text-slate-500">{ea.remaining >= 0 ? 'remaining' : 'over budget'}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-2">
          <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${cfg.bar}`}
              style={{ width: `${Math.min(100, ea.pct)}%` }}
            />
          </div>
          {ea.pct > 100 && (
            <div className="h-1 rounded-full bg-negative/20 mt-0.5 overflow-hidden">
              <div className="h-full bg-negative rounded-full" style={{ width: `${Math.min(100, ((ea.pct - 100) / 100) * 100)}%` }} />
            </div>
          )}
        </div>

        {/* Metrics row */}
        <div className="px-4 pb-3 grid grid-cols-3 gap-2">
          {[
            { label: 'Budget', value: fmt(ea.available) },
            { label: 'Spent', value: fmt(ea.actual) },
            { label: 'Projected EOM', value: fmt(ea.projectedEOM) },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xs font-bold tabular-nums text-neutral-value">{value}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Overspend projection warning */}
        {ea.projectedEOM > ea.available && ea.available > 0 && (
          <div className="mx-4 mb-3 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
            <p className="text-[10px] text-slate-600 dark:text-slate-300">
              At current pace, will overspend by {fmt(ea.projectedEOM - ea.available)} by month end
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pb-3 flex gap-2">
          <button
            onClick={() => setShowDrill(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> {ea.actual > 0 ? 'View Transactions' : 'No Spend Yet'}
          </button>
          {envelope && (
            <button
              onClick={() => onMove(envelope.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-fin-accent border border-fin-accent/40 rounded-lg hover:bg-fin-accent/10 transition-colors"
            >
              <ArrowLeftRight className="w-3 h-3" /> Move Money
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Consecutive Overspend Banner ──────────────────────────────────────────────

function OverspendBanners({ warnings }: { warnings: ConsecutiveOverspend[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const active = warnings.filter(w => !dismissed.includes(w.category));
  if (active.length === 0) return null;

  return (
    <div className="space-y-2">
      {active.map(w => (
        <div key={w.category} className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-warning">
              {w.category} exceeded budget {w.consecutiveMonths} months in a row
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              Avg overspend: {fmt(w.avgOverspend)} · Suggested budget: {fmt(w.suggestion)}
            </p>
          </div>
          <button onClick={() => setDismissed(d => [...d, w.category])}
            className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

// ── Health Summary ────────────────────────────────────────────────────────────

function MonthSummaryBar({ month }: { month: string }) {
  const report = useMemo(() => computeMonthHealth(month), [month]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-black text-neutral-value">{report.healthScore}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Health Score</p>
          </div>
          <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {report.categoriesOnTrack} / {report.totalCategories} envelopes on track
            </p>
            <p className="text-xs text-slate-500">
              Savings rate: {report.savingsRate.toFixed(1)}% · Unallocated: {fmt(Math.abs(report.unallocated))}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          {[
            { label: 'Budgeted', value: fmt(report.totalBudget) },
            { label: 'Spent', value: fmt(report.totalActual) },
            { label: 'Breathing Room', value: fmt(report.breathingRoom) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-sm font-bold tabular-nums text-neutral-value">{value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Envelopes Board ──────────────────────────────────────────────────────

export function EnvelopesBoard({ month }: { month: string }) {
  const [plan, setPlan] = useState<MonthPlan | null>(null);
  const [actuals, setActuals] = useState<EnvelopeActuals[]>([]);
  const [warnings, setWarnings] = useState<ConsecutiveOverspend[]>([]);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'over' | 'danger' | 'safe'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'spent' | 'remaining' | 'status'>('status');

  const reload = useCallback(() => {
    const p = getOrCreateMonthPlan(month);
    setPlan({ ...p });
    setActuals(getEnvelopeActuals(month));
    setWarnings(getConsecutiveOverspend());
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

  const filteredActuals = useMemo(() => {
    let list = [...actuals];
    if (filter !== 'all') list = list.filter(ea => ea.status === filter);

    switch (sortBy) {
      case 'priority': {
        const prioMap = Object.fromEntries((plan?.envelopes ?? []).map(e => [e.category, e.priority]));
        list.sort((a, b) => (prioMap[a.category] ?? 5) - (prioMap[b.category] ?? 5));
        break;
      }
      case 'spent':     list.sort((a, b) => b.actual - a.actual); break;
      case 'remaining': list.sort((a, b) => a.remaining - b.remaining); break;
      case 'status': {
        const order = { over: 0, danger: 1, warning: 2, safe: 3 };
        list.sort((a, b) => order[a.status] - order[b.status]);
        break;
      }
    }
    return list;
  }, [actuals, filter, sortBy, plan]);

  const counts = useMemo(() => ({
    all: actuals.length,
    over: actuals.filter(a => a.status === 'over').length,
    danger: actuals.filter(a => a.status === 'danger').length,
    safe: actuals.filter(a => a.status === 'safe').length,
  }), [actuals]);

  if (!plan) return null;

  return (
    <div className="p-4 space-y-4">
      {/* Health summary */}
      <MonthSummaryBar month={month} />

      {/* Overspend warnings */}
      <OverspendBanners warnings={warnings} />

      {/* Filter + Sort toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {([
            { key: 'all',    label: `All (${counts.all})` },
            { key: 'over',   label: `Overspent (${counts.over})` },
            { key: 'danger', label: `Near Limit (${counts.danger})` },
            { key: 'safe',   label: `On Track (${counts.safe})` },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === key
                  ? 'bg-fin-accent text-white'
                  : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Sort:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none">
            <option value="status">By Status</option>
            <option value="priority">By Priority</option>
            <option value="spent">By Amount Spent</option>
            <option value="remaining">By Remaining</option>
          </select>
        </div>
      </div>

      {/* Envelope cards grid */}
      {filteredActuals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-400">
            {actuals.length === 0
              ? 'No envelopes yet. Go to the Canvas tab to add envelopes and set your budget.'
              : 'No envelopes match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredActuals.map(ea => (
            <EnvelopeCard
              key={ea.category}
              ea={ea}
              month={month}
              plan={plan}
              onMove={setMovingId}
            />
          ))}
        </div>
      )}

      {/* Move money dialog */}
      {movingId && plan && (
        <MoveMoney
          month={month}
          plan={plan}
          fromId={movingId}
          onClose={() => setMovingId(null)}
        />
      )}

      {/* Spending summary table */}
      {actuals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Summary Table</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  {['Category', 'Budget', 'Spent', 'Remaining', 'Used %', 'Projected EOM'].map(h => (
                    <th key={h} className="text-left px-4 py-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {actuals.map(ea => {
                  const cfg = STATUS_CONFIG[ea.status];
                  return (
                    <tr key={ea.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">{ea.category}</td>
                      <td className="px-4 py-2 tabular-nums">{fmt(ea.available)}</td>
                      <td className="px-4 py-2 tabular-nums">{fmt(ea.actual)}</td>
                      <td className={`px-4 py-2 font-bold tabular-nums ${ea.remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {ea.remaining < 0 ? `−${fmt(Math.abs(ea.remaining))}` : fmt(ea.remaining)}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                          {ea.pct.toFixed(0)}%
                        </span>
                      </td>
                      <td className={`px-4 py-2 tabular-nums ${ea.projectedEOM > ea.available ? 'text-red-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                        {fmt(ea.projectedEOM)}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Total</td>
                  <td className="px-4 py-2 tabular-nums">{fmt(actuals.reduce((s, a) => s + a.available, 0))}</td>
                  <td className="px-4 py-2 tabular-nums">{fmt(actuals.reduce((s, a) => s + a.actual, 0))}</td>
                  <td className={`px-4 py-2 tabular-nums ${actuals.reduce((s, a) => s + a.remaining, 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {fmt(Math.abs(actuals.reduce((s, a) => s + a.remaining, 0)))}
                  </td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 tabular-nums">{fmt(actuals.reduce((s, a) => s + a.projectedEOM, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
