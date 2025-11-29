"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KPIGrid() {
  const stats = {
    income: 48000,
    expense: 5500,
    balance: 42500,
    categories: 7,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Income */}

      <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface border rounded">
        <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">Income</div>

        <div className="text-2xl font-bold mt-1">
          ₹{stats.income.toLocaleString()}
        </div>

        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
          <ArrowUpRight size={12} /> Trend +
        </div>
      </div>

      {/* Expense */}

      <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface border rounded">
        <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">Expense</div>

        <div className="text-2xl font-bold mt-1">
          ₹{stats.expense.toLocaleString()}
        </div>

        <div className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
          <ArrowDownRight size={12} /> Trend −
        </div>
      </div>

      {/* Balance */}

      <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface border rounded">
        <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">Balance</div>

        <div className="text-2xl font-bold mt-1">
          ₹{stats.balance.toLocaleString()}
        </div>

        <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          {((stats.balance / stats.income) * 100).toFixed(1)}% saved
        </div>
      </div>

      {/* Categories */}

      <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface border rounded">
        <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">Categories</div>

        <div className="text-2xl font-bold mt-1">{stats.categories}</div>

        <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted mt-2">Active categories</div>
      </div>
    </div>
  );
}
