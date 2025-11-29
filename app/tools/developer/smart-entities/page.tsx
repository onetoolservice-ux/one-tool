"use client";
import React, { useState } from "react";
import { Code2, ArrowRightLeft } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartEntities() {
  const [input, setInput] = useState("<div class='test'>&copy;</div>");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<'encode'|'decode'>('encode');

  React.useEffect(() => {
    if(mode === 'encode') {
        setOutput(input.replace(/[\u00A0-\u9999<>&]/g, i => '&#'+i.charCodeAt(0)+';'));
    } else {
        const txt = document.createElement("textarea");
        txt.innerHTML = input;
        setOutput(txt.value);
    }
  }, [input, mode]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-600 text-white"><Code2 size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Entities</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">HTML Converter</p></div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={()=>setMode('encode')} className={`px-4 py-1.5 text-xs font-bold rounded ${mode==='encode'?'bg-surface dark:bg-slate-800 dark:bg-surface shadow text-teal-600 dark:text-teal-400':'text-muted dark:text-muted dark:text-muted dark:text-muted'}`}>Encode</button>
            <button onClick={()=>setMode('decode')} className={`px-4 py-1.5 text-xs font-bold rounded ${mode==='decode'?'bg-surface dark:bg-slate-800 dark:bg-surface shadow text-teal-600 dark:text-teal-400':'text-muted dark:text-muted dark:text-muted dark:text-muted'}`}>Decode</button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 divide-x">
        <textarea value={input} onChange={e=>setInput(e.target.value)} className="p-6 resize-none outline-none font-mono text-sm" placeholder="Input..." />
        <textarea readOnly value={output} className="p-6 resize-none outline-none font-mono text-sm bg-background dark:bg-[#0f172a] dark:bg-[#020617] text-main dark:text-slate-300" placeholder="Output..." />
      </div>
    </div>
  );
}
