"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Layers, RefreshCw, Wallet, 
  ArrowRight, Calendar, Search, Clock
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
    { id: 'pdf', name: 'PDF Tools', icon: Layers, color: 'bg-amber-500', href: '/tools/documents/smart-pdf-merge', desc: 'Merge/Split' },
    { id: 'convert', name: 'Converter', icon: RefreshCw, color: 'bg-cyan-500', href: '/tools/documents/universal-converter', desc: 'Any Format' },
    { id: 'finance', name: 'Budget', icon: Wallet, color: 'bg-emerald-500', href: '/tools/finance/smart-budget', desc: 'Track $$' },
  ];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 h-[160px] lg:h-[148px] shrink-0">

       {/* CLOCK WIDGET (LCP ELEMENT) */}
       <div className="lg:col-span-3 flex flex-col gap-2 h-full">
          <div className="flex-1 bg-[#0B1120] text-white rounded-xl p-4 flex flex-col justify-center relative overflow-hidden border border-slate-800/80">
             <div className="relative z-10">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">{greeting}</p>
                <div className="text-4xl font-black tracking-tighter tabular-nums text-white" suppressHydrationWarning>
                   {timeString}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium" suppressHydrationWarning>
                   <Calendar size={11} className="text-slate-600"/> {dateString}
                </div>
             </div>
          </div>

          {/* SEARCH TRIGGER */}
          <div className="h-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center px-2.5 cursor-text hover:border-slate-300 dark:hover:border-slate-600 transition-colors group" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
             <Search size={12} className="text-slate-400 mr-2 flex-shrink-0" />
             <span className="text-[11px] text-slate-400 flex-1">Find tool...</span>
             <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[9px] text-slate-500">⌘K</span>
          </div>
       </div>

       {/* HERO CARDS (CLS SAFE) */}
       <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-3 h-full">
          {cards.map((card) => (
             <Link key={card.id} href={card.href} className="group bg-white dark:bg-[#151827] rounded-xl border border-slate-200 dark:border-white/[0.07] p-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.14] hover:shadow-sm transition-all h-full">
                <div className={`w-9 h-9 rounded-lg ${card.color} text-white flex items-center justify-center flex-shrink-0`}>
                   <card.icon size={16} />
                </div>
                <div>
                   <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{card.name}</h3>
                   <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{card.desc}</p>
                </div>
             </Link>
          ))}
       </div>
    </div>
  );
};