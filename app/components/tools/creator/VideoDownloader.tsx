"use client";
import { useState, useEffect } from 'react';
import { Download, Link, AlertTriangle, CheckCircle, Loader2, ExternalLink, Music, Video, Clipboard, Copy, Subtitles, History, X, ChevronDown, ChevronUp } from 'lucide-react';

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-violet-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

interface Platform {
  name: string;
  color: string;
  bg: string;
  patterns: RegExp[];
  supportsSubtitles?: boolean;
  supportsTikTokWatermark?: boolean;
}

const PLATFORMS: Platform[] = [
  { name: 'YouTube', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', patterns: [/youtube\.com/, /youtu\.be/], supportsSubtitles: true },
  { name: 'Instagram', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800', patterns: [/instagram\.com/] },
  { name: 'Twitter / X', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800', patterns: [/twitter\.com/, /x\.com/] },
  { name: 'TikTok', color: 'text-slate-800 dark:text-slate-200', bg: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700', patterns: [/tiktok\.com/], supportsTikTokWatermark: true },
  { name: 'Facebook', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', patterns: [/facebook\.com/, /fb\.watch/] },
  { name: 'Reddit', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', patterns: [/reddit\.com/] },
  { name: 'Vimeo', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800', patterns: [/vimeo\.com/] },
  { name: 'Twitch', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', patterns: [/twitch\.tv/] },
  { name: 'SoundCloud', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', patterns: [/soundcloud\.com/] },
  { name: 'Pinterest', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', patterns: [/pinterest\.com/, /pin\.it/] },
  { name: 'Dailymotion', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', patterns: [/dailymotion\.com/] },
  { name: 'Bilibili', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800', patterns: [/bilibili\.com/] },
];

const QUALITY_OPTIONS = ['max', '2160', '1440', '1080', '720', '480', '360', '240', '144'] as const;
type Quality = typeof QUALITY_OPTIONS[number];

const AUDIO_FORMATS = ['mp3', 'ogg', 'wav', 'opus', 'best'] as const;
type AudioFormat = typeof AUDIO_FORMATS[number];

interface CobaltResult {
  status: 'redirect' | 'tunnel' | 'stream' | 'picker' | 'error';
  url?: string;
  urls?: string;
  picker?: Array<{ url: string; thumb?: string; type?: string }>;
  filename?: string;
  error?: { code: string };
}

interface HistoryEntry {
  url: string;
  platform: string;
  filename: string;
  downloadUrl: string;
  audioOnly: boolean;
  ts: number;
}

const HISTORY_KEY = 'otsd-video-dl-history';

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(h: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 10)));
}

function detectPlatform(url: string): Platform | null {
  for (const p of PLATFORMS) {
    if (p.patterns.some((r) => r.test(url))) return p;
  }
  return null;
}

function guessFilename(result: CobaltResult, audioOnly: boolean, format: AudioFormat): string {
  if (result.filename) return result.filename;
  const ext = audioOnly ? (format === 'best' ? 'mp3' : format) : 'mp4';
  return `download.${ext}`;
}

export function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<Quality>('1080');
  const [audioOnly, setAudioOnly] = useState(false);
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('mp3');
  const [subtitles, setSubtitles] = useState(false);
  const [subtitleLang, setSubtitleLang] = useState('en');
  const [removeWatermark, setRemoveWatermark] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<CobaltResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const platform = detectPlatform(url);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith('http')) { setUrl(text); setStatus('idle'); }
    } catch { /* clipboard not available */ }
  };

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    setCopied(false);

    try {
      const body: Record<string, unknown> = {
        url: trimmed,
        videoQuality: quality,
        audioFormat: audioOnly ? audioFormat : 'mp3',
        downloadMode: audioOnly ? 'audio' : 'auto',
        disableMetadata: false,
      };

      if (subtitles && platform?.supportsSubtitles) {
        body.subtitleLang = subtitleLang;
      }
      if (platform?.supportsTikTokWatermark && removeWatermark) {
        body.tiktokH265 = true;
      }

      const res = await fetch('https://api.cobalt.tools/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data: CobaltResult = await res.json();
      if (data.status === 'error') throw new Error(data.error?.code || 'Downloader API error');

      setResult(data);
      setStatus('done');

      // save to history
      const dlUrl = data.url || data.urls || data.picker?.[0]?.url || '';
      if (dlUrl) {
        const entry: HistoryEntry = {
          url: trimmed,
          platform: platform?.name || 'Unknown',
          filename: guessFilename(data, audioOnly, audioFormat),
          downloadUrl: dlUrl,
          audioOnly,
          ts: Date.now(),
        };
        const newHistory = [entry, ...loadHistory().filter((h) => h.url !== trimmed)];
        saveHistory(newHistory);
        setHistory(newHistory);
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to fetch download link');
      setStatus('error');
    }
  };

  const handleCopyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadUrl = result?.url || result?.urls;
  const pickerItems = result?.picker || [];
  const filename = result ? guessFilename(result, audioOnly, audioFormat) : '';

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-800/50">
              <Download className="w-5 h-5 text-violet-600 dark:text-violet-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Video Downloader</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">YouTube · Instagram · Twitter/X · TikTok · Facebook · Reddit · Vimeo + more</p>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              History ({history.length})
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* History panel */}
      {showHistory && history.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className={labelCls}>Recent Downloads</p>
            <button
              onClick={() => { saveHistory([]); setHistory([]); setShowHistory(false); }}
              className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{h.filename}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{h.platform} · {h.audioOnly ? 'Audio' : 'Video'} · {new Date(h.ts).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setUrl(h.url); setShowHistory(false); setStatus('idle'); }}
                    className="text-[10px] px-2 py-1 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors"
                  >
                    Re-use
                  </button>
                  <a href={h.downloadUrl} download className="text-[10px] px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors">
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL Input */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div>
          <p className={labelCls + ' mb-1'}>Paste video URL</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-violet-400 transition-colors w-full"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => { setUrl(e.target.value); setStatus('idle'); }}
                onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
              />
            </div>
            <button
              onClick={handlePaste}
              title="Paste from clipboard"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-400 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400 text-xs font-medium transition-colors whitespace-nowrap"
            >
              <Clipboard className="w-3.5 h-3.5" /> Paste
            </button>
            {url && (
              <button onClick={() => { setUrl(''); setStatus('idle'); setResult(null); }} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {platform && (
            <p className={`text-xs mt-1.5 font-medium ${platform.color}`}>Detected: {platform.name}</p>
          )}
        </div>

        {/* Options row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={labelCls + ' mb-1'}>Video Quality</p>
            <select className={inputCls} value={quality} onChange={(e) => setQuality(e.target.value as Quality)} disabled={audioOnly}>
              {QUALITY_OPTIONS.map((q) => (
                <option key={q} value={q}>{q === 'max' ? 'Best available' : q + 'p'}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${audioOnly ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${audioOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Music className="w-3 h-3" /> Audio only
              </span>
              <input type="checkbox" className="hidden" checked={audioOnly} onChange={(e) => setAudioOnly(e.target.checked)} />
            </label>
          </div>
        </div>

        {/* Audio format (when audio only) */}
        {audioOnly && (
          <div>
            <p className={labelCls + ' mb-1'}>Audio Format</p>
            <div className="flex gap-2 flex-wrap">
              {AUDIO_FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setAudioFormat(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors uppercase ${audioFormat === f ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-600'}`}
                >
                  {f === 'best' ? 'Best' : f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Platform-specific options */}
        {platform?.supportsSubtitles && !audioOnly && (
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${subtitles ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${subtitles ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Subtitles className="w-3 h-3" /> Download subtitles / CC (YouTube)
              </span>
              <input type="checkbox" className="hidden" checked={subtitles} onChange={(e) => setSubtitles(e.target.checked)} />
            </label>
            {subtitles && (
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">Language code:</p>
                <input
                  type="text"
                  className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-violet-400 w-20"
                  value={subtitleLang}
                  onChange={(e) => setSubtitleLang(e.target.value)}
                  placeholder="en"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">en · hi · fr · es · de · ja</p>
              </div>
            )}
          </div>
        )}

        {platform?.supportsTikTokWatermark && (
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            <div className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${removeWatermark ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${removeWatermark ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Remove TikTok watermark</span>
            <input type="checkbox" className="hidden" checked={removeWatermark} onChange={(e) => setRemoveWatermark(e.target.checked)} />
          </label>
        )}

        <button
          onClick={handleDownload}
          disabled={!url.trim() || status === 'loading'}
          className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Fetching link...</>
          ) : (
            <><Download className="w-4 h-4" /> Get Download Link</>
          )}
        </button>
      </div>

      {/* Success: single URL */}
      {status === 'done' && downloadUrl && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Ready to download</p>
          </div>
          {filename && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded truncate">{filename}</p>
          )}
          <div className="flex gap-2">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={filename}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              {audioOnly ? `Download ${audioFormat === 'best' ? 'Audio' : audioFormat.toUpperCase()}` : `Download${quality !== 'max' ? ' (' + quality + 'p)' : ''}`}
            </a>
            <button
              onClick={() => handleCopyLink(downloadUrl)}
              title="Copy direct link (for IDM / aria2 / curl)"
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${copied ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-600'}`}
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 text-center">
            If browser blocks it, right-click → Save link as · Or copy link to IDM / aria2
          </p>
        </div>
      )}

      {/* Success: picker (carousel / playlist) */}
      {status === 'done' && pickerItems.length > 0 && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{pickerItems.length} items found (carousel / playlist)</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {pickerItems.map((item, i) => (
              <div key={i} className="space-y-1">
                {item.thumb && <img src={item.thumb} alt="" className="w-full h-20 object-cover rounded-lg" />}
                <div className="flex gap-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    {item.type === 'audio' ? <Music className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    {i + 1}
                  </a>
                  <button
                    onClick={() => handleCopyLink(item.url)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Could not fetch download link</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Try these free downloaders directly:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'cobalt.tools', href: 'https://cobalt.tools', note: 'Best — YT, IG, TT, X' },
              { label: 'snapinsta.app', href: 'https://snapinsta.app', note: 'Instagram' },
              { label: 'y2mate.com', href: 'https://y2mate.com', note: 'YouTube' },
              { label: 'ssstwitter.com', href: 'https://ssstwitter.com', note: 'Twitter / X' },
              { label: 'tikmate.online', href: 'https://tikmate.online', note: 'TikTok' },
              { label: 'fdown.net', href: 'https://fdown.net', note: 'Facebook' },
            ].map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-violet-400 dark:hover:border-violet-600 transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{s.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{s.note}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-violet-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Supported platforms */}
      {status === 'idle' && !showHistory && (
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-4">
          <p className={labelCls + ' mb-3'}>Supported Platforms</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <span key={p.name} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${p.bg} ${p.color}`}>
                {p.name}
              </span>
            ))}
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              + more
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Powered by{' '}
            <a href="https://cobalt.tools" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">
              cobalt.tools
            </a>{' '}
            — free, open-source media downloader API. No ads, no tracking.
          </p>
        </div>
      )}

      <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Only download content you own or have permission to download. Respect copyright and platform terms of service.
        </p>
      </div>
    </div>
  );
}
