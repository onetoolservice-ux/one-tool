"use client";
import React, { useState } from 'react';
import { CodeEditor } from './code-editor';
import { Braces, Database, Copy, Check, AlignLeft, Minimize2, Trash2, AlertCircle, BookOpen, X } from 'lucide-react';

interface SmartEditorProps { toolId: string; }

export const SmartEditor = ({ toolId }: SmartEditorProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const lang = toolId.includes('sql') ? 'sql' : 'json';
  const Icon = lang === 'sql' ? Database : Braces;
  const title = lang === 'sql' ? 'SQL Studio' : 'JSON Architect';

  const handleFormat = () => {
    setError("");
    try {
      if (lang === 'json') setCode(JSON.stringify(JSON.parse(code), null, 2));
      else setCode(code.replace(/\s+/g, ' ').replace(/\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|INSERT|UPDATE|DELETE)\b/gi, '\n$1').trim());
    } catch (e: any) { setError(e.message); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false), 2000); };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#1e1e1e] text-slate-300 overflow-hidden border border-slate-800 rounded-xl shadow-2xl relative">
       <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-4 select-none">
             <div className="flex items-center gap-3">
                <Icon size={14} className="text-blue-400"/>
                <span className="text-xs font-bold text-slate-300 tracking-wide">{title}</span>
                {error && <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{error}</span>}
             </div>
             {/* FIXED: Button explicitly calls setShowDocs */}
             <button onClick={() => setShowDocs(!showDocs)} className={`text-xs flex items-center gap-1 hover:text-white transition-colors ${showDocs ? 'text-blue-400' : 'text-slate-500'}`}>
               <BookOpen size={12} /> Docs
             </button>
          </div>
          <div className="flex-1 relative">
             <CodeEditor language={lang} value={code} onChange={(v) => setCode(v || "")} />
          </div>
          <div className="h-10 bg-[#007acc] text-white flex items-center justify-between px-4 shadow-lg z-10">
             <div className="flex items-center gap-4">
                <button onClick={handleFormat} className="flex items-center gap-1.5 text-xs font-bold hover:bg-white/20 px-3 py-1 rounded"><AlignLeft size={14}/> Format</button>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setCode("")} className="p-1 hover:bg-white/20 rounded"><Trash2 size={14}/></button>
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs font-bold hover:bg-white/20 px-3 py-1 rounded">{copied ? <Check size={14}/> : <Copy size={14}/>} Copy</button>
             </div>
          </div>
       </div>

       {/* FIXED SIDEBAR: Absolute positioning with high Z-Index */}
       {showDocs && (
         <div className="absolute right-0 top-10 bottom-10 w-72 bg-[#252526] border-l border-[#3e3e42] shadow-2xl z-50 animate-in slide-in-from-right-10 duration-200 flex flex-col">
            <div className="p-3 border-b border-[#3e3e42] flex justify-between items-center">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cheat Sheet</span>
               <button onClick={() => setShowDocs(false)}><X size={14} className="text-slate-400 hover:text-white"/></button>
            </div>
            <div className="p-4 text-xs text-slate-400 space-y-4 overflow-y-auto">
               {lang === 'json' ? (
                 <>
                   <div><h4 className="text-blue-400 font-bold mb-1">Object</h4><code className="block bg-black/30 p-2 rounded text-[#638c80]">{`{ "key": "value" }`}</code></div>
                   <div><h4 className="text-blue-400 font-bold mb-1">Array</h4><code className="block bg-black/30 p-2 rounded text-[#638c80]">{`[ 1, 2, 3 ]`}</code></div>
                 </>
               ) : (
                 <>
                   <div><h4 className="text-blue-400 font-bold mb-1">Select</h4><code className="block bg-black/30 p-2 rounded text-[#638c80]">SELECT * FROM table</code></div>
                   <div><h4 className="text-blue-400 font-bold mb-1">Where</h4><code className="block bg-black/30 p-2 rounded text-[#638c80]">WHERE id = 1</code></div>
                 </>
               )}
            </div>
         </div>
       )}
    </div>
  );
};
