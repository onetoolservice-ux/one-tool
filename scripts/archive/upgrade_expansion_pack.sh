#!/bin/bash

echo "íº€ Expanding OneTool to 50+ Apps & Standardizing Layouts..."

# 1. POPULATE DATABASE (50+ Tools)
cat > app/lib/tools-data.tsx << 'DATA_EOF'
import React from "react";
import { 
  Wallet, Calculator, Lock, Layers, Image, Zap, Braces, Heart, Wind, Sparkles, Scale, RefreshCw, FileText, Palette, QrCode, Type, Contrast, TrendingUp, Droplets, PieChart, Crop, Landmark, Briefcase, Code2, Database, Wifi, FileCode, Split, Clock, Scissors, CheckCircle, ArrowRight, Ratio, Binary, Key, Link, Hash, Fingerprint, Shield, Network, Globe, Terminal, Server, Activity, Box, Minimize, Search, Command, ScanLine, FileSpreadsheet, FileType, Dumbbell, Mic, BrainCircuit, Ruler, Pipette, Timer, ListTodo, StickyNote, FileJson, FileDigit, Languages, Mail
} from "lucide-react";

export const ALL_TOOLS = [
  // FINANCE
  { id: "smart-budget", name: "Smart Budget", desc: "Enterprise G/L & Expense Tracking.", category: "Finance", href: "/tools/finance/smart-budget", icon: <Wallet size={24} />, status: "Ready", popular: true },
  { id: "smart-loan", name: "Smart Loan", desc: "Amortization & Interest Calc.", category: "Finance", href: "/tools/finance/smart-loan", icon: <Calculator size={24} />, status: "Ready", popular: true },
  { id: "smart-debt", name: "Smart Debt", desc: "Snowball/Avalanche Payoff.", category: "Finance", href: "/tools/finance/smart-debt", icon: <PieChart size={24} />, status: "Ready", popular: false },
  { id: "smart-net-worth", name: "Smart Net Worth", desc: "Total Asset Tracker.", category: "Finance", href: "/tools/finance/smart-net-worth", icon: <Landmark size={24} />, status: "Ready", popular: false },
  { id: "smart-retirement", name: "Smart Retirement", desc: "FIRE Projection Engine.", category: "Finance", href: "/tools/finance/smart-retirement", icon: <Briefcase size={24} />, status: "Ready", popular: false },
  { id: "smart-sip", name: "Smart SIP", desc: "Mutual Fund Wealth Builder.", category: "Finance", href: "/tools/finance/smart-sip", icon: <TrendingUp size={24} />, status: "Ready", popular: true },

  // DOCUMENTS
  { id: "smart-pdf-merge", name: "PDF Merge", desc: "Combine multiple PDFs.", category: "Documents", href: "/tools/documents/pdf/merge", icon: <Layers size={24} />, status: "Ready", popular: true },
  { id: "smart-pdf-split", name: "PDF Split", desc: "Extract pages instantly.", category: "Documents", href: "/tools/documents/pdf/split", icon: <Scissors size={24} />, status: "Ready", popular: false },
  { id: "smart-scan", name: "Smart Scan", desc: "Images to PDF Converter.", category: "Documents", href: "/tools/documents/smart-scan", icon: <ScanLine size={24} />, status: "New", popular: true },
  { id: "smart-word", name: "Smart Word", desc: "Distraction-free Writer.", category: "Documents", href: "/tools/documents/smart-word", icon: <FileText size={24} />, status: "New", popular: false },
  { id: "smart-excel", name: "Smart Excel", desc: "Web Spreadsheet Editor.", category: "Documents", href: "/tools/documents/smart-excel", icon: <FileSpreadsheet size={24} />, status: "New", popular: false },
  { id: "smart-ocr", name: "Smart OCR", desc: "Extract Text from Images.", category: "Documents", href: "/tools/documents/smart-ocr", icon: <FileType size={24} />, status: "New", popular: true },
  { id: "smart-json", name: "JSON Formatter", desc: "Validate & Beautify JSON.", category: "Documents", href: "/tools/documents/json/formatter", icon: <Braces size={24} />, status: "Ready", popular: false },

  // HEALTH
  { id: "smart-bmi", name: "Smart BMI", desc: "Body Mass Index Calculator.", category: "Health", href: "/tools/health/smart-bmi", icon: <Scale size={24} />, status: "New", popular: true },
  { id: "smart-breath", name: "Box Breathing", desc: "Stress Relief Guide.", category: "Health", href: "/tools/health/smart-breath", icon: <Wind size={24} />, status: "New", popular: false },
  { id: "smart-workout", name: "HIIT Timer", desc: "Interval Training Clock.", category: "Health", href: "/tools/health/smart-workout", icon: <Dumbbell size={24} />, status: "New", popular: false },

  // DEVELOPER
  { id: "smart-sql", name: "SQL Formatter", desc: "Beautify SQL Queries.", category: "Developer", href: "/tools/developer/smart-sql", icon: <Database size={24} />, status: "Ready", popular: true },
  { id: "smart-regex", name: "Regex Tester", desc: "Test Regular Expressions.", category: "Developer", href: "/tools/developer/smart-regex", icon: <Code2 size={24} />, status: "Ready", popular: true },
  { id: "smart-diff", name: "Text Diff", desc: "Compare two texts.", category: "Developer", href: "/tools/developer/smart-diff", icon: <Split size={24} />, status: "Ready", popular: false },
  { id: "smart-pass", name: "Password Gen", desc: "Secure Random Passwords.", category: "Developer", href: "/tools/developer/smart-pass", icon: <Lock size={24} />, status: "Ready", popular: true },
  { id: "smart-base64", name: "Base64 Tool", desc: "Encode and Decode.", category: "Developer", href: "/tools/developer/smart-base64", icon: <Binary size={24} />, status: "New", popular: false },
  { id: "smart-hash", name: "Hash Generator", desc: "MD5, SHA-256, SHA-512.", category: "Developer", href: "/tools/developer/smart-hash", icon: <Fingerprint size={24} />, status: "New", popular: false },
  { id: "smart-jwt", name: "JWT Debugger", desc: "Decode JSON Web Tokens.", category: "Developer", href: "/tools/developer/smart-jwt", icon: <Key size={24} />, status: "New", popular: true },
  { id: "smart-uuid", name: "UUID Generator", desc: "V4 UUIDs Instantly.", category: "Developer", href: "/tools/developer/smart-uuid", icon: <Hash size={24} />, status: "New", popular: false },
  { id: "smart-url", name: "URL Parser", desc: "Parse & Encode URLs.", category: "Developer", href: "/tools/developer/smart-url", icon: <Link size={24} />, status: "New", popular: true },
  { id: "smart-json2ts", name: "JSON to TS", desc: "Generate TypeScript Interfaces.", category: "Developer", href: "/tools/developer/smart-json2ts", icon: <FileCode size={24} />, status: "New", popular: true },
  { id: "smart-cron", name: "Cron Guru", desc: "Explain Cron Schedules.", category: "Developer", href: "/tools/developer/smart-cron", icon: <Clock size={24} />, status: "New", popular: false },
  { id: "smart-git", name: "Git Cheatsheet", desc: "Common Commands.", category: "Developer", href: "/tools/developer/smart-git", icon: <Terminal size={24} />, status: "New", popular: false },
  { id: "smart-curl", name: "Curl Builder", desc: "Construct API Requests.", category: "Developer", href: "/tools/developer/smart-curl", icon: <Command size={24} />, status: "New", popular: false },
  
  // DESIGN & COLORS
  { id: "color-picker", name: "Color Picker", desc: "HEX, RGB, HSL.", category: "Design", href: "/tools/design/picker", icon: <Pipette size={24} />, status: "New", popular: true },
  { id: "contrast-checker", name: "Contrast Check", desc: "WCAG Accessibility.", category: "Design", href: "/tools/design/contrast", icon: <Contrast size={24} />, status: "New", popular: true },
  { id: "aspect-ratio", name: "Aspect Ratio", desc: "Calculator for screens.", category: "Design", href: "/tools/design/aspect-ratio", icon: <Ratio size={24} />, status: "New", popular: false },
  { id: "tailwind-cheat", name: "Tailwind Cheat", desc: "Class reference.", category: "Design", href: "/tools/design/tailwind", icon: <Palette size={24} />, status: "New", popular: false },

  // PRODUCTIVITY
  { id: "pomodoro", name: "Pomodoro", desc: "Focus Timer.", category: "Productivity", href: "/tools/productivity/pomodoro", icon: <Timer size={24} />, status: "New", popular: true },
  { id: "todo", name: "Local Todo", desc: "Task list (LocalStorage).", category: "Productivity", href: "/tools/productivity/todo", icon: <ListTodo size={24} />, status: "New", popular: false },
  { id: "notes", name: "Quick Notes", desc: "Scratchpad.", category: "Productivity", href: "/tools/productivity/notes", icon: <StickyNote size={24} />, status: "New", popular: false },
  { id: "qr-code", name: "QR Generator", desc: "Text to QR Code.", category: "Productivity", href: "/tools/productivity/qr-code", icon: <QrCode size={24} />, status: "New", popular: true },
  
  // CONVERTERS
  { id: "json-csv", name: "JSON <> CSV", desc: "Data converter.", category: "Converters", href: "/tools/converters/json-csv", icon: <FileJson size={24} />, status: "New", popular: true },
  { id: "unit-convert", name: "Unit Converter", desc: "Length, Weight, Temp.", category: "Converters", href: "/tools/converters/unit", icon: <RefreshCw size={24} />, status: "New", popular: false },
  { id: "case-convert", name: "Case Converter", desc: "snake_case to CamelCase.", category: "Converters", href: "/tools/converters/case", icon: <Type size={24} />, status: "New", popular: false },

  // AI TOOLS
  { id: "smart-chat", name: "Smart Chat", desc: "Local Bot UI.", category: "AI", href: "/tools/ai/smart-chat", icon: <Sparkles size={24} />, status: "New", popular: true },
  { id: "smart-voice", name: "Text to Speech", desc: "Browser Voice Synthesis.", category: "AI", href: "/tools/ai/smart-voice", icon: <Mic size={24} />, status: "New", popular: false },
];
DATA_EOF

