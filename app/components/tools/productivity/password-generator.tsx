"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Lock, RefreshCw, Copy, Check, Download, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

// ─── Character sets ───────────────────────────────────────────────────────────
const SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  num: '0123456789',
  sym: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'Il1O0',
};

// ─── Strength calculator ──────────────────────────────────────────────────────
function calcStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: '—', color: 'text-slate-400' };
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (p.length >= 16) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 2) return { score: s, label: 'Very Weak', color: 'text-rose-600' };
  if (s <= 3) return { score: s, label: 'Weak', color: 'text-orange-500' };
  if (s <= 4) return { score: s, label: 'Fair', color: 'text-amber-500' };
  if (s <= 5) return { score: s, label: 'Strong', color: 'text-lime-600' };
  return { score: s, label: 'Very Strong', color: 'text-emerald-600' };
}

function barColor(score: number) {
  if (score <= 2) return 'bg-rose-500';
  if (score <= 3) return 'bg-orange-500';
  if (score <= 4) return 'bg-amber-500';
  if (score <= 5) return 'bg-lime-500';
  return 'bg-emerald-500';
}

// ─── Password generator ───────────────────────────────────────────────────────
function generatePassword(length: number, opts: Record<string, boolean>, noAmbiguous: boolean): string {
  let chars = '';
  if (opts.upper) chars += noAmbiguous ? SETS.upper.replace(/[Il]/g, '') : SETS.upper;
  if (opts.lower) chars += noAmbiguous ? SETS.lower.replace(/[l]/g, '') : SETS.lower;
  if (opts.num) chars += noAmbiguous ? SETS.num.replace(/[10]/g, '') : SETS.num;
  if (opts.sym) chars += SETS.sym;
  if (!chars) return '';
  // Ensure at least one of each selected type
  let result = '';
  if (opts.upper) result += (noAmbiguous ? SETS.upper.replace(/[Il]/g, '') : SETS.upper)[Math.floor(Math.random() * (noAmbiguous ? SETS.upper.replace(/[Il]/g, '') : SETS.upper).length)];
  if (opts.lower) result += (noAmbiguous ? SETS.lower.replace(/[l]/g, '') : SETS.lower)[Math.floor(Math.random() * (noAmbiguous ? SETS.lower.replace(/[l]/g, '') : SETS.lower).length)];
  if (opts.num) result += (noAmbiguous ? SETS.num.replace(/[10]/g, '') : SETS.num)[Math.floor(Math.random() * (noAmbiguous ? SETS.num.replace(/[10]/g, '') : SETS.num).length)];
  if (opts.sym) result += SETS.sym[Math.floor(Math.random() * SETS.sym.length)];
  while (result.length < length) result += chars[Math.floor(Math.random() * chars.length)];
  // Shuffle
  return result.split('').sort(() => Math.random() - 0.5).slice(0, length).join('');
}

