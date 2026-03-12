"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Dna, Upload, BarChart2, AlertCircle } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getPFFinanceSummary } from '../finance/pf-data-bridge';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// Spending archetypes
const ARCHETYPES = [
  {
    id: 'experiences',
    name: 'The Experience Seeker',
    emoji: '✈️',
    description: 'You live for experiences — travel, food, events. Life is short, spend it well.',
    traits: ['High travel/dining spend', 'Moderate savings', 'Values experiences over things'],
    color: '#f97316',
    conditions: (cats: Record<string, number>) =>
      (cats['Travel'] || 0) + (cats['Food & Dining'] || 0) > (cats['Shopping'] || 0) * 2,
  },
  {
    id: 'homebody',
    name: 'The Home Investor',
    emoji: '🏠',
    description: 'Your home is your castle. High housing spend but you\'re building equity.',
    traits: ['High housing costs', 'Low entertainment spend', 'Stable financial base'],
    color: '#10b981',
    conditions: (cats: Record<string, number>) => (cats['Housing'] || 0) > 30,
  },
  {
    id: 'shopaholic',
    name: 'The Conscious Consumer',
    emoji: '🛍️',
    description: 'Shopping brings you joy. The key is making it intentional.',
    traits: ['High shopping/retail spend', 'Variety-seeking', 'Emotional spending patterns'],
    color: '#ec4899',
    conditions: (cats: Record<string, number>) => (cats['Shopping'] || 0) > 25,
  },
  {
    id: 'investor',
    name: 'The Wealth Builder',
    emoji: '📈',
    description: 'Future-focused. You\'re building wealth systematically with discipline.',
    traits: ['High investment allocation', 'Low lifestyle inflation', 'Long-term thinking'],
    color: '#6366f1',
    conditions: (cats: Record<string, number>) => (cats['Investment'] || 0) > 20,
  },
  {
    id: 'foodie',
    name: 'The Food Enthusiast',
    emoji: '🍽️',
    description: 'Food is your love language. Restaurants and groceries dominate your spend.',
    traits: ['High food & dining spend', 'Social spender', 'Enjoys quality experiences'],
    color: '#f59e0b',
    conditions: (cats: Record<string, number>) => (cats['Food & Dining'] || 0) + (cats['Grocery'] || 0) > 30,
  },
  {
    id: 'balanced',
    name: 'The Balanced Planner',
    emoji: '⚖️',
    description: 'You\'ve found a healthy balance — spending on what matters, saving for the future.',
    traits: ['Well-distributed spending', 'Consistent savings', 'Intentional with money'],
    color: '#14b8a6',
    conditions: () => true, // fallback
  },
];

const CAT_COLORS: Record<string, string> = {
  'Housing': '#6366f1', 'Food & Dining': '#f59e0b', 'Transport': '#0ea5e9',
  'Shopping': '#ec4899', 'Health': '#10b981', 'Travel': '#f97316',
  'Investment': '#8b5cf6', 'Subscriptions': '#14b8a6', 'Grocery': '#84cc16',
  'Education': '#3b82f6', 'Loan/EMI': '#ef4444', 'Miscellaneous': '#94a3b8',
};

