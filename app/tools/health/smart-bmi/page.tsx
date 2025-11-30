"use client";
import React, { useState, useMemo } from "react";
import { Activity } from "lucide-react";

export default function BMICalculator() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);

  const bmi = useMemo(() => {
    const hM = height / 100;
    return (weight / (hM * hM)).toFixed(1);
  }, [weight, height]);

  const category = useMemo(() => {
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (b < 25) return { label: "Normal", color: "text-emerald-500" };
    if (b < 30) return { label: "Overweight", color: "text-orange-500" };
    return { label: "Obese", color: "text-rose-500" };
  }, [bmi]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">BMI Calculator</h1>
        <p className="text-muted">Check your body mass index.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-main dark:text-slate-300 mb-2">Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono" />
          </div>
          <div>
            <label className="block text-sm font-bold text-main dark:text-slate-300 mb-2">Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono" />
          </div>
        </div>

        <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Your BMI</div>
          <div className={`text-6xl font-black mb-2 ${category.color}`}>{bmi}</div>
          <div className={`text-lg font-bold ${category.color}`}>{category.label}</div>
        </div>
      </div>
    </div>
  );
}