# 2. UPGRADE GENERIC CLIENT (Applying the Design System)
# This ensures even empty tools look Professional (no 404s or ugly pages)
cat > app/tools/\[category\]/\[tool\]/ToolClient.tsx << 'GENERIC_EOF'
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import ToolShell from "@/app/components/layout/ToolShell";
import RelatedTools from "@/app/components/tools/RelatedTools";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

interface ToolClientProps {
  params: {
    tool: string;
    category: string;
  };
}

export default function ToolClient({ params }: ToolClientProps) {
  const { tool } = params;
  const toolData = ALL_TOOLS.find((t) => t.id === tool);

  // Fallback if tool not found in data
  if (!toolData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-slate-50 dark:bg-[#0B1120]">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Tool Not Found</h2>
        <Link href="/">
          <Button>Go Back Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <ToolShell 
      title={toolData.name}
      description={toolData.desc + " Secure, client-side processing. No data leaves your device."}
      category={toolData.category}
      icon={toolData.icon}
      actions={
        <Button variant="ghost" size="sm" disabled>
          Ver: 1.0.0
        </Button>
      }
    >
      {/* Placeholder Interface for Unbuilt Tools */}
      <div className="grid gap-8">
        <Card className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
           <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full mb-6 animate-pulse">
             <Wrench size={48} className="text-slate-300 dark:text-slate-600" />
           </div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
             {toolData.name} is Ready to Build
           </h3>
           <p className="text-slate-500 max-w-md mb-8">
             This tool is part of the Enterprise Suite. The interface is being initialized. 
             Check back soon or use the search (Ctrl+K) to find other tools.
           </p>
           <div className="flex gap-4">
             <Link href="/">
               <Button variant="secondary">Back to Dashboard</Button>
             </Link>
             <Button disabled>Launch Tool</Button>
           </div>
        </Card>

        {/* Recommendation Engine */}
        <RelatedTools currentToolId={toolData.id} category={toolData.category} />
      </div>
    </ToolShell>
  );
}
GENERIC_EOF

echo "âœ… Expansion Pack Installed."
echo "í±‰ Run 'npm run dev' and check the Home Page. It should be PACKED."
