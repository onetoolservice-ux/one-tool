"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Layers, RefreshCw, Wallet, 
  ArrowRight, Calendar, Search, Globe, MapPin, Clock
} from 'lucide-react';

export const BentoHero = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // FORMATTING
  const timeString = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const hours = date.getHours();
  const greeting = hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";

  const cards = [
    { id: 'invoice', name: 'Invoice', icon: FileText, color: 'bg-indigo-600', href: '/tools/business/invoice-generator', desc: 'Create PDF' },
    { id: 'pdf', name: 'PDF Tools', icon: Layers, color: 'bg-rose-500', href: '/tools/documents/smart-pdf-merge', desc: 'Merge/Split' },
    { id: 'convert', name: 'Converter', icon: RefreshCw, color: 'bg-teal-600', href: '/tools/documents/universal-converter', desc: 'Any Format' },
    { id: 'finance', name: 'Budget', icon: Wallet, color: 'bg-amber-500', href: '/tools/finance/smart-budget', desc: 'Track $$' },
  ];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 h-[200px] lg:h-[180px] shrink-0">
       
       {/* CLOCK WIDGET (LCP ELEMENT) */}
       <div className="lg:col-span-3 flex flex-col gap-3 h-full">
          <div className="flex-1 bg-[#0B1120] text-white rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden shadow-lg border border-slate-800">
             <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[40px]"></div>
             <div className="relative z-10">
                <div className="flex items-baseline justify-between mb-1">
                   <h2 className="text-xs font-bold text-teal-400 tracking-wider uppercase">{greeting}</h2>
                   <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full text-slate-400">
                      <Clock size={10}/> <span>Local</span>
                   </div>
                </div>
                
                {/* HYDRATION SAFE TIME DISPLAY */}
                <div className="text-5xl font-black tracking-tighter tabular-nums my-1 text-white" suppressHydrationWarning>
                   {timeString}
                </div>
                
                <div className="flex justify-between items-end mt-1">
                   <div className="text-xs text-slate-400 flex items-center gap-1 font-medium" suppressHydrationWarning>
                      <Calendar size={12} className="text-slate-500"/> {dateString}
                   </div>
                </div>
             </div>
          </div>

          {/* SEARCH TRIGGER */}
          <div className="h-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center px-3 shadow-sm cursor-text hover:border-teal-500 transition-colors group" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
             <Search size={14} className="text-slate-400 group-hover:text-teal-500 transition-colors mr-2" />
             <span className="text-xs font-bold text-slate-400 flex-1">Find tool...</span>
             <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[9px] text-slate-500 font-bold">⌘K</span>
          </div>
       </div>

       {/* HERO CARDS (CLS SAFE) */}
       <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-3 h-full">
          {cards.map((card) => (
             <Link key={card.id} href={card.href} className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between hover:border-teal-500/50 hover:shadow-md transition-all h-full">
                <div className="flex justify-between items-start mb-2">
                   <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <card.icon size={20} />
                   </div>
                   <ArrowRight size={14} className="text-slate-300 group-hover:text-teal-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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