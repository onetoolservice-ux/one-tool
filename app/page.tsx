"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Search, ArrowRight, Clock, Star, Sparkles, ShieldCheck, Zap, LayoutGrid, Menu } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";

const CATEGORIES = ["All", "Finance", "Documents", "Health", "Developer", "AI"];

export default function PremiumHome() {
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery] = useState("");
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // 1. Load History
  useEffect(() => {
    setIsClient(true);
    const history = localStorage.getItem("ots_history");
    if (history) setRecentToolIds(JSON.parse(history));
  }, []);

  // 2. Track Click
  const trackUsage = (toolId: string) => {
    const newHistory = [toolId, ...recentToolIds.filter(id => id !== toolId)].slice(0, 4);
    setRecentToolIds(newHistory);
    localStorage.setItem("ots_history", JSON.stringify(newHistory));
  };

  // 3. Hero Data (Recents)
  const recentTools = useMemo(() => {
    return ALL_TOOLS.filter(t => recentToolIds.includes(t.id));
  }, [recentToolIds]);

  // 4. Main Grid Filter
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(query.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCat === "All" || tool.category === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [query, activeCat]);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* 1. PREMIUM NAVBAR (With Central Search) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-lg text-slate-800 flex-shrink-0">
            <div className="w-8 h-8 rounded bg-[rgb(117,163,163)] text-white flex items-center justify-center text-xs shadow-sm">OT</div>
            <span className="hidden sm:inline">One Tool</span>
          </div>

          {/* CENTRAL SEARCH BAR (The "Static Something") */}
          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[rgb(117,163,163)] transition-colors" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent border focus:bg-white focus:border-[rgb(117,163,163)] focus:ring-4 focus:ring-teal-500/10 rounded-xl outline-none transition-all text-sm font-medium text-slate-700"
                placeholder="Search tools (e.g. Budget, PDF)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/about" className="text-sm font-medium text-slate-500 hover:text-slate-900 hidden sm:block">Mission</Link>
            <Link href="/tools" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for Fixed Nav */}
      <div className="h-16" />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">

        {/* 2. DYNAMIC HERO SECTION */}
        {/* If user has history -> Show "Jump Back In". If not -> Show "Welcome Banner" */}
        {recentTools.length > 0 ? (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Clock size={18} className="text-[rgb(117,163,163)]"/>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Jump Back In</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentTools.map((tool) => (
                <Link 
                  key={tool.id} 
                  href={tool.href}
                  onClick={() => trackUsage(tool.id)}
                  className="group flex flex-col bg-white p-5 rounded-2xl border border-slate-200 hover:border-[rgb(117,163,163)]/50 hover:shadow-lg transition-all active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center`}>
                      {tool.icon}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-teal-300 mb-4">
                <Sparkles size={14} /> The All-in-One Workspace
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Simplify your digital life.</h1>
              <p className="text-indigo-100 text-lg leading-relaxed mb-8">
                15+ powerful tools for Finance, Documents, and Health. 
                Running entirely in your browser. No servers. No tracking.
              </p>
              <div className="flex gap-4">
                <button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-teal-50 transition-colors">
                  Explore Tools
                </button>
              </div>
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
          </section>
        )}

        {/* 3. MAIN TOOLS GRID */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 px-2 gap-4">
            
            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeCat === cat 
                      ? "bg-slate-800 text-white shadow-md" 
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* The Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.length > 0 ? (
              filteredTools.map(tool => (
                <Link 
                  key={tool.id} 
                  href={tool.href}
                  onClick={() => trackUsage(tool.id)}
                  className="group relative bg-white p-6 rounded-2xl border border-slate-200 hover:border-[rgb(117,163,163)]/40 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      {tool.icon}
                    </div>
                    {tool.status === "New" && <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-md">New</span>}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-[rgb(117,163,163)] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow line-clamp-2">
                    {tool.desc}
                  </p>

                  <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-800 transition-colors mt-auto pt-4 border-t border-slate-50">
                    Open Tool <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform"/>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Search className="mx-auto mb-3 text-slate-300" size={32} />
                <h3 className="text-lg font-bold text-slate-700">No tools found</h3>
                <button onClick={() => {setQuery(""); setActiveCat("All")}} className="mt-2 text-[rgb(117,163,163)] font-semibold hover:underline">Reset Filters</button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
