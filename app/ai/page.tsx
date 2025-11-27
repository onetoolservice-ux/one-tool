"use client";

import React, { useState, useMemo } from "react";
import { 
  Bot, Sparkles, AlignLeft, Clock, 
  Type, Hash, Smile, Frown, Minus 
} from "lucide-react";

export default function AITools() {
  const [text, setText] = useState("");

  // --- Local Intelligence Engine ---
  const stats = useMemo(() => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.length > 0);
    const readingTime = Math.ceil(words.length / 200); // avg 200 wpm

    // Basic Local Sentiment Analysis
    const positiveWords = ["good", "great", "excellent", "amazing", "love", "happy", "best", "fantastic", "success"];
    const negativeWords = ["bad", "terrible", "worst", "hate", "sad", "fail", "error", "poor", "wrong"];
    
    let score = 0;
    const lowerText = text.toLowerCase();
    positiveWords.forEach(w => { if(lowerText.includes(w)) score++ });
    negativeWords.forEach(w => { if(lowerText.includes(w)) score-- });

    let sentiment = { label: "Neutral", color: "text-slate-500", icon: <Minus size={20}/> };
    if (score > 0) sentiment = { label: "Positive", color: "text-emerald-600", icon: <Smile size={20}/> };
    if (score < 0) sentiment = { label: "Negative", color: "text-rose-600", icon: <Frown size={20}/> };

    return { words: words.length, chars, sentences: sentences.length, readingTime, sentiment };
  }, [text]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
          <Bot size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Local Intelligence</h1>
        <p className="text-lg text-slate-500 mt-3 max-w-2xl mx-auto">
          Analyze text instantly in your browser. No API keys, no server uploads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[500px] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Text</span>
              <button onClick={() => setText("")} className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors">
                Clear
              </button>
            </div>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your article, essay, or email here to analyze..."
              className="flex-1 w-full p-6 resize-none outline-none text-slate-700 leading-relaxed text-lg placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-6">
          
          {/* Sentiment Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={14} /> Tone Analysis
            </div>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-50 ${stats.sentiment.color}`}>
                {stats.sentiment.icon}
              </div>
              <div>
                <div className={`text-2xl font-bold ${stats.sentiment.color}`}>
                  {stats.sentiment.label}
                </div>
                <div className="text-xs text-slate-400">Detected Tone</div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Words" value={stats.words} icon={<AlignLeft size={16}/>} />
            <StatBox label="Characters" value={stats.chars} icon={<Type size={16}/>} />
            <StatBox label="Sentences" value={stats.sentences} icon={<Hash size={16}/>} />
            <StatBox label="Read Time" value={`${stats.readingTime} min`} icon={<Clock size={16}/>} />
          </div>

          {/* Privacy Badge */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <h4 className="text-indigo-900 font-semibold text-sm mb-1">100% Private</h4>
            <p className="text-indigo-700/80 text-xs leading-relaxed">
              This analysis runs locally on your device using JavaScript. Your text is never sent to the cloud.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="text-slate-400 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
    </div>
  )
}
