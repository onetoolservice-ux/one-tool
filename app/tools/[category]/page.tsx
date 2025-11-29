"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";

// 1. Helper to safely capitalize
const capitalize = (s: string) => {
  if (!s) return "";
  try {
    const decoded = decodeURIComponent(s);
    return decoded.charAt(0).toUpperCase() + decoded.slice(1);
  } catch (e) {
    return s;
  }
};

type Params = Promise<{ category: string }>;

export default function CategoryPage({ params }: { params: Params }) {
  const resolvedParams = use(params);
  const category = resolvedParams?.category;

  const categoryTools = useMemo(() => {
    if (!category) return [];
    return ALL_TOOLS.filter(t => t.category.toLowerCase() === decodeURIComponent(category).toLowerCase());
  }, [category]);

  // Safety check for build time
  if (!category) return null;

  if (categoryTools.length === 0 && category !== "all") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-6 bg-background dark:bg-[#0f172a] dark:bg-[#020617] rounded-full mb-6">
          <LayoutGrid className="text-slate-300" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-main dark:text-slate-100 dark:text-slate-200">Category Not Found</h2>
        <Link href="/tools" className="mt-8 px-6 py-3 bg-surface text-white rounded-xl font-medium">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 min-h-screen">
      <div className="mb-12 border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-3 mb-3 text-sm font-medium text-muted dark:text-muted dark:text-muted dark:text-muted">
          <Link href="/tools" className="hover:text-main dark:text-slate-100 dark:text-slate-200">Tools</Link>
          <span className="text-slate-300">/</span>
          <span className="capitalize text-[rgb(117,163,163)]">{capitalize(category)}</span>
        </div>
        <h1 className="text-4xl font-bold text-main dark:text-slate-100 dark:text-slate-200 tracking-tight flex items-center gap-3">
          {capitalize(category)} Tools
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryTools.map((tool) => (
          <Link 
            key={tool.id} 
            href={tool.href}
            className={`group relative bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all duration-300 flex flex-col h-full ${tool.status === 'Soon' ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl dark:shadow-none dark:border dark:border-slate-600 hover:-translate-y-1'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center shadow-lg shadow-slate-200/50 dark:shadow-none group-hover:scale-110 transition-transform duration-300`}>
                {tool.icon}
              </div>
              {tool.status === "New" && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide tracking-wider rounded-md border border-indigo-100">New</span>}
            </div>
            <h3 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-2 group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h3>
            <p className="text-sm text-muted dark:text-muted dark:text-muted dark:text-muted leading-relaxed mb-6 flex-grow">{tool.desc}</p>
            <div className="flex items-center text-sm font-semibold text-main dark:text-slate-100 dark:text-slate-200 mt-auto pt-4 border-t border-slate-50">
              {tool.status === 'Soon' ? 'Coming Soon' : 'Open Tool'}
              {tool.status !== 'Soon' && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform text-[rgb(117,163,163)]"/>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
