#!/bin/bash

echo "✨ Upgrading Navbar: Fixing Links & Adding Motion..."

# 1. Install Animation Library
if [ -f "yarn.lock" ]; then
    yarn add framer-motion
else
    npm install framer-motion
fi

# 2. Create the Animated Navbar
cat > app/shared/layout/Navbar.tsx << 'TS_END'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Settings, Info, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUI } from "@/app/lib/ui-context";
import SmartAssistant from "@/app/components/layout/SmartAssistant";

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
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const pathname = usePathname();

  // Glass Effect on Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`
          fixed top-0 w-full z-[100] transition-all duration-300 border-b
          ${scrolled 
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm h-16" 
            : "bg-transparent border-transparent h-20"
          }
        `}
      >
        <div className="w-full px-6 h-full flex items-center justify-between gap-8">
          
          {/* 1. BRAND */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
               <span className="font-black text-xs tracking-tighter">OT</span>
            </div>
            <span className={`font-bold text-xl tracking-tight transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-90'}`}>
              One Tool
            </span>
          </Link>

          {/* 2. NAVIGATION (CENTERED & ANIMATED) */}
          <div className="hidden xl:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
             <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onMouseEnter={() => setHoveredPath(item.href)}
                      onMouseLeave={() => setHoveredPath(null)}
                      className={`
                        relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}
                      `}
                    >
                      {/* Sliding Hover Background */}
                      {hoveredPath === item.href && (
                        <motion.div
                          layoutId="navbar-hover"
                          className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full shadow-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          style={{ zIndex: -1 }}
                        />
                      )}
                      {/* Active Indicator Dot */}
                      {isActive && (
                        <motion.span 
                          layoutId="navbar-active-dot"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600"
                        />
                      )}
                      {item.label}
                    </Link>
                  );
                })}
             </div>
          </div>

          {/* 3. SEARCH & ACTIONS */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-full outline-none transition-all text-sm"
                placeholder="Search tools..."
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                 <kbd className="hidden group-focus-within:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">/</kbd>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>

            <button 
              onClick={() => setIsAssistantOpen(true)} 
              className="p-2 rounded-full text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              title="AI Assistant"
            >
              <Info size={20} />
            </button>

            <Link 
              href="/settings" 
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </nav>
      <SmartAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
}
TS_END

echo "✅ Navbar Upgraded (Motion + Glass + Routing)."
