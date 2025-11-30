"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, Edit3 } from "lucide-react";

// Need to install react-markdown first if not present, but we'll do a basic mock if package missing
// For this script, we assume basic text rendering or we add the package in next step.
// Let's build a simple split view.

export default function MarkdownEditor() {
  const [md, setMd] = useState("# Hello World\n\nType your markdown here.\n\n- List item 1\n- List item 2\n\n**Bold Text**");

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-4">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Markdown Editor</h1>
         <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-2"><Edit3 size={14}/> Editor</span>
            <span className="flex items-center gap-2"><Eye size={14}/> Preview</span>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 h-full">
         <textarea 
            value={md} 
            onChange={e => setMd(e.target.value)} 
            className="w-full h-full p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm leading-relaxed"
            spellCheck={false} 
         />
         <div className="w-full h-full p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-auto prose dark:prose-invert prose-sm max-w-none">
             {/* Basic render fallback since we might not have the lib installed yet */}
             <pre className="whitespace-pre-wrap font-sans">{md}</pre> 
             <p className="text-xs text-slate-400 mt-4 italic border-t pt-4">* Install react-markdown for full rendering</p>
         </div>
      </div>
    </div>
  );
}
