#!/bin/bash

echo "í´§ Synchronizing Data & Components to fix Runtime Error..."

# =========================================================
# 1. DATA: USE COMPONENTS (NOT ELEMENTS)
# =========================================================
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
  title: string;
  desc: string;
  icon: LucideIcon; // Component Type
  href: string;
  category: "finance" | "developer" | "documents" | "health" | "design" | "productivity" | "ai";
  subcategory?: string;
  status: "Live" | "New" | "Beta" | "Ready";
  popular?: boolean;
  bg?: string;
  color?: string;
}

export const ALL_TOOLS: Tool[] = [
  // FINANCE
  { id: "smart-budget", title: "Smart Budget", desc: "Enterprise G/L.", icon: Wallet, href: "/tools/finance/smart-budget", category: "finance", subcategory: "Management", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "smart-loan", title: "Smart Loan", desc: "Amortization.", icon: Calculator, href: "/tools/finance/smart-loan", category: "finance", subcategory: "Calculators", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  { id: "smart-debt", title: "Smart Debt", desc: "Liability Payoff.", icon: Activity, href: "/tools/finance/smart-debt", category: "finance", subcategory: "Calculators", status: "Live", bg: "bg-indigo-50", color: "text-indigo-600" },
  { id: "smart-net-worth", title: "Net Worth", desc: "Asset Tracker.", icon: PiggyBank, href: "/tools/finance/smart-net-worth", category: "finance", subcategory: "Management", status: "Live", bg: "bg-slate-100", color: "text-slate-600" },
  { id: "smart-sip", title: "Smart SIP", desc: "Wealth Builder.", icon: TrendingUp, href: "/tools/finance/smart-sip", category: "finance", subcategory: "Planning", status: "Live", bg: "bg-violet-50", color: "text-violet-600" },
  { id: "smart-retirement", title: "FIRE Calc", desc: "Retirement Plan.", icon: TrendingUp, href: "/tools/finance/smart-retirement", category: "finance", subcategory: "Planning", status: "Live", bg: "bg-orange-50", color: "text-orange-600" },

  // DOCUMENTS
  { id: "pdf-merge", title: "PDF Merger", desc: "Combine files.", icon: FileStack, href: "/tools/documents/pdf/merge", category: "documents", subcategory: "PDF", status: "Live", bg: "bg-rose-50", color: "text-rose-600" },
  { id: "pdf-split", title: "PDF Split", desc: "Extract pages.", icon: Scissors, href: "/tools/documents/pdf/split", category: "documents", subcategory: "PDF", status: "Live", bg: "bg-red-50", color: "text-red-600" },
  { id: "smart-scan", title: "Smart Scan", desc: "Images to PDF.", icon: ScanLine, href: "/tools/documents/smart-scan", category: "documents", subcategory: "Imaging", status: "New", bg: "bg-orange-50", color: "text-orange-600" },
  { id: "image-compress", title: "Compressor", desc: "Shrink Size.", icon: ImageIcon, href: "/tools/documents/image/compressor", category: "documents", subcategory: "Imaging", status: "Live", bg: "bg-indigo-50", color: "text-indigo-600" },
  { id: "image-resizer", title: "Resizer", desc: "Dimensions.", icon: Crop, href: "/tools/documents/image/resizer", category: "documents", subcategory: "Imaging", status: "Live", bg: "bg-pink-50", color: "text-pink-600" },
  { id: "smart-ocr", title: "Smart OCR", desc: "Image to Text.", icon: FileCode, href: "/tools/documents/smart-ocr", category: "documents", subcategory: "Imaging", status: "New", bg: "bg-violet-50", color: "text-violet-600" },
  { id: "smart-word", title: "Smart Doc", desc: "Rich Editor.", icon: FileText, href: "/tools/documents/smart-word", category: "documents", subcategory: "Editors", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  { id: "smart-excel", title: "Smart Excel", desc: "Spreadsheet.", icon: Table, href: "/tools/documents/smart-excel", category: "documents", subcategory: "Editors", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "json-formatter", title: "JSON Fmt", desc: "Validator.", icon: FileJson, href: "/tools/documents/json/formatter", category: "documents", subcategory: "Data", status: "Live", bg: "bg-slate-200", color: "text-slate-600" },

  // DEVELOPER
  { id: "smart-sql", title: "SQL Formatter", desc: "Prettify SQL.", icon: Database, href: "/tools/developer/smart-sql", category: "developer", subcategory: "Code", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  { id: "smart-regex", title: "Regex Tester", desc: "Pattern Match.", icon: Search, href: "/tools/developer/smart-regex", category: "developer", subcategory: "Code", status: "Live", bg: "bg-yellow-50", color: "text-yellow-600" },
  { id: "smart-diff", title: "Text Diff", desc: "Comparator.", icon: ArrowRightLeft, href: "/tools/developer/smart-diff", category: "developer", subcategory: "Code", status: "Live", bg: "bg-orange-50", color: "text-orange-600" },
  { id: "smart-pass", title: "Pass Gen", desc: "Secure Keys.", icon: Lock, href: "/tools/developer/smart-pass", category: "developer", subcategory: "Security", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "smart-hash", title: "Hash Gen", desc: "MD5/SHA.", icon: Fingerprint, href: "/tools/developer/smart-hash", category: "developer", subcategory: "Security", status: "Live", bg: "bg-rose-50", color: "text-rose-600" },
  { id: "smart-jwt", title: "JWT Decoder", desc: "Debug Tokens.", icon: ShieldCheck, href: "/tools/developer/smart-jwt", category: "developer", subcategory: "Security", status: "Live", bg: "bg-amber-50", color: "text-amber-600" },
  { id: "smart-uuid", title: "UUID Gen", desc: "Unique IDs.", icon: Hash, href: "/tools/developer/smart-uuid", category: "developer", subcategory: "Utils", status: "Live", bg: "bg-slate-100", color: "text-slate-600" },
  { id: "smart-url", title: "URL Parser", desc: "Analyze Params.", icon: Link, href: "/tools/developer/smart-url", category: "developer", subcategory: "Web", status: "Live", bg: "bg-blue-50", color: "text-blue-500" },
  { id: "smart-json2ts", title: "JSON to TS", desc: "Interfaces.", icon: FileCode, href: "/tools/developer/smart-json2ts", category: "developer", subcategory: "Code", status: "Live", bg: "bg-blue-50", color: "text-blue-700" },
  { id: "smart-cron", title: "Cron Gen", desc: "Scheduler.", icon: Clock, href: "/tools/developer/smart-cron", category: "developer", subcategory: "Utils", status: "Live", bg: "bg-orange-50", color: "text-orange-500" },
  { id: "smart-git", title: "Git Cheats", desc: "Commands.", icon: Terminal, href: "/tools/developer/smart-git", category: "developer", subcategory: "Utils", status: "Live", bg: "bg-red-50", color: "text-red-600" },
  { id: "smart-curl", title: "Curl Builder", desc: "API Requests.", icon: Command, href: "/tools/developer/smart-curl", category: "developer", subcategory: "Web", status: "Live", bg: "bg-slate-100", color: "text-slate-800" },
  { id: "smart-lorem", title: "Lorem Ipsum", desc: "Text Gen.", icon: Quote, href: "/tools/developer/smart-lorem", category: "developer", status: "Live", bg: "bg-slate-100", color: "text-slate-600" },
  { id: "smart-string", title: "String Tools", desc: "Text manipulation.", icon: Type, href: "/tools/developer/smart-string", category: "developer", status: "Live", bg: "bg-pink-50", color: "text-pink-600" },
  { id: "smart-entities", title: "HTML Entities", desc: "Character codes.", icon: Code, href: "/tools/developer/smart-entities", category: "developer", status: "Live", bg: "bg-teal-50", color: "text-teal-600" },
  { id: "smart-subnet", title: "Smart Subnet", desc: "CIDR Calc.", icon: Network, href: "/tools/developer/smart-subnet", category: "developer", status: "Live", bg: "bg-cyan-50", color: "text-cyan-600" },
  { id: "smart-ports", title: "Port Ref", desc: "Common server ports.", icon: Server, href: "/tools/developer/smart-ports", category: "developer", status: "Live", bg: "bg-slate-200", color: "text-slate-700" },
  { id: "smart-http", title: "HTTP Status", desc: "Code reference.", icon: Activity, href: "/tools/developer/smart-http", category: "developer", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "smart-ua", title: "User Agent", desc: "Browser string.", icon: Globe, href: "/tools/developer/smart-ua", category: "developer", status: "Live", bg: "bg-violet-50", color: "text-violet-600" },
  { id: "smart-meta", title: "Meta Tags", desc: "SEO generator.", icon: Search, href: "/tools/developer/smart-meta", category: "developer", status: "Live", bg: "bg-indigo-50", color: "text-indigo-600" },
  { id: "smart-chmod", title: "Chmod Calc", desc: "Permissions.", icon: Lock, href: "/tools/developer/smart-chmod", category: "developer", status: "Live", bg: "bg-green-50", color: "text-green-600" },
  { id: "smart-css", title: "CSS Tools", desc: "Generators.", icon: Palette, href: "/tools/developer/smart-css", category: "developer", status: "Live", bg: "bg-blue-50", color: "text-blue-500" },
  { id: "smart-min", title: "Minifier", desc: "Shrink Code.", icon: Minimize, href: "/tools/developer/smart-min", category: "developer", status: "Live", bg: "bg-amber-50", color: "text-amber-600" },

  // HEALTH
  { id: "smart-bmi", title: "BMI Calc", desc: "Health Index.", icon: Activity, href: "/tools/health/smart-bmi", category: "health", subcategory: "Metrics", status: "Live", bg: "bg-teal-50", color: "text-teal-600" },
  { id: "smart-breath", title: "Breathing", desc: "Relaxation.", icon: Heart, href: "/tools/health/smart-breath", category: "health", subcategory: "Wellness", status: "Live", bg: "bg-sky-50", color: "text-sky-600" },
  { id: "smart-workout", title: "HIIT Timer", desc: "Intervals.", icon: Zap, href: "/tools/health/smart-workout", category: "health", subcategory: "Fitness", status: "Live", bg: "bg-orange-50", color: "text-orange-600" },
  { id: "yoga", title: "Yoga Guide", desc: "Daily poses.", icon: Flower2, href: "/tools/health/yoga", category: "health", subcategory: "Wellness", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "meditation", title: "Meditation", desc: "Focus timer.", icon: Flower2, href: "/tools/health/meditation", category: "health", subcategory: "Wellness", status: "Live", bg: "bg-indigo-50", color: "text-indigo-600" },
  { id: "gym", title: "Gym Guide", desc: "Workout log.", icon: Dumbbell, href: "/tools/health/gym", category: "health", subcategory: "Fitness", status: "Live", bg: "bg-rose-50", color: "text-rose-600" },
  { id: "games", title: "Mind Games", desc: "Focus & Memory.", icon: Gamepad2, href: "/tools/health/games", category: "health", subcategory: "Fitness", status: "Live", bg: "bg-purple-50", color: "text-purple-600" },

  // AI
  { id: "smart-chat", title: "Smart Chat", desc: "Local Bot.", icon: Sparkles, href: "/tools/ai/smart-chat", category: "ai", subcategory: "Chat", status: "New", bg: "bg-violet-50", color: "text-violet-600" },
  { id: "smart-voice", title: "Smart Voice", desc: "Text to Speech.", icon: Mic, href: "/tools/ai/smart-voice", category: "ai", subcategory: "Audio", status: "Live", bg: "bg-fuchsia-50", color: "text-fuchsia-600" },
  { id: "smart-analyze", title: "Smart NLP", desc: "Sentiment.", icon: BrainCircuit, href: "/tools/ai/smart-analyze", category: "ai", subcategory: "Text", status: "Live", bg: "bg-cyan-50", color: "text-cyan-600" },

  // DESIGN & PROD
  { id: "contrast", title: "Contrast", desc: "WCAG Check.", icon: Palette, href: "/tools/design/contrast", category: "design", subcategory: "Utilities", status: "Live", bg: "bg-slate-50", color: "text-slate-600" },
  { id: "aspect-ratio", title: "Aspect Ratio", desc: "Dimensions.", icon: Ruler, href: "/tools/design/aspect-ratio", category: "design", subcategory: "Utilities", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  { id: "unit-converter", title: "Unit Conv", desc: "Measurements.", icon: ArrowRightLeft, href: "/tools/converters/unit", category: "productivity", subcategory: "General", status: "Live", bg: "bg-amber-50", color: "text-amber-600" },
  { id: "qr-code", title: "QR Gen", desc: "Text to QR.", icon: LayoutGrid, href: "/tools/productivity/qr-code", category: "productivity", subcategory: "General", status: "Live", bg: "bg-slate-100", color: "text-slate-700" },
  { id: "case-conv", title: "Case Switch", desc: "camelCase, snake_case.", icon: Type, href: "/tools/writing/case-converter", category: "documents", subcategory: "Editors & Viewers", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  { id: "markdown", title: "Markdown", desc: "Live MD Editor.", icon: FileCode, href: "/tools/writing/markdown", category: "documents", subcategory: "Editors & Viewers", status: "Live", bg: "bg-gray-50", color: "text-gray-600" },
  { id: "pdf-word", title: "PDF to Word", desc: "Convert PDF to Doc.", icon: FileText, href: "/tools/converters/pdf-to-word", category: "documents", subcategory: "PDF Tools", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  { id: "png-jpg", title: "PNG to JPG", desc: "Format converter.", icon: ImageIcon, href: "/tools/converters/png-to-jpg", category: "documents", subcategory: "Image Tools", status: "Live", bg: "bg-green-50", color: "text-green-600" }
];
TS_END

# =========================================================
# 2. COMPONENT: FIX TOOL TILE
# =========================================================
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
  bg?: string;
  color?: string;
}

export default function ToolTile({ title, desc, icon: Icon, href, isNew, bg, color }: ToolTileProps) {
  return (
    <Link href={href} className="group block h-full">
      <div className="relative h-full p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${bg || 'bg-slate-100'} ${color || 'text-slate-600'} group-hover:scale-110 transition-transform`}>
             {/* FIX: Rendering as Component */}
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
# 3. COMPONENT: FIX COMMAND MENU
# =========================================================
cat > app/components/layout/CommandMenu.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
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
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
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
                {/* FIX: Rendering as Component */}
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

echo "âœ… Runtime Mismatch Fixed. Run 'npm run dev'!"
