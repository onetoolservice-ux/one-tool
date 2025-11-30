"use client";
import React, { useState } from "react";
import { ArrowRightLeft } from "lucide-react";

export default function UnitConverter() {
  const [val, setVal] = useState(1);
  const [type, setType] = useState("length");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");

  const rates: any = {
    length: { m: 1, km: 0.001, cm: 100, mm: 1000, ft: 3.28084, in: 39.3701, mi: 0.000621371 },
    weight: { kg: 1, g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274 },
    temp: { c: 'c', f: 'f', k: 'k' } // Handled separately
  };

  const result = React.useMemo(() => {
     if (type === 'temp') {
        if (from === 'c' && to === 'f') return (val * 9/5) + 32;
        if (from === 'f' && to === 'c') return (val - 32) * 5/9;
        return val; 
     }
     const base = val / rates[type][from];
     return base * rates[type][to];
  }, [val, type, from, to]);

  return (
    <div className="max-w-xl mx-auto p-6 text-center space-y-8">
      <div><h1 className="text-3xl font-extrabold text-main dark:text-white">Unit Converter</h1><p className="text-muted">Convert common measurements.</p></div>
      
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
         <div className="flex justify-center gap-2 mb-4">
            {Object.keys(rates).map(k => (
                <button key={k} onClick={() => { setType(k); setFrom(Object.keys(rates[k])[0]); setTo(Object.keys(rates[k])[1]); }} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${type === k ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-muted'}`}>{k}</button>
            ))}
         </div>

         <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
                <input type="number" value={val} onChange={e => setVal(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg font-bold" />
                <select value={from} onChange={e => setFrom(e.target.value)} className="w-full p-2 bg-transparent text-center text-sm font-bold text-muted uppercase">{Object.keys(rates[type]).map(u => <option key={u} value={u}>{u}</option>)}</select>
            </div>
            <ArrowRightLeft className="text-slate-300" />
            <div className="flex-1 space-y-2">
                <div className="w-full p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center h-[54px]">{result.toFixed(2)}</div>
                <select value={to} onChange={e => setTo(e.target.value)} className="w-full p-2 bg-transparent text-center text-sm font-bold text-muted uppercase">{Object.keys(rates[type]).map(u => <option key={u} value={u}>{u}</option>)}</select>
            </div>
         </div>
      </div>
    </div>
  );
}
