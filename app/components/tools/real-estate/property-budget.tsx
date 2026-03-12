"use client";
import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { AlertTriangle, Info } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (Math.abs(n) >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L';
  return fmt(n);
};

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

function reverseEMI(emi: number, rate: number, months: number): number {
  if (rate === 0) return emi * months;
  const r = rate / 100 / 12;
  return emi * ((1 - Math.pow(1 + r, -months)) / r);
}

export function PropertyBudget() {
  const [income, setIncome] = useState(120000);
  const [emiPct, setEmiPct] = useState(40);
  const [existingEmi, setExistingEmi] = useState(0);
  const [downPayment, setDownPayment] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [stampDutyPct, setStampDutyPct] = useState(6);

  const result = useMemo(() => {
    const maxEmi = income * (emiPct / 100) - existingEmi;
    const months = tenure * 12;
    const maxLoan = maxEmi > 0 ? reverseEMI(maxEmi, rate, months) : 0;
    const totalBudget = maxLoan + downPayment;
    // Stamp duty is on property value, so: property + stamp = totalBudget
    // property × (1 + stampPct/100) = totalBudget  => property = totalBudget / (1 + stampPct/100)
    const affordableProperty = totalBudget / (1 + stampDutyPct / 100);
    const stampDutyCost = affordableProperty * (stampDutyPct / 100);

    const scenarios = [30, 40, 50].map((pct) => {
      const emi = income * (pct / 100) - existingEmi;
      const loan = emi > 0 ? reverseEMI(emi, rate, months) : 0;
      const budget = loan + downPayment;
      const property = budget / (1 + stampDutyPct / 100);
      return { pct, emi: Math.max(0, emi), property: Math.max(0, property) };
    });

    return { maxEmi: Math.max(0, maxEmi), maxLoan: Math.max(0, maxLoan), affordableProperty: Math.max(0, affordableProperty), stampDutyCost, scenarios };
  }, [income, emiPct, existingEmi, downPayment, rate, tenure, stampDutyPct]);

  const kpis = [
    { label: 'Max EMI Available', value: fmt(result.maxEmi), color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Max Loan Eligible', value: fmtL(result.maxLoan), color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Affordable Property', value: fmtL(result.affordableProperty), color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Down Payment', value: fmtL(downPayment), color: 'text-slate-600 dark:text-slate-400' },
  ];

  const emiBarWidth = Math.min(100, emiPct);
  const existingBarWidth = Math.min(100, (existingEmi / income) * 100);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Property Affordability"
        subtitle="How much property can you realistically afford?"
        kpis={kpis}
      />
      <div className="p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Your Financial Profile</p>
            <div className="space-y-3">
              <div>
                <p className={labelCls + ' mb-1'}>Monthly Take-home Income (₹)</p>
                <input type="number" className={inputCls} value={income} onChange={(e) => setIncome(Number(e.target.value))} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className={labelCls}>EMI Budget (% of income)</p>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{emiPct}%</span>
                </div>
                <input type="range" min="20" max="60" value={emiPct} onChange={(e) => setEmiPct(Number(e.target.value))}
                  className="w-full accent-indigo-500" />
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  <span>20%</span><span>40% (recommended)</span><span>60%</span>
                </div>
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Existing EMIs / month (₹)</p>
                <input type="number" className={inputCls} value={existingEmi} onChange={(e) => setExistingEmi(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Down Payment Savings (₹)</p>
                <input type="number" className={inputCls} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Loan & Market Parameters</p>
            <div className="space-y-3">
              <div>
                <p className={labelCls + ' mb-1'}>Home Loan Interest Rate (%)</p>
                <input type="number" step="0.1" className={inputCls} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Loan Tenure (years)</p>
                <input type="number" className={inputCls} value={tenure} min="5" max="30" onChange={(e) => setTenure(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Stamp Duty + Registration (%)</p>
                <input type="number" step="0.5" className={inputCls} value={stampDutyPct} onChange={(e) => setStampDutyPct(Number(e.target.value))} />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Varies by state — Maharashtra ~6%, Delhi ~7%, Karnataka ~6%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Income vs EMI visual */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Income Allocation</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Home Loan EMI Budget</span>
                <span>{fmt(result.maxEmi + existingEmi)} / {fmt(income)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                <div className="h-3 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, emiPct)}%` }} />
              </div>
            </div>
            {existingEmi > 0 && (
              <div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Existing EMIs (deducted from budget)</span>
                  <span>{fmt(existingEmi)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                  <div className="h-3 rounded-full bg-red-400" style={{ width: `${existingBarWidth}%` }} />
                </div>
              </div>
            )}
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Available Home Loan EMI</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{fmt(result.maxEmi)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (result.maxEmi / income) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Affordability Breakdown */}
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
          <p className={labelCls + ' mb-3 text-indigo-600 dark:text-indigo-400'}>Affordability Breakdown</p>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Max Loan (based on EMI)', value: fmtL(result.maxLoan), color: 'text-indigo-600 dark:text-indigo-400' },
              { label: '+ Down Payment', value: fmtL(downPayment), color: 'text-blue-600 dark:text-blue-400' },
              { label: '= Total Purchase Budget', value: fmtL(result.maxLoan + downPayment), color: 'text-slate-800 dark:text-slate-200', bold: true },
              { label: `- Stamp Duty & Registration (${stampDutyPct}%)`, value: fmtL(result.stampDutyCost), color: 'text-red-600 dark:text-red-400' },
              { label: 'Affordable Property Value', value: fmtL(result.affordableProperty), color: 'text-emerald-600 dark:text-emerald-400', bold: true },
            ].map(({ label, value, color, bold }) => (
              <div key={label} className={`flex justify-between ${bold ? 'border-t border-indigo-200 dark:border-indigo-700 pt-2 font-semibold' : ''}`}>
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className={color}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What-if Scenarios */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-500" />
            <p className={labelCls}>What If? — Different EMI Ratios</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {result.scenarios.map(({ pct, emi, property }) => (
              <div key={pct} className={`p-3 rounded-lg border text-center ${pct === emiPct ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{pct}% of income</p>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{fmtL(property)}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">EMI {fmt(emi)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> This is an indicative estimate. Actual loan eligibility depends on credit score, employer category, existing obligations, and lender policies. Stamp duty rates are approximate and vary by state, property type, and agreement value. Consult a financial advisor and your bank before making a property purchase decision.
          </p>
        </div>
      </div>
    </div>
  );
}
