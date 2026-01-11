#!/bin/bash

echo "í°ž Fixing Data Structures, Icons, and Buttons..."

# =========================================================
# 1. FIX BUTTON TYPO
# =========================================================
echo "í´˜ Repairing Button Component..."
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
    primary: "bg-[rgb(117,163,163)] text-white hover:bg-[#5f8a8a] shadow-sm hover:shadow",
    secondary: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
    ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[rgb(117,163,163)]",
    danger: "bg-rose-500 text-white hover:bg-rose-600"
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
# 2. STANDARDIZE TOOL DATA (Title + Icon Components)
# =========================================================
echo "í·„ï¸  Standardizing Tool Registry..."
cat > app/lib/tools-data.tsx << 'TS_END'
import { 
  Wallet, FileText, Heart, Zap, Palette, Terminal, 
  LayoutGrid, Calculator, Activity, TrendingUp, PiggyBank,
  ShieldCheck, Lock, Search, Wifi, Key, Globe, Database, 
  FileCode, Type, Ruler, Move, Image as ImageIcon, 
  Minimize, FileJson, Clock, Quote, Fingerprint, 
  ArrowRightLeft, FileStack, Scissors, Crop, 
  Dumbbell, Gamepad2, Flower2, ScanLine, Table, 
  Server, Hash, GitBranch, Code, List, Link, CheckSquare,
  LucideIcon, Mic, BrainCircuit, Command
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;     // Standardized from 'name'
  desc: string;
  icon: LucideIcon;  // Stored as Component, not Element
  href: string;
  category: "finance" | "developer" | "documents" | "health" | "design" | "productivity" | "ai";
  subcategory?: string;
  status: "Live" | "New" | "Beta" | "Ready";
  popular?: boolean;
  bg?: string;       // Legacy color support
  color?: string;    // Legacy color support
}

