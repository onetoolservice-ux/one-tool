import React, { useEffect } from "react";
import { X, TrendingUp, PieChart, AlertCircle } from "lucide-react";

export function SmartGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; } 
    else { document.body.style.overflow = "unset"; }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface dark:bg-slate-800 dark:bg-surface shadow-2xl border-l border-line dark:border-slate-700 dark:border-slate-800 z-40 p-6 overflow-auto animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200">Budgeting Guide</h3>
        <button aria-label="Close"<button onClick={onClose} aria-label="Close Guide" className="text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70 p-1 hover:bg-slate-100 rounded-full transition"><X size={20}/></button>
      </div>
      <div className="space-y-6 text-sm text-muted dark:text-muted/70 dark:text-muted/70 leading-relaxed">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2"><PieChart size={16}/> The 50/30/20 Rule</h4>
            <p>A classic budgeting strategy:</p>
            <ul className="list-disc pl-4 mt-2 space-y-1">
                <li><strong>50% Needs:</strong> Rent, groceries, bills.</li>
                <li><strong>30% Wants:</strong> Dining, entertainment.</li>
                <li><strong>20% Savings:</strong> Investments, debt paydown.</li>
            </ul>
        </div>
        <div>
            <h4 className="font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-1 flex items-center gap-2"><TrendingUp size={16}/> Tracking Impact</h4>
            <p>Tracking every expense builds awareness. Often, small daily purchases (the "Latte Factor") add up to huge annual costs.</p>
        </div>
        <div>
            <h4 className="font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-1 flex items-center gap-2"><AlertCircle size={16}/> Zero-Based Budgeting</h4>
            <p>Give every dollar a job. Income minus Expenses should equal zero. If you have extra, assign it to savings immediately.</p>
        </div>
      </div>
    </div>
  );
}
