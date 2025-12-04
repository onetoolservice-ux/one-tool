"use client";
import React, { useState } from 'react';
import { diffChars } from 'diff';
import { Split, Trash2 } from 'lucide-react';

export const DiffStudio = () => {
  const [oldText, setOldText] = useState("The quick brown fox jumps over the lazy dog.");
  const [newText, setNewText] = useState("The quick brown cat jumps over the happy dog.");

  const differences = diffChars(oldText, newText);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-4 gap-4 max-w-7xl mx-auto">
       
       {/* INPUTS */}
       <div className="grid grid-cols-2 gap-4 h-1/2">
          <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase">Original Text</label>
                <button onClick={() => setOldText('')} className="text-xs text-rose-500 hover:underline">Clear</button>
             </div>
             <textarea 
               value={oldText} 
               onChange={e => setOldText(e.target.value)} 
               className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-mono resize-none outline-none focus:ring-2 ring-indigo-500"
               placeholder="Paste original..."
             />
          </div>
          <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase">Modified Text</label>
                <button onClick={() => setNewText('')} className="text-xs text-rose-500 hover:underline">Clear</button>
             </div>
             <textarea 
               value={newText} 
               onChange={e => setNewText(e.target.value)} 
               className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-mono resize-none outline-none focus:ring-2 ring-indigo-500"
               placeholder="Paste new version..."
             />
          </div>
       </div>

       {/* DIFF OUTPUT */}
       <div className="h-1/2 flex flex-col bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
             <Split size={14}/> Comparison Result
          </div>
          <div className="flex-1 p-6 overflow-auto font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300">
             {differences.map((part, index) => (
               <span 
                 key={index} 
                 className={part.added ? 'bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 py-0.5 rounded' : part.removed ? 'bg-rose-200 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 py-0.5 rounded decoration-slice line-through opacity-60' : ''}
               >
                 {part.value}
               </span>
             ))}
          </div>
       </div>
    </div>
  );
};
