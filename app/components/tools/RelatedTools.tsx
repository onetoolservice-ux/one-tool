"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { ArrowRight } from "lucide-react";
import { getTheme } from "@/app/lib/theme-config";
import ToolTile from "@/app/shared/ToolTile";

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
        {related.map((tool) => (
          <ToolTile key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
