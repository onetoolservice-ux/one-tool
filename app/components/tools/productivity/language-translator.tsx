"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Languages, ArrowRightLeft, Copy, Check, Download,
  Mic, MicOff, Upload, Globe, RotateCcw, Loader2,
  AlertCircle, FileText, X
} from 'lucide-react';

// ─── Language Data ─────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en',    name: 'English'                 },
  { code: 'hi',    name: 'Hindi'                   },
  { code: 'sa',    name: 'Sanskrit'                },
  { code: 'ar',    name: 'Arabic'                  },
  { code: 'fr',    name: 'French'                  },
  { code: 'es',    name: 'Spanish'                 },
  { code: 'de',    name: 'German'                  },
  { code: 'zh-CN', name: 'Chinese (Simplified)'    },
  { code: 'zh-TW', name: 'Chinese (Traditional)'   },
  { code: 'ja',    name: 'Japanese'                },
  { code: 'ru',    name: 'Russian'                 },
  { code: 'ta',    name: 'Tamil'                   },
  { code: 'te',    name: 'Telugu'                  },
  { code: 'bn',    name: 'Bengali'                 },
  { code: 'ur',    name: 'Urdu'                    },
  { code: 'pt',    name: 'Portuguese'              },
  { code: 'it',    name: 'Italian'                 },
  { code: 'ko',    name: 'Korean'                  },
  { code: 'nl',    name: 'Dutch'                   },
  { code: 'tr',    name: 'Turkish'                 },
  { code: 'mr',    name: 'Marathi'                 },
  { code: 'gu',    name: 'Gujarati'                },
  { code: 'kn',    name: 'Kannada'                 },
  { code: 'ml',    name: 'Malayalam'               },
  { code: 'pa',    name: 'Punjabi'                 },
  { code: 'pl',    name: 'Polish'                  },
  { code: 'sv',    name: 'Swedish'                 },
  { code: 'fi',    name: 'Finnish'                 },
  { code: 'da',    name: 'Danish'                  },
  { code: 'no',    name: 'Norwegian'               },
  { code: 'id',    name: 'Indonesian'              },
  { code: 'ms',    name: 'Malay'                   },
  { code: 'th',    name: 'Thai'                    },
  { code: 'vi',    name: 'Vietnamese'              },
  { code: 'he',    name: 'Hebrew'                  },
  { code: 'fa',    name: 'Persian (Farsi)'         },
];

const SOURCE_LANGUAGES = [{ code: 'auto', name: 'Auto Detect' }, ...LANGUAGES];

// ─── Translation Helpers ────────────────────────────────────────────────────────

