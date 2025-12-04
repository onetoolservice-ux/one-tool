"use client";
import React, { useState, useEffect } from 'react';

export const LiveClock = () => {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      // Format: 14:30:45 (24h) or 02:30:45 PM
      setTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div className="w-20 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"/>;

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg">
      <div className="w-2 h-2 rounded-full bg-[#638c80] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 tracking-widest tabular-nums">
        {time}
      </span>
    </div>
  );
};
