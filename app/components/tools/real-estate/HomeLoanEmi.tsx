'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertTriangle, Home, TrendingDown, Calendar, DollarSign } from 'lucide-react';
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
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

// ─────────────────────────────────────────────────────────────────────────────

function calcEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

interface AmortRow {
  year: number;
  principal: number;
  interest: number;
  balance: number;
}

function buildAmortSchedule(
  principal: number,
  annualRate: number,
  tenureYears: number,
  monthlyPrepay: number,
): { schedule: AmortRow[]; totalInterest: number; closedMonth: number } {
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  const emi = calcEMI(principal, annualRate, n);

  let balance = principal;
  let month = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;
  const schedule: AmortRow[] = [];
  let totalInterest = 0;

  while (balance > 0 && month < n) {
    month++;
    const interestPart = balance * r;
    let principalPart = emi - interestPart;

    if (principalPart > balance) principalPart = balance;
    balance -= principalPart;

    // Apply prepayment
    const prepay = Math.min(monthlyPrepay, balance);
    balance -= prepay;

    yearPrincipal += principalPart + prepay;
    yearInterest += interestPart;
    totalInterest += interestPart;

    if (month % 12 === 0 || balance <= 0) {
      schedule.push({
        year: Math.ceil(month / 12),
        principal: yearPrincipal,
        interest: yearInterest,
        balance: Math.max(0, balance),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }

    if (balance <= 0) break;
  }

  return { schedule, totalInterest, closedMonth: month };
}

// ─────────────────────────────────────────────────────────────────────────────

export function HomeLoanEmi() {
  const [loanAmt, setLoanAmt] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [prepay, setPrepay] = useState(0);

  const calc = useMemo(() => {
    const n = tenure * 12;
    const emi = calcEMI(loanAmt, rate, n);
    const totalWithout = emi * n;
    const interestWithout = totalWithout - loanAmt;

    const { schedule: schedWithout, totalInterest: tiWithout } = buildAmortSchedule(loanAmt, rate, tenure, 0);
    const { schedule: schedWith, totalInterest: tiWith, closedMonth } = buildAmortSchedule(loanAmt, rate, tenure, prepay);

    const interestSaved = prepay > 0 ? tiWithout - tiWith : 0;
    const monthsSaved = prepay > 0 ? n - closedMonth : 0;
    const yearsSaved = monthsSaved / 12;

    // Build balance chart data: year by year
    const balanceData: { year: string; without: number; with: number }[] = [];
    const maxYears = tenure;
    for (let y = 0; y <= maxYears; y++) {
      const rowWithout = schedWithout.find(r => r.year === y);
      const rowWith = schedWith.find(r => r.year === y);
      balanceData.push({
        year: `Yr ${y}`,
        without: y === 0 ? loanAmt : (rowWithout?.balance ?? 0),
        with: y === 0 ? loanAmt : (rowWith?.balance ?? 0),
      });
    }

    // Amortisation summary table: first 5 years + last year
    const summaryYears: AmortRow[] = [];
    for (let y = 1; y <= Math.min(5, schedWithout.length); y++) {
      const row = schedWithout.find(r => r.year === y);
      if (row) summaryYears.push(row);
    }
    const lastRow = schedWithout[schedWithout.length - 1];
    if (lastRow && lastRow.year > 5) summaryYears.push(lastRow);

    return {
      emi,
      interestWithout: tiWithout,
      totalWithout: loanAmt + tiWithout,
      interestWith: tiWith,
      totalWith: loanAmt + tiWith + (prepay > 0 ? prepay * closedMonth : 0),
      interestSaved,
      yearsSaved,
      closedMonth,
      balanceData,
      summaryYears,
    };
  }, [loanAmt, rate, tenure, prepay]);

  const kpis = [
    { label: 'Monthly EMI', value: fmtCr(calc.emi), icon: DollarSign, color: 'primary' as const },
    { label: 'Total Interest', value: fmtCr(calc.interestWithout), icon: TrendingDown, color: 'warning' as const },
    {
      label: 'Interest Saved',
      value: prepay > 0 ? fmtCr(calc.interestSaved) : '—',
      icon: TrendingDown,
      color: 'success' as const,
    },
    {
      label: 'Years Saved',
      value: prepay > 0 ? calc.yearsSaved.toFixed(1) + ' yrs' : '—',
      icon: Calendar,
      color: 'success' as const,
    },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Home Loan EMI Analyser"
        subtitle="Calculate EMI, total interest, and impact of prepayments"
        kpis={kpis}
      />

      <div className="p-4 space-y-4">
        {/* Inputs */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Home size={15} className="text-blue-500" /> Loan Parameters
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className={labelCls}>Loan Amount (₹)</label>
              <input
                type="number"
                className={inputCls}
                value={loanAmt}
                onChange={e => setLoanAmt(Number(e.target.value))}
                min={100000}
                step={100000}
              />
              <p className="text-[10px] text-slate-400">{fmtCr(loanAmt)}</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Annual Rate (%)</label>
              <input
                type="number"
                className={inputCls}
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                min={1}
                max={25}
                step={0.1}
              />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Tenure (Years)</label>
              <input
                type="number"
                className={inputCls}
                value={tenure}
                onChange={e => setTenure(Number(e.target.value))}
                min={1}
                max={30}
              />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Monthly Prepayment (₹)</label>
              <input
                type="number"
                className={inputCls}
                value={prepay}
                onChange={e => setPrepay(Number(e.target.value))}
                min={0}
                step={1000}
              />
              {prepay > 0 && <p className="text-[10px] text-slate-400">{fmtCr(prepay)}/mo extra</p>}
            </div>
          </div>
        </div>

        {/* Comparison Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
              Without Prepayment
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Tenure</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{tenure} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Total Interest</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{fmtCr(calc.interestWithout)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-blue-200 dark:border-blue-700 pt-2">
                <span className="text-slate-600 dark:text-slate-300">Total Payment</span>
                <span className="font-black text-slate-900 dark:text-white">{fmtCr(calc.totalWithout)}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${prepay > 0 ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
            <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${prepay > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              With Prepayment {prepay > 0 ? `(+${fmtCr(prepay)}/mo)` : '(enter amount above)'}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Tenure</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {prepay > 0 ? (calc.closedMonth / 12).toFixed(1) + ' yrs' : `${tenure} years`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Total Interest</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {prepay > 0 ? fmtCr(calc.interestWith) : fmtCr(calc.interestWithout)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-emerald-200 dark:border-emerald-700 pt-2">
                <span className="text-slate-600 dark:text-slate-300">Interest Saved</span>
                <span className={`font-black ${prepay > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {prepay > 0 ? fmtCr(calc.interestSaved) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Outstanding Balance Over Time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={calc.balanceData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorWithout" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorWith" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={3} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={v => fmtCr(v)}
                width={60}
              />
              <Tooltip
                formatter={(v: number) => fmtCr(v)}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="without"
                name="Without Prepayment"
                stroke="#3b82f6"
                fill="url(#colorWithout)"
                strokeWidth={2}
              />
              {prepay > 0 && (
                <Area
                  type="monotone"
                  dataKey="with"
                  name="With Prepayment"
                  stroke="#10b981"
                  fill="url(#colorWith)"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Amortisation Summary Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Amortisation Summary (Without Prepayment)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Year</th>
                  <th className="text-right py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Principal Paid</th>
                  <th className="text-right py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Interest Paid</th>
                  <th className="text-right py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Balance</th>
                </tr>
              </thead>
              <tbody>
                {calc.summaryYears.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                      Year {row.year}
                      {i === calc.summaryYears.length - 1 && row.year > 5 && (
                        <span className="ml-1 text-[10px] text-slate-400">(last)</span>
                      )}
                    </td>
                    <td className="py-2 text-right text-blue-600 dark:text-blue-400 font-medium">{fmtCr(row.principal)}</td>
                    <td className="py-2 text-right text-amber-600 dark:text-amber-400 font-medium">{fmtCr(row.interest)}</td>
                    <td className="py-2 text-right text-slate-800 dark:text-slate-200 font-semibold">{fmtCr(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This calculator uses a standard reducing-balance EMI formula. Actual EMIs may vary based on your lender's calculation method, processing fees, GST on charges, insurance premiums bundled with the loan, and any floating-rate resets. Prepayment charges (typically 0–2%) are not accounted for in this simulation. Consult your bank or a certified financial planner before making prepayment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
