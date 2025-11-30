#!/bin/bash

echo "íº¨ Resolving Critical Navigation Bug (Router & Layout Sync)..."

# =========================================================
# 1. CREATE SCROLL HOOK (Utility for Layout.tsx)
# =========================================================
echo "âž• Creating useScrollToTop hook..."
mkdir -p app/utils/hooks
cat > app/utils/hooks/useScrollToTop.ts << 'TS_END'
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scrolls the main window to the top on route change
    window.scrollTo(0, 0);
  }, [pathname]);
}
TS_END

# =========================================================
# 2. UPDATE SIDEBAR (Structural Column Fix)
# =========================================================
echo "í» ï¸ Redefining Sidebar as Fixed Navigation Column..."
cat > app/components/layout/Sidebar.tsx << 'TS_END'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wallet, FileText, Heart, Zap, Palette, 
  Terminal, Settings, LayoutGrid, ShieldCheck
} from "lucide-react";

const MENU = [
  { title: "Dashboard", href: "/", icon: <LayoutGrid size={18}/> },
  { title: "Finance", href: "/tools/finance", icon: <Wallet size={18}/> },
  { title: "Documents", href: "/tools/documents", icon: <FileText size={18}/> },
  { title: "Health", href: "/tools/health", icon: <Heart size={18}/> },
  { title: "Developer", href: "/tools/developer", icon: <Terminal size={18}/> },
  { title: "AI", href: "/tools/ai", icon: <Zap size={18}/> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Sidebar is hidden on Home page and always hidden on small devices
  if (isHome) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-64px)] fixed top-16 left-0 bg-surface dark:bg-slate-900 border-r border-line dark:border-slate-800 z-30 shrink-0">
      
      {/* Nav Links (Scrollable) */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apps</p>
        {MENU.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }
              `}
            >
              {item.icon}
              {item.title}
            </Link>
          )
        })}
      </div>

      {/* Footer System Links */}
      <div className="p-4 border-t border-line dark:border-slate-800 bg-surface/50 dark:bg-slate-900/50 flex-shrink-0 space-y-1">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
           <Settings size={18}/> Settings
        </Link>
      </div>
    </aside>
  );
}
TS_END

# =========================================================
# 3. UPDATE NAVBAR (Functional Links & Style Cleanup)
# =========================================================
echo "í¼ Updating Navbar Links and removing Teal CSS..."
cat > app/shared/layout/Navbar.tsx << 'TS_END'
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

  // Note: Old logic for handleCategoryClick and local categories is removed.
  // We use direct Link components now.

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-surface/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-line dark:border-slate-800 transition-all h-16">
        <div className="w-full px-6 h-full flex items-center justify-between gap-8">
          
          {/* 1. BRAND (Cleaned up old hardcoded teal) */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0 min-w-[140px]">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="font-bold text-xs tracking-wider">OT</span>
            </div>
            <span className="font-bold text-main dark:text-white text-lg tracking-tight hidden sm:inline">One Tool</span>
          </Link>

          {/* 2. NAVIGATION (Links fixed) */}
          <div className="hidden xl:flex items-center justify-center">
             <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 backdrop-blur-md">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.href === "/" 
                    ? pathname === "/" 
                    : pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                        ${isActive 
                          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-full outline-none transition-all text-sm"
                placeholder="Search tools..."
              />
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            {/* Smart Guide (Info Icon) */}
            <button 
              onClick={() => setIsAssistantOpen(true)} 
              className="p-2 rounded-full text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <Info size={20} />
            </button>

            {/* Settings Button (Direct Link) */}
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

# =========================================================
# 4. UPDATE ROOT LAYOUT (Final Structural Wire-up)
# =========================================================
echo "í³ Wiring RootLayout (Final Structure)..."
cat > app/layout.tsx << 'TS_END'
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/app/lib/ui-context";
import Navbar from "@/app/shared/layout/Navbar";
import Sidebar from "@/app/components/layout/Sidebar";
import ThemeEngine from "./components/layout/ThemeEngine"; 
import UseScrollToTop from "./utils/hooks/useScrollToTop";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "One Tool | The Privacy-First Digital Toolkit",
  description: "A complete toolkit for Finance, Documents, Health, and Developers. 100% Offline.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} font-sans bg-background dark:bg-surface dark:bg-slate-950 text-main dark:text-slate-50 dark:text-slate-100 antialiased`}>
        <UIProvider>
          <ThemeEngine />
          <UseScrollToTop />
          <Navbar /> {/* Fixed Top Bar */}
          
          {/* Content Wrapper */}
          <div className="flex h-screen pt-16">
              <Sidebar /> {/* Fixed Left Nav (Desktop Only) */}
              
              <main className="flex-1 overflow-y-auto relative lg:ml-64">
                {children}
              </main>
          </div>
          
        </UIProvider>
      </body>
    </html>
  );
}
TS_END

echo "âœ… Final Structural Fix Applied. Run 'npm run dev' now."
