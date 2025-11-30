#!/bin/bash

echo "íº€ Starting Complete Project Repair..."

# =========================================================
# 1. GLOBAL: Fix Guide Content Interface (Resolves 'desc' error)
# =========================================================
echo "í´§ Fixing app/lib/guide-content.ts..."
mkdir -p app/lib
cat > app/lib/guide-content.ts << 'END_CONTENT'
import { ReactNode } from "react";

// Matches SmartAssistant.tsx expectations
export interface GuideData {
  title: string;
  status: "Live" | "In Progress" | "Backlog";
  desc: string;        
  steps: string[];     
  tips: string[];      
  shortcuts?: { action: string; key: string }[]; 
}

export const GUIDE_CONTENT: Record<string, GuideData> = {
  "/tools/finance/smart-budget": {
    title: "Budgeting 101",
    status: "Live",
    desc: "Use the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings. Track every expense to identify leaks.",
    steps: ["Calculate your total monthly income", "Categorize your fixed and variable expenses", "Set limits for discretionary spending"],
    tips: ["Use the 50/30/20 rule as a baseline", "Review your budget weekly, not just monthly"]
  },
  "/tools/finance/smart-loan": {
    title: "Amortization Strategy",
    status: "Live",
    desc: "Paying even one extra EMI per year reduces your tenure significantly. Interest is front-loaded in early years.",
    steps: ["Enter your principal loan amount", "Input your annual interest rate", "Set the loan tenure in years"],
    tips: ["Making one extra payment a year can shave years off your loan", "Refinance if rates drop by more than 1%"]
  },
  "/tools/finance/smart-debt": {
    title: "Payoff Strategies",
    status: "Live",
    desc: "Avalanche (High Interest) saves the most money. Snowball (Low Balance) builds motivation quickly.",
    steps: ["List all debts by interest rate and balance", "Choose Avalanche or Snowball method", "Automate minimum payments for all debts"],
    tips: ["Focus on high-interest debt first (Avalanche method)", "Consolidate debts if you can get a lower rate"]
  },
  "/tools/finance/smart-net-worth": {
    title: "Asset Allocation",
    status: "Live",
    desc: "Assets put money in your pocket (Stocks, Real Estate). Liabilities take money out (Loans, Credit Card debt).",
    steps: ["List all liquid assets (cash, savings)", "List investment assets", "Subtract all liabilities"],
    tips: ["Update your net worth statement quarterly", "Focus on increasing income-generating assets"]
  },
  "/tools/developer/smart-sql": {
    title: "SQL Best Practices",
    status: "Live",
    desc: "Always use uppercase for keywords (SELECT, FROM). Indent nested queries for readability.",
    steps: ["Write your query using standard keywords", "Format with proper indentation", "Test with a limit clause first"],
    tips: ["Avoid SELECT * in production", "Index columns used in WHERE clauses"]
  },
  "/tools/developer/smart-regex": {
    title: "Regex Cheat Sheet",
    status: "Live",
    desc: "^ Start, $ End, . Any, * 0+, + 1+, ? 0-1, \\d Digit, \\w Word. Use flags: g (global), i (insensitive).",
    steps: ["Define the pattern you want to match", "Choose appropriate flags (g, i, m)", "Test against sample strings"],
    tips: ["Use non-capturing groups (?:...) when possible", "Be careful with greedy quantifiers"]
  },
  "/tools/documents/pdf/merge": {
    title: "PDF Management",
    status: "Live",
    desc: "Drag and drop files to reorder them before merging. The top file becomes the first page.",
    steps: ["Upload multiple PDF files", "Drag to reorder pages", "Click Merge to download"],
    tips: ["Compress files before merging if they are large", "Ensure all files are not password protected"]
  },
  "/tools/health/smart-bmi": {
    title: "BMI Metrics",
    status: "In Progress",
    desc: "Documentation for health metrics is currently being written by our medical team.",
    steps: [],
    tips: []
  }
};

export const DEFAULT_GUIDE: GuideData = {
  title: "Context Guide",
  status: "Backlog",
  desc: "No specific documentation available for this view yet.",
  steps: [],
  tips: []
};
END_CONTENT

# =========================================================
# 2. BUDGET TRACKER: Fix Chart Props & Types
# =========================================================
echo "í´§ Fixing app/tools/finance/budget-tracker/page.tsx..."
cat > app/tools/finance/budget-tracker/page.tsx << 'END_CONTENT'
"use client";

import React, { useEffect, useMemo, useState, ReactNode } from "react";
import { Wallet, Plus } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Treemap } from "recharts";
import { useSwipeable } from "react-swipeable";
import debounce from "lodash.debounce";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LS_KEYS = {
  TRANSACTIONS: "ots_budget_txns_v1",
  COLS: "ots_budget_cols_v1",
  VARIANTS: "ots_budget_variants_v1",
  SETTINGS: "ots_budget_settings_v1"
};

