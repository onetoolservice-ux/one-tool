"use client";
import Link from "next/link";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { FileText, Image as ImageIcon, Layers, Database } from "lucide-react";

export default function DocumentsDashboard() {
  const getTools = (ids: string[]) => ALL_TOOLS.filter(t => ids.includes(t.id));

  const SECTIONS = [
    { title: "PDF Zone", icon: <Layers size={20}/>, color: "text-rose-600 dark:text-rose-400", tools: ["smart-pdf-merge", "smart-pdf-split", "smart-scan"] },
    { title: "Image Studio", icon: <ImageIcon size={20}/>, color: "text-indigo-600 dark:text-indigo-400", tools: ["smart-compress", "smart-convert", "smart-resize"] },
    { title: "Office Lab", icon: <FileText size={20}/>, color: "text-blue-600 dark:text-blue-400", tools: ["smart-word", "smart-excel"] },
    { title: "Data & Utility", icon: <Database size={20}/>, color: "text-muted dark:text-muted/70 dark:text-muted/70", tools: ["smart-json", "smart-ocr"] }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 dark:text-indigo-400"><Layers size={32}/></div>
        <div>
            <h1 className="text-2xl font-extrabold text-main dark:text-slate-100 dark:text-slate-200">Smart Documents</h1>
            <p className="text-muted dark:text-muted dark:text-muted dark:text-muted font-medium">The Ultimate Processing Hub</p>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="space-y-4">
            <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${section.color} border-b pb-2 border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800`}>
                {section.icon} {section.title}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTools(section.tools).map(tool => (
                    <Link key={tool.id} href={tool.href} className="group flex items-center gap-4 p-4 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 rounded-2xl hover:border-indigo-200 hover:  transition-all">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.bg} ${tool.color} group-hover:scale-105 transition-transform`}>
                            {tool.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-main dark:text-slate-100 dark:text-slate-200 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">{tool.name}</h3>
                            <p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">{tool.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      ))}
    </div>
  );
}
