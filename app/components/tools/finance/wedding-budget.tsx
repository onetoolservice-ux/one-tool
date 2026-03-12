"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Heart, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const STORAGE_KEY = 'otsd-wedding-budget';

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  budgeted: number;
  actual: number;
  paid: boolean;
  vendor: string;
}

const DEFAULT_CATEGORIES = [
  { cat: 'Venue & Decor', items: [
    { name: 'Wedding Venue', budgeted: 300000, actual: 0 },
    { name: 'Decoration', budgeted: 150000, actual: 0 },
    { name: 'Lighting', budgeted: 80000, actual: 0 },
  ]},
  { cat: 'Catering', items: [
    { name: 'Food & Beverages', budgeted: 400000, actual: 0 },
    { name: 'Desserts & Sweets', budgeted: 50000, actual: 0 },
  ]},
  { cat: 'Photography', items: [
    { name: 'Photographer', budgeted: 100000, actual: 0 },
    { name: 'Videographer', budgeted: 80000, actual: 0 },
  ]},
  { cat: 'Attire', items: [
    { name: 'Bridal Outfit', budgeted: 150000, actual: 0 },
    { name: 'Groom Outfit', budgeted: 60000, actual: 0 },
    { name: 'Makeup & Hair', budgeted: 40000, actual: 0 },
  ]},
  { cat: 'Music & Entertainment', items: [
    { name: 'DJ / Band', budgeted: 80000, actual: 0 },
    { name: 'Mehendi Artist', budgeted: 25000, actual: 0 },
  ]},
  { cat: 'Invitations & Gifts', items: [
    { name: 'Wedding Cards', budgeted: 30000, actual: 0 },
    { name: 'Return Gifts', budgeted: 50000, actual: 0 },
  ]},
  { cat: 'Travel & Stay', items: [
    { name: 'Guest Accommodation', budgeted: 100000, actual: 0 },
    { name: 'Honeymoon Travel', budgeted: 150000, actual: 0 },
  ]},
  { cat: 'Miscellaneous', items: [
    { name: 'Pandit / Officiant', budgeted: 20000, actual: 0 },
    { name: 'Emergency Buffer', budgeted: 100000, actual: 0 },
  ]},
];

const CAT_COLORS = ['#ec4899', '#f97316', '#f59e0b', '#8b5cf6', '#6366f1', '#0ea5e9', '#10b981', '#94a3b8'];

function buildDefaultItems(): BudgetItem[] {
  const items: BudgetItem[] = [];
  DEFAULT_CATEGORIES.forEach(c => {
    c.items.forEach(item => {
      items.push({ id: Date.now().toString() + Math.random(), category: c.cat, name: item.name, budgeted: item.budgeted, actual: item.actual, paid: false, vendor: '' });
    });
  });
  return items;
}

const inputCls = 'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-pink-400 transition-colors w-full';

