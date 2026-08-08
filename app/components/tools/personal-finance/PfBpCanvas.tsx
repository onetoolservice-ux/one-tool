"use client";
// ══════════════════════════════════════════════════════════════════════════════
// pf-bp-canvas.tsx — Zero-Based Budget Canvas
// The planning heart: allocate every rupee of income intentionally
// ══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronUp, Lightbulb, Check, X,
  Flag, SlidersHorizontal, RefreshCw, Info, Lock, BookTemplate,
} from 'lucide-react';
import {
  getOrCreateMonthPlan, saveMonthPlan, updateMonthIncome,
  addEnvelope, updateEnvelope, removeEnvelope, getAutoSuggestions,
  compute5030Breakdown, getAvailablePFCategories, getTemplates,
  applyTemplateToMonth, getFestivalHintsForMonth, saveCurrentMonthAsTemplate,
  computeMonthActualIncome,
  type Envelope, type EnvelopePriority, type EnvelopeType, type MonthPlan,
} from './budget-planner-store';
import { fmtINR } from './finance-store';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = fmtINR;

const PRIORITY_LABEL: Record<EnvelopePriority, string> = {
  1: 'Essential', 2: 'Important', 3: 'Regular', 4: 'Nice-to-have', 5: 'Optional',
};

const TYPE_LABEL: Record<EnvelopeType, string> = {
  regular: 'Regular', committed: 'Committed', goal: 'Goal', 'sinking-fund': 'Sinking Fund',
};

const FLAG_LABEL: Record<string, string> = {
  festival: '🎆 Festival Month',
  vacation: '✈️ Vacation Month',
  'annual-dues': '📋 Annual Dues Month',
  'tax-season': '📊 Tax Season',
};

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const selectCls = inputCls + ' cursor-pointer';

// ── Zero-Based Indicator ──────────────────────────────────────────────────────

