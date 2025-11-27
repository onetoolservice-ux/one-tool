import { 
  Wallet, Calculator, Lock, Layers, Image, Zap, 
  Braces, Heart, Wind, Sparkles, Scale, RefreshCw,
  FileText, Palette, QrCode, Type, Contrast, 
  TrendingUp, Droplets, PieChart
} from "lucide-react";

export const ALL_TOOLS = [
  // --- FINANCE ---
  { id: "budget", name: "Budget Ultimate", desc: "Track expenses, income & net worth.", category: "Finance", href: "/tools/finance/budget-tracker", icon: <Wallet size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", status: "Ready" },
  { id: "loan", name: "Loan Planner", desc: "EMI, Interest & Amortization.", category: "Finance", href: "/tools/finance/loan-emi", icon: <Calculator size={24} />, color: "text-blue-600", bg: "bg-blue-50", status: "Ready" },
  { id: "debt", name: "Debt Destroyer", desc: "Snowball vs Avalanche payoff planner.", category: "Finance", href: "/tools/finance/debt-planner", icon: <PieChart size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "New" },
  { id: "sip", name: "SIP Calculator", desc: "Investment growth & returns.", category: "Finance", href: "#", icon: <TrendingUp size={24} />, color: "text-purple-600", bg: "bg-purple-50", status: "Soon" },

  // --- DOCUMENTS ---
  { id: "pdf-merge", name: "PDF Merger", desc: "Combine multiple PDFs securely.", category: "Documents", href: "/tools/documents/pdf/merge", icon: <Layers size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "Ready" },
  { id: "img-compress", name: "Image Compressor", desc: "Shrink JPG/PNG without quality loss.", category: "Documents", href: "/tools/documents/image/compressor", icon: <Image size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", status: "Ready" },
  { id: "img-convert", name: "Image Converter", desc: "Convert WebP/PNG/JPG instantly.", category: "Documents", href: "/tools/documents/image/converter", icon: <RefreshCw size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "Ready" },
  { id: "img-resize", name: "Image Resizer", desc: "Resize dimensions securely.", category: "Documents", href: "/tools/documents/image/resizer", icon: <Image size={24} />, color: "text-pink-600", bg: "bg-pink-50", status: "Ready" },
  { id: "json", name: "JSON Formatter", desc: "Validate & Minify JSON data.", category: "Documents", href: "/tools/documents/json/formatter", icon: <Braces size={24} />, color: "text-slate-600", bg: "bg-slate-200", status: "Ready" },

  // --- HEALTH ---
  { id: "bmi", name: "BMI Calculator", desc: "Body Mass Index health check.", category: "Health", href: "/tools/health/bmi", icon: <Calculator size={24} />, color: "text-teal-600", bg: "bg-teal-50", status: "Ready" },
  { id: "breathing", name: "Breathing App", desc: "4-7-8 Relaxation technique.", category: "Health", href: "/tools/health/breathing", icon: <Heart size={24} />, color: "text-sky-600", bg: "bg-sky-50", status: "Ready" },
  { id: "timer", name: "Workout Timer", desc: "HIIT / Tabata interval timer.", category: "Health", href: "/tools/health/timer", icon: <Zap size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "Ready" },
  { id: "water", name: "Water Tracker", desc: "Daily hydration tracking.", category: "Health", href: "#", icon: <Droplets size={24} />, color: "text-blue-500", bg: "bg-blue-50", status: "Soon" },

  // --- DESIGN (Fixed: Now populated) ---
  { id: "palette", name: "Color Palette", desc: "Generate random color schemes.", category: "Design", href: "/tools/design/palette", icon: <Palette size={24} />, color: "text-purple-600", bg: "bg-purple-50", status: "Ready" },
  { id: "contrast", name: "Contrast Checker", desc: "Check readability scores.", category: "Design", href: "/tools/design/contrast", icon: <Palette size={24} />, color: "text-pink-600", bg: "bg-pink-50", status: "Ready" },

  // --- PRODUCTIVITY ---
  { id: "pomodoro", name: "Pomodoro Focus", desc: "Stay focused with timers.", category: "Productivity", href: "/tools/productivity/pomodoro", icon: <Zap size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "Ready" },
  { id: "qr", name: "QR Generator", desc: "Create custom QR codes.", category: "Productivity", href: "/tools/productivity/qr-code", icon: <QrCode size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", status: "Ready" },

  // --- DEVELOPER ---
  { id: "markdown", name: "Markdown Editor", desc: "Write with live preview.", category: "Developer", href: "/tools/writing/markdown", icon: <FileText size={24} />, color: "text-sky-600", bg: "bg-sky-50", status: "Ready" },
  { id: "case", name: "Case Converter", desc: "UPPER / lower case switch.", category: "Developer", href: "/tools/writing/case-converter", icon: <Type size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "Ready" },
  { id: "password", name: "Password Gen", desc: "Secure random passwords.", category: "Developer", href: "/tools/developer/password", icon: <Lock size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", status: "Ready" },
  
  // --- CONVERTERS ---
  { id: "unit", name: "Unit Converter", desc: "Length, Weight, Time.", category: "Converters", href: "/tools/converters/unit", icon: <Scale size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "Ready" },

  // --- AI ---
  { id: "ai-text", name: "Text Intelligence", desc: "Sentiment & Stats.", category: "AI", href: "/ai", icon: <Sparkles size={24} />, color: "text-violet-600", bg: "bg-violet-50", status: "Ready" }
];
