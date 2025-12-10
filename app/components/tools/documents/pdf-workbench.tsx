"use client";
import React, { useState } from 'react';
import { Layers, Plus, X, FileText, ArrowRight, Move, Download } from 'lucide-react';

export const PdfWorkbench = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setMerging] = useState(false); // FIXED: Removed space

  const handleUpload = (e: any) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files as FileList)]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
       {/* HEADER */}
       <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600"><Layers size={20}/></div>
             <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">PDF Workbench</h2>
                <p className="text-xs text-slate-500">Merge, Split & Organize</p>
             </div>
          </div>
          <div className="flex gap-3">
             <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                <Plus size={14}/> Add PDFs
                <input type="file" multiple accept=".pdf" className="hidden" onChange={handleUpload}/>
             </label>
             <button disabled={files.length < 2} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <Download size={14}/> Merge Files
             </button>
          </div>
       </div>

       {/* WORKSPACE */}
       <div className="flex-1 p-8 overflow-y-auto">
          {files.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-100/50 dark:bg-slate-900/20 text-slate-400">
                <Layers size={48} className="mb-4 opacity-50"/>
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Workspace is Empty</h3>
                <p className="text-sm mt-1">Upload PDF files to start merging</p>
             </div>
          ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {files.map((f, i) => (
                   <div key={i} className="group relative aspect-[3/4] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                      <div className="absolute top-2 left-2 w-6 h-6 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">{i+1}</div>
                      <button onClick={()=>setFiles(files.filter((_,x)=>x!==i))} className="absolute top-2 right-2 p-1.5 bg-rose-100 text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                      
                      <FileText size={40} className="text-slate-300 mb-4"/>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 px-4 text-center truncate w-full">{f.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{(f.size/1024/1024).toFixed(2)} MB</p>
                   </div>
                ))}
                
                {/* Add More Card */}
                <label className="aspect-[3/4] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-slate-400">
                   <Plus size={32} className="mb-2"/>
                   <span className="text-xs font-bold">Add PDF</span>
                   <input type="file" multiple accept=".pdf" className="hidden" onChange={handleUpload}/>
                </label>
             </div>
          )}
       </div>
    </div>
  );
};