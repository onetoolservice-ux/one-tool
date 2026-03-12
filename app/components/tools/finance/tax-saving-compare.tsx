"use client";
import React, { useState, useMemo } from 'react';
import { Scale, Info, Trophy, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-violet-400 transition-colors w-full';

const SCHEMES = [
  {
    id: 'nps',
    name: 'NPS Tier 1',
    color: '#6366f1',
    lockIn: '60 years (partial after 3yr)',
    taxBenefit: '₹2L/yr (80C + 80CCD1B)',
    onExit: '60% lump sum tax-free, 40% annuity (taxable)',
    returns: 10,
    taxFree: true,
    annuityRatio: 0.4,
  },
  {
    id: 'ppf',
    name: 'PPF',
    color: '#10b981',
    lockIn: '15 years (partial after 7yr)',
    taxBenefit: '₹1.5L/yr (80C)',
    onExit: 'Fully tax-free (EEE)',
    returns: 7.1,
    taxFree: true,
    annuityRatio: 0,
  },
  {
    id: 'elss',
    name: 'ELSS Mutual Fund',
    color: '#f59e0b',
    lockIn: '3 years',
    taxBenefit: '₹1.5L/yr (80C)',
    onExit: 'LTCG 12.5% (₹1.25L exempt)',
    returns: 14,
    taxFree: false,
    annuityRatio: 0,
  },
];

function calcCorpus(monthly: number, rate: number, years: number): number {
  const r = rate / 100 / 12;
  const n = years * 12;
  return monthly * (Math.pow(1 + r, n) - 1) / r;
}

export const TaxSavingCompare = () => {
  const [monthly, setMonthly] = useState(12500); // ₹1.5L/yr = ₹12,500/mo
  const [years, setYears] = useState(20);
  const [taxBracket, setTaxBracket] = useState(30);

  const results = useMemo(() => {
    return SCHEMES.map(s => {
      const invested = monthly * 12 * years;
      const corpus = calcCorpus(monthly, s.returns, years);
      const gains = corpus - invested;

      // Annual tax saved (80C / NPS)
      const annual80C = Math.min(monthly * 12, 150000);
      const taxSavedPerYear = annual80C * (taxBracket / 100);
      const totalTaxSaved = taxSavedPerYear * years + (s.id === 'nps' ? 50000 * (taxBracket / 100) * years : 0);

      // Post-tax corpus
      let postTaxCorpus = corpus;
      if (s.id === 'elss') {
        const taxableGain = Math.max(0, gains - 125000);
        const tax = taxableGain * 0.125;
        postTaxCorpus = corpus - tax;
      } else if (s.id === 'nps') {
        // 40% goes to annuity (taxable), 60% lump sum tax-free
        const annuity = corpus * s.annuityRatio;
        const lumpsum = corpus * 0.6;
        postTaxCorpus = lumpsum + annuity * 0.6; // rough: annuity taxed at ~30%
      }

      return { ...s, invested, corpus, gains, postTaxCorpus, totalTaxSaved };
    });
  }, [monthly, years, taxBracket]);

  const best = results.reduce((prev, curr) => curr.postTaxCorpus > prev.postTaxCorpus ? curr : prev);

  const chartData = Array.from({ length: Math.min(years, 20) }, (_, i) => {
    const yr = i + 1;
    const row: Record<string, number | string> = { year: `${yr}yr` };
    SCHEMES.forEach(s => {
      row[s.name] = Math.round(calcCorpus(monthly, s.returns, yr));
    });
    return row;
  });

  return (
    <div>
      <SAPHeader
        fullWidth
        title="NPS vs PPF vs ELSS"
        subtitle="80C tax-saving instruments compared side by side"
        kpis={[
          { label: 'Best Instrument', value: best.name, color: 'success' },
          { label: 'Monthly Investment', value: fmt(monthly), color: 'neutral' },
          { label: 'Period', value: `${years} yrs`, color: 'neutral' },
          { label: 'Tax Bracket', value: `${taxBracket}%`, color: 'neutral' },
        ]}
      />

      <div className="p-4 space-y-4">

        {/* Inputs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>Monthly Investment (₹)</label>
              <input type="number" className={inputCls} value={monthly} onChange={e => setMonthly(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Investment Period</label>
                <span className="text-sm font-bold text-violet-500">{years} yrs</span>
              </div>
              <input type="range" min={5} max={40} className="w-full accent-violet-500" value={years} onChange={e => setYears(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Income Tax Bracket</label>
              <div className="flex gap-2">
                {[10, 20, 30].map(r => (
                  <button key={r} onClick={() => setTaxBracket(r)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${taxBracket === r ? 'bg-violet-500 text-white border-violet-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scheme cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((s) => (
            <div key={s.id} className={`bg-white dark:bg-slate-900 rounded-xl p-5 border-2 transition-all ${s.id === best.id ? 'border-emerald-400 dark:border-emerald-500' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                </div>
                {s.id === best.id && (
                  <div className="flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    <Trophy className="w-3 h-3" /> Best
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Corpus</span>
                  <span className="font-bold" style={{ color: s.color }}>{fmtCr(s.corpus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Post-tax Corpus</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{fmtCr(s.postTaxCorpus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax Saved (total)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtCr(s.totalTaxSaved)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expected Returns</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{s.returns}% p.a.</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-start gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold min-w-[50px]">Lock-in:</span>
                  <span>{s.lockIn}</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold min-w-[50px]">80C:</span>
                  <span>{s.taxBenefit}</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold min-w-[50px]">Exit:</span>
                  <span>{s.onExit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Corpus Growth Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmtCr(v)} width={60} />
              <Tooltip formatter={(v: number) => fmtCr(v)} />
              <Legend />
              {SCHEMES.map(s => (
                <Bar key={s.id} dataKey={s.name} fill={s.color} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex gap-3">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Key facts:</span> NPS returns (~10%) assume a blended equity+debt portfolio — actual returns are market-linked. PPF rate (currently 7.1%) is set by the Government quarterly. ELSS historical average (~14%) is not guaranteed. NPS offers the highest tax benefit (up to ₹2L/yr) but locks in until age 60 with mandatory annuity on 40% corpus.
          </p>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Returns shown are indicative and based on historical/assumed rates — future returns are not guaranteed. This comparison is for educational purposes only and does not constitute investment advice. Tax benefit calculations are based on FY 2024-25 rules. Consult a SEBI-registered financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
