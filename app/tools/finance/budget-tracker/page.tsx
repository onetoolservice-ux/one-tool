"use client";

import React, { useEffect, useMemo, useState } from "react";
import { 
  Plus, Filter, Download, Upload, Search, X, 
  ChevronRight, Trash2, PieChart, 
  List, CheckSquare, Square, CreditCard,
  Calendar, Tag, FileText, Wallet,
  ArrowUpRight, ArrowDownRight, Clock,
  FileJson, FileSpreadsheet, ChevronDown
} from "lucide-react";

/* -------------------------
   CONSTANTS & UTILS
   ------------------------- */
const STORAGE_KEY = "ots_budget_v8_precision";

const CURRENCIES = [
  { code: "INR", symbol: "₹", rate: 1 },
  { code: "USD", symbol: "$", rate: 0.012 },
  { code: "EUR", symbol: "€", rate: 0.011 },
  { code: "GBP", symbol: "£", rate: 0.0095 },
  { code: "JPY", symbol: "¥", rate: 1.8 }
];

const DEFAULT_BUDGETS: Record<string, number> = {
  "Groceries": 15000, "Rent": 25000, "Dining": 5000, "Fuel": 6000, 
  "Utilities": 3000, "Healthcare": 5000, "Shopping": 8000, "Travel": 10000, "Other": 2000
};

const BASE_CATEGORIES = Object.keys(DEFAULT_BUDGETS);
const PAYMENT_MODES = ["Cash", "Card", "UPI", "Transfer"];
const YEARS = [2023, 2024, 2025, 2026, 2027];

function uid() { return Math.random().toString(36).substr(2, 9); }
function ymd(d = new Date()) { return d.toISOString().slice(0, 10); }

/* -------------------------
   TYPES
   ------------------------- */
type TxType = "Expense" | "Income" | "Transfer";
type TxStatus = "Cleared" | "Pending";
type ViewMode = "List" | "Analytics";

interface Transaction {
  id: string;
  date: string;
  type: TxType;
  category: string;
  amount: number;
  description: string;
  paymentMode: string;
  status: TxStatus;
  isRecurring: boolean;
  attachmentName?: string;
}

/* -------------------------
   MAIN COMPONENT
   ------------------------- */
