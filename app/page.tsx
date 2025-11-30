"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, LayoutGrid, Star } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import CommandMenu from "@/app/components/layout/CommandMenu";
import SmartWidgets from "@/app/components/dashboard/DynamicWidgets";

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
      const matchesSearch = tool.title.toLowerCase().includes(query.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const favoriteTools = ALL_TOOLS.filter(t => favorites.includes(t.id));

  if (!isClient) return <div className="min-h-screen" />;

  return (
    <div className="w-full px-6 space-y-10 pt-4 pb-20">
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
                    <Link 
                        key={tool.id} 
                        href={tool.href} 
                        className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-all duration-200 hover:-translate-y-0.5 relative rounded-2xl shadow-sm"
                        aria-label={`Open ${tool.title}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-700 group-hover:scale-105 transition-transform`}>
                             <tool.icon size={24} className="text-slate-600 dark:text-slate-300"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            {/* FIX: Changed h4 to h3 for better heading hierarchy */}
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tool.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{tool.desc}</p>
                        </div>
                        <button 
                            onClick={(e) => toggleFavorite(e, tool.id)} 
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition text-amber-400 opacity-0 group-hover:opacity-100"
                            aria-label="Remove from favorites"
                        >
                            <Star size={16} className="fill-amber-400"/>
                        </button>
                    </Link>
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
              <Link 
                key={tool.id} 
                href={tool.href}
                className={`flex items-center gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-all duration-200 group hover:-translate-y-0.5 relative ${tool.status === 'Soon' ? 'opacity-60 grayscale cursor-not-allowed' : ''} shadow-sm`}
                aria-label={`Open ${tool.title}`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <tool.icon size={24} className="text-slate-600 dark:text-slate-300"/>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {/* FIX: Changed h4 to h3 */}
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tool.title}</h3>
                    {tool.status === "New" && <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full uppercase">New</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{tool.desc}</p>
                </div>

                <button 
                    onClick={(e) => toggleFavorite(e, tool.id)} 
                    className={`absolute top-4 right-4 p-1 rounded-full transition-all ${favorites.includes(tool.id) ? 'text-amber-400 opacity-100' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    aria-label={favorites.includes(tool.id) ? "Remove from favorites" : "Add to favorites"}
                >
                    <Star size={16} className={favorites.includes(tool.id) ? "fill-amber-400" : ""} />
                </button>
              </Link>
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
