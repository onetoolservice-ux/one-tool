const fs = require('fs');
const path = require('path');

console.log("💎 STARTING GOLDEN MASTER DEPLOYMENT...");

// Helper to write files safely (Creates directories if missing)
const writeFile = (filePath, content) => {
  const targetPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`✅ Written: ${filePath}`);
};

// ==========================================
// 1. GLOBAL CSS (Modern Scrollbar & Colors)
// ==========================================
const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 15, 23, 42;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

.dark {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 2, 6, 23;
  --background-end-rgb: 2, 6, 23;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-start-rgb));
}

/* Custom Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
.dark ::-webkit-scrollbar-thumb { background-color: #334155; }
::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
.dark ::-webkit-scrollbar-thumb:hover { background-color: #475569; }
`;

// ==========================================
// 2. THEME ENGINE (Smart Glow Colors)
// ==========================================
const themeConfig = `export type ToolCategory = 'finance' | 'developer' | 'health' | 'documents' | 'converters' | 'ai' | 'design' | 'productivity' | 'writing' | 'default';

export const THEME_CONFIG: Record<ToolCategory, {
  primary: string;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  border: string;
  shadow: string;
}> = {
  finance: {
    primary: "text-emerald-600",
    gradient: "from-emerald-600 to-teal-500",
    bgGradient: "from-emerald-50/50 via-white to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    border: "group-hover:border-emerald-500/50 dark:group-hover:border-emerald-400/50",
    shadow: "group-hover:shadow-emerald-500/20 dark:group-hover:shadow-emerald-500/10"
  },
  developer: {
    primary: "text-violet-600",
    gradient: "from-violet-600 to-fuchsia-500",
    bgGradient: "from-violet-50/50 via-white to-fuchsia-50/50 dark:from-gray-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    border: "group-hover:border-violet-500/50 dark:group-hover:border-violet-400/50",
    shadow: "group-hover:shadow-violet-500/20 dark:group-hover:shadow-violet-500/10"
  },
  health: {
    primary: "text-teal-600",
    gradient: "from-teal-500 to-cyan-500",
    bgGradient: "from-teal-50/50 via-white to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-teal-400 to-cyan-500",
    border: "group-hover:border-teal-500/50 dark:group-hover:border-teal-400/50",
    shadow: "group-hover:shadow-teal-500/20 dark:group-hover:shadow-teal-500/10"
  },
  documents: {
    primary: "text-indigo-600",
    gradient: "from-indigo-600 to-blue-500",
    bgGradient: "from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-500",
    border: "group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50",
    shadow: "group-hover:shadow-indigo-500/20 dark:group-hover:shadow-indigo-500/10"
  },
  converters: {
    primary: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50/50 via-white to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    border: "group-hover:border-amber-500/50 dark:group-hover:border-amber-400/50",
    shadow: "group-hover:shadow-amber-500/20 dark:group-hover:shadow-amber-500/10"
  },
  ai: {
    primary: "text-fuchsia-600",
    gradient: "from-fuchsia-600 to-pink-500",
    bgGradient: "from-fuchsia-50/50 via-white to-pink-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
    border: "group-hover:border-fuchsia-500/50 dark:group-hover:border-fuchsia-400/50",
    shadow: "group-hover:shadow-fuchsia-500/20 dark:group-hover:shadow-fuchsia-500/10"
  },
  design: {
    primary: "text-pink-600",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50/50 via-white to-rose-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    border: "group-hover:border-pink-500/50 dark:group-hover:border-pink-400/50",
    shadow: "group-hover:shadow-pink-500/20 dark:group-hover:shadow-pink-500/10"
  },
  productivity: {
    primary: "text-sky-600",
    gradient: "from-sky-500 to-blue-500",
    bgGradient: "from-sky-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-500",
    border: "group-hover:border-sky-500/50 dark:group-hover:border-sky-400/50",
    shadow: "group-hover:shadow-sky-500/20 dark:group-hover:shadow-sky-500/10"
  },
  writing: {
    primary: "text-gray-600",
    gradient: "from-gray-700 to-gray-900",
    bgGradient: "from-gray-50 via-white to-gray-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-gray-600 to-gray-800",
    border: "group-hover:border-gray-400/50 dark:group-hover:border-gray-500/50",
    shadow: "group-hover:shadow-gray-500/20 dark:group-hover:shadow-gray-500/10"
  },
  default: {
    primary: "text-slate-900",
    gradient: "from-slate-900 to-slate-700",
    bgGradient: "from-white to-slate-50 dark:from-slate-950 dark:to-slate-900",
    iconBg: "bg-slate-900",
    border: "group-hover:border-slate-300 dark:group-hover:border-slate-700",
    shadow: "group-hover:shadow-slate-500/20 dark:group-hover:shadow-slate-500/10"
  },
};

export function getTheme(category: string) {
  const normalizedCategory = category?.toLowerCase() as ToolCategory;
  return THEME_CONFIG[normalizedCategory] || THEME_CONFIG.default;
}
`;

// ==========================================
// 3. DATA FILE (60+ Tools Populated)
// ==========================================
const toolsData = `import React from "react";
import { 
  Wallet, Calculator, Lock, Layers, Image, Zap, Braces, Heart, Wind, Sparkles, Scale, RefreshCw, FileText, Palette, QrCode, Type, Contrast, TrendingUp, Droplets, PieChart, Crop, Landmark, Briefcase, Code2, Database, Wifi, FileCode, Split, Clock, Scissors, CheckCircle, ArrowRight, Ratio, Binary, Key, Link, Hash, Fingerprint, Shield, Network, Globe, Terminal, Server, Activity, Box, Minimize, Search, Command, ScanLine, FileSpreadsheet, FileType, Dumbbell, Mic, BrainCircuit, Ruler, Pipette, Timer, ListTodo, StickyNote, FileJson, FileDigit, Languages, Mail, Eye, MessageSquare
} from "lucide-react";

export const ALL_TOOLS = [
  // FINANCE
  { id: "smart-budget", name: "Smart Budget", desc: "Enterprise G/L & Expense Tracking.", category: "Finance", subcategory: "Personal Finance", href: "/tools/finance/smart-budget", icon: <Wallet size={20} />, status: "Ready", popular: true },
  { id: "smart-loan", name: "Smart Loan", desc: "Amortization & Interest Calc.", category: "Finance", subcategory: "Calculators", href: "/tools/finance/smart-loan", icon: <Calculator size={20} />, status: "Ready", popular: true },
  { id: "smart-debt", name: "Smart Debt", desc: "Snowball/Avalanche Payoff.", category: "Finance", subcategory: "Calculators", href: "/tools/finance/smart-debt", icon: <PieChart size={20} />, status: "Ready", popular: false },
  { id: "smart-net-worth", name: "Smart Net Worth", desc: "Total Asset Tracker.", category: "Finance", subcategory: "Personal Finance", href: "/tools/finance/smart-net-worth", icon: <Landmark size={20} />, status: "Ready", popular: false },
  { id: "smart-retirement", name: "Smart Retirement", desc: "FIRE Projection Engine.", category: "Finance", subcategory: "Planning", href: "/tools/finance/smart-retirement", icon: <Briefcase size={20} />, status: "Ready", popular: false },
  { id: "smart-sip", name: "Smart SIP", desc: "Mutual Fund Wealth Builder.", category: "Finance", subcategory: "Investments", href: "/tools/finance/smart-sip", icon: <TrendingUp size={20} />, status: "Ready", popular: true },

  // DOCUMENTS
  { id: "smart-pdf-merge", name: "PDF Merge", desc: "Combine multiple PDFs.", category: "Documents", subcategory: "PDF Tools", href: "/tools/documents/pdf/merge", icon: <Layers size={20} />, status: "Ready", popular: true },
  { id: "smart-pdf-split", name: "PDF Split", desc: "Extract pages instantly.", category: "Documents", subcategory: "PDF Tools", href: "/tools/documents/pdf/split", icon: <Scissors size={20} />, status: "Ready", popular: false },
  { id: "smart-scan", name: "Smart Scan", desc: "Images to PDF Converter.", category: "Documents", subcategory: "PDF Tools", href: "/tools/documents/smart-scan", icon: <ScanLine size={20} />, status: "New", popular: true },
  { id: "smart-word", name: "Smart Word", desc: "Distraction-free Writer.", category: "Documents", subcategory: "Editors", href: "/tools/documents/smart-word", icon: <FileText size={20} />, status: "New", popular: false },
  { id: "smart-excel", name: "Smart Excel", desc: "Web Spreadsheet Editor.", category: "Documents", subcategory: "Editors", href: "/tools/documents/smart-excel", icon: <FileSpreadsheet size={20} />, status: "New", popular: false },
  { id: "smart-ocr", name: "Smart OCR", desc: "Extract Text from Images.", category: "Documents", subcategory: "Converters", href: "/tools/documents/smart-ocr", icon: <FileType size={20} />, status: "New", popular: true },
  { id: "smart-json", name: "JSON Formatter", desc: "Validate & Beautify JSON.", category: "Documents", subcategory: "Converters", href: "/tools/documents/json/formatter", icon: <Braces size={20} />, status: "Ready", popular: false },
  { id: "smart-img-compress", name: "Image Compressor", desc: "Shrink image size locally.", category: "Documents", subcategory: "Images", href: "/tools/documents/image/compressor", icon: <Minimize size={20} />, status: "Ready", popular: true },
  { id: "smart-img-convert", name: "Image Converter", desc: "PNG/JPG/WEBP Switch.", category: "Documents", subcategory: "Images", href: "/tools/documents/image/converter", icon: <RefreshCw size={20} />, status: "Ready", popular: false },

  // HEALTH
  { id: "smart-bmi", name: "Smart BMI", desc: "Body Mass Index.", category: "Health", subcategory: "Body Metrics", href: "/tools/health/smart-bmi", icon: <Scale size={20} />, status: "New", popular: true },
  { id: "smart-breath", name: "Box Breathing", desc: "Stress Relief Guide.", category: "Health", subcategory: "Wellness", href: "/tools/health/smart-breath", icon: <Wind size={20} />, status: "New", popular: false },
  { id: "smart-workout", name: "HIIT Timer", desc: "Interval Training.", category: "Health", subcategory: "Fitness", href: "/tools/health/smart-workout", icon: <Dumbbell size={20} />, status: "New", popular: false },

  // DEVELOPER (Generic Tools using Universal Engine)
  { id: "smart-sql", name: "SQL Formatter", desc: "Beautify Queries.", category: "Developer", subcategory: "Database", href: "/tools/developer/smart-sql", icon: <Database size={20} />, status: "Ready", popular: true },
  { id: "smart-regex", name: "Regex Tester", desc: "Pattern Matching.", category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-regex", icon: <Code2 size={20} />, status: "Ready", popular: true },
  { id: "smart-base64", name: "Base64", desc: "Encode/Decode.", category: "Developer", subcategory: "Network", href: "/tools/developer/smart-base64", icon: <Binary size={20} />, status: "Ready", popular: false },
  { id: "smart-url", name: "URL Parser", desc: "Decode/Encode.", category: "Developer", subcategory: "Network", href: "/tools/developer/smart-url", icon: <Link size={20} />, status: "Ready", popular: true },
  { id: "smart-html-entities", name: "HTML Entities", desc: "Escape/Unescape.", category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-entities", icon: <Code2 size={20} />, status: "Ready", popular: false },
  { id: "smart-json-min", name: "JSON Minify", desc: "Compress JSON.", category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-min", icon: <Minimize size={20} />, status: "Ready", popular: false },
  { id: "smart-hash", name: "Hash Gen", desc: "MD5/SHA256.", category: "Developer", subcategory: "Security", href: "/tools/developer/smart-hash", icon: <Fingerprint size={20} />, status: "Ready", popular: false },
  { id: "smart-pass", name: "Password Gen", desc: "Secure Strings.", category: "Developer", subcategory: "Security", href: "/tools/developer/smart-pass", icon: <Lock size={20} />, status: "Ready", popular: true },
  { id: "smart-uuid", name: "UUID Gen", desc: "Unique IDs.", category: "Developer", subcategory: "SysAdmin", href: "/tools/developer/smart-uuid", icon: <Hash size={20} />, status: "Ready", popular: false },

  // DESIGN
  { id: "color-picker", name: "Color Picker", desc: "HEX/RGB/HSL.", category: "Design", subcategory: "Color", href: "/tools/design/picker", icon: <Pipette size={20} />, status: "Ready", popular: true },
  
  // CONVERTERS
  { id: "case-convert", name: "Case Converter", desc: "snake_case to CamelCase.", category: "Converters", subcategory: "Text", href: "/tools/converters/case", icon: <Type size={20} />, status: "Ready", popular: false },
  { id: "unit-convert", name: "Unit Converter", desc: "Metric/Imperial.", category: "Converters", subcategory: "Measurements", href: "/tools/converters/unit", icon: <RefreshCw size={20} />, status: "Ready", popular: false },

  // PRODUCTIVITY
  { id: "pomodoro", name: "Pomodoro", desc: "Focus Timer.", category: "Productivity", subcategory: "Time", href: "/tools/productivity/pomodoro", icon: <Timer size={20} />, status: "Ready", popular: true },
  { id: "todo", name: "Local Todo", desc: "Task list.", category: "Productivity", subcategory: "Tools", href: "/tools/productivity/todo", icon: <ListTodo size={20} />, status: "Ready", popular: false },
  { id: "notes", name: "Quick Notes", desc: "Scratchpad.", category: "Productivity", subcategory: "Tools", href: "/tools/productivity/notes", icon: <StickyNote size={20} />, status: "Ready", popular: false },
  { id: "qr-code", name: "QR Generator", desc: "Text to QR Code.", category: "Productivity", subcategory: "Tools", href: "/tools/productivity/qr-code", icon: <QrCode size={20} />, status: "Ready", popular: true },

  // AI
  { id: "smart-chat", name: "Smart Chat", desc: "Local Bot UI.", category: "AI", subcategory: "Generative", href: "/tools/ai/smart-chat", icon: <Sparkles size={20} />, status: "New", popular: true },
  { id: "smart-analyze", name: "Sentiment AI", desc: "Analyze Emotion.", category: "AI", subcategory: "Analysis", href: "/tools/ai/smart-analyze", icon: <BrainCircuit size={20} />, status: "Ready", popular: false },
  { id: "smart-voice", name: "Text to Speech", desc: "Browser Voice.", category: "AI", subcategory: "Audio", href: "/tools/ai/smart-voice", icon: <Mic size={20} />, status: "Ready", popular: false },
  { id: "smart-vision", name: "AI Vision", desc: "Object Detection.", category: "AI", subcategory: "Vision", href: "/tools/ai/vision", icon: <Eye size={20} />, status: "New", popular: false },
];
`;

// ==========================================
// 4. UNIVERSAL TOOL ENGINE (Logic + Dictation + SPA Nav)
// ==========================================
const universalTool = `"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Wand2 } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import ToolShell from "@/app/components/layout/ToolShell";
import RelatedTools from "@/app/components/tools/RelatedTools";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import DictationButton from "@/app/components/ui/DictationButton";

export default function ToolClient({ params }) {
  const { tool } = params;
  const toolData = ALL_TOOLS.find((t) => t.id === tool);
  
  const [input, setInput] = useLocalStorage(\`onetool_\${tool}_input\`, "");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ chars: 0, words: 0, lines: 0 });

  const processInput = () => {
    try {
      let res = "";
      const val = input;
      switch (tool) {
        case 'smart-base64': res = btoa(val); break;
        case 'smart-url': res = \`Encoded: \${encodeURIComponent(val)}\\n\\nDecoded: \${decodeURIComponent(val)}\`; break;
        case 'smart-html-entities': res = val.replace(/[\\u00A0-\\u9999<>&]/g, (i) => '&#'+i.charCodeAt(0)+';'); break;
        case 'smart-json-min': res = JSON.stringify(JSON.parse(val)); break;
        case 'case-convert': res = val.toLowerCase().replace(/(?:^|\\s)\\w/g, (match) => match.toUpperCase()); break;
        case 'smart-hash':
             let h = 0x811c9dc5;
             for (let i = 0; i < val.length; i++) { h ^= val.charCodeAt(i); h = Math.imul(h, 0x01000193); }
             res = (h >>> 0).toString(16);
             break;
        default: res = \`Analysis:\\n- Characters: \${val.length}\\n- Words: \${val.trim().split(/\\s+/).length}\\n- Lines: \${val.split(/\\r\\n|\\r|\\n/).length}\\n\\nUppercase: \${val.toUpperCase()}\`; break;
      }
      setOutput(res);
    } catch (e) {
      setOutput("Error: Invalid input for this tool.");
    }
  };

  useEffect(() => {
    if(!input) return;
    setStats({
      chars: input.length,
      words: input.trim() ? input.trim().split(/\\s+/).length : 0,
      lines: input.split(/\\r\\n|\\r|\\n/).length
    });
  }, [input]);

  if (!toolData) return null;

  return (
    <ToolShell title={toolData.name} description={toolData.desc} category={toolData.category} icon={toolData.icon} toolId={toolData.id}>
      <div className="grid gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-0 flex flex-col h-[500px] overflow-hidden border-2 border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 transition-colors relative">
              <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Input</span>
                 <div className="flex items-center gap-2">
                    <DictationButton onResult={(val) => setInput(prev => prev + " " + val)} />
                    <Button variant="ghost" size="xs" onClick={() => setInput("")}>Clear</Button>
                 </div>
              </div>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 w-full bg-white dark:bg-slate-950 p-6 text-sm font-mono outline-none resize-none"
                placeholder="Paste content..."
                spellCheck={false}
              />
              <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                 <Button size="sm" onClick={processInput} icon={<Wand2 size={16}/>}>Process</Button>
              </div>
           </Card>

           <Card className="p-0 flex flex-col h-[500px] overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 border-dashed">
              <div className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 p-3 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Result</span>
                 <Button variant="secondary" size="xs" onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} icon={copied ? <Check size={12}/> : <Copy size={12}/>}>{copied ? "Copied" : "Copy"}</Button>
              </div>
              <div className="flex-1 w-full p-6 text-sm font-mono overflow-auto text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                 {output || <span className="text-slate-400 italic opacity-50">Result will appear here...</span>}
              </div>
           </Card>
        </div>
        <RelatedTools currentToolId={toolData.id} category={toolData.category} />
      </div>
    </ToolShell>
  );
}
`;

// ==========================================
// 5. TOOL TILE (Smart Glow + SPA Navigation)
// ==========================================
const toolTile = `"use client";

import Link from "next/link";
import { getTheme } from "@/app/lib/theme-config";
import { ArrowUpRight, Star } from "lucide-react";
import React, { isValidElement, useState, useEffect } from "react";

export default function ToolTile({ tool }) {
  const theme = getTheme(tool.category);
  const href = tool.href || \`/tools/\${tool.category}/\${tool.id}\`;
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
      setIsFav(favs.includes(tool.id));
    } catch (e) {}
  }, [tool.id]);

  const toggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    let newFavs = favs.includes(tool.id) ? favs.filter(id => id !== tool.id) : [...favs, tool.id];
    localStorage.setItem("onetool-favorites", JSON.stringify(newFavs));
    setIsFav(!isFav);
    window.dispatchEvent(new Event("storage")); 
  };

  const renderIcon = () => {
    const Icon = tool.icon;
    if (isValidElement(Icon)) return Icon;
    return null;
  };

  return (
    <Link href={href} className="group relative block h-full">
      <article className={\`relative h-full p-5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 ease-out flex flex-col hover:-translate-y-1 hover:shadow-xl \${theme.shadow}\`}>
        <div className="flex items-start justify-between mb-5">
          <div className={\`w-14 h-14 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-2xl text-white shadow-md transform group-hover:scale-110 transition-transform duration-300 \${theme.iconBg}\`}>
            {renderIcon()}
          </div>
          <div className="flex items-center gap-2">
             {tool.status === "New" && <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">New</span>}
             <button onClick={toggleFav} className={\`p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 \${isFav ? 'text-amber-400' : 'text-slate-300 hover:text-slate-500'}\`}>
               <Star size={18} fill={isFav ? "currentColor" : "none"} />
             </button>
          </div>
        </div>
        <div className="space-y-2 flex-grow">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{tool.name}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{tool.desc}</p>
        </div>
        <div className={\`absolute bottom-0 left-8 right-8 h-1 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r \${theme.gradient}\`} />
      </article>
    </Link>
  );
}
`;

// ==========================================
// 6. TOOL SHELL (Full Width + Breadcrumbs)
// ==========================================
const toolShell = `"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, LayoutGrid, Star } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function ToolShell({ title, description, category, toolId, icon, children, actions }) {
  const [isFav, setIsFav] = useState(false);
  
  useEffect(() => {
    if (!toolId) return;
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    setIsFav(favs.includes(toolId));
  }, [toolId]);

  const toggleFav = () => {
    if (!toolId) return;
    const favs = JSON.parse(localStorage.getItem("onetool-favorites") || "[]");
    let newFavs = favs.includes(toolId) ? favs.filter(id => id !== toolId) : [...favs, toolId];
    localStorage.setItem("onetool-favorites", JSON.stringify(newFavs));
    setIsFav(!isFav);
    window.dispatchEvent(new Event("storage")); 
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120]">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="flex flex-col">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1"><Home size={10} /> Home</Link>
                  <span>/</span>
                  <Link href="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1"><LayoutGrid size={10} /> Dashboard</Link>
               </div>
               <div className="flex items-center gap-2 mt-0.5">
                  {icon && <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">{icon}</div>}
                  <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate max-w-[300px] sm:max-w-none">{title}</h1>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            <button onClick={toggleFav} className={\`p-2 rounded-lg transition-colors \${isFav ? 'text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
              <Star size={18} fill={isFav ? "currentColor" : "none"} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">{children}</div>
      </main>
    </div>
  );
}
`;

// EXECUTE
writeFile('app/globals.css', globalsCss);
writeFile('app/lib/theme-config.ts', themeConfig);
writeFile('app/lib/tools-data.tsx', toolsData);
writeFile('app/tools/[category]/[tool]/ToolClient.tsx', universalTool);
writeFile('app/shared/ToolTile.tsx', toolTile);
writeFile('app/components/layout/ToolShell.tsx', toolShell);

console.log("💎 GOLDEN MASTER DEPLOYED.");
console.log("👉 Clear your cache and restart: 'rm -rf .next && npm run dev'");