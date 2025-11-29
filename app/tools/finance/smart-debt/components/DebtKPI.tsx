import React from "react";
import { TrendingDown, Calendar, Percent, ShieldAlert } from "lucide-react";

export function DebtKPI({ summary }: { summary: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x bg-surface dark:bg-slate-800 dark:bg-surface border-b sticky top-0 z-20">
      <div className="p-4 pl-6 hover:bg-background dark:bg-surface dark:bg-slate-950 transition group">
        <div className="flex items-center gap-2 mb-1"><span className="p-1 bg-rose-100 rounded text-rose-600 dark:text-rose-400"><ShieldAlert size={14} /></span><div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted uppercase font-bold tracking-wider">Total Debt</div></div>
        <div className="text-xl font-bold text-rose-600 dark:text-rose-400">₹{summary.totalDebt.toLocaleString()}</div>
      </div>
      <div className="p-4 hover:bg-background dark:bg-surface dark:bg-slate-950 transition group">
        <div className="flex items-center gap-2 mb-1"><span className="p-1 bg-orange-100 rounded text-orange-600 dark:text-orange-400"><Percent size={14} /></span><div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted uppercase font-bold tracking-wider">Total Monthly</div></div>
        <div className="text-xl font-bold text-main dark:text-slate-100 dark:text-slate-200">₹{summary.totalMonthly.toLocaleString()}</div>
      </div>
      <div className="p-4 hover:bg-background dark:bg-surface dark:bg-slate-950 transition group">
        <div className="flex items-center gap-2 mb-1"><span className="p-1 bg-emerald-100 rounded text-emerald-600 dark:text-emerald-400"><Calendar size={14} /></span><div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted uppercase font-bold tracking-wider">Debt Free</div></div>
        <div className="text-xl font-bold text-emerald-700">{summary.payoffDate}</div>
      </div>
      <div className="p-4 pr-6 bg-background dark:bg-surface dark:bg-slate-950/50 flex flex-col justify-center">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold"><TrendingDown size={16} /><span>{summary.months} Months</span></div>
        <div className="text-xs text-muted/70 uppercase font-bold tracking-wider mt-1">To Freedom</div>
      </div>
    </div>
  );
}
