"use client";
import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { AlertTriangle } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-teal-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

type TransportMode = 'two-wheeler' | 'public' | 'cab';

const TRANSPORT_RATES: Record<TransportMode, number> = {
  'two-wheeler': 3,
  'public': 2,
  'cab': 12,
};

export function WfhSavings() {
  const [distanceKm, setDistanceKm] = useState(15);
  const [transportMode, setTransportMode] = useState<TransportMode>('two-wheeler');
  const [workingDays, setWorkingDays] = useState(22);
  const [officeFoodCost, setOfficeFoodCost] = useState(200);
  const [homeFoodCost, setHomeFoodCost] = useState(80);
  const [clothingCost, setClothingCost] = useState(2000);
  const [internetExtra, setInternetExtra] = useState(500);
  const [electricityExtra, setElectricityExtra] = useState(800);
  const [commuteMinutes, setCommuteMinutes] = useState(45);

  const result = useMemo(() => {
    const ratePerKm = TRANSPORT_RATES[transportMode];
    const transportMonthly = distanceKm * 2 * workingDays * ratePerKm;
    const foodSavingsMonthly = (officeFoodCost - homeFoodCost) * workingDays;
    const clothingSavingsMonthly = clothingCost * 0.8; // 80% savings on office attire
    const wfhCostsMonthly = internetExtra + electricityExtra;

    const netMonthlySavings = transportMonthly + foodSavingsMonthly + clothingSavingsMonthly - wfhCostsMonthly;
    const annualSavings = netMonthlySavings * 12;

    const monthlyCommuteHours = (commuteMinutes * 2 * workingDays) / 60;
    const annualCommuteHours = monthlyCommuteHours * 12;
    const timeValueAnnual = annualCommuteHours * 200; // ₹200/hr notional

    // Equivalent salary hike
    const equivalentCTC = annualSavings / 0.7; // assuming ~30% effective tax

    return {
      transportMonthly,
      foodSavingsMonthly,
      clothingSavingsMonthly,
      wfhCostsMonthly,
      netMonthlySavings,
      annualSavings,
      monthlyCommuteHours,
      annualCommuteHours,
      timeValueAnnual,
      equivalentCTC,
    };
  }, [distanceKm, transportMode, workingDays, officeFoodCost, homeFoodCost, clothingCost, internetExtra, electricityExtra, commuteMinutes]);

  const kpis = [
    { label: 'Monthly Savings', value: fmt(result.netMonthlySavings), color: 'text-teal-600 dark:text-teal-400' },
    { label: 'Annual Savings', value: fmt(result.annualSavings), color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Hours Saved / Month', value: result.monthlyCommuteHours.toFixed(1) + ' hrs', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Time Value / Year', value: fmt(result.timeValueAnnual), color: 'text-violet-600 dark:text-violet-400' },
  ];

  const breakdown = [
    { label: 'Transport Savings', value: result.transportMonthly, type: 'saving' },
    { label: 'Food Savings', value: result.foodSavingsMonthly, type: 'saving' },
    { label: 'Clothing / Grooming Savings', value: result.clothingSavingsMonthly, type: 'saving' },
    { label: 'Internet Upgrade', value: -result.internetExtra, type: 'cost' },
    { label: 'Extra Electricity', value: -result.electricityExtra, type: 'cost' },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="WFH Savings Estimator"
        subtitle="The real financial value of working from home"
        kpis={kpis}
      />
      <div className="p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Commute & Work Details</p>
            <div className="space-y-3">
              <div>
                <p className={labelCls + ' mb-1'}>Office Distance One-way (km)</p>
                <input type="number" className={inputCls} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-2'}>Transport Mode</p>
                <div className="flex flex-wrap gap-2">
                  {([['two-wheeler', 'Two-wheeler'], ['public', 'Public Transport'], ['cab', 'Cab / Auto']] as const).map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => setTransportMode(mode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        transportMode === mode
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Rate used: ₹{TRANSPORT_RATES[transportMode]}/km
                </p>
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Working Days / Month</p>
                <input type="number" className={inputCls} value={workingDays} onChange={(e) => setWorkingDays(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Avg Commute Time One-way (minutes)</p>
                <input type="number" className={inputCls} value={commuteMinutes} onChange={(e) => setCommuteMinutes(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Daily & Monthly Costs</p>
            <div className="space-y-3">
              <div>
                <p className={labelCls + ' mb-1'}>Daily Food at Office (₹)</p>
                <input type="number" className={inputCls} value={officeFoodCost} onChange={(e) => setOfficeFoodCost(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Daily Food at Home same days (₹)</p>
                <input type="number" className={inputCls} value={homeFoodCost} onChange={(e) => setHomeFoodCost(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Monthly Clothing / Grooming for Office (₹)</p>
                <input type="number" className={inputCls} value={clothingCost} onChange={(e) => setClothingCost(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Internet Upgrade for WFH (₹/month)</p>
                <input type="number" className={inputCls} value={internetExtra} onChange={(e) => setInternetExtra(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Extra Electricity at Home (₹/month)</p>
                <input type="number" className={inputCls} value={electricityExtra} onChange={(e) => setElectricityExtra(Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Monthly Savings Breakdown</p>
          <div className="space-y-2">
            {breakdown.map(({ label, value, type }) => {
              const absVal = Math.abs(value);
              const maxVal = Math.max(...breakdown.map((b) => Math.abs(b.value)));
              const barWidth = maxVal > 0 ? (absVal / maxVal) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{label}</span>
                    <span className={`font-semibold ${type === 'saving' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {type === 'saving' ? '+' : '-'}{fmt(absVal)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${type === 'saving' ? 'bg-emerald-500' : 'bg-red-400'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between text-sm font-semibold border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
              <span className="text-slate-700 dark:text-slate-300">Net Monthly Savings</span>
              <span className={result.netMonthlySavings >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}>
                {fmt(result.netMonthlySavings)}
              </span>
            </div>
          </div>
        </div>

        {/* Time is Money */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
          <p className={labelCls + ' mb-3 text-blue-600 dark:text-blue-400'}>Time is Money</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {[
              { label: 'Commute / Day', value: (commuteMinutes * 2) + ' min' },
              { label: 'Hours Saved / Month', value: result.monthlyCommuteHours.toFixed(1) + ' hrs' },
              { label: 'Hours Saved / Year', value: result.annualCommuteHours.toFixed(0) + ' hrs' },
              { label: 'Notional Value / Year', value: fmt(result.timeValueAnnual) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Notional value calculated at ₹200/hr. Actual value of time depends on how you use those hours.
          </p>
        </div>

        {/* Insight */}
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 p-4">
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-1">Bottom Line</p>
          <p className="text-sm text-teal-600 dark:text-teal-400">
            WFH saves you <strong>{fmt(result.netMonthlySavings)}/month</strong> ({fmt(result.annualSavings)}/year) — equivalent to a <strong>{fmt(result.equivalentCTC)}</strong> pre-tax salary hike. Plus you save {result.annualCommuteHours.toFixed(0)} hours of commute time every year.
          </p>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> These are estimated savings based on your inputs. Actual savings vary with fuel prices, lifestyle, employer policies, and other factors. The notional value of time is illustrative. Some WFH costs (ergonomic setup, co-working, etc.) are not included.
          </p>
        </div>
      </div>
    </div>
  );
}
