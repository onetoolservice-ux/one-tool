"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, Legend, CartesianGrid,
} from 'recharts';
import {
  Plus, Trash2, Wallet, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Download, RotateCcw,
  ChevronDown, ChevronUp, Sparkles, X, Check,
} from 'lucide-react';
import {
  getPFFinanceSummary, PF_TO_BUDGET_CAT,
  type ImportIncomeRow, type ImportExpenseRow, type BudgetCatType,
} from './pf-data-bridge';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

const CAT_META: Record<BudgetCatType, { label: string; color: string; ideal: number }> = {
  need:       { label: 'Needs',       color: '#3b82f6', ideal: 50 },
  want:       { label: 'Wants',       color: '#f59e0b', ideal: 30 },
  saving:     { label: 'Savings',     color: '#10b981', ideal: 15 },
  investment: { label: 'Investments', color: '#8b5cf6', ideal: 5  },
};

interface BudgetItem { id: string; name: string; amount: number; category: BudgetCatType }
interface IncomeItem  { id: string; name: string; amount: number }

const uid = () => Math.random().toString(36).slice(2);


const labelCls = 'text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const inputCls =
  'text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 ' +
  'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200">{payload[0].name}</p>
      <p className="text-slate-500">{fmt(payload[0].value)}</p>
    </div>
  );
};

