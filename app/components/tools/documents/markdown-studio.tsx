"use client";
import React, { useState } from 'react';
import { FileText, Eye, Code, Download, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const MarkdownStudio = () => {
  const [text, setText] = useState("# Hello World\n\nStart writing **markdown** here...\n\n- Item 1\n- Item 2");
  const [copied, setCopied] = useState(false);

  const download = () => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='document.md'; a.click();
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
       {/* EDITOR */}
       <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="h-12 bg-white dark:bg-slate-900 border-b flex items-center justify-between px-4">
             <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><Code size={14}/> MARKDOWN EDITOR</span>
             <div className="flex gap-2">
                <button onClick={copy} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1 rounded transition-colors flex items-center gap-1">
                   {copied ? <Check size={12} className="text-emerald-500"/> : <Copy size={12}/>} Copy
                </button>
                <button onClick={download} className="text-[10px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 px-3 py-1 rounded transition-colors flex items-center gap-1">
                   <Download size={12}/> Save
                </button>
             </div>
          </div>
          <textarea 
            value={text} 
            onChange={e=>setText(e.target.value)} 
            className="flex-1 p-6 bg-slate-50 dark:bg-slate-950 resize-none outline-none font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
       </div>

       {/* PREVIEW */}
       <div className="w-1/2 flex flex-col bg-white dark:bg-slate-900">
          <div className="h-12 border-b flex items-center px-4">
             <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><Eye size={14}/> LIVE PREVIEW</span>
          </div>
          <div className="flex-1 p-8 overflow-y-auto prose dark:prose-invert max-w-none prose-sm">
             <ReactMarkdown>{text}</ReactMarkdown>
          </div>
       </div>
    </div>
  );
};