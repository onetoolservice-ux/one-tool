"use client";
import React, { useState, useMemo } from "react";

export default function RegexTester() {
  const [regex, setRegex] = useState("([A-Z])\\w+");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("OneTool is the Best Enterprise Suite.");

  const matches = useMemo(() => {
    try {
      const re = new RegExp(regex, flags);
      return text.match(re) || [];
    } catch (e) {
      return null;
    }
  }, [regex, flags, text]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">Regex Tester</h1>
        <p className="text-muted">Test regular expressions in real-time.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-muted uppercase mb-1 block">Expression</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3">
              <span className="text-muted font-mono">/</span>
              <input value={regex} onChange={(e) => setRegex(e.target.value)} className="flex-1 bg-transparent border-none p-3 font-mono text-indigo-600 dark:text-indigo-400 outline-none" />
              <span className="text-muted font-mono">/</span>
            </div>
          </div>
          <div className="w-24">
            <label className="text-xs font-bold text-muted uppercase mb-1 block">Flags</label>
            <input value={flags} onChange={(e) => setFlags(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-muted uppercase mb-1 block">Test String</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono" />
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-2">Matches ({matches?.length || 0})</h3>
          <div className="flex flex-wrap gap-2">
            {matches ? (
              Array.from(matches).map((m, i) => (
                <span key={i} className="px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  {m}
                </span>
              ))
            ) : (
              <span className="text-rose-500 text-sm">Invalid Regex</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
