"use client";
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { getTheme } from '@/app/lib/theme-config';
import { ArrowRight, Star, Frown, Search, Zap, History } from 'lucide-react';
import { useSmartHistory } from '@/app/hooks/useSmartHistory';

export const ToolGrid = () => {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('cat') || 'All Tools';
  const searchQuery = (searchParams.get('q') || '').toLowerCase();
  
  const { recentTools, favoriteTools, mounted } = useSmartHistory();

  const handleToolClick = (toolId: string) => {
    const current = JSON.parse(localStorage.getItem("onetool-recents") || "[]");
    const updated = [toolId, ...current.filter((id: string) => id !== toolId)].slice(0, 8);
    localStorage.setItem("onetool-recents", JSON.stringify(updated));
  };

  const filteredTools = ALL_TOOLS.filter((tool) => {
    if (searchQuery) {
      return tool.name.toLowerCase().includes(searchQuery) || 
             tool.desc.toLowerCase().includes(searchQuery) || 
             tool.category.toLowerCase().includes(searchQuery) ||
             tool.id.toLowerCase().includes(searchQuery);
    }
    if (activeCategory === 'All Tools') return true;
    return tool.category === activeCategory;
  });

  const heroTools = filteredTools.filter(t => t.popular);
  const otherTools = filteredTools.filter(t => !t.popular);

  // --- COMPACT TILE COMPONENT ---
  const ToolCard = ({ tool, hero = false }: { tool: any, hero?: boolean }) => {
    const theme = getTheme(tool.category);
    const Icon = tool.icon;
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    
    return (
      <Link key={tool.id} href={tool.href} onClick={() => handleToolClick(tool.id)} className="group relative block h-full">
        <div 
          ref={divRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setOpacity(1)}
          onMouseLeave={() => setOpacity(0)}
          className={`
            relative h-full rounded-xl border transition-all duration-200 
            bg-white dark:bg-slate-900/50 overflow-hidden hover:border-indigo-400/50 dark:hover:border-indigo-500/50
            ${hero ? 'border-indigo-500/20 dark:border-indigo-500/30 shadow-sm' : 'border-slate-200 dark:border-slate-800'}
            p-3
          `}
        >
          {/* SPOTLIGHT EFFECT */}
          <div 
            className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
            style={{
              opacity,
              background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.1), transparent 40%)`,
            }}
          />

          {/* COMPACT HORIZONTAL LAYOUT */}
          <div className="relative z-10 flex items-start gap-3">
            
            {/* Icon Box (Small & Tight) */}
            <div className={`
               shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors 
               bg-slate-50 dark:bg-slate-800 
               group-hover:bg-white dark:group-hover:bg-slate-700
               ${theme.primary}
            `}>
              <Icon size={18} />
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  {tool.status === 'New' && (
                    <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#638c80]/20 dark:bg-emerald-900/30 text-[#4a6b61] dark:text-[#638c80]">
                      NEW
                    </span>
                  )}
               </div>
               <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight mt-0.5">
                 {tool.desc}
               </p>
            </div>

          </div>
        </div>
      </Link>
    );
  };

  if (filteredTools.length === 0) {
    return (
      <div className="text-center py-20 opacity-50">
        <Frown className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-bold text-slate-500">No tools found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. RECENTS (Compact Row) */}
      {mounted && recentTools.length > 0 && !searchQuery && activeCategory === 'All Tools' && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-2 mb-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider"><History size={12} /> Recent</div>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
             {recentTools.map(tool => <ToolCard key={`recent-${tool.id}`} tool={tool} />)}
           </div>
        </div>
      )}

      {/* 2. FEATURED (Hero Apps) */}
      {heroTools.length > 0 && !searchQuery && (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider"><Zap size={12} fill="currentColor" /> Featured</div>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
             {heroTools.map(tool => <ToolCard key={tool.id} tool={tool} hero={true} />)}
           </div>
        </section>
      )}

      {/* 3. UTILITIES */}
      {otherTools.length > 0 && (
        <section>
           {(!searchQuery && heroTools.length > 0) && <div className="flex items-center gap-2 mb-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-6">Utilities</div>}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
             {otherTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
           </div>
        </section>
      )}
    </div>
  );
};
