"use client";
import React, { useState, useMemo } from 'react';
import { IndianRupee, TrendingDown, CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';

// ── OLD REGIME SLABS (FY 2024-25) ─────────────────────────────────────────────
function calcOldRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 250000) return 0;
  let tax = 0;
  if (taxableIncome > 1000000) { tax += (taxableIncome - 1000000) * 0.30; taxableIncome = 1000000; }
  if (taxableIncome > 500000) { tax += (taxableIncome - 500000) * 0.20; taxableIncome = 500000; }
  if (taxableIncome > 250000) { tax += (taxableIncome - 250000) * 0.05; }
  return tax;
}

// ── NEW REGIME SLABS (FY 2024-25, Budget 2024 revised) ───────────────────────
function calcNewRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 300000) return 0;
  let tax = 0;
  const slabs = [
    { from: 300001, to: 700000, rate: 0.05 },
    { from: 700001, to: 1000000, rate: 0.10 },
    { from: 1000001, to: 1200000, rate: 0.15 },
    { from: 1200001, to: 1500000, rate: 0.20 },
    { from: 1500001, to: Infinity, rate: 0.30 },
  ];
  for (const s of slabs) {
    if (taxableIncome > s.from - 1) {
      tax += (Math.min(taxableIncome, s.to) - (s.from - 1)) * s.rate;
    }
  }
  return tax;
}

function surcharge(tax: number, grossIncome: number): number {
  if (grossIncome > 50000000) return tax * 0.37;
  if (grossIncome > 20000000) return tax * 0.25;
  if (grossIncome > 10000000) return tax * 0.15;
  if (grossIncome > 5000000) return tax * 0.10;
  return 0;
}

function calcTotal(baseTax: number, grossIncome: number, rebate87A: boolean): number {
  const rebate = rebate87A ? Math.min(baseTax, 12500) : 0;
  const taxAfterRebate = Math.max(0, baseTax - rebate);
  const sc = surcharge(taxAfterRebate, grossIncome);
  const cess = (taxAfterRebate + sc) * 0.04;
  return taxAfterRebate + sc + cess;
}

function calcNewTotal(baseTax: number, grossIncome: number, rebate87A: boolean): number {
  // New regime 87A rebate: up to ₹25,000 if income ≤ ₹7L
  const rebate = rebate87A ? Math.min(baseTax, 25000) : 0;
  const taxAfterRebate = Math.max(0, baseTax - rebate);
  const sc = surcharge(taxAfterRebate, grossIncome);
  const cess = (taxAfterRebate + sc) * 0.04;
  return taxAfterRebate + sc + cess;
}

interface Section {
  label: string;
  value: number;
  max?: number;
  key: string;
  hint?: string;
}

