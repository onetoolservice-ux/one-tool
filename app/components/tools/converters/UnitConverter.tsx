"use client";
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ArrowLeftRight, Copy, Check, Share2, Clock } from 'lucide-react';
import { readUrlParams, buildShareUrl } from '@/app/hooks/useUrlPreset';

// ─── Data ────────────────────────────────────────────────────────────────────
type CategoryKey = keyof typeof CATS;
type ConvType = 'factor' | 'temp' | 'typo';

interface CatDef {
  emoji: string;
  desc: string;
  type?: ConvType;
  units: Record<string, number> | string[];
  base?: string;
}

const CATS = {
  Length:       { emoji: '📏', desc: 'Measures distance between two points. Common units: metre, kilometre, mile, foot.', base: 'metre (m)', units: { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, yd:0.9144, ft:0.3048, in:0.0254, nm:1852 } },
  Mass:         { emoji: '⚖️', desc: 'Measures the amount of matter in an object. Common units: kilogram, gram, pound, ounce.', base: 'kilogram (kg)', units: { kg:1, g:0.001, mg:1e-6, lb:0.453592, oz:0.0283495, t:1000, st:6.35029 } },
  Time:         { emoji: '⏱',  desc: 'Measures duration or intervals between events. From milliseconds to years.', base: 'second (s)', units: { s:1, ms:0.001, min:60, h:3600, day:86400, wk:604800, mo:2629746, yr:31556952 } },
  Temperature:  { emoji: '🌡️', desc: 'Measures thermal energy. Three common scales: Celsius (°C), Fahrenheit (°F), and Kelvin (K).', type:'temp' as ConvType, units: ['°C','°F','K'] },
  Area:         { emoji: '🟦', desc: 'Measures the size of a two-dimensional surface. Common units: sq. metre, acre, hectare, sq. mile.', base: 'sq. metre (m²)', units: { 'm²':1, 'km²':1e6, 'cm²':1e-4, 'ft²':0.092903, ac:4046.86, ha:10000, 'mi²':2.59e6 } },
  Volume:       { emoji: '🧪', desc: 'Measures the space a substance occupies. Common units: litre, millilitre, gallon, cubic metre.', base: 'litre (L)', units: { L:1, mL:0.001, 'm³':1000, 'gal(US)':3.78541, 'qt(US)':0.946353, 'pt(US)':0.473176, cup:0.236588, 'fl oz':0.0295735 } },
  Speed:        { emoji: '💨', desc: 'Measures how fast an object moves — distance covered per unit of time.', base: 'm/s', units: { 'm/s':1, 'km/h':0.277778, mph:0.44704, knot:0.514444, mach:343 } },
  Pressure:     { emoji: '🔩', desc: 'Measures force applied per unit area. Used in physics, weather, and engineering.', base: 'pascal (Pa)', units: { Pa:1, bar:1e5, psi:6894.76, atm:101325, torr:133.322, kPa:1000 } },
  Energy:       { emoji: '⚡', desc: 'Measures the capacity to do work or produce heat. Common units: joule, calorie, kilowatt-hour.', base: 'joule (J)', units: { J:1, kJ:1000, cal:4.184, kcal:4184, Wh:3600, kWh:3.6e6, BTU:1055.06 } },
  Power:        { emoji: '🔋', desc: 'Measures the rate at which energy is transferred or used. Common units: watt, kilowatt, horsepower.', base: 'watt (W)', units: { W:1, kW:1000, MW:1e6, hp:745.7 } },
  'Data Size':  { emoji: '💾', desc: 'Measures digital storage capacity. Ranges from bits to terabytes and beyond.', base: 'byte (B)', units: { b:0.125, B:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776 } },
  'Data Speed': { emoji: '📶', desc: 'Measures how fast data is transmitted over a network. Common units: Mbps, Gbps.', base: 'bps', units: { bps:1, Kbps:1000, Mbps:1e6, Gbps:1e9, Tbps:1e12 } },
  Cooking:      { emoji: '🍳', desc: 'Converts ingredient volumes for cooking and baking. Common units: cup, tablespoon, teaspoon, litre.', base: 'ml', units: { ml:1, L:1000, tsp:4.92892, tbsp:14.7868, cup:240, 'fl oz':29.5735, pt:473.176, qt:946.353 } },
  Currency:     { emoji: '💱', desc: 'Converts between major world currencies. Note: rates are static approximations, not live.', base: 'USD', units: { USD:1, EUR:0.92, GBP:0.79, INR:83.5, JPY:151.2, CAD:1.36, AUD:1.52, CNY:7.23, AED:3.67, SGD:1.34 } },
  Astronomy:    { emoji: '🔭', desc: 'Measures vast distances in space — from metres to astronomical units, light-years, and parsecs.', base: 'metre (m)', units: { m:1, km:1000, AU:1.496e11, ly:9.461e15, pc:3.086e16 } },
  Typography:   { emoji: '🔤', desc: 'Converts between digital and print type size units. Base size (usually 16px) affects em/rem/vw conversions.', type:'typo' as ConvType, units: ['px','em','rem','pt','vw','%'] },
} satisfies Record<string, CatDef>;

