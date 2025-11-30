"use client";
import React, { useState } from "react";
import { Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function CaseConverter() {
  const [text, setText] = useState("");

  const transforms = [
    { name: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
    { name: "lowercase", fn: (s: string) => s.toLowerCase() },
    { name: "Title Case", fn: (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) },
    { name: "camelCase", fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '') },
    { name: "snake_case", fn: (s: string) => s && s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') },
  ];

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    showToast("Copied!", "success");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">Case Converter</h1>
        <p className="text-muted">Transform text case instantly.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
           <label className="text-xs font-bold text-muted uppercase">Input</label>
           <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-64 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Type or paste your text here..." autoFocus />
        </div>

        <div className="space-y-3">
           <label className="text-xs font-bold text-muted uppercase">Outputs (Click to Copy)</label>
           <div className="space-y-3 h-64 overflow-y-auto pr-2">
             {transforms.map((t) => (
               <button key={t.name} onClick={() => copy(t.fn(text || "Example Text"))} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center hover:border-indigo-500 group transition-all">
                 <div className="text-left">
                    <div className="text-[10px] font-bold text-muted uppercase mb-0.5">{t.name}</div>
                    <div className="text-sm font-medium text-main dark:text-slate-300 truncate w-64">{t.fn(text || "Example Text")}</div>
                 </div>
                 <Copy size={16} className="text-muted group-hover:text-indigo-500" />
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
