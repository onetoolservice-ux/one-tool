"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Info, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { getPFFinanceSummary } from '../finance/pf-data-bridge';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// Action deep-links per metric area
const METRIC_ACTIONS: Record<string, { label: string; href: string }[]> = {
  savings: [
    { label: 'View Spending Breakdown', href: '/tools/personal-finance/pf-expenditure' },
    { label: 'Set Up Budget', href: '/tools/personal-finance/pf-budget-vs-actual' },
  ],
  emergency: [
    { label: 'FD Calculator', href: '/tools/finance/fd-calculator' },
    { label: 'Budget Planner', href: '/tools/finance/smart-budget' },
  ],
  debt: [
    { label: 'Debt Snowball / Avalanche', href: '/tools/finance/debt-planner' },
    { label: 'Home Loan Prepayment', href: '/tools/real-estate/home-loan-emi' },
  ],
  insurance: [
    { label: 'Tax Saving (80D)', href: '/tools/gst-tax/deduction-tracker' },
  ],
  investment: [
    { label: 'SIP Calculator', href: '/tools/finance/smart-sip' },
    { label: 'Investment Tracker', href: '/tools/personal-finance/pf-investment-tracker' },
    { label: 'NPS Calculator', href: '/tools/finance/nps-calculator' },
  ],
};

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

interface Metric {
  id: string;
  label: string;
  score: number; // 0-20
  max: 20;
  value: string;
  status: 'great' | 'ok' | 'poor';
  advice: string;
}

