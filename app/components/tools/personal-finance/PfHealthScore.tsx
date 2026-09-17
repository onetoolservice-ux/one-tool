"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShieldCheck, Info, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Share2, Download } from 'lucide-react';
import { getPFFinanceSummary } from '../finance/pf-data-bridge';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// Action deep-links per metric area
const METRIC_ACTIONS: Record<string, { label: string; href: string }[]> = {
  savings: [
    { label: 'View Spending Breakdown', href: '/my-finance/pf-expenditure' },
    { label: 'Set Up Budget', href: '/my-finance/pf-budget-vs-actual' },
  ],
  emergency: [
    { label: 'FD Calculator', href: '/my-finance/fd-calculator' },
    { label: 'Budget Planner', href: '/my-finance/smart-budget' },
  ],
  debt: [
    { label: 'Debt Snowball / Avalanche', href: '/my-finance/debt-planner' },
    { label: 'Home Loan Prepayment', href: '/tools/real-estate/home-loan-emi' },
  ],
  insurance: [
    { label: 'Tax Saving (80D)', href: '/my-finance/deduction-tracker' },
  ],
  investment: [
    { label: 'SIP Calculator', href: '/my-finance/smart-sip' },
    { label: 'Investment Tracker', href: '/my-finance/pf-investment-tracker' },
    { label: 'NPS Calculator', href: '/my-finance/nps-calculator' },
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
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
        if (s.detectedLoanEMIMonthly > 0) setMonthlyEMI(Math.round(s.detectedLoanEMIMonthly));
        if (s.detectedSIPMonthly > 0)     setMonthlyInvestment(Math.round(s.detectedSIPMonthly));
        setPfLoaded(true);
      }
    } catch {}
  }, [pfLoaded]);

  const resyncFromStatements = () => {
    try {
      const s = getPFFinanceSummary(3);
      if (s.hasData) {
        setMonthlyIncome(Math.round(s.avgMonthlyIncome));
        setMonthlyExpenses(Math.round(s.avgMonthlyExpense));
        if (s.detectedLoanEMIMonthly > 0) setMonthlyEMI(Math.round(s.detectedLoanEMIMonthly));
        if (s.detectedSIPMonthly > 0)     setMonthlyInvestment(Math.round(s.detectedSIPMonthly));
      }
    } catch {}
  };

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
  const gradeColor = totalScore >= 70 ? 'text-positive' : totalScore >= 40 ? 'text-warning' : 'text-negative';
  const gradeLabel = totalScore >= 85 ? 'Excellent' : totalScore >= 70 ? 'Good' : totalScore >= 55 ? 'Fair' : totalScore >= 40 ? 'Needs Work' : 'Critical';

  const weakestMetric = metrics.reduce((a, b) => (a.score / a.max < b.score / b.max ? a : b));
  const scoreKpiColor = totalScore >= 70 ? 'success' : totalScore >= 40 ? 'warning' : 'error';

  const shareAsImage = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `financial-health-score-${totalScore}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Share failed', e);
    } finally {
      setSharing(false);
    }
  };

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
          <div className="bg-white dark:bg-slate-900 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-positive" />
              Income, expenses, EMI &amp; SIP auto-filled from your last 3 months of statement data
            </div>
            <button onClick={resyncFromStatements}
              className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg bg-fin-accent/10 text-fin-accent hover:bg-fin-accent/20 transition-colors">
              Re-sync
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700 space-y-4">
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
                  <input type="checkbox" checked={item.state} onChange={e => item.setter(e.target.checked)} className="accent-fin-accent" />
                  <label className="text-sm text-slate-700 dark:text-slate-300">{item.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="lg:col-span-2 space-y-4">
            {/* Big score */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 text-center">
              {/* Shareable card */}
              <div ref={cardRef} className="bg-white rounded-2xl p-6 text-center">
                <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">Financial Health Score · OneTool</div>
                <div className="text-7xl font-black text-neutral-value">{totalScore}</div>
                <div className="text-slate-400 text-sm mt-1">out of 100</div>
                <div className={`text-2xl font-bold mt-2 ${gradeColor}`}>{grade} — {gradeLabel}</div>
                <div className="mt-4 w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${totalScore}%`,
                      background: totalScore >= 70 ? 'var(--ot-positive)' : totalScore >= 40 ? 'var(--ot-warning)' : 'var(--ot-negative)',
                    }} />
                </div>
                <div className="mt-4 flex justify-center gap-4 flex-wrap">
                  {metrics.map(m => (
                    <div key={m.id} className="text-center">
                      <div className={`text-lg font-black ${m.status === 'great' ? 'text-positive' : m.status === 'ok' ? 'text-warning' : 'text-negative'}`}>{m.score}/{m.max}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-[10px] text-slate-300 font-medium">onetool.co.in · Free · No Signup</div>
              </div>
              <button
                onClick={shareAsImage}
                disabled={sharing}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Download size={15} /> {sharing ? 'Generating…' : 'Download Score Card'}
              </button>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              {metrics.map(m => (
                <div key={m.id} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {m.status === 'great' ? <CheckCircle2 className="w-4 h-4 text-positive" /> :
                       m.status === 'ok' ? <TrendingUp className="w-4 h-4 text-warning" /> :
                       <AlertTriangle className="w-4 h-4 text-negative" />}
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{m.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{m.value}</span>
                      <span className={`font-bold text-sm ${m.status === 'great' ? 'text-positive' : m.status === 'ok' ? 'text-warning' : 'text-negative'}`}>
                        {m.score}/{m.max}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${(m.score / m.max) * 100}%`,
                        background: m.status === 'great' ? 'var(--ot-positive)' : m.status === 'ok' ? 'var(--ot-warning)' : 'var(--ot-negative)',
                      }} />
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{m.advice}</p>
                  {m.status !== 'great' && METRIC_ACTIONS[m.id]?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {METRIC_ACTIONS[m.id].map(action => (
                        <a key={action.href} href={action.href}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-fin-accent/10 text-fin-accent border border-fin-accent/30 hover:bg-fin-accent/20 transition-colors">
                          {action.label} <ArrowRight className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasWill && (
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-positive shrink-0" />
                <p className="text-xs text-positive font-semibold">+Bonus: Will/nominations done — estate planning is complete!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
