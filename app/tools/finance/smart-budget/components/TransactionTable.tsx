import React from "react";
import { Transaction } from "../types";
import { Trash2, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";
import { UserMode } from "../hooks/useSmartBudget";

interface Props { data: Transaction[]; onDelete: (id: string) => void; mode: UserMode; }

export function TransactionTable({ data, onDelete, mode }: Props) {
  const isPersonal = mode === 'Personal';
  if (data.length === 0) return <div className="p-20 text-center text-muted/70">No records found.</div>;

  return (
    <div className="w-full h-full overflow-auto bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-6">
      <div className="border border-line dark:border-slate-700 dark:border-slate-800   rounded-lg overflow-hidden bg-surface dark:bg-slate-800 dark:bg-surface">
        <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
          <thead className="bg-background dark:bg-surface dark:bg-slate-950 text-muted dark:text-muted dark:text-muted dark:text-muted font-bold border-b border-line dark:border-slate-700 dark:border-slate-800 sticky top-0 z-10">
            <tr>
              <th className="p-3 pl-4 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 w-[50px] bg-background dark:bg-surface dark:bg-slate-950"></th>
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 min-w-[90px]">DATE</th>
              {!isPersonal && <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 min-w-[100px]">DOC #</th>}
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 min-w-[80px]">TYPE</th>
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 min-w-[150px]">CATEGORY</th>
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 min-w-[200px]">DESCRIPTION</th>
              <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 min-w-[120px] text-right">AMOUNT</th>
              {!isPersonal && <th className="p-3 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 min-w-[80px]">STATUS</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id} className={`group transition border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 ${i % 2 === 0 ? 'bg-surface dark:bg-slate-800 dark:bg-surface' : 'bg-background dark:bg-surface dark:bg-slate-950/30'} hover:bg-blue-50/30`}>
                <td className="p-2 pl-4 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-center"><button onClick={() => onDelete(row.id)} className="p-1 text-slate-300 hover:text-rose-600 dark:text-rose-400 rounded transition"><Trash2 size={14} /></button></td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 font-mono text-muted dark:text-muted dark:text-muted dark:text-muted">{row.postingDate}</td>
                {!isPersonal && <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 font-mono text-blue-600 dark:text-blue-400">{row.docNumber}</td>}
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${row.type === 'Income' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>{row.type === 'Income' ? 'CR' : 'DR'}</span></td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 font-medium text-main dark:text-slate-300">{row.category}</td>
                <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-main dark:text-slate-50 dark:text-slate-100 truncate max-w-[200px]">{row.description}</td>
                <td className={`p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-right font-mono font-bold ${row.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-main dark:text-slate-100 dark:text-slate-200'}`}>{row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                {!isPersonal && <td className="p-2 border-r border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-muted dark:text-muted dark:text-muted dark:text-muted">{row.status}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
