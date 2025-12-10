import React from "react";
import { 
  FileText, Shield, User, Home, Wallet, Calculator, TrendingUp, Landmark, Briefcase, 
  RefreshCw, Layers, ScanLine, Minimize, Scissors, FileSpreadsheet, FileType, 
  Globe, Key, Braces, Database, Clock, Terminal, Code2, Link, Hash, Binary, 
  Calendar, QrCode, Lock, Timer, ArrowRightLeft, Type, Pipette, Scale, Wind, Dumbbell, Sparkles, BrainCircuit,
  Image, Table, Percent, Check, Split, Grid, Laptop
} from "lucide-react";

export const ALL_TOOLS = [
  // --- BUSINESS (Blue/Indigo) ---
  { 
    id: "invoice-generator", name: "Pro Invoice Studio", category: "Business", href: "/tools/business/invoice-generator", icon: FileText, popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
  },
  { 
    id: "salary-slip", name: "Salary Slip Studio", category: "Business", href: "/tools/business/salary-slip", icon: FileText, popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400"
  },
  { 
    id: "smart-agreement", name: "Legal Contract Studio", category: "Business", href: "/tools/business/smart-agreement", icon: Shield,
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
  },
  { 
    id: "id-card", name: "ID Card Creator", category: "Business", href: "/tools/business/id-card", icon: User,
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400"
  },
  { 
    id: "rent-receipt", name: "Rent Receipt Generator", category: "Business", href: "/tools/business/rent-receipt", icon: Home,
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400"
  },

  // --- FINANCE (Emerald/Green) ---
  { 
    id: "smart-budget", name: "Budget Planner Pro", category: "Finance", href: "/tools/finance/smart-budget", icon: Wallet, popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
  },
  { 
    id: "smart-loan", name: "Smart Loan", category: "Finance", href: "/tools/finance/smart-loan", icon: Calculator,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
  },
  { 
    id: "smart-sip", name: "Smart SIP", category: "Finance", href: "/tools/finance/smart-sip", icon: TrendingUp,
    color: "text-lime-600 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-400"
  },
  { 
    id: "smart-net-worth", name: "Net Worth Tracker", category: "Finance", href: "/tools/finance/smart-net-worth", icon: Landmark,
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400"
  },
  { 
    id: "smart-retirement", name: "Retirement Planner", category: "Finance", href: "/tools/finance/smart-retirement", icon: Briefcase,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
  },
  { 
    id: "gst-calculator", name: "GST Calculator", category: "Finance", href: "/tools/finance/gst-calculator", icon: Percent,
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400"
  },

  // --- DOCUMENTS (Amber/Rose) ---
  { 
    id: "universal-converter", name: "Universal Converter", category: "Documents", href: "/tools/documents/universal-converter", icon: RefreshCw, popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
  },
  { 
    id: "smart-scan", name: "Smart Scan", category: "Documents", href: "/tools/documents/smart-scan", icon: ScanLine,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300"
  },
  { 
    id: "smart-pdf-merge", name: "PDF Workbench", category: "Documents", href: "/tools/documents/smart-pdf-merge", icon: Layers,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
  },
  { 
    id: "smart-pdf-split", name: "PDF Splitter", category: "Documents", href: "/tools/documents/smart-pdf-split", icon: Scissors,
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
  },
  { 
    id: "smart-img-compress", name: "Image Compressor", category: "Documents", href: "/tools/documents/smart-img-compress", icon: Minimize,
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400"
  },
  { 
    id: "smart-img-convert", name: "Image Converter", category: "Documents", href: "/tools/documents/smart-img-convert", icon: Image,
    color: "text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-400"
  },
  { 
    id: "smart-ocr", name: "Smart OCR", category: "Documents", href: "/tools/documents/smart-ocr", icon: FileType,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400"
  },
  { 
    id: "smart-word", name: "Markdown Studio", category: "Documents", href: "/tools/documents/smart-word", icon: Code2,
    color: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
  },
  { 
    id: "smart-excel", name: "Data Studio (CSV)", category: "Documents", href: "/tools/documents/smart-excel", icon: Grid,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
  },
  { 
    id: "json-csv", name: "JSON <> CSV", category: "Documents", href: "/tools/documents/json-csv", icon: Table,
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
  },

  // --- DEVELOPER (Violet/Purple) ---
  { 
    id: "dev-station", name: "DevStation Pro", category: "Developer", href: "/tools/developer/dev-station", icon: Terminal, popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400"
  },
  { 
    id: "api-playground", name: "API Playground", category: "Developer", href: "/tools/developer/api-playground", icon: Globe,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300"
  },
  { 
    id: "smart-jwt", name: "JWT Debugger", category: "Developer", href: "/tools/developer/smart-jwt", icon: Key,
    color: "text-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300"
  },
  { 
    id: "smart-json", name: "JSON Editor", category: "Developer", href: "/tools/developer/smart-json", icon: Braces,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300"
  },
  { 
    id: "smart-sql", name: "SQL Formatter", category: "Developer", href: "/tools/developer/smart-sql", icon: Database,
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400"
  },
  { 
    id: "cron-gen", name: "Cron Generator", category: "Developer", href: "/tools/developer/cron-gen", icon: Clock,
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
  },
  { 
    id: "git-cheats", name: "Git Commands", category: "Developer", href: "/tools/developer/git-cheats", icon: Laptop,
    color: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
  },
  { 
    id: "smart-diff", name: "Text Diff", category: "Developer", href: "/tools/developer/smart-diff", icon: Split,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400"
  },

  // --- PRODUCTIVITY (Rose/Slate) ---
  { 
    id: "life-os", name: "Life OS Planner", category: "Productivity", href: "/tools/productivity/life-os", icon: Calendar,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
  },
  { 
    id: "qr-code", name: "QR Generator", category: "Productivity", href: "/tools/productivity/qr-code", icon: QrCode,
    color: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
  },
  { 
    id: "smart-pass", name: "Password Gen", category: "Productivity", href: "/tools/productivity/smart-pass", icon: Lock,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300"
  },
  { 
    id: "pomodoro", name: "Pomodoro Timer", category: "Productivity", href: "/tools/productivity/pomodoro", icon: Timer,
    color: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-300"
  },

  // --- OTHERS ---
  { 
    id: "unit-convert", name: "Unit Converter", category: "Converters", href: "/tools/converters/unit-convert", icon: ArrowRightLeft,
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-300"
  },
  { 
    id: "case-convert", name: "Case Converter", category: "Converters", href: "/tools/converters/case-convert", icon: Type,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300"
  },
  { 
    id: "color-picker", name: "Color Picker", category: "Design", href: "/tools/design/color-picker", icon: Pipette,
    color: "text-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300"
  },
  { 
    id: "smart-bmi", name: "Smart BMI", category: "Health", href: "/tools/health/smart-bmi", icon: Scale,
    color: "text-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-300"
  },
  { 
    id: "smart-breath", name: "Box Breathing", category: "Health", href: "/tools/health/smart-breath", icon: Wind,
    color: "text-sky-500 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-300"
  },
  { 
    id: "smart-workout", name: "HIIT Timer", category: "Health", href: "/tools/health/smart-workout", icon: Dumbbell,
    color: "text-lime-500 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-300"
  },
  { 
    id: "smart-chat", name: "AI Chat", category: "AI", href: "/tools/ai/smart-chat", icon: Sparkles,
    color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300"
  },
  { 
    id: "smart-analyze", name: "Sentiment AI", category: "AI", href: "/tools/ai/smart-analyze", icon: BrainCircuit,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300"
  }
];