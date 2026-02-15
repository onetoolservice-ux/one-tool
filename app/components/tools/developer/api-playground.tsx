"use client";
import React, { useState, useRef } from 'react';
import { Play, Plus, X, Clock, Copy, Check, Globe, Loader2 } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'] as const;
type Method = typeof METHODS[number];

const METHOD_COLORS: Record<Method, string> = {
  GET:    'bg-blue-600',
  POST:   'bg-emerald-600',
  PUT:    'bg-amber-500',
  PATCH:  'bg-violet-600',
  DELETE: 'bg-rose-600',
  HEAD:   'bg-slate-500',
};

// ── SSRF guard (unchanged from original) ──────────────────────────────────
function isInternalIP(hostname: string): boolean {
  const blocked = ['localhost','127.0.0.1','::1','0.0.0.0','localhost.localdomain','localhost6','localhost6.localdomain6','local'];
  if (blocked.includes(hostname.toLowerCase())) return true;
  if (hostname.toLowerCase().includes('localhost')) return true;
  const parts = hostname.split('.').map(Number);
  if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 127) return true;
    if (parts[0] >= 224) return true;
  }
  if (hostname.startsWith('::1') || hostname.startsWith('fe80:') || hostname.startsWith('fc00:')) return true;
  return false;
}

interface Header { key: string; value: string; enabled: boolean }

interface HistoryItem {
  method: Method;
  url: string;
  status: number;
  time: number;
  ts: number;
}

function statusColor(s: number) {
  if (s < 300) return 'bg-emerald-900/30 text-emerald-400';
  if (s < 400) return 'bg-amber-900/30 text-amber-400';
  return 'bg-rose-900/30 text-rose-400';
}

