"use client";
import React, { useState, useEffect } from 'react';
import { 
  Copy, Trash2, Type, AlignLeft, Check, ArrowRightLeft, 
  Maximize2, Minimize2, Binary, Link as LinkIcon, Hash 
} from 'lucide-react';

interface TransformerProps {
  toolId: string;
  title: string;
}

export const TextTransformer = ({ toolId, title }: TransformerProps) => {
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode'); // For Base64/URL

  // --- LOGIC HELPERS ---
  const toCamel = (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  const toSnake = (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || s;
  const toKebab = (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || s;
  const toPascal = (s: string) => s.replace(/\w+/g, function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase();}).replace(/\s+/g, '');
  const toTitle = (s: string) => s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  // --- CASE CONVERTER DATA ---
  const getCaseResults = () => [
    { label: "UPPERCASE", val: input.toUpperCase() },
    { label: "lowercase", val: input.toLowerCase() },
    { label: "Title Case", val: toTitle(input) },
    { label: "camelCase", val: toCamel(input) },
    { label: "snake_case", val: toSnake(input) },
    { label: "kebab-case", val: toKebab(input) },
    { label: "PascalCase", val: toPascal(input) },
    { label: "Reverse", val: input.split('').reverse().join('') },
  ];

  // --- STATS CALCULATOR ---
  const getStats = () => {
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const chars = input.length;
    const sentences = input.split(/[.!?]+/).filter(Boolean).length;
    const lines = input.split(/\n/).length;
    return { words, chars, sentences, lines };
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // --- RENDERERS ---

  // 1. CASE CONVERTER UI (Grid of Cards)
  if (toolId === 'case-convert') {
    return (
      <div className="max-w-6xl mx-auto h-[calc(100vh-64px)] flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
         {/* INPUT */}
         <div className="w-full lg:w-1/3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2"><Type size={14}/> Source Text</h3>
               <button onClick={() => setInput("")} className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1"><Trash2 size={12}/> Clear</button>
            </div>
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type or paste your text here..." 
              className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border-none outline-none resize-none rounded-xl p-4 text-sm font-medium leading-relaxed focus:ring-2 ring-indigo-500/50 transition-all"
              spellCheck={false}
            />
            <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
               <span>{getStats().words} Words</span>
               <span>{getStats().chars} Chars</span>
            </div>
         </div>

         {/* OUTPUT GRID */}
         <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {getCaseResults().map((item, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                        <button 
                          onClick={() => handleCopy(item.val, i)} 
                          className={`p-1.5 rounded-md transition-colors ${copiedIndex === i ? 'bg-[#638c80]/20 text-[#4a6b61]' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                           {copiedIndex === i ? <Check size={14}/> : <Copy size={14}/>}
                        </button>
                     </div>
                     <p className="text-sm font-mono text-slate-700 dark:text-slate-300 break-words leading-snug min-h-[2.5rem]">
                        {item.val || <span className="opacity-30 italic">Waiting...</span>}
                     </p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  // 2. ENCODER / DECODER UI (Split Screen)
  if (['smart-base64', 'smart-url', 'smart-html-entities'].includes(toolId)) {
    const processDual = (val: string, op: 'encode' | 'decode') => {
       try {
         if (toolId === 'smart-base64') return op === 'encode' ? btoa(val) : atob(val);
         if (toolId === 'smart-url') return op === 'encode' ? encodeURIComponent(val) : decodeURIComponent(val);
         if (toolId === 'smart-html-entities') return op === 'encode' ? val.replace(/[<>"'&]/g, (m)=>({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','&':'&amp;'}[m]||m)) : val.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
         return val;
       } catch { return "Error: Invalid Input"; }
    };

    return (
       <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] p-6 flex flex-col">
          <div className="flex justify-center mb-6">
             <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                <button onClick={() => setMode('encode')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'encode' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500'}`}>Encode</button>
                <button onClick={() => setMode('decode')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'decode' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500'}`}>Decode</button>
             </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* INPUT */}
             <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                   <span className="text-xs font-bold text-slate-500 uppercase">Input</span>
                   <button onClick={() => setInput("")} className="text-slate-400 hover:text-rose-500"><Trash2 size={14}/></button>
                </div>
                <textarea 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  className="flex-1 p-4 bg-transparent outline-none font-mono text-sm resize-none" 
                  placeholder={`Enter text to ${mode}...`}
                />
             </div>

             {/* OUTPUT */}
             <div className="flex flex-col bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm overflow-hidden">
                <div className="p-3 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center">
                   <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Result</span>
                   <button onClick={() => handleCopy(processDual(input, mode), 1)} className="text-indigo-600 hover:text-indigo-800"><Copy size={14}/></button>
                </div>
                <div className="flex-1 p-4 font-mono text-sm text-slate-800 dark:text-slate-200 overflow-auto break-all whitespace-pre-wrap">
                   {input ? processDual(input, mode) : <span className="opacity-40 italic">Waiting for input...</span>}
                </div>
             </div>
          </div>
       </div>
    );
  }

  // 3. WORD COUNTER / DEFAULT
  const stats = getStats();
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
       {/* STATS BAR */}
       <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { l: 'Words', v: stats.words }, { l: 'Characters', v: stats.chars },
            { l: 'Sentences', v: stats.sentences }, { l: 'Lines', v: stats.lines }
          ].map((s, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{s.l}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{s.v}</p>
             </div>
          ))}
       </div>

       {/* EDITOR */}
       <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 h-[500px] flex flex-col shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
             <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><AlignLeft size={14}/> Text Editor</span>
             <div className="flex gap-2">
                <button onClick={() => setInput("")} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Trash2 size={14}/></button>
                <button onClick={() => handleCopy(input, 0)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">{copiedIndex === 0 ? <Check size={14}/> : <Copy size={14}/>}</button>
             </div>
          </div>
          <textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            className="flex-1 p-6 bg-transparent outline-none font-serif text-lg leading-relaxed resize-none text-slate-800 dark:text-slate-200"
            placeholder="Start typing or paste text here..."
          />
       </div>
    </div>
  );
};
