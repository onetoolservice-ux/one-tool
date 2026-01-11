#!/bin/bash

echo "í¿—ï¸  Restructuring to 3-Layer SaaS Architecture (Home -> Dashboard -> Tool)..."

# 1. MOVE CURRENT HOME TO DASHBOARD
mkdir -p app/dashboard
# We rename the current page.tsx to dashboard/page.tsx
# We also need to update the imports because relative paths might break if we just move it.
# Ideally, we rewrite it to be safe.

cat > app/dashboard/page.tsx << 'DASH_EOF'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, Search, Clock, Layers, Star, ChevronRight, ArrowRight } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import CommandMenu from "@/app/components/layout/CommandMenu";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";
import ToolTile from "@/app/shared/ToolTile";
import { useRecentTools } from "@/app/hooks/useRecentTools";

export default function Dashboard() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { recentTools } = useRecentTools();

  useEffect(() => { 
    setIsClient(true);
    const loadFavs = () => {
      try {
        const saved = localStorage.getItem("onetool-favorites");
        if(saved) setFavorites(JSON.parse(saved));
      } catch (e) {}
    };
    loadFavs();
    window.addEventListener("storage", loadFavs);
    return () => window.removeEventListener("storage", loadFavs);
  }, []);

  const structuredTools = useMemo(() => {
    const cats = ["Finance", "Documents", "Developer", "Health", "Design", "Converters", "AI"];
    
    return cats.map(catName => {
      const toolsInCat = ALL_TOOLS.filter(t => t.category === catName);
      if (toolsInCat.length === 0) return null;

      const subcats: Record<string, typeof ALL_TOOLS> = {};
      toolsInCat.forEach(tool => {
        const sub = tool.subcategory || "General";
        if (!subcats[sub]) subcats[sub] = [];
        subcats[sub].push(tool);
      });

      return { name: catName, subcategories: subcats };
    }).filter(Boolean);
  }, []);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const query = searchQuery || "";
      const name = tool.name || "";
      const desc = tool.desc || "";
      const matchesSearch = name.toLowerCase().includes(query.toLowerCase()) || 
                            desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const favoriteTools = ALL_TOOLS.filter(t => favorites.includes(t.id));

  if (!isClient) return <div className="min-h-screen bg-slate-50 dark:bg-[#020617]" />;

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-[#0B1120]">
       {/* Dashboard Header */}
       <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-3">
                <Link href="/" className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  One Tool <span className="text-indigo-600">App</span>
                </Link>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <h1 className="text-sm font-medium text-slate-500 dark:text-slate-400">Enterprise Workspace</h1>
             </div>
             <div className="w-full md:w-auto min-w-[400px]">
                <CommandMenu />
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-10">
        <SmartWidgets />
        
        {/* RECENTLY USED */}
        {activeCategory === "All" && !searchQuery && recentTools.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-2 mb-4 px-1 opacity-90">
                  <Clock size={16} className="text-indigo-600 dark:text-indigo-400"/>
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Recent Activity</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {recentTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* FAVORITES */}
        {activeCategory === "All" && !searchQuery && favorites.length > 0 && (
          <section>
              <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-amber-500 fill-amber-500"/>
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Starred Tools</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favoriteTools.map(tool => (
                      <ToolTile key={tool.id} tool={tool} />
                  ))}
              </div>
          </section>
        )}

        {/* MAIN CATEGORIES */}
        {!searchQuery && activeCategory === "All" ? (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-16 pb-20">
             {structuredTools.map((cat: any) => (
               <div key={cat.name} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {cat.name}
                     </h2>
                     <Link href={`/tools/${cat.name.toLowerCase()}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 group">
                        View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                     </Link>
                  </div>
                  
                  <div className="space-y-8">
                    {Object.entries(cat.subcategories).map(([subName, tools]: [string, any]) => (
                       <div key={subName}>
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 pl-1 flex items-center gap-2">
                            {subName}
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50"></div>
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {tools.map((tool: any) => (
                              <ToolTile key={tool.id} tool={tool} />
                            ))}
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
             {filteredTools.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
             {filteredTools.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500">
                   No tools found. Try a different keyword.
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
DASH_EOF

# 2. CREATE NEW LANDING PAGE (The "Sales Pitch")
cat > app/page.tsx << 'LANDING_EOF'
import Link from "next/link";
import { ArrowRight, Shield, Zap, Database, Layout, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120]">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 border border-indigo-100 dark:border-indigo-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 Enterprise Edition Now Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Operating System</span> <br className="hidden md:block" />
            for Your Daily Work
          </h1>
          
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            50+ Professional Tools. Finance, Development, Documents, and Health. 
            <br className="hidden md:block"/>
            <strong>100% Client-Side. 100% Privacy. No Login Required.</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1">
                Launch Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/tools/finance/smart-budget">
              <Button variant="secondary" size="lg" className="h-14 px-8 text-lg bg-white dark:bg-slate-800">
                Try Smart Budget
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-slate-50 dark:bg-[#0f172a] py-24">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Professionals Choose One Tool</h2>
             <p className="text-slate-500 mt-4">Built for speed, security, and simplicity.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card className="p-8 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Privacy First</h3>
                <p className="text-slate-500 leading-relaxed">
                  Your data never leaves your browser. Calculations, conversions, and processing happen locally on your device.
                </p>
             </Card>
             
             <Card className="p-8 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <Database size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Local Persistence</h3>
                <p className="text-slate-500 leading-relaxed">
                  Smart Budget, Todo, and Settings are saved automatically to your browser's local storage. No account needed.
                </p>
             </Card>
             
             <Card className="p-8 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Lightning Fast</h3>
                <p className="text-slate-500 leading-relaxed">
                  Built on Next.js 15 and Turbopack. Zero lag, instant tool switching, and optimized for productivity.
                </p>
             </Card>
           </div>
        </div>
      </div>

      {/* Tools Preview */}
      <div className="py-24 border-t border-slate-200 dark:border-slate-800">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
               <div>
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Enterprise Suite</h2>
                 <p className="text-slate-500 mt-2">Everything you need in one place.</p>
               </div>
               <Link href="/dashboard" className="text-indigo-600 font-bold hover:underline hidden md:block">View all 50+ Tools</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {["Smart Budget", "PDF Merge", "SQL Formatter", "Box Breathing", "Regex Tester", "Unit Converter", "Pomodoro", "Smart Loan"].map(name => (
                 <div key={name} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 size={18} className="text-emerald-500" /> {name}
                 </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
LANDING_EOF

# 3. UPDATE TOOL SHELL (Back Button -> Dashboard)
# We need to change the "Back" link in ToolShell.tsx to point to /dashboard instead of /
sed -i 's|Link href="/"|Link href="/dashboard"|g' app/components/layout/ToolShell.tsx

# 4. UPDATE SIDEBAR (Back Button -> Dashboard)
sed -i 's|Link href="/"|Link href="/dashboard"|g' app/components/layout/ToolSidebar.tsx

echo "âœ… 3-Layer Architecture Deployed."
echo "1. Landing Page: / (Marketing)"
echo "2. Dashboard: /dashboard (App Hub)"
echo "3. Tools: /tools/... (Workstation)"
