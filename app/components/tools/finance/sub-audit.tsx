"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard, Plus, Trash2, AlertCircle, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const STORAGE_KEY = 'otsd-sub-audit';

interface Sub {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  category: string;
  active: boolean;
  lastUsed: 'daily' | 'weekly' | 'rarely' | 'never';
}

const CATEGORIES = ['Streaming', 'Music', 'News', 'Software', 'Fitness', 'Gaming', 'Cloud', 'Learning', 'Finance', 'Other'];
const CAT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#f97316', '#14b8a6', '#84cc16', '#94a3b8'];

const DEFAULT_SUBS: Sub[] = [
  { id: '1', name: 'Netflix', amount: 649, frequency: 'monthly', category: 'Streaming', active: true, lastUsed: 'daily' },
  { id: '2', name: 'Spotify', amount: 119, frequency: 'monthly', category: 'Music', active: true, lastUsed: 'weekly' },
  { id: '3', name: 'Amazon Prime', amount: 1499, frequency: 'yearly', category: 'Streaming', active: true, lastUsed: 'weekly' },
  { id: '4', name: 'YouTube Premium', amount: 189, frequency: 'monthly', category: 'Streaming', active: true, lastUsed: 'daily' },
  { id: '5', name: 'Notion', amount: 0, frequency: 'monthly', category: 'Software', active: true, lastUsed: 'daily' },
  { id: '6', name: 'LinkedIn Premium', amount: 2000, frequency: 'monthly', category: 'Software', active: false, lastUsed: 'rarely' },
];

function toMonthly(amount: number, freq: Sub['frequency']): number {
  if (freq === 'monthly') return amount;
  if (freq === 'quarterly') return amount / 3;
  return amount / 12;
}

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-pink-400 transition-colors w-full';
const labelCls = 'text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide';

export const SubscriptionAudit = () => {
  const [subs, setSubs] = useState<Sub[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : DEFAULT_SUBS;
    } catch { return DEFAULT_SUBS; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  }, [subs]);

  const addSub = () => {
    setSubs(prev => [...prev, {
      id: Date.now().toString(), name: 'New Subscription', amount: 0,
      frequency: 'monthly', category: 'Other', active: true, lastUsed: 'weekly',
    }]);
  };

  const removeSub = (id: string) => setSubs(prev => prev.filter(s => s.id !== id));
  const updateSub = (id: string, field: keyof Sub, value: string | number | boolean) =>
    setSubs(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  const totals = useMemo(() => {
    const active = subs.filter(s => s.active);
    const monthly = active.reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0);
    const yearly = monthly * 12;
    const wasted = active.filter(s => s.lastUsed === 'rarely' || s.lastUsed === 'never')
      .reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0);

    const byCategory = CATEGORIES.map(cat => ({
      name: cat,
      value: Math.round(active.filter(s => s.category === cat).reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0)),
    })).filter(c => c.value > 0);

    return { monthly, yearly, wasted, byCategory, count: active.length };
  }, [subs]);

  const waste = subs.filter(s => s.active && (s.lastUsed === 'rarely' || s.lastUsed === 'never'));

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Subscription Audit"
        subtitle="Track, flag, and eliminate wasteful subscriptions"
        kpis={[
          { label: 'Monthly Cost', value: fmt(totals.monthly), color: 'warning' },
          { label: 'Annual Cost', value: fmt(totals.yearly), color: 'error' },
          { label: 'Active Subs', value: `${totals.count}`, color: 'neutral' },
          { label: 'Waste/Month', value: fmt(totals.wasted), color: 'error' },
        ]}
      />

      <div className="p-4 space-y-4">

        {/* Waste alert */}
        {waste.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300 text-sm mb-1">
                Potential savings: {fmt(totals.wasted)}/month ({fmt(totals.wasted * 12)}/year)
              </p>
              <p className="text-xs text-red-500">Rarely/never used: {waste.map(w => w.name).join(', ')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {subs.map(s => (
              <div key={s.id} className={`bg-white dark:bg-slate-900 rounded-xl p-3 border transition-all ${!s.active ? 'opacity-50 border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="flex gap-2 items-center">
                  <input type="checkbox" checked={s.active} onChange={e => updateSub(s.id, 'active', e.target.checked)}
                    className="accent-pink-500 shrink-0" />
                  <input className="flex-1 text-sm font-semibold bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 min-w-0"
                    value={s.name} onChange={e => updateSub(s.id, 'name', e.target.value)} />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-slate-400">₹</span>
                    <input type="number" className="w-20 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                      value={s.amount} onChange={e => updateSub(s.id, 'amount', +e.target.value)} />
                  </div>
                  <select className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 outline-none shrink-0"
                    value={s.frequency} onChange={e => updateSub(s.id, 'frequency', e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <select className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 outline-none shrink-0"
                    value={s.category} onChange={e => updateSub(s.id, 'category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className={`text-xs border rounded-lg px-2 py-1.5 outline-none shrink-0 ${
                    s.lastUsed === 'daily' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' :
                    s.lastUsed === 'weekly' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' :
                    s.lastUsed === 'rarely' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' :
                    'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}
                    value={s.lastUsed} onChange={e => updateSub(s.id, 'lastUsed', e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="rarely">Rarely</option>
                    <option value="never">Never</option>
                  </select>
                  <button onClick={() => removeSub(s.id)} className="text-slate-400 hover:text-red-500 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {s.active && s.frequency !== 'monthly' && (
                  <div className="text-xs text-slate-400 mt-1 ml-6">= {fmt(toMonthly(s.amount, s.frequency))}/month</div>
                )}
              </div>
            ))}

            <button onClick={addSub}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-pink-400 hover:text-pink-500 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add Subscription
            </button>
          </div>

          {/* Pie + breakdown */}
          <div className="space-y-4">
            {totals.byCategory.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">By Category</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={totals.byCategory} dataKey="value" cx="50%" cy="50%" outerRadius={65} strokeWidth={2}>
                      {totals.byCategory.map((_, i) => (
                        <Cell key={i} fill={CAT_COLORS[CATEGORIES.indexOf(totals.byCategory[i].name) % CAT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v) + '/mo'} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {totals.byCategory.map((c, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[CATEGORIES.indexOf(c.name) % CAT_COLORS.length] }} />
                        <span className="text-slate-500">{c.name}</span>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{fmt(c.value)}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Usage Breakdown</span>
              </div>
              {(['daily', 'weekly', 'rarely', 'never'] as const).map(u => {
                const usCount = subs.filter(s => s.active && s.lastUsed === u).length;
                const usCost = subs.filter(s => s.active && s.lastUsed === u).reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0);
                if (!usCount) return null;
                return (
                  <div key={u} className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 text-sm">
                    <span className="text-slate-500 capitalize">{u} ({usCount})</span>
                    <span className={`font-semibold ${u === 'rarely' || u === 'never' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      {fmt(usCost)}/mo
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
