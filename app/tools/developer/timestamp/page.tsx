"use client";
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function TimestampConverter() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [input, setInput] = useState(now.toString());
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
     const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
     return () => clearInterval(interval);
  }, []);

  useEffect(() => {
     const ts = parseInt(input);
     if (!isNaN(ts)) {
        setDateStr(new Date(ts * 1000).toUTCString());
     } else {
        setDateStr("Invalid Timestamp");
     }
  }, [input]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
       <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">Unix Timestamp</h1>
        <p className="text-muted">Current: <span className="font-mono text-indigo-600 font-bold">{now}</span></p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
         <div>
            <label className="text-xs font-bold text-muted uppercase mb-2 block">Unix Timestamp</label>
            <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18}/>
                <input value={input} onChange={e => setInput(e.target.value)} className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono" />
            </div>
         </div>

         <div className="text-center p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-2">Human Date (UTC)</div>
            <div className="text-xl font-mono font-bold text-main dark:text-white">{dateStr}</div>
         </div>
      </div>
    </div>
  );
}
