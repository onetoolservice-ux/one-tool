"use client";
import React, { useEffect, useMemo, useState } from "react";
import { 
  ArrowRightLeft, Copy, History, Star, Check, Settings, Maximize2,
  Ruler, Scale, Clock, Thermometer, Box, Activity, HardDrive, Coins, ChevronRight
} from "lucide-react";

// --- DATA ---
type CategoryKey = "length" | "mass" | "time" | "temp" | "area" | "volume" | "speed" | "data" | "currency";

const CATEGORIES: { key: CategoryKey; label: string; icon: any; color: string }[] = [
  { key: "length", label: "Length", icon: Ruler, color: "text-blue-500" },
  { key: "mass", label: "Mass", icon: Scale, color: "text-[#638c80]" },
  { key: "time", label: "Time", icon: Clock, color: "text-amber-500" },
  { key: "temp", label: "Temperature", icon: Thermometer, color: "text-rose-500" },
  { key: "area", label: "Area", icon: Box, color: "text-indigo-500" },
  { key: "volume", label: "Volume", icon: Box, color: "text-cyan-500" },
  { key: "speed", label: "Speed", icon: Activity, color: "text-violet-500" },
  { key: "data", label: "Data", icon: HardDrive, color: "text-slate-500" },
  { key: "currency", label: "Currency", icon: Coins, color: "text-yellow-500" },
];

