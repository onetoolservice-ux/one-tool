"use client";
import React, { useState, useMemo } from "react";
import { Activity, Ruler, Weight } from "lucide-react";

export default function BMICalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [height, setHeight] = useState(""); 
  const [weight, setWeight] = useState(""); 

  const bmi = useMemo(() => {
    if (!height || !weight) return null;
    let h = parseFloat(height);
    let w = parseFloat(weight);
    if (unit === "imperial") return (w / (h * h)) * 703; // assuming input is inches
    else return w / ((h/100) * (h/100));
  }, [height, weight, unit]);

  const status = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500", bar: "bg-blue-500" };
    if (bmi < 25) return { label: "Healthy", color: "text-emerald-500", bar: "bg-emerald-500" };
    if (bmi < 30) return { label: "Overweight", color: "text-amber-500", bar: "bg-amber-500" };
    return { label: "Obese", color: "text-rose-500", bar: "bg-rose-500" };
  }, [bmi]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-slate-300 px-6 py-4 flex items-center gap-3 shadow-sm">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200"><Activity size={22}/></div>
        <div><h1 className="text-xl font-extrabold text-slate-900">BMI Calculator</h1><p className="text-sm font-medium text-slate-500 mt-1">Body Mass Index</p></div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 p-8 flex flex-col gap-8">
           <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit">
             <button onClick={() => setUnit("metric")} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${unit === "metric" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Metric (cm/kg)</button>
             <button onClick={() => setUnit("imperial")} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${unit === "imperial" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Imperial (in/lbs)</button>
           </div>
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-3 block tracking-wider">Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
             <div className="relative"><input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full pl-4 pr-12 py-4 bg-white border border-slate-300 rounded-xl text-2xl font-bold text-slate-800 focus:border-emerald-500 outline-none" /><Ruler className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/></div>
           </div>
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-3 block tracking-wider">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
             <div className="relative"><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full pl-4 pr-12 py-4 bg-white border border-slate-300 rounded-xl text-2xl font-bold text-slate-800 focus:border-emerald-500 outline-none" /><Weight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/></div>
           </div>
        </div>

        <div className="w-full lg:w-96 bg-[#1E293B] border-l border-slate-800 p-8 flex flex-col justify-center items-center text-center text-white shadow-2xl relative overflow-hidden">
          {bmi ? (
            <div className="relative z-10 animate-in zoom-in duration-500">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Your Score</div>
              <div className="text-8xl font-black tracking-tighter mb-2">{bmi.toFixed(1)}</div>
              <div className={`text-2xl font-bold ${status?.color} bg-white/10 px-6 py-2 rounded-full inline-block`}>{status?.label}</div>
            </div>
          ) : (
            <div className="text-slate-500 font-medium">Enter details to see result</div>
          )}
        </div>
      </div>
    </div>
  );
}
