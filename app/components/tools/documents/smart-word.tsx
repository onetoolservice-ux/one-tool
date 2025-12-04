"use client";
import React, { useState } from 'react';
import { Download, Type, Trash2, Copy, Check } from 'lucide-react';

export const SmartWord = () => {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "document.txt";
    document.body.appendChild(element);
    element.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const words = text.split(/\s+/).filter(w => w !== '').length;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
       <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wide">
                <Type size={18} /> Writer
             </div>
             <div className="text-xs font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">{words} Words</div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setText("")} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
             <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-[#638c80] transition-colors">{copied ? <Check size={16}/> : <Copy size={16}/>}</button>
             <button onClick={handleDownload} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90">
                <Download size={14}/> Save
             </button>
          </div>
       </div>
       <textarea 
         value={text} 
         onChange={(e) => setText(e.target.value)} 
         placeholder="Type here..." 
         className="flex-1 w-full p-8 outline-none text-lg leading-relaxed text-slate-700 dark:text-slate-200 bg-transparent resize-none custom-scrollbar font-serif"
       />
    </div>
  );
};
