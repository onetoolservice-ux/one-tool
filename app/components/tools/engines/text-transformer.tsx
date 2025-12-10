"use client";
import React, { useState } from 'react';
import { Type, Copy } from 'lucide-react';

export const TextTransformer = ({ toolId, title }: { toolId: string, title: string }) => {
  const [input, setInput] = useState("");
  
  const transform = (type: string) => {
    switch(type) {
      case 'upper': return input.toUpperCase();
      case 'lower': return input.toLowerCase();
      case 'title': return input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      case 'camel': return input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
      case 'snake': return input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || input;
      case 'kebab': return input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || input;
      default: return input;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
          <Type className="text-teal-600"/> {title}
       </h2>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[65vh]">
          {/* INPUT */}
          <div className="flex flex-col h-full">
             <label className="text-xs font-bold text-slate-500 uppercase mb-2">Input</label>
             <textarea 
               value={input} 
               onChange={e => setInput(e.target.value)}
               className="flex-1 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-none focus:ring-2 ring-teal-500/20 outline-none text-sm leading-relaxed shadow-sm"
               placeholder="Type or paste your text here..."
             />
          </div>
          
          {/* CONTROLS */}
          <div className="flex flex-col gap-4">
             <label className="text-xs font-bold text-slate-500 uppercase">Transforms</label>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setInput(transform('upper'))} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">UPPERCASE</button>
                <button onClick={() => setInput(transform('lower'))} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">lowercase</button>
                <button onClick={() => setInput(transform('title'))} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">Title Case</button>
                <button onClick={() => setInput(transform('camel'))} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">camelCase</button>
                <button onClick={() => setInput(transform('snake'))} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">snake_case</button>
                <button onClick={() => setInput(transform('kebab'))} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">kebab-case</button>
             </div>
             
             <div className="mt-auto p-5 bg-slate-900 text-white rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                   <p className="text-xs font-bold uppercase text-slate-400 mb-0.5">Character Count</p>
                   <p className="text-xl font-black">{input.length}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(input)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"><Copy size={16}/> Copy</button>
             </div>
          </div>
       </div>
    </div>
  );
};