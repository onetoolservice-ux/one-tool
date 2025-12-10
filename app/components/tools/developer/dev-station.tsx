"use client";
import React, { useState } from 'react';
import { Terminal, Hash, Link, Binary, Code2, Split, Braces, Copy, Check } from 'lucide-react';
import { useToast } from '@/app/components/ui/toast-system';

const TOOLS = [
  { id: 'json', name: 'JSON Formatter', icon: Braces },
  { id: 'base64', name: 'Base64', icon: Binary },
  { id: 'url', name: 'URL Encoder', icon: Link },
  { id: 'uuid', name: 'UUID Gen', icon: Hash },
  { id: 'html', name: 'HTML Entities', icon: Code2 },
  { id: 'diff', name: 'Text Diff', icon: Split },
  { id: 'regex', name: 'Regex Tester', icon: Terminal },
];

export const DevStation = ({ initialTool = "json" }: { initialTool?: string }) => {
  const { toast } = useToast();
  // Map incoming ID (e.g. 'smart-uuid') to internal ID ('uuid')
  const mapId = (id: string) => {
     if(id.includes('uuid')) return 'uuid';
     if(id.includes('base64')) return 'base64';
     if(id.includes('url')) return 'url';
     if(id.includes('html')) return 'html';
     if(id.includes('diff')) return 'diff';
     if(id.includes('regex')) return 'regex';
     return 'json';
  };

  const [active, setActive] = useState(mapId(initialTool));
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');

  const process = () => {
    try {
      if (active === 'json') setOutput(JSON.stringify(JSON.parse(input), null, 2));
      if (active === 'base64') setOutput(mode==='encode' ? btoa(input) : atob(input));
      if (active === 'url') setOutput(mode==='encode' ? encodeURIComponent(input) : decodeURIComponent(input));
      if (active === 'uuid') setOutput(crypto.randomUUID());
      if (active === 'html') setOutput(mode==='encode' ? input.replace(/[<>&"']/g, c=>'&#'+c.charCodeAt(0)+';') : input.replace(/&#(d+);/g, (m,d)=>String.fromCharCode(d)));
      if (active === 'diff') setOutput("Diff view requires 2 inputs. Use specific tool.");
      if (active === 'regex') setOutput("Matches: " + (input.match(/test/g) || []).length);
      toast("Processed successfully", "success");
    } catch(e) { 
      setOutput("Error: Invalid Input");
      toast("Invalid Input", "error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast("Copied to clipboard", "success");
  };

  const Icon = TOOLS.find(t=>t.id===active)?.icon || Terminal;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
         <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Dev Tools</h2>
         <div className="space-y-1">
            {TOOLS.map(t => (
               <button key={t.id} onClick={()=>setActive(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${active===t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <t.icon size={16}/> {t.name}
               </button>
            ))}
         </div>
      </div>

      <div className="flex-1 p-6 lg:p-8 flex flex-col overflow-hidden">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Icon className="text-indigo-600"/> {TOOLS.find(t=>t.id===active)?.name}</h1>
            {['base64','url','html'].includes(active) && (
               <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                  <button onClick={()=>setMode('encode')} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${mode==='encode'?'bg-white dark:bg-slate-600 shadow text-indigo-600':'text-slate-500'}`}>Encode</button>
                  <button onClick={()=>setMode('decode')} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${mode==='decode'?'bg-white dark:bg-slate-600 shadow text-indigo-600':'text-slate-500'}`}>Decode</button>
               </div>
            )}
         </div>

         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
            <div className="flex flex-col">
               <label className="text-xs font-bold text-slate-400 uppercase mb-2">Input</label>
               <textarea value={input} onChange={e=>setInput(e.target.value)} className="flex-1 p-4 rounded-xl border bg-white dark:bg-slate-900 font-mono text-sm resize-none outline-none focus:ring-2 ring-indigo-500/20" placeholder={active==='uuid'?'Click Process to Generate UUID...':'Paste content here...'}/>
            </div>
            <div className="flex flex-col">
               <label className="text-xs font-bold text-slate-400 uppercase mb-2">Output</label>
               <div className="flex-1 relative">
                  <textarea value={output} readOnly className="w-full h-full p-4 rounded-xl border bg-slate-50 dark:bg-black/20 font-mono text-sm resize-none outline-none text-slate-600 dark:text-slate-300" placeholder="Result..."/>
                  <button onClick={handleCopy} className="absolute top-2 right-2 p-2 hover:bg-slate-200 rounded-lg transition-colors"><Copy size={14}/></button>
               </div>
            </div>
         </div>
         <button onClick={process} className="mt-6 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">Run Process</button>
      </div>
    </div>
  );
};