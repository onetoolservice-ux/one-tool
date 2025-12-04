"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Layers, RefreshCw, Wallet, 
  ArrowRight, Calendar, Search, Globe, MapPin
} from 'lucide-react';

const ZONES = [
  { label: 'Local Time', zone: undefined, icon: MapPin }, // undefined uses system time
  { label: 'UTC (Universal)', zone: 'UTC', icon: Globe },
  { label: 'New York', zone: 'America/New_York', icon: Globe },
  { label: 'London', zone: 'Europe/London', icon: Globe },
  { label: 'Tokyo', zone: 'Asia/Tokyo', icon: Globe },
];

export const BentoHero = () => {
  const [time, setTime] = useState<Date | null>(null);
  const [zoneIndex, setZoneIndex] = useState(0);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="h-48 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse"/>;

  const currentZone = ZONES[zoneIndex];
  
  // Format time based on selected zone
  const timeString = time.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    timeZone: currentZone.zone 
  });
  
  const seconds = time.toLocaleTimeString('en-US', { 
    second: '2-digit', 
    timeZone: currentZone.zone 
  });

  const dateString = time.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    timeZone: currentZone.zone 
  });

  const hours = parseInt(time.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false, timeZone: currentZone.zone }));
  const greeting = hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";
  const ZoneIcon = currentZone.icon;

  const cards = [
    { id: 'invoice', name: 'Invoice', icon: FileText, color: 'bg-indigo-600', href: '/tools/business/invoice-generator', desc: 'Create PDF' },
    { id: 'pdf', name: 'PDF Tools', icon: Layers, color: 'bg-rose-500', href: '/tools/documents/smart-pdf-merge', desc: 'Merge/Split' },
    { id: 'convert', name: 'Converter', icon: RefreshCw, color: 'bg-[#638c80]', href: '/tools/documents/universal-converter', desc: 'Any Format' },
    { id: 'finance', name: 'Budget', icon: Wallet, color: 'bg-amber-500', href: '/tools/finance/smart-budget', desc: 'Track $$' },
  ];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
       
       {/* LEFT: CLOCK & SEARCH */}
       <div className="lg:col-span-3 flex flex-col gap-3 h-full">
          
          {/* INTERACTIVE WORLD CLOCK */}
          <div 
            onClick={() => setZoneIndex((prev) => (prev + 1) % ZONES.length)}
            className="flex-1 bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden shadow-lg group cursor-pointer select-none hover:ring-2 hover:ring-indigo-500/50 transition-all"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] group-hover:bg-indigo-500/30 transition-all"></div>
             
             <div className="relative z-10">
                <div className="flex items-baseline justify-between">
                   <h2 className="text-sm font-medium text-indigo-200">{greeting}</h2>
                   <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">
                      <ZoneIcon size={10} className="text-[#638c80]"/> 
                      <span className="text-emerald-100">{currentZone.label}</span>
                   </div>
                </div>
                
                <div className="text-4xl font-black tracking-tighter tabular-nums my-1 flex items-baseline">
                   {timeString}
                   <span className="text-base text-slate-500 ml-1 font-medium opacity-60">{seconds}</span>
                </div>
                
                <div className="flex justify-between items-end">
                   <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={12}/> {dateString}
                   </div>
                   <span className="text-[9px] text-slate-600 font-mono">CLICK TO SWITCH</span>
                </div>
             </div>
          </div>

          {/* SEARCH BAR */}
          <div className="h-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center px-3 shadow-sm cursor-text hover:border-indigo-500 transition-colors group" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
             <Search size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors mr-2" />
             <span className="text-xs font-bold text-slate-400 flex-1">Find tool...</span>
             <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[9px] text-slate-500">⌘K</span>
          </div>
       </div>

       {/* RIGHT: HERO CARDS */}
       <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-3 h-full">
          {cards.map((card) => (
             <Link key={card.id} href={card.href} className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-md transition-all h-full">
                <div className="flex justify-between items-start mb-2">
                   <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <card.icon size={20} />
                   </div>
                   <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white">{card.name}</h3>
                   <p className="text-[10px] text-slate-500 font-medium mt-0.5">{card.desc}</p>
                </div>
             </Link>
          ))}
       </div>

    </div>
  );
};
