"use client";
import React, { useState, useMemo, useRef } from 'react';
import { SearchCode, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';

const FLAGS = [
  { flag: 'g', label: 'g', title: 'Global — find all matches' },
  { flag: 'i', label: 'i', title: 'Case insensitive' },
  { flag: 'm', label: 'm', title: 'Multiline — ^ and $ match line boundaries' },
  { flag: 's', label: 's', title: 'Dot-all — . matches newlines' },
];

const SAMPLES = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'g', text: 'Contact us at hello@example.com or support@onetool.co.in for help.' },
  { label: 'URL', pattern: 'https?:\\/\\/[^\\s]+', flags: 'g', text: 'Visit https://onetool.co.in or http://example.com for more info.' },
  { label: 'Phone (IN)', pattern: '(\\+91[\\-\\s]?)?[6-9]\\d{9}', flags: 'g', text: 'Call us at 9876543210 or +91-98765-43210.' },
  { label: 'Date', pattern: '\\b(\\d{1,2})[/-](\\d{1,2})[/-](\\d{2,4})\\b', flags: 'g', text: 'Due date: 12/25/2025 and also 01-01-2026.' },
  { label: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b', flags: 'g', text: 'Colors: #ff0000, #00ff00, #abc, #1a2b3c.' },
];

function highlight(text: string, pattern: string, flags: string): { html: string; count: number; error: string } {
  if (!pattern) return { html: text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'), count: 0, error: '' };
  try {
    const f = flags.includes('g') ? flags : flags + 'g';
    const re = new RegExp(pattern, f);
    let count = 0;
    const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const safeRe = new RegExp(pattern, f);
    const result = safe.replace(safeRe, (m) => {
      count++;
      return `<mark class="bg-yellow-300 dark:bg-yellow-600/60 text-slate-900 dark:text-white rounded px-0.5">${m}</mark>`;
    });
    return { html: result, count, error: '' };
  } catch (e) {
    return { html: text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'), count: 0, error: (e as Error).message };
  }
}

function getGroups(text: string, pattern: string, flags: string): RegExpExecArray[] {
  if (!pattern) return [];
  try {
    const f = flags.includes('g') ? flags : flags + 'g';
    const re = new RegExp(pattern, f);
    const matches: RegExpExecArray[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push(m);
      if (!f.includes('g')) break;
    }
    return matches;
  } catch { return []; }
}

export const RegexTester = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('Type or paste text here to test your regular expression.\nMultiple lines are supported.\nTry matching words, emails, URLs and more!');
  const [replaceWith, setReplaceWith] = useState('');
  const [tab, setTab] = useState<'match' | 'replace'>('match');

  const toggleFlag = (f: string) => setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f);

  const { html, count, error } = useMemo(() => highlight(text, pattern, flags), [text, pattern, flags]);
  const matches = useMemo(() => getGroups(text, pattern, flags), [text, pattern, flags]);

  const replaced = useMemo(() => {
    if (!pattern || tab !== 'replace') return '';
    try {
      const f = flags.includes('g') ? flags : flags + 'g';
      return text.replace(new RegExp(pattern, f), replaceWith);
    } catch { return ''; }
  }, [text, pattern, flags, replaceWith, tab]);

  const [copied, setCopied] = useState(false);
  const copyResult = () => {
    navigator.clipboard.writeText(replaced || text);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg"><SearchCode size={18} className="text-amber-600"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Regex Tester</h2>
            <p className="text-[11px] text-slate-400">Live regex matching with group capture</p>
          </div>
        </div>

        {count > 0 && <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2.5 py-1 rounded-full font-semibold">{count} match{count !== 1 ? 'es' : ''}</span>}
        {error && <span className="text-xs text-rose-500 flex items-center gap-1"><AlertTriangle size={11}/> {error}</span>}

        {/* Samples */}
        <div className="flex items-center gap-1 ml-1">
          <span className="text-xs text-slate-400 font-semibold">Samples:</span>
          {SAMPLES.map(s => (
            <button key={s.label} onClick={() => { setPattern(s.pattern); setFlags(s.flags); setText(s.text); }}
              className="px-2 py-1 text-[10px] rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-slate-600 dark:text-slate-300 hover:text-amber-700 transition-colors font-semibold">
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1"/>
        <button onClick={() => { setPattern(''); setFlags('g'); setText(''); setReplaceWith(''); }}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 font-semibold flex items-center gap-1.5 transition-colors">
          <RotateCcw size={11}/> Clear
        </button>
      </div>

      {/* ── REGEX INPUT ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        {/* Pattern */}
        <div className="flex items-center gap-0 flex-1 min-w-[200px] border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <span className="px-3 py-2 text-slate-500 dark:text-slate-400 text-sm font-mono bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">/</span>
          <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="Enter regex pattern..." spellCheck={false}
            className={`flex-1 px-3 py-2 text-sm font-mono outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${error ? 'text-rose-500' : ''}`}/>
          <span className="px-3 py-2 text-slate-500 dark:text-slate-400 text-sm font-mono bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">/</span>
          <span className="px-2 py-2 text-blue-500 text-sm font-mono bg-slate-50 dark:bg-slate-800">{flags}</span>
        </div>

        {/* Flags */}
        <div className="flex items-center gap-1">
          {FLAGS.map(({ flag, label, title }) => (
            <button key={flag} onClick={() => toggleFlag(flag)} title={title}
              className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all ${flags.includes(flag) ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Mode tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(['match', 'replace'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${tab === t ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Replace input */}
        {tab === 'replace' && (
          <input value={replaceWith} onChange={e => setReplaceWith(e.target.value)} placeholder="Replace with..." spellCheck={false}
            className="px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 w-44"/>
        )}
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Test text with highlights */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Test Text</span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <textarea value={text} onChange={e => setText(e.target.value)} spellCheck={false}
              className="absolute inset-0 w-full h-full p-5 resize-none font-mono text-sm leading-relaxed outline-none bg-transparent text-transparent caret-slate-800 dark:caret-slate-200 z-10"/>
            <div className="absolute inset-0 p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-slate-800 dark:text-slate-200 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: html }}/>
          </div>
        </div>

        {/* Right panel: matches / replace */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          {tab === 'match' ? (
            <>
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Matches ({matches.length})</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {matches.length === 0 && (
                  <p className="text-xs text-slate-400 text-center mt-8">{pattern ? 'No matches found' : 'Enter a pattern to see matches'}</p>
                )}
                {matches.map((m, i) => (
                  <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400">Match #{i + 1}</span>
                      <span className="text-[10px] text-slate-500">index: {m.index}</span>
                    </div>
                    <p className="font-mono text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded mb-1 break-all">{m[0]}</p>
                    {m.length > 1 && m.slice(1).map((g, gi) => g !== undefined && (
                      <div key={gi} className="flex gap-2 text-[10px] mt-1">
                        <span className="text-slate-500 flex-shrink-0">Group {gi + 1}:</span>
                        <span className="font-mono text-blue-500 break-all">{g}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Result</span>
                <button onClick={copyResult} className="ml-auto w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {copied ? <Check size={11} className="text-green-500"/> : <Copy size={11} className="text-slate-400"/>}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <pre className="font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{replaced || '(result appears here)'}</pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
