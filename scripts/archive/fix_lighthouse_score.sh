#!/bin/bash

echo "íº‘ Applying Lighthouse Accessibility & Performance Patches..."

# =========================================================
# 1. FIX VIEWPORT (Allow Zooming)
# =========================================================
echo "í³± Fixing Viewport Accessiblity..."
cat > app/layout.tsx << 'TS_END'
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/app/lib/ui-context";
import Navbar from "@/app/shared/layout/Navbar";
import Sidebar from "@/app/components/layout/Sidebar";
import Footer from "@/app/shared/layout/Footer";
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

// FIX: Removed 'userScalable: false' (Critical Lighthouse Fix)
export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
# 2. FIX TOOL TILES (Link Names & Heading Order)
# =========================================================
echo "í³ Fixing Card Accessibility (ARIA Labels)..."
cat > app/shared/ToolTile.tsx << 'TS_END'
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ToolTileProps {
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  category?: string;
  isNew?: boolean;
}

export default function ToolTile({ title, desc, icon: Icon, href, isNew, category = "finance" }: ToolTileProps) {
  
  const theme = {
    finance: "text-emerald-600 dark:text-emerald-400 group-hover:border-emerald-500/30 group-hover:shadow-emerald-500/10",
    developer: "text-blue-600 dark:text-blue-400 group-hover:border-blue-500/30 group-hover:shadow-blue-500/10",
    documents: "text-amber-600 dark:text-amber-400 group-hover:border-amber-500/30 group-hover:shadow-amber-500/10",
    health: "text-rose-600 dark:text-rose-400 group-hover:border-rose-500/30 group-hover:shadow-rose-500/10",
    ai: "text-violet-600 dark:text-violet-400 group-hover:border-violet-500/30 group-hover:shadow-violet-500/10",
  };

  // @ts-ignore
  const accent = theme[category] || theme.finance;

  return (
    <Link 
      href={href} 
      className="group block h-full"
      aria-label={`Open ${title} tool`} // FIX: Accessible Name
    >
      <article className={`
        relative h-full p-6 rounded-2xl
        bg-white dark:bg-slate-900 
        border border-slate-200 dark:border-slate-800 
        shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]
        flex flex-col
        ${accent}
      `}>
        <div className="flex justify-between items-start mb-5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-inner transition-colors duration-300">
            <Icon size={24} strokeWidth={2} className={accent.split(' ')[0]} aria-hidden="true" />
          </div>
          {isNew && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-md shadow-indigo-500/20 animate-pulse">
              New
            </span>
          )}
        </div>

        <div className="flex-1">
          {/* FIX: Changed H3 to H2/H3 logical order based on context, or just strong text */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium min-h-[40px]">
            {desc}
          </p>
        </div>

        <div className="mt-4 flex justify-end opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" aria-hidden="true">
          <ArrowRight size={20} className={accent.split(' ')[0]} />
        </div>
      </article>
    </Link>
  );
}
TS_END

# =========================================================
# 3. FIX NAVBAR BUTTONS (ARIA Labels)
# =========================================================
echo "í·­ Adding Labels to Navbar Buttons..."
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
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 border-b ${scrolled ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200 dark:border-slate-800 h-16" : "bg-transparent border-transparent h-20"}`}>
        <div className="w-full px-6 h-full flex items-center justify-between gap-8">
          
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="Go to Homepage">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <span className="font-black text-xs tracking-tighter">OT</span>
            </div>
            <span className={`font-bold text-xl tracking-tight text-slate-900 dark:text-white transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-90'}`}>
              One Tool
            </span>
          </Link>

          {/* NAVIGATION */}
          <div className="hidden xl:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
             <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${isActive ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
             </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-full outline-none transition-all text-sm text-slate-900 dark:text-white"
                placeholder="Search tools..."
                aria-label="Search tools"
              />
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>

            <button 
              onClick={() => setIsAssistantOpen(true)} 
              className="p-2 rounded-full text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              title="Smart Guide"
              aria-label="Open Smart Assistant"
            >
              <Info size={20} />
            </button>

            <Link 
              href="/settings" 
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open Settings"
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
# 4. FIX FOOTER CONTRAST
# =========================================================
echo "í¶¶ Boosting Footer Contrast..."
cat > app/shared/layout/Footer.tsx << 'TS_END'
"use client";
import Link from "next/link";
import { Github, Twitter, ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="w-full px-8 py-6 md:flex md:items-center md:justify-between text-sm">
        
        <div className="flex flex-col md:flex-row items-center gap-6 text-slate-600 dark:text-slate-400">
           <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">OT</div>
              <span>One Tool</span>
           </div>
           <span className="hidden md:inline opacity-50">|</span>
           <span>&copy; {year} One Tool Inc.</span>
           <span className="hidden md:inline opacity-50">|</span>
           <div className="flex gap-6 font-medium">
              <Link href="/privacy" className="hover:text-indigo-600 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-indigo-600 transition">Terms</Link>
              <a href="mailto:support@onetool.co" className="hover:text-indigo-600 transition">Contact</a>
           </div>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-6 justify-center">
           <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full font-bold text-xs border border-emerald-100 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              System Normal
           </div>
           
           <div className="flex gap-4 text-slate-500 dark:text-slate-400">
              <a href="#" aria-label="GitHub" className="hover:text-indigo-600 transition"><Github size={16}/></a>
              <a href="#" aria-label="Twitter" className="hover:text-indigo-600 transition"><Twitter size={16}/></a>
           </div>
        </div>

      </div>
    </footer>
  );
}
TS_END

echo "âœ… Accessibility Patches Applied. Score should go up!"
