"use client";
import React, { useState, useMemo } from "react";
import { Calculator, CheckCircle, AlertTriangle, Sparkles, X } from "lucide-react";
import Toast, { showToast } from "../../../shared/Toast";

export default function SmartBMI() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");

  const { bmi, category, color, width } = useMemo(() => {
    let bmiVal = unit === "metric" ? weight / ((height / 100) ** 2) : (weight / (height ** 2)) * 703;
    bmiVal = parseFloat(bmiVal.toFixed(1));
    let cat = "Normal", col = "text-emerald-500", w = "50%";
    if (bmiVal < 18.5) { cat = "Underweight"; col = "text-blue-500"; w = "15%"; }
    else if (bmiVal < 25) { cat = "Healthy"; col = "text-emerald-500"; w = "40%"; }
    else if (bmiVal < 30) { cat = "Overweight"; col = "text-orange-500"; w = "70%"; }
    else { cat = "Obese"; col = "text-rose-500"; w = "90%"; }
    return { bmi: bmiVal, category: cat, color: col, width: w };
  }, [weight, height, unit]);

  const handleAi = () => {
    const nums = aiText.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    if(nums.length >= 2) {
       if (aiText.includes("ft") || aiText.includes("lbs")) {
          setUnit("imperial");
          setHeight(Math.max(...nums.filter(n=>n<100))); // Guess height (inches)
          setWeight(Math.max(...nums)); // Guess weight
       } else {
          setUnit("metric");
          setHeight(Math.max(...nums)); // Guess height (cm)
          setWeight(Math.min(...nums)); // Guess weight (kg)
       }
       setIsAiOpen(false);
       showToast("✨ Metrics Auto-Set!");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-surface dark:bg-slate-950/50 font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-600 text-white  "><Calculator size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-50 dark:text-slate-100">Smart BMI</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Health Gauge</p></div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsAiOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface text-teal-600 dark:text-teal-400 border border-teal-200 rounded-lg text-xs font-bold hover:bg-teal-50 transition shadow-lg shadow-slate-200/50 dark:shadow-none"><Sparkles size={14}/> Smart Fill</button>
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={()=>{setUnit("metric"); setWeight(70); setHeight(175);}} className={`px-3 py-1 text-xs font-bold rounded ${unit==="metric"?"bg-surface dark:bg-slate-800 dark:bg-surface shadow text-teal-600 dark:text-teal-400":"text-muted dark:text-muted dark:text-muted dark:text-muted"}`}>Metric</button>
                <button onClick={()=>{setUnit("imperial"); setWeight(150); setHeight(68);}} className={`px-3 py-1 text-xs font-bold rounded ${unit==="imperial"?"bg-surface dark:bg-slate-800 dark:bg-surface shadow text-teal-600 dark:text-teal-400":"text-muted dark:text-muted dark:text-muted dark:text-muted"}`}>Imp</button>
            </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto flex flex-col items-center">
        <div className="w-full max-w-lg space-y-8">
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border text-center relative overflow-hidden">
                <div className="text-xs font-bold text-muted/70 uppercase mb-2">Your BMI</div>
                <div className={`text-6xl font-black ${color} mb-2`}>{bmi}</div>
                <div className={`text-lg font-bold ${color} uppercase tracking-widest mb-6`}>{category}</div>
                <div className="h-4 bg-slate-100 rounded-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-300 via-emerald-400 to-rose-400 opacity-30"></div>
                    <div className="absolute top-0 bottom-0 w-2 bg-slate-800 rounded-full transition-all duration-500 shadow-lg" style={{left: width, transform: 'translateX(-50%)'}}></div>
                </div>
            </div>
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border space-y-6">
                <div><div className="flex justify-between mb-2"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Weight ({unit==="metric"?"kg":"lbs"})</label><span className="text-sm font-bold text-main dark:text-slate-100 dark:text-slate-200">{weight}</span></div><input type="range" min={unit==="metric"?30:70} max={unit==="metric"?150:350} value={weight} onChange={e=>setWeight(Number(e.target.value))} className="w-full accent-teal-600" /></div>
                <div><div className="flex justify-between mb-2"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Height ({unit==="metric"?"cm":"in"})</label><span className="text-sm font-bold text-main dark:text-slate-100 dark:text-slate-200">{height}</span></div><input type="range" min={unit==="metric"?100:40} max={unit==="metric"?220:90} value={height} onChange={e=>setHeight(Number(e.target.value))} className="w-full accent-teal-600" /></div>
            </div>
        </div>
      </div>

      {isAiOpen && (
        <div className="fixed inset-0 bg-surface/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-teal-200 animate-in zoom-in-95 relative">
                <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200 flex items-center gap-2"><Sparkles size={18} className="text-teal-600 dark:text-teal-400"/> Smart Fill</h3><button onClick={() => setIsAiOpen(false)} className="text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70"><X size={20}/></button></div>
                <textarea className="w-full h-32 border p-4 rounded-lg text-sm focus:ring-2 ring-teal-500 outline-none resize-none bg-background dark:bg-surface dark:bg-slate-950 focus:bg-surface dark:bg-slate-800 dark:bg-surface transition" placeholder="Type: '180cm 75kg' or '5ft 10in 160lbs'" value={aiText} onChange={e => setAiText(e.target.value)} autoFocus />
                <button onClick={handleAi} disabled={!aiText} className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-bold   disabled:opacity-50">Set Metrics</button>
            </div>
        </div>
      )}
    </div>
  );
}
