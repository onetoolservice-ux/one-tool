"use client";
import React, { useState, useEffect } from 'react';
import { 
  Ruler, Weight, Clock, Thermometer, Box, Zap, Globe, Database, 
  Wifi, Utensils, Type, Star, Palette, ArrowRight, History, Settings,
  ChevronRight, Copy, Check
} from 'lucide-react';
import { useToast } from '@/app/components/ui/toast-system';

// --- DATA & LOGIC ---
const CATEGORIES: any = {
  Length: {
    icon: Ruler,
    units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, yd: 0.9144, ft: 0.3048, in: 0.0254, nm: 1852 }
  },
  Mass: {
    icon: Weight,
    units: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 1000, stone: 6.35029 }
  },
  Time: {
    icon: Clock,
    units: { s: 1, min: 60, h: 3600, day: 86400, week: 604800, mo: 2629746, yr: 31556952 }
  },
  Temperature: {
    icon: Thermometer,
    type: 'temp', // Special handling
    units: ['Celsius', 'Fahrenheit', 'Kelvin']
  },
  Area: {
    icon: Box,
    units: { m2: 1, ha: 10000, km2: 1e6, ft2: 0.092903, ac: 4046.86, mi2: 2.59e6 }
  },
  Volume: {
    icon: Box,
    units: { l: 1, ml: 0.001, m3: 1000, gal_us: 3.78541, qt_us: 0.946353, pt_us: 0.473176, cup: 0.24, fl_oz: 0.0295735 }
  },
  Speed: {
    icon: Zap,
    units: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444, mach: 343 }
  },
  Pressure: {
    icon: ArrowRight,
    units: { pa: 1, bar: 100000, psi: 6894.76, atm: 101325, torr: 133.322 }
  },
  Energy: {
    icon: Zap,
    units: { j: 1, kj: 1000, cal: 4.184, kcal: 4184, wh: 3600, kwh: 3.6e6 }
  },
  Power: {
    icon: Zap,
    units: { w: 1, kw: 1000, hp: 745.7 }
  },
  Currency: {
    icon: Globe,
    // Static fallback rates (Real app would fetch API)
    units: { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, JPY: 151.2, CAD: 1.36, AUD: 1.52, CNY: 7.23 }
  },
  'Data Size': {
    icon: Database,
    units: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 }
  },
  'Data Speed': {
    icon: Wifi,
    units: { 'bps': 1, 'Kbps': 1000, 'Mbps': 1e6, 'Gbps': 1e9 }
  },
  Cooking: {
    icon: Utensils,
    units: { tsp: 4.92892, tbsp: 14.7868, cup: 240, ml: 1, l: 1000, fl_oz: 29.5735, pint: 473.176, quart: 946.353 }
  },
  Typography: {
    icon: Type,
    type: 'typo',
    units: ['px', 'em', 'rem', 'pt', '%']
  },
  Astronomy: {
    icon: Star,
    units: { m: 1, km: 1000, AU: 1.496e11, ly: 9.461e15, pc: 3.086e16 }
  },
  Color: {
    icon: Palette,
    type: 'color',
    units: ['HEX', 'RGB']
  }
};

