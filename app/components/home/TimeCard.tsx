'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function TimeCard() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div className="h-64 bg-gray-100 dark:bg-[#1C1F2E] rounded-3xl animate-pulse" />;

  const hours = time.getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';
  const timeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="bg-[#0F111A] text-white p-8 rounded-3xl relative overflow-hidden min-h-[220px] flex flex-col justify-center shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 p-40 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{greeting}</div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm">
             <Clock size={10} />
             <span>LOCAL</span>
          </div>
        </div>
        
        <h1 className="text-7xl font-bold tracking-tighter mb-2 font-mono">{timeStr}</h1>
        
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-lg font-medium">{dateStr}</span>
        </div>
      </div>
    </div>
  );
}
