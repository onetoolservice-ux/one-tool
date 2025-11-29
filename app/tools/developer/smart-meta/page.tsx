"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartMeta() {
  const [title, setTitle] = useState("My Awesome Page");
  const [desc, setDesc] = useState("This is a description of the page.");

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-indigo-500 text-white"><Search size={22} /></div>
        <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Meta</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">SEO Preview</p></div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="p-6 bg-surface dark:bg-slate-800 dark:bg-surface border-r space-y-4">
            <div className="space-y-1"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border p-3 rounded-lg" /></div>
            <div className="space-y-1"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Description</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} className="w-full border p-3 rounded-lg h-24 resize-none" /></div>
        </div>
        <div className="p-10 bg-slate-100 flex flex-col items-center">
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-lg shadow-lg shadow-slate-200/50 dark:shadow-none w-full max-w-md border">
                <div className="text-blue-700 text-lg hover:underline cursor-pointer truncate">{title}</div>
                <div className="text-green-700 text-xs mb-1">example.com › page</div>
                <div className="text-muted dark:text-muted/70 dark:text-muted/70 text-sm">{desc}</div>
            </div>
        </div>
      </div>
    </div>
  );
}
