"use client";
import React, { useState } from "react";
import { RefreshCw, Upload, Download, ArrowRight, FileImage } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartConvert() {
  const [file, setFile] = useState<string|null>(null);
  const [format, setFormat] = useState("png");

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-white  "><RefreshCw size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Convert</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Format Switcher</p></div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto flex flex-col items-center justify-center">
        {!file ? (
             <label className="w-full max-w-2xl border-2 border-dashed border-line rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition group bg-surface dark:bg-slate-800 dark:bg-surface">
                <div className="p-5 bg-amber-50 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none mb-4 group-hover:scale-110 transition"><Upload size={32} className="text-amber-500"/></div>
                <h3 className="text-xl font-bold text-main dark:text-slate-300">Upload Image</h3>
                <input type="file" className="hidden" onChange={(e:any)=>setFile(e.target.files[0]?.name)} />
            </label>
        ) : (
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-10 rounded-3xl border shadow-lg w-full max-w-3xl flex items-center gap-8">
                <div className="flex-1 text-center p-6 bg-background dark:bg-[#0f172a] dark:bg-[#020617] rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
                    <FileImage size={48} className="mx-auto text-slate-300 mb-3"/>
                    <div className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200 truncate">{file}</div>
                    <div className="text-xs font-bold text-muted/70 uppercase mt-1">Original Format</div>
                </div>
                
                <div className="flex flex-col items-center gap-2 text-slate-300">
                    <ArrowRight size={32}/>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Target Format</label>
                    <select value={format} onChange={e=>setFormat(e.target.value)} className="w-full p-4 border rounded-xl font-bold text-main dark:text-slate-300 outline-none focus:border-amber-500 bg-surface dark:bg-slate-800 dark:bg-surface shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpg">JPG (Small Size)</option>
                        <option value="webp">WEBP (Modern)</option>
                        <option value="avif">AVIF (Ultra)</option>
                    </select>
                    <button onClick={()=>{showToast("Converted Successfully")}} className="w-full p-4 bg-amber-500 text-white rounded-xl   hover:bg-amber-600 transition font-bold flex items-center justify-center gap-2">
                        <Download size={18}/> Convert Now
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
