"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeftRight, Copy, Check, Trash2 } from 'lucide-react';
import { readUrlParams, buildShareUrl } from '@/app/hooks/useUrlPreset';

// ─── Data ────────────────────────────────────────────────────────────────────
type CategoryKey = keyof typeof CATS;
type ConvType = 'factor' | 'temp' | 'typo';

interface CatDef {
  emoji: string;
  type?: ConvType;
  units: Record<string, number> | string[];
  base?: string; // display name of base unit
}

const CATS = {
  Length:      { emoji: '📏', base: 'metre (m)', units: { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, yd:0.9144, ft:0.3048, in:0.0254, nm:1852 } },
  Mass:        { emoji: '⚖️', base: 'kilogram (kg)', units: { kg:1, g:0.001, mg:1e-6, lb:0.453592, oz:0.0283495, t:1000, st:6.35029 } },
  Time:        { emoji: '⏱', base: 'second (s)', units: { s:1, ms:0.001, min:60, h:3600, day:86400, wk:604800, mo:2629746, yr:31556952 } },
  Temperature: { emoji: '🌡️', type:'temp' as ConvType, units: ['°C','°F','K'] },
  Area:        { emoji: '🟦', base: 'sq. metre (m²)', units: { 'm²':1, 'km²':1e6, 'cm²':1e-4, 'ft²':0.092903, ac:4046.86, ha:10000, 'mi²':2.59e6 } },
  Volume:      { emoji: '🧪', base: 'litre (L)', units: { L:1, mL:0.001, 'm³':1000, 'gal(US)':3.78541, 'qt(US)':0.946353, 'pt(US)':0.473176, cup:0.236588, 'fl oz':0.0295735 } },
  Speed:       { emoji: '💨', base: 'm/s', units: { 'm/s':1, 'km/h':0.277778, mph:0.44704, knot:0.514444, mach:343 } },
  Pressure:    { emoji: '🔩', base: 'pascal (Pa)', units: { Pa:1, bar:1e5, psi:6894.76, atm:101325, torr:133.322, kPa:1000 } },
  Energy:      { emoji: '⚡', base: 'joule (J)', units: { J:1, kJ:1000, cal:4.184, kcal:4184, Wh:3600, kWh:3.6e6, BTU:1055.06 } },
  Power:       { emoji: '🔋', base: 'watt (W)', units: { W:1, kW:1000, MW:1e6, hp:745.7 } },
  'Data Size':  { emoji: '💾', base: 'byte (B)', units: { b:0.125, B:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776 } },
  'Data Speed': { emoji: '📶', base: 'bps', units: { bps:1, Kbps:1000, Mbps:1e6, Gbps:1e9, Tbps:1e12 } },
  Cooking:     { emoji: '🍳', base: 'ml', units: { ml:1, L:1000, tsp:4.92892, tbsp:14.7868, cup:240, 'fl oz':29.5735, pt:473.176, qt:946.353 } },
  Currency:    { emoji: '💱', base: 'USD', units: { USD:1, EUR:0.92, GBP:0.79, INR:83.5, JPY:151.2, CAD:1.36, AUD:1.52, CNY:7.23, AED:3.67, SGD:1.34 } },
  Astronomy:   { emoji: '🔭', base: 'metre (m)', units: { m:1, km:1000, AU:1.496e11, ly:9.461e15, pc:3.086e16 } },
  Typography:  { emoji: '🔤', type:'typo' as ConvType, units: ['px','em','rem','pt','vw','%'] },
} satisfies Record<string, CatDef>;

const ALL_CATS = Object.keys(CATS) as CategoryKey[];

