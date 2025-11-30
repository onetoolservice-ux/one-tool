"use client";
import React, { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function ContrastChecker() {
  const [fg, setFg] = useState("#FFFFFF");
  const [bg, setBg] = useState("#4F46E5"); // Indigo-600

  // Simple luminance calc
  const getLum = (hex: string) => {
    const rgb = parseInt(hex.substring(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = ((rgb >> 0) & 0xff) / 255;
    const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const ratio = (getLum(fg) + 0.05) / (getLum(bg) + 0.05);
  const score = ratio < 1 ? 1 / ratio : ratio;
  const rating = score.toFixed(2);
  const isAA = score >= 4.5;
  const isAAA = score >= 7;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contrast Checker</h1>
        <p className="text-slate-500">Check WCAG accessibility scores.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         {/* Controls */}
         <div className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Text Color</label>
               <div className="flex gap-3 items-center">
                  <input type="color" value={fg} onChange={e=>setFg(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                  <input type="text" value={fg} onChange={e=>setFg(e.target.value)} className="w-24 p-2 font-mono border rounded-lg bg-transparent" />
               </div>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Background</label>
               <div className="flex gap-3 items-center">
                  <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                  <input type="text" value={bg} onChange={e=>setBg(e.target.value)} className="w-24 p-2 font-mono border rounded-lg bg-transparent" />
               </div>
            </div>
         </div>

         {/* Preview */}
         <div className="md:col-span-2 space-y-6">
            <div className="h-40 rounded-2xl flex flex-col items-center justify-center shadow-inner transition-colors duration-300" style={{ backgroundColor: bg, color: fg }}>
               <h2 className="text-3xl font-bold">Good Design is Accessible</h2>
               <p className="mt-2 opacity-90">This is how your text looks.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl text-center">
                  <div className="text-xs font-bold text-slate-500 uppercase">Contrast Ratio</div>
                  <div className="text-4xl font-black text-slate-800 dark:text-slate-200">{rating}</div>
               </div>
               <div className={`p-4 rounded-xl text-center border-2 ${isAA ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                  <div className="text-xs font-bold uppercase mb-1">AA Normal</div>
                  <div className="flex items-center justify-center gap-2 font-bold text-xl">{isAA ? <><CheckCircle2/> Pass</> : <><XCircle/> Fail</>}</div>
               </div>
               <div className={`p-4 rounded-xl text-center border-2 ${isAAA ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                  <div className="text-xs font-bold uppercase mb-1">AAA Strict</div>
                  <div className="flex items-center justify-center gap-2 font-bold text-xl">{isAAA ? <><CheckCircle2/> Pass</> : <><XCircle/> Fail</>}</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
