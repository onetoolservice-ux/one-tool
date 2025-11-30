#!/bin/bash

echo "í¿† Applying Golden Master Desktop UI..."

# =========================================================
# 1. THE "GOOD" SIDEBAR (From fix_sidebar.sh)
# =========================================================
echo "Iy Restoring the clean, stable Sidebar..."
cat > app/components/layout/Sidebar.tsx << 'TS_END'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wallet, FileText, Heart, Zap, Palette, 
  Terminal, Settings, LayoutGrid, ShieldCheck
} from "lucide-react";

const MENU = [
  { title: "Dashboard", href: "/", icon: <LayoutGrid size={18}/> },
  { title: "Finance", href: "/tools/finance", icon: <Wallet size={18}/> },
  { title: "Documents", href: "/tools/documents", icon: <FileText size={18}/> },
  { title: "Health", href: "/tools/health", icon: <Heart size={18}/> },
  { title: "Productivity", href: "/tools/productivity", icon: <Zap size={18}/> },
  { title: "Design", href: "/tools/design", icon: <Palette size={18}/> },
  { title: "Developer", href: "/tools/developer", icon: <Terminal size={18}/> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full bg-surface dark:bg-slate-800 border-r border-line dark:border-slate-700 z-30 shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-line dark:border-slate-700 flex-shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            OT
          </div>
          <span className="font-bold text-main dark:text-slate-100 text-lg tracking-tight">One Tool</span>
        </Link>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-2 text-xs font-bold text-muted dark:text-slate-500 uppercase tracking-wider mb-2">Apps</p>
        {MENU.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" 
                  : "text-muted dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-main dark:hover:text-slate-200"
                }
              `}
            >
              <span className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted/70"}>{item.icon}</span>
              {item.title}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-line dark:border-slate-700 bg-surface/50 dark:bg-slate-800/50 flex-shrink-0 space-y-1">
        <Link href="/ai" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-main dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
           <ShieldCheck size={18}/> AI & Privacy
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-main dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
           <Settings size={18}/> Settings
        </Link>
      </div>
    </aside>
  );
}
TS_END

# =========================================================
# 2. CLEAN PROFESSIONAL CARDS (No Pastels)
# =========================================================
echo "í³ Restoring Professional Card Design..."
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
  
  // Enterprise Theme: Clean White/Dark with subtle hover borders
  const accents = {
    finance:   "group-hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
    developer: "group-hover:border-blue-500/40 text-blue-600 dark:text-blue-400",
    documents: "group-hover:border-amber-500/40 text-amber-600 dark:text-amber-400",
    health:    "group-hover:border-rose-500/40 text-rose-600 dark:text-rose-400",
    ai:        "group-hover:border-violet-500/40 text-violet-600 dark:text-violet-400",
  };

  const activeAccent = accents[category] || accents.finance;

  return (
    <Link href={href} className="group block h-full">
      <div className={`
        relative h-full p-6 rounded-xl
        bg-white dark:bg-slate-800/50 
        border border-slate-200 dark:border-slate-700 
        shadow-sm hover:shadow-md transition-all duration-200 ease-in-out
        hover:-translate-y-0.5 ${activeAccent}
      `}>
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform">
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

# =========================================================
# 3. WIDE DESKTOP LAYOUT
# =========================================================
echo "í³ Applying Wide Desktop Grid..."
cat > app/page.tsx << 'TS_END'
"use client";
import { 
  Wallet, FileText, Activity, Code2, Sparkles, 
  Search, LayoutGrid 
} from "lucide-react";
import ToolTile from "@/app/shared/ToolTile";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");

  const tools = [
    { title: "Smart Budget", desc: "Enterprise G/L & Personal Expense Tracker.", icon: Wallet, href: "/tools/finance/smart-budget", category: "finance" },
    { title: "Smart Loan", desc: "Amortization & Payoff visualizer.", icon: LayoutGrid, href: "/tools/finance/smart-loan", category: "finance" },
    { title: "Smart Debt", desc: "Avalanche vs Snowball calculator.", icon: Activity, href: "/tools/finance/smart-debt", category: "finance" },
    { title: "PDF Merger", desc: "Combine multiple docs instantly.", icon: FileText, href: "/tools/documents/pdf/merge", category: "documents" },
    { title: "Regex Tester", desc: "Real-time pattern matching.", icon: Code2, href: "/tools/developer/smart-regex", category: "developer" },
    { title: "Smart Chat", desc: "Local AI Assistant.", icon: Sparkles, href: "/ai", category: "ai", isNew: true },
  ];

  const filtered = tools.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

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

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
          placeholder="Jump to tool (Press '/')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Tool Grid */}
      <div>
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
          <LayoutGrid size={16} className="text-slate-400" />
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Applications</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filtered.map((tool) => (
            // @ts-ignore
            <ToolTile key={tool.title} {...tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
TS_END

echo "âœ… Golden Master Applied. Run 'npm run build' to launch."
