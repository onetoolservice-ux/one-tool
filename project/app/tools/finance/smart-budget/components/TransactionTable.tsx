import React from "react";
import { Transaction } from "../types";
import { Trash2 } from "lucide-react";

export function TransactionTable({ data, onDelete }: { data: Transaction[], onDelete: (id: string) => void }) {
  if (data.length === 0) return <div className="p-8 text-center text-slate-400">No transactions found matching your filters.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3 text-right">Amount</th>
            <th className="px-6 py-3 w-10">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={row.id} className="bg-white hover:bg-slate-50">
              <td className="px-6 py-3 whitespace-nowrap text-slate-500">{row.date}</td>
              <td className="px-6 py-3 font-medium text-slate-900">{row.description}</td>
              <td className="px-6 py-3">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{row.category}</span>
              </td>
              <td className="px-6 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${row.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {row.type}
                </span>
              </td>
              <td className={`px-6 py-3 text-right font-mono font-medium ${row.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {row.type === 'Income' ? '+' : '-'} {row.amount.toLocaleString()}
              </td>
              <td className="px-6 py-3 text-right">
                <button onClick={() => onDelete(row.id)} className="text-slate-300 hover:text-rose-600 transition">
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
