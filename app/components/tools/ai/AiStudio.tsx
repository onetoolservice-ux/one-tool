"use client";
import React from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';

export const AiStudio = ({ toolId }: { toolId: string }) => (
  <div className="p-12 text-center max-w-2xl mx-auto mt-10 border rounded-3xl bg-slate-50 dark:bg-slate-900/50">
    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
       {toolId.includes('chat') ? <Sparkles size={40} className="text-amber-500"/> : <BrainCircuit size={40} className="text-purple-500"/>}
    </div>
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
      {toolId === 'smart-chat' ? 'Local AI Chat' : 'Sentiment Analysis'}
    </h2>
    <p className="text-slate-500 mb-8">AI models are initializing in your browser...</p>
    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all">Start Session</button>
  </div>
);