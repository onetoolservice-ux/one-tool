#!/bin/bash

echo "íº‘ Fixing 'Funny' UI issues..."

# 1. RESTORE CSS (Fixes broken layout/missing styles)
cat > app/globals.css << 'CSS_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 15, 23, 42;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 2, 6, 23;
    --background-end-rgb: 2, 6, 23;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-start-rgb));
}

/* Custom Scrollbar - Clean */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
.dark ::-webkit-scrollbar-thumb {
  background-color: #334155;
}
CSS_EOF

# 2. CLEAN UP TOOL TILE (Professional, Bold, Stable)
# Removing the 'rainbow text' which often breaks layout.
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
    try {
      const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
      setIsFav(favs.includes(tool.id));
    } catch (e) {}
  }, [tool.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <Link href={href} className="group relative block h-full">
      <article className={`
        relative h-full p-5 rounded-xl
        bg-white dark:bg-slate-900/80
        border border-slate-200 dark:border-slate-800
        hover:border-slate-300 dark:hover:border-slate-600
        flex flex-col
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl
        ${theme.shadow}
      `}>
        
        <div className="flex items-start justify-between mb-4">
          {/* Icon Box - Stable & Clean */}
          <div className={`
            w-12 h-12 flex items-center justify-center
            rounded-xl text-white shadow-md
            transition-transform duration-300 group-hover:scale-105
            ${theme.iconBg}
          `}>
            {renderIcon()}
          </div>

          <div className="flex items-center gap-1">
             {tool.status === "New" && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 mr-1">
                  New
                </span>
             )}
             <button 
               onClick={toggleFav}
               className={`p-1.5 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${isFav ? 'text-amber-400' : 'text-slate-300 hover:text-slate-500'}`}
             >
               <Star size={18} fill={isFav ? "currentColor" : "none"} />
             </button>
          </div>
        </div>

        <div className="space-y-1 flex-grow">
          {/* Title: Solid Color (No Gradient Text to fix readability) */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {tool.name}
          </h3>
          
          {/* Description */}
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {tool.desc}
          </p>
        </div>

        {/* Bottom Color Bar (The "Connection" Detail) */}
        <div className={`
          absolute bottom-0 left-0 right-0 h-[3px] rounded-b-xl opacity-0 
          group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-r ${theme.gradient}
        `} />
      </article>
    </Link>
  );
}
TILE_CODE

echo "âœ… UI Repaired & Polished."
echo "í±‰ Run 'npm run dev' - The layout should be perfect now."
