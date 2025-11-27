"use client";

import React, { useState, useMemo } from "react";
import { Activity, RefreshCw, Info } from "lucide-react";

export default function BMICalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [height, setHeight] = useState(""); // cm or ft
  const [inches, setInches] = useState(""); // for imperial
  const [weight, setWeight] = useState(""); // kg or lbs

  const bmi = useMemo(() => {
    if (!height || !weight) return null;
    let h = parseFloat(height);
    let w = parseFloat(weight);
    
    if (unit === "imperial") {
      // Convert height to inches (ft * 12 + in)
      const hInches = (h * 12) + (parseFloat(inches) || 0);
      // BMI = (lbs / in^2) * 703
      return (w / (hInches * hInches)) * 703;
    } else {
      // Metric: kg / m^2
      h = h / 100; // cm to m
      return w / (h * h);
    }
  }, [height, inches, weight, unit]);

  const category = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500", bg: "bg-blue-500" };
    if (bmi < 25) return { label: "Normal Weight", color: "text-emerald-500", bg: "bg-emerald-500" };
    if (bmi < 30) return { label: "Overweight", color: "text-amber-500", bg: "bg-amber-500" };
    return { label: "Obese", color: "text-rose-500", bg: "bg-rose-500" };
  }, [bmi]);

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-4">
          <Activity size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">BMI Calculator</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setUnit("metric"); setHeight(""); setWeight(""); }} 
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${unit === "metric" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Metric (cm/kg)
          </button>
          <button 
            onClick={() => { setUnit("imperial"); setHeight(""); setWeight(""); }} 
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${unit === "imperial" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Imperial (ft/lbs)
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Height Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Height</label>
            {unit === "metric" ? (
              <div className="relative">
                <input type="number" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} className="w-full text-lg font-semibold p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">cm</span>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input type="number" placeholder="5" value={height} onChange={e => setHeight(e.target.value)} className="w-full text-lg font-semibold p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">ft</span>
                </div>
                <div className="relative flex-1">
                  <input type="number" placeholder="10" value={inches} onChange={e => setInches(e.target.value)} className="w-full text-lg font-semibold p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">in</span>
                </div>
              </div>
            )}
          </div>

          {/* Weight Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weight</label>
            <div className="relative">
              <input type="number" placeholder={unit === "metric" ? "70" : "150"} value={weight} onChange={e => setWeight(e.target.value)} className="w-full text-lg font-semibold p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{unit === "metric" ? "kg" : "lbs"}</span>
            </div>
          </div>

          {/* Result Card */}
          <div className={`mt-8 p-6 rounded-2xl transition-all duration-500 ${bmi ? 'bg-slate-900 text-white translate-y-0 opacity-100' : 'bg-slate-100 text-slate-400 translate-y-4 opacity-50'}`}>
            <div className="text-center">
              <div className="text-sm font-medium opacity-70 uppercase tracking-widest mb-1">Your BMI</div>
              <div className="text-5xl font-bold mb-2">{bmi ? bmi.toFixed(1) : "--.-"}</div>
              {category && (
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white ${category.color}`}>
                  {category.label}
                </div>
              )}
            </div>
            
            {/* Visual Bar */}
            {bmi && (
              <div className="mt-6">
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-400 flex-1 opacity-50"></div>
                  <div className="h-full bg-emerald-400 flex-1"></div>
                  <div className="h-full bg-amber-400 flex-1 opacity-50"></div>
                  <div className="h-full bg-rose-400 flex-1 opacity-50"></div>
                </div>
                {/* Needle */}
                <div className="relative h-3 mt-1">
                   <div 
                     className="absolute top-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white transition-all duration-700"
                     style={{ left: `${Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))}%`, transform: 'translateX(-50%)' }}
                   ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
