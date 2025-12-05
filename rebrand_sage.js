const fs = require('fs');
const path = require('path');

console.log("💎 EXECUTING FINAL POLISH (LCP Fix + Router Lockdown)...");

function writeFile(filePath, content) {
    const targetPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`✅ Optimized: ${filePath}`);
}

// ==========================================
// 1. FIX LCP (The Clock) - Instant Render
// ==========================================
// We remove the 'useEffect' delay for the initial render time.
const clockCode = `"use client";
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const LiveClock = () => {
  // Initialize with current time to prevent layout shift (LCP Fix)
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Safe hydration check
  if (!mounted) return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">--:--:--</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-teal-500/50">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
        {time.toLocaleTimeString('en-GB', { hour12: false })}
      </span>
    </div>
  );
};`;

// ==========================================
// 2. FIX CASE CONVERTER (Text Transformer UI)
// ==========================================
// This was showing "0" (Math Engine) because of a router mismatch.
const textCode = `"use client";
import React, { useState } from 'react';
import { Type, Copy, RefreshCw, AlignLeft, AlignCenter } from 'lucide-react';

export const TextTransformer = ({ toolId, title }: { toolId: string, title: string }) => {
  const [input, setInput] = useState("");
  
  const transform = (type: string) => {
    switch(type) {
      case 'upper': return input.toUpperCase();
      case 'lower': return input.toLowerCase();
      case 'title': return input.replace(/\\w\\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      case 'camel': return input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
      case 'snake': return input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || input;
      case 'kebab': return input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || input;
      default: return input;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
          <Type className="text-teal-600"/> {title}
       </h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[60vh]">
          <div className="flex flex-col">
             <label className="text-xs font-bold text-slate-400 uppercase mb-2">Input Text</label>
             <textarea 
               value={input} 
               onChange={e => setInput(e.target.value)}
               className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none focus:ring-2 ring-teal-500/20 outline-none custom-scrollbar"
               placeholder="Type or paste your text here..."
             />
          </div>
          
          <div className="flex flex-col gap-4">
             <label className="text-xs font-bold text-slate-400 uppercase">Quick Actions</label>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setInput(transform('upper'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">UPPERCASE</button>
                <button onClick={() => setInput(transform('lower'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">lowercase</button>
                <button onClick={() => setInput(transform('title'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">Title Case</button>
                <button onClick={() => setInput(transform('camel'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">camelCase</button>
                <button onClick={() => setInput(transform('snake'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">snake_case</button>
                <button onClick={() => setInput(transform('kebab'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">kebab-case</button>
             </div>
             
             <div className="mt-auto p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-slate-400">{input.length} Characters</span>
                <button onClick={() => navigator.clipboard.writeText(input)} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><Copy size={16}/></button>
             </div>
          </div>
       </div>
    </div>
  );
};`;

// ==========================================
// 3. FIX LAYOUT SHIFT (CLS) - Global CSS
// ==========================================
const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 15, 23, 42;
  --background-start-rgb: 248, 250, 252;
  --background-end-rgb: 241, 245, 249;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 2, 6, 23;
    --background-end-rgb: 2, 6, 23;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: transparent;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden; /* Prevent horizontal scroll shift */
}

/* CLS FIX: Reserve space for grid items before they load */
.grid-min-h {
  min-height: 100vh;
}

/* ANIMATION OPTIMIZATION */
.animate-in {
  animation-duration: 0.3s;
  animation-fill-mode: both;
  will-change: opacity, transform; /* Hardware acceleration */
}

input, select, textarea {
  font-size: 16px !important; /* Prevents iOS zoom */
}

/* CUSTOM SCROLLBAR */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
`;

// ==========================================
// 4. ROUTER LOCKDOWN (Explicit Links Only)
// ==========================================
const routerCode = `"use client";
import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { ToolShell } from '@/app/components/tools/tool-shell';

// IMPORTS
import { UniversalConverter } from '@/app/components/tools/documents/universal-converter';
import { BudgetPlanner } from '@/app/components/tools/finance/budget-planner';
import { InvestmentCalculator } from '@/app/components/tools/finance/investment-calculator';
import { UnitConverter } from '@/app/components/tools/converters/unit-converter';
import { SmartScan } from '@/app/components/tools/documents/smart-scan';
import { TextTransformer } from '@/app/components/tools/engines/text-transformer';
import { SmartEditor } from '@/app/components/tools/developer/smart-editor';
import { StringStudio } from '@/app/components/tools/developer/string-studio';
import { HealthStation } from '@/app/components/tools/health/health-station';
import { AiStudio } from '@/app/components/tools/ai/ai-studio';
import { ColorStudio } from '@/app/components/tools/design/color-studio';
import { DiffStudio } from '@/app/components/tools/developer/diff-studio';

import { RentReceiptGenerator } from '@/app/components/tools/business/rent-receipt';
import { SalarySlipGenerator } from '@/app/components/tools/business/salary-slip';
import { InvoiceGenerator } from '@/app/components/tools/business/invoice-generator';
import { IdCardMaker } from '@/app/components/tools/business/id-card-maker';
import { AgreementBuilder } from '@/app/components/tools/business/agreement-builder';

