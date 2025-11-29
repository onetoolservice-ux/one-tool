"use client";
import React, { useState } from "react";
import { Braces, ArrowRight } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartJSON2TS() {
  const [input, setInput] = useState('{"id": 1, "name": "Test"}');
  const [output, setOutput] = useState("");

  const convert = () => {
    try {
        const obj = JSON.parse(input);
        const keys = Object.keys(obj).map(k => `  ${k}: ${typeof obj[k]};`).join("\n");
        setOutput(`interface RootObject {\n${keys}\n}`);
    } catch { setOutput("Invalid JSON"); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-700 text-white"><Braces size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart JSON to TS</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Interface Gen</p></div>
        </div>
        <button aria-label="View Tool"<button onClick={convert} className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2"><ArrowRight size={14}/> Convert</button>
      </div>
      <div className="flex-1 grid grid-cols-2 divide-x">
        <textarea value={input} onChange={e=>setInput(e.target.value)} className="p-6 resize-none outline-none font-mono text-sm" />
        <textarea readOnly value={output} className="p-6 resize-none outline-none font-mono text-sm bg-background dark:bg-[#0f172a] dark:bg-[#020617] text-blue-700" />
      </div>
    </div>
  );
}
