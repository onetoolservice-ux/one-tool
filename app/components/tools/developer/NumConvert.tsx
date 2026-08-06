"use client";
import React, { useState, useCallback } from 'react';
import { Binary, Copy, Check } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

type Base = 2 | 8 | 10 | 16;

const BASES: { base: Base; label: string; prefix: string; placeholder: string; chars: string }[] = [
  { base: 2,  label: 'Binary',      prefix: '0b', placeholder: '1010 1111',   chars: '01' },
  { base: 8,  label: 'Octal',       prefix: '0o', placeholder: '0377',         chars: '01234567' },
  { base: 10, label: 'Decimal',     prefix: '',   placeholder: '255',          chars: '0123456789' },
  { base: 16, label: 'Hexadecimal', prefix: '0x', placeholder: 'FF',           chars: '0123456789ABCDEFabcdef' },
];

const BASE_COLORS: Record<Base, string> = {
  2:  'text-violet-500',
  8:  'text-amber-500',
  10: 'text-blue-500',
  16: 'text-emerald-500',
};
const BASE_ACTIVE: Record<Base, string> = {
  2:  'border-violet-400 dark:border-violet-600',
  8:  'border-amber-400 dark:border-amber-600',
  10: 'border-blue-400 dark:border-blue-600',
  16: 'border-emerald-400 dark:border-emerald-600',
};

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
      {copied ? <Check size={13} className="text-green-500"/> : <Copy size={13} className="text-slate-400"/>}
    </button>
  );
}

function formatBinary(bin: string): string {
  const clean = bin.replace(/\s/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

export const NumConverter = () => {
  const [values, setValues] = useState<Record<Base, string>>({ 2: '', 8: '', 10: '', 16: '' });
  const [activeBase, setActiveBase] = useState<Base | null>(null);

  const update = useCallback((val: string, fromBase: Base) => {
    const clean = val.replace(/\s/g, '');
    if (!clean) { setValues({ 2: '', 8: '', 10: '', 16: '' }); return; }

    const def = BASES.find(b => b.base === fromBase)!;
    const invalid = [...clean].some(c => !def.chars.toLowerCase().includes(c.toLowerCase()));
    if (invalid) { showToast(`Invalid character for ${def.label}`, 'error'); return; }

    const decimal = parseInt(clean, fromBase);
    if (isNaN(decimal) || decimal < 0 || decimal > Number.MAX_SAFE_INTEGER) {
      showToast('Number out of safe range', 'error'); return;
    }

    setValues({
      2:  fromBase === 2 ? val : formatBinary(decimal.toString(2)),
      8:  fromBase === 8 ? val : decimal.toString(8),
      10: fromBase === 10 ? val : decimal.toString(10),
      16: fromBase === 16 ? val : decimal.toString(16).toUpperCase(),
    });
  }, []);

  const bits = values[2] ? values[2].replace(/\s/g, '').length : 0;
  const decimal = values[10] ? parseInt(values[10], 10) : null;

  const BITWISE: { label: string; fn: (n: number) => number }[] = [
    { label: '~n (NOT)',   fn: n => ~n },
    { label: 'n << 1',     fn: n => n << 1 },
    { label: 'n >> 1',     fn: n => n >> 1 },
    { label: 'n & 0xFF',   fn: n => n & 0xFF },
    { label: 'n | 0xFF',   fn: n => n | 0xFF },
    { label: 'n ^ 0xFF',   fn: n => n ^ 0xFF },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg"><Binary size={18} className="text-violet-600"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Number Converter</h2>
            <p className="text-[11px] text-slate-400">Binary • Octal • Decimal • Hexadecimal</p>
          </div>
        </div>
        {decimal !== null && (
          <div className="flex items-center gap-3 ml-3 text-xs">
            <span className="text-slate-500">= <strong className="text-blue-500">{decimal.toLocaleString()}</strong></span>
            <span className="text-slate-400">{bits} bits</span>
          </div>
        )}
        <div className="flex-1"/>
        <button onClick={() => { setValues({ 2: '', 8: '', 10: '', 16: '' }); setActiveBase(null); }}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 font-semibold transition-colors">
          Clear
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Converters ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {BASES.map(({ base, label, prefix, placeholder }) => (
              <div key={base} className={`bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all shadow-sm ${activeBase === base ? BASE_ACTIVE[base] : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="px-5 pt-4 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wide ${BASE_COLORS[base]}`}>{label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">(base {base})</span>
                  </div>
                  {values[base] && <CopyBtn value={values[base]}/>}
                </div>
                <div className="flex items-center gap-0 px-5 pb-4">
                  {prefix && <span className="font-mono text-sm text-slate-400 mr-1 flex-shrink-0">{prefix}</span>}
                  <input
                    value={values[base]}
                    onChange={e => { update(e.target.value, base); setActiveBase(base); }}
                    onFocus={() => setActiveBase(base)}
                    onBlur={() => setActiveBase(null)}
                    placeholder={placeholder}
                    spellCheck={false}
                    className="flex-1 font-mono text-xl font-bold outline-none bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                </div>
              </div>
            ))}

            {/* Bitwise ops */}
            {decimal !== null && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Bitwise Operations</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BITWISE.map(({ label, fn }) => {
                    const result = fn(decimal);
                    const hex = (result >>> 0).toString(16).toUpperCase();
                    return (
                      <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-slate-400 font-mono mb-1">{label}</p>
                        <p className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">{result}</p>
                        <p className="font-mono text-[10px] text-slate-400">0x{hex}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Reference table ─────────────────────────────────── */}
        <div className="w-56 flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Quick Ref</span>
          </div>
          <div className="p-2">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-slate-400">
                  <th className="text-left px-1 py-1 font-semibold">Dec</th>
                  <th className="text-left px-1 py-1 font-semibold text-violet-500">Bin</th>
                  <th className="text-left px-1 py-1 font-semibold text-amber-500">Oct</th>
                  <th className="text-left px-1 py-1 font-semibold text-emerald-500">Hex</th>
                </tr>
              </thead>
              <tbody>
                {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
                  16,32,48,64,80,96,112,128,144,160,176,192,208,224,240,255].map(n => (
                  <tr key={n} className="hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={() => { update(String(n), 10); }}>
                    <td className="px-1 py-0.5 text-blue-500">{n}</td>
                    <td className="px-1 py-0.5 text-violet-500">{n.toString(2)}</td>
                    <td className="px-1 py-0.5 text-amber-500">{n.toString(8)}</td>
                    <td className="px-1 py-0.5 text-emerald-500">{n.toString(16).toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
