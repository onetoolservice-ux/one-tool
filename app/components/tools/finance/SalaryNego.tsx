"use client";
import React, { useState, useMemo } from 'react';
import { Briefcase, TrendingUp, Info, ArrowRight, AlertTriangle } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

function calcTaxNew(income: number): number {
  let tax = 0;
  if (income <= 300000) tax = 0;
  else if (income <= 700000) tax = (income - 300000) * 0.05;
  else if (income <= 1000000) tax = 20000 + (income - 700000) * 0.10;
  else if (income <= 1200000) tax = 50000 + (income - 1000000) * 0.15;
  else if (income <= 1500000) tax = 80000 + (income - 1200000) * 0.20;
  else tax = 140000 + (income - 1500000) * 0.30;
  if (income <= 700000) tax = 0;
  return Math.round(tax * 1.04);
}

function calcInHand(ctc: number, basicPct = 0.4, epf = true): { monthly: number; tax: number; epfDedn: number } {
  const basic = ctc * basicPct;
  const epfDedn = epf ? Math.round(Math.min(basic, 15000 * 12) * 0.12) : 0;
  const grossSalary = ctc - Math.round(Math.min(basic, 15000 * 12) * 0.12) - Math.round(basic * 0.0481); // EPF employer + gratuity
  const taxable = Math.max(0, grossSalary - epfDedn - 75000);
  const tax = calcTaxNew(taxable);
  const inHand = grossSalary - epfDedn - tax;
  return { monthly: Math.round(inHand / 12), tax, epfDedn };
}

