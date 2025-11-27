"use client";

import React, { useState } from "react";
import { Braces, Copy, Trash2, Check, Zap, AlertTriangle } from "lucide-react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatJson = (minify = false) => {
    if (!input.trim()) return;
    try {
      const obj = JSON.parse(input);
      setInput(JSON.stringify(obj, null, minify ? 0 : 2));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Braces className="text-amber-500" /> JSON Formatter
        </h1>
        <div className="flex gap-2">
          <button onClick={() => formatJson(true)} className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50">Minify</button>
          <button onClick={() => formatJson(false)} className="px-3 py-1.5 text-sm font-medium bg-[rgb(117,163,163)] text-white rounded-lg hover:opacity-90">Format (Pretty)</button>
        </div>
      </div>

      <div className="flex-1 relative group">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your JSON here..."
          className={`w-full h-full p-4 font-mono text-sm bg-slate-900 text-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 ${error ? 'ring-rose-500' : 'focus:ring-[rgb(117,163,163)]'}`}
          spellCheck={false}
        />
        
        {/* Action Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={copyToClipboard} className="p-2 bg-white/10 backdrop-blur text-white rounded hover:bg-white/20 transition-colors" title="Copy">
            {copied ? <Check size={16} className="text-emerald-400"/> : <Copy size={16}/>}
          </button>
          <button onClick={() => { setInput(""); setError(null); }} className="p-2 bg-white/10 backdrop-blur text-white rounded hover:bg-rose-500/50 transition-colors" title="Clear">
            <Trash2 size={16}/>
          </button>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-rose-500/90 backdrop-blur text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-2">
            <AlertTriangle size={20} />
            <span className="font-mono text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
