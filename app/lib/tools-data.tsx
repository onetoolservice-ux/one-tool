import type { IconName } from "./utils/icon-mapper";

export interface Tool {
  id: string;
  name: string;
  category: string;
  href: string;
  icon: IconName;
  popular?: boolean;
  color: string;
  desc: string;
  status?: string;
}

// Category order for display (Analytics first as it's the most feature-rich)
export const CATEGORY_ORDER = [
  "Analytics",
  "Finance",
  "Business",
  "Documents",
  "Developer",
  "Productivity",
  "Converters",
  "Design",
  "Health",
  "AI",
  "Creator"
] as const;

export const ALL_TOOLS: Tool[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS (Featured - Blue/Emerald) - Data analysis and visualization
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "analyticsreport",
    name: "Analytics Report",
    category: "Analytics",
    href: "/tools/analytics/analyticsreport",
    icon: "Table",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Build shareable analytics reports with drag-and-drop metrics, KPIs, pivot tables, and exportable charts."
  },
  {
    id: "managetransaction",
    name: "Manage Monthly Transactions",
    category: "Analytics",
    href: "/tools/analytics/managetransaction",
    icon: "Upload",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Upload bank statements once, analyze everywhere. Intelligent column detection for any bank format."
  },
  {
    id: "expenses",
    name: "Expense Tracker",
    category: "Analytics",
    href: "/tools/analytics/expenses",
    icon: "TrendingDown",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Track and analyze monthly expenses with smart categorization, trends, and spending insights."
  },
  {
    id: "credits",
    name: "Income Tracker",
    category: "Analytics",
    href: "/tools/analytics/credits",
    icon: "TrendingUp",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Monitor income and credits with detailed breakdowns, source analysis, and growth tracking."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE (Emerald/Green) - Financial calculators and planners
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "smart-budget",
    name: "Budget Planner Pro",
    category: "Finance",
    href: "/tools/finance/smart-budget",
    icon: "Wallet",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Create detailed monthly budgets with income tracking, expense categories, and savings goals."
  },
  {
    id: "smart-loan",
    name: "Smart Loan Calculator",
    category: "Finance",
    href: "/tools/finance/smart-loan",
    icon: "Calculator",
    popular: true,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "Calculate EMI, total interest, and amortization schedules for home, car, or personal loans."
  },
  {
    id: "smart-sip",
    name: "SIP Calculator",
    category: "Finance",
    href: "/tools/finance/smart-sip",
    icon: "TrendingUp",
    color: "text-lime-600 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-400",
    desc: "Plan systematic investments with projected returns, wealth accumulation, and goal tracking."
  },
  {
    id: "smart-net-worth",
    name: "Net Worth Tracker",
    category: "Finance",
    href: "/tools/finance/smart-net-worth",
    icon: "Landmark",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "Track assets and liabilities to monitor your net worth growth over time."
  },
  {
    id: "smart-retirement",
    name: "Retirement Planner",
    category: "Finance",
    href: "/tools/finance/smart-retirement",
    icon: "Briefcase",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Plan retirement corpus with inflation adjustment, pension estimates, and withdrawal strategies."
  },
  {
    id: "gst-calculator",
    name: "GST Calculator",
    category: "Finance",
    href: "/tools/finance/gst-calculator",
    icon: "Percent",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Calculate GST amounts, inclusive/exclusive prices, and tax breakdowns for Indian businesses."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS (Blue/Indigo) - Professional document generators
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "invoice-generator",
    name: "Pro Invoice Studio",
    category: "Business",
    href: "/tools/business/invoice-generator",
    icon: "FileText",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Create professional GST invoices with customizable templates, auto-calculations, and PDF export."
  },
  {
    id: "salary-slip",
    name: "Salary Slip Studio",
    category: "Business",
    href: "/tools/business/salary-slip",
    icon: "FileText",
    popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Generate detailed salary slips with earnings, deductions, and compliance-ready formatting."
  },
  {
    id: "smart-agreement",
    name: "Legal Contract Studio",
    category: "Business",
    href: "/tools/business/smart-agreement",
    icon: "Shield",
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Create NDAs, service agreements, and legal contracts with customizable templates."
  },
  {
    id: "id-card",
    name: "ID Card Creator",
    category: "Business",
    href: "/tools/business/id-card",
    icon: "User",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Design professional employee ID cards with photo upload, QR codes, and custom branding."
  },
  {
    id: "rent-receipt",
    name: "Rent Receipt Generator",
    category: "Business",
    href: "/tools/business/rent-receipt",
    icon: "Home",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Generate rent receipts for HRA claims with landlord details and revenue stamps."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOCUMENTS (Amber/Rose) - File conversion and processing
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "universal-converter",
    name: "Universal Converter",
    category: "Documents",
    href: "/tools/documents/universal-converter",
    icon: "RefreshCw",
    popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Convert between 50+ file formats including documents, images, audio, and video files."
  },
  {
    id: "smart-scan",
    name: "Smart Scan",
    category: "Documents",
    href: "/tools/documents/smart-scan",
    icon: "ScanLine",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300",
    desc: "Scan documents with your camera, auto-crop, enhance quality, and save as PDF."
  },
  {
    id: "smart-pdf-merge",
    name: "PDF Workbench",
    category: "Documents",
    href: "/tools/documents/smart-pdf-merge",
    icon: "Layers",
    popular: true,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Merge, combine, and organize multiple PDFs into a single document with page reordering."
  },
  {
    id: "smart-pdf-split",
    name: "PDF Splitter",
    category: "Documents",
    href: "/tools/documents/smart-pdf-split",
    icon: "Scissors",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Split PDFs by page ranges, extract specific pages, or separate into individual files."
  },
  {
    id: "smart-img-compress",
    name: "Image Compressor",
    category: "Documents",
    href: "/tools/documents/smart-img-compress",
    icon: "Minimize",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Compress images up to 90% smaller while maintaining quality. Batch process multiple files."
  },
  {
    id: "smart-img-convert",
    name: "Image Converter",
    category: "Documents",
    href: "/tools/documents/smart-img-convert",
    icon: "Image",
    color: "text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-400",
    desc: "Convert images between PNG, JPG, WebP, GIF, and other formats with quality control."
  },
  {
    id: "smart-ocr",
    name: "Smart OCR",
    category: "Documents",
    href: "/tools/documents/smart-ocr",
    icon: "FileType",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Extract text from images and scanned documents with high accuracy OCR technology."
  },
  {
    id: "smart-word",
    name: "Markdown Studio",
    category: "Documents",
    href: "/tools/documents/smart-word",
    icon: "Code2",
    color: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Write and preview Markdown with live rendering, export to HTML, PDF, or Word."
  },
  {
    id: "smart-excel",
    name: "Data Studio (CSV)",
    category: "Documents",
    href: "/tools/documents/smart-excel",
    icon: "Grid",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Edit, filter, and transform CSV data with spreadsheet-like interface and formulas."
  },
  {
    id: "json-csv",
    name: "JSON ↔ CSV Converter",
    category: "Documents",
    href: "/tools/documents/json-csv",
    icon: "Table",
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    desc: "Convert between JSON and CSV formats with nested object support and custom mapping."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEVELOPER (Violet/Purple) - Coding and development utilities
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "dev-station",
    name: "DevStation Pro",
    category: "Developer",
    href: "/tools/developer/dev-station",
    icon: "Terminal",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "All-in-one developer toolkit with encoders, formatters, generators, and debugging tools."
  },
  {
    id: "api-playground",
    name: "API Playground",
    category: "Developer",
    href: "/tools/developer/api-playground",
    icon: "Globe",
    popular: true,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300",
    desc: "Test REST APIs with custom headers, authentication, and response visualization."
  },
  {
    id: "smart-jwt",
    name: "JWT Debugger",
    category: "Developer",
    href: "/tools/developer/smart-jwt",
    icon: "Key",
    color: "text-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300",
    desc: "Decode, verify, and debug JWT tokens with payload inspection and signature validation."
  },
  {
    id: "smart-json",
    name: "JSON Editor",
    category: "Developer",
    href: "/tools/developer/smart-json",
    icon: "Braces",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "Format, validate, and edit JSON with syntax highlighting, tree view, and error detection."
  },
  {
    id: "smart-sql",
    name: "SQL Formatter",
    category: "Developer",
    href: "/tools/developer/smart-sql",
    icon: "Database",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Format and beautify SQL queries with customizable indentation and keyword casing."
  },
  {
    id: "cron-gen",
    name: "Cron Generator",
    category: "Developer",
    href: "/tools/developer/cron-gen",
    icon: "Clock",
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Build cron expressions with visual editor, preview next run times, and expression explanation."
  },
  {
    id: "git-cheats",
    name: "Git Commands",
    category: "Developer",
    href: "/tools/developer/git-cheats",
    icon: "Laptop",
    color: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Quick reference for Git commands with examples, explanations, and copy-to-clipboard."
  },
  {
    id: "smart-diff",
    name: "Text Diff",
    category: "Developer",
    href: "/tools/developer/smart-diff",
    icon: "Split",
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Compare two texts side-by-side with highlighted differences and merge suggestions."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCTIVITY (Rose/Slate) - Daily productivity tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "life-os",
    name: "Life OS Planner",
    category: "Productivity",
    href: "/tools/productivity/life-os",
    icon: "Calendar",
    popular: true,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Organize your life with goals, habits, tasks, and calendar integration in one place."
  },
  {
    id: "qr-code",
    name: "QR Code Generator",
    category: "Productivity",
    href: "/tools/productivity/qr-code",
    icon: "QrCode",
    color: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Generate QR codes for URLs, text, WiFi, contacts, and more with custom styling."
  },
  {
    id: "smart-pass",
    name: "Password Generator",
    category: "Productivity",
    href: "/tools/productivity/smart-pass",
    icon: "Lock",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300",
    desc: "Create strong, secure passwords with customizable length, complexity, and character sets."
  },
  {
    id: "pomodoro",
    name: "Pomodoro Timer",
    category: "Productivity",
    href: "/tools/productivity/pomodoro",
    icon: "Timer",
    color: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-300",
    desc: "Boost focus with 25-minute work sessions, breaks, and productivity tracking."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERTERS (Cyan/Orange) - Unit and format conversion
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "unit-convert",
    name: "Unit Converter",
    category: "Converters",
    href: "/tools/converters/unit-convert",
    icon: "ArrowRightLeft",
    popular: true,
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-300",
    desc: "Convert length, weight, temperature, volume, area, and 20+ other measurement types."
  },
  {
    id: "case-convert",
    name: "Case Converter",
    category: "Converters",
    href: "/tools/converters/case-convert",
    icon: "Type",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "Transform text to uppercase, lowercase, title case, sentence case, and more."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DESIGN (Pink) - Visual design tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "color-picker",
    name: "Color Picker",
    category: "Design",
    href: "/tools/design/color-picker",
    icon: "Pipette",
    popular: true,
    color: "text-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300",
    desc: "Pick colors with HEX, RGB, HSL support, generate palettes, and check contrast ratios."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH (Teal/Sky) - Fitness and wellness tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "smart-bmi",
    name: "BMI Calculator",
    category: "Health",
    href: "/tools/health/smart-bmi",
    icon: "Scale",
    popular: true,
    color: "text-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-300",
    desc: "Calculate Body Mass Index with health category, ideal weight range, and recommendations."
  },
  {
    id: "smart-breath",
    name: "Box Breathing",
    category: "Health",
    href: "/tools/health/smart-breath",
    icon: "Wind",
    color: "text-sky-500 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-300",
    desc: "Guided breathing exercises for relaxation, stress relief, and improved focus."
  },
  {
    id: "smart-workout",
    name: "HIIT Timer",
    category: "Health",
    href: "/tools/health/smart-workout",
    icon: "Dumbbell",
    color: "text-lime-500 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-300",
    desc: "Customizable interval training timer with work/rest periods and audio cues."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI (Violet/Purple) - AI-powered tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "prompt-generator",
    name: "AI Prompt Generator",
    category: "AI",
    href: "/tools/ai/prompt-generator",
    icon: "FileCode",
    popular: true,
    color: "text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-300",
    desc: "Generate effective AI prompts for ChatGPT, Claude, and other LLMs with templates."
  },
  {
    id: "smart-chat",
    name: "AI Chat Assistant",
    category: "AI",
    href: "/tools/ai/smart-chat",
    icon: "Sparkles",
    color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300",
    desc: "Chat with AI for writing, coding, research, and creative tasks with conversation history."
  },
  {
    id: "smart-analyze",
    name: "Sentiment Analyzer",
    category: "AI",
    href: "/tools/ai/smart-analyze",
    icon: "BrainCircuit",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300",
    desc: "Analyze text sentiment, emotions, and tone for reviews, feedback, and social media."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR (Purple) - Content creation tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "audio-transcription",
    name: "Audio Transcription",
    category: "Creator",
    href: "/tools/creator/audio-transcription",
    icon: "Mic",
    popular: true,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Convert audio/video to text with speaker detection, timestamps, and content ideas."
  }
];

// Helper to get tools by category
export function getToolsByCategory(category: string): Tool[] {
  return ALL_TOOLS.filter(tool => tool.category === category);
}

// Helper to get popular tools
export function getPopularTools(): Tool[] {
  return ALL_TOOLS.filter(tool => tool.popular);
}

// Helper to get all categories in order
export function getCategories(): string[] {
  return CATEGORY_ORDER.filter(cat =>
    ALL_TOOLS.some(tool => tool.category === cat)
  );
}