const ALL_CATS = Object.keys(CATS) as CategoryKey[];

// ─── Conversion Logic ─────────────────────────────────────────────────────────
function convert(cat: CategoryKey, fromU: string, toU: string, val: number, baseSize = 16): number | null {
  if (isNaN(val)) return null;
  const def = CATS[cat] as CatDef;

  if (def.type === 'temp') {
    if (fromU === toU) return val;
    let c = val;
    if (fromU === '°F') c = (val - 32) * 5/9;
    if (fromU === 'K')  c = val - 273.15;
    if (toU === '°C') return c;
    if (toU === '°F') return c * 9/5 + 32;
    if (toU === 'K')  return c + 273.15;
    return null;
  }

  if (def.type === 'typo') {
    if (fromU === toU) return val;
    let px = val;
    if (fromU === 'em' || fromU === 'rem') px = val * baseSize;
    else if (fromU === 'pt') px = val * 1.3333;
    else if (fromU === 'vw' || fromU === '%') px = val * baseSize / 100;
    if (toU === 'px')  return px;
    if (toU === 'em' || toU === 'rem') return px / baseSize;
    if (toU === 'pt')  return px * 0.75;
    if (toU === 'vw' || toU === '%') return px / baseSize * 100;
    return null;
  }

  const units = def.units as Record<string, number>;
  const fF = units[fromU], fT = units[toU];
  if (!fF || !fT) return null;
  return (val * fF) / fT;
}

function fmt(n: number | null): string {
  if (n === null) return '—';
  if (!isFinite(n)) return '∞';
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs < 1e-9 || abs >= 1e15) return n.toExponential(4);
  if (abs < 0.001) return n.toPrecision(4);
  if (abs >= 1e9)  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return parseFloat(n.toPrecision(7)).toString();
}

function getUnits(cat: CategoryKey): string[] {
  const def = CATS[cat];
  return Array.isArray(def.units) ? def.units : Object.keys(def.units);
}

// ─── History ──────────────────────────────────────────────────────────────────
interface HistEntry { id: number; expr: string; cat: CategoryKey; from: string; to: string; inp: string }

