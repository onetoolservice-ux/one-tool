"use client";
import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function SmartWorkout() {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [set, setSet] = useState(1);
  const [phase, setPhase] = useState<"Work" | "Rest">("Work");

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const reset = () => { setIsActive(false); setTime(0); setSet(1); setPhase("Work"); };
  
  const switchPhase = () => {
      setTime(0);
      if (phase === "Work") setPhase("Rest");
      else {
          setPhase("Work");
          setSet(s => s + 1);
      }
  };

  const formatTime = (s: number) => {
      const mins = Math.floor(s / 60).toString().padStart(2, '0');
      const secs = (s % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
  };

  return (
    <div className="max-w-lg mx-auto p-6 text-center space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-main dark:text-white">HIIT Timer</h1>
        <p className="text-muted">High Intensity Interval Training Assistant.</p>
      </div>

      <div className={`p-10 rounded-3xl border-4 transition-all duration-500 ${phase === 'Work' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'}`}>
         <div className={`text-sm font-bold uppercase tracking-widest mb-2 ${phase === 'Work' ? 'text-rose-600' : 'text-emerald-600'}`}>Current Phase</div>
         <div className="text-5xl font-black mb-4 text-main dark:text-white">{phase}</div>
         <div className="text-7xl font-mono font-bold tabular-nums text-main dark:text-slate-200 mb-6">{formatTime(time)}</div>
         
         <div className="flex justify-center gap-4">
             <div className="text-xs font-bold text-muted uppercase">Set <span className="text-xl text-main dark:text-slate-200 block">{set}</span></div>
         </div>
      </div>

      <div className="flex justify-center gap-4">
         <Button onClick={toggleTimer} className="w-32 h-12 text-lg shadow-lg">
            {isActive ? <><Pause size={20} className="mr-2"/> Pause</> : <><Play size={20} className="mr-2"/> Start</>}
         </Button>
         <Button onClick={switchPhase} variant="secondary" className="h-12 px-6">Next Phase</Button>
         <Button onClick={reset} variant="ghost" className="h-12 w-12 p-0"><RotateCcw size={20}/></Button>
      </div>
    </div>
  );
}
