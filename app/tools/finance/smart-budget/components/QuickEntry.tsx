"use client";
import React, { useState } from "react";
import { Plus, X, Sparkles, Eraser } from "lucide-react";
import { MASTER_CATEGORIES } from "../types";
import { UserMode } from "../hooks/useSmartBudget";
import { showToast } from "@/app/shared/Toast";

interface Props { onAdd: (tx: any) => void; mode: UserMode; }

export function QuickEntry({ onAdd, mode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [form, setForm] = useState({ desc: "", amount: "", category: MASTER_CATEGORIES[0], type: "Expense", postingDate: new Date().toISOString().split('T')[0] });
  const isPersonal = mode === 'Personal';

  const handleAiParse = () => {
    if(!aiText) return;
    const nums = aiText.match(/[\d,]+(\.\d+)?/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
    const amount = Math.max(...nums) || 0;
    const type = aiText.toLowerCase().includes("credit") || aiText.toLowerCase().includes("income") ? "Income" : "Expense";
    const desc = aiText.replace(/[0-9%$,]/g, '').trim().substring(0, 30) || "Imported Txn";
    onAdd({ description: desc, amount, category: "General", type, postingDate: new Date().toISOString().split('T')[0], glAccount: "N/A", costCenter: "N/A" });
    setIsAiOpen(false);
    showToast("✨ Auto-Filled!");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.desc || !form.amount) return;
    onAdd({ ...form, amount: parseFloat(form.amount), glAccount: "N/A", costCenter: "N/A" });
    setForm({ ...form, desc: "", amount: "" });
    setIsOpen(false);
  };

  if (!isOpen) return (
    <div className="flex gap-2">
        <button onClick={() => setIsAiOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface text-violet-600 dark:text-violet-400 border border-violet-200 rounded-lg text-xs font-bold hover:bg-violet-50 transition  "><Sparkles size={14}/> Smart Fill</button>
        <button onClick={() => setIsOpen(true)} className={`flex items-center gap-2 text-white px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide tracking-wide   transition active:scale-95 ${isPersonal ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-600 hover:bg-violet-700'}`}><Plus size={16}/> {isPersonal ? "Add" : "Post"}</button>
        
        {isAiOpen && (
            <div className="fixed inset-0 bg-surface/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-violet-200 animate-in zoom-in-95 relative">
                    <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200 flex items-center gap-2"><Sparkles size={18} className="text-violet-600 dark:text-violet-400"/> Smart Fill</h3><button onClick={() => setIsAiOpen(false)} className="text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70"><X size={20}/></button></div>
                    <div className="p-3 bg-violet-50 rounded-lg text-xs text-violet-800 border border-violet-100">Paste SMS/Email: <strong>"Spent $50 at Starbucks today"</strong></div>
                    <div className="relative"><textarea className="w-full h-32 border p-4 rounded-lg text-sm focus:ring-2 ring-violet-500 outline-none resize-none bg-background dark:bg-surface dark:bg-slate-950 focus:bg-surface dark:bg-slate-800 dark:bg-surface transition" placeholder="Paste details here..." value={aiText} onChange={e => setAiText(e.target.value)} autoFocus />{aiText && <button onClick={() => setAiText("")} className="absolute top-2 right-2 p-1.5 bg-surface dark:bg-slate-800 dark:bg-surface border rounded text-muted/70 hover:text-rose-500 text-xs font-bold flex gap-1"><Eraser size={12}/> Clear</button>}</div>
                    <button onClick={handleAiParse} disabled={!aiText} className="w-full py-2.5 bg-violet-600 text-white rounded-lg font-bold   disabled:opacity-50">Auto-Fill Transaction</button>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-surface/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
      <form onSubmit={submit} className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5 border-t-4 border-emerald-500">
        <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200">New Transaction</h3><button type="button" onClick={() => setIsOpen(false)} className="text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70"><X size={20}/></button></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Type</label><select className="w-full border p-2 rounded text-sm" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="Expense">Expense</option><option value="Income">Income</option></select></div><div className="space-y-1.5"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Date</label><input type="date" className="w-full border p-2 rounded text-sm" value={form.postingDate} onChange={e => setForm({...form, postingDate: e.target.value})} /></div></div>
        <div className="space-y-1.5"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Description</label><input className="w-full border p-2.5 rounded text-sm" placeholder="e.g. Lunch" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} autoFocus /></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Amount</label><input className="w-full border p-2.5 rounded font-mono text-sm" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div><div className="space-y-1.5"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Category</label><select className="w-full border p-2.5 rounded text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{MASTER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div>
        <div className="flex gap-3 pt-4 border-t mt-2"><button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-2.5 border rounded text-sm font-bold">Cancel</button><button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white rounded text-sm font-bold  ">Save</button></div>
      </form>
    </div>
  );
}
