"use client";
import React, { useState } from "react";
import { Minimize, ArrowRight } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartMin() {
  const [input, setInput] = useState(".class { color: red; }");
  const [output, setOutput] = useState("");

  const minify = () => {
    setOutput(input.replace(/\s+/g, ' ').replace(/{\s/g, '{').replace(/\s}/g, '}').trim());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600 text-white"><Minimize size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Minify</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Code Shrinker</p></div>
        </div>
        <button aria-label="View Tool"<button onClick={minify} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"><ArrowRight size={14}/> Minify</button>
      </div>
      <div className="flex-1 grid grid-cols-2 divide-x">
        <textarea value={input} onChange={e=>setInput(e.target.value)} className="p-6 resize-none outline-none font-mono text-sm" />
        <textarea readOnly value={output} className="p-6 resize-none outline-none font-mono text-sm bg-background dark:bg-[#0f172a] dark:bg-[#020617] text-main dark:text-slate-300" />
      </div>
    </div>
  );
}
