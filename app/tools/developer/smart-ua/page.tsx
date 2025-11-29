"use client";
import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartUA() {
  const [ua, setUa] = useState("");
  useEffect(() => setUa(navigator.userAgent), []);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-violet-500 text-white"><Globe size={22} /></div>
        <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart UserAgent</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Browser ID</p></div>
      </div>
      <div className="p-8 max-w-3xl mx-auto w-full">
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none">
            <label className="text-xs font-bold text-muted/70 uppercase mb-2 block">Your User Agent</label>
            <textarea value={ua} onChange={e=>setUa(e.target.value)} className="w-full h-32 p-4 bg-background dark:bg-[#0f172a] dark:bg-[#020617] rounded-xl font-mono text-sm text-main dark:text-slate-300 resize-none outline-none border focus:border-violet-300" />
        </div>
      </div>
    </div>
  );
}
