"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Scale } from "lucide-react";

const UNITS: any = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, inch: 0.0254, mile: 1609.34 },
  Weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 },
  Time: { s: 1, min: 60, h: 3600, day: 86400 }
};

export default function UnitConverter() {
  const [category, setCategory] = useState("Length");
  const [inputVal, setInputVal] = useState(1);
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");

  const convert = () => {
    const base = inputVal * UNITS[category][fromUnit]; // Convert to base unit (e.g., meters)
    return (base / UNITS[category][toUnit]); // Convert to target
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const keys = Object.keys(UNITS[cat]);
    setFromUnit(keys[0]);
    setToUnit(keys[1]);
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-orange-50 text-orange-600 rounded-xl mb-4">
          <Scale size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Unit Converter</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          {Object.keys(UNITS).map(cat => (
            <button 
              key={cat} onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${category === cat ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
          
          <div className="space-y-2">
            <input type="number" value={inputVal} onChange={e => setInputVal(Number(e.target.value))} className="w-full text-3xl font-bold p-4 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 border-2 outline-none transition-all" />
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
              {Object.keys(UNITS[category]).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="text-slate-300"><ArrowRightLeft size={24} /></div>

          <div className="space-y-2">
            <div className="w-full text-3xl font-bold p-4 bg-orange-50 text-orange-900 rounded-xl border border-orange-100 flex items-center overflow-hidden">
              {convert().toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
              {Object.keys(UNITS[category]).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}
