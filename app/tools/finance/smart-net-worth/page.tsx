"use client";
import React, { useState } from "react";
import { SmartGuide } from "./components/SmartGuide";
import { useSmartNetWorth } from "./hooks/useSmartNetWorth";
import { Landmark, Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Toast from "../../../shared/Toast";

export default function SmartNetWorth() {
  const [showGuide, setShowGuide] = useState(false);
  const { items, addItem, deleteItem, summary, chartData } = useSmartNetWorth();
  const [activeTab, setActiveTab] = useState<'list' | 'chart'>('list');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", value: "", type: "Asset", category: "General" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.name || !form.value) return;
    addItem({ name: form.name, value: Number(form.value), type: form.type as any, category: form.category });
    setIsOpen(false); setForm({ name: "", value: "", type: "Asset", category: "General" });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]/30 overflow-hidden font-sans">
      <Toast />
      <SmartGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 shadow-lg shadow-slate-200/50 dark:shadow-none shrink-0 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-slate-800 text-white  "><Landmark size={22} /></div>
        <div><h1 className="text-lg font-extrabold text-main dark:text-slate-100 dark:text-slate-200">Smart Net Worth</h1><p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted font-bold uppercase">Asset Tracker</p></div>
        <div className="ml-auto"><button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-surface text-white rounded-lg text-xs font-bold hover:bg-slate-800"><Plus size={14} /> Add Item</button></div>
      </div>

      <div className="grid grid-cols-3 divide-x bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b sticky top-[60px] z-40">
        <div className="p-4 pl-6"><div className="flex gap-2 mb-1 text-emerald-600 dark:text-emerald-400 items-center text-xs font-bold uppercase tracking-wide"><TrendingUp size={14} /> Assets</div><div className="text-xl font-bold text-emerald-700">₹{summary.assets.toLocaleString()}</div></div>
        <div className="p-4"><div className="flex gap-2 mb-1 text-rose-600 dark:text-rose-400 items-center text-xs font-bold uppercase tracking-wide"><TrendingDown size={14} /> Liabilities</div><div className="text-xl font-bold text-rose-700">₹{summary.liabilities.toLocaleString()}</div></div>
        <div className="p-4"><div className="flex gap-2 mb-1 text-blue-600 dark:text-blue-400 items-center text-xs font-bold uppercase tracking-wide"><Wallet size={14} /> Net Worth</div><div className="text-xl font-bold text-blue-700">₹{summary.netWorth.toLocaleString()}</div></div>
      </div>

      <div className="flex px-6 bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b sticky top-[133px] z-30">
         <button onClick={() => setActiveTab('list')} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'list' ? 'border-slate-800 text-main dark:text-slate-100 dark:text-slate-200' : 'border-transparent text-muted dark:text-muted dark:text-muted dark:text-muted'}`}>Items</button>
         <button onClick={() => setActiveTab('chart')} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'chart' ? 'border-slate-800 text-main dark:text-slate-100 dark:text-slate-200' : 'border-transparent text-muted dark:text-muted dark:text-muted dark:text-muted'}`}>Analysis</button>
      </div>

      <div className="flex-1 overflow-auto bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-6">
        {activeTab === 'list' ? (
            <div className="max-w-4xl mx-auto border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 rounded-lg overflow-hidden bg-surface dark:bg-slate-800 dark:bg-surface shadow-lg shadow-slate-200/50 dark:shadow-none">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-muted dark:text-muted dark:text-muted dark:text-muted font-bold text-xs uppercase tracking-wide">
                        <tr><th className="p-4 pl-6 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">Name</th><th className="p-4 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">Category</th><th className="p-4 text-right border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">Value</th><th className="p-4 w-10 text-center">Action</th></tr>
                    </thead>
                    <tbody>
                        {items.map((i, idx) => (
                            <tr key={i.id} className={`border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 ${idx % 2 === 0 ? 'bg-surface dark:bg-slate-800 dark:bg-surface' : 'bg-background dark:bg-[#0f172a] dark:bg-[#020617]/30'} hover:bg-blue-50/30 transition`}>
                                <td className="p-4 pl-6 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 font-medium text-main dark:text-slate-300 flex items-center gap-2">{i.name} <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${i.type === 'Asset' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>{i.type}</span></td>
                                <td className="p-4 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-muted dark:text-muted dark:text-muted dark:text-muted">{i.category}</td>
                                <td className={`p-4 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono font-bold ${i.type === 'Asset' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>₹{i.value.toLocaleString()}</td>
                                <td className="p-4 text-center"><button onClick={() => deleteItem(i.id)} className="p-1.5 text-slate-300 hover:text-rose-600 dark:text-rose-400 rounded hover:bg-rose-50 transition"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="h-[400px] w-full max-w-4xl mx-auto bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={120} label>{chartData.map((e, i) => <Cell key={i} fill={e.type === 'Asset' ? '#10b981' : '#f43f5e'} />)}</Pie>
                        <Tooltip formatter={(val:number) => `₹${val.toLocaleString()}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <form onSubmit={submit} className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
                <h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200">Add Item</h3>
                <input className="w-full border p-2.5 rounded-lg text-sm" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} autoFocus />
                <div className="grid grid-cols-2 gap-3">
                    <input className="border p-2.5 rounded-lg text-sm" type="number" placeholder="Value" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
                    <input className="border p-2.5 rounded-lg text-sm" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                </div>
                <select className="w-full border p-2.5 rounded-lg text-sm bg-surface dark:bg-slate-800 dark:bg-surface" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="Asset">Asset</option><option value="Liability">Liability</option>
                </select>
                <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617] text-sm font-bold">Cancel</button><button className="flex-1 py-2 bg-surface text-white rounded-lg text-sm font-bold hover:bg-slate-800">Save</button></div>
            </form>
        </div>
      )}
    </div>
  );
}
