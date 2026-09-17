"use client";
// ══════════════════════════════════════════════════════════════════════════════
// pf-bp-goals.tsx — Savings Goals Engine
// Set goals, track progress, simulate contributions, celebrate milestones
// ══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Target, Plus, Trash2, Edit2, Check, X, TrendingUp, Calendar, Zap, ChevronRight } from 'lucide-react';
import {
  getGoals, addGoal, updateGoal, deleteGoal, computeGoalETA,
  type SavingsGoal, type GoalCategory,
} from './budget-planner-store';
import { fmtINR } from './finance-store';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = fmtINR;

const GOAL_EMOJIS = ['🏠', '✈️', '🚗', '💻', '📚', '🏥', '💍', '🎓', '🌴', '🏋️', '🎯', '💰', '🛡️', '🏦', '🚀'];
const GOAL_COLORS = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
  'from-orange-500 to-orange-600',
  'from-teal-500 to-teal-600',
];

const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  emergency: '🛡️ Emergency Fund',
  travel: '✈️ Travel',
  purchase: '🛍️ Major Purchase',
  education: '📚 Education',
  vehicle: '🚗 Vehicle',
  investment: '📈 Investment',
  'debt-payoff': '💳 Debt Payoff',
  custom: '🎯 Custom',
};

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

// ── Goal Form ─────────────────────────────────────────────────────────────────

