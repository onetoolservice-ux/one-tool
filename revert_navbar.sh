#!/bin/bash

echo "⏪ Reverting Navbar to Classic Static Style..."

cat > app/shared/layout/Navbar.tsx << 'TS_END'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Settings, Info, Menu, X } from "lucide-react";
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
  const pathname = usePathname();

  return (
    <>
      {/* Classic Fixed Navbar - Solid & Reliable */}
      <nav className="fixed top-0 w-full z-[100] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 transition-none">
        <div className="w-full px-6 h-full flex items-center justify-between gap-8">
          
          {/* 1. BRAND */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0 min-w-[140px]">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              OT
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight hidden sm:inline">One Tool</span>
          </Link>

          {/* 2. NAVIGATION (Classic Pills) */}
          <div className="hidden xl:flex items-center justify-center">
             <div className="flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.href === "/" 
                    ? pathname === "/" 
                    : pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`
                        px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${isActive 
                          ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                      `}
                    >
                      {item.label}
                    </Link>
                  );
                })}
             </div>
          </div>

          {/* 3. SEARCH & ACTIONS */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-full outline-none transition-all text-sm"
                placeholder="Search..."
              />
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>

            <button 
              onClick={() => setIsAssistantOpen(true)} 
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

echo "✅ Navbar Reverted. Cleaning cache..."
rm -rf .next
echo "✨ Done. Run 'npm run dev' to see the classic look."
