"use client";
import React, { useState } from "react";
import { Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartCSS() {
  const [h, setH] = useState(10);
  const [v, setV] = useState(10);
  const [blur, setBlur] = useState(20);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(0.2);

  const rgba = () => {
    const r = parseInt(color.substr(1,2), 16);
    const g = parseInt(color.substr(3,2), 16);
    const b = parseInt(color.substr(5,2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const css = `box-shadow: ${h}px ${v}px ${blur}px ${spread}px ${rgba()};`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">CSS Generator</h1>
        <p className="text-slate-500">Smooth Box Shadows.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
         <div className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            {[
                {l: "Horizontal", v: h, s: setH, min:-50, max:50},
                {l: "Vertical", v: v, s: setV, min:-50, max:50},
                {l: "Blur", v: blur, s: setBlur, min:0, max:100},
                {l: "Spread", v: spread, s: setSpread, min:-50, max:50},
                {l: "Opacity", v: opacity, s: setOpacity, min:0, max:1, step:0.01}
            ].map((c: any) => (
                <div key={c.l}>
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2"><span>{c.l}</span><span>{c.v}</span></div>
                    <input type="range" min={c.min} max={c.max} step={c.step || 1} value={c.v} onChange={e=>c.s(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
            ))}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Shadow Color</label>
                <div className="flex gap-2"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer"/><input type="text" value={color} onChange={e=>setColor(e.target.value)} className="flex-1 border rounded px-3 font-mono"/></div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="aspect-square rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 transition-all duration-200" style={{boxShadow: `${h}px ${v}px ${blur}px ${spread}px ${rgba()}`}}>
                <span className="font-bold text-slate-400">Preview</span>
            </div>
            <div className="relative group cursor-pointer" onClick={() => {navigator.clipboard.writeText(css); showToast("CSS Copied!");}}>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm break-all border border-slate-700 hover:border-indigo-500 transition-colors">
                    {css}
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={16} /></div>
            </div>
         </div>
      </div>
    </div>
  );
}