// ─── Component ───────────────────────────────────────────────────────────────
export const UnitConverter = () => {
  const _p = readUrlParams();
  const [cat, setCat]       = useState<CategoryKey>((_p.get('cat') as CategoryKey) || 'Length');
  const [fromU, setFromU]   = useState(_p.get('from') || 'm');
  const [toU, setToU]       = useState(_p.get('to') || 'km');
  const [inp, setInp]       = useState(_p.get('v') || '1');
  const [baseSize, setBase] = useState(16);
  const [history, setHist]  = useState<HistEntry[]>([]);
  const [copiedId, setCopied] = useState<string | null>(null);
  const hidRef = useRef(0);

  const units = useMemo(() => getUnits(cat), [cat]);

  const switchCat = useCallback((c: CategoryKey) => {
    setCat(c);
    const u = getUnits(c);
    setFromU(u[0]); setToU(u[1] || u[0]);
    setInp('1');
  }, []);

  const val = parseFloat(inp);
  const result  = useMemo(() => convert(cat, fromU, toU, val, baseSize),  [cat, fromU, toU, val, baseSize]);
  const resultStr = fmt(result);

  const rate = useMemo(() => {
    if (fromU === toU) return null;
    const r = convert(cat, fromU, toU, 1, baseSize);
    return r !== null ? fmt(r) : null;
  }, [cat, fromU, toU, baseSize]);

  const allResults = useMemo(() => {
    const def = CATS[cat] as CatDef;
    if (def.type) return [];
    return units.map(u => ({ unit: u, result: fmt(convert(cat, fromU, u, val, baseSize)) }));
  }, [cat, fromU, val, units, baseSize]);

  // Auto-save recent
  useEffect(() => {
    if (result === null || isNaN(val) || !inp) return;
    const expr = `${inp} ${fromU} = ${resultStr} ${toU}`;
    setHist(prev => {
      if (prev[0]?.expr === expr) return prev;
      const entry: HistEntry = { id: ++hidRef.current, cat, expr, from: fromU, to: toU, inp };
      return [entry, ...prev].slice(0, 5);
    });
  }, [result, resultStr]); // eslint-disable-line react-hooks/exhaustive-deps

  const swapUnits = () => { setFromU(toU); setToU(fromU); };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const shareUrl = () => {
    const url = buildShareUrl({ cat, from: fromU, to: toU, v: inp });
    copyText('share', url);
  };

  const selCls = 'h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-accent text-slate-700 dark:text-white w-full';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* Slim toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <span className="text-base">🔄</span>
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Unit Converter</span>
        <div className="ml-auto">
          <button onClick={shareUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-lg transition-all">
            {copiedId === 'share' ? <><Check size={12} className="text-emerald-500" />Copied!</> : <><Share2 size={12} />Share</>}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar — categories */}
        <div className="w-[180px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {ALL_CATS.map(c => (
              <button key={c} onClick={() => switchCat(c)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${cat === c ? 'bg-accent/10 text-accent' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <span>{CATS[c].emoji}</span>{c}
              </button>
            ))}
          </div>
        </div>

        {/* Main content — vertical layout */}
        <div className="flex-1 overflow-y-auto flex flex-col">

          {/* ── Section 1: Header ───────────────────────────────────── */}
          <div className="flex-shrink-0 px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="text-3xl leading-none mt-0.5">{CATS[cat].emoji}</div>
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{cat}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{CATS[cat].desc}</p>
              </div>
              {rate !== null && (
                <div className="ml-auto flex-shrink-0 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-right">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-0.5">Rate</p>
                  <p className="font-mono text-sm font-bold text-accent">
                    1 {fromU} = <span className="text-accent">{rate}</span> {toU}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Section 2: Converter strip ──────────────────────────── */}
          <div className="flex-shrink-0 px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Convert</p>

            <div className="flex items-end gap-3">

              {/* Input value */}
              <div className="flex flex-col gap-1.5 w-40">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Value</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inp}
                  onChange={e => setInp(e.target.value)}
                  className="h-12 px-4 text-xl font-black font-mono bg-white dark:bg-slate-800 border-2 border-accent rounded-xl outline-none focus:ring-2 focus:ring-accent text-slate-900 dark:text-white placeholder:font-normal placeholder:text-slate-400"
                  placeholder="0"
                />
              </div>

              {/* From unit */}
              <div className="flex flex-col gap-1.5 w-36">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">From</label>
                <select className={selCls} value={fromU} onChange={e => setFromU(e.target.value)}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {/* Swap */}
              <div className="flex flex-col items-center pb-1">
                <button onClick={swapUnits}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-accent/10 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-accent transition-all hover:scale-110">
                  <ArrowLeftRight size={16} />
                </button>
              </div>

              {/* To unit */}
              <div className="flex flex-col gap-1.5 w-36">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">To</label>
                <select className={selCls} value={toU} onChange={e => setToU(e.target.value)}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {/* Result */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Result</label>
                <div className="h-12 px-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-400 dark:border-emerald-700 rounded-xl gap-3">
                  <span className="font-mono text-xl font-black text-emerald-700 dark:text-emerald-400 truncate">{resultStr}</span>
                  <button onClick={() => copyText('result', `${resultStr} ${toU}`)}
                    className="flex-shrink-0 text-emerald-500 hover:text-emerald-700 transition-colors">
                    {copiedId === 'result' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Typography base size (only when needed) */}
              {cat === 'Typography' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Base (px)</label>
                  <input type="number" value={baseSize} onChange={e => setBase(Number(e.target.value))}
                    className="h-10 w-20 px-3 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-accent text-slate-700 dark:text-white" />
                </div>
              )}
            </div>
          </div>

          {/* ── Section 3: Smart table / Recent ─────────────────────── */}
          <div className="flex-1 px-6 py-5 space-y-6">

            {/* All-units table */}
            {allResults.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {inp} {fromU} in other units
                </p>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Unit</th>
                        <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Value</th>
                        <th className="text-right px-5 py-3 text-[10px] font-bold text-accent uppercase tracking-wide">← click row to set as To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allResults.map(row => (
                        <tr key={row.unit}
                          onClick={() => setToU(row.unit)}
                          className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors
                            ${row.unit === toU
                              ? 'bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20'
                              : 'hover:bg-accent/5'}`}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold font-mono
                                ${row.unit === fromU ? 'text-accent'
                                  : row.unit === toU  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-700 dark:text-slate-300'}`}>
                                {row.unit}
                              </span>
                              {row.unit === toU && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded uppercase">selected</span>
                              )}
                              {row.unit === fromU && (
                                <span className="text-[9px] font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded uppercase">source</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                            {row.result}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={e => { e.stopPropagation(); copyText(`row-${row.unit}`, row.result); }}
                              className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                              {copiedId === `row-${row.unit}` ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Special categories: no table */}
            {allResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2 text-slate-400">
                <span className="text-4xl">{CATS[cat].emoji}</span>
                <p className="text-xs mt-1">All-units table not available for {cat}.<br />Use the dropdowns above to convert between units.</p>
              </div>
            )}

            {/* Recent */}
            {history.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock size={11} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map(h => (
                    <button key={h.id}
                      onClick={() => { setCat(h.cat); setFromU(h.from); setToU(h.to); setInp(h.inp); }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-all">
                      <span className="text-sm">{CATS[h.cat].emoji}</span>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{h.expr}</span>
                    </button>
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
