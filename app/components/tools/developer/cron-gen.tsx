"use client";
import React, { useState, useMemo } from 'react';
import { Clock, Copy, Check, Zap } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

interface CronState { min: string; hour: string; dom: string; month: string; dow: string }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const PRESETS: { label: string; cron: CronState; desc: string }[] = [
  { label: 'Every minute',   cron: { min:'*',  hour:'*',  dom:'*', month:'*', dow:'*' }, desc: 'Runs every minute' },
  { label: 'Every hour',     cron: { min:'0',  hour:'*',  dom:'*', month:'*', dow:'*' }, desc: 'At minute 0 of every hour' },
  { label: 'Every day 9am',  cron: { min:'0',  hour:'9',  dom:'*', month:'*', dow:'*' }, desc: 'At 09:00 every day' },
  { label: 'Every midnight', cron: { min:'0',  hour:'0',  dom:'*', month:'*', dow:'*' }, desc: 'At midnight every day' },
  { label: 'Every Mon 8am',  cron: { min:'0',  hour:'8',  dom:'*', month:'*', dow:'1' }, desc: 'At 08:00 on Monday' },
  { label: 'Weekdays 9am',   cron: { min:'0',  hour:'9',  dom:'*', month:'*', dow:'1-5' }, desc: 'At 09:00 Mon–Fri' },
  { label: '1st of month',   cron: { min:'0',  hour:'0',  dom:'1', month:'*', dow:'*' }, desc: 'Midnight on 1st of month' },
  { label: 'Every Sunday',   cron: { min:'0',  hour:'0',  dom:'*', month:'*', dow:'0' }, desc: 'At midnight every Sunday' },
];

function describe(c: CronState): string {
  const parts: string[] = [];
  const min = c.min === '*' ? 'every minute' : `minute ${c.min}`;
  const hr  = c.hour === '*' ? 'every hour' : `hour ${c.hour}`;
  const dom = c.dom === '*' ? 'every day' : `day ${c.dom}`;
  const mon = c.month === '*' ? 'every month' : `month ${c.month}`;
  const dow = c.dow === '*' ? 'every weekday' : `weekday ${c.dow}`;
  return `Runs at ${min} of ${hr}, ${dom} of ${mon}, ${dow}`;
}

function nextRuns(c: CronState, count = 5): string[] {
  const results: string[] = [];
  let d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  let tries = 0;
  while (results.length < count && tries < 100000) {
    tries++;
    const matchMin  = c.min === '*'  || c.min === String(d.getMinutes());
    const matchHour = c.hour === '*' || c.hour === String(d.getHours());
    const matchDom  = c.dom === '*'  || c.dom === String(d.getDate());
    const matchMon  = c.month === '*'|| c.month === String(d.getMonth() + 1);
    const matchDow  = c.dow === '*'  || c.dow === String(d.getDay()) || (c.dow.includes('-') && (() => {
      const [from, to] = c.dow.split('-').map(Number);
      return d.getDay() >= from && d.getDay() <= to;
    })());
    if (matchMin && matchHour && matchDom && matchMon && matchDow) {
      results.push(d.toLocaleString());
    }
    d = new Date(d.getTime() + 60000);
  }
  return results;
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-semibold">
      {copied ? <Check size={12} className="text-emerald-400"/> : <Copy size={12}/>} {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function FieldGrid({ label, max, val, set, names }: { label: string; max: number; val: string; set: (v: string) => void; names?: string[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        <div className="flex gap-1">
          <button onClick={() => set('*')} className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${val === '*' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-blue-500 hover:bg-blue-50'}`}>* All</button>
        </div>
      </div>
      <div className={`grid gap-1 ${max <= 7 ? 'grid-cols-7' : max <= 12 ? 'grid-cols-6' : 'grid-cols-8 sm:grid-cols-10'}`}>
        {Array.from({ length: max }, (_, i) => {
          const isSelected = val === String(i);
          return (
            <button key={i} onClick={() => set(isSelected ? '*' : String(i))}
              className={`h-7 rounded-md text-[10px] font-bold transition-colors flex flex-col items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400'}`}>
              <span>{i}</span>
              {names?.[i] && <span className="text-[8px] opacity-70">{names[i]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const CronGenerator = () => {
  const [cron, setCron] = useState<CronState>({ min: '*', hour: '*', dom: '*', month: '*', dow: '*' });
  const [rawInput, setRawInput] = useState('');

  const expression = `${cron.min} ${cron.hour} ${cron.dom} ${cron.month} ${cron.dow}`;
  const runs = useMemo(() => nextRuns(cron), [cron]);
  const description = describe(cron);

  const applyRaw = () => {
    const parts = rawInput.trim().split(/\s+/);
    if (parts.length !== 5) { showToast('Enter exactly 5 fields: min hour dom month dow', 'error'); return; }
    setCron({ min: parts[0], hour: parts[1], dom: parts[2], month: parts[3], dow: parts[4] });
    showToast('Cron expression applied', 'success');
  };

  const set = (field: keyof CronState) => (v: string) => setCron(prev => ({ ...prev, [field]: v }));

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><Clock size={18} className="text-slate-600 dark:text-slate-300"/></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Cron Generator</h2>
            <p className="text-[11px] text-slate-400">Build and preview cron schedules</p>
          </div>
        </div>
        {/* Direct expression input */}
        <div className="flex items-center gap-1.5 ml-2">
          <input value={rawInput} onChange={e => setRawInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyRaw()}
            placeholder="Paste expression (e.g. 0 9 * * 1-5)"
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none w-48 font-mono text-slate-700 dark:text-slate-200 placeholder:text-slate-400"/>
          <button onClick={applyRaw} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Apply</button>
        </div>
        <div className="flex-1"/>
        <CopyBtn value={expression}/>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Expression + Presets + Next Runs ─────────────────── */}
        <div className="w-64 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-900 overflow-y-auto">
          {/* Expression display */}
          <div className="p-4 border-b border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Expression</p>
            <div className="font-mono text-2xl font-black text-white tracking-wider">{expression}</div>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium leading-snug">{description}</p>
          </div>

          {/* Presets */}
          <div className="p-4 border-b border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5"><Zap size={10}/> Presets</p>
            <div className="space-y-1">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => setCron(p.cron)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${JSON.stringify(cron) === JSON.stringify(p.cron) ? 'bg-blue-600/30 text-blue-300 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Next runs */}
          <div className="p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Next 5 Runs</p>
            <div className="space-y-1">
              {runs.map((r, i) => (
                <div key={i} className="text-[11px] font-mono text-slate-400 px-2 py-1 rounded bg-slate-800">
                  {r}
                </div>
              ))}
              {runs.length === 0 && <p className="text-[11px] text-slate-600">Unable to compute runs</p>}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Field editors ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          <FieldGrid label="Minute (0–59)" max={60} val={cron.min} set={set('min')}/>
          <FieldGrid label="Hour (0–23)" max={24} val={cron.hour} set={set('hour')}/>
          <FieldGrid label="Day of Month (1–31)" max={31} val={cron.dom} set={set('dom')}/>
          <FieldGrid label="Month (1–12)" max={13} val={cron.month} set={set('month')} names={['', ...MONTHS]}/>
          <FieldGrid label="Day of Week (0–6)" max={7} val={cron.dow} set={set('dow')} names={DAYS}/>
        </div>
      </div>
    </div>
  );
};
