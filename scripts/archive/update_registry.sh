#!/bin/bash
echo "í·‚ï¸ Updating Tool Registry..."
# We are overwriting tools-data.tsx with the COMPLETE list of 35+ tools
cat > app/lib/tools-data.tsx << 'TS_END'
import { 
  Wallet, FileText, Heart, Zap, Palette, Terminal, 
  LayoutGrid, Calculator, Activity, TrendingUp, PiggyBank,
  ShieldCheck, Lock, Search, Wifi, Key, Globe, Database, 
  FileCode, Type, Ruler, Move, Image as ImageIcon, 
  Minimize, FileJson, Clock, Quote, Fingerprint, 
  ArrowRightLeft, FileStack, Crop, LockOpen, FileCog
} from "lucide-react";

export const ALL_TOOLS = [
  // --- FINANCE ---
  { id: "smart-budget", title: "Smart Budget", desc: "Enterprise G/L & Personal Tracker.", icon: Wallet, href: "/tools/finance/smart-budget", category: "finance", status: "Live" },
  { id: "smart-loan", title: "Smart Loan", desc: "Amortization & Payoff visualizer.", icon: Calculator, href: "/tools/finance/smart-loan", category: "finance", status: "Live" },
  { id: "smart-debt", title: "Smart Debt", desc: "Avalanche vs Snowball calculator.", icon: Activity, href: "/tools/finance/smart-debt", category: "finance", status: "Live" },
  { id: "smart-sip", title: "Smart SIP", desc: "Wealth builder projection.", icon: TrendingUp, href: "/tools/finance/smart-sip", category: "finance", status: "Live" },
  { id: "smart-retirement", title: "FIRE Calc", desc: "Retirement planning.", icon: PiggyBank, href: "/tools/finance/retirement", category: "finance", status: "New" },

  // --- DOCUMENTS ---
  { id: "pdf-merge", title: "PDF Merger", desc: "Combine multiple PDFs.", icon: FileStack, href: "/tools/documents/pdf/merge", category: "documents", status: "Live" },
  { id: "image-pdf", title: "Image to PDF", desc: "Convert JPG/PNG to PDF.", icon: FileText, href: "/tools/converters/image-to-pdf", category: "documents", status: "Live" },
  { id: "json-format", title: "JSON Formatter", desc: "Validate & Minify.", icon: FileJson, href: "/tools/documents/json/formatter", category: "documents", status: "Live" },
  { id: "image-resize", title: "Image Resizer", desc: "Pixel-perfect resizing.", icon: Move, href: "/tools/documents/image/resizer", category: "documents", status: "Live" },
  { id: "case-conv", title: "Case Switch", desc: "camelCase, snake_case.", icon: Type, href: "/tools/writing/case-converter", category: "documents", status: "Live" },
  { id: "png-jpg", title: "PNG to JPG", desc: "Format converter.", icon: ImageIcon, href: "/tools/converters/png-to-jpg", category: "documents", status: "Live" },

  // --- DEVELOPER ---
  { id: "smart-regex", title: "Regex Tester", desc: "Real-time pattern matching.", icon: Search, href: "/tools/developer/smart-regex", category: "developer", status: "Live" },
  { id: "smart-sql", title: "SQL Formatter", desc: "Prettify SQL queries.", icon: Database, href: "/tools/developer/smart-sql", category: "developer", status: "Live" },
  { id: "smart-hash", title: "Hash Gen", desc: "MD5, SHA-1 crypto.", icon: ShieldCheck, href: "/tools/developer/smart-hash", category: "developer", status: "Live" },
  { id: "smart-wifi", title: "WiFi QR", desc: "Share network access.", icon: Wifi, href: "/tools/developer/wifi", category: "developer", status: "Live" },
  { id: "smart-pass", title: "Password Gen", desc: "Secure random passwords.", icon: Key, href: "/tools/developer/smart-pass", category: "developer", status: "Live" },
  { id: "smart-jwt", title: "JWT Decoder", desc: "Debug JWT tokens.", icon: LockOpen, href: "/tools/developer/smart-jwt", category: "developer", status: "Live" },
  { id: "smart-ts", title: "JSON to TS", desc: "Generate TypeScript interfaces.", icon: FileCode, href: "/tools/developer/smart-json2ts", category: "developer", status: "Live" },
  { id: "smart-chmod", title: "Chmod Calc", desc: "Unix permission generator.", icon: Lock, href: "/tools/developer/smart-chmod", category: "developer", status: "Live" },
  { id: "smart-ua", title: "User Agent", desc: "Browser string parser.", icon: Globe, href: "/tools/developer/smart-ua", category: "developer", status: "Live" },
  { id: "smart-diff", title: "Text Diff", desc: "Compare two text blocks.", icon: FileCode, href: "/tools/developer/smart-diff", category: "developer", status: "Live" },
  { id: "timestamp", title: "Timestamp", desc: "Unix time converter.", icon: Clock, href: "/tools/developer/timestamp", category: "developer", status: "Live" },
  { id: "smart-uuid", title: "UUID Gen", desc: "Unique ID v4.", icon: Fingerprint, href: "/tools/developer/smart-uuid", category: "developer", status: "Live" },
  { id: "smart-base64", title: "Base64", desc: "Encode/Decode strings.", icon: FileCode, href: "/tools/developer/smart-base64", category: "developer", status: "Live" },
  { id: "smart-url", title: "URL Parser", desc: "Analyze parameters.", icon: Search, href: "/tools/developer/smart-url", category: "developer", status: "Live" },
  { id: "smart-lorem", title: "Lorem Ipsum", desc: "Dummy text generator.", icon: Quote, href: "/tools/developer/smart-lorem", category: "developer", status: "Live" },

  // --- HEALTH & DESIGN ---
  { id: "smart-bmi", title: "BMI Calc", desc: "Body Mass Index.", icon: Activity, href: "/tools/health/smart-bmi", category: "health", status: "Live" },
  { id: "smart-breath", title: "Breathing", desc: "4-7-8 Relaxation.", icon: Heart, href: "/tools/health/smart-breath", category: "health", status: "Live" },
  { id: "smart-workout", title: "HIIT Timer", desc: "Interval training.", icon: Zap, href: "/tools/health/smart-workout", category: "health", status: "Live" },
  { id: "contrast", title: "Contrast Check", desc: "WCAG Accessibility.", icon: Palette, href: "/tools/design/contrast", category: "design", status: "Live" },
  { id: "aspect-ratio", title: "Aspect Ratio", desc: "Dimension calculator.", icon: Ruler, href: "/tools/design/aspect-ratio", category: "design", status: "Live" },
  { id: "unit-converter", title: "Unit Converter", desc: "Length, Weight, Temp.", icon: ArrowRightLeft, href: "/tools/converters/unit", category: "productivity", status: "Live" },
  { id: "qr-code", title: "QR Generator", desc: "Text to QR Code.", icon: LayoutGrid, href: "/tools/productivity/qr-code", category: "productivity", status: "Live" },
];
TS_END
echo "âœ… Registry Updated. All tools connected."
