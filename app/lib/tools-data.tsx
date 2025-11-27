import { 
  Wallet, Calculator, Lock, Layers, Image, Zap, 
  Braces, Heart, Wind, Sparkles, Scale, RefreshCw,
  FileText, Palette, QrCode, Type, Contrast, 
  TrendingUp, Droplets, PieChart, Crop
} from "lucide-react";

export const ALL_TOOLS = [
  // FINANCE
  { id: "budget", name: "Budget Ultimate", desc: "Track expenses & net worth.", category: "Finance", href: "/tools/finance/budget-tracker", icon: <Wallet size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", status: "Ready", popular: true },
  { id: "loan", name: "Loan Planner", desc: "EMI & Amortization.", category: "Finance", href: "/tools/finance/loan-emi", icon: <Calculator size={24} />, color: "text-blue-600", bg: "bg-blue-50", status: "Ready", popular: true },
  { id: "debt", name: "Debt Destroyer", desc: "Snowball vs Avalanche payoff.", category: "Finance", href: "/tools/finance/debt-planner", icon: <PieChart size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "New", popular: false },
  { id: "sip", name: "SIP Calculator", desc: "Mutual fund growth projector.", category: "Finance", href: "/tools/finance/sip-calculator", icon: <TrendingUp size={24} />, color: "text-violet-600", bg: "bg-violet-50", status: "New", popular: true },

  // DOCUMENTS
  { id: "pdf-merge", name: "PDF Merger", desc: "Combine PDFs securely.", category: "Documents", href: "/tools/documents/pdf/merge", icon: <Layers size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "Ready", popular: true },
  { id: "img-compress", name: "Image Compressor", desc: "Shrink JPG/PNG size.", category: "Documents", href: "/tools/documents/image/compressor", icon: <Image size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", status: "Ready", popular: true },
  { id: "img-convert", name: "Image Converter", desc: "WebP to JPG/PNG.", category: "Documents", href: "/tools/documents/image/converter", icon: <RefreshCw size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "Ready", popular: false },
  { id: "img-resize", name: "Image Resizer", desc: "Resize dimensions.", category: "Documents", href: "/tools/documents/image/resizer", icon: <Crop size={24} />, color: "text-pink-600", bg: "bg-pink-50", status: "Ready", popular: false },
  { id: "json", name: "JSON Formatter", desc: "Validate & Minify.", category: "Documents", href: "/tools/documents/json/formatter", icon: <Braces size={24} />, color: "text-slate-600", bg: "bg-slate-200", status: "Ready", popular: false },

  // HEALTH
  { id: "bmi", name: "BMI Calculator", desc: "Body Mass Index.", category: "Health", href: "/tools/health/bmi", icon: <Calculator size={24} />, color: "text-teal-600", bg: "bg-teal-50", status: "Ready", popular: false },
  { id: "breathing", name: "Breathing App", desc: "4-7-8 Relaxation.", category: "Health", href: "/tools/health/breathing", icon: <Heart size={24} />, color: "text-sky-600", bg: "bg-sky-50", status: "Ready", popular: true },
  { id: "timer", name: "Workout Timer", desc: "HIIT / Tabata.", category: "Health", href: "/tools/health/timer", icon: <Zap size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "Ready", popular: false },

  // OTHERS
  { id: "password", name: "Password Gen", desc: "Secure passwords.", category: "Developer", href: "/tools/developer/password", icon: <Lock size={24} />, color: "text-purple-600", bg: "bg-purple-50", status: "Ready", popular: false },
  { id: "qr", name: "QR Generator", desc: "Create QR codes.", category: "Productivity", href: "/tools/productivity/qr-code", icon: <QrCode size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", status: "Ready", popular: false },
  { id: "markdown", name: "Markdown Editor", desc: "Write with preview.", category: "Developer", href: "/tools/writing/markdown", icon: <FileText size={24} />, color: "text-sky-600", bg: "bg-sky-50", status: "Ready", popular: false },
  { id: "case", name: "Case Converter", desc: "Text casing tool.", category: "Developer", href: "/tools/writing/case-converter", icon: <Type size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "Ready", popular: false },
  { id: "contrast", name: "Contrast Checker", desc: "Accessibility check.", category: "Design", href: "/tools/design/contrast", icon: <Palette size={24} />, color: "text-pink-600", bg: "bg-pink-50", status: "Ready", popular: false },
  { id: "unit", name: "Unit Converter", desc: "Length, Weight, Time.", category: "Converters", href: "/tools/converters/unit", icon: <Scale size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "Ready", popular: false },
  
  // AI
  { id: "ai-text", name: "Text Intelligence", desc: "Sentiment & Stats.", category: "AI", href: "/ai", icon: <Sparkles size={24} />, color: "text-violet-600", bg: "bg-violet-50", status: "Ready", popular: false }
];
