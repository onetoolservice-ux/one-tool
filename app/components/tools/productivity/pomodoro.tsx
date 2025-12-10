"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

export const Pomodoro = () => {
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sound, setSound] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const MODES = {
    focus: { time: 25 * 60, label: 'Focus Time', color: 'text-rose-500', bg: 'bg-rose-500' },
    short: { time: 5 * 60, label: 'Short Break', color: 'text-teal-500', bg: 'bg-teal-500' },
    long: { time: 15 * 60, label: 'Long Break', color: 'text-blue-500', bg: 'bg-blue-500' }
  };

  const switchMode = (m: 'focus' | 'short' | 'long') => {
    setMode(m);
    setTimeLeft(MODES[m].time);
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a simple beep if sound is on
      if (sound) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, timeLeft, sound]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
       {/* Background Progress Bar */}
       <div className="absolute bottom-0 left-0 h-2 bg-slate-100 dark:bg-slate-800 w-full">
          <div className={`h-full transition-all duration-1000 ${MODES[mode].bg}`} style={{ width: `${progress}%` }}></div>
       </div>

       <div className="flex justify-center gap-2 mb-10 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full inline-flex">
          {Object.keys(MODES).map((m) => (
             <button 
               key={m} 
               onClick={() => switchMode(m as any)}
               className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === m ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
             >
                {MODES[m as any].label}
             </button>
          ))}
       </div>

       <div className="relative mb-12">
          <div className={`text-9xl font-black tabular-nums tracking-tight ${MODES[mode].color}`}>
             {formatTime(timeLeft)}
          </div>
          <p className="text-slate-400 font-medium mt-2 uppercase tracking-widest text-xs">Minutes Remaining</p>
       </div>

       <div className="flex items-center justify-center gap-6">
          <button onClick={toggleTimer} className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform active:scale-95 ${MODES[mode].bg}`}>
             {isActive ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}
          </button>
          <button onClick={resetTimer} className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <RotateCcw size={20}/>
          </button>
       </div>

       <button onClick={() => setSound(!sound)} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-500 transition-colors">
          {sound ? <Volume2 size={20}/> : <VolumeX size={20}/>}
       </button>
    </div>
  );
};
