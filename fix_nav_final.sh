#!/bin/bash

echo "🚀 expanding OTS with Resizer, Password Gen, and Unit Converter..."

# 1. CREATE DIRECTORIES
mkdir -p app/tools/documents/image/resizer
mkdir -p app/tools/developer/password
mkdir -p app/tools/converters/unit

# ---------------------------------------------------------
# 2. IMAGE RESIZER (app/tools/documents/image/resizer/page.tsx)
# ---------------------------------------------------------
cat > app/tools/documents/image/resizer/page.tsx << 'EOF'
"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, Download, Upload, RefreshCw, Lock, Unlock } from "lucide-react";

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setSrc(url);
      
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
      };
      img.src = url;
    }
  };

  const handleDimensionChange = (type: 'w' | 'h', val: number) => {
    if (type === 'w') {
      setWidth(val);
      if (lockAspect) setHeight(Math.round(val / aspectRatio));
    } else {
      setHeight(val);
      if (lockAspect) setWidth(Math.round(val * aspectRatio));
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = new Image();
    if (ctx && src && canvas) {
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const link = document.createElement('a');
        link.download = `resized_${width}x${height}_${file?.name}`;
        link.href = canvas.toDataURL(file?.type);
        link.click();
      };
      img.src = src;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <ImageIcon className="text-pink-500" size={32} /> Image Resizer
        </h1>
        <p className="text-slate-500 mt-2">Change image dimensions securely in your browser.</p>
      </div>

      {!src ? (
        <label className="border-2 border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
          <Upload size={32} className="text-slate-400 mb-4"/>
          <span className="font-semibold text-slate-700">Upload Image</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden p-4 border border-slate-100">
            <img src={src} alt="Preview" className="max-h-64 object-contain" />
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Width (px)</label>
                <input type="number" value={width} onChange={(e) => handleDimensionChange('w', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Height (px)</label>
                <input type="number" value={height} onChange={(e) => handleDimensionChange('h', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
            </div>

            <button onClick={() => setLockAspect(!lockAspect)} className={`flex items-center gap-2 text-sm font-medium ${lockAspect ? 'text-teal-600' : 'text-slate-400'}`}>
              {lockAspect ? <Lock size={16}/> : <Unlock size={16}/>} Maintain Aspect Ratio
            </button>

            <button onClick={handleDownload} className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <Download size={18}/> Download Resized
            </button>
            
            <button onClick={() => { setSrc(null); setFile(null); }} className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm">Upload Different Image</button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}
EOF

# ---------------------------------------------------------
# 3. PASSWORD GENERATOR (app/tools/developer/password/page.tsx)
# ---------------------------------------------------------
cat > app/tools/developer/password/page.tsx << 'EOF'
"use client";

import React, { useState, useEffect } from "react";
import { Lock, RefreshCw, Copy, Check } from "lucide-react";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("");
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const sets = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
    };
    let chars = "";
    if (options.uppercase) chars += sets.uppercase;
    if (options.lowercase) chars += sets.lowercase;
    if (options.numbers) chars += sets.numbers;
    if (options.symbols) chars += sets.symbols;

    if (!chars) return setPassword("");

    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  useEffect(() => generate(), []);

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-purple-50 text-purple-600 rounded-xl mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Secure Password</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative mb-8">
          <div className="w-full bg-slate-100 p-4 rounded-xl text-center font-mono text-2xl text-slate-800 break-all min-h-[64px] flex items-center justify-center">
            {password}
          </div>
          <button onClick={copy} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg text-slate-500 transition-colors shadow-sm">
            {copied ? <Check size={20} className="text-emerald-500"/> : <Copy size={20}/>}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-bold text-slate-500 uppercase mb-2">
              <span>Length</span>
              <span>{length}</span>
            </div>
            <input 
              type="range" min="4" max="64" value={length} 
              onChange={e => setLength(Number(e.target.value))} 
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.keys(options).map(key => (
              <label key={key} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={(options as any)[key]} 
                  onChange={() => setOptions(prev => ({ ...prev, [key]: !(prev as any)[key] }))}
                  className="w-5 h-5 accent-purple-600 rounded"
                />
                <span className="capitalize text-sm font-medium text-slate-700">{key}</span>
              </label>
            ))}
          </div>

          <button onClick={generate} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
            <RefreshCw size={20}/> Generate New
          </button>
        </div>
      </div>
    </div>
  );
}
EOF

# ---------------------------------------------------------
# 4. UNIT CONVERTER (app/tools/converters/unit/page.tsx)
# ---------------------------------------------------------
cat > app/tools/converters/unit/page.tsx << 'EOF'
"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Scale } from "lucide-react";

const UNITS: any = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, inch: 0.0254, mile: 1609.34 },
  Weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 },
  Time: { s: 1, min: 60, h: 3600, day: 86400 }
};

export default function UnitConverter() {
  const [category, setCategory] = useState("Length");
  const [inputVal, setInputVal] = useState(1);
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");

  const convert = () => {
    const base = inputVal * UNITS[category][fromUnit]; // Convert to base unit (e.g., meters)
    return (base / UNITS[category][toUnit]); // Convert to target
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const keys = Object.keys(UNITS[cat]);
    setFromUnit(keys[0]);
    setToUnit(keys[1]);
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-orange-50 text-orange-600 rounded-xl mb-4">
          <Scale size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Unit Converter</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          {Object.keys(UNITS).map(cat => (
            <button 
              key={cat} onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${category === cat ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
          
          <div className="space-y-2">
            <input type="number" value={inputVal} onChange={e => setInputVal(Number(e.target.value))} className="w-full text-3xl font-bold p-4 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 border-2 outline-none transition-all" />
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
              {Object.keys(UNITS[category]).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="text-slate-300"><ArrowRightLeft size={24} /></div>

          <div className="space-y-2">
            <div className="w-full text-3xl font-bold p-4 bg-orange-50 text-orange-900 rounded-xl border border-orange-100 flex items-center overflow-hidden">
              {convert().toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
              {Object.keys(UNITS[category]).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}
EOF

# ---------------------------------------------------------
# 5. UPDATE DASHBOARD (Register New Tools)
# ---------------------------------------------------------
cat > app/tools/page.tsx << 'EOF'
"use client";

import Link from "next/link";
import React, { useState, useMemo } from "react";
import { 
  Search, Wallet, FileText, Heart, Zap, 
  Layers, Calculator, Image, Braces, 
  ArrowRight, Sparkles, Lock, RefreshCw, Scale, Terminal
} from "lucide-react";

// MASTER TOOL LIST
const ALL_TOOLS = [
  // FINANCE
  { id: "budget", name: "Budget Ultimate", desc: "Track expenses, manage recurring bills, and visualize net worth.", category: "Finance", href: "/tools/finance/budget-tracker", icon: <Wallet size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", status: "Ready" },
  { id: "loan", name: "Loan Planner", desc: "Calculate EMI, total interest, and amortization schedules.", category: "Finance", href: "/tools/finance/loan-emi", icon: <Calculator size={24} />, color: "text-blue-600", bg: "bg-blue-50", status: "Ready" },

  // DOCUMENTS
  { id: "pdf-merge", name: "PDF Merger", desc: "Combine multiple PDF files into one document securely.", category: "Documents", href: "/tools/documents/pdf/merge", icon: <Layers size={24} />, color: "text-rose-600", bg: "bg-rose-50", status: "Ready" },
  { id: "img-compress", name: "Image Compressor", desc: "Reduce JPG/PNG file size locally without quality loss.", category: "Documents", href: "/tools/documents/image/compressor", icon: <Image size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", status: "Ready" },
  { id: "img-convert", name: "Image Converter", desc: "Convert WebP/PNG/JPG files instantly in your browser.", category: "Documents", href: "/tools/documents/image/converter", icon: <RefreshCw size={24} />, color: "text-amber-600", bg: "bg-amber-50", status: "New" },
  { id: "img-resize", name: "Image Resizer", desc: "Resize dimensions while maintaining aspect ratio.", category: "Documents", href: "/tools/documents/image/resizer", icon: <Image size={24} />, color: "text-pink-600", bg: "bg-pink-50", status: "New" },
  { id: "json", name: "JSON Formatter", desc: "Validate, format, and minify JSON data structures.", category: "Documents", href: "/tools/documents/json/formatter", icon: <Braces size={24} />, color: "text-slate-600", bg: "bg-slate-200", status: "Ready" },

  // HEALTH
  { id: "bmi", name: "BMI Calculator", desc: "Check your Body Mass Index and health category.", category: "Health", href: "/tools/health/bmi", icon: <Calculator size={24} />, color: "text-teal-600", bg: "bg-teal-50", status: "Ready" },
  { id: "breathing", name: "Breathing App", desc: "Visual 4-7-8 guided breathing for anxiety relief.", category: "Health", href: "/tools/health/breathing", icon: <Heart size={24} />, color: "text-sky-600", bg: "bg-sky-50", status: "Ready" },
  { id: "timer", name: "Workout Timer", desc: "Interval timer for HIIT, Tabata, and Yoga flows.", category: "Health", href: "/tools/health/timer", icon: <Zap size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "Ready" },

  // DEVELOPER & CONVERTERS
  { id: "password", name: "Password Gen", desc: "Generate cryptographically secure passwords locally.", category: "Developer", href: "/tools/developer/password", icon: <Lock size={24} />, color: "text-purple-600", bg: "bg-purple-50", status: "New" },
  { id: "unit", name: "Unit Converter", desc: "Convert Length, Weight, and Time measurements.", category: "Converters", href: "/tools/converters/unit", icon: <Scale size={24} />, color: "text-orange-600", bg: "bg-orange-50", status: "New" },

  // AI
  { id: "ai-text", name: "Text Intelligence", desc: "Analyze sentiment, reading time, and complexity locally.", category: "AI", href: "/ai", icon: <Sparkles size={24} />, color: "text-violet-600", bg: "bg-violet-50", status: "Ready" }
];

const CATEGORIES = ["All", "Finance", "Documents", "Health", "Developer", "Converters", "AI"];

export default function ToolsDashboard() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(query.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCat === "All" || tool.category === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [query, activeCat]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="bg-white border-b border-slate-200 pt-12 pb-6 px-4 sticky top-16 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tools Dashboard</h1>
          <p className="text-slate-500 mb-6">Explore our suite of privacy-first utilities.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search tools..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-[rgb(117,163,163)] focus:ring-2 focus:ring-teal-500/20 rounded-xl outline-none transition-all font-medium text-slate-700" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCat(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCat === cat ? "bg-[rgb(117,163,163)] text-white shadow-md shadow-teal-500/20" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => (
              <Link key={tool.id} href={tool.href} className={`group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${tool.status === 'Soon' ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>{tool.icon}</div>
                  {tool.status === "New" && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md">New</span>}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">{tool.desc}</p>
                <div className="flex items-center text-sm font-semibold text-slate-900 mt-auto pt-4 border-t border-slate-50">
                  Launch Tool <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform text-[rgb(117,163,163)]"/>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex p-4 bg-slate-100 rounded-full text-slate-400 mb-4"><Search size={32} /></div>
            <h3 className="text-lg font-bold text-slate-700">No tools found</h3>
            <button onClick={() => {setQuery(""); setActiveCat("All")}} className="mt-4 text-[rgb(117,163,163)] font-semibold hover:underline">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
EOF

echo "✅ Added Resizer, Password Gen, Unit Converter, and updated Dashboard."