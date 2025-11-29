import { 
  Wallet, Calculator, Lock, Layers, Image, Zap, Braces, Heart, Wind, Sparkles, Scale, RefreshCw, FileText, Palette, QrCode, Type, Contrast, TrendingUp, Droplets, PieChart, Crop, Landmark, Briefcase, Code2, Database, Wifi, FileCode, Split, Clock, Scissors, CheckCircle, ArrowRight, Ratio, Binary, Key, Link, Hash, Fingerprint, Shield, Network, Globe, Terminal, Server, Activity, Box, Minimize, Search, Command, ScanLine, FileSpreadsheet, FileType, Dumbbell, Mic, BrainCircuit
} from "lucide-react";

export const ALL_TOOLS = [
  // FINANCE
  { id: "smart-budget", name: "Smart Budget", desc: "Enterprise G/L.", category: "Finance", href: "/tools/finance/smart-budget", icon: <Wallet size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", status: "Ready", popular: true },
  { id: "smart-loan", name: "Smart Loan", desc: "Amortization.", category: "Finance", href: "/tools/finance/smart-loan", icon: <Calculator size={24} />, color: "text-blue-600", bg: "bg-blue-50", status: "Ready", popular: true },
  { id: "smart-debt", name: "Smart Debt", desc: "Liability Payoff.", category: "Finance", href: "/tools/finance/smart-debt", icon: <PieChart size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", status: "Ready", popular: false },
  { id: "smart-net-worth", name: "Smart Net Worth", desc: "Asset Tracker.", category: "Finance", href: "/tools/finance/smart-net-worth", icon: <Landmark size={24} />, color: "text-main", bg: "bg-slate-100", status: "Ready", popular: false },
  { id: "smart-retirement", name: "Smart Retirement", desc: "FIRE Projection.", category: "Finance", href: "/tools/finance/smart-retirement", icon: <Briefcase size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "Ready", popular: false },
  { id: "smart-sip", name: "Smart SIP", desc: "Wealth Builder.", category: "Finance", href: "/tools/finance/smart-sip", icon: <TrendingUp size={24} />, color: "text-violet-600", bg: "bg-violet-50", status: "Ready", popular: true },

  // DOCUMENTS
  { id: "smart-pdf-merge", name: "Smart PDF Merge", desc: "Combine files.", category: "Documents", href: "/tools/documents/pdf/merge", icon: <Layers size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "Ready", popular: true },
  { id: "smart-pdf-split", name: "Smart PDF Split", desc: "Extract pages.", category: "Documents", href: "/tools/documents/pdf/split", icon: <Scissors size={24} />, color: "text-red-600", bg: "bg-red-50", status: "Ready", popular: false },
  { id: "smart-scan", name: "Smart Scan", desc: "Images to PDF.", category: "Documents", href: "/tools/documents/smart-scan", icon: <ScanLine size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "New", popular: true },
  { id: "smart-compress", name: "Smart Compress", desc: "Shrink Size.", category: "Documents", href: "/tools/documents/image/compressor", icon: <Image size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", status: "Ready", popular: true },
  { id: "smart-convert", name: "Smart Convert", desc: "Format Switch.", category: "Documents", href: "/tools/documents/image/converter", icon: <RefreshCw size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "Ready", popular: false },
  { id: "smart-resize", name: "Smart Resize", desc: "Dimensions.", category: "Documents", href: "/tools/documents/image/resizer", icon: <Crop size={24} />, color: "text-pink-600", bg: "bg-pink-50", status: "Ready", popular: false },
  { id: "smart-word", name: "Smart Word", desc: "Rich Text Editor.", category: "Documents", href: "/tools/documents/smart-word", icon: <FileText size={24} />, color: "text-blue-600", bg: "bg-blue-50", status: "New", popular: false },
  { id: "smart-excel", name: "Smart Excel", desc: "Spreadsheet.", category: "Documents", href: "/tools/documents/smart-excel", icon: <FileSpreadsheet size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", status: "New", popular: false },
  { id: "smart-ocr", name: "Smart OCR", desc: "Image to Text.", category: "Documents", href: "/tools/documents/smart-ocr", icon: <FileType size={24} />, color: "text-violet-600", bg: "bg-violet-50", status: "New", popular: true },
  { id: "smart-json", name: "Smart JSON", desc: "Formatter.", category: "Documents", href: "/tools/documents/json/formatter", icon: <Braces size={24} />, color: "text-muted", bg: "bg-slate-200", status: "Ready", popular: false },

  // HEALTH
  { id: "smart-bmi", name: "Smart BMI", desc: "Health Gauge.", category: "Health", href: "/tools/health/smart-bmi", icon: <Calculator size={24} />, color: "text-teal-600", bg: "bg-teal-50", status: "New", popular: true },
  { id: "smart-breath", name: "Smart Breath", desc: "Meditation.", category: "Health", href: "/tools/health/smart-breath", icon: <Wind size={24} />, color: "text-sky-600", bg: "bg-sky-50", status: "New", popular: false },
  { id: "smart-workout", name: "Smart Workout", desc: "HIIT Engine.", category: "Health", href: "/tools/health/smart-workout", icon: <Dumbbell size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "New", popular: false },

  // DEVELOPER
  { id: "smart-sql", name: "Smart SQL", desc: "Formatter.", category: "Developer", href: "/tools/developer/smart-sql", icon: <Database size={24} />, color: "text-blue-600", bg: "bg-blue-50", status: "Ready", popular: true },
  { id: "smart-regex", name: "Smart Regex", desc: "Tester.", category: "Developer", href: "/tools/developer/smart-regex", icon: <Code2 size={24} />, color: "text-yellow-600", bg: "bg-yellow-50", status: "Ready", popular: true },
  { id: "smart-diff", name: "Smart Diff", desc: "Comparator.", category: "Developer", href: "/tools/developer/smart-diff", icon: <Split size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "Ready", popular: false },
  { id: "smart-pass", name: "Smart Pass", desc: "Generator.", category: "Developer", href: "/tools/developer/smart-pass", icon: <Lock size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", status: "Ready", popular: true },
  { id: "smart-base64", name: "Smart Base64", desc: "Encode/Decode.", category: "Developer", href: "/tools/developer/smart-base64", icon: <Binary size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", status: "New", popular: false },
  { id: "smart-hash", name: "Smart Hash", desc: "MD5/SHA Gen.", category: "Developer", href: "/tools/developer/smart-hash", icon: <Fingerprint size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "New", popular: false },
  { id: "smart-jwt", name: "Smart JWT", desc: "Token Decoder.", category: "Developer", href: "/tools/developer/smart-jwt", icon: <Key size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "New", popular: true },
  { id: "smart-uuid", name: "Smart UUID", desc: "ID Generator.", category: "Developer", href: "/tools/developer/smart-uuid", icon: <Hash size={24} />, color: "text-muted", bg: "bg-slate-100", status: "New", popular: false },
  { id: "smart-url", name: "Smart URL", desc: "Parser.", category: "Developer", href: "/tools/developer/smart-url", icon: <Link size={24} />, color: "text-blue-500", bg: "bg-blue-50", status: "New", popular: true },
  { id: "smart-json2ts", name: "Smart JSON > TS", desc: "Interfaces.", category: "Developer", href: "/tools/developer/smart-json2ts", icon: <Braces size={24} />, color: "text-blue-700", bg: "bg-blue-50", status: "New", popular: true },
  { id: "smart-cron", name: "Smart Cron", desc: "Scheduler.", category: "Developer", href: "/tools/developer/smart-cron", icon: <Clock size={24} />, color: "text-orange-500", bg: "bg-orange-50", status: "New", popular: false },
  { id: "smart-git", name: "Smart Git", desc: "Git Cheats.", category: "Developer", href: "/tools/developer/smart-git", icon: <Terminal size={24} />, color: "text-red-600", bg: "bg-red-50", status: "New", popular: false },
  { id: "smart-curl", name: "Smart Curl", desc: "Curl to Fetch.", category: "Developer", href: "/tools/developer/smart-curl", icon: <Command size={24} />, color: "text-main", bg: "bg-slate-100", status: "New", popular: false },
  { id: "smart-lorem", name: "Smart Lorem", desc: "Text Gen.", category: "Developer", href: "/tools/developer/smart-lorem", icon: <FileText size={24} />, color: "text-muted", bg: "bg-slate-100", status: "New", popular: false },
  { id: "smart-string", name: "Smart String", desc: "Text Tools.", category: "Developer", href: "/tools/developer/smart-string", icon: <Type size={24} />, color: "text-pink-600", bg: "bg-pink-50", status: "New", popular: false },
  { id: "smart-entities", name: "Smart Entities", desc: "HTML Entities.", category: "Developer", href: "/tools/developer/smart-entities", icon: <Code2 size={24} />, color: "text-teal-600", bg: "bg-teal-50", status: "New", popular: false },
  { id: "smart-subnet", name: "Smart Subnet", desc: "CIDR Calc.", category: "Developer", href: "/tools/developer/smart-subnet", icon: <Network size={24} />, color: "text-cyan-600", bg: "bg-cyan-50", status: "New", popular: false },
  { id: "smart-ports", name: "Smart Ports", desc: "Port Lookup.", category: "Developer", href: "/tools/developer/smart-ports", icon: <Server size={24} />, color: "text-muted", bg: "bg-slate-200", status: "New", popular: false },
  { id: "smart-http", name: "Smart HTTP", desc: "Status Codes.", category: "Developer", href: "/tools/developer/smart-http", icon: <Activity size={24} />, color: "text-emerald-500", bg: "bg-emerald-50", status: "New", popular: false },
  { id: "smart-ua", name: "Smart UserAgent", desc: "Browser ID.", category: "Developer", href: "/tools/developer/smart-ua", icon: <Globe size={24} />, color: "text-violet-500", bg: "bg-violet-50", status: "New", popular: false },
  { id: "smart-meta", name: "Smart Meta", desc: "SEO Preview.", category: "Developer", href: "/tools/developer/smart-meta", icon: <Search size={24} />, color: "text-indigo-500", bg: "bg-indigo-50", status: "New", popular: false },
  { id: "smart-chmod", name: "Smart Chmod", desc: "Permissions.", category: "Developer", href: "/tools/developer/smart-chmod", icon: <Shield size={24} />, color: "text-green-600", bg: "bg-green-50", status: "New", popular: false },
  { id: "smart-css", name: "Smart CSS", desc: "Shadows.", category: "Developer", href: "/tools/developer/smart-css", icon: <Box size={24} />, color: "text-blue-400", bg: "bg-blue-50", status: "New", popular: false },
  { id: "smart-min", name: "Smart Minify", desc: "Compressor.", category: "Developer", href: "/tools/developer/smart-min", icon: <Minimize size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "New", popular: false },
  
  // AI
  { id: "smart-chat", name: "Smart Chat", desc: "Local Bot UI.", category: "AI", href: "/tools/ai/smart-chat", icon: <Sparkles size={24} />, color: "text-violet-600", bg: "bg-violet-50", status: "New", popular: true },
  { id: "smart-voice", name: "Smart Voice", desc: "Text to Speech.", category: "AI", href: "/tools/ai/smart-voice", icon: <Mic size={24} />, color: "text-fuchsia-600", bg: "bg-fuchsia-50", status: "New", popular: false },
  { id: "smart-analyze", name: "Smart Analyze", desc: "NLP Dashboard.", category: "AI", href: "/tools/ai/smart-analyze", icon: <BrainCircuit size={24} />, color: "text-cyan-600", bg: "bg-cyan-50", status: "Ready", popular: false }
];
