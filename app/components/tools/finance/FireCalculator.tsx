"use client";
import React, { useState, useMemo } from 'react';
import { Flame, Target, TrendingUp, Calendar, Info, AlertTriangle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-400 transition-colors w-full';
const sliderCls = 'w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-500';

const FIRE_TYPES = [
  { id: 'lean', label: 'Lean FIRE', multiplier: 20, note: 'Frugal lifestyle, ~5% SWR' },
  { id: 'regular', label: 'FIRE', multiplier: 25, note: 'Standard, 4% SWR' },
  { id: 'fat', label: 'Fat FIRE', multiplier: 33, note: 'Comfortable lifestyle, 3% SWR' },
];

export const FireCalculator = () => {
  const [currentAge, setCurrentAge] = useState(28);
  const [retireAge, setRetireAge] = useState(45);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [currentCorpus, setCurrentCorpus] = useState(500000);
  const [monthlySaving, setMonthlySaving] = useState(30000);
  const [returnRate, setReturnRate] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [fireType, setFireType] = useState<'lean' | 'regular' | 'fat'>('regular');

  const result = useMemo(() => {
    const type = FIRE_TYPES.find(f => f.id === fireType)!;
    const annualExpense = monthlyExpense * 12;
    // inflation-adjusted annual expense at retirement
    const yearsToRetire = retireAge - currentAge;
    const inflatedExpense = annualExpense * Math.pow(1 + inflation / 100, yearsToRetire);
    const fireNumber = inflatedExpense * type.multiplier;

    // real return rate
    const realReturn = (1 + returnRate / 100) / (1 + inflation / 100) - 1;
    const monthlyReal = realReturn / 12;

    // How many months to reach FIRE number
    // FV formula with corpus + monthly saving
    // FV = corpus*(1+r)^n + saving*((1+r)^n - 1)/r = fireNumber
    let months = 0;
    let corpus = currentCorpus;
    const chartData: { year: number; corpus: number; target: number }[] = [];

    for (let m = 0; m <= 600; m++) {
      if (m % 12 === 0) {
        const yr = currentAge + m / 12;
        // target grows with inflation each year
        const yearTarget = annualExpense * Math.pow(1 + inflation / 100, m / 12) * type.multiplier;
        chartData.push({ year: yr, corpus: Math.round(corpus), target: Math.round(yearTarget) });
      }
      if (corpus >= fireNumber && months === 0) months = m;
      corpus = corpus * (1 + returnRate / 100 / 12) + monthlySaving;
      if (months > 0 && m > months + 1) break;
    }

    const fireAge = currentAge + months / 12;
    const yearsEarly = retireAge - fireAge;
    const onTrack = fireAge <= retireAge;

    // corpus at target retire age
    const corpusAtTarget = currentCorpus * Math.pow(1 + returnRate / 100 / 12, yearsToRetire * 12) +
      monthlySaving * (Math.pow(1 + returnRate / 100 / 12, yearsToRetire * 12) - 1) / (returnRate / 100 / 12);

    return { fireNumber, fireAge, months, yearsEarly, onTrack, corpusAtTarget, inflatedExpense, chartData, type };
  }, [currentAge, retireAge, monthlyExpense, currentCorpus, monthlySaving, returnRate, inflation, fireType]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="FIRE Calculator"
        subtitle={`${result.type.label} · ${result.type.multiplier}x multiplier`}
        kpis={[
          {
            label: 'FIRE Number',
            value: fmtCr(result.fireNumber),
            color: 'warning',
            subtitle: `${result.type.multiplier}x annual expenses`,
          },
          {
            label: 'FIRE Age',
            value: `${result.fireAge.toFixed(1)} yrs`,
            color: result.onTrack ? 'success' : 'error',
            subtitle: result.onTrack
              ? `${result.yearsEarly.toFixed(1)} yrs early`
              : `${Math.abs(result.yearsEarly).toFixed(1)} yrs behind`,
          },
          {
            label: `Corpus at ${retireAge}`,
            value: fmtCr(result.corpusAtTarget),
            color: 'primary',
            subtitle: 'If you retire at target age',
          },
          {
            label: 'Monthly Need at Retirement',
            value: fmt(result.inflatedExpense / 12),
            color: 'neutral',
            subtitle: `Inflation-adjusted (${inflation}% p.a.)`,
          },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* FIRE Type */}
        <div className="flex gap-2">
          {FIRE_TYPES.map(f => (
            <button key={f.id} onClick={() => setFireType(f.id as 'lean' | 'regular' | 'fat')}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${fireType === f.id
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}>
              {f.label}
              <span className="block text-[10px] font-normal opacity-70">{f.note}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Inputs */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Your Numbers</h2>

            <div className="space-y-1">
              <label className={labelCls}>Current Age</label>
              <input type="number" className={inputCls} value={currentAge} min={18} max={60}
                onChange={e => setCurrentAge(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Target Retire Age</label>
              <input type="number" className={inputCls} value={retireAge} min={currentAge + 1} max={80}
                onChange={e => setRetireAge(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Monthly Expenses (₹)</label>
              <input type="number" className={inputCls} value={monthlyExpense}
                onChange={e => setMonthlyExpense(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Current Corpus (₹)</label>
              <input type="number" className={inputCls} value={currentCorpus}
                onChange={e => setCurrentCorpus(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Monthly Saving (₹)</label>
              <input type="number" className={inputCls} value={monthlySaving}
                onChange={e => setMonthlySaving(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Expected Return</label>
                <span className="text-sm font-bold text-orange-500">{returnRate}%</span>
              </div>
              <input type="range" className={sliderCls} min={6} max={20} step={0.5}
                value={returnRate} onChange={e => setReturnRate(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Inflation Rate</label>
                <span className="text-sm font-bold text-slate-500">{inflation}%</span>
              </div>
              <input type="range" className={sliderCls} min={2} max={10} step={0.5}
                value={inflation} onChange={e => setInflation(+e.target.value)} />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-slate-500">Your FIRE Number</span>
                </div>
                <div className="text-2xl font-bold text-orange-500">{fmtCr(result.fireNumber)}</div>
                <div className="text-xs text-slate-400 mt-1">{result.type.multiplier}x annual expenses at retirement</div>
              </div>
              <div className={`rounded-xl p-4 border ${result.onTrack ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Flame className={`w-4 h-4 ${result.onTrack ? 'text-emerald-500' : 'text-red-500'}`} />
                  <span className="text-xs text-slate-500">FIRE Age</span>
                </div>
                <div className={`text-2xl font-bold ${result.onTrack ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {result.fireAge.toFixed(1)} yrs
                </div>
                <div className={`text-xs mt-1 ${result.onTrack ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {result.onTrack
                    ? `${result.yearsEarly.toFixed(1)} years early!`
                    : `${Math.abs(result.yearsEarly).toFixed(1)} years behind target`}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-slate-500">Corpus at {retireAge}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmtCr(result.corpusAtTarget)}</div>
                <div className="text-xs text-slate-400 mt-1">If you retire at target age</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-slate-500">Monthly Need at Retirement</span>
                </div>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{fmt(result.inflatedExpense / 12)}</div>
                <div className="text-xs text-slate-400 mt-1">Inflation-adjusted ({inflation}% p.a.)</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Corpus Growth vs FIRE Target</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmtCr(v)} width={60} />
                  <Tooltip formatter={(v: number) => fmtCr(v)} labelFormatter={l => `Age ${l}`} />
                  <ReferenceLine x={result.fireAge} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'FIRE', fill: '#10b981', fontSize: 11 }} />
                  <Area type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" fill="none" name="FIRE Target" />
                  <Area type="monotone" dataKey="corpus" stroke="#f97316" fill="url(#corpusGrad)" name="Your Corpus" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Insight */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800 flex gap-3">
              <Info className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <p className="text-sm text-orange-700 dark:text-orange-300">
                At <strong>{result.type.label}</strong> ({result.type.multiplier}x multiplier), you need <strong>{fmtCr(result.fireNumber)}</strong> to retire.
                Your corpus will cross this at age <strong>{result.fireAge.toFixed(1)}</strong>.
                Safe Withdrawal Rate (SWR): <strong>{(100 / result.type.multiplier).toFixed(1)}%</strong> annually.
              </p>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Projections assume a constant monthly investment and fixed annual return rate. Actual market returns are variable and not guaranteed. The Safe Withdrawal Rate (SWR) is a widely-used guideline, not a guarantee of corpus sustainability across all market conditions. This calculator is illustrative only — consult a SEBI-registered investment advisor for personalised retirement planning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
