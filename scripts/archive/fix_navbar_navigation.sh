#!/bin/bash

echo "í·­ Wiring up Navigation Bar..."

cat > app/shared/layout/Navbar.tsx << 'TS_END'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Settings, X, Menu, Info } from "lucide-react";
import { useUI } from "@/app/lib/ui-context";
import SmartAssistant from "@/app/components/layout/SmartAssistant";

// Map categories to their actual URL paths
const NAV_ITEMS = [
  { label: "Dash", href: "/" },
  { label: "Finance", href: "/tools/finance" },
  { label: "Documents", href: "/tools/documents" },
  { label: "Health", href: "/tools/health" },
  { label: "Developer", href: "/tools/developer" },
  { label: "AI", href: "/tools/ai" },
];

export default function Navbar() {
  const { searchQuery, setSearchQuery } = useUI();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-surface/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-line dark:border-slate-800 transition-all print:hidden">
        <div className="w-full px-6 h-16 flex items-center justify-between gap-4">
          
          {/* BRAND */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0 min-w-[140px]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="font-bold text-xs tracking-wider">OT</span>
            </div>
            <span className="font-bold text-main dark:text-white text-lg tracking-tight hidden sm:inline">One Tool</span>
          </Link>

          {/* SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent border focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-full outline-none transition-all text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              placeholder="Search tools (Press '/')..."
            />
          </div>

          {/* NAVIGATION */}
          <div className="flex items-center gap-2 flex-shrink-0 justify-end min-w-[140px]">
            
            {/* Desktop Menu */}
            <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 mr-2">
              {NAV_ITEMS.map(item => {
                // Check if active (Exact match for Dash, StartsWith for others)
                const isActive = item.href === "/" 
                  ? pathname === "/" 
                  : pathname.startsWith(item.href);

                return (
                  <Link 
                    key={item.label} 
                    href={item.href} 
                    className={`
                      px-3 py-1 rounded-full text-[11px] font-bold transition-all
                      ${isActive 
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            {/* Smart Guide Button (The "I" Icon) */}
            <button 
              aria-label="Open Guide" 
              onClick={(e) => { e.stopPropagation(); setIsAssistantOpen(!isAssistantOpen); }} 
              className={`p-2 rounded-full transition-colors ${isAssistantOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
              title="Smart Guide"
            >
              <Info size={20} />
            </button>

            {/* Settings Button (Direct Link) */}
            <Link 
              href="/settings" 
              aria-label="Settings"
              className={`p-2 rounded-full transition-colors ${pathname === '/settings' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
            >
              <Settings size={20}/>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              aria-label="Toggle Menu" 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="xl:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Smart Guide Overlay */}
      <SmartAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
}
TS_END

echo "âœ… Navbar Navigation Fixed. Links now work correctly."
