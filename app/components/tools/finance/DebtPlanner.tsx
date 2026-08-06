"use client";
import React, { useState, useMemo } from 'react';
import { CreditCard, Plus, Trash2, TrendingDown, Trophy, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtCr = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-purple-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

function calcPayoff(debts: Debt[], extraPayment: number, method: 'snowball' | 'avalanche'): { months: number; totalInterest: number; timeline: { month: number; totalRemaining: number }[] } {
  if (!debts.length) return { months: 0, totalInterest: 0, timeline: [] };

  let remaining = debts.map(d => ({ ...d, balance: d.balance }));
  let totalInterest = 0;
  let month = 0;
  const timeline: { month: number; totalRemaining: number }[] = [];

  while (remaining.some(d => d.balance > 0) && month < 600) {
    // Sort by method
    remaining.sort((a, b) => method === 'snowball' ? a.balance - b.balance : b.rate - a.rate);

    // Apply interest
    remaining = remaining.map(d => {
      if (d.balance <= 0) return d;
      const interest = d.balance * (d.rate / 100 / 12);
      totalInterest += interest;
      return { ...d, balance: d.balance + interest };
    });

    // Apply minimum payments
    let leftover = extraPayment;
    remaining = remaining.map(d => {
      if (d.balance <= 0) return d;
      const pay = Math.min(d.minPayment, d.balance);
      return { ...d, balance: Math.max(0, d.balance - pay) };
    });

    // Apply extra to first non-zero debt
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].balance > 0) {
        const pay = Math.min(leftover + 0, remaining[i].balance); // extra goes to priority debt
        remaining[i] = { ...remaining[i], balance: Math.max(0, remaining[i].balance - pay) };
        leftover = Math.max(0, leftover - pay);
        break;
      }
    }
    // Snowball: freed up minimums roll into next
    month++;
    if (month % 3 === 0) {
      timeline.push({ month, totalRemaining: Math.round(remaining.reduce((s, d) => s + d.balance, 0)) });
    }
  }

  return { months: month, totalInterest: Math.round(totalInterest), timeline };
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b'];

