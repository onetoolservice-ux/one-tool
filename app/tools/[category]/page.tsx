"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { ALL_TOOLS } from "@/app/lib/tools-data";

const capitalize = (s: string) => {
  if (!s) return "";
  const decoded = decodeURIComponent(s);
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
};

type Params = Promise<{ category: string }>;

export default function CategoryPage({ params }: { params: Params }) {
  const resolvedParams = use(params);
  const category = resolvedParams?.category;

  const categoryTools = useMemo(() => {
    if (!category) return [];
    return ALL_TOOLS.filter(t => t.category.toLowerCase() === decodeURIComponent(category).toLowerCase());
  }, [category]);

  if (!category) return null;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 min-h-screen">
      <div className="mb-12 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-3 mb-3 text-sm font-medium text-slate-500">
          <Link href="/tools" className="hover:text-slate-900 transition-colors">Tools</Link>
          <span className="text-slate-300">/</span>
          <span className="capitalize text-[rgb(117,163,163)]">{capitalize(category)}</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          {capitalize(category)} Tools
          <span className="bg-slate-100 text-slate-500 text-sm px-3 py-1 rounded-full font-medium align-middle">
            {categoryTools.length}
          </span>
        </h1>
        <p className="text-lg text-slate-500 mt-3 max-w-2xl">
          Collection of {decodeURIComponent(category).toLowerCase()} utilities.
        </p>
      </div>

      {categoryTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTools.map((tool) => (
            <Link 
              key={tool.id} 
              href={tool.status === 'Soon' ? '#' : tool.href}
              className={`group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 flex flex-col h-full ${tool.status === 'Soon' ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {tool.icon}
                </div>
                {tool.status === "New" && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-indigo-100">New</span>}
                {tool.status === "Soon" && <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md">Soon</span>}
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">{tool.desc}</p>

              <div className="flex items-center text-sm font-semibold text-slate-900 mt-auto pt-4 border-t border-slate-50">
                {tool.status === 'Soon' ? 'Coming Soon' : 'Open Tool'}
                {tool.status !== 'Soon' && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform text-[rgb(117,163,163)]"/>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p>No tools in this category yet.</p>
          <Link href="/tools" className="text-[rgb(117,163,163)] font-bold hover:underline mt-2 inline-block">Back to Dashboard</Link>
        </div>
      )}
    </div>
  );
}
