'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Copy, Check, Download, Trash2, Lightbulb, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Segment {
  id: number;
  text: string;
  time: string;
  isFinal: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nowHMS() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

function generateIdeas(text: string): string[] {
  if (!text.trim()) return [];
  const lower = text.toLowerCase();
  const ideas: string[] = [];

  const triggers: [RegExp, string][] = [
    [/code|programming|software|app|function|api/,   'Write a technical blog post or tutorial about this topic'],
    [/health|fitness|exercise|diet|wellness/,         'Create a structured wellness plan or habit tracker'],
    [/business|market|product|sales|customer/,        'Draft a business proposal or pitch deck outline'],
    [/learn|study|education|course|skill/,            'Design a learning roadmap or course outline'],
    [/travel|trip|journey|destination/,               'Write a travel guide or itinerary for your audience'],
    [/recipe|food|cook|meal|ingredient/,              'Create a recipe card or meal-prep guide'],
    [/finance|budget|money|invest|saving/,            'Build a personal finance checklist or tracker'],
    [/story|creative|write|novel|character/,          'Outline a short story or character development notes'],
  ];

  for (const [pattern, idea] of triggers) {
    if (pattern.test(lower)) ideas.push(idea);
  }

  // Generic ideas always shown
  ideas.push('Turn this transcript into a structured article or blog post');
  ideas.push('Extract key action items and create a to-do list');
  if (text.split(' ').length > 50) ideas.push('Summarise into a 3-bullet TL;DR');

  return ideas.slice(0, 5);
}

