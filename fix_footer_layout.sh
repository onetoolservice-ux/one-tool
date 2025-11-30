#!/bin/bash

echo "í¶¶ Restoring Footer & expanding layout to 100% width..."

# =========================================================
# 1. UPDATE ROOT LAYOUT (Inject Footer + Sticky Bottom)
# =========================================================
echo "í´Œ Wiring Footer into Layout..."
cat > app/layout.tsx << 'TS_END'
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/app/lib/ui-context";
import Navbar from "@/app/shared/layout/Navbar";
import Sidebar from "@/app/components/layout/Sidebar";
import Footer from "@/app/shared/layout/Footer"; // âœ… Restore Footer Import
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
          <Navbar /> 
          
          <div className="flex h-screen pt-16">
              <Sidebar />
              
              {/* Main Content: Flex-col to push Footer to bottom */}
              <main className="flex-1 overflow-y-auto relative lg:ml-64 flex flex-col">
                <div className="flex-grow">
                  {children}
                </div>
                <Footer /> {/* âœ… Footer is back */}
              </main>
          </div>
          
        </UIProvider>
      </body>
    </html>
  );
}
TS_END

# =========================================================
# 2. MAKE HOME PAGE FLUID (100% Width)
# =========================================================
echo "â†”ï¸ Expanding Home Page to Full Width..."
cat > app/page.tsx << 'TS_END'
"use client";
import ToolTile from "@/app/shared/ToolTile";
import { ALL_TOOLS, Tool } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import { useHistory } from "@/app/utils/hooks/useHistory";
import { History } from "lucide-react";

export default function Home() {
  const { searchQuery } = useUI();
  const { recentIds } = useHistory();

  const filtered = ALL_TOOLS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filtered.reduce((acc, tool) => {
    const cat = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  const recentTools = recentIds.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as Tool[];
  const order = ["Finance", "Developer", "Documents", "Health", "Productivity", "Design"];

  return (
    // FIX: Removed max-w-[1800px]. Now uses w-full for 100% expansion.
    <div className="p-6 md:p-10 w-full space-y-16 animate-in fade-in duration-700">
      
      {/* RECENT APPS */}
      {!searchQuery && recentTools.length > 0 && (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <History size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Jump Back In</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {recentTools.map(tool => (
                    <ToolTile key={'recent-'+tool.id} {...tool} />
                ))}
            </div>
        </div>
      )}

      {/* TOOL GRIDS */}
      <div className="space-y-20">
        {searchQuery ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filtered.map(tool => <ToolTile key={tool.id} {...tool} />)}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        No tools found for "{searchQuery}"
                    </div>
                )}
             </div>
        ) : (
            order.map((cat, i) => grouped[cat] && (
                <div key={cat} className="space-y-6" style={{animationDelay: `${i * 100}ms`}}>
                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {cat}
                        </h2>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-full">{grouped[cat].length}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {grouped[cat].map(tool => <ToolTile key={tool.id} {...tool} />)}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. MAKE FOOTER FLUID (100% Width)
# =========================================================
echo "í¶¶ Expanding Footer Width..."
cat > app/shared/layout/Footer.tsx << 'TS_END'
import Link from "next/link";
import { Github, Twitter, Mail, ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-20">
      {/* FIX: Removed max-w-[1800px]. Now w-full px-10 for full expansion. */}
      <div className="w-full px-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">OT</div>
              <span className="font-bold text-slate-900 dark:text-white text-lg">One Tool</span>
           </div>
           <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
             The privacy-first digital command center. 50+ tools running 100% offline in your browser.
           </p>
        </div>

        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h3>
           <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/tools/finance" className="hover:text-indigo-500">Finance</Link></li>
              <li><Link href="/tools/developer" className="hover:text-indigo-500">Developer</Link></li>
              <li><Link href="/tools/documents" className="hover:text-indigo-500">Documents</Link></li>
           </ul>
        </div>

        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Company</h3>
           <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/privacy" className="hover:text-indigo-500">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-500">Terms</Link></li>
              <li><a href="mailto:support@onetool.co" className="hover:text-indigo-500">Contact</a></li>
           </ul>
        </div>

        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Status</h3>
           <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg w-fit">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Operational
           </div>
        </div>

      </div>
      
      <div className="w-full px-10 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 flex justify-between items-center">
         <p>&copy; {year} One Tool Inc.</p>
         <div className="flex items-center gap-1"><ShieldCheck size={14}/> Secure & Offline</div>
      </div>
    </footer>
  );
}
TS_END

echo "âœ… Layout Expanded. Footer Restored. Run 'npm run dev'."
