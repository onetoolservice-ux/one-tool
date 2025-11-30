"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Calendar, Globe } from "lucide-react";

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-3xl w-full"></div>;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Greeting Logic
  const hrs = time.getHours();
  let greeting = "Good Evening";
  if (hrs < 12) greeting = "Good Morning";
  else if (hrs < 17) greeting = "Good Afternoon";

  return (
    <Link href="/tools/developer/timestamp" className="group block h-full">
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-indigo-500/30 h-full flex flex-col justify-center">
        
        {/* Cool Background Glows */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-500"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">
                <Globe size={14} className="animate-spin-slow" /> Local Time
             </div>
             <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter font-mono tabular-nums">
                {formatTime(time)}
             </h2>
             <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-2 flex items-center gap-2">
                <Calendar size={18} className="text-slate-400"/> {formatDate(time)}
             </p>
          </div>
          
          <div className="hidden xl:block text-right">
             <div className="inline-block px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {greeting}
                </span>
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
