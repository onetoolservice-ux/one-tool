"use client";
import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';
const sliderCls = 'w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500';

type InvestmentType = 'mba' | 'certification' | 'upskilling' | 'custom';

const PRESETS: Record<InvestmentType, { label: string; courseCost: number; durationMonths: number; salaryHike: number }> = {
  mba: { label: 'MBA (IIM / Top B-School)', courseCost: 2500000, durationMonths: 24, salaryHike: 50 },
  certification: { label: 'Professional Certification', courseCost: 50000, durationMonths: 3, salaryHike: 15 },
  upskilling: { label: 'Online Course / Bootcamp', courseCost: 30000, durationMonths: 6, salaryHike: 20 },
  custom: { label: 'Custom', courseCost: 0, durationMonths: 0, salaryHike: 0 },
};

export const CareerROICalc = () => {
  const [investType, setInvestType] = useState<InvestmentType>('mba');
  const [courseCost, setCourseCost] = useState(PRESETS.mba.courseCost);
  const [durationMonths, setDurationMonths] = useState(PRESETS.mba.durationMonths);
  const [currentSalary, setCurrentSalary] = useState(1200000); // annual CTC
  const [salaryHikePct, setSalaryHikePct] = useState(PRESETS.mba.salaryHike);
  const [annualGrowthRate, setAnnualGrowthRate] = useState(8);
  const [projectionYears, setProjectionYears] = useState(10);

  const selectPreset = (key: InvestmentType) => {
    setInvestType(key);
    if (key !== 'custom') {
      setCourseCost(PRESETS[key].courseCost);
      setDurationMonths(PRESETS[key].durationMonths);
      setSalaryHikePct(PRESETS[key].salaryHike);
    }
  };

  const result = useMemo(() => {
    const durationYears = durationMonths / 12;
    const opportunityCostSalary = currentSalary * durationYears;
    const totalInvestment = courseCost + opportunityCostSalary;

    const newSalary = currentSalary * (1 + salaryHikePct / 100);
    const annualIncrement = newSalary - currentSalary;

    // Cumulative NPV over projection years
    const discount = 0.08; // discount rate
    const chartData: { year: number; withUpgrade: number; withoutUpgrade: number; cumGain: number }[] = [];

    let cumWith = 0;
    let cumWithout = 0;
    let paybackYear = 0;

    for (let y = 1; y <= projectionYears; y++) {
      const withSalary = newSalary * Math.pow(1 + annualGrowthRate / 100, y - 1);
      const withoutSalary = currentSalary * Math.pow(1 + annualGrowthRate / 100, y - 1);
      cumWith += withSalary;
      cumWithout += withoutSalary;
      const cumGain = cumWith - cumWithout - totalInvestment;
      if (cumGain > 0 && paybackYear === 0) paybackYear = y;
      chartData.push({
        year: y,
        withUpgrade: Math.round(cumWith),
        withoutUpgrade: Math.round(cumWithout),
        cumGain: Math.round(cumGain),
      });
    }

    const totalCumulativeGain = chartData[chartData.length - 1].cumGain;
    const roi = totalInvestment > 0 ? (totalCumulativeGain / totalInvestment) * 100 : 0;
    const irr = totalInvestment > 0 && paybackYear > 0
      ? (Math.pow(1 + annualIncrement / totalInvestment, 1 / (paybackYear || 1)) - 1) * 100
      : 0;

    return {
      totalInvestment,
      opportunityCostSalary,
      newSalary,
      annualIncrement,
      paybackYear,
      roi,
      totalCumulativeGain,
      chartData,
    };
  }, [courseCost, durationMonths, currentSalary, salaryHikePct, annualGrowthRate, projectionYears]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Career Investment ROI"
        subtitle={`MBA / Certification · Payback & NPV over ${projectionYears} years`}
        kpis={[
          { label: 'Total Investment', value: fmtL(result.totalInvestment), color: 'neutral', subtitle: 'Course + Opportunity Cost' },
          { label: 'Salary Increase', value: fmtL(result.annualIncrement), color: 'success', subtitle: `${salaryHikePct}% hike p.a.` },
          { label: 'Payback Period', value: result.paybackYear ? `${result.paybackYear} years` : 'Never', color: result.paybackYear > 0 && result.paybackYear <= projectionYears ? 'primary' : 'error', subtitle: 'Break-even year' },
          { label: `${projectionYears}-yr Cumulative Gain`, value: fmtL(result.totalCumulativeGain), color: result.totalCumulativeGain > 0 ? 'success' : 'error', subtitle: `ROI: ${result.roi.toFixed(0)}%` },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Preset Selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESETS) as InvestmentType[]).map(key => (
            <button key={key} onClick={() => selectPreset(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${investType === key
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
              {PRESETS[key].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inputs */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Investment Parameters</h2>

            <div className="space-y-1">
              <label className={labelCls}>Course / Programme Cost (₹)</label>
              <input type="number" className={inputCls} value={courseCost} onChange={e => setCourseCost(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Programme Duration (months)</label>
              <input type="number" className={inputCls} value={durationMonths} min={0} max={36}
                onChange={e => setDurationMonths(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Current Annual CTC (₹)</label>
              <input type="number" className={inputCls} value={currentSalary}
                onChange={e => setCurrentSalary(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Expected Salary Hike</label>
                <span className="text-sm font-bold text-blue-500">{salaryHikePct}%</span>
              </div>
              <input type="range" className={sliderCls} min={0} max={200} step={5}
                value={salaryHikePct} onChange={e => setSalaryHikePct(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Annual Salary Growth Rate</label>
                <span className="text-sm font-bold text-slate-500">{annualGrowthRate}%</span>
              </div>
              <input type="range" className={sliderCls} min={3} max={20} step={1}
                value={annualGrowthRate} onChange={e => setAnnualGrowthRate(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className={labelCls}>Projection Period</label>
                <span className="text-sm font-bold text-slate-500">{projectionYears} yrs</span>
              </div>
              <input type="range" className={sliderCls} min={3} max={20} step={1}
                value={projectionYears} onChange={e => setProjectionYears(+e.target.value)} />
            </div>

            {/* Cost breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Course Fee</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{fmtL(courseCost)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Opportunity Cost</span>
                <span className="font-medium text-amber-600">{fmtL(result.opportunityCostSalary)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold border-t border-slate-200 dark:border-slate-600 pt-2">
                <span>Total Cost</span>
                <span className="text-slate-700 dark:text-slate-300">{fmtL(result.totalInvestment)}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Cumulative Earnings Comparison</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="withGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="withoutGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: 'Year', position: 'insideBottom', offset: -2 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmtL(v)} width={65} />
                  <Tooltip formatter={(v: number) => [fmtL(v)]} labelFormatter={l => `Year ${l}`} />
                  {result.paybackYear > 0 && (
                    <ReferenceLine x={result.paybackYear} stroke="#10b981" strokeDasharray="4 4"
                      label={{ value: 'Break-even', fill: '#10b981', fontSize: 11 }} />
                  )}
                  <Area type="monotone" dataKey="withoutUpgrade" stroke="#94a3b8" fill="url(#withoutGrad)" strokeWidth={2} name="Without Investment" />
                  <Area type="monotone" dataKey="withUpgrade" stroke="#3b82f6" fill="url(#withGrad)" strokeWidth={2} name="With Investment" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 mb-1">New Annual Salary</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmtL(result.newSalary)}</div>
                <div className="text-xs text-slate-400 mt-1">vs {fmtL(currentSalary)} currently</div>
              </div>
              <div className={`rounded-xl p-4 border ${result.totalCumulativeGain > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                <div className={`text-xs mb-1 ${result.totalCumulativeGain > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {projectionYears}-Year Net Gain
                </div>
                <div className={`text-xl font-bold ${result.totalCumulativeGain > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600'}`}>
                  {fmtL(result.totalCumulativeGain)}
                </div>
                <div className="text-xs text-slate-400 mt-1">ROI: {result.roi.toFixed(0)}%</div>
              </div>
            </div>

            {result.totalCumulativeGain > 0 ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  The investment pays back in <strong>{result.paybackYear} year{result.paybackYear !== 1 ? 's' : ''}</strong> and delivers <strong>{fmtL(result.totalCumulativeGain)}</strong> in net additional earnings over {projectionYears} years.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  At current inputs, the investment does not break even within {projectionYears} years. Consider if non-financial benefits (network, skills, brand) justify the cost.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
