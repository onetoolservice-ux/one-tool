"use client";
import React, { useState, useCallback } from 'react';
import { Hash, Copy, Check, Upload, RotateCcw, Loader2 } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algorithm = typeof ALGORITHMS[number];

const ALGO_COLORS: Record<Algorithm, string> = {
  'SHA-1':   'text-orange-500',
  'SHA-256': 'text-blue-500',
  'SHA-384': 'text-violet-500',
  'SHA-512': 'text-emerald-500',
};

async function hashText(text: string, algo: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashBuffer(buffer: ArrayBuffer, algo: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algo, buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function CopyHashBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
      {copied ? <Check size={13} className="text-green-500"/> : <Copy size={13} className="text-slate-400"/>}
    </button>
  );
}

export const HashGenerator = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({} as Record<Algorithm, string>);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [uppercase, setUppercase] = useState(false);

  const computeHashes = useCallback(async (text: string) => {
    if (!text.trim()) { setHashes({} as Record<Algorithm, string>); return; }
    setLoading(true);
    try {
      const results = await Promise.all(
        ALGORITHMS.map(async algo => ({ algo, hash: await hashText(text, algo) }))
      );
      const map = {} as Record<Algorithm, string>;
      results.forEach(({ algo, hash }) => { map[algo] = hash; });
      setHashes(map);
    } finally { setLoading(false); }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    computeHashes(e.target.value);
  };

  const handleFile = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) { showToast('File too large (max 100MB)', 'error'); return; }
    setFileInfo({ name: file.name, size: file.size });
    setMode('file');
    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const results = await Promise.all(
        ALGORITHMS.map(async algo => ({ algo, hash: await hashBuffer(buffer, algo) }))
      );
      const map = {} as Record<Algorithm, string>;
      results.forEach(({ algo, hash }) => { map[algo] = hash; });
      setHashes(map);
    } catch { showToast('Failed to hash file', 'error'); }
    finally { setLoading(false); }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => { setInput(''); setHashes({} as Record<Algorithm, string>); setFileInfo(null); setMode('text'); };

  const fmt = (h: string) => uppercase ? h.toUpperCase() : h;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><Hash size={18} className="text-emerald-600"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Hash Generator</h2>
            <p className="text-[11px] text-slate-400">SHA-1 / SHA-256 / SHA-384 / SHA-512</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 ml-2">
          {(['text', 'file'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); reset(); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${mode === m ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {m === 'text' ? 'Text' : 'File'}
            </button>
          ))}
        </div>

        <div className="flex-1"/>

        {/* Uppercase toggle */}
        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
          <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} className="accent-emerald-600 w-3.5 h-3.5"/>
          Uppercase
        </label>

        <button onClick={reset}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 font-semibold flex items-center gap-1.5 transition-colors">
          <RotateCcw size={11}/> Clear
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT INPUT ──────────────────────────────────────────────── */}
        <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{mode === 'text' ? 'Input Text' : 'Drop File'}</span>
          </div>
          {mode === 'text' ? (
            <textarea value={input} onChange={handleTextChange} spellCheck={false}
              className="flex-1 p-5 resize-none font-mono text-sm leading-relaxed outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              placeholder="Type or paste text to hash..."/>
          ) : (
            <div
              className="flex-1 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-400 transition-colors m-4 rounded-2xl"
              onDragOver={e => e.preventDefault()} onDrop={handleDrop}
              onClick={() => document.getElementById('hash-file-input')?.click()}
            >
              <input id="hash-file-input" type="file" className="hidden" onChange={handleFileInput}/>
              {fileInfo ? (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
                    <Hash size={20} className="text-emerald-500"/>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fileInfo.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(fileInfo.size / 1024).toFixed(1)} KB</p>
                  <p className="text-xs text-emerald-500 mt-2 font-semibold">Click to change file</p>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <Upload size={32} className="mx-auto mb-3 opacity-40"/>
                  <p className="text-sm font-semibold">Drop any file here</p>
                  <p className="text-xs mt-1">or click to browse • max 100MB</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT HASHES ────────────────────────────────────────────── */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Hash Results</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={24} className="animate-spin text-emerald-500"/>
              </div>
            ) : (
              ALGORITHMS.map(algo => {
                const hash = hashes[algo];
                return (
                  <div key={algo} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${ALGO_COLORS[algo]}`}>{algo}</span>
                      <span className="text-[10px] text-slate-400">{algo === 'SHA-1' ? 40 : algo === 'SHA-256' ? 64 : algo === 'SHA-384' ? 96 : 128} chars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`font-mono text-xs break-all flex-1 ${hash ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                        {hash ? fmt(hash) : '— enter text or file to compute —'}
                      </p>
                      {hash && <CopyHashBtn value={fmt(hash)}/>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
