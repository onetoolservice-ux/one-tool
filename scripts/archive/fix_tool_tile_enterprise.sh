#!/bin/bash

echo "í´§ Fixing syntax error in ToolTile.tsx..."

# We use a quoted heredoc ('TILE_CODE') to prevent the shell from messing with ${}
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

  // Quick Favorite Action
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
    // Dispatch custom event so Home page can update instantly
    window.dispatchEvent(new Event("storage")); 
  };

  const renderIcon = () => {
    const Icon = tool.icon;
    if (isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function') {
       const IconComp = Icon as React.ElementType;
       return <IconComp size={20} />;
    }
    return null;
  };

  return (
    <Link 
      href={href} 
      className="group relative block h-full"
    >
      <article className="relative h-full p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 flex flex-col shadow-sm hover:shadow-md">
        
        <div className="flex items-start justify-between mb-4">
          {/* Icon: Smaller, tighter, professional */}
          <div className={`
            w-10 h-10 flex items-center justify-center
            rounded-lg text-slate-600 dark:text-slate-300
            bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700
            group-hover:text-white group-hover:${theme.iconBg.replace('bg-gradient-to-br', 'bg')} 
            transition-all duration-200
          `}>
            {renderIcon()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
             <button 
               onClick={toggleFav}
               className={`p-1.5 rounded-md transition-colors ${isFav ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-500'}`}
             >
               <Star size={16} fill={isFav ? "currentColor" : "none"} />
             </button>
          </div>
        </div>

        <div className="space-y-1 flex-grow">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {tool.desc}
          </p>
        </div>
      </article>
    </Link>
  );
}
TILE_CODE

echo "âœ… ToolTile.tsx repaired."
echo "í±‰ Run 'npm run dev' to see your Enterprise Dashboard."
