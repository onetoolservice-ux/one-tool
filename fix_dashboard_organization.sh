#!/bin/bash

echo "í·‚ï¸ Organizing Dashboard & Fixing Contrast..."

# =========================================================
# 1. UPDATE HOME PAGE (Grouped Sections)
# =========================================================
echo "í¿  Applying Category Grouping to Home..."
cat > app/page.tsx << 'TS_END'
"use client";
import { Search } from "lucide-react";
import ToolTile from "@/app/shared/ToolTile";
import { useState } from "react";
import { ALL_TOOLS, Tool } from "@/app/lib/tools-data";

export default function Home() {
  const [search, setSearch] = useState("");

  const filtered = ALL_TOOLS.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  // Grouping Logic
  const grouped = filtered.reduce((acc, tool) => {
    const cat = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  // Define exact order of sections
  const order = ["Finance", "Documents", "Developer", "Health", "Productivity", "Design"];

  return (
    <div className="p-8 max-w-[1800px] mx-auto space-y-12">
      
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Good Afternoon
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
          Your digital command center. Select a tool to begin.
        </p>
      </div>

      {/* Search Bar (Fixed Alignment) */}
      <div className="relative max-w-lg">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
           <Search size={18} />
        </div>
        <input 
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
          placeholder="Jump to tool (Press '/')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Content Area */}
      <div className="space-y-12">
        {search ? (
            // Flat Grid for Search Results
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map(tool => (
                    // @ts-ignore
                    <ToolTile key={tool.id} {...tool} />
                ))}
             </div>
        ) : (
            // Categorized Sections for Default View
            order.map(cat => grouped[cat] && (
                <div key={cat} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                        {cat} 
                        <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px]">{grouped[cat].length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {grouped[cat].map(tool => (
                            // @ts-ignore
                            <ToolTile key={tool.id} {...tool} />
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 2. FIX CARD CONTRAST
# =========================================================
echo "í³ Boosting Card Visibility..."
cat > app/shared/ToolTile.tsx << 'TS_END'
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ToolTileProps {
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  category?: "finance" | "developer" | "documents" | "health" | "ai";
  isNew?: boolean;
}

export default function ToolTile({ title, desc, icon: Icon, href, category = "finance", isNew }: ToolTileProps) {
  
  // Accents for Hover State only (Keeps it clean but interactive)
  const accents = {
    finance:   "hover:border-emerald-400/50 hover:shadow-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    developer: "hover:border-blue-400/50 hover:shadow-blue-500/10 text-blue-600 dark:text-blue-400",
    documents: "hover:border-amber-400/50 hover:shadow-amber-500/10 text-amber-600 dark:text-amber-400",
    health:    "hover:border-rose-400/50 hover:shadow-rose-500/10 text-rose-600 dark:text-rose-400",
    ai:        "hover:border-violet-400/50 hover:shadow-violet-500/10 text-violet-600 dark:text-violet-400",
  };

  // @ts-ignore
  const activeAccent = accents[category] || accents.finance;

  return (
    <Link href={href} className="group block h-full">
      <div className={`
        relative h-full p-6 rounded-2xl
        bg-white dark:bg-slate-800/50 
        border border-slate-300 dark:border-slate-700 
        shadow-sm hover:shadow-md transition-all duration-200 ease-in-out
        hover:-translate-y-1 ${activeAccent}
      `}>
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform shadow-inner border border-slate-100 dark:border-slate-800">
            <Icon size={22} strokeWidth={2} />
          </div>
          {isNew && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded border border-blue-100 dark:border-blue-800">
              New
            </span>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-current transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </Link>
  );
}
TS_END

echo "âœ… Organization Fixed. Run 'npm run dev'!"
