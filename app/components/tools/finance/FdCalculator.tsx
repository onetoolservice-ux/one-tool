"use client";
import React, { useState, useMemo } from 'react';
import { PiggyBank, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-full';
const sliderCls = 'w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500';

type CompoundFreq = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
type Mode = 'fd' | 'rd';

const COMPOUND_MAP: Record<CompoundFreq, number> = {
  monthly: 12,
  quarterly: 4,
  'half-yearly': 2,
  yearly: 1,
};

export const FDCalculator = () => {
  const [mode, setMode] = useState<Mode>('fd');
  const [principal, setPrincipal] = useState(100000);
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
  const [rate, setRate] = useState(7.5);
  const [tenureYears, setTenureYears] = useState(3);
  const [compounding, setCompounding] = useState<CompoundFreq>('quarterly');
  const [seniorCitizen, setSeniorCitizen] = useState(false);
  const [tds, setTds] = useState(true);

  const result = useMemo(() => {
    const effectiveRate = rate + (seniorCitizen ? 0.5 : 0);
    const n = COMPOUND_MAP[compounding];
    const r = effectiveRate / 100;

    let maturity = 0;
    let chartData: { year: string; principal: number; interest: number }[] = [];

    if (mode === 'fd') {
      // A = P(1 + r/n)^(nt)
      for (let y = 1; y <= tenureYears; y++) {
        const m = principal * Math.pow(1 + r / n, n * y);
        chartData.push({ year: `Y${y}`, principal, interest: Math.round(m - principal) });
      }
      maturity = principal * Math.pow(1 + r / n, n * tenureYears);
    } else {
      // RD: sum of monthly deposits compounded
      const months = tenureYears * 12;
      const monthlyRate = effectiveRate / 100 / 12;
      let totalPrincipal = 0;
      for (let y = 1; y <= tenureYears; y++) {
        let rdVal = 0;
        for (let m = 1; m <= y * 12; m++) {
          rdVal += monthlyDeposit * Math.pow(1 + monthlyRate, y * 12 - m + 1);
        }
        totalPrincipal = monthlyDeposit * y * 12;
        chartData.push({ year: `Y${y}`, principal: totalPrincipal, interest: Math.round(rdVal - totalPrincipal) });
      }
      for (let m = 1; m <= months; m++) {
        maturity += monthlyDeposit * Math.pow(1 + monthlyRate, months - m + 1);
      }
    }

    const totalInvested = mode === 'fd' ? principal : monthlyDeposit * tenureYears * 12;
    const grossInterest = maturity - totalInvested;
    const tdsAmount = tds ? Math.max(0, grossInterest - 40000) * 0.10 : 0; // 40k threshold
    const netMaturity = maturity - tdsAmount;
    const effectiveYield = totalInvested > 0 ? ((netMaturity - totalInvested) / totalInvested / tenureYears) * 100 : 0;

    return { maturity, totalInvested, grossInterest, tdsAmount, netMaturity, effectiveYield, chartData, effectiveRate };
  }, [mode, principal, monthlyDeposit, rate, tenureYears, compounding, seniorCitizen, tds]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="FD / RD Calculator"
        subtitle={`${mode.toUpperCase()} · ${result.effectiveRate}% p.a. · ${compounding} compounding`}
        kpis={[
          { label: 'Total Invested', value: fmtL(result.totalInvested), color: 'neutral', subtitle: mode === 'rd' ? `₹${monthlyDeposit.toLocaleString('en-IN')}/mo` : 'One-time' },
          { label: 'Gross Interest', value: fmtL(result.grossInterest), color: 'success', subtitle: `${result.effectiveRate}% p.a.` },
          { label: 'Net Maturity', value: fmtL(result.netMaturity), color: 'primary', subtitle: tds ? 'After TDS' : 'No TDS deducted' },
          { label: 'Effective Yield', value: `${result.effectiveYield.toFixed(2)}%`, color: 'warning', subtitle: 'Post-tax annualised' },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          {(['fd', 'rd'] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold border transition-all ${mode === m
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'}`}>
              {m === 'fd' ? 'Fixed Deposit (FD)' : 'Recurring Deposit (RD)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inputs */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-500" /> {mode === 'fd' ? 'FD Details' : 'RD Details'}
            </h2>

            {mode === 'fd' ? (
              <div className="space-y-1">
                <label className={labelCls}>Principal Amount (₹)</label>
                <input type="number" className={inputCls} value={principal} onChange={e => setPrincipal(+e.target.value)} />
              </div>
            ) : (
              <div className="space-y-1">
                <label className={labelCls}>Monthly Deposit (₹)</label>
                <input type="number" className={inputCls} value={monthlyDeposit} onChange={e => setMonthlyDeposit(+e.target.value)} />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Interest Rate</label>
                <span className="text-sm font-bold text-emerald-500">{rate + (seniorCitizen ? 0.5 : 0)}%</span>
              </div>
              <input type="range" className={sliderCls} min={3} max={12} step={0.25} value={rate} onChange={e => setRate(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Tenure</label>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{tenureYears} yrs</span>
              </div>
              <input type="range" className={sliderCls} min={1} max={10} step={1} value={tenureYears} onChange={e => setTenureYears(+e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Compounding Frequency</label>
              <select className={inputCls} value={compounding} onChange={e => setCompounding(e.target.value as CompoundFreq)}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half-yearly">Half-Yearly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={seniorCitizen} onChange={e => setSeniorCitizen(e.target.checked)}
                  className="accent-emerald-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Senior Citizen (+0.5%)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={tds} onChange={e => setTds(e.target.checked)}
                  className="accent-emerald-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Deduct TDS (10% above ₹40K/yr)</span>
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xs text-slate-500 mb-1">Principal</div>
                <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{fmtL(result.totalInvested)}</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Interest Earned</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmtL(result.grossInterest)}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 text-center">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Net Maturity</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmtL(result.netMaturity)}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Year-wise Growth</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmtL(v)} width={65} />
                  <Tooltip formatter={(v: number) => [fmtL(v)]} />
                  <Bar dataKey="principal" stackId="a" fill="#94a3b8" name="Principal" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="interest" stackId="a" fill="#10b981" name="Interest" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* TDS Note */}
            {tds && result.tdsAmount > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex gap-3">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  TDS deducted: <strong>{fmt(result.tdsAmount)}</strong> (10% on interest above ₹40,000/year).
                  Submit Form 15G/15H if your total income is below the taxable limit to avoid TDS.
                </p>
              </div>
            )}

            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rates shown are indicative. Actual FD rates vary by bank and tenure. TDS threshold for senior citizens is ₹50,000/year.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
