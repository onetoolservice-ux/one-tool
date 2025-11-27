"use client";

import React, { useState, useEffect, useRef } from "react";
import { Wind, Play, Square, RefreshCw } from "lucide-react";

type Phase = "idle" | "inhale" | "hold" | "exhale";

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState("Ready?");
  const [cycles, setCycles] = useState(0);
  
  // Refs to manage timers without re-rendering issues
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopExercise = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsActive(false);
    setPhase("idle");
    setText("Ready?");
  };

  const runCycle = () => {
    // 1. INHALE (4 Seconds)
    setPhase("inhale");
    setText("Inhale...");
    
    timerRef.current = setTimeout(() => {
      // 2. HOLD (7 Seconds)
      setPhase("hold");
      setText("Hold");
      
      timerRef.current = setTimeout(() => {
        // 3. EXHALE (8 Seconds)
        setPhase("exhale");
        setText("Exhale...");
        
        timerRef.current = setTimeout(() => {
          // Cycle Complete
          setCycles(c => c + 1);
          // Loop
          if (isActive) runCycle(); 
        }, 8000); // Exhale duration
        
      }, 7000); // Hold duration
      
    }, 4000); // Inhale duration
  };

  // Effect to handle the start/stop logic properly with the ref state
  useEffect(() => {
    if (isActive && phase === 'idle') {
      runCycle();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive]);

  // Dynamic Styles for Animation
  const getCircleStyle = () => {
    switch (phase) {
      case "inhale":
        return "scale-150 bg-teal-500 shadow-[0_0_60px_rgba(20,184,166,0.6)] duration-[4000ms]";
      case "hold":
        return "scale-150 bg-teal-600 shadow-[0_0_80px_rgba(13,148,136,0.8)] duration-[0ms]"; // Instant freeze
      case "exhale":
        return "scale-100 bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.4)] duration-[8000ms]";
      default:
        return "scale-100 bg-slate-300 duration-500";
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 bg-slate-50">
      
      {/* Header */}
      <div className="text-center mb-12 space-y-2">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Wind className="text-teal-500" /> 4-7-8 Breathing
        </h1>
        <p className="text-slate-500">Follow the circle. Inhale 4s, Hold 7s, Exhale 8s.</p>
      </div>

      {/* The Animation Circle */}
      <div className="relative flex items-center justify-center w-80 h-80">
        {/* Background Rings */}
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full opacity-50"></div>
        <div className="absolute inset-8 border-2 border-slate-100 rounded-full opacity-50"></div>
        
        {/* Animated Lung */}
        <div 
          className={`w-40 h-40 rounded-full flex items-center justify-center transition-all ease-in-out z-10 ${getCircleStyle()}`}
        >
          <span className="text-white font-bold text-xl tracking-widest uppercase drop-shadow-md">
            {text}
          </span>
        </div>
        
        {/* Particle Effects (CSS only) */}
        {phase === 'hold' && (
          <div className="absolute w-full h-full animate-pulse border-4 border-teal-200/50 rounded-full scale-150"></div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-16 flex flex-col items-center gap-6">
        
        {/* Stats */}
        <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Cycles Completed: <span className="text-slate-800 text-lg ml-1">{cycles}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          {!isActive ? (
            <button 
              onClick={() => setIsActive(true)}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
            >
              <Play fill="currentColor" size={20} /> Start Exercise
            </button>
          ) : (
            <button 
              onClick={stopExercise}
              className="flex items-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl text-lg font-semibold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <Square fill="currentColor" size={20} /> Stop
            </button>
          )}
          
          <button 
            onClick={() => setCycles(0)}
            className="p-4 rounded-2xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
            title="Reset Counter"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        {/* Instruction Tip */}
        <p className="text-xs text-slate-400 max-w-xs text-center leading-relaxed">
          Tip: Place the tip of your tongue against the ridge of tissue just behind your upper front teeth and keep it there through the entire exercise.
        </p>
      </div>

    </div>
  );
}