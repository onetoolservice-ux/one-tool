import React from 'react';
import { Sparkles } from 'lucide-react';

export const MicroHero = () => {
  return (
    <section className="relative w-full py-12 px-4 border-b border-slate-100 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto text-center space-y-6">
        
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide uppercase bg-teal-50 border-teal-100 text-teal-700 dark:bg-teal-900/20 dark:border-teal-900 dark:text-teal-300 mb-2">
          <Sparkles className="w-3 h-3 mr-1.5" /> v2.0 Enterprise
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Operating System</span> <br className="hidden md:block" />
          for Daily Work.
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl mx-auto">
          Secure. Client-Side. Free. No login required.
        </p>
      </div>
    </section>
  );
};
