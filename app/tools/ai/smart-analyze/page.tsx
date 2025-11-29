"use client";
import React, { useState, useMemo } from "react";
import { BrainCircuit, AlignLeft, Clock, Hash, Type } from "lucide-react";
import Toast from "../../../shared/Toast";

export default function SmartAnalyze() {
  const [text, setText] = useState("Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. Leading AI textbooks define the field as the study of 'intelligent agents': any system that perceives its environment and takes actions that maximize its chances of achieving its goals.");

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.length > 0).length;
    const readingTime = Math.ceil(words / 200); // 200 wpm
    const speakingTime = Math.ceil(words / 130); // 130 wpm
    
    // Simple sentiment (heuristic)
    const positive = (text.match(/\b(good|great|excellent|amazing|best|love|happy|success)\b/gi) || []).length;
    const negative = (text.match(/\b(bad|worse|terrible|hate|sad|fail|error|wrong)\b/gi) || []).length;
    const score = positive - negative;
    let sentiment = "Neutral";
    if (score > 0) sentiment = "Positive";
    if (score < 0) sentiment = "Negative";

    return { chars, words, sentences, paragraphs, readingTime, speakingTime, sentiment, score };
  }, [text]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-600 text-white  "><BrainCircuit size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Analyze</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">NLP Dashboard</p></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x overflow-hidden">
        
        {/* Editor */}
        <div className="col-span-2 p-6 flex flex-col">
            <textarea 
                value={text} 
                onChange={e=>setText(e.target.value)} 
                className="flex-1 w-full p-8 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 rounded-3xl outline-none focus:ring-2 focus:ring-cyan-200 resize-none text-lg leading-relaxed text-main dark:text-slate-300 shadow-lg shadow-slate-200/50 dark:shadow-none"
                placeholder="Paste text to analyze..."
            />
        </div>

        {/* Stats Panel */}
        <div className="col-span-1 bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-8 overflow-auto space-y-8">
            
            {/* Sentiment Card */}
            <div className={`p-6 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none flex items-center justify-between ${stats.sentiment === "Positive" ? "bg-emerald-100 border-emerald-200 text-emerald-800" : stats.sentiment === "Negative" ? "bg-rose-100 border-rose-200 text-rose-800" : "bg-surface dark:bg-slate-800 dark:bg-surface border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 text-main dark:text-slate-100 dark:text-slate-200"}`}>
                <div>
                    <div className="text-xs font-bold uppercase tracking-wide opacity-70">Sentiment</div>
                    <div className="text-2xl font-bold">{stats.sentiment}</div>
                </div>
                <div className="text-4xl">{stats.sentiment === "Positive" ? "😊" : stats.sentiment === "Negative" ? "😟" : "😐"}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <div className="text-cyan-600 dark:text-cyan-400 mb-2"><AlignLeft size={20}/></div>
                    <div className="text-2xl font-bold text-main dark:text-slate-100 dark:text-slate-200">{stats.words}</div>
                    <div className="text-xs font-bold text-muted/70 uppercase">Words</div>
                </div>
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <div className="text-cyan-600 dark:text-cyan-400 mb-2"><Type size={20}/></div>
                    <div className="text-2xl font-bold text-main dark:text-slate-100 dark:text-slate-200">{stats.chars}</div>
                    <div className="text-xs font-bold text-muted/70 uppercase">Characters</div>
                </div>
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <div className="text-cyan-600 dark:text-cyan-400 mb-2"><Hash size={20}/></div>
                    <div className="text-2xl font-bold text-main dark:text-slate-100 dark:text-slate-200">{stats.sentences}</div>
                    <div className="text-xs font-bold text-muted/70 uppercase">Sentences</div>
                </div>
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <div className="text-cyan-600 dark:text-cyan-400 mb-2"><AlignLeft size={20}/></div>
                    <div className="text-2xl font-bold text-main dark:text-slate-100 dark:text-slate-200">{stats.paragraphs}</div>
                    <div className="text-xs font-bold text-muted/70 uppercase">Paragraphs</div>
                </div>
            </div>

            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 dark:text-indigo-400 rounded-lg"><Clock size={18}/></div>
                    <div>
                        <div className="text-sm font-bold text-main dark:text-slate-100 dark:text-slate-200">Reading Time</div>
                        <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">~{stats.readingTime} min</div>
                    </div>
                </div>
                <div className="w-full h-[1px] bg-slate-100"></div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 dark:text-orange-400 rounded-lg"><Clock size={18}/></div>
                    <div>
                        <div className="text-sm font-bold text-main dark:text-slate-100 dark:text-slate-200">Speaking Time</div>
                        <div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">~{stats.speakingTime} min</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