export const FinancialHealthScore = () => {
  const [monthlyIncome, setMonthlyIncome] = useState(80000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(55000);
  const [emergencyFund, setEmergencyFund] = useState(150000);
  const [totalDebt, setTotalDebt] = useState(500000);
  const [monthlyEMI, setMonthlyEMI] = useState(15000);
  const [hasLifeInsurance, setHasLifeInsurance] = useState(true);
  const [hasHealthInsurance, setHasHealthInsurance] = useState(true);
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [hasWill, setHasWill] = useState(false);
  const [pfLoaded, setPfLoaded] = useState(false);

  // Auto-load from PF store
  useEffect(() => {
    try {
      const s = getPFFinanceSummary(3);
      if (s.hasData && !pfLoaded) {
        setMonthlyIncome(Math.round(s.avgMonthlyIncome));
        setMonthlyExpenses(Math.round(s.avgMonthlyExpense));
        setPfLoaded(true);
      }
    } catch {}
  }, [pfLoaded]);

  const metrics = useMemo((): Metric[] => {
    // 1. Savings Rate (0-20)
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const savingsScore = savingsRate >= 30 ? 20 : savingsRate >= 20 ? 15 : savingsRate >= 10 ? 10 : savingsRate >= 0 ? 5 : 0;

    // 2. Emergency Fund (0-20): months of expenses covered
    const emergencyMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    const emergencyScore = emergencyMonths >= 6 ? 20 : emergencyMonths >= 3 ? 12 : emergencyMonths >= 1 ? 6 : 0;

    // 3. Debt-to-Income Ratio (0-20): lower is better
    const annualDebtService = monthlyEMI * 12;
    const annualIncome = monthlyIncome * 12;
    const dtiRatio = annualIncome > 0 ? (annualDebtService / annualIncome) * 100 : 0;
    const debtScore = dtiRatio === 0 ? 20 : dtiRatio <= 20 ? 16 : dtiRatio <= 35 ? 10 : dtiRatio <= 50 ? 5 : 0;

    // 4. Insurance (0-20)
    const insuranceScore = (hasLifeInsurance ? 10 : 0) + (hasHealthInsurance ? 10 : 0);

    // 5. Investment Rate (0-20): % of income invested
    const investRate = monthlyIncome > 0 ? (monthlyInvestment / monthlyIncome) * 100 : 0;
    const investScore = investRate >= 20 ? 20 : investRate >= 10 ? 14 : investRate >= 5 ? 8 : investRate > 0 ? 4 : 0;

    return [
      {
        id: 'savings', label: 'Savings Rate', score: savingsScore, max: 20,
        value: `${savingsRate.toFixed(1)}%`,
        status: savingsScore >= 15 ? 'great' : savingsScore >= 8 ? 'ok' : 'poor',
        advice: savingsScore >= 15 ? 'Excellent savings discipline!' : savingsScore >= 8 ? 'Aim for 20-30% savings rate' : 'Reduce expenses or increase income to save more',
      },
      {
        id: 'emergency', label: 'Emergency Fund', score: emergencyScore, max: 20,
        value: `${emergencyMonths.toFixed(1)} months`,
        status: emergencyScore >= 15 ? 'great' : emergencyScore >= 8 ? 'ok' : 'poor',
        advice: emergencyScore >= 15 ? 'Well protected against emergencies!' : emergencyScore >= 8 ? 'Build up to 6 months of expenses' : 'Prioritise building emergency fund first',
      },
      {
        id: 'debt', label: 'Debt Load', score: debtScore, max: 20,
        value: dtiRatio === 0 ? 'Debt-free!' : `${dtiRatio.toFixed(1)}% DTI`,
        status: debtScore >= 15 ? 'great' : debtScore >= 8 ? 'ok' : 'poor',
        advice: debtScore >= 15 ? 'Low debt burden — great position!' : debtScore >= 8 ? 'Work on reducing high-interest debt' : 'EMIs are consuming too much income — consider prepayment',
      },
      {
        id: 'insurance', label: 'Insurance Coverage', score: insuranceScore, max: 20,
        value: `${[hasLifeInsurance ? 'Life' : null, hasHealthInsurance ? 'Health' : null].filter(Boolean).join(' + ') || 'None'}`,
        status: insuranceScore >= 18 ? 'great' : insuranceScore >= 10 ? 'ok' : 'poor',
        advice: insuranceScore >= 18 ? 'Well insured — family is protected' : !hasLifeInsurance ? 'Get a term life insurance immediately' : 'Get health insurance to protect savings',
      },
      {
        id: 'investment', label: 'Investment Rate', score: investScore, max: 20,
        value: `${investRate.toFixed(1)}%`,
        status: investScore >= 15 ? 'great' : investScore >= 8 ? 'ok' : 'poor',
        advice: investScore >= 15 ? 'Great investment discipline!' : investScore >= 8 ? 'Try to increase SIP/investment by 10%' : 'Start investing even a small amount regularly',
      },
    ];
  }, [monthlyIncome, monthlyExpenses, emergencyFund, monthlyEMI, hasLifeInsurance, hasHealthInsurance, monthlyInvestment]);

  const totalScore = metrics.reduce((s, m) => s + m.score, 0);
  const grade = totalScore >= 85 ? 'A+' : totalScore >= 70 ? 'A' : totalScore >= 55 ? 'B' : totalScore >= 40 ? 'C' : 'D';
  const gradeColor = totalScore >= 85 ? 'text-emerald-600 dark:text-emerald-400' : totalScore >= 70 ? 'text-blue-600 dark:text-blue-400' : totalScore >= 55 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500';
  const gradeLabel = totalScore >= 85 ? 'Excellent' : totalScore >= 70 ? 'Good' : totalScore >= 55 ? 'Fair' : totalScore >= 40 ? 'Needs Work' : 'Critical';

  const weakestMetric = metrics.reduce((a, b) => (a.score / a.max < b.score / b.max ? a : b));
  const scoreKpiColor = totalScore >= 70 ? 'success' : totalScore >= 40 ? 'warning' : 'error';

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Financial Health Score"
        subtitle="5-dimension financial fitness assessment"
        kpis={[
          { label: 'Score / 100', value: String(totalScore), color: scoreKpiColor as 'success' | 'warning' | 'error' },
          { label: 'Grade', value: `${grade} — ${gradeLabel}`, color: 'neutral' },
          { label: 'Weakest Area', value: weakestMetric.label, color: 'warning' },
          { label: 'Data Source', value: pfLoaded ? 'From Statements' : 'Manual', color: 'neutral' },
        ]}
      />

      <div className="p-4 space-y-4">
        {pfLoaded && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-2 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Income & expenses auto-filled from your statement data
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Your Finances</h2>

            <div className="space-y-1">
              <label className={labelCls}>Monthly Income (₹)</label>
              <input type="number" className={inputCls} value={monthlyIncome} onChange={e => setMonthlyIncome(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Monthly Expenses (₹)</label>
              <input type="number" className={inputCls} value={monthlyExpenses} onChange={e => setMonthlyExpenses(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Emergency Fund (₹)</label>
              <input type="number" className={inputCls} value={emergencyFund} onChange={e => setEmergencyFund(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Total Debt Outstanding (₹)</label>
              <input type="number" className={inputCls} value={totalDebt} onChange={e => setTotalDebt(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Monthly EMI / Debt Payments (₹)</label>
              <input type="number" className={inputCls} value={monthlyEMI} onChange={e => setMonthlyEMI(+e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Monthly SIP / Investment (₹)</label>
              <input type="number" className={inputCls} value={monthlyInvestment} onChange={e => setMonthlyInvestment(+e.target.value)} />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {[
                { label: 'Term Life Insurance', state: hasLifeInsurance, setter: setHasLifeInsurance },
                { label: 'Health Insurance', state: hasHealthInsurance, setter: setHasHealthInsurance },
                { label: 'Will / Nomination done', state: hasWill, setter: setHasWill },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" checked={item.state} onChange={e => item.setter(e.target.checked)} className="accent-emerald-500" />
                  <label className="text-sm text-slate-700 dark:text-slate-300">{item.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="lg:col-span-2 space-y-4">
            {/* Big score */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Financial Health Score</div>
              <div className={`text-7xl font-black ${gradeColor}`}>{totalScore}</div>
              <div className="text-slate-400 text-sm mt-1">out of 100</div>
              <div className={`text-2xl font-bold mt-2 ${gradeColor}`}>{grade} — {gradeLabel}</div>
              {/* Progress bar */}
              <div className="mt-4 w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalScore}%`,
                    background: totalScore >= 70 ? '#10b981' : totalScore >= 50 ? '#f59e0b' : '#ef4444',
                  }} />
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              {metrics.map(m => (
                <div key={m.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {m.status === 'great' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                       m.status === 'ok' ? <TrendingUp className="w-4 h-4 text-amber-500" /> :
                       <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{m.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{m.value}</span>
                      <span className={`font-bold text-sm ${m.status === 'great' ? 'text-emerald-600 dark:text-emerald-400' : m.status === 'ok' ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                        {m.score}/{m.max}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${(m.score / m.max) * 100}%`,
                        background: m.status === 'great' ? '#10b981' : m.status === 'ok' ? '#f59e0b' : '#ef4444',
                      }} />
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{m.advice}</p>
                  {m.status !== 'great' && METRIC_ACTIONS[m.id]?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {METRIC_ACTIONS[m.id].map(action => (
                        <a key={action.href} href={action.href}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                          {action.label} <ArrowRight className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasWill && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800 flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">+Bonus: Will/nominations done — estate planning is complete!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
