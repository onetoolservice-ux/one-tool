"use client";
import React from "react";
import { Shield, Zap, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto p-8 md:p-16 space-y-16">
       <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white">The One Tool Mission</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">We are building the world's most private, fast, and capable digital utility belt.</p>
       </div>

       <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
             <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 mb-4"><Shield size={24}/></div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Privacy First</h3>
             <p className="text-slate-500 leading-relaxed">We believe your financial data and developer secrets should never leave your device. That's why One Tool runs 100% offline.</p>
          </div>
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
             <div className="w-12 h-12 bg-[#638c80]/20 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-[#4a6b61] mb-4"><Zap size={24}/></div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Blazing Fast</h3>
             <p className="text-slate-500 leading-relaxed">No loading spinners. No server round-trips. Our tools calculate instantly using the power of your own device.</p>
          </div>
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4"><Globe size={24}/></div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Accessible</h3>
             <p className="text-slate-500 leading-relaxed">Built with high-contrast modes, screen reader support, and responsive design for everyone, everywhere.</p>
          </div>
       </div>
    </div>
  );
}
