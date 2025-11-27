"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Command } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  const filtered = ALL_TOOLS.filter(t => 
    t.name.toLowerCase().includes(query.toLowerCase()) || 
    t.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5); // Limit to 5 results for speed

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setOpen(false)} />
      
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center border-b border-slate-100 px-4 py-4">
          <Search className="text-slate-400 mr-3" size={20} />
          <input 
            autoFocus
            className="flex-1 bg-transparent outline-none text-lg text-slate-700 placeholder:text-slate-400"
            placeholder="What do you need to do?"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
            <span className="text-[10px]">ESC</span>
          </div>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleSelect(tool.href)}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left"
              >
                <div className={`w-10 h-10 rounded-lg ${tool.bg} ${tool.color} flex items-center justify-center`}>
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{tool.name}</div>
                  <div className="text-xs text-slate-400 group-hover:text-slate-500">{tool.category}</div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              No tools found. Try "PDF" or "Budget".
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
          <span>{ALL_TOOLS.length} Tools Available</span>
          <span>Use arrow keys to navigate</span>
        </div>
      </div>
    </div>
  );
}
