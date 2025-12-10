"use client";
import React, { useState } from 'react';
import { Split, ArrowRightLeft } from 'lucide-react';

export const DiffStudio = () => {
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-6 gap-4">
       <div className="h-12 bg-white dark:bg-slate-900 border rounded-xl flex items-center px-4 justify-between">
          <h2 className="font-bold flex items-center gap-2"><Split className="text-orange-500"/> Text Diff</h2>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">Auto-Compare</span>
       </div>
       <div className="flex-1 flex gap-4 overflow-hidden">
          <textarea value={t1} onChange={e=>setT1(e.target.value)} className="flex-1 p-6 rounded-2xl border bg-white dark:bg-slate-900 resize-none outline-none font-mono text-sm leading-relaxed focus:ring-2 ring-red-500/20" placeholder="Original Text..."/>
          <textarea value={t2} onChange={e=>setT2(e.target.value)} className="flex-1 p-6 rounded-2xl border bg-white dark:bg-slate-900 resize-none outline-none font-mono text-sm leading-relaxed focus:ring-2 ring-green-500/20" placeholder="Modified Text..."/>
       </div>
    </div>
  );
};