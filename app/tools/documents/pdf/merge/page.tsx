"use client";
import React, { useState } from "react";
import { Layers, Upload, X, FileText, ArrowDown, Move } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartPDFMerge() {
  const [files, setFiles] = useState<string[]>([]);

  const handleUpload = (e: any) => {
    const newFiles = Array.from(e.target.files).map((f: any) => f.name);
    setFiles([...files, ...newFiles]);
    showToast(`${newFiles.length} PDFs Added`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white  "><Layers size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart PDF Merge</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Combiner</p></div>
        </div>
        <button onClick={()=>{showToast("Merged PDF Downloaded")}} disabled={files.length<2} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition shadow-lg shadow-slate-200/50 dark:shadow-none disabled:opacity-50"><ArrowDown size={14}/> Merge & Download</button>
      </div>
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
            <label className="border-2 border-dashed border-line rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition group bg-surface dark:bg-slate-800 dark:bg-surface">
                <div className="p-4 bg-rose-50 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none mb-4 group-hover:scale-110 transition"><Upload size={24} className="text-rose-500"/></div>
                <h3 className="font-bold text-main dark:text-slate-300">Drop PDFs here</h3>
                <p className="text-xs text-muted/70 mt-1">or click to browse</p>
                <input type="file" multiple accept=".pdf" className="hidden" onChange={handleUpload} />
            </label>

            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="text-xs font-bold text-muted/70 uppercase mb-2 ml-1">Sequence ({files.length})</div>
                    {files.map((f, i) => (
                        <div key={i} className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border flex items-center justify-between shadow-lg shadow-slate-200/50 dark:shadow-none group hover:border-rose-200 transition">
                            <div className="flex items-center gap-4">
                                <div className="text-slate-300 cursor-grab hover:text-muted dark:text-muted/70 dark:text-muted/70"><Move size={16}/></div>
                                <div className="w-8 h-10 bg-rose-50 border border-rose-100 rounded flex items-center justify-center text-rose-500"><FileText size={16}/></div>
                                <span className="font-medium text-main dark:text-slate-300 text-sm">{f}</span>
                            </div>
                            <button onClick={()=>setFiles(files.filter((_,x)=>x!==i))} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"><X size={16}/></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
