"use client";
import React, { useState } from "react";
import { FileSpreadsheet, Plus, Save, Download } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartExcel() {
  const [data, setData] = useState([
    ["Item", "Cost", "Qty", "Total"],
    ["Apple", "1.50", "10", "15.00"],
    ["Bread", "2.00", "5", "10.00"],
    ["Milk", "1.20", "2", "2.40"]
  ]);

  const handleChange = (r: number, c: number, val: string) => {
    const newData = [...data];
    newData[r][c] = val;
    setData(newData);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white  "><FileSpreadsheet size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Excel</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Grid Editor</p></div>
        </div>
        <div className="flex gap-2">
            <button onClick={()=>{showToast("Exported to CSV")}} className="flex items-center gap-2 px-4 py-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-main dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617] transition"><Download size={14}/> Export</button>
            <button onClick={()=>{showToast("Sheet Saved")}} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-lg shadow-slate-200/50 dark:shadow-none"><Save size={14}/> Save</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface border rounded-xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none inline-block min-w-full">
            <table className="w-full text-sm text-left border-collapse">
                <tbody>
                    {data.map((row, r) => (
                        <tr key={r} className="border-b last:border-0 hover:bg-blue-50/30">
                            <td className="w-12 bg-background dark:bg-[#0f172a] dark:bg-[#020617] border-r text-center text-xs font-bold text-muted/70 select-none">{r+1}</td>
                            {row.map((cell, c) => (
                                <td key={c} className={`border-r p-0 min-w-[120px] ${r===0?'bg-background dark:bg-[#0f172a] dark:bg-[#020617]/80':''}`}>
                                    <input 
                                        value={cell} 
                                        onChange={e=>handleChange(r,c,e.target.value)}
                                        className={`w-full h-full p-3 outline-none bg-transparent dark:text-white focus:bg-blue-50/50 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition ${r===0?'font-bold text-main dark:text-slate-100 dark:text-slate-200':'text-muted dark:text-muted/70 dark:text-muted/70'}`} 
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={()=>setData([...data, ["","","",""]])} className="w-full p-3 text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617] hover:text-emerald-600 dark:text-emerald-400 border-t flex items-center justify-center gap-2 transition"><Plus size={14}/> Add New Row</button>
        </div>
      </div>
    </div>
  );
}
