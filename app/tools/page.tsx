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
