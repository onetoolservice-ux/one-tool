"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { ArrowRight } from "lucide-react";
import { getTheme } from "@/app/lib/theme-config";

interface RelatedToolsProps {
  currentToolId: string;
  category: string;
}

export default function RelatedTools({ currentToolId, category }: RelatedToolsProps) {
  const related = useMemo(() => {
    // 1. Get other tools in the same category
    const sameCategory = ALL_TOOLS.filter(
      t => t.category === category && t.id !== currentToolId
    );
    
    // 2. If not enough, fill with "Popular" tools
    const popular = ALL_TOOLS.filter(
      t => t.popular && t.category !== category && t.id !== currentToolId
    );

    // 3. Combine and slice (Take top 3)
    return [...sameCategory, ...popular].slice(0, 3);
  }, [currentToolId, category]);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        You might also like
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((tool) => {
          const theme = getTheme(tool.category);
          return (
            <Link 
              key={tool.id} 
              href={tool.href}
              className="group flex flex-col p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-all hover:-translate-y-1 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl text-white shadow-sm ${theme.iconBg}`}>
                  {tool.icon}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {tool.name}
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow">
                {tool.desc}
              </p>
              <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-auto">
                Try Tool <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform"/>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
