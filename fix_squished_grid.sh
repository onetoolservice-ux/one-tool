#!/bin/bash

echo "í³ Applying 'Smart Auto-Fit' Grids (Preventing Squish)..."

# 1. FIX HOME PAGE (app/page.tsx)
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
  const [favorites, setFavorites] = useState([]);
  const { recentTools } = useRecentTools();

  useEffect(() => { 
    setIsClient(true);
    const loadFavs = () => {
      try {
        const saved = localStorage.getItem("onetool-favorites");
        if(saved) setFavorites(JSON.parse(saved));
      } catch (e) {}
    };
    loadFavs();
    window.addEventListener("storage", loadFavs);
    return () => window.removeEventListener("storage", loadFavs);
  }, []);

  const structuredTools = useMemo(() => {
    const cats = ["Finance", "Documents", "Developer", "Health", "Productivity", "Design", "Converters", "AI"];
    
    return cats.map(catName => {
      const toolsInCat = ALL_TOOLS.filter(t => t.category === catName);
      if (toolsInCat.length === 0) return null;

      const subcats = {};
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

  // CSS Grid Class for Auto-Fitting cards (Min width 280px)
  const gridClass = "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4";

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-[#0B1120] relative overflow-hidden">
      
      {/* ENTERPRISE AURORA BACKGROUND */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-50 pointer-events-none">
        <div className="absolute top-[-10%] -right-[10%] w-[60vw] h-[60vw] bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-rose-500/15 dark:bg-rose-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="w-full px-6 space-y-10 pt-8 pb-24 max-w-[1600px] mx-auto relative z-10">
        
        {/* HERO */}
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
              <div className={gridClass}>
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
              <div className={gridClass}>
                  {favoriteTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* MAIN CATEGORIES */}
        {!searchQuery && activeCategory === "All" ? (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-16">
             {structuredTools.map((cat) => (
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
                    {Object.entries(cat.subcategories).map(([subName, tools]) => (
                       <div key={subName}>
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 pl-1 flex items-center gap-2">
                            {subName}
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50"></div>
                          </h4>
                          
                          {/* SMART GRID FOR SUBCATEGORIES */}
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                            {tools.map((tool) => (
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
          <div className={gridClass}>
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

# 2. FIX CATEGORY PAGE (app/tools/[category]/page.tsx)
cat > app/tools/\[category\]/page.tsx << 'CAT_CODE'
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import ToolTile from "@/app/shared/ToolTile";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category);
  const title = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${title} Tools - One Tool Enterprise`,
    description: `Free online ${title} tools. Secure, fast, and privacy-first utilities for professionals.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const categorySlug = decodeURIComponent(resolvedParams.category).toLowerCase();
  const categoryTools = ALL_TOOLS.filter(t => t.category.toLowerCase() === categorySlug);

  if (!categoryTools.length) return notFound();

  const displayCategory = categoryTools[0].category;
  const subcategories = {};
  categoryTools.forEach(tool => {
    const sub = tool.subcategory || "General";
    if (!subcategories[sub]) subcategories[sub] = [];
    subcategories[sub].push(tool);
  });
  const sortedSubcats = Object.keys(subcategories).sort();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 pb-8 pt-6 px-6">
        <div className="max-w-[1600px] mx-auto">
           <div className="flex items-center gap-4 mb-4">
             <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
               <ArrowLeft size={20} />
             </Link>
             <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
             <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/" className="hover:text-indigo-600">Home</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-medium">{displayCategory}</span>
             </div>
           </div>
           
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
               <Layers size={24} />
             </div>
             {displayCategory} Suite
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl text-lg">
             {categoryTools.length} professional tools available. Secure, client-side, and free.
           </p>
        </div>
      </div>

      <div className="w-full px-6 space-y-12 pt-10 pb-24 max-w-[1600px] mx-auto">
        {sortedSubcats.map((subName) => (
          <section key={subName}>
             <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
               {subName}
             </h2>
             {/* SMART GRID: Ensures minimum width of 280px per card */}
             <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
               {subcategories[subName].map((tool) => (
                 <ToolTile key={tool.id} tool={tool} />
               ))}
             </div>
          </section>
        ))}
      </div>
    </div>
  );
}
CAT_CODE

# 3. FIX RELATED TOOLS (The section inside Tool Pages)
cat > app/components/tools/RelatedTools.tsx << 'RELATED_EOF'
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
RELATED_EOF

echo "âœ… Grids fixed. No more squishing."
echo "í±‰ Run 'npm run dev' and resize your browser window to test."
