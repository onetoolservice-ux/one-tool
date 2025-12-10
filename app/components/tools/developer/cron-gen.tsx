"use client";
import React, { useState } from 'react';
import { Clock, Copy } from 'lucide-react';

export const CronGenerator = () => {
  const [cron, setCron] = useState({ min: '*', hour: '*', dom: '*', month: '*', dow: '*' });
  
  const Grid = ({ label, val, max, set }: any) => (
    <div className="p-4 border rounded-xl bg-white dark:bg-slate-900">
       <div className="flex justify-between mb-3"><span className="text-xs font-bold uppercase text-slate-400">{label}</span><button onClick={()=>set('*')} className="text-[10px] text-blue-500">All</button></div>
       <div className="grid grid-cols-6 gap-1">
          {Array.from({length: max}).map((_, i) => (
             <button key={i} onClick={()=>set(val===i.toString()?'*':i.toString())} className={`h-6 rounded text-[10px] font-bold ${val===i.toString()?'bg-blue-600 text-white':'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800'}`}>{i}</button>
          ))}
       </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
       <div className="bg-slate-900 text-white p-10 rounded-3xl text-center mb-8 shadow-xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-2">Cron Expression</p>
          <h1 className="text-6xl font-mono font-black tracking-widest mb-6">{cron.min} {cron.hour} {cron.dom} {cron.month} {cron.dow}</h1>
          <p className="text-emerald-400 font-bold text-sm">Running every {cron.min==='*'?'minute':`minute ${cron.min}`} {cron.hour==='*'?'of every hour':`past hour ${cron.hour}`}</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Grid label="Minute" max={60} val={cron.min} set={v=>setCron({...cron, min: v})} />
          <Grid label="Hour" max={24} val={cron.hour} set={v=>setCron({...cron, hour: v})} />
          <Grid label="Day of Month" max={31} val={cron.dom} set={v=>setCron({...cron, dom: v})} />
          <Grid label="Month" max={12} val={cron.month} set={v=>setCron({...cron, month: v})} />
       </div>
    </div>
  );
};