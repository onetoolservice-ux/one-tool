'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Link, Loader2, Copy, Check, Download, AlertTriangle,
  RefreshCw, FileText, Clock, Hash, Upload, ExternalLink,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'url' | 'upload';
type Stage = 'idle' | 'fetching' | 'decoding' | 'loading-model' | 'transcribing' | 'done' | 'error';

interface TranscriptChunk {
  timestamp: [number, number | null];
  text: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractShortcode(url: string): string | null {
  const m = url.match(/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Instagram video extraction — multiple strategies ────────────────────────

const PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/',
];

async function fetchViaProxy(targetUrl: string, timeoutMs = 12000): Promise<string | null> {
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(targetUrl), {
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/json,*/*',
        },
      });
      if (res.ok) return await res.text();
    } catch {
      // try next
    }
  }
  return null;
}

function parseVideoUrlFromHtml(html: string): string | null {
  // Strategy 1: JSON-LD VideoObject contentUrl (SEO structured data — most stable)
  try {
    const ldJsonMatches = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of ldJsonMatches) {
      const parsed = JSON.parse(match[1]);
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      for (const entry of entries) {
        if (entry?.contentUrl?.includes('cdninstagram') || entry?.contentUrl?.includes('fbcdn')) {
          return entry.contentUrl;
        }
        // Nested @graph
        if (entry?.['@graph']) {
          for (const node of entry['@graph']) {
            if (node?.contentUrl) return node.contentUrl;
          }
        }
      }
    }
  } catch { /* ignore parse errors */ }

  // Strategy 2: "video_url":"https://..."
  const m2 = html.match(/"video_url"\s*:\s*"(https:\\u002F\\u002F[^"]+|https:\/\/[^"]+)"/);
  if (m2) {
    try { return JSON.parse(`"${m2[1]}"`); } catch { return m2[1].replace(/\\u002F/g, '/'); }
  }

  // Strategy 3: videoUrl:"https://..."
  const m3 = html.match(/["']?videoUrl["']?\s*:\s*["'](https:\/\/[^"']+)["']/);
  if (m3) return m3[1];

  // Strategy 4: og:video meta tag
  const m4 = html.match(/<meta[^>]+(?:property="og:video"|name="og:video")[^>]+content="([^"]+)"/);
  if (m4) return m4[1];

  // Strategy 5: og:video:secure_url
  const m5 = html.match(/<meta[^>]+property="og:video:secure_url"[^>]+content="([^"]+)"/);
  if (m5) return m5[1];

  // Strategy 6: <video src="..."
  const m6 = html.match(/<video[^>]+src="(https:\/\/[^"]+(?:cdninstagram|fbcdn)[^"]+)"/);
  if (m6) return m6[1];

  // Strategy 7: plain CDN URL pattern in JS
  const m7 = html.match(/(https:\/\/[^"'\s]+(?:cdninstagram\.com|fbcdn\.net)[^"'\s]+\.mp4[^"'\s]*)/);
  if (m7) return m7[1];

  return null;
}

async function getInstagramVideoUrl(shortcode: string): Promise<string> {
  const urls = [
    `https://www.instagram.com/p/${shortcode}/`,
    `https://www.instagram.com/reel/${shortcode}/`,
    `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`,
    `https://www.instagram.com/reel/${shortcode}/embed/captioned/`,
  ];

  for (const url of urls) {
    const html = await fetchViaProxy(url);
    if (!html) continue;
    const videoUrl = parseVideoUrlFromHtml(html);
    if (videoUrl) return videoUrl;
  }

  throw new Error('EXTRACTION_FAILED');
}

// ─── Fetch video blob via proxy ───────────────────────────────────────────────

async function fetchVideoBlob(videoUrl: string): Promise<Blob> {
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(videoUrl), {
        signal: AbortSignal.timeout(60000),
      });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 1000) return blob;
      }
    } catch { /* try next */ }
  }
  // Last resort: direct fetch (works if CDN allows it)
  const res = await fetch(videoUrl, { signal: AbortSignal.timeout(60000) });
  if (res.ok) return res.blob();
  throw new Error('Failed to download video');
}

// ─── Audio extraction ─────────────────────────────────────────────────────────

async function extractAudioSamples(source: Blob | File): Promise<Float32Array> {
  const TARGET_SR = 16000;
  const buf = await source.arrayBuffer();
  const tempCtx = new AudioContext();
  const decoded = await tempCtx.decodeAudioData(buf);
  await tempCtx.close();
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * TARGET_SR), TARGET_SR);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

// ─── Whisper transcription ────────────────────────────────────────────────────

