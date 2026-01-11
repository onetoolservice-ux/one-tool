#!/bin/bash

echo "í¾¨ Applying Final Contrast & Layout Tweaks..."

# FIX TOOL TILE (Better Text Contrast & Uniform Height)
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
    <Link href={href} className="group block h-full">
      <div className={`
        relative h-full p-6 rounded-2xl
        bg-white dark:bg-slate-900 
        border border-slate-200 dark:border-slate-800 
        shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]
        flex flex-col
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

        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          {/* FIX: Darker text (slate-600) and min-height to align cards */}
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium min-h-[40px]">
            {desc}
          </p>
        </div>

        <div className="mt-4 flex justify-end opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
          <ArrowRight size={20} className={accent.split(' ')[0]} />
        </div>
      </div>
    </Link>
  );
}
TS_END

echo "âœ… Visual Polish Applied. Run 'npm run dev' to see the difference."