interface Transaction {
  id: string;
  date: string;
  type: string;
  category: string;
  desc: string;
  mode: string;
  amount: number;
  status: string;
  isEditing?: boolean;
  draft?: Partial<Transaction> | null;
  _isNew?: boolean;
}

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface Variant {
  id: string;
  name: string;
  payload: { filters: { search: string; categoryFilter: string; }; columns: Column[]; };
  created_at: string;
}

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "2025-05-01", type: "Expense", category: "Groceries", desc: "Milk + Vegetables", mode: "Card", amount: 550, status: "Posted", isEditing: false, draft: null },
  { id: "t2", date: "2025-05-01", type: "Income", category: "Salary", desc: "Monthly Income", mode: "Bank", amount: 48000, status: "Posted", isEditing: false, draft: null },
];

const DEFAULT_COLUMNS: Column[] = [
  { key: "date", label: "Date", visible: true },
  { key: "type", label: "Type", visible: true },
  { key: "category", label: "Category", visible: true },
  { key: "desc", label: "Description", visible: true },
  { key: "mode", label: "Mode", visible: true },
  { key: "amount", label: "Amount", visible: true },
  { key: "status", label: "Status", visible: true },
];

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeLS(key: string, value: any) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const autosaveDebounced = debounce((items: Transaction[]) => { writeLS(LS_KEYS.TRANSACTIONS, items); }, 800);

