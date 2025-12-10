"use client";
import React, { useState, useEffect } from 'react';
import { Lock, RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/app/components/ui/toast-system';

export const PasswordGenerator = () => {
  const { toast } = useToast();
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ upper: true, lower: true, num: true, sym: true });
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);

  const generate = () => {
    const sets = {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      num: "0123456789",
      sym: "!@#$%^&*()_+~`|}{[]:;?><,./-=" 
    };
    let chars = "";
    if(options.upper) chars += sets.upper;
    if(options.lower) chars += sets.lower;
    if(options.num) chars += sets.num;
    if(options.sym) chars += sets.sym;

    if(!chars) return;

    let res = "";
    for(let i=0; i<length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(res);
    calcStrength(res);
  };

  const calcStrength = (p: string) => {
    let s = 0;
    if(p.length > 8) s++;
    if(p.length > 12) s++;
    if(/[A-Z]/.test(p)) s++;
    if(/[0-9]/.test(p)) s++;
    if(/[^A-Za-z0-9]/.test(p)) s++;
    setStrength(s);
  };

  useEffect(generate, []);

  const copy = () => {
    navigator.clipboard.writeText(password);
    toast("Password copied to clipboard", "success");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl">
       <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
             <Lock size={32}/>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Password Generator</h2>
       </div>

       <div className="relative mb-8">
          <div className="w-full bg-slate-100 dark:bg-black p-6 rounded-2xl font-mono text-xl tracking-wider text-center break-all border-2 border-transparent focus-within:border-indigo-500 transition-colors text-slate-800 dark:text-slate-200">
             {password}
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
             <button onClick={generate} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500"><RefreshCw size={20}/></button>
             <button id="copy-btn" onClick={copy} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Copy</button>
          </div>
       </div>

       {/* Strength Bar */}
       <div className="flex gap-2 mb-8 h-2">
          {[1,2,3,4,5].map(i => (
             <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i <= strength ? (strength<3 ? 'bg-red-500' : strength<5 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-100 dark:bg-slate-800'}`}></div>
          ))}
       </div>

       <div className="space-y-6">
          <div>
             <div className="flex justify-between text-sm font-bold text-slate-500 mb-2"><span>Length</span><span>{length}</span></div>
             <input type="range" min="8" max="64" value={length} onChange={e=>setLength(+e.target.value)} className="w-full accent-indigo-600"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {Object.keys(options).map(opt => (
                <label key={opt} className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                   <input type="checkbox" checked={(options as any)[opt]} onChange={e=>setOptions({...options, [opt]: e.target.checked})} className="w-5 h-5 accent-indigo-600 rounded"/>
                   <span className="text-sm font-bold capitalize text-slate-700 dark:text-slate-300">{opt === 'num' ? 'Numbers' : opt === 'sym' ? 'Symbols' : opt + 'case'}</span>
                </label>
             ))}
          </div>
       </div>
    </div>
  );
};