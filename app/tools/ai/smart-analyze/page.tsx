"use client";
import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Clock, AlignLeft } from "lucide-react";

export default function SmartAnalyze() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
     const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
     const chars = text.length;
     const sentences = text.split(/[.!?]+/).filter(s => s.length > 0).length;
     const time = Math.ceil(words / 200); // 200 wpm
     
     // Mock Sentiment (Simple heuristic)
     const positive = (text.match(/good|great|best|awesome|happy|love/gi) || []).length;
     const negative = (text.match(/bad|worst|sad|hate|terrible|error/gi) || []).length;
     const score = positive - negative;
     const sentiment = score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral";

     return { words, chars, sentences, time, sentiment, positive, negative };
  }, [text]);

  const chartData = [
     { name: 'Positive', val: stats.positive },
     { name: 'Negative', val: stats.negative },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 h-[calc(100vh-100px)] flex flex-col space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Smart NLP</h1>
        <p className="text-slate-500">Instant text analysis & sentiment check.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 flex-1">
         <div className="md:col-span-2 flex flex-col">
            <textarea 
               value={text} 
               onChange={e => setText(e.target.value)} 
               className="flex-1 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 text-lg leading-relaxed" 
               placeholder="Paste text here to analyze..."
               autoFocus
            />
         </div>

         <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-indigo-600 mb-1 flex justify-center"><AlignLeft/></div>
                  <div className="text-2xl font-black">{stats.words}</div>
                  <div className="text-xs uppercase text-slate-400 font-bold">Words</div>
               </div>
               <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-emerald-600 mb-1 flex justify-center"><Clock/></div>
                  <div className="text-2xl font-black">{stats.time}m</div>
                  <div className="text-xs uppercase text-slate-400 font-bold">Read Time</div>
               </div>
            </div>

            {/* Sentiment Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
               <h3 className="text-xs font-bold uppercase text-slate-500 mb-4">Sentiment Analysis</h3>
               <div className="text-center mb-6">
                  <div className={`text-3xl font-black ${stats.sentiment === 'Positive' ? 'text-emerald-500' : stats.sentiment === 'Negative' ? 'text-rose-500' : 'text-slate-400'}`}>
                     {stats.sentiment}
                  </div>
               </div>
               <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData}>
                        <XAxis dataKey="name" hide />
                        <Tooltip />
                        <Bar dataKey="val" fill="#4F46E5" radius={[4,4,0,0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
