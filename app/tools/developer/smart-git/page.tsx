"use client";
import React, { useState } from "react";
import { Terminal, Search } from "lucide-react";
import Toast from "@/app/shared/Toast";

const CMDS = [
  { c: "git init", d: "Initialize repo" },
  { c: "git clone [url]", d: "Clone remote repo" },
  { c: "git status", d: "Check changes" },
  { c: "git add .", d: "Stage all files" },
  { c: "git commit -m 'msg'", d: "Commit changes" },
  { c: "git push origin main", d: "Push to remote" },
  { c: "git pull", d: "Pull updates" },
  { c: "git checkout -b [branch]", d: "New branch" },
  { c: "git merge [branch]", d: "Merge branch" },
  { c: "git log --oneline", d: "Compact history" }
];

export default function SmartGit() {
  const [q, setQ] = useState("");
  const filtered = CMDS.filter(c => c.c.includes(q) || c.d.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white"><Terminal size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Git</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Cheat Sheet</p></div>
        </div>
        <div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-muted/70"/><input value={q} onChange={e=>setQ(e.target.value)} className="pl-9 pr-3 py-2 border rounded-lg text-sm outline-none" placeholder="Search..."/></div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
        {filtered.map((c, i) => (
            <div key={i} className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border hover:border-red-300 transition group cursor-pointer" onClick={()=>{navigator.clipboard.writeText(c.c)}}>
                <code className="block font-mono font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-1 group-hover:text-red-600">{c.c}</code>
                <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">{c.d}</div>
            </div>
        ))}
      </div>
    </div>
  );
}
