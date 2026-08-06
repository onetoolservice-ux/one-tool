"use client";
import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (Math.abs(n) >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L';
  return fmt(n);
};

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-teal-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

export function EvVsPetrol() {
  const [petrolPrice, setPetrolPrice] = useState(1000000);
  const [petrolMileage, setPetrolMileage] = useState(15);
  const [petrolFuelPrice, setPetrolFuelPrice] = useState(102);
  const [petrolService, setPetrolService] = useState(8000);
  const [petrolInsurance, setPetrolInsurance] = useState(18000);
  const [petrolFuelIncrease, setPetrolFuelIncrease] = useState(5);

  const [evPrice, setEvPrice] = useState(1500000);
  const [evSubsidy, setEvSubsidy] = useState(150000);
  const [evEfficiency, setEvEfficiency] = useState(6);
  const [electricityPrice, setElectricityPrice] = useState(8);
  const [evService, setEvService] = useState(3000);
  const [evInsurance, setEvInsurance] = useState(22000);

  const [annualKm, setAnnualKm] = useState(15000);
  const [years, setYears] = useState(5);

  const result = useMemo(() => {
    const petrolNetPrice = petrolPrice;
    const evNetPrice = evPrice - evSubsidy;

    const chartData: { year: number; petrolCumulative: number; evCumulative: number; petrolAnnual: number; evAnnual: number }[] = [];
    let petrolCumulative = petrolNetPrice;
    let evCumulative = evNetPrice;
    let breakEvenYear: number | null = null;

    for (let y = 1; y <= years; y++) {
      const petrolFuel = (annualKm / petrolMileage) * petrolFuelPrice * Math.pow(1 + petrolFuelIncrease / 100, y - 1);
      const evFuel = (annualKm / evEfficiency) * electricityPrice * Math.pow(1.03, y - 1);

      const petrolAnnualRunning = petrolFuel + petrolService + petrolInsurance;
      const evAnnualRunning = evFuel + evService + evInsurance;

      petrolCumulative += petrolAnnualRunning;
      evCumulative += evAnnualRunning;

      if (!breakEvenYear && evCumulative <= petrolCumulative) {
        breakEvenYear = y;
      }

      chartData.push({
        year: y,
        petrolCumulative: Math.round(petrolCumulative),
        evCumulative: Math.round(evCumulative),
        petrolAnnual: Math.round(petrolAnnualRunning),
        evAnnual: Math.round(evAnnualRunning),
      });
    }

    const finalData = chartData[chartData.length - 1];
    const savings = finalData.petrolCumulative - finalData.evCumulative;
    const winner = savings > 0 ? 'EV' : 'Petrol';

    // CO2 estimate
    const petrolLitres = (annualKm / petrolMileage) * years;
    const co2Saved = petrolLitres * 2.3; // kg CO2 per litre (rough)

    return { chartData, breakEvenYear, savings, winner, petrolNetPrice, evNetPrice, co2Saved };
  }, [petrolPrice, petrolMileage, petrolFuelPrice, petrolService, petrolInsurance, petrolFuelIncrease, evPrice, evSubsidy, evEfficiency, electricityPrice, evService, evInsurance, annualKm, years]);

  const kpis = [
    { label: `${years}-yr Petrol Cost`, value: fmtL(result.chartData[result.chartData.length - 1]?.petrolCumulative || 0), color: 'text-orange-600 dark:text-orange-400' },
    { label: `${years}-yr EV Cost`, value: fmtL(result.chartData[result.chartData.length - 1]?.evCumulative || 0), color: 'text-teal-600 dark:text-teal-400' },
    { label: result.winner === 'EV' ? 'Savings with EV' : 'Savings with Petrol', value: fmtL(Math.abs(result.savings)), color: result.winner === 'EV' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400' },
    { label: 'Breakeven Year', value: result.breakEvenYear ? 'Year ' + result.breakEvenYear : 'Beyond ' + years + ' yrs', color: result.breakEvenYear ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400' },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="EV vs Petrol"
        subtitle="Total cost of ownership comparison over multiple years"
        kpis={kpis}
      />
      <div className="p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Petrol Inputs */}
          <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 p-4">
            <p className={labelCls + ' mb-3 text-orange-600 dark:text-orange-400'}>Petrol Car</p>
            <div className="space-y-3">
              {[
                { label: 'Purchase Price (₹)', val: petrolPrice, set: setPetrolPrice },
                { label: 'Fuel Efficiency (km/litre)', val: petrolMileage, set: setPetrolMileage },
                { label: 'Petrol Price (₹/litre)', val: petrolFuelPrice, set: setPetrolFuelPrice },
                { label: 'Annual Service Cost (₹)', val: petrolService, set: setPetrolService },
                { label: 'Annual Insurance (₹)', val: petrolInsurance, set: setPetrolInsurance },
                { label: 'Annual Fuel Price Increase (%)', val: petrolFuelIncrease, set: setPetrolFuelIncrease },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p className={labelCls + ' mb-1'}>{label}</p>
                  <input type="number" className="text-sm border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-400 transition-colors w-full" value={val} onChange={(e) => set(Number(e.target.value))} />
                </div>
              ))}
            </div>
          </div>

          {/* EV Inputs */}
          <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/10 p-4">
            <p className={labelCls + ' mb-3 text-teal-600 dark:text-teal-400'}>Electric Vehicle (EV)</p>
            <div className="space-y-3">
              {[
                { label: 'Purchase Price (₹)', val: evPrice, set: setEvPrice },
                { label: 'FAME Subsidy / EV Benefit (₹)', val: evSubsidy, set: setEvSubsidy },
                { label: 'Efficiency (km/kWh)', val: evEfficiency, set: setEvEfficiency },
                { label: 'Electricity Cost (₹/kWh)', val: electricityPrice, set: setElectricityPrice },
                { label: 'Annual Service Cost (₹)', val: evService, set: setEvService },
                { label: 'Annual Insurance (₹)', val: evInsurance, set: setEvInsurance },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p className={labelCls + ' mb-1'}>{label}</p>
                  <input type="number" className="text-sm border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-teal-400 transition-colors w-full" value={val} onChange={(e) => set(Number(e.target.value))} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Common */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Usage Parameters</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className={labelCls + ' mb-1'}>Annual Driving Distance (km)</p>
              <input type="number" className={inputCls} value={annualKm} onChange={(e) => setAnnualKm(Number(e.target.value))} />
            </div>
            <div>
              <p className={labelCls + ' mb-1'}>Analysis Period (years)</p>
              <input type="range" min="3" max="10" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-teal-500 mt-2" />
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>3</span><span className="font-semibold text-teal-600 dark:text-teal-400">{years} years</span><span>10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Cumulative Cost Comparison</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={result.chartData}>
              <XAxis dataKey="year" tickFormatter={(v) => 'Yr ' + v} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickFormatter={(v) => fmtL(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} width={75} />
              <Tooltip
                formatter={(value: number, name: string) => [fmtL(value), name === 'petrolCumulative' ? 'Petrol (cumulative)' : 'EV (cumulative)']}
                contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
              />
              <Legend formatter={(v) => v === 'petrolCumulative' ? 'Petrol' : 'EV'} />
              <Line type="monotone" dataKey="petrolCumulative" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} name="petrolCumulative" />
              <Line type="monotone" dataKey="evCumulative" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} name="evCumulative" />
              {result.breakEvenYear && (
                <ReferenceLine x={result.breakEvenYear} stroke="#8b5cf6" strokeDasharray="4 4" label={{ value: 'Breakeven', fill: '#8b5cf6', fontSize: 11 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Year-by-Year Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Year-by-Year Summary</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-2 text-slate-500 dark:text-slate-400 font-medium">Year</th>
                  <th className="pb-2 text-orange-500 font-medium text-right">Petrol Annual</th>
                  <th className="pb-2 text-teal-500 font-medium text-right">EV Annual</th>
                  <th className="pb-2 text-orange-600 font-medium text-right">Petrol Cumul.</th>
                  <th className="pb-2 text-teal-600 font-medium text-right">EV Cumul.</th>
                </tr>
              </thead>
              <tbody>
                {result.chartData.map((row) => (
                  <tr key={row.year} className={`border-b border-slate-50 dark:border-slate-800/50 ${row.evCumulative <= row.petrolCumulative ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''}`}>
                    <td className="py-2 font-medium text-slate-700 dark:text-slate-300">Year {row.year}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-400">{fmtL(row.petrolAnnual)}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-400">{fmtL(row.evAnnual)}</td>
                    <td className="py-2 text-right font-medium text-orange-600 dark:text-orange-400">{fmtL(row.petrolCumulative)}</td>
                    <td className="py-2 text-right font-medium text-teal-600 dark:text-teal-400">{fmtL(row.evCumulative)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CO2 Note */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Environment Impact</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Switching to EV could save approximately <strong>{(result.co2Saved / 1000).toFixed(1)} tonnes of CO₂</strong> over {years} years — equivalent to {Math.round(result.co2Saved / 21)} trees planted. (Based on ~2.3 kg CO₂ per litre of petrol burned.)
          </p>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> This is an approximate TCO comparison. Residual/resale value, battery replacement costs (EV), road tax differences, and depreciation are not included. Fuel prices and electricity tariffs vary by state. FAME subsidy availability is subject to government policy. EV charging infrastructure and home charging costs may vary. Always verify current subsidy status with the dealer.
          </p>
        </div>
      </div>
    </div>
  );
}
