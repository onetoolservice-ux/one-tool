"use client";
import React, { useState } from "react";
import { Plus, RefreshCw, Zap, ArrowUpCircle, ArrowDownCircle, Sparkles, X, Eraser, ChevronUp, ChevronDown, Info } from "lucide-react";
import { Strategy } from "../hooks/useSmartDebt";
import { showToast } from "@/app/shared/Toast";
import HelpTip from "@/app/components/ui/HelpTip";

interface Props {
  extraPayment: number; setExtraPayment: (n: number) => void;
  strategy: Strategy; setStrategy: (s: Strategy) => void;
  onAdd: (d: any) => void; onReset: () => void;
  isCollapsed: boolean; toggleCollapse: () => void;
}

export function DebtInputs({ extraPayment, setExtraPayment, strategy, setStrategy, onAdd, onReset, isCollapsed, toggleCollapse }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [form, setForm] = useState({ name: "", balance: "", rate: "", minPayment: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.balance) return;
    onAdd({ name: form.name, balance: Number(form.balance), rate: Number(form.rate), minPayment: Number(form.minPayment) });
    setForm({ name: "", balance: "", rate: "", minPayment: "" });
    setIsOpen(false);
  };

  const handleAiParse = () => {
    if (!aiText) return;
    const nums = aiText.match(/[\d,]+(\.\d+)?/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
    const rate = nums.find(n => n < 40 && n > 0) || 0;
    const balance = Math.max(...nums) || 0;
    const min = nums.find(n => n !== rate && n !== balance) || (balance * 0.02);
    const name = aiText.replace(/[0-9%$,]/g, '').trim().substring(0, 20) || "Unknown Debt";
    onAdd({ name, balance, rate, minPayment: min });
    setIsAiOpen(false);
    showToast("✨ Auto-Filled!");
  };

  return (
    <>
      <div className="bg-surface border-b sticky top-[60px] z-30 shadow-sm print:hidden">
        <div className="px-6 py-3 bg-background/50 flex flex-wrap items-center gap-4">

          <button onClick={toggleCollapse} className="text-muted/70 hover:text-indigo-600 transition p-1.5 rounded-full hover:bg-slate-100" aria-label={isCollapsed ? "Expand Configuration" : "Collapse Configuration"}>
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>

          {/* Collapsible Content */}
          <div className={`flex flex-wrap items-center gap-4 transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-40 opacity-100'}`}>

            <div className="flex bg-surface border border-line p-1 rounded-lg shadow-sm">
              <button onClick={() => setStrategy('Avalanche')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition ${strategy === 'Avalanche' ? 'bg-indigo-600 text-white shadow' : 'text-muted hover:bg-background'}`}><ArrowUpCircle size={14} /> Avalanche</button>
              <button onClick={() => setStrategy('Snowball')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition ${strategy === 'Snowball' ? 'bg-indigo-600 text-white shadow' : 'text-muted hover:bg-background'}`}><ArrowDownCircle size={14} /> Snowball</button>
            </div>

            <div className="h-6 w-[1px] bg-line"></div>

            <div className="flex items-center gap-2 bg-surface border border-emerald-200 rounded-lg px-3 py-1.5 shadow-sm">
              <label className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1"><Zap size={12} /> Boost</label>
              <input type="number" className="w-20 text-sm font-bold text-main outline-none text-right bg-transparent" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} />
            </div>

            <button
              onClick={() => setIsAiOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-surface text-violet-600 border border-violet-200 rounded-lg text-xs font-bold hover:bg-violet-50 transition shadow-sm"
            >
              <Sparkles size={14} /> AI Paste
            </button>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              aria-label="Reset/Refresh Data"
              onClick={onReset}
              className="p-2 text-muted/70 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            >
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition shadow-md" aria-label="Add Liability"><Plus size={14} /> Add</button>
          </div>
        </div>
      </div>

      {/* AI and Manual Modals (Same as previous turn, ensuring Z-index is high) */}
      {isAiOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-violet-200 animate-in zoom-in-95 relative">
            <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold text-lg text-main flex items-center gap-2"><Sparkles size={18} className="text-violet-600 fill-violet-200" /> AI Smart Paste</h3><button onClick={() => setIsAiOpen(false)} aria-label="Close AI Modal" className="text-muted/70 hover:text-main"><X size={20} /></button></div>
            <textarea className="w-full h-32 border p-4 rounded-lg text-sm focus:ring-2 ring-violet-500 outline-none resize-none bg-background focus:bg-surface transition" placeholder="Paste: 'Visa Card: $5000 balance, 18% rate, $150 min pay'" value={aiText} onChange={e => setAiText(e.target.value)} autoFocus />
            {aiText && <button onClick={() => setAiText("")} className="absolute top-2 right-2 p-1.5 bg-surface border rounded text-muted/70 hover:text-rose-500 hover:border-rose-200 transition text-xs font-bold flex items-center gap-1 shadow-sm"><Eraser size={12} /> Clear</button>}
            <button onClick={handleAiParse} disabled={!aiText} className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:opacity-90 text-sm font-bold shadow-md disabled:opacity-50">Auto-Fill</button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <form onSubmit={submit} className="bg-surface rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5 border border-line animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold text-lg text-main">Add Liability</h3><button type="button" aria-label="Close Modal" onClick={() => setIsOpen(false)} className="text-muted/70 hover:text-main"><X size={20} /></button></div>
            <input className="w-full border p-3 rounded-lg text-sm" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            <div className="grid grid-cols-3 gap-3">
              <input className="border p-2 rounded-lg" type="number" placeholder="Balance" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
              <input className="border p-2 rounded-lg" type="number" placeholder="Rate %" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} />
              <input className="border p-2 rounded-lg" type="number" placeholder="Min Pay" value={form.minPayment} onChange={e => setForm({ ...form, minPayment: e.target.value })} />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md">Add Debt</button>
          </form>
        </div>
      )}
    </>
  );
}
