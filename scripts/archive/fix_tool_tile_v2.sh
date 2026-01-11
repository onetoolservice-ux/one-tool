#!/bin/bash

echo "í´§ Fixing ToolTile.tsx to match data structure..."

cat > app/shared/ToolTile.tsx << 'TILE_CODE'
import Link from "next/link";
import { getTheme } from "@/app/lib/theme-config";
import { ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";

// Matches the structure in app/lib/tools-data.tsx
interface Tool {
  id: string;
  name: string;       // Was 'title' in previous version
  desc: string;
  icon: ReactNode;    // Was 'string' in previous version
  category: string;
  href?: string;
  status?: string;
}

export default function ToolTile({ tool }: { tool: Tool }) {
  const theme = getTheme(tool.category);
  const href = tool.href || `/tools/${tool.category}/${tool.id}`;

  return (
    <Link 
      href={href} 
      className="group relative block h-full"
    >
      {/* Card Container with Glassmorphism and Theme-based Border */}
      <article className={`
        relative h-full p-6 rounded-2xl
        bg-white/80 dark:bg-slate-900/80 
        backdrop-blur-sm
        border border-slate-200 dark:border-slate-800
        shadow-sm hover:shadow-xl transition-all duration-300 ease-out
        hover:-translate-y-1
        ${theme.border}
      `}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon with Gradient Background */}
          <div className={`
            p-3 rounded-xl text-white shadow-md
            transform group-hover:scale-110 transition-transform duration-300
            flex items-center justify-center
            ${theme.iconBg}
          `}>
            {/* Render the icon directly since it's already a React Element */}
            {tool.icon}
          </div>

          {/* Arrow Icon */}
          <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={`text-lg font-bold text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${theme.gradient} transition-colors`}>
            {tool.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {tool.desc}
          </p>
        </div>

        {/* Status Badge (if new) */}
        {tool.status === "New" && (
          <div className="absolute top-4 right-4">
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r ${theme.gradient} text-white shadow-sm`}>
              New
            </span>
          </div>
        )}

        {/* Bottom Highlight Bar (Decorative) */}
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

echo "âœ… ToolTile.tsx updated."
echo "í±‰ Now run: npm run dev"
