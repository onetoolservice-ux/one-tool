"use client";
import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check, ShieldCheck } from 'lucide-react';

export const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const sets = {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
    };
    let chars = "";
    if (options.upper) chars += sets.upper;
    if (options.lower) chars += sets.lower;
    if (options.numbers) chars += sets.numbers;
    if (options.symbols) chars += sets.symbols;

    if (!chars) return;

    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  // Regenerate on change
  useEffect(() => { generate(); }, [length, options]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate Strength Color
  const getStrength = () => {
    let score = 0;
    if (length > 12) score++;
    if (options.symbols) score++;
    if (options.numbers) score++;
    if (options.upper && options.lower) score++;
    return score > 3 ? "bg-[#638c80]" : score > 1 ? "bg-amber-500" : "bg-rose-500";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
       
       {/* Display Box */}
       <div className="relative group">
          <div className="w-full bg-slate-900 text-white text-3xl font-mono p-8 rounded-2xl text-center break-all tracking-wider shadow-2xl shadow-indigo-500/10">
             {password}
          </div>
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={generate} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><RefreshCw size={18}/></button>
             <button onClick={copyToClipboard} className="p-2 bg-white text-indigo-900 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors">
                {copied ? <Check size={18}/> : <Copy size={18}/>}
             </button>
          </div>
          {/* Strength Bar */}
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 mt-4 rounded-full overflow-hidden">
             <div className={`h-full transition-all duration-500 ${getStrength()}`} style={{ width: `${(length/32)*100}%` }}></div>
          </div>
       </div>

       {/* Controls */}
       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="space-y-3">
             <div className="flex justify-between text-sm font-bold text-slate-500 uppercase">
                <span>Length</span>
                <span>{length} characters</span>
             </div>
             <input type="range" min="6" max="32" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {Object.keys(options).map((key) => (
                <button 
                  key={key}
                  onClick={() => setOptions(p => ({...p, [key]: !p[key as keyof typeof options]}))}
                  className={`py-3 px-4 rounded-xl text-sm font-bold capitalize transition-all border-2 ${options[key as keyof typeof options] ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
                >
                   {key}
                </button>
             ))}
          </div>
       </div>

    </div>
  );
};
