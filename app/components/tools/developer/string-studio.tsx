"use client";
import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Link as LinkIcon, Hash, Binary, Type } from 'lucide-react';

interface StringStudioProps { toolId: string; }

export const StringStudio = ({ toolId }: StringStudioProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encode");

  // AUTO GENERATE UUID
  useEffect(() => {
    if (toolId === 'smart-uuid' && !output) generateUUID();
  }, []);

  const generateUUID = () => {
    const uuids = Array(10).fill(0).map(() => crypto.randomUUID()).join('\n');
    setOutput(uuids);
  };

  const process = (val: string) => {
    setInput(val);
    try {
      if (toolId === 'smart-url') {
        if (!val) { setOutput(""); return; }
        try {
           const url = new URL(val);
           let res = `Protocol: ${url.protocol}\nHost: ${url.hostname}\nPath: ${url.pathname}\n\n--- PARAMS ---\n`;
           url.searchParams.forEach((v, k) => res += `${k}: ${v}\n`);
           setOutput(res);
        } catch {
           // Fallback for partials
           setOutput(decodeURIComponent(val));
        }
      } 
      else if (toolId === 'smart-base64') {
         setOutput(mode === 'decode' ? atob(val) : btoa(val));
      }
      else if (toolId === 'smart-html-entities') {
         setOutput(mode === 'decode' ? val.replace(/&/g, '&') : val.replace(/[<>"'&]/g, (m)=>({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','&':'&amp;'}[m]||m)));
      }
    } catch (e) { setOutput("Invalid Input"); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
       
       {/* CONTROLS */}
       <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             {toolId === 'smart-uuid' ? <Hash className="text-indigo-600"/> : toolId === 'smart-url' ? <LinkIcon className="text-indigo-600"/> : <Binary className="text-indigo-600"/>}
             {toolId === 'smart-uuid' ? "UUID Generator" : toolId === 'smart-url' ? "URL Parser" : "Base64 / HTML"}
          </h2>
          {toolId === 'smart-uuid' ? (
             <button onClick={generateUUID} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"><RefreshCw size={14}/> Regenerate</button>
          ) : (
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => {setMode('encode'); process(input)}} className={`px-3 py-1 text-xs font-bold rounded ${mode==='encode'?'bg-white dark:bg-slate-700 shadow':''}`}>Encode</button>
                <button onClick={() => {setMode('decode'); process(input)}} className={`px-3 py-1 text-xs font-bold rounded ${mode==='decode'?'bg-white dark:bg-slate-700 shadow':''}`}>Decode</button>
             </div>
          )}
       </div>

       {/* WORKSPACE */}
       {toolId === 'smart-uuid' ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative group">
             <pre className="font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{output}</pre>
             <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded hover:text-indigo-600"><Copy size={16}/></button>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Input</label>
                <textarea value={input} onChange={e => process(e.target.value)} className="w-full h-64 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl resize-none outline-none focus:ring-2 ring-indigo-500 font-mono text-sm" placeholder="Enter text..."/>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Result</label>
                <div className="w-full h-64 p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl overflow-auto font-mono text-sm text-[#4a6b61] relative group">
                   {output}
                   {output && <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-800 rounded shadow hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={14}/></button>}
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
