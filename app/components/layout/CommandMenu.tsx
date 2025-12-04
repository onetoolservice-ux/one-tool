"use client";

import { Search, Mic, Loader2 } from "lucide-react";
import { useUI } from "@/app/lib/ui-context";
import { useEffect, useRef } from "react";
import { useVoiceSearch } from "@/app/hooks/useVoiceSearch";

export default function CommandMenu() {
  const { searchQuery, setSearchQuery } = useUI();
  const inputRef = useRef(null);
  const { isListening, transcript, startListening } = useVoiceSearch();

  // Sync voice result to search
  useEffect(() => {
    if (transcript) setSearchQuery(transcript);
  }, [transcript, setSearchQuery]);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
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
          placeholder={isListening ? "Listening..." : "Search tools or say 'Open Budget'..."}
          className="w-full h-12 md:h-14 px-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-base md:text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="pr-4 flex items-center gap-2">
           <button 
             onClick={startListening}
             className={`p-2 rounded-full transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
             title="Voice Search"
           >
             {isListening ? <Loader2 size={18} className="animate-spin"/> : <Mic size={18}/>}
           </button>
           
           <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-[10px]">CTRL</span> K
           </div>
        </div>
      </div>
    </div>
  );
}