export const SalaryNego = () => {
  const [currentCTC, setCurrentCTC] = useState(1200000);
  const [offerCTC, setOfferCTC] = useState(1500000);
  const [hikePct, setHikePct] = useState(25);
  const [mode, setMode] = useState<'offer' | 'hike'>('offer');
  const [basicPct, setBasicPct] = useState(40);
  const [epf, setEpf] = useState(true);

  const effectiveOffer = mode === 'hike' ? Math.round(currentCTC * (1 + hikePct / 100)) : offerCTC;

  const result = useMemo(() => {
    const curr = calcInHand(currentCTC, basicPct / 100, epf);
    const offer = calcInHand(effectiveOffer, basicPct / 100, epf);
    const monthlyDiff = offer.monthly - curr.monthly;
    const annualDiff = monthlyDiff * 12;
    const ctcDiff = effectiveOffer - currentCTC;
    const effectiveHikePct = ((effectiveOffer - currentCTC) / currentCTC) * 100;
    // Tax drag: how much of the CTC hike goes to tax
    const taxDrag = (offer.tax - curr.tax) / ctcDiff * 100;

    return { curr, offer, monthlyDiff, annualDiff, ctcDiff, effectiveHikePct, taxDrag };
  }, [currentCTC, effectiveOffer, basicPct, epf]);

  const counterCTCFor10k = useMemo(() => {
    // Find CTC needed to get ₹10k more per month in-hand
    let ctc = currentCTC;
    for (let i = 0; i < 10000000; i += 10000) {
      const { monthly } = calcInHand(currentCTC + i, basicPct / 100, epf);
      if (monthly >= result.curr.monthly + 10000) return currentCTC + i;
    }
    return null;
  }, [currentCTC, basicPct, epf, result.curr.monthly]);

  const effectiveTakeHomeHikePct = ((result.annualDiff / (result.curr.monthly * 12)) * 100).toFixed(1);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Salary Negotiation Calculator"
        subtitle="See actual take-home impact after tax"
        kpis={[
          { label: 'Monthly Increase', value: fmt(result.monthlyDiff), color: 'success' },
          { label: 'Annual Increase', value: fmt(result.annualDiff), color: 'success' },
          { label: 'CTC Hike %', value: `${result.effectiveHikePct.toFixed(1)}%`, color: 'primary' },
          { label: 'Effective Take-home Hike %', value: `${effectiveTakeHomeHikePct}%`, color: 'primary' },
        ]}
      />

      <div className="p-4 space-y-4">

        {/* Mode */}
        <div className="flex gap-2">
          {(['offer', 'hike'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${mode === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
              {m === 'offer' ? 'I have an offer (enter CTC)' : 'Calculate by hike %'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Salary Details</h2>

            <div className="space-y-1">
              <label className={labelCls}>Current Annual CTC (₹)</label>
              <input type="number" className={inputCls} value={currentCTC} onChange={e => setCurrentCTC(+e.target.value)} />
            </div>

            {mode === 'offer' ? (
              <div className="space-y-1">
                <label className={labelCls}>Offered Annual CTC (₹)</label>
                <input type="number" className={inputCls} value={offerCTC} onChange={e => setOfferCTC(+e.target.value)} />
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className={labelCls}>Hike Percentage</label>
                  <span className="text-sm font-bold text-blue-500">{hikePct}%</span>
                </div>
                <input type="range" min={5} max={100} className="w-full accent-blue-500" value={hikePct} onChange={e => setHikePct(+e.target.value)} />
                <p className="text-xs text-slate-400">Offered CTC: {fmt(effectiveOffer)}</p>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Basic % of CTC</label>
                <span className="text-sm font-bold text-slate-500">{basicPct}%</span>
              </div>
              <input type="range" min={30} max={60} className="w-full accent-blue-500" value={basicPct} onChange={e => setBasicPct(+e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="epf2" checked={epf} onChange={e => setEpf(e.target.checked)} className="accent-blue-500" />
              <label htmlFor="epf2" className="text-sm text-slate-700 dark:text-slate-300">EPF applicable</label>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Uses New Tax Regime (FY 2024-25) with standard deduction ₹75,000.
                Basic salary is set as the configured % of CTC; EPF capped at ₹15,000/month.
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">Current Monthly</div>
                  <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{fmt(result.curr.monthly)}</div>
                  <div className="text-xs text-slate-400">CTC: {fmt(currentCTC)}</div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex-1 text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-slate-500 mb-1">New Monthly</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.offer.monthly)}</div>
                  <div className="text-xs text-slate-400">CTC: {fmt(effectiveOffer)}</div>
                </div>
              </div>

              <div className={`text-center p-4 rounded-xl ${result.monthlyDiff > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                <div className="text-xs text-slate-500 mb-1">Monthly In-hand Increase</div>
                <div className={`text-3xl font-bold ${result.monthlyDiff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  +{fmt(result.monthlyDiff)}
                </div>
                <div className={`text-sm mt-1 ${result.monthlyDiff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {fmt(result.annualDiff)} more per year in-hand
                </div>
              </div>
            </div>

            {/* Tax analysis */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">What happens to your hike</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'CTC increase', value: result.ctcDiff, color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Extra tax paid', value: result.offer.tax - result.curr.tax, color: 'text-red-500' },
                  { label: 'Extra EPF (employee)', value: result.offer.epfDedn - result.curr.epfDedn, color: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Actual take-home increase', value: result.annualDiff, color: 'text-emerald-600 dark:text-emerald-400', bold: true },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 ${row.bold ? 'font-semibold' : ''}`}>
                    <span className="text-slate-500">{row.label}</span>
                    <span className={row.color}>{fmt(row.value)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Tax drag: {result.taxDrag.toFixed(1)}% of your hike goes to income tax
              </div>
            </div>

            {/* Effective metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 mb-1">CTC hike %</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.effectiveHikePct.toFixed(1)}%</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Effective take-home hike</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {effectiveTakeHomeHikePct}%
                </div>
              </div>
            </div>

            {counterCTCFor10k && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex gap-3">
                <TrendingUp className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  To get <strong>₹10,000 more per month</strong> in-hand, you need a CTC of at least{' '}
                  <strong>{fmt(counterCTCFor10k)}</strong> ({(((counterCTCFor10k - currentCTC) / currentCTC) * 100).toFixed(0)}% hike).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Approximate estimate based on New Tax Regime (FY 2024-25) with ₹75,000 standard deduction. Actual in-hand salary depends on your exact CTC break-up, allowances, company EPF policy, and applicable deductions. Use this as a reference for negotiation discussions — consult your employer&apos;s HR for the precise offer structure.
          </p>
        </div>
      </div>
    </div>
  );
};
