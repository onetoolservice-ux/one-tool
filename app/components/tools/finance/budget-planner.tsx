"use client";
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, Legend, CartesianGrid
} from 'recharts';
import { Plus, Trash2, Wallet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Download, RotateCcw } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

type CatType = 'need' | 'want' | 'saving' | 'investment';
const CAT_META: Record<CatType, { label: string; color: string; bg: string; ideal: number }> = {
  need:       { label: 'Needs',       color: '#3b82f6', bg: 'bg-blue-500',   ideal: 50 },
  want:       { label: 'Wants',       color: '#f59e0b', bg: 'bg-amber-500',  ideal: 30 },
  saving:     { label: 'Savings',     color: '#10b981', bg: 'bg-emerald-500',ideal: 15 },
  investment: { label: 'Investments', color: '#8b5cf6', bg: 'bg-violet-500', ideal: 5  },
};

interface Item { id: string; name: string; amount: number; category: CatType }
interface Income { id: string; name: string; amount: number }

const id = () => Math.random().toString(36).slice(2);

const DEFAULT_INCOME: Income[] = [
  { id: id(), name: 'Salary', amount: 80000 },
];
const DEFAULT_EXPENSES: Item[] = [
  { id: id(), name: 'Rent', amount: 20000, category: 'need' },
  { id: id(), name: 'Groceries', amount: 8000, category: 'need' },
  { id: id(), name: 'Utilities', amount: 3000, category: 'need' },
  { id: id(), name: 'Dining Out', amount: 5000, category: 'want' },
  { id: id(), name: 'Entertainment', amount: 3000, category: 'want' },
  { id: id(), name: 'Emergency Fund', amount: 5000, category: 'saving' },
  { id: id(), name: 'Mutual Fund SIP', amount: 10000, category: 'investment' },
];

function KPI({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-black mt-0.5 ${color || 'text-slate-800 dark:text-slate-100'}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200">{payload[0].name}</p>
      <p className="text-slate-500">{fmt(payload[0].value)}</p>
    </div>
  );
};