// ─── Conversion Logic ─────────────────────────────────────────────────────────
function convert(cat: CategoryKey, fromU: string, toU: string, val: number, baseSize = 16): number | null {
  if (isNaN(val)) return null;
  const def = CATS[cat];

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
    // normalize to px
    let px = val;
    if (fromU === 'em' || fromU === 'rem') px = val * baseSize;
    else if (fromU === 'pt') px = val * 1.3333;
    else if (fromU === 'vw' || fromU === '%') px = val * baseSize / 100;
    // to target
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
let _hid = 0;

// ─── Component ───────────────────────────────────────────────────────────────
export const UnitConverter = () => {
  const _p = readUrlParams();
  const [cat, setCat]       = useState<CategoryKey>((_p.get('cat') as CategoryKey) || 'Length');
  const [fromU, setFromU]   = useState(_p.get('from') || 'm');
  const [toU, setToU]       = useState(_p.get('to') || 'km');
  const [inp, setInp]       = useState(_p.get('v') || '1');
  const [baseSize, setBase] = useState(16);
  const [history, setHist]  = useState<HistEntry[]>([]);
  const [copiedId, setCopied] = useState<number | null>(null);

  const units = useMemo(() => getUnits(cat), [cat]);

  const switchCat = useCallback((c: CategoryKey) => {
    setCat(c);
    const u = getUnits(c);
    setFromU(u[0]); setToU(u[1] || u[0]);
    setInp('1');
  }, []);

  const val = parseFloat(inp);
  const result = useMemo(() => convert(cat, fromU, toU, val, baseSize), [cat, fromU, toU, val, baseSize]);
  const resultStr = fmt(result);

  // All-units table (for non-special categories)
  const allResults = useMemo(() => {
    const def = CATS[cat];
    if (def.type) return [];
    return units.map(u => ({ unit: u, result: fmt(convert(cat, fromU, u, val, baseSize)) }));
  }, [cat, fromU, val, units, baseSize]);

  const swapUnits = () => { setFromU(toU); setToU(fromU); };

  const addHistory = () => {
    if (result === null || isNaN(val)) return;
    const entry: HistEntry = {
      id: ++_hid, cat,
      expr: `${inp} ${fromU} = ${resultStr} ${toU}`,
      from: fromU, to: toU, inp,
    };
    setHist(p => [entry, ...p].slice(0, 20));
  };

  const copyResult = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  // KPI data
  const kpis = [
    { label: 'Category', val: `${CATS[cat].emoji} ${cat}`, color: 'text-blue-600' },
    { label: 'From', val: fromU, color: 'text-slate-700 dark:text-white' },
    { label: 'To', val: toU, color: 'text-slate-700 dark:text-white' },
    { label: 'Result', val: resultStr, color: 'text-emerald-600' },
  ];

  const inp_cls = 'w-full h-9 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white font-mono';
  const sel_cls = 'w-full h-9 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-white';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <span className="text-base">🔄</span>
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Unit Converter</span>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
        <span className="text-xs text-slate-500">{cat} — {units.length} units</span>
        {cat === 'Typography' && (
          <>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
            <span className="text-xs text-slate-400">Base size:</span>
            <input type="number" value={baseSize} onChange={e => setBase(Number(e.target.value))}
              className="w-14 h-7 px-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-white" />
            <span className="text-xs text-slate-400">px</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={swapUnits}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-all">
            <ArrowLeftRight size={12} /> Swap
          </button>
          <button onClick={addHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all">
            + Save
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {kpis.map(k => (
          <div key={k.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className={`text-sm font-black mt-0.5 ${k.color} truncate`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — categories */}
        <div className="w-[180px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {ALL_CATS.map(c => (
              <button key={c} onClick={() => switchCat(c)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${cat === c ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <span>{CATS[c].emoji}</span> {c}
              </button>
            ))}
          </div>
        </div>

        {/* Main — converter + table + history */}
        <div className="flex-1 flex overflow-hidden">
          {/* Converter panel */}
          <div className="w-[300px] flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto space-y-5">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Convert</p>

              {/* From */}
              <div className="space-y-2 mb-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">From</label>
                <select className={sel_cls} value={fromU} onChange={e => setFromU(e.target.value)}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input
                  type={cat === 'Typography' ? 'number' : 'text'}
                  inputMode="decimal"
                  value={inp}
                  onChange={e => setInp(e.target.value)}
                  className={inp_cls}
                  placeholder="Enter value…"
                />
              </div>

              {/* Swap */}
              <div className="flex justify-center my-2">
                <button onClick={swapUnits}
                  className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-600 hover:scale-110 transition-transform">
                  <ArrowLeftRight size={14} />
                </button>
              </div>

              {/* To */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">To</label>
                <select className={sel_cls} value={toU} onChange={e => setToU(e.target.value)}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <div className="flex items-center justify-between h-9 px-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <span className="font-mono text-sm font-black text-emerald-700 dark:text-emerald-400 truncate">{resultStr}</span>
                  <button onClick={() => copyResult(-1, `${resultStr} ${toU}`)}
                    className="flex-shrink-0 ml-2 text-emerald-500 hover:text-emerald-700 transition-colors">
                    {copiedId === -1 ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Formula note for standard categories */}
            {!CATS[cat].type && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Formula</p>
                <p className="font-mono text-[11px] text-blue-700 dark:text-blue-300">
                  result = (value × {fromU}_factor) ÷ {toU}_factor
                </p>
                {'base' in CATS[cat] && (
                  <p className="text-[10px] text-blue-400 mt-1">Base unit: {(CATS[cat] as any).base}</p>
                )}
              </div>
            )}

            {cat === 'Currency' && (
              <p className="text-[9px] text-slate-400 italic">* Rates are static approximations. Use a live API for real-time data.</p>
            )}

            <button
              onClick={() => {
                const url = buildShareUrl({ cat, from: fromU, to: toU, v: inp });
                navigator.clipboard.writeText(url).then(() => {
                  setCopied(-99);
                  setTimeout(() => setCopied(null), 2000);
                });
              }}
              className="w-full text-[10px] text-center py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors"
            >
              {copiedId === -99 ? 'Link copied!' : 'Copy shareable link'}
            </button>
          </div>

          {/* Right — All-units table + history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* All-units table */}
            {allResults.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  All {cat} — {inp} {fromU} equals…
                </p>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">Unit</th>
                        <th className="text-right px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">Value</th>
                        <th className="w-10 px-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {allResults.map(row => (
                        <tr key={row.unit}
                          className={`border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer ${row.unit === toU ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}
                          onClick={() => setToU(row.unit)}>
                          <td className="px-4 py-2">
                            <span className={`text-xs font-bold font-mono ${row.unit === fromU ? 'text-blue-600' : row.unit === toU ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}>
                              {row.unit}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                            {row.result}
                          </td>
                          <td className="px-2 py-2">
                            <button onClick={e => { e.stopPropagation(); copyResult(row.unit.charCodeAt(0), row.result); }}
                              className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-300">
                              <Copy size={11} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[9px] text-slate-400 mt-1 pl-1">Click any row to set it as the target unit</p>
              </div>
            )}

            {/* History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved History</p>
                {history.length > 0 && (
                  <button onClick={() => setHist([])} className="text-[9px] text-slate-400 hover:text-rose-500 flex items-center gap-1">
                    <Trash2 size={9} /> Clear
                  </button>
                )}
              </div>
              {history.length === 0
                ? <p className="text-xs text-slate-400 text-center py-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">Press "+ Save" in toolbar to save a conversion</p>
                : (
                  <div className="space-y-1">
                    {history.map(h => (
                      <div key={h.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        onClick={() => { setCat(h.cat); setFromU(h.from); setToU(h.to); setInp(h.inp); }}>
                        <span className="text-sm">{CATS[h.cat].emoji}</span>
                        <span className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300 truncate">{h.expr}</span>
                        <button onClick={e => { e.stopPropagation(); copyResult(h.id, h.expr); }}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700">
                          {copiedId === h.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
