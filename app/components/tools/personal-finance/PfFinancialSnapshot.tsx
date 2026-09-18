"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown, Wallet, ShieldCheck, BarChart3, ExternalLink, RefreshCw, Info, Camera } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// recharts is a heavy dependency — kept out of the main chunk so the header
// and pillar cards (the LCP candidates) don't wait on it to parse/execute.
const PfPortfolioPie = dynamic(() => import('./PfPortfolioPie'), { ssr: false });
import { getPFFinanceSummary } from '../finance/pf-data-bridge';
import { safeLocalStorage } from '@/app/lib/utils/storage';
import { loadBizStore } from '../business-os/biz-os-store';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtL = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};
// Read from localStorage stores (investment + budget + biz remain on their own stores)
function readInvestmentStore(): { investedAmount: number; currentValue: number; type: string }[] {
  return safeLocalStorage.getItem<{ investedAmount: number; currentValue: number; type: string }[]>(
    'otsd-investment-tracker', []
  ) ?? [];
}
function readBudgetStore(): { categories: { budget: number; actual: number }[] } | null {
  return safeLocalStorage.getItem<{ categories: { budget: number; actual: number }[] }>(
    'otsd-budget-vs-actual', null
  );
}
interface SnapshotData {
  // Personal Finance
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  // Investments
  totalInvested: number;
  currentPortfolioValue: number;
  portfolioGain: number;
  // Budget
  budgetAdherence: number; // %
  overspentCategories: number;
  hasBudgetData: boolean;
  // Business
  hasBusinessData: boolean;
  businessRevenue: number;
  businessExpenses: number;
  businessProfit: number;
  // Computed
  netWorthEstimate: number;
  hasData: boolean;
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899'];

export const PFFinancialSnapshot = () => {
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [capturingPng, setCapturingPng] = useState(false);
  const [data, setData] = useState<SnapshotData>({
    monthlyIncome: 0, monthlyExpenses: 0, savingsRate: 0,
    totalInvested: 0, currentPortfolioValue: 0, portfolioGain: 0,
    budgetAdherence: 0, overspentCategories: 0, hasBudgetData: false,
    hasBusinessData: false, businessRevenue: 0, businessExpenses: 0, businessProfit: 0,
    netWorthEstimate: 0, hasData: false,
  });
  const [lastUpdated, setLastUpdated] = useState('');
  const [portfolioBreakdown, setPortfolioBreakdown] = useState<{ name: string; value: number; color: string }[]>([]);

  const captureScreenshot = async () => {
    if (!snapshotRef.current) return;
    setCapturingPng(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(snapshotRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `financial-snapshot-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Screenshot failed', e);
    } finally {
      setCapturingPng(false);
    }
  };

  const refresh = () => {
    const investments: { investedAmount: number; currentValue: number; type: string }[] = readInvestmentStore();
    const budget = readBudgetStore();
    const biz = loadBizStore();

    // PF data — use proper store functions (not raw JSON parsing)
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    try {
      const pfSummary = getPFFinanceSummary(3);
      if (pfSummary.hasData) {
        monthlyIncome   = pfSummary.avgMonthlyIncome;
        monthlyExpenses = pfSummary.avgMonthlyExpense;
      }
    } catch { /* no statements uploaded yet */ }

    // Investments
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
    const currentPortfolioValue = investments.reduce((s, i) => s + i.currentValue, 0);

    // Budget
    let budgetAdherence = 0;
    let overspentCategories = 0;
    const hasBudgetData = !!budget?.categories?.length;
    if (hasBudgetData) {
      const cats = budget!.categories as { budget: number; actual: number }[];
      const totalBudget = cats.reduce((s, c) => s + c.budget, 0);
      const totalActual = cats.reduce((s, c) => s + c.actual, 0);
      budgetAdherence = totalBudget > 0 ? Math.max(0, Math.min(100, (1 - Math.max(0, totalActual - totalBudget) / totalBudget) * 100)) : 0;
      overspentCategories = cats.filter(c => c.actual > c.budget).length;
    }

    // Business
    let businessRevenue = 0;
    let businessExpenses = 0;
    if (biz.transactions.length) {
      businessRevenue = biz.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      businessExpenses = biz.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    }

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const netWorthEstimate = currentPortfolioValue + (monthlyIncome - monthlyExpenses) * 6; // rough

    setData({
      monthlyIncome, monthlyExpenses, savingsRate,
      totalInvested, currentPortfolioValue,
      portfolioGain: currentPortfolioValue - totalInvested,
      budgetAdherence, overspentCategories, hasBudgetData,
      hasBusinessData: !!biz.transactions.length,
      businessRevenue, businessExpenses, businessProfit: businessRevenue - businessExpenses,
      netWorthEstimate,
      hasData: !!(monthlyIncome > 0 || investments.length || budget?.categories?.length),
    });
    setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

    const byType: Record<string, number> = {};
    for (const inv of investments) {
      byType[inv.type] = (byType[inv.type] || 0) + inv.currentValue;
    }
    setPortfolioBreakdown(
      Object.entries(byType).map(([name, value], i) => ({ name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
    );
  };

  useEffect(() => { refresh(); }, []);

  const savingsRateDisplay = data.savingsRate.toFixed(1);
  const hasInvestments = data.totalInvested > 0 || data.currentPortfolioValue > 0;
  const isOverBudget = data.hasBudgetData && data.overspentCategories > 0;

  // Tier a 0-100 score into the three semantic tones (used for icon + ring color).
  // Only applied when hasValue — an unscored metric stays muted, never colored.
  const tierColor = (score: number) => (score >= 70 ? 'var(--ot-positive)' : score >= 40 ? 'var(--ot-warning)' : 'var(--ot-negative)');
  const MUTED = '#64748B';

  const pillars = useMemo(() => {
    const spendingHasValue = data.monthlyIncome > 0;
    const spendingScore = data.savingsRate >= 30 ? 100 : data.savingsRate >= 20 ? 75 : data.savingsRate >= 10 ? 50 : 25;
    const investScore = hasInvestments ? (data.portfolioGain >= 0 ? 80 : 40) : 0;
    const budgetScore = data.hasBudgetData ? data.budgetAdherence : 0;

    return [
      {
        id: 'spending', label: 'Spending', icon: TrendingDown,
        hasValue: spendingHasValue, score: spendingScore,
        metric: `${savingsRateDisplay}%`, label2: 'Savings Rate',
        href: '/my-finance/pf-financial-position', linkLabel: 'View Position',
      },
      {
        id: 'investments', label: 'Investments', icon: TrendingUp,
        hasValue: hasInvestments, score: investScore,
        metric: hasInvestments ? fmtL(data.currentPortfolioValue) : 'No investments added',
        label2: hasInvestments ? 'Portfolio Value' : 'Add one to track it',
        href: '/my-finance/pf-investment-tracker', linkLabel: 'View Portfolio',
      },
      {
        id: 'budget', label: 'Budget', icon: Wallet,
        hasValue: data.hasBudgetData, score: budgetScore,
        metric: !data.hasBudgetData ? 'No budget set' : isOverBudget ? 'Over budget' : `${data.budgetAdherence.toFixed(0)}%`,
        label2: !data.hasBudgetData ? 'Set one to track it' : isOverBudget ? `${data.overspentCategories} categor${data.overspentCategories === 1 ? 'y' : 'ies'} over` : 'Budget Adherence',
        href: '/my-finance/pf-budget-vs-actual', linkLabel: 'View Budget',
      },
      {
        id: 'health', label: 'Health Score', icon: ShieldCheck,
        hasValue: false, score: 0,
        metric: 'Not run yet', label2: 'Run a quick assessment',
        href: '/my-finance/pf-health-score', linkLabel: 'Check Score',
      },
    ];
  }, [data, savingsRateDisplay, hasInvestments, isOverBudget]);

  return (
    <div>
      <SAPHeader
        fullWidth
        kpiVariant="strip"
        title="Financial Snapshot"
        subtitle="Your complete money picture — all tools in one view"
        kpis={[
          { label: 'Income', value: fmtL(data.monthlyIncome), subtitle: '3-month avg' },
          { label: 'Expenses', value: fmtL(data.monthlyExpenses), subtitle: '3-month avg' },
          ...(hasInvestments ? [{ label: 'Portfolio Value', value: fmtL(data.currentPortfolioValue), subtitle: `${data.portfolioGain >= 0 ? '+' : ''}${fmtL(data.portfolioGain)} gain` }] : []),
          { label: 'Savings Rate', value: `${savingsRateDisplay}%`, subtitle: 'Net of expenses' },
        ]}
      />

      <div className="p-4 space-y-4">
        {!data.hasData && (
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 flex gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No data found yet. This snapshot pulls data from your other tools — upload bank statements, add investments, and set up your budget to see your complete picture here.
            </p>
          </div>
        )}

        {/* Refresh */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">{lastUpdated ? `Updated ${lastUpdated}` : ''}</p>
          <div className="flex items-center gap-2">
            <button onClick={refresh}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={captureScreenshot} disabled={capturingPng || !data.hasData}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40">
              <Camera className="w-3.5 h-3.5" /> {capturingPng ? 'Saving…' : 'Screenshot'}
            </button>
          </div>
        </div>

        {/* Pillars */}
        <div ref={snapshotRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map(p => {
            const iconColor = p.hasValue ? tierColor(p.score) : MUTED;
            return (
              <div key={p.id} className="rounded-lg p-5 border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <p.icon className="w-4 h-4" style={{ color: iconColor }} />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{p.label}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  {p.hasValue && (
                    <svg className="w-10 h-10 -rotate-90 shrink-0" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" className="dark:stroke-slate-700" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke={iconColor} strokeWidth="4"
                        strokeDasharray="87.96"
                        strokeDashoffset={`${87.96 * (1 - p.score / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                  )}
                  <div>
                    <div className={`font-semibold text-neutral-value ${/[a-zA-Z]{4,}/.test(p.metric) ? 'text-sm' : 'text-lg'}`}>{p.metric}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.label2}</div>
                  </div>
                </div>
                <a href={p.href} className="text-xs font-semibold flex items-center gap-1 hover:underline text-fin-accent">
                  {p.linkLabel} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Income vs Expenses */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Monthly Cash Flow</h3>
            <div className="space-y-3">
              {[
                { label: 'Income', value: data.monthlyIncome, color: 'var(--ot-positive)', max: Math.max(data.monthlyIncome, data.monthlyExpenses) },
                { label: 'Expenses', value: data.monthlyExpenses, color: '#64748B', max: Math.max(data.monthlyIncome, data.monthlyExpenses) },
                { label: 'Savings', value: Math.max(0, data.monthlyIncome - data.monthlyExpenses), color: 'var(--ot-fin-accent)', max: Math.max(data.monthlyIncome, data.monthlyExpenses) },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{fmtL(item.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Allocation */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Portfolio Allocation</h3>
            {portfolioBreakdown.length > 0 ? (
              <div className="flex items-center gap-4">
                <PfPortfolioPie data={portfolioBreakdown} fmtL={fmtL} />
                <div className="flex-1 space-y-1.5">
                  {portfolioBreakdown.map(entry => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {data.currentPortfolioValue > 0 ? ((entry.value / data.currentPortfolioValue) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-sm text-slate-400">
                Add investments in Investment Tracker to see allocation
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              Only investments added in Investment Tracker. Real estate, gold, EPF and PPF aren&apos;t counted unless added there. <span className="text-warning font-medium">Partial estimate.</span>
            </p>
          </div>
        </div>

        {/* Business Section */}
        {data.hasBusinessData && (
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-500" /> Business OS Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Revenue', value: data.businessRevenue },
                { label: 'Expenses', value: data.businessExpenses },
                { label: 'Profit', value: data.businessProfit },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className="text-lg font-semibold text-neutral-value">{fmtL(item.value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.5px] mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Statements', href: '/my-finance/pf-statement-manager' },
              { label: 'Investments', href: '/my-finance/pf-investment-tracker' },
              { label: 'Budget vs Actual', href: '/my-finance/pf-budget-vs-actual' },
              { label: 'Health Score', href: '/my-finance/pf-health-score' },
              { label: 'FIRE Calculator', href: '/my-finance/fire-calc' },
              { label: 'Tax Calculator', href: '/my-finance/income-tax-calc' },
              { label: 'Business OS', href: '/my-business/biz-dashboard' },
              { label: 'Net Worth', href: '/my-finance/smart-net-worth' },
            ].map(link => (
              <a key={link.href} href={link.href}
                className="text-xs text-center py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:text-fin-accent hover:border-fin-accent transition-all font-medium">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
