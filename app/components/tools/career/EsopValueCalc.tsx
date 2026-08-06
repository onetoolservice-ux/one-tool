"use client";
import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Info, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-violet-400 transition-colors w-full';
const sliderCls = 'w-full h-2 rounded-lg appearance-none cursor-pointer accent-violet-500';

type ESOPType = 'esop' | 'rsu';

export const ESOPValueCalc = () => {
  const [type, setType] = useState<ESOPType>('esop');
  // ESOP fields
  const [totalOptions, setTotalOptions] = useState(10000);
  const [strikePrice, setStrikePrice] = useState(100);
  const [currentFMV, setCurrentFMV] = useState(500);
  const [expectedFMV, setExpectedFMV] = useState(1500);

  // RSU fields
  const [totalRSUs, setTotalRSUs] = useState(1000);
  const [currentSharePrice, setCurrentSharePrice] = useState(5000);
  const [expectedSharePrice, setExpectedSharePrice] = useState(8000);

  // Common vesting
  const [vestingYears, setVestingYears] = useState(4);
  const [cliffMonths, setCliffMonths] = useState(12);
  const [monthsCompleted, setMonthsCompleted] = useState(0);

  // Tax
  const [taxBracket, setTaxBracket] = useState(30);

  const result = useMemo(() => {
    const totalMonths = vestingYears * 12;
    const vestedPct = monthsCompleted >= cliffMonths
      ? Math.min(100, (monthsCompleted / totalMonths) * 100)
      : 0;

    let vestedCount = 0;
    let totalCount = 0;
    let currentSpread = 0;
    let expectedSpread = 0;

    if (type === 'esop') {
      totalCount = totalOptions;
      vestedCount = Math.floor(totalOptions * vestedPct / 100);
      currentSpread = currentFMV - strikePrice;
      expectedSpread = expectedFMV - strikePrice;
    } else {
      totalCount = totalRSUs;
      vestedCount = Math.floor(totalRSUs * vestedPct / 100);
      currentSpread = currentSharePrice;
      expectedSpread = expectedSharePrice;
    }

    const vestedValue = Math.max(0, vestedCount * currentSpread);
    const unvestedValue = Math.max(0, (totalCount - vestedCount) * currentSpread);
    const totalCurrentValue = Math.max(0, totalCount * currentSpread);
    const totalExpectedValue = Math.max(0, totalCount * expectedSpread);

    // Tax at exercise (ESOPs taxed as perquisite at exercise — difference is income)
    const taxOnVested = type === 'esop'
      ? vestedValue * (taxBracket / 100)
      : vestedValue * (taxBracket / 100); // RSUs taxed as income at vesting

    const netVestedValue = Math.max(0, vestedValue - taxOnVested);

    // Vesting schedule
    const vestingSchedule = [];
    let cumulative = 0;
    for (let y = 1; y <= vestingYears; y++) {
      const month = y * 12;
      const thisYearVest = month < cliffMonths ? 0 : Math.floor(totalCount / vestingYears);
      const cliffBonus = y === Math.ceil(cliffMonths / 12) && cliffMonths > 0 ? Math.floor(totalCount * (cliffMonths / totalMonths)) : 0;
      const actualVest = y === 1 && cliffMonths > 0 ? cliffBonus : thisYearVest;
      cumulative += actualVest;
      const value = Math.max(0, actualVest * currentSpread);
      const expectedVal = Math.max(0, actualVest * expectedSpread);
      vestingSchedule.push({ year: `Year ${y}`, vesting: actualVest, value, expectedVal, cumulative });
    }

    return {
      vestedPct,
      vestedCount,
      unvestedCount: totalCount - vestedCount,
      vestedValue,
      unvestedValue,
      totalCurrentValue,
      totalExpectedValue,
      taxOnVested,
      netVestedValue,
      vestingSchedule,
    };
  }, [type, totalOptions, strikePrice, currentFMV, expectedFMV, totalRSUs, currentSharePrice, expectedSharePrice, vestingYears, cliffMonths, monthsCompleted, taxBracket]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="ESOP / RSU Value Calculator"
        subtitle={`${type.toUpperCase()} · ${result.vestedPct.toFixed(0)}% vested · ${vestingYears}-year vesting`}
        kpis={[
          { label: 'Vested Value (Now)', value: fmtL(result.vestedValue), color: 'success', subtitle: `${result.vestedCount.toLocaleString('en-IN')} ${type === 'esop' ? 'options' : 'units'} vested` },
          { label: 'Net After Tax', value: fmtL(result.netVestedValue), color: 'primary', subtitle: `After ${taxBracket}% tax` },
          { label: 'Total at Current Price', value: fmtL(result.totalCurrentValue), color: 'warning', subtitle: `All ${type === 'esop' ? totalOptions : totalRSUs} units` },
          { label: 'Potential (Expected Price)', value: fmtL(result.totalExpectedValue), color: 'neutral', subtitle: 'If company grows as expected' },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2">
          {(['esop', 'rsu'] as ESOPType[]).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold border transition-all ${type === t
                ? 'bg-violet-500 text-white border-violet-500'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300'}`}>
              {t === 'esop' ? 'ESOPs (Stock Options)' : 'RSUs (Restricted Stock Units)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inputs */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Grant Details</h2>

            {type === 'esop' ? (
              <>
                <div className="space-y-1">
                  <label className={labelCls}>Total Options Granted</label>
                  <input type="number" className={inputCls} value={totalOptions} onChange={e => setTotalOptions(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Strike Price per Share (₹)</label>
                  <input type="number" className={inputCls} value={strikePrice} onChange={e => setStrikePrice(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Current FMV per Share (₹)</label>
                  <input type="number" className={inputCls} value={currentFMV} onChange={e => setCurrentFMV(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Expected FMV at Exit (₹)</label>
                  <input type="number" className={inputCls} value={expectedFMV} onChange={e => setExpectedFMV(+e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className={labelCls}>Total RSUs Granted</label>
                  <input type="number" className={inputCls} value={totalRSUs} onChange={e => setTotalRSUs(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Current Share Price (₹)</label>
                  <input type="number" className={inputCls} value={currentSharePrice} onChange={e => setCurrentSharePrice(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Expected Share Price at Full Vest (₹)</label>
                  <input type="number" className={inputCls} value={expectedSharePrice} onChange={e => setExpectedSharePrice(+e.target.value)} />
                </div>
              </>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Vesting Schedule</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className={labelCls}>Vesting Period</label>
                    <span className="text-sm font-bold text-violet-500">{vestingYears} yrs</span>
                  </div>
                  <input type="range" className={sliderCls} min={1} max={6} step={1}
                    value={vestingYears} onChange={e => setVestingYears(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className={labelCls}>Cliff Period</label>
                    <span className="text-sm font-bold text-slate-500">{cliffMonths} months</span>
                  </div>
                  <input type="range" className={sliderCls} min={0} max={24} step={3}
                    value={cliffMonths} onChange={e => setCliffMonths(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className={labelCls}>Months Completed</label>
                    <span className="text-sm font-bold text-slate-500">{monthsCompleted}m</span>
                  </div>
                  <input type="range" className={sliderCls} min={0} max={vestingYears * 12} step={1}
                    value={monthsCompleted} onChange={e => setMonthsCompleted(+e.target.value)} />
                  <p className="text-xs text-slate-400">{result.vestedPct.toFixed(0)}% vested</p>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Your Tax Bracket</label>
                  <select className={inputCls} value={taxBracket} onChange={e => setTaxBracket(+e.target.value)}>
                    <option value={5}>5%</option>
                    <option value={20}>20%</option>
                    <option value={30}>30%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Value Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Vested Value (Pre-Tax)</div>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{fmtL(result.vestedValue)}</div>
                <div className="text-xs text-emerald-500 mt-1">{result.vestedCount.toLocaleString('en-IN')} units × spread</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">After-Tax Value</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{fmtL(result.netVestedValue)}</div>
                <div className="text-xs text-blue-500 mt-1">Tax: {fmtL(result.taxOnVested)}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Unvested Value</div>
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{fmtL(result.unvestedValue)}</div>
                <div className="text-xs text-slate-400 mt-1">{result.unvestedCount.toLocaleString('en-IN')} units remaining</div>
              </div>
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800">
                <div className="text-xs text-violet-600 dark:text-violet-400 mb-1">Potential Value (Expected Price)</div>
                <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">{fmtL(result.totalExpectedValue)}</div>
                <div className="text-xs text-violet-500 mt-1">If exit price materialises</div>
              </div>
            </div>

            {/* Vesting Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Vesting Schedule — Value by Year</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.vestingSchedule} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmtL(v)} width={65} />
                  <Tooltip formatter={(v: number) => [fmtL(v)]} />
                  <Bar dataKey="value" fill="#7c3aed" name="Current Value" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expectedVal" fill="#a78bfa" name="Expected Value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex gap-3">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Tax note:</strong> ESOPs are taxed as perquisite income at exercise (FMV − Strike Price). RSUs are taxed as salary at vesting. Capital gains tax applies on subsequent sale.
                Consider a CA consultation before exercising large grants.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
