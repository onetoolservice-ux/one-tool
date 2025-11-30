#!/bin/bash

echo "âœ¨ Adding Professional Empty States..."

# =========================================================
# 1. CREATE REUSABLE EMPTY STATE COMPONENT
# =========================================================
echo "í¾¨ Creating EmptyState.tsx..."
cat > app/shared/ui/EmptyState.tsx << 'TS_END'
import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  color?: "emerald" | "blue" | "indigo" | "rose" | "amber";
}

export default function EmptyState({ title, description, icon: Icon, action, color = "indigo" }: EmptyStateProps) {
  
  const colors = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 h-full min-h-[400px]">
      <div className={`p-4 rounded-full mb-4 ${colors[color]} ring-4 ring-white dark:ring-slate-900 shadow-sm`}>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="animate-in zoom-in-95 duration-300">
          {action}
        </div>
      )}
    </div>
  );
}
TS_END

# =========================================================
# 2. UPDATE SMART LOAN (Amortization Table)
# =========================================================
echo "í¿¦ Polishing Smart Loan..."
cat > app/tools/finance/smart-loan/components/AmortizationTable.tsx << 'TS_END'
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
          <thead className="bg-slate-50 dark:bg-slate-900 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3 w-16 text-center border-r border-slate-200 dark:border-slate-700">#</th>
              <th className="p-3 w-24 border-r border-slate-200 dark:border-slate-700">Date</th>
              <th className="p-3 text-right border-r border-slate-200 dark:border-slate-700">Opening</th>
              <th className="p-3 text-right border-r border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">EMI</th>
              <th className="p-3 text-right border-r border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Principal</th>
              <th className="p-3 text-right border-r border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">Interest</th>
              <th className="p-3 text-right text-slate-700 dark:text-slate-300">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row) => (
              <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="p-3 text-center border-r border-slate-100 dark:border-slate-800 text-slate-400">{row.month}</td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-slate-500">{row.date}</td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-right font-mono text-slate-500">
                  â‚¹{(row.balance + row.principal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-right font-mono font-bold bg-blue-50/30 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400">
                  â‚¹{row.payment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  â‚¹{row.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-right font-mono text-rose-600 dark:text-rose-400">
                  â‚¹{row.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                  â‚¹{row.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. UPDATE SMART DEBT (Debt Table)
# =========================================================
echo "í²³ Polishing Smart Debt..."
cat > app/tools/finance/smart-debt/components/DebtTable.tsx << 'TS_END'
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
        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-200 dark:border-slate-700">
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
              <td className="p-4 font-medium text-slate-900 dark:text-white">{d.name}</td>
              <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">â‚¹{d.balance.toLocaleString()}</td>
              <td className="p-4 text-right font-mono">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded text-xs font-bold">
                  {d.rate}%
                </span>
              </td>
              <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">â‚¹{d.minPayment.toLocaleString()}</td>
              <td className="p-4 text-center">
                <button 
                  onClick={() => onDelete(d.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  title="Remove Debt"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-bold border-t border-slate-200 dark:border-slate-700">
            <td className="p-4 text-slate-900 dark:text-white">TOTAL</td>
            <td className="p-4 text-right text-slate-900 dark:text-white">â‚¹{debts.reduce((s,d) => s + d.balance, 0).toLocaleString()}</td>
            <td className="p-4"></td>
            <td className="p-4 text-right text-slate-900 dark:text-white">â‚¹{debts.reduce((s,d) => s + d.minPayment, 0).toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
TS_END

echo "âœ… Empty States Applied. Run 'npm run build' to finish."
