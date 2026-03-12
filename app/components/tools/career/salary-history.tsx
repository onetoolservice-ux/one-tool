"use client";
import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (Math.abs(n) >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L';
  return fmt(n);
};

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-violet-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

interface SalaryEntry {
  id: string;
  year: number;
  ctc: number;
}

function cagr(start: number, end: number, years: number): number {
  if (years <= 0 || start <= 0) return 0;
  return (Math.pow(end / start, 1 / years) - 1) * 100;
}

export function SalaryHistory() {
  const [entries, setEntries] = useState<SalaryEntry[]>([
    { id: '1', year: 2020, ctc: 600000 },
    { id: '2', year: 2022, ctc: 900000 },
    { id: '3', year: 2024, ctc: 1350000 },
  ]);
  const [newYear, setNewYear] = useState(2025);
  const [newCtc, setNewCtc] = useState(1600000);
  const [inflation, setInflation] = useState(6);

  const sorted = useMemo(() => [...entries].sort((a, b) => a.year - b.year), [entries]);

  const result = useMemo(() => {
    if (sorted.length < 2) return null;
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const years = last.year - first.year;
    const nominalCagr = cagr(first.ctc, last.ctc, years);
    const realCagr = ((1 + nominalCagr / 100) / (1 + inflation / 100) - 1) * 100;

    const chartData = sorted.map((e) => {
      const yearsFromBase = e.year - first.year;
      const inflationFactor = Math.pow(1 + inflation / 100, yearsFromBase);
      const realValue = e.ctc / inflationFactor;
      return {
        year: e.year,
        nominal: e.ctc,
        real: Math.round(realValue),
      };
    });

    const purchasingPowerChange = ((last.ctc / (first.ctc * Math.pow(1 + inflation / 100, years))) - 1) * 100;

    return { nominalCagr, realCagr, chartData, purchasingPowerChange, first, last, years };
  }, [sorted, inflation]);

  const addEntry = () => {
    if (!newYear || !newCtc) return;
    setEntries((prev) => [...prev, { id: Date.now().toString(), year: newYear, ctc: newCtc }]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const kpis = result
    ? [
        { label: 'Latest CTC', value: fmtL(result.last.ctc), color: 'text-violet-600 dark:text-violet-400' },
        { label: 'Nominal CAGR', value: result.nominalCagr.toFixed(1) + '%', color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Real CAGR', value: result.realCagr.toFixed(1) + '%', color: result.realCagr > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400' },
        { label: 'Purchasing Power', value: (result.purchasingPowerChange >= 0 ? '+' : '') + result.purchasingPowerChange.toFixed(1) + '%', color: result.purchasingPowerChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400' },
      ]
    : [
        { label: 'Latest CTC', value: '—', color: 'text-slate-500' },
        { label: 'Nominal CAGR', value: '—', color: 'text-slate-500' },
        { label: 'Real CAGR', value: '—', color: 'text-slate-500' },
        { label: 'Purchasing Power', value: '—', color: 'text-slate-500' },
      ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Salary Growth Tracker"
        subtitle="Are you actually earning more after inflation?"
        kpis={kpis}
      />
      <div className="p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Entry List */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Salary History</p>
            <div className="space-y-2 mb-4">
              {sorted.map((e) => (
                <div key={e.id} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      className={inputCls}
                      value={e.year}
                      onChange={(ev) => setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, year: Number(ev.target.value) } : x))}
                    />
                    <input
                      type="number"
                      className={inputCls}
                      value={e.ctc}
                      onChange={(ev) => setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, ctc: Number(ev.target.value) } : x))}
                    />
                  </div>
                  <button
                    onClick={() => removeEntry(e.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Entry */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <p className={labelCls + ' mb-2'}>Add Entry</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Year"
                  className={inputCls}
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                />
                <input
                  type="number"
                  placeholder="CTC (₹)"
                  className={inputCls}
                  value={newCtc}
                  onChange={(e) => setNewCtc(Number(e.target.value))}
                />
                <button
                  onClick={addEntry}
                  className="flex items-center gap-1 px-3 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium hover:bg-violet-600 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inflation Input */}
            <div className="mt-3">
              <p className={labelCls + ' mb-1'}>Inflation Assumption (% per year)</p>
              <input
                type="number"
                step="0.5"
                className={inputCls}
                value={inflation}
                onChange={(e) => setInflation(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Insight Card */}
          {result && (
            <div className="space-y-3">
              <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-4">
                <p className={labelCls + ' mb-3 text-violet-600 dark:text-violet-400'}>Growth Analysis</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Base Year Salary</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{fmtL(result.first.ctc)} ({result.first.year})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Current Salary</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{fmtL(result.last.ctc)} ({result.last.year})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Period</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{result.years} years</span>
                  </div>
                  <div className="border-t border-violet-200 dark:border-violet-700 pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Nominal CAGR</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{result.nominalCagr.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Real CAGR (after {inflation}% inflation)</span>
                      <span className={`font-bold ${result.realCagr > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {result.realCagr.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl border p-4 ${result.purchasingPowerChange >= 0 ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'}`}>
                <p className={`text-sm font-semibold mb-1 ${result.purchasingPowerChange >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                  Purchasing Power {result.purchasingPowerChange >= 0 ? 'Gained' : 'Lost'}
                </p>
                <p className={`text-sm ${result.purchasingPowerChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  Your salary grew <strong>{result.nominalCagr.toFixed(1)}% CAGR nominally</strong>, but only <strong>{result.realCagr.toFixed(1)}% in real terms</strong> after {inflation}% annual inflation. Your purchasing power has {result.purchasingPowerChange >= 0 ? 'increased' : 'decreased'} by {Math.abs(result.purchasingPowerChange).toFixed(1)}%.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        {result && result.chartData.length >= 2 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Nominal vs Real Salary Growth</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={result.chartData}>
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickFormatter={(v) => fmtL(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} width={70} />
                <Tooltip
                  formatter={(value: number, name: string) => [fmtL(value), name === 'nominal' ? 'Nominal CTC' : `Real CTC (${result.first.year} ₹)`]}
                  contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                />
                <Legend formatter={(v) => v === 'nominal' ? 'Nominal CTC' : `Real CTC (in ${result.first.year} rupees)`} />
                <Line type="monotone" dataKey="nominal" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 5 }} name="nominal" />
                <Line type="monotone" dataKey="real" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5 }} strokeDasharray="5 5" name="real" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Dashed green line shows your salary adjusted for inflation — what it was actually worth in {result.first.year} rupees.
            </p>
          </div>
        )}

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Inflation rate used is a flat assumption. Actual consumer price inflation (CPI) varies year to year and differs by consumption basket. This tool provides a simplified view of salary growth in real terms. Data entered is stored locally in your browser only.
          </p>
        </div>
      </div>
    </div>
  );
}
