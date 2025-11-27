"use client";

import React, { useState, useMemo } from "react";
import { 
  Bot, Sparkles, AlignLeft, Clock, 
  Type, Hash, Smile, Frown, Minus, 
  ShieldCheck, Copy, Check, Zap 
} from "lucide-react";

export default function AIStudio() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  // --- Local Intelligence Engine ---
  const stats = useMemo(() => {
    if (!text.trim()) return null;

    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.length > 0).length;
    const readingTime = Math.ceil(words / 200); // avg 200 wpm

    // Local Sentiment Analysis (Keyword matching)
    const positiveWords = ["good", "great", "excellent", "amazing", "love", "happy", "best", "fantastic", "success", "easy", "fast", "secure"];
    const negativeWords = ["bad", "terrible", "worst", "hate", "sad", "fail", "error", "poor", "wrong", "slow", "hard", "broken"];
    
    let score = 0;
    const lowerText = text.toLowerCase();
    positiveWords.forEach(w => { if(lowerText.includes(w)) score++ });
    negativeWords.forEach(w => { if(lowerText.includes(w)) score-- });

    let sentiment = { label: "Neutral", color: "text-slate-500", bg: "bg-slate-100", icon: <Minus size={20}/> };
    if (score > 0) sentiment = { label: "Positive", color: "text-emerald-600", bg: "bg-emerald-50", icon: <Smile size={20}/> };
    if (score < 0) sentiment = { label: "Negative", color: "text-rose-600", bg: "bg-rose-50", icon: <Frown size={20}/> };

    return { words, chars, sentences, paragraphs, readingTime, sentiment };
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 shadow-sm">
          <Bot size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Local Intelligence</h1>
        <p className="text-lg text-slate-500 mt-3 max-w-2xl mx-auto">
          Analyze text structure and sentiment instantly. 
          <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded ml-1">100% Offline</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUT AREA (Left) */}
        <div className="lg:col-span-8 flex flex-col h-[600px]">
          <div className="bg-white rounded-t-2xl border border-slate-200 border-b-0 p-4 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
              <AlignLeft size={16} /> Input Text
            </div>
            <div className="flex gap-2">
              <button onClick={() => setText("")} className="text-xs font-medium text-slate-500 hover:text-rose-600 px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-colors">
                Clear
              </button>
              <button onClick={handleCopy} className="text-xs font-medium text-slate-500 hover:text-indigo-600 px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1">
                {copied ? <Check size={12}/> : <Copy size={12}/>} Copy
              </button>
            </div>
          </div>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, email, or essay here to analyze..."
            className="flex-1 w-full p-6 resize-none outline-none text-slate-700 text-lg leading-relaxed placeholder:text-slate-300 border border-slate-200 border-t-0 rounded-b-2xl focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-sm"
            spellCheck={false}
          />
        </div>

        {/* METRICS PANEL (Right) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Privacy Badge */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={80} />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/10 rounded-lg"><ShieldCheck size={20}/></div>
              <span className="font-semibold text-sm uppercase tracking-wide text-slate-300">Privacy Shield</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analysis runs locally in your browser using JavaScript. No data is sent to OpenAI or any server.
            </p>
          </div>

          {stats ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
              
              {/* Sentiment Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={14} /> Tone Analysis
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.sentiment.bg} ${stats.sentiment.color}`}>
                    {stats.sentiment.icon}
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${stats.sentiment.color}`}>
                      {stats.sentiment.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Detected Sentiment</div>
                  </div>
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Words" value={stats.words} icon={<AlignLeft size={16}/>} />
                <StatBox label="Characters" value={stats.chars} icon={<Type size={16}/>} />
                <StatBox label="Sentences" value={stats.sentences} icon={<Hash size={16}/>} />
                <StatBox label="Read Time" value={`~${stats.readingTime}m`} icon={<Clock size={16}/>} />
              </div>

            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-center p-6">
              <Zap size={32} className="mb-3 opacity-20" />
              <p className="text-sm">Start typing or paste text to see real-time intelligence.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
      <div className="text-slate-400 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
    </div>
  )
}
