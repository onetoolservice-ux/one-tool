"use client";
import React, { useState, useEffect } from "react";
import { Link, Copy } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartURL() {
  const [url, setUrl] = useState("https://example.com/search?q=hello&lang=en");
  const [params, setParams] = useState<[string,string][]>([]);
  const [host, setHost] = useState("");
  const [path, setPath] = useState("");

  useEffect(() => {
    try {
        const u = new URL(url);
        setHost(u.hostname);
        setPath(u.pathname);
        setParams(Array.from(u.searchParams.entries()));
    } catch { setHost("Invalid URL"); setPath(""); setParams([]); }
  }, [url]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-blue-500 text-white"><Link size={22} /></div>
        <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart URL</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Parser & Builder</p></div>
      </div>
      <div className="p-6 space-y-6 overflow-auto">
        <input value={url} onChange={e=>setUrl(e.target.value)} className="w-full p-4 border rounded-xl font-mono text-sm focus:ring-2 ring-blue-200 outline-none" />
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border">
                <label className="text-xs font-bold text-muted/70 uppercase">Hostname</label>
                <div className="font-mono font-bold text-main dark:text-slate-300">{host}</div>
            </div>
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border">
                <label className="text-xs font-bold text-muted/70 uppercase">Path</label>
                <div className="font-mono font-bold text-main dark:text-slate-300">{path}</div>
            </div>
        </div>
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl border overflow-hidden">
            <div className="px-4 py-2 bg-background dark:bg-[#0f172a] dark:bg-[#020617] border-b text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Query Parameters</div>
            {params.map(([k,v], i) => (
                <div key={i} className="flex border-b last:border-0 p-3 items-center">
                    <input className="w-1/3 font-bold text-sm outline-none text-blue-600 dark:text-blue-400" value={k} readOnly />
                    <input className="flex-1 text-sm outline-none text-muted dark:text-muted/70 dark:text-muted/70" value={v} readOnly />
                </div>
            ))}
            {params.length===0 && <div className="p-4 text-center text-muted/70 text-sm italic">No parameters</div>}
        </div>
      </div>
    </div>
  );
}
