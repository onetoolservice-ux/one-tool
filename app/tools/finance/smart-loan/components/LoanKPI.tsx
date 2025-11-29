import React from "react";
import { LoanSummary } from "../hooks/useLoanCalculator";
import { Calculator, DollarSign, TrendingUp, Calendar } from "lucide-react";

export function LoanKPI({ summary }: { summary: LoanSummary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x bg-surface dark:bg-slate-800 dark:bg-surface border-b sticky top-0 z-20">
      <div className="p-4 pl-6 hover:bg-background dark:bg-surface dark:bg-slate-950 transition group">
        <div className="flex items-center gap-2 mb-1"><span className="p-1 bg-blue-100 rounded text-blue-600 dark:text-blue-400"><Calculator size={14} /></span><div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted uppercase font-bold tracking-wider">Monthly EMI</div></div>
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{summary.monthlyEMI.toLocaleString()}</div>
      </div>
      <div className="p-4 hover:bg-background dark:bg-surface dark:bg-slate-950 transition group">
        <div className="flex items-center gap-2 mb-1"><span className="p-1 bg-rose-100 rounded text-rose-600 dark:text-rose-400"><TrendingUp size={14} /></span><div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted uppercase font-bold tracking-wider">Total Interest</div></div>
        <div className="text-xl font-bold text-rose-600 dark:text-rose-400">₹{summary.totalInterest.toLocaleString()}</div>
      </div>
      <div className="p-4 hover:bg-background dark:bg-surface dark:bg-slate-950 transition group">
        <div className="flex items-center gap-2 mb-1"><span className="p-1 bg-emerald-100 rounded text-emerald-600 dark:text-emerald-400"><DollarSign size={14} /></span><div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted uppercase font-bold tracking-wider">Total Payable</div></div>
        <div className="text-xl font-bold text-emerald-700">₹{summary.totalPayment.toLocaleString()}</div>
      </div>
      <div className="p-4 pr-6 bg-background dark:bg-surface dark:bg-slate-950/50 flex flex-col justify-center">
        <div className="flex items-center gap-2"><Calendar size={14} className="text-muted/70" /><div className="text-xs text-muted/70 font-bold uppercase tracking-wider">Payoff Date</div></div>
        <div className="text-lg font-bold text-muted dark:text-muted/70 dark:text-muted/70 mt-1">{summary.payoffDate}</div>
      </div>
    </div>
  );
}
