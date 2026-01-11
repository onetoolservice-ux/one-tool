#!/bin/bash

echo "íº‘ Restoring app/page.tsx from corruption..."

# Using quoted EOF to ensure absolutely no shell interference
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

  const structuredTools = useMemo(() => {
    const cats = ["Finance", "Documents", "Developer", "Health", "Design", "Converters", "AI"];
    
    return cats.map(catName => {
      const toolsInCat = ALL_TOOLS.filter(t => t.category === catName);
      if (toolsInCat.length === 0) return null;

      const subcats: Record<string, typeof ALL_TOOLS> = {};
      toolsInCat.forEach(tool => {
        const sub = tool.subcategory || "General";
        if (!subcats[sub]) subcats[sub] = [];
        subcats[sub].push(tool);
      });

      return { name: catName, subcategories: subcats };
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
    <div className="min-h-screen bg-slate-50/30 dark:bg-[#0B1120] relative overflow-hidden">
      
      {/* í¾¨ ENTERPRISE AURORA BACKGROUND */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-50 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[-10%] -right-[10%] w-[60vw] h-[60vw] bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="w-full px-6 space-y-10 pt-8 pb-24 max-w-[1600px] mx-auto relative z-10">
        
        {/* HERO SECTION */}
        <div className="space-y-8">
           <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                 One Tool <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">Enterprise</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                 Privacy-first utility suite. No login. Local storage.
              </p>
           </div>
           
           <CommandMenu />
           <SmartWidgets />
        </div>
        
        {/* RECENTLY USED */}
        {activeCategory === "All" && !searchQuery && recentTools.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
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

        {/* FAVORITES */}
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

        {/* MAIN CATEGORIES */}
        {!searchQuery && activeCategory === "All" ? (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-16">
             {structuredTools.map((cat: any) => (
               <div key={cat.name} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {cat.name}
                     </h2>
                     <Link href={`/tools/${cat.name.toLowerCase()}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 group">
                        View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                     </Link>
                  </div>
                  
                  <div className="space-y-8">
                    {Object.entries(cat.subcategories).map(([subName, tools]: [string, any]) => (
                       <div key={subName}>
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 pl-1 flex items-center gap-2">
                            {subName}
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50"></div>
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

echo "âœ… File restored. Encoding fixed."
echo "í±‰ Run 'npm run dev' to verify."
