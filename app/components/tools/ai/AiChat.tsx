"use client";
import React from 'react';
import { Sparkles, Bell, Zap, MessageSquare, Code2, FileText } from 'lucide-react';

export const AIChat = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
        <Sparkles size={36} className="text-white" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-4">
        <Bell size={12} />
        Coming Soon
      </div>

      <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3">OneTool AI Chat</h1>
      <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8 max-w-md">
        A privacy-first AI assistant that runs entirely in your browser — no account, no cloud, your conversations never leave your device.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10">
        {[
          { icon: MessageSquare, title: 'Financial Q&A', desc: 'Ask questions about your uploaded bank statements' },
          { icon: Code2, title: 'Code Helper', desc: 'Debug code, write regex, explain errors' },
          { icon: FileText, title: 'Document AI', desc: 'Summarise, rewrite, and analyse any text' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-left">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <Icon size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">{title}</p>
            <p className="text-xs text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl px-6 py-5 flex items-start gap-4 text-left w-full">
        <Zap size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">What we are building</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
            An on-device AI assistant powered by local models — no API key needed, no data sent to any server.
            Your financial data, documents, and conversations stay 100% private.
          </p>
        </div>
      </div>
    </div>
  );
};