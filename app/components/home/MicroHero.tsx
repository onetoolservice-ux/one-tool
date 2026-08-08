import React from 'react';
import { Sparkles } from 'lucide-react';

export const MicroHero = () => {
  return (
    <section className="relative w-full py-12 px-4 border-b border-slate-100 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto text-center space-y-6">
        
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide uppercase bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-900 dark:text-indigo-300 mb-2">
          <Sparkles className="w-3 h-3 mr-1.5" /> 170+ Free Tools
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white">
          Everything you need,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">one place.</span>
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl mx-auto">
          Finance · Business · Developer · Health — all free. No login, no cloud.
        </p>
      </div>
    </section>
  );
};
