#!/bin/bash

echo "í´§ Fixing 'Fake Star' & 'Mobile UX'..."

# 1. CREATE THEME TOGGLE COMPONENT
# This allows manual switching between Light/Dark mode
mkdir -p app/components/layout
cat > app/components/layout/ThemeToggle.tsx << 'THEME_EOF'
"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference or localStorage
    const isDark = document.documentElement.classList.contains("dark") || 
                   window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title="Toggle Theme"
    >
      {darkMode ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
THEME_EOF

# 2. UPDATE GLOBAL CSS (To support manual class toggling)
cat > app/globals.css << 'CSS_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 15, 23, 42;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

/* Force Dark Mode Variables when .dark class is present */
.dark {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 2, 6, 23;
  --background-end-rgb: 2, 6, 23;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-start-rgb));
}

/* Custom Scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
.dark ::-webkit-scrollbar-thumb { background-color: #334155; }
CSS_EOF

# 3. FIX TOOL SHELL (Real Favorite Button + Theme Toggle)
cat > app/components/layout/ToolShell.tsx << 'SHELL_EOF'
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, LayoutGrid, Star } from "lucide-react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

interface ToolShellProps {
  title: string;
  description: string;
  category: string;
  toolId?: string; // We need this to know WHAT to favorite
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function ToolShell({ title, description, category, toolId, icon, children, actions }: ToolShellProps) {
  const [isFav, setIsFav] = useState(false);
  
  // Logic to sync with Home Page Favorites
  useEffect(() => {
    if (!toolId) return;
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    setIsFav(favs.includes(toolId));
  }, [toolId]);

  const toggleFav = () => {
    if (!toolId) return;
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    let newFavs;
    if (favs.includes(toolId)) {
      newFavs = favs.filter((id: string) => id !== toolId);
    } else {
      newFavs = [...favs, toolId];
    }
    localStorage.setItem("onetool-favorites", JSON.stringify(newFavs));
    setIsFav(!isFav);
    // Notify other components
    window.dispatchEvent(new Event("storage")); 
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Back to Dashboard">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            
            <div className="flex flex-col">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <Home size={10} /> Home
                  </Link>
                  <span>/</span>
                  <Link href="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <LayoutGrid size={10} /> Dashboard
                  </Link>
               </div>
               <div className="flex items-center gap-2 mt-0.5">
                  {icon && (
                    <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                      {icon}
                    </div>
                  )}
                  <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
                    {title}
                  </h1>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            
            {/* REAL FAVORITE BUTTON */}
            <button 
              onClick={toggleFav}
              className={`p-2 rounded-lg transition-colors ${isFav ? 'text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Star size={18} fill={isFav ? "currentColor" : "none"} />
            </button>

            {/* THEME TOGGLE */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           {children}
        </div>
      </main>
    </div>
  );
}
SHELL_EOF

# 4. FIX MOBILE SEARCH HINT
# We are adding 'hidden md:flex' to the CTRL K badge
cat > app/components/layout/CommandMenu.tsx << 'MENU_EOF'
"use client";

import { Search } from "lucide-react";
import { useUI } from "@/app/lib/ui-context";
import { useEffect, useRef } from "react";

export default function CommandMenu() {
  const { searchQuery, setSearchQuery } = useUI();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
        // Optional: trigger GlobalCommand modal here if you prefer that over inline search
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
      <div className="relative flex items-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500">
        <div className="pl-5 text-slate-400 group-hover:text-indigo-500 transition-colors">
           <Search size={20} />
        </div>
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search tools..." 
          className="w-full h-12 md:h-14 px-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-base md:text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="pr-4 flex items-center gap-2">
           {/* FIX: Hidden on mobile */}
           <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-[10px]">CTRL</span> K
           </div>
        </div>
      </div>
    </div>
  );
}
MENU_EOF

echo "âœ… 'Fake' buttons replaced with Real Features."
echo "âœ… Mobile UX Issues fixed."
echo "í±‰ Refresh and test the 'Star' button inside Smart Budget!"