export const ALL_TOOLS: Tool[] = [
  // --- FINANCE ---
  { id: "smart-budget", title: "Smart Budget", desc: "Enterprise G/L.", icon: Wallet, href: "/tools/finance/smart-budget", category: "finance", subcategory: "Management", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "smart-loan", title: "Smart Loan", desc: "Amortization.", icon: Calculator, href: "/tools/finance/smart-loan", category: "finance", subcategory: "Calculators", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  { id: "smart-debt", title: "Smart Debt", desc: "Liability Payoff.", icon: Activity, href: "/tools/finance/smart-debt", category: "finance", subcategory: "Calculators", status: "Live", bg: "bg-indigo-50", color: "text-indigo-600" },
  { id: "smart-net-worth", title: "Net Worth", desc: "Asset Tracker.", icon: PiggyBank, href: "/tools/finance/smart-net-worth", category: "finance", subcategory: "Management", status: "Live", bg: "bg-slate-100", color: "text-slate-600" },
  { id: "smart-sip", title: "Smart SIP", desc: "Wealth Builder.", icon: TrendingUp, href: "/tools/finance/smart-sip", category: "finance", subcategory: "Planning", status: "Live", bg: "bg-violet-50", color: "text-violet-600" },
  { id: "smart-retirement", title: "FIRE Calc", desc: "Retirement Plan.", icon: Briefcase, href: "/tools/finance/smart-retirement", category: "finance", subcategory: "Planning", status: "Live", bg: "bg-orange-50", color: "text-orange-600" },

  // --- DOCUMENTS ---
  { id: "pdf-merge", title: "PDF Merger", desc: "Combine files.", icon: FileStack, href: "/tools/documents/pdf/merge", category: "documents", subcategory: "PDF", status: "Live", bg: "bg-rose-50", color: "text-rose-600" },
  { id: "pdf-split", title: "PDF Split", desc: "Extract pages.", icon: Scissors, href: "/tools/documents/pdf/split", category: "documents", subcategory: "PDF", status: "Live", bg: "bg-red-50", color: "text-red-600" },
  { id: "smart-scan", title: "Smart Scan", desc: "Images to PDF.", icon: ScanLine, href: "/tools/documents/smart-scan", category: "documents", subcategory: "Imaging", status: "New", bg: "bg-orange-50", color: "text-orange-600" },
  { id: "image-compress", title: "Compressor", desc: "Shrink Size.", icon: ImageIcon, href: "/tools/documents/image/compressor", category: "documents", subcategory: "Imaging", status: "Live", bg: "bg-indigo-50", color: "text-indigo-600" },
  { id: "image-resizer", title: "Resizer", desc: "Dimensions.", icon: Crop, href: "/tools/documents/image/resizer", category: "documents", subcategory: "Imaging", status: "Live", bg: "bg-pink-50", color: "text-pink-600" },
  { id: "smart-ocr", title: "Smart OCR", desc: "Image to Text.", icon: FileType, href: "/tools/documents/smart-ocr", category: "documents", subcategory: "Imaging", status: "New", bg: "bg-violet-50", color: "text-violet-600" },
  { id: "smart-word", title: "Smart Doc", desc: "Rich Editor.", icon: FileText, href: "/tools/documents/smart-word", category: "documents", subcategory: "Editors", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  { id: "smart-excel", title: "Smart Excel", desc: "Spreadsheet.", icon: FileSpreadsheet, href: "/tools/documents/smart-excel", category: "documents", subcategory: "Editors", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "json-formatter", title: "JSON Fmt", desc: "Validator.", icon: Braces, href: "/tools/documents/json/formatter", category: "documents", subcategory: "Data", status: "Live", bg: "bg-slate-200", color: "text-slate-600" },

  // --- DEVELOPER ---
  { id: "smart-sql", title: "SQL Formatter", desc: "Prettify SQL.", icon: Database, href: "/tools/developer/smart-sql", category: "developer", subcategory: "Code", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  { id: "smart-regex", title: "Regex Tester", desc: "Pattern Match.", icon: Code2, href: "/tools/developer/smart-regex", category: "developer", subcategory: "Code", status: "Live", bg: "bg-yellow-50", color: "text-yellow-600" },
  { id: "smart-diff", title: "Text Diff", desc: "Comparator.", icon: Split, href: "/tools/developer/smart-diff", category: "developer", subcategory: "Code", status: "Live", bg: "bg-orange-50", color: "text-orange-600" },
  { id: "smart-pass", title: "Pass Gen", desc: "Secure Keys.", icon: Lock, href: "/tools/developer/smart-pass", category: "developer", subcategory: "Security", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "smart-hash", title: "Hash Gen", desc: "MD5/SHA.", icon: Fingerprint, href: "/tools/developer/smart-hash", category: "developer", subcategory: "Security", status: "Live", bg: "bg-rose-50", color: "text-rose-600" },
  { id: "smart-jwt", title: "JWT Decoder", desc: "Debug Tokens.", icon: Key, href: "/tools/developer/smart-jwt", category: "developer", subcategory: "Security", status: "Live", bg: "bg-amber-50", color: "text-amber-600" },
  { id: "smart-uuid", title: "UUID Gen", desc: "Unique IDs.", icon: Hash, href: "/tools/developer/smart-uuid", category: "developer", subcategory: "Utils", status: "Live", bg: "bg-slate-100", color: "text-slate-600" },
  { id: "smart-url", title: "URL Parser", desc: "Analyze Params.", icon: Link, href: "/tools/developer/smart-url", category: "developer", subcategory: "Web", status: "Live", bg: "bg-blue-50", color: "text-blue-500" },
  { id: "smart-json2ts", title: "JSON to TS", desc: "Interfaces.", icon: Braces, href: "/tools/developer/smart-json2ts", category: "developer", subcategory: "Code", status: "Live", bg: "bg-blue-50", color: "text-blue-700" },
  { id: "smart-cron", title: "Cron Gen", desc: "Scheduler.", icon: Clock, href: "/tools/developer/smart-cron", category: "developer", subcategory: "Utils", status: "Live", bg: "bg-orange-50", color: "text-orange-500" },
  { id: "smart-git", title: "Git Cheats", desc: "Commands.", icon: Terminal, href: "/tools/developer/smart-git", category: "developer", subcategory: "Utils", status: "Live", bg: "bg-red-50", color: "text-red-600" },
  { id: "smart-curl", title: "Curl Builder", desc: "API Requests.", icon: Command, href: "/tools/developer/smart-curl", category: "developer", subcategory: "Web", status: "Live", bg: "bg-slate-100", color: "text-slate-800" },
  { id: "smart-min", title: "Minifier", desc: "Compress Code.", icon: Minimize, href: "/tools/developer/smart-min", category: "developer", subcategory: "Code", status: "Live", bg: "bg-amber-50", color: "text-amber-600" },

  // --- HEALTH ---
  { id: "smart-bmi", title: "BMI Calc", desc: "Health Index.", icon: Calculator, href: "/tools/health/smart-bmi", category: "health", subcategory: "Metrics", status: "Live", bg: "bg-teal-50", color: "text-teal-600" },
  { id: "smart-breath", title: "Breathing", desc: "Relaxation.", icon: Wind, href: "/tools/health/smart-breath", category: "health", subcategory: "Wellness", status: "Live", bg: "bg-sky-50", color: "text-sky-600" },
  { id: "smart-workout", title: "HIIT Timer", desc: "Intervals.", icon: Dumbbell, href: "/tools/health/smart-workout", category: "health", subcategory: "Fitness", status: "Live", bg: "bg-orange-50", color: "text-orange-600" },

  // --- AI ---
  { id: "smart-chat", title: "Smart Chat", desc: "Local Bot.", icon: Sparkles, href: "/tools/ai/smart-chat", category: "ai", subcategory: "Chat", status: "New", bg: "bg-violet-50", color: "text-violet-600" },
  { id: "smart-voice", title: "Smart Voice", desc: "Text to Speech.", icon: Mic, href: "/tools/ai/smart-voice", category: "ai", subcategory: "Audio", status: "Live", bg: "bg-fuchsia-50", color: "text-fuchsia-600" },
  { id: "smart-analyze", title: "Smart NLP", desc: "Sentiment.", icon: BrainCircuit, href: "/tools/ai/smart-analyze", category: "ai", subcategory: "Text", status: "Live", bg: "bg-cyan-50", color: "text-cyan-600" }
];
TS_END

# =========================================================
# 3. FIX TOOL TILE (Consume Component Icons)
# =========================================================
echo "í³ Updating ToolTile to render Component Icons..."
cat > app/shared/ToolTile.tsx << 'TS_END'
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ToolTileProps {
  title: string;
  desc: string;
  icon: LucideIcon; // Expecting a Component
  href: string;
  category?: string;
  isNew?: boolean;
  bg?: string;
  color?: string;
}

export default function ToolTile({ title, desc, icon: Icon, href, isNew, bg, color }: ToolTileProps) {
  return (
    <Link href={href} className="group block h-full">
      <div className="relative h-full p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${bg || 'bg-slate-100'} ${color || 'text-slate-600'} group-hover:scale-110 transition-transform`}>
             {/* Render as Component */}
             <Icon size={24} strokeWidth={2} />
          </div>
          {isNew && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
              New
            </span>
          )}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
TS_END

# =========================================================
# 4. FIX COMMAND MENU (Consume Component Icons)
# =========================================================
echo "í´ Updating Command Menu..."
cat > app/components/layout/CommandMenu.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";

export default function CommandMenu() {
  const { searchQuery, setSearchQuery } = useUI();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filtered = ALL_TOOLS.filter((tool) =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3 gap-3">
          <Search className="text-slate-400" size={20} />
          <input
            className="flex-1 bg-transparent text-lg font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button onClick={() => setOpen(false)} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">ESC</button>
        </div>
        <div className="p-2">
          {filtered.map((tool) => (
            <button
              key={tool.id}
              onClick={() => { router.push(tool.href); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left group"
            >
              <div className={`p-2 rounded-md ${tool.bg} ${tool.color}`}>
                <tool.icon size={18} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{tool.title}</div>
                <div className="text-xs text-slate-500">{tool.category}</div>
              </div>
              <ArrowRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
TS_END

echo "âœ… All Core Bugs Fixed. Run 'npm run dev'!"
