"use client";
import React, { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { X, Lightbulb, BookOpen, CheckCircle2, Search, HelpCircle, FileText, Command, Keyboard, MousePointer } from "lucide-react";
import { GUIDE_CONTENT, DEFAULT_GUIDE } from "@/app/lib/guide-content";

export default function SmartAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const data = GUIDE_CONTENT[pathname] || DEFAULT_GUIDE;
    const [query, setQuery] = useState("");

    // 🔍 Smart Search Logic
    const filteredContent = useMemo(() => {
        if (!query) return data;
        const lowerQ = query.toLowerCase();
        return {
            ...data,
            desc: data.desc.toLowerCase().includes(lowerQ) ? data.desc : null,
            steps: data.steps.filter(s => s.toLowerCase().includes(lowerQ)),
            tips: data.tips.filter(t => t.toLowerCase().includes(lowerQ))
        };
    }, [query, data]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex justify-end font-sans">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-surface/10 backdrop-blur-[2px] transition-opacity" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-surface dark:bg-slate-800 dark:bg-surface h-full shadow-2xl border-l border-line dark:border-slate-700 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">

                {/* 1. HEADER & SEARCH */}
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border flex items-center gap-1 ${data.status === 'Live' ? 'bg-emerald-50 text-emerald-600 dark:text-emerald-400 border-emerald-100' : 'bg-slate-100 text-muted dark:text-muted dark:text-muted dark:text-muted border-line dark:border-slate-700 dark:border-slate-800'}`}>
                                    <FileText size={10} /> {data.status === 'Live' ? 'Verified Manual' : 'Draft Guide'}
                                </span>
                            </div>
                            <h2 className="text-xl font-extrabold text-main dark:text-slate-100 dark:text-slate-200">{data.title}</h2>
                        </div>
                        <button
                            aria-label="Close"
                            onClick={onClose}
                            className="text-muted/70 hover:text-muted dark:text-muted/70 hover:bg-background dark:bg-surface dark:bg-slate-950 p-2 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/70 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background dark:bg-surface dark:bg-slate-950 border border-line dark:border-slate-700 dark:border-slate-800 rounded-xl outline-none text-sm font-medium text-main dark:text-slate-300 focus:bg-surface dark:bg-slate-800 dark:bg-surface focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-muted/70"
                            placeholder={`Search ${data.title}...`}
                            autoFocus
                        />
                    </div>
                </div>

                {/* 2. CONTENT SCROLL */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background">

                    {/* Description */}
                    {(!query || (query && filteredContent.desc)) && (
                        <div className="prose prose-sm">
                            <h4 className="text-xs font-bold text-muted/70 uppercase tracking-wider mb-2 flex items-center gap-2"><BookOpen size={14} /> Context</h4>
                            <p className="text-sm text-muted dark:text-muted/70 dark:text-muted/70 leading-relaxed font-medium bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800  ">
                                {data.desc}
                            </p>
                        </div>
                    )}

                    {/* Steps (Workflow) */}
                    {filteredContent.steps && filteredContent.steps.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-muted/70 uppercase tracking-wider mb-3 flex items-center gap-2"><MousePointer size={14} /> Workflows</h4>
                            <div className="space-y-3">
                                {filteredContent.steps.map((step, i) => (
                                    <div key={i} className="flex gap-3 bg-surface dark:bg-slate-800 dark:bg-surface p-3 rounded-xl border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800  ">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-muted dark:text-muted dark:text-muted dark:text-muted font-bold text-xs flex items-center justify-center border border-line dark:border-slate-700 dark:border-slate-800 mt-0.5">{i + 1}</div>
                                        <p className="text-sm text-main dark:text-slate-300 leading-snug">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pro Tips */}
                    {filteredContent.tips && filteredContent.tips.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2"><Lightbulb size={14} className="fill-amber-600 text-amber-600" /> Insights</h4>
                            <div className="bg-amber-50/50 p-1 rounded-2xl border   border-amber-100/50 space-y-1">
                                {filteredContent.tips.map((tip, i) => (
                                    <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-surface dark:bg-slate-800 dark:bg-surface/50 transition">
                                        <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-main dark:text-slate-300 leading-snug">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shortcuts (If available) */}
                    {filteredContent.shortcuts && filteredContent.shortcuts.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-muted/70 uppercase tracking-wider mb-3 flex items-center gap-2"><Keyboard size={14} /> Shortcuts</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {filteredContent.shortcuts.map((sc, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-800 rounded-lg">
                                        <span className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">{sc.action}</span>
                                        <kbd className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-line dark:border-slate-700 dark:border-slate-800 text-muted dark:text-muted/70 dark:text-muted/70 font-mono">{sc.key}</kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {query && !filteredContent.desc && filteredContent.steps.length === 0 && filteredContent.tips.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <HelpCircle size={32} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm text-muted/70">No results found for "{query}"</p>
                        </div>
                    )}
                </div>

                {/* 3. FOOTER */}
                <div className="p-4 border-t border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 bg-surface dark:bg-slate-800 dark:bg-surface text-center">
                    <p className="text-xs text-muted/70 font-medium uppercase tracking-widest">
                        One Tool • Knowledge Engine v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
