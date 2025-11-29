import React from "react";
import { MonthlyPayment } from "../hooks/useLoanCalculator";

export function AmortizationTable({ data }: { data: MonthlyPayment[] }) {
  if (data.length === 0) return <div className="p-20 text-center text-muted/70">No data available.</div>;

  return (
    <div className="w-full h-full overflow-auto bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-6">
      <div className="border border-line dark:border-slate-700 dark:border-slate-800   rounded-lg overflow-hidden bg-surface dark:bg-slate-800 dark:bg-surface">
        <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
          <thead className="bg-background dark:bg-surface dark:bg-slate-950 text-muted dark:text-muted dark:text-muted dark:text-muted font-bold border-b border-line dark:border-slate-700 dark:border-slate-800 sticky top-0 z-10">
            <tr>
              <th className="p-3 pl-6 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 w-[60px]">MONTH</th>
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 min-w-[100px]">DATE</th>
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right min-w-[120px]">OPENING BAL</th>
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right min-w-[120px] bg-blue-50/50 text-blue-700">EMI PAID</th>
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right min-w-[120px] text-emerald-600 dark:text-emerald-400">PRINCIPAL</th>
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right min-w-[120px] text-rose-600 dark:text-rose-400">INTEREST</th>
              <th className="p-3 text-right min-w-[120px]">CLOSING BAL</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.month} className={`hover:bg-blue-50/30 transition border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 ${i % 2 === 0 ? 'bg-surface dark:bg-slate-800 dark:bg-surface' : 'bg-background dark:bg-surface dark:bg-slate-950/30'}`}>
                <td className="p-2 pl-6 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-center font-mono text-muted/70">{row.month}</td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 font-medium text-main dark:text-slate-300">{row.date}</td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono text-muted dark:text-muted dark:text-muted dark:text-muted">₹{row.openingBalance.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono font-bold bg-blue-50/20 text-blue-700">₹{row.emi.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono text-emerald-600 dark:text-emerald-400">₹{row.principalComponent.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono text-rose-600 dark:text-rose-400">₹{row.interestComponent.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                <td className="p-2 text-right font-mono font-medium text-main dark:text-slate-100 dark:text-slate-200">₹{row.closingBalance.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
