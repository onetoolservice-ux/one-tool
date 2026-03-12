"use client";
import React, { useState, useMemo } from 'react';
import { Briefcase, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';
const sliderCls = 'w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500';

type AllocationPreset = 'aggressive' | 'moderate' | 'conservative';

const PRESETS: Record<AllocationPreset, { equity: number; debt: number; label: string; expectedReturn: number }> = {
  aggressive: { equity: 75, debt: 25, label: 'Aggressive (E: 75%)', expectedReturn: 11 },
  moderate: { equity: 50, debt: 50, label: 'Moderate (E: 50%)', expectedReturn: 9.5 },
  conservative: { equity: 25, debt: 75, label: 'Conservative (E: 25%)', expectedReturn: 8 },
};

export const NPSCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [monthlyContrib, setMonthlyContrib] = useState(5000);
  const [employerContrib, setEmployerContrib] = useState(0);
  const [currentCorpus, setCurrentCorpus] = useState(0);
  const [allocation, setAllocation] = useState<AllocationPreset>('moderate');
  const [annuityPct, setAnnuityPct] = useState(40);
  const [annuityRate, setAnnuityRate] = useState(6);
  const [retireAge] = useState(60);

  const result = useMemo(() => {
    const years = retireAge - currentAge;
    const r = PRESETS[allocation].expectedReturn / 100 / 12;
    const totalMonthly = monthlyContrib + employerContrib;
    const months = years * 12;

    // FV of existing corpus + monthly SIP
    const fvCorpus = currentCorpus * Math.pow(1 + r, months);
    const fvSIP = totalMonthly * (Math.pow(1 + r, months) - 1) / r;
    const totalCorpus = fvCorpus + fvSIP;

    // Lump sum (60%) and annuity (40% min)
    const actualAnnuityPct = Math.max(annuityPct, 40);
    const lumpsum = totalCorpus * (1 - actualAnnuityPct / 100);
    const annuityCorpus = totalCorpus * (actualAnnuityPct / 100);
    const monthlyPension = (annuityCorpus * (annuityRate / 100)) / 12;

    const totalInvested = (totalMonthly * months) + currentCorpus;
    const totalInterest = totalCorpus - totalInvested;

    // Chart data
    const chartData: { year: number; corpus: number }[] = [];
    for (let y = 0; y <= years; y++) {
      const m = y * 12;
      const cv = currentCorpus * Math.pow(1 + r, m) + (m > 0 ? totalMonthly * (Math.pow(1 + r, m) - 1) / r : 0);
      chartData.push({ year: currentAge + y, corpus: Math.round(cv) });
    }

    // Tax benefit
    const annualContrib = monthlyContrib * 12;
    const sec80CCD1 = Math.min(annualContrib, 150000); // within 80C
    const sec80CCD1B = Math.min(annualContrib, 50000); // extra 50k
    const employerBenefit = Math.min(employerContrib * 12, 0.1 * (monthlyContrib * 12 * 10)); // 10% of basic

    return {
      totalCorpus,
      lumpsum,
      annuityCorpus,
      monthlyPension,
      totalInvested,
      totalInterest,
      chartData,
      years,
      sec80CCD1,
      sec80CCD1B,
      employerBenefit,
    };
  }, [currentAge, monthlyContrib, employerContrib, currentCorpus, allocation, annuityPct, annuityRate, retireAge]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="NPS Calculator"
        subtitle={`Tier 1 · ${PRESETS[allocation].label} · Retire at ${retireAge}`}
        kpis={[
          { label: 'NPS Corpus at 60', value: fmtL(result.totalCorpus), color: 'primary', subtitle: `Over ${result.years} years` },
          { label: 'Lump Sum (Tax-Free)', value: fmtL(result.lumpsum), color: 'success', subtitle: `${100 - Math.max(annuityPct, 40)}% of corpus` },
          { label: 'Monthly Pension', value: fmt(result.monthlyPension), color: 'warning', subtitle: `${annuityRate}% annuity rate` },
          { label: 'Tax Benefit/yr', value: fmtL(result.sec80CCD1B), color: 'neutral', subtitle: 'Extra 80CCD(1B) ₹50K' },
        ]}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inputs */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" /> NPS Parameters
            </h2>

            <div className="space-y-1">
              <label className={labelCls}>Current Age</label>
              <input type="number" className={inputCls} value={currentAge} min={18} max={59}
                onChange={e => setCurrentAge(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Monthly Contribution (₹)</label>
              <input type="number" className={inputCls} value={monthlyContrib}
                onChange={e => setMonthlyContrib(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Employer Contribution (₹/mo)</label>
              <input type="number" className={inputCls} value={employerContrib}
                onChange={e => setEmployerContrib(+e.target.value)} />
              <p className="text-xs text-slate-400">Deductible under 80CCD(2)</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Current NPS Balance (₹)</label>
              <input type="number" className={inputCls} value={currentCorpus}
                onChange={e => setCurrentCorpus(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Asset Allocation</label>
              {(Object.keys(PRESETS) as AllocationPreset[]).map(key => (
                <button key={key} onClick={() => setAllocation(key)}
                  className={`w-full text-left py-2 px-3 rounded-lg text-sm border mb-1 transition-all ${allocation === key
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                  {PRESETS[key].label}
                  <span className="block text-[10px] opacity-70">~{PRESETS[key].expectedReturn}% expected return</span>
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Annuity % (min 40%)</label>
                <span className="text-sm font-bold text-blue-500">{Math.max(annuityPct, 40)}%</span>
              </div>
              <input type="range" className={sliderCls} min={40} max={100} step={5}
                value={annuityPct} onChange={e => setAnnuityPct(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Annuity Rate</label>
                <span className="text-sm font-bold text-slate-500">{annuityRate}%</span>
              </div>
              <input type="range" className={sliderCls} min={4} max={9} step={0.25}
                value={annuityRate} onChange={e => setAnnuityRate(+e.target.value)} />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Corpus at 60</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{fmtL(result.totalCorpus)}</div>
                <div className="text-xs text-blue-500 mt-1">Interest: {fmtL(result.totalInterest)}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Total Invested</div>
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{fmtL(result.totalInvested)}</div>
                <div className="text-xs text-slate-400 mt-1">{result.years} years</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Lump Sum (60%) — Tax-Free</div>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{fmtL(result.lumpsum)}</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">Monthly Pension (Estimated)</div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{fmt(result.monthlyPension)}</div>
                <div className="text-xs text-amber-500 mt-1">From {fmtL(result.annuityCorpus)} annuity corpus</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Corpus Growth Projection
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="npsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmtL(v)} width={65} />
                  <Tooltip formatter={(v: number) => [fmtL(v), 'Corpus']} labelFormatter={l => `Age ${l}`} />
                  <Area type="monotone" dataKey="corpus" stroke="#3b82f6" fill="url(#npsGrad)" strokeWidth={2} name="NPS Corpus" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Tax Benefits */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> Annual Tax Benefits
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Sec 80C (included in ₹1.5L limit)', value: result.sec80CCD1, hint: 'Employee contribution' },
                  { label: 'Sec 80CCD(1B) — Extra NPS benefit', value: result.sec80CCD1B, hint: 'Additional ₹50K over 80C' },
                  { label: 'Sec 80CCD(2) — Employer contribution', value: employerContrib * 12, hint: '10% of basic (salaried)' },
                ].map(({ label, value, hint }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">{label}</div>
                      <div className="text-xs text-slate-400">{hint}</div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmtL(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                NPS is EET — Exempt on contribution, Exempt on growth, Taxable on pension income (40% annuity is taxable). Lump sum withdrawal (60%) at maturity is tax-free. Returns are market-linked and not guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
