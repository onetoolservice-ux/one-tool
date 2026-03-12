"use client";
import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { AlertTriangle, Info } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

function calcTax(taxableIncome: number, regime: 'new' | 'old'): number {
  let tax = 0;
  if (regime === 'new') {
    const slabs = [
      [300000, 0], [400000, 0.05], [300000, 0.10], [200000, 0.15], [300000, 0.20], [Infinity, 0.30],
    ] as [number, number][];
    let rem = taxableIncome;
    for (const [limit, rate] of slabs) {
      if (rem <= 0) break;
      const chunk = Math.min(rem, limit);
      tax += chunk * rate;
      rem -= chunk;
    }
    // Rebate 87A if income <= 12L (new regime) — tax becomes 0
    if (taxableIncome <= 1200000) tax = 0;
    // Marginal relief simplified
  } else {
    const slabs = [
      [250000, 0], [250000, 0.05], [500000, 0.20], [Infinity, 0.30],
    ] as [number, number][];
    let rem = taxableIncome;
    for (const [limit, rate] of slabs) {
      if (rem <= 0) break;
      const chunk = Math.min(rem, limit);
      tax += chunk * rate;
      rem -= chunk;
    }
    // Rebate 87A old regime: if income <= 5L, tax rebate of min(tax, 12500)
    if (taxableIncome <= 500000) tax = Math.max(0, tax - 12500);
  }
  // Cess 4%
  tax = tax * 1.04;
  return Math.round(tax);
}

