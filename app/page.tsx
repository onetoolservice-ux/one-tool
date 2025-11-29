"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Suspense } from "react";
import { ArrowRight, Sparkles, LayoutGrid, Star } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import CommandMenu from "@/app/components/layout/CommandMenu";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets"; // New Component

export default function Home() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => { 
    setIsClient(true);
    const saved = localStorage.getItem("onetool-favorites");
    if(saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favorites.includes(id) 
        ? favorites.filter(f => f !== id) 
        : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem("onetool-favorites", JSON.stringify(newFavs));
  };

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const query = searchQuery || "";
      const matchesSearch = tool.name.toLowerCase().includes(query.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const favoriteTools = ALL_TOOLS.filter(t => favorites.includes(t.id));

  if (!isClient) return <div className="min-h-screen bg-[#F8FAFC]" />;

  return (
    <div className="w-full px-6 space-y-10 pt-4 pb-20">
      <CommandMenu />
      <SmartWidgets />
      
      {/* 0. FAVORITES SECTION (Only if exists) */}
      {activeCategory === "All" && !searchQuery && favorites.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
                <Star size={18} className="text-amber-400 fill-amber-400"/>
                <h2 className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase tracking-wider">Favorites</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {favoriteTools.map(tool => (
                    <Link key={tool.id} href={tool.href} className="group flex items-center gap-4 p-5 bg-surface dark:bg-slate-800 dark:bg-surface rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-800 hover:border-[rgb(117,163,163)]/50 hover:  transition-all duration-200 hover:-translate-y-0.5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tool.bg} ${tool.color} group-hover:scale-105 transition-transform`}>{tool.icon}</div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-main dark:text-slate-100 dark:text-slate-200 text-sm truncate group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h4>
                            <p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted truncate mt-1">{tool.desc}</p>
                        </div>
                        <button onClick={(e) => toggleFavorite(e, tool.id)} className="p-1 rounded-full hover:bg-slate-100 transition text-amber-400">
                            <Star size={16} className="fill-amber-400"/>
                        </button>
                    </Link>
                ))}
            </div>
            <div className="h-[1px] bg-slate-200 w-full mt-10"></div>
        </section>
      )}

      {/* 1. MAIN GRID */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
          <LayoutGrid size={18} className="text-muted/70"/>
          <h2 className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase tracking-wider">
            {activeCategory === "All" ? "All Tools" : `${activeCategory} Tools`}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <Link 
                key={tool.id} 
                href={tool.href}
                className={`flex items-center gap-4 p-5 bg-surface dark:bg-slate-800 dark:bg-surface rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-800 hover:border-[rgb(117,163,163)]/50 hover:  transition-all duration-200 group hover:-translate-y-0.5 relative ${tool.status === 'Soon' ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
              >
                <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {tool.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-main dark:text-slate-100 dark:text-slate-200 text-sm truncate group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h4>
                    {tool.status === "New" && <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full uppercase">New</span>}
                  </div>
                  <p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted truncate mt-1">{tool.desc}</p>
                </div>

                {/* Favorite Button (Hidden unless hovered or active) */}
                <button 
                    onClick={(e) => toggleFavorite(e, tool.id)} 
                    className={`absolute top-4 right-4 p-1 rounded-full transition-all ${favorites.includes(tool.id) ? 'text-amber-400 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-background dark:bg-surface dark:bg-slate-950'}`}
                >
                    <Star size={16} className={favorites.includes(tool.id) ? "fill-amber-400" : ""} />
                </button>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-muted/70 border-2 border-dashed border-line dark:border-slate-700 dark:border-slate-800 rounded-2xl bg-background dark:bg-surface dark:bg-slate-950/50">
              <Sparkles className="mx-auto mb-3 opacity-30" size={32}/>
              <p>No tools found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
