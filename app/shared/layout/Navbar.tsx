"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Settings, X, HardDrive, ChevronRight, Menu } from "lucide-react";
import { useUI } from "@/app/lib/ui-context";

const CATEGORIES = ["All", "Finance", "Documents", "Health", "Developer", "AI"];

export default function Navbar() {
  const { 
    searchQuery, setSearchQuery, 
    activeCategory, setActiveCategory 
  } = useUI();
  
  const [showSettings, setShowSettings] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="font-bold text-xs tracking-wider">OT</span>
              </div>
              <span className="font-bold text-slate-800 text-lg tracking-tight hidden sm:inline">One Tool</span>
            </Link>

            <div className="flex-1 max-w-xl relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[rgb(117,163,163)] transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent border focus:bg-white focus:border-[rgb(117,163,163)] focus:ring-4 focus:ring-teal-500/10 rounded-xl outline-none transition-all text-sm font-medium text-slate-700"
                placeholder="Search tools..."
              />
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="Open Settings"
              >
                <Settings size={20}/>
              </button>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
              </button>
            </div>
          </div>

          <div className="flex justify-start md:justify-end overflow-x-auto pb-3 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                      ? "bg-[rgb(117,163,163)] text-white shadow-md shadow-teal-900/10" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-2 shadow-xl">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none mb-4"
              placeholder="Search..."
            />
            <Link href="/about" className="block px-4 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700">About & Mission</Link>
            <Link href="/tools" className="block px-4 py-3 rounded-lg bg-[rgb(117,163,163)] text-white text-sm font-medium">Go to Dashboard</Link>
          </div>
        )}
      </nav>

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl border-l border-slate-200 p-6 animate-in slide-in-from-right duration-200 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-slate-800">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={18}/></button>
            </div>

            <div className="space-y-8 flex-1">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <HardDrive size={14}/> Data
                </label>
                <Link 
                  href="/settings" 
                  onClick={() => setShowSettings(false)}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all group"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-700">Manage Storage</div>
                    <div className="text-xs text-slate-500">Backup or Reset</div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-800" />
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">One Tool Solutions v1.0</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
