import { 
  Wallet, Calculator, Lock, Layers, Image, Zap, 
  Braces, Heart, Wind, Sparkles, Scale, RefreshCw,
  FileText, Palette, QrCode, Type, Contrast, 
  TrendingUp, Droplets, PieChart, Crop, Landmark, Briefcase,
  Code2, Database, Wifi, FileCode, Split, Clock, Scissors,
  CheckCircle, ArrowRight, Ratio
} from "lucide-react";

export const ALL_TOOLS = [
  // --- FINANCE (6 Tools) ---
  { id: "budget", name: "Budget Ultimate", desc: "Track expenses & net worth.", category: "Finance", href: "/tools/finance/budget-tracker", icon: <Wallet size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", status: "Ready", popular: true },
  { id: "loan", name: "Loan Planner", desc: "EMI & Amortization.", category: "Finance", href: "/tools/finance/loan-emi", icon: <Calculator size={24} />, color: "text-blue-600", bg: "bg-blue-50", status: "Ready", popular: true },
  { id: "debt", name: "Debt Destroyer", desc: "Payoff strategies.", category: "Finance", href: "/tools/finance/debt-planner", icon: <PieChart size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "Ready", popular: false },
  { id: "networth", name: "Net Worth", desc: "Assets vs. Liabilities.", category: "Finance", href: "/tools/finance/net-worth", icon: <Landmark size={24} />, color: "text-slate-700", bg: "bg-slate-100", status: "Ready", popular: false },
  { id: "retirement", name: "Retirement Calc", desc: "FIRE Calculator.", category: "Finance", href: "/tools/finance/retirement", icon: <Briefcase size={24} />, color: "text-indigo-700", bg: "bg-indigo-50", status: "Ready", popular: false },
  { id: "sip", name: "SIP Calculator", desc: "Investment growth.", category: "Finance", href: "/tools/finance/sip-calculator", icon: <TrendingUp size={24} />, color: "text-violet-600", bg: "bg-violet-50", status: "Ready", popular: true },

  // --- DOCUMENTS (6 Tools) ---
  { id: "pdf-merge", name: "PDF Merger", desc: "Combine PDFs securely.", category: "Documents", href: "/tools/documents/pdf/merge", icon: <Layers size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "Ready", popular: true },
  { id: "pdf-split", name: "PDF Splitter", desc: "Extract pages.", category: "Documents", href: "/tools/documents/pdf/split", icon: <Scissors size={24} />, color: "text-red-600", bg: "bg-red-50", status: "Ready", popular: false },
  { id: "img-compress", name: "Image Compressor", desc: "Shrink JPG/PNG.", category: "Documents", href: "/tools/documents/image/compressor", icon: <Image size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", status: "Ready", popular: true },
  { id: "img-convert", name: "Image Converter", desc: "WebP/PNG/JPG.", category: "Documents", href: "/tools/documents/image/converter", icon: <RefreshCw size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "Ready", popular: false },
  { id: "img-resize", name: "Image Resizer", desc: "Resize dimensions.", category: "Documents", href: "/tools/documents/image/resizer", icon: <Crop size={24} />, color: "text-pink-600", bg: "bg-pink-50", status: "Ready", popular: false },
  { id: "json", name: "JSON Formatter", desc: "Validate & Minify.", category: "Documents", href: "/tools/documents/json/formatter", icon: <Braces size={24} />, color: "text-slate-600", bg: "bg-slate-200", status: "Ready", popular: false },

  // --- HEALTH (3 Tools) ---
  { id: "bmi", name: "BMI Calculator", desc: "Health index check.", category: "Health", href: "/tools/health/bmi", icon: <Calculator size={24} />, color: "text-teal-600", bg: "bg-teal-50", status: "Ready", popular: false },
  { id: "breathing", name: "Breathing App", desc: "4-7-8 Relaxation.", category: "Health", href: "/tools/health/breathing", icon: <Heart size={24} />, color: "text-sky-600", bg: "bg-sky-50", status: "Ready", popular: true },
  { id: "timer", name: "Workout Timer", desc: "HIIT / Tabata.", category: "Health", href: "/tools/health/timer", icon: <Zap size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "Ready", popular: false },

  // --- DEVELOPER (8 Tools) ---
  { id: "wifi", name: "WiFi QR", desc: "Share internet.", category: "Developer", href: "/tools/developer/wifi", icon: <Wifi size={24} />, color: "text-blue-500", bg: "bg-blue-50", status: "Ready", popular: false },
  { id: "regex", name: "Regex Tester", desc: "Test patterns.", category: "Developer", href: "/tools/developer/regex", icon: <Code2 size={24} />, color: "text-yellow-600", bg: "bg-yellow-50", status: "Ready", popular: false },
  { id: "sql", name: "SQL Formatter", desc: "Prettify queries.", category: "Developer", href: "/tools/developer/sql", icon: <Database size={24} />, color: "text-cyan-600", bg: "bg-cyan-50", status: "Ready", popular: false },
  { id: "password", name: "Password Gen", desc: "Secure keys.", category: "Developer", href: "/tools/developer/password", icon: <Lock size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", status: "Ready", popular: true },
  { id: "diff", name: "Diff Checker", desc: "Compare text.", category: "Developer", href: "/tools/developer/diff-checker", icon: <Split size={24} />, color: "text-purple-600", bg: "bg-purple-50", status: "Ready", popular: false },
  { id: "timestamp", name: "Unix Time", desc: "Epoch converter.", category: "Developer", href: "/tools/developer/timestamp", icon: <Clock size={24} />, color: "text-green-600", bg: "bg-green-50", status: "Ready", popular: false },
  { id: "markdown", name: "Markdown Editor", desc: "Live preview.", category: "Developer", href: "/tools/writing/markdown", icon: <FileText size={24} />, color: "text-sky-600", bg: "bg-sky-50", status: "Ready", popular: false },
  { id: "case", name: "Case Converter", desc: "UPPER/lower.", category: "Developer", href: "/tools/writing/case-converter", icon: <Type size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "Ready", popular: false },

  // --- DESIGN & CONVERTERS (3 Tools) ---
  { id: "palette", name: "Color Palette", desc: "Generate schemes.", category: "Design", href: "/tools/design/palette", icon: <Palette size={24} />, color: "text-pink-600", bg: "bg-pink-50", status: "Ready", popular: false },
  { id: "contrast", name: "Contrast Checker", desc: "WCAG Score.", category: "Design", href: "/tools/design/contrast", icon: <Contrast size={24} />, color: "text-slate-600", bg: "bg-slate-200", status: "Ready", popular: false },
  { id: "unit", name: "Unit Converter", desc: "Metric/Imperial.", category: "Converters", href: "/tools/converters/unit", icon: <Scale size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "Ready", popular: false },
  
  // --- AI (1 Tool) ---
  { id: "ai-text", name: "Text Intelligence", desc: "Sentiment & Stats.", category: "AI", href: "/ai", icon: <Sparkles size={24} />, color: "text-violet-600", bg: "bg-violet-50", status: "Ready", popular: true }
];
