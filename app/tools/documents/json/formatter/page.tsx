"use client";
import React, { useState } from "react";
import { Braces, Minimize, CheckCircle, Copy, AlertCircle } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartJSON() {
  const [input, setInput] = useState('{"id":1,"name":"Test","active":true}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const process = (type: 'format' | 'minify') => {
    try {
        const obj = JSON.parse(input);
        setOutput(type === 'format' ? JSON.stringify(obj, null, 2) : JSON.stringify(obj));
        setError("");
        showToast(type === 'format' ? "Formatted" : "Minified");
    } catch { setError("Invalid JSON Syntax"); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-700 text-white  "><Braces size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart JSON</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Validator & Formatter</p></div>
        </div>
        <div className="flex gap-2">
            <button onClick={()=>process('minify')} className="flex items-center gap-2 px-4 py-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-muted dark:text-muted/70 dark:text-muted/70 rounded-lg text-xs font-bold hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617] transition"><Minimize size={14}/> Minify</button>
            <button onClick={()=>process('format')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-surface transition shadow-lg shadow-slate-200/50 dark:shadow-none"><CheckCircle size={14}/> Format</button>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-2 divide-x h-full overflow-hidden">
        <div className="flex flex-col h-full bg-surface dark:bg-slate-800 dark:bg-surface">
            <div className="px-4 py-2 border-b bg-background dark:bg-[#0f172a] dark:bg-[#020617] text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Input</div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} className="flex-1 p-6 resize-none outline-none font-mono text-sm text-main dark:text-slate-300" placeholder="Paste JSON here..." spellCheck={false} />
            {error && <div className="p-3 bg-rose-50 text-rose-600 dark:text-rose-400 text-xs font-bold border-t border-rose-100 flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
        </div>
        
        <div className="flex flex-col h-full bg-[#1e293b] relative">
            <div className="px-4 py-2 border-b border-slate-700 bg-[#0f172a] flex justify-between items-center">
                <span className="text-xs font-bold text-muted/70 uppercase">Output</span>
                <button onClick={()=>{navigator.clipboard.writeText(output); showToast("Copied")}} className="text-muted/70 hover:text-white transition"><Copy size={14}/></button>
            </div>
            <textarea readOnly value={output} className="flex-1 p-6 resize-none outline-none font-mono text-sm bg-transparent dark:text-white text-emerald-400" placeholder="Result..." />
        </div>
      </div>
    </div>
  );
}
