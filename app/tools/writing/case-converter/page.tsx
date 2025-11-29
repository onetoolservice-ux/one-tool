"use client";

import React, { useState } from "react";
import { Type, Copy, Check, RefreshCw } from "lucide-react";

export default function CaseConverter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = (type: string) => {
    switch (type) {
      case "upper": setText(text.toUpperCase()); break;
      case "lower": setText(text.toLowerCase()); break;
      case "title": setText(text.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())); break;
      case "sentence": setText(text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()); break;
      case "camel": setText(text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())); break;
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-xl mb-4"><Type size={32} /></div>
        <h1 className="text-3xl font-bold text-main dark:text-slate-100 dark:text-slate-200">Case Converter</h1>
        <p className="text-muted dark:text-muted dark:text-muted dark:text-muted mt-2">Easily switch between Uppercase, Lowercase, Title Case, and more.</p>
      </div>

      <div className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-64 p-6 resize-none outline-none text-lg text-main dark:text-slate-300 placeholder:text-slate-300"
        />
        <div className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-4 border-t border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => convert('upper')} className="px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface border rounded-lg text-sm font-semibold text-muted dark:text-muted/70 dark:text-muted/70 hover:text-amber-600 hover:border-amber-200 transition-colors">UPPERCASE</button>
            <button onClick={() => convert('lower')} className="px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface border rounded-lg text-sm font-semibold text-muted dark:text-muted/70 dark:text-muted/70 hover:text-amber-600 hover:border-amber-200 transition-colors">lowercase</button>
            <button onClick={() => convert('title')} className="px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface border rounded-lg text-sm font-semibold text-muted dark:text-muted/70 dark:text-muted/70 hover:text-amber-600 hover:border-amber-200 transition-colors">Title Case</button>
            <button onClick={() => convert('sentence')} className="px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface border rounded-lg text-sm font-semibold text-muted dark:text-muted/70 dark:text-muted/70 hover:text-amber-600 hover:border-amber-200 transition-colors">Sentence case</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setText("")} className="p-2 text-muted/70 hover:text-rose-500 transition-colors" title="Clear"><RefreshCw size={18}/></button>
            <button onClick={copy} className="flex items-center gap-1 px-4 py-2 bg-surface text-white rounded-lg text-sm font-bold   hover:bg-slate-800 transition-all">
              {copied ? <Check size={16}/> : <Copy size={16}/>} Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
