"use client";
import React, { useState, useEffect } from 'react';
import { Copy, Palette, Plus, Trash2, Sliders } from 'lucide-react';
import { useToast } from '@/app/components/ui/toast-system';
import { safeLocalStorage } from '@/app/lib/utils/storage';

export const ColorPicker = () => {
  const { toast } = useToast();
  const [hex, setHex] = useState("#3b82f6");
  const [saved, setSaved] = useState<string[]>([]);
  const [harmonies, setHarmonies] = useState<string[]>([]);

  useEffect(() => {
    const savedColors = safeLocalStorage.getItem<string[]>('onetool-colors', []);
    if (savedColors) setSaved(savedColors);
    generateHarmonies(hex);
  }, []);

  useEffect(() => {
    generateHarmonies(hex);
  }, [hex]);

  const saveColor = () => {
    if (!saved.includes(hex)) {
      const newSaved = [hex, ...saved].slice(0, 10);
      setSaved(newSaved);
      safeLocalStorage.setItem('onetool-colors', newSaved);
      toast("Color saved to palette", "success");
    }
  };

  const deleteColor = (c: string) => {
    const newSaved = saved.filter(x => x !== c);
    setSaved(newSaved);
    safeLocalStorage.setItem('onetool-colors', newSaved);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast(`Copied ${txt}`, "success");
  };

  // --- COLOR MATH HELPERS ---
  const hexToRgb = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const generateHarmonies = (h: string) => {
    const { r, g, b } = hexToRgb(h);
    // Complementary (Invert)
    const comp = rgbToHex(255 - r, 255 - g, 255 - b);
    // Analagous (Shift G/B)
    const ana1 = rgbToHex(r, b, g); // Simple swap for demo variance
    const ana2 = rgbToHex(g, r, b);
    
    setHarmonies([h, comp, ana1, ana2]);
  };

  const { r, g, b } = hexToRgb(hex);

  return (
    <div className="max-w-5xl mx-auto p-8 h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-12">
       
       {/* MAIN PICKER */}
       <div className="flex-1 space-y-8">
          <div className="aspect-video rounded-[3rem] shadow-2xl overflow-hidden relative group border-4 border-white dark:border-slate-800">
             <input type="color" value={hex} onChange={e=>setHex(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair"/>
             <div className="w-full h-full transition-colors duration-200" style={{ backgroundColor: hex }}></div>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/20 text-white px-6 py-2 rounded-full font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">Click to Change</div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl flex justify-between items-center">
                <div><p className="text-xs text-slate-400 font-bold">HEX</p><p className="font-mono font-bold">{hex}</p></div>
                <button onClick={()=>copy(hex)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Copy size={16}/></button>
             </div>
             <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl flex justify-between items-center">
                <div><p className="text-xs text-slate-400 font-bold">RGB</p><p className="font-mono font-bold text-sm">{r}, {g}, {b}</p></div>
                <button onClick={()=>copy(`rgb(${r},${g},${b})`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Copy size={16}/></button>
             </div>
          </div>

          <button onClick={saveColor} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
             <Plus size={18}/> Save to Palette
          </button>
       </div>

       {/* SIDEBAR: PALETTES */}
       <div className="w-full lg:w-80 space-y-8">
          
          {/* HARMONY */}
          <div className="bg-white dark:bg-slate-900 border rounded-3xl p-6">
             <h3 className="font-bold text-slate-500 uppercase text-xs mb-4 flex items-center gap-2"><Sliders size={14}/> Auto-Harmony</h3>
             <div className="grid grid-cols-4 gap-2 h-16">
                {harmonies.map((c, i) => (
                   <div key={i} className="h-full rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-sm" style={{backgroundColor: c}} onClick={()=>setHex(c)} title={c}></div>
                ))}
             </div>
          </div>

          {/* SAVED */}
          <div className="bg-white dark:bg-slate-900 border rounded-3xl p-6 flex-1">
             <h3 className="font-bold text-slate-500 uppercase text-xs mb-4 flex items-center gap-2"><Palette size={14}/> My Palette</h3>
             {saved.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No colors saved yet.</div>
             ) : (
                <div className="space-y-3">
                   {saved.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl group transition-colors">
                         <div className="w-10 h-10 rounded-lg shadow-sm cursor-pointer" style={{backgroundColor: c}} onClick={()=>setHex(c)}></div>
                         <span className="font-mono text-xs font-bold flex-1">{c}</span>
                         <button onClick={()=>deleteColor(c)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                      </div>
                   ))}
                </div>
             )}
          </div>

       </div>
    </div>
  );
};