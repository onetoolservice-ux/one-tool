"use client";
import React, { useState, useEffect } from 'react';

export const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Show a static fallback or server time during hydration to prevent LCP delay
  if (!mounted) return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">--:--</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </span>
    </div>
  );
};