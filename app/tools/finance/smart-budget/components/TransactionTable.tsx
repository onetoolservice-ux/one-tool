"use client";

import React from "react";
import { Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Transaction } from "../types";
import EmptyState from "@/app/shared/ui/EmptyState";

interface Props {
  data: Transaction[];
  onDelete: (id: string) => void;
  mode: 'Personal' | 'Enterprise';
}

export function TransactionTable({ data, onDelete, mode }: Props) {
  if (data.length === 0) {
    return (
      <div className="py-12">
        <EmptyState 
          title="No Transactions" 
          description="Start by adding your first expense or income entry." 
          icon={ArrowUpRight} 
          color={mode === 'Personal' ? 'emerald' : 'indigo'}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-muted font-bold uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="py-3 pl-4 w-32">Date</th>
            <th className="py-3 w-24">Type</th>
            <th className="py-3">Category</th>
            <th className="py-3 w-1/3">Description</th>
            <th className="py-3 text-right pr-6">Amount</th>
            <th className="py-3 w-16 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((t) => (
            <tr key={t.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              
              {/* Date */}
              <td className="py-3 pl-4 font-mono text-muted text-xs">
                {t.date}
              </td>

              {/* Type Badge (Fixed Readability) */}
              <td className="py-3">
                <span className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border
                  ${t.type === 'Income' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900' 
                    : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900'}
                `}>
                  {t.type === 'Income' ? 'CR' : 'DR'}
                </span>
              </td>

              {/* Category */}
              <td className="py-3">
                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-main dark:text-slate-300 text-xs font-medium">
                  {t.category}
                </span>
              </td>

              {/* Description */}
              <td className="py-3 font-medium text-main dark:text-slate-200">
                {t.desc}
              </td>

              {/* Amount (Professional Coloring) */}
              <td className={`py-3 text-right pr-6 font-mono font-medium ${t.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-main dark:text-slate-200'}`}>
                {t.type === 'Income' ? '+' : ''}₹{t.amount.toLocaleString()}
              </td>

              {/* Action (Fixed Visibility) */}
              <td className="py-3 text-center">
                <button 
                  onClick={() => onDelete(t.id)}
                  className="p-1.5 text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
