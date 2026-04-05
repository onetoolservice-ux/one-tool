"use client";
import React from 'react';
import { Sparkles, Bell, Brain, Lock, Cpu } from 'lucide-react';

export const SmartChat = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 rounded-2xl bg-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-200 dark:shadow-violet-900/40">
        <Brain size={36} className="text-white" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-4">
        <Bell size={12} />
        Coming Soon
      </div>

      <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3">Smart Chat</h1>
      <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8 max-w-md">
        AI-powered conversations — built with the same privacy-first principles as every OneTool product.
        No account. No data collection. No surprises.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {[
          { icon: Lock, title: 'Private by Design', desc: 'No message leaves your device. Ever.' },
          { icon: Cpu, title: 'On-Device AI', desc: 'Runs on local models — works offline too.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-left">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mb-3">
              <Icon size={18} className="text-violet-600 dark:text-violet-400" />
            </div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">{title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};