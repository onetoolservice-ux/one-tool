"use client";
import React, { useState } from 'react';
import { Brain, Smile, Frown, Meh, BarChart3 } from 'lucide-react';

export const SentimentAI = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);

  const analyze = () => {
    if(!text) return;
    // Simple heuristic for demo (Real app would use API)
    const pos = (text.match(/good|great|happy|awesome|excellent|love/gi) || []).length;
    const neg = (text.match(/bad|sad|hate|terrible|awful|poor/gi) || []).length;
    const score = pos - neg;
    
    setResult({
       sentiment: score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral",
       confidence: Math.min(99, 50 + Math.abs(score)*10),
       score
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-8">
       <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Brain className="text-purple-600"/> Sentiment AI</h1>
          <textarea 
             className="flex-1 p-6 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-2xl resize-none outline-none text-sm leading-relaxed transition-all"
             placeholder="Paste review, email, or feedback here to analyze emotional tone..."
             value={text}
             onChange={e=>setText(e.target.value)}
          />
          <button onClick={analyze} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">Analyze Text</button>
       </div>

       <div className="w-full lg:w-80">
          {result ? (
             <div className="h-full bg-white dark:bg-slate-900 border rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-in zoom-in">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${result.score > 0 ? 'bg-emerald-100 text-emerald-600' : result.score < 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                   {result.score > 0 ? <Smile size={48}/> : result.score < 0 ? <Frown size={48}/> : <Meh size={48}/>}
                </div>
                <h2 className="text-3xl font-black">{result.sentiment}</h2>
                <p className="text-slate-400 text-sm mt-1 uppercase font-bold">Detected Tone</p>
                
                <div className="mt-8 w-full">
                   <div className="flex justify-between text-xs font-bold mb-2"><span>Confidence</span><span>{result.confidence}%</span></div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600" style={{width: `${result.confidence}%`}}></div>
                   </div>
                </div>
             </div>
          ) : (
             <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                <BarChart3 size={48} className="mb-4 opacity-20"/>
                <p className="font-bold">No Data</p>
             </div>
          )}
       </div>
    </div>
  );
};