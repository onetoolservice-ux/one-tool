'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb,
  Target, Clock, BarChart2, Activity, Shield, Zap, ArrowUpCircle,
  ArrowDownCircle, Info, Sparkles, ChevronRight, Eye,
} from 'lucide-react';
import {
  getPFTransactions, getAvailableMonths, getPeriodRange, fmtINR,
  type PFTransaction,
} from './finance-store';
import type { MonthlyData } from '../analytics/analytics-store';
import {
  generateFinancialIntelligence,
  type FinancialIntelligence,
  type AutoInsight,
  type Anomaly,
  type Prediction,
  type Recommendation,
} from '../analytics/financial-intelligence';

// ═══════════════════════════════════════════════════════════════════════════════
// PF AI FINANCIAL ANALYST
// Reads from finance-store (PF ecosystem) and feeds the financial intelligence
// engine to generate insights, anomalies, predictions, and recommendations.
// ═══════════════════════════════════════════════════════════════════════════════

/** Bridge: convert PF transactions per month into MonthlyData for the engine */
function buildMonthlyDataFromPF(
  allTxns: PFTransaction[],
  months: { key: string; label: string }[],
): MonthlyData[] {
  return months
    .slice(0, 6)
    .map((m) => {
      const range = getPeriodRange(m.key);
      if (!range) return null;

      const txns = allTxns
        .filter((t) => !t.isTransfer && t.date >= range.from && t.date <= range.to)
        .map((t) => ({
          id: t.id,
          date: t.date,
          description: t.description,
          amount: t.amount,
          type: t.type as 'credit' | 'debit',
          category: t.category,
          rawData: {} as Record<string, string>,
          batchId: m.key,
        }));

      if (txns.length === 0) return null;

      const totalCredits = txns.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
      const totalDebits  = txns.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

      return {
        monthKey:   m.key,
        monthLabel: m.label,
        fileName:   '',
        uploadedAt: '',
        transactions: txns,
        detectedColumns: {
          date: null, amount: null, creditAmount: null,
          debitAmount: null, description: null, category: null, balance: null,
        },
        summary: {
          totalCredits,
          totalDebits,
          netFlow: totalCredits - totalDebits,
          transactionCount: txns.length,
        },
      } satisfies MonthlyData;
    })
    .filter((d): d is MonthlyData => d !== null);
}

// ─────────────────────────────────────────────────────────────────────────────

