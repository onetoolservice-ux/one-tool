"use client";
// ══════════════════════════════════════════════════════════════════════════════
// pf-budget-planner.tsx — Monthly Budget Planner — Main Container
// Zero-based · Envelope System · Goals · Cash Flow · Year View
// ══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutGrid, Layers, Target, Calendar, BarChart3, ChevronLeft, ChevronRight,
  Copy, Flag, Sparkles,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  getOrCreateMonthPlan, computeMonthHealth, computeAllActuals,
  updateMonthFlag, type SpecialFlag,
} from './budget-planner-store';
import { fmtINR } from './finance-store';
import { BudgetCanvas }     from './PfBpCanvas';
import { EnvelopesBoard }   from './PfBpEnvelopes';
import { GoalsEngine }      from './PfBpGoals';
import { CashFlowCalendar } from './PfBpCalendar';
import { YearView }         from './PfBpYear';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = fmtINR;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const FLAG_OPTIONS: { key: SpecialFlag; label: string }[] = [
  { key: 'festival',    label: '🎆 Festival Month'    },
  { key: 'vacation',    label: '✈️ Vacation Month'    },
  { key: 'annual-dues', label: '📋 Annual Dues Month' },
  { key: 'tax-season',  label: '📊 Tax Season'        },
];

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function prevMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function todayMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── Tab Config ────────────────────────────────────────────────────────────────

type TabKey = 'canvas' | 'envelopes' | 'goals' | 'calendar' | 'year';

const TABS: { key: TabKey; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
  { key: 'canvas',    label: 'Canvas',     icon: LayoutGrid, desc: 'Plan where every rupee goes'       },
  { key: 'envelopes', label: 'Envelopes',  icon: Layers,     desc: 'Track spend vs budget per category' },
  { key: 'goals',     label: 'Goals',      icon: Target,     desc: 'Set targets, simulate timelines'    },
  { key: 'calendar',  label: 'Cash Flow',  icon: Calendar,   desc: 'Bills & income day-by-day'          },
  { key: 'year',      label: 'Year View',  icon: BarChart3,  desc: 'See all 12 months at once'          },
];

// ── Month Navigator ───────────────────────────────────────────────────────────

function MonthNavigator({
  month, onPrev, onNext, onToday,
}: {
  month: string; onPrev: () => void; onNext: () => void; onToday: () => void;
}) {
  const isToday = month === todayMonth();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onPrev}
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-500"
        title="Previous month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="px-3 py-1.5 min-w-36 text-center">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{monthLabel(month)}</p>
        {!isToday && (
          <button onClick={onToday} className="text-[10px] text-blue-500 hover:underline">
            Back to {monthLabel(todayMonth())}
          </button>
        )}
      </div>
      <button
        onClick={onNext}
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-500"
        title="Next month"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Breathing Room Widget ─────────────────────────────────────────────────────

