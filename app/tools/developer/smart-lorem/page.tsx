"use client";
import React, { useState, useEffect } from "react";
import { FileText, Copy, Code } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartLorem() {
  const [paras, setParas] = useState(3);
  const [type, setType] = useState<"text" | "html" | "markdown">("text");
  const [text, setText] = useState("");
  
  useEffect(() => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    let res = Array(paras).fill(lorem);
    
    if(type === "html") res = res.map(p => `<p>${p}</p>`);
    if(type === "markdown") res = res.map(p => `### Section\n${p}`);
    
    setText(res.join("\n\n"));
  }, [paras, type]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background dark:bg-[#0f172a] dark:bg-[#020617]0 text-white"><FileText size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Lorem</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Text Generator</p></div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
                {['text', 'html', 'markdown'].map(t => (
                    <button key={t} onClick={()=>setType(t as any)} className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded ${type===t ? 'bg-surface dark:bg-slate-800 dark:bg-surface shadow text-main dark:text-slate-100 dark:text-slate-200' : 'text-muted dark:text-muted dark:text-muted dark:text-muted'}`}>{t}</button>
                ))}
            </div>
            <input type="range" min="1" max="20" value={paras} onChange={e=>setParas(Number(e.target.value))} className="w-24 accent-slate-600" />
            <span className="text-xs font-bold w-4">{paras}</span>
            <button onClick={() => {navigator.clipboard.writeText(text); showToast("Copied");}} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2"><Copy size={14}/> Copy</button>
        </div>
      </div>
      <textarea value={text} readOnly className="flex-1 p-8 resize-none outline-none text-muted dark:text-muted/70 dark:text-muted/70 leading-relaxed font-mono" />
    </div>
  );
}
