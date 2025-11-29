"use client";
import React, { useState, useEffect } from "react";
import { Wind, Play, Pause, RefreshCw } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

type Phase = "Inhale" | "Hold" | "Exhale";

export default function SmartBreath() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("Inhale");
  const [timer, setTimer] = useState(4);
  const [preset, setPreset] = useState("Relax"); // Relax (4-7-8), Focus (4-4-4), Balance (5-5-5)

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
        setTimer((t) => {
            if (t > 1) return t - 1;
            
            // Transition Logic
            if (preset === "Relax") { // 4-7-8
                if (phase === "Inhale") { setPhase("Hold"); return 7; }
                if (phase === "Hold") { setPhase("Exhale"); return 8; }
                if (phase === "Exhale") { setPhase("Inhale"); return 4; }
            }
            if (preset === "Focus") { // Box 4-4-4-4 (Simplified to 3 phase for UI)
                if (phase === "Inhale") { setPhase("Hold"); return 4; }
                if (phase === "Hold") { setPhase("Exhale"); return 4; }
                if (phase === "Exhale") { setPhase("Inhale"); return 4; }
            }
            if (preset === "Balance") { // 5-0-5 (No hold usually, but let's do 5-5-5)
                if (phase === "Inhale") { setPhase("Hold"); return 5; }
                if (phase === "Hold") { setPhase("Exhale"); return 5; }
                if (phase === "Exhale") { setPhase("Inhale"); return 5; }
            }
            return 4;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, phase, preset]);

  const toggle = () => {
    setIsActive(!isActive);
    if (!isActive) showToast("Session Started");
  };

  const reset = () => {
    setIsActive(false);
    setPhase("Inhale");
    setTimer(4);
  };

  const scale = phase === "Inhale" ? "scale-150" : phase === "Hold" ? "scale-125" : "scale-100";
  const color = phase === "Inhale" ? "bg-sky-400" : phase === "Hold" ? "bg-violet-400" : "bg-emerald-400";

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500 text-white  "><Wind size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Breath</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Mindfulness</p></div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            {['Relax', 'Focus', 'Balance'].map(p => (
                <button key={p} onClick={()=>{setPreset(p); reset();}} className={`px-4 py-1.5 text-xs font-bold rounded ${preset===p?"bg-surface dark:bg-slate-800 dark:bg-surface shadow text-sky-600":"text-muted dark:text-muted dark:text-muted dark:text-muted"}`}>{p}</button>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Pulse */}
        <div className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-[4000ms] ${scale} ${color}`}></div>

        {/* Main Circle */}
        <div className={`w-64 h-64 rounded-full shadow-2xl flex items-center justify-center transition-all duration-[4000ms] ease-in-out z-10 ${scale} ${isActive ? 'bg-surface dark:bg-slate-800 dark:bg-surface' : 'bg-slate-100'}`}>
            <div className="text-center">
                <div className={`text-4xl font-bold mb-2 transition-colors duration-1000 ${isActive ? 'text-main dark:text-slate-100 dark:text-slate-200' : 'text-slate-300'}`}>{isActive ? phase : "Ready"}</div>
                <div className="text-6xl font-mono font-black text-sky-500">{timer}</div>
            </div>
        </div>

        {/* Controls */}
        <div className="mt-16 flex gap-4 z-20">
            <button onClick={toggle} className="px-8 py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg hover:bg-sky-700 transition flex items-center gap-2 text-lg">
                {isActive ? <Pause size={20}/> : <Play size={20}/>} {isActive ? "Pause" : "Start"}
            </button>
            <button onClick={reset} className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface text-muted/70 rounded-2xl border   hover:text-sky-600 hover:border-sky-200 transition">
                <RefreshCw size={20}/>
            </button>
        </div>
      </div>
    </div>
  );
}
