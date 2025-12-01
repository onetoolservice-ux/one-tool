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