export default function BudgetPrecision() {
  const [mounted, setMounted] = useState(false);
  
  // --- Data State ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  
  // --- View State ---
  const [viewMode, setViewMode] = useState<ViewMode>("List");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // --- Filter State ---
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    search: "",
    category: "All",
  });
  
  // --- UI State ---
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Form State ---
  const [formData, setFormData] = useState({
    date: ymd(), type: "Expense" as TxType, category: "Groceries", customCategory: "",
    amount: "", description: "", paymentMode: "Card", status: "Cleared" as TxStatus,
    isRecurring: false, attachmentName: ""
  });

  // --- Init & Persistence ---
  useEffect(() => {
    setMounted(true);
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setTransactions(JSON.parse(data));
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, mounted]);

  // --- Helpers ---
  const formatMoney = (amount: number) => {
    return `${selectedCurrency.symbol}${(amount * selectedCurrency.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  };

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const matchesMonth = d.getMonth() + 1 === filters.month;
      const matchesYear = d.getFullYear() === filters.year;
      const matchesCat = filters.category === "All" || t.category === filters.category;
      const matchesSearch = !filters.search || 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.category.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesMonth && matchesYear && matchesCat && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);

  const stats = useMemo(() => {
    let income = 0, expense = 0, pending = 0;
    filteredData.forEach(t => {
      if (t.type === "Income") income += t.amount;
      if (t.type === "Expense") expense += t.amount;
      if (t.status === "Pending") pending += t.amount;
    });
    return { income, expense, balance: income - expense, pending };
  }, [filteredData]);

  // --- Handlers ---
  const handleSave = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || !formData.date) return alert("Please enter amount and date.");

    const categoryFinal = formData.category === "Other" && formData.customCategory ? formData.customCategory : formData.category;

    const payload: Transaction = {
      id: editingId || uid(),
      date: formData.date, type: formData.type, category: categoryFinal,
      amount: amount, description: formData.description, paymentMode: formData.paymentMode,
      status: formData.status, isRecurring: formData.isRecurring, attachmentName: formData.attachmentName
    };

    if (editingId) {
      setTransactions(prev => prev.map(t => t.id === editingId ? payload : t));
    } else {
      setTransactions(prev => [payload, ...prev]);
    }
    setSidebarOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ date: ymd(), type: "Expense", category: "Groceries", customCategory: "", amount: "", description: "", paymentMode: "Card", status: "Cleared", isRecurring: false, attachmentName: "" });
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.size} items?`)) {
      setTransactions(prev => prev.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
    }
  };

  const handleExport = (type: 'csv' | 'json') => {
    const dataStr = type === 'json' ? JSON.stringify(transactions, null, 2) : 
      ["ID,Date,Type,Category,Amount,Desc"].concat(filteredData.map(t => `${t.id},${t.date},${t.type},${t.category},${t.amount},${t.description}`)).join("\n");
    const blob = new Blob([dataStr], { type: type === 'json' ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `export.${type}`; a.click();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 relative">
      
      {/* 1. HEADER & FILTERS */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="bg-teal-50 p-2 rounded-lg"><Wallet className="text-teal-600" size={20}/></div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800">Finance</h1>
              
              <div className="hidden md:flex bg-slate-100 p-1 rounded-lg ml-4">
                <button onClick={() => setViewMode("List")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === "List" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>List</button>
                <button onClick={() => setViewMode("Analytics")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === "Analytics" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Analytics</button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="relative">
                 <select className="appearance-none bg-transparent pl-2 pr-6 py-1 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 rounded" 
                    value={selectedCurrency.code} 
                    onChange={e => setSelectedCurrency(CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0])}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                 </select>
                 <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
               </div>
               
               <div className="h-4 w-px bg-slate-200 mx-2"></div>
               
               <button onClick={() => setFilterOpen(!isFilterOpen)} className={`p-2 rounded-md transition-colors ${isFilterOpen ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-100' : 'hover:bg-slate-50 text-slate-600'}`}>
                 <Filter size={18}/>
               </button>
               <button onClick={() => { resetForm(); setEditingId(null); setSidebarOpen(true); }} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-all">
                <Plus size={16} /> New
              </button>
            </div>
          </div>

          {/* COLLAPSIBLE FILTER PANEL (Redesigned) */}
          {isFilterOpen && (
            <div className="pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 -mx-6 px-6 animate-in slide-in-from-top-1">
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  
                  {/* Year Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Year</label>
                    <div className="relative group">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600"/>
                      <select 
                        value={filters.year} 
                        onChange={e => setFilters({...filters, year: Number(e.target.value)})} 
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"/>
                    </div>
                  </div>

                  {/* Month Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Month</label>
                    <div className="relative group">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600"/>
                      <select 
                        value={filters.month} 
                        onChange={e => setFilters({...filters, month: Number(e.target.value)})} 
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {Array.from({length: 12}, (_, i) => <option key={i} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"/>
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Category</label>
                    <div className="relative group">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600"/>
                      <select 
                        value={filters.category} 
                        onChange={e => setFilters({...filters, category: e.target.value})} 
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="All">All Categories</option>
                        {BASE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"/>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Search</label>
                    <div className="relative group">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600"/>
                      <input 
                        type="text" 
                        placeholder="Search by description or notes..." 
                        value={filters.search} 
                        onChange={e => setFilters({...filters, search: e.target.value})} 
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all placeholder:font-normal"
                      />
                    </div>
                  </div>

               </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. KPI GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <KpiCard title="Income" value={formatMoney(stats.income)} color="text-emerald-700" bg="bg-emerald-50/50" icon={<ArrowDownRight size={18} className="text-emerald-600"/>} />
           <KpiCard title="Expenses" value={formatMoney(stats.expense)} color="text-rose-700" bg="bg-rose-50/50" icon={<ArrowUpRight size={18} className="text-rose-600"/>} />
           <KpiCard title="Balance" value={formatMoney(stats.balance)} color="text-blue-700" bg="bg-blue-50/50" icon={<Wallet size={18} className="text-blue-600"/>} />
           <KpiCard title="Pending" value={formatMoney(stats.pending)} color="text-amber-700" bg="bg-amber-50/50" icon={<Clock size={18} className="text-amber-600"/>} />
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {viewMode === "List" ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
               <div className="flex items-center gap-3">
                 <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Transactions</h2>
                 <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-semibold">{filteredData.length}</span>
               </div>
               <div className="flex items-center gap-1">
                 <label className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors" title="Import Data">
                   <Upload size={16} /> <input type="file" className="hidden" accept=".json" />
                 </label>
                 <div className="w-px h-4 bg-slate-200 mx-1"></div>
                 <button onClick={() => handleExport('json')} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Export JSON"><FileJson size={16}/></button>
                 <button onClick={() => handleExport('csv')} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Export CSV"><FileSpreadsheet size={16}/></button>
               </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider">
                    <th className="pl-6 pr-4 py-3 w-10">
                      <button onClick={() => setSelectedIds(selectedIds.size === filteredData.length ? new Set() : new Set(filteredData.map(t=>t.id)))}>
                        {selectedIds.size > 0 ? <CheckSquare size={16} className="text-teal-600"/> : <Square size={16}/>}
                      </button>
                    </th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map(t => (
                    <tr key={t.id} className={`group hover:bg-slate-50 transition-all text-sm ${selectedIds.has(t.id) ? 'bg-teal-50/30' : ''}`}>
                      <td className="pl-6 pr-4 py-3">
                        <button onClick={() => { const s = new Set(selectedIds); s.has(t.id) ? s.delete(t.id) : s.add(t.id); setSelectedIds(s); }} className="text-slate-400">
                          {selectedIds.has(t.id) ? <CheckSquare size={16} className="text-teal-600"/> : <Square size={16}/>}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{t.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${t.type === 'Income' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                           <span className="text-slate-700">{t.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {t.description || <span className="text-slate-300 italic">No description</span>}
                        {t.paymentMode && <span className="ml-2 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">{t.paymentMode}</span>}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${t.type === 'Income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {t.type === 'Income' ? '+' : ''}{formatMoney(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => { setEditingId(t.id); setFormData(t as any); setSidebarOpen(true); }} className="p-1.5 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-all">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && <tr><td colSpan={6} className="py-20 text-center text-slate-400">No transactions found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400">
                <PieChart size={48} className="mx-auto mb-4 opacity-20"/>
                <p>Analytics View (Visuals Placeholder)</p>
             </div>
          </div>
        )}
      </div>

      {/* FLOATING ACTION */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-6 animate-in slide-in-from-bottom-4">
          <span className="text-sm font-medium">{selectedIds.size} Selected</span>
          <div className="h-4 w-px bg-slate-700"></div>
          <button onClick={handleBulkDelete} className="flex items-center gap-2 text-sm hover:text-rose-400 transition-colors"><Trash2 size={16} /> Delete</button>
          <button onClick={() => setSelectedIds(new Set())} className="text-slate-400 hover:text-white"><X size={16}/></button>
        </div>
      )}

      {/* SIDEBAR FORM */}
      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-30" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-40 animate-in slide-in-from-right duration-300 border-l border-slate-200 flex flex-col">
             
             {/* Header */}
             <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
               <h2 className="text-lg font-bold text-slate-800">{editingId ? "Edit Transaction" : "New Transaction"}</h2>
               <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
             </div>

             {/* Form Body */}
             <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="bg-slate-100 p-1 rounded-xl flex">
                 {["Expense", "Income", "Transfer"].map(t => (
                   <button key={t} type="button" onClick={() => setFormData({...formData, type: t as TxType})} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${formData.type === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                     {t}
                   </button>
                 ))}
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">Amount</label>
                 <div className="relative max-w-[200px] mx-auto">
                   <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-light text-slate-300">{selectedCurrency.symbol}</span>
                   <input 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: e.target.value})} 
                      className="w-full text-4xl font-bold text-slate-800 text-center bg-transparent border-b-2 border-slate-200 focus:border-teal-500 outline-none pb-2 placeholder:text-slate-200"
                      autoFocus
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date</label>
                   <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:bg-white focus:border-teal-500 outline-none transition-colors" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><CreditCard size={12}/> Payment</label>
                   <select value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:bg-white focus:border-teal-500 outline-none transition-colors">
                     {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Tag size={12}/> Category</label>
                 <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:bg-white focus:border-teal-500 outline-none transition-colors">
                    {BASE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Other">Other...</option>
                 </select>
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><FileText size={12}/> Notes</label>
                 <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:bg-white focus:border-teal-500 outline-none transition-colors resize-none" placeholder="What was this for?" />
               </div>
             </div>

             <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
                <button onClick={() => setSidebarOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg transition-transform active:scale-95">{editingId ? "Save Changes" : "Create Transaction"}</button>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- SUB COMPONENTS ---
function KpiCard({ title, value, color, bg, icon }: any) {
  return (
    <div className={`p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 bg-white relative overflow-hidden group hover:border-slate-300 transition-all`}>
      <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity ${color}`}>{icon}</div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
      <span className={`text-2xl font-bold tracking-tight ${color}`}>{value}</span>
    </div>
  )
}