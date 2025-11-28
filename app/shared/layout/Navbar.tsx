"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Settings, X, Menu } from "lucide-react";
import { useUI } from "@/app/lib/ui-context";

const CATEGORIES = ["All", "Finance", "Documents", "Health", "Developer", "AI"];

export default function Navbar() {
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory } = useUI();
  const [showSettings, setShowSettings] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    // Force navigation to the root dashboard
    if (window.location.pathname !== "/") {
        router.push("/");
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* TOP ROW */}
          <div className="flex items-center justify-between h-16 gap-4">
            
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[rgb(117,163,163)] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="font-bold text-xs tracking-wider">OT</span>
              </div>
              <span className="font-bold text-slate-800 text-lg tracking-tight hidden sm:inline">One Tool</span>
            </Link>

            {/* Search Bar */}
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

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link href="/about" className="text-sm font-medium text-slate-500 hover:text-slate-900 hidden sm:block">About</Link>
              <button onClick={() => setShowSettings(true)} className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <Settings size={20}/>
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2.5 rounded-lg text-slate-500 hover:bg-slate-100">
                {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
              </button>
            </div>
          </div>

          {/* BOTTOM ROW: Categories */}
          <div className="flex justify-end gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? "bg-[rgb(117,163,163)] text-white border-[rgb(117,163,163)] shadow-md" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {cat === 'All' ? 'Dashboard' : cat}
              </button>
            ))}
          </div>
        </div>
      </nav>
      {/* Settings Drawer OMITTED FOR BREVITY */}
    </>
  );
}
