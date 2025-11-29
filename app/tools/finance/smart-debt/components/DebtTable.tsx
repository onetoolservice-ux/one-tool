import React from "react";
import { Debt } from "../hooks/useSmartDebt";
import { Trash2, AlertCircle } from "lucide-react";

export function DebtTable({ debts, onDelete }: { debts: Debt[], onDelete: (id: string) => void }) {
  if (debts.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full p-20 text-muted/70">
        <div className="bg-background dark:bg-surface dark:bg-slate-950 p-6 rounded-full mb-4"><div className="w-12 h-12 border-2 border-dashed border-line rounded-lg flex items-center justify-center"><AlertCircle size={24} className="opacity-20"/></div></div>
        <p className="font-medium">No debts added.</p>
    </div>
  );

  return (
    <div className="w-full h-full overflow-auto bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-6">
      <div className="border border-line dark:border-slate-700 dark:border-slate-800   rounded-lg overflow-hidden bg-surface dark:bg-slate-800 dark:bg-surface">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-background dark:bg-surface dark:bg-slate-950 text-muted dark:text-muted dark:text-muted dark:text-muted font-bold border-b border-line dark:border-slate-700 dark:border-slate-800">
            <tr>
              <th className="p-4 pl-6 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 w-1/3 text-xs uppercase tracking-wide">Liability Name</th>
              <th className="p-4 text-right border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-xs uppercase tracking-wide">Balance</th>
              <th className="p-4 text-right border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-xs uppercase tracking-wide">APR %</th>
              <th className="p-4 text-right border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-xs uppercase tracking-wide">Min Pay</th>
              <th className="p-4 text-center w-20 text-xs uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {debts.map((d, i) => (
              <tr key={d.id} className={`group transition border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 ${i % 2 === 0 ? 'bg-surface dark:bg-slate-800 dark:bg-surface' : 'bg-background dark:bg-surface dark:bg-slate-950/30'} hover:bg-indigo-50/30`}>
                  <td className="p-4 pl-6 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 font-medium text-main dark:text-slate-300">{d.name}</td>
                  <td className="p-4 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono text-muted dark:text-muted/70 dark:text-muted/70">₹{d.balance.toLocaleString()}</td>
                  <td className="p-4 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right"><span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs font-bold border border-orange-100">{d.rate}%</span></td>
                  <td className="p-4 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono text-muted dark:text-muted/70 dark:text-muted/70">₹{d.minPayment.toLocaleString()}</td>
                  <td className="p-4 text-center"><button onClick={() => onDelete(d.id)} className="p-2 text-slate-300 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 rounded-lg transition"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            <tr className="bg-background dark:bg-surface dark:bg-slate-950 border-t border-line dark:border-slate-700 dark:border-slate-800 font-bold text-main dark:text-slate-100 dark:text-slate-200">
                <td className="p-4 pl-6 border-r border-line dark:border-slate-700 dark:border-slate-800 text-xs uppercase">Total</td>
                <td className="p-4 text-right border-r border-line dark:border-slate-700 dark:border-slate-800">₹{debts.reduce((s, d) => s + d.balance, 0).toLocaleString()}</td>
                <td className="p-4 border-r border-line dark:border-slate-700 dark:border-slate-800"></td>
                <td className="p-4 text-right border-r border-line dark:border-slate-700 dark:border-slate-800">₹{debts.reduce((s, d) => s + d.minPayment, 0).toLocaleString()}</td>
                <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
