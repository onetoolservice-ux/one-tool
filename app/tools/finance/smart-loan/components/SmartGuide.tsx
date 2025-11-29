import React from "react";
import { X, Calculator, DollarSign } from "lucide-react";

export function SmartGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface dark:bg-slate-800 dark:bg-surface shadow-2xl border-l border-line dark:border-slate-700 dark:border-slate-800 z-40 p-6 overflow-auto animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200">
          Loan Guide
        </h3>

        <button
          aria-label="Close"
          onClick={onClose}
          className="p-2 text-muted/70 hover:text-muted dark:text-muted/70 hover:bg-background dark:bg-surface rounded-full transition"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-6 text-sm text-muted dark:text-muted/70 dark:text-muted/70">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h4 className="font-bold text-blue-800 mb-2">Amortization Explained</h4>
          <p>In the early years of a loan, most of your EMI goes towards <strong>Interest</strong>. Only a small part reduces the <strong>Principal</strong>.</p>
        </div>
        <div>
          <h4 className="font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-1">Pre-Payment Power</h4>
          <p>Paying even one extra EMI per year can reduce your loan tenure by years and save huge amounts of interest.</p>
        </div>
      </div>
    </div>
  );
}
