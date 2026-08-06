"use client";
import React, { useState } from 'react';
import { Copy, Trash2, Wand2, Check, ArrowRightLeft, BookOpen, X, Regex } from 'lucide-react';

interface TextEngineProps {
  toolId: string;
  title: string;
  description?: string;
}

export const TextEngine = ({ toolId, title, description }: TextEngineProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [showDocs, setShowDocs] = useState(toolId === 'smart-regex');

  const process = () => {
    setError("");
    const val = input.trim();
    if (!val && !toolId.includes('uuid')) return;

    try {
      let res = "";
      switch (toolId) {
        case 'smart-regex': 
           const emails = val.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
           res = emails ? `Found ${emails.length} matches:\n${emails.join('\n')}` : "No matches found.";
           break;
        case 'case-convert': res = `UPPERCASE:\n${val.toUpperCase()}\n\nlowercase:\n${val.toLowerCase()}\n\nTitle Case:\n${val.replace(/\b\w/g, c => c.toUpperCase())}`; break;
        case 'smart-base64': try { res = atob(val); } catch { res = btoa(val); } break;
        case 'smart-url': res = decodeURIComponent(val); if(res===val) res = encodeURIComponent(val); break;
        case 'smart-uuid': res = Array(10).fill(0).map(() => crypto.randomUUID()).join('\n'); break;
        default: res = `Processed ${val.length} chars.`;
      }
      setOutput(res);
    } catch (e: any) { setError("Error: " + e.message); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-4 max-w-7xl mx-auto p-2">
       
       {/* INPUT PANE */}
       <div className="flex-1 flex flex-col bg-[#1e1e1e] border border-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="h-10 bg-[#252526] border-b border-[#3e3e42] flex justify-between items-center px-4">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Input Source</span>
             <button onClick={() => {setInput(""); setOutput("");}} className="text-slate-500 hover:text-rose-400 transition-colors"><Trash2 size={12}/></button>
          </div>
          <textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            className="flex-1 bg-[#1e1e1e] text-slate-300 p-4 font-mono text-sm outline-none resize-none placeholder:text-slate-600"
            placeholder="Paste text here..."
            spellCheck={false}
          />
          {/* BOTTOM ACTION BAR */}
          <div className="h-14 border-t border-slate-800 bg-[#252526] flex items-center justify-end px-4">
             <button onClick={process} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20">
               <Wand2 size={14}/> Process
             </button>
          </div>
       </div>

       {/* OUTPUT PANE */}
       <div className="flex-1 flex flex-col bg-[#1e1e1e] border border-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="h-10 bg-[#252526] border-b border-[#3e3e42] flex justify-between items-center px-4">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Output</span>
             {output && (
               <button onClick={handleCopy} className="text-[#638c80] text-[10px] font-bold flex items-center gap-1 hover:underline">
                  {copied ? <Check size={10}/> : <Copy size={10}/>} {copied ? "COPIED" : "COPY"}
               </button>
             )}
          </div>
          <div className="flex-1 bg-[#1e1e1e] p-4 overflow-auto">
             <pre className="text-sm font-mono text-[#638c80] whitespace-pre-wrap">
                {error || output || <span className="text-slate-600 italic">Waiting for input...</span>}
             </pre>
          </div>
       </div>

       {/* DOCS TOGGLE (Floating) */}
       {toolId === 'smart-regex' && (
         <button onClick={() => setShowDocs(!showDocs)} className="absolute top-24 right-6 bg-[#252526] border border-slate-700 p-2 rounded-full text-slate-400 hover:text-white shadow-xl z-50">
            <BookOpen size={16}/>
         </button>
       )}

    </div>
  );
};