export const ApiPlayground = () => {
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headers, setHeaders] = useState<Header[]>([{ key: 'Content-Type', value: 'application/json', enabled: true }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<unknown>(null);
  const [resHeaders, setResHeaders] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'body' | 'headers'>('body');
  const [resTab, setResTab] = useState<'body' | 'headers'>('body');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const addHeader = () => setHeaders(h => [...h, { key: '', value: '', enabled: true }]);
  const removeHeader = (i: number) => setHeaders(h => h.filter((_, x) => x !== i));
  const updateHeader = (i: number, field: keyof Header, val: string | boolean) =>
    setHeaders(h => h.map((r, x) => x === i ? { ...r, [field]: val } : r));

  const send = async () => {
    if (!url.trim()) { showToast('Enter a URL', 'error'); return; }
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) { showToast('Only HTTP/HTTPS allowed', 'error'); return; }
      if (isInternalIP(urlObj.hostname)) { showToast('Requests to internal IPs blocked for security', 'error'); return; }
      const blocked = ['metadata.google.internal','169.254.169.254','metadata.azure.com'];
      if (blocked.some(b => urlObj.hostname.includes(b))) { showToast('Hostname blocked for security', 'error'); return; }
    } catch { showToast('Invalid URL format', 'error'); return; }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setResponse(null); setStatus(null); setTime(null); setResHeaders({});

    const startTime = Date.now();
    const timeoutId = setTimeout(() => abortRef.current?.abort(), 15000);

    try {
      const reqHeaders: Record<string, string> = {};
      headers.filter(h => h.enabled && h.key.trim()).forEach(h => { reqHeaders[h.key.trim()] = h.value; });

      const opts: RequestInit = { method, mode: 'cors', signal: abortRef.current.signal, headers: reqHeaders };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        if (new Blob([body]).size > 1024 * 1024) { showToast('Body too large (max 1MB)', 'error'); setLoading(false); return; }
        opts.body = body;
      }

      const res = await fetch(url, opts);
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      setTime(elapsed);
      setStatus(res.status);

      const rh: Record<string, string> = {};
      res.headers.forEach((v, k) => { rh[k] = v; });
      setResHeaders(rh);

      const ct = res.headers.get('content-type') || '';
      let data: unknown;
      if (ct.includes('application/json')) { data = await res.json(); }
      else { data = await res.text(); }
      setResponse(data);

      setHistory(prev => [{ method, url, status: res.status, time: elapsed, ts: Date.now() }, ...prev.slice(0, 9)]);
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === 'AbortError') {
        showToast('Request timed out or cancelled', 'error');
        setStatus(408); setResponse({ error: 'Request timeout/cancelled' });
      } else {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        showToast(msg, 'error'); setStatus(500); setResponse({ error: msg });
      }
    } finally { setLoading(false); }
  };

  const bodyStr = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
  const copyResponse = () => { navigator.clipboard.writeText(bodyStr); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── URL BAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><Globe size={15} className="text-blue-500"/></div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white hidden sm:block">API Playground</h2>
        </div>
        <div className="flex items-center flex-1 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <select value={method} onChange={e => setMethod(e.target.value as Method)}
            className={`px-3 py-2.5 font-bold text-white text-xs outline-none appearance-none cursor-pointer ${METHOD_COLORS[method]}`}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 font-mono text-sm outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            placeholder="https://api.example.com/endpoint"/>
          {loading && (
            <button onClick={() => abortRef.current?.abort()}
              className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold hover:bg-rose-50 hover:text-rose-500 transition-colors">
              Cancel
            </button>
          )}
          <button onClick={send} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-bold text-xs flex items-center gap-2 disabled:opacity-60 transition-colors">
            {loading ? <Loader2 size={13} className="animate-spin"/> : <Play size={13}/>} Send
          </button>
        </div>

        {status !== null && (
          <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 ${statusColor(status)}`}>
            {status}
          </span>
        )}
        {time !== null && (
          <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Clock size={11}/> {time}ms
          </span>
        )}
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Request panel */}
        <div className="w-[42%] flex flex-col border-r border-slate-200 dark:border-slate-800">
          {/* Request tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4">
            {(['body', 'headers'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-2.5 text-xs font-semibold capitalize transition-all border-b-2 ${tab === t ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {t === 'headers' ? `Headers (${headers.filter(h => h.enabled && h.key).length})` : 'Body'}
              </button>
            ))}
          </div>

          {tab === 'body' ? (
            <textarea value={body} onChange={e => setBody(e.target.value)} spellCheck={false}
              className="flex-1 p-4 resize-none font-mono text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 leading-relaxed"
              placeholder={'{\n  "key": "value"\n}'}/>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" checked={h.enabled} onChange={e => updateHeader(i, 'enabled', e.target.checked)} className="accent-blue-600 flex-shrink-0"/>
                  <input value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)} placeholder="Header name"
                    className="flex-1 px-2 py-1.5 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"/>
                  <input value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} placeholder="Value"
                    className="flex-1 px-2 py-1.5 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"/>
                  <button onClick={() => removeHeader(i)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex-shrink-0">
                    <X size={12} className="text-slate-400 hover:text-rose-500"/>
                  </button>
                </div>
              ))}
              <button onClick={addHeader} className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-semibold mt-2 px-1">
                <Plus size={12}/> Add Header
              </button>
            </div>
          )}
        </div>

        {/* Response panel */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Response tabs */}
          <div className="flex items-center border-b border-slate-800 px-4">
            {(['body', 'headers'] as const).map(t => (
              <button key={t} onClick={() => setResTab(t)}
                className={`px-3 py-2.5 text-xs font-semibold capitalize transition-all border-b-2 ${resTab === t ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-400'}`}>
                {t === 'headers' ? `Response Headers (${Object.keys(resHeaders).length})` : 'Response Body'}
              </button>
            ))}
            {response !== null && resTab === 'body' && (
              <button onClick={copyResponse} className="ml-auto w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 transition-colors">
                {copied ? <Check size={12} className="text-emerald-400"/> : <Copy size={12} className="text-slate-500"/>}
              </button>
            )}
          </div>

          {resTab === 'body' ? (
            loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-600">
                  <Loader2 size={28} className="animate-spin mx-auto mb-2 text-blue-500"/>
                  <p className="text-sm font-semibold">Sending request…</p>
                </div>
              </div>
            ) : (
              <pre className="flex-1 p-5 overflow-auto font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap break-words">
                {response !== null ? bodyStr : '// Response will appear here…\n// Press Send to make a request.'}
              </pre>
            )
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {Object.entries(resHeaders).map(([k, v]) => (
                <div key={k} className="flex gap-3 text-xs font-mono">
                  <span className="text-slate-400 flex-shrink-0 min-w-[140px]">{k}:</span>
                  <span className="text-slate-200 break-all">{v}</span>
                </div>
              ))}
              {Object.keys(resHeaders).length === 0 && <p className="text-xs text-slate-600">No headers yet</p>}
            </div>
          )}
        </div>

        {/* History sidebar */}
        {history.length > 0 && (
          <div className="w-52 flex-shrink-0 border-l border-slate-800 bg-slate-950 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">History</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {history.map((h, i) => (
                <button key={i} onClick={() => { setUrl(h.url); setMethod(h.method); }}
                  className="w-full text-left px-3 py-2.5 border-b border-slate-800/50 hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${METHOD_COLORS[h.method]} text-white`}>{h.method}</span>
                    <span className={`text-[10px] font-bold ${statusColor(h.status)} px-1.5 rounded`}>{h.status}</span>
                    <span className="text-[10px] text-slate-600 ml-auto">{h.time}ms</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate font-mono">{new URL(h.url).pathname || h.url}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
