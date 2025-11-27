"use client";

import React, { useState } from "react";
import { Palette, CheckCircle, XCircle } from "lucide-react";

export default function ContrastChecker() {
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");

  // Calculate Luminance
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const [lr, lg, lb] = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };

  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const score = ratio.toFixed(2);

  const getRating = (val: number) => {
    if (val >= 7) return { label: "AAA (Excellent)", color: "text-emerald-600", icon: <CheckCircle/> };
    if (val >= 4.5) return { label: "AA (Good)", color: "text-teal-600", icon: <CheckCircle/> };
    if (val >= 3) return { label: "AA Large (Okay)", color: "text-amber-600", icon: <CheckCircle/> };
    return { label: "Fail", color: "text-rose-600", icon: <XCircle/> };
  };

  const rating = getRating(ratio);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-purple-50 text-purple-600 rounded-xl mb-4"><Palette size={32} /></div>
        <h1 className="text-3xl font-bold text-slate-900">Contrast Checker</h1>
        <p className="text-slate-500 mt-2">Check color accessibility ratios (WCAG).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Foreground (Text)</label>
            <div className="flex items-center gap-3 p-3 border rounded-xl">
              <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"/>
              <input type="text" value={fg} onChange={e => setFg(e.target.value)} className="font-mono text-slate-700 outline-none w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Background</label>
            <div className="flex items-center gap-3 p-3 border rounded-xl">
              <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"/>
              <input type="text" value={bg} onChange={e => setBg(e.target.value)} className="font-mono text-slate-700 outline-none w-full" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex flex-col justify-between">
          <div className="p-6 rounded-2xl text-center shadow-inner" style={{ backgroundColor: bg, color: fg }}>
            <h2 className="text-2xl font-bold mb-2">Hello World</h2>
            <p className="text-sm opacity-90">The quick brown fox jumps over the lazy dog.</p>
          </div>
          
          <div className="mt-8 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Contrast Ratio</div>
              <div className="text-4xl font-black text-slate-800">{score}</div>
            </div>
            <div className={`flex items-center gap-2 font-bold ${rating.color}`}>
              {rating.icon} {rating.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
