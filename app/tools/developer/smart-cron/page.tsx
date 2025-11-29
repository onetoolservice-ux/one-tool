"use client";
import React, { useState } from "react";
import { Clock, CheckCircle, Copy, Sparkles, X, Eraser } from "lucide-react";
import Toast, { showToast } from "../../../shared/Toast";

export default function SmartCron() {
  const [cron, setCron] = useState("* * * * *");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");

  const handleAi = () => {
    const t = aiText.toLowerCase();
    let res = "* * * * *";
    if (t.includes("minute")) res = "* * * * *";
    else if (t.includes("hour")) res = "0 * * * *";
    else if (t.includes("day") || t.includes("daily") || t.includes("night")) res = "0 0 * * *";
    else if (t.includes("week")) res = "0 0 * * 0";
    else if (t.includes("month")) res = "0 0 1 * *";
    else if (t.includes("year")) res = "0 0 1 1 *";
    else if (t.includes("monday")) res = "0 9 * * 1";
    
    setCron(res);
    setIsAiOpen(false);
    showToast("✨ Schedule Generated!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-surface dark:bg-slate-950/50 font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500 text-white  "><Clock size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-50 dark:text-slate-100">Smart Cron</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Scheduler</p></div>
        </div>
        <button onClick={() => setIsAiOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface dark:bg-slate-800 dark:bg-surface text-orange-600 dark:text-orange-400 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-50 transition shadow-lg shadow-slate-200/50 dark:shadow-none"><Sparkles size={14}/> Smart Fill</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-10 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border w-full max-w-2xl text-center space-y-6">
            <input value={cron} onChange={e=>setCron(e.target.value)} className="w-full text-center text-4xl font-mono font-bold text-main dark:text-slate-100 dark:text-slate-200 outline-none border-b-2 border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 focus:border-orange-500 transition py-4" />
            <div className="flex justify-center gap-4 text-xs font-bold text-muted/70 uppercase"><span>Min</span><span>Hour</span><span>Day</span><span>Month</span><span>Week</span></div>
            <button onClick={()=>{navigator.clipboard.writeText(cron); showToast("Copied")}} className="mx-auto flex items-center gap-2 px-6 py-2 bg-surface text-white rounded-full font-bold text-sm"><Copy size={14}/> Copy Expression</button>
        </div>
      </div>

      {isAiOpen && (
        <div className="fixed inset-0 bg-surface/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-orange-200 animate-in zoom-in-95 relative">
                <div className="flex justify-between items-center border-b pb-3"><h3 className="font-bold text-lg text-main dark:text-slate-100 dark:text-slate-200 flex items-center gap-2"><Sparkles size={18} className="text-orange-600 dark:text-orange-400"/> Smart Fill</h3><button onClick={() => setIsAiOpen(false)} className="text-muted/70 hover:text-muted dark:text-muted/70 dark:text-muted/70"><X size={20}/></button></div>
                <textarea className="w-full h-32 border p-4 rounded-lg text-sm focus:ring-2 ring-orange-500 outline-none resize-none bg-background dark:bg-surface dark:bg-slate-950 focus:bg-surface dark:bg-slate-800 dark:bg-surface transition" placeholder="Type: 'Every Monday at 9am' or 'Daily at midnight'" value={aiText} onChange={e => setAiText(e.target.value)} autoFocus />
                <button onClick={handleAi} disabled={!aiText} className="w-full py-2.5 bg-orange-600 text-white rounded-lg font-bold   disabled:opacity-50">Generate Cron</button>
            </div>
        </div>
      )}
    </div>
  );
}