import { PdfWorkbench } from '@/app/components/tools/documents/pdf-workbench';
import { ImageCompressor } from '@/app/components/tools/documents/image-compressor';
import { SmartOCR } from '@/app/components/tools/documents/smart-ocr';
import { ImageConverter } from '@/app/components/tools/documents/image-converter';
import { PdfSplitter } from '@/app/components/tools/documents/pdf-splitter';
import { SmartExcel } from '@/app/components/tools/documents/smart-excel';
import { SmartWord } from '@/app/components/tools/documents/smart-word';

import { LifeOS } from '@/app/components/tools/productivity/life-os';
import { QrGenerator } from '@/app/components/tools/productivity/qr-generator';
import { PasswordGenerator } from '@/app/components/tools/productivity/password-generator';
import { Pomodoro } from '@/app/components/tools/productivity/pomodoro';
import { ApiPlayground } from '@/app/components/tools/developer/api-playground';
import { JwtDebugger } from '@/app/components/tools/developer/jwt-debugger';
import { CronGenerator } from '@/app/components/tools/developer/cron-gen';
import { GitCheats } from '@/app/components/tools/developer/git-cheats';

import { TextEngine } from '@/app/components/tools/engines/text-engine';

export default function ToolPage(props: { params: Promise<{ category: string; id: string }> }) {
  const params = use(props.params);
  const tool = ALL_TOOLS.find((t) => t.id === params.id);
  if (!tool) return notFound();

  let ToolComponent;

  // --- EXPLICIT ROUTING (No guessing) ---
  if (tool.id === 'case-convert') ToolComponent = <TextTransformer toolId={tool.id} title={tool.name} />;
  else if (tool.id === 'smart-budget') ToolComponent = <BudgetPlanner />;
  else if (tool.id === 'universal-converter' || tool.id === 'json-csv') ToolComponent = <UniversalConverter title={tool.name} subtitle={tool.desc} />;
  else if (tool.id === 'rent-receipt') ToolComponent = <RentReceiptGenerator />;
  else if (tool.id === 'salary-slip') ToolComponent = <SalarySlipGenerator />;
  else if (tool.id === 'invoice-generator') ToolComponent = <InvoiceGenerator />;
  else if (tool.id === 'id-card') ToolComponent = <IdCardMaker />;
  else if (tool.id === 'smart-agreement') ToolComponent = <AgreementBuilder />;
  
  else if (tool.id === 'smart-loan') ToolComponent = <InvestmentCalculator mode="loan" />;
  else if (tool.id === 'smart-sip') ToolComponent = <InvestmentCalculator mode="sip" />;
  else if (tool.id === 'smart-net-worth') ToolComponent = <InvestmentCalculator mode="net-worth" />;
  else if (tool.id === 'smart-retirement') ToolComponent = <InvestmentCalculator mode="retirement" />;
  
  else if (tool.id === 'unit-convert') ToolComponent = <UnitConverter />;
  else if (tool.id === 'smart-scan') ToolComponent = <SmartScan />;
  else if (tool.id === 'smart-pdf-merge') ToolComponent = <PdfWorkbench />;
  else if (tool.id === 'smart-img-compress') ToolComponent = <ImageCompressor />;
  else if (tool.id === 'smart-ocr') ToolComponent = <SmartOCR />;
  else if (tool.id === 'smart-img-convert') ToolComponent = <ImageConverter />;
  else if (tool.id === 'smart-pdf-split') ToolComponent = <PdfSplitter />;
  
  else if (['smart-url', 'smart-base64', 'smart-uuid', 'smart-html-entities'].includes(tool.id)) ToolComponent = <StringStudio toolId={tool.id} />;
  else if (tool.id.includes('json') || tool.id.includes('sql')) ToolComponent = <SmartEditor toolId={tool.id} />;
  
  else if (tool.id === 'life-os') ToolComponent = <LifeOS />;
  else if (tool.id === 'qr-code') ToolComponent = <QrGenerator />;
  else if (tool.id === 'smart-pass') ToolComponent = <PasswordGenerator />;
  else if (tool.id === 'pomodoro') ToolComponent = <Pomodoro />;
  
  else if (tool.id.includes('bmi') || tool.id.includes('breath') || tool.id.includes('workout')) ToolComponent = <HealthStation toolId={tool.id} />;
  else if (tool.id.includes('chat') || tool.id.includes('analyze')) ToolComponent = <AiStudio toolId={tool.id} />;
  
  else if (tool.id === 'color-picker') ToolComponent = <ColorStudio />;
  else if (tool.id === 'smart-diff') ToolComponent = <DiffStudio />;
  else if (tool.id === 'api-playground') ToolComponent = <ApiPlayground />;
  else if (tool.id === 'smart-jwt') ToolComponent = <JwtDebugger />;
  else if (tool.id === 'cron-gen') ToolComponent = <CronGenerator />;
  else if (tool.id === 'git-cheats') ToolComponent = <GitCheats />;
  
  // FALLBACK
  else ToolComponent = <TextEngine toolId={tool.id} title={tool.name} description={tool.desc} />;

  return <ToolShell tool={tool}>{ToolComponent}</ToolShell>;
}`;

writeFile('app/components/layout/live-clock.tsx', clockCode);
writeFile('app/components/tools/engines/text-transformer.tsx', textCode);
writeFile('app/globals.css', globalsCss);
writeFile('app/tools/[category]/[id]/page.tsx', routerCode);

console.log("✅ FINAL POLISH COMPLETE.");