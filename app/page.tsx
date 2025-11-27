"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { ArrowRight, Star, Sparkles, LayoutGrid } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";

export default function Home() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  // 1. Static Popular Tools (Always consistent)
  const heroTools = useMemo(() => {
    return ALL_TOOLS.filter(t => t.popular).slice(0, 4);
  }, []);

  // 2. Filter Logic
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  if (!isClient) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-10 pt-6 pb-20">
      
      {/* 1. HERO SECTION: MOST POPULAR (No conditions) */}
      {!searchQuery && activeCategory === "All" && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
            <Star size={18} className="text-amber-400 fill-amber-400"/>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Most Popular</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {heroTools.map((tool, idx) => (
              <Link 
                key={tool.id} 
                href={tool.href}
                className="group flex flex-col bg-white p-5 rounded-2xl border border-slate-200 hover:border-[rgb(117,163,163)]/50 hover:shadow-md transition-all active:scale-[0.98]"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-10 h-10 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center shadow-sm`}>
                    {tool.icon}
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2. MAIN GRID */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
          {searchQuery || activeCategory !== "All" ? <Sparkles size={18} className="text-[rgb(117,163,163)]"/> : <LayoutGrid size={18} className="text-slate-400"/>}
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {searchQuery ? `Search Results (${filteredTools.length})` : (activeCategory === "All" ? "All Tools" : `${activeCategory} Tools`)}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <Link 
                key={tool.id} 
                href={tool.href}
                className={`flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-[rgb(117,163,163)]/50 hover:shadow-sm transition-all duration-200 group hover:-translate-y-0.5 ${tool.status === 'Soon' ? 'opacity-60 grayscale' : ''}`}
              >
                <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h4>
                    {tool.status === "New" && <span className="text-[9px] font-bold bg-[rgb(117,163,163)]/10 text-[rgb(117,163,163)] px-1.5 py-0.5 rounded-md uppercase">New</span>}
                    {tool.status === "Soon" && <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md uppercase">Soon</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{tool.desc}</p>
                </div>
                {tool.status !== 'Soon' && (
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-[rgb(117,163,163)] -translate-x-2 group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100"/>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-full py-24 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
              <Sparkles className="mx-auto mb-3 opacity-30" size={32}/>
              <p>No tools found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
