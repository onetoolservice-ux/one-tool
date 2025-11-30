"use client";
import React, { useState } from "react";
import { useSmartNetWorth } from "./hooks/useSmartNetWorth";
import { Landmark, Plus, Trash2, TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, List } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Toast from "@/app/shared/Toast";
import Button from "@/app/shared/ui/Button";
import EmptyState from "@/app/shared/ui/EmptyState";
import { SmartGuide } from "./components/SmartGuide";

export default function SmartNetWorth() {
  const { items, addItem, deleteItem, summary, chartData } = useSmartNetWorth();
  const [activeTab, setActiveTab] = useState<'list' | 'chart'>('list');
  const [isOpen, setIsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [form, setForm] = useState({ name: "", value: "", type: "Asset", category: "General" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.name || !form.value) return;
    addItem({ name: form.name, value: Number(form.value), type: form.type as any, category: form.category });
    setIsOpen(false); setForm({ name: "", value: "", type: "Asset", category: "General" });
  };

  // Helper for deterministic formatting
  const fmt = (n: number) => n.toLocaleString('en-IN');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background overflow-hidden font-sans">
      <Toast />
      <SmartGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      
      {/* HEADER */}
      <div className="bg-surface/80 backdrop-blur-md border-b border-line px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm"><Landmark size={22} /></div>
            <div><h1 className="text-lg font-extrabold text-main">Smart Net Worth</h1><p className="text-xs text-muted font-bold uppercase">Asset Tracker</p></div>
        </div>
        <Button onClick={() => setIsOpen(true)} className="text-xs h-8 px-3 flex items-center gap-1.5"><Plus size={14} /> Add Item</Button>
      </div>

      {/* KPI RIBBON */}
      <div className="grid grid-cols-3 divide-x border-line bg-surface/50 backdrop-blur-sm border-b sticky top-[60px] z-40">
        <div className="p-4 pl-6">
            <div className="flex gap-2 mb-1 text-emerald-600 font-bold text-xs uppercase tracking-wide"><TrendingUp size={14} /> Assets</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">₹{fmt(summary.assets)}</div>
        </div>
        <div className="p-4">
            <div className="flex gap-2 mb-1 text-rose-600 font-bold text-xs uppercase tracking-wide"><TrendingDown size={14} /> Liabilities</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">₹{fmt(summary.liabilities)}</div>
        </div>
        <div className="p-4">
            <div className="flex gap-2 mb-1 text-blue-600 font-bold text-xs uppercase tracking-wide"><Wallet size={14} /> Net Worth</div>
            <div className={`text-xl font-black ${summary.netWorth >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>₹{fmt(summary.netWorth)}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex px-6 bg-surface/50 backdrop-blur-sm border-b border-line sticky top-[133px] z-30 gap-6">
         <button onClick={() => setActiveTab('list')} className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'list' ? 'border-amber-500 text-amber-700 dark:text-amber-400' : 'border-transparent text-muted hover:text-main'}`}><List size={16} /> Items</button>
         <button onClick={() => setActiveTab('chart')} className={`flex items-center gap-2 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'chart' ? 'border-amber-500 text-amber-700 dark:text-amber-400' : 'border-transparent text-muted hover:text-main'}`}><PieIcon size={16} /> Breakdown</button>
      </div>

      <div className="flex-1 overflow-auto bg-background p-6">
        <div className="max-w-4xl mx-auto">
        {items.length === 0 ? (
            <EmptyState title="Track Your Wealth" description="Add your assets (Savings, Property) and liabilities (Loans) to see your true Net Worth." icon={Landmark} color="amber" action={<Button onClick={() => setIsOpen(true)}>Add First Item</Button>} />
        ) : (
            activeTab === 'list' ? (
                <div className="border border-line rounded-xl overflow-hidden bg-surface shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-line text-muted font-bold text-xs uppercase tracking-wide">
                            <tr><th className="p-4 pl-6">Name</th><th className="p-4">Category</th><th className="p-4 text-right">Value</th><th className="p-4 w-10 text-center">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {items.map((i) => (
                                <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="p-4 pl-6 font-medium text-main flex items-center gap-2">
                                        {i.name} 
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${i.type === 'Asset' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>{i.type}</span>
                                    </td>
                                    <td className="p-4 text-muted">{i.category}</td>
                                    <td className={`p-4 text-right font-mono font-bold ${i.type === 'Asset' ? 'text-emerald-600' : 'text-rose-600'}`}>₹{fmt(i.value)}</td>
                                    <td className="p-4 text-center"><button onClick={() => deleteItem(i.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"><Trash2 size={16}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="h-[400px] w-full bg-surface p-6 rounded-2xl border border-line shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={140} label>{chartData.map((e, i) => <Cell key={i} fill={e.type === 'Asset' ? '#10b981' : '#f43f5e'} />)}</Pie>
                            <Tooltip formatter={(val:number) => `₹${fmt(val)}`} contentStyle={{borderRadius: '12px'}} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )
        )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
            <form onSubmit={submit} className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
                <div className="flex justify-between items-center border-b border-line pb-4">
                    <h3 className="font-bold text-lg text-main">Add Item</h3>
                    <button type="button" onClick={() => setIsOpen(false)} className="text-muted hover:text-main"><Trash2 size={20} className="rotate-45"/></button>
                </div>
                <input className="w-full border border-line bg-background p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Name (e.g. House, Car)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} autoFocus />
                <div className="grid grid-cols-2 gap-4">
                    <input className="border border-line bg-background p-3 rounded-xl text-sm outline-none" type="number" placeholder="Value" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
                    <input className="border border-line bg-background p-3 rounded-xl text-sm outline-none" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                </div>
                <select className="w-full border border-line bg-background p-3 rounded-xl text-sm outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="Asset">Asset (Positive)</option><option value="Liability">Liability (Negative)</option>
                </select>
                <Button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white">Save Item</Button>
            </form>
        </div>
      )}
    </div>
  );
}
