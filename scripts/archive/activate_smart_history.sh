#!/bin/bash

echo "í·  Activating Smart History (Memory Layer)..."

# =========================================================
# 1. CREATE HISTORY HOOK
# =========================================================
echo "í¾£ Creating useHistory hook..."
mkdir -p app/utils/hooks
cat > app/utils/hooks/useHistory.ts << 'TS_END'
"use client";
import { useState, useEffect } from "react";

export function useHistory() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    // Load from local storage on mount
    try {
      const saved = localStorage.getItem("onetool-history");
      if (saved) setRecentIds(JSON.parse(saved));
    } catch (e) { console.error("History load error", e); }
  }, []);

  const addToHistory = (id: string) => {
    // Remove id if exists, add to front, keep max 4
    const newHistory = [id, ...recentIds.filter(x => x !== id)].slice(0, 4);
    setRecentIds(newHistory);
    localStorage.setItem("onetool-history", JSON.stringify(newHistory));
  };

  return { recentIds, addToHistory };
}
TS_END

# =========================================================
# 2. UPDATE TOOL TILE (To Track Clicks)
# =========================================================
echo "í¶±ï¸ Wiring ToolTile to History..."
cat > app/shared/ToolTile.tsx << 'TS_END'
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { useHistory } from "@/app/utils/hooks/useHistory";

interface ToolTileProps {
  id?: string; // Made optional for backward compat, but we should pass it
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  category?: "finance" | "developer" | "documents" | "health" | "ai";
  isNew?: boolean;
}

export default function ToolTile({ id, title, desc, icon: Icon, href, category = "finance", isNew }: ToolTileProps) {
  const { addToHistory } = useHistory();

  const handleClick = () => {
    if (id) addToHistory(id);
  };
  
  // Theme Colors
  const theme = {
    finance: "text-emerald-600 dark:text-emerald-400 group-hover:border-emerald-500/30 group-hover:shadow-emerald-500/10",
    developer: "text-blue-600 dark:text-blue-400 group-hover:border-blue-500/30 group-hover:shadow-blue-500/10",
    documents: "text-amber-600 dark:text-amber-400 group-hover:border-amber-500/30 group-hover:shadow-amber-500/10",
    health: "text-rose-600 dark:text-rose-400 group-hover:border-rose-500/30 group-hover:shadow-rose-500/10",
    ai: "text-violet-600 dark:text-violet-400 group-hover:border-violet-500/30 group-hover:shadow-violet-500/10",
  };

  // @ts-ignore
  const accent = theme[category] || theme.finance;

  return (
    <Link href={href} onClick={handleClick} className="group block h-full">
      <div className={`
        relative h-full p-6 rounded-2xl
        bg-white dark:bg-slate-900 
        border border-slate-200 dark:border-slate-800 
        shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]
        ${accent}
      `}>
        <div className="flex justify-between items-start mb-5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-inner transition-colors duration-300">
            <Icon size={24} strokeWidth={2} className={accent.split(' ')[0]} />
          </div>
          {isNew && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-md shadow-indigo-500/20 animate-pulse">
              New
            </span>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium opacity-90">
            {desc}
          </p>
        </div>

        <div className="absolute bottom-6 right-6 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
          <ArrowRight size={20} className={accent.split(' ')[0]} />
        </div>
      </div>
    </Link>
  );
}
TS_END

# =========================================================
# 3. UPDATE HOME PAGE (Show Recent Section)
# =========================================================
echo "í¿  Adding 'Jump Back In' section to Dashboard..."
cat > app/page.tsx << 'TS_END'
"use client";
import { Search, History } from "lucide-react";
import ToolTile from "@/app/shared/ToolTile";
import { useState } from "react";
import { ALL_TOOLS, Tool } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import { useHistory } from "@/app/utils/hooks/useHistory";

export default function Home() {
  const { searchQuery, setSearchQuery } = useUI();
  const { recentIds } = useHistory();

  const filtered = ALL_TOOLS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filtered.reduce((acc, tool) => {
    const cat = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  // Identify Recent Tools objects
  const recentTools = recentIds.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as Tool[];

  const order = ["Finance", "Developer", "Documents", "Health", "Productivity", "Design"];

  return (
    <div className="p-6 md:p-10 max-w-[1800px] mx-auto space-y-16 animate-in fade-in duration-700">
      
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Good Afternoon
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl font-medium">
          Your digital command center. Select a tool to begin.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl group z-20">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-focus-within:opacity-40 transition duration-500 blur-lg"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-xl flex items-center shadow-xl">
            <div className="pl-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><Search size={22} /></div>
            <input 
              className="w-full pl-4 pr-6 py-5 bg-transparent border-none outline-none text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="Jump to tool (Press '/')..."
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="pr-4 hidden md:block">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold rounded-md border border-slate-200 dark:border-slate-700">CMD+K</span>
            </div>
        </div>
      </div>

      {/* RECENT APPS (Only if history exists and not searching) */}
      {!searchQuery && recentTools.length > 0 && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <History size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Jump Back In</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentTools.map(tool => (
                    <ToolTile key={'recent-'+tool.id} {...tool} />
                ))}
            </div>
        </div>
      )}

      {/* Tool Grids */}
      <div className="space-y-20">
        {searchQuery ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filtered.map(tool => <ToolTile key={tool.id} {...tool} />)}
             </div>
        ) : (
            order.map((cat, i) => grouped[cat] && (
                <div key={cat} className="space-y-6" style={{animationDelay: `${i * 100}ms`}}>
                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {cat}
                        </h2>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-full">{grouped[cat].length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {grouped[cat].map(tool => <ToolTile key={tool.id} {...tool} />)}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
TS_END

echo "âœ… Smart History Activated. App will now learn from you!"
