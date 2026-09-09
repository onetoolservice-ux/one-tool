"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { ArrowRight } from "lucide-react";
import { getIconComponent } from "@/app/lib/utils/IconMapper";

interface RelatedToolsProps {
  currentToolId: string;
  category: string;
}

export default function RelatedTools({ currentToolId, category }: RelatedToolsProps) {
  const related = useMemo(() => {
    const sameCategory = ALL_TOOLS.filter(
      t => t.category === category && t.id !== currentToolId
    );
    const popular = ALL_TOOLS.filter(
      t => t.popular && t.category !== category && t.id !== currentToolId
    );
    return [...sameCategory, ...popular].slice(0, 4);
  }, [currentToolId, category]);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        You might also like
      </h3>
      {/* SMART GRID: Adapts to sidebar presence automatically */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
        {related.map((tool) => {
          const Icon = getIconComponent(tool.icon);
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all group"
            >
              <div className={`p-2 rounded-lg ${tool.color || ''}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{tool.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.desc}</div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
