#!/bin/bash

echo "í´§ Removing invalid escape characters from ToolTile.tsx..."

cat > app/shared/ToolTile.tsx << 'TILE_CODE'
import Link from "next/link";
import { getTheme } from "@/app/lib/theme-config";
import { ArrowUpRight } from "lucide-react";
import React, { isValidElement } from "react";

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

  // Clean up trailing periods (Bug #4)
  const cleanDesc = tool.desc.endsWith('.') ? tool.desc.slice(0, -1) : tool.desc;

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
        bg-white/80 dark:bg-slate-900/80 
        backdrop-blur-sm
        border border-slate-200 dark:border-slate-800
        shadow-sm hover:shadow-lg transition-all duration-300 ease-out
        hover:-translate-y-1
        flex flex-col
        ${theme.border}
      `}>
        
        <div className="flex items-start justify-between mb-4">
          {/* Standardized Icon Box (Bug #3) */}
          <div className={`
            w-12 h-12 flex items-center justify-center
            rounded-xl text-white shadow-md
            transform group-hover:scale-110 transition-transform duration-300
            ${theme.iconBg}
          `}>
            {renderIcon()}
          </div>

          {/* Hover Action */}
          <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2 flex-grow">
          <h3 className={`text-lg font-bold text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${theme.gradient} transition-colors`}>
            {tool.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {cleanDesc}
          </p>
        </div>

        {/* Standardized Badge Position (Bug #12) */}
        {tool.status === "New" && (
          <div className="absolute top-4 right-4">
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r ${theme.gradient} text-white shadow-sm`}>
              New
            </span>
          </div>
        )}

        {/* Decorative Bottom Bar */}
        <div className={`
          absolute bottom-0 left-6 right-6 h-1 rounded-t-full opacity-0 
          group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-r ${theme.gradient}
        `} />
      </article>
    </Link>
  );
}
TILE_CODE

echo "âœ… ToolTile.tsx fully repaired."
echo "í±‰ Run 'npm run dev' - The UI should be perfect now."
