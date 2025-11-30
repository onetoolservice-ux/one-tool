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
  const [currency, setCurrency] = useState(() => typeof window === 'undefined' ? "₹" : readLS(LS_KEYS.SETTINGS, { currency: "₹" }).currency || "₹");
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
        <div className="flex items-center gap-4"><Wallet size={20} /><div><h1 className="text-xl font-bold">Budget Ultimate — Local</h1><div className="text-xs text-muted">Persistence: localStorage</div></div></div>
        <div className="flex items-center gap-3">
          <select value={currency} onChange={(e) => { setCurrency(e.target.value); writeLS(LS_KEYS.SETTINGS, { currency: e.target.value }); }} className="px-3 py-2 border rounded"><option value="₹">INR (₹)</option><option value="$">USD ($)</option><option value="€">EUR (€)</option></select>
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
