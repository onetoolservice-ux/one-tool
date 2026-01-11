#!/bin/bash

echo "í·¹ Applying 'Clean Enterprise' Design System..."

# =========================================================
# 1. FIX CARDS (Professional Minimalist Style)
# =========================================================
echo "í³ Cleaning up Tool Cards..."
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
  
  // CLEAN STRATEGY: No Background Fills. Accent on Hover only.
  const accentColors = {
    finance:   "group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    developer: "group-hover:border-blue-500/50 group-hover:shadow-blue-500/10 text-blue-600 dark:text-blue-400",
    documents: "group-hover:border-amber-500/50 group-hover:shadow-amber-500/10 text-amber-600 dark:text-amber-400",
    health:    "group-hover:border-rose-500/50 group-hover:shadow-rose-500/10 text-rose-600 dark:text-rose-400",
    ai:        "group-hover:border-violet-500/50 group-hover:shadow-violet-500/10 text-violet-600 dark:text-violet-400",
  };

  const activeAccent = accentColors[category] || accentColors.finance;

  return (
    <Link href={href} className="group block h-full">
      <div className={`
        relative h-full p-6 rounded-2xl 
        bg-white dark:bg-slate-900 
        border border-slate-200 dark:border-slate-800 
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl ${activeAccent}
      `}>
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform duration-300">
            <Icon size={24} strokeWidth={2} />
          </div>
          {isNew && (
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 rounded-md">
              New
            </span>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-current transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Hover Action */}
        <div className="absolute bottom-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight size={18} className="text-current opacity-80" />
        </div>
      </div>
    </Link>
  );
}
TS_END

# =========================================================
# 2. TONE DOWN BACKGROUND (Subtle & Clean)
# =========================================================
echo "í¼¬ï¸ Refining Background Intensity..."
cat > app/components/layout/ThemeEngine.tsx << 'TS_END'
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    
    // Default: Very subtle Indigo whisper (3% opacity)
    let accentColor = "79 70 229"; 
    let bgGradient = "radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.03), transparent 70%)";

    if (pathname.includes("/finance")) {
      accentColor = "16 185 129"; // Emerald
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.04), transparent 70%)";
    } else if (pathname.includes("/developer")) {
      accentColor = "59 130 246"; // Blue
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.04), transparent 70%)";
    } else if (pathname.includes("/health")) {
      accentColor = "244 63 94"; // Rose
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.04), transparent 70%)";
    }

    root.style.setProperty("--primary-rgb", accentColor);
    document.body.style.backgroundImage = bgGradient;
    document.body.style.backgroundAttachment = "fixed";
    
  }, [pathname]);

  return null;
}
TS_END

# =========================================================
# 3. FIX MOBILE LAYOUT (Proper Spacing)
# =========================================================
echo "í³± Fixing Mobile Containers..."
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
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 md:space-y-12">
      
      {/* Hero Section */}
      <div className="space-y-3 mt-4 md:mt-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Good Afternoon
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Your digital command center.</p>
      </div>

      {/* Search - High Contrast Input */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base"
          placeholder="Search tools (Press '/')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tool Grid */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <LayoutGrid size={16} className="text-slate-400" />
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">All Tools</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

echo "âœ… Clean UI Applied. Run 'npm run build'!"
