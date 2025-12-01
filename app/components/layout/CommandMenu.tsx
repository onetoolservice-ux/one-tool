"use client";

import { Search, Command } from "lucide-react";
import { useUI } from "@/app/lib/ui-context";
import { useEffect, useRef } from "react";

export default function CommandMenu() {
  const { searchQuery, setSearchQuery } = useUI();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on slash key
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
      <div className="relative flex items-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500">
        <div className="pl-5 text-slate-400 group-hover:text-indigo-500 transition-colors">
           <Search size={20} />
        </div>
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search for tools (e.g. 'PDF', 'Loan', 'Format')..." 
          className="w-full h-14 px-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="pr-4 flex items-center gap-2">
           <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-[10px]">CTRL</span> K
           </div>
        </div>
      </div>
    </div>
  );
}
