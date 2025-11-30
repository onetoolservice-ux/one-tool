#!/bin/bash

echo "í¾¨ Applying BOLD UI Strategy (Filled Cards & Responsive Grids)..."

# =========================================================
# 1. UPDATE TOOL CARDS (Filled Colors + Responsive)
# =========================================================
echo "í³ Making Cards Colorful..."
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
  
  // BOLD STRATEGY: Filled Backgrounds (Pastels)
  // Logic: Light mode gets colored fill. Dark mode gets dark fill with colored border/glow.
  const styles = {
    finance:   "bg-emerald-100/50 hover:bg-emerald-100 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100",
    developer: "bg-blue-100/50 hover:bg-blue-100 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100",
    documents: "bg-amber-100/50 hover:bg-amber-100 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100",
    health:    "bg-rose-100/50 hover:bg-rose-100 border-rose-200 text-rose-900 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-100",
    ai:        "bg-violet-100/50 hover:bg-violet-100 border-violet-200 text-violet-900 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-100",
  };

  const iconColors = {
    finance:   "bg-white text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    developer: "bg-white text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    documents: "bg-white text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    health:    "bg-white text-rose-600 dark:bg-rose-950 dark:text-rose-400",
    ai:        "bg-white text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  };

  const activeStyle = styles[category] || styles.finance;
  const activeIcon = iconColors[category] || iconColors.finance;

  return (
    <Link href={href} className="group block h-full">
      <div className={`
        relative h-full p-6 rounded-3xl border 
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none
        ${activeStyle}
      `}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3.5 rounded-2xl shadow-sm ${activeIcon} transition-transform group-hover:scale-110 duration-300`}>
            <Icon size={26} strokeWidth={2.5} />
          </div>
          {isNew && (
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-white/80 dark:bg-black/40 backdrop-blur rounded-full shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-bold mb-1.5 tracking-tight">{title}</h3>
          <p className="text-sm opacity-80 leading-relaxed font-medium">{desc}</p>
        </div>

        {/* Action Indicator (Moves on Hover) */}
        <div className="absolute bottom-6 right-6 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight size={20} strokeWidth={3} />
        </div>
      </div>
    </Link>
  );
}
TS_END

# =========================================================
# 2. BOOST GLOBAL BACKGROUND (ThemeEngine)
# =========================================================
echo "í¼ˆ Boosting Background Intensity..."
cat > app/components/layout/ThemeEngine.tsx << 'TS_END'
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    
    // Default (Dashboard)
    let accentColor = "79 70 229"; // Indigo
    // Stronger Opacity (0.15 instead of 0.05)
    let bgGradient = "radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.15), transparent 60%)";

    if (pathname.includes("/finance")) {
      accentColor = "16 185 129"; // Emerald
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.18), transparent 60%)";
    } else if (pathname.includes("/developer")) {
      accentColor = "59 130 246"; // Blue
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.18), transparent 60%)";
    } else if (pathname.includes("/health")) {
      accentColor = "244 63 94"; // Rose
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.18), transparent 60%)";
    } else if (pathname.includes("/documents")) {
      accentColor = "245 158 11"; // Amber
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.18), transparent 60%)";
    }

    // Apply CSS Variables
    root.style.setProperty("--primary-rgb", accentColor);
    document.body.style.backgroundImage = bgGradient;
    document.body.style.backgroundAttachment = "fixed"; // Keep gradient fixed while scrolling
    
  }, [pathname]);

  return null;
}
TS_END

# =========================================================
# 3. FIX RESPONSIVE GRID (Tools Page)
# =========================================================
echo "í³± Enforcing Responsive Grid..."
# We need to make sure the parent container uses the correct grid classes
cat > app/page.tsx << 'TS_END'
"use client";
import { 
  Wallet, FileText, Activity, Code2, Sparkles, 
  Search, Settings, LayoutGrid 
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
    <div className="p-6 max-w-[1600px] mx-auto space-y-10">
      
      {/* Hero Section */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-main tracking-tight">
          Good Afternoon
        </h1>
        <p className="text-muted text-lg">Your digital command center.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input 
          className="w-full pl-12 pr-4 py-3 bg-surface/50 dark:bg-slate-800/50 backdrop-blur border border-line rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
          placeholder="Search tools (Press '/')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tool Grid: 1 col (Mobile), 2 col (Tablet), 3 col (Desktop), 4 col (Wide) */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <LayoutGrid size={18} className="text-muted" />
          <h2 className="text-xs font-bold text-muted uppercase tracking-widest">All Tools</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

echo "âœ… Bold UI Applied. Run 'npm run build'!"
