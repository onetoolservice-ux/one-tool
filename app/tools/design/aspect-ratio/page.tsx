"use client";
import React, { useState } from "react";
import { Ratio } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function AspectRatio() {
  const [w, setW] = useState(1920);
  const [h, setH] = useState(1080);

  const gcd = (a:number, b:number): number => b == 0 ? a : gcd(b, a % b);
  const d = gcd(w, h);
  const ratio = `${w/d}:${h/d}`;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ToolHeader title="Aspect Ratio" desc="Calculate dimensions & ratios" icon={<Ratio size={20}/>} />
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Width</label><input type="number" value={w} onChange={e=>setW(Number(e.target.value))} className="w-full p-3 border rounded-xl mt-1 text-lg font-bold"/></div>
        <div><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Height</label><input type="number" value={h} onChange={e=>setH(Number(e.target.value))} className="w-full p-3 border rounded-xl mt-1 text-lg font-bold"/></div>
      </div>
      <div className="bg-surface text-white p-8 rounded-2xl text-center">
        <div className="text-sm text-muted/70 uppercase tracking-widest mb-2">Resulting Ratio</div>
        <div className="text-6xl font-black">{ratio}</div>
      </div>
    </div>
  );
}
