#!/bin/bash

echo "í¾‰ Adding Success Celebration Features..."

# =========================================================
# 1. INSTALL DEPENDENCIES
# =========================================================
echo "í³¦ Installing canvas-confetti..."
if [ -f "yarn.lock" ]; then
    yarn add canvas-confetti
    yarn add -D @types/canvas-confetti
else
    npm install canvas-confetti
    npm install --save-dev @types/canvas-confetti
fi

# =========================================================
# 2. CREATE CONFETTI UTILITY
# =========================================================
echo "âœ¨ Creating confetti utility..."
mkdir -p app/utils
cat > app/utils/confetti.ts << 'TS_END'
import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
TS_END

# =========================================================
# 3. UPDATE SMART BUDGET (Quick Entry)
# =========================================================
echo "í²° Updating Smart Budget Quick Entry..."
cat > app/tools/finance/smart-budget/components/QuickEntry.tsx << 'TS_END'
"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Transaction } from "../types";
import { showToast } from "@/app/shared/Toast";
import Button from "@/app/shared/ui/Button";
import { fireConfetti } from "@/app/utils/confetti"; // Import Confetti

interface QuickEntryProps {
  onAdd: (t: Omit<Transaction, "id">) => void;
  mode: 'Personal' | 'Enterprise';
}

