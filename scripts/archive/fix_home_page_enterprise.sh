#!/bin/bash

echo "í´§ Fixing syntax error in Enterprise Home Page..."

cat > app/page.tsx << 'HOME_CODE'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, Search, Clock, Layers, Star, ChevronRight } from "lucide-react";
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

  // Listen for storage events to update favorites instantly
  useEffect(() => { 
    setIsClient(true);
    const loadFavs = () => {
      const saved = localStorage.getItem("onetool-favorites");
      if(saved) setFavorites(JSON.parse(saved));
    };
    loadFavs();
    window.addEventListener("storage", loadFavs);
    return () => window.removeEventListener("storage", loadFavs);
  }, []);

  // Group tools: Category -> Subcategory -> Tools
  const structuredTools = useMemo(() => {
    const cats = ["Finance", "Documents", "Developer", "Health", "Design", "Converters", "AI"];
    
    return cats.map(catName => {
      // Get all tools in this category
      const toolsInCat = ALL_TOOLS.filter(t => t.category === catName);
      if (toolsInCat.length === 0) return null;

      // Group by Subcategory
      const subcats: Record<string, typeof ALL_TOOLS> = {};
      toolsInCat.forEach(tool => {
        const sub = tool.subcategory || "General";
        if (!subcats[sub]) subcats[sub] = [];
        subcats[sub].push(tool);
      });

      return {
        name: catName,
        subcategories: subcats
      };
    }).filter(Boolean);
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

  if (!isClient) return <div className="min-h-screen bg-slate-50 dark:bg-[#020617]" />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Enterprise Header Background - Clean & Subtle */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 pb-8 pt-6 px-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Enterprise Dashboard</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back. Select a utility to begin.</p>
             </div>
             <div className="w-full md:w-auto">
                <CommandMenu />
             </div>
           </div>
           
           <SmartWidgets />
        </div>
      </div>

      <div className="w-full px-6 space-y-10 pt-8 pb-24 max-w-[1600px] mx-auto">
        
        {/* RECENTLY USED (Row 1) */}
        {activeCategory === "All" && !searchQuery && recentTools.length > 0 && (
          <section>
              <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-indigo-600 dark:text-indigo-400"/>
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Recent Activity</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {recentTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* FAVORITES (Row 2) */}
        {activeCategory === "All" && !searchQuery && favorites.length > 0 && (
          <section>
              <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-amber-500 fill-amber-500"/>
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Starred Tools</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favoriteTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* MAIN CATEGORY SECTIONS (The AWS Console Look) */}
        {!searchQuery && activeCategory === "All" ? (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-12">
             {structuredTools.map((cat: any) => (
               <div key={cat.name} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {cat.name}
                     </h2>
                     <Link href={`/tools/${cat.name.toLowerCase()}`} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        View All <ChevronRight size={14}/>
                     </Link>
                  </div>
                  
                  {/* Subcategory Grouping */}
                  <div className="space-y-6">
                    {Object.entries(cat.subcategories).map(([subName, tools]: [string, any]) => (
                       <div key={subName}>
                          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 pl-1">
                            {subName}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {tools.map((tool: any) => (
                              <ToolTile key={tool.id} tool={tool} />
                            ))}
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
             ))}
           </div>
        ) : (
          // SEARCH RESULTS
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {filteredTools.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
             {filteredTools.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500">
                   No tools found. Try a different keyword.
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
HOME_CODE

echo "âœ… Home Page Syntax Fixed."
echo "í±‰ Run 'npm run dev' to verify the Enterprise Layout."