export const BudgetPlanner = () => {
  const [income,   setIncome]   = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<BudgetItem[]>([]);
  const [view,     setView]     = useState<'overview' | 'breakdown' | 'table'>('overview');

  // Panels
  const [entryOpen,  setEntryOpen]  = useState(true);
  const [importOpen, setImportOpen] = useState(false);

  // Table view selection
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const toggleCheck = (id: string) =>
    setCheckedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const allTableIds = [...income.map(i => i.id), ...expenses.map(e => e.id)];
  const deleteChecked = () => {
    setIncome(p => p.filter(i => !checkedIds.has(i.id)));
    setExpenses(p => p.filter(e => !checkedIds.has(e.id)));
    setCheckedIds(new Set());
  };

  // Entry add forms
  const [newIncName, setNewIncName] = useState('');
  const [newIncAmt,  setNewIncAmt]  = useState('');
  const [newExpName, setNewExpName] = useState('');
  const [newExpAmt,  setNewExpAmt]  = useState('');
  const [newExpCat,  setNewExpCat]  = useState<BudgetCatType>('need');

  // PF import state
  const [hasPFData,       setHasPFData]       = useState(false);
  const [pfMonthCount,    setPfMonthCount]     = useState(0);
  const [importIncome,    setImportIncome]     = useState<ImportIncomeRow[]>([]);
  const [importExpenses,  setImportExpenses]   = useState<ImportExpenseRow[]>([]);
  const [importMode,      setImportMode]       = useState<'replace' | 'merge'>('replace');

  const hasAutoImported = useRef(false);

  useEffect(() => {
    const refreshImportRows = () => {
      const s = getPFFinanceSummary(3);
      setHasPFData(s.hasData);
      setPfMonthCount(s.monthCount);
      if (s.hasData) {
        setImportIncome(s.incomeRows);
        setImportExpenses(s.expenseRows);
      }
    };

    // First mount: load PF + auto-apply if lists are empty
    const s = getPFFinanceSummary(3);
    setHasPFData(s.hasData);
    setPfMonthCount(s.monthCount);
    if (s.hasData) {
      setImportIncome(s.incomeRows);
      setImportExpenses(s.expenseRows);
      if (!hasAutoImported.current) {
        hasAutoImported.current = true;
        const newIncome: IncomeItem[] = s.incomeRows
          .filter(r => r.selected && r.editedAmount > 0)
          .map(r => ({ id: uid(), name: r.name, amount: r.editedAmount }));
        const newExpenses: BudgetItem[] = s.expenseRows
          .filter(r => r.selected && r.editedAmount > 0)
          .map(r => ({ id: uid(), name: r.category, amount: r.editedAmount, category: r.budgetCat }));
        if (newIncome.length > 0)   setIncome(newIncome);
        if (newExpenses.length > 0) setExpenses(newExpenses);
      }
    }

    window.addEventListener('pf-store-updated', refreshImportRows);
    return () => window.removeEventListener('pf-store-updated', refreshImportRows);
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalIncome   = useMemo(() => income.reduce((s, i) => s + i.amount, 0), [income]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const balance = totalIncome - totalExpenses;
  const savingsRate = pct(
    expenses.filter(e => e.category === 'saving' || e.category === 'investment').reduce((s, e) => s + e.amount, 0),
    totalIncome,
  );

  const byCat = useMemo(() => {
    const m: Record<BudgetCatType, number> = { need: 0, want: 0, saving: 0, investment: 0 };
    expenses.forEach(e => { m[e.category] += e.amount; });
    return m;
  }, [expenses]);

  const pieData = (Object.keys(CAT_META) as BudgetCatType[])
    .map(cat => ({ name: CAT_META[cat].label, value: byCat[cat], color: CAT_META[cat].color }))
    .filter(d => d.value > 0);

  const barData = (Object.keys(CAT_META) as BudgetCatType[]).map(cat => ({
    category: CAT_META[cat].label,
    actual: byCat[cat],
    ideal: Math.round((CAT_META[cat].ideal / 100) * totalIncome),
  }));

  // ── Entry actions ──────────────────────────────────────────────────────────
  const addIncome = () => {
    if (!newIncName.trim() || !newIncAmt) return;
    setIncome(p => [...p, { id: uid(), name: newIncName.trim(), amount: Number(newIncAmt) }]);
    setNewIncName(''); setNewIncAmt('');
  };

  const addExpense = () => {
    if (!newExpName.trim() || !newExpAmt) return;
    setExpenses(p => [...p, { id: uid(), name: newExpName.trim(), amount: Number(newExpAmt), category: newExpCat }]);
    setNewExpName(''); setNewExpAmt('');
  };

  // ── Import from PF ─────────────────────────────────────────────────────────
  const handleImport = () => {
    const newIncome: IncomeItem[] = importIncome
      .filter(r => r.selected && r.editedAmount > 0)
      .map(r => ({ id: uid(), name: r.name, amount: r.editedAmount }));

    const newExpenses: BudgetItem[] = importExpenses
      .filter(r => r.selected && r.editedAmount > 0)
      .map(r => ({ id: uid(), name: r.category, amount: r.editedAmount, category: r.budgetCat }));

    if (importMode === 'replace') {
      if (newIncome.length > 0) setIncome(newIncome);
      if (newExpenses.length > 0) setExpenses(newExpenses);
    } else {
      if (newIncome.length > 0) setIncome(p => [...p, ...newIncome]);
      if (newExpenses.length > 0) setExpenses(p => [...p, ...newExpenses]);
    }

    setImportOpen(false);
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
    a.download = 'budget_plan.csv'; a.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">

      {/* ── CONTROLS BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <Wallet size={16} className="text-emerald-600" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">Budget Planner</span>
          <span className="text-[11px] text-slate-400 ml-1 hidden sm:block">50/30/20 rule · Category variance analysis</span>
        </div>

        {/* View tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(['overview', 'breakdown', 'table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 text-xs font-semibold capitalize rounded-md transition-all ${
                view === v
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              {v}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Smart import button — only shows when PF data exists */}
        {hasPFData && (
          <button onClick={() => { setImportOpen(v => !v); setEntryOpen(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
              importOpen
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                : 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30'
            }`}>
            <Sparkles size={12} />
            Use My Statements ({pfMonthCount}mo)
            {importOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        )}
        <button onClick={() => { setEntryOpen(v => !v); setImportOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          {entryOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {entryOpen ? 'Hide' : 'Edit Budget'}
        </button>
        <button onClick={() => {
          setIncome([]);
          setExpenses([]);
          hasAutoImported.current = false;
        }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold transition-colors">
          <RotateCcw size={11} /> Clear
        </button>

        {/* Selection badge (table view only) */}
        {view === 'table' && checkedIds.size > 0 && (
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
            {checkedIds.size} selected
          </span>
        )}

        {/* Delete — greyed when no selection or not in table view */}
        <button
          disabled={checkedIds.size === 0}
          onClick={deleteChecked}
          title="Delete selected rows"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
            checkedIds.size > 0
              ? 'bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 dark:text-rose-400'
              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}>
          <Trash2 size={12} /> Delete
        </button>

        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          <Download size={12} /> Export
        </button>
      </div>

      {/* ── SMART TABLE BAR (KPIs) ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-2.5 flex items-center gap-2.5 flex-shrink-0 flex-wrap">
        <span className="text-sm font-bold text-slate-800 dark:text-white mr-1">Monthly Budget</span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs font-semibold text-blue-600 dark:text-blue-400">
          Income <span className="ml-1">{fmt(totalIncome)}</span>
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-xs font-semibold text-rose-600 dark:text-rose-400">
          Expenses <span className="ml-1">{fmt(totalExpenses)}</span>
        </span>
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          balance >= 0
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
        }`}>
          {balance >= 0 ? 'Surplus' : 'Deficit'} <span className="ml-1">{fmt(Math.abs(balance))}</span>
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          savingsRate >= 20
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
        }`}>Savings {savingsRate}%</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pct(byCat.need, totalIncome) <= 50 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
          Needs {pct(byCat.need, totalIncome)}% <span className="opacity-60">/ 50%</span>
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pct(byCat.want, totalIncome) <= 30 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
          Wants {pct(byCat.want, totalIncome)}% <span className="opacity-60">/ 30%</span>
        </span>
      </div>

      {/* ── SMART IMPORT PANEL ─────────────────────────────────────────────────── */}
      {importOpen && hasPFData && (
        <div className="bg-violet-50 dark:bg-violet-900/10 border-b border-violet-200 dark:border-violet-800 flex-shrink-0 overflow-y-auto max-h-72">
          <div className="px-6 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                  <Sparkles size={12} /> Import from Your Statements — last {pfMonthCount} months avg
                </p>
                <p className="text-[10px] text-violet-500 dark:text-violet-400 mt-0.5">
                  Edit amounts, adjust category mapping, then click Import.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Replace vs Merge toggle */}
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-violet-200 dark:border-violet-700">
                  {(['replace', 'merge'] as const).map(m => (
                    <button key={m} onClick={() => setImportMode(m)}
                      className={`px-2.5 py-1 text-[10px] font-bold capitalize rounded-md transition-all ${
                        importMode === m
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}>{m}</button>
                  ))}
                </div>
                <button onClick={() => setImportOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-violet-200 dark:hover:bg-violet-800/50 text-violet-500">
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Import grid: Income | Expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Income side */}
              <div>
                <p className={`${labelCls} text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1`}>
                  <TrendingUp size={10} /> Income Sources (avg/mo)
                </p>
                <div className="space-y-1.5">
                  {importIncome.map((row, i) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={row.selected}
                        onChange={e => setImportIncome(p => p.map((r, j) => j === i ? { ...r, selected: e.target.checked } : r))}
                        className="accent-violet-600 w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate min-w-0">{row.name}</span>
                      <input type="number" value={row.editedAmount}
                        onChange={e => setImportIncome(p => p.map((r, j) => j === i ? { ...r, editedAmount: Number(e.target.value) } : r))}
                        className={`${inputCls} w-28 text-right font-mono`} />
                    </div>
                  ))}
                  {importIncome.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No income credits detected in recent months.</p>
                  )}
                </div>
              </div>

              {/* Expenses side */}
              <div>
                <p className={`${labelCls} text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1`}>
                  <TrendingDown size={10} /> Expenses — avg/mo + category mapping
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {importExpenses.map((row, i) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={row.selected}
                        onChange={e => setImportExpenses(p => p.map((r, j) => j === i ? { ...r, selected: e.target.checked } : r))}
                        className="accent-violet-600 w-3.5 h-3.5 flex-shrink-0" />
                      <span className="w-28 text-xs text-slate-700 dark:text-slate-300 truncate flex-shrink-0">{row.category}</span>
                      <input type="number" value={row.editedAmount}
                        onChange={e => setImportExpenses(p => p.map((r, j) => j === i ? { ...r, editedAmount: Number(e.target.value) } : r))}
                        className={`${inputCls} w-24 text-right font-mono flex-shrink-0`} />
                      <select value={row.budgetCat}
                        onChange={e => setImportExpenses(p => p.map((r, j) => j === i ? { ...r, budgetCat: e.target.value as BudgetCatType } : r))}
                        className={`${inputCls} flex-1 min-w-0 text-[10px]`}>
                        {(Object.keys(CAT_META) as BudgetCatType[]).map(c => (
                          <option key={c} value={c}>{CAT_META[c].label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Import button */}
            <div className="flex items-center gap-3 mt-4">
              <button onClick={handleImport}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors">
                <Sparkles size={12} />
                Import {importMode === 'replace' ? '(replace current)' : '(add to existing)'}
              </button>
              <span className="text-[10px] text-violet-500 dark:text-violet-400">
                {importIncome.filter(r => r.selected).length} income source{importIncome.filter(r => r.selected).length !== 1 ? 's' : ''} +{' '}
                {importExpenses.filter(r => r.selected).length} expense categor{importExpenses.filter(r => r.selected).length !== 1 ? 'ies' : 'y'} selected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── ENTRY PANELS (collapsible) ─────────────────────────────────────────── */}
      {entryOpen && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700">
            {/* Income panel */}
            <div className="px-6 py-4">
              <p className={`${labelCls} flex items-center gap-1.5 mb-3`}>
                <TrendingUp size={10} className="text-blue-500" /> Income Sources
              </p>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                {income.map(i => (
                  <span key={i.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{i.name}</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{fmt(i.amount)}</span>
                    <button onClick={() => setIncome(p => p.filter(x => x.id !== i.id))}
                      className="ml-0.5 w-4 h-4 flex items-center justify-center rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
                      <Trash2 size={10} className="text-slate-400 hover:text-rose-500" />
                    </button>
                  </span>
                ))}
                {income.length === 0 && (
                  <p className="text-xs text-slate-400 italic">
                    {hasPFData ? 'Auto-loaded from your statements. Use "Use My Statements" to re-import.' : 'No income sources yet. Add one below or import statements from Personal Finance.'}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <input value={newIncName} onChange={e => setNewIncName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addIncome()}
                  placeholder="Source name" className={`${inputCls} flex-1`} />
                <input value={newIncAmt} onChange={e => setNewIncAmt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addIncome()}
                  type="number" placeholder="₹ Amount" className={`${inputCls} w-28`} />
                <button onClick={addIncome}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>

            {/* Expense panel */}
            <div className="px-6 py-4">
              <p className={`${labelCls} flex items-center gap-1.5 mb-3`}>
                <TrendingDown size={10} className="text-rose-500" /> Expenses
              </p>
              <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto min-h-[28px]">
                {expenses.map(e => (
                  <span key={e.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CAT_META[e.category].color }} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{e.name}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{fmt(e.amount)}</span>
                    <button onClick={() => setExpenses(p => p.filter(x => x.id !== e.id))}
                      className="ml-0.5 w-4 h-4 flex items-center justify-center rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
                      <Trash2 size={10} className="text-slate-400 hover:text-rose-500" />
                    </button>
                  </span>
                ))}
                {expenses.length === 0 && (
                  <p className="text-xs text-slate-400 italic">
                    {hasPFData ? 'Auto-loaded from your statements.' : 'No expenses yet. Add one below.'}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <input value={newExpName} onChange={e => setNewExpName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addExpense()}
                  placeholder="Expense name" className={`${inputCls} flex-1 min-w-28`} />
                <input value={newExpAmt} onChange={e => setNewExpAmt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addExpense()}
                  type="number" placeholder="₹ Amount" className={`${inputCls} w-28`} />
                <select value={newExpCat} onChange={e => setNewExpCat(e.target.value as BudgetCatType)}
                  className={`${inputCls} w-36`}>
                  {(Object.keys(CAT_META) as BudgetCatType[]).map(c => (
                    <option key={c} value={c}>{CAT_META[c].label}</option>
                  ))}
                </select>
                <button onClick={addExpense}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors">
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

        {view === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Expense Distribution</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">50/30/20 Rule Analysis</p>
              <div className="space-y-4">
                {(Object.keys(CAT_META) as BudgetCatType[]).map(cat => {
                  const actual = pct(byCat[cat], totalIncome);
                  const ideal  = CAT_META[cat].ideal;
                  const ok = actual <= ideal;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{CAT_META[cat].label}</span>
                        <div className="flex items-center gap-2">
                          {ok ? <CheckCircle size={12} className="text-emerald-500" /> : <AlertTriangle size={12} className="text-amber-500" />}
                          <span className={`text-xs font-bold ${ok ? 'text-emerald-600' : 'text-amber-600'}`}>{actual}% / {ideal}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (actual / Math.max(1, ideal)) * 100)}%`, backgroundColor: CAT_META[cat].color }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {fmt(byCat[cat])} of {fmt(Math.round(ideal / 100 * totalIncome))} ideal
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`lg:col-span-2 rounded-xl border p-4 flex items-center gap-4 ${
              balance >= 0
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'
            }`}>
              {balance >= 0
                ? <CheckCircle size={22} className="text-emerald-500 flex-shrink-0" />
                : <AlertTriangle size={22} className="text-rose-500 flex-shrink-0" />}
              <div>
                <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {balance >= 0 ? `Monthly surplus of ${fmt(balance)} — great job!` : `Monthly deficit: ${fmt(Math.abs(balance))} — review your expenses`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Savings rate: {savingsRate}% · Target: ≥20% · Unallocated surplus: {fmt(Math.max(0, balance))}
                </p>
              </div>
            </div>
          </div>
        )}

        {view === 'breakdown' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Actual vs Ideal Budget (50/30/20)</p>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={barData} barGap={6} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${v / 1000}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: '8px' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="actual" name="Actual"           fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ideal"  name="Ideal (50/30/20)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {view === 'table' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {/* Select-all checkbox */}
                  <th className="px-3 py-2.5 w-8">
                    <button
                      onClick={() => {
                        if (checkedIds.size === allTableIds.length && allTableIds.length > 0) {
                          setCheckedIds(new Set());
                        } else {
                          setCheckedIds(new Set(allTableIds));
                        }
                      }}
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        checkedIds.size === allTableIds.length && allTableIds.length > 0
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-400 dark:border-slate-500 hover:border-blue-500'
                      }`}>
                      {checkedIds.size === allTableIds.length && allTableIds.length > 0 && <Check size={9} strokeWidth={3} />}
                    </button>
                  </th>
                  {['#', 'Type', 'Name', 'Category', 'Amount', '% of Income'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {income.map((i, idx) => (
                  <tr key={i.id}
                    onClick={() => toggleCheck(i.id)}
                    className={`cursor-pointer transition-colors ${
                      checkedIds.has(i.id) ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}>
                    <td className="px-3 py-2.5">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        checkedIds.has(i.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400 dark:border-slate-500'
                      }`}>
                        {checkedIds.has(i.id) && <Check size={9} strokeWidth={3} />}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px] font-semibold">Income</span></td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200">{i.name}</td>
                    <td className="px-4 py-2.5 text-slate-400">—</td>
                    <td className="px-4 py-2.5 font-bold text-blue-600">{fmt(i.amount)}</td>
                    <td className="px-4 py-2.5 text-slate-400">100%</td>
                  </tr>
                ))}
                {expenses.map((e, idx) => (
                  <tr key={e.id}
                    onClick={() => toggleCheck(e.id)}
                    className={`cursor-pointer transition-colors ${
                      checkedIds.has(e.id) ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}>
                    <td className="px-3 py-2.5">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        checkedIds.has(e.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400 dark:border-slate-500'
                      }`}>
                        {checkedIds.has(e.id) && <Check size={9} strokeWidth={3} />}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{income.length + idx + 1}</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded text-[10px] font-semibold">Expense</span></td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200">{e.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-white text-[10px] font-semibold" style={{ backgroundColor: CAT_META[e.category].color }}>
                        {CAT_META[e.category].label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-rose-600">{fmt(e.amount)}</td>
                    <td className="px-4 py-2.5 text-slate-500">{pct(e.amount, totalIncome)}%</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                  <td />
                  <td colSpan={4} className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">Net Balance</td>
                  <td className={`px-4 py-3 font-black text-sm ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(balance)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{pct(Math.abs(balance), totalIncome)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
