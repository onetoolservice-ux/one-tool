"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, X, Dumbbell, Coffee, Volume2, VolumeX } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

export const HIITTimer = () => {
  // SETTINGS
  const [work, setWork] = useState(30);
  const [rest, setRest] = useState(10);
  const [rounds, setRounds] = useState(3);
  
  // EXERCISE LIST
  const [exercises, setExercises] = useState(["Jumping Jacks", "Push Ups", "Squats", "Plank"]);
  const [newEx, setNewEx] = useState("");

  // TIMER STATE
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<'work' | 'rest' | 'prep'>('prep');
  const [timeLeft, setTimeLeft] = useState(5);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [sound, setSound] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC ---
  useEffect(() => {
    if (!active) {
      // Clear interval when timer is paused/stopped
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timeLeft > 0) {
      // Start interval only if not already running
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setTimeLeft((t) => {
            if (t <= 1) {
              // Clear interval before phase change
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              // Trigger phase change on next tick
              setTimeout(() => handlePhaseChange(), 0);
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      }
    } else if (timeLeft === 0 && active) {
      // Phase change needed
      handlePhaseChange();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, timeLeft]);

  const playBeep = () => {
    if (!sound) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = phase === 'work' ? 440 : 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const handlePhaseChange = () => {
    playBeep();
    if (phase === 'prep' || phase === 'rest') {
      // START WORK
      setPhase('work');
      setTimeLeft(work);
    } else {
      // FINISHED WORK
      // Check if circuit done
      if (currentExIndex >= exercises.length - 1) {
         if (currentRound >= rounds) {
            setActive(false);
            showToast("WORKOUT COMPLETE! 💪", 'success');
            reset();
            return;
         }
         setCurrentRound(r => r + 1);
         setCurrentExIndex(0);
      } else {
         setCurrentExIndex(i => i + 1);
      }
      setPhase('rest');
      setTimeLeft(rest);
    }
  };

  const reset = () => {
    setActive(false);
    setPhase('prep');
    setTimeLeft(5);
    setCurrentExIndex(0);
    setCurrentRound(1);
  };

  const addExercise = () => {
    if (newEx.trim()) {
      setExercises([...exercises, newEx]);
      setNewEx("");
    }
  };

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  // --- RENDER ---
  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col lg:flex-row gap-8 h-[calc(100vh-100px)]">
       
       {/* LEFT: TIMER DISPLAY */}
       <div className={`flex-1 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center transition-all duration-500 shadow-2xl border-4 ${phase === 'work' ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900'}`}>
          
          <div className="flex items-center gap-2 mb-6">
             <span className={`text-xl font-black uppercase tracking-widest ${phase==='work'?'text-rose-500':'text-emerald-500'}`}>
                {phase === 'prep' ? "GET READY" : phase === 'work' ? "WORK" : "REST"}
             </span>
          </div>

          <div className="text-[10rem] leading-none font-bold tabular-nums text-slate-900 dark:text-white mb-4">
             {timeLeft}
          </div>

          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-8">
             {exercises[currentExIndex] || "Exercise"}
          </div>

          <div className="flex gap-4 mb-8">
             <span className="px-4 py-1 bg-white dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 border">Round {currentRound}/{rounds}</span>
             <span className="px-4 py-1 bg-white dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 border">Ex {currentExIndex + 1}/{exercises.length}</span>
          </div>

          <div className="flex gap-4">
             <button onClick={() => setActive(!active)} className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                {active ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}
             </button>
             <button onClick={reset} className="w-20 h-20 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-md">
                <RotateCcw size={28}/>
             </button>
          </div>
       </div>

       {/* RIGHT: CONFIGURATION */}
       <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6">
             <h2 className="font-bold text-lg">Workout Plan</h2>
             <button onClick={() => setSound(!sound)} className="text-slate-400 hover:text-slate-600">
                {sound ? <Volume2 size={20}/> : <VolumeX size={20}/>}
             </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
             <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                <label className="text-[10px] font-bold uppercase text-slate-400">Work</label>
                <input type="number" value={work} onChange={e=>setWork(+e.target.value)} className="w-full bg-transparent text-center font-bold text-lg outline-none"/>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                <label className="text-[10px] font-bold uppercase text-slate-400">Rest</label>
                <input type="number" value={rest} onChange={e=>setRest(+e.target.value)} className="w-full bg-transparent text-center font-bold text-lg outline-none"/>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                <label className="text-[10px] font-bold uppercase text-slate-400">Rounds</label>
                <input type="number" value={rounds} onChange={e=>setRounds(+e.target.value)} className="w-full bg-transparent text-center font-bold text-lg outline-none"/>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-4">
             {exercises.map((ex, i) => (
                <div key={i} className={`p-3 rounded-xl flex justify-between items-center ${i === currentExIndex && active ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                   <span className="text-sm font-medium"><span className="opacity-50 mr-3">{i+1}.</span>{ex}</span>
                   <button onClick={() => removeExercise(i)} className="opacity-50 hover:opacity-100 hover:text-red-400" aria-label={`Remove ${ex}`} title={`Remove ${ex}`}><X size={14}/></button>
                </div>
             ))}
          </div>

          <div className="flex gap-2">
             <input 
               value={newEx} 
               onChange={e=>setNewEx(e.target.value)} 
               onKeyDown={e=>e.key==='Enter'&&addExercise()}
               className="flex-1 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl text-sm outline-none border border-blue-300 dark:border-blue-600 transition-all" 
               placeholder="Add exercise..."
             />
             <button onClick={addExercise} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors"><Plus size={20}/></button>
          </div>
       </div>
    </div>
  );
};