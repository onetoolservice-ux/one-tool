"use client";
import React, { useState } from 'react';
import { Clock, RotateCcw } from 'lucide-react';

export const CronGenerator = () => {
  const [cron, setCron] = useState("0 12 * * 1");
  const [desc, setDesc] = useState("At 12:00 on Monday");

  const presets = [
    { l: "Every Minute", c: "* * * * *" },
    { l: "Every Hour", c: "0 * * * *" },
    { l: "Every Day at Midnight", c: "0 0 * * *" },
    { l: "Every Monday", c: "0 0 * * 1" },
    { l: "Every 1st of Month", c: "0 0 1 * *" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
       <div className="bg-slate-900 text-white p-8 rounded-3xl text-center shadow-2xl shadow-indigo-500/20">
          <div className="inline-block p-3 bg-white/10 rounded-xl mb-4"><Clock size={32}/></div>
          <div className="text-5xl font-mono font-bold tracking-widest mb-4">{cron}</div>
          <p className="text-indigo-300 font-medium text-lg">{desc}</p>
       </div>

       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {presets.map(p => (
             <button 
               key={p.c} 
               onClick={()=>{setCron(p.c); setDesc(p.l)}} 
               className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-500 transition-all"
             >
                {p.l}
             </button>
          ))}
       </div>
    </div>
  );
};