export const DebtPlanner = () => {
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: 'Personal Loan', balance: 300000, rate: 14, minPayment: 8000 },
    { id: '2', name: 'Credit Card', balance: 80000, rate: 36, minPayment: 2000 },
    { id: '3', name: 'Car Loan', balance: 500000, rate: 10, minPayment: 12000 },
  ]);
  const [extraPayment, setExtraPayment] = useState(5000);
  const [method, setMethod] = useState<'snowball' | 'avalanche'>('avalanche');
  const [showTimeline, setShowTimeline] = useState(false);

  const addDebt = () => {
    setDebts(prev => [...prev, { id: Date.now().toString(), name: 'New Debt', balance: 100000, rate: 12, minPayment: 3000 }]);
  };

  const removeDebt = (id: string) => setDebts(prev => prev.filter(d => d.id !== id));
  const updateDebt = (id: string, field: keyof Debt, value: string | number) =>
    setDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));

  const snowball = useMemo(() => calcPayoff(debts, extraPayment, 'snowball'), [debts, extraPayment]);
  const avalanche = useMemo(() => calcPayoff(debts, extraPayment, 'avalanche'), [debts, extraPayment]);
  const current = method === 'snowball' ? snowball : avalanche;
  const other = method === 'snowball' ? avalanche : snowball;

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const noExtraMonths = useMemo(() => calcPayoff(debts, 0, 'avalanche'), [debts]);

  const chartData = current.timeline.map(t => ({ month: `M${t.month}`, remaining: t.totalRemaining }));

  const debtFreeStr = `${Math.floor(current.months / 12)}y ${current.months % 12}m`;
  const vsNoExtraStr = noExtraMonths.months > current.months
    ? `-${noExtraMonths.months - current.months} mo`
    : 'On track';

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Debt Planner"
        subtitle={method === 'avalanche' ? 'Avalanche — highest rate first, saves most interest' : 'Snowball — lowest balance first, quick wins'}
        kpis={[
          {
            label: 'Total Debt',
            value: fmtCr(totalDebt),
            color: 'error',
            subtitle: `${debts.length} debts`,
          },
          {
            label: 'Debt-Free In',
            value: debtFreeStr,
            color: 'neutral',
            subtitle: method === 'avalanche' ? 'Avalanche method' : 'Snowball method',
          },
          {
            label: 'Total Interest',
            value: fmtCr(current.totalInterest),
            color: 'warning',
            subtitle: 'With extra payments',
          },
          {
            label: 'vs No Extra',
            value: vsNoExtraStr,
            color: 'neutral',
            subtitle: noExtraMonths.months > current.months
              ? `Save ${fmtCr(noExtraMonths.totalInterest - current.totalInterest)}`
              : 'No extra payment set',
          },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Method toggle */}
        <div className="flex gap-2">
          {(['avalanche', 'snowball'] as const).map(m => (
            <button key={m} onClick={() => setMethod(m)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${method === m
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
              {m === 'avalanche' ? 'Avalanche' : 'Snowball'}
              <span className="ml-2 text-xs font-normal opacity-70">
                {m === 'avalanche' ? '(Highest rate first — saves most interest)' : '(Lowest balance first — quick wins)'}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Debt list */}
          <div className="lg:col-span-2 space-y-3">
            {debts.map((d, i) => (
              <div key={d.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <input className="flex-1 text-sm font-semibold bg-transparent border-none outline-none text-slate-800 dark:text-slate-200"
                    value={d.name} onChange={e => updateDebt(d.id, 'name', e.target.value)} />
                  <button onClick={() => removeDebt(d.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={labelCls}>Balance ₹</label>
                    <input type="number" className={inputCls} value={d.balance} onChange={e => updateDebt(d.id, 'balance', +e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Rate %</label>
                    <input type="number" className={inputCls} value={d.rate} step={0.5} onChange={e => updateDebt(d.id, 'rate', +e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Min EMI ₹</label>
                    <input type="number" className={inputCls} value={d.minPayment} onChange={e => updateDebt(d.id, 'minPayment', +e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addDebt}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-purple-400 hover:text-purple-500 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add Debt
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <label className={labelCls}>Extra Monthly Payment (₹)</label>
              <input type="number" className={inputCls + ' mt-1'} value={extraPayment} onChange={e => setExtraPayment(+e.target.value)} />
              <p className="text-xs text-slate-400 mt-2">Amount above minimum payments to accelerate payoff</p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="text-xs text-slate-500 mb-1">Total Debt</div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{fmtCr(totalDebt)}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Debt-Free In</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {Math.floor(current.months / 12)}y {current.months % 12}m
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="text-xs text-slate-500 mb-1">Total Interest</div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{fmtCr(current.totalInterest)}</div>
              </div>
            </div>

            {/* vs other method */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Method Comparison</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`p-3 rounded-xl ${method === 'avalanche' ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-slate-50 dark:bg-slate-800'}`}>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">Avalanche</div>
                  <div className="text-slate-500">{Math.floor(avalanche.months / 12)}y {avalanche.months % 12}m</div>
                  <div className="text-slate-500">{fmtCr(avalanche.totalInterest)} interest</div>
                </div>
                <div className={`p-3 rounded-xl ${method === 'snowball' ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-slate-50 dark:bg-slate-800'}`}>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">Snowball</div>
                  <div className="text-slate-500">{Math.floor(snowball.months / 12)}y {snowball.months % 12}m</div>
                  <div className="text-slate-500">{fmtCr(snowball.totalInterest)} interest</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {method === 'avalanche'
                  ? `Avalanche saves ${fmtCr(snowball.totalInterest - avalanche.totalInterest)} more interest vs Snowball`
                  : `Snowball gives quicker early wins but costs ${fmtCr(snowball.totalInterest - avalanche.totalInterest)} more interest`}
              </div>
              {noExtraMonths.months > current.months && (
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Extra {fmt(extraPayment)}/month saves {noExtraMonths.months - current.months} months &amp; {fmtCr(noExtraMonths.totalInterest - current.totalInterest)} interest
                </div>
              )}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <button className="flex items-center gap-2 w-full text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4"
                  onClick={() => setShowTimeline(!showTimeline)}>
                  <TrendingDown className="w-4 h-4 text-purple-500" />
                  Payoff Timeline
                  {showTimeline ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                </button>
                {showTimeline && (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 6)} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmtCr(v)} width={60} />
                      <Tooltip formatter={(v: number) => fmtCr(v)} />
                      <Bar dataKey="remaining" name="Remaining Debt" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {!showTimeline && (
                  <div className="text-sm text-slate-400">Click to see month-by-month payoff progress</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Payoff timelines assume fixed interest rates and consistent monthly payments. Actual results may vary due to prepayment charges, floating rate revisions, or missed EMIs. Snowball vs Avalanche savings are illustrative. Consult your lender for exact repayment terms and foreclosure charges.
          </p>
        </div>
      </div>
    </div>
  );
};
