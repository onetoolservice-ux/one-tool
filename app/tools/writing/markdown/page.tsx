"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Eye, Code, Copy, Check } from "lucide-react";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("# Hello World\n\nStart typing **markdown** here.\n\n- It supports lists\n- [Links](https://onetool.vercel.app)\n- And code blocks");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileText className="text-sky-500"/> Markdown Editor</h1>
        <button onClick={copy} className="text-xs font-bold text-slate-500 hover:text-sky-600 flex items-center gap-1 bg-white border px-3 py-1.5 rounded-lg">
          {copied ? <Check size={14}/> : <Copy size={14}/>} Copy Raw
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Editor */}
        <div className={`flex-1 flex flex-col border-r border-slate-100 ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase flex justify-between items-center">
            <span className="flex items-center gap-2"><Code size={14}/> Write</span>
            <button className="md:hidden text-sky-600" onClick={() => setActiveTab("preview")}>Preview &rarr;</button>
          </div>
          <textarea 
            value={markdown} 
            onChange={(e) => setMarkdown(e.target.value)} 
            className="flex-1 p-6 resize-none outline-none font-mono text-sm text-slate-700 leading-relaxed"
            placeholder="# Type here..."
          />
        </div>

        {/* Preview */}
        <div className={`flex-1 flex flex-col bg-slate-50/30 ${activeTab === 'write' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase flex justify-between items-center">
            <span className="flex items-center gap-2"><Eye size={14}/> Preview</span>
            <button className="md:hidden text-sky-600" onClick={() => setActiveTab("write")}>&larr; Editor</button>
          </div>
          <div className="flex-1 p-6 prose prose-slate max-w-none overflow-y-auto">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
}
