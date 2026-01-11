#!/bin/bash

echo "âœ¨ Applying Final Enterprise UI Polish..."

# =========================================================
# 1. UPGRADE HOME PAGE (Hero Section + Distinct Favorites)
# =========================================================
cat > app/page.tsx << 'HOME_EOF'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, LayoutGrid, Star, Clock, Search, Command } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import CommandMenu from "@/app/components/layout/CommandMenu";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";
import ToolTile from "@/app/shared/ToolTile";
import { useRecentTools } from "@/app/hooks/useRecentTools";

export default function Home() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { recentTools } = useRecentTools();

  useEffect(() => { 
    setIsClient(true);
    const saved = localStorage.getItem("onetool-favorites");
    if(saved) setFavorites(JSON.parse(saved));
  }, []);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const query = searchQuery || "";
      const name = tool.name || "";
      const desc = tool.desc || "";
      const matchesSearch = name.toLowerCase().includes(query.toLowerCase()) || 
                            desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const favoriteTools = ALL_TOOLS.filter(t => favorites.includes(t.id));

  if (!isClient) return <div className="min-h-screen bg-slate-50 dark:bg-[#020617]" />;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120]">
      {/* HERO BACKGROUND MESH */}
      <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full px-6 space-y-10 pt-8 pb-20 max-w-[1600px] mx-auto">
        
        {/* HERO SECTION: Command Menu & Widgets */}
        <div className="space-y-8">
           <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                 One Tool <span className="text-indigo-600 dark:text-indigo-400">Enterprise</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                 The all-in-one privacy-first utility suite for professionals.
              </p>
           </div>
           
           <CommandMenu />
           <SmartWidgets />
        </div>
        
        {/* SECTION: RECENTLY USED (Distinct Look) */}
        {activeCategory === "All" && !searchQuery && recentTools.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
                  <Clock size={18} className="text-indigo-500"/>
                  <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pick up where you left off</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* SECTION: FAVORITES (The "Glass Box" Highlight) */}
        {activeCategory === "All" && !searchQuery && favorites.length > 0 && (
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 md:p-8 animate-in zoom-in-95 duration-500">
              {/* Subtle background for favorites */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />
              
              <div className="flex items-center gap-2 mb-6">
                  <Star size={20} className="text-amber-400 fill-amber-400"/>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Favorites</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {favoriteTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* MAIN GRID */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
             <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-slate-400 dark:text-slate-500"/>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {activeCategory === "All" ? "All Tools" : `${activeCategory} Tools`}
                </h2>
             </div>
             <div className="text-xs text-slate-400 font-mono">{filteredTools.length} Apps</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <ToolTile key={tool.id} tool={tool} />
              ))
            ) : (
              <div className="col-span-full py-24 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50">
                <Sparkles className="mx-auto mb-3 opacity-30" size={32}/>
                <p className="text-lg font-medium">No tools found</p>
                <p className="text-sm opacity-70">Try searching for "PDF" or "Loan"</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
HOME_EOF

# =========================================================
# 2. UPGRADE COMMAND MENU (Make it look premium)
# =========================================================
cat > app/components/layout/CommandMenu.tsx << 'MENU_EOF'
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
MENU_EOF

echo "âœ… Final UI Polish Applied."
echo "í±‰ Run 'npm run dev' to see the Transformation!"