function ZeroBasedIndicator({ income, totalAllocated }: { income: number; totalAllocated: number }) {
  const unallocated = income - totalAllocated;
  const isZero = Math.abs(unallocated) < 100;
  const isOver = unallocated < -100;

  return (
    <div className={`rounded-2xl p-5 border-2 transition-all ${
      isZero ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
      : isOver ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
      : 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
    }`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
            isZero ? 'text-emerald-600 dark:text-emerald-400'
            : isOver ? 'text-red-600 dark:text-red-400'
            : 'text-amber-700 dark:text-amber-400'
          }`}>
            {isZero ? '✓ Zero-Based Achieved' : isOver ? '✗ Over-Planned' : '◌ Unallocated'}
          </p>
          <p className={`text-4xl font-black tabular-nums ${
            isZero ? 'text-emerald-700 dark:text-emerald-300'
            : isOver ? 'text-red-700 dark:text-red-300'
            : 'text-amber-800 dark:text-amber-300'
          }`}>
            {fmt(Math.abs(unallocated))}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isZero
              ? 'Every rupee has a purpose. Perfect.'
              : isOver
              ? 'You have allocated more than your income. Reduce some envelopes.'
              : 'Assign this to an envelope. Every rupee must have a job.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Income', value: income, color: 'text-blue-700 dark:text-blue-300' },
            { label: 'Allocated', value: totalAllocated, color: 'text-slate-700 dark:text-slate-200' },
            { label: unallocated >= 0 ? 'Remaining' : 'Over by', value: Math.abs(unallocated),
              color: isZero ? 'text-emerald-700 dark:text-emerald-300' : isOver ? 'text-red-600' : 'text-amber-700 dark:text-amber-300' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={`text-lg font-bold tabular-nums ${color}`}>{fmt(value)}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 50/30/20 Breakdown ────────────────────────────────────────────────────────

function Breakdown5030({ month }: { month: string }) {
  const breakdown = useMemo(() => compute5030Breakdown(month), [month]);
  const buckets = [
    { key: 'needs',   label: 'Needs',   ideal: 50, color: 'bg-blue-500',  textColor: 'text-blue-700 dark:text-blue-300' },
    { key: 'wants',   label: 'Wants',   ideal: 30, color: 'bg-violet-500', textColor: 'text-violet-700 dark:text-violet-300' },
    { key: 'savings', label: 'Savings', ideal: 20, color: 'bg-emerald-500',textColor: 'text-emerald-700 dark:text-emerald-300' },
  ] as const;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">50/30/20 Framework</span>
      </div>
      {buckets.map(b => {
        const data = breakdown[b.key];
        const pct = Math.min(200, data.pct);
        const over = data.pct > b.ideal + 5;
        const under = data.pct < b.ideal - 5;
        return (
          <div key={b.key}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold ${b.textColor}`}>{b.label} — ideal {b.ideal}%</span>
              <span className={`text-xs font-bold ${over ? 'text-red-500' : under ? 'text-amber-500' : b.textColor}`}>
                {data.pct.toFixed(1)}% · {fmt(data.allocated)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              <div className={`h-full rounded-full transition-all ${over ? 'bg-red-400' : b.color}`}
                style={{ width: `${Math.min(100, pct)}%` }} />
              {/* Ideal marker */}
              <div className="absolute top-0 bottom-0 w-px bg-slate-400 dark:bg-slate-500"
                style={{ left: `${b.ideal}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Auto-Suggest Panel ────────────────────────────────────────────────────────

function AutoSuggestPanel({
  onAccept, onClose,
}: {
  onAccept: (category: string, amount: number) => void;
  onClose: () => void;
}) {
  const suggestions = useMemo(() => getAutoSuggestions(), []);

  if (suggestions.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          No spending history yet. Import bank statements to get smart budget suggestions based on your actual spending.
        </p>
        <button onClick={onClose} className="mt-2 text-xs text-blue-600 hover:underline">Close</button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-blue-800 dark:text-blue-200">Smart Suggestions — based on last 3 months</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { suggestions.forEach(s => onAccept(s.category, s.suggested)); onClose(); }}
            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accept All
          </button>
          <button onClick={onClose} className="text-blue-500 hover:text-blue-800"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="divide-y divide-blue-100 dark:divide-blue-800 max-h-72 overflow-y-auto">
        {suggestions.slice(0, 12).map(s => (
          <div key={s.category} className="flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s.category}</p>
              <p className="text-[10px] text-slate-400">
                {s.months}mo avg: {fmt(s.avgActual)} ·
                <span className={s.trend === 'up' ? ' text-red-500' : s.trend === 'down' ? ' text-emerald-500' : ' text-slate-400'}>
                  {s.trend === 'up' ? ' ↑ Rising' : s.trend === 'down' ? ' ↓ Falling' : ' → Stable'}
                </span>
              </p>
            </div>
            <span className="text-sm font-bold tabular-nums text-blue-700 dark:text-blue-300">{fmt(s.suggested)}</span>
            <button
              onClick={() => onAccept(s.category, s.suggested)}
              className="shrink-0 text-[10px] font-semibold px-2.5 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              Use
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Template Picker ───────────────────────────────────────────────────────────

function TemplatePicker({ month, onClose }: { month: string; onClose: () => void }) {
  const templates = useMemo(() => getTemplates(), []);
  const [saving, setSaving] = useState(false);
  const [tmplName, setTmplName] = useState('');
  const [tmplDesc, setTmplDesc] = useState('');

  return (
    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-violet-200 dark:border-violet-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookTemplate className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-bold text-violet-800 dark:text-violet-200">Budget Templates</span>
        </div>
        <button onClick={onClose}><X className="w-4 h-4 text-violet-400" /></button>
      </div>
      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => { applyTemplateToMonth(month, t.id); onClose(); }}
            className="text-left p-3 bg-white dark:bg-slate-900 rounded-lg border border-violet-200 dark:border-violet-700 hover:border-violet-400 transition-all"
          >
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>
            {!t.isBuiltIn && (
              <span className="text-[9px] font-semibold text-violet-600 bg-violet-100 dark:bg-violet-900/30 px-1.5 py-0.5 rounded-full mt-1 inline-block">Custom</span>
            )}
          </button>
        ))}
      </div>
      {/* Save current as template */}
      <div className="px-4 py-3 border-t border-violet-200 dark:border-violet-700">
        {!saving ? (
          <button
            onClick={() => setSaving(true)}
            className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-semibold"
          >
            + Save this month as a template
          </button>
        ) : (
          <div className="flex gap-2">
            <input placeholder="Template name" value={tmplName} onChange={e => setTmplName(e.target.value)}
              className={inputCls + ' text-xs py-1.5'} />
            <button
              onClick={() => {
                if (tmplName.trim()) { saveCurrentMonthAsTemplate(month, tmplName, tmplDesc); setSaving(false); setTmplName(''); }
              }}
              className="px-3 py-1 bg-violet-600 text-white text-xs font-semibold rounded-lg"
            >Save</button>
            <button onClick={() => setSaving(false)} className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Envelope Row ──────────────────────────────────────────────────────────────

function EnvelopeRow({
  envelope, month, onDelete,
}: {
  envelope: Envelope; month: string; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const categories = useMemo(() => getAvailablePFCategories(), []);

  const update = useCallback((updates: Partial<Envelope>) => {
    updateEnvelope(month, envelope.id, updates);
  }, [month, envelope.id]);

  const typeColor: Record<EnvelopeType, string> = {
    committed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    goal: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    'sinking-fund': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    regular: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border transition-all ${
      envelope.type === 'committed' ? 'border-red-200 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Priority badge */}
        <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center">
          P{envelope.priority}
        </span>

        {/* Category */}
        <div className="flex-1 min-w-0">
          <select value={envelope.category} onChange={e => update({ category: e.target.value })}
            className="text-sm font-semibold bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 cursor-pointer w-full">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Type badge */}
        <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${typeColor[envelope.type]}`}>
          {TYPE_LABEL[envelope.type]}
        </span>

        {/* Allocated amount */}
        <div className="shrink-0 flex items-center gap-1">
          <span className="text-[11px] text-slate-400">₹</span>
          <input
            type="number" min={0} step={500}
            value={envelope.allocated || ''}
            onChange={e => update({ allocated: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-28 text-right text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 outline-none focus:border-blue-400"
          />
        </div>

        {/* Rollover */}
        {envelope.rolloverAmount > 0 && (
          <span className="shrink-0 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            +{fmt(envelope.rolloverAmount)} rollover
          </span>
        )}

        <button onClick={() => setExpanded(x => !x)} className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button onClick={onDelete} className="shrink-0 text-slate-300 hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-3 pt-0 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className={labelCls}>Type</label>
            <select value={envelope.type} onChange={e => update({ type: e.target.value as EnvelopeType })} className={selectCls}>
              {(Object.keys(TYPE_LABEL) as EnvelopeType[]).map(t => (
                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Priority</label>
            <select value={envelope.priority} onChange={e => update({ priority: parseInt(e.target.value) as EnvelopePriority })} className={selectCls}>
              {([1, 2, 3, 4, 5] as EnvelopePriority[]).map(p => (
                <option key={p} value={p}>P{p} — {PRIORITY_LABEL[p]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 flex flex-col justify-end">
            <label className={labelCls}>Rollover unspent</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => update({ rolloverEnabled: !envelope.rolloverEnabled })}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${envelope.rolloverEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${envelope.rolloverEnabled ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300">{envelope.rolloverEnabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Notes</label>
            <input type="text" placeholder="e.g. Higher this month" value={envelope.notes || ''}
              onChange={e => update({ notes: e.target.value })} className={inputCls + ' text-xs'} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Envelope Panel ────────────────────────────────────────────────────────

function AddEnvelopePanel({ month, onAdd, onClose }: {
  month: string; onAdd: () => void; onClose: () => void;
}) {
  const categories = useMemo(() => getAvailablePFCategories(), []);
  const [cat, setCat] = useState(categories[0] ?? 'Miscellaneous');
  const [amount, setAmount] = useState(5000);
  const [type, setType] = useState<EnvelopeType>('regular');
  const [priority, setPriority] = useState<EnvelopePriority>(3);

  const handleAdd = () => {
    addEnvelope(month, {
      category: cat, allocated: amount, rolloverEnabled: type !== 'committed',
      rolloverAmount: 0, priority, type,
    });
    onAdd();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-4 space-y-3">
      <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">New Envelope</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className={labelCls}>Category</label>
          <select value={cat} onChange={e => setCat(e.target.value)} className={selectCls}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Allocated (₹)</label>
          <input type="number" min={0} step={500} value={amount || ''}
            onChange={e => setAmount(Math.max(0, parseInt(e.target.value) || 0))} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Type</label>
          <select value={type} onChange={e => setType(e.target.value as EnvelopeType)} className={selectCls}>
            {(Object.keys(TYPE_LABEL) as EnvelopeType[]).map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Priority</label>
          <select value={priority} onChange={e => setPriority(parseInt(e.target.value) as EnvelopePriority)} className={selectCls}>
            {([1, 2, 3, 4, 5] as EnvelopePriority[]).map(p => <option key={p} value={p}>P{p} — {PRIORITY_LABEL[p]}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          Add Envelope
        </button>
        <button onClick={onClose}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main Canvas ───────────────────────────────────────────────────────────────

export function BudgetCanvas({ month }: { month: string }) {
  const [plan, setPlan] = useState<MonthPlan | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [show5030, setShow5030] = useState(false);
  const [actualIncome, setActualIncome] = useState(0);

  const reload = useCallback(() => {
    const p = getOrCreateMonthPlan(month);
    setPlan({ ...p });
    setActualIncome(computeMonthActualIncome(month));
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

  const totalAllocated = useMemo(() =>
    plan?.envelopes.reduce((s, e) => s + e.allocated + e.rolloverAmount, 0) ?? 0,
  [plan]);

  const totalCommitted = useMemo(() =>
    plan?.envelopes.filter(e => e.type === 'committed').reduce((s, e) => s + e.allocated, 0) ?? 0,
  [plan]);

  const festivals = useMemo(() => getFestivalHintsForMonth(month), [month]);

  const handleIncomeChange = (field: string, value: number) => {
    updateMonthIncome(month, { [field]: value });
  };

  const handleSuggestionAccept = (category: string, amount: number) => {
    if (!plan) return;
    const existing = plan.envelopes.find(e => e.category === category);
    if (existing) {
      updateEnvelope(month, existing.id, { allocated: amount });
    } else {
      addEnvelope(month, { category, allocated: amount, rolloverEnabled: true, rolloverAmount: 0, priority: 3, type: 'regular' });
    }
  };

  if (!plan) return null;

  const income = plan.income.expected;

  return (
    <div className="p-4 space-y-4">
      {/* Festival hints */}
      {festivals.length > 0 && (
        <div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3">
          <Flag className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-orange-800 dark:text-orange-200">
              {festivals.map(f => f.name).join(', ')} this month
            </p>
            <p className="text-[11px] text-orange-700 dark:text-orange-300 mt-0.5">
              {festivals.map(f => f.hint).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Income Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Income</span>
            {actualIncome > 0 && (
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                Actual: {fmt(actualIncome)}
              </span>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => handleIncomeChange('variableMode', plan.income.variableMode ? 0 : 1)}
              className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${plan.income.variableMode ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${plan.income.variableMode ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">Variable Income</span>
          </label>
        </div>

        {!plan.income.variableMode ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className={labelCls}>Expected Monthly Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                <input type="number" step={1000}
                  value={income || ''}
                  onChange={e => handleIncomeChange('expected', parseInt(e.target.value) || 0)}
                  className={inputCls + ' pl-7'}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'minScenario', label: 'Floor (Min)' },
              { key: 'expected',   label: 'Expected' },
              { key: 'maxScenario',label: 'Upside (Max)' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <label className={labelCls}>{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input type="number" step={1000}
                    value={(plan.income as unknown as Record<string, number>)[key] || ''}
                    onChange={e => handleIncomeChange(key, parseInt(e.target.value) || 0)}
                    className={inputCls + ' pl-7'}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zero-Based Indicator */}
      <ZeroBasedIndicator income={income} totalAllocated={totalAllocated} />

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Committed', value: totalCommitted, sub: `${income > 0 ? ((totalCommitted / income) * 100).toFixed(0) : 0}% of income`, color: 'text-red-600 dark:text-red-400' },
          { label: 'Discretionary', value: totalAllocated - totalCommitted, sub: 'Flexible envelopes', color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Breathing Room', value: income - totalCommitted, sub: 'After all commitments', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Envelopes', value: plan.envelopes.length, sub: `${plan.envelopes.filter(e => e.rolloverEnabled).length} with rollover`, color: 'text-violet-600 dark:text-violet-400', isCount: true },
        ].map(({ label, value, sub, color, isCount }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <p className={`text-lg font-black tabular-nums ${color}`}>
              {isCount ? value : fmt(value as number)}
            </p>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{label}</p>
            <p className="text-[10px] text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Action toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => { setShowSuggest(x => !x); setShowTemplate(false); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${showSuggest ? 'bg-blue-600 text-white' : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Lightbulb className="w-3.5 h-3.5" /> Smart Suggestions
        </button>
        <button
          onClick={() => { setShowTemplate(x => !x); setShowSuggest(false); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${showTemplate ? 'bg-violet-600 text-white' : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <BookTemplate className="w-3.5 h-3.5" /> Templates
        </button>
        <button
          onClick={() => setShow5030(x => !x)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${show5030 ? 'bg-slate-700 text-white' : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> 50/30/20
        </button>
        <div className="ml-auto">
          <button
            onClick={() => { setShowAdd(x => !x); setShowSuggest(false); setShowTemplate(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Envelope
          </button>
        </div>
      </div>

      {/* Conditional panels */}
      {showSuggest && (
        <AutoSuggestPanel
          onAccept={handleSuggestionAccept}
          onClose={() => setShowSuggest(false)}
        />
      )}
      {showTemplate && (
        <TemplatePicker month={month} onClose={() => setShowTemplate(false)} />
      )}
      {show5030 && <Breakdown5030 month={month} />}
      {showAdd && (
        <AddEnvelopePanel month={month} onAdd={() => { setShowAdd(false); }} onClose={() => setShowAdd(false)} />
      )}

      {/* Envelopes list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Envelopes ({plan.envelopes.length})
          </p>
          {plan.envelopes.length > 1 && (
            <button
              onClick={() => {
                const sorted = [...plan.envelopes].sort((a, b) => a.priority - b.priority);
                saveMonthPlan({ ...plan, envelopes: sorted });
              }}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Sort by Priority
            </button>
          )}
        </div>

        {plan.envelopes.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">No envelopes yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              Start with a template or add envelopes manually.<br />
              Each envelope is a spending category with an allocated budget.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowTemplate(true)}
                className="px-4 py-2 border border-violet-300 text-violet-600 rounded-xl text-xs font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20">
                Choose Template
              </button>
              <button onClick={() => setShowAdd(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
                Add First Envelope
              </button>
            </div>
          </div>
        ) : (
          plan.envelopes.map(e => (
            <EnvelopeRow
              key={e.id}
              envelope={e}
              month={month}
              onDelete={() => removeEnvelope(month, e.id)}
            />
          ))
        )}
      </div>

      {/* Month notes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <label className={labelCls + ' block mb-2'}>Month Notes</label>
        <textarea
          rows={2}
          placeholder="e.g. Annual insurance due this month · Diwali shopping budgeted in Shopping envelope"
          value={plan.notes || ''}
          onChange={e => saveMonthPlan({ ...plan, notes: e.target.value })}
          className={inputCls + ' resize-none'}
        />
      </div>
    </div>
  );
}
