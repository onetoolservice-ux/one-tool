"use client";

import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { Search, ArrowRight, Clock, Sparkles } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";

const CATEGORIES = ["All", "Finance", "Documents", "Health", "Developer", "Converters", "AI"];

export default function ToolsDashboard() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [recents, setRecents] = useState<string[]>([]);

  // Load recents from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("omne_recent_tools");
    if (saved) setRecents(JSON.parse(saved).slice(0, 3)); // Top 3
  }, []);

  const saveRecent = (id: string) => {
    const newRecents = [id, ...recents.filter(r => r !== id)].slice(0, 5);
    setRecents(newRecents);
    localStorage.setItem("omne_recent_tools", JSON.stringify(newRecents));
  };

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(query.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCat === "All" || tool.category === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [query, activeCat]);

  const recentTools = ALL_TOOLS.filter(t => recents.includes(t.id));

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* 1. Header & Search */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-6 px-4 sticky top-0 z-10 shadow-sm md:static">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Workspace</h1>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tools (Press Cmd+K)..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-[rgb(117,163,163)] focus:ring-2 focus:ring-teal-500/20 rounded-xl outline-none transition-all font-medium text-slate-700"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    activeCat === cat 
                      ? "bg-slate-900 text-white shadow-md" 
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        
        {/* 2. Jump Back In (Recents) */}
        {recentTools.length > 0 && query === "" && activeCat === "All" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={16}/> Jump Back In
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentTools.map(tool => (
                <Link 
                  key={tool.id} 
                  href={tool.href}
                  onClick={() => saveRecent(tool.id)}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg ${tool.bg} ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-700 text-sm">{tool.name}</div>
                    <div className="text-xs text-slate-400">Resume activity</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 3. Main Grid */}
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles size={16}/> All Tools
          </h2>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => (
                <Link 
                  key={tool.id} 
                  href={tool.href}
                  onClick={() => saveRecent(tool.id)}
                  className={`group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${tool.status === 'Soon' ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      {tool.icon}
                    </div>
                    {tool.status === "New" && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md">New</span>}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">{tool.desc}</p>
                  <div className="flex items-center text-sm font-semibold text-slate-900 mt-auto pt-4 border-t border-slate-50">
                    Open Tool <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform text-[rgb(117,163,163)]"/>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Search size={32} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600">No tools found</h3>
              <button onClick={() => {setQuery(""); setActiveCat("All")}} className="mt-2 text-indigo-600 font-semibold hover:underline">Clear Filters</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
