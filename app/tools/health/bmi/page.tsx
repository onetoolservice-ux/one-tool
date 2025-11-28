"use client";
import React, { useState, useMemo } from "react";
import { Activity, Ruler, Weight } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function BMICalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [height, setHeight] = useState(""); 
  const [weight, setWeight] = useState(""); 

  const bmi = useMemo(() => {
    if (!height || !weight) return null;
    let h = parseFloat(height);
    let w = parseFloat(weight);
    if (unit === "imperial") return (w / (h * h)) * 703;
    else return w / ((h/100) * (h/100));
  }, [height, weight, unit]);

  const status = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600", bg: "bg-blue-50" };
    if (bmi < 25) return { label: "Healthy", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (bmi < 30) return { label: "Overweight", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "Obese", color: "text-rose-600", bg: "bg-rose-50" };
  }, [bmi]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <ToolHeader title="BMI Calculator" desc="Health Index" icon={<Activity size={18}/>}>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button onClick={()=>setUnit("metric")} className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${unit==='metric'?'bg-white shadow text-slate-900':'text-slate-400'}`}>Metric</button>
          <button onClick={()=>setUnit("imperial")} className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${unit==='imperial'?'bg-white shadow text-slate-900':'text-slate-400'}`}>Imperial</button>
        </div>
      </ToolHeader>
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
             <div><label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Height ({unit==='metric'?'cm':'in'})</label><div className="relative"><input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-emerald-500 outline-none" /><Ruler className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/></div></div>
             <div><label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Weight ({unit==='metric'?'kg':'lbs'})</label><div className="relative"><input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-emerald-500 outline-none" /><Weight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/></div></div>
          </div>
          {bmi && (
            <div className={`p-6 rounded-xl text-center ${status?.bg}`}>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your BMI</div>
              <div className={`text-5xl font-black ${status?.color} my-2`}>{bmi.toFixed(1)}</div>
              <div className={`text-sm font-bold uppercase ${status?.color}`}>{status?.label}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
