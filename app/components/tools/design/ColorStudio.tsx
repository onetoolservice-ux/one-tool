"use client";
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Copy, Check, Download } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type GradType = 'linear' | 'radial' | 'conic';
interface Stop { id: number; color: string; pos: number }

let _sid = 0;
function mkStop(color: string, pos: number): Stop { return { id: ++_sid, color, pos }; }

// ─── Presets ──────────────────────────────────────────────────────────────────
interface Preset { name: string; type: GradType; angle: number; stops: Omit<Stop,'id'>[] }

const PRESETS: Preset[] = [
  { name:'Sunrise',    type:'linear', angle:135, stops:[{color:'#f97316',pos:0},{color:'#fbbf24',pos:100}] },
  { name:'Ocean',      type:'linear', angle:160, stops:[{color:'#0ea5e9',pos:0},{color:'#6366f1',pos:100}] },
  { name:'Forest',     type:'linear', angle:120, stops:[{color:'#22c55e',pos:0},{color:'#052e16',pos:100}] },
  { name:'Candy',      type:'linear', angle:45,  stops:[{color:'#ec4899',pos:0},{color:'#a855f7',pos:50},{color:'#6366f1',pos:100}] },
  { name:'Monochrome', type:'linear', angle:180, stops:[{color:'#f8fafc',pos:0},{color:'#1e293b',pos:100}] },
  { name:'Gold',       type:'linear', angle:90,  stops:[{color:'#fef3c7',pos:0},{color:'#d97706',pos:50},{color:'#78350f',pos:100}] },
  { name:'Neon',       type:'linear', angle:90,  stops:[{color:'#22d3ee',pos:0},{color:'#4ade80',pos:50},{color:'#a3e635',pos:100}] },
  { name:'Sunset',     type:'radial', angle:0,   stops:[{color:'#f43f5e',pos:0},{color:'#f97316',pos:60},{color:'#1e293b',pos:100}] },
  { name:'Aurora',     type:'conic',  angle:0,   stops:[{color:'#4ade80',pos:0},{color:'#06b6d4',pos:25},{color:'#8b5cf6',pos:50},{color:'#f43f5e',pos:75},{color:'#4ade80',pos:100}] },
];

// ─── CSS Builder ──────────────────────────────────────────────────────────────
function buildCSS(type: GradType, angle: number, stops: Stop[]): string {
  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const stopsStr = sorted.map(s => `${s.color} ${s.pos}%`).join(', ');
  if (type === 'linear') return `linear-gradient(${angle}deg, ${stopsStr})`;
  if (type === 'radial') return `radial-gradient(circle at center, ${stopsStr})`;
  return `conic-gradient(from ${angle}deg at center, ${stopsStr})`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ColorStudio = () => {
  const [type, setType]     = useState<GradType>('linear');
  const [angle, setAngle]   = useState(135);
  const [stops, setStops]   = useState<Stop[]>([mkStop('#6366f1', 0), mkStop('#ec4899', 100)]);
  const [copied, setCopied] = useState(false);

  const css     = useMemo(() => buildCSS(type, angle, stops), [type, angle, stops]);
  const fullCSS = `background: ${css};`;

  const applyPreset = (p: Preset) => {
    setType(p.type); setAngle(p.angle);
    setStops(p.stops.map(s => mkStop(s.color, s.pos)));
  };

  const addStop = () => {
    const sorted = [...stops].sort((a, b) => a.pos - b.pos);
    const mid = sorted.length > 1 ? Math.round((sorted[0].pos + sorted[sorted.length-1].pos) / 2) : 50;
    setStops(p => [...p, mkStop('#ffffff', mid)]);
  };

  const updateStop = (id: number, key: keyof Stop, value: string | number) =>
    setStops(p => p.map(s => s.id === id ? { ...s, [key]: value } : s));

  const removeStop = (id: number) => {
    if (stops.length <= 2) return;
    setStops(p => p.filter(s => s.id !== id));
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(fullCSS);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const downloadSVG = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      ${[...stops].sort((a,b)=>a.pos-b.pos).map(s=>`<stop offset="${s.pos}%" stop-color="${s.color}"/>`).join('\n      ')}
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#g)"/>
</svg>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    a.download = 'gradient.svg'; a.click();
  };

  const sortedStops = useMemo(() => [...stops].sort((a, b) => a.pos - b.pos), [stops]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-950">

      {/* Large gradient canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ background: css }}>
        {/* Type selector */}
        <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/30 backdrop-blur-md rounded-xl p-1">
          {(['linear','radial','conic'] as GradType[]).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${type === t ? 'bg-white text-slate-900 shadow' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button onClick={copyCSS}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition-all ${copied ? 'bg-emerald-500/90 text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy CSS'}
          </button>
          <button onClick={downloadSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all">
            <Download size={12} /> SVG
          </button>
        </div>

        {/* Angle slider (linear & conic) */}
        {(type === 'linear' || type === 'conic') && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/30 backdrop-blur-md rounded-xl px-5 py-2.5">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Angle</span>
            <input type="range" min={0} max={360} value={angle} onChange={e => setAngle(Number(e.target.value))}
              className="w-36 accent-white cursor-pointer" />
            <span className="font-mono text-sm font-black text-white w-10 text-right">{angle}°</span>
          </div>
        )}
      </div>

      {/* Control strip */}
      <div className="flex-shrink-0 bg-slate-900 border-t border-white/5">
        {/* CSS output */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex-shrink-0">CSS</span>
          <code className="flex-1 font-mono text-[11px] text-emerald-400 truncate">{fullCSS}</code>
          <button onClick={copyCSS} className={`flex-shrink-0 ${copied ? 'text-emerald-400' : 'text-slate-600 hover:text-white'} transition-colors`}>
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
        </div>

        <div className="flex min-h-0">
          {/* Stops */}
          <div className="flex-1 p-3 flex items-center gap-3 overflow-x-auto">
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex-shrink-0">Color Stops</span>
            {sortedStops.map(s => (
              <div key={s.id} className="flex-shrink-0 flex items-center gap-2 bg-slate-800 border border-white/5 rounded-xl px-3 py-2">
                <input type="color" value={s.color} onChange={e => updateStop(s.id, 'color', e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border-none bg-transparent p-0 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] text-slate-400">{s.color.toUpperCase()}</p>
                  <div className="flex items-center gap-1">
                    <input type="number" min={0} max={100} value={s.pos}
                      onChange={e => updateStop(s.id, 'pos', Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-10 bg-transparent font-mono text-xs text-white outline-none" />
                    <span className="text-[9px] text-slate-600">%</span>
                  </div>
                </div>
                {stops.length > 2 && (
                  <button onClick={() => removeStop(s.id)} className="text-slate-700 hover:text-rose-400 transition-colors flex-shrink-0">
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addStop}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-dashed border-white/10">
              <Plus size={12} /> Add
            </button>
          </div>

          {/* Presets */}
          <div className="flex-shrink-0 border-l border-white/5 p-3 w-[300px]">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Presets</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)} title={p.name}
                  className="flex items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-sm hover:scale-105 transition-transform overflow-hidden"
                  style={{ background: buildCSS(p.type, p.angle, p.stops.map((s,i)=>({...s,id:i}))), width: 56, height: 32 }}>
                  <span className="bg-black/40 backdrop-blur-sm px-1 py-0.5 rounded text-[8px]">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
