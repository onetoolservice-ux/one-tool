"use client";
import React, { useState, useMemo } from 'react';
import { GitCompare, Copy, Check, RotateCcw } from 'lucide-react';

type DiffLine = { type: 'equal' | 'add' | 'remove'; text: string; lineA: number | null; lineB: number | null };

// Myers / simple LCS line diff
function diffLines(a: string, b: string): DiffLine[] {
  const linesA = a === '' ? [] : a.split('\n');
  const linesB = b === '' ? [] : b.split('\n');

  // Build LCS table
  const m = linesA.length, n = linesB.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (linesA[i] === linesB[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0, j = 0, lineA = 1, lineB = 1;
  while (i < m || j < n) {
    if (i < m && j < n && linesA[i] === linesB[j]) {
      result.push({ type: 'equal', text: linesA[i], lineA: lineA++, lineB: lineB++ });
      i++; j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: 'add', text: linesB[j], lineA: null, lineB: lineB++ });
      j++;
    } else {
      result.push({ type: 'remove', text: linesA[i], lineA: lineA++, lineB: null });
      i++;
    }
  }
  return result;
}

function useCopy(value: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, copy };
}

export const DiffStudio = () => {
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [view, setView] = useState<'split' | 'unified'>('split');

  const diffResult = useMemo(() => (t1 || t2 ? diffLines(t1, t2) : []), [t1, t2]);

  const stats = useMemo(() => ({
    added: diffResult.filter(d => d.type === 'add').length,
    removed: diffResult.filter(d => d.type === 'remove').length,
    equal: diffResult.filter(d => d.type === 'equal').length,
  }), [diffResult]);

  const copyA = useCopy(t1);
  const copyB = useCopy(t2);

  const linesLeft = diffResult.filter(d => d.type !== 'add');
  const linesRight = diffResult.filter(d => d.type !== 'remove');

  const lineClass = (type: DiffLine['type']) =>
    type === 'add' ? 'bg-emerald-950/40 border-l-2 border-emerald-500 text-emerald-300' :
    type === 'remove' ? 'bg-rose-950/40 border-l-2 border-rose-500 text-rose-300' :
    'text-slate-400';

  const linePrefix = (type: DiffLine['type']) =>
    type === 'add' ? '+' : type === 'remove' ? '-' : ' ';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"><GitCompare size={18} className="text-indigo-500"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Text Diff</h2>
            <p className="text-[11px] text-slate-400">LCS line-by-line comparison</p>
          </div>
        </div>

        {(t1 || t2) && (
          <div className="flex items-center gap-2 ml-1">
            {stats.added > 0 && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">+{stats.added} added</span>}
            {stats.removed > 0 && <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-semibold">-{stats.removed} removed</span>}
            {stats.equal > 0 && <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold">{stats.equal} unchanged</span>}
          </div>
        )}

        <div className="flex-1"/>

        {/* View toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(['split', 'unified'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${view === v ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
              {v}
            </button>
          ))}
        </div>

        <button onClick={() => { setT1(''); setT2(''); }}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors font-semibold flex items-center gap-1.5">
          <RotateCcw size={11}/> Clear
        </button>
      </div>

      {view === 'split' ? (
        /* ── SPLIT VIEW ─────────────────────────────────────────────── */
        <div className="flex flex-1 overflow-hidden">
          {/* Original */}
          <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wide">Original (A)</span>
              <button onClick={copyA.copy} className="ml-auto w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {copyA.copied ? <Check size={11} className="text-green-500"/> : <Copy size={11} className="text-slate-400"/>}
              </button>
            </div>
            <textarea value={t1} onChange={e => setT1(e.target.value)} spellCheck={false}
              className="flex-1 p-4 resize-none font-mono text-sm leading-relaxed outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              placeholder="Paste original text here..."/>
          </div>

          {/* Modified */}
          <div className="w-1/2 flex flex-col">
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide">Modified (B)</span>
              <button onClick={copyB.copy} className="ml-auto w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {copyB.copied ? <Check size={11} className="text-green-500"/> : <Copy size={11} className="text-slate-400"/>}
              </button>
            </div>
            <textarea value={t2} onChange={e => setT2(e.target.value)} spellCheck={false}
              className="flex-1 p-4 resize-none font-mono text-sm leading-relaxed outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              placeholder="Paste modified text here..."/>
          </div>
        </div>
      ) : (
        /* ── UNIFIED VIEW ───────────────────────────────────────────── */
        <div className="flex flex-1 overflow-hidden">
          {/* Input panels (top half) */}
          <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-rose-500 uppercase">Original (A)</span>
            </div>
            <textarea value={t1} onChange={e => setT1(e.target.value)} spellCheck={false}
              className="flex-1 p-4 resize-none font-mono text-sm outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              placeholder="Paste original text..."/>
          </div>
          <div className="w-1/2 flex flex-col">
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-emerald-500 uppercase">Modified (B)</span>
            </div>
            <textarea value={t2} onChange={e => setT2(e.target.value)} spellCheck={false}
              className="flex-1 p-4 resize-none font-mono text-sm outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              placeholder="Paste modified text..."/>
          </div>
        </div>
      )}

      {/* ── DIFF OUTPUT (unified only when there's content) ─────────── */}
      {view === 'unified' && diffResult.length > 0 && (
        <div className="h-[45%] flex flex-col border-t border-slate-200 dark:border-slate-700 bg-slate-950 overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-3 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Diff Output</span>
            <span className="text-[10px] font-mono text-emerald-400">+{stats.added}</span>
            <span className="text-[10px] font-mono text-rose-400">-{stats.removed}</span>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-xs leading-6">
            {diffResult.map((line, i) => (
              <div key={i} className={`flex px-4 ${lineClass(line.type)}`}>
                <span className="w-8 flex-shrink-0 text-slate-600 select-none text-right pr-3">
                  {line.lineA ?? ''}
                </span>
                <span className="w-8 flex-shrink-0 text-slate-600 select-none text-right pr-3">
                  {line.lineB ?? ''}
                </span>
                <span className={`w-4 flex-shrink-0 select-none font-bold ${line.type === 'add' ? 'text-emerald-500' : line.type === 'remove' ? 'text-rose-500' : 'text-slate-700'}`}>
                  {linePrefix(line.type)}
                </span>
                <span className="flex-1 whitespace-pre">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
