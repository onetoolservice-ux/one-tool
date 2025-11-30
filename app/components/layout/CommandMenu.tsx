"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";

export default function CommandMenu() {
  const { searchQuery, setSearchQuery } = useUI();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filtered = ALL_TOOLS.filter((tool) =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3 gap-3">
          <Search className="text-slate-400" size={20} />
          <input
            className="flex-1 bg-transparent text-lg font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button onClick={() => setOpen(false)} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">ESC</button>
        </div>
        <div className="p-2">
          {filtered.map((tool) => (
            <button
              key={tool.id}
              onClick={() => { router.push(tool.href); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left group"
            >
              <div className={`p-2 rounded-md ${tool.bg} ${tool.color}`}>
                {/* FIX: Rendering as Component */}
                <tool.icon size={18} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{tool.title}</div>
                <div className="text-xs text-slate-500">{tool.category}</div>
              </div>
              <ArrowRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
