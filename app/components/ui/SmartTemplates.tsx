"use client";
import React, { useState } from "react";
import { LayoutTemplate, Check } from "lucide-react";
import { showToast } from "@/app/shared/Toast";

export interface Template {
  name: string;
  data: any;
}

interface Props {
  templates: Template[];
  onSelect: (data: any) => void;
}

export default function SmartTemplates({ templates, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold transition   ${isOpen ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-surface dark:bg-slate-800 dark:bg-surface text-muted dark:text-muted dark:text-muted dark:text-muted border-line dark:border-slate-700 dark:border-slate-800 hover:bg-background dark:bg-surface dark:bg-slate-950'}`}
      >
        <LayoutTemplate size={14}/> Templates
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}/>
          <div className="absolute top-full right-0 mt-2 w-64 bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-xl dark:shadow-none dark:border dark:border-slate-600 border border-line dark:border-slate-700 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b bg-background dark:bg-surface dark:bg-slate-950 text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase tracking-wide">
                Load Scenario
            </div>
            <div>
                {templates.map((t, i) => (
                    <button 
                        key={i} 
                        onClick={() => { onSelect(t.data); setIsOpen(false); showToast(`Loaded: ${t.name}`); }}
                        className="w-full text-left p-3 border-b last:border-0 hover:bg-indigo-50 transition flex items-center justify-between group"
                    >
                        <span className="text-sm font-medium text-main dark:text-slate-300 group-hover:text-indigo-700">{t.name}</span>
                        <Check size={14} className="opacity-0 group-hover:opacity-100 text-indigo-500"/>
                    </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
