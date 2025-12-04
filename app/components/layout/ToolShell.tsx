"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, LayoutGrid, Star } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function ToolShell({ title, description, category, toolId, icon, children, actions }: any) {
  const [isFav, setIsFav] = useState(false);
  useEffect(() => {
    if (!toolId) return;
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    setIsFav(favs.includes(toolId));
  }, [toolId]);

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    const newFavs = favs.includes(toolId) ? favs.filter((id: string) => id !== toolId) : [...favs, toolId];
    localStorage.setItem("onetool-favorites", JSON.stringify(newFavs));
    setIsFav(!isFav);
    window.dispatchEvent(new Event("storage")); 
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120]">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><ArrowLeft size={20} /></Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="flex flex-col">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Link href="/" className="hover:text-indigo-600 flex items-center gap-1"><Home size={10} /> Home</Link>
                  <span>/</span>
                  <Link href="/dashboard" className="hover:text-indigo-600 flex items-center gap-1"><LayoutGrid size={10} /> Dashboard</Link>
               </div>
               <div className="flex items-center gap-2 mt-0.5">
                  {icon && <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600">{icon}</div>}
                  <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate max-w-[300px] sm:max-w-none">{title}</h1>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            <button onClick={toggleFav} className={`p-2 rounded-lg transition-colors ${isFav ? 'text-amber-400' : 'text-slate-400'}`}><Star size={18} fill={isFav ? "currentColor" : "none"} /></button>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <main className="max-w-[1600px] mx-auto px-6 py-8"><div className="animate-in fade-in slide-in-from-bottom-2 duration-300">{children}</div></main>
    </div>
  );
}
