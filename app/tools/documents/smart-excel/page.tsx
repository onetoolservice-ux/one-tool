"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

export default function SmartExcel() {
  const [data, setData] = useState<any[]>([]);
  const [cols, setCols] = useState<string[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = XLSX.read(event.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (json.length > 0) {
           setCols(json[0] as string[]);
           setData(json.slice(1) as any[]);
        }
      };
      reader.readAsBinaryString(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Smart Excel</h1>
            <p className="text-xs text-slate-500">View CSV and Excel files instantly.</p>
        </div>
        <div className="relative">
            <input type="file" accept=".csv, .xlsx, .xls" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition"><Upload size={14}/> Open File</button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm relative">
         {data.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                 <FileSpreadsheet size={48} className="mb-4 opacity-50"/>
                 <p className="font-medium">No spreadsheet loaded</p>
             </div>
         ) : (
             <div className="overflow-auto h-full">
                 <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                        <tr>
                            {cols.map((c, i) => (
                                <th key={i} className="p-3 border-b border-r border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap min-w-[150px]">{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-blue-50 dark:hover:bg-slate-800/50">
                                {row.map((cell: any, j: number) => (
                                    <td key={j} className="p-3 border-b border-r border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
         )}
      </div>
    </div>
  );
}
