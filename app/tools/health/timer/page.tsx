"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Settings2, Volume2, VolumeX, Timer, CheckCircle2 } from "lucide-react";

/* -------------------------
   TYPES
   ------------------------- */
type TimerPhase = "idle" | "work" | "rest" | "finished";

interface TimerSettings {
  work: number;
  rest: number;
  rounds: number;
}

/* -------------------------
   MAIN COMPONENT
   ------------------------- */
export default function WorkoutTimer() {
  // -- State --
  const [settings, setSettings] = useState<TimerSettings>({ work: 30, rest: 10, rounds: 8 });
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentRound, setCurrentRound] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // -- Sound Effect (Browser Native) --
  const playBeep = (freq = 440, duration = 0.1) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      setTimeout(() => osc.stop(), duration * 1000);
    } catch (e) { console.error(e); }
  };

  // -- Timer Logic --
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((t) => t - 1);
        // Beep on last 3 seconds
        if (timeLeft <= 4 && timeLeft > 1) playBeep(600, 0.1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handlePhaseTransition();
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isActive, timeLeft]);

  const handlePhaseTransition = () => {
    playBeep(880, 0.3); // High beep for switch

    if (phase === "work") {
      if (currentRound >= settings.rounds) {
        setPhase("finished");
        setIsActive(false);
      } else {
        setPhase("rest");
        setTimeLeft(settings.rest);
      }
    } else if (phase === "rest") {
      setCurrentRound((r) => r + 1);
      setPhase("work");
      setTimeLeft(settings.work);
    }
  };

  // -- Controls --
  const startTimer = () => {
    if (phase === "idle" || phase === "finished") {
      setPhase("work");
      setTimeLeft(settings.work);
      setCurrentRound(1);
    }
    setIsActive(true);
  };

  const pauseTimer = () => setIsActive(false);
  
  const resetTimer = () => {
    setIsActive(false);
    setPhase("idle");
    setTimeLeft(settings.work);
    setCurrentRound(1);
  };

  // -- Render Helpers --
  const getTotalTime = () => (phase === "work" ? settings.work : settings.rest);
  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getPhaseColor = () => {
    if (phase === "work") return "text-emerald-500 stroke-emerald-500";
    if (phase === "rest") return "text-amber-500 stroke-amber-500";
    return "text-slate-300 stroke-slate-300";
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Timer className="text-[rgb(117,163,163)]" /> Interval Timer
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-500'}`}>
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <label className="text-xs font-bold text-emerald-600 uppercase">Work (sec)</label>
              <input type="number" value={settings.work} onChange={e => setSettings({...settings, work: Number(e.target.value)})} className="w-full mt-2 p-2 bg-slate-50 rounded-lg border text-center font-bold text-lg focus:ring-2 ring-emerald-500/20 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-amber-600 uppercase">Rest (sec)</label>
              <input type="number" value={settings.rest} onChange={e => setSettings({...settings, rest: Number(e.target.value)})} className="w-full mt-2 p-2 bg-slate-50 rounded-lg border text-center font-bold text-lg focus:ring-2 ring-amber-500/20 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Rounds</label>
              <input type="number" value={settings.rounds} onChange={e => setSettings({...settings, rounds: Number(e.target.value)})} className="w-full mt-2 p-2 bg-slate-50 rounded-lg border text-center font-bold text-lg focus:ring-2 ring-slate-500/20 outline-none" />
            </div>
          </div>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 flex flex-col items-center relative overflow-hidden">
        
        {/* Status Badge */}
        <div className="absolute top-6">
          <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${
            phase === 'work' ? 'bg-emerald-100 text-emerald-700' : 
            phase === 'rest' ? 'bg-amber-100 text-amber-700' : 
            phase === 'finished' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {phase === 'idle' ? "Ready" : phase}
          </span>
        </div>

        {/* SVG Progress Ring */}
        <div className="relative w-72 h-72 mt-8 mb-4 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
            {/* Background Ring */}
            <circle cx="130" cy="130" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
            {/* Progress Ring */}
            <circle 
              cx="130" cy="130" r={radius} fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ease-linear ${getPhaseColor()}`}
            />
          </svg>
          
          {/* Time Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {phase === "finished" ? (
              <CheckCircle2 size={64} className="text-blue-500 mb-2" />
            ) : (
              <span className={`text-7xl font-bold tabular-nums tracking-tight ${
                phase === 'work' ? 'text-slate-800' : phase === 'rest' ? 'text-amber-600' : 'text-slate-300'
              }`}>
                {timeLeft}
              </span>
            )}
            {phase !== "finished" && phase !== "idle" && (
              <span className="text-slate-400 font-medium mt-2">Round {currentRound} / {settings.rounds}</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-4">
          {!isActive && phase !== "finished" ? (
            <button onClick={startTimer} className="w-16 h-16 bg-slate-900 hover:bg-slate-800 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all">
              <Play fill="currentColor" className="ml-1" />
            </button>
          ) : (
            <button onClick={pauseTimer} className="w-16 h-16 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all">
              <Pause fill="currentColor" />
            </button>
          )}

          <button onClick={resetTimer} className="w-12 h-12 border-2 border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center transition-all">
            <RotateCcw size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}