export const UnitConverter = () => {
  const { toast } = useToast();
  
  // State
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [inputVal, setInputVal] = useState<string>('1');
  const [baseSize, setBaseSize] = useState(16); // For Typography
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Init
  useEffect(() => {
    const { safeLocalStorage } = require('@/app/lib/utils/storage');
    const saved = safeLocalStorage.getItem<string[]>('unit-history', []);
    if (saved) setHistory(saved);
    initUnits(category);
  }, []);

  const initUnits = (cat: string) => {
    const defs = CATEGORIES[cat];
    if (defs.type === 'color') { setFromUnit('HEX'); setToUnit('RGB'); setInputVal('#3b82f6'); }
    else if (defs.type === 'temp') { setFromUnit('Celsius'); setToUnit('Fahrenheit'); }
    else if (defs.type === 'typo') { setFromUnit('px'); setToUnit('rem'); setInputVal('16'); }
    else {
      const keys = Object.keys(defs.units);
      setFromUnit(keys[0]);
      setToUnit(keys[1] || keys[0]);
    }
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    initUnits(cat);
  };

  // --- CALCULATION ENGINE ---
  const calculate = (): string => {
    const val = parseFloat(inputVal);
    if (isNaN(val) && category !== 'Color') return '---';

    const defs = CATEGORIES[category];

    // 1. TEMPERATURE
    if (defs.type === 'temp') {
       if (fromUnit === toUnit) return val.toString();
       if (fromUnit === 'Celsius') return toUnit === 'Fahrenheit' ? ((val * 9/5) + 32).toFixed(2) : (val + 273.15).toFixed(2);
       if (fromUnit === 'Fahrenheit') return toUnit === 'Celsius' ? ((val - 32) * 5/9).toFixed(2) : ((val - 32) * 5/9 + 273.15).toFixed(2);
       if (fromUnit === 'Kelvin') return toUnit === 'Celsius' ? (val - 273.15).toFixed(2) : ((val - 273.15) * 9/5 + 32).toFixed(2);
    }

    // 2. TYPOGRAPHY
    if (defs.type === 'typo') {
       if (fromUnit === toUnit) return val.toString();
       // Normalize to px first
       let px = val;
       if (fromUnit === 'em' || fromUnit === 'rem') px = val * baseSize;
       if (fromUnit === 'pt') px = val * 1.333333;
       if (fromUnit === '%') px = (val / 100) * baseSize;
       
       // Convert px to target
       if (toUnit === 'px') return px.toFixed(1);
       if (toUnit === 'em' || toUnit === 'rem') return (px / baseSize).toFixed(3);
       if (toUnit === 'pt') return (px * 0.75).toFixed(1);
       if (toUnit === '%') return ((px / baseSize) * 100).toFixed(0);
    }

    // 3. COLOR
    if (defs.type === 'color') {
       if (fromUnit === 'HEX' && toUnit === 'RGB') {
          const r = parseInt(inputVal.slice(1,3), 16);
          const g = parseInt(inputVal.slice(3,5), 16);
          const b = parseInt(inputVal.slice(5,7), 16);
          return isNaN(r) ? 'Invalid HEX' : `rgb(${r}, ${g}, ${b})`;
       }
       if (fromUnit === 'RGB' && toUnit === 'HEX') {
          // Input expected: "rgb(255, 0, 0)" or "255, 0, 0"
          const parts = inputVal.replace(/[^0-9,]/g, '').split(',');
          if (parts.length < 3) return 'Invalid RGB';
          const toHex = (n: string) => {
             const h = parseInt(n).toString(16);
             return h.length === 1 ? '0'+h : h;
          };
          return `#${toHex(parts[0])}${toHex(parts[1])}${toHex(parts[2])}`;
       }
       return inputVal;
    }

    // 4. STANDARD UNITS (Factor based)
    const factorFrom = defs.units[fromUnit];
    const factorTo = defs.units[toUnit];
    if (!factorFrom || !factorTo) return '---';
    
    // Convert to base, then to target
    const base = val * factorFrom;
    const result = base / factorTo;

    // Formatting smarts
    if (result < 0.00001) return result.toExponential(4);
    if (result > 10000) return result.toLocaleString();
    return parseFloat(result.toFixed(6)).toString();
  };

  const result = calculate();

  // Save to history on valid result
  useEffect(() => {
     if (result && result !== '---' && result !== 'Invalid HEX') {
        const entry = `${inputVal} ${fromUnit} → ${result} ${toUnit}`;
        setHistory(prev => {
           const { safeLocalStorage } = require('@/app/lib/utils/storage');
           const n = [entry, ...prev.filter(e => e !== entry)].slice(0, 5);
           safeLocalStorage.setItem('unit-history', n);
           return n;
        });
     }
  }, [result]);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast("Result copied", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const CurrentIcon = CATEGORIES[category].icon;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
      
      {/* SIDEBAR (Categories) */}
      <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
         <div className="p-4 border-b dark:border-slate-800">
            <h2 className="font-black text-xs uppercase tracking-widest text-slate-400">Categories</h2>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {Object.keys(CATEGORIES).map(cat => {
               const Icon = CATEGORIES[cat].icon;
               return (
                  <button 
                     key={cat}
                     onClick={() => handleCategory(cat)}
                     className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${category === cat ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                     <Icon size={16}/> {cat}
                  </button>
               );
            })}
         </div>
      </div>

      {/* MAIN CONVERTER */}
      <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
         <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                     {category} Conversion
                  </h1>
                  <p className="text-slate-500 mt-1">Quickly convert between units — live and precise.</p>
               </div>
               <div className="flex gap-2">
                  {category === 'Typography' && (
                     <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border rounded-lg px-3 py-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Base Size</span>
                        <input type="number" value={baseSize} onChange={e=>setBaseSize(+e.target.value)} className="w-8 font-bold bg-transparent outline-none"/>
                        <span className="text-xs text-slate-500">px</span>
                     </div>
                  )}
                  <button className="p-2 border rounded-lg hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Settings size={18} className="text-slate-400"/></button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               
               {/* CONVERSION CARD */}
               <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="space-y-8">
                     {/* FROM */}
                     <div className="relative">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">From Unit</label>
                        <div className="flex gap-4">
                           <select value={fromUnit} onChange={e=>setFromUnit(e.target.value)} className="w-1/3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-bold text-sm outline-none cursor-pointer">
                              {category === 'Color' || category === 'Temperature' || category === 'Typography' ? 
                                 CATEGORIES[category].units.map((u:string) => <option key={u} value={u}>{u}</option>) :
                                 Object.keys(CATEGORIES[category].units).map(u => <option key={u} value={u}>{u === 'gal_us' ? 'Gallon (US)' : u}</option>)
                              }
                           </select>
                           <input 
                              type={category === 'Color' ? 'text' : 'number'} 
                              value={inputVal} 
                              onChange={e=>setInputVal(e.target.value)} 
                              className="flex-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-xl p-3 font-mono text-lg outline-none transition-all"
                           />
                        </div>
                     </div>

                     <div className="flex justify-center -my-4 relative z-10">
                        <button 
                           onClick={() => { setFromUnit(toUnit); setToUnit(fromUnit); }}
                           className="p-2 bg-blue-50 text-blue-600 rounded-full border-4 border-white dark:border-slate-900 dark:bg-slate-800 hover:scale-110 transition-transform"
                        >
                           <ArrowRight size={20} className="rotate-90"/>
                        </button>
                     </div>

                     {/* TO */}
                     <div className="relative">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">To Unit</label>
                        <div className="flex gap-4">
                           <select value={toUnit} onChange={e=>setToUnit(e.target.value)} className="w-1/3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-bold text-sm outline-none cursor-pointer">
                              {category === 'Color' || category === 'Temperature' || category === 'Typography' ? 
                                 CATEGORIES[category].units.map((u:string) => <option key={u} value={u}>{u}</option>) :
                                 Object.keys(CATEGORIES[category].units).map(u => <option key={u} value={u}>{u === 'gal_us' ? 'Gallon (US)' : u}</option>)
                              }
                           </select>
                           <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex items-center justify-between">
                              <span className="font-mono text-2xl font-black text-blue-700 dark:text-blue-400 truncate">{result}</span>
                              <button onClick={copyResult} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
                                 {copied ? <Check size={18} className="text-emerald-500"/> : <Copy size={18} className="text-blue-500"/>}
                              </button>
                           </div>
                        </div>
                     </div>

                     <p className="text-xs text-slate-400">
                        Tip: type numbers or use scientific notation (e.g. 1e3)
                     </p>
                  </div>
               </div>

               {/* INFO & HISTORY */}
               <div className="space-y-6">
                  {/* UNIT LIST */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                     <h3 className="font-bold text-sm mb-4">Unit Reference</h3>
                     <div className="h-48 overflow-y-auto custom-scrollbar space-y-2">
                        {category !== 'Color' && category !== 'Temperature' && category !== 'Typography' && Object.keys(CATEGORIES[category].units).map(u => (
                           <div key={u} className="flex justify-between text-sm px-2">
                              <span className="font-mono text-slate-500">{u}</span>
                              <span className="text-slate-400 text-xs">Factor: {CATEGORIES[category].units[u]}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* HISTORY */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm">History</h3>
                        <button onClick={()=>{
                          const { safeLocalStorage } = require('@/app/lib/utils/storage');
                          setHistory([]);
                          safeLocalStorage.removeItem('unit-history');
                        }} className="text-[10px] text-rose-500 hover:underline">Clear</button>
                     </div>
                     <p className="text-xs text-slate-400 mb-4">Recent conversions (auto-saved)</p>
                     <div className="space-y-2">
                        {history.map((h, i) => (
                           <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm group">
                              <span className="truncate max-w-[200px]">{h}</span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={()=>{
                                    const parts = h.split(' ');
                                    setInputVal(parts[0]);
                                    setFromUnit(parts[1]);
                                    setToUnit(parts[3]);
                                 }} className="text-[10px] bg-white border px-2 rounded">Use</button>
                                 <button onClick={()=>navigator.clipboard.writeText(h.split('→')[1].trim())} className="text-[10px] bg-white border px-2 rounded">Copy</button>
                              </div>
                           </div>
                        ))}
                        {history.length === 0 && <div className="text-center text-xs text-slate-300 py-4">No history yet</div>}
                     </div>
                  </div>
               </div>

            </div>

            <div className="mt-12">
               <h3 className="font-bold text-slate-400 uppercase text-xs mb-4">Pro Tips</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
                     <strong className="block text-slate-700 dark:text-slate-300 mb-1">Color HEX</strong>
                     Supports short (#FFF) and standard (#FFFFFF) formats.
                  </div>
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
                     <strong className="block text-slate-700 dark:text-slate-300 mb-1">Typography</strong>
                     Change 'Base Size' to match your CSS root font-size (usually 16px).
                  </div>
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
                     <strong className="block text-slate-700 dark:text-slate-300 mb-1">Data Speed</strong>
                     Remember: 1 Byte (B) = 8 bits (b). Speeds are usually in bits (Mbps).
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};