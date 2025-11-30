#!/bin/bash

echo "íº€ Finalizing Dashboard: Live Clock & High-Contrast Cards..."

# =========================================================
# 1. CREATE LIVE CLOCK WIDGET
# =========================================================
echo "âŒš Building Live Clock..."
cat > app/components/dashboard/LiveClock.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="h-32 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>;

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Link href="/tools/developer/timestamp" className="group block">
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-500/50">
            <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                        {timeStr}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1 flex items-center gap-2">
                        <Clock size={18} className="text-indigo-500" /> {dateStr}
                    </p>
                </div>
                <div className="hidden md:block text-right">
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-400 group-hover:text-indigo-500 transition-colors">
                        UTC: {time.toISOString().split('T')[1].split('.')[0]}Z
                    </div>
                </div>
            </div>
        </div>
    </Link>
  );
}
TS_END

# =========================================================
# 2. UPDATE TOOL TILES (Solid Icons & Better Contrast)
# =========================================================
echo "í¾¨ Updating Cards to High-Contrast Style..."
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
  
  // HIGH CONTRAST THEME: Solid Icon Backgrounds
  const theme = {
    finance:   "bg-emerald-600 text-white shadow-emerald-500/20",
    developer: "bg-blue-600 text-white shadow-blue-500/20",
    documents: "bg-amber-500 text-white shadow-amber-500/20",
    health:    "bg-rose-500 text-white shadow-rose-500/20",
    ai:        "bg-violet-600 text-white shadow-violet-500/20",
  };

  // @ts-ignore
  const iconStyle = theme[category] || theme.finance;

  return (
    <Link href={href} className="group block h-full">
      <div className="
        relative h-full p-5 rounded-2xl
        bg-white dark:bg-slate-900 
        border border-slate-200 dark:border-slate-800 
        shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700
        flex flex-col
      ">
        <div className="flex justify-between items-start mb-4">
          {/* Solid Icon Box */}
          <div className={`p-3 rounded-xl shadow-lg ${iconStyle} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} strokeWidth={2} />
          </div>
          
          {isNew && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded border border-indigo-100 dark:border-indigo-800">
              New
            </span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {desc}
          </p>
        </div>
      </div>
    </Link>
  );
}
TS_END

# =========================================================
# 3. UPDATE DASHBOARD (Remove Old Search, Add Clock)
# =========================================================
echo "ï¿½ï¿½ Injecting Clock & Cleaning Dashboard..."
cat > app/page.tsx << 'TS_END'
"use client";
import ToolTile from "@/app/shared/ToolTile";
import { ALL_TOOLS, Tool } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import LiveClock from "@/app/components/dashboard/LiveClock"; // New Widget
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";

export default function Home() {
  const { searchQuery } = useUI(); // Use Global Search

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

  const order = ["Finance", "Developer", "Documents", "Health", "Productivity", "Design"];

  return (
    <div className="p-6 md:p-10 w-full space-y-10 animate-in fade-in duration-700">
      
      {/* Top Section: Clock & Stats (Only show if not searching) */}
      {!searchQuery && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
                <LiveClock />
            </div>
            <div className="xl:col-span-2">
                <SmartWidgets />
            </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="space-y-12">
        {searchQuery ? (
             <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Search Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                    {filtered.map(tool => <ToolTile key={tool.id} {...tool} />)}
                </div>
                {filtered.length === 0 && <div className="py-20 text-center text-slate-400">No tools found.</div>}
             </div>
        ) : (
            order.map((cat, i) => grouped[cat] && (
                <div key={cat} className="space-y-5" style={{animationDelay: `${i * 50}ms`}}>
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {cat}
                        </h2>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-full">{grouped[cat].length}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
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

echo "âœ… Dashboard Upgraded. Run 'npm run dev'!"
