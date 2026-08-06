"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Key, Copy, Check, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - str.length % 4) % 4, '=');
  return atob(padded);
}

function getExpStatus(payload: Record<string, unknown>): { label: string; color: string; icon: 'ok' | 'warn' | 'err' } {
  const exp = payload.exp as number | undefined;
  const iat = payload.iat as number | undefined;
  if (!exp) return { label: 'No expiry', color: 'text-slate-400', icon: 'warn' };
  const now = Math.floor(Date.now() / 1000);
  if (exp < now) return { label: `Expired ${new Date(exp * 1000).toLocaleString()}`, color: 'text-rose-500', icon: 'err' };
  const diffSec = exp - now;
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const remaining = diffDay > 0 ? `${diffDay}d` : diffHr > 0 ? `${diffHr}h` : `${diffMin}m`;
  return { label: `Expires in ${remaining} — ${new Date(exp * 1000).toLocaleString()}`, color: 'text-emerald-500', icon: 'ok' };
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="ml-auto flex-shrink-0 w-6 h-6 rounded flex items-center justify-center hover:bg-slate-700 transition-colors">
      {copied ? <Check size={11} className="text-emerald-400"/> : <Copy size={11} className="text-slate-500 hover:text-slate-300"/>}
    </button>
  );
}

function ClaimsTable({ data }: { data: Record<string, unknown> }) {
  const knownClaims: Record<string, string> = {
    iss: 'Issuer', sub: 'Subject', aud: 'Audience', exp: 'Expiration', nbf: 'Not Before',
    iat: 'Issued At', jti: 'JWT ID', name: 'Name', email: 'Email', role: 'Role',
    alg: 'Algorithm', typ: 'Type', kid: 'Key ID',
  };
  return (
    <div className="space-y-1">
      {Object.entries(data).map(([k, v]) => {
        const strVal = typeof v === 'number' && (k === 'exp' || k === 'iat' || k === 'nbf')
          ? `${v} (${new Date(v * 1000).toLocaleString()})`
          : JSON.stringify(v);
        return (
          <div key={k} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors group">
            <div className="min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{k}</span>
              {knownClaims[k] && <p className="text-[10px] text-slate-600">{knownClaims[k]}</p>}
            </div>
            <span className="font-mono text-xs text-slate-200 break-all flex-1">{strVal}</span>
            <CopyBtn value={strVal}/>
          </div>
        );
      })}
    </div>
  );
}

export const JwtDebugger = () => {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<Record<string, unknown> | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [sig, setSig] = useState('');
  const [error, setError] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  const decode = useCallback((t: string) => {
    setError(''); setHeader(null); setPayload(null); setSig('');
    if (!t.trim()) return;
    const parts = t.trim().split('.');
    if (parts.length !== 3) { setError('Invalid JWT: must have 3 parts separated by dots'); return; }
    try {
      const h = JSON.parse(base64UrlDecode(parts[0]));
      const p = JSON.parse(base64UrlDecode(parts[1]));
      setHeader(h); setPayload(p); setSig(parts[2]);
    } catch {
      setError('Failed to decode JWT — check the token format');
    }
  }, []);

  useEffect(() => { decode(token); }, [token, decode]);

  const loadSample = () => setToken(SAMPLE_JWT);

  const expStatus = payload ? getExpStatus(payload) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg"><Key size={18} className="text-pink-500"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">JWT Debugger</h2>
            <p className="text-[11px] text-slate-400">Decode and inspect JWT tokens</p>
          </div>
        </div>
        {expStatus && (
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${expStatus.color} ml-2`}>
            {expStatus.icon === 'ok' ? <CheckCircle size={13}/> : expStatus.icon === 'err' ? <AlertTriangle size={13}/> : <Clock size={13}/>}
            {expStatus.label}
          </div>
        )}
        <div className="flex-1"/>
        <button
          onClick={() => setShowRaw(v => !v)}
          className={`px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${showRaw ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          {showRaw ? <ChevronUp size={12}/> : <ChevronDown size={12}/>} Raw JSON
        </button>
        <button onClick={loadSample} className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors font-semibold">
          Load Sample
        </button>
        <button
          onClick={() => { setToken(''); setError(''); }}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors font-semibold"
        >
          Clear
        </button>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Input */}
        <div className="w-[40%] flex flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Encoded Token</span>
          </div>
          <textarea
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Paste JWT token here…"
            spellCheck={false}
            className={`flex-1 p-5 resize-none font-mono text-[13px] leading-relaxed outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${error ? 'border-t-2 border-rose-400' : ''}`}
          />
          {error && (
            <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 border-t border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertTriangle size={12} className="text-rose-500 flex-shrink-0"/>
              <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          {/* Token structure visualizer */}
          {token && !error && (
            <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Token Structure</p>
              <div className="flex gap-1 text-[10px] font-mono break-all">
                <span className="text-rose-400">{token.split('.')[0]}</span>
                <span className="text-slate-500">.</span>
                <span className="text-purple-400">{token.split('.')[1]}</span>
                <span className="text-slate-500">.</span>
                <span className="text-blue-400">{token.split('.')[2]}</span>
              </div>
              <div className="flex gap-4 mt-2 text-[10px] font-semibold">
                <span className="text-rose-400">■ Header</span>
                <span className="text-purple-400">■ Payload</span>
                <span className="text-blue-400">■ Signature</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Decoded */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {!header && !payload ? (
            <div className="flex-1 flex items-center justify-center text-slate-600">
              <div className="text-center">
                <Shield size={40} className="mx-auto mb-3 opacity-30"/>
                <p className="text-sm font-semibold">Paste a JWT to decode it</p>
                <p className="text-xs mt-1 opacity-60">Header, payload, and signature will appear here</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="border-b border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Header</span>
                  {header && <CopyBtn value={JSON.stringify(header, null, 2)}/>}
                </div>
                {showRaw ? (
                  <pre className="font-mono text-sm text-rose-300">{JSON.stringify(header, null, 2)}</pre>
                ) : (
                  header && <ClaimsTable data={header}/>
                )}
              </div>

              {/* Payload */}
              <div className="border-b border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Payload</span>
                  {payload && <CopyBtn value={JSON.stringify(payload, null, 2)}/>}
                </div>
                {showRaw ? (
                  <pre className="font-mono text-sm text-purple-300">{JSON.stringify(payload, null, 2)}</pre>
                ) : (
                  payload && <ClaimsTable data={payload}/>
                )}
              </div>

              {/* Signature */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Signature</span>
                  {sig && <CopyBtn value={sig}/>}
                </div>
                <div className="px-3 py-2 rounded-lg bg-blue-900/20 border border-blue-800/40">
                  <p className="font-mono text-xs text-blue-300 break-all">{sig || '—'}</p>
                </div>
                <p className="text-[10px] text-slate-600 mt-2">
                  Signature cannot be verified client-side without the secret key. Use a server-side tool to verify.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
