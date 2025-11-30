"use client";
import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function Meditation() {
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins
  const [sound, setSound] = useState(true);

  useEffect(() => {
     let interval: any = null;
     if (active && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
     } else {
        clearInterval(interval);
     }
     return () => clearInterval(interval);
  }, [active, timeLeft]);

  const format = (s: number) => {
     const m = Math.floor(s / 60).toString().padStart(2, '0');
     const sec = (s % 60).toString().padStart(2, '0');
     return `${m}:${sec}`;
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-center space-y-10">
       <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Focus Timer</h1>
        <p className="text-slate-500">Clear your mind. Just breathe.</p>
      </div>

      <div className="relative h-64 w-64 mx-auto flex items-center justify-center">
         <div className={`absolute inset-0 bg-indigo-500/10 rounded-full animate-ping ${active ? 'opacity-100' : 'opacity-0'}`} style={{animationDuration: '3s'}}></div>
         <div className="relative w-56 h-56 bg-white dark:bg-slate-800 rounded-full border-4 border-indigo-100 dark:border-slate-700 flex items-center justify-center shadow-xl z-10">
            <div className="text-6xl font-mono font-bold text-slate-800 dark:text-slate-200 tracking-widest">
                {format(timeLeft)}
            </div>
         </div>
      </div>

      <div className="flex justify-center gap-4">
         <Button onClick={() => setActive(!active)} className="w-32 h-12 text-lg shadow-indigo-500/20 shadow-lg">
            {active ? <><Pause size={20} className="mr-2"/> Pause</> : <><Play size={20} className="mr-2"/> Start</>}
         </Button>
         <Button variant="secondary" onClick={() => {setActive(false); setTimeLeft(600);}} className="h-12 w-12 p-0 rounded-xl"><RotateCcw size={20}/></Button>
         <Button variant="ghost" onClick={() => setSound(!sound)} className="h-12 w-12 p-0 rounded-xl text-slate-400 hover:text-indigo-600">
            {sound ? <Volume2 size={20}/> : <VolumeX size={20}/>}
         </Button>
      </div>
    </div>
  );
}
