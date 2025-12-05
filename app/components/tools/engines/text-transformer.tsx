"use client";
import React, { useState } from 'react';
import { Type, Copy, RefreshCw, AlignLeft, AlignCenter } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto p-6">
       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
          <Type className="text-teal-600"/> {title}
       </h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[60vh]">
          <div className="flex flex-col">
             <label className="text-xs font-bold text-slate-400 uppercase mb-2">Input Text</label>
             <textarea 
               value={input} 
               onChange={e => setInput(e.target.value)}
               className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none focus:ring-2 ring-teal-500/20 outline-none custom-scrollbar"
               placeholder="Type or paste your text here..."
             />
          </div>
          
          <div className="flex flex-col gap-4">
             <label className="text-xs font-bold text-slate-400 uppercase">Quick Actions</label>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setInput(transform('upper'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">UPPERCASE</button>
                <button onClick={() => setInput(transform('lower'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">lowercase</button>
                <button onClick={() => setInput(transform('title'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">Title Case</button>
                <button onClick={() => setInput(transform('camel'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">camelCase</button>
                <button onClick={() => setInput(transform('snake'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">snake_case</button>
                <button onClick={() => setInput(transform('kebab'))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-teal-50 hover:text-teal-600 transition-colors">kebab-case</button>
             </div>
             
             <div className="mt-auto p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-slate-400">{input.length} Characters</span>
                <button onClick={() => navigator.clipboard.writeText(input)} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><Copy size={16}/></button>
             </div>
          </div>
       </div>
    </div>
  );
};