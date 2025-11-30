#!/bin/bash

echo "í´– Activating Wave 6: AI & Advanced Finance..."

# =========================================================
# 1. FINANCE: SMART RETIREMENT (FIRE CALC)
# =========================================================
echo "í²° Activating FIRE Calculator..."
cat > app/tools/finance/retirement/page.tsx << 'TS_END'
"use client";
import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, PiggyBank, AlertCircle } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function FireCalc() {
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(55);
  const [current, setCurrent] = useState(1000000);
  const [monthly, setMonthly] = useState(50000);
  const [expense, setExpense] = useState(40000);
  const [roi, setRoi] = useState(10);

  const data = useMemo(() => {
    const result = [];
    let balance = current;
    const years = 90 - age; // Plan until 90
    
    for (let i = 0; i <= years; i++) {
      const year = age + i;
      const isRetired = year >= retireAge;
      
      if (!isRetired) {
         // Accumulation Phase
         balance = (balance + (monthly * 12)) * (1 + roi/100);
      } else {
         // Withdrawal Phase (Inflation adjusted expense usually, simplified here)
         balance = (balance * (1 + (roi-3)/100)) - (expense * 12); // 3% inflation gap
      }
      
      if (balance < 0) balance = 0;
      
      result.push({ year, balance: Math.round(balance) });
    }
    return result;
  }, [age, retireAge, current, monthly, expense, roi]);

  const freedomNum = expense * 12 * 25; // 4% Rule
  const canRetire = data.find(d => d.year === retireAge)?.balance || 0;
  const status = canRetire > freedomNum ? "Safe" : "At Risk";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">FIRE Projection</h1>
        <p className="text-slate-500">Financial Independence, Retire Early.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Inputs */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6 h-fit">
            <div><label className="text-xs font-bold uppercase text-slate-500">Current Age: {age}</label><input type="range" min="18" max="70" value={age} onChange={e=>setAge(Number(e.target.value))} className="w-full accent-indigo-600"/></div>
            <div><label className="text-xs font-bold uppercase text-slate-500">Retire At: {retireAge}</label><input type="range" min="40" max="80" value={retireAge} onChange={e=>setRetireAge(Number(e.target.value))} className="w-full accent-emerald-600"/></div>
            
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-bold text-slate-500">Current Savings</label><input type="number" value={current} onChange={e=>setCurrent(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
               <div><label className="text-xs font-bold text-slate-500">Return %</label><input type="number" value={roi} onChange={e=>setRoi(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
            </div>
            <div><label className="text-xs font-bold text-slate-500">Monthly Invest</label><input type="number" value={monthly} onChange={e=>setMonthly(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
            <div><label className="text-xs font-bold text-slate-500">Monthly Expense</label><input type="number" value={expense} onChange={e=>setExpense(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
         </div>

         {/* Chart & Stats */}
         <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
               <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xs uppercase font-bold text-indigo-500">Freedom Number</div>
                  <div className="text-xl font-black text-indigo-900 dark:text-white">â‚¹{(freedomNum/10000000).toFixed(2)} Cr</div>
               </div>
               <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                  <div className="text-xs uppercase font-bold text-emerald-500">Retirement Corpus</div>
                  <div className="text-xl font-black text-emerald-900 dark:text-white">â‚¹{(canRetire/10000000).toFixed(2)} Cr</div>
               </div>
               <div className={`p-4 rounded-xl border ${status === 'Safe' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  <div className="text-xs uppercase font-bold">Plan Status</div>
                  <div className="text-xl font-black">{status}</div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                     <defs>
                        <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                     <XAxis dataKey="year" />
                     <YAxis tickFormatter={(v) => `â‚¹${v/100000}L`} />
                     <Tooltip contentStyle={{borderRadius: '12px'}} formatter={(v: any) => `â‚¹${v.toLocaleString()}`}/>
                     <Area type="monotone" dataKey="balance" stroke="#4F46E5" fillOpacity={1} fill="url(#colorBal)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 2. AI: SMART VOICE (Text-to-Speech)
# =========================================================
echo "í¾™ï¸ Activating Smart Voice..."
mkdir -p app/tools/ai/smart-voice
cat > app/tools/ai/smart-voice/page.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import { Mic, Play, Square, Volume2 } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function SmartVoice() {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  useEffect(() => {
    const loadVoices = () => {
       setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speak = () => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
       utterance.voice = voices.find(v => v.name === selectedVoice) || null;
    }
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Smart Voice</h1>
        <p className="text-slate-500">Offline Text-to-Speech Engine.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
         <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg" 
            placeholder="Type something to speak..."
         />
         
         <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <select 
               value={selectedVoice} 
               onChange={e => setSelectedVoice(e.target.value)} 
               className="w-full md:w-1/2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
               <option value="">Default Voice</option>
               {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>

            <div className="flex gap-3 w-full md:w-auto">
               {isSpeaking ? (
                 <Button onClick={stop} variant="danger" className="flex-1 md:w-32"><Square size={18} className="mr-2"/> Stop</Button>
               ) : (
                 <Button onClick={speak} className="flex-1 md:w-32"><Volume2 size={18} className="mr-2"/> Speak</Button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. AI: SMART ANALYZE (NLP)
# =========================================================
echo "í·  Activating Smart Analyze..."
mkdir -p app/tools/ai/smart-analyze
cat > app/tools/ai/smart-analyze/page.tsx << 'TS_END'
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
TS_END

# =========================================================
# 4. AI: SMART CHAT (Local Mock UI)
# =========================================================
echo "í²¬ Activating Smart Chat UI..."
mkdir -p app/ai
cat > app/ai/page.tsx << 'TS_END'
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function SmartChat() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I am OneTool AI. I run 100% locally in your browser. How can I help you navigate your tools today?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate Response
    setTimeout(() => {
       let reply = "I'm a demo bot running locally. I can't browse the web, but I can help you calculate a loan or format JSON!";
       if (input.toLowerCase().includes("finance")) reply = "Check out the Smart Budget tool in the Finance section.";
       if (input.toLowerCase().includes("dev")) reply = "We have great developer tools like Regex Tester and SQL Formatter.";
       
       setMessages(prev => [...prev, { role: "ai", content: reply }]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
           <div className="p-2 bg-indigo-600 rounded-lg text-white"><Sparkles size={18}/></div>
           <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">OneTool Assistant</h2>
              <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <span className="text-xs text-slate-500">Online (Local)</span>
              </div>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
           {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                    {m.role === 'ai' ? <Bot size={18}/> : <User size={18}/>}
                 </div>
                 <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] ${m.role === 'ai' ? 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300' : 'bg-indigo-600 text-white'}`}>
                    {m.content}
                 </div>
              </div>
           ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
           <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Type a message..."
              />
              <button type="submit" disabled={!input} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                 <Send size={18} />
              </button>
           </form>
        </div>

      </div>
    </div>
  );
}
TS_END

echo "âœ… Wave 6 Complete. All Systems Online."
