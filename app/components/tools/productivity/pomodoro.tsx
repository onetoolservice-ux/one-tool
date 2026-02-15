"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward, Settings } from 'lucide-react';

type PomMode = 'focus' | 'short' | 'long';
interface PomSession { mode: PomMode; minutes: number; completedAt: string }

const META: Record<PomMode, { label: string; color: string; bg: string; emoji: string }> = {
  focus: { label: 'Focus', color: 'text-rose-500', bg: 'bg-rose-500', emoji: '⚡' },
  short: { label: 'Short Break', color: 'text-teal-500', bg: 'bg-teal-500', emoji: '☕' },
  long: { label: 'Long Break', color: 'text-blue-500', bg: 'bg-blue-500', emoji: '🌙' },
};

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8);
  } catch {}
}

function fmtSec(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

export const Pomodoro = () => {
  const [mode, setMode] = useState<PomMode>('focus');
  const [mins, setMins] = useState<Record<PomMode, number>>({ focus: 25, short: 5, long: 15 });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sound, setSound] = useState(true);
  const [sessions, setSessions] = useState<PomSession[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalFocusMins, setTotalFocusMins] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [task, setTask] = useState('');
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSec = (m: PomMode) => mins[m] * 60;

  const switchMode = (m: PomMode) => {
    setMode(m); setTimeLeft(totalSec(m)); setIsActive(false);
    if (ref.current) clearInterval(ref.current);
  };

  const reset = () => { setIsActive(false); setTimeLeft(totalSec(mode)); if (ref.current) clearInterval(ref.current); };

  useEffect(() => {
    if (ref.current) clearInterval(ref.current);
    if (isActive && timeLeft > 0) {
      ref.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (sound) playBeep();
      setSessions(prev => [{ mode, minutes: mins[mode], completedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }, ...prev].slice(0, 30));
      if (mode === 'focus') { setTotalFocusMins(m => m + mins[mode]); setStreak(s => s + 1); }
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [isActive, timeLeft, sound, mode, mins]);

  const progress = ((totalSec(mode) - timeLeft) / totalSec(mode)) * 100;
  const m = META[mode];
  const focusCnt = sessions.filter(s => s.mode === 'focus').length;
  const breakCnt = sessions.filter(s => s.mode !== 'focus').length;

  // SVG ring
  const R = 88, C = 2 * Math.PI * R;
  const dash = C - (progress / 100) * C;

  const strokeColor = mode === 'focus' ? '#f43f5e' : mode === 'short' ? '#14b8a6' : '#3b82f6';

  const kpis = [
    { label: 'Mode', val: `${m.emoji} ${m.label}`, color: m.color },
    { label: 'Remaining', val: fmtSec(timeLeft), color: 'text-slate-700 dark:text-white' },
    { label: 'Focus Sessions Today', val: String(focusCnt), color: 'text-rose-600' },
    { label: 'Total Focus', val: `${totalFocusMins} min`, color: 'text-emerald-600' },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <span className="text-base">⏱</span>
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Pomodoro Timer</span>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(Object.keys(META) as PomMode[]).map(k => (
            <button key={k} onClick={() => switchMode(k)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === k ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              {META[k].emoji} {META[k].label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setSound(s => !s)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button onClick={() => setShowSettings(s => !s)}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${showSettings ? 'text-blue-600' : 'text-slate-400'}`}>
            <Settings size={15} />
          </button>
          <button onClick={() => { setSessions([]); setStreak(0); setTotalFocusMins(0); }}
            className="text-xs text-slate-400 hover:text-rose-500 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            Clear Stats
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {kpis.map(k => (
          <div key={k.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className={`text-lg font-black mt-0.5 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings sidebar */}
        {showSettings && (
          <div className="w-[240px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4 overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Durations (minutes)</p>
            {(Object.keys(mins) as PomMode[]).map(k => (
              <div key={k}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{META[k].emoji} {META[k].label}</label>
                <input type="number" min={1} max={90} value={mins[k]}
                  onChange={e => {
                    const v = Math.max(1, Math.min(90, Number(e.target.value)));
                    setMins(prev => ({ ...prev, [k]: v }));
                    if (mode === k) { setTimeLeft(v * 60); setIsActive(false); }
                  }}
                  className="w-full h-8 px-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white" />
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Task</label>
              <input value={task} onChange={e => setTask(e.target.value)} placeholder="What are you working on?"
                className="w-full h-8 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white" />
            </div>
          </div>
        )}

        {/* Center: clock */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-slate-50 dark:bg-slate-950 py-6">
          {task && (
            <div className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300">
              🎯 {task}
            </div>
          )}

          {/* SVG ring clock */}
          <div className="relative">
            <svg width={216} height={216} viewBox="0 0 216 216">
              <circle cx={108} cy={108} r={R} fill="none" stroke="#e2e8f0" strokeWidth={10} className="dark:stroke-slate-800" />
              <circle cx={108} cy={108} r={R} fill="none" stroke={strokeColor}
                strokeWidth={10} strokeLinecap="round"
                strokeDasharray={`${C} ${C}`} strokeDashoffset={dash}
                transform="rotate(-90 108 108)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
              <text x={108} y={100} textAnchor="middle" fontSize={36} fontWeight={900}
                className="fill-slate-900 dark:fill-white" fontFamily="monospace">
                {fmtSec(timeLeft)}
              </text>
              <text x={108} y={122} textAnchor="middle" fontSize={11} fontWeight={700}
                className="fill-slate-400" letterSpacing={1.5}>
                {m.label.toUpperCase()}
              </text>
              {streak > 0 && (
                <text x={108} y={142} textAnchor="middle" fontSize={10} fill="#f59e0b">
                  🔥 {streak} streak
                </text>
              )}
            </svg>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={reset}
              className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all">
              <RotateCcw size={18} />
            </button>
            <button onClick={() => setIsActive(a => !a)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all ${m.bg}`}>
              {isActive ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
            </button>
            <button onClick={() => switchMode(mode === 'focus' ? 'short' : 'focus')}
              className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all">
              <SkipForward size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-56 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${m.bg}`} style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{Math.round(progress)}% complete</p>
        </div>

        {/* Session log */}
        <div className="w-[220px] flex-shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Session Log</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'Focus', val: focusCnt, cls: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
                { label: 'Breaks', val: breakCnt, cls: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
              ].map(s => (
                <div key={s.label} className={`rounded-lg p-2 text-center ${s.cls}`}>
                  <p className="text-xl font-black">{s.val}</p>
                  <p className="text-[9px] font-bold uppercase">{s.label}</p>
                </div>
              ))}
            </div>
            {sessions.length === 0
              ? <p className="text-xs text-slate-400 text-center py-6">No sessions yet</p>
              : sessions.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${META[s.mode].bg}`} />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{META[s.mode].label}</p>
                    <p className="text-[9px] text-slate-400">{s.minutes} min · {s.completedAt}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};
