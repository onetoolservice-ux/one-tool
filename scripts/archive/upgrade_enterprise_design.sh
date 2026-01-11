#!/bin/bash

echo "í¿¢ Transforming OneTool into Enterprise Architecture..."

# 1. UPDATE DATA WITH TAXONOMY (Subcategories)
# We are adding a 'subcategory' field to categorize tools intelligently.
cat > app/lib/tools-data.tsx << 'DATA_EOF'
import React from "react";
import { 
  Wallet, Calculator, Lock, Layers, Image, Zap, Braces, Heart, Wind, Sparkles, Scale, RefreshCw, FileText, Palette, QrCode, Type, Contrast, TrendingUp, Droplets, PieChart, Crop, Landmark, Briefcase, Code2, Database, Wifi, FileCode, Split, Clock, Scissors, CheckCircle, ArrowRight, Ratio, Binary, Key, Link, Hash, Fingerprint, Shield, Network, Globe, Terminal, Server, Activity, Box, Minimize, Search, Command, ScanLine, FileSpreadsheet, FileType, Dumbbell, Mic, BrainCircuit, Ruler, Pipette, Timer, ListTodo, StickyNote, FileJson, FileDigit, Languages, Mail
} from "lucide-react";

export const ALL_TOOLS = [
  // --- FINANCE ---
  { id: "smart-budget", name: "Smart Budget", desc: "Enterprise G/L & Expense Tracking.", category: "Finance", subcategory: "Personal Finance", href: "/tools/finance/smart-budget", icon: <Wallet size={20} />, status: "Ready", popular: true },
  { id: "smart-loan", name: "Smart Loan", desc: "Amortization & Interest Calc.", category: "Finance", subcategory: "Calculators", href: "/tools/finance/smart-loan", icon: <Calculator size={20} />, status: "Ready", popular: true },
  { id: "smart-debt", name: "Smart Debt", desc: "Snowball/Avalanche Payoff.", category: "Finance", subcategory: "Calculators", href: "/tools/finance/smart-debt", icon: <PieChart size={20} />, status: "Ready", popular: false },
  { id: "smart-net-worth", name: "Smart Net Worth", desc: "Total Asset Tracker.", category: "Finance", subcategory: "Personal Finance", href: "/tools/finance/smart-net-worth", icon: <Landmark size={20} />, status: "Ready", popular: false },
  { id: "smart-retirement", name: "Smart Retirement", desc: "FIRE Projection Engine.", category: "Finance", subcategory: "Planning", href: "/tools/finance/smart-retirement", icon: <Briefcase size={20} />, status: "Ready", popular: false },
  { id: "smart-sip", name: "Smart SIP", desc: "Mutual Fund Wealth Builder.", category: "Finance", subcategory: "Investments", href: "/tools/finance/smart-sip", icon: <TrendingUp size={20} />, status: "Ready", popular: true },

  // --- DOCUMENTS ---
  { id: "smart-pdf-merge", name: "PDF Merge", desc: "Combine multiple PDFs.", category: "Documents", subcategory: "PDF Tools", href: "/tools/documents/pdf/merge", icon: <Layers size={20} />, status: "Ready", popular: true },
  { id: "smart-pdf-split", name: "PDF Split", desc: "Extract pages instantly.", category: "Documents", subcategory: "PDF Tools", href: "/tools/documents/pdf/split", icon: <Scissors size={20} />, status: "Ready", popular: false },
  { id: "smart-scan", name: "Smart Scan", desc: "Images to PDF Converter.", category: "Documents", subcategory: "PDF Tools", href: "/tools/documents/smart-scan", icon: <ScanLine size={20} />, status: "New", popular: true },
  { id: "smart-word", name: "Smart Word", desc: "Distraction-free Writer.", category: "Documents", subcategory: "Editors", href: "/tools/documents/smart-word", icon: <FileText size={20} />, status: "New", popular: false },
  { id: "smart-excel", name: "Smart Excel", desc: "Web Spreadsheet Editor.", category: "Documents", subcategory: "Editors", href: "/tools/documents/smart-excel", icon: <FileSpreadsheet size={20} />, status: "New", popular: false },
  { id: "smart-ocr", name: "Smart OCR", desc: "Extract Text from Images.", category: "Documents", subcategory: "Converters", href: "/tools/documents/smart-ocr", icon: <FileType size={20} />, status: "New", popular: true },
  { id: "smart-json", name: "JSON Formatter", desc: "Validate & Beautify JSON.", category: "Documents", subcategory: "Converters", href: "/tools/documents/json/formatter", icon: <Braces size={20} />, status: "Ready", popular: false },

  // --- HEALTH ---
  { id: "smart-bmi", name: "Smart BMI", desc: "Body Mass Index.", category: "Health", subcategory: "Body Metrics", href: "/tools/health/smart-bmi", icon: <Scale size={20} />, status: "New", popular: true },
  { id: "smart-breath", name: "Box Breathing", desc: "Stress Relief Guide.", category: "Health", subcategory: "Wellness", href: "/tools/health/smart-breath", icon: <Wind size={20} />, status: "New", popular: false },
  { id: "smart-workout", name: "HIIT Timer", desc: "Interval Training.", category: "Health", subcategory: "Fitness", href: "/tools/health/smart-workout", icon: <Dumbbell size={20} />, status: "New", popular: false },

  // --- DEVELOPER ---
  // Database
  { id: "smart-sql", name: "SQL Formatter", desc: "Beautify Queries.", category: "Developer", subcategory: "Database", href: "/tools/developer/smart-sql", icon: <Database size={20} />, status: "Ready", popular: true },
  
  // Code/String
  { id: "smart-regex", name: "Regex Tester", desc: "Pattern Matching.", category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-regex", icon: <Code2 size={20} />, status: "Ready", popular: true },
  { id: "smart-diff", name: "Text Diff", desc: "Compare Code.", category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-diff", icon: <Split size={20} />, status: "Ready", popular: false },
  { id: "smart-json2ts", name: "JSON to TS", desc: "Generate Interfaces.", category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-json2ts", icon: <FileCode size={20} />, status: "New", popular: true },
  { id: "smart-min", name: "Smart Minify", desc: "Compress Code.", category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-min", icon: <Minimize size={20} />, status: "New", popular: false },
  
  // Security
  { id: "smart-pass", name: "Password Gen", desc: "Secure Strings.", category: "Developer", subcategory: "Security", href: "/tools/developer/smart-pass", icon: <Lock size={20} />, status: "Ready", popular: true },
  { id: "smart-hash", name: "Hash Gen", desc: "MD5, SHA-256.", category: "Developer", subcategory: "Security", href: "/tools/developer/smart-hash", icon: <Fingerprint size={20} />, status: "New", popular: false },
  { id: "smart-jwt", name: "JWT Decoder", desc: "Token Debugger.", category: "Developer", subcategory: "Security", href: "/tools/developer/smart-jwt", icon: <Key size={20} />, status: "New", popular: true },
  { id: "smart-chmod", name: "Chmod Calc", desc: "Permission Codes.", category: "Developer", subcategory: "Security", href: "/tools/developer/smart-chmod", icon: <Shield size={20} />, status: "New", popular: false },

  // Network/Web
  { id: "smart-url", name: "URL Parser", desc: "Decode/Encode.", category: "Developer", subcategory: "Network & Web", href: "/tools/developer/smart-url", icon: <Link size={20} />, status: "New", popular: true },
  { id: "smart-base64", name: "Base64", desc: "Encode/Decode.", category: "Developer", subcategory: "Network & Web", href: "/tools/developer/smart-base64", icon: <Binary size={20} />, status: "New", popular: false },
  { id: "smart-curl", name: "Curl Builder", desc: "API Requests.", category: "Developer", subcategory: "Network & Web", href: "/tools/developer/smart-curl", icon: <Command size={20} />, status: "New", popular: false },
  { id: "smart-http", name: "HTTP Codes", desc: "Status Lookup.", category: "Developer", subcategory: "Network & Web", href: "/tools/developer/smart-http", icon: <Activity size={20} />, status: "New", popular: false },
  { id: "smart-subnet", name: "Subnet Calc", desc: "CIDR Notation.", category: "Developer", subcategory: "Network & Web", href: "/tools/developer/smart-subnet", icon: <Network size={20} />, status: "New", popular: false },
  
  // SysAdmin
  { id: "smart-cron", name: "Cron Guru", desc: "Schedule Patterns.", category: "Developer", subcategory: "SysAdmin", href: "/tools/developer/smart-cron", icon: <Clock size={20} />, status: "New", popular: false },
  { id: "smart-git", name: "Git Cheats", desc: "Command Ref.", category: "Developer", subcategory: "SysAdmin", href: "/tools/developer/smart-git", icon: <Terminal size={20} />, status: "New", popular: false },
  { id: "smart-uuid", name: "UUID Gen", desc: "Unique IDs.", category: "Developer", subcategory: "SysAdmin", href: "/tools/developer/smart-uuid", icon: <Hash size={20} />, status: "New", popular: false },

  // --- DESIGN ---
  { id: "color-picker", name: "Color Picker", desc: "HEX/RGB/HSL.", category: "Design", subcategory: "Color", href: "/tools/design/picker", icon: <Pipette size={20} />, status: "New", popular: true },
  { id: "contrast-checker", name: "Contrast", desc: "Accessibility.", category: "Design", subcategory: "Color", href: "/tools/design/contrast", icon: <Contrast size={20} />, status: "New", popular: true },
  { id: "aspect-ratio", name: "Aspect Ratio", desc: "Screen Calc.", category: "Design", subcategory: "Layout", href: "/tools/design/aspect-ratio", icon: <Ratio size={20} />, status: "New", popular: false },

  // --- CONVERTERS ---
  { id: "json-csv", name: "JSON <> CSV", desc: "Data Transform.", category: "Converters", subcategory: "File Formats", href: "/tools/converters/json-csv", icon: <FileJson size={20} />, status: "New", popular: true },
  { id: "unit-convert", name: "Unit Converter", desc: "Metric/Imperial.", category: "Converters", subcategory: "Measurements", href: "/tools/converters/unit", icon: <RefreshCw size={20} />, status: "New", popular: false },

  // --- AI ---
  { id: "smart-chat", name: "Smart Chat", desc: "Local Bot UI.", category: "AI", subcategory: "Chat", href: "/tools/ai/smart-chat", icon: <Sparkles size={20} />, status: "New", popular: true },
];
DATA_EOF

# 2. REBUILD TOOL TILE (The "Pro" Card)
# Stricter design: Smaller rounded corners (lg), solid borders, refined typography.
cat > app/shared/ToolTile.tsx << 'TILE_EOF'
"use client";

import Link from "next/link";
import { getTheme } from "@/app/lib/theme-config";
import { ArrowUpRight, Star } from "lucide-react";
import React, { isValidElement, useState, useEffect } from "react";

interface Tool {
  id: string;
  name: string;
  desc: string;
  icon: any;
  category: string;
  href?: string;
  status?: string;
}

export default function ToolTile({ tool }: { tool: Tool }) {
  const theme = getTheme(tool.category);
  const href = tool.href || \`/tools/\${tool.category}/\${tool.id}\`;
  const [isFav, setIsFav] = useState(false);

  // Quick Favorite Action
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    setIsFav(favs.includes(tool.id));
  }, [tool.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    let newFavs;
    if (favs.includes(tool.id)) {
      newFavs = favs.filter((id: string) => id !== tool.id);
    } else {
      newFavs = [...favs, tool.id];
    }
    localStorage.setItem("onetool-favorites", JSON.stringify(newFavs));
    setIsFav(!isFav);
    // Dispatch custom event so Home page can update instantly
    window.dispatchEvent(new Event("storage")); 
  };

  const renderIcon = () => {
    const Icon = tool.icon;
    if (isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function') {
       const IconComp = Icon as React.ElementType;
       return <IconComp size={20} />;
    }
    return null;
  };

  return (
    <Link 
      href={href} 
      className="group relative block h-full"
    >
      <article className="relative h-full p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 flex flex-col shadow-sm hover:shadow-md">
        
        <div className="flex items-start justify-between mb-4">
          {/* Icon: Smaller, tighter, professional */}
          <div className={\`
            w-10 h-10 flex items-center justify-center
            rounded-lg text-slate-600 dark:text-slate-300
            bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700
            group-hover:text-white group-hover:\${theme.iconBg.replace('bg-gradient-to-br', 'bg')} 
            transition-all duration-200
          \`}>
            {renderIcon()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
             <button 
               onClick={toggleFav}
               className={\`p-1.5 rounded-md transition-colors \${isFav ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-500'}\`}
             >
               <Star size={16} fill={isFav ? "currentColor" : "none"} />
             </button>
          </div>
        </div>

        <div className="space-y-1 flex-grow">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {tool.desc}
          </p>
        </div>
      </article>
    </Link>
  );
}
TILE_EOF

# 3. REBUILD HOME PAGE (Group by Subcategory)
# This creates the "AWS Console" / "Stripe Dashboard" look.
cat > app/page.tsx << 'HOME_EOF'
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, Search, Clock, Layers, Star, ChevronRight } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import CommandMenu from "@/app/components/layout/CommandMenu";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";
import ToolTile from "@/app/shared/ToolTile";
import { useRecentTools } from "@/app/hooks/useRecentTools";

export default function Home() {
  const { searchQuery, activeCategory } = useUI();
  const [isClient, setIsClient] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { recentTools } = useRecentTools();

  // Listen for storage events to update favorites instantly
  useEffect(() => { 
    setIsClient(true);
    const loadFavs = () => {
      const saved = localStorage.getItem("onetool-favorites");
      if(saved) setFavorites(JSON.parse(saved));
    };
    loadFavs();
    window.addEventListener("storage", loadFavs);
    return () => window.removeEventListener("storage", loadFavs);
  }, []);

  // Group tools: Category -> Subcategory -> Tools
  const structuredTools = useMemo(() => {
    const cats = ["Finance", "Documents", "Developer", "Health", "Design", "Converters", "AI"];
    
    return cats.map(catName => {
      // Get all tools in this category
      const toolsInCat = ALL_TOOLS.filter(t => t.category === catName);
      if (toolsInCat.length === 0) return null;

      // Group by Subcategory
      const subcats: Record<string, typeof ALL_TOOLS> = {};
      toolsInCat.forEach(tool => {
        const sub = tool.subcategory || "General";
        if (!subcats[sub]) subcats[sub] = [];
        subcats[sub].push(tool);
      });

      return {
        name: catName,
        subcategories: subcats
      };
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Enterprise Header Background - Clean & Subtle */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 pb-8 pt-6 px-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Enterprise Dashboard</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back. Select a utility to begin.</p>
             </div>
             <div className="w-full md:w-auto">
                <CommandMenu />
             </div>
           </div>
           
           <SmartWidgets />
        </div>
      </div>

      <div className="w-full px-6 space-y-10 pt-8 pb-24 max-w-[1600px] mx-auto">
        
        {/* RECENTLY USED (Row 1) */}
        {activeCategory === "All" && !searchQuery && recentTools.length > 0 && (
          <section>
              <div className="flex items-center gap-2 mb-4">
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

        {/* FAVORITES (Row 2) */}
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

        {/* MAIN CATEGORY SECTIONS (The AWS Console Look) */}
        {!searchQuery && activeCategory === "All" ? (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-12">
             {structuredTools.map((cat: any) => (
               <div key={cat.name} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {cat.name}
                     </h2>
                     <Link href={\`/tools/\${cat.name.toLowerCase()}\`} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                        View All
                     </Link>
                  </div>
                  
                  {/* Subcategory Grouping */}
                  <div className="space-y-6">
                    {Object.entries(cat.subcategories).map(([subName, tools]: [string, any]) => (
                       <div key={subName}>
                          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 pl-1">
                            {subName}
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
          // SEARCH RESULTS
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
HOME_EOF

echo "âœ… Enterprise Upgrade Complete."
echo "í±‰ Run 'npm run dev' and see the 'AWS Console' style layout."
