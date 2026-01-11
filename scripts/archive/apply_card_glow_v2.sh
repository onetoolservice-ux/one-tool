#!/bin/bash

echo "í¾¨ Upgrading Tool Cards (No Python version)..."

# 1. UPDATE THEME ENGINE (Adding 'shadow' colors)
# We re-apply this just to be sure it's 100% correct.
cat > app/lib/theme-config.ts << 'THEME_CODE'
export type ToolCategory = 'finance' | 'developer' | 'health' | 'documents' | 'converters' | 'ai' | 'design' | 'productivity' | 'writing' | 'default';

export const THEME_CONFIG: Record<ToolCategory, {
  primary: string;
  secondary: string;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  border: string;
  shadow: string; // NEW: The colored glow
}> = {
  finance: {
    primary: "text-emerald-700 dark:text-emerald-400",
    secondary: "text-emerald-600 dark:text-emerald-500",
    gradient: "from-emerald-600 to-teal-500",
    bgGradient: "from-emerald-50/50 via-white to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    border: "group-hover:border-emerald-500/50 dark:group-hover:border-emerald-400/50",
    shadow: "group-hover:shadow-emerald-500/20 dark:group-hover:shadow-emerald-500/10"
  },
  developer: {
    primary: "text-violet-700 dark:text-violet-400",
    secondary: "text-violet-600 dark:text-violet-500",
    gradient: "from-violet-600 to-fuchsia-500",
    bgGradient: "from-violet-50/50 via-white to-fuchsia-50/50 dark:from-gray-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    border: "group-hover:border-violet-500/50 dark:group-hover:border-violet-400/50",
    shadow: "group-hover:shadow-violet-500/20 dark:group-hover:shadow-violet-500/10"
  },
  health: {
    primary: "text-teal-700 dark:text-teal-400",
    secondary: "text-teal-600 dark:text-teal-500",
    gradient: "from-teal-500 to-cyan-500",
    bgGradient: "from-teal-50/50 via-white to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-teal-400 to-cyan-500",
    border: "group-hover:border-teal-500/50 dark:group-hover:border-teal-400/50",
    shadow: "group-hover:shadow-teal-500/20 dark:group-hover:shadow-teal-500/10"
  },
  documents: {
    primary: "text-indigo-700 dark:text-indigo-400",
    secondary: "text-indigo-600 dark:text-indigo-500",
    gradient: "from-indigo-600 to-blue-500",
    bgGradient: "from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-500",
    border: "group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50",
    shadow: "group-hover:shadow-indigo-500/20 dark:group-hover:shadow-indigo-500/10"
  },
  converters: {
    primary: "text-amber-700 dark:text-amber-400",
    secondary: "text-amber-600 dark:text-amber-500",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50/50 via-white to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    border: "group-hover:border-amber-500/50 dark:group-hover:border-amber-400/50",
    shadow: "group-hover:shadow-amber-500/20 dark:group-hover:shadow-amber-500/10"
  },
  ai: {
    primary: "text-fuchsia-700 dark:text-fuchsia-400",
    secondary: "text-fuchsia-600 dark:text-fuchsia-500",
    gradient: "from-fuchsia-600 to-pink-500",
    bgGradient: "from-fuchsia-50/50 via-white to-pink-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
    border: "group-hover:border-fuchsia-500/50 dark:group-hover:border-fuchsia-400/50",
    shadow: "group-hover:shadow-fuchsia-500/20 dark:group-hover:shadow-fuchsia-500/10"
  },
  design: {
    primary: "text-pink-700 dark:text-pink-400",
    secondary: "text-pink-600 dark:text-pink-500",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50/50 via-white to-rose-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    border: "group-hover:border-pink-500/50 dark:group-hover:border-pink-400/50",
    shadow: "group-hover:shadow-pink-500/20 dark:group-hover:shadow-pink-500/10"
  },
  productivity: {
    primary: "text-sky-700 dark:text-sky-400",
    secondary: "text-sky-600 dark:text-sky-500",
    gradient: "from-sky-500 to-blue-500",
    bgGradient: "from-sky-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-500",
    border: "group-hover:border-sky-500/50 dark:group-hover:border-sky-400/50",
    shadow: "group-hover:shadow-sky-500/20 dark:group-hover:shadow-sky-500/10"
  },
  writing: {
    primary: "text-gray-700 dark:text-gray-300",
    secondary: "text-gray-600 dark:text-gray-500",
    gradient: "from-gray-700 to-gray-900",
    bgGradient: "from-gray-50 via-white to-gray-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-gray-600 to-gray-800",
    border: "group-hover:border-gray-400/50 dark:group-hover:border-gray-500/50",
    shadow: "group-hover:shadow-gray-500/20 dark:group-hover:shadow-gray-500/10"
  },
  default: {
    primary: "text-slate-900 dark:text-white",
    secondary: "text-slate-600 dark:text-slate-400",
    gradient: "from-slate-900 to-slate-700",
    bgGradient: "from-white to-slate-50 dark:from-slate-950 dark:to-slate-900",
    iconBg: "bg-slate-900",
    border: "group-hover:border-slate-300 dark:group-hover:border-slate-700",
    shadow: "group-hover:shadow-slate-500/20 dark:group-hover:shadow-slate-500/10"
  },
};

