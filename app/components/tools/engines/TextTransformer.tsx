"use client";
import React, { useState, useMemo } from 'react';
import { Copy, Check, RotateCcw, Type } from 'lucide-react';

// ─── Transforms ────────────────────────────────────────────────────────────────
function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function toCamel(s: string) {
  const words = s.match(/[a-zA-Z0-9]+/g) || [];
  return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}
function toPascal(s: string) {
  return (s.match(/[a-zA-Z0-9]+/g) || []).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}
function toWords(s: string) { return (s.match(/[a-zA-Z0-9]+/g) || []).map(w => w.toLowerCase()); }
function toSnake(s: string)         { return toWords(s).join('_'); }
function toScreamSnake(s: string)   { return toSnake(s).toUpperCase(); }
function toKebab(s: string)         { return toWords(s).join('-'); }
function toDot(s: string)           { return toWords(s).join('.'); }
function toConstant(s: string)      { return toWords(s).map(w => w.toUpperCase()).join('_'); }
function toSlug(s: string)          { return s.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim(); }
function toAlternating(s: string)   { return s.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''); }
function toROT13(s: string)         { return s.replace(/[a-zA-Z]/g, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode(((c.charCodeAt(0)-b+13)%26)+b); }); }
function toReverse(s: string)       { return s.split('').reverse().join(''); }
function toReverseWords(s: string)  { return s.split(' ').reverse().join(' '); }

const TRANSFORMS = [
  // Case group
  { id:'upper',       label:'UPPERCASE',       fn:(s:string)=>s.toUpperCase(),  color:'blue',    group:'Case' },
  { id:'lower',       label:'lowercase',       fn:(s:string)=>s.toLowerCase(),  color:'slate',   group:'Case' },
  { id:'title',       label:'Title Case',      fn:toTitleCase,                  color:'violet',  group:'Case' },
  { id:'sentence',    label:'Sentence case',   fn:(s:string)=>s.charAt(0).toUpperCase()+s.slice(1).toLowerCase(), color:'indigo', group:'Case' },
  { id:'alternating', label:'aLtErNaTiNg',     fn:toAlternating,                color:'pink',    group:'Case' },
  // Code group
  { id:'camel',       label:'camelCase',       fn:toCamel,                      color:'amber',   group:'Code' },
  { id:'pascal',      label:'PascalCase',      fn:toPascal,                     color:'orange',  group:'Code' },
  { id:'snake',       label:'snake_case',      fn:toSnake,                      color:'teal',    group:'Code' },
  { id:'screaming',   label:'SCREAMING_SNAKE', fn:toScreamSnake,                color:'rose',    group:'Code' },
  { id:'kebab',       label:'kebab-case',      fn:toKebab,                      color:'lime',    group:'Code' },
  { id:'dot',         label:'dot.case',        fn:toDot,                        color:'cyan',    group:'Code' },
  { id:'constant',    label:'CONSTANT_CASE',   fn:toConstant,                   color:'fuchsia', group:'Code' },
  { id:'slug',        label:'url-slug',        fn:toSlug,                       color:'sky',     group:'Code' },
  // Transform group
  { id:'reverse',     label:'esreveR text',    fn:toReverse,                    color:'purple',  group:'Other' },
  { id:'reversewords',label:'Reverse Words',   fn:toReverseWords,               color:'purple',  group:'Other' },
  { id:'rot13',       label:'ROT-13',          fn:toROT13,                      color:'slate',   group:'Other' },
  { id:'nospaces',    label:'Remove Spaces',   fn:(s:string)=>s.replace(/\s+/g,''), color:'slate', group:'Other' },
  { id:'singlespace', label:'Single Spaces',   fn:(s:string)=>s.replace(/\s+/g,' ').trim(), color:'slate', group:'Other' },
] as const;

type TransformId = typeof TRANSFORMS[number]['id'];

