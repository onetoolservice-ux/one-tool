"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { Copy, Check, Plus, Trash2, Download } from 'lucide-react';

// ─── Color Math ──────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r,g,b].map(x => Math.round(Math.max(0,Math.min(255,x))).toString(16).padStart(2,'0')).join('');
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max+min)/2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch (max) {
      case r: h = ((g-b)/d + (g<b?6:0))/6; break;
      case g: h = ((b-r)/d + 2)/6; break;
      case b: h = ((r-g)/d + 4)/6; break;
    }
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h/30) % 12;
  const a = s * Math.min(l, 1-l);
  const f = (n: number) => Math.round(255*(l - a * Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1)))));
  return [f(0), f(8), f(4)];
}
function hslToHex(h: number, s: number, l: number): string {
  const [r,g,b] = hslToRgb(h,s,l);
  return rgbToHex(r,g,b);
}
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
  let h=0;
  if (d) {
    if (max===r) h=((g-b)/d%6)/6;
    else if (max===g) h=((b-r)/d+2)/6;
    else h=((r-g)/d+4)/6;
    if (h<0) h+=1;
  }
  return [Math.round(h*360), Math.round(max?d/max*100:0), Math.round(max*100)];
}
function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (v: number) => { v/=255; return v<=0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4; };
  return 0.2126*toLinear(r)+0.7152*toLinear(g)+0.0722*toLinear(b);
}
function getContrastRatio(hex: string): { ratio: number; onWhite: number; onBlack: number; rec: 'white'|'black' } {
  const [r,g,b] = hexToRgb(hex);
  const l = getLuminance(r,g,b);
  const wRatio = (1.05)/(l+0.05);
  const bRatio = (l+0.05)/(0.05);
  return { ratio: Math.round(Math.max(wRatio,bRatio)*100)/100, onWhite: wRatio, onBlack: bRatio, rec: wRatio > bRatio ? 'white' : 'black' };
}

// ─── Harmonies ────────────────────────────────────────────────────────────────
type HarmonyType = 'complementary'|'analogous'|'triadic'|'split-complementary'|'tetradic'|'monochromatic';
interface HarmonySet { name: string; colors: string[] }

