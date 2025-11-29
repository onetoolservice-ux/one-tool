"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, Settings, X, Menu, Info } from "lucide-react";
import { useUI } from "@/app/lib/ui-context";
import SmartAssistant from "@/app/components/layout/SmartAssistant";

const CATEGORIES = ["All", "Finance", "Documents", "Health", "Developer", "AI"];

export default function Navbar() {
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory } = useUI();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    if (window.location.pathname !== "/") router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setIsSettingsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-surface/80 backdrop-blur-xl border-b border-line transition-all print:hidden">
        <div className="w-full px-6 h-16 flex items-center justify-between gap-4">
          
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0 min-w-[140px]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(117,163,163)] to-[rgb(90,140,140)] text-white flex items-center justify-center   group-hover:scale-105 transition-transform">
              <span className="font-bold text-xs tracking-wider">OT</span>
            </div>
            <span className="font-bold text-main text-lg tracking-tight hidden sm:inline">One Tool</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-auto relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/70 group-focus-within:text-[rgb(117,163,163)] transition-colors" size={16} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border-transparent border focus:bg-surface focus:border-[rgb(117,163,163)] focus:ring-4 focus:ring-teal-500/10 rounded-full outline-none transition-all text-sm font-medium text-main placeholder:text-muted/70"
              placeholder="Search tools (Press '/')..."
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 justify-end min-w-[140px]">
            <div className="hidden xl:flex items-center bg-slate-100/50 p-1 rounded-full border border-line/50 mr-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => handleCategoryClick(cat)} className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${activeCategory === cat ? "bg-surface text-[rgb(117,163,163)]   ring-1 ring-slate-200" : "text-muted hover:text-main"}`}>{cat === 'All' ? 'Dash' : cat}</button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

            {/* Theme Toggle Removed for Stability */}

            <button onClick={(e) => { e.stopPropagation(); setIsAssistantOpen(!isAssistantOpen); }} className="p-2 rounded-full text-muted hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Smart Guide">
              <Info size={20} />
            </button>

            <div className="relative" ref={settingsRef}>
              <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-slate-100 text-main' : 'text-muted hover:bg-slate-100'}`}><Settings size={20}/></button>
              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl shadow-xl border border-line overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-1">
                    <Link href="/settings" onClick={() => setIsSettingsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-main hover:bg-background rounded-lg"><Settings size={16}/> Preferences</Link>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="xl:hidden p-2 rounded-lg text-muted hover:bg-slate-100">{isMenuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
          </div>
        </div>
      </nav>
      <SmartAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
}
