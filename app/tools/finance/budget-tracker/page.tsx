"use client";

import React, { useState, useMemo } from "react";
import { Wallet, Plus, Search, Filter, Download, Upload, X, Calendar, Tag, CreditCard, FileText } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function BudgetTracker() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [currency, setCurrency] = useState("₹");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");
  
  // Static Data (Demo)
  const stats = { income: 45000, expense: 12000, balance: 33000, pending: 1500 };

  // Form State (for sidebar)
  const [form, setForm] = useState({
    amount: "", date: new Date().toISOString().slice(0, 10), type: "Expense", category: "Groceries", mode: "Card", desc: "", recurring: false
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      
      {/* HEADER: H1 (32px), H2 (24px) */}
      <ToolHeader title="Budget Ultimate" desc="Expense Tracking & Analytics" icon={<Wallet size={20}/>}>
        <div className="flex items-center gap-16">
           {/* Currency Selector */}
           <select value={currency} onChange={e=>setCurrency(e.target.value)} className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 outline-none cursor-pointer hover:bg-slate-50">
             <option value="₹">INR (₹)</option><option value="$">USD ($)</option><option value="€">EUR (€)</option>
           </select>
           {/* Primary Button: 12px x 20px padding */}
           <button onClick={() => setShowSidebar(true)} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
             <Plus size={16}/> New
           </button>
        </div>
      </ToolHeader>

      <div className="max-w-6xl mx-auto w-full p-8 space-y-8">
        
        {/* KPI Cards (SECTION 4.1: Use 16px padding, 32px between sections) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg"><div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Income</div><div className="text-xl font-bold text-emerald-700 mt-1">{currency}{stats.income.toLocaleString()}</div></div>
           <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg"><div className="text-xs font-medium text-rose-600 uppercase tracking-wide">Expenses</div><div className="text-xl font-bold text-rose-700 mt-1">{currency}{stats.expense.toLocaleString()}</div></div>
           <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg"><div className="text-xs font-medium text-blue-600 uppercase">Balance</div><div className="text-xl font-bold text-blue-700 mt-1">{currency}{stats.balance.toLocaleString()}</div></div>
           <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg"><div className="text-xs font-medium text-amber-600 uppercase">Pending</div><div className="text-xl font-bold text-amber-700 mt-1">{currency}{stats.pending.toLocaleString()}</div></div>
        </div>

        {/* Transaction Table Section (H2: 24px) */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Transactions</h2>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
             <div className="relative w-full sm:w-64">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
               <input type="text" placeholder="Search transactions..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-transparent outline-none placeholder:text-slate-400"/>
             </div>
             <div className="flex items-center gap-2">
               <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200" title="Filter"><Filter size={16}/></button>
               <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200" title="Export"><Download size={16}/></button>
             </div>
          </div>
        
          {/* Table (Placeholder for actual data) */}
          <div className="bg-white rounded-xl border border-slate-200 h-64 flex flex-col items-center justify-center text-slate-400">
             <div className="p-4 bg-slate-50 rounded-full mb-3"><Wallet size={32} className="opacity-20"/></div>
             <p className="text-sm font-medium">No transactions found</p>
             <button onClick={() => setShowSidebar(true)} className="mt-4 text-sm font-bold text-[rgb(117,163,163)] hover:underline">Create your first entry</button>
          </div>
        </div>

      </div>

      {/* SIDEBAR FORM (Strict Input Rules) */}
      {showSidebar && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40" onClick={() => setShowSidebar(false)} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 border-l border-slate-200 flex flex-col">
             
             {/* Header */}
             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
               <h2 className="text-xl font-bold text-slate-800">New Transaction</h2>
               <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
             </div>

             {/* Form Body - STRICT SPACING (16px and 8px) */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
               
               {/* Transaction Type (Tabs) */}
               <div className="bg-slate-100 p-1 rounded-xl flex">
                 {/* BUTTON PADDING: 16px height, 8px vertical padding, font-medium */}
                 {["Expense", "Income", "Transfer"].map(t => (
                   <button key={t} onClick={() => setForm({...form, type: t})} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${form.type === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                     {t}
                   </button>
                 ))}
               </div>

               {/* Amount Hero (H3: 20px) */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-500 block text-center">Amount</label>
                 <div className="relative max-w-[200px] mx-auto">
                   <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full text-3xl font-bold text-slate-800 text-center bg-transparent border-b-2 border-slate-200 focus:border-teal-500 outline-none pb-1 placeholder:text-slate-200" />
                 </div>
               </div>

               {/* Input Grid */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-slate-500 block">Date</label>
                   {/* Input height 40px, radius 8px */}
                   <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-teal-500 transition-colors" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-slate-500 block">Mode</label>
                   <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-teal-500 transition-colors">
                     <option>Card</option><option>Cash</option>
                   </select>
                 </div>
               </div>

               {/* Category & Description */}
               <div className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-slate-500 block">Category</label>
                   <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-teal-500 transition-colors">
                      <option>Groceries</option><option>Rent</option>
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-slate-500 block">Description</label>
                   <textarea rows={2} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-teal-500 resize-none" placeholder="Add details..." />
                 </div>
               </div>
             </div>

             {/* Footer (16px padding) */}
             <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
                <button onClick={() => setShowSidebar(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium shadow-lg transition-transform active:scale-95">Create Transaction</button>
             </div>
          </div>
        </>
      )}

    </div>
  );
}