export function getTheme(category: string) {
  const normalizedCategory = category?.toLowerCase() as ToolCategory;
  return THEME_CONFIG[normalizedCategory] || THEME_CONFIG.default;
}
THEME_CODE

# 2. RE-APPLY TOOL TILE (The "Pro" Card)
# Overwriting with clean, shell-safe code.
cat > app/shared/ToolTile.tsx << 'TILE_CODE'
"use client";

import Link from "next/link";
import { getTheme } from "@/app/lib/theme-config";
import { ArrowUpRight, Star } from "lucide-react";
import React, { isValidElement, useState, useEffect } from "react";

interface Tool {
  id: string;
  name: string;
  desc: string;
  icon: any;
  category: string;
  href?: string;
  status?: string;
}

export default function ToolTile({ tool }: { tool: Tool }) {
  const theme = getTheme(tool.category);
  const href = tool.href || `/tools/${tool.category}/${tool.id}`;
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    setIsFav(favs.includes(tool.id));
  }, [tool.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    let newFavs;
    if (favs.includes(tool.id)) {
      newFavs = favs.filter((id: string) => id !== tool.id);
    } else {
      newFavs = [...favs, tool.id];
    }
    localStorage.setItem("onetool-favorites", JSON.stringify(newFavs));
    setIsFav(!isFav);
    window.dispatchEvent(new Event("storage")); 
  };

  const renderIcon = () => {
    const Icon = tool.icon;
    if (isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function') {
       const IconComp = Icon as React.ElementType;
       return <IconComp size={24} />;
    }
    return null;
  };

  return (
    <Link 
      href={href} 
      className="group relative block h-full"
    >
      <article className={`
        relative h-full p-6 rounded-2xl
        bg-white dark:bg-slate-900/90
        border border-slate-200 dark:border-slate-800
        transition-all duration-300 ease-out
        flex flex-col
        hover:-translate-y-1
        ${theme.border}
        ${theme.shadow}
        shadow-sm hover:shadow-xl
      `}>
        
        <div className="flex items-start justify-between mb-5">
          {/* Icon Box - Larger & Bold Color */}
          <div className={`
            w-14 h-14 flex items-center justify-center
            rounded-2xl text-white shadow-md
            transform group-hover:scale-110 transition-transform duration-300
            ${theme.iconBg}
          `}>
            {renderIcon()}
          </div>

          <div className="flex items-center gap-2">
             {tool.status === "New" && (
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700`}>
                  New
                </span>
             )}
             <button 
               onClick={toggleFav}
               className={`p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${isFav ? 'text-amber-400' : 'text-slate-300 hover:text-slate-500'}`}
             >
               <Star size={18} fill={isFav ? "currentColor" : "none"} />
             </button>
          </div>
        </div>

        <div className="space-y-2 flex-grow">
          {/* Title: Extra Bold & High Contrast */}
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
            {tool.name}
          </h3>
          
          {/* Description: Clearer */}
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {tool.desc.endsWith('.') ? tool.desc.slice(0, -1) : tool.desc}
          </p>
        </div>

        {/* Bottom Color Line (Active on Hover) */}
        <div className={`
          absolute bottom-0 left-8 right-8 h-1 rounded-t-full opacity-0 
          group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-r ${theme.gradient}
        `} />
      </article>
    </Link>
  );
}
TILE_CODE

echo "âœ… Applied 'Smart Glow' logic (No Python required)."
echo "í±‰ Run 'npm run dev' and hover over a card to see the colored shadow!"
