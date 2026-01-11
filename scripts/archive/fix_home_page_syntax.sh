#!/bin/bash

echo "í´§ Fixing syntax error in Home Page..."

cat > app/page.tsx << 'HOME_CODE'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, LayoutGrid, Star, Clock } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import CommandMenu from "@/app/components/layout/CommandMenu";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";
import ToolTile from "@/app/shared/ToolTile";
import { useRecentTools } from "@/app/hooks/useRecentTools";

export default function Home() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { recentTools } = useRecentTools();

  useEffect(() => { 
    setIsClient(true);
    const saved = localStorage.getItem("onetool-favorites");
    if(saved) setFavorites(JSON.parse(saved));
  }, []);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const query = searchQuery || "";
      const name = tool.name || "";
      const desc = tool.desc || "";
      const matchesSearch = name.toLowerCase().includes(query.toLowerCase()) || 
                            desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const favoriteTools = ALL_TOOLS.filter(t => favorites.includes(t.id));

  if (!isClient) return <div className="min-h-screen" />;

  return (
    <div className="w-full px-6 space-y-10 pt-4 pb-20 max-w-[1600px] mx-auto">
      <CommandMenu />
      <SmartWidgets />
      
      {/* RECENTLY USED */}
      {activeCategory === "All" && !searchQuery && recentTools.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
                <Clock size={18} className="text-indigo-500"/>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pick up where you left off</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentTools.map(tool => (
                    <ToolTile key={tool.id} tool={tool} />
                ))}
            </div>
            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 w-full mt-10"></div>
        </section>
      )}

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
HOME_CODE

echo "âœ… Home Page Syntax Fixed."
echo "í±‰ Run 'npm run dev' to see the new features."