async function transcribeAudio(
  samples: Float32Array,
  onProgress: (msg: string) => void
): Promise<TranscriptChunk[]> {
  onProgress('Loading Whisper model (first run ~244 MB, cached after)…');
  const { pipeline, env } = await import('@xenova/transformers');
  env.allowLocalModels = false;

  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {
    progress_callback: (p: { status: string; progress?: number }) => {
      if (p.status === 'downloading' && p.progress)
        onProgress(`Downloading model… ${Math.round(p.progress)}%`);
    },
  });

  onProgress('Transcribing…');
  const result = await (transcriber as CallableFunction)(samples, {
    task: 'transcribe',
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
  }) as { chunks?: TranscriptChunk[]; text?: string };

  if (result.chunks?.length) return result.chunks;
  return [{ timestamp: [0, null], text: result.text ?? '' }];
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InstagramTranscript() {
  const [mode, setMode] = useState<Mode>('url');
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorType, setErrorType] = useState<'extraction' | 'other' | ''>('');
  const [chunks, setChunks] = useState<TranscriptChunk[]>([]);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const abortRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullText = chunks.map((c) => c.text).join(' ').trim();
  const words = wordCount(fullText);

  // ── Core pipeline ────────────────────────────────────────────────────────────
  async function runTranscription(source: Blob | File) {
    abortRef.current = false;
    setChunks([]);
    setErrorType('');

    try {
      setStage('decoding');
      setStatusMsg('Extracting audio from video…');
      const samples = await extractAudioSamples(source);
      if (abortRef.current) return;

      setStage('loading-model');
      const result = await transcribeAudio(samples, (msg) => {
        setStatusMsg(msg);
        setStage('transcribing');
      });
      if (abortRef.current) return;

      setChunks(result);
      setStage('done');
    } catch (err) {
      if (abortRef.current) return;
      setStage('error');
      setErrorType('other');
      setStatusMsg(err instanceof Error ? err.message : 'Transcription failed');
    }
  }

  // ── URL mode ─────────────────────────────────────────────────────────────────
  const runFromUrl = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const shortcode = extractShortcode(trimmed);
    if (!shortcode) {
      setStage('error');
      setErrorType('other');
      setStatusMsg('Invalid URL. Paste an Instagram Reel or post link.');
      return;
    }

    abortRef.current = false;
    setStage('fetching');
    setChunks([]);
    setErrorType('');
    setStatusMsg('Fetching video from Instagram…');

    try {
      const videoUrl = await getInstagramVideoUrl(shortcode);
      if (abortRef.current) return;

      setStatusMsg('Downloading video…');
      const blob = await fetchVideoBlob(videoUrl);
      if (abortRef.current) return;

      await runTranscription(blob);
    } catch (err) {
      if (abortRef.current) return;
      setStage('error');
      if (err instanceof Error && err.message === 'EXTRACTION_FAILED') {
        setErrorType('extraction');
        setStatusMsg('');
      } else {
        setErrorType('other');
        setStatusMsg(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── File upload mode ──────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      setStage('error');
      setErrorType('other');
      setStatusMsg('Please upload a video or audio file (MP4, MOV, MP3, etc.)');
      return;
    }
    runTranscription(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    abortRef.current = true;
    setStage('idle');
    setChunks([]);
    setErrorType('');
    setStatusMsg('');
    setUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([fullText], { type: 'text/plain' }));
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
  };

  const downloadSrt = () => {
    const srt = chunks.map((c, i) => {
      const s = `00:${formatTime(c.timestamp[0])},000`;
      const e = c.timestamp[1] !== null ? `00:${formatTime(c.timestamp[1])},000` : s;
      return `${i + 1}\n${s} --> ${e}\n${c.text.trim()}\n`;
    }).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([srt], { type: 'text/plain' }));
    a.download = `transcript-${Date.now()}.srt`;
    a.click();
  };

  const isProcessing = ['fetching', 'decoding', 'loading-model', 'transcribing'].includes(stage);
  const STEPS = ['fetching', 'decoding', 'loading-model', 'transcribing'] as const;
  const currentStepIdx = STEPS.indexOf(stage as typeof STEPS[number]);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Instagram to Transcript</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Paste a public Reel URL — or download the video and upload it for guaranteed results
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* Mode tabs */}
        {stage === 'idle' || stage === 'error' ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {([['url', 'Paste URL'], ['upload', 'Upload Video']] as const).map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setStage('idle'); setErrorType(''); }}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${
                    mode === m
                      ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-b-2 border-pink-500'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {mode === 'url' ? (
                /* ── URL input ── */
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && runFromUrl()}
                        placeholder="https://www.instagram.com/reel/ABC123/"
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-pink-400 transition-colors"
                      />
                    </div>
                    <button
                      onClick={runFromUrl}
                      disabled={!url.trim()}
                      className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      Transcribe
                    </button>
                  </div>

                  {/* Extraction error inline */}
                  {stage === 'error' && errorType === 'extraction' && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            Instagram blocked direct access
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            Instagram prevents automated video extraction. Download the video first, then use the <strong>Upload Video</strong> tab — transcription will work perfectly.
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Free download sites</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['snapinsta.app', 'https://snapinsta.app'],
                          ['igram.world', 'https://igram.world'],
                          ['ssinstagram.com', 'https://ssinstagram.com'],
                          ['save-insta.com', 'https://save-insta.com'],
                        ].map(([name, href]) => (
                          <a
                            key={name}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-pink-400 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                            {name}
                          </a>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Download from any site above → come back → <button onClick={() => { setMode('upload'); setStage('idle'); setErrorType(''); }} className="underline text-pink-600 dark:text-pink-400 font-semibold">switch to Upload tab</button>
                      </p>
                    </div>
                  )}

                  {stage === 'error' && errorType === 'other' && (
                    <p className="text-sm text-red-600 dark:text-red-400">{statusMsg}</p>
                  )}

                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Public Reels only. If extraction fails, use the Upload tab — it always works.
                  </p>
                </div>
              ) : (
                /* ── File upload ── */
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                      dragOver
                        ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Drop your Instagram video here
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      or click to browse — MP4, MOV, MKV, MP3, M4A
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,audio/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />
                  </div>

                  {stage === 'error' && (
                    <p className="text-sm text-red-600 dark:text-red-400">{statusMsg}</p>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-600 dark:text-slate-300">How to get the video:</p>
                      <p>1. Open Instagram → find the Reel</p>
                      <p>2. Go to <a href="https://snapinsta.app" target="_blank" rel="noopener noreferrer" className="text-pink-600 dark:text-pink-400 underline">snapinsta.app</a>, paste the URL, download MP4</p>
                      <p>3. Drop the downloaded file above</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Processing progress */}
        {isProcessing && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col items-center gap-5 text-center">
              {/* Step indicators */}
              <div className="flex items-center gap-0 w-full max-w-xs">
                {STEPS.map((s, i) => {
                  const done = i < currentStepIdx;
                  const active = i === currentStepIdx;
                  const label = ['Fetch', 'Decode', 'Model', 'AI'][i];
                  return (
                    <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          done ? 'bg-emerald-500 text-white' :
                          active ? 'bg-pink-500 text-white ring-4 ring-pink-100 dark:ring-pink-900/40' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {done ? '✓' : active ? <Loader2 className="w-4 h-4 animate-spin" /> : i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`absolute top-4 left-8 w-[calc(100%-0.5rem)] h-0.5 ${done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} style={{ width: '100%', left: '100%', transform: 'translateX(-50%)' }} />
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${active ? 'text-pink-600 dark:text-pink-400' : 'text-slate-400'}`}>{label}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">{statusMsg}</p>

              <button
                onClick={() => { abortRef.current = true; setStage('idle'); }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Transcript */}
        {stage === 'done' && chunks.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Hash, label: 'Words', value: words.toLocaleString() },
                { icon: Clock, label: 'Read time', value: words <= 200 ? '< 1 min' : `${Math.ceil(words / 200)} min` },
                { icon: FileText, label: 'Segments', value: chunks.length.toString() },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
                  <Icon className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{value}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* Transcript card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">Transcript</span>
                <div className="flex gap-2">
                  <button onClick={copyText} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={downloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> TXT
                  </button>
                  <button onClick={downloadSrt} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 text-pink-700 dark:text-pink-300 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> SRT
                  </button>
                  <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> New
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-1 max-h-[480px] overflow-y-auto">
                {chunks.map((chunk, i) => (
                  <div key={i} className="flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 py-1.5 transition-colors">
                    <span className="text-[11px] font-mono text-pink-400 shrink-0 mt-0.5 w-12 tabular-nums">
                      {chunk.timestamp[0] > 0 ? formatTime(chunk.timestamp[0]) : '00:00'}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{chunk.text.trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Note:</span> For personal, educational, and accessibility use only. Do not reproduce or monetise others' content without permission. All processing runs locally in your browser — no audio or video is sent to any server.
          </p>
        </div>
      </div>
    </div>
  );
}
