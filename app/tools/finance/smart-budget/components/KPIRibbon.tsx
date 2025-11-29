import React from "react";
import { KPI } from "../types";
import { ArrowUpRight, ArrowDownRight, Wallet, Layers } from "lucide-react";

export function KPIRibbon({ kpi }: { kpi: KPI }) {
  if (!kpi) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x bg-surface dark:bg-slate-800 dark:bg-surface border-b sticky top-[0] z-20">
      <div className="p-4 pl-6 hover:bg-background dark:bg-surface dark:bg-slate-950 transition group">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 bg-emerald-100 rounded text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition"><ArrowDownRight size={14} /></span>
          <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted uppercase font-bold tracking-wider">Total Credit</div>
        </div>
        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{kpi.totalCredit.toLocaleString('en-IN')}</div>
      </div>
      
      <div className="p-4 hover:bg-background dark:bg-surface dark:bg-slate-950 transition group">
        <div className="flex items-center gap-2 mb-1">
           <span className="p-1 bg-rose-100 rounded text-rose-600 dark:text-rose-400 group-hover:scale-110 transition"><ArrowUpRight size={14} /></span>
          <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted uppercase font-bold tracking-wider">Total Debit</div>
        </div>
        <div className="text-xl font-bold text-main dark:text-slate-50 dark:text-slate-100">₹{kpi.totalDebit.toLocaleString('en-IN')}</div>
      </div>

      <div className="p-4 hover:bg-background dark:bg-surface dark:bg-slate-950 transition group">
        <div className="flex items-center gap-2 mb-1">
           <span className="p-1 bg-blue-100 rounded text-blue-600 dark:text-blue-400 group-hover:scale-110 transition"><Wallet size={14} /></span>
          <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted uppercase font-bold tracking-wider">Net Position</div>
        </div>
        <div className={`text-xl font-bold ${kpi.netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
          ₹{kpi.netBalance.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="p-4 pr-6 bg-background dark:bg-surface dark:bg-slate-950/50 flex flex-col justify-center">
        <div className="flex items-center gap-2">
            <Layers size={14} className="text-muted/70" />
            <div className="text-xs text-muted/70 font-bold uppercase tracking-wider">Volume</div>
        </div>
        <div className="text-lg font-bold text-muted dark:text-muted/70 dark:text-muted/70 mt-1">{kpi.count} Docs</div>
      </div>
    </div>
  );
}
