'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Briefcase, CheckCircle, XCircle, Info } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400 transition-colors w-full';
const labelCls =
  'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

// ─────────────────────────────────────────────────────────────────────────────

export function FnFCalculator() {
  const [monthlyCTC, setMonthlyCTC] = useState(80000);
  const [basicSalary, setBasicSalary] = useState(32000);
  const [noticePeriodDays, setNoticePeriodDays] = useState(90);
  const [noticeServedDays, setNoticeServedDays] = useState(30);
  const [yearsOfService, setYearsOfService] = useState(4);
  const [extraMonths, setExtraMonths] = useState(8);
  const [leaveBalance, setLeaveBalance] = useState(25);
  const [arrears, setArrears] = useState(0);
  const [gratuityEligible, setGratuityEligible] = useState(false);

  const calc = useMemo(() => {
    // Notice period shortfall
    const noticeShortfall = Math.max(0, noticePeriodDays - noticeServedDays);
    const noticeRecovery = (basicSalary / 30) * noticeShortfall;

    // Salary for days served in notice period (pro-rated from monthly CTC)
    const salaryForNoticePeriod = (monthlyCTC / 30) * noticeServedDays;

    // Leave encashment: (basic × 12 / 300) × leave_days
    const leaveEncashment = ((basicSalary * 12) / 300) * leaveBalance;

    // Gratuity: (basic × 15 × years) / 26 — only if ≥ 5 years
    const totalYears = yearsOfService + extraMonths / 12;
    const gratuityQualified = gratuityEligible && totalYears >= 5;
    const gratuity = gratuityQualified ? (basicSalary * 15 * totalYears) / 26 : 0;

    // Total FnF
    const totalFnF = salaryForNoticePeriod + arrears + leaveEncashment + gratuity - noticeRecovery;

    return {
      noticeShortfall,
      noticeRecovery,
      salaryForNoticePeriod,
      leaveEncashment,
      gratuity,
      gratuityQualified,
      totalFnF,
      totalYears,
    };
  }, [
    monthlyCTC, basicSalary, noticePeriodDays, noticeServedDays,
    yearsOfService, extraMonths, leaveBalance, arrears, gratuityEligible,
  ]);

  const isPositive = calc.totalFnF >= 0;

  const breakdown = [
    {
      component: 'Salary for Notice Served',
      amount: calc.salaryForNoticePeriod,
      taxable: true,
      note: `${noticeServedDays} days worked`,
    },
    {
      component: 'Leave Encashment',
      amount: calc.leaveEncashment,
      taxable: true,
      note: `${leaveBalance} days × (Basic×12/300)`,
    },
    {
      component: 'Arrears',
      amount: arrears,
      taxable: true,
      note: 'Any pending dues',
    },
    {
      component: 'Gratuity',
      amount: calc.gratuity,
      taxable: calc.gratuity > 2000000,
      note: calc.gratuityQualified
        ? `${calc.totalYears.toFixed(1)} yrs × Basic × 15/26`
        : 'Not eligible (< 5 yrs or not covered)',
    },
    {
      component: 'Notice Period Recovery',
      amount: -calc.noticeRecovery,
      taxable: false,
      note: calc.noticeShortfall > 0 ? `${calc.noticeShortfall} days shortfall` : 'No shortfall',
      deduction: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        fullWidth
        title="Full &amp; Final Settlement"
        subtitle="Know what your company owes you on exit"
        kpis={[
          {
            label: 'Total FnF Amount',
            value: fmt(calc.totalFnF),
            icon: Briefcase,
            color: isPositive ? 'success' : 'error',
          },
          {
            label: 'Notice Recovery',
            value: calc.noticeRecovery > 0 ? `-${fmt(calc.noticeRecovery)}` : 'NIL',
            icon: XCircle,
            color: calc.noticeRecovery > 0 ? 'error' : 'neutral',
          },
          {
            label: 'Leave Encashment',
            value: fmt(calc.leaveEncashment),
            icon: CheckCircle,
            color: 'success',
          },
          {
            label: 'Gratuity',
            value: calc.gratuityQualified ? fmt(calc.gratuity) : 'Not Eligible',
            icon: Info,
            color: calc.gratuityQualified ? 'success' : 'neutral',
          },
        ]}
      />

      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">
              Employment Details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Monthly CTC (₹)</label>
                <input className={inputCls} type="number" value={monthlyCTC}
                  onChange={e => setMonthlyCTC(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Basic Salary (₹/mo)</label>
                <input className={inputCls} type="number" value={basicSalary}
                  onChange={e => setBasicSalary(+e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Notice Period (days)</label>
                <input className={inputCls} type="number" value={noticePeriodDays}
                  onChange={e => setNoticePeriodDays(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Notice Served (days)</label>
                <input className={inputCls} type="number" value={noticeServedDays}
                  onChange={e => setNoticeServedDays(+e.target.value)} />
              </div>
            </div>

            {calc.noticeShortfall > 0 && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                <XCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
                  Notice shortfall: {calc.noticeShortfall} days — recovery of {fmt(calc.noticeRecovery)} will be deducted
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Years of Service</label>
                <input className={inputCls} type="number" value={yearsOfService} min={0}
                  onChange={e => setYearsOfService(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Extra Months</label>
                <input className={inputCls} type="number" value={extraMonths} min={0} max={11}
                  onChange={e => setExtraMonths(+e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Leave Balance (days)</label>
                <input className={inputCls} type="number" value={leaveBalance} min={0}
                  onChange={e => setLeaveBalance(+e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Arrears Due (₹)</label>
                <input className={inputCls} type="number" value={arrears} min={0}
                  onChange={e => setArrears(+e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Gratuity Act Applicable</label>
              <div className="flex gap-2 mt-1">
                {[
                  { label: 'Yes (covered)', value: true },
                  { label: 'No / Not sure', value: false },
                ].map(opt => (
                  <button key={String(opt.value)} onClick={() => setGratuityEligible(opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${gratuityEligible === opt.value ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Gratuity Act applies to establishments with 10+ employees. Requires minimum 5 years of continuous service.
              </p>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide mb-4">
                Settlement Breakdown
              </h3>
              <div className="space-y-1">
                {breakdown.map((row, i) => (
                  <div key={i}
                    className={`flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 ${row.amount === 0 ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${row.deduction ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {row.component}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{row.note}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-black ${row.deduction ? 'text-red-600 dark:text-red-400' : row.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {row.amount !== 0 ? (row.deduction ? fmt(Math.abs(row.amount)) : fmt(row.amount)) : '—'}
                      </p>
                      {row.amount !== 0 && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {row.taxable ? 'Taxable' : 'Non-taxable'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className={`mt-4 rounded-xl p-4 flex justify-between items-center ${isPositive ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                <div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Total FnF {isPositive ? 'Receivable' : 'Payable'}
                  </p>
                  {!isPositive && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                      You owe notice buy-out to the company
                    </p>
                  )}
                </div>
                <p className={`text-2xl font-black ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {fmt(Math.abs(calc.totalFnF))}
                </p>
              </div>
            </div>

            {/* Process note */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4 space-y-2">
              <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                FnF Process Notes
              </p>
              <ul className="space-y-1.5">
                {[
                  'FnF is usually settled within 30–45 days of last working day',
                  'Notice recovery is deducted at basic salary rate by most employers',
                  'Gratuity is exempt from tax up to ₹20L for covered employees',
                  'Leave encashment at retirement/resignation is taxable for private sector employees',
                  'Collect Form 16 and PF settlement details before your last day',
                ].map((note, i) => (
                  <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5 shrink-0">•</span> {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 flex gap-3">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Disclaimer:</strong> This is an indicative calculator. Actual FnF depends on your employment contract,
            company policy, applicable leave encashment rules, and HR discretion. Gratuity eligibility requires minimum
            5 years of continuous service under the Payment of Gratuity Act. Consult HR and a legal/tax advisor for precise settlement.
          </p>
        </div>
      </div>
    </div>
  );
}
