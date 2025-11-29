import React from "react";
import { ArrowUpCircle, ArrowDownCircle, X } from "lucide-react";

export function DebtGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface dark:bg-slate-800 dark:bg-surface shadow-2xl border-l border-line dark:border-slate-700 dark:border-slate-800 z-40 p-6 overflow-auto animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200">Strategy Guide</h3>
        <button aria-label="Close"<button onClick={onClose} className="text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70"><X size={20}/></button>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wide">
                <ArrowUpCircle size={16}/> Avalanche
            </div>
            <p className="text-sm text-muted dark:text-muted/70 dark:text-muted/70 leading-relaxed">
                Focuses on paying off the debt with the <strong>highest interest rate</strong> first.
            </p>
            <div className="bg-indigo-50 p-3 rounded-lg text-xs text-indigo-800 border border-indigo-100">
                <strong>Why?</strong> Mathematically the best. You save the most money on interest in the long run.
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wide">
                <ArrowDownCircle size={16}/> Snowball
            </div>
            <p className="text-sm text-muted dark:text-muted/70 dark:text-muted/70 leading-relaxed">
                Focuses on paying off the debt with the <strong>lowest balance</strong> first.
            </p>
            <div className="bg-indigo-50 p-3 rounded-lg text-xs text-indigo-800 border border-indigo-100">
                <strong>Why?</strong> Psychologically powerful. You get quick wins by eliminating small debts fast.
            </div>
        </div>

        <div className="p-4 border-t border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
            <h4 className="font-bold text-sm text-main dark:text-slate-100 dark:text-slate-200 mb-2">Monthly Boost</h4>
            <p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">
                Any extra money you add here is applied directly to your top-priority debt (based on strategy), speeding up your freedom date significantly.
            </p>
        </div>
      </div>
    </div>
  );
}
