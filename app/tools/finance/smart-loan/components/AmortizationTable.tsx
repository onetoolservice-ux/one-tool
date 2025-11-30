import React from "react";
import { MonthlyPayment } from "../hooks/useLoanCalculator";

export function AmortizationTable({ data }: { data: MonthlyPayment[] }) {
  if (!data || data.length === 0) return <div className="p-8 text-center text-muted">No schedule available</div>;

  return (
    <div className="bg-surface dark:bg-slate-800 dark:bg-surface border-t border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-bold text-muted dark:text-muted dark:text-muted dark:text-muted border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
            <tr>
              <th className="p-2 w-16 text-center border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">#</th>
              <th className="p-2 w-24 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">Date</th>
              <th className="p-2 text-right border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">Opening</th>
              <th className="p-2 text-right border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 bg-blue-50/10 text-blue-600 dark:text-blue-400">EMI</th>
              <th className="p-2 text-right border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">Principal</th>
              <th className="p-2 text-right border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-rose-600 dark:text-rose-400">Interest</th>
              <th className="p-2 text-right">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line dark:divide-slate-700 dark:divide-slate-800">
            {data.map((row) => (
              <tr key={row.month} className="hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617] transition-colors">
                <td className="p-2 text-center border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-muted dark:text-muted dark:text-muted dark:text-muted">{row.month}</td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-muted dark:text-muted dark:text-muted dark:text-muted">{row.date}</td>
                {/* Calculated Opening Balance on the fly: Balance + Principal Paid this month */}
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono text-muted dark:text-muted dark:text-muted dark:text-muted">
                  ₹{(row.balance + row.principal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono font-bold bg-blue-50/10 text-blue-700 dark:text-blue-400">
                  ₹{row.payment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{row.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono text-rose-600 dark:text-rose-400">
                  ₹{row.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-2 text-right font-mono font-medium text-main dark:text-slate-100 dark:text-slate-200">
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