// ─── Language options ─────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'pt-BR', label: 'Portuguese (BR)' },
  { code: 'ar-SA', label: 'Arabic' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function AudioTranscription() {
  const [recording, setRecording]     = useState(false);
  const [segments, setSegments]       = useState<Segment[]>([]);
  const [interim, setInterim]         = useState('');
  const [lang, setLang]               = useState('en-US');
  const [copied, setCopied]           = useState(false);
  const [showIdeas, setShowIdeas]     = useState(false);
  const [supported, setSupported]     = useState(true);
  const [error, setError]             = useState('');
  const segIdRef   = useRef(0);
  const recogRef   = useRef<any>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);

  // Check support
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const fullText = segments
    .filter(s => s.isFinal)
    .map(s => s.text)
    .join(' ');

  const stopRecording = useCallback(() => {
    recogRef.current?.stop();
    recogRef.current = null;
    setRecording(false);
    setInterim('');
  }, []);

  const startRecording = useCallback(() => {
    setError('');
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const recog = new SR();
    recog.continuous      = true;
    recog.interimResults  = true;
    recog.lang            = lang;
    recogRef.current      = recog;

    recog.onresult = (e: any) => {
      let interimStr = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          setSegments(prev => [...prev, {
            id: ++segIdRef.current,
            text: transcript.trim(),
            time: nowHMS(),
            isFinal: true,
          }]);
        } else {
          interimStr += transcript;
        }
      }
      setInterim(interimStr);
    };

    recog.onerror = (e: any) => {
      if (e.error === 'not-allowed') setError('Microphone access was denied. Please allow it in your browser settings.');
      else if (e.error === 'no-speech') setError('No speech detected. Try speaking closer to the microphone.');
      else setError(`Speech recognition error: ${e.error}`);
      stopRecording();
    };

    recog.onend = () => {
      // Auto-restart if still recording (continuous mode can end unexpectedly)
      if (recogRef.current) {
        try { recog.start(); } catch { /* already started */ }
      }
    };

    recog.start();
    setRecording(true);
  }, [lang, stopRecording]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments, interim]);

  const clearAll = () => {
    stopRecording();
    setSegments([]);
    setInterim('');
    setError('');
  };

  const copyText = async () => {
    if (!fullText) return;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const lines = segments.filter(s => s.isFinal).map(s => `[${s.time}] ${s.text}`).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
  };

  const ideas = generateIdeas(fullText);
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  if (!supported) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 text-center bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
        <MicOff size={40} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-2">Browser Not Supported</h2>
        <p className="text-sm text-amber-600 dark:text-amber-300">
          Your browser does not support the Web Speech API. Try Chrome, Edge, or Safari on desktop.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-5 h-[calc(100vh-80px)] flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Language */}
        <div className="relative flex-1 min-w-[140px]">
          <select
            value={lang}
            onChange={e => { if (!recording) setLang(e.target.value); }}
            disabled={recording}
            className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 pr-8 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none disabled:opacity-50"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {fullText && (
            <>
              <button onClick={copyText} title="Copy transcript"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${copied ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 text-emerald-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={downloadTxt} title="Download as .txt"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Download size={13} /> .txt
              </button>
              <button onClick={clearAll} title="Clear all"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                <Trash2 size={13} /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Record button + status */}
      <div className="flex flex-col items-center gap-3 py-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${recording ? 'bg-rose-500 hover:bg-rose-600 scale-105' : 'bg-slate-900 dark:bg-white hover:scale-110'}`}
        >
          {recording && (
            <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
          )}
          {recording
            ? <MicOff size={34} className="text-white" />
            : <Mic size={34} className="text-white dark:text-slate-900" />
          }
        </button>
        <p className={`text-sm font-bold tracking-wide ${recording ? 'text-rose-500' : 'text-slate-400'}`}>
          {recording ? 'Recording… tap to stop' : 'Tap to start recording'}
        </p>
        {error && <p className="text-xs text-rose-500 text-center max-w-xs">{error}</p>}
      </div>

      {/* Transcript area */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-y-auto flex flex-col gap-3 min-h-0">
        {segments.length === 0 && !interim && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-slate-400 dark:text-slate-600">
            <Mic size={40} strokeWidth={1.5} />
            <p className="text-sm">Your transcript will appear here as you speak.</p>
            <p className="text-xs">Speaks clearly at a steady pace for best results.</p>
          </div>
        )}

        {segments.map(seg => (
          <div key={seg.id} className="group flex gap-3 items-start">
            <span className="flex-shrink-0 font-mono text-[10px] text-slate-400 mt-1 w-16">[{seg.time}]</span>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{seg.text}</p>
          </div>
        ))}

        {interim && (
          <div className="flex gap-3 items-start opacity-60">
            <span className="flex-shrink-0 font-mono text-[10px] text-slate-400 mt-1 w-16">[live]</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">{interim}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Stats + Content ideas */}
      <div className="flex flex-col gap-2">
        {/* Stats bar */}
        {(wordCount > 0 || recording) && (
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400">
            <span><span className="font-bold text-slate-700 dark:text-slate-300">{wordCount}</span> words</span>
            <span><span className="font-bold text-slate-700 dark:text-slate-300">{segments.filter(s => s.isFinal).length}</span> segments</span>
            <span><span className="font-bold text-slate-700 dark:text-slate-300">~{Math.max(1, Math.round(wordCount / 200))}</span> min read</span>
            {recording && <span className="ml-auto text-rose-500 font-bold animate-pulse">● REC</span>}
          </div>
        )}

        {/* Content Ideas */}
        {fullText.length > 30 && (
          <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-100 dark:border-fuchsia-900/40 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowIdeas(v => !v)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-100/50 dark:hover:bg-fuchsia-900/30 transition-colors"
            >
              <Lightbulb size={14} />
              Content Ideas from your transcript
              <ChevronDown size={14} className={`ml-auto transition-transform ${showIdeas ? 'rotate-180' : ''}`} />
            </button>
            {showIdeas && (
              <ul className="px-4 pb-3 space-y-1.5">
                {ideas.map((idea, i) => (
                  <li key={i} className="flex gap-2 text-xs text-fuchsia-700 dark:text-fuchsia-300">
                    <span className="font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
