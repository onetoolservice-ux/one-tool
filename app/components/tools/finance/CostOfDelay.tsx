"use client";
import React, { useState, useMemo } from 'react';
import { Clock, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';
const sliderCls = 'w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500';

export const CostOfDelay = () => {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [totalYears, setTotalYears] = useState(20);
  const [delayYears, setDelayYears] = useState(3);

  const result = useMemo(() => {
    const r = rate / 100 / 12;
    const n = totalYears * 12;
    const nd = (totalYears - delayYears) * 12;

    const fvNow = monthly * (Math.pow(1 + r, n) - 1) / r;
    const fvDelayed = monthly * (Math.pow(1 + r, nd) - 1) / r;
    const cost = fvNow - fvDelayed;
    const costPct = (cost / fvNow) * 100;

    // Breakdown by delay scenarios
    const scenarios = [0, 1, 2, 3, 5, 7, 10].filter(d => d <= totalYears - 1).map(d => {
      const ny = (totalYears - d) * 12;
      const fv = monthly * (Math.pow(1 + r, ny) - 1) / r;
      return { delay: d === 0 ? 'Start Now' : `${d}yr delay`, fv: Math.round(fv), d };
    });

    const totalInvested = monthly * n;
    const totalInvestedDelayed = monthly * nd;

    return { fvNow, fvDelayed, cost, costPct, scenarios, totalInvested, totalInvestedDelayed };
  }, [monthly, rate, totalYears, delayYears]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Cost of Delay"
        subtitle="Time in market beats timing the market"
        kpis={[
          {
            label: 'Cost of Delay',
            value: fmtCr(result.cost),
            color: 'error',
            subtitle: `${result.costPct.toFixed(1)}% of potential wealth`,
          },
          {
            label: 'Start-Now Corpus',
            value: fmtCr(result.fvNow),
            color: 'success',
            subtitle: `Invested: ${fmtCr(result.totalInvested)}`,
          },
          {
            label: 'Delayed Corpus',
            value: fmtCr(result.fvDelayed),
            color: 'warning',
            subtitle: `After ${delayYears}yr delay`,
          },
          {
            label: 'Delay Period',
            value: `${delayYears} yr${delayYears > 1 ? 's' : ''}`,
            color: 'neutral',
            subtitle: `At ${rate}% return`,
          },
        ]}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Parameters</h2>

            <div className="space-y-1">
              <label className={labelCls}>Monthly Investment (₹)</label>
              <input type="number" className={inputCls} value={monthly} onChange={e => setMonthly(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Expected Return</label>
                <span className="text-sm font-bold text-blue-500">{rate}%</span>
              </div>
              <input type="range" className={sliderCls} min={6} max={20} step={0.5} value={rate} onChange={e => setRate(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Investment Horizon</label>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{totalYears} yrs</span>
              </div>
              <input type="range" className={sliderCls} min={5} max={40} step={1} value={totalYears} onChange={e => setTotalYears(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Delay Period</label>
                <span className="text-sm font-bold text-red-500">{delayYears} yrs</span>
              </div>
              <input type="range" className={sliderCls} min={1} max={Math.max(totalYears - 1, 1)} step={1} value={delayYears} onChange={e => setDelayYears(+e.target.value)} style={{ accentColor: '#ef4444' }} />
            </div>

            {/* Quick presets */}
            <div className="space-y-1">
              <label className={labelCls}>Quick Delay</label>
              <div className="flex gap-1 flex-wrap">
                {[1, 2, 3, 5].map(d => (
                  <button key={d} onClick={() => setDelayYears(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${delayYears === d ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                    {d}yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Alert */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-red-700 dark:text-red-300">Delaying {delayYears} year{delayYears > 1 ? 's' : ''} will cost you</span>
              </div>
              <div className="text-4xl font-bold text-red-600 dark:text-red-400">{fmtCr(result.cost)}</div>
              <div className="text-sm text-red-500 dark:text-red-400 mt-1">{result.costPct.toFixed(1)}% of your potential wealth — gone due to delay</div>
            </div>

            {/* Comparison cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-slate-500">Start Now → {totalYears}yr corpus</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmtCr(result.fvNow)}</div>
                <div className="text-xs text-slate-400 mt-1">Invested: {fmtCr(result.totalInvested)}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-slate-500">After {delayYears}yr delay → corpus</span>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{fmtCr(result.fvDelayed)}</div>
                <div className="text-xs text-slate-400 mt-1">Invested: {fmtCr(result.totalInvestedDelayed)}</div>
              </div>
            </div>

            {/* Chart — all delay scenarios */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Corpus vs Delay Duration</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.scenarios} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="delay" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmtCr(v)} width={60} />
                  <Tooltip formatter={(v: number) => fmtCr(v)} />
                  <Bar dataKey="fv" name="Final Corpus" radius={[4, 4, 0, 0]}>
                    {result.scenarios.map((s, i) => (
                      <Cell key={i} fill={s.d === 0 ? '#10b981' : s.d <= delayYears ? '#ef4444' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Start Now</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Your Delay</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-400 inline-block" /> Longer Delay</span>
              </div>
            </div>

            {/* Insight */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 flex gap-3">
              <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Every year of delay on <strong>{fmt(monthly)}/month</strong> at <strong>{rate}%</strong> costs you roughly{' '}
                <strong>{fmtCr(result.cost / delayYears)}</strong> per year of delay.
                {' '}Time in market beats timing the market.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Projections assume a constant annual return and fixed monthly SIP investment. Actual market returns are variable and not guaranteed. This calculator illustrates the mathematical impact of compounding and is intended for educational purposes — it does not constitute investment advice.
          </p>
        </div>
      </div>
    </div>
  );
};
