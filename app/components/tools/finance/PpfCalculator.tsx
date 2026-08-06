"use client";
import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-violet-400 transition-colors w-full';
const sliderCls = 'w-full h-2 rounded-lg appearance-none cursor-pointer accent-violet-500';

const PPF_RATE = 7.1; // Current PPF rate FY 2024-25
const PPF_MIN = 500;
const PPF_MAX = 150000;

export const PPFCalculator = () => {
  const [yearlyDeposit, setYearlyDeposit] = useState(150000);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [yearsPassed, setYearsPassed] = useState(0);
  const [extensions, setExtensions] = useState(0); // 5-year blocks after maturity

  const result = useMemo(() => {
    const totalYears = 15 + extensions * 5;
    const rate = PPF_RATE / 100;

    let balance = currentBalance;
    const yearData: { year: number; balance: number; deposit: number; interest: number }[] = [];

    for (let y = 1; y <= totalYears - yearsPassed; y++) {
      const actualYear = yearsPassed + y;
      const deposit = Math.min(Math.max(yearlyDeposit, PPF_MIN), PPF_MAX);
      const interest = Math.round((balance + deposit) * rate);
      balance = balance + deposit + interest;
      yearData.push({
        year: actualYear,
        balance: Math.round(balance),
        deposit,
        interest,
      });
    }

    const totalDeposited = yearlyDeposit * (totalYears - yearsPassed) + currentBalance;
    const totalInterest = balance - totalDeposited;
    const yearsRemaining = totalYears - yearsPassed;

    return { balance, totalDeposited, totalInterest, yearData, yearsRemaining, totalYears };
  }, [yearlyDeposit, currentBalance, yearsPassed, extensions]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="PPF Calculator"
        subtitle={`${PPF_RATE}% p.a. · EEE Status · ${result.totalYears}-year tenure`}
        kpis={[
          { label: 'Maturity Amount', value: fmtL(result.balance), color: 'primary', subtitle: `After ${result.totalYears} years` },
          { label: 'Total Deposited', value: fmtL(result.totalDeposited), color: 'neutral', subtitle: `${result.yearsRemaining} years remaining` },
          { label: 'Total Interest', value: fmtL(result.totalInterest), color: 'success', subtitle: `@${PPF_RATE}% p.a. compounded` },
          { label: 'Annual 80C Benefit', value: fmtL(Math.min(yearlyDeposit, 150000)), color: 'warning', subtitle: 'Tax deductible (max ₹1.5L)' },
        ]}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inputs */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" /> PPF Details
            </h2>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Yearly Deposit</label>
                <span className="text-sm font-bold text-violet-500">{fmt(yearlyDeposit)}</span>
              </div>
              <input type="range" className={sliderCls} min={500} max={150000} step={500}
                value={yearlyDeposit} onChange={e => setYearlyDeposit(+e.target.value)} />
              <input type="number" className={inputCls} value={yearlyDeposit}
                onChange={e => setYearlyDeposit(Math.min(+e.target.value, 150000))} />
              <p className="text-xs text-slate-400">Min ₹500 · Max ₹1.5L per year</p>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Current PPF Balance (₹)</label>
              <input type="number" className={inputCls} value={currentBalance}
                onChange={e => setCurrentBalance(+e.target.value)} />
              <p className="text-xs text-slate-400">0 if starting fresh</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Years Already Completed</label>
                <span className="text-sm font-bold text-slate-500">{yearsPassed} yrs</span>
              </div>
              <input type="range" className={sliderCls} min={0} max={14} step={1}
                value={yearsPassed} onChange={e => setYearsPassed(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>5-Year Extensions After Maturity</label>
              <div className="flex gap-2 mt-1">
                {[0, 1, 2, 3].map(e => (
                  <button key={e} onClick={() => setExtensions(e)}
                    className={`flex-1 py-1.5 text-sm rounded-lg border font-semibold transition-all ${extensions === e
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                    {e === 0 ? '0' : `+${e * 5}y`}
                  </button>
                ))}
              </div>
            </div>

            {/* EEE Badge */}
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3 border border-violet-200 dark:border-violet-800">
              <h3 className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> EEE Tax Status
              </h3>
              <div className="space-y-1 text-xs text-violet-600 dark:text-violet-400">
                <div>✓ Deposit: Deductible under 80C</div>
                <div>✓ Interest: Fully tax-exempt</div>
                <div>✓ Maturity: 100% tax-free</div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Year-wise Balance Growth</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.yearData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: 'Year', position: 'insideBottom', offset: -2 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmtL(v)} width={65} />
                  <Tooltip formatter={(v: number, n: string) => [fmtL(v), n === 'deposit' ? 'Deposit' : n === 'interest' ? 'Interest' : 'Balance']} labelFormatter={l => `Year ${l}`} />
                  <Bar dataKey="deposit" stackId="a" fill="#94a3b8" name="deposit" />
                  <Bar dataKey="interest" stackId="a" fill="#7c3aed" name="interest" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Year-wise table (last 5 years) */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Year-wise Breakdown (Last 5 years)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      {['Year', 'Opening Balance', 'Deposit', 'Interest', 'Closing Balance'].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearData.slice(-5).map((row, i) => {
                      const opening = i === 0 && result.yearData.length > 5
                        ? result.yearData[result.yearData.length - 6].balance
                        : i === 0 ? currentBalance : result.yearData[result.yearData.length - 5 + i - 1].balance;
                      return (
                        <tr key={row.year} className={`border-t border-slate-100 dark:border-slate-700 ${i === result.yearData.slice(-5).length - 1 ? 'bg-violet-50 dark:bg-violet-900/10 font-semibold' : ''}`}>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Year {row.year}</td>
                          <td className="px-4 py-2">{fmtL(opening)}</td>
                          <td className="px-4 py-2 text-emerald-600 dark:text-emerald-400">+{fmt(row.deposit)}</td>
                          <td className="px-4 py-2 text-violet-600 dark:text-violet-400">+{fmt(row.interest)}</td>
                          <td className="px-4 py-2 font-semibold">{fmtL(row.balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current PPF rate is {PPF_RATE}% p.a. (compounded yearly, Q4 2024-25). Rate is revised quarterly by the Government. Partial withdrawal allowed from Year 7. Loan facility available from Year 3. Interest is calculated on the lowest balance between 5th and last day of each month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