export const IncomeTaxCalc = () => {
  // Income
  const [salary, setSalary] = useState(1200000);
  const [otherIncome, setOtherIncome] = useState(0);
  const [rentalIncome, setRentalIncome] = useState(0);
  const [capitalGains, setCapitalGains] = useState(0);

  // Old regime deductions
  const [sec80C, setSec80C] = useState(150000);
  const [sec80D, setSec80D] = useState(25000);
  const [sec80CCD1B, setSec80CCD1B] = useState(50000);
  const [hra, setHra] = useState(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [sec80TTA, setSec80TTA] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const [showDeductions, setShowDeductions] = useState(true);
  const [fy, setFy] = useState('2024-25');

  const result = useMemo(() => {
    const grossIncome = salary + otherIncome + rentalIncome + capitalGains;

    // ─── OLD REGIME ───
    const stdDeduction = Math.min(salary, 50000); // Standard deduction ₹50k
    const oldDeductions = Math.min(sec80C, 150000) + Math.min(sec80D, 25000) +
      Math.min(sec80CCD1B, 50000) + Math.min(hra, salary * 0.5) +
      Math.min(homeLoanInterest, 200000) + Math.min(sec80TTA, 10000) +
      otherDeductions + stdDeduction;
    const oldTaxableIncome = Math.max(0, grossIncome - oldDeductions);
    const oldBaseTax = calcOldRegimeTax(oldTaxableIncome);
    const oldRebate = oldTaxableIncome <= 500000;
    const oldTotal = calcTotal(oldBaseTax, grossIncome, oldRebate);

    // ─── NEW REGIME ───
    const newStdDeduction = Math.min(salary, 75000); // New regime std deduction ₹75k (Budget 2024)
    const newTaxableIncome = Math.max(0, grossIncome - newStdDeduction);
    const newBaseTax = calcNewRegimeTax(newTaxableIncome);
    const newRebate = newTaxableIncome <= 700000;
    const newTotal = calcNewTotal(newBaseTax, grossIncome, newRebate);

    const savings = oldTotal - newTotal;
    const recommended = newTotal <= oldTotal ? 'new' : 'old';

    // effective rates
    const oldEffectiveRate = grossIncome > 0 ? (oldTotal / grossIncome) * 100 : 0;
    const newEffectiveRate = grossIncome > 0 ? (newTotal / grossIncome) * 100 : 0;

    return {
      grossIncome,
      oldTaxableIncome,
      newTaxableIncome,
      oldDeductions,
      oldTotal,
      newTotal,
      savings: Math.abs(savings),
      recommended,
      oldEffectiveRate,
      newEffectiveRate,
      oldBaseTax,
      newBaseTax,
    };
  }, [salary, otherIncome, rentalIncome, capitalGains, sec80C, sec80D, sec80CCD1B, hra, homeLoanInterest, sec80TTA, otherDeductions]);

  const deductionSections: Section[] = [
    { label: 'Sec 80C (ELSS/PPF/EPF/LIC)', key: '80c', value: sec80C, max: 150000, hint: 'Max ₹1.5L' },
    { label: 'Sec 80D (Health Insurance)', key: '80d', value: sec80D, max: 25000, hint: 'Max ₹25K (₹50K senior)' },
    { label: 'Sec 80CCD(1B) — NPS', key: 'nps', value: sec80CCD1B, max: 50000, hint: 'Extra ₹50K over 80C' },
    { label: 'HRA Exemption', key: 'hra', value: hra, hint: 'Auto-limited to 50% of salary' },
    { label: 'Home Loan Interest (24b)', key: 'hli', value: homeLoanInterest, max: 200000, hint: 'Max ₹2L for self-occupied' },
    { label: 'Sec 80TTA (Savings Interest)', key: 'tta', value: sec80TTA, max: 10000, hint: 'Max ₹10K' },
    { label: 'Other Deductions', key: 'other', value: otherDeductions, hint: '80E, 80G, 80GG, etc.' },
  ];

  const setterMap: Record<string, (v: number) => void> = {
    '80c': setSec80C, '80d': setSec80D, 'nps': setSec80CCD1B,
    'hra': setHra, 'hli': setHomeLoanInterest, 'tta': setSec80TTA, 'other': setOtherDeductions,
  };

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Income Tax Calculator"
        subtitle={`FY ${fy} · Old vs New Regime`}
        kpis={[
          { label: 'Gross Income', value: fmtL(result.grossIncome), color: 'neutral', subtitle: 'All sources' },
          { label: 'Old Regime Tax', value: fmtL(result.oldTotal), color: 'error', subtitle: `${result.oldEffectiveRate.toFixed(1)}% effective rate` },
          { label: 'New Regime Tax', value: fmtL(result.newTotal), color: result.recommended === 'new' ? 'success' : 'warning', subtitle: `${result.newEffectiveRate.toFixed(1)}% effective rate` },
          { label: 'You Save', value: fmtL(result.savings), color: 'success', subtitle: `Go with ${result.recommended === 'new' ? 'New' : 'Old'} Regime` },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* FY Selector */}
        <div className="flex gap-2">
          {['2024-25', '2025-26'].map(f => (
            <button key={f} onClick={() => setFy(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${fy === f ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
              FY {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Inputs */}
          <div className="lg:col-span-1 space-y-4">
            {/* Income */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-blue-500" /> Income Sources
              </h2>
              {[
                { label: 'Gross Salary / CTC', value: salary, setter: setSalary },
                { label: 'Other Income (FD interest, etc.)', value: otherIncome, setter: setOtherIncome },
                { label: 'Rental Income', value: rentalIncome, setter: setRentalIncome },
                { label: 'Capital Gains', value: capitalGains, setter: setCapitalGains },
              ].map(({ label, value, setter }) => (
                <div key={label} className="space-y-1">
                  <label className={labelCls}>{label}</label>
                  <input type="number" className={inputCls} value={value} onChange={e => setter(+e.target.value)} />
                </div>
              ))}
            </div>

            {/* Old Regime Deductions */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button onClick={() => setShowDeductions(!showDeductions)}
                className="w-full flex items-center justify-between p-4 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  Old Regime Deductions
                </span>
                {showDeductions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showDeductions && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-slate-400 dark:text-slate-500">Not applicable in New Regime (except std deduction)</p>
                  {deductionSections.map(s => (
                    <div key={s.key} className="space-y-1">
                      <div className="flex justify-between">
                        <label className={labelCls}>{s.label}</label>
                        {s.hint && <span className="text-[10px] text-slate-400">{s.hint}</span>}
                      </div>
                      <input type="number" className={inputCls} value={s.value}
                        onChange={e => setterMap[s.key](+e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Regime Comparison Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Old Regime */}
              <div className={`rounded-xl p-4 border-2 ${result.recommended === 'old' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Old Regime</h3>
                  {result.recommended === 'old' && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">Recommended</span>}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Income</span>
                    <span className="font-medium">{fmtL(result.grossIncome)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Total Deductions</span>
                    <span className="font-medium">−{fmtL(result.oldDeductions)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2">
                    <span className="text-slate-500">Taxable Income</span>
                    <span className="font-medium">{fmtL(result.oldTaxableIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Std Deduction</span>
                    <span className="font-medium text-emerald-600">₹50,000</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2 text-base font-bold text-red-600 dark:text-red-400">
                    <span>Total Tax</span>
                    <span>{fmtL(result.oldTotal)}</span>
                  </div>
                  <div className="text-xs text-slate-400 text-right">Incl. surcharge + 4% cess</div>
                </div>
              </div>

              {/* New Regime */}
              <div className={`rounded-xl p-4 border-2 ${result.recommended === 'new' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Regime</h3>
                  {result.recommended === 'new' && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">Recommended</span>}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Income</span>
                    <span className="font-medium">{fmtL(result.grossIncome)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Std Deduction</span>
                    <span className="font-medium">−₹75,000</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2">
                    <span className="text-slate-500">Taxable Income</span>
                    <span className="font-medium">{fmtL(result.newTaxableIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">87A Rebate</span>
                    <span className="font-medium text-emerald-600">{result.newTaxableIncome <= 700000 ? 'Applied (≤₹7L)' : 'Not applicable'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2 text-base font-bold text-red-600 dark:text-red-400">
                    <span>Total Tax</span>
                    <span>{fmtL(result.newTotal)}</span>
                  </div>
                  <div className="text-xs text-slate-400 text-right">Incl. surcharge + 4% cess</div>
                </div>
              </div>
            </div>

            {/* Slab Reference */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">New Regime Slabs (FY 2024-25)</h3>
              <div className="space-y-1">
                {[
                  { range: 'Up to ₹3 L', rate: 'Nil' },
                  { range: '₹3L – ₹7L', rate: '5%' },
                  { range: '₹7L – ₹10L', rate: '10%' },
                  { range: '₹10L – ₹12L', rate: '15%' },
                  { range: '₹12L – ₹15L', rate: '20%' },
                  { range: 'Above ₹15L', rate: '30%' },
                ].map(({ range, rate }) => (
                  <div key={range} className="flex justify-between text-sm py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">{range}</span>
                    <span className={`font-semibold ${rate === 'Nil' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{rate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className={`rounded-xl p-4 border flex gap-3 ${result.recommended === 'new' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${result.recommended === 'new' ? 'text-blue-500' : 'text-amber-500'}`} />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  {result.recommended === 'new' ? 'New Regime saves you more' : 'Old Regime saves you more'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  You save <strong>{fmtL(result.savings)}</strong> by choosing the{' '}
                  <strong>{result.recommended === 'new' ? 'New' : 'Old'} Regime</strong>.{' '}
                  {result.recommended === 'new'
                    ? 'New regime has lower rates and simpler filing — ideal if your deductions are limited.'
                    : 'Your deductions under old regime exceed the benefit of lower new regime rates.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Disclaimer: This is an indicative calculator for FY 2024-25. Capital gains are shown as regular income for simplicity — actual STCG/LTCG rates vary. Consult a CA or tax professional for accurate ITR filing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
