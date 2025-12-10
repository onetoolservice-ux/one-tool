"use client";
import React, { useState } from 'react';
import { Scale, Activity, Info, RefreshCw } from 'lucide-react';

export const SmartBMI = () => {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
  const val = parseFloat(bmi);
  
  let status = "Healthy";
  let color = "text-emerald-500";
  let bg = "bg-emerald-500";
  let advice = "Great job! Keep maintaining your balanced lifestyle.";
  
  if (val < 18.5) { status = "Underweight"; color = "text-blue-500"; bg = "bg-blue-500"; advice = "Consider a nutrient-rich diet to gain healthy mass."; }
  else if (val >= 25 && val < 30) { status = "Overweight"; color = "text-orange-500"; bg = "bg-orange-500"; advice = "Regular exercise and portion control can help."; }
  else if (val >= 30) { status = "Obese"; color = "text-rose-500"; bg = "bg-rose-500"; advice = "Please consult a healthcare provider for a plan."; }

  // Gauge Position (15 to 40 scale)
  const percent = Math.min(100, Math.max(0, ((val - 15) / 25) * 100));

  return (
    <div className="max-w-2xl mx-auto p-6">
       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl"><Scale size={24}/></div>
             <h1 className="text-2xl font-black text-slate-900 dark:text-white">Body Mass Index</h1>
          </div>

          <div className="flex gap-8 mb-12">
             <div className="flex-1 space-y-6">
                <div>
                   <div className="flex justify-between mb-2"><label className="text-xs font-bold uppercase text-slate-400">Height</label><span className="font-bold">{height} cm</span></div>
                   <input type="range" min="120" max="220" value={height} onChange={e=>setHeight(+e.target.value)} className="w-full accent-teal-600"/>
                </div>
                <div>
                   <div className="flex justify-between mb-2"><label className="text-xs font-bold uppercase text-slate-400">Weight</label><span className="font-bold">{weight} kg</span></div>
                   <input type="range" min="40" max="150" value={weight} onChange={e=>setWeight(+e.target.value)} className="w-full accent-teal-600"/>
                </div>
             </div>

             <div className="w-48 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Your BMI</p>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white">{bmi}</h2>
                <span className={`text-xs font-bold uppercase mt-2 px-3 py-1 rounded-full bg-white dark:bg-black shadow-sm ${color}`}>{status}</span>
             </div>
          </div>

          {/* GAUGE */}
          <div className="relative h-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
             <div className="absolute top-0 bottom-0 left-0 w-[14%] bg-blue-400 opacity-50"></div>
             <div className="absolute top-0 bottom-0 left-[14%] w-[26%] bg-emerald-400 opacity-50"></div>
             <div className="absolute top-0 bottom-0 left-[40%] w-[20%] bg-orange-400 opacity-50"></div>
             <div className="absolute top-0 bottom-0 right-0 w-[40%] bg-rose-400 opacity-50"></div>
             
             {/* Marker */}
             <div className="absolute top-0 bottom-0 w-1.5 bg-slate-900 dark:bg-white shadow-xl transition-all duration-500 z-10" style={{ left: `${percent}%` }}></div>
          </div>

          <div className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
             <Info className="text-slate-400 shrink-0" size={20}/>
             <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{advice}</p>
          </div>
       </div>
    </div>
  );
};