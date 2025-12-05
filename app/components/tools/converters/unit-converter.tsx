"use client";
import React, { useState } from 'react';
import { Ruler, Scale, Clock, Thermometer, Box, Activity } from 'lucide-react';

const CATEGORIES: any = {
  length: { icon: Ruler, units: { m: 1, km: 0.001, cm: 100, mm: 1000, ft: 3.28084, in: 39.3701 } },
  mass: { icon: Scale, units: { kg: 1, g: 1000, lb: 2.20462, oz: 35.274 } },
  time: { icon: Clock, units: { s: 1, min: 1/60, h: 1/3600 } },
};

export const UnitConverter = () => {
  const [cat, setCat] = useState('length');
  const [val, setVal] = useState(1);
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('km');

  const result = val * (CATEGORIES[cat].units[to] / CATEGORIES[cat].units[from]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] bg-slate-50 dark:bg-black/20">
      <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r p-4 space-y-1">
        {Object.keys(CATEGORIES).map(c => {
          const Icon = CATEGORIES[c].icon;
          return (
            <button key={c} onClick={() => {setCat(c); setFrom(Object.keys(CATEGORIES[c].units)[0]); setTo(Object.keys(CATEGORIES[c].units)[1])}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${cat === c ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}>
              <Icon size={18}/> <span className="capitalize">{c}</span>
            </button>
          )
        })}
      </div>
      <div className="flex-1 p-8">
         <h2 className="text-2xl font-bold capitalize mb-8">{cat} Conversion</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">From</label>
              <div className="flex gap-2">
                 <input type="number" value={val} onChange={e => setVal(+e.target.value)} className="w-full p-3 border rounded-xl font-bold text-xl"/>
                 <select value={from} onChange={e => setFrom(e.target.value)} className="p-3 border rounded-xl font-bold bg-slate-50 dark:bg-slate-950">
                    {Object.keys(CATEGORIES[cat].units).map(u => <option key={u} value={u}>{u}</option>)}
                 </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">To</label>
              <div className="flex gap-2">
                 <div className="w-full p-3 border rounded-xl font-bold text-xl bg-slate-50 dark:bg-slate-800 flex items-center">{Number(result.toFixed(4))}</div>
                 <select value={to} onChange={e => setTo(e.target.value)} className="p-3 border rounded-xl font-bold bg-slate-50 dark:bg-slate-950">
                    {Object.keys(CATEGORIES[cat].units).map(u => <option key={u} value={u}>{u}</option>)}
                 </select>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};