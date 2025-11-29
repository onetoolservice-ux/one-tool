"use client";
import React, { useState, useEffect } from "react";
import { Lock, RefreshCw, Copy, ShieldCheck, ShieldAlert } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartPass() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");
  const [history, setHistory] = useState<string[]>([]);

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
    setHistory(prev => [pass, ...prev].slice(0, 10));
  };

  useEffect(() => { generate(); }, []);

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    showToast("Password Copied");
  };

  const strength = Math.min(100, (length * 4) + (options.symbols ? 20 : 0) + (options.numbers ? 10 : 0));

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans overflow-hidden">
      <Toast />

      {/* Header */}
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 shadow-lg shadow-slate-200/50 dark:shadow-none shrink-0 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-emerald-600 text-white  "><Lock size={22} /></div>
        <div><h1 className="text-lg font-extrabold text-main dark:text-slate-100 dark:text-slate-200">Smart Pass</h1><p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted font-bold uppercase">Security Generator</p></div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 overflow-auto">
        {/* Config & Main Display */}
        <div className="lg:col-span-2 space-y-8 max-w-2xl mx-auto w-full">

          <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-center relative overflow-hidden group">
            <div className={`absolute top-0 left-0 h-1 transition-all duration-500 ${strength > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${strength}%` }} />
            <h2 className="text-4xl font-mono font-bold text-main dark:text-slate-100 dark:text-slate-200 break-all tracking-tight mb-4">{password}</h2>
            <div className="flex justify-center gap-4">
              <button onClick={() => copy(password)} className="flex items-center gap-2 px-6 py-2 bg-surface text-white rounded-full font-bold text-sm hover:scale-105 transition"><Copy size={16} /> Copy</button>
              <button
                aria-label="Reset/Refresh Data"
                onClick={generate}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm hover:bg-emerald-200 transition"
              >
                <RefreshCw size={16} /> Regenerate
              </button>
            </div>
          </div>

          <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Length: {length}</label>
              </div>
              <input type="range" min="8" max="64" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full accent-emerald-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(options).map(key => (
                <label key={key} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617] transition">
                  <input type="checkbox" checked={(options as any)[key]} onChange={() => setOptions(p => ({ ...p, [key]: !(p as any)[key] }))} className="w-5 h-5 accent-emerald-600 rounded" />
                  <span className="text-sm font-bold text-main dark:text-slate-300 capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface border-l h-full p-6 flex flex-col hidden lg:flex">
          <h3 className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase mb-4 flex items-center gap-2"><ShieldCheck size={14} /> History</h3>
          <div className="space-y-2 overflow-auto flex-1 pr-2">
            {history.map((p, i) => (
              <div key={i} onClick={() => copy(p)} className="p-3 border rounded-lg hover:bg-emerald-50 cursor-pointer group transition flex justify-between items-center">
                <span className="font-mono text-xs text-muted dark:text-muted/70 dark:text-muted/70 truncate max-w-[180px]">{p}</span>
                <Copy size={12} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