function buildHarmonies(hex: string): Record<HarmonyType, HarmonySet> {
  const [r,g,b] = hexToRgb(hex);
  const [h,s,l] = rgbToHsl(r,g,b);
  const rot = (deg: number) => hslToHex((h+deg+360)%360, s, l);
  const lum = (lDelta: number) => hslToHex(h, s, Math.max(5,Math.min(95,l+lDelta)));
  return {
    complementary:        { name: 'Complementary',         colors: [hex, rot(180)] },
    analogous:            { name: 'Analogous',              colors: [rot(-30), hex, rot(30)] },
    triadic:              { name: 'Triadic',                colors: [hex, rot(120), rot(240)] },
    'split-complementary':{ name: 'Split-Complementary',   colors: [hex, rot(150), rot(210)] },
    tetradic:             { name: 'Tetradic',               colors: [hex, rot(90), rot(180), rot(270)] },
    monochromatic:        { name: 'Monochromatic',          colors: [lum(-30), lum(-15), hex, lum(15), lum(30)] },
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
interface PaletteColor { id: number; hex: string; label: string }
let _pid = 0;

const HARMONY_TYPES: HarmonyType[] = ['complementary','analogous','triadic','split-complementary','tetradic','monochromatic'];

export const ColorPicker = () => {
  const [hex, setHex]             = useState('#3b82f6');
  const [harmonyType, setHarmony] = useState<HarmonyType>('complementary');
  const [palette, setPalette]     = useState<PaletteColor[]>([]);
  const [copied, setCopied]       = useState<string | null>(null);
  const [inputHex, setInputHex]   = useState('#3b82f6');

  // Derived values
  const [r, g, b]   = useMemo(() => hexToRgb(hex), [hex]);
  const [h, s, l]   = useMemo(() => rgbToHsl(r,g,b), [r,g,b]);
  const [, sv, v]   = useMemo(() => rgbToHsv(r,g,b), [r,g,b]);
  const contrast    = useMemo(() => getContrastRatio(hex), [hex]);
  const harmonies   = useMemo(() => buildHarmonies(hex), [hex]);
  const activeHarm  = harmonies[harmonyType];
  const textColor   = contrast.rec === 'white' ? '#ffffff' : '#000000';
  const cmyk        = useMemo(() => {
    const rn=r/255, gn=g/255, bn=b/255, k=1-Math.max(rn,gn,bn);
    if (k===1) return { c:0,m:0,y:0,k:100 };
    return { c:Math.round((1-rn-k)/(1-k)*100), m:Math.round((1-gn-k)/(1-k)*100), y:Math.round((1-bn-k)/(1-k)*100), k:Math.round(k*100) };
  }, [r,g,b]);

  const applyHex = (v: string) => {
    const cleaned = v.startsWith('#') ? v : `#${v}`;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      setHex(cleaned.toLowerCase());
      setInputHex(cleaned.toLowerCase());
    }
  };

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const addToPalette = () => {
    if (palette.find(p => p.hex === hex)) return;
    setPalette(p => [...p, { id: ++_pid, hex, label: hex }].slice(0,30));
  };

  const exportCSS = () => {
    const css = `:root {\n${palette.map((p,i) => `  --color-${i+1}: ${p.hex}; /* ${p.label} */`).join('\n')}\n}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([css], { type: 'text/css' }));
    a.download = 'palette.css'; a.click();
  };
  const exportJSON = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(palette.map(p => ({ hex: p.hex, label: p.label })), null, 2)], { type: 'application/json' }));
    a.download = 'palette.json'; a.click();
  };

  // KPI
  const kpis = [
    { label: 'HEX',  val: hex.toUpperCase(),           color: 'text-slate-700 dark:text-white' },
    { label: 'RGB',  val: `${r}, ${g}, ${b}`,           color: 'text-blue-600' },
    { label: 'HSL',  val: `${h}°, ${s}%, ${l}%`,        color: 'text-purple-600' },
    { label: 'Contrast vs White', val: `${contrast.onWhite.toFixed(1)}:1`, color: contrast.onWhite >= 4.5 ? 'text-emerald-600' : 'text-rose-600' },
  ];

  const CopyBtn = ({ text }: { text: string }) => (
    <button onClick={() => copy(text)} className="ml-2 flex-shrink-0 text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
      {copied === text ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-wrap">
        <span className="text-base">🎨</span>
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Color Studio</span>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex-wrap">
          {HARMONY_TYPES.map(t => (
            <button key={t} onClick={() => setHarmony(t)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${harmonyType === t ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={addToPalette}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg">
            <Plus size={12} /> Save Color
          </button>
          {palette.length > 0 && (
            <>
              <button onClick={exportCSS} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-bold rounded-lg">
                <Download size={12} /> CSS
              </button>
              <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold rounded-lg">
                <Download size={12} /> JSON
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {kpis.map(k => (
          <div key={k.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className={`text-sm font-black mt-0.5 ${k.color} truncate font-mono`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — picker + values */}
        <div className="w-[260px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto space-y-5">
          {/* Color picker swatch */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pick Color</p>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" style={{ height: 120 }}>
              <div className="w-full h-full" style={{ backgroundColor: hex }} />
              <input type="color" value={hex}
                onChange={e => { setHex(e.target.value); setInputHex(e.target.value); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair" />
              <div className="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: textColor === '#ffffff' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)', color: textColor }}>
                {hex.toUpperCase()}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input value={inputHex} onChange={e => { setInputHex(e.target.value); applyHex(e.target.value); }}
                className="flex-1 h-8 px-2 font-mono text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                placeholder="#rrggbb" maxLength={7} />
              <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0" style={{ backgroundColor: hex }} />
            </div>
          </div>

          {/* Color values */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Color Values</p>
            <div className="space-y-2">
              {[
                ['HEX',  hex.toUpperCase()],
                ['RGB',  `rgb(${r}, ${g}, ${b})`],
                ['HSL',  `hsl(${h}, ${s}%, ${l}%)`],
                ['HSV',  `hsv(${h}, ${sv}%, ${v}%)`],
                ['CMYK', `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
                    <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{val}</p>
                  </div>
                  <CopyBtn text={val} />
                </div>
              ))}
            </div>
          </div>

          {/* Contrast */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">WCAG Contrast</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ backgroundColor: hex }}>
                <span className="text-[11px] font-bold" style={{ color: '#ffffff' }}>AA on white text</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${contrast.onWhite >= 4.5 ? 'bg-white/30 text-white' : 'bg-black/30 text-white'}`}>
                  {contrast.onWhite.toFixed(1)}:1 {contrast.onWhite >= 4.5 ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ backgroundColor: hex }}>
                <span className="text-[11px] font-bold" style={{ color: '#000000' }}>AA on black text</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${contrast.onBlack >= 4.5 ? 'bg-black/30 text-black' : 'bg-black/20 text-black'}`}>
                  {contrast.onBlack.toFixed(1)}:1 {contrast.onBlack >= 4.5 ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center — harmonies + shades */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Active harmony */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{activeHarm.name} Harmony</p>
            <div className="flex gap-3 flex-wrap">
              {activeHarm.colors.map((c, i) => {
                const [cr,cg,cb] = hexToRgb(c);
                const [ch,cs,cl] = rgbToHsl(cr,cg,cb);
                const ct = getContrastRatio(c);
                return (
                  <div key={i} className="flex-1 min-w-[100px] cursor-pointer group" onClick={() => { setHex(c); setInputHex(c); }}>
                    <div className="h-28 rounded-xl shadow-sm border border-black/5 transition-transform group-hover:scale-105 group-hover:shadow-md flex items-end p-2"
                      style={{ backgroundColor: c }}>
                      <span className="text-[10px] font-mono font-bold opacity-80 px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: ct.rec === 'white' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)', color: ct.rec === 'white' ? '#fff' : '#000' }}>
                        {c.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1.5 px-1">
                      <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">{c.toUpperCase()}</p>
                      <p className="text-[9px] text-slate-400">{ch}° {cs}% {cl}%</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); copy(c); }}
                      className="mt-1 px-1 flex items-center gap-1 text-[9px] text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy size={9} /> {copied === c ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All harmonies strip */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">All Harmony Previews</p>
            <div className="space-y-3">
              {HARMONY_TYPES.map(ht => (
                <div key={ht} className="flex items-center gap-3 cursor-pointer" onClick={() => setHarmony(ht)}>
                  <span className={`text-[10px] font-bold w-32 capitalize flex-shrink-0 ${harmonyType === ht ? 'text-blue-600' : 'text-slate-400'}`}>{ht}</span>
                  <div className="flex gap-1 flex-1">
                    {harmonies[ht].colors.map((c, i) => (
                      <div key={i} className="flex-1 h-7 rounded-md border border-black/5" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tints & shades */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tints & Shades</p>
            <div className="flex gap-2">
              {[90,80,70,60,50,40,30,20,10].map(ls => {
                const c = hslToHex(h, s, ls);
                const ct = getContrastRatio(c);
                return (
                  <div key={ls} className="flex-1 cursor-pointer group" onClick={() => { setHex(c); setInputHex(c); }}>
                    <div className="h-12 rounded-lg border border-black/5 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: c }} />
                    <p className="text-[8px] text-center text-slate-400 mt-1">{ls}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — Saved Palette */}
        <div className="w-[220px] flex-shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Palette</p>
              {palette.length > 0 && (
                <button onClick={() => setPalette([])} className="text-[9px] text-slate-400 hover:text-rose-500 flex items-center gap-1">
                  <Trash2 size={9} /> Clear
                </button>
              )}
            </div>
            {palette.length === 0
              ? <p className="text-xs text-slate-400 text-center py-6">Click "+ Save Color" to build a palette</p>
              : (
                <div className="space-y-1.5">
                  {palette.map(p => (
                    <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group cursor-pointer"
                      onClick={() => { setHex(p.hex); setInputHex(p.hex); }}>
                      <div className="w-7 h-7 rounded-md flex-shrink-0 border border-black/10 shadow-sm" style={{ backgroundColor: p.hex }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{p.hex.toUpperCase()}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); copy(p.hex); }}
                          className="text-slate-400 hover:text-blue-600">
                          {copied === p.hex ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                        <button onClick={e => { e.stopPropagation(); setPalette(pl => pl.filter(x => x.id !== p.id)); }}
                          className="text-slate-400 hover:text-rose-500">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Palette strip preview */}
            {palette.length > 0 && (
              <div className="mt-4">
                <p className="text-[9px] text-slate-400 uppercase font-bold mb-1.5">Strip</p>
                <div className="flex h-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  {palette.map(p => (
                    <div key={p.id} className="flex-1" style={{ backgroundColor: p.hex }} title={p.hex} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