async function translateSingle(
  text: string,
  from: string,
  to: string
): Promise<{ translated: string; detected?: string }> {
  const pair = from === 'auto' ? `autodetect|${to}` : `${from}|${to}`;
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`
  );
  if (!res.ok) throw new Error('Translation service unavailable');
  const data = await res.json();
  if (data.responseStatus !== 200)
    throw new Error(data.responseDetails || 'Translation failed');

  let detected: string | undefined;
  if (from === 'auto') {
    const matches = data.matches as Array<{ language: string }> | undefined;
    detected = matches?.[0]?.language ?? undefined;
  }
  return { translated: data.responseData.translatedText as string, detected };
}

function chunkText(text: string, size = 450): string[] {
  if (text.length <= size) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    if (start + size >= text.length) { chunks.push(text.slice(start)); break; }
    let end = start + size;
    const nl = text.lastIndexOf('\n', end);
    const dot = text.lastIndexOf('. ', end);
    const sp = text.lastIndexOf(' ', end);
    if (nl > start + 80)       end = nl + 1;
    else if (dot > start + 80) end = dot + 2;
    else if (sp > start + 40)  end = sp + 1;
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

async function translateFull(
  text: string,
  from: string,
  to: string,
  onProgress: (p: number) => void
): Promise<{ translated: string; detected?: string }> {
  const chunks = chunkText(text.trim());
  const results: string[] = [];
  let detected: string | undefined;
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 350));
    const r = await translateSingle(chunks[i], from, to);
    results.push(r.translated);
    if (i === 0) detected = r.detected;
    onProgress(((i + 1) / chunks.length) * 100);
  }
  return { translated: results.join(' '), detected };
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, '\n').trim();
}

// ─── Main Component ─────────────────────────────────────────────────────────────

type Mode = 'text' | 'file' | 'url';

export const LanguageTranslator = () => {
  const [mode, setMode]             = useState<Mode>('text');
  const [inputText, setInputText]   = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('hi');
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [copied, setCopied]         = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [urlInput, setUrlInput]     = useState('');
  const [fileName, setFileName]     = useState('');

  const fileRef        = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const accRef         = useRef('');
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Debounced auto-translate on text input ───────────────────────────────────

  useEffect(() => {
    if (mode !== 'text') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputText.trim()) { setOutputText(''); setDetectedLang(''); return; }
    debounceRef.current = setTimeout(() => {
      doTranslate(inputText);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, sourceLang, targetLang]);

  // ─── Core translate ──────────────────────────────────────────────────────────

  const doTranslate = async (text: string, from = sourceLang, to = targetLang) => {
    const trimmed = text.trim();
    if (!trimmed) { setOutputText(''); return; }
    if (from !== 'auto' && from === to) { setOutputText(trimmed); return; }
    setTranslating(true);
    setError('');
    setProgress(0);
    try {
      const { translated, detected } = await translateFull(trimmed, from, to, setProgress);
      setOutputText(translated);
      if (detected) {
        const lang = LANGUAGES.find(l => detected.startsWith(l.code));
        setDetectedLang(lang ? lang.name : detected);
      } else {
        setDetectedLang('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Translation failed. Try again.');
    } finally {
      setTranslating(false);
      setProgress(0);
    }
  };

  // ─── Swap languages ──────────────────────────────────────────────────────────

  const swapLangs = () => {
    if (sourceLang === 'auto') return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  // ─── Voice input ─────────────────────────────────────────────────────────────

  const toggleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('Voice recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    accRef.current = inputText;
    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let finalPart = '';
      let interim   = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalPart += e.results[i][0].transcript + ' ';
        else                       interim   += e.results[i][0].transcript;
      }
      if (finalPart) { accRef.current += finalPart; setInputText(accRef.current); }
      setInterimText(interim);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      setError(`Voice error: ${e.error}`);
      setIsListening(false);
      setInterimText('');
    };
    rec.onend = () => {
      setIsListening(false);
      setInterimText('');
      if (accRef.current.trim()) doTranslate(accRef.current);
    };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  // ─── File upload ─────────────────────────────────────────────────────────────

  const handleFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['txt', 'csv', 'md', 'json', 'xml', 'html'].includes(ext)) {
      setError('Unsupported file type. Supported: TXT, CSV, MD, JSON, XML, HTML');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { setError('File too large. Max 2 MB.'); return; }
    setFileName(file.name);
    setError('');
    let content = await file.text();
    if (ext === 'html') content = stripHtml(content);
    if (content.length > 5000) {
      content = content.slice(0, 5000);
      setError('File content truncated to 5 000 characters for translation.');
    }
    setInputText(content);
    setOutputText('');
  };

  // ─── URL translation ─────────────────────────────────────────────────────────

  const translateUrl = async () => {
    let url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    setTranslating(true);
    setError('');
    setOutputText('');
    setInputText('');
    try {
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxy);
      if (!res.ok) throw new Error('Failed to fetch URL');
      const data = await res.json() as { contents?: string };
      if (!data.contents) throw new Error('No content returned from URL');
      const text = stripHtml(data.contents);
      if (!text.trim()) throw new Error('No readable text found on the page');
      const limited = text.length > 3000 ? text.slice(0, 3000) + '\n[Truncated to 3 000 characters]' : text;
      setInputText(limited);
      setTranslating(false);
      await doTranslate(limited);
    } catch (e) {
      setTranslating(false);
      setError(e instanceof Error ? e.message : 'Failed to fetch URL.');
    }
  };

  // ─── Copy / Download ─────────────────────────────────────────────────────────

  const copyOutput = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const a    = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(blob),
      download: `translated-${targetLang}.txt`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clear = () => {
    setInputText(''); setOutputText(''); setError('');
    setDetectedLang(''); setFileName(''); setUrlInput('');
    setProgress(0);
  };

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const targetName = LANGUAGES.find(l => l.code === targetLang)?.name ?? targetLang;
  const sourceName = sourceLang === 'auto'
    ? 'Auto Detect'
    : (LANGUAGES.find(l => l.code === sourceLang)?.name ?? sourceLang);

  // ─── Output panel (shared across modes) ──────────────────────────────────────

  const OutputPanel = () => (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          {targetName}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={copyOutput} disabled={!outputText}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-violet-500 disabled:opacity-30 transition-all"
            title="Copy translation">
            {copied
              ? <Check size={13} className="text-green-500" />
              : <Copy size={13} />}
          </button>
          <button onClick={downloadOutput} disabled={!outputText}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-violet-500 disabled:opacity-30 transition-all"
            title="Download as .txt">
            <Download size={13} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {translating && progress > 0 && (
        <div className="h-0.5 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
          <div className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex-1 p-5 overflow-y-auto">
        {translating && !outputText
          ? <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={24} className="animate-spin text-violet-500" />
              <p className="text-sm text-slate-400">Translating…</p>
            </div>
          : outputText
            ? <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {outputText}
              </p>
            : <p className="text-sm text-slate-400 italic">Translation will appear here…</p>
        }
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">

      {/* ── TOOLBAR ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <Languages size={18} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Language Translator</h2>
            <p className="text-[11px] text-slate-400">35+ languages · Voice · File · Website</p>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 ml-2">
          {(['text', 'file', 'url'] as Mode[]).map(m => (
            <button key={m}
              onClick={() => { setMode(m); clear(); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all
                ${mode === m
                  ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              {m === 'url' ? 'Website' : m === 'file' ? 'File' : 'Text'}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button onClick={clear}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 font-semibold flex items-center gap-1.5 transition-colors">
          <RotateCcw size={11} /> Clear
        </button>
      </div>

      {/* ── LANGUAGE BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center gap-3 flex-shrink-0">
        {/* Source */}
        <div className="flex-1">
          <select value={sourceLang} onChange={e => setSourceLang(e.target.value)}
            className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer">
            {SOURCE_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
          {detectedLang && sourceLang === 'auto' && (
            <p className="text-[10px] text-violet-500 mt-1 ml-1">Detected: {detectedLang}</p>
          )}
        </div>

        {/* Swap */}
        <button onClick={swapLangs} disabled={sourceLang === 'auto'}
          className={`p-2 rounded-lg transition-all
            ${sourceLang === 'auto'
              ? 'opacity-30 cursor-not-allowed text-slate-400'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-violet-600'}`}
          title="Swap languages">
          <ArrowRightLeft size={16} />
        </button>

        {/* Target */}
        <div className="flex-1">
          <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
            className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* ── ERROR BAR ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 flex-shrink-0">
          <AlertCircle size={14} />
          <span className="flex-1 text-xs">{error}</span>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {/* ── CONTENT ───────────────────────────────────────────────────────────── */}

      {/* TEXT MODE */}
      {mode === 'text' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Input */}
          <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                {sourceName}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">{inputText.length} chars</span>
                <button onClick={toggleVoice}
                  className={`p-1.5 rounded-md transition-all
                    ${isListening
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-violet-500'}`}
                  title={isListening ? 'Stop recording' : 'Voice input'}>
                  {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                </button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden flex flex-col">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                spellCheck={false}
                className="flex-1 p-5 resize-none text-sm leading-relaxed outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                placeholder={isListening ? '🎙 Listening… speak now' : 'Type or paste text here…'}
              />
              {isListening && interimText && (
                <p className="absolute bottom-14 left-5 right-5 text-sm text-slate-400 italic pointer-events-none">
                  {interimText}
                </p>
              )}
            </div>

            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-shrink-0 min-h-[40px]">
              {isListening && (
                <span className="text-[11px] text-red-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                  Recording…
                </span>
              )}
              {translating && !isListening && (
                <span className="text-[11px] text-violet-500 flex items-center gap-1.5">
                  <Loader2 size={11} className="animate-spin" />
                  Translating…
                </span>
              )}
            </div>
          </div>

          <OutputPanel />
        </div>
      )}

      {/* FILE MODE */}
      {mode === 'file' && (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Upload File</span>
            </div>

            {/* Drop zone */}
            <div
              className="m-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 flex-shrink-0 min-h-[160px]"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" className="hidden"
                accept=".txt,.csv,.md,.json,.xml,.html"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
              {fileName ? (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mx-auto mb-3">
                    <FileText size={20} className="text-violet-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fileName}</p>
                  <p className="text-xs text-violet-500 mt-2">Click to change file</p>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <Upload size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-semibold">Drop file here or click to browse</p>
                  <p className="text-xs mt-2 text-slate-400">TXT · CSV · MD · JSON · XML · HTML · Max 2 MB</p>
                  <p className="text-xs mt-1 text-amber-500">PDF and DOCX not supported</p>
                </div>
              )}
            </div>

            {/* Preview + translate button */}
            {inputText && (
              <div className="flex-1 flex flex-col overflow-hidden mx-4 mb-4 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Extracted Content</span>
                  <span className="text-[11px] text-slate-400">{inputText.length} chars</span>
                </div>
                <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-y-auto">
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">
                    {inputText.slice(0, 600)}{inputText.length > 600 ? '\n…' : ''}
                  </p>
                </div>
                <button onClick={() => doTranslate(inputText)} disabled={translating}
                  className="w-full py-2 text-xs font-bold bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  {translating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                  Translate File Content
                </button>
              </div>
            )}
          </div>

          <OutputPanel />
        </div>
      )}

      {/* URL MODE */}
      {mode === 'url' && (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* URL input bar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 gap-2">
                  <Globe size={14} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && translateUrl()}
                    placeholder="https://example.com"
                    className="flex-1 py-2 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  />
                  {urlInput && (
                    <button onClick={() => setUrlInput('')}
                      className="text-slate-400 hover:text-slate-600">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <button onClick={translateUrl} disabled={!urlInput.trim() || translating}
                  className="px-4 py-2 text-xs font-bold bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
                  {translating ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                  Fetch & Translate
                </button>
              </div>
              <p className="text-[11px] text-amber-500 mt-2 flex items-center gap-1">
                <AlertCircle size={10} />
                Some websites may block access due to CORS restrictions.
              </p>
            </div>

            {/* Extracted content */}
            {inputText ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Extracted Text</span>
                  <span className="text-[11px] text-slate-400">{inputText.length} chars</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">
                    {inputText.slice(0, 1200)}{inputText.length > 1200 ? '\n…' : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-slate-400 p-8">
                <div>
                  <Globe size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-semibold">Enter a URL to translate webpage content</p>
                  <p className="text-xs mt-2 text-slate-400">Extracts visible text from the page then translates it</p>
                </div>
              </div>
            )}
          </div>

          <OutputPanel />
        </div>
      )}
    </div>
  );
};
