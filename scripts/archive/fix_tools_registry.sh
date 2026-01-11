#!/bin/bash

echo "í´§ Fixing Tools Registry (Adding missing imports)..."

cat > app/lib/tools-data.tsx << 'TS_END'
import { 
  Wallet, FileText, Heart, Zap, Palette, Terminal, 
  LayoutGrid, Calculator, Activity, TrendingUp, PiggyBank,
  ShieldCheck, Lock, Search, Wifi, Key, Globe, Database, 
  FileCode, Type, Ruler, Move, Image as ImageIcon, 
  Minimize, FileJson, Clock, Quote, Fingerprint, 
  ArrowRightLeft, FileStack, Scissors, Crop, 
  Dumbbell, Gamepad2, Flower2, ScanLine, Table, 
  Server, Hash, GitBranch, Code, List, Link, CheckSquare
} from "lucide-react";

export const ALL_TOOLS = [
  // ==========================
  // FINANCE (7 Tools)
  // ==========================
  { id: "smart-budget", title: "Smart Budget", desc: "Enterprise G/L & Personal Tracker.", icon: Wallet, href: "/tools/finance/smart-budget", category: "finance", status: "Live" },
  { id: "smart-loan", title: "Smart Loan", desc: "Amortization & Payoff visualizer.", icon: Calculator, href: "/tools/finance/smart-loan", category: "finance", status: "Live" },
  { id: "smart-debt", title: "Smart Debt", desc: "Avalanche vs Snowball calculator.", icon: Activity, href: "/tools/finance/smart-debt", category: "finance", status: "Live" },
  { id: "smart-net-worth", title: "Net Worth", desc: "Asset & Liability Tracker.", icon: PiggyBank, href: "/tools/finance/smart-net-worth", category: "finance", status: "Live" },
  { id: "smart-sip", title: "Smart SIP", desc: "Wealth builder projection.", icon: TrendingUp, href: "/tools/finance/smart-sip", category: "finance", status: "Live" },
  { id: "smart-retirement", title: "FIRE Calc", desc: "Retirement planning.", icon: TrendingUp, href: "/tools/finance/smart-retirement", category: "finance", status: "Live" },
  
  // ==========================
  // DEVELOPER (23 Tools)
  // ==========================
  { id: "smart-regex", title: "Regex Tester", desc: "Real-time pattern matching.", icon: Search, href: "/tools/developer/smart-regex", category: "developer", status: "Live" },
  { id: "smart-sql", title: "SQL Formatter", desc: "Prettify SQL queries.", icon: Database, href: "/tools/developer/smart-sql", category: "developer", status: "Live" },
  { id: "smart-json2ts", title: "JSON to TS", desc: "Generate TypeScript interfaces.", icon: FileCode, href: "/tools/developer/smart-json2ts", category: "developer", status: "Live" },
  { id: "smart-diff", title: "Text Diff", desc: "Compare two text blocks.", icon: FileCode, href: "/tools/developer/smart-diff", category: "developer", status: "Live" },
  { id: "smart-git", title: "Git Cheats", desc: "Common commands reference.", icon: GitBranch, href: "/tools/developer/smart-git", category: "developer", status: "Live" },
  { id: "smart-cron", title: "Cron Gen", desc: "Schedule expression builder.", icon: Clock, href: "/tools/developer/smart-cron", category: "developer", status: "Live" },
  { id: "smart-chmod", title: "Chmod Calc", desc: "Unix permission generator.", icon: Lock, href: "/tools/developer/smart-chmod", category: "developer", status: "Live" },
  { id: "smart-jwt", title: "JWT Decoder", desc: "Debug JWT tokens.", icon: ShieldCheck, href: "/tools/developer/smart-jwt", category: "developer", status: "Live" },
  { id: "smart-hash", title: "Hash Gen", desc: "MD5, SHA-1 crypto.", icon: Fingerprint, href: "/tools/developer/smart-hash", category: "developer", status: "Live" },
  { id: "smart-uuid", title: "UUID Gen", desc: "Unique ID v4.", icon: Fingerprint, href: "/tools/developer/smart-uuid", category: "developer", status: "Live" },
  { id: "smart-base64", title: "Base64", desc: "Encode/Decode strings.", icon: FileCode, href: "/tools/developer/smart-base64", category: "developer", status: "Live" },
  { id: "smart-url", title: "URL Parser", desc: "Analyze parameters.", icon: Link, href: "/tools/developer/smart-url", category: "developer", status: "Live" },
  { id: "smart-http", title: "HTTP Status", desc: "Code reference guide.", icon: Server, href: "/tools/developer/smart-http", category: "developer", status: "Live" },
  { id: "smart-ports", title: "Port Ref", desc: "Common server ports.", icon: Server, href: "/tools/developer/smart-ports", category: "developer", status: "Live" },
  { id: "smart-entities", title: "HTML Entities", desc: "Character codes.", icon: Code, href: "/tools/developer/smart-entities", category: "developer", status: "Live" },
  { id: "smart-css", title: "CSS Tools", desc: "Generators & Helpers.", icon: Palette, href: "/tools/developer/smart-css", category: "developer", status: "Live" },
  { id: "smart-min", title: "Minifier", desc: "Shrink JS/CSS code.", icon: Minimize, href: "/tools/developer/smart-min", category: "developer", status: "Live" },
  { id: "smart-ua", title: "User Agent", desc: "Browser string parser.", icon: Globe, href: "/tools/developer/smart-ua", category: "developer", status: "Live" },
  { id: "smart-wifi", title: "WiFi QR", desc: "Share network access.", icon: Wifi, href: "/tools/developer/wifi", category: "developer", status: "Live" },
  { id: "smart-pass", title: "Pass Gen", desc: "Secure random passwords.", icon: Key, href: "/tools/developer/smart-pass", category: "developer", status: "Live" },
  { id: "smart-lorem", title: "Lorem Ipsum", desc: "Dummy text generator.", icon: Quote, href: "/tools/developer/smart-lorem", category: "developer", status: "Live" },
  { id: "timestamp", title: "Timestamp", desc: "Unix time converter.", icon: Clock, href: "/tools/developer/timestamp", category: "developer", status: "Live" },
  { id: "smart-string", title: "String Tools", desc: "Text manipulation.", icon: Type, href: "/tools/developer/smart-string", category: "developer", status: "Live" },
  { id: "smart-curl", title: "Curl Builder", desc: "API Request helper.", icon: Terminal, href: "/tools/developer/smart-curl", category: "developer", status: "Live" },
  { id: "smart-meta", title: "Meta Tags", desc: "SEO tag generator.", icon: FileCode, href: "/tools/developer/smart-meta", category: "developer", status: "Live" },

  // ==========================
  // DOCUMENTS (10+ Tools)
  // ==========================
  { id: "pdf-merge", title: "PDF Merger", desc: "Combine multiple PDFs.", icon: FileStack, href: "/tools/documents/pdf/merge", category: "documents", status: "Live" },
  { id: "pdf-split", title: "PDF Split", desc: "Extract pages from PDF.", icon: Scissors, href: "/tools/documents/pdf/split", category: "documents", status: "Live" },
  { id: "image-pdf", title: "Img to PDF", desc: "Convert JPG/PNG to PDF.", icon: FileText, href: "/tools/converters/image-to-pdf", category: "documents", status: "Live" },
  { id: "pdf-word", title: "PDF to Word", desc: "Convert PDF to Doc.", icon: FileText, href: "/tools/converters/pdf-to-word", category: "documents", status: "Live" },
  { id: "smart-ocr", title: "Smart OCR", desc: "Extract text from images.", icon: ScanLine, href: "/tools/documents/smart-ocr", category: "documents", status: "Live" },
  { id: "smart-scan", title: "Smart Scan", desc: "Document digitizer.", icon: ScanLine, href: "/tools/documents/smart-scan", category: "documents", status: "Live" },
  { id: "smart-excel", title: "Smart Excel", desc: "Spreadsheet viewer.", icon: Table, href: "/tools/documents/smart-excel", category: "documents", status: "Live" },
  { id: "smart-word", title: "Smart Doc", desc: "Rich text editor.", icon: FileText, href: "/tools/documents/smart-word", category: "documents", status: "Live" },
  { id: "json-format", title: "JSON Fmt", desc: "Validate & Minify.", icon: FileJson, href: "/tools/documents/json/formatter", category: "documents", status: "Live" },
  { id: "image-resize", title: "Img Resizer", desc: "Pixel-perfect resizing.", icon: Move, href: "/tools/documents/image/resizer", category: "documents", status: "Live" },
  { id: "image-compress", title: "Compressor", desc: "Shrink image size.", icon: Minimize, href: "/tools/documents/image/compressor", category: "documents", status: "Live" },
  { id: "png-jpg", title: "PNG to JPG", desc: "Format converter.", icon: ImageIcon, href: "/tools/converters/png-to-jpg", category: "documents", status: "Live" },
  { id: "case-conv", title: "Case Switch", desc: "camelCase, snake_case.", icon: Type, href: "/tools/writing/case-converter", category: "documents", status: "Live" },
  { id: "markdown", title: "Markdown", desc: "Live MD Editor.", icon: FileCode, href: "/tools/writing/markdown", category: "documents", status: "Live" },

  // ==========================
  // HEALTH & PRODUCTIVITY (8 Tools)
  // ==========================
  { id: "smart-bmi", title: "BMI Calc", desc: "Body Mass Index.", icon: Activity, href: "/tools/health/smart-bmi", category: "health", status: "Live" },
  { id: "smart-breath", title: "Breathing", desc: "4-7-8 Relaxation.", icon: Heart, href: "/tools/health/smart-breath", category: "health", status: "Live" },
  { id: "smart-workout", title: "HIIT Timer", desc: "Interval training.", icon: Zap, href: "/tools/health/smart-workout", category: "health", status: "Live" },
  { id: "yoga", title: "Yoga Guide", desc: "Daily poses & flow.", icon: Flower2, href: "/tools/health/yoga", category: "health", status: "Live" },
  { id: "meditation", title: "Meditation", desc: "Focus timer & sound.", icon: Flower2, href: "/tools/health/meditation", category: "health", status: "Live" },
  { id: "gym", title: "Gym Guide", desc: "Workout sets log.", icon: Dumbbell, href: "/tools/health/gym", category: "health", status: "Live" },
  { id: "games", title: "Mind Games", desc: "Focus & Memory.", icon: Gamepad2, href: "/tools/health/games", category: "health", status: "Live" },
  { id: "unit-converter", title: "Unit Conv", desc: "Length, Weight, Temp.", icon: ArrowRightLeft, href: "/tools/converters/unit", category: "productivity", status: "Live" },
  { id: "qr-code", title: "QR Gen", desc: "Text to QR Code.", icon: LayoutGrid, href: "/tools/productivity/qr-code", category: "productivity", status: "Live" },
  
  // ==========================
  // DESIGN (2 Tools)
  // ==========================
  { id: "contrast", title: "Contrast", desc: "WCAG Accessibility.", icon: Palette, href: "/tools/design/contrast", category: "design", status: "Live" },
  { id: "aspect-ratio", title: "Aspect Ratio", desc: "Dimension calculator.", icon: Ruler, href: "/tools/design/aspect-ratio", category: "design", status: "Live" },
];
TS_END

echo "âœ… Fixed. Run 'npm run dev' now."
