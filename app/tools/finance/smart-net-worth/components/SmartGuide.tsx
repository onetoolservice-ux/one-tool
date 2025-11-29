import React from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";

export function SmartGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface dark:bg-slate-800 dark:bg-surface shadow-2xl border-l border-line dark:border-slate-700 dark:border-slate-800 z-40 p-6 overflow-auto animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200">
          Net Worth Guide
        </h3>

        <button
          aria-label="Close"
          onClick={onClose}
          className="text-muted/70 hover:text-muted dark:text-muted/70 rounded-full transition"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-6 text-sm text-muted dark:text-muted/70 dark:text-muted/70">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"><h4 className="font-bold text-emerald-800 mb-2 flex gap-2"><TrendingUp size={16} /> Assets</h4><p>Anything you own that has value (Cash, House, Stocks). These put money in your pocket.</p></div>
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-100"><h4 className="font-bold text-rose-800 mb-2 flex gap-2"><TrendingDown size={16} /> Liabilities</h4><p>Anything you owe (Loans, Credit Card Debt). These take money out.</p></div>
        <p><strong>Goal:</strong> Increase Net Worth by buying appreciating assets and paying down debt.</p>
      </div>
    </div>
  );
}
