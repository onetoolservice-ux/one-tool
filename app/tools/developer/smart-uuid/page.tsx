"use client";
import React, { useState, useEffect } from "react";
import { Hash, RefreshCw, Copy, CheckSquare } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartUUID() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<'std' | 'no-hyphen' | 'urn'>('std');

  const generate = () => {
    const arr = Array.from({length: count}, () => {
        let u = crypto.randomUUID();
        if(format === 'no-hyphen') u = u.replace(/-/g, '');
        if(format === 'urn') u = 'urn:uuid:' + u;
        return u;
    });
    setUuids(arr);
    showToast("Generated");
  };

  useEffect(() => generate(), [count, format]);

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    showToast("Copied All");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-700 text-white"><Hash size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart UUID</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Generator</p></div>
        </div>
        <div className="flex items-center gap-3">
            <select value={format} onChange={e=>setFormat(e.target.value as any)} className="text-xs font-bold border rounded p-2 bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
                <option value="std">Standard</option>
                <option value="no-hyphen">No Hyphens</option>
                <option value="urn">URN</option>
            </select>
            <button aria-label="Copy to Clipboard"<button onClick={copyAll} className="px-4 py-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-main dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617]"><Copy size={14}/> Copy All</button>
            <button aria-label="Reset/Refresh Data"<button onClick={generate} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2"><RefreshCw size={14}/> Regen</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-2">
            {uuids.map(id => (
                <div key={id} onClick={() => {navigator.clipboard.writeText(id); showToast("Copied");}} className="bg-surface dark:bg-slate-800 dark:bg-surface p-3 border rounded font-mono text-muted dark:text-muted/70 dark:text-muted/70 hover:border-blue-500 hover:text-blue-600 dark:text-blue-400 cursor-pointer flex justify-between group">
                    {id} <Copy size={14} className="opacity-0 group-hover:opacity-100"/>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
