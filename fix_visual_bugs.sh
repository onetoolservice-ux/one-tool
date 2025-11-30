#!/bin/bash

echo "í¾¨ Applying Final Visual Fixes (Dark Mode & Buttons)..."

# =========================================================
# 1. FIX GLOBAL LAYOUT BACKGROUND
# =========================================================
echo "í¼‘ Fixing Body Background (Removing 'bg-surface')..."
cat > app/layout.tsx << 'TS_END'
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/app/lib/ui-context";
import Navbar from "@/app/shared/layout/Navbar";
import Sidebar from "@/app/components/layout/Sidebar";
import ThemeEngine from "./components/layout/ThemeEngine"; 
import UseScrollToTop from "./utils/hooks/useScrollToTop";
import PageWrapper from "@/app/components/layout/PageWrapper";

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
      {/* FIX: Removed 'bg-background dark:bg-surface' which caused the white flash. 
          Now explicitly uses Slate-50 (Light) and Slate-950 (Dark) */}
      <body className={`${inter.variable} ${mono.variable} font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased`}>
        <UIProvider>
          <ThemeEngine />
          <UseScrollToTop />
          <Navbar />
          <Sidebar />
          <PageWrapper>
            {children}
          </PageWrapper>
        </UIProvider>
      </body>
    </html>
  );
}
TS_END

# =========================================================
# 2. FIX BUTTON VISIBILITY (No more transparent ghosts)
# =========================================================
echo "í´˜ Boosting Button Visibility..."
cat > app/shared/ui/Button.tsx << 'TS_END'
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[rgb(117,163,163)] text-white hover:bg-[#5f8a8a] shadow-sm hover:shadow-md",
    
    secondary: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm",
    
    // FIX: Ghost is no longer transparent. It has a subtle background for visibility.
    ghost: "bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[rgb(117,163,163)]",
    
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
TS_END

# =========================================================
# 3. FIX NAVBAR INFO BUTTON (Make it visible)
# =========================================================
echo "í·­ Fixing Navbar Icons..."
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all h-16 print:hidden">
        <div className="w-full px-6 h-full flex items-center justify-between gap-4 md:gap-8">
          
          {/* BRAND */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0 min-w-[120px]">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="font-bold text-xs tracking-wider">OT</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight hidden sm:inline">One Tool</span>
          </Link>

          {/* NAVIGATION (Desktop) */}
          <div className="hidden xl:flex items-center justify-center">
             <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
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

          {/* ACTIONS */}
          <div className="flex items-center gap-2 flex-shrink-0 justify-end">
            <div className="relative group hidden md:block mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-lg outline-none transition-all text-sm"
                placeholder="Search..."
              />
            </div>

            {/* Smart Guide (Info) - Fixed Visibility */}
            <button 
              onClick={() => setIsAssistantOpen(true)} 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-colors"
              title="Smart Guide"
            >
              <Info size={20} />
            </button>

            {/* Settings - Fixed Visibility */}
            <Link 
              href="/settings" 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings size={20} />
            </Link>
            
            {/* Mobile Menu Toggle */}
             <button className="xl:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
             </button>
          </div>
        </div>
      </nav>
      <SmartAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
}
TS_END

echo "âœ… Visual Bugs Fixed. Run 'npm run dev'."
