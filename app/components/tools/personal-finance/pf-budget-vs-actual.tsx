"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Plus, Trash2, Info, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';

interface CategoryBudget {
  id: string;
  category: string;
  budget: number;
  actual: number;
}

const DEFAULT_CATEGORIES: CategoryBudget[] = [
  { id: '1', category: 'Rent / EMI', budget: 25000, actual: 25000 },
  { id: '2', category: 'Groceries & Food', budget: 8000, actual: 9500 },
  { id: '3', category: 'Transport', budget: 4000, actual: 3200 },
  { id: '4', category: 'Utilities & Bills', budget: 3000, actual: 2800 },
  { id: '5', category: 'Entertainment', budget: 2000, actual: 3800 },
  { id: '6', category: 'Health & Medicine', budget: 2000, actual: 1200 },
  { id: '7', category: 'Investments / SIP', budget: 10000, actual: 10000 },
  { id: '8', category: 'Shopping', budget: 5000, actual: 7200 },
  { id: '9', category: 'Miscellaneous', budget: 3000, actual: 2100 },
];

const STORAGE_KEY = 'otsd-budget-vs-actual';

function load(): { categories: CategoryBudget[]; monthlyIncome: number } {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : { categories: DEFAULT_CATEGORIES, monthlyIncome: 75000 };
  } catch { return { categories: DEFAULT_CATEGORIES, monthlyIncome: 75000 }; }
}
function save(data: { categories: CategoryBudget[]; monthlyIncome: number }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const BudgetVsActual = () => {
  const [categories, setCategories] = useState<CategoryBudget[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(75000);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState({ category: '', budget: 0, actual: 0 });
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const data = load();
    setCategories(data.categories);
    setMonthlyIncome(data.monthlyIncome);
  }, []);

  useEffect(() => {
    if (categories.length) save({ categories, monthlyIncome });
  }, [categories, monthlyIncome]);

  const updateCategory = (id: string, field: 'budget' | 'actual' | 'category', value: string | number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));

  const addCategory = () => {
    if (!newCat.category) return;
    setCategories(prev => [...prev, { ...newCat, id: Date.now().toString() }]);
    setNewCat({ category: '', budget: 0, actual: 0 });
    setShowAdd(false);
  };

  const stats = useMemo(() => {
    const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
    const totalActual = categories.reduce((s, c) => s + c.actual, 0);
    const variance = totalBudget - totalActual;
    const overspent = categories.filter(c => c.actual > c.budget);
    const underspent = categories.filter(c => c.actual < c.budget);
    const budgetSavings = monthlyIncome - totalBudget;
    const actualSavings = monthlyIncome - totalActual;
    return { totalBudget, totalActual, variance, overspent, underspent, budgetSavings, actualSavings };
  }, [categories, monthlyIncome]);

  const chartData = useMemo(() => categories
    .sort((a, b) => b.budget - a.budget)
    .map(c => ({
      category: c.category.length > 14 ? c.category.slice(0, 12) + '…' : c.category,
      Budget: c.budget,
      Actual: c.actual,
      over: c.actual > c.budget ? c.actual - c.budget : 0,
    })), [categories]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Budget vs Actual"
        subtitle={`Month: ${month}`}
        kpis={[
          { label: 'Budget', value: fmt(stats.totalBudget), color: 'neutral', subtitle: `Savings planned: ${fmt(stats.budgetSavings)}` },
          { label: 'Actual Spend', value: fmt(stats.totalActual), color: stats.totalActual > stats.totalBudget ? 'error' : 'success', subtitle: `Savings actual: ${fmt(stats.actualSavings)}` },
          { label: 'Variance', value: fmt(Math.abs(stats.variance)), color: stats.variance >= 0 ? 'success' : 'error', subtitle: stats.variance >= 0 ? 'Under budget' : 'Over budget' },
          { label: 'Overspent Categories', value: String(stats.overspent.length), color: stats.overspent.length > 0 ? 'warning' : 'success', subtitle: `${stats.underspent.length} under budget` },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className={labelCls}>Month</label>
            <input type="month" className={inputCls + ' w-40'} value={month} onChange={e => setMonth(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className={labelCls}>Income</label>
            <input type="number" className={inputCls + ' w-36'} value={monthlyIncome}
              onChange={e => setMonthlyIncome(+e.target.value)} />
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {showAdd && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-blue-200 dark:border-blue-800 grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className={labelCls}>Category Name</label>
              <input type="text" className={inputCls} placeholder="e.g. Dining Out" value={newCat.category}
                onChange={e => setNewCat(n => ({ ...n, category: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Budget (₹)</label>
              <input type="number" className={inputCls} value={newCat.budget || ''}
                onChange={e => setNewCat(n => ({ ...n, budget: +e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Actual Spent (₹)</label>
              <input type="number" className={inputCls} value={newCat.actual || ''}
                onChange={e => setNewCat(n => ({ ...n, actual: +e.target.value }))} />
            </div>
            <div className="col-span-3 flex gap-2">
              <button onClick={addCategory} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold">Add</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Category Table */}
          <div className="lg:col-span-2 space-y-2">
            {categories.map(cat => {
              const pct = cat.budget > 0 ? (cat.actual / cat.budget) * 100 : 0;
              const over = cat.actual > cat.budget;
              return (
                <div key={cat.id} className={`bg-white dark:bg-slate-900 rounded-xl p-4 border transition-all ${over ? 'border-red-200 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input type="text" value={cat.category}
                      onChange={e => updateCategory(cat.id, 'category', e.target.value)}
                      className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-transparent border-none outline-none" />
                    {over ? (
                      <span className="text-xs text-red-500 font-semibold shrink-0">+{fmt(cat.actual - cat.budget)} over</span>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">{fmt(cat.budget - cat.actual)} left</span>
                    )}
                    <button onClick={() => removeCategory(cat.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2">
                    <div className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-0.5">
                      <label className={labelCls}>Budget</label>
                      <input type="number" className={inputCls} value={cat.budget}
                        onChange={e => updateCategory(cat.id, 'budget', +e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <label className={labelCls}>Actual</label>
                      <input type="number" className={inputCls} value={cat.actual}
                        onChange={e => updateCategory(cat.id, 'actual', +e.target.value)} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Totals */}
            <div className={`rounded-xl p-4 border-2 font-semibold ${stats.totalActual > stats.totalBudget ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800'}`}>
              <div className="flex justify-between text-sm mb-1">
                <span>Total Budget: <strong>{fmt(stats.totalBudget)}</strong></span>
                <span>Total Actual: <strong>{fmt(stats.totalActual)}</strong></span>
              </div>
              <div className={`text-sm ${stats.variance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                {stats.variance >= 0 ? `✓ ${fmt(stats.variance)} under budget` : `✗ ${fmt(Math.abs(stats.variance))} over budget`}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Budget vs Actual</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip formatter={(v: number) => [fmt(v)]} />
                  <Bar dataKey="Budget" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Actual" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Savings summary */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Savings Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Planned Savings</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(stats.budgetSavings)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Actual Savings</span>
                <span className={`font-semibold ${stats.actualSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{fmt(stats.actualSavings)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-100 dark:border-slate-700 pt-2">
                <span className="text-slate-500">Savings Rate</span>
                <span className="font-semibold">{monthlyIncome > 0 ? ((stats.actualSavings / monthlyIncome) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
