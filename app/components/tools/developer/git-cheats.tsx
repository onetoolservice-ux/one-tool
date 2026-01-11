"use client";
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input, CopyButton } from '@/app/components/shared';

export const GitCheats = () => {
  const [search, setSearch] = useState("");
  
  const commands = [
    { cmd: "git init", desc: "Initialize a new repository" },
    { cmd: "git clone [url]", desc: "Clone a repository" },
    { cmd: "git status", desc: "Check file status" },
    { cmd: "git add .", desc: "Stage all changes" },
    { cmd: "git commit -m 'msg'", desc: "Commit changes" },
    { cmd: "git push origin main", desc: "Push to remote" },
    { cmd: "git pull", desc: "Pull latest changes" },
    { cmd: "git checkout -b [branch]", desc: "Create new branch" },
    { cmd: "git merge [branch]", desc: "Merge branch into current" },
    { cmd: "git stash", desc: "Temporarily save changes" },
    { cmd: "git log --oneline", desc: "View commit history compactly" },
    { cmd: "git reset --soft HEAD~1", desc: "Undo last commit (keep files)" },
  ];

  const filtered = commands.filter(c => c.cmd.includes(search) || c.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto h-[600px] flex flex-col">
       <div className="mb-6">
          <Input
            type="text"
            placeholder="Search commands (e.g. 'undo', 'branch')..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search size={20} />}
            className="text-base"
          />
       </div>
       
       <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filtered.map((c, i) => (
             <div key={i} className="group flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                <div>
                   <code className="text-indigo-600 dark:text-indigo-400 font-bold font-mono text-sm bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">{c.cmd}</code>
                   <p className="text-slate-500 text-xs mt-1 font-medium">{c.desc}</p>
                </div>
                <CopyButton
                  text={c.cmd}
                  className="opacity-0 group-hover:opacity-100"
                  variant="ghost"
                  size="sm"
                />
             </div>
          ))}
       </div>
    </div>
  );
};
