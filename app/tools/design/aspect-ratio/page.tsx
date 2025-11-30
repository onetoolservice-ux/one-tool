"use client";
import React, { useState } from "react";
import { Divide } from "lucide-react";

export default function AspectRatio() {
  const [w1, setW1] = useState(1920);
  const [h1, setH1] = useState(1080);
  const [w2, setW2] = useState(1280);
  
  const h2 = Math.round((h1 / w1) * w2) || 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">Aspect Ratio</h1>
        <p className="text-muted">Calculate dimensions while keeping proportions.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-8 items-center">
        <div className="space-y-4 flex-1">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-muted uppercase mb-1 block">Original Width</label>
            <input type="number" value={w1} onChange={(e) => setW1(Number(e.target.value))} className="w-full bg-transparent text-xl font-mono font-bold outline-none" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-muted uppercase mb-1 block">Original Height</label>
            <input type="number" value={h1} onChange={(e) => setH1(Number(e.target.value))} className="w-full bg-transparent text-xl font-mono font-bold outline-none" />
          </div>
        </div>

        <div className="text-slate-300 dark:text-muted"><Divide size={32} /></div>

        <div className="space-y-4 flex-1">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <label className="text-xs font-bold text-blue-400 uppercase mb-1 block">New Width</label>
            <input type="number" value={w2} onChange={(e) => setW2(Number(e.target.value))} className="w-full bg-transparent text-xl font-mono font-bold outline-none text-blue-600 dark:text-blue-400" />
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <label className="text-xs font-bold text-emerald-500 uppercase mb-1 block">New Height</label>
            <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{h2}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
