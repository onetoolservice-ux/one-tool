import React, { useEffect } from "react";
import { X, TrendingUp, PieChart, AlertCircle } from "lucide-react";

export function SmartGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; } 
    else { document.body.style.overflow = "unset"; }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface dark:bg-slate-800 shadow-2xl z-40 p-6 overflow-auto animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-main">Budgeting Guide</h3>
        <button onClick={onClose} aria-label="Close Guide" className="text-muted/70 p-1 hover:bg-slate-100 rounded-full transition"><X size={20}/></button>
      </div>
      <div className="space-y-6 text-sm text-muted">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"><h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2"><PieChart size={16}/> The 50/30/20 Rule</h4><p>Classic strategy: 50% Needs, 30% Wants, 20% Savings.</p></div>
        <div><h4 className="font-bold text-main mb-1 flex items-center gap-2"><TrendingUp size={16}/> Tracking Impact</h4><p>Builds awareness of small daily purchases.</p></div>
      </div>
    </div>
  );
}
