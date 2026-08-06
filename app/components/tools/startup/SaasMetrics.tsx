"use client";
import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

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

type Status = 'good' | 'warn' | 'bad';

function MetricCard({ label, value, benchmark, status, detail }: { label: string; value: string; benchmark: string; status: Status; detail?: string }) {
  const colors: Record<Status, string> = {
    good: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20',
    warn: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
    bad: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
  };
  const textColors: Record<Status, string> = {
    good: 'text-emerald-700 dark:text-emerald-300',
    warn: 'text-amber-700 dark:text-amber-300',
    bad: 'text-red-700 dark:text-red-300',
  };
  const Icon = status === 'good' ? TrendingUp : status === 'bad' ? TrendingDown : Minus;
  return (
    <div className={`rounded-xl border p-4 ${colors[status]}`}>
      <div className="flex justify-between items-start mb-1">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <Icon className={`w-4 h-4 ${textColors[status]}`} />
      </div>
      <p className={`text-xl font-bold mb-1 ${textColors[status]}`}>{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{benchmark}</p>
      {detail && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{detail}</p>}
    </div>
  );
}

export function SaasMetrics() {
  const [mrr, setMrr] = useState(500000);
  const [newMrr, setNewMrr] = useState(80000);
  const [churnedMrr, setChurnedMrr] = useState(15000);
  const [expansionMrr, setExpansionMrr] = useState(20000);
  const [customers, setCustomers] = useState(120);
  const [newCustomers, setNewCustomers] = useState(15);
  const [churnedCustomers, setChurnedCustomers] = useState(3);
  const [cac, setCac] = useState(5000);
  const [grossMargin, setGrossMargin] = useState(70);

  const m = useMemo(() => {
    const arr = mrr * 12;
    const netMrrGrowth = newMrr + expansionMrr - churnedMrr;
    const prevMrr = mrr - netMrrGrowth;
    const mrrGrowthRate = prevMrr > 0 ? (netMrrGrowth / prevMrr) * 100 : 0;

    const prevCustomers = customers - newCustomers + churnedCustomers;
    const revChurnRate = prevMrr > 0 ? (churnedMrr / prevMrr) * 100 : 0;
    const custChurnRate = prevCustomers > 0 ? (churnedCustomers / prevCustomers) * 100 : 0;

    const arpu = customers > 0 ? mrr / customers : 0;
    const ltv = custChurnRate > 0 ? (arpu * (grossMargin / 100)) / (custChurnRate / 100) : 0;
    const ltvCac = cac > 0 ? ltv / cac : 0;
    const cacPayback = arpu > 0 && grossMargin > 0 ? cac / (arpu * (grossMargin / 100)) : 0;
    const quickRatio = churnedMrr > 0 ? (newMrr + expansionMrr) / churnedMrr : Infinity;

    // Health score (0-100)
    let health = 0;
    if (ltvCac > 3) health += 25; else if (ltvCac > 1) health += 12;
    if (revChurnRate < 2) health += 25; else if (revChurnRate < 5) health += 12;
    if (quickRatio > 4) health += 25; else if (quickRatio > 1) health += 12;
    if (cacPayback < 12) health += 25; else if (cacPayback < 18) health += 12;

    const status = (val: number, good: number, ok: number, higher: boolean): Status => {
      if (higher) return val >= good ? 'good' : val >= ok ? 'warn' : 'bad';
      return val <= good ? 'good' : val <= ok ? 'warn' : 'bad';
    };

    return {
      arr, netMrrGrowth, mrrGrowthRate, revChurnRate, custChurnRate,
      arpu, ltv, ltvCac, cacPayback, quickRatio, health,
      metrics: [
        { label: 'ARR', value: fmtL(arr), benchmark: 'Annual Recurring Revenue = MRR × 12', status: 'good' as Status },
        { label: 'MRR Growth Rate', value: mrrGrowthRate.toFixed(1) + '%', benchmark: 'Good: >10% / month', status: status(mrrGrowthRate, 10, 5, true) },
        { label: 'Revenue Churn', value: revChurnRate.toFixed(1) + '%', benchmark: 'Good: <2% | Warn: 2-5% | Bad: >5%', status: status(revChurnRate, 2, 5, false) },
        { label: 'Customer Churn', value: custChurnRate.toFixed(1) + '%', benchmark: 'Good: <2% | Warn: 2-5% | Bad: >5%', status: status(custChurnRate, 2, 5, false) },
        { label: 'LTV', value: fmtL(ltv), benchmark: 'Customer Lifetime Value', status: status(ltvCac, 3, 1, true) },
        { label: 'LTV:CAC Ratio', value: ltvCac.toFixed(1) + 'x', benchmark: 'Good: >3x | Warn: 1-3x | Bad: <1x', status: status(ltvCac, 3, 1, true), detail: `CAC: ${fmt(cac)}` },
        { label: 'CAC Payback', value: isFinite(cacPayback) ? cacPayback.toFixed(1) + ' mo' : '—', benchmark: 'Good: <12mo | Warn: 12-18mo | Bad: >18mo', status: status(cacPayback, 12, 18, false) },
        { label: 'Quick Ratio', value: isFinite(quickRatio) ? quickRatio.toFixed(1) + 'x' : '∞', benchmark: 'Good: >4 | OK: 1-4 | Bad: <1 (shrinking)', status: status(quickRatio, 4, 1, true) },
      ],
    };
  }, [mrr, newMrr, churnedMrr, expansionMrr, customers, newCustomers, churnedCustomers, cac, grossMargin]);

  const kpis = [
    { label: 'MRR', value: fmtL(mrr), color: 'text-violet-600 dark:text-violet-400' },
    { label: 'ARR', value: fmtL(m.arr), color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'LTV:CAC', value: m.ltvCac.toFixed(1) + 'x', color: m.ltvCac >= 3 ? 'text-emerald-600 dark:text-emerald-400' : m.ltvCac >= 1 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400' },
    { label: 'Health Score', value: m.health + '/100', color: m.health >= 75 ? 'text-emerald-600 dark:text-emerald-400' : m.health >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div>
      <SAPHeader
        fullWidth
        title="SaaS Metrics Dashboard"
        subtitle="MRR, ARR, LTV, CAC, Churn — your north star metrics"
        kpis={kpis}
      />
      <div className="p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Revenue Inputs */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Revenue Metrics (This Month)</p>
            <div className="space-y-3">
              {[
                { label: 'MRR — Monthly Recurring Revenue (₹)', val: mrr, set: setMrr },
                { label: 'New MRR Added (₹)', val: newMrr, set: setNewMrr },
                { label: 'Expansion MRR — Upgrades (₹)', val: expansionMrr, set: setExpansionMrr },
                { label: 'Churned MRR — Cancellations (₹)', val: churnedMrr, set: setChurnedMrr },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p className={labelCls + ' mb-1'}>{label}</p>
                  <input type="number" className={inputCls} value={val} onChange={(e) => set(Number(e.target.value))} />
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Unit Economics */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Customer & Unit Economics</p>
            <div className="space-y-3">
              {[
                { label: 'Total Customers (end of month)', val: customers, set: setCustomers },
                { label: 'New Customers This Month', val: newCustomers, set: setNewCustomers },
                { label: 'Churned Customers This Month', val: churnedCustomers, set: setChurnedCustomers },
                { label: 'CAC — Customer Acquisition Cost (₹)', val: cac, set: setCac },
                { label: 'Gross Margin (%)', val: grossMargin, set: setGrossMargin },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p className={labelCls + ' mb-1'}>{label}</p>
                  <input type="number" className={inputCls} value={val} onChange={(e) => set(Number(e.target.value))} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {m.metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        {/* Health Score */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Overall Business Health</p>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={m.health >= 75 ? '#10b981' : m.health >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${m.health} ${100 - m.health}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-300 rotate-0">
                {m.health}
              </span>
            </div>
            <div>
              <p className={`text-lg font-bold mb-1 ${m.health >= 75 ? 'text-emerald-600 dark:text-emerald-400' : m.health >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {m.health >= 75 ? 'Healthy' : m.health >= 50 ? 'Needs Attention' : 'Critical'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Scored across LTV:CAC ({m.ltvCac >= 3 ? '25/25' : m.ltvCac >= 1 ? '12/25' : '0/25'}), Churn ({m.revChurnRate < 2 ? '25/25' : m.revChurnRate < 5 ? '12/25' : '0/25'}), Quick Ratio, and CAC Payback.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Benchmarks vary by industry, stage, and business model. SaaS metrics for B2B enterprise differ significantly from B2C or usage-based models. LTV calculation assumes constant churn and ARPU. This tool is for internal planning purposes only and should not be used for investor reporting without proper accounting verification.
          </p>
        </div>
      </div>
    </div>
  );
}
