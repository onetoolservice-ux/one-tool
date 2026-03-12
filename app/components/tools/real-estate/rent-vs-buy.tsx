'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertTriangle, Home, Building2, TrendingUp, Scale } from 'lucide-react';
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
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

// ─────────────────────────────────────────────────────────────────────────────

function calcEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

// ─────────────────────────────────────────────────────────────────────────────

export function RentVsBuy() {
  const [propPrice, setPropPrice] = useState(8000000);
  const [downPct, setDownPct] = useState(20);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [rentIncrease, setRentIncrease] = useState(5);
  const [appreciation, setAppreciation] = useState(6);
  const [investReturn, setInvestReturn] = useState(12);
  const [maintenance, setMaintenance] = useState(5000);

  const calc = useMemo(() => {
    const downPayment = propPrice * (downPct / 100);
    const loanAmt = propPrice - downPayment;
    const stampDuty = propPrice * 0.07;
    const emi = calcEMI(loanAmt, loanRate, loanTenure * 12);

    const chartData: { year: number; buyCumulative: number; rentCumulative: number }[] = [];
    let breakevenYear: number | null = null;

    let cumBuy = stampDuty; // upfront stamp duty
    let cumRent = 0;
    let rent = monthlyRent;
    let propValue = propPrice;
    // Opportunity cost tracking: what downpayment grows to
    let opportunityCost = downPayment;

    for (let y = 1; y <= 10; y++) {
      // Buying costs this year
      const emiYear = emi * 12;
      const maintenanceYear = maintenance * 12;
      propValue = propValue * (1 + appreciation / 100);
      // Appreciation gain from start
      const appreciationGain = propValue - propPrice;
      // Cumulative buy = all EMIs + all maintenance + stamp duty - appreciation gain so far
      cumBuy += emiYear + maintenanceYear;
      const netCumBuy = cumBuy - appreciationGain;

      // Renting costs this year
      for (let m = 1; m <= 12; m++) {
        cumRent += rent * Math.pow(1 + rentIncrease / 100, (y - 1) + (m - 1) / 12);
      }
      // Opportunity cost: down payment invested
      opportunityCost = downPayment * Math.pow(1 + investReturn / 100, y);
      const rentWithOpportunity = cumRent + (opportunityCost - downPayment);

      chartData.push({
        year: y,
        buyCumulative: Math.round(netCumBuy),
        rentCumulative: Math.round(rentWithOpportunity),
      });

      if (breakevenYear === null && netCumBuy < rentWithOpportunity) {
        breakevenYear = y;
      }
    }

    const last = chartData[chartData.length - 1];
    const betterChoice = last.buyCumulative < last.rentCumulative ? 'Buy' : 'Rent';
    const netBuyCost = last.buyCumulative;
    const netRentCost = last.rentCumulative;

    return {
      chartData,
      netBuyCost,
      netRentCost,
      betterChoice,
      breakevenYear,
      downPayment,
      emi,
    };
  }, [propPrice, downPct, loanRate, loanTenure, monthlyRent, rentIncrease, appreciation, investReturn, maintenance]);

  const kpis = [
    { label: '10-yr Buy Cost (net)', value: fmtCr(calc.netBuyCost), icon: Home, color: 'warning' as const },
    { label: '10-yr Rent Cost', value: fmtCr(calc.netRentCost), icon: Building2, color: 'primary' as const },
    {
      label: 'Better Choice',
      value: calc.betterChoice,
      icon: Scale,
      color: calc.betterChoice === 'Buy' ? ('success' as const) : ('primary' as const),
    },
    {
      label: 'Breakeven Year',
      value: calc.breakevenYear ? `Year ${calc.breakevenYear}` : '>10 yrs',
      icon: TrendingUp,
      color: 'neutral' as const,
    },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Rent vs Buy Analysis"
        subtitle="10-year breakeven analysis including opportunity cost of down payment"
        kpis={kpis}
      />

      <div className="p-4 space-y-4">
        {/* Inputs */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Home size={15} className="text-emerald-500" /> Property & Loan Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className={labelCls}>Property Price (₹)</label>
              <input type="number" className={inputCls} value={propPrice} onChange={e => setPropPrice(Number(e.target.value))} step={100000} />
              <p className="text-[10px] text-slate-400">{fmtCr(propPrice)}</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Down Payment (%)</label>
              <input type="number" className={inputCls} value={downPct} onChange={e => setDownPct(Number(e.target.value))} min={5} max={100} />
              <p className="text-[10px] text-slate-400">{fmtCr(propPrice * downPct / 100)}</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Home Loan Rate (%)</label>
              <input type="number" className={inputCls} value={loanRate} onChange={e => setLoanRate(Number(e.target.value))} step={0.1} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Loan Tenure (Years)</label>
              <input type="number" className={inputCls} value={loanTenure} onChange={e => setLoanTenure(Number(e.target.value))} min={1} max={30} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Property Appreciation (%/yr)</label>
              <input type="number" className={inputCls} value={appreciation} onChange={e => setAppreciation(Number(e.target.value))} step={0.5} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Maintenance + Society (₹/mo)</label>
              <input type="number" className={inputCls} value={maintenance} onChange={e => setMaintenance(Number(e.target.value))} step={500} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Building2 size={15} className="text-blue-500" /> Renting & Opportunity Cost
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className={labelCls}>Monthly Rent (₹)</label>
              <input type="number" className={inputCls} value={monthlyRent} onChange={e => setMonthlyRent(Number(e.target.value))} step={1000} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Annual Rent Increase (%)</label>
              <input type="number" className={inputCls} value={rentIncrease} onChange={e => setRentIncrease(Number(e.target.value))} step={0.5} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Investment Return if Renting (%)</label>
              <input type="number" className={inputCls} value={investReturn} onChange={e => setInvestReturn(Number(e.target.value))} step={0.5} />
              <p className="text-[10px] text-slate-400">Return on down payment if invested</p>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className={`rounded-xl border p-4 ${calc.betterChoice === 'Buy' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30' : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30'}`}>
          <p className={`text-sm font-bold mb-1 ${calc.betterChoice === 'Buy' ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'}`}>
            Over 10 years, {calc.betterChoice === 'Buy' ? 'Buying' : 'Renting'} appears to be the better financial choice.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {calc.betterChoice === 'Buy'
              ? `Net cost to buy (after appreciation): ${fmtCr(calc.netBuyCost)} vs. rent + opportunity cost: ${fmtCr(calc.netRentCost)}.`
              : `Rent + opportunity cost: ${fmtCr(calc.netRentCost)} vs. net cost to buy (after appreciation): ${fmtCr(calc.netBuyCost)}.`}
            {calc.breakevenYear
              ? ` Buying becomes cheaper from Year ${calc.breakevenYear} onwards.`
              : ' Buying does not break even within 10 years under these assumptions.'}
            {' '}Monthly EMI would be {fmtCr(calc.emi)}.
          </p>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Cumulative Cost Comparison (10 Years)</h2>
          <p className="text-[11px] text-slate-400 mb-3">Buy cost is net of property appreciation. Rent cost includes opportunity cost of down payment invested at {investReturn}% p.a.</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={calc.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => fmtCr(v)} width={64} />
              <Tooltip
                labelFormatter={v => `Year ${v}`}
                formatter={(v: number, name: string) => [fmtCr(v), name]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="buyCumulative"
                name="Buy (net)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="rentCumulative"
                name="Rent + Opportunity"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* EMI details */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Down Payment', value: fmtCr(calc.downPayment) },
            { label: 'Monthly EMI', value: fmtCr(calc.emi) },
            { label: 'Stamp Duty (est.)', value: fmtCr(propPrice * 0.07) },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{item.label}</p>
              <p className="text-base font-black text-slate-800 dark:text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This analysis uses simplified assumptions. Actual results depend on real property appreciation in your specific locality, actual investment returns, rental market conditions, tax benefits on home loan interest (Section 24b) and principal (Section 80C) which are not factored in, and emotional/lifestyle preferences. Stamp duty used here is a flat 7% estimate — actual rates vary by state and gender. Consult a SEBI-registered financial advisor before making property decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
