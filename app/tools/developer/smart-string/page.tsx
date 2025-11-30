"use client";
import React, { useState } from "react";

export default function SmartString() {
  const [text, setText] = useState("Hello One Tool");

  const stats = {
    chars: text.length,
    words: text.trim().split(/\s+/).filter(w=>w).length,
    lines: text.split(/\r\n|\r|\n/).length,
  };

  const tools = [
    { l: "Slugify", fn: () => setText(text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')) },
    { l: "Reverse", fn: () => setText(text.split("").reverse().join("")) },
    { l: "Trim Lines", fn: () => setText(text.split("\n").map(l=>l.trim()).join("\n")) },
    { l: "Uppercase", fn: () => setText(text.toUpperCase()) },
    { l: "Lowercase", fn: () => setText(text.toLowerCase()) },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center"><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">String Tools</h1></div>
      
      <div className="flex justify-center gap-4 text-sm font-bold text-slate-500">
         <span>{stats.chars} Chars</span> &bull; <span>{stats.words} Words</span> &bull; <span>{stats.lines} Lines</span>
      </div>

      <textarea value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none outline-none text-lg focus:ring-2 focus:ring-indigo-500/20" placeholder="Type something..." autoFocus />

      <div className="flex flex-wrap justify-center gap-2">
         {tools.map(t => <button key={t.l} onClick={t.fn} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700">{t.l}</button>)}
         <button onClick={() => setText("")} className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-lg font-bold text-sm">Clear</button>
      </div>
    </div>
  );
}