function BreathingRoom({ month }: { month: string }) {
  const [value, setValue] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);

  useEffect(() => {
    const plan = getOrCreateMonthPlan(month);
    const actuals = computeAllActuals(month);
    const totalActual = Object.values(actuals).reduce((s, v) => s + v, 0);
    const committed = plan.envelopes.filter(e => e.type === 'committed').reduce((s, e) => s + e.allocated, 0);
    setValue(plan.income.expected - committed - (totalActual - (actuals['Housing'] ?? 0) - (actuals['Loan/EMI'] ?? 0)));
    setSavingsRate(plan.income.expected > 0 ? Math.max(0, ((plan.income.expected - totalActual) / plan.income.expected) * 100) : 0);
  }, [month]);

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className={`text-sm font-black tabular-nums ${value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
          {value >= 0 ? fmt(value) : `−${fmt(Math.abs(value))}`}
        </p>
        <p className="text-[9px] text-slate-400 uppercase tracking-wide">Breathing Room</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-black tabular-nums ${savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : savingsRate >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
          {savingsRate.toFixed(1)}%
        </p>
        <p className="text-[9px] text-slate-400 uppercase tracking-wide">Savings Rate</p>
      </div>
    </div>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────

function TabBar({
  active, onChange,
}: {
  active: TabKey; onChange: (tab: TabKey) => void;
}) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap text-sm font-semibold ${
              isActive
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex flex-col items-start gap-0.5">
              <span>{tab.label}</span>
              <span className={`text-[10px] font-normal leading-tight ${isActive ? 'text-blue-400 dark:text-blue-500' : 'text-slate-400 dark:text-slate-500'}`}>{tab.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Flag Selector ─────────────────────────────────────────────────────────────

function FlagSelector({ month }: { month: string }) {
  const [current, setCurrent] = useState<SpecialFlag | undefined>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const plan = getOrCreateMonthPlan(month);
    setCurrent(plan.specialFlag);
  }, [month]);

  const select = (flag: SpecialFlag | undefined) => {
    updateMonthFlag(month, flag);
    setCurrent(flag);
    setOpen(false);
  };

  const currentFlag = FLAG_OPTIONS.find(f => f.key === current);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(x => !x)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          current
            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
            : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        <Flag className="w-3.5 h-3.5" />
        {currentFlag ? currentFlag.label : 'Flag Month'}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-1 min-w-48">
          <button
            onClick={() => select(undefined)}
            className="w-full text-left px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            No Flag
          </button>
          {FLAG_OPTIONS.map(f => (
            <button
              key={f.key}
              onClick={() => select(f.key)}
              className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${current === f.key ? 'text-orange-600 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Planner ──────────────────────────────────────────────────────────────

export function MonthlyBudgetPlanner() {
  const [month, setMonth] = useState(todayMonth);
  const [tab, setTab] = useState<TabKey>('canvas');
  const [health, setHealth] = useState({ score: 0, categoriesOnTrack: 0, totalCategories: 0 });

  const reloadHealth = useCallback(() => {
    const report = computeMonthHealth(month);
    setHealth({ score: report.healthScore, categoriesOnTrack: report.categoriesOnTrack, totalCategories: report.totalCategories });
  }, [month]);

  useEffect(() => {
    reloadHealth();
    const handler = () => reloadHealth();
    window.addEventListener('bp-store-updated', handler);
    window.addEventListener('pf-store-updated', handler);
    return () => {
      window.removeEventListener('bp-store-updated', handler);
      window.removeEventListener('pf-store-updated', handler);
    };
  }, [reloadHealth]);

  const handleYearMonthSelect = (m: string) => {
    setMonth(m);
    setTab('canvas');
  };

  const scoreColor = health.score >= 80 ? 'success' : health.score >= 60 ? 'neutral' : health.score > 0 ? 'warning' : 'neutral';

  return (
    <div className="flex flex-col min-h-full">
      {/* SAP Header */}
      <SAPHeader
        fullWidth
        title="Monthly Budget Planner"
        subtitle="Zero-based · Envelopes · Goals · Cash Flow"
        kpis={[
          {
            label: 'Month',
            value: monthLabel(month),
            color: 'neutral',
            subtitle: month === todayMonth() ? 'Current month' : 'Planning ahead',
          },
          {
            label: 'Budget Health',
            value: health.totalCategories > 0 ? `${health.score}/100` : 'Not set up',
            color: scoreColor,
            subtitle: health.totalCategories > 0
              ? `${health.categoriesOnTrack}/${health.totalCategories} envelopes on track`
              : 'Set up Canvas to begin',
          },
        ]}
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            <BreathingRoom month={month} />
            <FlagSelector month={month} />
            <MonthNavigator
              month={month}
              onPrev={() => setMonth(prevMonth)}
              onNext={() => setMonth(nextMonth)}
              onToday={() => setMonth(todayMonth)}
            />
          </div>
        }
      />

      {/* Tab bar */}
      <TabBar active={tab} onChange={setTab} />

      {/* Tab content */}
      <div className="flex-1">
        {tab === 'canvas' && <BudgetCanvas month={month} />}
        {tab === 'envelopes' && <EnvelopesBoard month={month} />}
        {tab === 'goals' && <GoalsEngine />}
        {tab === 'calendar' && <CashFlowCalendar month={month} />}
        {tab === 'year' && <YearView onMonthSelect={handleYearMonthSelect} />}
      </div>

      {/* Getting started hint for empty state */}
      {tab === 'canvas' && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center">1</span>
              Set your income above
            </span>
            <span className="text-slate-300 dark:text-slate-600">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center">2</span>
              Choose a template or add envelopes
            </span>
            <span className="text-slate-300 dark:text-slate-600">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center">3</span>
              Allocate until Unallocated = ₹0
            </span>
            <span className="text-slate-300 dark:text-slate-600">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center">✓</span>
              Track in Envelopes tab all month
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
