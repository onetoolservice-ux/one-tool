'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { AlertTriangle, Building2, TrendingUp, Percent, Calendar } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L';
  return fmt(n);
};

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-teal-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

const BENCHMARKS = [
  { name: 'FD', rate: 7.0, color: '#94a3b8' },
  { name: 'PPF', rate: 7.1, color: '#64748b' },
  { name: 'Equity (CAGR)', rate: 12.0, color: '#6366f1' },
];

// ─────────────────────────────────────────────────────────────────────────────

export function RentalYield() {
  const [propValue, setPropValue] = useState(6000000);
  const [monthlyRent, setMonthlyRent] = useState(22000);
  const [annualMaintenance, setAnnualMaintenance] = useState(24000);
  const [societyCharges, setSocietyCharges] = useState(12000);
  const [propertyTax, setPropertyTax] = useState(5000);
  const [vacancyMonths, setVacancyMonths] = useState(1);

  const calc = useMemo(() => {
    const annualRentGross = monthlyRent * 12;
    const effectiveRent = monthlyRent * (12 - Math.max(0, Math.min(12, vacancyMonths)));
    const netAnnualIncome = effectiveRent - annualMaintenance - societyCharges - propertyTax;
    const grossYield = propValue > 0 ? (annualRentGross / propValue) * 100 : 0;
    const netYield = propValue > 0 ? (netAnnualIncome / propValue) * 100 : 0;
    const breakEvenYears = netAnnualIncome > 0 ? propValue / netAnnualIncome : Infinity;

    const fdRate = BENCHMARKS[0].rate;
    const vsFD = netYield - fdRate;

    const chartData = [
      { name: 'Gross Yield', rate: parseFloat(grossYield.toFixed(2)), color: '#14b8a6' },
      { name: 'Net Yield', rate: parseFloat(netYield.toFixed(2)), color: netYield >= fdRate ? '#0d9488' : '#f59e0b' },
      ...BENCHMARKS.map(b => ({ name: b.name, rate: b.rate, color: b.color })),
    ];

    return {
      annualRentGross,
      effectiveRent,
      netAnnualIncome,
      grossYield,
      netYield,
      breakEvenYears,
      vsFD,
      chartData,
    };
  }, [propValue, monthlyRent, annualMaintenance, societyCharges, propertyTax, vacancyMonths]);

  const kpis = [
    { label: 'Gross Yield', value: calc.grossYield.toFixed(2) + '%', icon: Percent, color: 'primary' as const },
    {
      label: 'Net Yield',
      value: calc.netYield.toFixed(2) + '%',
      icon: TrendingUp,
      color: calc.netYield >= 7 ? ('success' as const) : ('warning' as const),
    },
    { label: 'Annual Net Income', value: fmtCr(calc.netAnnualIncome), icon: Building2, color: 'neutral' as const },
    {
      label: 'vs FD (7%)',
      value: (calc.vsFD >= 0 ? '+' : '') + calc.vsFD.toFixed(2) + '%',
      icon: TrendingUp,
      color: calc.vsFD >= 0 ? ('success' as const) : ('error' as const),
    },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Rental Yield Calculator"
        subtitle="Calculate gross and net rental yield, compare with benchmark returns"
        kpis={kpis}
      />

      <div className="p-4 space-y-4">
        {/* Inputs */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Building2 size={15} className="text-teal-500" /> Property Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className={labelCls}>Property Value (₹)</label>
              <input type="number" className={inputCls} value={propValue} onChange={e => setPropValue(Number(e.target.value))} step={100000} />
              <p className="text-[10px] text-slate-400">{fmtCr(propValue)}</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Monthly Rent (₹)</label>
              <input type="number" className={inputCls} value={monthlyRent} onChange={e => setMonthlyRent(Number(e.target.value))} step={500} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Vacancy Months/Year</label>
              <input type="number" className={inputCls} value={vacancyMonths} onChange={e => setVacancyMonths(Number(e.target.value))} min={0} max={12} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Annual Maintenance (₹)</label>
              <input type="number" className={inputCls} value={annualMaintenance} onChange={e => setAnnualMaintenance(Number(e.target.value))} step={1000} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Annual Society Charges (₹)</label>
              <input type="number" className={inputCls} value={societyCharges} onChange={e => setSocietyCharges(Number(e.target.value))} step={500} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Annual Property Tax (₹)</label>
              <input type="number" className={inputCls} value={propertyTax} onChange={e => setPropertyTax(Number(e.target.value))} step={500} />
            </div>
          </div>
        </div>

        {/* Income Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Gross Annual Rent', value: fmtCr(calc.annualRentGross), sub: '12 months full', color: 'text-teal-600 dark:text-teal-400' },
            { label: 'Effective Annual Rent', value: fmtCr(calc.effectiveRent), sub: `${12 - vacancyMonths} months occupied`, color: 'text-teal-600 dark:text-teal-400' },
            { label: 'Total Annual Costs', value: fmtCr(annualMaintenance + societyCharges + propertyTax), sub: 'Maintenance + Society + Tax', color: 'text-red-500 dark:text-red-400' },
            { label: 'Net Annual Income', value: fmtCr(calc.netAnnualIncome), sub: 'After all deductions', color: calc.netAnnualIncome > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{item.label}</p>
              <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Yield Comparison Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Yield vs Benchmarks (%)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={calc.chartData}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 90, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => v + '%'} domain={[0, 'dataMax + 2']} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={85} />
              <Tooltip
                formatter={(v: number) => [v.toFixed(2) + '%', 'Return']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: number) => v.toFixed(2) + '%', fontSize: 11, fill: '#64748b' }}>
                {calc.chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Break-even & Summary */}
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30 p-4 flex gap-3 items-start">
          <Calendar size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-teal-700 dark:text-teal-300 mb-1">
              Break-even: {calc.breakEvenYears === Infinity ? 'Never (negative income)' : calc.breakEvenYears.toFixed(1) + ' years'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              At the current net income of {fmtCr(calc.netAnnualIncome)}/year, it would take{' '}
              {calc.breakEvenYears === Infinity ? 'an infinite amount of time' : calc.breakEvenYears.toFixed(1) + ' years'}{' '}
              to recover the property purchase price of {fmtCr(propValue)} through rental income alone.
              {calc.vsFD >= 0
                ? ` Your net yield of ${calc.netYield.toFixed(2)}% beats the FD rate of 7% by ${calc.vsFD.toFixed(2)} percentage points.`
                : ` Your net yield of ${calc.netYield.toFixed(2)}% is below the FD rate of 7% — the property may not be generating optimal returns.`}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Rental yield calculations do not account for income tax on rental income (taxable under "Income from House Property" in India), home loan interest deduction benefits, capital appreciation of the property over time, brokerage/commission on tenant changes, or renovation and repair costs. Benchmark returns (FD, PPF, Equity) are approximate and subject to change. This tool is for indicative purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
