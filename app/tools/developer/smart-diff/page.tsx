"use client";
import React, { useState } from "react";

export default function SmartDiff() {
  const [text1, setText1] = useState("Hello World");
  const [text2, setText2] = useState("Hello OneTool");

  const diffs = React.useMemo(() => {
    const a = text1.split('\n');
    const b = text2.split('\n');
    return a.map((line, i) => {
       if (line === b[i]) return { type: 'same', content: line };
       if (!b[i]) return { type: 'removed', content: line };
       return { type: 'changed', content: `${line} -> ${b[i]}` };
    });
  }, [text1, text2]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
       <div className="text-center">
        <h1 className="text-2xl font-extrabold text-main dark:text-white">Text Compare</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
         <textarea value={text1} onChange={e=>setText1(e.target.value)} className="p-4 rounded-xl border bg-white dark:bg-slate-800 resize-none" placeholder="Original Text"/>
         <textarea value={text2} onChange={e=>setText2(e.target.value)} className="p-4 rounded-xl border bg-white dark:bg-slate-800 resize-none" placeholder="Modified Text"/>
      </div>

      <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-auto font-mono text-sm">
         {diffs.map((d, i) => (
            <div key={i} className={`
                ${d.type === 'same' ? 'text-muted' : ''}
                ${d.type === 'removed' ? 'text-rose-400 bg-rose-900/20' : ''}
                ${d.type === 'changed' ? 'text-emerald-400 bg-emerald-900/20' : ''}
            `}>
                <span className="w-6 inline-block opacity-50 select-none">{i+1}</span> {d.content}
            </div>
         ))}
      </div>
    </div>
  );
}