const COLOR_MAP: Record<string, string> = {
  blue:    'bg-blue-50   dark:bg-blue-900/20  text-blue-700   dark:text-blue-300   border-blue-200   dark:border-blue-800',
  slate:   'bg-slate-50  dark:bg-slate-800    text-slate-600  dark:text-slate-300  border-slate-200  dark:border-slate-700',
  violet:  'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  indigo:  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  pink:    'bg-pink-50   dark:bg-pink-900/20  text-pink-700   dark:text-pink-300   border-pink-200   dark:border-pink-800',
  amber:   'bg-amber-50  dark:bg-amber-900/20 text-amber-700  dark:text-amber-300  border-amber-200  dark:border-amber-800',
  orange:  'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  teal:    'bg-teal-50   dark:bg-teal-900/20  text-teal-700   dark:text-teal-300   border-teal-200   dark:border-teal-800',
  rose:    'bg-rose-50   dark:bg-rose-900/20  text-rose-700   dark:text-rose-300   border-rose-200   dark:border-rose-800',
  lime:    'bg-lime-50   dark:bg-lime-900/20  text-lime-700   dark:text-lime-300   border-lime-200   dark:border-lime-800',
  cyan:    'bg-cyan-50   dark:bg-cyan-900/20  text-cyan-700   dark:text-cyan-300   border-cyan-200   dark:border-cyan-800',
  fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800',
  sky:     'bg-sky-50    dark:bg-sky-900/20   text-sky-700    dark:text-sky-300    border-sky-200    dark:border-sky-800',
  purple:  'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
};

const GROUPS = ['Case', 'Code', 'Other'] as const;

function countStats(s: string) {
  const chars = s.length;
  const charNoSpace = s.replace(/\s/g, '').length;
  const words = s.trim() ? s.trim().split(/\s+/).length : 0;
  const lines = s ? s.split('\n').length : 0;
  const readMin = Math.max(1, Math.ceil(words / 200));
  return { chars, charNoSpace, words, lines, readMin };
}

export const TextTransformer = ({ toolId = 'case', title = 'Case Converter' }: { toolId?: string, title?: string }) => {
  const [input, setInput] = useState('');
  const [activeId, setActiveId] = useState<TransformId | null>(null);
  const [copied, setCopied] = useState(false);

  const activeTransform = TRANSFORMS.find(t => t.id === activeId);
  const output = useMemo(() => {
    if (!activeId || !input) return '';
    const t = TRANSFORMS.find(t => t.id === activeId);
    return t ? t.fn(input) : '';
  }, [input, activeId]);

  const stats = useMemo(() => countStats(input), [input]);

  const copy = () => {
    const text = output || input;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Slim top bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Type size={14} className="text-orange-500 flex-shrink-0" />
        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{title}</span>
        {input && (
          <>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex gap-3 text-[10px] font-semibold text-slate-400">
              <span>{stats.chars} chars</span>
              <span>{stats.charNoSpace} no-space</span>
              <span>{stats.words} words</span>
              <span>{stats.lines} lines</span>
              <span>~{stats.readMin}m read</span>
            </div>
          </>
        )}
        <div className="ml-auto flex gap-2">
          {output && (
            <button onClick={() => { setInput(output); setActiveId(null); }}
              className="text-[11px] font-bold text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              ← Apply to input
            </button>
          )}
          {input && (
            <button onClick={() => { setInput(''); setActiveId(null); }}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-500 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1">
              <RotateCcw size={11} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Body: textarea (left) + transforms + output (right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
          <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Input</span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste your text here…"
            className="flex-1 p-4 resize-none outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-mono placeholder:text-slate-300 dark:placeholder:text-slate-600"
            spellCheck={false}
          />
        </div>

        {/* Right panel */}
        <div className="w-[360px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900">
          {/* Transform picker */}
          <div className="flex-shrink-0 p-4 space-y-3 border-b border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[52%]">
            {GROUPS.map(group => (
              <div key={group}>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {TRANSFORMS.filter(t => t.group === group).map(t => {
                    const cls = COLOR_MAP[t.color];
                    const isActive = activeId === t.id;
                    return (
                      <button key={t.id} onClick={() => setActiveId(t.id)}
                        className={`px-2.5 py-1 text-[11px] font-bold border rounded-lg font-mono transition-all hover:scale-105 ${cls} ${isActive ? 'ring-2 ring-blue-400 ring-offset-1 shadow-sm' : ''}`}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Output
                {activeTransform && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] border ${COLOR_MAP[activeTransform.color]}`}>
                    {activeTransform.label}
                  </span>
                )}
              </span>
              <button onClick={copy}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border rounded-lg transition-all ${copied ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                {copied ? <Check size={10} /> : <Copy size={10} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {output ? (
                <pre className="p-4 text-sm leading-relaxed font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all select-all">
                  {output}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-6">
                  <span className="text-3xl text-slate-200 dark:text-slate-700">✦</span>
                  <p className="text-xs text-slate-400">
                    {input ? 'Select a transform above' : 'Start typing on the left'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
