"use client";
import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface PlaceholderProps {
  name: string;
  desc: string;
  icon: React.ReactNode;
  accentFrom: string;
  accentTo: string;
  features: string[];
}

export function TimeMgmtPlaceholder({ name, desc, icon, accentFrom, accentTo, features }: PlaceholderProps) {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center px-6 py-16 text-center select-none">
      {/* Glow ring */}
      <div
        className={`relative mb-8 flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${accentFrom} ${accentTo} shadow-lg`}
      >
        <div className="text-white w-10 h-10">{icon}</div>
        <span className="absolute -top-2 -right-2 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-500 items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </span>
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{name}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-8">{desc}</p>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-md">
        {features.map((f) => (
          <span
            key={f}
            className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20"
          >
            {f}
          </span>
        ))}
      </div>

      {/* Coming soon badge */}
      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-indigo-500/5">
        <Clock className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 tracking-wide">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