export const SpendingDNA = () => {
  const [catSpend, setCatSpend] = useState<Record<string, number>>({
    'Housing': 15000,
    'Food & Dining': 12000,
    'Transport': 5000,
    'Shopping': 8000,
    'Health': 3000,
    'Investment': 10000,
    'Subscriptions': 2000,
    'Grocery': 5000,
    'Travel': 4000,
  });
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [dataSource, setDataSource] = useState<'manual' | 'statement'>('manual');
  const [hasStatements, setHasStatements] = useState(false);

  // Load from PF store
  useEffect(() => {
    try {
      const summary = getPFFinanceSummary(3);
      if (summary.hasData && summary.expenseRows.length > 0) {
        const cats: Record<string, number> = {};
        summary.expenseRows.forEach(row => {
          cats[row.category] = Math.round(row.avgMonthly);
        });
        setHasStatements(true);
        if (dataSource === 'statement') {
          setCatSpend(cats);
          setTotalMonthly(Math.round(summary.avgMonthlyExpense));
        }
      }
    } catch {}
  }, [dataSource]);

  const result = useMemo(() => {
    const total = Object.values(catSpend).reduce((s, v) => s + v, 0) || 1;
    const pcts: Record<string, number> = {};
    Object.entries(catSpend).forEach(([k, v]) => { pcts[k] = (v / total) * 100; });

    // Find archetype
    const archetype = ARCHETYPES.find(a => a.id !== 'balanced' && a.conditions(pcts)) || ARCHETYPES.find(a => a.id === 'balanced')!;

    // Radar data
    const dimensions = [
      { subject: 'Lifestyle', value: Math.min(100, ((pcts['Food & Dining'] || 0) + (pcts['Travel'] || 0) + (pcts['Shopping'] || 0))) },
      { subject: 'Essentials', value: Math.min(100, ((pcts['Housing'] || 0) + (pcts['Grocery'] || 0) + (pcts['Transport'] || 0))) },
      { subject: 'Wealth', value: Math.min(100, (pcts['Investment'] || 0) * 3) },
      { subject: 'Health', value: Math.min(100, (pcts['Health'] || 0) * 4) },
      { subject: 'Digital', value: Math.min(100, (pcts['Subscriptions'] || 0) * 5) },
      { subject: 'Learning', value: Math.min(100, (pcts['Education'] || 0) * 5) },
    ];

    // Pie
    const pie = Object.entries(catSpend)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: k, value: v, pct: (v / total * 100).toFixed(1) }))
      .sort((a, b) => b.value - a.value);

    // Insights
    const insights: { type: 'warn' | 'good' | 'info'; text: string }[] = [];
    if ((pcts['Investment'] || 0) < 10) insights.push({ type: 'warn', text: 'Investing less than 10% — aim for at least 20%' });
    if ((pcts['Investment'] || 0) >= 20) insights.push({ type: 'good', text: 'Strong investment discipline — top 20% of earners!' });
    if ((pcts['Food & Dining'] || 0) > 25) insights.push({ type: 'warn', text: 'Food spend is above 25% — consider cooking at home more' });
    if ((pcts['Shopping'] || 0) > 20) insights.push({ type: 'warn', text: 'Shopping at 20%+ — check if all purchases are intentional' });
    if ((pcts['Subscriptions'] || 0) > 5) insights.push({ type: 'warn', text: 'Subscriptions above 5% — run a subscription audit' });
    if ((pcts['Loan/EMI'] || 0) > 30) insights.push({ type: 'warn', text: 'EMIs consuming 30%+ of expenses — debt payoff should be priority' });
    const topCat = pie[0];
    if (topCat) insights.push({ type: 'info', text: `Top spending category: ${topCat.name} (${topCat.pct}%)` });

    return { pcts, archetype, dimensions, pie, insights, total };
  }, [catSpend]);

  const categories = Object.keys(CAT_COLORS);

  const topCat = result.pie[0];
  const hasWasteSignal =
    (result.pcts['Shopping'] || 0) > 20 ||
    (result.pcts['Subscriptions'] || 0) > 5 ||
    (result.pcts['Food & Dining'] || 0) > 25;

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Spending DNA"
        subtitle="Decode your money personality from spending patterns"
        kpis={[
          { label: 'Archetype', value: result.archetype.name, color: 'neutral' },
          { label: 'Monthly Total', value: fmt(result.total), color: 'neutral' },
          { label: 'Top Category', value: topCat ? `${topCat.name} (${topCat.pct}%)` : '—', color: 'warning' },
          { label: 'Waste Signal', value: hasWasteSignal ? 'Review Needed' : 'None Detected', color: hasWasteSignal ? 'warning' : 'success' },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Data source */}
        <div className="flex gap-2">
          <button onClick={() => setDataSource('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${dataSource === 'manual' ? 'bg-violet-500 text-white border-violet-500' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
            <BarChart2 className="w-4 h-4" /> Enter Manually
          </button>
          <button onClick={() => setDataSource('statement')} disabled={!hasStatements}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${dataSource === 'statement' ? 'bg-violet-500 text-white border-violet-500' : hasStatements ? 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}>
            <Upload className="w-4 h-4" />
            {hasStatements ? 'Load from Statements' : 'No Statement Data'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Input sliders */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Monthly Spend by Category</h2>
            {categories.map(cat => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs text-slate-500">{cat}</label>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{fmt(catSpend[cat] || 0)}</span>
                </div>
                <input type="number"
                  className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none w-full"
                  value={catSpend[cat] || 0}
                  onChange={e => setCatSpend(prev => ({ ...prev, [cat]: +e.target.value }))} />
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Archetype card */}
            <div className="rounded-xl p-6 border-2 text-white" style={{ background: result.archetype.color, borderColor: result.archetype.color }}>
              <div className="text-4xl mb-2">{result.archetype.emoji}</div>
              <div className="text-2xl font-bold mb-1">{result.archetype.name}</div>
              <p className="text-sm opacity-90 mb-3">{result.archetype.description}</p>
              <div className="flex flex-wrap gap-2">
                {result.archetype.traits.map((t, i) => (
                  <span key={i} className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">{t}</span>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Radar */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase">Spending Dimensions</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={result.dimensions} cx="50%" cy="50%" outerRadius={65}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name="Spend" dataKey="value" stroke={result.archetype.color} fill={result.archetype.color} fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase">Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={result.pie} dataKey="value" cx="50%" cy="50%" outerRadius={50} strokeWidth={2}>
                      {result.pie.map((d, i) => <Cell key={i} fill={CAT_COLORS[d.name] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  {result.pie.slice(0, 6).map((d, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CAT_COLORS[d.name] || '#94a3b8' }} />
                      <span className="text-slate-500 truncate">{d.name}</span>
                      <span className="ml-auto font-semibold text-slate-600 dark:text-slate-400">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            {result.insights.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Insights</h3>
                <div className="space-y-2">
                  {result.insights.map((ins, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${ins.type === 'warn' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : ins.type === 'good' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {ins.type === 'warn' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      {ins.type === 'good' && <span className="shrink-0">✓</span>}
                      {ins.type === 'info' && <span className="shrink-0">→</span>}
                      {ins.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category breakdown table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Full Breakdown</h3>
              <div className="space-y-2">
                {result.pie.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CAT_COLORS[d.name] || '#94a3b8' }} />
                    <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">{d.name}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: CAT_COLORS[d.name] || '#94a3b8' }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-10 text-right">{d.pct}%</span>
                    <span className="text-xs text-slate-400 w-20 text-right">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