export default function BudgetUltimateClient() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window === 'undefined') return DEMO_TRANSACTIONS;
    const stored = readLS<Transaction[]>(LS_KEYS.TRANSACTIONS, []);
    if (stored && stored.length) return stored.map(r => ({ ...r, isEditing: false, draft: null }));
    return DEMO_TRANSACTIONS.map(t => ({ ...t, isEditing: false, draft: null }));
  });

  const [columns, setColumns] = useState<Column[]>(() => typeof window === 'undefined' ? DEFAULT_COLUMNS : readLS(LS_KEYS.COLS, DEFAULT_COLUMNS));
  const visibleColumns = columns.filter(c => c.visible);
  const [variants, setVariants] = useState<Variant[]>(() => typeof window === 'undefined' ? [] : readLS(LS_KEYS.VARIANTS, []));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currency, setCurrency] = useState(() => typeof window === 'undefined' ? "â‚¹" : readLS(LS_KEYS.SETTINGS, { currency: "â‚¹" }).currency || "â‚¹");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSavingIndicator, setIsSavingIndicator] = useState(false);

  const stats = useMemo(() => {
    const income = transactions.reduce((s, r) => s + (r.type === "Income" ? Number(r.amount || 0) : 0), 0);
    const expense = transactions.reduce((s, r) => s + (r.type === "Expense" ? Number(r.amount || 0) : 0), 0);
    const balance = income - expense;
    return { income, expense, balance, savingsRate: income ? ((balance / income) * 100).toFixed(1) : "0" };
  }, [transactions]);

  const monthlyExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(r => {
      const m = r.date ? r.date.slice(0, 7) : "unknown";
      if (!map[m]) map[m] = 0;
      if (r.type === "Expense") map[m] += Number(r.amount || 0);
    });
    return Object.keys(map).sort().map(k => ({ month: k, amount: map[k] }));
  }, [transactions]);

  const categorySplit = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(r => {
      const c = r.category || "Other";
      if (!map[c]) map[c] = 0;
      map[c] += Number(r.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const displayed = transactions.filter(r => {
    if (categoryFilter !== "All" && r.category !== categoryFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.desc || "").toLowerCase().includes(q) || (r.category || "").toLowerCase().includes(q) || String(r.amount).toLowerCase().includes(q);
  });

  useEffect(() => { setIsSavingIndicator(true); autosaveDebounced(transactions); const t = setTimeout(() => setIsSavingIndicator(false), 1000); return () => clearTimeout(t); }, [transactions]);
  useEffect(() => writeLS(LS_KEYS.COLS, columns), [columns]);
  useEffect(() => writeLS(LS_KEYS.VARIANTS, variants), [variants]);

  const editRow = (id: string) => { setTransactions(prev => prev.map(row => (row.id === id ? { ...row, isEditing: true, draft: { ...(row.draft ?? row) } } : row))); };
  const updateDraft = (id: string, key: string, value: any) => { setTransactions(prev => prev.map(row => (row.id === id ? { ...row, draft: { ...(row.draft ?? {}), [key]: value } } : row))); };
  const saveRow = (id: string) => {
    const row = transactions.find(r => r.id === id); if (!row) return;
    const d = row.draft ?? {}; if (!d.date) { toast.error("Date required"); return; }
    // @ts-ignore
    if ((d.type || row.type) === "Expense" && Number(d.amount ?? row.amount) <= 0) { toast.error("Amount must be > 0"); return; }
    // @ts-ignore
    setTransactions(prev => prev.map(r => r.id === id ? { ...({ ...r, ...d }), isEditing: false, draft: null } : r));
    toast.success("Saved");
  };
  const cancelEdit = (id: string) => {
    const row = transactions.find(r => r.id === id); if (!row) return;
    if (row._isNew) { setTransactions(prev => prev.filter(r => r.id !== id)); } else { setTransactions(prev => prev.map(r => r.id === id ? { ...r, isEditing: false, draft: null } : r)); }
  };
  const addRow = () => {
    const newRow: Transaction = { id: uid(), date: new Date().toISOString().slice(0, 10), type: "Expense", category: "Groceries", desc: "", mode: "Card", amount: 0, status: "Draft", isEditing: true, draft: { date: new Date().toISOString().slice(0, 10), type: "Expense", category: "Groceries", desc: "", mode: "Card", amount: 0, status: "Draft" }, _isNew: true };
    setTransactions(prev => [newRow, ...prev]);
  };
  const deleteRow = (id: string) => { setTransactions(prev => prev.filter(r => r.id !== id)); setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; }); };
  const toggleSelect = (id: string) => { setSelectedIds(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; }); };
  const toggleAll = () => { if (selectedIds.size === displayed.length) setSelectedIds(new Set()); else setSelectedIds(new Set(displayed.map(r => r.id))); };
  const deleteSelected = () => { if (selectedIds.size === 0) return toast.info("No rows selected"); if (!confirm(`Delete ${selectedIds.size} rows?`)) return; setTransactions(prev => prev.filter(r => !selectedIds.has(r.id))); setSelectedIds(new Set()); toast.success("Deleted selected"); };
  
  const exportToXlsx = (rows: Transaction[], filename = "transactions.xlsx") => { if (!rows || rows.length === 0) { toast.info("No rows"); return; } const ws = XLSX.utils.json_to_sheet(rows.map(r => ({ date: r.date, type: r.type, category: r.category, description: r.desc, mode: r.mode, amount: r.amount, status: r.status }))); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Transactions"); XLSX.writeFile(wb, filename); };
  const exportSelected = () => exportToXlsx(transactions.filter(r => selectedIds.has(r.id)));
  const exportAll = () => exportToXlsx(transactions);
  
  const handleImportFile = async (file: File) => {
    try { const ab = await file.arrayBuffer(); const wb = XLSX.read(ab, { type: "array" }); const ws = wb.Sheets[wb.SheetNames[0]]; const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const parsed: Transaction[] = data.map((row: any) => ({ id: uid(), date: row.date || new Date().toISOString().slice(0, 10), type: row.type || "Expense", category: row.category || "Uncategorized", desc: row.description || "", mode: row.mode || "Card", amount: Number(row.amount || 0), status: "Posted", isEditing: false, draft: null }));
      setTransactions(prev => [...parsed, ...prev]); toast.success(`Imported ${parsed.length} rows`);
    } catch (err) { toast.error("Import failed"); }
  };

  const clearDemo = () => { if (!confirm("Clear all?")) return; setTransactions([]); setSelectedIds(new Set()); toast.info("Cleared"); };
  const reloadDemo = () => { setTransactions(DEMO_TRANSACTIONS.map(t => ({ ...t, isEditing: false, draft: null }))); toast.info("Demo reloaded"); };
  const toggleColumn = (key: string) => { setColumns(prev => { const out = prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c); writeLS(LS_KEYS.COLS, out); return out; }); };
  const saveVariant = (name: string) => { if (!name) return toast.error("Name required"); const payload = { filters: { search, categoryFilter }, columns }; const v: Variant = { id: uid(), name, payload, created_at: new Date().toISOString() }; setVariants(prev => { const out = [v, ...prev]; writeLS(LS_KEYS.VARIANTS, out); return out; }); toast.success("Saved"); };
  const loadVariant = (id: string) => { const v = variants.find(x => x.id === id); if (!v) return; setSearch(v.payload.filters.search || ""); setCategoryFilter(v.payload.filters.categoryFilter || "All"); setColumns(v.payload.columns || DEFAULT_COLUMNS); toast.success("Applied"); };
  const deleteVariant = (id: string) => { if (!confirm("Delete?")) return; setVariants(prev => { const out = prev.filter(x => x.id !== id); writeLS(LS_KEYS.VARIANTS, out); return out; }); toast.success("Deleted"); };

  function SwipeableRow({ row, children }: { row: Transaction, children: ReactNode }) {
    const handlers = useSwipeable({ onSwipedLeft: () => deleteRow(row.id), onSwipedRight: () => editRow(row.id), trackMouse: true });
    // @ts-ignore
    return <tr {...handlers}>{children}</tr>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md border-b p-6 flex items-center justify-between">
        <div className="flex items-center gap-4"><Wallet size={20} /><div><h1 className="text-xl font-bold">Budget Ultimate â€” Local</h1><div className="text-xs text-muted">Persistence: localStorage</div></div></div>
        <div className="flex items-center gap-3">
          <select value={currency} onChange={(e) => { setCurrency(e.target.value); writeLS(LS_KEYS.SETTINGS, { currency: e.target.value }); }} className="px-3 py-2 border rounded"><option value="â‚¹">INR (â‚¹)</option><option value="$">USD ($)</option><option value="â‚¬">EUR (â‚¬)</option></select>
          <div className="flex items-center gap-2 ml-4">
            <button onClick={addRow} className="px-3 py-2 bg-surface text-white rounded"><Plus size={14} /> Add</button>
            <button onClick={clearDemo} className="px-3 py-2 border rounded">Clear</button>
            <button onClick={reloadDemo} className="px-3 py-2 border rounded">Reload Demo</button>
            <div className="px-3 py-2 text-sm text-muted">{isSavingIndicator ? "Saving..." : "Saved"}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-surface border rounded"><div className="text-xs text-muted">Income</div><div className="text-2xl font-bold mt-1">{currency}{stats.income.toLocaleString()}</div></div>
          <div className="p-4 bg-surface border rounded"><div className="text-xs text-muted">Expense</div><div className="text-2xl font-bold mt-1">{currency}{stats.expense.toLocaleString()}</div></div>
          <div className="p-4 bg-surface border rounded"><div className="text-xs text-muted">Balance</div><div className="text-2xl font-bold mt-1">{currency}{stats.balance.toLocaleString()}</div></div>
          <div className="p-4 bg-surface border rounded"><div className="text-xs text-muted">Categories</div><div className="text-2xl font-bold mt-1">{categorySplit.length}</div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-surface p-4 rounded border"><div className="text-sm font-semibold mb-2">Monthly Expense</div><div style={{ height: 200 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyExpenses}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="amount" /></BarChart></ResponsiveContainer></div></div>
          <div className="bg-surface p-4 rounded border"><div className="text-sm font-semibold mb-2">Category Split</div><div style={{ height: 200 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categorySplit} dataKey="value" nameKey="name" innerRadius={30} outerRadius={70} label>{categorySplit.map((_, i) => <Cell key={i} />)}</Pie></PieChart></ResponsiveContainer></div></div>
          <div className="bg-surface p-4 rounded border"><div className="text-sm font-semibold mb-2">Category Map</div><div style={{ height: 200 }}><ResponsiveContainer width="100%" height="100%"><Treemap data={categorySplit.map((d) => ({ name: d.name, size: d.value }))} dataKey="size" /></ResponsiveContainer></div></div>
        </div>

        <div className="bg-surface p-4 rounded border">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2"><label className="text-xs text-muted">Search</label><input value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" placeholder="Search..." /></div>
            <div><label className="text-xs text-muted">Category</label><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded"><option>All</option>{Array.from(new Set(transactions.map(t => t.category || "Uncategorized"))).map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="text-xs text-muted">Variants</label><div className="mt-1 flex gap-2"><select onChange={(e) => { if (!e.target.value) return; loadVariant(e.target.value); e.target.value = ""; }} className="px-3 py-2 border rounded text-sm"><option value="">Apply...</option>{variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select><button onClick={() => { const name = prompt("Name"); if (name) saveVariant(name); }} className="px-3 py-2 border rounded text-sm">Save</button></div></div>
            <div><label className="text-xs text-muted">Import</label><input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { if (e.target.files?.[0]) handleImportFile(e.target.files[0]); }} className="mt-1" /></div>
            <div className="flex gap-2 justify-end md:col-span-2"><button onClick={() => exportSelected()} className="px-3 py-2 border rounded">Export Selected</button><button onClick={() => exportAll()} className="px-3 py-2 border rounded">Export All</button></div>
          </div>
          <div className="mt-3 border-t pt-3">
            <div className="flex items-center gap-3"><div className="text-sm font-semibold">Columns</div>{columns.map(col => (<label key={col.key} className="text-sm inline-flex items-center gap-2"><input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.key)} /><span className="text-xs">{col.label}</span></label>))}</div>
            {variants.length > 0 && (<div className="mt-2"><div className="text-xs text-muted">Saved Variants</div><div className="flex gap-2 mt-1">{variants.map(v => (<div key={v.id} className="px-2 py-1 border rounded text-sm flex items-center gap-2"><span>{v.name}</span><button onClick={() => loadVariant(v.id)} className="text-xs">Apply</button><button onClick={() => deleteVariant(v.id)} className="text-xs text-rose-600">Delete</button></div>))}</div></div>)}
          </div>
        </div>

        <div className="bg-surface p-2 rounded border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background sticky top-0"><tr className="text-left"><th className="p-3 w-10"></th>{visibleColumns.map(col => <th key={col.key} className="p-3">{col.label}</th>)}<th className="p-3">Actions</th></tr></thead>
            <tbody>
              {displayed.length === 0 && <tr><td colSpan={visibleColumns.length + 2} className="p-8 text-center text-muted">No transactions.</td></tr>}
              {displayed.map(row => {
                const Row = ({ children }: { children: ReactNode }) => <SwipeableRow row={row}>{children}</SwipeableRow>;
                return (
                  <Row key={row.id}>
                    <td className="p-3 align-top"><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} /></td>
                    {columns.find(c => c.key === "date")?.visible && <td className="p-3 w-36"><input type="date" value={row.isEditing ? (row.draft?.date ?? "") : (row.date || "")} onChange={(e) => updateDraft(row.id, "date", e.target.value)} readOnly={!row.isEditing} onClick={() => !row.isEditing && editRow(row.id)} className={`w-full px-2 py-1 rounded outline-none ${row.isEditing ? "border border-teal-300" : "border-transparent"}`} /></td>}
                    {columns.find(c => c.key === "type")?.visible && <td className="p-3 w-28">{row.isEditing ? <select value={row.draft?.type ?? row.type} onChange={(e) => updateDraft(row.id, "type", e.target.value)} className="w-full px-2 py-1 rounded border"><option>Expense</option><option>Income</option></select> : <div onClick={() => editRow(row.id)} className="cursor-pointer">{row.type}</div>}</td>}
                    {columns.find(c => c.key === "category")?.visible && <td className="p-3 w-36">{row.isEditing ? <input value={row.draft?.category ?? row.category} onChange={(e) => updateDraft(row.id, "category", e.target.value)} className="w-full px-2 py-1 rounded border" /> : <div onClick={() => editRow(row.id)} className="cursor-pointer">{row.category}</div>}</td>}
                    {columns.find(c => c.key === "desc")?.visible && <td className="p-3"><input value={row.isEditing ? (row.draft?.desc ?? "") : (row.desc ?? "")} onChange={(e) => updateDraft(row.id, "desc", e.target.value)} readOnly={!row.isEditing} onClick={() => !row.isEditing && editRow(row.id)} className={`w-full px-2 py-1 rounded ${row.isEditing ? "border border-teal-300" : "border-transparent"}`} /></td>}
                    {columns.find(c => c.key === "mode")?.visible && <td className="p-3 w-28">{row.isEditing ? <select value={row.draft?.mode ?? row.mode} onChange={(e) => updateDraft(row.id, "mode", e.target.value)} className="w-full px-2 py-1 rounded border"><option>Card</option><option>Cash</option><option>Bank</option></select> : <div onClick={() => editRow(row.id)} className="cursor-pointer">{row.mode}</div>}</td>}
                    {columns.find(c => c.key === "amount")?.visible && <td className="p-3 w-32"><input type="number" value={row.isEditing ? (row.draft?.amount ?? "") : (row.amount ?? "")} onChange={(e) => updateDraft(row.id, "amount", e.target.value)} readOnly={!row.isEditing} onClick={() => !row.isEditing && editRow(row.id)} className={`w-full text-right px-2 py-1 rounded ${row.isEditing ? "border border-teal-300" : "border-transparent"}`} /></td>}
                    {columns.find(c => c.key === "status")?.visible && <td className="p-3 w-28"><div className={`inline-block px-2 py-1 text-xs rounded-full ${row.status === "Posted" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{row.status}</div></td>}
                    <td className="p-3 text-right w-48">{row.isEditing ? <div className="flex justify-end gap-2"><button onClick={() => saveRow(row.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Save</button><button onClick={() => cancelEdit(row.id)} className="px-3 py-1 border rounded">Cancel</button></div> : <div className="flex justify-end gap-2"><button onClick={() => editRow(row.id)} className="px-3 py-1 border rounded">Edit</button><button onClick={() => deleteRow(row.id)} className="px-3 py-1 border rounded">Delete</button></div>}</td>
                  </Row>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
END_CONTENT

# =========================================================
# 3. BUDGET ULTIMATE: Fix Dependencies, State & Components
# =========================================================

echo "í´§ Creating utility: app/tools/finance/budget-ultimate/utils/sampleData.ts..."
mkdir -p app/tools/finance/budget-ultimate/utils
cat > app/tools/finance/budget-ultimate/utils/sampleData.ts << 'END_CONTENT'
import { uid } from "@/app/utils/uid";
import { LS_KEYS, readLS, writeLS } from "./storage";

export type Txn = {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  desc: string;
  amount: number;
};

export type Category = {
  id: string;
  name: string;
  type: "Income" | "Expense";
  color?: string;
};

const demoTransactions: Txn[] = [
  { id: uid(), date: "2025-01-05", type: "Expense", category: "Groceries", desc: "Milk, Bread", amount: 450 },
  { id: uid(), date: "2025-01-10", type: "Income", category: "Salary", desc: "Monthly salary", amount: 48000 },
];

const demoCategories: Category[] = [
  { id: uid(), name: "Groceries", type: "Expense", color: "#10B981" },
  { id: uid(), name: "Bills", type: "Expense", color: "#EF4444" },
  { id: uid(), name: "Salary", type: "Income", color: "#6366F1" },
];

export function getTransactions(): Txn[] {
  const saved = readLS(LS_KEYS.TRANSACTIONS, null);
  if (saved === null) { writeLS(LS_KEYS.TRANSACTIONS, demoTransactions); return demoTransactions; }
  return saved;
}
export function saveTransactions(data: Txn[]) { writeLS(LS_KEYS.TRANSACTIONS, data); }
export function addTransaction(tx: Omit<Txn, "id">): Txn {
  const newTx = { id: uid(), ...tx };
  const current = getTransactions();
  saveTransactions([...current, newTx]);
  return newTx;
}
export function clearTransactions() { saveTransactions([]); }

export function getCategories(): Category[] {
  const saved = readLS(LS_KEYS.CATEGORIES, null);
  if (saved === null) { writeLS(LS_KEYS.CATEGORIES, demoCategories); return demoCategories; }
  return saved;
}
export function saveCategories(list: Category[]) { writeLS(LS_KEYS.CATEGORIES, list); }
export function addCategory(cat: Omit<Category, "id">): Category {
  const newCat = { id: uid(), ...cat };
  const current = getCategories();
  saveCategories([...current, newCat]);
  return newCat;
}
END_CONTENT

echo "í´§ Cleaning up broken file: app/tools/finance/budget-ultimate/sampleData.ts..."
# This file was causing 'Cannot find module' errors due to bad imports
rm -f app/tools/finance/budget-ultimate/sampleData.ts

echo "í´§ Fixing app/tools/finance/budget-ultimate/components/Card.tsx..."
cat > app/tools/finance/budget-ultimate/components/Card.tsx << 'END_CONTENT'
import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-surface dark:bg-slate-800 dark:bg-surface border rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}
END_CONTENT

echo "í´§ Fixing app/tools/finance/budget-ultimate/components/Drawer.tsx..."
cat > app/tools/finance/budget-ultimate/components/Drawer.tsx << 'END_CONTENT'
"use client";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

export interface FormData {
  id?: string;
  name: string;
  amount?: number | string; 
  color?: string;
  type: string;
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  defaultData?: FormData | null; 
  onSave: (data: FormData) => void;
}

export default function Drawer({ open, onClose, defaultData, onSave }: DrawerProps) {
  const [form, setForm] = useState<FormData>({ name: "", amount: "", color: "#000000", type: "Expense" });

  useEffect(() => {
    if (defaultData) {
      setForm({
        ...defaultData,
        amount: defaultData.amount ?? "",
        color: defaultData.color ?? "#000000",
        type: defaultData.type || "Expense"
      });
    } else {
      setForm({ name: "", amount: "", color: "#000000", type: "Expense" });
    }
  }, [defaultData, open]);

  const handleSubmit = () => {
    const submissionData = { ...form, amount: form.amount === "" ? 0 : Number(form.amount) };
    onSave(submissionData);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-surface dark:bg-slate-800 shadow-xl z-50 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{defaultData ? "Edit Item" : "Add Item"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X size={22} /></button>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto">
          <div><label className="text-sm text-muted">Name</label><input className="w-full mt-1 border px-3 py-2 rounded-lg bg-background" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name..." /></div>
          <div><label className="text-sm text-muted">Type</label><select className="w-full mt-1 border px-3 py-2 rounded-lg bg-background" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="Expense">Expense</option><option value="Income">Income</option></select></div>
          <div><label className="text-sm text-muted">Amount (optional)</label><input type="number" className="w-full mt-1 border px-3 py-2 rounded-lg bg-background" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
          <div><label className="text-sm text-muted">Color</label><div className="flex items-center gap-3 mt-1"><input type="color" className="w-16 h-10 border rounded cursor-pointer" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /><span className="text-xs text-muted">{form.color}</span></div></div>
        </div>
        <button onClick={handleSubmit} className="w-full py-3 bg-black dark:bg-slate-100 text-white dark:text-black font-medium rounded-lg mt-4 hover:opacity-90">Save</button>
      </div>
    </>
  );
}
END_CONTENT

echo "í´§ Fixing app/tools/finance/budget-ultimate/categories/page.tsx..."
cat > app/tools/finance/budget-ultimate/categories/page.tsx << 'END_CONTENT'
"use client";
import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import Drawer from "../components/Drawer";
import { Plus, Search } from "lucide-react";
import { getCategories, saveCategories, addCategory, Category } from "../utils/sampleData";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  useEffect(() => { setCategories(getCategories()); }, []);

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    saveCategories(updated);
    setCategories(updated);
  };

  const handleSave = (item: any) => {
    let updated: Category[] = [];
    if (item.id) { updated = categories.map((c) => (c.id === item.id ? item : c)); } 
    else { updated = [...categories, addCategory(item)]; }
    saveCategories(updated);
    setCategories(updated);
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-sm text-muted">Manage your categories.</p></div>
      <Card className="py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative w-full lg:w-80"><Search size={18} className="absolute left-3 top-2.5 text-muted/70" /><input className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button onClick={() => { setSelected(null); setDrawerOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm"><Plus size={15} /> Add Category</button>
        </div>
      </Card>
      <Card><div className="overflow-auto"><table className="min-w-full text-sm"><thead className="bg-background text-left border-b"><tr><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Color</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{filtered.length === 0 && (<tr><td colSpan={4} className="text-center py-8 text-muted/70">No categories found</td></tr>)}{filtered.map((c) => (<tr key={c.id} className="border-b hover:bg-background cursor-pointer"><td className="p-3 font-medium">{c.name}</td><td className="p-3">{c.type}</td><td className="p-3"><span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: c.color }}></span></td><td className="p-3 text-right space-x-3"><button className="text-blue-600 hover:underline" onClick={() => { setSelected(c); setDrawerOpen(true); }}>Edit</button><button className="text-rose-600 hover:underline" onClick={() => handleDelete(c.id)}>Delete</button></td></tr>))}</tbody></table></div></Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} defaultData={selected} onSave={handleSave} />
    </div>
  );
}
END_CONTENT

echo "í´§ Fixing app/tools/finance/budget-ultimate/page.tsx..."
cat > app/tools/finance/budget-ultimate/page.tsx << 'END_CONTENT'
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AnalyticTile from "./components/AnalyticTile";
import { Search, Filter, BarChart3, LayoutPanelLeft } from "lucide-react";
import { getTransactions, getCategories, Txn, Category } from "./utils/sampleData";

export default function OverviewPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { setTransactions(getTransactions()); setCategories(getCategories()); }, []);

  const income = transactions.filter((t) => t.type === "Income").reduce((s, x) => s + x.amount, 0);
  const expense = transactions.filter((t) => t.type === "Expense").reduce((s, x) => s + x.amount, 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : "0";
  const filtered = transactions.filter((t) => t.desc.toLowerCase().includes(search.toLowerCase()));

  const goToKPI = () => router.push("/tools/finance/budget-ultimate/analytics");
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <AnalyticTile title="Income" value={`â‚¹${income.toLocaleString()}`} colorClass="text-emerald-600" trendText="+12%" data={[{ amt: 2000 }, { amt: 6000 }]} onClick={goToKPI} />
        <AnalyticTile title="Expense" value={`â‚¹${expense.toLocaleString()}`} colorClass="text-rose-600" trendText="-5%" data={[{ amt: 400 }, { amt: 380 }]} onClick={goToKPI} />
        <AnalyticTile title="Balance" value={`â‚¹${balance.toLocaleString()}`} colorClass="text-blue-600" trendText="Stable" data={[{ amt: balance - 1000 }, { amt: balance }]} onClick={goToKPI} />
        <AnalyticTile title="Categories" value={categories?.length || 0} colorClass="text-main" trendText="Active" data={[{ amt: 3 }, { amt: 4 }]} onClick={() => router.push("/tools/finance/budget-ultimate/categories")} />
        <AnalyticTile title="Savings Rate" value={`${savingsRate}%`} colorClass="text-indigo-600" trendText="Income saved" data={[{ amt: 5 }, { amt: 11 }]} onClick={goToKPI} />
      </div>
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Transactions</h2><div className="flex gap-3 text-sm"><button className="px-3 py-2 border rounded-lg flex items-center gap-2" onClick={goToKPI}><BarChart3 size={16} /> KPI Dashboard</button></div></div>
      <div className="border rounded-lg overflow-hidden"><table className="min-w-full text-sm"><thead className="bg-background border-b"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Description</th><th className="p-3 text-left">Category</th><th className="p-3 text-left">Type</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{filtered.map((t) => (<tr key={t.id} className="border-b hover:bg-background"><td className="p-3">{t.date}</td><td className="p-3">{t.desc}</td><td className="p-3">{t.category}</td><td className="p-3">{t.type}</td><td className={`p-3 text-right font-medium ${t.type === "Income" ? "text-emerald-600" : "text-rose-600"}`}>{t.type === "Expense" ? "-" : "+"}â‚¹{t.amount}</td></tr>))}</tbody></table></div>
    </div>
  );
}
END_CONTENT

echo "í´§ Fixing app/tools/finance/budget-ultimate/planner/page.tsx..."
cat > app/tools/finance/budget-ultimate/planner/page.tsx << 'END_CONTENT'
"use client";
import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import Card from "../components/Card";

export default function PlannerComingSoon() {
  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="max-w-lg w-full text-center py-12">
        <div className="flex justify-center mb-4"><Clock className="h-12 w-12 text-blue-600" /></div>
        <h1 className="text-2xl font-bold mb-2">Planner Module â€” Coming Soon</h1>
        <p className="text-muted mb-6 leading-relaxed">Weâ€™re building a powerful planning engine.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/tools/finance/budget-ultimate" className="px-4 py-2 border rounded-md flex items-center gap-2 hover:bg-background"><ArrowLeft size={16} /> Back</Link>
          <button className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed" disabled>In Development</button>
        </div>
      </Card>
    </div>
  );
}
END_CONTENT

echo "í´§ Fixing app/tools/finance/budget-ultimate/transactions/page.tsx..."
cat > app/tools/finance/budget-ultimate/transactions/page.tsx << 'END_CONTENT'
"use client";
import { getTransactions, saveTransactions, addTransaction, clearTransactions, getCategories, Txn } from "../utils/sampleData";
import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Drawer from "../components/Drawer";
import { Search, Plus, Download, Upload } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Txn[]>(() => getTransactions());
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { saveTransactions(transactions); }, [transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(t => (t.desc || "").toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q) || String(t.amount).includes(q));
  }, [transactions, search]);

  const handleAdd = () => {
    const newRow = addTransaction({ date: new Date().toISOString().slice(0,10), type: "Expense", category: getCategories()[0]?.name ?? "Misc", desc: "", amount: 0 });
    setTransactions(prev => [newRow, ...prev]);
    setDrawerOpen(true);
  };

  const handleClear = () => { if (!confirm("Clear all?")) return; clearTransactions(); setTransactions([]); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Transactions</h1><p className="text-sm text-muted">Showing {filtered.length} items.</p></div>
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative w-full md:w-72"><Search className="absolute left-3 top-2 text-muted/70" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm" /></div>
          <div className="flex items-center gap-2"><button onClick={handleAdd} className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><Plus size={14}/> Add</button><button onClick={handleClear} className="px-3 py-2 border rounded-lg">Clear</button></div>
        </div>
      </Card>
      <Card><div className="overflow-auto"><table className="min-w-full text-sm"><thead className="bg-background border-b"><tr><th className="p-3">Date</th><th className="p-3">Description</th><th className="p-3">Category</th><th className="p-3">Type</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{filtered.length === 0 ? (<tr><td colSpan={5} className="text-center p-8 text-muted/70">No transactions</td></tr>) : filtered.map(tx => (<tr key={tx.id} className="border-b hover:bg-background"><td className="p-3">{tx.date}</td><td className="p-3">{tx.desc}</td><td className="p-3">{tx.category}</td><td className="p-3">{tx.type}</td><td className={`p-3 text-right font-medium ${tx.type==="Income"?"text-emerald-600":"text-rose-600"}`}>{tx.type==="Expense"?'-':'+'}â‚¹{tx.amount.toLocaleString()}</td></tr>))}</tbody></table></div></Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} defaultData={null} onSave={() => setDrawerOpen(false)} />
    </div>
  );
}
END_CONTENT

# =========================================================
# 4. SMART TOOLS: Fix Syntax Errors & Props
# =========================================================

echo "í´§ Fixing app/tools/finance/smart-budget/components/SmartGuide.tsx..."
cat > app/tools/finance/smart-budget/components/SmartGuide.tsx << 'END_CONTENT'
import React, { useEffect } from "react";
import { X, TrendingUp, PieChart, AlertCircle } from "lucide-react";

export function SmartGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; } 
    else { document.body.style.overflow = "unset"; }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface dark:bg-slate-800 shadow-2xl z-40 p-6 overflow-auto animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-main">Budgeting Guide</h3>
        <button onClick={onClose} aria-label="Close Guide" className="text-muted/70 p-1 hover:bg-slate-100 rounded-full transition"><X size={20}/></button>
      </div>
      <div className="space-y-6 text-sm text-muted">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"><h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2"><PieChart size={16}/> The 50/30/20 Rule</h4><p>Classic strategy: 50% Needs, 30% Wants, 20% Savings.</p></div>
        <div><h4 className="font-bold text-main mb-1 flex items-center gap-2"><TrendingUp size={16}/> Tracking Impact</h4><p>Builds awareness of small daily purchases.</p></div>
      </div>
    </div>
  );
}
END_CONTENT

echo "í´§ Fixing app/tools/finance/smart-debt/components/DebtGuide.tsx..."
cat > app/tools/finance/smart-debt/components/DebtGuide.tsx << 'END_CONTENT'
import React from "react";
import { ArrowUpCircle, ArrowDownCircle, X } from "lucide-react";

export function DebtGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface dark:bg-slate-800 shadow-2xl z-40 p-6 overflow-auto animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-main">Strategy Guide</h3>
        <button aria-label="Close" onClick={onClose} className="text-muted/70 hover:text-muted"><X size={20}/></button>
      </div>
      <div className="space-y-8">
        <div className="space-y-2"><div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase"><ArrowUpCircle size={16}/> Avalanche</div><p className="text-sm text-muted">Pay highest interest first. Saves money.</p></div>
        <div className="space-y-2"><div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase"><ArrowDownCircle size={16}/> Snowball</div><p className="text-sm text-muted">Pay lowest balance first. Builds motivation.</p></div>
      </div>
    </div>
  );
}
END_CONTENT

echo "í´§ Fixing app/tools/finance/smart-loan/page.tsx..."
cat > app/tools/finance/smart-loan/page.tsx << 'END_CONTENT'
"use client";
import React, { useState } from "react";
import { useLoanCalculator } from "./hooks/useLoanCalculator";
import { LoanKPI } from "./components/LoanKPI";
import { LoanInputs } from "./components/LoanInputs";
import { AmortizationTable } from "./components/AmortizationTable";
import { LoanCharts } from "./components/LoanCharts";
import { Calculator, List, PieChart } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartLoanPro() {
  const { amount, setAmount, rate, setRate, years, setYears, startDate, setStartDate, summary, schedule, reset, isLoaded } = useLoanCalculator();
  const [activeTab, setActiveTab] = useState('schedule');

  if (!isLoaded) return <div className="p-10 text-center text-muted">Loading Loan Engine...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background overflow-hidden font-sans">
      <Toast />
      <div className="bg-surface/80 backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 shadow-sm shrink-0 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-blue-600 text-white shadow-md"><Calculator size={22} /></div>
        <div><h1 className="text-lg font-extrabold text-main">Smart Loan</h1><p className="text-xs text-muted font-bold uppercase">Amortization Engine</p></div>
      </div>
      <div className="flex-1 overflow-auto relative">
         <div className="min-w-[800px]">
            <LoanKPI summary={summary} /> 
            <LoanInputs amount={amount} setAmount={setAmount} rate={rate} setRate={setRate} years={years} setYears={setYears} startDate={startDate} setStartDate={setStartDate} onReset={reset} />
            <div className="flex px-6 bg-surface border-b sticky top-[60px] z-10">
                <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'schedule' ? 'border-blue-600 text-blue-800' : 'border-transparent text-muted'}`}><List size={16} /> Schedule</button>
                <button onClick={() => setActiveTab('charts')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'charts' ? 'border-blue-600 text-blue-800' : 'border-transparent text-muted'}`}><PieChart size={16} /> Projection</button>
            </div>
            <div className="w-full h-full pb-20 bg-background">
                {activeTab === 'schedule' ? <AmortizationTable schedule={schedule} /> : <LoanCharts schedule={schedule} summary={summary} />}
            </div>
         </div>
      </div>
    </div>
  );
}
END_CONTENT

echo "âœ… All fixes applied. Running build..."
if [ -f "yarn.lock" ]; then
    yarn run build
else
    npm run build
fi