export function PFAIAnalyst() {
  const [mounted,    setMounted]    = useState(false);
  const [allTxns,    setAllTxns]    = useState<PFTransaction[]>([]);
  const [months,     setMonths]     = useState<{ key: string; label: string }[]>([]);
  const [activeTab,  setActiveTab]  = useState<'overview' | 'insights' | 'predictions' | 'recommendations' | 'comparisons'>('overview');

  const reload = () => {
    setAllTxns(getPFTransactions());
    setMonths(getAvailableMonths());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  const monthsData: MonthlyData[] = useMemo(
    () => buildMonthlyDataFromPF(allTxns, months),
    [allTxns, months],
  );

  const intelligence: FinancialIntelligence = useMemo(
    () => generateFinancialIntelligence(monthsData),
    [monthsData],
  );

  const currentMonth = monthsData[0] ?? null;

  if (!mounted) return null;

  if (monthsData.length === 0 || !currentMonth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 dark:text-slate-500 gap-3 p-6">
        <Brain size={52} strokeWidth={1.2} />
        <p className="text-base font-semibold">No financial data yet</p>
        <p className="text-sm text-center max-w-md">
          Upload your bank statements in{' '}
          <span className="font-bold text-blue-500">Statement Manager</span>{' '}
          first. The AI analyst will automatically analyse your data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Brain size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black">AI Financial Analyst</h1>
            <p className="text-white/90 text-sm">
              Insights for {currentMonth.monthLabel} · {monthsData.length} month{monthsData.length !== 1 ? 's' : ''} of data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Current Month Status</p>
            <div className="flex items-center gap-2">
              {intelligence.summary.currentMonthSavings >= 0
                ? <ArrowUpCircle size={20} className="text-green-300" />
                : <ArrowDownCircle size={20} className="text-red-300" />}
              <p className="text-2xl font-black">
                {intelligence.summary.currentMonthSavings >= 0 ? '+' : '-'}
                {fmtINR(Math.abs(intelligence.summary.currentMonthSavings))}
              </p>
            </div>
            <p className="text-xs text-white/70 mt-1">
              {intelligence.summary.currentMonthSavings >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Spending Trend</p>
            <div className="flex items-center gap-2">
              {intelligence.summary.spendingTrend === 'increasing' && <TrendingUp  size={20} className="text-yellow-300" />}
              {intelligence.summary.spendingTrend === 'decreasing' && <TrendingDown size={20} className="text-green-300" />}
              {intelligence.summary.spendingTrend === 'stable'     && <Minus        size={20} className="text-blue-300" />}
              <p className="text-2xl font-black capitalize">{intelligence.summary.spendingTrend}</p>
            </div>
            <p className="text-xs text-white/70 mt-1">
              {Math.abs(intelligence.summary.trendPercentage).toFixed(1)}% vs last month
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Income Consistency</p>
            <div className="flex items-center gap-2">
              <Activity size={20} className={
                intelligence.summary.incomeConsistency === 'consistent' ? 'text-green-300' :
                intelligence.summary.incomeConsistency === 'variable'   ? 'text-yellow-300' : 'text-red-300'
              } />
              <p className="text-2xl font-black capitalize">{intelligence.summary.incomeConsistency}</p>
            </div>
            <p className="text-xs text-white/70 mt-1">Score: {intelligence.summary.consistencyScore.toFixed(0)}/100</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {([
              { key: 'overview'         as const, label: 'Overview',       Icon: Eye,       count: intelligence.insights.length + intelligence.anomalies.length },
              { key: 'insights'         as const, label: 'Insights',       Icon: Sparkles,  count: intelligence.insights.length },
              { key: 'predictions'      as const, label: 'Predictions',    Icon: TrendingUp, count: intelligence.predictions.length },
              { key: 'recommendations'  as const, label: 'Actions',        Icon: Lightbulb, count: intelligence.recommendations.length },
              { key: 'comparisons'      as const, label: 'Compare',        Icon: BarChart2,  count: intelligence.comparisons.length },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <tab.Icon size={16} />
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* ── Overview ─────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-2">Financial Health Summary</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {intelligence.summary.currentMonthSavings >= 0 ? (
                        <>You saved <strong>{fmtINR(intelligence.summary.currentMonthSavings)}</strong> this month. </>
                      ) : (
                        <>You have a deficit of <strong>{fmtINR(Math.abs(intelligence.summary.currentMonthSavings))}</strong> this month. </>
                      )}
                      Your spending is <strong>{intelligence.summary.spendingTrend}</strong>
                      {Math.abs(intelligence.summary.trendPercentage) > 5 && (
                        <> ({intelligence.summary.spendingTrend === 'increasing' ? 'up' : 'down'} {Math.abs(intelligence.summary.trendPercentage).toFixed(1)}%)</>
                      )}, and your income is <strong>{intelligence.summary.incomeConsistency}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {intelligence.insights.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-500" /> Top Insights
                  </h3>
                  <div className="space-y-2">
                    {intelligence.insights.slice(0, 3).map((ins) => (
                      <InsightCard key={ins.id} insight={ins} />
                    ))}
                  </div>
                </div>
              )}

              {intelligence.anomalies.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" /> Anomalies Detected
                  </h3>
                  <div className="space-y-2">
                    {intelligence.anomalies.slice(0, 3).map((a) => (
                      <AnomalyCard key={a.id} anomaly={a} />
                    ))}
                  </div>
                </div>
              )}

              {intelligence.recommendations.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Target size={16} className="text-green-500" /> Recommended Actions
                  </h3>
                  <div className="space-y-2">
                    {intelligence.recommendations.slice(0, 2).map((r) => (
                      <RecommendationCard key={r.id} recommendation={r} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Insights ─────────────────────────────────────────────────── */}
          {activeTab === 'insights' && (
            <>
              {intelligence.insights.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Sparkles size={48} strokeWidth={1.2} className="mx-auto mb-3" />
                  <p className="font-semibold">No insights yet</p>
                  <p className="text-sm">More data needed for analysis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {intelligence.insights.map((ins) => (
                    <InsightCard key={ins.id} insight={ins} expanded />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Predictions ───────────────────────────────────────────────── */}
          {activeTab === 'predictions' && (
            <>
              {intelligence.predictions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <TrendingUp size={48} strokeWidth={1.2} className="mx-auto mb-3" />
                  <p className="font-semibold">No predictions available</p>
                  <p className="text-sm">Need at least 2 months of data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {intelligence.predictions.map((p) => (
                    <PredictionCard key={p.id} prediction={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Recommendations ────────────────────────────────────────────── */}
          {activeTab === 'recommendations' && (
            <>
              {intelligence.recommendations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Lightbulb size={48} strokeWidth={1.2} className="mx-auto mb-3" />
                  <p className="font-semibold">No recommendations</p>
                  <p className="text-sm">Your finances look good!</p>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Total Savings Potential:</strong>{' '}
                      {fmtINR(intelligence.recommendations.reduce((s, r) => s + r.impact, 0))} / month
                    </p>
                  </div>
                  <div className="space-y-3">
                    {intelligence.recommendations.map((r) => (
                      <RecommendationCard key={r.id} recommendation={r} expanded />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Comparisons ───────────────────────────────────────────────── */}
          {activeTab === 'comparisons' && (
            <>
              {intelligence.comparisons.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <BarChart2 size={48} strokeWidth={1.2} className="mx-auto mb-3" />
                  <p className="font-semibold">No comparisons yet</p>
                  <p className="text-sm">Need at least 2 months of data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {intelligence.comparisons.map((comp, i) => (
                    <ComparisonCard key={i} comparison={comp} current={currentMonth.summary} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function InsightCard({ insight, expanded = false }: { insight: AutoInsight; expanded?: boolean }) {
  const iconMap = {
    positive: <ArrowUpCircle  size={16} className="text-green-500" />,
    neutral:  <Info           size={16} className="text-blue-500" />,
    warning:  <AlertTriangle  size={16} className="text-amber-500" />,
    critical: <Shield         size={16} className="text-red-500" />,
  };
  const bgMap = {
    positive: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    neutral:  'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    warning:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };
  return (
    <div className={`border rounded-xl p-4 ${bgMap[insight.type]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{iconMap[insight.type]}</div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{insight.title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">{insight.description}</p>
          {expanded && insight.category && (
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded font-medium">{insight.category}</span>
              {insight.value !== undefined && (
                <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded font-mono">{fmtINR(insight.value)}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const map = {
    low:    { bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', color: 'text-yellow-600' },
    medium: { bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', color: 'text-orange-600' },
    high:   { bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',             color: 'text-red-600' },
  };
  return (
    <div className={`border rounded-xl p-4 ${map[anomaly.severity].bg}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className={`mt-0.5 ${map[anomaly.severity].color}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{anomaly.title}</h4>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${map[anomaly.severity].color}`}>
              {anomaly.severity}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{anomaly.description}</p>
        </div>
      </div>
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  const typeMap = {
    expense: { icon: <TrendingDown size={18} />, color: 'text-rose-600',    bg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' },
    income:  { icon: <TrendingUp   size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    savings: { icon: <Target       size={18} />, color: 'text-indigo-600',  bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
  };
  const confMap = {
    low:    'text-slate-500',
    medium: 'text-blue-600',
    high:   'text-green-600',
  };
  return (
    <div className={`border rounded-xl p-5 ${typeMap[prediction.type].bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={typeMap[prediction.type].color}>{typeMap[prediction.type].icon}</div>
          <h4 className="font-bold text-slate-800 dark:text-white text-sm capitalize">Predicted {prediction.type}</h4>
        </div>
        <span className={`text-xs font-semibold ${confMap[prediction.confidence]}`}>
          {prediction.confidence.charAt(0).toUpperCase() + prediction.confidence.slice(1)} Confidence
        </span>
      </div>
      <p className={`text-3xl font-black ${typeMap[prediction.type].color} mb-2`}>{fmtINR(Math.abs(prediction.amount))}</p>
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{prediction.explanation}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{prediction.basis}</p>
    </div>
  );
}

function RecommendationCard({ recommendation, expanded = false }: { recommendation: Recommendation; expanded?: boolean }) {
  const effortMap = {
    low:    { label: 'Easy',        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    medium: { label: 'Moderate',    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
    high:   { label: 'Challenging', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  };
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-500" />
          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{recommendation.title}</h4>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded ${effortMap[recommendation.effort].color}`}>
          {effortMap[recommendation.effort].label}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{recommendation.description}</p>
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="text-green-600" />
          <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase">Potential Impact</span>
        </div>
        <p className="text-lg font-black text-green-600 dark:text-green-400">{fmtINR(recommendation.impact)} / month</p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">{fmtINR(recommendation.impact * 12)} annually</p>
      </div>
      {expanded && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <ChevronRight size={14} className="text-slate-400 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-300">{recommendation.actionable}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonCard({ comparison, current }: { comparison: { period: string; income: number; expenses: number; netFlow: number; change: number; changePercent: number }; current: { totalCredits: number; totalDebits: number; netFlow: number } }) {
  const expenseChange = current.totalDebits  - comparison.expenses;
  const incomeChange  = current.totalCredits - comparison.income;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-indigo-500" />
        <h4 className="font-bold text-slate-800 dark:text-white">vs {comparison.period}</h4>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Income</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{fmtINR(comparison.income)}</p>
          <p className={`text-xs font-semibold ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {incomeChange >= 0 ? '+' : ''}{fmtINR(incomeChange)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Expenses</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{fmtINR(comparison.expenses)}</p>
          <p className={`text-xs font-semibold ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {expenseChange >= 0 ? '+' : ''}{fmtINR(expenseChange)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Net Flow</p>
          <p className={`text-lg font-bold ${comparison.netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {fmtINR(comparison.netFlow)}
          </p>
          <p className={`text-xs font-semibold ${comparison.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {comparison.change >= 0 ? '+' : ''}{fmtINR(comparison.change)}
          </p>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Your net flow {comparison.change >= 0 ? 'improved' : 'decreased'} by{' '}
          <strong className={comparison.change >= 0 ? 'text-green-600' : 'text-red-600'}>
            {fmtINR(Math.abs(comparison.change))}
          </strong>
          {comparison.changePercent !== 0 && (
            <> ({Math.abs(comparison.changePercent).toFixed(1)}%)</>
          )}
        </p>
      </div>
    </div>
  );
}