export const WeddingBudget = () => {
  const [items, setItems] = useState<BudgetItem[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : buildDefaultItems();
    } catch { return buildDefaultItems(); }
  });
  const [totalBudget, setTotalBudget] = useState(2000000);
  const [activeTab, setActiveTab] = useState<string>('All');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number | boolean) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const addItem = (cat: string) => {
    setItems(prev => [...prev, { id: Date.now().toString(), category: cat, name: 'New Item', budgeted: 0, actual: 0, paid: false, vendor: '' }]);
  };

  const categories = [...new Set(items.map(i => i.category))];
  const tabs = ['All', ...categories];

  const totals = useMemo(() => {
    const active = activeTab === 'All' ? items : items.filter(i => i.category === activeTab);
    const totalBudgeted = items.reduce((s, i) => s + i.budgeted, 0);
    const totalActual = items.reduce((s, i) => s + i.actual, 0);
    const totalPaid = items.filter(i => i.paid).reduce((s, i) => s + i.actual, 0);
    const remaining = totalBudget - totalActual;
    const overBudget = totalActual > totalBudgeted;

    const pieData = categories.map((cat, idx) => ({
      name: cat,
      value: Math.round(items.filter(i => i.category === cat).reduce((s, i) => s + i.budgeted, 0)),
      color: CAT_COLORS[idx % CAT_COLORS.length],
    })).filter(p => p.value > 0);

    return { totalBudgeted, totalActual, totalPaid, remaining, overBudget, pieData, filtered: active };
  }, [items, activeTab, totalBudget, categories]);

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Wedding Budget Planner"
        subtitle={totalBudget > 0 ? `Total budget: ${fmt(totalBudget)} — plan every rupee of your wedding` : 'Plan every rupee of your wedding — track budgeted vs actual'}
        kpis={[
          { label: 'Total Budgeted', value: fmt(totals.totalBudgeted), color: 'neutral' },
          { label: 'Actual Spend', value: fmt(totals.totalActual), color: totals.overBudget ? 'error' : 'warning' },
          { label: 'Amount Paid', value: fmt(totals.totalPaid), color: 'success' },
          { label: 'Yet to Pay', value: fmt(Math.max(0, totals.totalActual - totals.totalPaid)), color: 'warning' },
        ]}
      />

      <div className="p-4 space-y-4">

        {/* Total budget input */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Total Wedding Budget</div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">₹</span>
              <input type="number" className="text-2xl font-bold bg-transparent border-none outline-none text-pink-600 dark:text-pink-400 w-40"
                value={totalBudget} onChange={e => setTotalBudget(+e.target.value)} />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Spent: {fmt(totals.totalActual)}</span>
              <span>Remaining: {fmt(Math.max(0, totalBudget - totals.totalActual))}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${totals.overBudget ? 'bg-red-500' : 'bg-pink-500'}`}
                style={{ width: `${Math.min(100, (totals.totalActual / totalBudget) * 100)}%` }} />
            </div>
            <div className="text-xs text-slate-400 mt-1">{((totals.totalActual / totalBudget) * 100).toFixed(1)}% spent</div>
          </div>
          {totals.overBudget && (
            <div className="flex items-center gap-1 text-red-500 text-sm font-semibold">
              <AlertCircle className="w-4 h-4" /> Over budget by {fmt(totals.totalActual - totalBudget)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Pie */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Budget by Category</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={totals.pieData} dataKey="value" cx="50%" cy="50%" outerRadius={65} strokeWidth={2}>
                  {totals.pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {totals.pieData.map((p, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-500 truncate max-w-[90px]">{p.name}</span>
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{fmt(p.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3 space-y-3">
            {/* Tabs */}
            <div className="flex gap-1 flex-wrap">
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${activeTab === t ? 'bg-pink-500 text-white border-pink-500' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                  {t}
                </button>
              ))}
            </div>

            {(activeTab === 'All' ? categories : [activeTab]).map(cat => {
              const catItems = items.filter(i => i.category === cat);
              if (activeTab !== 'All' && cat !== activeTab) return null;
              return (
                <div key={cat} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                    <span className="text-xs text-slate-400">
                      {fmt(catItems.reduce((s, i) => s + i.actual, 0))} / {fmt(catItems.reduce((s, i) => s + i.budgeted, 0))}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {catItems.map(item => (
                      <div key={item.id} className="px-4 py-2 grid grid-cols-12 gap-2 items-center text-sm">
                        <div className="col-span-3">
                          <input className="text-sm bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 w-full"
                            value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <input type="number" placeholder="Budgeted" className={inputCls}
                            value={item.budgeted || ''} onChange={e => updateItem(item.id, 'budgeted', +e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <input type="number" placeholder="Actual" className={inputCls}
                            value={item.actual || ''} onChange={e => updateItem(item.id, 'actual', +e.target.value)} />
                        </div>
                        <div className="col-span-3">
                          <input placeholder="Vendor" className={inputCls}
                            value={item.vendor} onChange={e => updateItem(item.id, 'vendor', e.target.value)} />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <button onClick={() => updateItem(item.id, 'paid', !item.paid)}
                            className={`${item.paid ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`}>
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={() => addItem(cat)}
                      className="text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1 font-semibold">
                      <Plus className="w-3 h-3" /> Add item
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
