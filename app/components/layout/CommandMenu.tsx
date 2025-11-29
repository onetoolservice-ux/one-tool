"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, ArrowRight } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Toggle on Cmd+K
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

  const filtered = ALL_TOOLS.filter(t => 
    t.name.toLowerCase().includes(query.toLowerCase()) || 
    t.desc.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5); // Limit results

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[20vh] animate-in fade-in duration-200" onClick={() => setOpen(false)}>
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-line dark:border-slate-700 dark:border-slate-800 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Input */}
        <div className="flex items-center px-4 border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
          <Search className="w-5 h-5 text-muted/70" />
          <input 
            className="w-full p-4 bg-transparent dark:text-white outline-none text-main dark:text-slate-300 placeholder:text-muted/70 font-medium"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <div className="flex gap-1">
            <span className="text-xs font-bold bg-slate-100 text-muted dark:text-muted dark:text-muted dark:text-muted px-1.5 py-0.5 rounded border">ESC</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted/70 text-sm">No tools found.</div>
          ) : (
            <>
              <div className="text-xs font-bold text-muted/70 uppercase px-3 py-2">Tools</div>
              {filtered.map(tool => (
                <button 
                  key={tool.id}
                  onClick={() => { setOpen(false); router.push(tool.href); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-background dark:bg-surface dark:bg-slate-950 transition group text-left"
                >
                  <div className={`p-2 rounded-lg ${tool.bg} ${tool.color}`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-main dark:text-slate-300 text-sm group-hover:text-blue-600 dark:text-blue-400 transition-colors">{tool.name}</div>
                    <div className="text-xs text-muted/70">{tool.category}</div>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-background dark:bg-surface dark:bg-slate-950 px-4 py-2 border-t border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 flex justify-between items-center text-xs text-muted/70 font-medium uppercase tracking-wide">
            <span>One Tool Enterprise</span>
            <div className="flex gap-2">
                <span>Select <span className="bg-surface dark:bg-slate-800 dark:bg-surface border rounded px-1">↵</span></span>
                <span>Navigate <span className="bg-surface dark:bg-slate-800 dark:bg-surface border rounded px-1">↑↓</span></span>
            </div>
        </div>
      </div>
    </div>
  );
}
