'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Clock, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-full';
const labelCls =
  'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#f43f5e'];

// ─────────────────────────────────────────────────────────────────────────────

export function FreelanceRate() {
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [taxPct, setTaxPct] = useState(20);
  const [professionalCosts, setProfessionalCosts] = useState(5000);
  const [marketingCosts, setMarketingCosts] = useState(3000);
  const [savingsTarget, setSavingsTarget] = useState(20000);
  const [workingDays, setWorkingDays] = useState(20);
  const [billableHours, setBillableHours] = useState(6);
  const [unpaidHours, setUnpaidHours] = useState(2);
  const [vacationWeeks, setVacationWeeks] = useState(4);

  const calc = useMemo(() => {
    const workingWeeks = 52 - vacationWeeks;
    const monthsEffective = (workingWeeks / 52) * 12;

    // Effective billable hours/month
    const billableHoursPerMonth = workingDays * billableHours * (workingWeeks / 52) * (52 / 12);

    // Total cost base (monthly)
    const totalMonthlyCosts = monthlyExpenses + professionalCosts + marketingCosts + savingsTarget;

    // Required gross to net out after tax (1 - taxPct/100)
    const requiredGrossMonthly = totalMonthlyCosts / (1 - taxPct / 100);

    // GST note: added on top for client, not affecting net
    const gstNote = requiredGrossMonthly * 12 > 2000000;

    // Min rates
    const minHourlyRate = requiredGrossMonthly / billableHoursPerMonth;
    const minDailyRate = minHourlyRate * billableHours;
    const minWeeklyProjectRate = minDailyRate * 5;

    // Recommended (1.3x), Ideal (1.7x)
    const recHourlyRate = minHourlyRate * 1.3;
    const idealHourlyRate = minHourlyRate * 1.7;

    // Breakdown for chart
    const taxAmount = requiredGrossMonthly * (taxPct / 100);
    const breakdown = [
      { name: 'Living Expenses', value: monthlyExpenses },
      { name: 'Tax', value: taxAmount },
      { name: 'Savings', value: savingsTarget },
      { name: 'Professional Costs', value: professionalCosts },
      { name: 'Marketing', value: marketingCosts },
    ];

    return {
      billableHoursPerMonth,
      requiredGrossMonthly,
      minHourlyRate,
      minDailyRate,
      minWeeklyProjectRate,
      recHourlyRate,
      idealHourlyRate,
      gstNote,
      breakdown,
      taxAmount,
      monthsEffective,
    };
  }, [
    monthlyExpenses, taxPct, professionalCosts, marketingCosts, savingsTarget,
    workingDays, billableHours, unpaidHours, vacationWeeks,
  ]);

  const annualGross = calc.requiredGrossMonthly * 12;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        fullWidth
        title="Freelance Rate Calculator"
        subtitle="Your minimum viable rate to stay profitable"
        kpis={[
          { label: 'Min Hourly Rate', value: fmt(calc.minHourlyRate), icon: Clock, color: 'success' },
          { label: 'Min Daily Rate', value: fmt(calc.minDailyRate), icon: DollarSign, color: 'primary' },
          { label: 'Monthly Target', value: fmt(calc.requiredGrossMonthly), icon: TrendingUp, color: 'neutral' },
          { label: 'Billable Hrs/Month', value: calc.billableHoursPerMonth.toFixed(0) + ' hrs', icon: Zap, color: 'neutral' },
        ]}
      />

      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">
              Your Financial Requirements
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Monthly Expenses (₹)</label>
                <input className={inputCls} type="number" value={monthlyExpenses}
                  onChange={e => setMonthlyExpenses(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Savings Target (₹/mo)</label>
                <input className={inputCls} type="number" value={savingsTarget}
                  onChange={e => setSavingsTarget(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Professional Costs (₹/mo)</label>
                <input className={inputCls} type="number" value={professionalCosts}
                  onChange={e => setProfessionalCosts(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Marketing (₹/mo)</label>
                <input className={inputCls} type="number" value={marketingCosts}
                  onChange={e => setMarketingCosts(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Income Tax Estimate (%)</label>
                <input className={inputCls} type="number" value={taxPct} min={0} max={40}
                  onChange={e => setTaxPct(+e.target.value)} />
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide pt-2 border-t border-slate-100 dark:border-slate-800">
              Working Capacity
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Working Days/Month</label>
                <input className={inputCls} type="number" value={workingDays} min={1} max={26}
                  onChange={e => setWorkingDays(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Billable Hrs/Day</label>
                <input className={inputCls} type="number" value={billableHours} min={1} max={12}
                  onChange={e => setBillableHours(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Unpaid Admin Hrs/Day</label>
                <input className={inputCls} type="number" value={unpaidHours} min={0} max={8}
                  onChange={e => setUnpaidHours(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Vacation Weeks/Year</label>
                <input className={inputCls} type="number" value={vacationWeeks} min={0} max={20}
                  onChange={e => setVacationWeeks(+e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide mb-4">
              Where Your Money Goes (Monthly)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={calc.breakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {calc.breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2 text-center mt-2">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                Required gross billing / month
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{fmt(calc.requiredGrossMonthly)}</p>
            </div>
          </div>
        </div>

        {/* Rate Tiers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide mb-4">
            Rate Tiers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                tier: 'Minimum',
                desc: 'Survival — bare essentials',
                hourly: calc.minHourlyRate,
                daily: calc.minDailyRate,
                weekly: calc.minWeeklyProjectRate,
                annual: annualGross,
                color: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
                textColor: 'text-amber-700 dark:text-amber-300',
                badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
              },
              {
                tier: 'Recommended',
                desc: 'Sustainable + 30% buffer',
                hourly: calc.recHourlyRate,
                daily: calc.recHourlyRate * billableHours,
                weekly: calc.recHourlyRate * billableHours * 5,
                annual: calc.recHourlyRate * calc.billableHoursPerMonth * 12,
                color: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20',
                textColor: 'text-emerald-700 dark:text-emerald-400',
                badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
              },
              {
                tier: 'Ideal',
                desc: 'Thriving + 70% buffer',
                hourly: calc.idealHourlyRate,
                daily: calc.idealHourlyRate * billableHours,
                weekly: calc.idealHourlyRate * billableHours * 5,
                annual: calc.idealHourlyRate * calc.billableHoursPerMonth * 12,
                color: 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20',
                textColor: 'text-violet-700 dark:text-violet-400',
                badge: 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300',
              },
            ].map(t => (
              <div key={t.tier} className={`rounded-xl border-2 ${t.color} p-4 space-y-3`}>
                <div>
                  <span className={`text-[11px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${t.badge}`}>
                    {t.tier}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{t.desc}</p>
                </div>
                {[
                  { label: 'Per Hour', value: fmt(t.hourly) },
                  { label: 'Per Day', value: fmt(t.daily) },
                  { label: 'Per Week', value: fmt(t.weekly) },
                  { label: 'Annual Gross', value: fmt(t.annual) },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{r.label}</span>
                    <span className={`font-black ${t.textColor}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* GST Note */}
        <div className={`rounded-xl border p-4 flex gap-3 ${calc.gstNote ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
          <TrendingUp size={16} className={`shrink-0 mt-0.5 ${calc.gstNote ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">GST Note</p>
            {calc.gstNote ? (
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                Your projected annual billing of <strong>{fmt(annualGross * 1.3)}</strong> exceeds the GST threshold of ₹20L.
                You must register for GST and charge 18% on top of your rates — clients pay this, and you remit it to the government.
                Quote clients your rate + 18% GST separately.
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Your projected billing is below ₹20L/year — GST registration is voluntary but recommended if your clients are GST-registered businesses.
                If you cross ₹20L, mandatory GST registration at 18% applies.
              </p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 flex gap-3">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Disclaimer:</strong> This calculator provides indicative rates only. Actual tax liability depends on your
            income structure, deductions, and applicable slabs. GST thresholds and rules may change. Consult a CA or tax
            professional for precise advice. Rates do not account for market demand or competition.
          </p>
        </div>
      </div>
    </div>
  );
}
