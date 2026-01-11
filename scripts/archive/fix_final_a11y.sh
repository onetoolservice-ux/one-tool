#!/bin/bash

echo "â™¿ Applying Final Accessibility Patches (ARIA Labels & Headings)..."

# =========================================================
# 1. FIX HOME PAGE (Favorites Button & Heading Order)
# =========================================================
echo "í¿  Patching Home Page..."
cat > app/page.tsx << 'TS_END'
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
TS_END

# =========================================================
# 2. FIX SMART WIDGETS (Eye Button & Link Labels)
# =========================================================
echo "ï¿½ï¿½ Patching Smart Widgets..."
cat > app/components/dashboard/SmartWidgets.tsx << 'TS_END'
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
      const budgetData = localStorage.getItem("ots_smart_budget_v1");
      if (budgetData) {
        const txns = JSON.parse(budgetData);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const spend = txns
          .filter((t: any) => t.date.startsWith(currentMonth) && t.type === 'Expense')
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
      
      {/* Net Worth Widget */}
      <div className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
           <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
              <Wallet size={24} />
           </div>
           {/* FIX: Added aria-label */}
           <button 
             onClick={(e) => { e.preventDefault(); setShow(!show); }} 
             className="text-slate-400 hover:text-indigo-600 transition relative z-20"
             aria-label={show ? "Hide values" : "Show values"}
           >
              {show ? <Eye size={18}/> : <EyeOff size={18}/>}
           </button>
        </div>
        <div className="space-y-1">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Worth</p>
           <h3 className={`text-2xl font-extrabold text-slate-900 dark:text-white transition-all ${blurClass}`}>
              {fmt(data.netWorth)}
           </h3>
        </div>
        {/* FIX: Added aria-label */}
        <Link href="/tools/finance/smart-net-worth" className="absolute inset-0 z-10" aria-label="Open Net Worth Tool" />
      </div>

      {/* Monthly Spend Widget */}
      <div className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
           <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
              <CreditCard size={24} />
           </div>
        </div>
        <div className="space-y-1">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Spend</p>
           <h3 className={`text-2xl font-extrabold text-slate-900 dark:text-white transition-all ${blurClass}`}>
              {fmt(data.monthlySpend)}
           </h3>
        </div>
        <Link href="/tools/finance/smart-budget" className="absolute inset-0 z-10" aria-label="Open Smart Budget Tool" />
      </div>

      {/* Freedom Widget */}
      <div className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
           <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl">
              <TrendingUp size={24} />
           </div>
           <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 rounded-md">
              Target
           </span>
        </div>
        <div className="space-y-1">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Freedom Year</p>
           <h3 className={`text-2xl font-extrabold text-slate-900 dark:text-white transition-all ${blurClass}`}>
              {data.fireYear}
           </h3>
        </div>
        <Link href="/tools/finance/smart-retirement" className="absolute inset-0 z-10" aria-label="Open Retirement Calculator" />
      </div>

    </div>
  );
}
TS_END

# =========================================================
# 3. FIX FOOTER (Social Links ARIA)
# =========================================================
echo "í¶¶ Patching Footer Links..."
cat > app/shared/layout/Footer.tsx << 'TS_END'
"use client";
import Link from "next/link";
import { Github, Twitter, ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="w-full px-8 py-6 md:flex md:items-center md:justify-between text-sm">
        
        <div className="flex flex-col md:flex-row items-center gap-6 text-slate-600 dark:text-slate-400">
           <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">OT</div>
              <span>One Tool</span>
           </div>
           <span className="hidden md:inline opacity-50">|</span>
           <span>&copy; {year} One Tool Inc.</span>
           <span className="hidden md:inline opacity-50">|</span>
           <div className="flex gap-6 font-medium">
              <Link href="/privacy" className="hover:text-indigo-600 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-indigo-600 transition">Terms</Link>
              <a href="mailto:support@onetool.co" className="hover:text-indigo-600 transition">Contact</a>
           </div>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-6 justify-center">
           <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full font-bold text-xs border border-emerald-100 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              System Normal
           </div>
           
           <div className="flex gap-4 text-slate-500 dark:text-slate-400">
              {/* FIX: Added aria-labels */}
              <a href="#" className="hover:text-indigo-600 transition" aria-label="Visit GitHub Profile"><Github size={16}/></a>
              <a href="#" className="hover:text-indigo-600 transition" aria-label="Visit Twitter Profile"><Twitter size={16}/></a>
           </div>
        </div>

      </div>
    </footer>
  );
}
TS_END

echo "âœ… 100% Accessibility Patches Applied. Run 'npm run dev'."
