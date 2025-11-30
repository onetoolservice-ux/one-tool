#!/bin/bash

echo "í³ Optimizing Footer & Layout Density..."

# =========================================================
# 1. CREATE COMPACT FOOTER
# =========================================================
echo "í¶¶ Shrinking Footer to Single Bar..."
cat > app/shared/layout/Footer.tsx << 'TS_END'
"use client";
import Link from "next/link";
import { Github, Twitter, ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="w-full px-6 py-4 md:flex md:items-center md:justify-between text-xs">
        
        {/* Left: Brand & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-slate-500">
           <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[9px]">OT</div>
              <span>One Tool</span>
           </div>
           <span className="hidden md:inline">â€¢</span>
           <span>&copy; {year} Inc.</span>
           <span className="hidden md:inline">â€¢</span>
           <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-indigo-600 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-indigo-600 transition">Terms</Link>
              <a href="mailto:support@onetool.co" className="hover:text-indigo-600 transition">Contact</a>
           </div>
        </div>

        {/* Right: Status & Socials */}
        <div className="mt-4 md:mt-0 flex items-center gap-6 justify-center">
           <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Systems Normal
           </div>
           
           <div className="flex gap-3 text-slate-400">
              <a href="#" className="hover:text-indigo-500 transition"><Github size={14}/></a>
              <a href="#" className="hover:text-indigo-500 transition"><Twitter size={14}/></a>
           </div>
        </div>

      </div>
    </footer>
  );
}
TS_END

# =========================================================
# 2. CREATE SMART PAGE WRAPPER (Handles Dynamic Width)
# =========================================================
echo "í³ Creating Context-Aware Page Wrapper..."
cat > app/components/layout/PageWrapper.tsx << 'TS_END'
"use client";
import { usePathname } from "next/navigation";
import Footer from "@/app/shared/layout/Footer";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div 
      className={`
        flex flex-col min-h-screen pt-16 transition-all duration-300 ease-in-out
        ${isHome ? 'w-full' : 'lg:ml-64'} 
      `}
    >
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
         {/* Content grows to fill space, pushing footer down */}
         <div className="flex-grow">
            {children}
         </div>
         
         {/* Footer sits at the bottom of the flow */}
         <Footer />
      </main>
    </div>
  );
}
TS_END

# =========================================================
# 3. UPDATE ROOT LAYOUT (Use New Wrapper)
# =========================================================
echo "í´Œ Injecting Wrapper into RootLayout..."
cat > app/layout.tsx << 'TS_END'
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/app/lib/ui-context";
import Navbar from "@/app/shared/layout/Navbar";
import Sidebar from "@/app/components/layout/Sidebar";
import ThemeEngine from "./components/layout/ThemeEngine"; 
import UseScrollToTop from "./utils/hooks/useScrollToTop";
import PageWrapper from "@/app/components/layout/PageWrapper"; // New Component

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
          <Navbar /> {/* Fixed Top */}
          <Sidebar /> {/* Fixed Left (Hidden on Home) */}
          
          {/* Smart Wrapper handles the margin logic */}
          <PageWrapper>
            {children}
          </PageWrapper>
          
        </UIProvider>
      </body>
    </html>
  );
}
TS_END

echo "âœ… Footer Optimized & Layout Dynamic. Run 'npm run dev'."
