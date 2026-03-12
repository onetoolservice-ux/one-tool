"use client";
import React, { useState, useMemo } from 'react';
import { PlaneTakeoff, Users, Calendar, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-400 transition-colors w-full';
const labelCls =
  'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

interface Category {
  name: string;
  budgeted: number;
  actual: number;
}

function buildDefaults(people: number, days: number): Category[] {
  return [
    { name: 'Flights / Train', budgeted: 12000 * people, actual: 0 },
    { name: 'Accommodation', budgeted: 3000 * days, actual: 0 },
    { name: 'Food & Dining', budgeted: 800 * days * people, actual: 0 },
    { name: 'Local Transport', budgeted: 500 * days, actual: 0 },
    { name: 'Activities & Tours', budgeted: 5000, actual: 0 },
    { name: 'Shopping', budgeted: 3000 * people, actual: 0 },
    { name: 'Miscellaneous', budgeted: 2000, actual: 0 },
  ];
}

export const TripBudget = () => {
  const [tripName, setTripName] = useState('Goa Trip');
  const [people, setPeople] = useState(4);
  const [days, setDays] = useState(5);
  const [categories, setCategories] = useState<Category[]>(() => buildDefaults(4, 5));

  const updateCategory = (index: number, field: 'budgeted' | 'actual', value: number) => {
    setCategories(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const recalcDefaults = () => {
    setCategories(buildDefaults(people, days));
  };

  const totals = useMemo(() => {
    const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0);
    const totalActual = categories.reduce((s, c) => s + c.actual, 0);
    const remaining = totalBudgeted - totalActual;
    const perPerson = totalActual > 0 ? totalActual / people : totalBudgeted / people;
    const overallPct = totalBudgeted > 0 ? Math.min(100, (totalActual / totalBudgeted) * 100) : 0;
    return { totalBudgeted, totalActual, remaining, perPerson, overallPct };
  }, [categories, people]);

  const hasOverBudget = categories.some(c => c.actual > c.budgeted && c.actual > 0);
  const totalOver = totals.totalActual > totals.totalBudgeted;

  return (
    <div>
      <SAPHeader
        fullWidth
        title={`${tripName} Budget`}
        subtitle="Track your travel spend in real time"
        kpis={[
          { label: 'Total Budget', value: fmt(totals.totalBudgeted), color: 'neutral' },
          { label: 'Total Spent', value: fmt(totals.totalActual), color: totalOver ? 'error' : 'warning' },
          { label: 'Per Person', value: fmt(totals.perPerson), color: 'primary' },
          { label: 'Remaining', value: fmt(totals.remaining), color: totals.remaining < 0 ? 'error' : 'success' },
        ]}
      />

      <div className="p-4 space-y-4">

        {/* Trip Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Trip Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Trip Name</label>
              <input
                className={inputCls}
                value={tripName}
                onChange={e => setTripName(e.target.value)}
                placeholder="Goa Trip"
              />
            </div>
            <div>
              <label className={labelCls}>Number of People</label>
              <input
                type="number"
                min={1}
                className={inputCls}
                value={people}
                onChange={e => setPeople(Math.max(1, +e.target.value))}
              />
            </div>
            <div>
              <label className={labelCls}>Duration (Days)</label>
              <input
                type="number"
                min={1}
                className={inputCls}
                value={days}
                onChange={e => setDays(Math.max(1, +e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={recalcDefaults}
                className="w-full px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
              >
                Recalculate Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Overall Spend Progress
            </span>
            <span className={`text-sm font-bold ${totalOver ? 'text-red-500' : 'text-sky-600 dark:text-sky-400'}`}>
              {totals.overallPct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${totalOver ? 'bg-red-500' : totals.overallPct > 80 ? 'bg-amber-500' : 'bg-sky-500'}`}
              style={{ width: `${totals.overallPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Spent: {fmt(totals.totalActual)}</span>
            <span>Budget: {fmt(totals.totalBudgeted)}</span>
          </div>
        </div>

        {/* Category Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Budget Categories</h3>
          </div>

          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="col-span-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Category</div>
            <div className="col-span-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Budgeted</div>
            <div className="col-span-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Actual Spend</div>
            <div className="col-span-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Variance</div>
            <div className="col-span-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Status</div>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {categories.map((cat, i) => {
              const variance = cat.budgeted - cat.actual;
              const isOver = cat.actual > cat.budgeted && cat.actual > 0;
              const isUnder = cat.actual <= cat.budgeted && cat.actual > 0;
              const pct = cat.budgeted > 0 ? Math.min(100, (cat.actual / cat.budgeted) * 100) : 0;

              return (
                <div key={i} className="px-4 py-3">
                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{cat.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOver ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : isUnder ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {isOver ? 'Over' : isUnder ? 'Under' : 'Pending'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls}>Budget</label>
                        <input type="number" className={inputCls} value={cat.budgeted || ''} onChange={e => updateCategory(i, 'budgeted', +e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Actual</label>
                        <input type="number" className={inputCls} value={cat.actual || ''} onChange={e => updateCategory(i, 'actual', +e.target.value)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-semibold ${variance < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {variance >= 0 ? '+' : ''}{fmt(variance)}
                      </span>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-3">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name}</div>
                      <div className="mt-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-sky-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        className={inputCls}
                        value={cat.budgeted || ''}
                        onChange={e => updateCategory(i, 'budgeted', +e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        className={inputCls}
                        value={cat.actual || ''}
                        onChange={e => updateCategory(i, 'actual', +e.target.value)}
                      />
                    </div>
                    <div className={`col-span-2 text-sm font-semibold ${variance < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {variance >= 0 ? '+' : ''}{fmt(variance)}
                    </div>
                    <div className="col-span-1">
                      {isOver ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : isUnder ? (
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Minus className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals row */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3 text-sm font-bold text-slate-800 dark:text-slate-200">Total</div>
              <div className="col-span-3 text-sm font-bold text-slate-800 dark:text-slate-200">{fmt(totals.totalBudgeted)}</div>
              <div className="col-span-3 text-sm font-bold text-slate-800 dark:text-slate-200">{fmt(totals.totalActual)}</div>
              <div className={`col-span-2 text-sm font-bold ${totals.remaining < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {totals.remaining >= 0 ? '+' : ''}{fmt(totals.remaining)}
              </div>
              <div className="col-span-1" />
            </div>
            <div className="sm:hidden flex justify-between text-sm font-bold text-slate-800 dark:text-slate-200">
              <span>Total Budgeted: {fmt(totals.totalBudgeted)}</span>
              <span>Spent: {fmt(totals.totalActual)}</span>
            </div>
          </div>
        </div>

        {/* Per-person split */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 border border-sky-200 dark:border-sky-800">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-semibold text-sky-800 dark:text-sky-300">Per-Person Split</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-sky-100 dark:border-sky-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Budget per Person</div>
                <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{fmt(totals.totalBudgeted / people)}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-sky-100 dark:border-sky-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Spent per Person</div>
                <div className={`text-2xl font-black ${totalOver ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                  {fmt(totals.totalActual / people)}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Split equally across {people} {people === 1 ? 'person' : 'people'} — {days} {days === 1 ? 'day' : 'days'} trip
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${totalOver || hasOverBudget ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <PlaneTakeoff className={`w-5 h-5 ${totalOver || hasOverBudget ? 'text-red-500' : 'text-emerald-600'}`} />
              <span className={`text-sm font-semibold ${totalOver || hasOverBudget ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {totalOver ? 'Over Budget' : hasOverBudget ? 'Some Categories Over' : 'On Track'}
              </span>
            </div>
            {totalOver ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                You are <span className="font-bold">{fmt(Math.abs(totals.remaining))}</span> over your total trip budget.
              </p>
            ) : hasOverBudget ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Some categories have exceeded their budget. Review and adjust.
              </p>
            ) : (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                You have <span className="font-bold">{fmt(totals.remaining)}</span> remaining in your trip budget.
              </p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Disclaimer</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Default budget estimates are indicative and based on average travel costs in India. Actual costs may vary significantly based on destination, season, travel class, and personal preferences. This tool is for planning purposes only.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
