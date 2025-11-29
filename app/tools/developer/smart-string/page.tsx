"use client";
import React, { useState } from "react";
import { Type, Scissors, Link as LinkIcon, CaseUpper } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartString() {
  const [text, setText] = useState("Hello World! This is a test.");
  
  const apply = (fn: (s: string) => string, msg: string) => {
    setText(fn(text));
    showToast(msg);
  };

  const toSlug = (s: string) => s.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
  const toCamel = (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-pink-600 text-white"><Type size={22} /></div>
        <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart String</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Text Toolkit</p></div>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x overflow-hidden">
        <textarea value={text} onChange={e=>setText(e.target.value)} className="col-span-2 p-6 resize-none outline-none text-lg text-main dark:text-slate-300 font-mono" />
        <div className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-6 space-y-6 overflow-auto">
            
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-3 rounded-xl border shadow-lg shadow-slate-200/50 dark:shadow-none"><div className="text-xl font-bold text-main dark:text-slate-100 dark:text-slate-200">{text.length}</div><div className="text-xs uppercase text-muted/70 font-bold">Chars</div></div>
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-3 rounded-xl border shadow-lg shadow-slate-200/50 dark:shadow-none"><div className="text-xl font-bold text-main dark:text-slate-100 dark:text-slate-200">{text.split(/\s+/).filter(Boolean).length}</div><div className="text-xs uppercase text-muted/70 font-bold">Words</div></div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted/70 uppercase">Case</h3>
                <button onClick={() => apply(s => s.toUpperCase(), "UPPERCASE")} className="w-full py-2 bg-surface dark:bg-slate-800 dark:bg-surface border rounded text-xs font-bold hover:bg-pink-50">UPPERCASE</button>
                <button onClick={() => apply(s => s.toLowerCase(), "lowercase")} className="w-full py-2 bg-surface dark:bg-slate-800 dark:bg-surface border rounded text-xs font-bold hover:bg-pink-50">lowercase</button>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted/70 uppercase">Format</h3>
                <button onClick={() => apply(toSlug, "Slugified")} className="w-full py-2 bg-surface dark:bg-slate-800 dark:bg-surface border rounded text-xs font-bold hover:bg-pink-50 flex items-center justify-center gap-2"><LinkIcon size={12}/> Slugify</button>
                <button onClick={() => apply(toCamel, "Camel Cased")} className="w-full py-2 bg-surface dark:bg-slate-800 dark:bg-surface border rounded text-xs font-bold hover:bg-pink-50 flex items-center justify-center gap-2"><CaseUpper size={12}/> camelCase</button>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted/70 uppercase">Clean</h3>
                <button onClick={() => apply(s => s.trim(), "Trimmed")} className="w-full py-2 bg-surface dark:bg-slate-800 dark:bg-surface border rounded text-xs font-bold hover:bg-pink-50 flex items-center justify-center gap-2"><Scissors size={12}/> Trim</button>
                <button onClick={() => apply(s => s.replace(/\s+/g, ' '), "Spaces Normalized")} className="w-full py-2 bg-surface dark:bg-slate-800 dark:bg-surface border rounded text-xs font-bold hover:bg-pink-50">Remove Extra Spaces</button>
            </div>
        </div>
      </div>
    </div>
  );
}
