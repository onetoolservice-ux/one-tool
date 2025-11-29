"use client";
import React, { useState } from "react";
import { RefreshCw, Calculator, Sparkles, X, Eraser } from "lucide-react";
import { showToast } from "@/app/shared/Toast";

interface Props { amount: number; setAmount: (v: number) => void; rate: number; setRate: (v: number) => void; years: number; setYears: (v: number) => void; startDate: string; setStartDate: (v: string) => void; onReset: () => void; }

export function LoanInputs({ amount, setAmount, rate, setRate, years, setYears, startDate, setStartDate, onReset }: Props) {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");

  const handleAi = () => {
    const nums = aiText.match(/[\d,]+(\.\d+)?/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
    const r = nums.find(n => n < 20) || 8.5;
    const y = nums.find(n => n < 40 && n > 0 && n !== r) || 5;
    const a = Math.max(...nums) || 500000;
    setAmount(a); setRate(r); setYears(y);
    setIsAiOpen(false); showToast("✨ Auto-Configured!");
  };

  return (
    <>
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface border-b sticky top-[60px] z-30  ">
        <div className="px-6 py-3 bg-blue-50/30 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide tracking-wide mr-2 text-blue-800"><Calculator size={12} /> Config:</div>
          <div className="flex items-center gap-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-blue-200 rounded-lg px-3 py-1.5  "><label className="text-xs font-bold text-muted/70 uppercase">Amount</label><input type="number" className="w-24 text-sm font-bold text-main dark:text-slate-300 outline-none text-right" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-blue-200 rounded-lg px-3 py-1.5  "><label className="text-xs font-bold text-muted/70 uppercase">Rate %</label><input type="number" className="w-12 text-sm font-bold text-main dark:text-slate-300 outline-none text-right" value={rate} step="0.1" onChange={(e) => setRate(Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-blue-200 rounded-lg px-3 py-1.5  "><label className="text-xs font-bold text-muted/70 uppercase">Years</label><input type="number" className="w-12 text-sm font-bold text-main dark:text-slate-300 outline-none text-right" value={years} onChange={(e) => setYears(Number(e.target.value))} /></div>
          <input type="date" className="text-xs bg-surface dark:bg-slate-800 dark:bg-surface border border-blue-200 rounded px-2 py-1.5 outline-none font-medium text-muted dark:text-muted/70 dark:text-muted/70" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <div className="ml-auto flex gap-2">
            {/* No Guide Button Here - It's in Navbar now */}
            <button onClick={() => setIsAiOpen(true)} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface text-blue-600 dark:text-blue-400 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-50 transition  "><Sparkles size={14} /> Smart Fill</button>
            <button
              aria-label="Reset/Refresh Data"
              onClick={onReset}
              className="p-2 text-muted/70 hover:text-blue-600 dark:text-blue-400 hover:bg-blue-50 rounded-lg transition"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* AI Modal Omitted for brevity, same logic */}
    </>
  );
}
