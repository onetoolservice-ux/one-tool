"use client";
import React, { useState, useMemo } from 'react';
import { Award, Info, CalendarClock, AlertTriangle } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

export const GratuityCalculator = () => {
  const [lastBasic, setLastBasic] = useState(60000);
  const [da, setDa] = useState(0);
  const [yearsOfService, setYearsOfService] = useState(7);
  const [monthsExtra, setMonthsExtra] = useState(8);
  const [coveredByAct, setCoveredByAct] = useState(true);

  // Leave encashment
  const [leavesBalance, setLeavesBalance] = useState(45);
  const [monthlySalary, setMonthlySalary] = useState(80000);

  const result = useMemo(() => {
    const basicDA = lastBasic + da;
    // Round service years: if months >= 6, round up
    const serviceYears = monthsExtra >= 6 ? yearsOfService + 1 : yearsOfService;

    // Gratuity formula
    let gratuity = 0;
    let taxExempt = 0;
    let taxable = 0;

    if (coveredByAct) {
      // Payment of Gratuity Act 1972
      gratuity = (basicDA * 15 * serviceYears) / 26;
      // Tax exemption: min of (actual gratuity, 20L, formula)
      const maxExempt = Math.min(gratuity, 2000000);
      taxExempt = maxExempt;
      taxable = Math.max(0, gratuity - maxExempt);
    } else {
      // Not covered — half month salary for each year
      gratuity = (basicDA * 0.5 * serviceYears);
      // Tax: min(actual, 20L, average 10 months salary)
      const avg10months = basicDA * 10;
      taxExempt = Math.min(gratuity, 2000000, avg10months);
      taxable = Math.max(0, gratuity - taxExempt);
    }

    // Leave encashment (at retirement/resignation)
    const dailySalary = monthlySalary * 12 / 300; // 300 working days
    const leaveEncashment = leavesBalance * dailySalary;
    // Tax: up to 3L exempt for private sector at resignation; full exempt at retirement (govt)
    const leaveExempt = Math.min(leaveEncashment, 300000);
    const leaveTaxable = Math.max(0, leaveEncashment - leaveExempt);

    const totalPayout = gratuity + leaveEncashment;

    return { gratuity, taxExempt, taxable, leaveEncashment, leaveExempt, leaveTaxable, totalPayout, serviceYears };
  }, [lastBasic, da, yearsOfService, monthsExtra, coveredByAct, leavesBalance, monthlySalary]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Gratuity & Leave Encashment"
        subtitle="Payment of Gratuity Act 1972"
        kpis={[
          { label: 'Total Payout', value: fmt(result.totalPayout), color: 'success' },
          { label: 'Gratuity Amount', value: fmt(result.gratuity), color: 'primary' },
          { label: 'Leave Encashment', value: fmt(result.leaveEncashment), color: 'primary' },
          { label: 'Tax Exempt', value: fmt(result.taxExempt + result.leaveExempt), color: 'success' },
        ]}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Gratuity Inputs */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Gratuity Details</h2>

              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <input type="checkbox" id="act" checked={coveredByAct} onChange={e => setCoveredByAct(e.target.checked)} className="accent-amber-500" />
                <div>
                  <label htmlFor="act" className="text-sm font-semibold text-amber-800 dark:text-amber-300">Covered by Gratuity Act</label>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Organisations with 10+ employees</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Last Basic Salary (₹/month)</label>
                <input type="number" className={inputCls} value={lastBasic} onChange={e => setLastBasic(+e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Dearness Allowance — DA (₹/month)</label>
                <input type="number" className={inputCls} value={da} onChange={e => setDa(+e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelCls}>Years of Service</label>
                  <input type="number" className={inputCls} value={yearsOfService} min={0} onChange={e => setYearsOfService(+e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Extra Months</label>
                  <input type="number" className={inputCls} value={monthsExtra} min={0} max={11} onChange={e => setMonthsExtra(+e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-slate-400">Min 5 years required for gratuity. Months ≥ 6 rounds up.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-800 dark:text-slate-200">Leave Encashment</h2>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Leave Balance (days)</label>
                <input type="number" className={inputCls} value={leavesBalance} onChange={e => setLeavesBalance(+e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Monthly CTC / Basic (₹)</label>
                <input type="number" className={inputCls} value={monthlySalary} onChange={e => setMonthlySalary(+e.target.value)} />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Total payout */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="text-sm opacity-80 mb-1">Total Payout on Exit</div>
              <div className="text-5xl font-bold">{fmt(result.totalPayout)}</div>
              <div className="text-sm opacity-70 mt-2">Gratuity + Leave Encashment</div>
            </div>

            {/* Gratuity breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Gratuity Breakdown</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Basic + DA', value: lastBasic + da, suffix: '/month' },
                  { label: 'Service (rounded)', value: result.serviceYears, suffix: ' years', isCurrency: false },
                  { label: coveredByAct ? 'Formula: (B+DA × 15 × years) / 26' : 'Formula: B+DA × 0.5 × years', value: null },
                  { label: 'Gratuity Amount', value: result.gratuity, bold: true },
                  { label: 'Tax Exempt (max ₹20L)', value: result.taxExempt, green: true },
                  { label: 'Taxable Gratuity', value: result.taxable, red: result.taxable > 0 },
                ].map((r, i) => r.value !== null && (
                  <div key={i} className={`flex justify-between py-1 border-b border-slate-50 dark:border-slate-800 ${r.bold ? 'font-semibold' : ''}`}>
                    <span className="text-slate-500">{r.label}</span>
                    <span className={r.green ? 'text-emerald-600 dark:text-emerald-400' : (r as { red?: boolean }).red ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}>
                      {(r as { isCurrency?: boolean }).isCurrency === false ? `${r.value}${(r as { suffix?: string }).suffix || ''}` : fmt(r.value as number)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Encashment breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Leave Encashment Breakdown</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Leave Balance', value: `${leavesBalance} days` },
                  { label: 'Daily Salary', value: fmt(monthlySalary * 12 / 300) },
                  { label: 'Leave Encashment', value: fmt(result.leaveEncashment), bold: true },
                  { label: 'Tax Exempt (private sector)', value: fmt(result.leaveExempt), green: true },
                  { label: 'Taxable Amount', value: fmt(result.leaveTaxable), red: result.leaveTaxable > 0 },
                ].map((r, i) => (
                  <div key={i} className={`flex justify-between py-1 border-b border-slate-50 dark:border-slate-800 ${r.bold ? 'font-semibold' : ''}`}>
                    <span className="text-slate-500">{r.label}</span>
                    <span className={r.green ? 'text-emerald-600 dark:text-emerald-400' : r.red ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex gap-3">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Gratuity requires minimum 5 years of continuous service. Maximum tax-free limit is ₹20 Lakhs (Budget 2023).
                Leave encashment of up to ₹3L is tax-free for private sector employees at resignation; fully exempt for government employees at retirement.
              </p>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Calculated as per the Payment of Gratuity Act, 1972 (for Act-covered organisations with 10+ employees). Actual gratuity payout depends on your company&apos;s policy, last drawn salary, and HR verification. Tax exemption limits are as per current IT rules — consult a Chartered Accountant for exact tax treatment at the time of exit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
