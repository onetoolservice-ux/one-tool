#!/bin/bash

echo "✨ Applying CTO-Approved UI Polish..."

# 1. Upgrade ToolTile.tsx (Standardized Icons, Badges, & Interactions)
# Addresses Bugs #3, #4, #7, #12
cat > app/shared/ToolTile.tsx << 'TILE_EOF'
import Link from "next/link";
import { getTheme } from "@/app/lib/theme-config";
import { ArrowUpRight } from "lucide-react";
import React, { isValidElement } from "react";

interface Tool {
  id: string;
  name: string;
  desc: string;
  icon: any;
  category: string;
  href?: string;
  status?: string;
}

export default function ToolTile({ tool }: { tool: Tool }) {
  const theme = getTheme(tool.category);
  const href = tool.href || \`/tools/\${tool.category}/\${tool.id}\`;

  // Clean up trailing periods (Bug #4)
  const cleanDesc = tool.desc.endsWith('.') ? tool.desc.slice(0, -1) : tool.desc;

  const renderIcon = () => {
    const Icon = tool.icon;
    if (isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function') {
       const IconComp = Icon as React.ElementType;
       return <IconComp size={24} />;
    }
    return null;
  };

  return (
    <Link 
      href={href} 
      className="group relative block h-full"
    >
      <article className={\`
        relative h-full p-6 rounded-2xl
        bg-white/80 dark:bg-slate-900/80 
        backdrop-blur-sm
        border border-slate-200 dark:border-slate-800
        shadow-sm hover:shadow-lg transition-all duration-300 ease-out
        hover:-translate-y-1
        flex flex-col
        \${theme.border}
      \`}>
        
        <div className="flex items-start justify-between mb-4">
          {/* Standardized Icon Box (Bug #3) */}
          <div className={\`
            w-12 h-12 flex items-center justify-center
            rounded-xl text-white shadow-md
            transform group-hover:scale-110 transition-transform duration-300
            \${theme.iconBg}
          \`}>
            {renderIcon()}
          </div>

          {/* Hover Action */}
          <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2 flex-grow">
          <h3 className={\`text-lg font-bold text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r \${theme.gradient} transition-colors\`}>
            {tool.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {cleanDesc}
          </p>
        </div>

        {/* Standardized Badge Position (Bug #12) */}
        {tool.status === "New" && (
          <div className="absolute top-4 right-4">
            <span className={\`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r \${theme.gradient} text-white shadow-sm\`}>
              New
            </span>
          </div>
        )}

        {/* Decorative Bottom Bar */}
        <div className={\`
          absolute bottom-0 left-6 right-6 h-1 rounded-t-full opacity-0 
          group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-r \${theme.gradient}
        \`} />
      </article>
    </Link>
  );
}
TILE_EOF

# 2. Upgrade SmartWidgets.tsx (Fixing Alignment & "Target" Pill)
# Addresses Bug #2 and #16
cat > app/components/dashboard/SmartWidgets.tsx << 'WIDGET_EOF'
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, CreditCard, Wallet, TrendingUp } from "lucide-react";

export default function SmartWidgets() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState({
    netWorth: 0,
    monthlySpend: 0,
    fireYear: "---"
  });

  useEffect(() => {
    try {
      const nwData = localStorage.getItem("ots_net_worth_v1");
      if (nwData) {
        const items = JSON.parse(nwData);
        const total = items.reduce((acc: number, i: any) => 
          i.type === 'Asset' ? acc + i.value : acc - i.value, 0);
        setData(prev => ({ ...prev, netWorth: total }));
      }
      const budgetData = localStorage.getItem("onetool_budget_v2");
      if (budgetData) {
        const txns = JSON.parse(budgetData);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const spend = txns
          .filter((t: any) => t.date.startsWith(currentMonth) && t.type === 'expense')
          .reduce((acc: number, t: any) => acc + t.amount, 0);
        setData(prev => ({ ...prev, monthlySpend: spend }));
      }
      if (localStorage.getItem("ots_net_worth_v1")) {
         const year = new Date().getFullYear() + 12;
         setData(prev => ({ ...prev, fireYear: String(year) }));
      }
    } catch(e) {}
  }, []);

  const fmt = (n: number) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const blurClass = show ? "" : "blur-sm select-none";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Net Worth */}
      <div className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-4">
           <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
              <Wallet size={24} />
           </div>
           <button 
             onClick={(e) => { e.preventDefault(); setShow(!show); }} 
             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-600 transition relative z-20"
             aria-label={show ? "Hide values" : "Show values"}
           >
              {show ? <Eye size={18}/> : <EyeOff size={18}/>}
           </button>
        </div>
        <div className="space-y-1">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Worth</p>
           <h3 className={\`text-2xl font-extrabold text-slate-900 dark:text-white transition-all \${blurClass}\`}>
              {fmt(data.netWorth)}
           </h3>
        </div>
        <Link href="/tools/finance/smart-net-worth" className="absolute inset-0 z-10" aria-label="Open Net Worth Tool" />
      </div>

      {/* Monthly Spend */}
      <div className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-4">
           <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
              <CreditCard size={24} />
           </div>
        </div>
        <div className="space-y-1">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Spend</p>
           <h3 className={\`text-2xl font-extrabold text-slate-900 dark:text-white transition-all \${blurClass}\`}>
              {fmt(data.monthlySpend)}
           </h3>
        </div>
        <Link href="/tools/finance/smart-budget" className="absolute inset-0 z-10" aria-label="Open Smart Budget Tool" />
      </div>

      {/* Freedom Widget - Fixed Pill Alignment */}
      <div className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-4">
           <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl">
              <TrendingUp size={24} />
           </div>
           {/* FIX: Aligned Badge */}
           <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
              Target Year
           </span>
        </div>
        <div className="space-y-1">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Financial Freedom</p>
           <h3 className={\`text-2xl font-extrabold text-slate-900 dark:text-white transition-all \${blurClass}\`}>
              {data.fireYear}
           </h3>
        </div>
        <Link href="/tools/finance/smart-retirement" className="absolute inset-0 z-10" aria-label="Open Retirement Calculator" />
      </div>

    </div>
  );
}
WIDGET_EOF

# 3. Upgrade Home Page to Categorized Layout
# Addresses Bug #8 (Flat List)
cat > app/page.tsx << 'HOME_EOF'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, LayoutGrid, Star, Clock, Layers } from "lucide-react";
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

  // Group tools by category
  const categories = useMemo(() => {
    const cats = ["Finance", "Documents", "Developer", "Health", "AI"];
    return cats.map(cat => ({
      name: cat,
      tools: ALL_TOOLS.filter(t => t.category === cat)
    })).filter(c => c.tools.length > 0);
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120]">
      {/* HERO BACKGROUND MESH */}
      <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full px-6 space-y-12 pt-10 pb-24 max-w-[1600px] mx-auto">
        
        {/* HERO SECTION */}
        <div className="space-y-8">
           <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                 One Tool <span className="text-indigo-600 dark:text-indigo-400">Enterprise</span>
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
              <div className="flex items-center gap-2 mb-6 px-1 opacity-90">
                  <Clock size={18} className="text-indigo-500"/>
                  <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pick up where you left off</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* FAVORITES */}
        {activeCategory === "All" && !searchQuery && favorites.length > 0 && (
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 md:p-8 animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />
              <div className="flex items-center gap-2 mb-6">
                  <Star size={20} className="text-amber-400 fill-amber-400"/>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Favorites</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {favoriteTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* MAIN CONTENT - CATEGORIZED or SEARCHED */}
        {searchQuery ? (
           <section>
             <div className="flex items-center gap-2 mb-6 px-1 opacity-90">
                <Search size={18} className="text-slate-400"/>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search Results</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
               {filteredTools.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
             </div>
           </section>
        ) : (
          // CATEGORIZED VIEW (Bug #8 Fix)
          <div className="space-y-16">
             {categories.map((cat) => (
               <section key={cat.name}>
                  <div className="flex items-center gap-3 mb-6 px-1 border-b border-slate-200 dark:border-slate-800 pb-4">
                     <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Layers size={18} className="text-slate-500 dark:text-slate-400"/>
                     </div>
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{cat.name}</h2>
                     <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-full">{cat.tools.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {cat.tools.map((tool) => (
                      <ToolTile key={tool.id} tool={tool} />
                    ))}
                  </div>
               </section>
             ))}
          </div>
        )}

      </div>
    </div>
  );
}
HOME_EOF

echo "✅ UI Polish Applied. Run 'npm run dev' to see the transformation."
