"use client";
import React, { useState } from 'react';
import { Table, Download, Trash2, FileJson, Database, Plus, Grid, FileText } from 'lucide-react';

export const CsvStudio = () => {
  // Initial Data
  const [headers, setHeaders] = useState(["ID", "Name", "Role", "Email"]);
  const [data, setData] = useState([
    ["1", "John Doe", "Dev", "john@test.com"],
    ["2", "Jane Smith", "Design", "jane@test.com"],
    ["3", "", "Manager", ""] 
  ]);

  // Handlers
  const handleHeader = (i: number, v: string) => {
    const newH = [...headers];
    newH[i] = v;
    setHeaders(newH);
  };

  const handleCell = (rIndex: number, cIndex: number, v: string) => {
    const newData = [...data];
    newData[rIndex][cIndex] = v;
    setData(newData);
  };

  const addRow = () => {
    setData([...data, Array(headers.length).fill("")]);
  };

  const addCol = () => {
    setHeaders([...headers, "New Column"]);
    setData(data.map(row => [...row, ""]));
  };

  const removeEmpty = () => {
    const clean = data.filter(row => row.some(cell => cell.trim() !== ""));
    setData(clean);
  };

  const exportFile = (type: 'json' | 'csv') => {
    let content = "";
    let mime = "";
    let ext = "";

    if (type === 'json') {
       const json = data.map(row => headers.reduce((acc:any, h, i) => ({...acc, [h]: row[i]}), {}));
       content = JSON.stringify(json, null, 2);
       mime = "application/json";
       ext = "json";
    } else {
       content = headers.join(",") + "\n" + data.map(r => r.join(",")).join("\n");
       mime = "text/csv";
       ext = "csv";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_studio_export.${ext}`;
    a.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-6 bg-slate-50 dark:bg-[#0B1120]">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
             <Grid className="text-teal-600"/> Data Studio 
             <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded ml-2">CSV / JSON Editor</span>
          </h1>
          <div className="flex gap-2">
             <button onClick={addRow} className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-transform active:scale-95">
                <Plus size={14}/> Add Row
             </button>
             <button onClick={addCol} className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-transform active:scale-95">
                <Plus size={14}/> Add Col
             </button>
             <button onClick={removeEmpty} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 flex items-center gap-2 transition-transform active:scale-95">
                <Trash2 size={14}/> Clean Rows
             </button>
             <div className="h-8 w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>
             <button onClick={()=>exportFile('csv')} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-300"><FileText size={14}/> CSV</button>
             <button onClick={()=>exportFile('json')} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90 shadow-lg"><FileJson size={14}/> JSON</button>
          </div>
       </div>

       {/* TABLE */}
       <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-auto shadow-sm relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="bg-slate-100 dark:bg-slate-800 border-b dark:border-slate-700">
                   <th className="w-10 p-3 text-center text-xs text-slate-400 font-mono border-r border-slate-200 dark:border-slate-700">#</th>
                   {headers.map((h, i) => (
                      <th key={i} className="p-0 min-w-[150px] border-r border-slate-200 dark:border-slate-700 last:border-0">
                         <input 
                           value={h} 
                           onChange={e=>handleHeader(i, e.target.value)}
                           className="w-full p-3 bg-transparent outline-none text-xs font-black uppercase text-slate-600 dark:text-slate-300 placeholder:text-slate-300 focus:bg-white dark:focus:bg-black transition-colors"
                           placeholder="HEADER"
                         />
                      </th>
                   ))}
                </tr>
             </thead>
             <tbody>
                {data.map((row, r) => (
                   <tr key={r} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                      <td className="text-center text-xs text-slate-300 font-mono border-r border-slate-100 dark:border-slate-800 select-none group-hover:text-slate-500">{r + 1}</td>
                      {row.map((cell, c) => (
                         <td key={c} className="p-0 border-r border-slate-100 dark:border-slate-800 last:border-0">
                            <input 
                              value={cell} 
                              onChange={e=>handleCell(r, c, e.target.value)} 
                              className="w-full p-3 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-700 transition-all"
                            />
                         </td>
                      ))}
                   </tr>
                ))}
             </tbody>
          </table>
          
          {/* EMPTY STATE */}
          {data.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <Database size={48} className="mb-4 opacity-20"/>
                <p className="text-sm font-bold">Table is empty</p>
                <button onClick={addRow} className="mt-2 text-blue-500 hover:underline text-xs">Add a row to start</button>
             </div>
          )}
       </div>
    </div>
  );
};