const UNITS: Record<CategoryKey, { key: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]> = {
  length: [
    { key: "m", label: "Meter (m)", toBase: (v) => v, fromBase: (v) => v },
    { key: "km", label: "Kilometer (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { key: "cm", label: "Centimeter (cm)", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { key: "mm", label: "Millimeter (mm)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { key: "ft", label: "Foot (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { key: "in", label: "Inch (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { key: "mi", label: "Mile (mi)", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  ],
  mass: [
    { key: "kg", label: "Kilogram (kg)", toBase: (v) => v, fromBase: (v) => v },
    { key: "g", label: "Gram (g)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { key: "lb", label: "Pound (lb)", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { key: "oz", label: "Ounce (oz)", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
  ],
  time: [
    { key: "s", label: "Second (s)", toBase: (v) => v, fromBase: (v) => v },
    { key: "min", label: "Minute (min)", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
    { key: "h", label: "Hour (h)", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    { key: "day", label: "Day", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
  ],
  temp: [
    { key: "c", label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
    { key: "f", label: "Fahrenheit (°F)", toBase: (v) => v, fromBase: (v) => v },
    { key: "k", label: "Kelvin (K)", toBase: (v) => v, fromBase: (v) => v },
  ],
  area: [
    { key: "m2", label: "Sq Meter", toBase: (v) => v, fromBase: (v) => v },
    { key: "ft2", label: "Sq Foot", toBase: (v) => v * 0.0929, fromBase: (v) => v / 0.0929 },
    { key: "ac", label: "Acre", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
  ],
  volume: [
    { key: "l", label: "Liter (L)", toBase: (v) => v, fromBase: (v) => v },
    { key: "ml", label: "Milliliter (mL)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { key: "gal", label: "Gallon (US)", toBase: (v) => v * 3.785, fromBase: (v) => v / 3.785 },
  ],
  speed: [
    { key: "mps", label: "m/s", toBase: (v) => v, fromBase: (v) => v },
    { key: "kph", label: "km/h", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { key: "mph", label: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
  ],
  data: [
    { key: "B", label: "Byte", toBase: (v) => v, fromBase: (v) => v },
    { key: "KB", label: "Kilobyte", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
    { key: "MB", label: "Megabyte", toBase: (v) => v * 1024**2, fromBase: (v) => v / 1024**2 },
    { key: "GB", label: "Gigabyte", toBase: (v) => v * 1024**3, fromBase: (v) => v / 1024**3 },
  ],
  currency: [
    { key: "USD", label: "USD", toBase: (v)=>v, fromBase:(v)=>v },
    { key: "INR", label: "INR", toBase: (v)=>v/83.5, fromBase:(v)=>v*83.5 }, 
    { key: "EUR", label: "EUR", toBase: (v)=>v*1.08, fromBase:(v)=>v/1.08 },
  ],
};

function formatNumber(v: number) {
  if (!isFinite(v)) return "—";
  if (Math.abs(v) >= 1e9 || (Math.abs(v) < 1e-4 && v !== 0)) return v.toExponential(4);
  return Number(v.toFixed(4)).toString();
}

export function UnitConverter() {
  const [category, setCategory] = useState<CategoryKey>("length");
  const units = UNITS[category];
  const [unitQuery, setUnitQuery] = useState("");
  
  const [fromUnit, setFromUnit] = useState(units[0].key);
  const [toUnit, setToUnit] = useState(units[1]?.key || units[0].key);
  const [input, setInput] = useState("1");
  const [isHovered, setIsHovered] = useState(""); 
  
  const [history, setHistory] = useState<{ id: string; cat: CategoryKey; from: string; to: string; in: string; out: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const u = UNITS[category];
    setFromUnit(u[0].key);
    setToUnit(u[1]?.key || u[0].key);
    setUnitQuery("");
    setInput("1");
  }, [category]);

  const output = useMemo(() => {
    const raw = parseFloat(input);
    if (isNaN(raw)) return NaN;
    if (category === "temp") {
      let c = raw;
      if (fromUnit === "f") c = (raw - 32) * 5/9;
      if (fromUnit === "k") c = raw - 273.15;
      if (toUnit === "c") return c;
      if (toUnit === "f") return c * 9/5 + 32;
      if (toUnit === "k") return c + 273.15;
      return c;
    }
    const from = UNITS[category].find(u => u.key === fromUnit);
    const to = UNITS[category].find(u => u.key === toUnit);
    if (!from || !to) return NaN;
    return to.fromBase(from.toBase(raw));
  }, [input, fromUnit, toUnit, category]);

  useEffect(() => {
     if(isNaN(output)) return;
     const item = { id: Date.now().toString(), cat: category, from: fromUnit, to: toUnit, in: input, out: formatNumber(output) };
     setHistory(prev => [item, ...prev].slice(0, 5));
  }, [output]);

  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

  const copyResult = () => {
    navigator.clipboard.writeText(`${formatNumber(output)} ${toUnit}`);
    setToast("Copied!");
    setTimeout(() => setToast(null), 1500);
  };

  const filteredUnits = units.filter(u => u.label.toLowerCase().includes(unitQuery.toLowerCase()));

  return (
    <div className="h-[calc(100vh-80px)] bg-[#F5F7FA] dark:bg-[#0f1115] p-4 md:p-6 font-sans text-[#111827] dark:text-slate-200 overflow-hidden">
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden grid grid-cols-12 border border-slate-200 dark:border-slate-800 h-full">
        
        <aside className="col-span-4 md:col-span-3 p-6 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Category</div>
            <div className="space-y-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`
                  group flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-all 
                  ${c.key === category 
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}
                `}
              >
                <c.icon size={18} className={c.key === category ? c.color : "text-slate-400"} />
                <span className="text-sm">{c.label}</span>
                {c.key === category && <ChevronRight size={14} className="ml-auto text-slate-400"/>}
              </button>
            ))}
            </div>
          </div>
        </aside>

        <main className="col-span-8 md:col-span-9 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   {CATEGORIES.find((c) => c.key === category)?.label} Converter
                </h2>
             </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                <div className="col-span-5 space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1">Input</label>
                   <div className="flex gap-2">
                      <input
                        type="number"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-1/2 p-3 text-lg font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right"
                      />
                      <select
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value)}
                        className="w-1/2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none cursor-pointer"
                      >
                        {filteredUnits.map((u) => (
                          <option key={u.key} value={u.key}>{u.label}</option>
                        ))}
                      </select>
                   </div>
                </div>

                <div className="col-span-2 flex justify-center pt-6">
                   <button onClick={swap} className="p-3 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-500 shadow-sm transition-all active:scale-90">
                      <ArrowRightLeft size={18} />
                   </button>
                </div>

                <div className="col-span-5 space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1">Result</label>
                   <div className="flex gap-2">
                      <div className="w-1/2 p-3 text-lg font-bold bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl text-indigo-700 dark:text-indigo-300 text-right truncate">
                         {formatNumber(output)}
                      </div>
                      <select
                        value={toUnit}
                        onChange={(e) => setToUnit(e.target.value)}
                        className="w-1/2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none cursor-pointer"
                      >
                        {filteredUnits.map((u) => (
                          <option key={u.key} value={u.key}>{u.label}</option>
                        ))}
                      </select>
                   </div>
                </div>

             </div>

             <div className="flex justify-end gap-3 mt-6">
                <button onClick={copyResult} className="px-6 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                   <Copy size={14}/> Copy Result
                </button>
             </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <div className="font-bold mb-2">Pro Tips</div>
            <ul className="list-disc ml-5 space-y-1 text-xs">
              <li>Exchange rates for currency are approximate estimates.</li>
              <li>Use scientific notation (e.g., 1e3) for large numbers.</li>
            </ul>
          </div>
        </main>
      </div>
      
      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
           <Check size={18} className="text-[#638c80]" />
           <span className="text-sm font-bold">{toast}</span>
        </div>
      )}
    </div>
  );
}
