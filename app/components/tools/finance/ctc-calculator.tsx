"use client";
import React, { useState, useMemo } from 'react';
import { IndianRupee, Info, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-green-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

// Tax slabs FY 2024-25
function calcTaxOldRegime(taxableIncome: number): number {
  let tax = 0;
  if (taxableIncome <= 250000) tax = 0;
  else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
  else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
  else tax = 112500 + (taxableIncome - 1000000) * 0.30;
  // Rebate u/s 87A
  if (taxableIncome <= 500000) tax = 0;
  const cess = tax * 0.04;
  return Math.round(tax + cess);
}

function calcTaxNewRegime(taxableIncome: number): number {
  let tax = 0;
  if (taxableIncome <= 300000) tax = 0;
  else if (taxableIncome <= 700000) tax = (taxableIncome - 300000) * 0.05;
  else if (taxableIncome <= 1000000) tax = 20000 + (taxableIncome - 700000) * 0.10;
  else if (taxableIncome <= 1200000) tax = 50000 + (taxableIncome - 1000000) * 0.15;
  else if (taxableIncome <= 1500000) tax = 80000 + (taxableIncome - 1200000) * 0.20;
  else tax = 140000 + (taxableIncome - 1500000) * 0.30;
  // Rebate u/s 87A — new regime (up to 7L)
  if (taxableIncome <= 700000) tax = 0;
  const cess = tax * 0.04;
  return Math.round(tax + cess);
}

export const CTCCalculator = () => {
  const [ctc, setCtc] = useState(1200000);
  const [basicPct, setBasicPct] = useState(40);
  const [hraCity, setHraCity] = useState<'metro' | 'non-metro'>('metro');
  const [rentPaid, setRentPaid] = useState(20000);
  const [pf, setPf] = useState(true);
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [section80c, setSection80c] = useState(150000);
  const [section80d, setSection80d] = useState(25000);
  const [npsExtra, setNpsExtra] = useState(0);

  const result = useMemo(() => {
    const basic = Math.round(ctc * basicPct / 100);
    const hra = Math.round(basic * (hraCity === 'metro' ? 0.50 : 0.40));
    const special = Math.round(ctc * 0.10);
    const lta = Math.round(basic * 0.08);
    const epfEmployee = pf ? Math.round(Math.min(basic, 15000) * 0.12) : 0;
    const epfEmployer = pf ? Math.round(Math.min(basic, 15000) * 0.12) : 0;
    const gratuity = Math.round(basic * 0.0481);
    const grossSalary = ctc - epfEmployer - gratuity;

    // HRA exemption (old regime only)
    const monthlyRent = rentPaid;
    const hraExemption = Math.min(
      hra,
      monthlyRent * 12 - basic * 0.10,
      basic * (hraCity === 'metro' ? 0.50 : 0.40)
    );

    // Old regime taxable income
    let oldTaxable = grossSalary - epfEmployee;
    oldTaxable -= Math.max(0, hraExemption);
    oldTaxable -= 50000; // standard deduction
    oldTaxable -= Math.min(section80c, 150000);
    oldTaxable -= Math.min(section80d, 50000);
    oldTaxable -= Math.min(npsExtra, 50000); // 80CCD(1B)
    oldTaxable = Math.max(0, oldTaxable);

    // New regime taxable income
    let newTaxable = grossSalary - epfEmployee;
    newTaxable -= 75000; // standard deduction (new regime FY25)
    newTaxable = Math.max(0, newTaxable);

    const oldTax = calcTaxOldRegime(oldTaxable);
    const newTax = calcTaxNewRegime(newTaxable);

    const tax = regime === 'old' ? oldTax : newTax;
    const inHand = grossSalary - epfEmployee - tax;
    const monthlyInHand = Math.round(inHand / 12);

    const pie = [
      { name: 'In-hand', value: inHand, color: '#10b981' },
      { name: 'Income Tax', value: tax, color: '#ef4444' },
      { name: 'EPF (Employee)', value: epfEmployee, color: '#6366f1' },
      { name: 'EPF (Employer)', value: epfEmployer, color: '#94a3b8' },
      { name: 'Gratuity', value: gratuity, color: '#f59e0b' },
    ];

    return {
      basic, hra, special, lta, grossSalary, epfEmployee, epfEmployer, gratuity,
      oldTax, newTax, oldTaxable, newTaxable, hraExemption, tax, inHand, monthlyInHand, pie,
      betterRegime: oldTax < newTax ? 'old' : 'new',
      saving: Math.abs(oldTax - newTax),
    };
  }, [ctc, basicPct, hraCity, rentPaid, pf, regime, section80c, section80d, npsExtra]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="CTC to In-hand Calculator"
        subtitle="Old vs New regime · FY 2024-25"
        kpis={[
          { label: 'Monthly In-hand', value: fmt(result.monthlyInHand), color: 'success' },
          { label: 'Annual In-hand', value: fmt(result.inHand), color: 'success' },
          { label: 'Income Tax', value: fmt(result.tax), color: 'error' },
          { label: 'CTC', value: fmt(ctc), color: 'neutral' },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Regime toggle */}
        <div className="flex gap-2">
          {(['old', 'new'] as const).map(r => (
            <button key={r} onClick={() => setRegime(r)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${regime === r
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
              {r === 'old' ? 'Old Regime' : 'New Regime (FY 2024-25)'}
              {result.betterRegime === r && <span className="ml-2 text-xs bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">Saves {fmt(result.saving)}</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Salary Details</h2>

            <div className="space-y-1">
              <label className={labelCls}>Annual CTC (₹)</label>
              <input type="number" className={inputCls} value={ctc} onChange={e => setCtc(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Basic % of CTC</label>
              <div className="flex items-center gap-2">
                <input type="range" min={30} max={60} className="flex-1 accent-green-500" value={basicPct} onChange={e => setBasicPct(+e.target.value)} />
                <span className="text-sm font-bold text-green-600 w-10 text-right">{basicPct}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>City</label>
              <div className="flex gap-2">
                {(['metro', 'non-metro'] as const).map(c => (
                  <button key={c} onClick={() => setHraCity(c)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${hraCity === c ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                    {c === 'metro' ? 'Metro' : 'Non-Metro'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Monthly Rent Paid (₹)</label>
              <input type="number" className={inputCls} value={rentPaid} onChange={e => setRentPaid(+e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pf" checked={pf} onChange={e => setPf(e.target.checked)} className="accent-green-500" />
              <label htmlFor="pf" className="text-sm text-slate-700 dark:text-slate-300">EPF applicable</label>
            </div>

            {regime === 'old' && (
              <>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Old Regime Deductions</div>
                  <div className="space-y-1">
                    <label className={labelCls}>80C (₹, max 1.5L)</label>
                    <input type="number" className={inputCls} value={section80c} max={150000} onChange={e => setSection80c(+e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>80D - Health Ins (₹)</label>
                    <input type="number" className={inputCls} value={section80d} onChange={e => setSection80d(+e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>NPS 80CCD(1B) (₹)</label>
                    <input type="number" className={inputCls} value={npsExtra} max={50000} onChange={e => setNpsExtra(+e.target.value)} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Big number */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="text-sm opacity-80 mb-1">Monthly In-hand Salary</div>
              <div className="text-5xl font-bold">{fmt(result.monthlyInHand)}</div>
              <div className="text-sm opacity-70 mt-2">Annual: {fmt(result.inHand)}</div>
            </div>

            {/* Tax comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl p-4 border ${regime === 'old' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                <div className="text-xs text-slate-500 mb-1">Old Regime Tax</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{fmt(result.oldTax)}</div>
                <div className="text-xs text-slate-400">Taxable: {fmt(result.oldTaxable)}</div>
              </div>
              <div className={`rounded-xl p-4 border ${regime === 'new' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                <div className="text-xs text-slate-500 mb-1">New Regime Tax</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{fmt(result.newTax)}</div>
                <div className="text-xs text-slate-400">Taxable: {fmt(result.newTaxable)}</div>
              </div>
            </div>

            {/* Pie */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">CTC Breakdown</h3>
                <button onClick={() => setShowBreakdown(!showBreakdown)} className="text-slate-400">
                  {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {showBreakdown && (
                <div className="grid grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={result.pie} dataKey="value" cx="50%" cy="50%" outerRadius={65} strokeWidth={2}>
                        {result.pie.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 self-center">
                    {result.pie.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                          <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{fmt(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Salary structure */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Salary Structure (Annual)</h3>
              <div className="space-y-1.5 text-sm">
                {[
                  { label: 'Basic', value: result.basic },
                  { label: `HRA (${hraCity === 'metro' ? '50' : '40'}% of basic)`, value: result.hra },
                  { label: 'LTA', value: result.lta },
                  { label: 'Special Allowance', value: result.special },
                  { label: 'Gross Salary', value: result.grossSalary, bold: true },
                  { label: 'EPF Employee (12%)', value: -result.epfEmployee, red: true },
                  { label: 'Income Tax', value: -result.tax, red: true },
                  { label: 'Net In-hand', value: result.inHand, green: true, bold: true },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between py-1 border-b border-slate-50 dark:border-slate-800 ${row.bold ? 'font-semibold' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">{row.label}</span>
                    <span className={row.green ? 'text-emerald-600 dark:text-emerald-400' : row.red ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}>
                      {fmt(Math.abs(row.value))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> This is an approximate estimate based on FY 2024-25 Income Tax rules. Actual in-hand salary may differ based on your exact CTC structure, perquisites, LTA claims, company EPF policy, and other deductions. Old Regime deduction limits shown are standard — your actual deductions may vary. Consult your employer&apos;s HR or a Chartered Accountant for precise figures.
          </p>
        </div>
      </div>
    </div>
  );
};