export const BudgetPlanner = () => {
  const [income, setIncome] = useState<Income[]>(DEFAULT_INCOME);
  const [expenses, setExpenses] = useState<Item[]>(DEFAULT_EXPENSES);
  const [view, setView] = useState<'overview' | 'breakdown' | 'table'>('overview');
  const [newIncName, setNewIncName] = useState('');
  const [newIncAmt, setNewIncAmt] = useState('');
  const [newExpName, setNewExpName] = useState('');
  const [newExpAmt, setNewExpAmt] = useState('');
  const [newExpCat, setNewExpCat] = useState<CatType>('need');

  const totalIncome = useMemo(() => income.reduce((s, i) => s + i.amount, 0), [income]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const balance = totalIncome - totalExpenses;
  const savingsRate = pct(expenses.filter(e => e.category === 'saving' || e.category === 'investment').reduce((s,e)=>s+e.amount,0), totalIncome);

  const byCat = useMemo(() => {
    const m: Record<CatType, number> = { need: 0, want: 0, saving: 0, investment: 0 };
    expenses.forEach(e => { m[e.category] += e.amount; });
    return m;
  }, [expenses]);

  const pieData = (Object.keys(CAT_META) as CatType[]).map(cat => ({
    name: CAT_META[cat].label,
    value: byCat[cat],
    color: CAT_META[cat].color,
  })).filter(d => d.value > 0);

  const barData = (Object.keys(CAT_META) as CatType[]).map(cat => ({
    category: CAT_META[cat].label,
    actual: byCat[cat],
    ideal: Math.round((CAT_META[cat].ideal / 100) * totalIncome),
  }));

  const addIncome = () => {
    if (!newIncName.trim() || !newIncAmt) { showToast('Enter name and amount', 'error'); return; }
    setIncome(p => [...p, { id: id(), name: newIncName.trim(), amount: Number(newIncAmt) }]);
    setNewIncName(''); setNewIncAmt('');
  };

  const addExpense = () => {
    if (!newExpName.trim() || !newExpAmt) { showToast('Enter name and amount', 'error'); return; }
    setExpenses(p => [...p, { id: id(), name: newExpName.trim(), amount: Number(newExpAmt), category: newExpCat }]);
    setNewExpName(''); setNewExpAmt('');
  };

  const exportCSV = () => {
    const rows = [
      ['Type', 'Name', 'Category', 'Amount (INR)'],
      ...income.map(i => ['Income', i.name, '—', i.amount]),
      ...expenses.map(e => ['Expense', e.name, CAT_META[e.category].label, e.amount]),
      ['', 'Total Income', '', totalIncome],
      ['', 'Total Expenses', '', totalExpenses],
      ['', 'Net Balance', '', balance],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'budget_plan.csv';
    a.click();
    showToast('Budget exported as CSV', 'success');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><Wallet size={18} className="text-emerald-600"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Budget Planner</h2>
            <p className="text-[11px] text-slate-400">50/30/20 rule · Category variance analysis</p>
          </div>
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 ml-2">
          {(['overview', 'breakdown', 'table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${view === v ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex-1"/>
        <button onClick={exportCSV} className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition-colors">
          <Download size={12}/> Export CSV
        </button>
        <button onClick={() => { setIncome(DEFAULT_INCOME); setExpenses(DEFAULT_EXPENSES); }}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 font-semibold flex items-center gap-1.5 transition-colors">
          <RotateCcw size={11}/> Reset
        </button>
      </div>

      {/* ── KPI ROW ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 px-6 py-3 flex-shrink-0">
        <KPI label="Total Income" value={fmt(totalIncome)} color="text-blue-600"/>
        <KPI label="Total Expenses" value={fmt(totalExpenses)} color="text-rose-500"/>
        <KPI label="Net Balance" value={fmt(balance)} color={balance >= 0 ? 'text-emerald-600' : 'text-rose-600'} sub={balance >= 0 ? 'Surplus' : 'Deficit'}/>
        <KPI label="Savings Rate" value={`${savingsRate}%`} color={savingsRate >= 20 ? 'text-emerald-600' : 'text-amber-600'} sub="Incl. investments"/>
        <KPI label="Needs" value={`${pct(byCat.need, totalIncome)}%`} sub={`Ideal ≤50% · ${fmt(byCat.need)}`} color={pct(byCat.need,totalIncome) <= 50 ? 'text-blue-600' : 'text-rose-500'}/>
        <KPI label="Wants" value={`${pct(byCat.want, totalIncome)}%`} sub={`Ideal ≤30% · ${fmt(byCat.want)}`} color={pct(byCat.want,totalIncome) <= 30 ? 'text-amber-600' : 'text-rose-500'}/>
      </div>

      {/* ── MAIN AREA ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Entry panels ──────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          {/* Income */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <TrendingUp size={11} className="text-blue-500"/> Income Sources
            </p>
            <div className="space-y-2">
              {income.map(i => (
                <div key={i.id} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-3 py-2">
                  <span className="flex-1 text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{i.name}</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{fmt(i.amount)}</span>
                  <button onClick={() => setIncome(p => p.filter(x => x.id !== i.id))} className="w-5 h-5 flex items-center justify-center rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
                    <Trash2 size={11} className="text-slate-400 hover:text-rose-500"/>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <input value={newIncName} onChange={e => setNewIncName(e.target.value)} placeholder="Source name" className="flex-1 px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"/>
              <input value={newIncAmt} onChange={e => setNewIncAmt(e.target.value)} type="number" placeholder="₹" className="w-20 px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-700"/>
              <button onClick={addIncome} className="w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"><Plus size={13}/></button>
            </div>
          </div>

          {/* Expenses */}
          <div className="p-4 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <TrendingDown size={11} className="text-rose-500"/> Expenses
            </p>
            <div className="space-y-1.5">
              {expenses.map(e => (
                <div key={e.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-1.5 group">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ backgroundColor: CAT_META[e.category].color }}/>
                  <span className="flex-1 text-xs text-slate-700 dark:text-slate-200 truncate">{e.name}</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{fmt(e.amount)}</span>
                  <button onClick={() => setExpenses(p => p.filter(x => x.id !== e.id))} className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-rose-100 transition-colors">
                    <Trash2 size={11} className="text-rose-400"/>
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex gap-1.5">
                <input value={newExpName} onChange={e => setNewExpName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addExpense()} placeholder="Expense name" className="flex-1 px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"/>
                <input value={newExpAmt} onChange={e => setNewExpAmt(e.target.value)} type="number" placeholder="₹" className="w-20 px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-700"/>
              </div>
              <div className="flex gap-1.5">
                <select value={newExpCat} onChange={e => setNewExpCat(e.target.value as CatType)} className="flex-1 px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {(Object.keys(CAT_META) as CatType[]).map(c => <option key={c} value={c}>{CAT_META[c].label}</option>)}
                </select>
                <button onClick={addExpense} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors"><Plus size={12}/> Add</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Charts / Table ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5">
          {view === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Pie */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Expense Distribution</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {pieData.map((d, i) => <Cell key={i} fill={d.color}/>)}
                    </Pie>
                    <Tooltip content={<CUSTOM_TOOLTIP />}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 50/30/20 Rule Check */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">50/30/20 Rule Analysis</p>
                <div className="space-y-3">
                  {(Object.keys(CAT_META) as CatType[]).map(cat => {
                    const actual = pct(byCat[cat], totalIncome);
                    const ideal = CAT_META[cat].ideal;
                    const ok = actual <= ideal;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{CAT_META[cat].label}</span>
                          <div className="flex items-center gap-2">
                            {ok ? <CheckCircle size={12} className="text-emerald-500"/> : <AlertTriangle size={12} className="text-amber-500"/>}
                            <span className={`text-xs font-bold ${ok ? 'text-emerald-600' : 'text-amber-600'}`}>{actual}% / {ideal}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (actual / ideal) * 100)}%`, backgroundColor: CAT_META[cat].color }}/>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{fmt(byCat[cat])} of {fmt(Math.round(ideal/100*totalIncome))} ideal</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Balance status */}
              <div className={`lg:col-span-2 rounded-2xl border p-4 flex items-center gap-4 ${balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'}`}>
                {balance >= 0 ? <CheckCircle size={24} className="text-emerald-500 flex-shrink-0"/> : <AlertTriangle size={24} className="text-rose-500 flex-shrink-0"/>}
                <div>
                  <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {balance >= 0 ? `You have a monthly surplus of ${fmt(balance)}` : `Monthly deficit: ${fmt(Math.abs(balance))} — review your expenses`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Savings rate: {savingsRate}% · Target: ≥20% · Unallocated: {fmt(Math.max(0, balance))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {view === 'breakdown' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Actual vs Ideal Budget (50/30/20)</p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} barGap={6} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }}/>
                  <YAxis tickFormatter={v => `₹${v/1000}k`} tick={{ fontSize: 11 }}/>
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11 }}/>
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }}/>
                  <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4,4,0,0]}/>
                  <Bar dataKey="ideal" name="Ideal (50/30/20)" fill="#cbd5e1" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {view === 'table' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {['#', 'Type', 'Name', 'Category', 'Amount', '% of Income'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {income.map((i, idx) => (
                    <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-semibold">Income</span></td>
                      <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200">{i.name}</td>
                      <td className="px-4 py-2.5 text-slate-400">—</td>
                      <td className="px-4 py-2.5 font-bold text-blue-600">{fmt(i.amount)}</td>
                      <td className="px-4 py-2.5 text-slate-400">100%</td>
                    </tr>
                  ))}
                  {expenses.map((e, idx) => (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 text-slate-400">{income.length + idx + 1}</td>
                      <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded font-semibold">Expense</span></td>
                      <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200">{e.name}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded font-semibold text-white text-[10px]" style={{ backgroundColor: CAT_META[e.category].color }}>
                          {CAT_META[e.category].label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-rose-600">{fmt(e.amount)}</td>
                      <td className="px-4 py-2.5 text-slate-500">{pct(e.amount, totalIncome)}%</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800 font-bold">
                    <td colSpan={4} className="px-4 py-3 text-slate-600 dark:text-slate-300">Net Balance</td>
                    <td className={`px-4 py-3 text-base font-black ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(balance)}</td>
                    <td className="px-4 py-3 text-slate-500">{pct(Math.abs(balance), totalIncome)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