export function AdvanceTaxCalc() {
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [salary, setSalary] = useState(1200000);
  const [houseProperty, setHouseProperty] = useState(0);
  const [business, setBusiness] = useState(0);
  const [stcg, setStcg] = useState(0);
  const [ltcg, setLtcg] = useState(0);
  const [otherSources, setOtherSources] = useState(50000);
  const [deduction80c, setDeduction80c] = useState(150000);
  const [deduction80d, setDeduction80d] = useState(25000);
  const [hraExemption, setHraExemption] = useState(0);
  const [nps80ccd, setNps80ccd] = useState(0);
  const [tdsDeducted, setTdsDeducted] = useState(100000);

  const result = useMemo(() => {
    const standardDed = regime === 'new' ? 75000 : 50000;
    const netSalary = Math.max(0, salary - standardDed - (regime === 'old' ? hraExemption : 0));
    const grossIncome = netSalary + houseProperty + business + stcg + ltcg + otherSources;

    const totalDeductions = regime === 'old'
      ? Math.min(deduction80c, 150000) + Math.min(deduction80d, 25000) + Math.min(nps80ccd, 50000)
      : 0;

    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    const totalTax = calcTax(taxableIncome, regime);
    const advanceTaxLiability = Math.max(0, totalTax - tdsDeducted);

    const noAdvanceTax = advanceTaxLiability < 10000;

    const quarters = [
      { label: 'Q1', dueDate: 'Jun 15, 2025', pct: 0.15 },
      { label: 'Q2', dueDate: 'Sep 15, 2025', pct: 0.30 },
      { label: 'Q3', dueDate: 'Dec 15, 2025', pct: 0.30 },
      { label: 'Q4', dueDate: 'Mar 15, 2026', pct: 0.25 },
    ];

    let cumulative = 0;
    const schedule = quarters.map((q) => {
      const due = Math.round(advanceTaxLiability * q.pct);
      cumulative += due;
      return { ...q, due, cumulative };
    });

    return { taxableIncome, totalTax, advanceTaxLiability, noAdvanceTax, schedule, totalDeductions, grossIncome };
  }, [regime, salary, houseProperty, business, stcg, ltcg, otherSources, deduction80c, deduction80d, hraExemption, nps80ccd, tdsDeducted]);

  const kpis = [
    { label: 'Taxable Income', value: fmt(result.taxableIncome), color: 'text-slate-700 dark:text-slate-300' },
    { label: 'Total Tax + Cess', value: fmt(result.totalTax), color: 'text-red-600 dark:text-red-400' },
    { label: 'TDS Deducted', value: fmt(tdsDeducted), color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Advance Tax Due', value: result.noAdvanceTax ? 'Nil' : fmt(result.advanceTaxLiability), color: result.noAdvanceTax ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Advance Tax Calculator"
        subtitle="Quarterly advance tax instalments — FY 2025-26"
        kpis={kpis}
      />
      <div className="p-4 space-y-4">
        {/* Tax Regime */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Tax Regime</p>
          <div className="flex gap-2">
            {(['new', 'old'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegime(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  regime === r
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {r === 'new' ? 'New Regime (Default)' : 'Old Regime'}
              </button>
            ))}
          </div>
          {regime === 'new' && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              New regime: Standard deduction ₹75,000. No 80C/80D. Rebate u/s 87A if income ≤ ₹12L.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Income Sources */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Income Sources (Annual)</p>
            <div className="space-y-3">
              {[
                { label: 'Salary / Pension (gross)', val: salary, set: setSalary },
                { label: 'House Property Income / (Loss)', val: houseProperty, set: setHouseProperty },
                { label: 'Business / Profession Income', val: business, set: setBusiness },
                { label: 'Short-term Capital Gains (STCG)', val: stcg, set: setStcg },
                { label: 'Long-term Capital Gains (LTCG)', val: ltcg, set: setLtcg },
                { label: 'Other Sources (interest, etc.)', val: otherSources, set: setOtherSources },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p className={labelCls + ' mb-1'}>{label}</p>
                  <input
                    type="number"
                    className={inputCls}
                    value={val}
                    onChange={(e) => set(Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Deductions & TDS */}
          <div className="space-y-4">
            {regime === 'old' && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className={labelCls + ' mb-3'}>Deductions (Old Regime Only)</p>
                <div className="space-y-3">
                  {[
                    { label: '80C — EPF, PPF, ELSS, etc. (max ₹1.5L)', val: deduction80c, set: setDeduction80c, max: 150000 },
                    { label: '80D — Medical Insurance (max ₹25K)', val: deduction80d, set: setDeduction80d, max: 25000 },
                    { label: 'HRA Exemption (Sec 10(13A))', val: hraExemption, set: setHraExemption, max: undefined },
                    { label: '80CCD(1B) — Additional NPS (max ₹50K)', val: nps80ccd, set: setNps80ccd, max: 50000 },
                  ].map(({ label, val, set, max }) => (
                    <div key={label}>
                      <p className={labelCls + ' mb-1'}>{label}</p>
                      <input
                        type="number"
                        className={inputCls}
                        value={val}
                        max={max}
                        onChange={(e) => set(Math.min(Number(e.target.value), max ?? Infinity))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className={labelCls + ' mb-3'}>TDS Already Deducted (Annual)</p>
              <input
                type="number"
                className={inputCls}
                value={tdsDeducted}
                onChange={(e) => setTdsDeducted(Number(e.target.value))}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Check Form 26AS or AIS on IT portal for TDS details.
              </p>
            </div>

            {/* Tax Summary */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className={labelCls + ' mb-3'}>Tax Computation</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Gross Total Income</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{fmt(result.grossIncome)}</span>
                </div>
                {regime === 'old' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Total Deductions</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">- {fmt(result.totalDeductions)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Taxable Income</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{fmt(result.taxableIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Tax + 4% Cess</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{fmt(result.totalTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Less: TDS</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">- {fmt(tdsDeducted)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Advance Tax Due</span>
                  <span className={`font-bold ${result.noAdvanceTax ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {result.noAdvanceTax ? 'Nil (< ₹10,000)' : fmt(result.advanceTaxLiability)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quarterly Schedule */}
        {!result.noAdvanceTax ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Quarterly Payment Schedule — FY 2025-26</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2 text-slate-500 dark:text-slate-400 font-medium">Instalment</th>
                    <th className="pb-2 text-slate-500 dark:text-slate-400 font-medium">Due Date</th>
                    <th className="pb-2 text-slate-500 dark:text-slate-400 font-medium">% of Tax</th>
                    <th className="pb-2 text-slate-500 dark:text-slate-400 font-medium text-right">Amount Due</th>
                    <th className="pb-2 text-slate-500 dark:text-slate-400 font-medium text-right">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((q) => (
                    <tr key={q.label} className="border-b border-slate-50 dark:border-slate-800/50">
                      <td className="py-3 font-semibold text-amber-600 dark:text-amber-400">{q.label}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{q.dueDate}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{Math.round(q.pct * 100)}%</td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 text-right">{fmt(q.due)}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400 text-right">{fmt(q.cumulative)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              <span className="font-semibold">No advance tax required.</span> Your advance tax liability is below ₹10,000, so you are not required to pay advance tax instalments. Any tax due is payable via self-assessment tax before ITR filing.
            </p>
          </div>
        )}

        {/* Slab Reference */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-500" />
            <p className={labelCls}>Tax Slab Reference — FY 2025-26</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">New Regime (Default)</p>
              {[['Up to ₹3L', 'Nil'], ['₹3L – ₹7L', '5%'], ['₹7L – ₹10L', '10%'], ['₹10L – ₹12L', '15%'], ['₹12L – ₹15L', '20%'], ['Above ₹15L', '30%']].map(([range, rate]) => (
                <div key={range} className="flex justify-between py-0.5">
                  <span>{range}</span><span className="font-medium">{rate}</span>
                </div>
              ))}
              <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-medium">Rebate: Zero tax if income ≤ ₹12L</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Old Regime</p>
              {[['Up to ₹2.5L', 'Nil'], ['₹2.5L – ₹5L', '5%'], ['₹5L – ₹10L', '20%'], ['Above ₹10L', '30%']].map(([range, rate]) => (
                <div key={range} className="flex justify-between py-0.5">
                  <span>{range}</span><span className="font-medium">{rate}</span>
                </div>
              ))}
              <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-medium">Rebate: ₹12,500 if income ≤ ₹5L</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Add 4% Health & Education Cess on all tax amounts.</p>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> This is an approximate estimate based on FY 2025-26 income tax rules. STCG/LTCG are taxed at special rates and not included in slab calculation above — consult a CA for exact computation. Interest u/s 234B (underpayment) and 234C (deferment) applies on shortfall. Always verify on the official IT portal at incometax.gov.in.
          </p>
        </div>
      </div>
    </div>
  );
}
