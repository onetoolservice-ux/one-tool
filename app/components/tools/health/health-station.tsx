"use client";
import React, { useState } from 'react';
import { Activity, Heart, Wind } from 'lucide-react';

export const HealthStation = ({ toolId }: { toolId: string }) => {
  const [val, setVal] = useState({ h: 170, w: 70 });
  const bmi = (val.w / ((val.h/100) ** 2)).toFixed(1);

  if (toolId === 'smart-breath') {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-teal-50 dark:bg-teal-900/10 rounded-3xl m-4">
           <div className="w-64 h-64 rounded-full bg-teal-100 dark:bg-teal-800/30 flex items-center justify-center animate-pulse">
              <div className="text-center">
                 <Wind size={48} className="mx-auto text-teal-600 mb-2"/>
                 <h2 className="text-2xl font-bold text-teal-800 dark:text-teal-200">Breathe In</h2>
                 <p className="text-teal-600 font-bold">4 Seconds</p>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
       <Activity size={40} className="mx-auto text-rose-500 mb-4"/>
       <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">BMI Calculator</h2>
       <div className="grid grid-cols-2 gap-4 mb-6">
          <input type="number" placeholder="Height (cm)" value={val.h} onChange={e=>setVal({...val, h: +e.target.value})} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 text-center font-bold outline-none focus:border-rose-500"/>
          <input type="number" placeholder="Weight (kg)" value={val.w} onChange={e=>setVal({...val, w: +e.target.value})} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 text-center font-bold outline-none focus:border-rose-500"/>
       </div>
       <div className="p-8 bg-slate-900 text-white rounded-2xl">
          <div className="text-6xl font-black mb-2">{bmi}</div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-widest">Body Mass Index</div>
       </div>
    </div>
  );
};