"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Copy, Check, RefreshCw, ArrowDown, ArrowUp } from 'lucide-react';

function pad(n: number, w = 2) { return String(n).padStart(w, '0'); }

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
      {copied ? <Check size={13} className="text-green-500"/> : <Copy size={13} className="text-slate-400"/>}
    </button>
  );
}

const TIMEZONES = [
  { label: 'UTC',       tz: 'UTC' },
  { label: 'IST (+5:30)', tz: 'Asia/Kolkata' },
  { label: 'EST (-5)',  tz: 'America/New_York' },
  { label: 'PST (-8)',  tz: 'America/Los_Angeles' },
  { label: 'GMT',       tz: 'Europe/London' },
  { label: 'CET (+1)',  tz: 'Europe/Paris' },
  { label: 'JST (+9)',  tz: 'Asia/Tokyo' },
  { label: 'AEST (+10)', tz: 'Australia/Sydney' },
];

function formatInTZ(ts: number, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(new Date(ts * 1000));
  } catch { return 'N/A'; }
}

export const TimestampTool = () => {
  const [timestamp, setTimestamp] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateStr, setDateStr] = useState(formatDate(new Date()));
  const [unit, setUnit] = useState<'s' | 'ms'>('s');
  const [liveMode, setLiveMode] = useState(false);

  // Live clock
  useEffect(() => {
    if (!liveMode) return;
    const id = setInterval(() => {
      const now = new Date();
      const ts = Math.floor(now.getTime() / 1000);
      setTimestamp(String(unit === 's' ? ts : ts * 1000));
      setDateStr(formatDate(now));
    }, 1000);
    return () => clearInterval(id);
  }, [liveMode, unit]);

  const tsToDate = useCallback((ts: string, u: 's' | 'ms') => {
    const n = parseInt(ts);
    if (isNaN(n)) return;
    const ms = u === 's' ? n * 1000 : n;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return;
    setDateStr(formatDate(d));
  }, []);

  const dateToTs = useCallback((str: string) => {
    const d = new Date(str);
    if (isNaN(d.getTime())) return;
    const ts = Math.floor(d.getTime() / 1000);
    setTimestamp(String(unit === 's' ? ts : ts * 1000));
  }, [unit]);

  const handleTsChange = (val: string) => {
    setTimestamp(val);
    if (!liveMode) tsToDate(val, unit);
  };

  const handleDateChange = (val: string) => {
    setDateStr(val);
    if (!liveMode) dateToTs(val);
  };

  const setNow = () => {
    const now = new Date();
    const ts = Math.floor(now.getTime() / 1000);
    setTimestamp(String(unit === 's' ? ts : ts * 1000));
    setDateStr(formatDate(now));
  };

  const switchUnit = (u: 's' | 'ms') => {
    const n = parseInt(timestamp);
    if (!isNaN(n)) {
      if (u === 'ms' && unit === 's') setTimestamp(String(n * 1000));
      if (u === 's' && unit === 'ms') setTimestamp(String(Math.floor(n / 1000)));
    }
    setUnit(u);
  };

  // Derived info
  const tsNum = parseInt(timestamp);
  const ms = !isNaN(tsNum) ? (unit === 's' ? tsNum * 1000 : tsNum) : null;
  const d = ms !== null ? new Date(ms) : null;
  const isValid = d !== null && !isNaN(d.getTime());

  const relativeTime = isValid && d ? (() => {
    const diff = Math.floor((d.getTime() - Date.now()) / 1000);
    const abs = Math.abs(diff);
    const past = diff < 0;
    if (abs < 60) return `${abs}s ${past ? 'ago' : 'from now'}`;
    if (abs < 3600) return `${Math.floor(abs/60)}m ${past ? 'ago' : 'from now'}`;
    if (abs < 86400) return `${Math.floor(abs/3600)}h ${past ? 'ago' : 'from now'}`;
    return `${Math.floor(abs/86400)}d ${past ? 'ago' : 'from now'}`;
  })() : null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg"><Timer size={18} className="text-cyan-600"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Timestamp Converter</h2>
            <p className="text-[11px] text-slate-400">Unix epoch ↔ human date • multi-timezone</p>
          </div>
        </div>
        {relativeTime && isValid && (
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2.5 py-1 rounded-full">{relativeTime}</span>
        )}
        <div className="flex-1"/>

        {/* Unit toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(['s', 'ms'] as const).map(u => (
            <button key={u} onClick={() => switchUnit(u)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${unit === u ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {u === 's' ? 'Seconds' : 'Milliseconds'}
            </button>
          ))}
        </div>

        <button onClick={() => setLiveMode(v => !v)}
          className={`px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${liveMode ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
          <RefreshCw size={11} className={liveMode ? 'animate-spin' : ''}/> {liveMode ? 'Live ON' : 'Live Clock'}
        </button>

        <button onClick={setNow} className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
          Now
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Timestamp → Date */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ArrowDown size={14} className="text-cyan-500"/>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Unix Timestamp → Human Date</span>
            </div>
            <div className="flex items-center gap-3">
              <input value={timestamp} onChange={e => handleTsChange(e.target.value)} spellCheck={false}
                className="flex-1 font-mono text-2xl font-bold outline-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                placeholder={unit === 's' ? '1700000000' : '1700000000000'}/>
              <CopyBtn value={timestamp}/>
            </div>
            {isValid && d && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'ISO 8601', val: d.toISOString() },
                  { label: 'Local', val: d.toLocaleString() },
                  { label: 'UTC', val: d.toUTCString() },
                  { label: 'Day of week', val: d.toLocaleDateString('en', { weekday: 'long' }) },
                  { label: 'Day of year', val: String(Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)) },
                  { label: 'Week number', val: String(Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)) },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
                    <p className="font-mono text-slate-700 dark:text-slate-200 truncate">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date → Timestamp */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUp size={14} className="text-cyan-500"/>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Human Date → Unix Timestamp</span>
            </div>
            <div className="flex items-center gap-3">
              <input value={dateStr} onChange={e => handleDateChange(e.target.value)} spellCheck={false}
                className="flex-1 font-mono text-lg outline-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                placeholder="2025-01-01 00:00:00"/>
              <CopyBtn value={dateStr}/>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Format: YYYY-MM-DD HH:MM:SS (local time)</p>
          </div>

          {/* Timezone view */}
          {isValid && d && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Same moment in multiple timezones</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TIMEZONES.map(({ label, tz }) => (
                  <div key={tz} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5">
                    <span className="text-xs font-semibold text-slate-500">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-200">{formatInTZ(tsNum, tz)}</span>
                      <CopyBtn value={formatInTZ(tsNum, tz)}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
