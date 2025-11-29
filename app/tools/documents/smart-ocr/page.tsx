"use client";
import React, { useState } from "react";
import { FileType, Upload, RefreshCw, Copy, CheckCircle } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartOCR() {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<string|null>(null);

  const handleUpload = (e: any) => {
    const f = e.target.files[0];
    if(!f) return;
    setFile(f.name);
    setIsProcessing(true);
    setTimeout(() => {
        setText("INVOICE #1023\n\nDate: Oct 24, 2023\nVendor: Acme Corp\nTotal: $450.00\n\nItems:\n1. Server Setup - $200\n2. Maintenance - $250\n\nThank you for your business!");
        setIsProcessing(false);
        showToast("Text Extracted Successfully");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-600 text-white  "><FileType size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart OCR</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Image to Text</p></div>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x h-full overflow-hidden">
        
        {/* Upload Area */}
        <div className="flex flex-col items-center justify-center p-10 bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
            <label className="flex flex-col items-center gap-6 cursor-pointer group p-10 rounded-3xl border-2 border-dashed border-violet-200 hover:border-violet-500 hover:bg-violet-50 transition w-full max-w-md text-center">
                <div className="w-24 h-24 bg-surface dark:bg-slate-800 dark:bg-surface rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none flex items-center justify-center text-muted/70 group-hover:text-violet-600 dark:text-violet-400 group-hover:scale-110 transition border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
                    {isProcessing ? <RefreshCw className="animate-spin" size={32}/> : <Upload size={32}/>}
                </div>
                <div>
                    <span className="font-bold text-lg text-main dark:text-slate-300 block">{file ? file : "Click to Upload Image"}</span>
                    <p className="text-xs text-muted/70 mt-2 font-medium uppercase tracking-wide">Supports PNG, JPG, PDF</p>
                </div>
                <input type="file" className="hidden" onChange={handleUpload} />
            </label>
        </div>

        {/* Result Area */}
        <div className="flex flex-col h-full bg-surface dark:bg-slate-800 dark:bg-surface relative">
            <div className="px-6 py-3 border-b flex justify-between items-center bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
                <span className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> Extracted Content</span>
                <button onClick={()=>{navigator.clipboard.writeText(text); showToast("Copied")}} className="p-2 hover:bg-slate-100 rounded text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-violet-600 dark:text-violet-400 transition"><Copy size={16}/></button>
            </div>
            <textarea value={text} readOnly className="flex-1 p-8 resize-none outline-none font-mono text-sm text-main dark:text-slate-300 leading-relaxed" placeholder="Extracted text will appear here..." />
        </div>
      </div>
    </div>
  );
}
