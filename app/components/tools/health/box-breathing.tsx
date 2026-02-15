"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'ready';
interface Config { inhale: number; hold1: number; exhale: number; hold2: number }

const PRESETS = [
  { name: 'Box (4-4-4-4)',    conf: { inhale:4, hold1:4, exhale:4, hold2:4  } },
  { name: 'Relax (4-7-8)',    conf: { inhale:4, hold1:7, exhale:8, hold2:0  } },
  { name: 'Energy (5-0-5-0)', conf: { inhale:5, hold1:0, exhale:5, hold2:0  } },
  { name: 'Deep (6-2-6-2)',   conf: { inhale:6, hold1:2, exhale:6, hold2:2  } },
];

const PHASE_META: Record<Phase, { label: string; instruction: string; color: string; glow: string }> = {
  ready:  { label:'Ready',   instruction:'Press Start to begin', color:'text-slate-500', glow:'bg-sky-100 dark:bg-sky-900/20' },
  inhale: { label:'Inhale',  instruction:'Breathe in slowly…',  color:'text-sky-500',   glow:'bg-sky-200 dark:bg-sky-700/40' },
  hold1:  { label:'Hold',    instruction:'Hold your breath…',   color:'text-indigo-500',glow:'bg-indigo-100 dark:bg-indigo-900/30' },
  exhale: { label:'Exhale',  instruction:'Breathe out slowly…', color:'text-teal-500',  glow:'bg-teal-100 dark:bg-teal-900/30' },
  hold2:  { label:'Hold',    instruction:'Empty lungs, hold…',  color:'text-slate-400', glow:'bg-slate-100 dark:bg-slate-800' },
};

export const BoxBreathing = () => {
  const [active, setActive]     = useState(false);
  const [phase, setPhase]       = useState<Phase>('ready');
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles]     = useState(0);
  const [config, setConfig]     = useState<Config>({ inhale:4, hold1:4, exhale:4, hold2:4 });

  const phaseOrder = useRef<Phase[]>([]);
  const phaseIdx   = useRef(0);
  const tickRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const getPhaseOrder = useCallback((cfg: Config): Phase[] => {
    const order: Phase[] = [];
    if (cfg.inhale > 0) order.push('inhale');
    if (cfg.hold1  > 0) order.push('hold1');
    if (cfg.exhale > 0) order.push('exhale');
    if (cfg.hold2  > 0) order.push('hold2');
    return order;
  }, []);

  const stop = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    setActive(false); setPhase('ready'); setTimeLeft(0); phaseIdx.current = 0;
  }, []);

  useEffect(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (!active) return;

    const order = getPhaseOrder(config);
    phaseOrder.current = order;
    if (order.length === 0) { setActive(false); return; }

    const startPhase = (idx: number) => {
      const p = order[idx % order.length];
      setPhase(p);
      setTimeLeft(config[p]);
    };

    startPhase(phaseIdx.current);

    tickRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          phaseIdx.current = (phaseIdx.current + 1) % order.length;
          if (phaseIdx.current === 0) setCycles(c => c + 1);
          const next = order[phaseIdx.current];
          setPhase(next);
          return config[next];
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const applyPreset = (p: typeof PRESETS[number]) => {
    stop(); setConfig(p.conf);
  };

  const meta = PHASE_META[phase];
  const phaseDur = phase === 'ready' ? 0 : config[phase];
  const progress = phaseDur > 0 ? ((phaseDur - timeLeft) / phaseDur) * 100 : 0;
  const circleScale = phase === 'inhale' ? 1.35 : phase === 'exhale' ? 0.85 : 1.0;
  const R = 100, C = 2 * Math.PI * R;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col lg:flex-row items-center justify-center gap-10 p-6">

      {/* Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Animated circle */}
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
          {/* Glow */}
          <div className={`absolute inset-0 rounded-full transition-all duration-[3000ms] ${meta.glow} blur-2xl opacity-60`}
            style={{ transform: `scale(${circleScale})` }} />
          {/* SVG ring */}
          <svg width={280} height={280} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={140} cy={140} r={R} fill="none" stroke="#e2e8f0" strokeWidth={8} className="dark:stroke-slate-800" />
            {phaseDur > 0 && (
              <circle cx={140} cy={140} r={R} fill="none" stroke="currentColor"
                strokeWidth={8} strokeLinecap="round" strokeDasharray={`${C} ${C}`}
                strokeDashoffset={C - (progress / 100) * C}
                className={`${meta.color} transition-all duration-1000 linear`} />
            )}
          </svg>
          {/* Inner circle */}
          <div className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-[3000ms] ease-in-out ${meta.glow}`}
            style={{ transform: `scale(${circleScale})` }}>
            {phase !== 'ready' && (
              <span className="font-black text-5xl text-slate-800 dark:text-white tabular-nums">{timeLeft}</span>
            )}
          </div>
        </div>

        {/* Phase label */}
        <div className="text-center">
          <h2 className={`text-3xl font-black uppercase tracking-widest ${meta.color}`}>{meta.label}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{meta.instruction}</p>
          {cycles > 0 && <p className="text-xs text-slate-400 mt-1">{cycles} {cycles === 1 ? 'cycle' : 'cycles'} completed</p>}
        </div>

        {/* Play/pause */}
        <button onClick={() => active ? stop() : setActive(true)}
          className="w-16 h-16 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
          {active ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Presets</p>
          <div className="space-y-1.5">
            {PRESETS.map(p => {
              const active = JSON.stringify(config) === JSON.stringify(p.conf);
              return (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className={`w-full px-3 py-2 rounded-xl text-left text-sm font-bold border transition-all ${active ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Custom Timing (sec)</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(config) as (keyof Config)[]).map(key => (
              <div key={key} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1 capitalize">
                  {key === 'hold1' ? 'Hold In' : key === 'hold2' ? 'Hold Out' : key}
                </label>
                <input type="number" min={0} max={20} value={config[key]}
                  onChange={e => { stop(); setConfig(c => ({ ...c, [key]: Math.max(0, +e.target.value) })); }}
                  className="w-full bg-transparent font-black text-xl text-slate-800 dark:text-white outline-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
