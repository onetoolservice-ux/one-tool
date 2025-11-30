import React from "react";
import { ArrowUpCircle, ArrowDownCircle, X } from "lucide-react";

export function DebtGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface dark:bg-slate-800 shadow-2xl z-40 p-6 overflow-auto animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-main">Strategy Guide</h3>
        <button aria-label="Close" onClick={onClose} className="text-muted/70 hover:text-muted"><X size={20}/></button>
      </div>
      <div className="space-y-8">
        <div className="space-y-2"><div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase"><ArrowUpCircle size={16}/> Avalanche</div><p className="text-sm text-muted">Pay highest interest first. Saves money.</p></div>
        <div className="space-y-2"><div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase"><ArrowDownCircle size={16}/> Snowball</div><p className="text-sm text-muted">Pay lowest balance first. Builds motivation.</p></div>
      </div>
    </div>
  );
}
