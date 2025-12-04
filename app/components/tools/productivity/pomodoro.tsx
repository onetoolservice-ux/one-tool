"use client";
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Coffee } from 'lucide-react';

export const Pomodoro = () => {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0) {
      setIsActive(false);
      // Audio cue could go here
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const reset = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTime(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' ? ((25*60 - time) / (25*60)) * 100 : ((5*60 - time) / (5*60)) * 100;

  return (
    <div className="max-w-lg mx-auto h-[calc(100vh-140px)] flex flex-col items-center justify-center">
       
       <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex mb-12 shadow-sm">
          <button onClick={() => reset('focus')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${mode==='focus'?'bg-indigo-600 text-white shadow':'text-slate-500 hover:text-slate-900'}`}>Focus (25m)</button>
          <button onClick={() => reset('break')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${mode==='break'?'bg-[#638c80] text-white shadow':'text-slate-500 hover:text-slate-900'}`}>Break (5m)</button>
       </div>

       {/* TIMER RING */}
       <div className="relative w-72 h-72 flex items-center justify-center mb-12">
          {/* Background Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
             <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
             <circle 
               cx="144" cy="144" r="130" 
               stroke="currentColor" strokeWidth="12" fill="transparent" 
               strokeDasharray={817} 
               strokeDashoffset={817 - (817 * progress) / 100} 
               className={`transition-all duration-1000 ${mode==='focus' ? 'text-indigo-500' : 'text-[#638c80]'}`}
               strokeLinecap="round"
             />
          </svg>
          
          <div className="text-center z-10">
             <div className={`text-7xl font-black tracking-tighter tabular-nums ${mode==='focus'?'text-slate-900 dark:text-white':'text-[#4a6b61]'}`}>
                {formatTime(time)}
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{isActive ? (mode==='focus'?'Focusing...':'Relaxing...') : 'Paused'}</p>
          </div>
       </div>

       <div className="flex items-center gap-4">
          <button 
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-110 active:scale-95 ${isActive ? 'bg-slate-800' : mode==='focus'?'bg-indigo-600':'bg-[#638c80]'}`}
          >
             {isActive ? <Pause size={28}/> : <Play size={28} className="ml-1"/>}
          </button>
          <button 
            onClick={() => reset(mode)}
            className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
          >
             <RotateCcw size={20}/>
          </button>
       </div>

    </div>
  );
};