function GoalForm({
  initial, onSave, onCancel,
}: {
  initial?: Partial<SavingsGoal>;
  onSave: (data: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯');
  const [targetAmount, setTargetAmount] = useState(initial?.targetAmount ?? 100000);
  const [currentSaved, setCurrentSaved] = useState(initial?.currentSaved ?? 0);
  const [monthlyContribution, setMonthlyContribution] = useState(initial?.monthlyContribution ?? 5000);
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '');
  const [category, setCategory] = useState<GoalCategory>(initial?.category ?? 'custom');
  const [color, setColor] = useState(initial?.color ?? GOAL_COLORS[0]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const preview = useMemo(() => {
    const remaining = Math.max(0, targetAmount - currentSaved);
    if (monthlyContribution <= 0) return null;
    const months = Math.ceil(remaining / monthlyContribution);
    const eta = new Date();
    eta.setMonth(eta.getMonth() + months);
    return { months, date: eta.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) };
  }, [targetAmount, currentSaved, monthlyContribution]);

  const handleSave = () => {
    if (!name.trim() || targetAmount <= 0) return;
    onSave({ name, emoji, targetAmount, currentSaved, monthlyContribution, targetDate, category, color });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5 space-y-4">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
        {initial?.name ? 'Edit Goal' : 'New Savings Goal'}
      </p>

      {/* Emoji + Name */}
      <div className="flex gap-3">
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(x => !x)}
            className="w-12 h-12 text-2xl rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fin-accent transition-colors flex items-center justify-center bg-slate-50 dark:bg-slate-800"
          >
            {emoji}
          </button>
          {showEmojiPicker && (
            <div className="absolute top-14 left-0 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 grid grid-cols-5 gap-2 shadow-xl">
              {GOAL_EMOJIS.map(e => (
                <button key={e} onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                  className="w-8 h-8 text-lg rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center">
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <label className={labelCls}>Goal Name</label>
          <input type="text" placeholder="e.g. Goa Trip, Emergency Fund" value={name}
            onChange={e => setName(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Color picker */}
      <div className="space-y-1">
        <label className={labelCls}>Color</label>
        <div className="flex gap-2 flex-wrap">
          {GOAL_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`} />
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1">
        <label className={labelCls}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value as GoalCategory)} className={inputCls}>
          {(Object.entries(GOAL_CATEGORY_LABELS) as [GoalCategory, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className={labelCls}>Target Amount (₹)</label>
          <input type="number" min={1000} step={10000} value={targetAmount || ''}
            onChange={e => setTargetAmount(parseInt(e.target.value) || 0)} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Already Saved (₹)</label>
          <input type="number" min={0} step={1000} value={currentSaved || ''}
            onChange={e => setCurrentSaved(parseInt(e.target.value) || 0)} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Monthly Contribution (₹)</label>
          <input type="number" min={100} step={500} value={monthlyContribution || ''}
            onChange={e => setMonthlyContribution(parseInt(e.target.value) || 0)} className={inputCls} />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Target Date (optional)</label>
        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputCls} />
      </div>

      {/* Live ETA preview */}
      {preview && (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
          <Calendar className="w-4 h-4 text-fin-accent shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              At {fmt(monthlyContribution)}/month → Goal reached by {preview.date}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {preview.months} months · {fmt(Math.max(0, targetAmount - currentSaved))} remaining
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleSave}
          className="px-5 py-2 bg-fin-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-colors">
          <Check className="w-4 h-4 inline -mt-0.5 mr-1" />Save Goal
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── What-If Simulator ─────────────────────────────────────────────────────────

function WhatIfSimulator({ goal }: { goal: SavingsGoal }) {
  const [contribution, setContribution] = useState(goal.monthlyContribution);
  const eta = useMemo(() => computeGoalETA(goal, contribution), [goal, contribution]);

  const max = Math.max(goal.monthlyContribution * 3, 50000);
  const remaining = Math.max(0, goal.targetAmount - goal.currentSaved);

  return (
    <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">What If Simulator</span>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>Monthly Contribution</label>
          <span className="text-sm font-bold text-neutral-value">{fmt(contribution)}</span>
        </div>
        <input
          type="range" min={100} max={max} step={500} value={contribution}
          onChange={e => setContribution(parseInt(e.target.value))}
          className="w-full h-2 accent-fin-accent cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
          <span>{fmt(100)}</span><span>{fmt(max)}</span>
        </div>
      </div>
      <div className={`flex items-center gap-3 rounded-lg px-3 py-2 ${eta.canAchieve ? 'bg-positive-tint' : 'bg-negative-tint'}`}>
        <Calendar className={`w-4 h-4 shrink-0 ${eta.canAchieve ? 'text-positive' : 'text-negative'}`} />
        <div>
          <p className={`text-xs font-bold ${eta.canAchieve ? 'text-positive' : 'text-negative'}`}>
            {eta.date}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {eta.months === Infinity ? 'No contribution set' : `${eta.months} months to reach ${fmt(goal.targetAmount)}`}
          </p>
        </div>
        {!eta.canAchieve && goal.targetDate && (
          <span className="ml-auto text-[10px] text-negative font-semibold">Misses deadline</span>
        )}
        {eta.canAchieve && goal.targetDate && (
          <span className="ml-auto text-[10px] text-positive font-semibold">On track</span>
        )}
      </div>
      {contribution !== goal.monthlyContribution && (
        <button
          onClick={() => updateGoal(goal.id, { monthlyContribution: contribution })}
          className="text-xs text-fin-accent hover:underline font-semibold"
        >
          Apply {fmt(contribution)}/month as this goal's contribution →
        </button>
      )}
    </div>
  );
}

// ── Goal Card ─────────────────────────────────────────────────────────────────

function GoalCard({ goal, onEdit }: { goal: SavingsGoal; onEdit: () => void }) {
  const [showSim, setShowSim] = useState(false);
  const [addAmount, setAddAmount] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const eta = useMemo(() => computeGoalETA(goal), [goal]);

  const pct = goal.targetAmount > 0
    ? Math.min(100, (goal.currentSaved / goal.targetAmount) * 100)
    : 0;

  const remaining = Math.max(0, goal.targetAmount - goal.currentSaved);
  const isComplete = remaining === 0;

  return (
    <div className={`relative rounded-lg overflow-hidden border transition-all ${
      isComplete ? 'border-positive/40' : 'border-slate-200 dark:border-slate-700'
    } bg-white dark:bg-slate-900`}>
      {/* Color header */}
      <div className={`bg-gradient-to-r ${goal.color} px-5 py-4 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{goal.emoji}</span>
            <div>
              <p className="font-bold text-base">{goal.name}</p>
              <p className="text-white/70 text-xs">{GOAL_CATEGORY_LABELS[goal.category]}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{pct.toFixed(0)}%</p>
            <p className="text-white/70 text-xs">complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2.5 rounded-full bg-white/25 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-white/70 text-[10px]">
          <span>{fmt(goal.currentSaved)} saved</span>
          <span>{fmt(goal.targetAmount)} target</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {isComplete ? (
          <div className="flex items-center gap-2 text-positive">
            <Check className="w-5 h-5" />
            <p className="text-sm font-bold">Goal Achieved!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-sm font-bold tabular-nums text-neutral-value">{fmt(remaining)}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Remaining</p>
            </div>
            <div>
              <p className="text-sm font-bold tabular-nums text-neutral-value">{fmt(goal.monthlyContribution)}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Monthly</p>
            </div>
            <div>
              <p className={`text-sm font-bold tabular-nums ${eta.canAchieve ? 'text-positive' : 'text-negative'}`}>
                {eta.date}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">ETA</p>
            </div>
          </div>
        )}

        {/* Target date */}
        {goal.targetDate && !isComplete && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
            eta.canAchieve ? 'bg-positive-tint text-positive' : 'bg-negative-tint text-negative'
          }`}>
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>
              Target date: {new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}
              {eta.canAchieve ? 'You are on track' : 'May miss deadline — increase contribution'}
            </span>
          </div>
        )}

        {/* What-if simulator */}
        {!isComplete && (
          <button
            onClick={() => setShowSim(x => !x)}
            className="flex items-center gap-2 text-xs text-fin-accent hover:underline font-semibold"
          >
            <Zap className="w-3.5 h-3.5" />
            {showSim ? 'Hide' : 'Show'} What-If Simulator
          </button>
        )}
        {showSim && !isComplete && <WhatIfSimulator goal={goal} />}

        {/* Log savings */}
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)}
            className="text-xs text-fin-accent hover:underline font-semibold">
            + Log a contribution
          </button>
        ) : (
          <div className="flex gap-2">
            <input type="number" min={100} step={500} placeholder="Amount saved (₹)"
              value={addAmount || ''}
              onChange={e => setAddAmount(parseInt(e.target.value) || 0)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none flex-1" />
            <button
              onClick={() => {
                if (addAmount > 0) { updateGoal(goal.id, { currentSaved: goal.currentSaved + addAmount }); setAddAmount(0); setShowAdd(false); }
              }}
              className="px-3 py-1.5 bg-fin-accent text-white rounded-lg text-xs font-semibold"
            >Save</button>
            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 text-xs px-2">✕</button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button onClick={() => { if (window.confirm(`Delete goal "${goal.name}"?`)) deleteGoal(goal.id); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-negative border border-negative/30 rounded-lg hover:bg-negative-tint transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Emergency Fund Special Card ───────────────────────────────────────────────

function EmergencyFundCard({ goals }: { goals: SavingsGoal[] }) {
  const ef = goals.find(g => g.category === 'emergency');
  if (!ef) return null;

  return null; // Rendered as a regular goal card
}

// ── Goals Summary Strip ───────────────────────────────────────────────────────

function GoalsSummary({ goals }: { goals: SavingsGoal[] }) {
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentSaved, 0);
  const totalMonthly = goals.reduce((s, g) => s + g.monthlyContribution, 0);
  const complete = goals.filter(g => g.currentSaved >= g.targetAmount).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: 'Total Goals', value: goals.length, sub: `${complete} completed` },
        { label: 'Total Target', value: fmt(totalTarget), sub: 'Across all goals' },
        { label: 'Total Saved', value: fmt(totalSaved), sub: `${totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}% of all targets` },
        { label: 'Monthly Outflow', value: fmt(totalMonthly), sub: 'Toward all goals' },
      ].map(({ label, value, sub }) => (
        <div key={label} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-xl font-black text-neutral-value tabular-nums">{value}</p>
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{label}</p>
          <p className="text-[10px] text-slate-500">{sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Goals Engine ─────────────────────────────────────────────────────────

export function GoalsEngine() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [sortBy, setSortBy] = useState<'progress' | 'eta' | 'monthly' | 'amount'>('progress');

  const reload = useCallback(() => setGoals([...getGoals()]), []);

  useEffect(() => {
    reload();
    const handler = () => reload();
    window.addEventListener('bp-store-updated', handler);
    return () => window.removeEventListener('bp-store-updated', handler);
  }, [reload]);

  const sorted = useMemo(() => {
    const list = [...goals];
    switch (sortBy) {
      case 'progress': list.sort((a, b) => (b.currentSaved / b.targetAmount) - (a.currentSaved / a.targetAmount)); break;
      case 'eta': {
        list.sort((a, b) => {
          const ea = computeGoalETA(a).months;
          const eb = computeGoalETA(b).months;
          return (ea === Infinity ? 9999 : ea) - (eb === Infinity ? 9999 : eb);
        });
        break;
      }
      case 'monthly': list.sort((a, b) => b.monthlyContribution - a.monthlyContribution); break;
      case 'amount':  list.sort((a, b) => b.targetAmount - a.targetAmount); break;
    }
    return list;
  }, [goals, sortBy]);

  const handleSave = (data: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
      setEditingGoal(null);
    } else {
      addGoal(data);
      setShowForm(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Summary */}
      {goals.length > 0 && <GoalsSummary goals={goals} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Sort:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none">
            <option value="progress">By Progress</option>
            <option value="eta">By ETA (Soonest)</option>
            <option value="monthly">By Monthly Contribution</option>
            <option value="amount">By Target Amount</option>
          </select>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => { setShowForm(true); setEditingGoal(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-fin-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Goal
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
      {(showForm || editingGoal) && (
        <GoalForm
          initial={editingGoal ?? undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingGoal(null); }}
        />
      )}

      {/* Goals grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
          <Target className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">No savings goals yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto mb-4">
            Set goals for things that matter — emergency fund, vacation, a new device, down payment. Give your savings a purpose.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-fin-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-colors"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => { setEditingGoal(goal); setShowForm(false); }}
            />
          ))}
        </div>
      )}

      {/* Goal category guide */}
      {goals.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Financial Goal Priorities</p>
          <div className="space-y-2">
            {[
              { step: '1', text: 'Emergency Fund — 3 to 6 months of expenses', color: 'bg-red-500' },
              { step: '2', text: 'High-interest debt payoff — credit cards, personal loans', color: 'bg-orange-500' },
              { step: '3', text: 'Insurance coverage — health, life, vehicle', color: 'bg-amber-500' },
              { step: '4', text: 'Long-term investments — SIP, NPS, PPF', color: 'bg-blue-500' },
              { step: '5', text: 'Life goals — vacation, vehicle, gadgets, home', color: 'bg-emerald-500' },
            ].map(({ step, text, color }) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${color} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>{step}</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