export function QuickEntry({ onAdd, mode }: QuickEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    desc: "",
    amount: "",
    type: "Expense",
    category: mode === 'Personal' ? "Food" : "Operations"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.desc || !form.amount) {
      showToast("Please fill all fields", "error");
      return;
    }
    
    onAdd({
      date: form.date,
      desc: form.desc,
      amount: Number(form.amount),
      type: form.type as any,
      category: form.category,
      status: "Posted"
    });

    setForm({ ...form, desc: "", amount: "" });
    setIsOpen(false);
    showToast("Transaction Added", "success");
    
    // í¾‰ TRIGGER CELEBRATION
    fireConfetti();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
        <Plus size={16} /> Add New
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-line dark:border-slate-700 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-main">New Entry</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-main p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Date</label>
                  <input 
                    type="date" 
                    className="w-full" 
                    value={form.date} 
                    onChange={e => setForm({...form, date: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Type</label>
                  <select 
                    className="w-full" 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value})}
                  >
                    <option>Income</option>
                    <option>Expense</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted uppercase">Description</label>
                <input 
                  className="w-full" 
                  placeholder="What was this for?" 
                  value={form.desc} 
                  onChange={e => setForm({...form, desc: e.target.value})} 
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Category</label>
                  <select 
                    className="w-full" 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    {mode === 'Personal' ? (
                        <>
                            <option>Food</option><option>Transport</option><option>Utilities</option><option>Entertainment</option><option>Health</option><option>Salary</option><option>Investment</option>
                        </>
                    ) : (
                        <>
                            <option>Operations</option><option>Marketing</option><option>Payroll</option><option>Software</option><option>Office</option><option>Sales</option><option>Revenue</option>
                        </>
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase">Amount</label>
                  <input 
                    type="number" 
                    className="w-full" 
                    placeholder="0.00" 
                    value={form.amount} 
                    onChange={e => setForm({...form, amount: e.target.value})} 
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full py-3 text-sm">
                  Save Transaction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
TS_END

# =========================================================
# 4. UPDATE SMART DEBT (Debt Inputs)
# =========================================================
echo "í²³ Updating Smart Debt Inputs..."
cat > app/tools/finance/smart-debt/components/DebtInputs.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { Plus, RefreshCw, Zap, ArrowUpCircle, ArrowDownCircle, Sparkles, X, Eraser, ChevronUp, ChevronDown } from "lucide-react";
import { Strategy } from "../hooks/useSmartDebt";
import { showToast } from "@/app/shared/Toast";
import Button from "@/app/shared/ui/Button"; // Using Shared Button
import { fireConfetti } from "@/app/utils/confetti"; // Import Confetti

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
    showToast("Debt Added", "success");
    
    // í¾‰ TRIGGER CELEBRATION
    fireConfetti();
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
    showToast("âœ¨ Auto-Filled!", "success");
    fireConfetti();
  };

  return (
    <>
      <div className="bg-surface/50 backdrop-blur-sm border-b border-line sticky top-[60px] z-30 shadow-sm">
        <div className="px-6 py-3 flex flex-wrap items-center gap-4">

          <button onClick={toggleCollapse} className="text-muted hover:text-indigo-600 transition p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>

          <div className={`flex flex-wrap items-center gap-4 transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-40 opacity-100'}`}>
            <div className="flex bg-surface dark:bg-slate-900 border border-line dark:border-slate-700 p-1 rounded-lg">
              <button onClick={() => setStrategy('Avalanche')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition ${strategy === 'Avalanche' ? 'bg-indigo-600 text-white shadow' : 'text-muted hover:bg-background'}`}><ArrowUpCircle size={14} /> Avalanche</button>
              <button onClick={() => setStrategy('Snowball')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition ${strategy === 'Snowball' ? 'bg-indigo-600 text-white shadow' : 'text-muted hover:bg-background'}`}><ArrowDownCircle size={14} /> Snowball</button>
            </div>

            <div className="h-6 w-[1px] bg-line mx-1"></div>

            <div className="flex items-center gap-2 bg-surface dark:bg-slate-900 border border-emerald-200/50 rounded-lg px-3 py-1.5">
              <label className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1"><Zap size={12} /> Boost</label>
              <input type="number" className="w-20 text-sm font-bold text-main bg-transparent outline-none text-right" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} />
            </div>

            <Button variant="ghost" onClick={() => setIsAiOpen(true)} className="text-xs h-8 px-3">
              <Sparkles size={14} className="mr-1 text-violet-500" /> AI Paste
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" onClick={onReset} className="w-8 h-8 p-0"><RefreshCw size={16} /></Button>
            <Button onClick={() => setIsOpen(true)} className="text-xs h-8 px-3 flex items-center gap-1.5"><Plus size={14} /> Add</Button>
          </div>
        </div>
      </div>

      {/* Manual Add Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in">
          <form onSubmit={submit} className="bg-surface dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-line dark:border-slate-700 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-main">Add Liability</h3><button type="button" onClick={() => setIsOpen(false)} className="text-muted hover:text-main"><X size={20} /></button></div>
            <input className="w-full" placeholder="Debt Name (e.g. Visa Card)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            <div className="grid grid-cols-3 gap-3">
              <input type="number" placeholder="Balance" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
              <input type="number" placeholder="Rate %" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} />
              <input type="number" placeholder="Min Pay" value={form.minPayment} onChange={e => setForm({ ...form, minPayment: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Add Debt</Button>
          </form>
        </div>
      )}

      {/* AI Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-violet-200 dark:border-violet-900 p-6 space-y-4 animate-in zoom-in-95 relative">
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-main flex items-center gap-2"><Sparkles size={18} className="text-violet-500" /> AI Smart Paste</h3><button onClick={() => setIsAiOpen(false)} className="text-muted hover:text-main"><X size={20} /></button></div>
            <textarea className="w-full h-32 border border-violet-100 dark:border-violet-900 p-4 rounded-lg text-sm focus:ring-2 ring-violet-500 outline-none resize-none bg-violet-50/10" placeholder="Paste: 'Visa Card: $5000 balance, 18% rate, $150 min pay'" value={aiText} onChange={e => setAiText(e.target.value)} autoFocus />
            <Button onClick={handleAiParse} disabled={!aiText} className="w-full bg-violet-600 hover:bg-violet-700 text-white">Auto-Fill</Button>
          </div>
        </div>
      )}
    </>
  );
}
TS_END

echo "í¾‰ Celebration Features Installed!"
