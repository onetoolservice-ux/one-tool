"use client";
import React, { useState } from "react";
import { Scissors, Upload, FileText, CheckCircle, ArrowRight } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartPDFSplit() {
  const [file, setFile] = useState<string | null>(null);
  const [range, setRange] = useState("1-5");

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white  "><Scissors size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart PDF Split</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Page Extractor</p></div>
        </div>
        <button onClick={()=>{showToast("Pages Extracted")}} disabled={!file} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition shadow-lg shadow-slate-200/50 dark:shadow-none disabled:opacity-50"><ArrowRight size={14}/> Process</button>
      </div>

      <div className="flex-1 p-8 overflow-auto flex flex-col items-center">
        {!file ? (
            <label className="w-full max-w-2xl border-2 border-dashed border-line rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition group bg-surface dark:bg-slate-800 dark:bg-surface">
                <div className="p-5 bg-red-50 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none mb-4 group-hover:scale-110 transition"><Upload size={32} className="text-red-500"/></div>
                <h3 className="text-xl font-bold text-main dark:text-slate-300">Select PDF to Split</h3>
                <input type="file" accept=".pdf" className="hidden" onChange={(e:any)=>setFile(e.target.files[0]?.name)} />
            </label>
        ) : (
            <div className="w-full max-w-2xl space-y-6">
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl"><FileText size={32}/></div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200">{file}</h3>
                        <p className="text-muted dark:text-muted dark:text-muted dark:text-muted text-sm">12 Pages • 2.4 MB</p>
                    </div>
                    <button onClick={()=>setFile(null)} className="text-xs font-bold text-red-600 hover:underline">Change</button>
                </div>

                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-8 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none space-y-4">
                    <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Pages to Extract</label>
                    <input value={range} onChange={e=>setRange(e.target.value)} className="w-full text-4xl font-bold text-main dark:text-slate-100 dark:text-slate-200 placeholder-slate-300 outline-none border-b-2 border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 focus:border-red-500 transition py-2" placeholder="e.g. 1-5" />
                    <div className="flex gap-2 pt-2">
                        {['All Pages', 'Odd Only', 'Even Only', 'First 10'].map(mode => (
                            <button key={mode} className="px-3 py-1.5 bg-background dark:bg-[#0f172a] dark:bg-[#020617] border rounded-lg text-xs font-bold text-muted dark:text-muted/70 dark:text-muted/70 hover:bg-slate-100 transition">{mode}</button>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