// ─── Main component ───────────────────────────────────────────────────────────
export const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, num: true, sym: true });
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ pass: string; strength: string }[]>([]);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkList, setBulkList] = useState<string[]>([]);

  const gen = useCallback(() => {
    const p = generatePassword(length, opts, noAmbiguous);
    setPassword(p);
    if (p) setHistory(prev => [{ pass: p, strength: calcStrength(p).label }, ...prev].slice(0, 10));
  }, [length, opts, noAmbiguous]);

  useEffect(() => { gen(); }, []);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast('Copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const genBulk = () => {
    const list = Array.from({ length: bulkCount }, () => generatePassword(length, opts, noAmbiguous));
    setBulkList(list);
  };

  const downloadBulk = () => {
    const blob = new Blob([bulkList.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'passwords.txt'; a.click();
    showToast('Downloaded', 'success');
  };

  const st = calcStrength(password);
  const strengthPct = Math.round((st.score / 7) * 100);

  const kpis = [
    { label: 'Length', val: `${length} chars`, color: 'text-blue-600' },
    { label: 'Strength', val: st.label, color: st.color },
    { label: 'Entropy (approx)', val: `${Math.round(length * Math.log2(Object.values(opts).filter(Boolean).length * 10 + 10))} bits`, color: 'text-violet-600' },
    { label: 'History', val: `${history.length} saved`, color: 'text-slate-600' },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Lock size={18} className="text-blue-600" />
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Password Generator</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={gen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all">
            <RefreshCw size={13} /> Regenerate
          </button>
          <button onClick={() => copy(password)} disabled={!password}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all disabled:opacity-50">
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {kpis.map(k => (
          <div key={k.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className={`text-lg font-black mt-0.5 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT: Controls ── */}
        <div className="w-[320px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4 space-y-4">

            {/* Length slider */}
            <section className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password Length</p>
                <span className="text-sm font-black text-blue-600">{length}</span>
              </div>
              <input type="range" min={8} max={64} value={length}
                onChange={e => setLength(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 rounded-full" />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>8</span><span>16</span><span>32</span><span>64</span>
              </div>
            </section>

            {/* Character sets */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Character Sets</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'upper', label: 'Uppercase (A–Z)', ex: 'ABC' },
                  { key: 'lower', label: 'Lowercase (a–z)', ex: 'abc' },
                  { key: 'num', label: 'Numbers (0–9)', ex: '123' },
                  { key: 'sym', label: 'Symbols (!@#)', ex: '!@#' },
                ] as const).map(({ key, label, ex }) => (
                  <label key={key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${opts[key] ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' : 'border-slate-200 dark:border-slate-700'}`}>
                    <input type="checkbox" checked={opts[key]}
                      onChange={e => setOpts(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-blue-600" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{label}</p>
                      <p className="text-[10px] font-mono text-slate-400">{ex}</p>
                    </div>
                  </label>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-1 cursor-pointer">
                <input type="checkbox" checked={noAmbiguous} onChange={e => setNoAmbiguous(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Exclude ambiguous chars (I, l, 1, 0, O)</span>
              </label>
            </section>

            {/* Quick presets */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Presets</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'PIN (4)', len: 4, o: { upper: false, lower: false, num: true, sym: false } },
                  { label: 'PIN (6)', len: 6, o: { upper: false, lower: false, num: true, sym: false } },
                  { label: 'Simple', len: 12, o: { upper: true, lower: true, num: true, sym: false } },
                  { label: 'Strong', len: 16, o: { upper: true, lower: true, num: true, sym: true } },
                  { label: 'Max', len: 32, o: { upper: true, lower: true, num: true, sym: true } },
                  { label: 'Passphrase', len: 20, o: { upper: true, lower: true, num: true, sym: false } },
                ].map(p => (
                  <button key={p.label} onClick={() => { setLength(p.len); setOpts(p.o); setTimeout(gen, 50); }}
                    className="px-2 py-1.5 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all text-slate-600 dark:text-slate-300">
                    {p.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Bulk generator */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 pb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bulk Generate</p>
              <div className="flex items-center gap-2">
                <input type="number" min={1} max={50} value={bulkCount}
                  onChange={e => setBulkCount(Math.min(50, Math.max(1, Number(e.target.value))))}
                  className="w-16 h-8 px-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white" />
                <span className="text-xs text-slate-400">passwords</span>
                <button onClick={genBulk}
                  className="flex-1 flex items-center justify-center gap-1 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all">
                  <Plus size={12} /> Generate
                </button>
              </div>
              {bulkList.length > 0 && (
                <button onClick={downloadBulk}
                  className="w-full flex items-center justify-center gap-1.5 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-xs font-bold rounded-lg text-emerald-700 hover:bg-emerald-100 transition-all">
                  <Download size={12} /> Download {bulkList.length} passwords
                </button>
              )}
            </section>

          </div>
        </div>

        {/* ── RIGHT: Password display + history ── */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6 flex flex-col gap-4">
          {/* Main password card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Generated Password</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setVisible(v => !v)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={gen} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <RefreshCw size={14} />
                </button>
                <button onClick={() => copy(password)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="font-mono text-xl font-bold tracking-wider text-slate-900 dark:text-white break-all py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[60px] flex items-center">
              {visible ? password : password.replace(/./g, '•')}
            </div>

            {/* Strength bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Strength</span>
                <span className={`text-xs font-black ${st.color}`}>{st.label}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${barColor(st.score)}`} style={{ width: `${strengthPct}%` }} />
              </div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < st.score ? barColor(st.score) : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </div>
            </div>

            {/* Char analysis */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: 'Uppercase', count: (password.match(/[A-Z]/g) || []).length, color: 'text-blue-600' },
                { label: 'Lowercase', count: (password.match(/[a-z]/g) || []).length, color: 'text-violet-600' },
                { label: 'Numbers', count: (password.match(/[0-9]/g) || []).length, color: 'text-emerald-600' },
                { label: 'Symbols', count: (password.match(/[^A-Za-z0-9]/g) || []).length, color: 'text-amber-600' },
              ].map(({ label, count, color }) => (
                <div key={label} className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg py-2">
                  <p className={`text-lg font-black ${color}`}>{count}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk list */}
          {bulkList.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Bulk ({bulkList.length})</span>
                <button onClick={downloadBulk} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <Download size={12} /> Download All
                </button>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {bulkList.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded group">
                    <span className="text-[10px] text-slate-400 w-5 text-right">{i + 1}</span>
                    <span className="font-mono text-xs flex-1 text-slate-700 dark:text-slate-300">{p}</span>
                    <button onClick={() => copy(p)} className="opacity-0 group-hover:opacity-100 text-blue-600 p-1 rounded transition-opacity"><Copy size={11} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Recent History</span>
                <button onClick={() => setHistory([])} className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors">Clear</button>
              </div>
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group">
                    <span className="font-mono text-xs flex-1 text-slate-600 dark:text-slate-400 truncate">{h.pass}</span>
                    <span className={`text-[10px] font-bold ${calcStrength(h.pass).color}`}>{h.strength}</span>
                    <button onClick={() => copy(h.pass)} className="opacity-0 group-hover:opacity-100 text-blue-600 p-1 transition-opacity"><Copy size={11} /></button>
                    <button onClick={() => setPassword(h.pass)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-1 transition-opacity text-[10px]">Use</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
