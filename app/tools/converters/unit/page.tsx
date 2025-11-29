"use client";
import React, { useState } from "react";
import { Scale, ArrowRightLeft } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

const UNITS: any = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, inch: 0.0254, mile: 1609.34, yd: 0.9144 },
  Weight: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495, ton: 907.185 },
  Volume: { l: 1, ml: 0.001, gal: 3.78541, pt: 0.473176, cup: 0.24 },
  Time: { s: 1, min: 60, h: 3600, day: 86400, week: 604800 },
  Digital: { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 }
};

export default function UnitConverter() {
  const [cat, setCat] = useState("Length");
  const [val, setVal] = useState(1);
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");

  const result = (val * UNITS[cat][from]) / UNITS[cat][to];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <ToolHeader title="Unit Converter" desc="Length, Weight, Volume, Digital" icon={<Scale size={20}/>} />
      
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {Object.keys(UNITS).map(c => (
          <button key={c} onClick={()=>{setCat(c); setFrom(Object.keys(UNITS[c])[0]); setTo(Object.keys(UNITS[c])[1]);}} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${cat===c ? 'bg-slate-800 text-white' : 'bg-slate-100 text-muted dark:text-muted/70 dark:text-muted/70 hover:bg-slate-200'}`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-center bg-surface dark:bg-slate-800 dark:bg-surface p-8 rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div>
          <input type="number" value={val} onChange={e=>setVal(Number(e.target.value))} className="text-3xl font-bold w-full outline-none text-main dark:text-slate-100 dark:text-slate-200 bg-transparent dark:text-white placeholder:text-slate-300" placeholder="0"/>
          <select value={from} onChange={e=>setFrom(e.target.value)} className="mt-2 w-full p-2 bg-background dark:bg-[#0f172a] dark:bg-[#020617] rounded text-sm font-medium outline-none">
            {Object.keys(UNITS[cat]).map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex justify-center text-slate-300"><ArrowRightLeft /></div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[rgb(117,163,163)] truncate">{result.toLocaleString(undefined, {maximumFractionDigits:4})}</div>
          <select value={to} onChange={e=>setTo(e.target.value)} className="mt-2 w-full p-2 bg-background dark:bg-[#0f172a] dark:bg-[#020617] rounded text-sm font-medium outline-none text-right">
            {Object.keys(UNITS[cat]).map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
