"use client";
import React, { useState } from "react";
import { GitBranch, Search, Copy } from "lucide-react";
import { showToast } from "@/app/shared/Toast";

const CMDS = [
  { c: "git init", d: "Initialize a new repository" },
  { c: "git clone [url]", d: "Clone a remote repository" },
  { c: "git status", d: "Show modified files in working directory" },
  { c: "git add .", d: "Stage all changes for commit" },
  { c: "git commit -m 'msg'", d: "Commit staged changes" },
  { c: "git push origin main", d: "Push commits to remote" },
  { c: "git pull", d: "Fetch and merge remote changes" },
  { c: "git checkout -b [branch]", d: "Create and switch to a new branch" },
  { c: "git merge [branch]", d: "Merge a branch into current one" },
  { c: "git log --oneline", d: "Show condensed commit history" },
  { c: "git stash", d: "Temporarily save changes" },
  { c: "git stash pop", d: "Restore stashed changes" },
  { c: "git reset --hard", d: "Discard all local changes" },
  { c: "git remote -v", d: "List remote repositories" }
];

export default function SmartGit() {
  const [q, setQ] = useState("");
  const filtered = CMDS.filter(c => c.c.includes(q) || c.d.toLowerCase().includes(q.toLowerCase()));

  const copy = (txt: string) => {
      navigator.clipboard.writeText(txt);
      showToast("Command Copied!", "success");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background">
      <div className="bg-surface/80 backdrop-blur-md border-b border-line px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-600 text-white shadow-sm"><GitBranch size={22} /></div>
            <div><h1 className="text-xl font-extrabold text-main">Smart Git</h1><p className="text-xs font-bold text-muted uppercase">Cheat Sheet</p></div>
        </div>
        <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
            <input 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" 
                placeholder="Search commands..."
            />
        </div>
      </div>
      
      <div className="p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {filtered.map((c, i) => (
                <div key={i} onClick={()=>copy(c.c)} className="group bg-surface p-5 rounded-2xl border border-line hover:border-orange-400 hover:shadow-md transition-all cursor-pointer relative">
                    <div className="font-mono font-bold text-orange-600 mb-2 text-sm bg-orange-50 dark:bg-orange-900/20 w-fit px-2 py-1 rounded">{c.c}</div>
                    <div className="text-sm text-muted font-medium">{c.d}</div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted"><Copy size={16}/></div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
