#!/bin/bash

echo "í»¡ï¸  Applying Defensive Coding to Home Page..."

cat > app/page.tsx << 'HOME_EOF'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, LayoutGrid, Star } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import CommandMenu from "@/app/components/layout/CommandMenu";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";
import ToolTile from "@/app/shared/ToolTile";

export default function Home() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => { 
    setIsClient(true);
    const saved = localStorage.getItem("onetool-favorites");
    if(saved) setFavorites(JSON.parse(saved));
  }, []);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      // DEFENSIVE CODING: Handle missing data gracefully
      // If tool is null/undefined, skip it
      if (!tool) return false;

      // Check for 'name' OR 'title' to prevent crashes
      // The 'as any' cast allows us to check for 'title' even if the type definition says 'name'
      const toolName = tool.name || (tool as any).title || "";
      const toolDesc = tool.desc || "";
      
      // Safety check: ensure strings exist before calling toLowerCase
      const safeName = typeof toolName === 'string' ? toolName.toLowerCase() : "";
      const safeDesc = typeof toolDesc === 'string' ? toolDesc.toLowerCase() : "";
      const query = searchQuery ? searchQuery.toLowerCase() : "";

      const matchesSearch = safeName.includes(query) || safeDesc.includes(query);
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const favoriteTools = ALL_TOOLS.filter(t => t && favorites.includes(t.id));

  if (!isClient) return <div className="min-h-screen" />;

  return (
    <div className="w-full px-6 space-y-10 pt-4 pb-20 max-w-[1600px] mx-auto">
      <CommandMenu />
      <SmartWidgets />
      
      {/* FAVORITES SECTION */}
      {activeCategory === "All" && !searchQuery && favorites.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
                <Star size={18} className="text-amber-400 fill-amber-400"/>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Favorites</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {favoriteTools.map(tool => (
                    <ToolTile key={tool.id} tool={tool} />
                ))}
            </div>
            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 w-full mt-10"></div>
        </section>
      )}

      {/* MAIN GRID */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
          <LayoutGrid size={18} className="text-slate-400 dark:text-slate-500"/>
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {activeCategory === "All" ? "All Tools" : `${activeCategory} Tools`}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <ToolTile key={tool.id} tool={tool} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
              <Sparkles className="mx-auto mb-3 opacity-30" size={32}/>
              <p>No tools found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
HOME_EOF

echo "âœ… Crash Fixed. Search logic is now safe."
