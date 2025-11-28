"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { ArrowRight, Clock, Star, Sparkles, LayoutGrid } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";

export default function Home() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  if (!isClient) return <div className="min-h-screen bg-[#F8FAFC]" />;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-10 pt-4 pb-20">
      
      {/* 1. MAIN GRID */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
          <LayoutGrid size={18} className="text-slate-400"/>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {activeCategory === "All" ? "All Tools" : `${activeCategory} Tools`}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <Link 
                key={tool.id} 
                href={tool.href}
                className={`flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-[rgb(117,163,163)]/50 hover:shadow-md transition-all duration-200 group hover:-translate-y-0.5 ${tool.status === 'Soon' ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
              >
                {/* ICON CONTAINER: Compact size w-10 h-10 */}
                <div className={`w-10 h-10 rounded-lg ${tool.bg} ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {tool.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h4>
                    {tool.status === "New" && <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase">New</span>}
                    {tool.status === "Soon" && <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full uppercase">Soon</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{tool.desc}</p>
                </div>
                {tool.status !== 'Soon' && (
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-[rgb(117,163,163)] -translate-x-2 group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100"/>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Sparkles className="mx-auto mb-3 opacity-30" size={32}/>
              <p>No tools found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
