"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Share2, Star, Check, Search, Command, X } from "lucide-react";
import { ThemeToggle } from "@/app/components/layout/theme-provider";
import { LiveClock } from "@/app/components/layout/live-clock";

interface ToolShellProps {
  tool: any;
  children: React.ReactNode;
}

export const ToolShell = ({ tool, children }: ToolShellProps) => {
  const router = useRouter();
  
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // SEARCH STATE
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const backLink = `/?cat=${tool.category}`;

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    setIsFav(favs.includes(tool.id));
  }, [tool.id]);

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    const newFavs = favs.includes(tool.id) ? favs.filter((id: string) => id !== tool.id) : [...favs, tool.id];
    localStorage.setItem("onetool-favorites", JSON.stringify(newFavs));
    setIsFav(!isFav);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
       if (searchTerm) router.push(`/?q=${searchTerm}`);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120] selection:bg-teal-100 selection:text-teal-900 flex flex-col">
      
      {/* HEADER */}
      <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="w-full px-4 h-14 flex items-center justify-between gap-4">
          
          {/* LEFT: BREADCRUMBS ONLY (No Arrow) */}
          <div className="flex items-center gap-2 text-sm">
             <Link href="/" className="p-1.5 -ml-1.5 text-slate-400 hover:text-teal-600 transition-colors rounded-md flex items-center gap-1">
               <Home size={16} /> 
             </Link>
             <span className="text-slate-300">/</span>
             <Link href={backLink} className="font-medium text-slate-500 hover:text-teal-600 transition-colors">
               {tool.category}
             </Link>
             <span className="text-slate-300">/</span>
             <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px] md:max-w-none">{tool.name}</span>
          </div>

          {/* CENTER: SEARCH BAR */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
             <div className="relative group w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 w-3.5 h-3.5" />
                <input 
                  ref={searchRef}
                  type="text" 
                  placeholder="Jump to tool..." 
                  className="w-full h-8 bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-teal-500 rounded-lg pl-9 pr-12 text-xs font-medium outline-none transition-all dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                   {searchTerm ? (
                      <button onClick={() => setSearchTerm('')}><X size={12} className="text-slate-400 hover:text-slate-600"/></button>
                   ) : (
                      <div className="flex items-center gap-0.5 opacity-50 pointer-events-none">
                         <Command size={10} className="text-slate-500"/>
                         <span className="text-[9px] font-mono text-slate-500">K</span>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* RIGHT: CLOCK & ACTIONS */}
          <div className="flex items-center gap-2 shrink-0">
             <div className="hidden lg:block scale-90 origin-right">
                <LiveClock />
             </div>
             <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden lg:block"></div>
             
             <ThemeToggle />
             
             <button onClick={handleShare} className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 rounded-md hover:bg-slate-200 transition-colors">
                {copied ? <Check size={14} className="text-[#638c80]"/> : <Share2 size={14} />}
                {copied ? "Copied" : "Share"}
             </button>
             <button onClick={toggleFav} className={`p-1.5 rounded-md transition-colors ${isFav ? 'text-amber-400' : 'text-slate-400 hover:text-teal-600'}`}>
                <Star size={18} fill={isFav ? "currentColor" : "none"} />
             </button>
          </div>
        </div>
      </div>

      {/* 2. TOOL WORKSPACE */}
      <main className="flex-1 w-full px-4 pt-4 pb-0 h-[calc(100vh-56px)] overflow-hidden">
        {children}
      </main>

    </div>
  );
};
