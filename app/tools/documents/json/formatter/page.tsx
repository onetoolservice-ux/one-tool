"use client";
import React, { useState } from "react";
import { Copy, AlertTriangle, CheckCircle2 } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const format = (minify = false) => {
    try {
      if (!input.trim()) return;
      const obj = JSON.parse(input);
      setInput(JSON.stringify(obj, null, minify ? 0 : 2));
      setError("");
      showToast(minify ? "Minified!" : "Prettified!", "success");
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h1 className="text-2xl font-extrabold text-main dark:text-white">JSON Formatter</h1>
           <p className="text-xs text-muted">Validate, Prettify, and Minify.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => format(false)} variant="secondary" className="text-xs">Prettify</Button>
           <Button onClick={() => format(true)} variant="secondary" className="text-xs">Minify</Button>
           <Button onClick={() => { navigator.clipboard.writeText(input); showToast("Copied!"); }} className="text-xs"><Copy size={14} className="mr-1"/> Copy</Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <textarea 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          className={`w-full h-full p-4 font-mono text-sm bg-white dark:bg-slate-900 border rounded-xl outline-none resize-none ${error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'} focus:ring-4 transition-all`}
          placeholder="Paste JSON here..."
          spellCheck={false}
        />
        {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 p-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <AlertTriangle size={16} /> {error}
            </div>
        )}
        {!error && input && (
            <div className="absolute bottom-4 right-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={14} /> Valid JSON
            </div>
        )}
      </div>
    </div>
  );
}
