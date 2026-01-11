#!/bin/bash

echo "í¾¨ Applying Smart Category Colors (CR1 & CR2)..."

# =========================================================
# 1. UPDATE TOOL CARDS (Meaningful Colors)
# =========================================================
echo "í³ Updating ToolTile with Category Logic..."
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
  category?: "finance" | "developer" | "documents" | "health" | "ai" | "design" | "productivity";
  isNew?: boolean;
}

export default function ToolTile({ title, desc, icon: Icon, href, category = "finance", isNew }: ToolTileProps) {
  
  // CR1: Meaningful Color Mapping
  // We use "50" for background (subtle) and "600/700" for text (readable).
  
  const themes = {
    finance: {
      card: "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 hover:shadow-emerald-500/10",
      icon: "bg-white dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
      title: "text-emerald-900 dark:text-emerald-100",
      arrow: "text-emerald-500"
    },
    developer: {
      card: "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400 hover:shadow-blue-500/10",
      icon: "bg-white dark:bg-blue-950 text-blue-600 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-100",
      arrow: "text-blue-500"
    },
    documents: {
      card: "bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-400 hover:shadow-amber-500/10",
      icon: "bg-white dark:bg-amber-950 text-amber-600 dark:text-amber-400",
      title: "text-amber-900 dark:text-amber-100",
      arrow: "text-amber-500"
    },
    health: {
      card: "bg-rose-50/80 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 hover:border-rose-400 hover:shadow-rose-500/10",
      icon: "bg-white dark:bg-rose-950 text-rose-600 dark:text-rose-400",
      title: "text-rose-900 dark:text-rose-100",
      arrow: "text-rose-500"
    },
    ai: {
      card: "bg-violet-50/80 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 hover:border-violet-400 hover:shadow-violet-500/10",
      icon: "bg-white dark:bg-violet-950 text-violet-600 dark:text-violet-400",
      title: "text-violet-900 dark:text-violet-100",
      arrow: "text-violet-500"
    },
    design: {
      card: "bg-fuchsia-50/80 dark:bg-fuchsia-900/20 border-fuchsia-200 dark:border-fuchsia-800 hover:border-fuchsia-400 hover:shadow-fuchsia-500/10",
      icon: "bg-white dark:bg-fuchsia-950 text-fuchsia-600 dark:text-fuchsia-400",
      title: "text-fuchsia-900 dark:text-fuchsia-100",
      arrow: "text-fuchsia-500"
    },
    productivity: {
      card: "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:shadow-slate-500/10",
      icon: "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400",
      title: "text-slate-900 dark:text-slate-100",
      arrow: "text-slate-500"
    }
  };

  // Fallback to 'productivity' style if category not found
  // @ts-ignore
  const theme = themes[category] || themes.productivity;

  return (
    <Link href={href} className="group block h-full">
      <div className={`
        relative h-full p-6 rounded-2xl border 
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg
        ${theme.card}
      `}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3.5 rounded-xl shadow-sm ${theme.icon} transition-transform group-hover:scale-110 duration-300`}>
            <Icon size={24} strokeWidth={2} />
          </div>
          {isNew && (
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-white/60 dark:bg-black/20 backdrop-blur rounded-md shadow-sm border border-black/5">
              New
            </span>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className={`text-base font-bold mb-1.5 tracking-tight ${theme.title}`}>
            {title}
          </h3>
          <p className="text-sm opacity-70 leading-relaxed font-medium text-slate-600 dark:text-slate-400">
            {desc}
          </p>
        </div>

        {/* Action Indicator */}
        <div className={`absolute bottom-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${theme.arrow}`}>
          <ArrowRight size={18} strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}
TS_END

# =========================================================
# 2. REACTIVATE DYNAMIC BACKGROUND (CR2)
# =========================================================
echo "í¼ˆ Activating Dynamic Context Background..."
cat > app/components/layout/ThemeEngine.tsx << 'TS_END'
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    
    // Default (Dashboard) - Neutral Slate
    let accentColor = "99 102 241"; // Indigo
    let bgGradient = "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05), transparent 50%)";

    // CR2: Dynamic Change based on Section
    if (pathname.includes("/finance")) {
      accentColor = "16 185 129"; // Emerald Green
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08), transparent 60%)";
    } else if (pathname.includes("/developer")) {
      accentColor = "59 130 246"; // Blue
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08), transparent 60%)";
    } else if (pathname.includes("/documents")) {
      accentColor = "245 158 11"; // Amber
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.08), transparent 60%)";
    } else if (pathname.includes("/health")) {
      accentColor = "244 63 94"; // Rose
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.08), transparent 60%)";
    } else if (pathname.includes("/ai")) {
      accentColor = "139 92 246"; // Violet
      bgGradient = "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08), transparent 60%)";
    }

    // Apply to CSS Variables
    root.style.setProperty("--primary-rgb", accentColor);
    document.body.style.backgroundImage = bgGradient;
    document.body.style.backgroundAttachment = "fixed";
    
  }, [pathname]);

  return null;
}
TS_END

echo "âœ… CR1 & CR2 Applied. Run 'npm run dev'!"
