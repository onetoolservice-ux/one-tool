"use client";
import React, { useState, useMemo } from 'react';
import { Copy, Check, Hash, Droplet, Sun, Palette, Layers } from 'lucide-react';
import { RgbaStringColorPicker } from "react-colorful";
import { colord, extend } from "colord";
import cmykPlugin from "colord/plugins/cmyk";
import harmoniesPlugin from "colord/plugins/harmonies";
import mixPlugin from "colord/plugins/mix";

// Extend colord with necessary plugins
extend([cmykPlugin, harmoniesPlugin, mixPlugin]);

// --- HELPER COMPONENT FOR VALUE DISPLAY ---
const ValueRow = ({ label, value, icon: Icon, onCopy }: any) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy();
  };
  return (
    <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Icon size={12}/> {label}</p>
          <p className="font-mono font-bold text-sm text-slate-900 dark:text-white truncate pr-4 select-all">{value}</p>
       </div>
       <button onClick={handleCopy} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
          {copied ? <Check size={18} className="text-[#638c80]"/> : <Copy size={18}/>}
       </button>
    </div>
  );
};

// --- SWATCH COMPONENT ---
const Swatch = ({ color, onClick }: { color: string, onClick: (c:string) => void }) => (
  <button 
    onClick={() => onClick(color)}
    className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-transform relative group overflow-hidden"
    style={{ backgroundColor: color }}
  >
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
  </button>
);

export const ColorStudio = () => {
  // Initialize with RGBA string for full control including alpha
  const [color, setColor] = useState("rgba(99, 102, 241, 1)");
  const [copyFeedback, setCopyFeedback] = useState("");

  // --- COLOR CALCULATIONS (Memoized for performance) ---
  const colorData = useMemo(() => {
    const c = colord(color);
    const rgba = c.toRgb();
    const hsl = c.toHsl();
    const cmyk = c.toCmyk();

    // Manual HSV Calc (since plugin is acting up)
    // This avoids the import error completely
    const r = rgba.r / 255;
    const g = rgba.g / 255;
    const b = rgba.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Generate Tints and Shades scale
    const scale = [];
    for (let i = 0; i <= 10; i++) {
        // Mix with white for tints, black for shades
        const target = i < 5 ? '#ffffff' : '#000000';
        const ratio = i < 5 ? (5-i)/5 : (i-5)/5;
        scale.push(colord(color).mix(target, ratio).toHex());
    }

    return {
      hex: c.toHex().toUpperCase(),
      rgb: c.toRgbString(),
      hsl: c.toHslString(),
      hsv: `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      isDark: c.isDark(),
      harmonies: {
        comp: c.harmonies("complementary").map(x => x.toHex()),
        analog: c.harmonies("analogous").map(x => x.toHex()),
        triad: c.harmonies("triadic").map(x => x.toHex()),
      },
      scale: scale
    };
  }, [color]);

  const triggerFeedback = (msg: string) => {
      setCopyFeedback(msg);
      setTimeout(() => setCopyFeedback(""), 2000);
  };

  // React-colorful custom styling wrapper
  const pickerStyles = {
    ".react-colorful": { width: "100%", height: "300px" },
    ".react-colorful__saturation": { borderRadius: "1rem 1rem 0 0", marginBottom: "2px" },
    ".react-colorful__hue": { height: "24px", borderRadius: "0" },
    ".react-colorful__alpha": { height: "24px", borderRadius: "0 0 1rem 1rem", marginTop: "2px" },
    ".react-colorful__pointer": { width: "24px", height: "24px", border: "3px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar p-4 md:p-8 bg-slate-50 dark:bg-[#0B1120]">
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
      
      {/* --- LEFT COLUMN: PICKER & PREVIEW (5 cols) --- */}
      <div className="lg:col-span-5 space-y-6">
         
         {/* Main Picker Card */}
         <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
            <style>{Object.entries(pickerStyles).map(([k,v]) => `${k} { ${Object.entries(v).map(([pk,pv]) => `${pk}:${pv}`).join(';')} }`).join(' ')}</style>
            <RgbaStringColorPicker color={color} onChange={setColor} />
         </div>

         {/* Contrast Preview */}
         <div className="grid grid-cols-2 gap-4">
            <div className="h-24 rounded-2xl flex items-center justify-center font-bold text-lg border border-slate-200 dark:border-slate-800 transition-colors" style={{ backgroundColor: color, color: 'white' }}>
               White Text
            </div>
            <div className="h-24 rounded-2xl flex items-center justify-center font-bold text-lg border border-slate-200 dark:border-slate-800 transition-colors" style={{ backgroundColor: color, color: 'black' }}>
               Black Text
            </div>
         </div>

         {/* Tints & Shades Scale */}
         <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Layers size={14}/> Tints & Shades Scale</h3>
            <div className="grid grid-cols-11 gap-1 h-12 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
               {colorData.scale.map((c, i) => (
                  <button 
                    key={i} 
                    onClick={() => setColor(colord(c).toRgbString())} 
                    className="h-full w-full hover:scale-110 transition-transform relative z-0 hover:z-10 hover:rounded hover:shadow-md" 
                    style={{backgroundColor: c}} 
                    title={c}
                  />
               ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold px-1">
               <span>Light (Tint)</span>
               <span>Base</span>
               <span>Dark (Shade)</span>
            </div>
         </div>
      </div>

      {/* --- RIGHT COLUMN: VALUES & HARMONIES (7 cols) --- */}
      <div className="lg:col-span-7 space-y-6">
         
         {/* Value Readouts */}
         <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 relative">
            {copyFeedback && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#638c80] text-white text-xs font-bold px-3 py-1 rounded-full animate-in fade-in slide-in-from-bottom-2">Copied to clipboard!</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <ValueRow label="HEX" value={colorData.hex} icon={Hash} onCopy={()=>triggerFeedback('HEX')} />
               <ValueRow label="RGB / RGBA" value={colorData.rgb} icon={Droplet} onCopy={()=>triggerFeedback('RGB')} />
               <ValueRow label="HSL / HSLA" value={colorData.hsl} icon={Sun} onCopy={()=>triggerFeedback('HSL')} />
               <ValueRow label="HSV / HSB" value={colorData.hsv} icon={Layers} onCopy={()=>triggerFeedback('HSV')} />
               <ValueRow label="CMYK (Print)" value={colorData.cmyk} icon={Palette} onCopy={()=>triggerFeedback('CMYK')} />
            </div>
         </div>

         {/* Harmonies */}
         <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">Complementary</h3>
               <div className="grid grid-cols-2 gap-2">
                  {colorData.harmonies.comp.map(c => <Swatch key={c} color={c} onClick={setColor}/>)}
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div>
                   <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">Analogous</h3>
                   <div className="grid grid-cols-3 gap-2">
                      {colorData.harmonies.analog.map(c => <Swatch key={c} color={c} onClick={setColor}/>)}
                   </div>
                </div>
                <div>
                   <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">Triadic</h3>
                   <div className="grid grid-cols-3 gap-2">
                      {colorData.harmonies.triad.map(c => <Swatch key={c} color={c} onClick={setColor}/>)}
                   </div>
                </div>
            </div>
         </div>

      </div>
    </div>
    </div>
  );
};
