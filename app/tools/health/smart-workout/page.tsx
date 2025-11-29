"use client";
import React, { useState, useEffect } from "react";
import { Zap, Play, Pause, RotateCcw, Sparkles, X } from "lucide-react";
import Toast, { showToast } from "../../../shared/Toast";

type Status = "Work" | "Rest" | "Idle" | "Finished";

export default function SmartWorkout() {
  const [status, setStatus] = useState<Status>("Idle");
  const [work, setWork] = useState(30);
  const [rest, setRest] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [curRound, setCurRound] = useState(1);
  const [time, setTime] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");

  useEffect(() => {
    if (!isActive || status === "Idle" || status === "Finished") return;
    const interval = setInterval(() => {
        setTime((t) => {
            if (t > 1) return t - 1;
            if (status === "Work") {
                if (curRound >= rounds) { setStatus("Finished"); setIsActive(false); return 0; }
                setStatus("Rest"); return rest;
            } 
            if (status === "Rest") {
                setCurRound(r => r + 1); setStatus("Work"); return work;
            }
            return 0;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, status, curRound, rounds, work, rest]);

  const start = () => { if (status==="Idle" || status==="Finished") { setStatus("Work"); setCurRound(1); setTime(work); } setIsActive(true); showToast("Started"); };
  const reset = () => { setIsActive(false); setStatus("Idle"); setCurRound(1); setTime(work); };

  const handleAi = () => {
    const t = aiText.toLowerCase();
    if(t.includes("tabata")) { setWork(20); setRest(10); setRounds(8); }
    else {
        const nums = aiText.match(/\d+/g)?.map(Number) || [];
        if(nums.length >= 2) { setWork(nums[0]); setRest(nums[1]); setRounds(nums[2] || 8); }
    }
    reset(); setIsAiOpen(false); showToast("✨ Timer Configured");
  };

  const bg = status === "Work" ? "bg-orange-500" : status === "Rest" ? "bg-blue-500" : "bg-surface";

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] w-full transition-colors duration-500 font-sans ${bg}`}>
      <Toast />
      <div className="px-6 py-4 flex items-center justify-between text-white/90">
        <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-surface dark:bg-slate-800 dark:bg-surface/20 backdrop-blur-sm"><Zap size={22} /></div><div><h1 className="text-lg font-bold">Smart Workout</h1><p className="text-xs font-bold opacity-80 uppercase">HIIT Engine</p></div></div>
        <button onClick={() => setIsAiOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface/10 text-white border border-white/20 rounded-lg text-xs font-bold hover:bg-surface dark:bg-slate-800 dark:bg-surface/20 transition backdrop-blur-sm"><Sparkles size={14}/> Smart Fill</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative text-white">
        <div className="text-[200px] font-black leading-none tracking-tighter drop-shadow-lg">{time}</div>
        <div className="text-4xl font-bold opacity-80 uppercase tracking-widest mb-8">{status}</div>
        {status !== "Idle" && status !== "Finished" && <div className="absolute bottom-10 opacity-50 font-mono text-xl">ROUND {curRound} / {rounds}</div>}
      </div>

      <div className="h-32 bg-surface dark:bg-slate-800 dark:bg-surface rounded-t-[40px] flex items-center justify-center gap-6 shadow-2xl">
        {isActive ? <button onClick={()=>setIsActive(false)} className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-muted dark:text-muted/70 dark:text-muted/70 hover:bg-slate-300"><Pause size={28}/></button>
        : <button onClick={start} className="w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl dark:shadow-none dark:border dark:border-slate-600 hover:scale-105"><Play size={32} className="ml-1"/></button>}
        <button onClick={reset} className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70"><RotateCcw size={24}/></button>
      </div>

      {isAiOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 relative text-main dark:text-slate-100 dark:text-slate-200">
                <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold text-lg flex items-center gap-2"><Sparkles size={18} className="text-orange-600 dark:text-orange-400"/> Smart Fill</h3><button onClick={() => setIsAiOpen(false)} className="text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70"><X size={20}/></button></div>
                <textarea className="w-full h-32 border p-4 rounded-lg text-sm focus:ring-2 ring-orange-500 outline-none resize-none bg-background dark:bg-surface dark:bg-slate-950 focus:bg-surface dark:bg-slate-800 dark:bg-surface transition" placeholder="Type: 'Tabata' or '45s work 15s rest 10 rounds'" value={aiText} onChange={e => setAiText(e.target.value)} autoFocus />
                <button onClick={handleAi} disabled={!aiText} className="w-full py-2.5 bg-orange-600 text-white rounded-lg font-bold   disabled:opacity-50">Set Timer</button>
            </div>
        </div>
      )}
    </div>
  );
}
