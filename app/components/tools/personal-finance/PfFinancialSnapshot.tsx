"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, TrendingDown, Wallet, ShieldCheck, BarChart3, ExternalLink, RefreshCw, Info, Camera } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
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
    budgetAdherence: 0, overspentCategories: 0,
    hasBusinessData: false, businessRevenue: 0, businessExpenses: 0, businessProfit: 0,
    netWorthEstimate: 0, hasData: false,
  });
  const [lastUpdated, setLastUpdated] = useState('');

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
    const investments: { investedAmount: number; currentValue: number }[] = readInvestmentStore();
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
    if (budget?.categories?.length) {
      const cats = budget.categories as { budget: number; actual: number }[];
      const totalBudget = cats.reduce((s, c) => s + c.budget, 0);
      const totalActual = cats.reduce((s, c) => s + c.actual, 0);
      budgetAdherence = totalBudget > 0 ? Math.min(100, (1 - Math.max(0, totalActual - totalBudget) / totalBudget) * 100) : 0;
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
      budgetAdherence, overspentCategories,
      hasBusinessData: !!biz.transactions.length,
      businessRevenue, businessExpenses, businessProfit: businessRevenue - businessExpenses,
      netWorthEstimate,
      hasData: !!(monthlyIncome > 0 || investments.length || budget?.categories?.length),
    });
    setLastUpdated(new Date().toLocaleTimeString('en-IN'));
  };

  useEffect(() => { refresh(); }, []);

  const pillars = useMemo(() => [
    {
      id: 'spending', label: 'Spending', icon: TrendingDown,
      score: data.savingsRate >= 30 ? 100 : data.savingsRate >= 20 ? 75 : data.savingsRate >= 10 ? 50 : 25,
      color: '#10b981', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', borderColor: 'border-emerald-200 dark:border-emerald-800',
      metric: `${data.savingsRate.toFixed(0)}%`, label2: 'Savings Rate',
      href: '/tools/personal-finance/pf-financial-position', linkLabel: 'View Position',
    },
    {
      id: 'investments', label: 'Investments', icon: TrendingUp,
      score: data.totalInvested > 0 ? (data.portfolioGain >= 0 ? 80 : 40) : 20,
      color: '#3b82f6', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800',
      metric: fmtL(data.currentPortfolioValue), label2: 'Portfolio Value',
      href: '/tools/personal-finance/pf-investment-tracker', linkLabel: 'View Portfolio',
    },
    {
      id: 'budget', label: 'Budget', icon: Wallet,
      score: data.budgetAdherence,
      color: '#f59e0b', bgColor: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-200 dark:border-amber-800',
      metric: `${data.budgetAdherence.toFixed(0)}%`, label2: 'Budget Adherence',
      href: '/tools/personal-finance/pf-budget-vs-actual', linkLabel: 'View Budget',
    },
    {
      id: 'health', label: 'Health Score', icon: ShieldCheck,
      score: 0, // from health score tool
      color: '#8b5cf6', bgColor: 'bg-violet-50 dark:bg-violet-900/20', borderColor: 'border-violet-200 dark:border-violet-800',
      metric: '—', label2: 'Run Assessment',
      href: '/tools/personal-finance/pf-health-score', linkLabel: 'Check Score',
    },
  ], [data]);

  const portfolioBreakdown = useMemo(() => {
    const investments: { type: string; currentValue: number }[] = readInvestmentStore();
    const byType: Record<string, number> = {};
    for (const inv of investments) {
      byType[inv.type] = (byType[inv.type] || 0) + inv.currentValue;
    }
    return Object.entries(byType).map(([name, value], i) => ({ name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
  }, []);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Financial Snapshot"
        subtitle="Your complete money picture — all tools in one view"
        kpis={[
          { label: 'Monthly Income', value: fmtL(data.monthlyIncome), color: 'success', subtitle: '3-month avg (from statements)' },
          { label: 'Monthly Expenses', value: fmtL(data.monthlyExpenses), color: data.monthlyExpenses > data.monthlyIncome ? 'error' : 'neutral', subtitle: '3-month avg' },
          { label: 'Net Portfolio Value', value: fmtL(data.currentPortfolioValue), color: 'primary', subtitle: `${data.portfolioGain >= 0 ? '+' : ''}${fmtL(data.portfolioGain)} gain` },
          { label: 'Savings Rate', value: `${data.savingsRate.toFixed(1)}%`, color: data.savingsRate >= 20 ? 'success' : data.savingsRate >= 10 ? 'warning' : 'error', subtitle: 'Income - Expenses' },
        ]}
      />

      <div className="p-4 space-y-4">
        {!data.hasData && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 flex gap-3">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              No data found yet. This snapshot pulls data from your other tools — upload bank statements, add investments, and set up your budget to see your complete picture here.
            </p>
          </div>
        )}

        {/* Refresh */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">{lastUpdated ? `Last updated: ${lastUpdated}` : ''}</p>
          <div className="flex gap-2">
            <button onClick={refresh}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={captureScreenshot} disabled={capturingPng || !data.hasData}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors disabled:opacity-40">
              <Camera className="w-3.5 h-3.5" /> {capturingPng ? 'Saving…' : 'Screenshot'}
            </button>
          </div>
        </div>

        {/* Pillars */}
        <div ref={snapshotRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {pillars.map(p => (
            <div key={p.id} className={`rounded-xl p-4 border ${p.bgColor} ${p.borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <p.icon className="w-4 h-4" style={{ color: p.color }} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{p.label}</span>
              </div>
              {/* Mini progress ring */}
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" className="dark:stroke-slate-700" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke={p.color} strokeWidth="4"
                    strokeDasharray="87.96"
                    strokeDashoffset={`${87.96 * (1 - p.score / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{p.metric}</div>
                  <div className="text-[10px] text-slate-400">{p.label2}</div>
                </div>
              </div>
              <a href={p.href} className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: p.color }}>
                {p.linkLabel} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Income vs Expenses */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Monthly Cash Flow</h3>
            <div className="space-y-3">
              {[
                { label: 'Income', value: data.monthlyIncome, color: '#10b981', max: Math.max(data.monthlyIncome, data.monthlyExpenses) },
                { label: 'Expenses', value: data.monthlyExpenses, color: '#f97316', max: Math.max(data.monthlyIncome, data.monthlyExpenses) },
                { label: 'Savings', value: Math.max(0, data.monthlyIncome - data.monthlyExpenses), color: '#3b82f6', max: Math.max(data.monthlyIncome, data.monthlyExpenses) },
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
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4 gap-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Portfolio Allocation</h3>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap shrink-0">
                Partial estimate
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3 leading-relaxed">
              Only includes investments you added to the Investment Tracker. Real estate, gold, EPF, and PPF are not counted unless manually added there.
            </p>
            {portfolioBreakdown.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={portfolioBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                      {portfolioBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmtL(v)]} />
                  </PieChart>
                </ResponsiveContainer>
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
          </div>
        </div>

        {/* Business Section */}
        {data.hasBusinessData && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" /> Business OS Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Revenue', value: data.businessRevenue, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Expenses', value: data.businessExpenses, color: 'text-red-500' },
                { label: 'Profit', value: data.businessProfit, color: data.businessProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500' },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className={`text-lg font-bold ${item.color}`}>{fmtL(item.value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Statements', href: '/tools/personal-finance/pf-statement-manager' },
              { label: 'Investments', href: '/tools/personal-finance/pf-investment-tracker' },
              { label: 'Budget vs Actual', href: '/tools/personal-finance/pf-budget-vs-actual' },
              { label: 'Health Score', href: '/tools/personal-finance/pf-health-score' },
              { label: 'FIRE Calculator', href: '/tools/finance/fire-calc' },
              { label: 'Tax Calculator', href: '/tools/gst-tax/income-tax-calc' },
              { label: 'Business OS', href: '/tools/business-os/biz-dashboard' },
              { label: 'Net Worth', href: '/tools/finance/smart-net-worth' },
            ].map(link => (
              <a key={link.href} href={link.href}
                className="text-xs text-center py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-all font-medium">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
