#!/bin/bash

echo "í´§ Fixing Missing Icons in Tool Registry..."

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
  LucideIcon, Mic, BrainCircuit, Command, 
  // NEWLY ADDED ICONS:
  Briefcase, FileType, FileSpreadsheet, Braces, Code2, Split, 
  Network, Shield, Box, Wind, Sparkles
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  category: "finance" | "developer" | "documents" | "health" | "design" | "productivity" | "ai";
  subcategory?: string;
  status: "Live" | "New" | "Beta" | "Ready";
  popular?: boolean;
  bg?: string;
  color?: string;
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
  { id: "smart-lorem", title: "Lorem Ipsum", desc: "Text Gen.", icon: Quote, href: "/tools/developer/smart-lorem", category: "developer", status: "Live", bg: "bg-slate-100", color: "text-slate-600" },
  { id: "smart-string", title: "String Tools", desc: "Text manipulation.", icon: Type, href: "/tools/developer/smart-string", category: "developer", status: "Live", bg: "bg-pink-50", color: "text-pink-600" },
  { id: "smart-entities", title: "HTML Entities", desc: "Character codes.", icon: Code2, href: "/tools/developer/smart-entities", category: "developer", status: "Live", bg: "bg-teal-50", color: "text-teal-600" },
  { id: "smart-subnet", title: "Smart Subnet", desc: "CIDR Calc.", icon: Network, href: "/tools/developer/smart-subnet", category: "developer", status: "Live", bg: "bg-cyan-50", color: "text-cyan-600" },
  { id: "smart-ports", title: "Port Ref", desc: "Common server ports.", icon: Server, href: "/tools/developer/smart-ports", category: "developer", status: "Live", bg: "bg-slate-200", color: "text-slate-700" },
  { id: "smart-http", title: "HTTP Status", desc: "Code reference.", icon: Activity, href: "/tools/developer/smart-http", category: "developer", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "smart-ua", title: "User Agent", desc: "Browser string.", icon: Globe, href: "/tools/developer/smart-ua", category: "developer", status: "Live", bg: "bg-violet-50", color: "text-violet-600" },
  { id: "smart-meta", title: "Meta Tags", desc: "SEO generator.", icon: Search, href: "/tools/developer/smart-meta", category: "developer", status: "Live", bg: "bg-indigo-50", color: "text-indigo-600" },
  { id: "smart-chmod", title: "Chmod Calc", desc: "Permissions.", icon: Shield, href: "/tools/developer/smart-chmod", category: "developer", status: "Live", bg: "bg-green-50", color: "text-green-600" },
  { id: "smart-css", title: "CSS Tools", desc: "Generators.", icon: Box, href: "/tools/developer/smart-css", category: "developer", status: "Live", bg: "bg-blue-50", color: "text-blue-500" },
  { id: "smart-min", title: "Minifier", desc: "Shrink Code.", icon: Minimize, href: "/tools/developer/smart-min", category: "developer", status: "Live", bg: "bg-amber-50", color: "text-amber-600" },
  
  // --- HEALTH ---
  { id: "smart-bmi", title: "BMI Calc", desc: "Health Index.", icon: Calculator, href: "/tools/health/smart-bmi", category: "health", subcategory: "Metrics", status: "Live", bg: "bg-teal-50", color: "text-teal-600" },
  { id: "smart-breath", title: "Breathing", desc: "Relaxation.", icon: Wind, href: "/tools/health/smart-breath", category: "health", subcategory: "Wellness", status: "Live", bg: "bg-sky-50", color: "text-sky-600" },
  { id: "smart-workout", title: "HIIT Timer", desc: "Intervals.", icon: Dumbbell, href: "/tools/health/smart-workout", category: "health", subcategory: "Fitness", status: "Live", bg: "bg-orange-50", color: "text-orange-600" },
  { id: "yoga", title: "Yoga Guide", desc: "Daily poses.", icon: Flower2, href: "/tools/health/yoga", category: "health", subcategory: "Wellness", status: "Live", bg: "bg-emerald-50", color: "text-emerald-600" },
  { id: "meditation", title: "Meditation", desc: "Focus timer.", icon: Flower2, href: "/tools/health/meditation", category: "health", subcategory: "Wellness", status: "Live", bg: "bg-indigo-50", color: "text-indigo-600" },
  { id: "gym", title: "Gym Guide", desc: "Workout log.", icon: Dumbbell, href: "/tools/health/gym", category: "health", subcategory: "Fitness", status: "Live", bg: "bg-rose-50", color: "text-rose-600" },
  { id: "games", title: "Mind Games", desc: "Focus & Memory.", icon: Gamepad2, href: "/tools/health/games", category: "health", subcategory: "Fitness", status: "Live", bg: "bg-purple-50", color: "text-purple-600" },

  // --- AI ---
  { id: "smart-chat", title: "Smart Chat", desc: "Local Bot.", icon: Sparkles, href: "/tools/ai/smart-chat", category: "ai", subcategory: "Chat", status: "New", bg: "bg-violet-50", color: "text-violet-600" },
  { id: "smart-voice", title: "Smart Voice", desc: "Text to Speech.", icon: Mic, href: "/tools/ai/smart-voice", category: "ai", subcategory: "Audio", status: "Live", bg: "bg-fuchsia-50", color: "text-fuchsia-600" },
  { id: "smart-analyze", title: "Smart NLP", desc: "Sentiment.", icon: BrainCircuit, href: "/tools/ai/smart-analyze", category: "ai", subcategory: "Text", status: "Live", bg: "bg-cyan-50", color: "text-cyan-600" },

  // --- DESIGN ---
  { id: "contrast", title: "Contrast", desc: "WCAG Check.", icon: Palette, href: "/tools/design/contrast", category: "design", subcategory: "Utilities", status: "Live", bg: "bg-slate-50", color: "text-slate-600" },
  { id: "aspect-ratio", title: "Aspect Ratio", desc: "Dimensions.", icon: Ruler, href: "/tools/design/aspect-ratio", category: "design", subcategory: "Utilities", status: "Live", bg: "bg-blue-50", color: "text-blue-600" },
  
  // --- PRODUCTIVITY ---
  { id: "unit-converter", title: "Unit Conv", desc: "Measurements.", icon: ArrowRightLeft, href: "/tools/converters/unit", category: "productivity", subcategory: "General", status: "Live", bg: "bg-amber-50", color: "text-amber-600" },
  { id: "qr-code", title: "QR Gen", desc: "Text to QR.", icon: LayoutGrid, href: "/tools/productivity/qr-code", category: "productivity", subcategory: "General", status: "Live", bg: "bg-slate-100", color: "text-slate-700" },
];
TS_END

echo "âœ… All Icons Imported & Registered. Run 'npm run dev'!"
