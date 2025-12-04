"use client";
import React, { useState } from 'react';
import { Download, Plus, Table } from 'lucide-react';

export const SmartExcel = () => {
  const [data, setData] = useState([
    ["Name", "Role", "Amount"],
    ["Alice", "Manager", "5000"],
    ["Bob", "Dev", "4000"]
  ]);

  const updateCell = (r: number, c: number, val: string) => {
    const n = [...data]; n[r][c] = val; setData(n);
  };

  const addRow = () => setData([...data, Array(data[0].length).fill("")]);
  const addCol = () => setData(data.map(row => [...row, ""]));
  
  const exportCSV = () => {
    const csv = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "sheet.csv";
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
       <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2 text-[#4a6b61] font-bold text-sm uppercase tracking-wide"><Table size={18} /> Sheet</div>
          <div className="flex gap-2">
             <button onClick={addRow} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold flex items-center gap-1"><Plus size={12}/> Row</button>
             <button onClick={addCol} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold flex items-center gap-1"><Plus size={12}/> Col</button>
             <button onClick={exportCSV} className="px-3 py-1.5 bg-[#638c80] text-white rounded text-xs font-bold flex items-center gap-1"><Download size={12}/> CSV</button>
          </div>
       </div>
       <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
             <tbody>
                {data.map((row, r) => (
                   <tr key={r}>
                      <td className="w-10 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center text-[10px] font-bold text-slate-500">{r+1}</td>
                      {row.map((c, j) => (
                         <td key={j} className="border border-slate-200 dark:border-slate-800 p-0 min-w-[100px]">
                            <input type="text" value={c} onChange={e => updateCell(r, j, e.target.value)} className="w-full h-full px-2 py-2 outline-none bg-transparent text-sm focus:bg-indigo-50 dark:focus:bg-indigo-900/20" />
                         </td>
                      ))}
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};
