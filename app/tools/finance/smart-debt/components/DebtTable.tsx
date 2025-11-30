"use client";
import React from "react";
import { Trash2, TrendingDown } from "lucide-react";
import { Debt } from "../hooks/useSmartDebt";
import EmptyState from "@/app/shared/ui/EmptyState";

interface Props { debts: Debt[]; onDelete: (id: string) => void; }

export function DebtTable({ debts, onDelete }: Props) {
  
  if (debts.length === 0) {
    return (
      <EmptyState 
        title="Debt Free!"
        description="You have no active liabilities. Add a debt above to start planning your payoff strategy."
        icon={TrendingDown}
        color="rose"
      />
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-900 text-muted font-bold uppercase text-xs tracking-wider border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="p-4">Liability Name</th>
            <th className="p-4 text-right">Balance</th>
            <th className="p-4 text-right">APR %</th>
            <th className="p-4 text-right">Min Pay</th>
            <th className="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {debts.map((d) => (
            <tr key={d.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <td className="p-4 font-medium text-main dark:text-white">{d.name}</td>
              <td className="p-4 text-right font-mono text-muted dark:text-slate-300">₹{d.balance.toLocaleString()}</td>
              <td className="p-4 text-right font-mono">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded text-xs font-bold">
                  {d.rate}%
                </span>
              </td>
              <td className="p-4 text-right font-mono text-muted dark:text-slate-300">₹{d.minPayment.toLocaleString()}</td>
              <td className="p-4 text-center">
                <button 
                  onClick={() => onDelete(d.id)}
                  className="p-2 text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  title="Remove Debt"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-bold border-t border-slate-200 dark:border-slate-700">
            <td className="p-4 text-main dark:text-white">TOTAL</td>
            <td className="p-4 text-right text-main dark:text-white">₹{debts.reduce((s,d) => s + d.balance, 0).toLocaleString()}</td>
            <td className="p-4"></td>
            <td className="p-4 text-right text-main dark:text-white">₹{debts.reduce((s,d) => s + d.minPayment, 0).toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
