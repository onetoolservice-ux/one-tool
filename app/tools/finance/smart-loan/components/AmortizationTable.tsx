import React from "react";
import { MonthlyPayment } from "../hooks/useLoanCalculator";
import EmptyState from "@/app/shared/ui/EmptyState";
import { Calculator } from "lucide-react";

export function AmortizationTable({ data }: { data: MonthlyPayment[] }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        title="No Loan Configured"
        description="Enter your loan details above to generate a complete amortization schedule and payoff plan."
        icon={Calculator}
        color="blue"
      />
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 font-bold text-muted border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3 w-16 text-center border-r border-slate-200 dark:border-slate-700">#</th>
              <th className="p-3 w-24 border-r border-slate-200 dark:border-slate-700">Date</th>
              <th className="p-3 text-right border-r border-slate-200 dark:border-slate-700">Opening</th>
              <th className="p-3 text-right border-r border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">EMI</th>
              <th className="p-3 text-right border-r border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Principal</th>
              <th className="p-3 text-right border-r border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">Interest</th>
              <th className="p-3 text-right text-main dark:text-slate-300">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row) => (
              <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="p-3 text-center border-r border-slate-100 dark:border-slate-800 text-muted">{row.month}</td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-muted">{row.date}</td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-right font-mono text-muted">
                  ₹{(row.balance + row.principal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-right font-mono font-bold bg-blue-50/30 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400">
                  ₹{row.payment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{row.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-right font-mono text-rose-600 dark:text-rose-400">
                  ₹{row.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 text-right font-mono font-medium text-main dark:text-slate-300">
                  ₹{row.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
